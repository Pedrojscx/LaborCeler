# Research: Tela Inicial, Cadastro e Login

**Feature**: `002-tela-inicial-cadastro-login` | **Data**: 2026-10-03 | **Spec**: [spec.md](spec.md)

Pesquisa da Fase 0 do plano, gerada do zero a partir da spec atual (constituição 3.0.1, identidade
visual 2.0, kit de interface 1.1, protótipo em `docs/prototipo/` como fonte da verdade). As
decisões da versão anterior que continuam válidas foram reavaliadas e mantidas; as que caducaram
(fontes Sora e Source Sans, estado do portal no topo da página, contato pelas issues, tela
inicial redirecionando o candidato conectado) foram substituídas. Não resta nenhum ponto em
aberto ("NEEDS CLARIFICATION").

## R1. Dependências novas e versões

- **Decision**: `bcrypt` 6.0.0, `jsonwebtoken` 9.0.3, `cookie-parser` 1.4.7, `helmet` 8.3.0 e
  `express-rate-limit` 8.7.0, versões atuais no registro npm em 03/10/2026, com `^` no
  `package.json` e fixadas no `package-lock.json`. Nenhuma dependência no front-end.
- **Rationale**: é a stack da seção 5 do dossiê. O `bcrypt` 6 traz binários pré-compilados
  (N-API, `prebuildify`) para Linux glibc x64 e arm64, então a imagem `node:24-bookworm-slim` não
  precisa de compilador. O `express-rate-limit` 8 aceita Express 5; o `helmet` 8 exige Node 18 ou
  mais novo.
- **Alternatives considered**: `bcryptjs` (JS puro; gera o mesmo formato de hash, mas o dossiê
  pede `bcrypt` e os binários pré-compilados removem o problema de compilação); sessão em tabela
  própria (mudaria o esquema oficial sem requisito que peça).

## R2. Sessão: JWT assinado em cookie

- **Decision**: depois do cadastro ou do login, o servidor emite um JWT HS256 com `sub` (id do
  candidato), `cad` (data do cadastro em segundos), `iat` e `exp` de 8 horas, no cookie `sessao`
  com `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800` e `Secure` só quando
  `PUBLIC_BASE_URL` começa com `https://`. A verificação fixa `algorithms: ['HS256']`. A cada
  pedido autenticado, o servidor confere o token, busca o candidato pelo `id` e compara, em JS,
  `Math.floor(data_cadastro / 1000) === cad`; se o candidato não existir ou a data não bater, a
  sessão é inválida e o cookie é apagado. Sair apaga o cookie com os mesmos atributos.
- **Rationale**: atende FR-018 a FR-020 (identidade decidida pelo servidor a cada acesso, 8 horas)
  sem tabela nova. O `cad` amarra o token ao cadastro: se o banco for recriado e um novo
  candidato receber o mesmo `id`, um token antigo não vira a sessão dele. A comparação fica em JS
  porque `data_cadastro` guarda microssegundos.
- **Risco aceito**: sem tabela de sessões, um token copiado continua válido até expirar mesmo
  depois de "Sair". Com `HttpOnly`, a CSP do R7 e 8 horas de validade, o risco é baixo para o
  escopo; registrado nos riscos do plano.
- **Alternatives considered**: tabela de sessões (mudança de esquema); token em `localStorage`
  (exposto a XSS); token de renovação (complexidade sem requisito).

## R3. Origem e formato dos pedidos que alteram dados

- **Decision**: em todo `POST`, `PUT`, `PATCH` e `DELETE` sob `/api`, inclusive login e cadastro:
  1. com cabeçalho `Origin`, o host dele (nome e porta) precisa ser igual ao `Host` do próprio
     pedido (`new URL(origin).host === req.get('host')`); senão, `403`. `Origin` que não é URL
     (como `null`) também dá `403`;
  2. sem `Origin`, um `Sec-Fetch-Site` diferente de `same-origin` e `none` dá `403`;
  3. sem nenhum dos dois (cliente que não é navegador, como os testes), segue.
  O corpo precisa ser `application/json` (`415` se não for); JSON malformado dá `400` e corpo
  acima de 10 kB dá `413`.
- **Rationale**: `SameSite=Lax` não impede um `POST` de outra porta do mesmo host
  (`localhost:8080` é o mesmo "site" que `localhost:3000`). A checagem de `Origin` fecha esse caso
  e o "login forçado". Comparar com o `Host` do pedido funciona em `localhost`, pelo IP da rede
  local (celular na apresentação) e com qualquer `PORT`, sem configuração. Exigir JSON obriga um
  `fetch` de outra origem a passar por preflight, que o app não autoriza (sem CORS).
- **Alternatives considered**: token anti-CSRF (mais código sem ganho real aqui); comparar com
  `PUBLIC_BASE_URL` (recusaria o acesso pelo IP da rede local).

## R4. Segredo da sessão sem valor padrão (FR-029)

- **Decision**: resolvido na subida, nesta ordem: (1) `JWT_SECRET` do ambiente, se não vazia; com
  menos de 32 caracteres, o app se recusa a subir; (2) o arquivo `segredo-sessao` em
  `/app/segredo` (ou na pasta de `PASTA_SEGREDO`, para testes fora do container); (3) senão, gera
  64 bytes aleatórios (`crypto.randomBytes`, base64url), grava o arquivo com permissão `0600` e
  usa. `/app/segredo` é um volume nomeado próprio (`segredo_sessao`). O `Dockerfile` cria a pasta
  com dono `node` antes do `USER node`, com `RUN mkdir` e `chown`, compatível com o builder
  clássico do Docker (sem `COPY --chmod`, `--link` ou `RUN --mount`, que exigem BuildKit, ausente
  na máquina do mantenedor). O Compose repassa `JWT_SECRET: ${JWT_SECRET:-}`. O segredo nunca vai
  para log.
- **Rationale**: concilia FR-029 com o Princípio V: um único `docker compose up`, sem `.env` e sem
  segredo conhecido no repositório. O volume separa o segredo do banco e da imagem (que é
  remontada a cada subida pelo `pull_policy: build` da 001). `docker compose down` mantém as
  sessões; `down -v` apaga o banco e o segredo juntos. 32 caracteres é o mínimo coerente com
  HS256 (RFC 7518, 3.2).
- **Alternatives considered**: segredo novo a cada subida (derrubaria as sessões a cada `up`);
  segredo no banco (mistura segredo e dados); `.env` obrigatório (passo manual).

## R5. Senha: limites em caracteres e em bytes (FR-010)

- **Decision**: de 8 a 64 caracteres, contados por ponto de código, **e** no máximo 72 bytes em
  UTF-8; igual à confirmação. Hash com `bcrypt` custo 12 (4 nos testes). No login de CPF que não
  existe, o servidor compara a senha com um hash fictício gerado na subida, para que o tempo de
  resposta não revele se o CPF existe.
- **Rationale**: o `bcrypt` só usa os primeiros 72 **bytes**; uma senha de menos de 64 caracteres
  com acentos ou emojis pode passar disso e ter parte ignorada em silêncio. Recusar com explicação
  atende o edge case da spec e o estado "senha longa demais" da tela 2 (FR-043). Custo 12 leva
  poucas centenas de milissegundos, dentro de SC-002 e SC-003.
- **Alternatives considered**: truncar em silêncio; pré-hash SHA-256 (foge do padrão das aulas);
  custo 10 (menos margem).

## R6. Limites de tentativas (FR-017, FR-017a)

- **Decision**:
  - **Por CPF**: contador em memória (`Map` do CPF normalizado para os instantes das falhas). 5
    falhas em 15 minutos bloqueiam o CPF por 15 minutos a partir da 5ª; durante o bloqueio a senha
    nem é conferida, e a resposta é `429` com a mesma mensagem para CPF cadastrado ou não. Login
    bem-sucedido zera o contador. Limpeza periódica com `unref` e teto de 50.000 CPFs.
  - **Por endereço de rede**: `express-rate-limit`, 60 tentativas **malsucedidas** por minuto por
    IP (`skipSuccessfulRequests`), separado para login e para cadastro, `429` com mensagem
    própria; `trust proxy` desligado.
  - CPF inválido é recusado antes ("CPF inválido") e não entra no contador: um CPF inválido nunca
    pode estar cadastrado, então isso não revela nada.
- **Rationale**: protege cada conta sem punir a sala da apresentação (SC-009). No Docker Desktop
  (Mac e Windows) todas as conexões podem chegar com o IP do gateway; por isso o limite por rede é
  folgado e só conta falhas, e a proteção real é a do CPF. O contador em memória some ao reiniciar
  o app, o que só alivia bloqueios em curso.
- **Alternatives considered**: limite só por IP (bloquearia a sala); contador no banco (tabela
  nova); bloqueio permanente (sem recuperação de senha, travaria contas).

## R7. Cabeçalhos de segurança e CSP sem atributos `style`

- **Decision**: `helmet` com CSP `default-src 'self'; script-src 'self'; style-src 'self';
  font-src 'self'; img-src 'self' data:; form-action 'self'; frame-ancestors 'self';
  object-src 'none'; base-uri 'self'`; `upgrade-insecure-requests` e `Strict-Transport-Security`
  só com `PUBLIC_BASE_URL` em HTTPS. Nenhuma página tem `<script>` inline, atributo de evento,
  URL `javascript:`, atributo `style="..."` nem recurso de outro domínio. Para isso:
  - a cor de cada corpo celeste, que o kit hoje recebe por `style="--cor: ..."`, passa a vir de
    classes do kit (`lc-corpo-1` a `lc-corpo-12`, com a cor da seção 7 da identidade visual);
  - valores calculados (como a largura de uma barra, `--valor`) são definidos por JavaScript com
    `elemento.style.setProperty`, que a CSP permite;
  - atributos de apresentação do SVG (`fill`, `stroke`) continuam permitidos, porque não são
    atributos `style`.
  Um teste varre os `.html` de `app/public` (exceto o kit) e falha se encontrar qualquer um dos
  itens proibidos.
- **Rationale**: a CSP padrão do `helmet` inclui `upgrade-insecure-requests`, que quebra o acesso
  por HTTP na rede local da apresentação, e libera estilos externos e `'unsafe-inline'`. A CSP
  restrita reforça FR-028 e o Princípio II. O kit (`docs/kit-interface.md`) documenta
  `style="--cor: ..."` no chip e no ponto; esse uso seria bloqueado pela CSP, por isso o kit passa
  à versão 1.2 com as classes por corpo (Princípio XI: o kit é a base comum, não cada página).
- **Alternatives considered**: `style-src-attr 'unsafe-inline'` (abre exceção na CSP para um
  problema que classes resolvem); sem CSP (perde a defesa contra XSS, relevante com sessão).

## R8. Páginas, endereços limpos e redirecionamentos (FR-023)

- **Decision**: páginas HTML estáticas separadas em `app/public`, servidas com endereço limpo:
  `/` (tela 1), `/cadastro` (2), `/entrar` (3), `/candidato` (4), `/termos` (5) e a página
  "Disponível em breve" (6, R9). Antes do estático, um roteador de páginas aplica:
  - com sessão válida, `/cadastro` e `/entrar` respondem `302` para `/candidato`; `/` **não**
    redireciona (a tela inicial fica acessível ao candidato, para o link "Rever as regras");
  - sem sessão, `/candidato` responde `302` para `/entrar`, com `?motivo=expirada` quando havia
    cookie, mas inválido ou vencido;
  - qualquer caminho terminado em `.html` responde `301` para o endereço limpo, para que o acesso
    direto ao arquivo não escape dessas regras;
  - as respostas dessas páginas levam `Cache-Control: no-store`.
  Os formulários enviam JSON por `fetch` (exigido pelo R3) e mostram os erros por campo.
- **Rationale**: decidir no servidor evita o "pisca" de conteúdo errado e funciona antes de o
  JavaScript carregar; `no-store` impede que o botão Voltar mostre a área do candidato depois de
  sair. Páginas separadas, sem roteador no front, é o mais simples com JS puro.
- **Alternatives considered**: SPA com roteador próprio (mais código); manter o redirecionamento
  de `/` do plano antigo (quebraria "Rever as regras", FR-023).

## R9. Destinos provisórios e página "Disponível em breve" (FR-024, FR-050)

- **Decision**: uma tabela única no servidor (`app/src/routes/destinos-provisorios.js`) liga cada
  endereço de recurso ainda não entregue a uma variação da tela 6: `/estudos` e `/estudos/:tema`
  (003), `/certificacao/inicio` (004), `/validar` e `/validar/:codigo` (005), `/flashcards` (007)
  e `/perfil` (007). O servidor entrega `em-breve.html` com o título e o texto da variação
  substituídos em marcadores fixos do arquivo, a partir de textos constantes do próprio servidor
  (nunca de dados do pedido), escapados para HTML. Cada feature, ao ser entregue, remove a sua
  linha da tabela e liga a rota real. Os trechos ocultos pela regra de disponibilidade (tabela do
  FR-050) simplesmente não entram no HTML desta feature; cada feature seguinte os acrescenta.
- **Rationale**: a página funciona sem JavaScript, mostra o texto certo já no primeiro byte e os
  links do portal apontam desde já para os endereços definitivos, sem precisar mudar cada link
  quando a feature chegar. Uma tabela só deixa visível o que ainda é provisório.
- **Alternatives considered**: uma página estática por variação (cinco arquivos quase iguais);
  texto escolhido por JavaScript a partir do endereço (sem JavaScript, mostraria o texto
  errado); esconder trechos por "chaves de recurso" em JavaScript (mais código, e o trecho
  oculto ainda iria para a página).

## R10. Validação de CPF em um só lugar (FR-006)

- **Decision**: `app/public/js/compartilhado/cpf.js` exporta `normalizarCpf`, `validarCpf` e
  `formatarCpf`; no navegador, registra-se em `window.LunarCeler.cpf`; no Node, em
  `module.exports`. O servidor valida tudo de novo, independentemente do front.
- **Rationale**: evita duas implementações do cálculo dos dígitos verificadores que poderiam
  divergir (SC-004); o teste unitário cobre o código que roda nos dois lados.
- **Alternatives considered**: duplicar no front e no back; validar só no back (pior experiência).

## R11. Nome, e-mail e identificador no login (FR-008, FR-009, FR-015)

- **Decision**:
  - **Nome**: depois de aparar e juntar espaços, de 1 a 150 caracteres, pelo menos duas palavras,
    só letras Unicode (`\p{L}`), espaço, apóstrofo (`'` ou `’`) e hífen, sem começar ou terminar
    com apóstrofo ou hífen. É guardado exatamente como digitado (só sem os espaços das pontas).
  - **E-mail**: até 254 caracteres, formato `algo@dominio.tld` sem espaços (expressão simples, sem
    tentar cobrir toda a RFC 5322); e-mails repetidos entre candidatos são aceitos.
  - **Login com e-mail**: se o identificador tiver `@`, a resposta é `400` com "O login é feito
    com o CPF cadastrado, não com o e-mail." (texto do protótipo `Entrar`), sem contar como
    tentativa.
  - **Mensagens**: os textos de erro vêm dos protótipos `Cadastro` e `Entrar` (fonte da verdade);
    só os casos que eles não mostram ganham texto próprio, no catálogo de
    `contracts/paginas-e-sessao.md`. O bloqueio por CPF e o limite por rede usam a mesma mensagem
    do protótipo, o que também atende a regra de não revelar se o CPF existe.
- **Rationale**: aceita "Maria D'Ávila Souza-Lima" (edge case da spec) e recusa nomes de uma
  palavra; o formato simples de e-mail basta, porque o e-mail não é usado para login nem enviado.
- **Alternatives considered**: validar o e-mail com envio de confirmação (fora do escopo).

## R12. Interface: kit 1.2 e 1.3, protótipo e identidade visual (FR-025 a FR-028, FR-031 a FR-049)

- **Decision**: as seis telas usam o kit (`app/public/kit`) e portam `Main`, `Cadastro`, `Entrar`,
  `AreaCandidato`, `Termos` e `EmBreve` de `docs/prototipo/`: os estilos inline do protótipo viram
  classes do kit ou do CSS de cada página, com as correções da identidade visual (cinza `#8A8A93`
  em todo texto abaixo de 18 px, Inter só nos pesos 300, 400 e 500). As classes por corpo celeste
  (R7) entraram no kit 1.2, entregue antes das tarefas; o script do estado do portal no rodapé
  (R14) entra na implementação, como kit 1.3. A Lua em rede
  usa `LunarCeler.luaRede` com o SVG estático do kit como reserva; as abas usam
  `LunarCeler.abas`; as notificações, `LunarCeler.notificar`; mostrar e ocultar senha,
  `LunarCeler.formularios`. A Lua da área do candidato e a órbita da Sprint são SVG no próprio
  HTML. Os fatos das cinco empresas são texto no HTML (atributos `data-` nos rótulos), com o
  texto da seção 9 da identidade visual.
- **Rationale**: Princípio XI (protótipo portado, não redesenhado; o kit é a base comum) e
  Princípio II. Texto no HTML garante que tudo seja legível sem JavaScript.
- **Alternatives considered**: CSS próprio por página sem o kit (redesenho e duplicação).

## R13. Notificação "Conta criada" depois do cadastro (FR-044)

- **Decision**: depois de `201` no cadastro, a página grava uma marca em `sessionStorage` e vai
  para `/candidato`; a área do candidato lê a marca, apaga-a e chama `LunarCeler.notificar` com o
  título "Conta criada" e o primeiro nome vindo de `GET /api/auth/me`. Acesso ao `sessionStorage`
  dentro de `try/catch`: sem ele, a notificação não aparece, e a saudação pelo nome continua
  confirmando a conta (a spec exige que a notificação não seja o único sinal).
- **Rationale**: a notificação precisa aparecer na página de destino, e não na que é abandonada;
  a marca não fica no endereço nem no histórico do navegador.
- **Alternatives considered**: parâmetro no endereço (`?conta=criada`, sobra no histórico e
  reaparece ao recarregar).

## R14. Estado do portal no rodapé (FR-004a)

- **Decision**: script do kit `estado-portal.js` consulta `GET /api/saude` ao carregar cada página
  e atualiza o `lc-status` do rodapé: `200` com carga completa, "Portal no ar e banco conectado";
  `503` ou falha de rede, `lc-status--falha` com "Instabilidade no portal. Tente de novo em alguns
  minutos."; `200` com `cargaCompleta: false`, `lc-status--falha` com "Carga incompleta: confira o
  conteúdo do banco." (FR-013 da 001). Sem JavaScript, o rodapé mostra o texto neutro "Projeto
  acadêmico da Fatec Jacareí" e os links, sem estado.
- **Rationale**: um só lugar para o estado, igual em todas as telas, discreto e sem competir com o
  conteúdo; preserva o FR-013 da 001 com a página de status substituída pela tela inicial.
- **Alternatives considered**: estado no topo da página (plano antigo, contrário à spec atual).

## R15. Termos, marcador do e-mail e o bloqueio da publicação (FR-012, FR-012a, FR-012b)

- **Decision**: enquanto o e-mail do projeto não existir (P-01), o contato dos termos traz o
  marcador fixo `[E-mail do projeto pendente: P-01]`, definido numa constante única
  (`app/src/verificacao/termos.js`) e conferido sempre na página `app/public/termos.html`.
  - **Testes comuns**: o script `npm test` roda os testes e, em seguida, `aviso-termos.js`, que
    imprime no fim da saída, num bloco separado por linhas de destaque, "Termos com marcador de
    e-mail: a publicação será bloqueada até P-01 da 002 ser resolvida", sem mudar o código de
    saída dos testes: `node --test ...; codigo=$?; node src/verificacao/aviso-termos.js; exit
    $codigo`.
  - **Verificação de clone limpo** (`scripts/validar-002.sh`, R19): com o marcador, falha com a
    mesma mensagem e código diferente de zero. O script não tem opção nem variável para pular essa
    checagem.
  Um teste confere que a página tem o marcador **ou** um endereço `mailto:` válido, nunca os dois
  nem nenhum, e que nenhum endereço inventado (como os de exemplo) aparece.
- **Rationale**: decisão do mantenedor: a pendência é só dele e não pode travar as fases da 002,
  mas a publicação precisa ser bloqueada. O aviso a cada rodada evita a surpresa no dia da entrega.
  A constante única impede que a página e a verificação usem marcadores diferentes.
- **Alternatives considered**: falhar o `npm test` (travaria todas as fases); só documentar
  (dependeria de alguém lembrar).

## R16. Testes (Princípio IX e testes da própria feature)

- **Decision**: `node:test` + `supertest` no container do app, contra o banco do Compose. Casos
  que gravam rodam dentro de uma transação desfeita no fim (`begin` ... `rollback`) num cliente
  dedicado do pool; por isso `criarApp()` recebe as dependências (`consultar`, custo do `bcrypt`,
  segredo e relógio) e os repositórios recebem `consultar`. `bcrypt` com custo 4 nos testes. A
  corrida de dois cadastros do mesmo CPF é garantida pelo `unique` do esquema e testada simulando
  o erro `23505`. O relógio injetado permite testar as 8 horas da sessão e os 15 minutos do
  bloqueio sem esperar. Testes estáticos varrem as páginas (R7) e conferem o marcador (R15).
- **Rationale**: a 001 previu a transação desfeita para a primeira escrita; o banco de
  desenvolvimento não fica com candidatos de teste. Nenhuma regra crítica do Princípio IX é tocada,
  mas cadastro, login, sessão e bloqueios têm testes por serem a porta de entrada.
- **Alternatives considered**: banco de teste separado (só existiria em volumes novos); apagar os
  dados ao fim (deixa resíduo se o teste quebrar no meio).

## R17. Camadas do back-end

- **Decision**: nascem `controllers/`, `services/`, `middlewares/`, `seguranca/` e `validacao/`.
  Fluxo: `routes` → `controllers` → `services` (regras) → `repositories` (SQL puro e
  parametrizado).
- **Rationale**: é a estrutura da seção 5 do dossiê, adiada pela 001 até a primeira regra de
  negócio; as regras ficam testáveis sem HTTP.
- **Alternatives considered**: tudo nas rotas (mistura HTTP, regras e SQL).

## R18. Dados pessoais e registros (Princípio VI)

- **Decision**: o app nunca registra em log o corpo dos pedidos de cadastro e login, a senha, o
  hash, o CPF, o e-mail nem o segredo; erros inesperados registram só a mensagem técnica. As
  mensagens ao usuário não ecoam dados digitados. O IP é usado só em memória, por cerca de um
  minuto, pelo limite por rede, como os termos dizem. O contato para pedidos sobre dados pessoais
  é o e-mail exclusivo do projeto (P-01), nunca as issues do repositório (a decisão do plano
  antigo foi revogada pela constituição 3.0.0).
- **Rationale**: Princípio VI e SC-006, conferido com uma busca nos logs do container depois da
  rodada de testes.
- **Alternatives considered**: log de auditoria com CPF (dado pessoal sem requisito).

## R19. Verificação de clone limpo obrigatória para publicar (FR-012b, Princípio V)

- **Decision**: `scripts/validar-002.sh`, no modelo do `validar-001.sh`: clona o repositório numa
  pasta temporária, sobe com um projeto do Compose próprio (`validar002`) e porta própria, roda
  as verificações da feature por `curl` (páginas, redirecionamentos, cadastro, login, sessão,
  sair, CSP, origem, limites, estado no rodapé, nenhum recurso externo, termos sem marcador) e o
  `npm test` dentro do container, e apaga tudo no fim. Antes de subir, confere se o Docker está
  acessível e se os arquivos que os containers leem têm leitura para outros usuários, como o
  `validar-propostas-pg16.sh`. A publicação da 002 (merge na `main`) exige esse script aprovado,
  com a saída registrada em `validacao.md`; a última tarefa da feature é essa rodada, e o PR cita
  o resultado.
- **Rationale**: Princípio V e Definition of Done (item 3); o FR-012b exige que essa verificação
  seja obrigatória e não possa ser pulada.
- **Alternatives considered**: CI no GitHub com Docker (o repositório não tem CI configurada;
  fica como melhoria futura).

## R20. Compatibilidade com a feature 001

- **Decision**: `index.html` passa a ser a tela inicial; `css/estilo.css` e o `js/inicio.js` da
  001 são substituídos. O teste `(e) GET / entrega a página inicial` continua valendo. O
  `validar-001.sh` procura "Portal de Certificação" na página inicial: passa a procurar, sem
  diferenciar maiúsculas, "portal de certificação", que a tela inicial mantém no descritivo da
  marca (identidade visual, seção 2). O estado do portal sai da página e vai para o rodapé (R14).
- **Rationale**: a verificação da 001 continua passando depois da 002, e o FR-013 da 001 continua
  atendido.
- **Alternatives considered**: manter o título antigo (contraria o FR-048: título terminado em
  "· Lunar Celer").
