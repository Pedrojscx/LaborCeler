# Research: Base Executável do Portal

**Feature**: `001-base-executavel` | **Data**: 2026-09-30 | **Plano**: [plan.md](plan.md)

Não havia nenhum NEEDS CLARIFICATION no Technical Context: a stack veio do dossiê
(`docs/dossie-sdd-borb.md`, seção 5 e notas da 4.1). Este documento registra as decisões de
detalhe e as armadilhas encontradas ao encaixar essa stack na spec.

## R1. Versão do Node.js

- **Decision**: imagem `node:24-bookworm-slim` (Node 24, LTS ativa em 30/09/2026).
- **Rationale**: o dossiê pede "a LTS vigente". O Node 26 só entra em LTS no fim de outubro de
  2026; até lá é a linha Current. A variante Debian slim (e não Alpine) evita problemas de
  compilação do `bcrypt` (dependência nativa) na feature 002.
- **Alternatives considered**: `node:26` (ainda não é LTS); `node:24-alpine` (menor, mas
  musl complica módulos nativos). Conferir a LTS de novo no `/speckit-implement`; se o Node 26
  já tiver virado LTS, a troca é só a tag da imagem.

## R2. Healthcheck do banco sem falso positivo

- **Decision**: `pg_isready -h 127.0.0.1 -U "$POSTGRES_USER" -d "$POSTGRES_DB"`, intervalo de 5 s,
  `start_period` de 30 s, 10 tentativas.
- **Rationale**: durante a primeira inicialização, a imagem oficial sobe um servidor
  temporário só no socket Unix para rodar os scripts de `/docker-entrypoint-initdb.d`. Um
  `pg_isready` sem `-h` usa o socket e responde "pronto" no meio da carga, liberando o `app`
  cedo demais. Forçando TCP (`-h 127.0.0.1`), o check só passa quando o servidor definitivo
  sobe, ou seja, depois do esquema e do seed. Isso atende FR-012.
- **Alternatives considered**: retry de conexão dentro do app (continua útil como defesa, mas
  não substitui o `depends_on: condition: service_healthy`); `sleep` fixo (frágil).

## R3. Carga inicial pelo `docker-entrypoint-initdb.d`

- **Decision**: montar `./db` inteiro como `/docker-entrypoint-initdb.d:ro`. A imagem executa
  os arquivos `*.sql` da raiz em ordem alfabética: `01-ddl.sql`, `02-seed-temas-materiais.sql`,
  `03-seed-questoes.sql`. Os scripts só rodam com o volume vazio (FR-011).
- **Rationale**: é o mecanismo nativo da imagem oficial, não exige código extra, e "só roda
  com volume vazio" é exatamente o comportamento de persistência pedido (FR-010, FR-011).
- **Armadilha**: se um script falhar na primeira carga, o container para, mas o diretório de
  dados já foi criado; na próxima subida a carga é pulada e o banco fica incompleto. Mitigação:
  (a) cada seed roda dentro de `begin; ... commit;`, para que uma falha não deixe meia carga
  daquele arquivo; (b) o README documenta `docker compose down -v` como recuperação; (c) o
  script de verificação acusa banco incompleto.
- **Alternatives considered**: migrations executadas pelo app na subida (mais código, e o
  dossiê/constituição pedem SQL carregado pelo banco); um serviço extra de "seed" (contraria a
  arquitetura de dois containers).

## R4. Volume e persistência

- **Decision**: volume nomeado `dados_banco` montado em `/var/lib/postgresql/data`. Por
  padrão, nenhuma porta do banco é publicada no host. Para inspeção com cliente SQL, o
  repositório traz `docker-compose.override.example.yml`, que publica o banco **apenas** em
  `127.0.0.1:5433` (→ 5432 do container). Quem quiser copia para
  `docker-compose.override.yml`, que o Compose carrega automaticamente e que fica no
  `.gitignore`.
- **Rationale**: volume nomeado sobrevive a `docker compose down`/`up` e a reinício da
  máquina; só `down -v` apaga (FR-010, FR-014). Não publicar a porta 5432 elimina conflito com
  um PostgreSQL instalado na máquina (caso-limite de porta ocupada); a verificação roda dentro
  dos containers. Ligar só em `127.0.0.1` impede acesso pela rede local; a porta 5433 evita
  conflito com um PostgreSQL instalado na 5432. O override é opcional, então não fere o
  "comando único" do Princípio V.
- **Alternatives considered**: bind mount `./pgdata` (já previsto no `.gitignore`, mas tem
  problemas de permissão em Linux e polui o clone).

## R5. IDs no seed

- **Decision**: o seed informa IDs explícitos e, no fim de cada arquivo, ajusta a sequência com
  `select setval(pg_get_serial_sequence('tbxxx', 'id'), (select max(id) from tbxxx));`.
  Faixas: temas 1–12; imagens de questões 1–48; questões 1–48; alternativas 1–192; imagens de
  material 101 em diante; materiais 1 em diante.
- **Rationale**: `tbimagem.arquivo` não é único no esquema, então não dá para achar a imagem
  da questão por subconsulta confiável. IDs explícitos deixam o SQL legível e escrito à mão,
  como nas aulas (RP02). As faixas separadas deixam o arquivo `03` substituível pela carga
  definitiva sem mexer no `02` (FR-009b).
- **Alternatives considered**: CTEs com `insert ... returning id` (verboso para 48 questões);
  subconsultas por texto (frágil).

## R6. Seed escrito à mão vs. gerado

- **Decision**: os arquivos `02` e `03` são SQL explícito, versionado e legível (`insert into
  ... values ...`), sem gerador de SQL. As imagens SVG podem ser geradas por um script de
  desenvolvimento (`app/scripts/gerar-svgs-provisorios.js`); a saída é commitada e o script não
  roda na subida.
- **Rationale**: o Princípio III exige DML escrito à mão; gerar SQL por script iria contra
  ele. Imagem não é SQL, então automatizar os 60 SVGs provisórios não viola nada e garante
  padrão visual.
- **Alternatives considered**: gerar o seed por script (rápido, mas viola RP02); desenhar os
  SVGs um a um (lento para conteúdo que será descartado).

## R7. Como marcar o conteúdo provisório

- **Decision**: enunciado das questões começa com `[PROVISÓRIO]`; título do material começa
  com `[PROVISÓRIO]`; todo SVG traz a faixa "PROVISÓRIO"; `tbimagem.credito` começa com
  `[PROVISÓRIO]` (`'[PROVISÓRIO] Autoria própria'`). Os nomes e descrições dos 12 temas **não** levam
  marca (são definitivos).
- **Rationale**: atende o cenário 2 da História 2 (conteúdo identificável como provisório) sem
  coluna nova no esquema. A mesma marca nas três tabelas permite à verificação contar
  questões, materiais e imagens ainda provisórios, e uma busca por `[PROVISÓRIO]` encontra tudo o que a carga
  definitiva precisa substituir.
- **Alternatives considered**: coluna `provisorio boolean` (muda o esquema, contraria FR-009b).

## R8. Caminho das imagens (padrão D7)

- **Decision**: `tbimagem.arquivo` guarda o caminho relativo à pasta pública, sem barra
  inicial: `img/questoes/tema01-q1.svg`, `img/materiais/tema01.svg`. O Express serve
  `app/public` em `/`, então a URL é `/` + `arquivo`.
- **Rationale**: o mesmo valor serve para montar a URL no front e para a verificação conferir
  o arquivo no disco (`app/public/` + `arquivo`).
- **Alternatives considered**: URL absoluta (quebra ao mudar host/porta); só o nome do
  arquivo (exige convenção de pasta implícita).

## R9. Variáveis de ambiente e funcionamento sem `.env`

- **Decision**: o `docker-compose.yml` usa `${VAR:-padrão}` em todas as variáveis (exceto `JWT_SECRET`), então
  `docker compose up` funciona sem `.env` (FR-015). `.env.example` documenta: `PORT` (3000),
  `PUBLIC_BASE_URL` (`http://localhost:3000`), `DATABASE_URL`
  (`postgres://portal:portal@db:5432/bdcertificacao`), `JWT_SECRET` (só documentado,
  vazio e sem valor padrão no Compose; ver pendência P1) e, além das quatro pedidas, `POSTGRES_USER`,
  `POSTGRES_PASSWORD` e `POSTGRES_DB`, que o serviço `db` precisa e que têm de bater com
  `DATABASE_URL`. `.env` continua no `.gitignore`.
- **Rationale**: atende "nenhum passo manual" (Princípio V) sem versionar segredo real.
- **Alternatives considered**: exigir `cp .env.example .env` (passo manual, viola FR-001).

## R10. Fuso horário

- **Decision**: `TZ=America/Sao_Paulo` nos dois serviços.
- **Rationale**: o esquema usa `timestamp` sem fuso com `default now()`. O `initdb` grava o
  `timezone` do servidor a partir do `TZ` do container; fixá-lo agora evita horários em UTC nas
  features 004–006 (o dossiê pede America/Sao_Paulo no histórico).
- **Alternatives considered**: migrar colunas para `timestamptz` (muda o esquema oficial; fica
  como possível decisão futura, não desta feature).

## R11. Verificação da carga

- **Decision**: um único módulo em Node, `app/src/verificacao/verificar-carga.js`, com:
  consultas SQL de contagem e de regra (12 temas com ordem 1–12 e nomes da seção 6; 4 questões
  por tema; 4 alternativas A–D por questão; exatamente 1 correta; ≥ 1 material por tema;
  imagem exclusiva por questão com texto alternativo) e checagem de que cada
  `tbimagem.arquivo` existe em `app/public`. Exposto de duas formas: comando
  `docker compose exec app npm run verificar-carga` (FR-016) e teste `node:test`.
- **Rationale**: o banco não enxerga os arquivos do app, então só o container do app consegue
  verificar FR-008. Um módulo só evita duas implementações divergentes.
- **Alternatives considered**: script `.sql` rodado no `db` (não confere arquivos); checagem
  automática a cada subida do app (atrasa a subida e mistura verificação com execução).

## R12. Testes

- **Decision**: `node:test` + `supertest` (dossiê seção 5), rodando dentro do container do app
  contra o banco do Compose: `docker compose exec app npm test`. Os testes desta feature só
  leem dados, então não sujam o banco.
- **Rationale**: banco de teste separado só passa a ser necessário quando houver testes que
  escrevem (features 002 e 004); criar agora seria antecipar estrutura (YAGNI).
- **Alternatives considered**: Testcontainers / serviço `db_teste` no Compose (adiado para a
  primeira feature com escrita).

## R13. O que fica de fora desta feature

`helmet`, `cookie-parser`, `jsonwebtoken`, `bcrypt`, `qrcode`, `express-rate-limit` e
`swagger-ui-express` são da stack do dossiê, mas nenhum requisito desta feature precisa deles.
Entram nas features que os usam. A documentação da API desta feature fica em
`docs/openapi.yaml` (só o endpoint de saúde); servi-la em `/api/docs` é da feature
transversal (RNF06).

## Pendências para features seguintes

### P1. `JWT_SECRET` sem valor padrão (feature 002)

- **Registro**: `JWT_SECRET` NÃO pode ter valor padrão. Um segredo padrão versionado permitiria
  a qualquer pessoa com acesso ao repositório forjar sessões válidas.
- **Situação na 001**: a variável só aparece no `.env.example`, vazia e comentada; o Compose
  não define padrão para ela, e o app da 001 não a lê.
- **A resolver na 002**: conciliar "sem padrão" com o Princípio V (subida sem passo manual) e
  FR-015 da 001. Caminhos a avaliar no plano da 002: gerar um segredo aleatório na primeira
  subida e guardá-lo em volume; ou o app recusar subir sem `JWT_SECRET` e o README incluir a
  criação do `.env` (o que exigiria emenda ao Princípio V). A decisão fica no plano da 002.
