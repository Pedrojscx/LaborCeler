# Research: Tela Inicial, Cadastro e Login

**Feature**: `002-tela-inicial-cadastro-login` | **Data**: 2026-10-01 | **Plano**: [plan.md](plan.md)

Não havia NEEDS CLARIFICATION no Technical Context: a stack veio do dossiê (seção 5) e das notas
do mantenedor no `/speckit-plan`. Este documento registra as decisões de detalhe, as versões
conferidas nas fontes em 01/10/2026 e as armadilhas encontradas. As decisões da feature 001
(R1 a R16 de `specs/001-base-executavel/research.md`) continuam valendo.

## R1. Dependências novas e versões

- **Decision**: `bcrypt` 6.0.0, `jsonwebtoken` 9.0.3, `cookie-parser` 1.4.7, `helmet` 8.3.0 e
  `express-rate-limit` 8.7.0, versões atuais no registro npm em 01/10/2026, com `^` no
  `package.json` e versões fixadas no `package-lock.json`.
- **Rationale**: é a stack da seção 5 do dossiê, confirmada nas notas do mantenedor.
  - `bcrypt` 6.0.0 é módulo nativo, mas desde a 6.0.0 traz binários pré-compilados (N-API, via
    `prebuildify`) em `prebuilds/linux-x64` e `prebuilds/linux-arm64` para glibc (conferido no
    pacote). Na imagem `node:24-bookworm-slim` (Debian, glibc) não há compilação nem
    dependência de `python`/`make`, inclusive em Mac com chip ARM (imagem `linux/arm64`).
  - `express-rate-limit` 8.7.0 declara `express >= 4.11` e é testado com Express 5.2.1.
  - `helmet` 8 exige Node ≥ 18; `cookie-parser` e `jsonwebtoken` não têm restrição relevante.
- **Alternatives considered**: `bcryptjs` 3 (JS puro, sem nativo; descartado porque o dossiê
  pede `bcrypt` e os binários pré-compilados eliminam o problema de compilação que motivou a
  escolha da imagem Debian na 001); sessão em tabela própria (exigiria mudar o esquema).

## R2. Sessão: JWT em cookie

- **Decision**: após cadastro ou login, o servidor emite um JWT HS256 com `sub` (id do
  candidato), `cad` (data de cadastro em segundos), `iat` e `exp` = 8 h, gravado no cookie
  `sessao` com `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800` e `Secure` quando
  `PUBLIC_BASE_URL` começa com `https://`. A verificação usa `algorithms: ['HS256']`
  explícito. A cada requisição autenticada, o servidor confere o token, busca o candidato só
  por `id` e compara em JS `Math.floor(data_cadastro / 1000) === cad`; se o candidato não
  existir ou a data não bater, a sessão é tratada como inválida e o cookie é apagado. A
  comparação fica em JS, nos dois lados com o mesmo `Date` devolvido pelo `pg`, porque
  `data_cadastro` é `timestamp` com microssegundos e uma igualdade no SQL contra segundos
  recusaria tokens válidos (achado U1 do analyze). Sair (`POST /api/auth/logout`) apaga o cookie com os mesmos atributos usados para
  criá-lo.
- **Rationale**: atende FR-018 a FR-020 (identidade decidida pelo servidor, 8 horas) sem tabela
  nova. O `cad` amarra o token ao cadastro: se o banco for recriado com o mesmo segredo (por
  exemplo, com `JWT_SECRET` fixo no ambiente, R4), um token antigo com `sub = 1` não vira a
  sessão do novo candidato de id 1. `Secure` só em HTTPS porque a execução local é HTTP (o
  cookie seria descartado); a decisão vem da configuração, não do cabeçalho
  `X-Forwarded-Proto`, porque o app não confia em proxy (`trust proxy` desligado).
- **Alternatives considered**: sessão no servidor com tabela (muda o esquema oficial);
  token em `localStorage` (exposto a XSS); refresh token (complexidade sem requisito).

## R3. CSRF: `SameSite=Lax` sozinho não basta

- **Decision**: além de `SameSite=Lax`, um middleware em todas as rotas `/api` que mudam estado
  (`POST`, `PUT`, `PATCH`, `DELETE`), inclusive login e cadastro:
  1. se a requisição tem cabeçalho `Origin`, o host dele (nome e porta) precisa ser igual ao
     cabeçalho `Host` da própria requisição: `new URL(origin).host === req.get('host')`;
     senão, `403`. Um `Origin` que não é URL válida (por exemplo, `null`) também dá `403`. Não
     se compara o protocolo (para funcionar atrás de um proxy HTTPS no futuro, com `trust
     proxy` desligado) nem `PUBLIC_BASE_URL`, que é fixo e não acompanha o acesso por outro
     endereço (achado S2 do analyze);
  2. sem `Origin`, se houver `Sec-Fetch-Site` com valor diferente de `same-origin` ou `none`,
     `403`;
  3. sem nenhum dos dois (cliente que não é navegador, como `curl` e os testes), segue.
  Essas rotas também só aceitam corpo `application/json` (`415` caso contrário). Erros do
  leitor de JSON são respeitados pelo tratador de erros: JSON malformado dá `400` "Envie os
  dados em JSON." e corpo acima de 10 kB dá `413` "Dados grandes demais." (achado U2).
- **Rationale**: `SameSite=Lax` impede o envio do cookie em `POST` vindo de **outro site**, mas
  "site" ignora a porta: uma página maliciosa em `http://localhost:8080` é *same-site* com
  `http://localhost:3000` e o cookie `Lax` seria enviado. A checagem de `Origin` fecha esse
  caso e também o "login CSRF" (forçar a vítima a entrar na conta do atacante). Exigir JSON
  reforça: formulário HTML de outra origem não envia `application/json`, e um `fetch`
  cross-origin com JSON dispara preflight, que o app não autoriza (sem CORS). Com isso não é
  preciso token anti-CSRF. Comparar com o `Host` da própria requisição funciona com qualquer
  `PORT`, em `localhost` e pelo IP da máquina na rede local (o celular na apresentação abre
  `http://<IP>:3000`, e o navegador manda `Origin` e `Host` com esse mesmo endereço), sem
  configuração extra. Um `PUBLIC_BASE_URL` fixo recusaria justamente esse acesso pelo IP.
  **Risco residual aceito**: num ataque de *DNS rebinding* (um domínio do atacante que passa a
  apontar para a máquina), `Origin` e `Host` coincidem e a checagem passa, mas o navegador não
  envia o cookie de `localhost` para outro nome de host; o atacante só consegue o que um
  visitante sem sessão já consegue, sob os limites de R6.
- **Alternatives considered**: token anti-CSRF (*double submit*): mais código no front e no
  back sem ganho real dado o item acima; `SameSite=Strict` (quebraria a chegada ao portal
  por links externos já logado e não resolve o caso de outra porta); comparar com
  `PUBLIC_BASE_URL` (quebra o acesso pelo IP da rede local, decisão do mantenedor).

## R4. Segredo da sessão sem valor padrão (pendência P1 da 001)

- **Decision**: o segredo é resolvido na subida do app, nesta ordem:
  1. `JWT_SECRET` do ambiente, se definida e não vazia; se tiver menos de 32 caracteres, o app
     **se recusa a subir** com mensagem clara;
  2. senão, o arquivo `segredo-sessao` na pasta do segredo, se existir; a pasta é
     `/app/segredo` no container e pode ser trocada pela variável `PASTA_SEGREDO` (uso de
     desenvolvimento e de testes fora do container; achado U3);
  3. senão, gera 64 bytes aleatórios (`crypto.randomBytes`, codificados em base64url), grava o
     arquivo com permissão `0600` e usa.
  A pasta `/app/segredo` é um **volume nomeado dedicado** (`segredo_sessao`) do serviço `app`.
  O `Dockerfile` cria a pasta com dono `node` antes do `USER node`, para que o volume novo nasça
  com esse dono e seja gravável. O Compose repassa `JWT_SECRET: ${JWT_SECRET:-}` (vazio quando
  não definida). Nenhum valor padrão é versionado; o segredo nunca é registrado em log.
  O `server.js` resolve o segredo antes do `listen` (falha cedo); dentro de `criarApp()`, sem
  segredo injetado, ele só é resolvido no primeiro uso de uma sessão, para que testes que não
  usam sessão (como os da 001) não dependam da pasta do container.
- **Rationale**: concilia FR-029 com o Princípio V: `docker compose up` continua sem passo
  manual e sem `.env`, e nenhum segredo conhecido fica no repositório. O volume próprio
  separa o segredo dos dados do banco e do código (o `pull_policy: build` da 001 recria a
  imagem a cada subida, então o segredo não pode morar na imagem). Comportamento resultante:
  `docker compose down` mantém o volume e as sessões continuam válidas até expirar;
  `docker compose down -v` apaga os dois volumes e invalida todas as sessões, junto com o
  banco. 32 caracteres é o mínimo coerente com HS256 (chave de pelo menos 256 bits, RFC 7518,
  seção 3.2).
- **Alternatives considered**: gerar um segredo novo a cada subida (derrubaria as sessões em
  todo `up`, inclusive o do `pull_policy: build`); guardar no banco (mistura segredo com dados
  e exige tabela nova); exigir `.env` (passo manual, viola o Princípio V).

## R5. Senha: limites em caracteres e em bytes

- **Decision**: a senha precisa ter de 8 a 64 caracteres (contados por ponto de código, não por
  unidade UTF-16) **e** no máximo 72 bytes em UTF-8; precisa ser igual à confirmação. Hash com
  `bcrypt`, custo 12. No login de CPF inexistente, o servidor compara a senha com um hash
  fictício gerado na subida, para que o tempo de resposta não revele se o CPF existe.
- **Rationale**: o README do `bcrypt` 6.0.0 avisa que só os primeiros 72 **bytes** são usados,
  não 72 caracteres: uma senha com acentos ou emojis pode ter menos de 64 caracteres e passar
  de 72 bytes, e o excedente seria ignorado em silêncio. Recusar com mensagem explicativa evita
  a falsa sensação de senha longa. Custo 12 fica na faixa recomendada e custa poucas centenas de
  milissegundos por cadastro ou login, longe dos limites de SC-002 e SC-003. O hash fictício
  impede que um login rápido "denuncie" CPF não cadastrado (FR-016).
- **Alternatives considered**: truncar em silêncio (o problema que se quer evitar); pré-hash com
  SHA-256 antes do bcrypt (resolve o limite, mas foge do padrão das aulas e complica a
  explicação); custo 10 (mais rápido, menos margem).

## R6. Limite de tentativas: por CPF e por endereço de rede

- **Decision**:
  - **Por CPF (FR-017)**: contador em memória no próprio app (`Map` de CPF normalizado para os
    instantes das falhas). 5 falhas em 15 minutos bloqueiam aquele CPF por 15 minutos a partir
    da 5ª falha; durante o bloqueio a senha nem é conferida e a resposta é `429` com a mesma
    mensagem para CPF cadastrado ou não. Login bem-sucedido zera o contador. Uma limpeza
    periódica (a cada 5 minutos, com `unref`) remove entradas vencidas, e o mapa tem teto de
    50 000 CPFs (descarta os mais antigos), para não crescer sem limite.
  - **Por endereço de rede (FR-017a)**: `express-rate-limit` com 60 requisições
    **malsucedidas** por minuto por IP (`skipSuccessfulRequests: true`: respostas com status
    abaixo de 400 não contam), separado para login e para cadastro, resposta `429` com
    mensagem própria. `trust proxy` continua desligado: o IP vem da conexão, não de
    `X-Forwarded-For`.
  - Só CPFs com formato e dígitos verificadores válidos entram no contador; CPF inválido é
    recusado antes ("CPF inválido"), o que não revela nada, porque um CPF inválido nunca pode
    estar cadastrado.
- **Rationale**: o bloqueio por CPF protege cada conta contra força bruta sem punir quem divide
  a rede, que é o cenário da apresentação. O contador em memória é aceito no MVP pelas notas
  do mantenedor: some ao reiniciar o app, o que só alivia bloqueios em curso. **Armadilha
  conhecida**: no Docker Desktop (Mac e Windows) e em conexões de `localhost` via proxy do
  Docker, todas as conexões podem chegar ao container com o mesmo IP (o do gateway); nesse
  caso o limite "por endereço" vira, na prática, um limite global da sala. Por isso ele é
  folgado e só conta falhas (60 por minuto, decisão do mantenedor após o achado P1 do
  analyze): uma sala inteira entrando, mesmo com alguns erros de digitação, não chega perto
  dele; a proteção real é a do CPF. A validação do quickstart mede isso (SC-009).
- **Alternatives considered**: limite só por IP (o padrão do dossiê; bloquearia a sala
  inteira); contador por CPF no banco (exigiria tabela nova); bloqueio permanente até
  intervenção (sem recuperação de senha no MVP, travaria contas).

## R7. Cabeçalhos de segurança com `helmet`

- **Decision**: `helmet` com CSP ajustada: `default-src 'self'`, `script-src 'self'`,
  `style-src 'self'`, `font-src 'self'`, `img-src 'self' data:`, `form-action 'self'`,
  `frame-ancestors 'self'`, `object-src 'none'`, `base-uri 'self'`. A diretiva
  `upgrade-insecure-requests` e o `Strict-Transport-Security` só são enviados quando
  `PUBLIC_BASE_URL` é HTTPS. Nenhuma página usa `<script>` inline, atributo de evento
  (`onclick`, `onsubmit`, `onload` etc.), URL `javascript:`, `style="..."` ou recurso externo:
  todo comportamento vem de arquivos `.js` em `app/public/js`, ligados com `addEventListener`.
  A CSP `script-src 'self'` sem `'unsafe-inline'` bloquearia qualquer um desses no navegador,
  então a regra também é conferida em teste (busca nos `.html` de `app/public`).
- **Rationale**: o README do `helmet` 8 mostra que o padrão inclui `upgrade-insecure-requests`
  e avisa que, em desenvolvimento sem HTTPS, isso causa problemas (o Safari, por exemplo,
  passa `http://localhost` para `https://localhost`); acessar o portal pelo IP da rede local
  na apresentação também quebraria. O padrão também libera estilos de qualquer `https:` e
  `'unsafe-inline'`, desnecessários aqui; restringir a `'self'` reforça FR-028 (nada externo).
- **Alternatives considered**: CSP padrão do `helmet` (quebra o HTTP local); sem CSP (perde a
  defesa contra XSS, relevante agora que há sessão).

## R8. Páginas, redirecionamentos e "em breve"

- **Decision**: páginas HTML estáticas separadas, servidas com URL limpa (`express.static` com
  `extensions: ['html']`): `/` (inicial), `/cadastro`, `/entrar`, `/termos`, `/candidato` e
  `em-breve.html`. Antes do estático, um roteador de páginas aplica as regras do FR-023 no
  servidor: com sessão válida, `/`, `/cadastro` e `/entrar` redirecionam (`302`) para
  `/candidato`; sem sessão, `/candidato` redireciona para `/entrar` (com
  `?motivo=expirada` quando havia cookie, mas inválido ou vencido). Essas respostas levam
  `Cache-Control: no-store`. Qualquer caminho terminado em `.html` é redirecionado (`301`)
  para a URL limpa (`/index.html` → `/`, `/candidato.html` → `/candidato`), para que o acesso
  direto ao arquivo não escape dessas regras (achado S1). As rotas `/estudos`, `/validar` e
  `/certificacao` entregam
  `em-breve.html`, que mostra o nome do recurso e o caminho de volta; cada feature (003, 004,
  005) troca a sua rota. Os formulários enviam JSON por `fetch` (necessário por R3).
- **Rationale**: decidir o redirecionamento no servidor evita o "pisca" de conteúdo errado e
  funciona antes de o JavaScript carregar; `no-store` impede que o botão Voltar mostre uma
  página de candidato depois de sair. Páginas separadas, sem roteador no front, são o mais
  simples com JS puro (Princípio II).
- **Alternatives considered**: SPA com roteador próprio (mais código, mais difícil de
  explicar); esconder os caminhos de recursos ainda não entregues (contraria FR-004 e
  FR-024).

## R9. Validação de CPF em um só lugar

- **Decision**: um único arquivo, `app/public/js/compartilhado/cpf.js`, exporta
  `normalizarCpf`, `validarCpf` e `formatarCpf`. No navegador, ele se registra em
  `window.Cpf`; no Node, em `module.exports` (o back faz `require` do mesmo arquivo). O
  servidor é a autoridade: valida tudo de novo, independentemente do front.
- **Rationale**: evita duas implementações do cálculo dos dígitos verificadores que poderiam
  divergir (FR-006, SC-004), e o teste unitário cobre o código que roda nos dois lados.
- **Alternatives considered**: duplicar a função no front e no back (risco de divergência);
  validar só no back (pior experiência no formulário).

## R10. Identidade visual: tokens e fontes locais

- **Decision**: `app/public/css/tokens.css` com as variáveis de `docs/identidade-visual.md`
  (céu, superfície, Lua, texto, acento, sucesso, erro, painel claro) e as famílias
  tipográficas. Fontes variáveis em `.woff2` hospedadas em `app/public/fonts`:
  `sora-latin-wght-normal.woff2` (≈ 34 KB) e `source-sans-3-latin-wght-normal.woff2`
  (≈ 29 KB), do Fontsource (`@fontsource-variable/sora` e `@fontsource-variable/source-sans-3`
  5.3.0), copiadas uma vez para o repositório, com os textos da licença ao lado. O subconjunto
  `latin` cobre os acentos do português. Pilha de fallback: `system-ui, sans-serif`.
- **Rationale**: as duas fontes são SIL Open Font License 1.1 (conferido nos pacotes), que
  permite redistribuir e hospedar junto com o projeto. Fontes locais atendem FR-028 (portal
  sem internet na apresentação) e a CSP `font-src 'self'` (R7). Os arquivos entram no
  repositório, não como dependência npm, porque o front não tem etapa de build.
- **Contraste conferido** (WCAG, relação mínima 4,5:1 para texto comum): `--texto`,
  `--texto-suave`, `--acento`, `--sucesso`, `--erro`, `--lua` e `--lua-sombra` passam sobre os
  três fundos escuros (menor valor: 5,06:1, `--lua-sombra` sobre `--superficie`); botão com
  texto `--ceu-profundo` sobre `--acento`: 11,71:1. `--erro` (2,65:1) e `--sucesso` (2,05:1)
  **não** passam sobre `--painel-claro`; por isso foram criadas duas variantes, no mesmo matiz
  e mais escuras, para texto sobre fundo claro: `--erro-sobre-claro: #C5151F` (5,55:1 sobre
  `--painel-claro`, 6,00:1 sobre branco) e `--sucesso-sobre-claro: #256F4C` (5,62:1 e 6,07:1).
  A margem acima de 4,5:1 cobre a versão impressa do certificado (005). As cores originais
  continuam valendo só sobre os fundos escuros. Registrado em `docs/identidade-visual.md`.
- **Alternatives considered**: Google Fonts por CDN (quebra sem internet e exige liberar
  domínio na CSP); fontes estáticas por peso (mais arquivos que as variáveis).

## R11. A tela inicial substitui a página de status da 001

- **Decision**: `index.html` passa a ser a apresentação da certificação. O estado do portal
  vira uma linha discreta no rodapé ("Portal no ar · banco conectado"), alimentada pelo mesmo
  `GET /api/saude`; banco indisponível (`503`) e carga incompleta (`cargaCompleta: false`)
  aparecem como alerta em destaque no topo (FR-004a). O `<title>` mantém "Portal de
  Certificação em Metodologias Ágeis". O README e o quickstart da 001 passam a descrever o
  estado no rodapé; o caso `GET /` do teste `saude.test.js` continua valendo para visitante.
- **Rationale**: preserva o FR-013 da 001 sem competir com a apresentação. O `<title>` mantém
  a checagem do `scripts/validar-001.sh` (que procura "Portal de Certificação").
- **Alternatives considered**: mover o estado para uma página `/status` (quebraria o FR-013 da
  001 e o quickstart); manter os cartões de status no meio da tela inicial (polui a
  apresentação).

## R12. Testes que gravam no banco

- **Decision**: os testes que cadastram e entram rodam cada caso dentro de uma transação
  desfeita no fim (`begin` ... `rollback`), usando um cliente dedicado do pool. Para isso,
  `criarApp()` recebe as dependências (`consultar`, custo do `bcrypt`, segredo, relógio), e os
  repositórios recebem `consultar` em vez de importar o pool direto. Os testes usam custo de
  `bcrypt` baixo (4) para rodar rápido. A corrida de dois cadastros simultâneos do mesmo CPF é
  garantida pela restrição `unique` do esquema e testada simulando o erro `23505`.
- **Rationale**: a 001 previu (R12) que o banco de teste separado só seria necessário com a
  primeira escrita. A transação desfeita resolve sem novo banco nem novo container: o banco de
  desenvolvimento não fica com candidatos de teste, e a verificação da carga continua sem o
  aviso de "tabelas de uso com dados" depois de `npm test`.
- **Alternatives considered**: banco de teste separado criado por script de init (só existiria
  em volumes novos, exigindo `down -v` em quem já tem o banco); apagar os CPFs de teste ao
  final (deixa resíduo se o teste quebrar no meio).

## R13. Camadas do back-end

- **Decision**: nascem nesta feature as pastas previstas na 001: `controllers/`, `services/` e
  `middlewares/`, além de `seguranca/` (sessão e segredo) e `validacao/` (regras do cadastro).
  Fluxo: `routes` → `controllers` → `services` (regras de cadastro, login e tentativas) →
  `repositories` (SQL puro e parametrizado).
- **Rationale**: é a estrutura da seção 5 do dossiê e o que a 001 adiou "até a primeira regra de
  negócio". Separar as regras em `services` permite testá-las sem HTTP.
- **Alternatives considered**: tudo nas rotas (mistura HTTP, regras e SQL).

## R14. Dados pessoais e registros

- **Decision**: o app nunca registra em log o corpo das requisições de cadastro e login, a
  senha, o hash, o CPF, o e-mail nem o segredo da sessão. Erros inesperados registram só a
  mensagem técnica. As mensagens ao usuário não ecoam dados digitados. O endereço de rede
  (IP) é usado só em memória, por cerca de um minuto, pelo limite por rede (R6), e os termos
  dizem isso (achado C2). Pedidos sobre os dados pessoais são feitos pela página de issues do
  repositório do projeto no GitHub, sem e-mail pessoal, com a orientação de não publicar dados
  pessoais na mensagem (decisão do mantenedor, achado A1).
- **Rationale**: Princípio VI (minimização, senha nunca em log) e SC-006, conferido no
  quickstart com uma busca nos logs do container depois do teste.
- **Alternatives considered**: log de auditoria de logins com CPF (dado pessoal sem requisito
  que o justifique).

## Pendências para features seguintes

- **Indicador de progresso pela Lua (RF21)**: a identidade visual prevê a Lua iluminando 1/12
  por tema concluído; entra na 004, que tem os dados de progresso. Nesta feature, a Lua da tela
  inicial é decorativa.
- **Contador de tentativas em memória**: se o portal passar a rodar com mais de um processo,
  o contador por CPF precisa ir para um armazenamento compartilhado.
