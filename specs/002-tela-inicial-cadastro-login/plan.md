# Implementation Plan: Tela Inicial, Cadastro e Login

**Branch**: `002-tela-inicial-cadastro-login` | **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-tela-inicial-cadastro-login/spec.md`

**Requisitos**: RF01, RF02, RF03, RF04, RNF01, RNF03. Texto integral em
`docs/requisitos-desafio.md`.

## Summary

Transformar a página de status da 001 na tela inicial da certificação, com a identidade visual
lunar (tokens, fontes locais, Lua em SVG), e criar cadastro, login, termos, área do candidato e
páginas "em breve" para os recursos das features 003 a 005. O back-end ganha as camadas
`controllers`/`services`/`middlewares` e a autenticação: CPF validado em um módulo único
compartilhado com o front, senha com `bcrypt` (limite de 72 bytes conferido), sessão JWT em
cookie `HttpOnly`/`SameSite=Lax` amarrada ao cadastro, checagem de `Origin` contra CSRF, bloqueio
por CPF em memória e limite folgado por rede. O segredo da sessão é gerado na primeira subida e
guardado em volume próprio, sem valor padrão versionado (pendência P1 da 001). O esquema não
muda. README e quickstart da 001 passam a descrever a nova tela inicial.

## Technical Context

**Language/Version**: Node.js 24 LTS (`node:24-bookworm-slim`), SQL PostgreSQL 16,
HTML/CSS/JS puros no front (sem mudança desde a 001).

**Primary Dependencies**: `express` 5 e `pg` 8 (001) + `bcrypt` 6.0.0, `jsonwebtoken` 9.0.3,
`cookie-parser` 1.4.7, `helmet` 8.3.0, `express-rate-limit` 8.7.0 (research R1). Dev: `supertest`.
Fontes Sora e Source Sans 3 (OFL 1.1) em `.woff2`, sem dependência npm (R10).

**Storage**: PostgreSQL 16, tabela `tbcandidato` do esquema oficial (sem mudança); volume novo
`segredo_sessao` para o segredo da sessão (R4); contadores de tentativas em memória (R6).

**Testing**: `node:test` + `supertest` no container do app, contra o banco do Compose; casos que
gravam rodam em transação desfeita (R12); `bcrypt` com custo 4 nos testes.

**Target Platform**: a mesma da 001 (Docker Engine ≥ 20.10, Compose ≥ v2.2.1); navegadores
atuais, de celular a computador.

**Project Type**: aplicação web (API + páginas estáticas na mesma origem).

**Performance Goals**: cadastro em até 2 min e login em até 30 s do ponto de vista do usuário
(SC-002, SC-003); `bcrypt` custo 12 leva poucas centenas de milissegundos.

**Constraints**: um único `docker compose up`, sem `.env`; nenhum recurso externo (fontes,
imagens, scripts); CSP restrita a `'self'`; contraste AA; sem ORM; sem CORS; nenhum dado pessoal
ou senha em log.

**Scale/Scope**: 6 páginas (inicial, cadastro, entrar, termos, candidato, em breve), 4 endpoints
de autenticação, uso de sala de aula (dezenas de candidatos simultâneos).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|---|---|---|
| I. Servidor é a autoridade | Identidade decidida pelo servidor a cada requisição: JWT assinado, conferido com `id` + `data_cadastro` no banco (R2); CPF, senha e limites validados no back mesmo que o front valide antes (R9). Nenhuma regra de prova nesta feature. | ✅ |
| II. Front sem frameworks, mobile-first | Páginas HTML estáticas, CSS próprio a partir de `tokens.css`, JS puro; nenhuma biblioteca de UI; Lua e estrelas em SVG/CSS próprios; layout pensado primeiro para 320 px. | ✅ |
| III. PostgreSQL, SQL explícito, sem ORM | Três consultas escritas à mão e parametrizadas em `candidato-repository.js`; `db/01-ddl.sql` intocado; unicidade do CPF garantida pelo `unique` do esquema. | ✅ |
| IV. Dados derivados não armazenados | Nada derivado é gravado; "primeiro nome" é calculado na resposta. | ✅ |
| V. `docker compose up` único | Segredo da sessão gerado na primeira subida e persistido em volume; `JWT_SECRET` opcional; nenhum passo manual (R4). | ✅ |
| VI. LGPD e minimização | Só CPF, nome, e-mail e senha; senha só como hash `bcrypt`; aceite dos termos com data e hora; nada pessoal em log (R14); `me` devolve só o nome; CPF mascarado/e-mail oculto continuam regra da validação pública (005). | ✅ |
| VII. Escopo de MVP | Sem edição de perfil e sem recuperação de senha; limites de tentativas e CSRF são proteção do próprio login (RF04, RNF03), não extras. | ✅ |
| VIII. Rastreabilidade | Spec, plano e tarefas citam RF01–RF04, RNF01, RNF03 e os FR da spec. | ✅ |
| IX. Testes de regras críticas | As regras críticas listadas (sorteio, 150 s, nota, certificado) não estão nesta feature; cadastro, login, sessão e bloqueios terão testes automatizados mesmo assim. | ✅ |
| X. Padrões (2.0.2) | Identificadores, mensagens e textos em português; nomes estruturais da stack (`controllers/`, `services/`, `middlewares/`) conforme a emenda 2.0.2. | ✅ |
| DoD / API | Quatro endpoints novos documentados em `docs/openapi.yaml` a partir de `contracts/api-auth.openapi.yaml`. | ✅ |

**Resultado pré-pesquisa**: aprovado, sem violações.
**Re-check pós-design (Fase 1)**: aprovado. Pontos de atenção registrados, sem violação: contador
de tentativas em memória (some ao reiniciar o app; aceito no MVP, R6) e o limite por rede que,
no Docker Desktop, pode valer para a sala inteira por causa do IP único (R6, medido no cenário 5
do quickstart).

## Project Structure

### Documentation (this feature)

```text
specs/002-tela-inicial-cadastro-login/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-auth.openapi.yaml
│   └── paginas-e-sessao.md
├── checklists/
│   └── requirements.md
└── tasks.md              # /speckit-tasks
```

### Source Code (repository root)

```text
/
├── docker-compose.yml            # app: volume segredo_sessao e JWT_SECRET opcional
├── .env.example                  # JWT_SECRET: comentário sobre geração automática
├── README.md                     # nova tela inicial, variáveis, efeito do down -v nas sessões
├── docs/openapi.yaml             # + /api/auth/*
├── scripts/validar-002.sh        # validação em clone limpo (DoD item 3), no modelo do validar-001.sh
├── specs/001-base-executavel/quickstart.md   # cenários 1 e 5: estado no rodapé (FR-004a)
└── app/
    ├── Dockerfile                # cria /app/segredo com dono node antes do USER node
    ├── package.json              # + bcrypt, jsonwebtoken, cookie-parser, helmet, express-rate-limit
    ├── src/
    │   ├── app.js                # helmet, cookies, JSON, páginas, rotas de API, erros
    │   ├── server.js             # carrega o segredo antes do listen
    │   ├── config.js             # + cookieSeguro (PUBLIC_BASE_URL em https), pastaSegredo (PASTA_SEGREDO)
    │   ├── db.js
    │   ├── seguranca/
    │   │   ├── segredo-sessao.js # JWT_SECRET > arquivo > geração (R4)
    │   │   └── sessao.js         # emitir, ler e encerrar a sessão (R2)
    │   ├── middlewares/
    │   │   ├── verificar-origem.js   # Origin / Sec-Fetch-Site / JSON (R3)
    │   │   ├── exigir-sessao.js      # API: 401; páginas: redireciona (R8)
    │   │   └── limite-rede.js        # express-rate-limit, 60 falhas/min por IP, login e cadastro (R6)
    │   ├── validacao/
    │   │   └── cadastro.js           # nome, e-mail, senha (caracteres e bytes) e termos
    │   ├── services/
    │   │   ├── autenticacao-service.js   # cadastrar, entrar (bcrypt, hash fictício)
    │   │   └── tentativas-login.js       # bloqueio por CPF em memória (R6)
    │   ├── controllers/
    │   │   └── auth-controller.js        # HTTP <-> serviços, códigos e mensagens
    │   ├── repositories/
    │   │   ├── conteudo-repository.js    # (001)
    │   │   └── candidato-repository.js   # inserir, buscar por CPF, buscar por id (data comparada em JS, R2)
    │   ├── routes/
    │   │   ├── saude.js                  # (001)
    │   │   ├── auth.js                   # /api/auth/*
    │   │   └── paginas.js                # *.html → URL limpa, redirecionamentos, em breve (R8)
    │   └── verificacao/                  # (001)
    ├── public/
    │   ├── index.html            # tela inicial (substitui a página de status da 001)
    │   ├── cadastro.html  entrar.html  termos.html  candidato.html  em-breve.html
    │   ├── css/
    │   │   ├── tokens.css        # cores, fontes, espaçamentos (docs/identidade-visual.md)
    │   │   └── base.css          # base, céu, Lua, botões, formulários, alertas, rodapé
    │   ├── fonts/                # sora-latin-wght-normal.woff2, source-sans-3-latin-wght-normal.woff2, licenças OFL
    │   ├── img/                  # (001) questoes/, materiais/; + lua.svg se não for inline
    │   └── js/
    │       ├── compartilhado/cpf.js  # usado pelo navegador e pelo Node (R9)
    │       ├── api.js            # fetch JSON com tratamento de erros e campos
    │       ├── rodape.js         # estado do portal e alertas (FR-004a)
    │       ├── cadastro.js  entrar.js  candidato.js  em-breve.js
    │       └── (inicio.js e css/estilo.css da 001 são substituídos)
    └── test/
        ├── saude.test.js  verificacao-carga.test.js   # (001)
        ├── apoio.js                       # transação desfeita e criarApp de teste (R12)
        ├── cpf.test.js                    # validação compartilhada
        ├── cadastro.test.js  login.test.js            # supertest + transação desfeita
        ├── sessao.test.js                 # cookie, 8 h, amarração ao cadastro, saída
        ├── tentativas.test.js             # bloqueio por CPF e limite por rede
        ├── segredo-sessao.test.js         # prioridade, geração, permissão, mínimo de 32
        └── paginas.test.js                # redirecionamentos, no-store, em breve, CSP, origem
```

**Structure Decision**: o projeto único em `app/` da 001 continua, agora com as camadas completas
da seção 5 do dossiê (`routes` → `controllers` → `services` → `repositories`), que a 001 adiou até
a primeira regra de negócio (R13). As páginas continuam estáticas e na mesma origem da API;
`criarApp()` passa a receber as dependências (consultar, segredo, custo do `bcrypt`, relógio),
o que permite testar com transação desfeita e tempo controlado.

## Complexity Tracking

Nenhuma violação da constituição a justificar.

## Riscos e decisões abertas

- **Docker Desktop e IP único (R6)**: o limite por rede pode virar limite da sala inteira; ele é
  folgado e só conta falhas (60/min, sucessos não contam), e o cenário 5 do quickstart mede o
  comportamento real.
- **Contador por CPF em memória (R6)**: reiniciar o app libera bloqueios em curso; aceitável no
  MVP, a revisar se houver mais de um processo.
- **Texto dos termos de uso**: escrito pela equipe, sem revisão jurídica (Assumptions da spec);
  pode ser revisto pelo professor sem impacto técnico.
- **Decisões D1, D5, D6 e D8 do dossiê**: a tela inicial e a confirmação de início refletem os
  padrões assumidos (uma certificação por candidato, sem edição de perfil, recarregar encerra
  a questão, estudos sem login); se o professor mudar alguma, muda o texto, não o desenho.
