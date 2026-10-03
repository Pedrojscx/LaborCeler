# Data Model: Tela Inicial, Cadastro e Login

**Feature**: `002-tela-inicial-cadastro-login` | **Data**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Nenhuma mudança de esquema.** A feature só passa a preencher a tabela `tbcandidato`, que já
existe em `db/01-ddl.sql`. Os demais dados desta página não ficam no banco: sessão (cookie
assinado), contadores de tentativas (memória do app), segredo da sessão (arquivo num volume) e
textos (páginas estáticas).

## Candidato (`tbcandidato`, já existente)

| Coluna | Tipo | Origem e regra | Requisito |
|---|---|---|---|
| `id` | `serial` | gerado pelo banco | |
| `cpf` | `varchar(11)`, `unique`, `check ~ '^[0-9]{11}$'` | só os 11 dígitos, depois de `normalizarCpf`; dígitos verificadores válidos; recusa todos iguais | FR-006, FR-007 |
| `nome` | `varchar(150)` | aparado nas pontas; pelo menos duas palavras; letras, espaço, apóstrofo e hífen (research R11) | FR-008 |
| `email` | `varchar(254)` | formato simples, até 254; repetição entre candidatos permitida | FR-009 |
| `senha` | `varchar(255)` | só o hash `bcrypt` (custo 12); a senha nunca é guardada nem registrada | FR-010 |
| `data_cadastro` | `timestamp`, `default now()` | relógio do banco | sessão (R2) |
| `data_aceite_termos` | `timestamp not null` | `now()` do banco no mesmo `insert`, só com o aceite marcado | FR-011 |

- **Inserção**: um único `insert` parametrizado com `now()` para o aceite; a corrida de dois
  cadastros do mesmo CPF é resolvida pelo `unique` (erro `23505` vira "CPF já tem cadastro"), sem
  cadastro parcial (FR-030).
- **Leituras**: por CPF (login) e por `id` (sessão), sempre parametrizadas; a leitura por `id`
  devolve só `id`, `nome` e `data_cadastro`.
- **Nunca sai do servidor**: hash, CPF e e-mail não aparecem em nenhuma resposta desta feature;
  `GET /api/auth/me` devolve só o nome (Princípio VI).
- **Fora do escopo**: edição de perfil (decisão D5), recuperação de senha e exclusão pelo portal
  (pedidos pelo e-mail do projeto, P-01).

## Sessão (cookie `sessao`, sem tabela)

| Campo do token | Valor |
|---|---|
| `sub` | `id` do candidato |
| `cad` | `data_cadastro` em segundos |
| `iat`, `exp` | emissão e validade de 8 horas |

- **Estados**: ausente → válida (cadastro ou login) → expirada (8 horas) ou encerrada (sair); um
  token com `cad` que não confere com o cadastro atual é inválido (R2).
- **Cookie**: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Max-Age=28800`, `Secure` só com
  `PUBLIC_BASE_URL` em HTTPS.

## Tentativas de login (memória do app, sem tabela)

| Chave | Conteúdo | Regra |
|---|---|---|
| CPF normalizado e válido | instantes das falhas e fim do bloqueio | 5 falhas em 15 min bloqueiam por 15 min; sucesso zera (FR-017) |
| IP da conexão | contador do `express-rate-limit` | 60 falhas por minuto, login e cadastro separados (FR-017a) |

Some ao reiniciar o app (risco aceito no plano).

## Segredo da sessão (arquivo, sem tabela)

`/app/segredo/segredo-sessao` no volume `segredo_sessao`, permissão `0600`, ou `JWT_SECRET` do
ambiente com 32 caracteres ou mais (R4). Nunca versionado nem registrado em log.

## Conteúdo estático (páginas, sem tabela)

- **Termos de uso e privacidade** (`termos.html`): texto com a data da última atualização no topo
  e o contato; enquanto a P-01 não for resolvida, o marcador `[E-mail do projeto pendente: P-01]`
  no lugar do e-mail (research R15).
- **Destinos provisórios** (`app/src/routes/destinos-provisorios.js`): endereço → variação da
  página "Disponível em breve" (título e texto de cada uma, FR-024), removidos um a um pelas
  features que entregam os recursos (research R9).
- **Fatos das empresas**: textos da seção 9 de `docs/identidade-visual.md`, com fontes em
  `docs/referencias.md` (FR-033, FR-034); documentação do projeto, não dados.
