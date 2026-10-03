# Implementation Plan: Tela Inicial, Cadastro e Login

**Branch**: `002-tela-inicial-cadastro-login` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-tela-inicial-cadastro-login/spec.md`

**Requisitos**: RF01, RF02, RF03, RF04, RNF01, RNF03; telas 1 a 6 de `docs/telas.md`. Plano gerado
do zero em 2026-10-03, a partir da spec atual (constituição 3.0.1, identidade visual 2.0, kit de
interface 1.1, protótipo em `docs/prototipo/` como fonte da verdade); substitui o plano de
2026-10-01, que estava desatualizado.

## Summary

Trocar a página de status da 001 pelas seis telas da feature, portadas do protótipo com o kit de
interface: tela inicial (apresentação, regras e instruções da certificação), criar conta, entrar,
área do candidato no estado "não iniciada", termos de uso e privacidade e a página "Disponível em
breve" com as variações dos recursos ainda não entregues. O back-end ganha as camadas
`controllers`, `services`, `middlewares`, `seguranca` e `validacao`, e a autenticação: CPF
validado num módulo compartilhado com o front, senha com `bcrypt` (limite de 72 bytes conferido),
sessão JWT em cookie `HttpOnly` amarrada ao cadastro, checagem de origem contra CSRF, bloqueio por
CPF em memória e limite folgado por rede. O segredo da sessão é gerado na primeira subida e
guardado num volume próprio, sem valor padrão versionado. Uma tabela única de destinos provisórios
liga os endereços das features 003 a 007 à página "Disponível em breve". Enquanto o e-mail do
projeto não existir, os termos trazem um marcador: os testes comuns avisam em destaque e a
verificação de clone limpo, obrigatória para publicar, falha. O esquema não muda.

## Technical Context

**Language/Version**: Node.js 24 LTS (`node:24-bookworm-slim`), SQL PostgreSQL 16, HTML, CSS e
JavaScript puros no front (sem mudança desde a 001).

**Primary Dependencies**: `express` 5 e `pg` 8 (001) + `bcrypt` 6.0.0, `jsonwebtoken` 9.0.3,
`cookie-parser` 1.4.7, `helmet` 8.3.0 e `express-rate-limit` 8.7.0 (research R1). Dev:
`supertest` (001). Front: só o kit de interface do projeto (`app/public/kit`, versão 1.2 nesta
feature), sem nenhuma biblioteca de terceiros.

**Storage**: PostgreSQL 16, tabela `tbcandidato` do esquema oficial, sem mudança de esquema;
volume novo `segredo_sessao` para o segredo da sessão (R4); contadores de tentativas em memória
(R6).

**Testing**: `node:test` + `supertest` no container do app, contra o banco do Compose; casos que
gravam rodam em transação desfeita (R16); `bcrypt` com custo 4 nos testes; relógio injetado para
as 8 horas da sessão e os 15 minutos do bloqueio; testes estáticos das páginas (CSP, R7) e do
marcador dos termos (R15). Verificação de clone limpo em `scripts/validar-002.sh` (R19).

**Target Platform**: a mesma da 001 (Docker Engine 20.10+, Compose v2.2.1+, com ou sem Buildx);
navegadores atuais, de celular (360 px) a computador (1920 px).

**Project Type**: aplicação web (API e páginas estáticas na mesma origem, servidas pelo Express).

**Performance Goals**: cadastro em até 2 minutos e login em até 30 segundos do ponto de vista do
usuário (SC-002, SC-003); `bcrypt` com custo 12 leva poucas centenas de milissegundos; 30 pessoas
entrando no mesmo minuto pela mesma rede sem bloqueio (SC-009).

**Constraints**: um único `docker compose up`, sem `.env` (Princípio V); nenhum recurso externo
(FR-028); CSP restrita a `'self'`, sem JavaScript inline nem atributo `style` (R7); contraste AA,
foco visível, alvos de 44 px e menos movimento (FR-027); sem ORM; sem CORS; nenhum dado pessoal
nem senha em log (R18); `Dockerfile` sem recursos exclusivos do BuildKit (R4).

**Scale/Scope**: 6 telas (1 a 6 de `docs/telas.md`), 4 endpoints de autenticação, 5 destinos
provisórios, uso de sala de aula (dezenas de candidatos ao mesmo tempo).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Avaliação | Status |
|---|---|---|
| I. Servidor é a autoridade | Identidade decidida pelo servidor a cada pedido: JWT assinado, conferido com `id` e `data_cadastro` no banco (R2); CPF, nome, e-mail, senha, aceite e limites validados no back mesmo que o front valide antes (R10, R11). Nenhuma regra de prova nesta feature. | ✅ |
| II. Front sem bibliotecas de terceiros, mobile-first | Páginas HTML estáticas com o kit do projeto, JavaScript puro em arquivos `.js` com `addEventListener`; nada de CDN (fontes, imagens e scripts do próprio projeto); CSP que bloqueia script inline e atributo `style` (R7); layout a partir de 360 px. | ✅ |
| III. PostgreSQL com SQL explícito | Três consultas escritas à mão e parametrizadas em `candidato-repository.js`; `db/01-ddl.sql` sem mudança; unicidade do CPF pelo `unique` do esquema. | ✅ |
| IV. Dados derivados não são armazenados | Nada derivado é gravado; o primeiro nome e a Lua "0 de 12" são calculados. | ✅ |
| V. Comando único | Segredo gerado na primeira subida e guardado em volume; `JWT_SECRET` opcional; nenhum passo manual (R4); verificação de clone limpo obrigatória para publicar (R19). | ✅ |
| VI. LGPD e minimização | Só CPF, nome, e-mail e senha; senha só como hash `bcrypt`; aceite com data e hora; nada pessoal em log (R18); `me` devolve só o nome; contato pelo e-mail exclusivo do projeto, nunca pelas issues; termos não publicados com o marcador (FR-012a, FR-012b). | ⚠ P-01 em aberto: bloqueia a publicação, não o plano |
| VII. Escopo do site final e ordem de entrega | Primeira das features obrigatórias; os caminhos para 003 a 007 levam à página "Disponível em breve" (R9) e os trechos que dependem delas ficam fora do HTML (FR-050); sem recuperação de senha nem edição de perfil. | ✅ |
| VIII. Rastreabilidade | Plano, contratos e tarefas citam RF01 a RF04, RNF01, RNF03, as telas 1 a 6 e os FR da spec. | ✅ |
| IX. Testes das regras críticas | Nenhuma das regras críticas (sorteio, 150 s, resposta única, nota, certificado) está nesta feature; cadastro, login, sessão, bloqueios, páginas e marcador dos termos têm testes mesmo assim (R16). | ✅ |
| X. Padrões | Identificadores, mensagens e textos em português; nomes estruturais da stack (`controllers/`, `services/`, `middlewares/`). | ✅ |
| XI. Interface fiel e acessível | Seis telas portadas do protótipo com o kit e as correções da identidade visual; kit 1.2 com classes por corpo celeste e estado do portal (R12, R14); AA, foco, 44 px e menos movimento. | ✅ |
| DoD | Endpoints novos documentados em `docs/openapi.yaml` a partir de `contracts/api-auth.openapi.yaml`; clone limpo pelo `validar-002.sh`; autoverificação dos Princípios I, III, IV e VI antes do merge. | ✅ |

**Resultado pré-pesquisa**: aprovado; a única ressalva é a P-01, que a própria spec trata como
bloqueio da publicação (FR-012a e FR-012b).

**Re-check pós-design (Fase 1)**: aprovado, sem violação. Pontos de atenção registrados em
"Riscos e dependências": contador de tentativas em memória, limite por rede no Docker Desktop,
token copiado válido até expirar e a adequação do kit à CSP (classes por corpo).

## Project Structure

### Documentation (this feature)

```text
specs/002-tela-inicial-cadastro-login/
├── plan.md              # este arquivo
├── research.md          # Fase 0 (R1 a R20)
├── data-model.md        # Fase 1
├── quickstart.md        # Fase 1: roteiro de validação
├── contracts/
│   ├── api-auth.openapi.yaml    # endpoints de autenticação
│   └── paginas-e-sessao.md      # páginas, destinos provisórios, sessão, proteções, mensagens
├── checklists/
│   └── requirements.md
├── validacao.md         # registro das validações do mantenedor (criado na implementação)
└── tasks.md             # /speckit-tasks (o atual é da versão anterior e será regenerado)
```

### Source Code (repository root)

```text
/
├── docker-compose.yml            # app: volume segredo_sessao e JWT_SECRET opcional
├── .env.example                  # JWT_SECRET: comentário sobre a geração automática
├── README.md                     # tela inicial, variáveis, sessões e down -v, npm test, validar-002
├── docs/openapi.yaml             # + /api/auth/*
├── docs/kit-interface.md         # kit 1.2: classes por corpo celeste e estado do portal
├── scripts/
│   ├── validar-002.sh            # clone limpo da feature, obrigatório para publicar (R19)
│   └── validar-001.sh            # checagem da página inicial ajustada (R20)
└── app/
    ├── Dockerfile                # cria /app/segredo com dono node antes do USER node
    ├── package.json              # dependências do R1; npm test com o aviso dos termos
    ├── src/
    │   ├── app.js                # helmet, cookies, JSON, origem, páginas, API, erros
    │   ├── server.js             # resolve o segredo antes do listen
    │   ├── config.js             # + cookieSeguro, pastaSegredo, custoBcrypt
    │   ├── db.js                 # (001)
    │   ├── seguranca/
    │   │   ├── segredo-sessao.js # JWT_SECRET > arquivo > geração (R4)
    │   │   └── sessao.js         # emitir, ler e encerrar a sessão (R2)
    │   ├── middlewares/
    │   │   ├── verificar-origem.js   # Origin, Sec-Fetch-Site e JSON (R3)
    │   │   ├── exigir-sessao.js      # API: 401; páginas: redireciona (R8)
    │   │   └── limite-rede.js        # 60 falhas por minuto por IP, login e cadastro (R6)
    │   ├── validacao/
    │   │   └── cadastro.js           # nome, e-mail, senha (caracteres e bytes) e aceite (R5, R11)
    │   ├── services/
    │   │   ├── autenticacao-service.js   # cadastrar e entrar (bcrypt, hash fictício)
    │   │   └── tentativas-login.js       # bloqueio por CPF em memória (R6)
    │   ├── controllers/
    │   │   └── auth-controller.js        # HTTP <-> serviços, códigos e mensagens
    │   ├── repositories/
    │   │   ├── conteudo-repository.js    # (001)
    │   │   └── candidato-repository.js   # inserir, buscar por CPF, buscar por id
    │   ├── routes/
    │   │   ├── saude.js                  # (001)
    │   │   ├── auth.js                   # /api/auth/*
    │   │   ├── paginas.js                # endereços limpos, redirecionamentos, no-store (R8)
    │   │   └── destinos-provisorios.js   # tabela da página "Disponível em breve" (R9)
    │   └── verificacao/
    │       ├── (001: cli.js e verificar-carga.js)
    │       ├── termos.js                 # marcador do e-mail e a checagem (R15)
    │       └── aviso-termos.js           # aviso em destaque no fim do npm test (FR-012b)
    ├── public/
    │   ├── index.html            # tela 1 (substitui a página de status da 001)
    │   ├── cadastro.html  entrar.html  candidato.html  termos.html  em-breve.html
    │   ├── css/                  # CSS de cada página, só o que o kit não tem (inicio, acesso,
    │   │                         # candidato, termos, em-breve); estilo.css da 001 sai
    │   ├── js/
    │   │   ├── compartilhado/
    │   │   │   ├── cpf.js        # usado pelo navegador e pelo Node (R10)
    │   │   │   ├── api.js        # fetch JSON, erros por campo, 401 → login
    │   │   │   └── cabecalho.js  # nome do candidato e "Sair" no cabeçalho logado
    │   │   └── inicio.js  cadastro.js  entrar.js  candidato.js
    │   └── kit/                  # kit 1.2: + classes lc-corpo-1 a 12 (componentes.css)
    │       └── js/estado-portal.js   # estado do portal no rodapé (R14)
    └── test/
        ├── saude.test.js  verificacao-carga.test.js   # (001)
        ├── apoio.js                  # transação desfeita e criarApp de teste (R16)
        ├── cpf.test.js               # validação compartilhada
        ├── cadastro.test.js  login.test.js  sessao.test.js
        ├── tentativas.test.js        # bloqueio por CPF e limite por rede
        ├── segredo-sessao.test.js    # prioridade, geração, permissão, mínimo de 32
        ├── paginas.test.js           # redirecionamentos, no-store, destinos provisórios, CSP, origem
        └── estatico.test.js          # sem JS inline, style, eventos nem recurso externo; marcador dos termos
```

**Structure Decision**: o projeto único em `app/` da 001 continua, agora com as camadas completas
da seção 5 do dossiê (`routes` → `controllers` → `services` → `repositories`), que a 001 adiou até
a primeira regra de negócio (R17). As páginas continuam estáticas e na mesma origem da API.
`criarApp()` passa a receber as dependências (consultar, segredo, custo do `bcrypt`, relógio), o
que permite testar com transação desfeita e tempo controlado.

## Riscos e dependências

- **Fechamento da página durante a questão (dependência dos planos da 004 e da 006)**: as
  instruções e a pergunta frequente da 002 (FR-003, FR-040) prometem que fechar ou recarregar a
  página encerra a questão na hora e que o histórico registra o horário. Quem entrega isso é a
  004 (aviso de interrupção com `sendBeacon` no `pagehide`, FR-010 da 004) e a 006 (horário da
  interrupção no histórico, FR-007 da 006). Antes delas, o texto só descreve o funcionamento, o
  que a regra de disponibilidade permite (FR-050). Se os planos da 004 ou da 006 mudarem esse
  comportamento, os textos da 002 precisam ser revistos no mesmo PR; os dois planos devem
  registrar esta dependência quando forem escritos.
- **Texto de refazer depende da D9 (P-10)**: a resposta da pergunta frequente sobre refazer (FR-040)
  vale para "sem limite de tentativas". Se a D9 trouxer um limite, o texto muda; nada mais da 002
  depende disso.
- **E-mail do projeto (P-01)**: bloqueia a publicação, não as fases. O marcador nos termos faz o
  `npm test` avisar a cada rodada e o `validar-002.sh` falhar (FR-012b, R15).
- **Docker Desktop e IP único (R6)**: o limite por rede pode valer para a sala inteira; ele é
  folgado e só conta falhas, e a proteção real é por CPF. O cenário 3 do quickstart mede.
- **Contador por CPF em memória (R6)**: reiniciar o app libera bloqueios em curso; aceito no
  escopo, a rever se houver mais de um processo.
- **Token copiado válido até expirar (R2)**: sair apaga o cookie, mas um token copiado vale até as
  8 horas; mitigado por `HttpOnly` e pela CSP.
- **Kit e CSP (R7)**: o kit documenta `style="--cor: ..."`, que a CSP bloqueia; o kit 1.2 troca por
  classes. A demonstração do kit (`docs/kit-demo.html`) abre direto do disco, fora da CSP, e não
  precisa mudar.
- **Builder clássico na máquina do mantenedor**: o Buildx não está instalado; o `Dockerfile` não
  pode usar `COPY --chmod`, `--link` nem `RUN --mount` (R4).
- **Permissão dos arquivos de `db/`**: um arquivo criado fora do Git pode ficar sem leitura para
  outros usuários e travar a primeira carga; o README e o `validar-002.sh` cobrem o caso (R19).
- **Texto dos termos sem revisão jurídica**: escrito pela equipe; pode ser revisto pelo professor
  sem impacto técnico.

## Pendências

- **P-01 (bloqueia a publicação)**: e-mail exclusivo do projeto, a criar pelo mantenedor.
- **P-09 (para a 007)**: os termos ganham os dados dos flashcards na 007 (spec 007, FR-045).
- **P-10**: texto de refazer do FR-040 depende da D9.

## Complexity Tracking

Nenhuma violação da constituição a justificar.
