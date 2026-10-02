> **⚠ DESATUALIZADO (2026-10-02).** Este artefato foi gerado a partir da versão anterior da
> spec, antes da constituição 3.0.0, da identidade visual 2.0 e do kit de interface, e não vale
> como referência. Será regenerado depois que todas as specs estiverem prontas.

# Data Model: Tela Inicial, Cadastro e Login

**Feature**: `002-tela-inicial-cadastro-login` | **Fonte da verdade do esquema**:
[`db/01-ddl.sql`](../../db/01-ddl.sql)

Esta feature **não altera o esquema**: passa a gravar e ler `tbcandidato`, que já existe. Os
demais dados (sessão, tentativas de login, segredo) ficam fora do banco, como descrito abaixo.

## Candidato (`tbcandidato`, esquema oficial)

| Coluna | Tipo no DDL | Regra desta feature | Origem |
|---|---|---|---|
| `id` | `serial` | gerado pelo banco | — |
| `cpf` | `varchar(11) not null unique`, `check (cpf ~ '^[0-9]{11}$')` | só os 11 dígitos; dígitos verificadores válidos; todos iguais recusado | FR-006, FR-007 |
| `nome` | `varchar(150) not null` | `trim`, espaços internos repetidos viram um; pelo menos 2 palavras; até 150 caracteres; letras (com acento), espaço, apóstrofo (`'` ou `’`) e hífen | FR-008 |
| `email` | `varchar(254) not null` | `trim`; formato `local@dominio.tld`; até 254 caracteres; **não** é único | FR-009 |
| `senha` | `varchar(255) not null` | hash `bcrypt` custo 12 (60 caracteres); nunca a senha digitada | FR-010, R5 |
| `data_cadastro` | `timestamp not null default now()` | preenchida pelo banco | — |
| `data_aceite_termos` | `timestamp not null` | `now()` do servidor no momento do cadastro, só com aceite marcado | FR-011 |

### Regras da senha (antes do hash, não armazenada)

- 8 a 64 caracteres, contados por ponto de código (`[...senha].length`).
- No máximo 72 bytes em UTF-8 (`Buffer.byteLength(senha, 'utf8')`), por causa do limite do
  `bcrypt` (R5).
- Igual ao campo de confirmação, que também não é armazenado.

### Operações (SQL puro, sempre parametrizado)

| Operação | Uso | Observação |
|---|---|---|
| inserir candidato | cadastro | `insert ... values ($1, $2, $3, $4, now()) returning id, nome, data_cadastro`; erro `23505` em `cpf` vira "CPF já cadastrado" (`409`) |
| buscar por CPF | login | devolve `id`, `nome`, `senha`, `data_cadastro` |
| buscar por id | sessão | devolve `id`, `nome`, `data_cadastro`; o app compara em JS `Math.floor(data_cadastro / 1000) === cad` para confirmar que o token pertence a um cadastro que ainda existe (R2) |

## Sessão do candidato (fora do banco)

Token JWT HS256 no cookie `sessao` (R2):

| Campo | Conteúdo |
|---|---|
| `sub` | id do candidato |
| `cad` | `data_cadastro` do candidato, em segundos desde 1970 |
| `iat` / `exp` | emissão e expiração (emissão + 8 h) |

Atributos do cookie: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800`, `Secure` só quando
`PUBLIC_BASE_URL` é HTTPS.

Estados:

```text
(sem cookie) --cadastro ou login--> ATIVA --8 h--> EXPIRADA
                                      |                |
                                      +--sair-->  (sem cookie)
ATIVA --segredo trocado ou cadastro inexistente--> INVÁLIDA (cookie apagado)
```

## Tentativas de login por CPF (memória do app)

| Campo | Conteúdo |
|---|---|
| chave | CPF normalizado (11 dígitos válidos), cadastrado ou não |
| `falhas` | instantes das falhas nos últimos 15 minutos |
| `bloqueadoAte` | instante até o qual o CPF fica bloqueado (5ª falha + 15 min) |

Regras (FR-017): a 5ª falha em 15 minutos bloqueia por 15 minutos; durante o bloqueio, a senha
não é conferida; sucesso zera o registro; limpeza a cada 5 minutos; teto de 50 000 entradas.
Os dados somem quando o app reinicia (aceito no MVP).

## Limite por endereço de rede (memória do `express-rate-limit`)

60 tentativas **malsucedidas** por minuto por IP (respostas com status a partir de 400; as
bem-sucedidas não contam), contadas separadamente para `POST /api/auth/login` e
`POST /api/auth/cadastro` (FR-017a, R6).

## Segredo da sessão (volume `segredo_sessao`)

| Fonte | Prioridade | Regra |
|---|---|---|
| `JWT_SECRET` do ambiente | 1 | usada se não vazia; menos de 32 caracteres impede a subida |
| arquivo `segredo-sessao` na pasta do segredo (`/app/segredo`, ou `PASTA_SEGREDO` fora do container) | 2 | lido se existir |
| geração na subida | 3 | 64 bytes aleatórios em base64url, gravados com permissão `0600` |

`docker compose down` preserva o volume (sessões continuam válidas); `docker compose down -v`
apaga o volume e invalida todas as sessões (R4).

## Termos de uso e privacidade

Texto estático em `/termos`, com data de vigência no topo. O aceite é registrado só pela data e
hora em `tbcandidato.data_aceite_termos`; mudar o texto no futuro exige atualizar a data de
vigência (a versão vigente em cada aceite pode ser deduzida pela data).

## Regras garantidas pelo banco vs. pelo app

| Regra | Banco (DDL) | App |
|---|---|---|
| CPF com 11 dígitos | `check (cpf ~ '^[0-9]{11}$')` | normaliza e valida antes |
| CPF único, inclusive em cadastros simultâneos | `unique` | traduz `23505` em `409` |
| dígitos verificadores, dígitos repetidos | — | `validarCpf` (R9) |
| nome, e-mail, senha | só tamanho e `not null` | validação do cadastro |
| aceite dos termos | `data_aceite_termos not null` | só grava com o aceite marcado |
