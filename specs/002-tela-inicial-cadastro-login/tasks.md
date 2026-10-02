---

description: "Lista de tarefas da feature 002-tela-inicial-cadastro-login"
---

> **⚠ DESATUALIZADO (2026-10-02).** Este artefato foi gerado a partir da versão anterior da
> spec, antes da constituição 3.0.0, da identidade visual 2.0 e do kit de interface, e não vale
> como referência. Será regenerado depois que todas as specs estiverem prontas.

# Tasks: Tela Inicial, Cadastro e Login

**Input**: Design documents from `/specs/002-tela-inicial-cadastro-login/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Requisitos**: RF01, RF02, RF03, RF04, RNF01, RNF03 (texto em `docs/requisitos-desafio.md`).
Citar os IDs nas mensagens de commit (Princípio VIII).

**Rastreio por tarefa** (Princípio VIII): cada tarefa termina com `Req:` (FR/SC da spec e
RF/RNF/RP do desafio) ou, se for infraestrutura ou DoD sem requisito direto, com `Just.:` citando
a decisão do `research.md` ou o item da constituição que a justifica.

**Tests**: incluídos. O plano define `node:test` + `supertest` (`app/test/`), com os casos que
gravam no banco rodando em transação desfeita (research R12). Escrever cada teste antes da
implementação e vê-lo falhar.

**Organization**: tarefas agrupadas por história de usuário da spec (US1 a US4).

## Format: `[ID] [P?] [Story] Description — Req/Just.`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: história da spec (US1, US2, US3, US4)

## Path Conventions

- Projeto único da 001: back em `app/src/`, testes em `app/test/`, front estático em
  `app/public/`, orquestração na raiz.
- Camadas: `routes` → `controllers` → `services` → `repositories` (SQL puro e parametrizado,
  Princípio III); `db/01-ddl.sql` NÃO é alterado.
- Identificadores, mensagens e textos em português; nomes estruturais da stack conforme a
  emenda 2.0.2 (Princípio X).
- **Regra da CSP para todo HTML do front** (research R7, `contracts/paginas-e-sessao.md`): nenhum
  `<script>` inline, nenhum atributo de evento (`onclick`, `onsubmit`, `onload`, `onchange` etc.),
  nenhuma URL `javascript:` e nenhum atributo `style="..."`. Todo comportamento vem de arquivos
  `.js` em `app/public/js`, carregados com `<script src="..." defer>` e ligados com
  `addEventListener`; todo estilo vem de `app/public/css`. A regra é conferida em teste (T013).
- Mensagens ao usuário: texto exato do "Catálogo de mensagens" de
  `contracts/paginas-e-sessao.md`; nenhuma ecoa CPF, e-mail ou senha.
- Nunca registrar em log corpo de cadastro/login, senha, hash, CPF, e-mail nem o segredo da
  sessão (research R14).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: dependências, fontes, pastas e infraestrutura do segredo da sessão.

- [ ] T001 Acrescentar a `app/package.json` as dependências `bcrypt@^6.0.0`, `jsonwebtoken@^9.0.3`, `cookie-parser@^1.4.7`, `helmet@^8.3.0` e `express-rate-limit@^8.7.0` e regenerar `app/package-lock.json` com `npm install` (o `bcrypt` 6 traz binários pré-compilados para `linux-x64` e `linux-arm64`, sem compilação na imagem) — Req: RF03, RF04, RNF03. Just.: research R1
- [ ] T002 [P] Hospedar as fontes em `app/public/fonts/`: obter com `npm pack @fontsource-variable/sora@5.3.0` e `npm pack @fontsource-variable/source-sans-3@5.3.0` (numa pasta temporária, sem virar dependência) e copiar `files/sora-latin-wght-normal.woff2`, `files/source-sans-3-latin-wght-normal.woff2` e os arquivos `LICENSE` como `OFL-Sora.txt` e `OFL-SourceSans3.txt` (SIL Open Font License 1.1) — Req: FR-026, FR-028. Just.: research R10
- [ ] T003 [P] Criar as pastas `app/src/seguranca/`, `app/src/middlewares/`, `app/src/validacao/`, `app/src/services/`, `app/src/controllers/` e `app/public/js/compartilhado/` — Just.: plan "Structure Decision", research R13
- [ ] T004 [P] Em `app/Dockerfile`, antes de `USER node`, acrescentar `RUN mkdir -p /app/segredo && chown node:node /app/segredo` (o volume novo nasce com o dono da pasta da imagem); em `docker-compose.yml`, no serviço `app`, acrescentar o volume `segredo_sessao:/app/segredo`, a variável `JWT_SECRET: ${JWT_SECRET:-}` e declarar o volume nomeado `segredo_sessao` no fim do arquivo — Req: FR-029, SC-008; RNF07. Just.: research R4
- [ ] T005 [P] Atualizar o comentário de `JWT_SECRET=` (continua vazia) em `.env.example`: "opcional; se vazia, o portal gera um segredo aleatório na primeira subida e o guarda no volume `segredo_sessao`; se definida, tem prioridade e precisa ter pelo menos 32 caracteres; nunca versione um valor real" — Req: FR-029. Just.: research R4

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CPF compartilhado, segredo e sessão, proteções, repositório, base visual e o novo
`criarApp()`. Sem isso nenhuma história roda.

**⚠️ CRITICAL**: nenhuma história começa antes desta fase.

### Tests (escrever antes e ver falhar)

- [ ] T006 [P] Escrever `app/test/cpf.test.js` (unitário) para `app/public/js/compartilhado/cpf.js`: aceita `529.982.247-25`, `52998224725` e `529 982 247 25` como o mesmo CPF; `normalizarCpf` devolve só os 11 dígitos; recusa `529.982.247-24` (dígito verificador), `111.111.111-11` e os demais dígitos repetidos, `123.456.789` (curto), 12 dígitos e `abc`; `formatarCpf('52998224725')` devolve `529.982.247-25` — Req: FR-006, SC-004; RF03. Just.: research R9
- [ ] T007 [P] Escrever `app/test/segredo-sessao.test.js` para `app/src/seguranca/segredo-sessao.js`, usando pasta temporária e ambiente injetado: `JWT_SECRET` com 32+ caracteres tem prioridade sobre o arquivo; `JWT_SECRET` vazia é ignorada; com menos de 32 caracteres lança erro com mensagem que cita "32 caracteres"; sem variável e sem arquivo, gera, grava com permissão `0600` e devolve um segredo de 64 bytes em base64url; com arquivo existente, devolve o mesmo valor em chamadas seguidas; a mensagem de erro nunca contém o valor do segredo — Req: FR-029, SC-008. Just.: research R4
- [ ] T008 [P] Escrever `app/test/apoio.js` (não é teste; é apoio): `abrirTransacao()` pega um cliente do `pool` de `app/src/db.js`, executa `begin` e devolve `{ consultar, desfazer }`, em que `desfazer()` executa `rollback` e libera o cliente; e `criarAppDeTeste(opcoes)` chama `criarApp` com `consultar` da transação, `segredo` fixo de teste (64 caracteres), `custoBcrypt: 4` e relógio injetável (`agora`) — Just.: research R12

### Implementation

- [ ] T009 [P] Criar `app/public/js/compartilhado/cpf.js` com `normalizarCpf(texto)` (só dígitos), `validarCpf(texto)` (11 dígitos, não todos iguais, dois dígitos verificadores pelo módulo 11) e `formatarCpf(digitos)` (`000.000.000-00`); no navegador registra `window.Cpf`, no Node exporta por `module.exports` (o mesmo arquivo é usado pelos dois lados, research R9) — Req: FR-006, SC-004; RF03. Just.: research R9
- [ ] T010 [P] Criar `app/src/seguranca/segredo-sessao.js` com `obterSegredoSessao({ ambiente = process.env, pasta = config.pastaSegredo })`: 1) `JWT_SECRET` não vazia → usa, ou lança erro se tiver menos de 32 caracteres; 2) arquivo `segredo-sessao` existente → lê; 3) senão `crypto.randomBytes(64).toString('base64url')`, grava com `{ mode: 0o600, flag: 'wx' }` e devolve; nunca registra o valor em log — Req: FR-029, SC-008. Just.: research R4
- [ ] T011 Atualizar `app/src/config.js`: exportar também `cookieSeguro` (`true` só quando `urlPublica` começa com `https://`) e `pastaSegredo` (`process.env.PASTA_SEGREDO` ou, sem ela, `/app/segredo`; a variável serve só para desenvolvimento e testes fora do container e não é repassada pelo Compose); a leitura do segredo fica em `segredo-sessao.js` (depende de T010) — Req: FR-018, FR-029. Just.: research R2, R4
- [ ] T012 Criar `app/src/seguranca/sessao.js` com `emitirSessao(res, candidato, { segredo, cookieSeguro, agora })` (JWT HS256 com `sub` = id, `cad` = `data_cadastro` em segundos, `exp` = 8 h; cookie `sessao` com `httpOnly: true`, `sameSite: 'lax'`, `path: '/'`, `maxAge: 28800000` e `secure: cookieSeguro`), `lerSessao(req, { segredo, buscarPorId })` (verifica com `algorithms: ['HS256']`, busca o candidato só por `id` e compara em JS `Math.floor(data_cadastro / 1000) === cad`; devolve o candidato ou `null`, distinguindo "sem cookie" de "inválida ou vencida") e `encerrarSessao(res, { cookieSeguro })` (apaga com os mesmos atributos) (depende de T011) — Req: FR-018, FR-019, FR-020; RF04. Just.: research R2
- [ ] T013 [P] Escrever `app/test/paginas.test.js` (parte comum): respostas trazem `Content-Security-Policy` com `default-src 'self'`, `script-src 'self'`, `style-src 'self'`, `font-src 'self'` e **sem** `upgrade-insecure-requests` quando `PUBLIC_BASE_URL` é HTTP; nenhuma resposta tem `Access-Control-Allow-Origin`; `POST /api/auth/login` com `Origin: http://localhost:8080` (porta diferente) → `403` "Origem da requisição não permitida."; com `Origin` cujo host é igual ao `Host` da requisição (inclusive um `Host` de IP, como `192.168.0.10:3000`, e também com `https://` no `Origin`, como atrás de um proxy) não dá `403`; `Origin: null` → `403`; sem `Origin` e com `Sec-Fetch-Site: cross-site` → `403`; sem `Origin` e sem `Sec-Fetch-Site` segue; corpo `text/plain` → `415` "Envie os dados em JSON."; JSON malformado → `400` "Envie os dados em JSON."; corpo acima de 10 kB → `413` "Dados grandes demais."; e uma varredura de todos os `.html` de `app/public` que falha se encontrar `<script>` sem `src`, atributo `on[a-z]+=`, `javascript:` ou `style=` — Req: FR-020, FR-028, FR-030; RNF03. Just.: research R3, R7
- [ ] T014 [P] Criar `app/src/middlewares/verificar-origem.js`: em `POST`, `PUT`, `PATCH` e `DELETE`, se houver `Origin`, `new URL(origin).host === req.get('host')` (só nome e porta, sem protocolo; **não** comparar com `PUBLIC_BASE_URL`), senão `403`; `Origin` que não é URL válida (como `null`) também dá `403`; sem `Origin`, `Sec-Fetch-Site` presente e diferente de `same-origin` e `none` → `403`; quando há corpo e ele não é `application/json` → `415`; mensagens do catálogo — Req: FR-020; RNF03. Just.: research R3
- [ ] T015 [P] Criar `app/src/middlewares/limite-rede.js` exportando `criarLimiteRede()`: instância nova de `express-rate-limit` com `windowMs: 60000`, `limit: 60`, `skipSuccessfulRequests: true` (só respostas com status a partir de 400 contam), `standardHeaders: 'draft-8'`, `legacyHeaders: false` e resposta `429` com `{ "erro": "Muitas tentativas a partir desta rede. Aguarde um minuto e tente de novo." }`; sem `trust proxy` (o IP vem da conexão) — Req: FR-017a, SC-009. Just.: research R6
- [ ] T016 [P] Criar `app/src/repositories/candidato-repository.js` com `criarRepositorioCandidatos(consultar)` e SQL puro parametrizado: `inserir({ cpf, nome, email, senhaHash })` → `insert into tbcandidato (cpf, nome, email, senha, data_aceite_termos) values ($1, $2, $3, $4, now()) returning id, nome, data_cadastro`; `buscarPorCpf(cpf)` → `id, nome, senha, data_cadastro`; `buscarPorId(id)` → `id, nome, data_cadastro` (sem comparar a data no SQL: a comparação com o `cad` do token é feita em JS, research R2). Colunas do DDL: `cpf varchar(11) not null unique`, `nome varchar(150) not null`, `email varchar(254) not null`, `senha varchar(255) not null`, `data_aceite_termos timestamp not null` — Req: FR-005, FR-007, FR-011, FR-020; RF03, RF04, RP02. Just.: data-model "Operações"
- [ ] T017 Criar `app/src/middlewares/exigir-sessao.js` com `exigirSessaoApi` (sem sessão válida: `401` com "Sessão expirada ou inexistente. Entre de novo." e cookie apagado se havia um) e `exigirSessaoPagina` (sem sessão: `302` para `/entrar`, com `?motivo=expirada` quando havia cookie inválido ou vencido), ambos deixando `req.candidato` com `{ id, nome }` (depende de T012, T016) — Req: FR-018, FR-021, FR-023. Just.: research R8
- [ ] T018 Reescrever `criarApp(dependencias = {})` em `app/src/app.js`: dependências opcionais `consultar` (padrão: o do `db.js`), `segredo` (sem ele, `obterSegredoSessao()` só é chamado no primeiro uso de uma sessão, para que os testes da 001 não dependam da pasta do container), `custoBcrypt` (padrão 12), `agora` (padrão `Date.now`) e `repositorioConteudo` (001); aplicar `helmet` com a CSP de research R7 (`upgradeInsecureRequests` e `strictTransportSecurity` só quando `config.cookieSeguro`), `cookie-parser`, `express.json({ limit: '10kb' })`, `verificar-origem` em `/api`, um roteador de páginas (criado em `app/src/routes/paginas.js`, ainda vazio) **antes** do `express.static` (com `extensions: ['html']`), a rota de saúde da 001, o `404` JSON e o tratador de erros que registra só a mensagem do erro, nunca o corpo da requisição, e respeita os erros do leitor de JSON (`entity.parse.failed` → `400` "Envie os dados em JSON."; `entity.too.large` → `413` "Dados grandes demais."); em `app/src/server.js`, obter o segredo antes do `listen` e encerrar com mensagem clara (sem o valor) se `JWT_SECRET` for curta (depende de T010 a T017) — Req: FR-020, FR-028, FR-029, FR-030; RNF03. Just.: research R2, R7, R8, R14
- [ ] T019 [P] Criar `app/public/css/tokens.css` com as variáveis de `docs/identidade-visual.md`: `--ceu-profundo: #0B1020`, `--ceu: #141B33`, `--superficie: #1E2747`, `--lua: #E8E6DF`, `--lua-sombra: #9A9890`, `--texto: #F2F1EC`, `--texto-suave: #A9B0C7`, `--acento: #F5C46B`, `--sucesso: #4CC38A`, `--erro: #F07178`, `--painel-claro: #F7F6F2`, `--erro-sobre-claro: #C5151F`, `--sucesso-sobre-claro: #256F4C`; `@font-face` de Sora e Source Sans 3 apontando para `../fonts/*.woff2` (`font-weight: 100 900`, `font-display: swap`) e as pilhas `"Sora", system-ui, sans-serif` e `"Source Sans 3", system-ui, sans-serif`; espaçamentos e raios — Req: FR-026, FR-027, FR-028; RNF01. Just.: research R10
- [ ] T020 [P] Criar `app/public/css/base.css` mobile-first (base para 320 px, `@media (min-width: 768px)` para ampliar): fundo de céu com estrelas em CSS leve, títulos em Sora e corpo em Source Sans 3, botões (primário com texto `--ceu-profundo` sobre `--acento`), formulários (rótulo visível, mensagem de campo), alertas (sobre fundo escuro usam `--erro`/`--sucesso`; sobre `--painel-claro` usam `--erro-sobre-claro`/`--sucesso-sobre-claro`, sempre com ícone e texto, nunca só cor), rodapé, foco visível em todo elemento acionável e `@media (prefers-reduced-motion: reduce)` desligando animações; sem rolagem horizontal de 320 px a 1920 px — Req: FR-025, FR-026, FR-027, SC-007; RNF01. Just.: research R10
- [ ] T021 [P] Criar `app/public/js/api.js` (JS puro): `enviarJson(caminho, dados)` com `fetch` `POST`, `Content-Type: application/json` e `credentials: 'same-origin'`, devolvendo `{ ok, status, corpo }`; `obterJson(caminho)`; tratamento de falha de rede com a mensagem de indisponibilidade do catálogo; função para mostrar `corpo.campos` junto de cada campo (com `aria-live`) — Req: FR-014, FR-030. Just.: research R8
- [ ] T022 [P] Criar `app/public/js/rodape.js` (JS puro, `addEventListener('DOMContentLoaded', ...)`): consulta `GET /api/saude` e preenche o rodapé com "Portal no ar · banco conectado"; com `503`, mostra o alerta de banco indisponível em destaque no topo; com `cargaCompleta: false`, o alerta "Carga incompleta: recrie o banco conforme o README" (FR-013 da 001); é carregado por **todas** as páginas (inicial, cadastro, entrar, termos, candidato e "em breve"), que têm o mesmo rodapé com o estado e o link "Termos de uso e privacidade"; substitui `app/public/js/inicio.js` da 001 — Req: FR-004a, FR-012, FR-030. Just.: research R11

**Checkpoint**: `docker compose up -d --build --wait` sobe com o segredo gerado em `/app/segredo`; `docker compose exec app node --test test/cpf.test.js test/segredo-sessao.test.js test/paginas.test.js` passa; os testes da 001 continuam passando.

---

## Phase 3: User Story 1 - Conhecer a certificação na tela inicial (Priority: P1) 🎯 MVP

**Goal**: visitante sem login vê descrição, objetivos, regras e instruções em linguagem direta, com
a identidade lunar, e encontra os quatro caminhos.

**Independent Test**: cenário 1 do `quickstart.md`: abrir `/` sem login em 320 px e em tela larga e
conferir regras, instruções, os quatro caminhos (estudos e validação levam a "em breve"), o
rodapé de estado e a ausência de recursos externos.

### Tests for User Story 1 ⚠️

- [ ] T023 [P] [US1] Acrescentar a `app/test/paginas.test.js`: `GET /` sem cookie → `200` `text/html` com `<title>` contendo "Portal de Certificação em Metodologias Ágeis", os textos "12 temas", "150 segundos", "65%" e "QR Code", e links para `/cadastro`, `/entrar`, `/estudos`, `/validar` e `/termos`; `GET /estudos` e `GET /validar` → `200` com a página "em breve" — Req: FR-001, FR-002, FR-004, FR-024, SC-001; RF01

### Implementation for User Story 1

- [ ] T024 [US1] Reescrever `app/public/index.html` (HTML5 semântico, `lang="pt-BR"`, `<meta name="viewport">`, `tokens.css` e `base.css`, scripts com `defer`) sem `<script>` inline, atributos de evento, `javascript:` ou `style=`: cabeçalho com o nome do portal; Lua grande em SVG próprio inline (decorativa, `aria-hidden="true"`, fases com `<mask>`); descrição e objetivos da certificação; as regras em lista, em linguagem direta e sem metáfora astronômica (12 temas; uma questão por tema, sorteada para cada candidato; 150 segundos por questão; resposta única: cada tema é respondido uma só vez; aprovação com 65% ou mais de acertos; certificado eletrônico com QR Code para validação pública); as instruções (pode estudar antes; pode interromper e retomar do próximo tema não respondido; fechar ou recarregar a página, perder a conexão ou esgotar o tempo encerra a questão sem nova chance); os quatro caminhos ("Cadastrar", "Entrar", "Estudar", "Validar certificado"); rodapé com estado e link "Termos de uso e privacidade". O tema visual só aparece em rótulos e decoração, nunca no enunciado de uma regra nem no lugar de termos ágeis — Req: FR-001, FR-002, FR-003, FR-004, FR-004a, FR-004b, FR-026, SC-001, SC-010; RF01, RNF01
- [ ] T025 [P] [US1] Criar `app/public/em-breve.html` e `app/public/js/em-breve.js` (mesma regra da CSP): título "Disponível em breve", nome do recurso conforme `location.pathname` (`/estudos` → "Área de estudos", `/validar` → "Validação de certificado", `/certificacao` → "Certificação") e botão de voltar (`history.back()` se houver histórico, senão `/`), ligado com `addEventListener`; rodapé com estado e link dos termos (`rodape.js`) — Req: FR-004a, FR-024
- [ ] T026 [US1] Em `app/src/routes/paginas.js`, servir `em-breve.html` em `GET /estudos` e `GET /validar` (comentário: cada feature, 003 e 005, troca a sua rota) — Req: FR-004, FR-024. Just.: research R8
- [ ] T027 [P] [US1] Remover `app/public/css/estilo.css` e `app/public/js/inicio.js` da 001, substituídos por `tokens.css`, `base.css` e `rodape.js`; conferir que nenhum HTML os referencia — Req: FR-026. Just.: research R11
- [ ] T028 [P] [US1] Atualizar o README (seção "Acessar": a tela inicial apresenta a certificação e mostra no rodapé "Portal no ar · banco conectado"; alertas de banco indisponível e de carga incompleta aparecem em destaque) e `specs/001-base-executavel/quickstart.md` (cenário 1: o estado esperado passa a ser o do rodapé; cenário 5: a "Carga incompleta" aparece como alerta da tela inicial) — Req: FR-004a; RNF06. Just.: research R11
- [ ] T029 [US1] Rodar `docker compose up -d --build --wait`, `docker compose exec app node --test test/paginas.test.js test/saude.test.js` e o cenário 1 do `quickstart.md` da 002 (320 px e tela larga, teclado, aba Rede sem requisições externas); corrigir até passar — Req: FR-025, FR-027, FR-028, SC-001, SC-007, SC-010; RNF01

**Checkpoint**: US1 funcional sozinha: tela inicial completa, páginas "em breve", rodapé de estado.

---

## Phase 4: User Story 2 - Cadastrar-se como candidato (Priority: P1)

**Goal**: cadastro com CPF válido e único, nome completo, e-mail, senha e aceite dos termos; ao
concluir, o candidato fica conectado sem iniciar a certificação.

**Independent Test**: cenário 2 do `quickstart.md`: `POST /api/auth/cadastro` válido devolve `201`
com cookie `sessao` e cria a linha em `tbcandidato`; as recusas devolvem `400`/`409` com as
mensagens do catálogo. (O destino `/candidato` após o cadastro nasce na US4; até lá, conferir
pelo `201`, pelo cookie e pelo banco.)

### Tests for User Story 2 ⚠️

- [ ] T030 [P] [US2] Escrever `app/test/cadastro.test.js` com `criarAppDeTeste` e transação desfeita por caso: válido com máscara → `201`, corpo `{ candidato: { nome, primeiroNome } }` sem CPF nem e-mail, `Set-Cookie` `sessao` com `HttpOnly` e `SameSite=Lax`, linha com `cpf` de 11 dígitos, `senha` começando com `$2b$` e `data_aceite_termos` preenchida; sem máscara → aceito; CPF repetido → `409` "Este CPF já tem cadastro. Entre com o seu CPF e senha."; `529.982.247-24`, `111.111.111-11`, `123.456.789` e `abc` → `400` com `campos.cpf` "CPF inválido. Confira os 11 dígitos."; nome com uma palavra → "Informe o nome completo (nome e sobrenome)."; nome com 151 caracteres ou com dígito → "Use até 150 caracteres: letras, espaços, apóstrofo e hífen."; "Maria D'Ávila Souza-Lima" aceito como digitado; e-mail sem `@` → "Informe um e-mail válido."; senha com 7 e com 65 caracteres → "A senha deve ter entre 8 e 64 caracteres."; senha com 30 emojis (≤ 64 caracteres, > 72 bytes) → "Senha longa demais: acentos, símbolos e emojis ocupam mais espaço. Use uma senha mais curta."; confirmação diferente → "A confirmação não confere com a senha."; `aceiteTermos` ausente ou `false` → "Para se cadastrar, é preciso aceitar os termos de uso e privacidade."; `consultar` falso que lança `{ code: '23505' }` → `409`; `consultar` que lança erro de conexão → `503` com a mensagem de indisponibilidade e nada gravado; nenhuma chamada a `console.*` durante o teste contém a senha, o CPF ou o e-mail — Req: FR-005 a FR-011, FR-013, FR-014, FR-030, SC-004, SC-006; RF03, RNF03

### Implementation for User Story 2

- [ ] T031 [P] [US2] Criar `app/src/validacao/cadastro.js` com `validarCadastro(dados)` devolvendo `{ valido, campos, normalizado }`: CPF com `validarCpf`/`normalizarCpf` de `app/public/js/compartilhado/cpf.js`; nome com `trim`, espaços internos repetidos viram um, "pelo menos 2 palavras", "até 150 caracteres", só letras (com acento, `\p{L}` e marcas), espaço, apóstrofo (`'` ou `’`) e hífen; e-mail com `trim`, "formato `local@dominio.tld`", "até 254 caracteres", **não** único; senha com "8 a 64 caracteres, contados por ponto de código (`[...senha].length`)", "no máximo 72 bytes em UTF-8 (`Buffer.byteLength(senha, 'utf8')`)" e igual à confirmação; `aceiteTermos === true`; mensagens do catálogo — Req: FR-005, FR-006, FR-008, FR-009, FR-010, FR-011, SC-004; RF03, RNF03. Just.: research R5, R9
- [ ] T032 [US2] Criar `app/src/services/autenticacao-service.js` com `criarServicoAutenticacao({ repositorio, custoBcrypt })` e `cadastrar(dados)`: valida (T031), gera o hash `bcrypt` com `custoBcrypt` (12 em produção), insere pelo repositório e traduz erro `23505` em "CPF já cadastrado"; devolve o candidato (`id`, `nome`, `data_cadastro`); a senha nunca sai da função (depende de T016, T031) — Req: FR-007, FR-010, FR-013; RF03, RNF03. Just.: research R5
- [ ] T033 [US2] Criar `app/src/controllers/auth-controller.js` com `cadastrar(req, res)`: chama o serviço, emite a sessão (`emitirSessao`, T012) e responde `201` `{ candidato: { nome, primeiroNome } }`; `400` `{ erro: "Confira os campos destacados.", campos }`; `409` com `campos.cpf`; `503` em falha do banco, sem detalhes técnicos (depende de T032) — Req: FR-007, FR-013, FR-014, FR-030; RF03
- [ ] T034 [US2] Criar `app/src/routes/auth.js` com `POST /cadastro` protegido por uma instância própria de `criarLimiteRede()` (T015) e montar o roteador em `/api/auth` no `app/src/app.js` (depende de T033) — Req: FR-017a; RF03
- [ ] T035 [P] [US2] Criar `app/public/termos.html` (mesma regra da CSP), com data de vigência no topo e, em linguagem direta: quais dados são coletados (CPF, nome completo, e-mail e senha, esta só de forma protegida); para que servem (identificar o candidato, emitir o certificado e permitir a validação pública); que a validação pública mostra o CPF mascarado (`***.456.789-**`) e nunca o e-mail; que o endereço de rede (IP) é usado só momentaneamente, em memória, para limitar tentativas, e não é gravado; que não há edição de perfil nem recuperação de senha no MVP; como pedir esclarecimentos sobre os dados: pela página de issues do repositório do projeto (`https://github.com/Pedrojscx/LaborCeler/issues`), **sem** publicar CPF, e-mail ou outro dado pessoal na mensagem (nenhum e-mail pessoal nos termos); rodapé com estado (`rodape.js`) — Req: FR-004a, FR-011, FR-012; RNF03
- [ ] T036 [US2] Criar `app/public/cadastro.html` e `app/public/js/cadastro.js` (mesma regra da CSP; `tokens.css`, `base.css`, `cpf.js`, `api.js`, `rodape.js` com `defer`): campos CPF (`inputmode="numeric"`, `autocomplete="username"`), nome completo (`autocomplete="name"`), e-mail (`type="email"`, `autocomplete="email"`), senha e confirmação (`autocomplete="new-password"`) e a caixa de aceite com link para `/termos` que abre em nova aba (`target="_blank" rel="noopener"`, para não perder o que foi digitado); validação no navegador com `window.Cpf` antes do envio; envio por `enviarJson('/api/auth/cadastro', ...)` em `submit` (com `preventDefault`) e o botão desabilitado durante o envio (evita duplo cadastro); erros junto de cada campo, preservando os campos e limpando só senha e confirmação; sucesso leva a `/candidato` (depende de T021, T034) — Req: FR-005, FR-012, FR-013, FR-014, SC-002; RF03, RNF01
- [ ] T037 [US2] Rodar `docker compose exec app node --test test/cadastro.test.js` e o cenário 2 do `quickstart.md`; corrigir até passar — Req: FR-005 a FR-014, SC-002, SC-004; RF03

**Checkpoint**: cadastro funcional pela API e pela página; candidato criado e com sessão emitida.

---

## Phase 5: User Story 3 - Entrar com CPF e senha (Priority: P1)

**Goal**: login exclusivamente por CPF e senha, mensagem genérica, bloqueio por CPF, limite folgado
por rede, sessão de 8 horas e saída.

**Independent Test**: cenários 3, 4, 5 e 11 do `quickstart.md`: login com e sem máscara, mesma
mensagem para CPF inexistente e senha errada, e-mail recusado, bloqueio na 6ª tentativa do mesmo
CPF sem afetar outro CPF, 61ª tentativa malsucedida por minuto da mesma rede recusada (sucessos não contam), `me` e `logout`, login
pelo IP da rede local.

### Tests for User Story 3 ⚠️

- [ ] T038 [P] [US3] Escrever `app/test/login.test.js` (transação desfeita, candidato criado no início de cada caso): CPF com e sem máscara → `200` + cookie; CPF não cadastrado e senha errada → `401` com corpos **idênticos** ("CPF ou senha inválidos."); `maria@exemplo.com` no CPF → `400` "Use o seu CPF para entrar (não o e-mail)."; CPF inválido → `400` e não conta para o bloqueio; `GET /api/auth/me` com o cookie → `200` com só `nome` e `primeiroNome`; `POST /api/auth/logout` → `204` com cookie apagado; `me` depois → `401` "Sessão expirada ou inexistente. Entre de novo."; banco indisponível → `503` — Req: FR-015, FR-016, FR-019, FR-030, SC-005; RF04
- [ ] T039 [P] [US3] Escrever `app/test/tentativas.test.js` com relógio injetado: 5 senhas erradas para o mesmo CPF → `401` × 5 e a 6ª `429` "Muitas tentativas para este CPF. Aguarde 15 minutos e tente de novo." com `Retry-After`, **mesmo com a senha certa**; a mesma sequência com `123.456.789-09` (não cadastrado) dá a **mesma** mensagem; outro CPF continua entrando; após 15 minutos (relógio avançado) o CPF volta a poder tentar; sucesso zera a contagem; falhas espaçadas mais de 15 minutos não bloqueiam; 40 logins válidos no mesmo minuto da mesma rede passam (sucessos não contam); 60 tentativas malsucedidas da mesma rede (CPF inválido, `400`, que não aciona o bloqueio por CPF) passam e a 61ª dá `429` "Muitas tentativas a partir desta rede. Aguarde um minuto e tente de novo."; o mesmo limite, separado, vale para `POST /api/auth/cadastro` — Req: FR-017, FR-017a, SC-005, SC-009; RF04. Just.: research R6
- [ ] T040 [P] [US3] Escrever `app/test/sessao.test.js`: cookie `sessao` com `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800` e sem `Secure` quando `PUBLIC_BASE_URL` é HTTP; com `Secure` quando é HTTPS (config injetada); token vencido (relógio 8 h + 1 s à frente) → `me` `401` e cookie apagado; token assinado com outro segredo → `401`; token com `cad` diferente da `data_cadastro` do candidato (cadastro recriado com o mesmo id) → `401` — Req: FR-018, FR-020; RF04. Just.: research R2

### Implementation for User Story 3

- [ ] T041 [P] [US3] Criar `app/src/services/tentativas-login.js` com `criarControleTentativas({ agora })`: `Map` de CPF normalizado (11 dígitos válidos, cadastrado ou não) para `{ falhas, bloqueadoAte }`; "5 falhas em 15 minutos bloqueiam aquele CPF por 15 minutos a partir da 5ª falha"; `estaBloqueado(cpf)` devolve os segundos restantes ou `0`; `registrarFalha(cpf)`; `registrarSucesso(cpf)` zera; limpeza a cada 5 minutos com `setInterval(...).unref()`; teto de 50 000 entradas, descartando as mais antigas — Req: FR-017, SC-009; RF04. Just.: research R6, data-model "Tentativas de login por CPF"
- [ ] T042 [US3] Acrescentar `entrar({ cpf, senha })` a `app/src/services/autenticacao-service.js`: recusa e-mail (texto com `@`) e CPF inválido sem contar tentativa; consulta o bloqueio (T041) e, se bloqueado, devolve o bloqueio sem conferir a senha; busca por CPF; se não existir, compara a senha com um hash fictício gerado uma vez na criação do serviço (mesmo custo) e registra falha; se a senha não confere, registra falha; se confere, zera e devolve o candidato (depende de T032, T041) — Req: FR-015, FR-016, FR-017; RF04. Just.: research R5, R6
- [ ] T043 [US3] Acrescentar a `app/src/controllers/auth-controller.js` e `app/src/routes/auth.js`: `POST /login` (com instância própria de `criarLimiteRede()`; `200` + `emitirSessao`; `400`; `401` "CPF ou senha inválidos."; `429` com `Retry-After` e a mensagem do bloqueio por CPF; `503`), `POST /logout` (`encerrarSessao`, `204`, idempotente) e `GET /me` (`exigirSessaoApi`; `200` `{ candidato: { nome, primeiroNome } }`) (depende de T042, T017) — Req: FR-015 a FR-019; RF04
- [ ] T044 [US3] Criar `app/public/entrar.html` e `app/public/js/entrar.js` (mesma regra da CSP): campos CPF (`inputmode="numeric"`, `autocomplete="username"`) e senha (`autocomplete="current-password"`); com `?motivo=expirada`, mostra "Sua sessão expirou. Entre de novo."; se o CPF digitado tem `@`, orienta a usar o CPF antes de enviar; envio por `enviarJson('/api/auth/login', ...)` em `submit`; mostra as mensagens de `401`, `429` e `503` do catálogo; sucesso leva a `/candidato`; link para `/cadastro`; rodapé com estado e link dos termos (`rodape.js`) (depende de T021, T043) — Req: FR-015, FR-016, FR-017, FR-018, SC-003; RF04, RNF01
- [ ] T045 [US3] Rodar `docker compose exec app node --test test/login.test.js test/tentativas.test.js test/sessao.test.js` e os cenários 3, 4, 5 e 11 do `quickstart.md` (login pelo IP da máquina e pelo celular na mesma rede); corrigir até passar — Req: FR-015 a FR-020, SC-003, SC-005, SC-009; RF04

**Checkpoint**: login, saída, sessão de 8 h, bloqueio por CPF e limite por rede funcionando.

---

## Phase 6: User Story 4 - Decidir entre iniciar agora ou voltar depois (Priority: P2)

**Goal**: área do candidato com três caminhos; iniciar a certificação só após confirmação das regras;
redirecionamentos conforme a sessão.

**Independent Test**: cenário 6 do `quickstart.md`: logado, `/`, `/cadastro` e `/entrar` levam a
`/candidato`; a área saúda pelo primeiro nome e oferece estudar, iniciar (com confirmação) e sair;
sem login, `/candidato` e `/certificacao` levam a `/entrar`.

### Tests for User Story 4 ⚠️

- [ ] T046 [P] [US4] Acrescentar a `app/test/paginas.test.js`: com sessão válida, `GET /`, `/cadastro` e `/entrar` → `302` para `/candidato`; sem sessão, `GET /candidato` e `GET /certificacao` → `302` para `/entrar`; com cookie inválido ou vencido, `GET /candidato` → `302` para `/entrar?motivo=expirada`; com sessão, `GET /candidato` → `200` e `GET /certificacao` → `200` com a página "em breve"; `GET /candidato.html`, `/cadastro.html`, `/entrar.html` e `/index.html` → `301` para `/candidato`, `/cadastro`, `/entrar` e `/` (o acesso direto ao arquivo não escapa das regras); `/`, `/cadastro`, `/entrar` e `/candidato` com `Cache-Control: no-store` — Req: FR-021, FR-022, FR-023, FR-024; RF02

### Implementation for User Story 4

- [ ] T047 [US4] Completar `app/src/routes/paginas.js`: antes de tudo, qualquer `GET` cujo caminho termina em `.html` responde `301` para a URL limpa (`/index.html` → `/`, `/x.html` → `/x`, preservando a query string); `GET /`, `/cadastro` e `/entrar` com sessão válida → `302` `/candidato`, senão seguem para o estático; `GET /candidato` com `exigirSessaoPagina`; `GET /certificacao` com `exigirSessaoPagina` e entrega de `em-breve.html` (a 004 troca esta rota); `Cache-Control: no-store` nessas respostas (depende de T017, T026) — Req: FR-021, FR-022, FR-023, FR-024; RF02. Just.: research R8 (achado S1)
- [ ] T048 [US4] Criar `app/public/candidato.html` e `app/public/js/candidato.js` (mesma regra da CSP): saudação com o primeiro nome vindo de `GET /api/auth/me`; três caminhos: "Estudar antes" (`/estudos`), "Iniciar a certificação" e "Sair"; "Iniciar" abre um `<dialog>` de confirmação com as regras principais em linguagem direta (150 segundos por questão; resposta única; fechar ou recarregar a página, perder a conexão ou esgotar o tempo encerra a questão) e botões "Confirmar e iniciar" (vai para `/certificacao`) e "Voltar"; "Sair" chama `POST /api/auth/logout` e leva a `/`; `401` no `me` leva a `/entrar?motivo=expirada`; rodapé com estado e link dos termos (`rodape.js`); tudo ligado com `addEventListener` (depende de T043, T047) — Req: FR-004b, FR-021, FR-022, SC-010; RF02, RNF01
- [ ] T049 [US4] Rodar `docker compose exec app node --test test/paginas.test.js` e o cenário 6 do `quickstart.md`; corrigir até passar — Req: FR-021 a FR-024; RF02

**Checkpoint**: as quatro histórias funcionam; cadastro e login levam à área do candidato.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: documentação, validação completa e Definition of Done.

- [ ] T050 [P] Incorporar a `docs/openapi.yaml` os caminhos `/api/auth/cadastro`, `/api/auth/login`, `/api/auth/logout` e `/api/auth/me` e os componentes de `specs/002-tela-inicial-cadastro-login/contracts/api-auth.openapi.yaml`, mantendo `/api/saude` — Req: RF03, RF04; RNF06. Just.: constituição, DoD item 4
- [ ] T051 [P] Atualizar o README: tabela de variáveis (`JWT_SECRET` opcional, com prioridade e mínimo de 32 caracteres; sem ela, segredo gerado na primeira subida no volume `segredo_sessao`; `PASTA_SEGREDO`, só para desenvolvimento e testes fora do container); seção Operação (`docker compose down` mantém as sessões; `docker compose down -v` também invalida todas as sessões); como liberar a porta no firewall para acesso pelo IP da rede local — Req: FR-029; RNF06. Just.: research R4
- [ ] T052 [P] Revisar acessibilidade e identidade em todas as páginas (`index`, `cadastro`, `entrar`, `termos`, `candidato`, `em-breve`): contraste AA dos pares usados (conferir com a tabela de research R10), foco visível, navegação só por teclado, `alt` ou `aria-hidden` em toda imagem, `prefers-reduced-motion`, 320 px sem rolagem horizontal, regras sem metáfora astronômica — Req: FR-004b, FR-025, FR-026, FR-027, SC-007, SC-010; RNF01
- [ ] T053 Rodar `docker compose down -v && docker compose up -d --build --wait`, `docker compose exec app npm test` (todos os testes, 0 falhas, 0 skip) e os cenários 1 a 11 do `quickstart.md`, incluindo o 8 (segredo: `down` mantém a sessão, `down -v` invalida, `JWT_SECRET` curta impede a subida) e o 9 (hash `$2b$12$`, 0 ocorrências de senha, CPF ou e-mail nos logs); conferir que `scripts/validar-001.sh` continua passando — Req: FR-029, SC-002, SC-003, SC-006, SC-008; RNF07
- [ ] T054 Autoverificação da DoD (constituição 2.0.2) registrada em `specs/002-tela-inicial-cadastro-login/validacao.md`: Princípios I (identidade decidida no servidor, `cad` conferido), III (SQL parametrizado, `db/01-ddl.sql` intocado, sem ORM), IV (nada derivado gravado) e VI (só CPF, nome, e-mail e senha; hash `bcrypt`; aceite com data e hora; nada pessoal em log); `docs/openapi.yaml` atualizado; testes passando; resultados das validações do mantenedor — Just.: constituição, DoD itens 1, 2 e 4
- [ ] T055 Validação em clone limpo (DoD item 3): criar `scripts/validar-002.sh` no modelo de `scripts/validar-001.sh` (clone em pasta temporária, projeto Compose próprio `validar002`, `PORT` 3100, limpeza no fim, uma linha OK/FALHA por verificação e código de saída 0 só se tudo passar), cobrindo: subida com um comando sem `.env` e com o segredo gerado em `/app/segredo`; tela inicial com as regras; cadastro (`201` + cookie), CPF repetido (`409`), login com e sem máscara, mensagem idêntica para CPF inexistente e senha errada, bloqueio na 6ª falha do mesmo CPF, `me` e `logout`; `Origin` de outra porta dá `403`; `/candidato.html` dá `301`; `npm test` sem falhas nem skip; nenhuma senha, CPF ou e-mail nos logs. Rodar e registrar o resultado em `validacao.md` — Req: FR-029, SC-002, SC-004, SC-005, SC-006, SC-008; RNF07, RP05. Just.: constituição, DoD item 3
- [ ] T056 PR da feature citando os requisitos atendidos (RF01, RF02, RF03, RF04, RNF01, RNF03, com os FR/SC da spec) e o `validacao.md`; quando o backlog existir (issues geradas pelo `/speckit-taskstoissues`), marcar esses requisitos como atendidos citando o PR — Req: RF01, RF02, RF03, RF04, RNF01, RNF03. Just.: constituição, DoD item 5, Princípio VIII

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as histórias.
- **US1 (Phase 3)**: depende só da Fase 2.
- **US2 (Phase 4)**: depende da Fase 2; o destino `/candidato` do cadastro nasce na US4.
- **US3 (Phase 5)**: depende da Fase 2 e do serviço e do controlador criados na US2 (T032, T033,
  mesmo arquivo).
- **US4 (Phase 6)**: depende da US3 (`/api/auth/me` e `logout`) e da rota de páginas da US1 (T026).
- **Polish (Phase 7)**: depois das quatro histórias.

### User Story Dependencies

- **US1 (P1)**: independente; é o MVP desta feature.
- **US2 (P1)**: independente da US1; testável pela API até a US4 existir.
- **US3 (P1)**: compartilha `autenticacao-service.js`, `auth-controller.js` e `routes/auth.js` com
  a US2, por isso vem depois dela.
- **US4 (P2)**: depende da US3.

### Within Each User Story

- Testes escritos e falhando antes da implementação.
- Validação → serviço → controlador → rota → página.
- Arquivos compartilhados (`paginas.test.js`, `routes/paginas.js`, `autenticacao-service.js`,
  `auth-controller.js`, `routes/auth.js`, `app.js`) são editados em sequência.

### Parallel Opportunities

- Setup: T002, T003, T004, T005.
- Foundational: T006, T007, T008 (testes); T009, T010, T013, T014, T015, T016, T019, T020, T021,
  T022 (arquivos diferentes); depois T011 → T012 → T017 → T018.
- US1: T023, T025, T027, T028 em paralelo; T024 e T026 em sequência com eles quando tocam o
  mesmo arquivo.
- US2: T030, T031, T035 em paralelo.
- US3: T038, T039, T040, T041 em paralelo.

---

## Parallel Example: Foundational

```bash
Task: "Escrever app/test/cpf.test.js (T006)"
Task: "Escrever app/test/segredo-sessao.test.js (T007)"
Task: "Criar app/public/js/compartilhado/cpf.js (T009)"
Task: "Criar app/public/css/tokens.css (T019)"
Task: "Criar app/public/css/base.css (T020)"
```

## Parallel Example: User Story 3

```bash
Task: "Escrever app/test/login.test.js (T038)"
Task: "Escrever app/test/tentativas.test.js (T039)"
Task: "Escrever app/test/sessao.test.js (T040)"
Task: "Criar app/src/services/tentativas-login.js (T041)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Fase 1 (Setup) e Fase 2 (Foundational).
2. Fase 3 (US1): tela inicial com a identidade lunar, regras, instruções e caminhos.
3. **Parar e validar** com T029 / cenário 1 do quickstart.

### Incremental Delivery

1. Setup + Foundational → segredo, sessão, proteções e base visual prontos.
2. US1 → tela inicial (MVP desta feature).
3. US2 → cadastro.
4. US3 → login, sessão, bloqueios.
5. US4 → área do candidato e redirecionamentos.
6. Polish → OpenAPI, README, acessibilidade, validação completa e DoD.

### Commits sugeridos (mantenedor único)

Um commit por fase, citando requisitos: setup (RF03, RF04), fundação (RNF03), US1 (RF01, RNF01),
US2 (RF03, RNF03), US3 (RF04), US4 (RF02), polish (RNF06).

---

## Notes

- [P] = arquivos diferentes, sem dependência pendente.
- Nenhuma mudança em `db/01-ddl.sql`; divergência vira item de decisão.
- O banco de desenvolvimento não deve ficar com candidatos de teste: todo teste que grava usa a
  transação desfeita de `app/test/apoio.js`.
- Validações que dependem do Docker (T029, T037, T045, T049, T053, T055) ficam com o
  mantenedor; o assistente valida antes o que der fora do Docker.
- SC-001 (teste de compreensão com 5 pessoas) é medido após a entrega; antes dela, a presença das
  regras e instruções é conferida no T029 (decisão do mantenedor, achado G1 do analyze).
- O destino `/candidato` do cadastro só existe a partir da US4; a US2 é validada pela API até lá
  (achado O1, mantido como está).
