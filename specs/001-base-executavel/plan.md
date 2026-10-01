# Implementation Plan: Base Executável do Portal

**Branch**: `001-base-executavel` | **Date**: 2026-09-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-base-executavel/spec.md`

**Requisitos**: RNF07, RP02, RP04, RP05, RP06, RNF06; apoio a RF06 e RF08.

## Summary

Subir o portal inteiro com `docker compose up` a partir de um clone limpo. Dois serviços: `db`
(PostgreSQL 16, imagem oficial, volume nomeado, healthcheck por TCP) e `app` (Node 24 LTS +
Express 5, servindo a API em `/api` e o front estático em `/`). Na primeira subida, o banco
executa `db/01-ddl.sql` (esquema oficial, sem mudanças) e dois seeds SQL escritos à mão: os 12
temas definitivos com materiais provisórios, e 48 questões / 192 alternativas provisórias
ligadas a SVGs de autoria própria em `app/public/img/`. Um módulo de verificação confere a
carga (contagens, regras e arquivos de imagem), avisa quantas questões, materiais e imagens
ainda estão marcados como `[PROVISÓRIO]` e roda como comando e como teste `node:test`.
O README documenta instalação, variáveis, reset e o aviso de que mudar seed exige recriar o
banco.

## Technical Context

**Language/Version**: Node.js 24 LTS (imagem `node:24-bookworm-slim`); SQL PostgreSQL 16;
HTML/CSS/JS puros no front.

**Primary Dependencies**: `express` 5, `pg` 8 (SQL puro, sem ORM). Dev: `supertest`.

**Storage**: PostgreSQL 16 (`postgres:16`), volume nomeado `dados_banco`; imagens como
arquivos em `app/public/img/` com caminho em `tbimagem.arquivo` (padrão D7).

**Testing**: `node:test` + `supertest`, executados no container do app contra o banco do
Compose (`docker compose exec app npm test`).

**Target Platform**: Linux, macOS ou Windows com Docker Engine/Desktop e Compose v2.

**Project Type**: aplicação web (API + front estático no mesmo processo, mesma origem).

**Performance Goals**: portal no ar em ≤ 10 min seguindo o README (SC-001); volta a responder
em ≤ 1 min após reinício com banco existente (SC-005).

**Constraints**: um único comando, sem `.env` obrigatório; sem ORM; seed escrito à mão;
esquema oficial intocado; por padrão nenhuma porta do banco publicada no host (acesso
opcional só em `127.0.0.1:5433` via override).

**Scale/Scope**: 12 temas, 48 questões, 192 alternativas, ≥ 12 materiais, 60 imagens SVG;
uso local para desenvolvimento e banca.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|---|---|---|
| I. Servidor é a autoridade | Nenhuma regra de prova nesta feature. `/api/saude` não expõe alternativa correta, só contagens. | ✅ |
| II. Front sem frameworks, mobile-first | `index.html` + CSS + JS puros, layout mobile-first; nenhuma biblioteca de UI. | ✅ |
| III. PostgreSQL, SQL explícito, sem ORM | `pg` com SQL puro; seeds escritos à mão (research R6); consultas da verificação sem dados externos, e as que vierem a ter, parametrizadas; `db/01-ddl.sql` carregado sem mudanças. | ✅ |
| IV. Dados derivados não armazenados | Nenhuma coluna nova; contagens calculadas na hora. | ✅ |
| V. `docker compose up` único | Núcleo da feature: initdb + healthcheck + `depends_on: service_healthy` + padrões `${VAR:-…}`. O override de acesso ao banco é opcional e não entra no comando único. | ✅ |
| VI. LGPD | Carga não contém dados pessoais; tabelas de uso nascem vazias e a verificação confere. | ✅ |
| VII. Escopo de MVP | Base para todo o MVP; nenhum extra (painel, PDF, recuperação de senha). Dependências não usadas adiadas (research R13). | ✅ |
| VIII. Rastreabilidade | Requisitos citados na spec, neste plano e a citar nas tarefas/commits. | ✅ |
| IX. Testes de regras críticas | Regras críticas (sorteio, 150 s etc.) não estão nesta feature; a verificação da carga tem teste automatizado. | ✅ |
| X. Padrões | Identificadores, arquivos e mensagens em português; esquema já segue `tbxxx`/`id`/`idtabela`. | ✅ |
| DoD / API | Endpoint novo `/api/saude` documentado em `docs/openapi.yaml`. | ✅ |

**Resultado pré-pesquisa**: aprovado, sem violações.
**Re-check pós-design (Fase 1)**: aprovado. Pontos de atenção registrados, sem violação:
seed com IDs explícitos e `setval` (R5) e a armadilha de carga parcial do initdb (R3),
mitigada por transação por arquivo + `down -v` documentado.

## Project Structure

### Documentation (this feature)

```text
specs/001-base-executavel/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-saude.openapi.yaml
│   └── execucao-e-verificacao.md
├── checklists/
│   └── requirements.md
└── tasks.md              # /speckit-tasks (ainda não criado)
```

### Source Code (repository root)

```text
/
├── docker-compose.yml            # serviços db e app, volume dados_banco
├── docker-compose.override.example.yml   # opcional: banco em 127.0.0.1:5433
├── .env.example                  # PORT, PUBLIC_BASE_URL, DATABASE_URL, JWT_SECRET (vazio), POSTGRES_*
├── .gitignore                    # .env, node_modules/, pgdata/ + docker-compose.override.yml
├── .dockerignore                 # node_modules, .git, specs, docs
├── README.md                     # instalação (FR-014, FR-014a)
├── docs/
│   ├── dossie-sdd-borb.md
│   ├── openapi.yaml              # novo: /api/saude
│   └── modelagem/
├── db/                           # montado em /docker-entrypoint-initdb.d (somente leitura)
│   ├── 01-ddl.sql                # oficial, sem mudanças
│   ├── 02-seed-temas-materiais.sql
│   └── 03-seed-questoes.sql
└── app/
    ├── Dockerfile
    ├── package.json              # scripts: start, test, verificar-carga
    ├── package-lock.json
    ├── src/
    │   ├── server.js             # sobe o Express na PORT
    │   ├── app.js                # monta static, rotas e 404 JSON (testável sem listen)
    │   ├── config.js             # lê variáveis de ambiente com padrões
    │   ├── db.js                 # Pool do pg
    │   ├── routes/
    │   │   └── saude.js          # GET /api/saude
    │   ├── repositories/
    │   │   └── conteudo-repository.js   # contagens (SQL puro)
    │   └── verificacao/
    │       ├── verificar-carga.js       # regras da carga + arquivos (research R11)
    │       └── cli.js                   # saída OK/ERRO/AVISO e código de saída
    ├── scripts/
    │   └── gerar-svgs-provisorios.js    # ferramenta de dev; saída commitada
    ├── public/
    │   ├── index.html
    │   ├── css/estilo.css
    │   ├── js/inicio.js
    │   └── img/
    │       ├── questoes/         # tema01-q1.svg … tema12-q4.svg (48)
    │       └── materiais/        # tema01.svg … tema12.svg (12)
    └── test/
        ├── verificacao-carga.test.js
        └── saude.test.js
```

**Structure Decision**: estrutura da seção 5 do dossiê, um único projeto Node em `app/` que
serve API e front estático na mesma origem. Camadas `routes → repositories` nesta feature;
`controllers/`, `services/` e `middlewares/` são criados quando a primeira regra de negócio
aparecer (feature 002), para não deixar pastas vazias. `app.js` separado de `server.js`
permite testar com `supertest` sem abrir porta.

## Complexity Tracking

Nenhuma violação da constituição a justificar.

## Riscos e decisões abertas

- **D7 (imagem em arquivo vs. no banco)** e **D3 (quais 12 temas)** seguem o padrão do dossiê
  e ainda precisam de confirmação do professor. Se D7 mudar, mudam `tbimagem` e a forma de
  servir imagens.
- **Carga parcial do initdb** (research R3): coberta por transação por arquivo, verificação
  e `down -v` no README.
- **`JWT_SECRET` sem valor padrão** (research P1): pendência da feature 002, em tensão com o
  Princípio V; não afeta a 001, que não usa a variável.
- **Node 26** pode virar LTS durante a Sprint 1: conferir no `/speckit-implement` (R1).
