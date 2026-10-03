---

description: "Lista de tarefas da feature 002-tela-inicial-cadastro-login"
---

# Tasks: Tela Inicial, Cadastro e Login

**Input**: Design documents from `/specs/002-tela-inicial-cadastro-login/` (plano de 2026-10-03,
gerado do zero; substitui a lista de tarefas anterior)

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Requisitos**: RF01, RF02, RF03, RF04, RNF01, RNF03; telas 1 a 6 de `docs/telas.md`. Cada tarefa
termina com `Req:` (FR/SC da spec, RF/RNF do desafio e tela). Citar os IDs nos commits
(Princípio VIII).

**Tests**: exigidos pela spec (FR-012b, SC-004 a SC-009) e pelo plano (research R16): cada fase
traz os testes da sua história, escritos antes da implementação e falhando primeiro.

**Fluxo do mantenedor**: as fases são implementadas uma de cada vez; ao fim de cada fase, a
implementação para e o mantenedor valida com o cenário indicado do `quickstart.md` antes de
liberar a próxima. Tarefas marcadas **(mantenedor)** dependem de Docker e são executadas por ele
(o daemon não é acessível na máquina de desenvolvimento do Claude); a evidência vai para
`validacao.md`. Commits e push só quando o mantenedor pedir.

**Textos**: todo texto de interface vem dos protótipos (`docs/prototipo/`, fonte da verdade) e do
catálogo de `contracts/paginas-e-sessao.md`; nenhum texto novo sem aprovação do mantenedor.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode rodar em paralelo (arquivos diferentes, sem dependência de tarefa incompleta)
- **[Story]**: história da spec (US1 a US5)

## Path Conventions

Projeto único em `app/` (plano, "Structure Decision"): back-end em `app/src/`, páginas em
`app/public/`, testes em `app/test/`; scripts em `scripts/`; documentação em `docs/` e `README.md`.

---

## Phase 1: Setup (infraestrutura compartilhada)

**Purpose**: dependências, configuração e execução que todas as histórias usam.

- [ ] T001 Acrescentar a `app/package.json` as dependências `bcrypt` ^6.0.0, `jsonwebtoken` ^9.0.3, `cookie-parser` ^1.4.7, `helmet` ^8.3.0 e `express-rate-limit` ^8.7.0 e atualizar `app/package-lock.json` com `npm install` (research R1). Req: RF03, RF04, RNF03; plano, Technical Context
- [ ] T002 Trocar o script `test` de `app/package.json` por `node --test "test/**/*.test.js"; codigo=$?; node src/verificacao/aviso-termos.js; exit $codigo` (o aviso roda depois dos testes e não muda o código de saída; research R15). Req: FR-012b, SC-017
- [ ] T003 [P] Estender `app/src/config.js` com `cookieSeguro` (true só quando `PUBLIC_BASE_URL` começa com `https://`), `pastaSegredo` (`PASTA_SEGREDO` ou `/app/segredo`), `custoBcrypt` (12) e `limites` (`falhasCpf: 5`, `janelaCpfMinutos: 15`, `bloqueioCpfMinutos: 15`, `falhasRedePorMinuto: 60`, `janelaRedeMinutos: 1`), com a função `minutosDeEspera()` que devolve o maior tempo de espera entre os dois limites (research R6). Req: FR-017, FR-017a, FR-018, FR-029
- [ ] T004 [P] Em `app/Dockerfile`, antes de `USER node`, acrescentar `RUN mkdir -p /app/segredo && chown node:node /app/segredo`, sem recursos exclusivos do BuildKit (`COPY --chmod`, `--link`, `RUN --mount`) (research R4). Req: FR-029; Princípio V
- [ ] T005 [P] Em `docker-compose.yml`, no serviço `app`: variável `JWT_SECRET: ${JWT_SECRET:-}` e volume nomeado `segredo_sessao` montado em `/app/segredo`; declarar o volume em `volumes:` (contrato, "Mudanças na execução"). Req: FR-029; Princípio V
- [ ] T006 [P] Em `.env.example`, manter `JWT_SECRET=` vazia com o comentário: opcional; sem ela, o app gera um segredo na primeira subida e o guarda no volume `segredo_sessao`; se definida, precisa de 32 caracteres ou mais. Req: FR-029

---

## Phase 2: Foundational (pré-requisitos bloqueantes)

**Purpose**: segurança, sessão, páginas e kit que todas as histórias usam. Nenhuma história
começa antes desta fase.

### Testes da fundação

- [ ] T007 [P] Criar `app/test/apoio.js`: `criarAppTeste({ consultar, segredo, custoBcrypt: 4, relogio })` e `emTransacao(fn)`, que pega um cliente dedicado do pool, roda `begin`, executa o caso e sempre faz `rollback` (research R16). Req: SC-006; Princípio IX
- [ ] T008 [P] Criar `app/test/segredo-sessao.test.js`: `JWT_SECRET` tem prioridade; com menos de 32 caracteres o carregamento falha com mensagem clara; sem variável, lê o arquivo; sem arquivo, gera 64 bytes em base64url e grava com permissão `0600` em `PASTA_SEGREDO` temporária. Req: FR-029
- [ ] T009 [P] Criar `app/test/sessao.test.js`: token HS256 com `sub`, `cad`, `iat`, `exp` de 8 horas; cookie `sessao` com `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800` e sem `Secure` em HTTP; token com `cad` diferente de `data_cadastro` é inválido; token vencido (relógio injetado avançado 8 h + 1 s) é inválido; algoritmo diferente de HS256 é recusado. Req: FR-018, FR-020; research R2
- [ ] T010 [P] Criar `app/test/paginas.test.js` com os casos da fundação: `GET /qualquer.html` responde `301` para o endereço limpo; `POST` sob `/api` com `Origin` de outra porta dá `403`, com `Origin: null` dá `403`, com `Sec-Fetch-Site: cross-site` sem `Origin` dá `403`, com corpo `text/plain` dá `415`, com JSON malformado dá `400` "Envie os dados em JSON." e com mais de 10 kB dá `413` "Dados grandes demais."; nenhuma resposta tem `Access-Control-Allow-Origin`; a CSP é a do contrato e não contém `upgrade-insecure-requests` em HTTP. Req: FR-020, FR-028; research R3, R7
- [ ] T011 [P] Criar `app/test/estatico.test.js`: varre todos os `.html` de `app/public` fora de `app/public/kit` e falha se encontrar `<script>` com conteúdo inline, atributo `on*=`, URL `javascript:`, atributo `style=` ou `src`/`href` para `http://` ou `https://` de outro domínio; confere que cada página tem `<title>` terminado em "· Lunar Celer". Req: FR-026, FR-028, FR-048; research R7
- [ ] T012 [P] Criar `app/test/destinos-provisorios.test.js`: `/estudos`, `/estudos/5`, `/validar`, `/validar/abc` e `/flashcards` respondem `200` com o título e o texto da variação da tabela do contrato e `Cache-Control: no-store`; `/certificacao/inicio` e `/perfil` sem sessão respondem `302` para `/entrar` e, com sessão, `200` com a variação; o texto vem escapado e nunca reflete o endereço pedido. Req: FR-024, FR-050; tela 6; research R9

### Implementação da fundação

- [ ] T013 Criar `app/src/seguranca/segredo-sessao.js`: resolve o segredo na ordem `JWT_SECRET` (mínimo 32 caracteres, senão erro) → arquivo `segredo-sessao` na pasta de `config.pastaSegredo` → geração com `crypto.randomBytes(64)` em base64url gravada com `0600`; nunca registra o segredo em log (research R4). Req: FR-029
- [ ] T014 Criar `app/src/seguranca/sessao.js`: `emitirSessao(res, candidato, agora)`, `lerSessao(req, buscarPorId, agora)` (confere assinatura com `algorithms: ['HS256']`, validade, existência do candidato e `Math.floor(data_cadastro / 1000) === cad`, apagando o cookie se inválida) e `encerrarSessao(res)`, com os atributos do cookie do contrato (research R2). Req: FR-018, FR-019, FR-020
- [ ] T015 [P] Criar `app/src/middlewares/verificar-origem.js` com as regras 1 a 3 de "Origem e formato dos pedidos" do contrato, aplicado a `POST`, `PUT`, `PATCH` e `DELETE` sob `/api` (research R3). Req: FR-020
- [ ] T016 [P] Criar `app/src/middlewares/exigir-sessao.js`: para a API, `401` com "Sua sessão expirou. Entre de novo."; para páginas, `302` para `/entrar` (com `?motivo=expirada` quando havia cookie inválido ou vencido) (research R8). Req: FR-018, FR-023
- [ ] T017 [P] Criar `app/src/repositories/candidato-repository.js` recebendo `consultar`: `inserir({ cpf, nome, email, hashSenha })` com `insert` parametrizado e `data_aceite_termos = now()`; `buscarPorCpf(cpf)`; `buscarPorId(id)` devolvendo só `id`, `nome` e `data_cadastro`; tradução do erro `23505` em `CPF_DUPLICADO` (data-model, "Candidato"). Req: FR-007, FR-011, FR-030; Princípio III
- [ ] T018 Criar `app/src/routes/destinos-provisorios.js` com a tabela do contrato (endereços `/estudos`, `/estudos/:tema`, `/certificacao/inicio`, `/validar`, `/validar/:codigo`, `/flashcards`, `/perfil`; título, texto e "exige sessão" de cada variação, textos do protótipo `EmBreve`) e a rota que entrega `app/public/em-breve.html` com os marcadores de título e texto substituídos por texto escapado para HTML e `Cache-Control: no-store` (research R9). Req: FR-024, FR-050; tela 6
- [ ] T019 Criar `app/src/routes/paginas.js`: `301` de `*.html` para o endereço limpo; `/cadastro` e `/entrar` com sessão → `302` `/candidato`; `/candidato` sem sessão → `302` `/entrar[?motivo=expirada]`; `/` sem redirecionar; `Cache-Control: no-store` nessas páginas; registrado antes do `express.static` (research R8). Req: FR-023; telas 1 a 4
- [ ] T020 Reescrever `app/src/app.js`: `criarApp(dependencias)` recebe `consultar`, `segredo`, `custoBcrypt` e `relogio`; registra `helmet` com a CSP do contrato (sem `upgrade-insecure-requests` e sem HSTS em HTTP), `cookie-parser`, `express.json({ limit: '10kb' })`, `verificar-origem`, as rotas de páginas, os destinos provisórios, `express.static` com `extensions: ['html']`, a API (`saude` e, depois, `auth`) e o tratador de erros que traduz JSON malformado (`400`) e corpo grande (`413`) sem vazar detalhes; `trust proxy` desligado (research R7, R17). Req: FR-020, FR-028, FR-030
- [ ] T021 Alterar `app/src/server.js` para resolver o segredo (T013) antes do `listen` e falhar cedo com mensagem clara; com a carga incompleta, registrar uma linha de aviso com as contagens esperadas e encontradas na subida (contrato, "Mudanças na execução", log do app). Req: FR-029, FR-004a
- [ ] T022 [P] Acrescentar ao kit, como versão 1.3, `app/public/kit/js/estado-portal.js` (`LunarCeler.estadoPortal`): consulta `GET /api/saude` e atualiza o `lc-status` do rodapé com "Portal no ar e banco conectado", ou `lc-status--falha` com "Instabilidade no portal. Tente de novo em alguns minutos." (503 ou falha de rede) ou "Conteúdo em atualização." (`cargaCompleta: false`); documentar em `docs/kit-interface.md` (versão 1.3) (research R14). Req: FR-004a; tela 21
- [ ] T023 [P] Em `app/src/routes/saude.js`, registrar no log uma linha de aviso com o que falta na carga só quando o estado de carga completa mudar (sem repetir a cada pedido), mantendo o contrato de `GET /api/saude` da 001 (research R14). Req: FR-004a; FR-013 da 001
- [ ] T024 [P] Criar `app/public/js/compartilhado/cpf.js` (UMD: `window.LunarCeler.cpf` no navegador, `module.exports` no Node) com `normalizarCpf`, `validarCpf` (11 dígitos, dois dígitos verificadores, recusa todos iguais) e `formatarCpf` (research R10). Req: FR-006, SC-004
- [ ] T025 [P] Criar `app/test/cpf.test.js` com CPFs válidos com e sem máscara e com espaços fora do lugar, e inválidos (dígito verificador errado, todos iguais, 10 e 12 dígitos, letras). Req: FR-006, SC-004
- [ ] T026 [P] Criar `app/public/js/compartilhado/api.js`: `enviar(metodo, endereco, corpo)` com `fetch` JSON e `credentials: 'same-origin'`; devolve `{ status, corpo }`; em `401` de rota autenticada, leva a `/entrar?motivo=expirada`; mostra erros por campo (`campos`) ligados ao `aria-describedby` de cada campo. Req: FR-014, FR-018
- [ ] T027 [P] Criar `app/public/js/compartilhado/cabecalho.js`: no cabeçalho logado, preenche o nome do candidato com `textContent` a partir de `GET /api/auth/me` e liga "Sair" (`POST /api/auth/logout`, depois `/`). Req: FR-019, FR-048
- [ ] T028 Criar `app/src/verificacao/termos.js` com a constante `MARCADOR_EMAIL_TERMOS = '[E-mail do projeto pendente: P-01]'`, a mensagem do catálogo e `verificarTermos(caminho)` que devolve `{ marcador: boolean, mailto: boolean }` lendo `app/public/termos.html` (research R15). Req: FR-012a, FR-012b
- [ ] T029 Criar `app/src/verificacao/aviso-termos.js`: se `verificarTermos` encontrar o marcador, imprime no fim da saída um bloco separado por linhas de destaque com "Termos com marcador de e-mail: a publicação será bloqueada até P-01 da 002 ser resolvida"; sai sempre com código `0` (research R15). Req: FR-012b, SC-017
- [ ] T030 Validação da fundação **(mantenedor)**: `docker compose up -d --build --wait` e `docker compose exec app npm test`; conferir que os testes desta fase passam, que o volume `segredo_sessao` foi criado e que `docker compose logs app` não mostra o segredo; registrar em `specs/002-tela-inicial-cadastro-login/validacao.md`. Req: FR-029; Princípio V

**Checkpoint**: fundação pronta; as histórias podem começar.

---

## Phase 3: User Story 1 - Conhecer a certificação na tela inicial (Priority: P1) 🎯 MVP

**Goal**: o visitante encontra, sem login, a apresentação, as regras e as instruções da
certificação e os caminhos para criar conta, entrar, estudar e validar.

**Independent Test**: cenário 1 do `quickstart.md` (seções em ordem, regras, instruções, caminhos,
360 px e 1920 px).

### Testes da US1

- [ ] T031 [P] [US1] Acrescentar a `app/test/paginas.test.js`: `GET /` responde `200` com e sem sessão (sem redirecionar), contém as seis regras (12 temas, uma questão por tema sorteada, 150 segundos, resposta única, 65% ou 8 de 12, QR Code), o descritivo "portal de certificação em metodologias ágeis", as respostas sobre internet e sobre refazer com os textos do FR-040 e **não** contém "Entre e use 100% do Lunar Celer" nem "A área de estudos é aberta" (tabela do FR-050). Req: FR-001 a FR-003, FR-038, FR-040, FR-050; tela 1

### Implementação da US1

- [ ] T032 [US1] Criar `app/public/index.html` portando `docs/prototipo/Main.dc.html` com o kit: cabeçalho público com abas (Scrum, Trilha, Método, Sobre) e "Entrar"; hero com "Um aprendizado astronômico", o parágrafo com as regras (id `regras`), "Criar minha conta", "Começar pelos estudos" e "Como funciona" com três passos; seções 2, 3, 4, 6, 7 e 8 da tela 1, sem a seção 5 (FR-038); trilha (id `trilha`) com os 12 corpos e cores pelas classes `lc-corpo-1` a `lc-corpo-12`, cada corpo levando a `/estudos`; perguntas frequentes em `<details class="lc-recolhivel">` com os textos do FR-040; rodapé comum; título terminado em "· Lunar Celer"; sem `style=` nem script inline; textos da tabela do FR-050 omitidos. Req: RF01, RF02, FR-001 a FR-004b, FR-035 a FR-041, FR-048; tela 1
- [ ] T033 [P] [US1] Criar `app/public/css/inicio.css` com só o que o kit não tem para a tela 1, usando os tokens do kit (cinza `#8A8A93` em texto abaixo de 18 px, Inter 300/400/500, mobile-first a partir de 360 px). Req: FR-025, FR-026, FR-027; tela 1
- [ ] T034 [US1] Criar `app/public/js/inicio.js` (substitui o da 001): liga `LunarCeler.abas`, `LunarCeler.estadoPortal` e os links "Começar pelos estudos" para `#trilha`. Req: FR-004, FR-004a, FR-042; tela 1
- [ ] T035 [US1] Remover `app/public/css/estilo.css` da 001 e conferir que `app/test/saude.test.js` (caso `(e) GET /`) continua passando. Req: FR-013 da 001; research R20
- [ ] T036 [P] [US1] Em `scripts/validar-001.sh`, trocar a checagem da página inicial por `grep -qi 'portal de certificação'` e a dica do `MANTER=1` de "Carga incompleta" para "Conteúdo em atualização" no rodapé (research R20). Req: FR-004a; Princípio V
- [ ] T037 [US1] Validação da US1 **(mantenedor)**: cenário 1 do `quickstart.md` em celular (360 px) e computador; registrar em `validacao.md`. Req: SC-001, SC-007, SC-016

**Checkpoint**: tela inicial no ar, com regras e caminhos.

---

## Phase 4: User Story 2 - Cadastrar-se como candidato (Priority: P1)

**Goal**: o visitante cria a conta com CPF, nome, e-mail, senha e aceite dos termos e fica
conectado, sem iniciar a certificação.

**Independent Test**: cenário 2 do `quickstart.md`.

### Testes da US2

- [ ] T038 [P] [US2] Criar `app/test/cadastro.test.js` (em `emTransacao`): cadastro válido responde `201`, emite o cookie, grava `data_aceite_termos` e só o hash `$2b$`; CPF com e sem máscara são o mesmo; CPF inválido, nome de uma palavra, e-mail inválido, senha com 7 e 65 caracteres, senha com menos de 64 caracteres e mais de 72 bytes, confirmação diferente e sem aceite respondem `400` com a mensagem do catálogo no campo certo; CPF repetido responde `409` com "Este CPF já tem cadastro. Se a conta é sua, entre com CPF e senha." sem nenhum outro dado; erro `23505` simulado vira `409`; falha do banco responde `503` com "O portal está com instabilidade. Tente de novo em instantes." sem cadastro parcial; nenhuma resposta contém CPF, e-mail ou senha. Req: FR-005 a FR-014, FR-030, SC-004, SC-006
- [ ] T039 [P] [US2] Acrescentar a `app/test/estatico.test.js` o teste do marcador: `app/public/termos.html` tem `MARCADOR_EMAIL_TERMOS` **ou** um `mailto:` válido, nunca os dois nem nenhum, e não tem endereço inventado (como `@exemplo`); e `aviso-termos.js` imprime o bloco de aviso quando o marcador está presente e nada quando não está. Req: FR-012, FR-012a, FR-012b, SC-017

### Implementação da US2

- [ ] T040 [P] [US2] Criar `app/src/validacao/cadastro.js`: nome aparado com pelo menos duas palavras, até 150 caracteres, só letras Unicode, espaço, apóstrofo (`'` ou `’`) e hífen; e-mail até 254 caracteres no formato `algo@dominio.tld`; senha de 8 a 64 caracteres (por ponto de código) e no máximo 72 bytes em UTF-8; confirmação igual; aceite `true`; mensagens do catálogo do contrato por campo (research R5, R11). Req: FR-005, FR-008 a FR-011, FR-014
- [ ] T041 [US2] Criar `app/src/services/autenticacao-service.js` com `cadastrar(dados)`: valida (T040 e `validarCpf`), gera o hash `bcrypt` com `config.custoBcrypt` e insere pelo repositório (T017); devolve o candidato sem dados sensíveis. Req: FR-005 a FR-011, FR-030
- [ ] T042 [US2] Criar `app/src/middlewares/limite-rede.js` com `express-rate-limit` (`skipSuccessfulRequests: true`, `config.limites.falhasRedePorMinuto` por `janelaRedeMinutos`, um limitador para o login e outro para o cadastro) e tratador próprio que responde `429` com "Muitas tentativas sem sucesso. Aguarde [n] minutos e tente de novo." e `Retry-After` de [n] minutos em segundos, [n] = `config.minutosDeEspera()` (research R6). Req: FR-017a
- [ ] T043 [US2] Criar `app/src/controllers/auth-controller.js` (cadastro) e `app/src/routes/auth.js` com `POST /api/auth/cadastro` pelo limitador de cadastro, respondendo `201` com `{ candidato: { nome, primeiroNome } }` e o cookie (T014), `400`, `409`, `429` e `503` como em `contracts/api-auth.openapi.yaml`. Req: RF03, FR-005 a FR-014, FR-030
- [ ] T044 [US2] Criar `app/public/cadastro.html` portando `docs/prototipo/Cadastro.dc.html` com o kit: bento com a Lua nova apagada, "Criar conta", "Sua Lua começa nova" e "Criar a conta não inicia a prova" (sem o trecho da tabela do FR-050); formulário com CPF (`inputmode="numeric"`), nome completo ("Do jeito que deve aparecer no certificado."), e-mail, senha e confirmação lado a lado com mostrar e ocultar, aceite com link para `/termos` que abre em outra aba; blocos "Já tem conta?" (sem "e continue de onde parou") e "Como seus dados são usados"; estados de erro por campo, CPF já cadastrado com atalho para `/entrar` e senha longa demais. Req: RF03, FR-005, FR-043, FR-045, FR-050; tela 2
- [ ] T045 [P] [US2] Criar `app/public/css/acesso.css` (compartilhado com a tela 3) com só o que o kit não tem. Req: FR-025 a FR-027; telas 2 e 3
- [ ] T046 [US2] Criar `app/public/js/cadastro.js`: valida no navegador com `LunarCeler.cpf` (o servidor valida de novo), envia por `api.js`, mostra as mensagens por campo preservando os campos (exceto senhas), liga `LunarCeler.formularios`; com `201`, grava `lc-notificacao=conta-criada` em `sessionStorage` (em `try/catch`) e vai para `/candidato` (research R13). Req: FR-006, FR-014, FR-044
- [ ] T047 [US2] Criar `app/public/termos.html` portando `docs/prototipo/Termos.dc.html` com o kit: índice lateral, "Última atualização: [data]" no topo e as seções do FR-012 (quem somos; dados coletados no cadastro e na certificação; para que servem, incluindo o endereço de rede usado só no momento do acesso; o que fica público; prazo de guarda; direitos pela LGPD; contato), com o contato igual a `MARCADOR_EMAIL_TERMOS` enquanto a P-01 não for resolvida; a senha "guardada de forma irreversível: nem a equipe do projeto consegue vê-la"; cabeçalho público "Voltar ao início"; e `app/public/css/termos.css` com só o que o kit não tem. Req: FR-012, FR-012a, FR-045; tela 5
- [ ] T048 [US2] Validação da US2 **(mantenedor)**: cenário 2 do `quickstart.md` e `docker compose exec app npm test` (conferir o bloco de aviso do marcador no fim da saída); registrar em `validacao.md`. Req: SC-002, SC-004, SC-006, SC-017

**Checkpoint**: cadastro funcionando; a área do candidato ainda é a mínima da fundação.

---

## Phase 5: User Story 3 - Entrar com CPF e senha (Priority: P1)

**Goal**: o candidato entra exclusivamente com CPF e senha, sai quando quiser e é protegido
contra força bruta sem bloquear a sala da apresentação.

**Independent Test**: cenário 3 do `quickstart.md`.

### Testes da US3

- [ ] T049 [P] [US3] Criar `app/test/login.test.js` (em `emTransacao`): CPF e senha certos (com e sem máscara) respondem `200` com o cookie; senha errada e CPF não cadastrado respondem `401` com a mesma mensagem "CPF ou senha inválidos. Confira os dados e tente de novo." e tempos comparáveis (hash fictício); e-mail no lugar do CPF responde `400` com "O login é feito com o CPF cadastrado, não com o e-mail." sem contar tentativa; `POST /api/auth/logout` responde `204` e apaga o cookie; `GET /api/auth/me` devolve só `nome` e `primeiroNome` e, sem sessão, `401`. Req: RF04, FR-015, FR-016, FR-019, FR-020, SC-005
- [ ] T050 [P] [US3] Criar `app/test/tentativas.test.js` com relógio injetado: 5 falhas em 15 minutos bloqueiam o CPF, e a 6ª tentativa, mesmo com a senha certa, responde `429`; a mensagem e o `Retry-After` são idênticos para CPF cadastrado, não cadastrado e para o limite por rede (minutos de `config.minutosDeEspera()`); passados 15 minutos, volta a aceitar; login bem-sucedido zera a contagem; 30 CPFs diferentes da mesma rede entram no mesmo minuto sem bloqueio; 60 falhas por minuto da mesma rede bloqueiam. Req: FR-017, FR-017a, SC-005, SC-009

### Implementação da US3

- [ ] T051 [US3] Criar `app/src/services/tentativas-login.js`: `Map` do CPF normalizado para os instantes das falhas e o fim do bloqueio, com `config.limites`, limpeza periódica com `unref` e teto de 50.000 CPFs; `estaBloqueado`, `registrarFalha` e `zerar` (research R6). Req: FR-017
- [ ] T052 [US3] Acrescentar a `app/src/services/autenticacao-service.js` a função `entrar({ cpf, senha })`: identificador com `@` → erro de e-mail (sem contar); CPF inválido → erro de CPF (sem contar); bloqueado → erro de bloqueio sem conferir a senha; compara com o hash do candidato ou com o hash fictício gerado na subida; registra falha ou zera (research R5, R6). Req: FR-015 a FR-017
- [ ] T053 [US3] Acrescentar a `app/src/controllers/auth-controller.js` e `app/src/routes/auth.js` as rotas `POST /api/auth/login` (pelo limitador de login), `POST /api/auth/logout` e `GET /api/auth/me` (com `exigir-sessao`), com as respostas do OpenAPI e a mesma resposta `429` do limite por rede (mensagem e `Retry-After` com `config.minutosDeEspera()`). Req: RF04, FR-015 a FR-020
- [ ] T054 [US3] Criar `app/public/entrar.html` portando `docs/prototipo/Entrar.dc.html` com o kit: formulário só com CPF (com a ajuda "Pode digitar com ou sem pontos e traço.") e senha com mostrar e ocultar; "Não há recuperação de senha nesta versão do portal."; blocos "Ainda não tem conta?" e "Quer estudar antes?" (sem "A área de estudos é aberta, sem login", tabela do FR-050), levando a `/cadastro` e `/estudos`; estados de erro genérico, bloqueio, e-mail e sessão expirada (`?motivo=expirada` mostra "Sua sessão expirou. Entre de novo."); sem o texto "Depois de entrar, você decide..." (FR-050). Req: RF04, FR-046, FR-050; tela 3
- [ ] T055 [US3] Criar `app/public/js/entrar.js`: envia por `api.js`, mostra as mensagens do catálogo sem ecoar o CPF digitado e, com `200`, vai para `/candidato`. Req: FR-015, FR-016, FR-046
- [ ] T056 [US3] Validação da US3 **(mantenedor)**: cenário 3 do `quickstart.md` (inclusive o bloqueio na 6ª tentativa); registrar em `validacao.md`. Req: SC-003, SC-005, SC-009

**Checkpoint**: cadastro, login, sessão e saída completos.

---

## Phase 6: User Story 4 - Decidir entre iniciar agora ou voltar depois (Priority: P2)

**Goal**: na área do candidato, o candidato vê a Lua nova e escolhe entre iniciar a certificação,
estudar antes ou sair; os destinos ainda não entregues levam à página "Disponível em breve".

**Independent Test**: cenário 4 do `quickstart.md`.

### Testes da US4

- [ ] T057 [P] [US4] Acrescentar a `app/test/paginas.test.js`: `/candidato` sem sessão → `302` `/entrar`, com cookie vencido → `302` `/entrar?motivo=expirada`; `/cadastro` e `/entrar` com sessão → `302` `/candidato`; `candidato.html` tem "Sua Lua ainda está nova", "0 de 12 temas concluídos", "Iniciar a certificação" levando a `/certificacao/inicio`, "Rever as regras" levando a `/#regras` e não tem os textos da tabela do FR-050. Req: FR-021 a FR-023, FR-047, FR-050; tela 4

### Implementação da US4

- [ ] T058 [US4] Criar `app/public/candidato.html` portando `docs/prototipo/AreaCandidato.dc.html` com o kit, só no estado "não iniciada": cabeçalho logado (marca → `/candidato`; "Área de estudos" → `/estudos`; "Flashcards" → `/flashcards`; nome → `/perfil`; "Sair"); saudação pelo nome; "Sua Lua ainda está nova"; botão "Iniciar a certificação" → `/certificacao/inicio`; Lua em SVG sem nenhuma parte acesa e trilha de 12 marcos (`lc-marcos`) com "0 de 12 temas concluídos"; blocos "Estudar antes" (→ `/estudos`, sem "e fica aberta a qualquer momento") e "Antes de cada questão" com "Rever as regras" (→ `/#regras`); sem os textos da tabela do FR-050; e `app/public/css/candidato.css`. Req: RF02, FR-021, FR-022, FR-047, FR-048, FR-050; tela 4
- [ ] T059 [US4] Criar `app/public/js/candidato.js`: carrega o nome por `GET /api/auth/me` (saudação e cabeçalho via `cabecalho.js`), liga `LunarCeler.estadoPortal`; se `sessionStorage` tiver `lc-notificacao=conta-criada`, apaga a marca e chama `LunarCeler.notificar({ tipo: 'sucesso', titulo: 'Conta criada', texto: 'Boas-vindas ao Lunar Celer, [primeiro nome]. Sua conta está pronta.' })` (research R13). Req: FR-021, FR-044
- [ ] T060 [US4] Criar `app/public/em-breve.html` portando `docs/prototipo/EmBreve.dc.html` com o kit: ilustração do eclipse, marcadores de título e texto preenchidos pelo servidor (T018), botões "Voltar para a área do candidato" (`/candidato`) e "Ir para o início" (`/`), cabeçalho público "Voltar ao início"; e `app/public/css/em-breve.css`. Req: FR-024; tela 6
- [ ] T061 [US4] Validação da US4 **(mantenedor)**: cenário 4 do `quickstart.md`; registrar em `validacao.md`. Req: SC-012, SC-016

**Checkpoint**: área do candidato e destinos provisórios completos.

---

## Phase 7: User Story 5 - Explorar a apresentação do Scrum e do portal (Priority: P2)

**Goal**: o visitante se aprofunda na tela inicial: empresas que usam Scrum, o que é Scrum, a
trilha, o método e a origem do portal, com abas que acompanham a rolagem.

**Independent Test**: seções 2 a 6 e passos 3, 5 e 6 do cenário 1 do `quickstart.md`, com mouse,
toque e só teclado.

### Testes da US5

- [ ] T062 [P] [US5] Acrescentar a `app/test/paginas.test.js`: `index.html` traz os cinco fatos das empresas com o texto da seção 9 de `docs/identidade-visual.md`, sem logotipo; a Lua em rede tem a imagem estática `kit/img/lua-rede.svg` como reserva; cada rótulo de vidro é um `<button>` com `aria-pressed`. Req: FR-031 a FR-034; tela 1

### Implementação da US5

- [ ] T063 [US5] Completar em `app/public/index.html` o lado direito do hero: `div.lc-lua-rede` com `<img src="/kit/img/lua-rede.svg" alt="">` e `<canvas>`, os cinco rótulos de vidro (Google, Salesforce, Spotify, Saab, Adobe) como `<button aria-pressed="false">` com o fato em `data-fato`, e o cartão de fato com "Quem usa Scrum." (`aria-live="polite"`); a seção "O que é Scrum" com definição, três pilares, recolhíveis das responsabilidades e dos artefatos com os compromissos, a Sprint em SVG com os quatro eventos e "Aprofundar em Terra · Introdução ao Scrum" (→ `/estudos`), fiel ao Scrum Guide 2020. Req: FR-031 a FR-035; tela 1
- [ ] T064 [US5] Acrescentar a `app/public/js/inicio.js`: `LunarCeler.luaRede(document.querySelector('[data-lua-rede]'), { pontos: 110 })`; rótulos que acendem e mostram o fato com mouse, foco e toque (um ativo por vez, `aria-pressed` e o texto do cartão por `textContent`); nada se move com `prefers-reduced-motion`. Req: FR-031, FR-032; tela 1
- [ ] T065 [US5] Conferir em `docs/referencias.md` que cada um dos cinco fatos tem frase, fonte, URL e data de acesso e que o texto de `index.html` é o da identidade visual; ajustar só o HTML se divergir. Req: FR-033, FR-034, SC-011
- [ ] T066 [US5] Validação da US5 **(mantenedor)**: passos 3, 5 e 6 do cenário 1 e o cenário 6 do `quickstart.md` (teclado, 44 px, contraste AA, menos movimento, sem internet); registrar em `validacao.md`. Req: SC-007, SC-011, SC-013, SC-014, SC-015

**Checkpoint**: todas as histórias completas.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: documentação, segurança transversal e a verificação de clone limpo obrigatória.

- [ ] T067 [P] Incorporar `specs/002-tela-inicial-cadastro-login/contracts/api-auth.openapi.yaml` a `docs/openapi.yaml` (os quatro endpoints e os componentes), mantendo `GET /api/saude` da 001. Req: DoD item 4; RNF06
- [ ] T068 [P] Atualizar `README.md`: a tela inicial, o rodapé ("Conteúdo em atualização" com o detalhe em `docker compose logs app`, em "Se a primeira carga falhar"), a variável `JWT_SECRET` e o volume `segredo_sessao`, o efeito do `down -v` nas sessões, o `npm test` com o aviso do marcador e a seção do `validar-002.sh` (com `sudo` ou o grupo `docker`). Req: RNF06; FR-012b, FR-029
- [ ] T069 Criar `scripts/validar-002.sh` no modelo de `scripts/validar-001.sh` e `scripts/validar-propostas-pg16.sh`: confere o Docker e a leitura dos arquivos; clona numa pasta temporária; projeto do Compose `validar002` e porta própria; verifica por `curl` as páginas e os redirecionamentos, cadastro, login, `me`, sair, os destinos provisórios, a CSP, `403` de outra origem, `415`, o bloqueio por CPF na 6ª tentativa, o rodapé e nenhum recurso de outro domínio; roda `npm test` no container; **falha**, com a mensagem do catálogo e código diferente de zero, se `termos.html` tiver o marcador do e-mail, sem opção nem variável para pular; apaga tudo no fim (`down -v --rmi local` do projeto `validar002`) (research R19). Req: FR-012b, SC-008, SC-017; Princípio V
- [ ] T070 Autoverificação dos Princípios I, III, IV e VI antes do merge (constituição, Definition of Done): identidade pelo servidor, SQL só parametrizado, nada derivado gravado, nada pessoal em log nem em resposta; registrar o resultado em `validacao.md`. Req: Princípios I, III, IV e VI
- [ ] T071 Rodada final do `scripts/validar-002.sh` **(mantenedor)**, **obrigatória para publicar**: `sudo scripts/validar-002.sh 2>&1 | tee saida-validar-002.txt` (cenário 8 do `quickstart.md`); com o marcador do e-mail nos termos, o script falha e a publicação fica bloqueada até a P-01; só com o script aprovado a 002 é integrada à `main`, com a saída registrada em `validacao.md` e citada no PR. Req: FR-012a, FR-012b, SC-008, SC-017; Princípio V

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (fase 1)**: sem dependências.
- **Foundational (fase 2)**: depende da fase 1; bloqueia todas as histórias.
- **US1 (fase 3)**: depende da fase 2.
- **US2 (fase 4)**: depende da fase 2; usa o cabeçalho e o rodapé da US1 só para a revisão visual.
- **US3 (fase 5)**: depende da fase 2; o teste de login usa o cadastro do repositório (T017), não a tela da US2.
- **US4 (fase 6)**: depende das fases 4 e 5 (precisa de alguém conectado).
- **US5 (fase 7)**: depende da fase 3 (completa a tela inicial).
- **Polish (fase 8)**: depende de todas as histórias; T071 é a última tarefa.

### Within Each User Story

- Testes primeiro, falhando; depois validação, serviço, rota, página e script de página.
- Cada fase termina com a validação do mantenedor; a próxima só começa depois dela.

### Parallel Opportunities

- Fase 1: T003 a T006.
- Fase 2: os testes T007 a T012 e T025 em paralelo; T015, T016, T017, T022, T023, T024, T026 e T027 em paralelo depois de T013 e T014.
- Fases 3 a 7: os testes marcados [P] e os CSS de cada página.
- Fase 8: T067 e T068.

---

## Parallel Example: User Story 2

```text
Juntos: T038 (cadastro.test.js), T039 (marcador dos termos), T040 (validacao/cadastro.js), T045 (acesso.css)
Depois: T041 → T042 → T043 → T044 → T046 → T047 → T048 (mantenedor)
```

---

## Implementation Strategy

### MVP First (fases 1 a 3)

1. Fase 1 e fase 2 (fundação validada pelo mantenedor em T030).
2. Fase 3 (US1): a tela inicial no lugar da página de status da 001.
3. Parar e validar (T037). "MVP" aqui é só o primeiro incremento testável desta feature
   (Princípio VII).

### Incremental Delivery

1. US2 (cadastro) → validar (T048).
2. US3 (login) → validar (T056).
3. US4 (área do candidato e destinos provisórios) → validar (T061).
4. US5 (apresentação completa) → validar (T066).
5. Polish → T071, obrigatória para publicar; enquanto a P-01 não for resolvida, a publicação fica
   bloqueada, e as fases seguem normalmente com o aviso no `npm test`.

---

## Notes

- [P] = arquivos diferentes, sem dependência de tarefa incompleta.
- Commit ao fim de cada fase, só quando o mantenedor pedir, citando os IDs de requisito.
- Nenhum `style=`, script inline ou recurso externo nas páginas (T011 confere).
- Nenhum texto novo de interface sem aprovação do mantenedor.
