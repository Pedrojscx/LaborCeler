---

description: "Lista de tarefas da feature 001-base-executavel"
---

# Tasks: Base Executável do Portal

**Input**: Design documents from `/specs/001-base-executavel/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Requisitos**: RNF07, RP02, RP04, RP05, RP06, RNF06; apoio a RF06 e RF08. Citar os IDs nas
mensagens de commit (Princípio VIII).

**Rastreio por tarefa** (Princípio VIII): cada tarefa termina com `Req:` (requisitos da spec,
FR/SC, e do desafio, RF/RNF/RP) ou, se for infraestrutura ou DoD sem requisito direto, com
`Just.:` citando a decisão do `research.md` (ou o item da constituição) que a justifica.

**Tests**: incluídos. FR-016 pede verificação automatizada da carga e o plano define testes
`node:test` + `supertest` (`app/test/`). Escrever cada teste antes da implementação e vê-lo
falhar.

**Organization**: tarefas agrupadas por história de usuário da spec.

## Format: `[ID] [P?] [Story] Description — Req/Just.`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: história da spec (US1, US2, US3)

## Path Conventions

- Aplicação web em projeto único: código Node em `app/src/`, testes em `app/test/`, front
  estático em `app/public/`, SQL em `db/`, orquestração na raiz (`docker-compose.yml`).
- Convenções obrigatórias (constituição 2.0.2): identificadores de domínio, de banco, mensagens
  e textos ao usuário em português; nomes estruturais da stack (`server.js`, `app.js`,
  `config.js`, `db.js`, `routes/`, `repositories/`, `test/`) seguem a convenção Node/Express
  (Princípio X); SQL escrito à mão, sem ORM, sem gerador de SQL (Princípio III, research R6);
  `db/01-ddl.sql` NÃO é alterado.
- Caminhos de arquivo no código são resolvidos a partir do módulo (`path.resolve(__dirname,
  ...)`), nunca do diretório de trabalho (research R8).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: inicializar o projeto Node e os arquivos de configuração do repositório.

- [X] T001 Criar a árvore de pastas do plano: `app/src/routes/`, `app/src/repositories/`, `app/src/verificacao/`, `app/scripts/`, `app/public/css/`, `app/public/js/`, `app/public/img/questoes/`, `app/public/img/materiais/`, `app/test/` (sem `controllers/`, `services/` e `middlewares/`, que nascem na feature 002) — Just.: plan "Structure Decision" (dossiê seção 5)
- [X] T002 Criar `app/package.json` com `"name": "portal-certificacao"`, `"type": "commonjs"`, `"engines": {"node": ">=24"}`, dependências `express@^5` e `pg@^8`, devDependency `supertest`, e scripts `"start": "node src/server.js"`, `"test": "node --test \"test/**/*.test.js\""` (glob entre aspas, expandido pelo Node; filtros sempre por arquivo, nunca por nome de teste), `"verificar-carga": "node src/verificacao/cli.js"`; gerar e versionar `app/package-lock.json` (rodar `npm install` dentro de um container `node:24-bookworm-slim` se não houver Node 24 local) — Req: FR-001, FR-016; RNF07. Just.: research R1, R12
- [X] T003 [P] Atualizar `.gitignore` na raiz mantendo `.env`, `node_modules/`, `pgdata/` e acrescentando `docker-compose.override.yml` — Req: FR-015. Just.: research R4, R9
- [X] T004 [P] Criar `app/.dockerignore` com `node_modules`, `npm-debug.log` e `.env` (o contexto de build é `app/`) — Req: FR-015. Just.: research R9
- [X] T005 [P] Criar `.env.example` na raiz com as variáveis do contrato `contracts/execucao-e-verificacao.md`, cada uma com comentário de finalidade: `PORT=3000`, `PUBLIC_BASE_URL` comentada (`# PUBLIC_BASE_URL=http://localhost:3000`, com nota "se não definida, vale http://localhost:${PORT}"), `DATABASE_URL=postgres://portal:portal@db:5432/bdcertificacao`, `POSTGRES_USER=portal`, `POSTGRES_PASSWORD=portal`, `POSTGRES_DB=bdcertificacao` e `JWT_SECRET=` **vazio**, com comentário "sem valor padrão; usado a partir da feature 002 (research P1)" — Req: FR-014, FR-015; RNF06. Just.: research R9, P1

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Compose, imagem do app e núcleo do Express. Sem isso nenhuma história roda.

**⚠️ CRITICAL**: nenhuma história começa antes desta fase.

- [X] T006 Criar `docker-compose.yml` na raiz, serviço `db`: imagem `postgres:16`; `environment` com `POSTGRES_USER: ${POSTGRES_USER:-portal}`, `POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-portal}`, `POSTGRES_DB: ${POSTGRES_DB:-bdcertificacao}`, `TZ: America/Sao_Paulo`, `PGTZ: America/Sao_Paulo`; volumes `dados_banco:/var/lib/postgresql/data` e `./db:/docker-entrypoint-initdb.d:ro`; healthcheck `["CMD-SHELL", "pg_isready -h 127.0.0.1 -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]` com `interval: 5s`, `timeout: 5s`, `retries: 10`, `start_period: 30s` (o `-h 127.0.0.1` é obrigatório, research R2); **nenhuma** seção `ports`; declarar o volume nomeado `dados_banco` no fim do arquivo — Req: FR-001, FR-002, FR-003, FR-010, FR-011, FR-012, FR-015; RNF07, RP05, RP02. Just.: research R2, R3, R4, R10
- [X] T007 Acrescentar ao `docker-compose.yml` o serviço `app`: `build: ./app`; `depends_on: { db: { condition: service_healthy } }`; `environment` com `PORT: ${PORT:-3000}`, `PUBLIC_BASE_URL: ${PUBLIC_BASE_URL:-}` (vazio quando não definida; o app deriva de `PORT`, T009), `DATABASE_URL: ${DATABASE_URL:-postgres://portal:portal@db:5432/bdcertificacao}`, `TZ: America/Sao_Paulo` (sem `JWT_SECRET`, research P1); `ports: ["${PORT:-3000}:${PORT:-3000}"]`; `restart: unless-stopped`; healthcheck com o `fetch` nativo do Node 24: `test: ["CMD", "node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/saude').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]`, `interval: 5s`, `timeout: 3s`, `retries: 5`, `start_period: 20s`, sem `start_interval`, que exigiria Engine ≥ 25 (research R14, R15; é ele que faz `up -d --wait` esperar o portal responder) — Req: FR-001, FR-012, FR-015, SC-005; RNF07, RP05. Just.: research R9, R15
- [X] T008 [P] Criar `app/Dockerfile`: `FROM node:24-bookworm-slim`, `WORKDIR /app`, sem `NODE_ENV=production` (as devDependencies são necessárias para `npm test` no container), copiar `package.json` e `package-lock.json`, `RUN npm ci`, copiar o restante, `USER node`, `EXPOSE 3000`, `CMD ["node", "src/server.js"]` — Req: FR-001; RNF07, RP05. Just.: research R1, R12
- [X] T009 [P] Criar `app/src/config.js` exportando `{ porta, urlPublica, urlBanco }` lidos de `PORT` (padrão `3000`, convertido para número), `PUBLIC_BASE_URL` (quando ausente ou vazia, deriva de `porta`: `` `http://localhost:${porta}` ``) e `DATABASE_URL` (padrão `postgres://portal:portal@db:5432/bdcertificacao`); não ler `JWT_SECRET` — Req: FR-014, FR-015. Just.: research R9
- [X] T010 [P] Criar `app/src/db.js` exportando um `Pool` do `pg` com `connectionString` de `config.urlBanco`, um listener `pool.on('error', ...)` que apenas registra o erro no console (a conexão perdida não derruba o processo, quickstart cenário 5) e a função `consultar(sql, parametros = [])` que repassa para `pool.query` (consultas sempre parametrizadas, Princípio III) — Req: FR-012, FR-013; RP02. Just.: research R2
- [X] T011 Criar `app/src/app.js` exportando `criarApp()`: instancia o Express 5, serve a pasta pública resolvida por `path.resolve(__dirname, '../public')` (o módulo fica em `app/src/`) com `express.static` em `/`, monta um `Router` em `/api` (rotas entram nas histórias), responde `404` com JSON `{"erro": "Rota não encontrada"}` para qualquer `/api/*` sem rota, e trata erros com `500` JSON `{"erro": "Erro interno"}` sem vazar stack (depende de T009, T010) — Req: FR-008, FR-013; RP04. Just.: research R8
- [X] T012 Criar `app/src/server.js`: importa `criarApp` e `config`, chama `listen(config.porta)` e registra no console `Portal no ar em <urlPublica>`; encerra o `Pool` ao receber `SIGTERM`/`SIGINT` (depende de T011) — Req: FR-001, FR-010; RNF07

**Checkpoint**: `docker compose up -d --build --wait` sobe `db` e `app` como `healthy` (esquema de `db/01-ddl.sql` criado); `curl localhost:3000/api/x` responde 404 JSON. Até T015 existir, o healthcheck do `app` falha (404) e `--wait` não retorna; use `docker compose up -d --build` nesse intervalo.

---

## Phase 3: User Story 1 - Subir o portal a partir de um clone limpo (Priority: P1) 🎯 MVP

**Goal**: clone → um comando → página inicial confirmando aplicação no ar e banco conectado,
seguindo só o README.

**Independent Test**: em máquina só com Git e Docker nas versões mínimas, `git clone` + `docker
compose up -d --wait`; abrir `http://localhost:3000` mostra "Portal no ar" e "Banco conectado";
`/api/saude` responde 200 no formato de `contracts/api-saude.openapi.yaml` (as contagens podem
ser 0 se os seeds da US2 ainda não existirem; nesse caso `cargaCompleta: false` e a página
mostra "Carga incompleta").

### Tests for User Story 1 ⚠️

- [X] T013 [P] [US1] Escrever `app/test/saude.test.js` com `node:test` + `supertest` sobre `criarApp()`: (a) `GET /api/saude` com banco disponível responde `200` e corpo com `status: "ok"`, `banco: "ok"` e `conteudo` contendo os inteiros `temas`, `questoes`, `alternativas`, `materiais` e os booleanos `provisorio` e `cargaCompleta`; (b) com o repositório substituído por um que lança erro, responde `503` e `{"status": "erro", "banco": "indisponivel"}`; (c) com o repositório substituído por um que devolve 12 / 47 / 188, responde `200` com `cargaCompleta: false`, e com 12 / 48 / 192, `cargaCompleta: true`; (d) `GET /api/inexistente` responde `404` JSON; (e) `GET /` responde `200` com `text/html`; (f) `GET /img/questoes/tema01-q1.svg` responde `200` com `Content-Type` `image/svg+xml` (marcado com `skip: 'SVGs da US2 ainda não gerados'` enquanto o arquivo não existir em `path.resolve(__dirname, '../public/img/questoes/tema01-q1.svg')`, para a US1 validar sozinha); fechar o `Pool` no `after()` — Req: FR-008, FR-012, FR-013, SC-003; RNF07, RP04. Just.: research R12

### Implementation for User Story 1

- [X] T014 [P] [US1] Criar `app/src/repositories/conteudo-repository.js` com `obterResumoConteudo()` executando SQL puro em uma única consulta: `count(*)` de `tbtema`, `tbquestao`, `tbalternativa` e `tbmaterial`, e `provisorio` = existe alguma linha em `tbquestao.enunciado`, `tbmaterial.titulo` ou `tbimagem.credito` com `like '[PROVISÓRIO]%'`; retornar números (converter os `bigint` que o `pg` devolve como texto) — Req: FR-009, FR-013; RP02
- [X] T015 [US1] Criar `app/src/routes/saude.js` com `GET /saude` que chama `obterResumoConteudo()` e responde `200` `{ status: "ok", banco: "ok", conteudo: {..., cargaCompleta} }`, com `cargaCompleta` = `temas === 12 && questoes === 48 && alternativas === 192` (calculado na rota, não gravado, Princípio IV), ou `503` `{ status: "erro", banco: "indisponivel" }` se a consulta falhar; permitir injetar o repositório (para os testes T013b e T013c) e registrar a rota no `Router` `/api` em `app/src/app.js` (depende de T014) — Req: FR-012, FR-013; RNF07
- [X] T016 [P] [US1] Criar `app/public/index.html` (HTML5 semântico, `lang="pt-BR"`, `<meta name="viewport">`): título "Portal de Certificação em Metodologias Ágeis", uma área de status com dois itens ("Aplicação" e "Banco de dados"), um resumo das contagens e uma área de alerta (oculta por padrão) para "Carga incompleta"; incluir `css/estilo.css` e `js/inicio.js` (sem frameworks, Princípio II) — Req: FR-013; RNF01, RP01
- [X] T017 [P] [US1] Criar `app/public/css/estilo.css` mobile-first (estilos base para telas estreitas, `@media (min-width: 768px)` para ampliar), cores com contraste suficiente e estados visuais distintos para "ok", "indisponível" e "carga incompleta" — Req: FR-013; RNF01, RP01
- [X] T018 [P] [US1] Criar `app/public/js/inicio.js` em JavaScript puro: `fetch('/api/saude')`, mostrar "Portal no ar" e "Banco conectado" ou "Banco indisponível" conforme a resposta (200/503), exibir as contagens, mostrar o alerta "Carga incompleta: recrie o banco conforme o README" quando `cargaCompleta` for `false` e, quando `provisorio` for `true`, a nota "Conteúdo provisório"; tratar falha de rede com mensagem amigável — Req: FR-009, FR-013; RNF01, RP01
- [X] T019 [P] [US1] Criar `docs/openapi.yaml` (OpenAPI 3.1, `info.title` "Portal de Certificação em Metodologias Ágeis - API") contendo o caminho `/api/saude` e os schemas `Saude` (com `cargaCompleta`) e `SaudeIndisponivel` copiados de `specs/001-base-executavel/contracts/api-saude.openapi.yaml` — Req: FR-013; RNF06. Just.: constituição, DoD item 4 (documentação da API)
- [X] T020 [US1] Criar `README.md` na raiz com: nome e objetivo do projeto; seção **Instalação** com pré-requisitos e versões mínimas (Git; Docker Engine ≥ 20.10 e Docker Compose ≥ v2.2.1, plugin `docker compose`, ou Docker Desktop ≥ 4.3; como conferir com `docker version` e `docker compose version`; Node e PostgreSQL locais NÃO são necessários), comando único `docker compose up` (e `-d`, e `-d --wait` para esperar o portal responder), endereço `http://localhost:3000`, porta usada (3000, alterável por `PORT`, e o endereço público acompanha a porta) e a observação de que o banco não é exposto; seção **Variáveis de ambiente** com a tabela do contrato `contracts/execucao-e-verificacao.md` (nome, finalidade, padrão), deixando claro que nenhuma é obrigatória na 001 e que `JWT_SECRET` não tem padrão — Req: FR-001, FR-014, FR-015, SC-001; RNF06, RNF07, RP05. Just.: research R14
- [X] T021 [US1] Rodar `docker compose exec app node --test test/saude.test.js` e o cenário 1 do `quickstart.md` (`docker compose up -d --wait`, `docker compose ps` com `db` e `app` `healthy`, abrir `http://localhost:3000`, `curl -s localhost:3000/api/saude`); antes de T024 o caso (f) de T013 aparece como `skip`, o resto deve passar — corrigir até passar — Req: FR-001, FR-012, FR-013, SC-001; RNF07, RP05

**Checkpoint**: US1 funcional e demonstrável sozinha (portal no ar, banco conectado, README de instalação).

---

## Phase 4: User Story 2 - Encontrar o conteúdo inicial já carregado (Priority: P1)

**Goal**: na primeira subida o banco já tem 12 temas definitivos, 48 questões, 192
alternativas e materiais provisórios, com 60 imagens SVG servidas pelo portal, e uma
verificação que confere tudo.

**Independent Test**: `docker compose down -v && docker compose up -d --wait`, depois
`docker compose exec app npm run verificar-carga` termina com código 0, todas as regras `OK` e
`AVISO conteúdo provisório: 48 questões, 12 materiais e 60 imagens marcados com [PROVISÓRIO]`;
`select count(*) from tbquestao` retorna 48.

### Tests for User Story 2 ⚠️

- [ ] T022 [P] [US2] Escrever `app/test/verificacao-carga.test.js` com `node:test` contra o banco do Compose: (a) `verificarCarga()` não retorna nenhum item `ERRO`; (b) os itens `OK` cobrem as 8 regras do contrato (temas, nomes e descrição preenchida; 4 questões por tema com enunciado preenchido; 4 alternativas A–D; 1 correta; ≥ 1 material por tema; imagens exclusivas com texto alternativo; arquivos existentes; tabelas de uso); (c) existe um `AVISO` de conteúdo provisório com as contagens `questoes: 48`, `materiais: 12`, `imagens: 60`; (d) com uma pasta pública falsa sem arquivos (parâmetro de `verificarCarga`), a regra de arquivos vira `ERRO` listando `img/questoes/tema01-q1.svg`; (e) com uma função `consultar` falsa que responde pelo `nome` da consulta (um mapa `nome → linhas` montado a partir de `CONSULTAS`, sem olhar o SQL) e devolve uma descrição de tema e um enunciado só com espaços, as regras de texto preenchido viram `ERRO` citando o tema e a questão; (e2) o teste falha se `verificarCarga` pedir um `nome` que não esteja em `CONSULTAS`; (f) sem passar `pastaPublica`, o padrão aponta para `app/public` mesmo com `process.chdir()` para outro diretório — Req: FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-016, SC-002, SC-003; RP06, RF05, RF06, RF07, RF08, RP04

### Implementation for User Story 2

- [ ] T023 [P] [US2] Criar `app/scripts/gerar-svgs-provisorios.js` (ferramenta de desenvolvimento, não roda na subida): gera `app/public/img/questoes/temaNN-qK.svg` (NN = 01–12, K = 1–4, 48 arquivos) e `app/public/img/materiais/temaNN.svg` (12 arquivos), cada SVG com `viewBox="0 0 640 360"`, `<title>` descritivo, o nome do tema, a identificação da questão ou "Material", uma ilustração geométrica simples diferente por tema e uma faixa diagonal com o texto "PROVISÓRIO"; sem fontes ou imagens externas; caminhos de saída resolvidos a partir do script (`path.resolve(__dirname, '../public/img')`) — Req: FR-008, FR-009, FR-009a; RP06, RP04. Just.: research R6, R7
- [ ] T024 [US2] Rodar `node app/scripts/gerar-svgs-provisorios.js`, conferir visualmente 3 arquivos no navegador e versionar os 60 SVGs em `app/public/img/` (depende de T023) — Req: FR-005, FR-008, FR-009, FR-009a, SC-003; RP06, RP04
- [ ] T025 [P] [US2] Escrever à mão `db/02-seed-temas-materiais.sql` dentro de `begin; ... commit;`, com comentário de cabeçalho no padrão do `01-ddl.sql`: (1) `insert into tbtema (id, nome, descricao, ordem)` dos 12 temas com `id = ordem` e os nomes exatos de `data-model.md` (1 Fundamentos da Agilidade … 12 Qualidade em Projetos Ágeis), `nome varchar(80) not null unique`, `descricao varchar(500) not null` definitiva, não vazia e sem `[PROVISÓRIO]`, `check (ordem between 1 and 12)`; (2) `insert into tbimagem (id, arquivo, texto_alternativo, credito)` ids 101–112 com `arquivo` = `img/materiais/temaNN.svg` (`varchar(255) not null`, relativo a `app/public`, sem barra inicial), `texto_alternativo varchar(255) not null`, `credito` = `'[PROVISÓRIO] Autoria própria'`; (3) `insert into tbmaterial (id, idtema, titulo, conteudo, tipo, ordem)` um por tema, `titulo varchar(150) not null` começando com `[PROVISÓRIO]`, `conteudo` em Markdown simples sobre o tema, `tipo` = `'TEXTO'` (`check (tipo in ('TEXTO', 'VIDEO', 'LINK'))`), `ordem` = 1 (`unique (idtema, ordem)`); (4) `insert into tbmaterial_por_imagem` ligando o material do tema NN à imagem `100 + NN`; (5) `setval(pg_get_serial_sequence(...), (select max(id) ...))` para `tbtema`, `tbimagem` e `tbmaterial` — Req: FR-003, FR-004, FR-007, FR-008, FR-009, FR-009b; RF05, RF07, RP02, RP04. Just.: research R5, R6, R7
- [ ] T026 [US2] Escrever à mão `db/03-seed-questoes.sql` (início): `begin;`, cabeçalho explicando que o arquivo é provisório e será substituído inteiro pela carga definitiva sem mudar o esquema (FR-009b), e `insert into tbimagem (id, arquivo, texto_alternativo, credito)` ids 1–48 com `arquivo` = `img/questoes/temaNN-qK.svg`, `texto_alternativo varchar(255) not null` descrevendo a imagem e `credito` = `'[PROVISÓRIO] Autoria própria'` (depende de T025 só pela convenção de faixas de id) — Req: FR-003, FR-005, FR-008, FR-009, FR-009b; RP06, RP02, RP04. Just.: research R5
- [ ] T027 [US2] Continuar `db/03-seed-questoes.sql` com as questões e alternativas dos temas 1 a 4: `insert into tbquestao (id, idtema, idimagem, enunciado, justificativa)` com `id = (tema − 1) × 4 + K`, `idimagem = id` (`idimagem integer not null unique`), `enunciado` começando com `[PROVISÓRIO]` e coerente com o tema, `justificativa` curta; `insert into tbalternativa (id, idquestao, letra, texto, correta)` com ids `(Q − 1) × 4 + 1` a `+ 4`, letras `'A'`–`'D'` nessa ordem (`check (letra in ('A', 'B', 'C', 'D'))`, `unique (idquestao, letra)`), `texto varchar(500) not null` **sem** marca `[PROVISÓRIO]` (a alternativa é provisória porque a questão é, FR-009), exatamente uma `correta = true` por questão (índice `ux_alternativa_correta`) e letra correta variando entre as questões — Req: FR-003, FR-005, FR-006, FR-009; RP06, RF06, RF08, RP02
- [ ] T028 [US2] Continuar `db/03-seed-questoes.sql` com as questões e alternativas dos temas 5 a 8, mesmas regras de T027 (depende de T027) — Req: FR-003, FR-005, FR-006, FR-009; RP06, RF06, RF08, RP02
- [ ] T029 [US2] Concluir `db/03-seed-questoes.sql` com as questões e alternativas dos temas 9 a 12, mesmas regras de T027, os `setval` de `tbimagem`, `tbquestao` e `tbalternativa`, e `commit;` (depende de T028) — Req: FR-003, FR-005, FR-006, FR-009, SC-002; RP06, RF06, RF08, RP02. Just.: research R5
- [ ] T030 [US2] Criar `app/src/verificacao/verificar-carga.js` exportando `verificarCarga({ consultar, pastaPublica = path.resolve(__dirname, '../../public') })` (o módulo fica em `app/src/verificacao/`, então o padrão é `app/public` independentemente do diretório de trabalho; no container, `/app/public`) que retorna uma lista de itens `{ nivel: 'OK' | 'ERRO' | 'AVISO', mensagem, detalhes }`. Cada consulta é uma constante nomeada `{ nome, sql }` (ex.: `{ nome: 'contagemQuestoes', sql: '...' }`), reunidas e exportadas em `CONSULTAS`, e `consultar` recebe o objeto inteiro (`consultar({ nome, sql }, parametros)`), de modo que um `consultar` falso responde por `nome` sem interpretar SQL; no `cli.js`, o `consultar` real repassa só `sql` e `parametros` ao `pg`. SQL puro para cada regra da tabela "Regras garantidas pelo banco vs. pela verificação" de `data-model.md`: 12 temas com ordem 1–12, os 12 nomes oficiais e `trim(descricao) <> ''` (listar temas com descrição vazia); 4 questões por tema e `trim(enunciado) <> ''` (listar temas divergentes e questões com enunciado vazio); 4 alternativas por questão com letras A, B, C, D; pelo menos 1 correta por questão; ≥ 1 material por tema; imagem de questão exclusiva e `texto_alternativo` não vazio; cada `tbimagem.arquivo` existe em `pastaPublica` (via `fs`); tabelas `tbcandidato`, `tbcertificacao`, `tbcertificado`, `tbresposta` vazias (se não, `AVISO`, nunca `ERRO`); e **sempre** um `AVISO` com as contagens de questões (`enunciado`), materiais (`titulo`) e imagens (`credito`) que começam com `[PROVISÓRIO]`, que só some quando as três forem zero — Req: FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-016, SC-002, SC-003; RP06, RF05, RF06, RF07, RF08, RP04. Just.: research R8, R11
- [ ] T031 [US2] Criar `app/src/verificacao/cli.js`: chama `verificarCarga` com um `consultar` que adapta o `Pool` de `app/src/db.js` (`({ sql }, parametros) => pool.query(sql, parametros)`), imprime uma linha por item no formato do contrato (`OK    ...`, `ERRO  ...`, `AVISO ...`, com `detalhes` indentados abaixo dos erros) e sai com código `0` sem `ERRO`, `1` com algum `ERRO` e `2` se não conectar ao banco; fecha o `Pool` ao terminar (depende de T030) — Req: FR-016. Just.: research R11
- [ ] T032 [US2] Rodar `docker compose down -v && docker compose up -d --build --wait`, `docker compose exec app npm run verificar-carga`, `docker compose exec app npm test` e o cenário 2 do `quickstart.md`; corrigir seeds ou SVGs até a verificação sair com código 0, a saída bater com o exemplo do contrato, `/api/saude` mostrar `cargaCompleta: true` e `npm test` terminar com **zero** testes `skip` (o caso (f) de T013 precisa rodar e passar) — Req: FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-016, SC-002, SC-003; RP06, RNF07, RP02, RP04

**Checkpoint**: US1 e US2 funcionando; `/api/saude` mostra 12 / 48 / 192 / 12, `provisorio: true` e `cargaCompleta: true`.

---

## Phase 5: User Story 3 - Dados preservados entre reinicializações (Priority: P2)

**Goal**: dados gravados sobrevivem a parar/subir; a carga não se repete; o README explica
reset, o aviso sobre seeds e o acesso opcional ao banco.

**Independent Test**: cenário 3 do `quickstart.md`: inserir um candidato de teste (senha como
hash bcrypt fixo de exemplo), fazer 3 ciclos `docker compose down && docker compose up -d
--wait`, e o registro continua lá com contagens 12 / 48 / 192.

### Implementation for User Story 3

- [ ] T033 [P] [US3] Criar `docker-compose.override.example.yml` na raiz com comentário de uso (copiar para `docker-compose.override.yml`) e apenas `services: db: ports: ["127.0.0.1:5433:5432"]` — Req: FR-014 (caso-limite de porta ocupada). Just.: research R4
- [ ] T034 [US3] Acrescentar ao `README.md` a seção **Operação**: parar mantendo dados (`docker compose down`); reconstruir após mudar código (`docker compose up --build`); recriar o banco do zero (`docker compose down -v`) com aviso explícito de que **apaga todos os dados**; aviso de que alterações em `db/*.sql` só têm efeito depois de recriar o banco (FR-014a); o que fazer se a primeira carga falhar ou a página mostrar "Carga incompleta" (`down -v`, research R3); como rodar `npm run verificar-carga`, `npm test` e um único arquivo de teste (`node --test test/saude.test.js`) no container; e a subseção **Acesso ao banco por cliente SQL** com o passo a passo do override em `127.0.0.1:5433` — Req: FR-010, FR-011, FR-013, FR-014, FR-014a, FR-016; RNF06. Just.: research R3, R4
- [ ] T035 [US3] Executar os cenários 3, 4 e 6 do `quickstart.md` (persistência em 3 ciclos com `up -d --wait` em ≤ 1 minuto, medido até o healthcheck do `app` passar; reset com `down -v`; override abrindo só `127.0.0.1:5433`) e registrar o resultado — Req: FR-010, FR-011, FR-014, FR-014a, SC-004, SC-005; RNF07, RP05

**Checkpoint**: as três histórias funcionam de forma independente.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: validação final da feature e Definition of Done.

- [ ] T036 Conferir se o Node 26 já virou LTS (research R1); se sim, trocar a tag em `app/Dockerfile` e `engines` em `app/package.json` e repetir T032 — Just.: research R1
- [ ] T037 [P] Executar o cenário 5 do `quickstart.md` (carga com erro em cópia local e nova subida sem `-v` mostrando `cargaCompleta: false` e "Carga incompleta" na página; `PORT=3100` com o log mostrando `http://localhost:3100`; `docker compose stop db` → `/api/saude` 503 e `app` `unhealthy` → `start db` → 200 e `healthy`) — Req: FR-012, FR-013, FR-014, FR-015; RNF07. Just.: research R3, R9, R15
- [ ] T038 Validação de clone limpo: clonar o repositório em uma pasta nova (ou `git clone` do próprio repositório local), sem `.env` nem override, cronometrar o cenário 1 seguindo só o README (SC-001, ≤ 10 min) e rodar o cenário 2 — Req: FR-001, FR-014, FR-015, SC-001, SC-002, SC-003; RNF06, RNF07, RP05. Just.: constituição, DoD item 3
- [ ] T039 Autoverificação da DoD (constituição 2.0.2): conferir explicitamente os Princípios I (`/api/saude` não expõe dado de prova), III (sem ORM, SQL escrito à mão, `db/01-ddl.sql` intocado, consultas parametrizadas), IV (nenhum dado derivado gravado; `cargaCompleta` calculado na hora) e VI (carga sem dado pessoal; candidato de teste do quickstart só com hash bcrypt), além de `JWT_SECRET` sem padrão (research P1); `docs/openapi.yaml` atualizado; testes passando — Just.: constituição, DoD itens 1, 2 e 4 (Autoverificação)
- [ ] T040 Marcar como atendidos pela feature 001, nas issues do GitHub do repositório geradas pelo `/speckit-taskstoissues` (o backlog do projeto), os requisitos RNF07, RP02, RP04, RP05, RP06 e RNF06 (instalação), citando o PR da feature — Req: RNF07, RP02, RP04, RP05, RP06, RNF06. Just.: constituição, DoD item 5, Princípio VIII

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende do Setup; bloqueia todas as histórias.
- **US1 (Phase 3)** e **US2 (Phase 4)**: dependem só da Fase 2; podem andar em paralelo.
- **US3 (Phase 5)**: depende da Fase 2; T034 edita o `README.md` criado em T020 (US1). A
  validação T035 fica mais significativa com os seeds da US2, mas funciona com banco vazio.
- **Polish (Phase 6)**: depois das três histórias.

### User Story Dependencies

- **US1 (P1)**: nenhuma outra história. Com banco vazio, `/api/saude` responde com contagens 0
  e `cargaCompleta: false`. O caso (f) de T013 (imagem servida) fica em `skip` até os SVGs de T024 existirem; T032 exige que ele rode e passe.
- **US2 (P1)**: nenhuma outra história; `verificar-carga` e os seeds não dependem da página
  inicial.
- **US3 (P2)**: só do `README.md` da US1 (mesmo arquivo).

### Within Each User Story

- Testes (T013, T022) escritos e falhando antes da implementação.
- US1: repositório (T014) → rota (T015); front (T016–T018) em paralelo; README (T020) → validação (T021).
- US2: SVGs (T023 → T024) e seed `02` (T025) em paralelo; seed `03` em sequência (T026 → T029,
  mesmo arquivo); verificação (T030 → T031); validação (T032) por último.

### Parallel Opportunities

- Setup: T003, T004, T005.
- Foundational: T008, T009, T010 (depois T011 → T012).
- US1: T013, T014, T016, T017, T018, T019.
- US2: T022, T023, T025 (e T030 em paralelo com os seeds).
- US1 e US2 inteiras em paralelo após a Fase 2.

---

## Parallel Example: User Story 1

```bash
Task: "Escrever app/test/saude.test.js (T013)"
Task: "Criar app/src/repositories/conteudo-repository.js (T014)"
Task: "Criar app/public/index.html (T016)"
Task: "Criar app/public/css/estilo.css (T017)"
Task: "Criar app/public/js/inicio.js (T018)"
Task: "Criar docs/openapi.yaml (T019)"
```

## Parallel Example: User Story 2

```bash
Task: "Escrever app/test/verificacao-carga.test.js (T022)"
Task: "Criar app/scripts/gerar-svgs-provisorios.js (T023)"
Task: "Escrever db/02-seed-temas-materiais.sql (T025)"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Fase 1 (Setup) e Fase 2 (Foundational).
2. Fase 3 (US1): portal no ar com um comando e README de instalação.
3. **Parar e validar** com T021 / cenário 1 do quickstart.

### Incremental Delivery

1. Setup + Foundational → infraestrutura pronta.
2. US1 → portal no ar (MVP desta feature).
3. US2 → conteúdo provisório completo e verificação (destrava as features 003 e 004).
4. US3 → operação, reset e acesso opcional ao banco documentados.
5. Polish → clone limpo cronometrado e DoD.

### Commits sugeridos (mantenedor único)

Um commit por grupo lógico, citando requisitos: setup/compose (RNF07, RP05), US1 (RNF06),
SVGs (RP04), seed 02, seed 03 (RP02, RF06, RF08), verificação, US3 (RNF06).

---

## Notes

- [P] = arquivos diferentes, sem dependência pendente.
- Os seeds são SQL escrito à mão (Princípio III, research R6); só os SVGs são gerados por script.
- `db/01-ddl.sql` não pode ser alterado nesta feature; divergência vira item de decisão.
- Toda mudança em `db/*.sql` exige `docker compose down -v` para ter efeito.
