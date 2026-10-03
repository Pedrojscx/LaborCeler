# Registro de validação: 002-tela-inicial-cadastro-login

**Feature**: [spec.md](spec.md) · **Roteiro**: [quickstart.md](quickstart.md) · **Tarefas**: [tasks.md](tasks.md)

Registro das validações da feature, fase a fase, para citar no PR. Requisitos: RF01 a RF04,
RNF01, RNF03; Princípios V e IX.

## Validações com Docker (executadas pelo mantenedor)

| Tarefa | Fase | Resultado |
|---|---|---|
| T030 | 2: fundação (03/10/2026, Docker com `sudo`, builder clássico) | ver abaixo |

### T030: fundação

Comandos: `docker compose up -d --build --wait`, `docker compose exec app npm test`, conferência
do volume, do arquivo e do log do segredo, hash do segredo antes e depois de `down`/`up`, e as
checagens rápidas por `curl`.

| Conferência | Esperado | Obtido |
|---|---|---|
| Build e subida | imagem construída sem recursos do BuildKit; `db` e `app` `healthy` | builder clássico, passo `RUN mkdir -p /app/segredo && chown node:node /app/segredo` executado; `laborceler-db-1` e `laborceler-app-1` `Healthy` |
| `npm test` | todos passam; o único pulado é o título do `index.html` da 001 (até a T032); sem aviso do marcador, porque `termos.html` só nasce na T047 | 58 testes: 57 pass, 1 skip (`index.html: título termina em "· Lunar Celer"`), 0 fail; nenhum bloco de aviso |
| Volume do segredo (FR-029) | `segredo_sessao` criado | `local laborceler_segredo_sessao` |
| Arquivo do segredo | gerado com `0600`, dono `node` | `-rw------- 1 node node 86 ... segredo-sessao` (64 bytes em base64url) |
| Segredo fora do log | `0` ocorrências em `docker compose logs app` | `0` |
| Segredo mantido em `down`/`up` | hash igual antes e depois | `43877c87…48f4aa` nos dois |
| CSP (FR-028, research R7) | a do contrato, sem `upgrade-insecure-requests` em HTTP | `default-src 'self';script-src 'self';style-src 'self';font-src 'self';img-src 'self' data:;form-action 'self';frame-ancestors 'self';object-src 'none';base-uri 'self'` |
| `Cache-Control` de `/` | `no-store` | `no-store` |
| `/estudos` (FR-024) | variação "estudos" da página "Disponível em breve" | `<h1>A área de estudos está a caminho</h1>` |
| `/candidato` sem sessão (FR-023) | `302` para `/entrar` | `302 /entrar` |

Observações:

- O `npm ci` da imagem (npm 11.19) avisa que o script de instalação do `bcrypt` 6.0.0 ainda não
  está coberto por `allowScripts`. O pacote traz binários prontos (`prebuilds/linux-x64`), que
  o `node-gyp-build` carrega ao importar; nenhum código da fundação usa o `bcrypt`, então o
  carregamento no container é conferido na validação da US2 (T048).
- A linha "Aviso: carga incompleta..." na saída dos testes vem do caso `(c)` de
  `saude.test.js`, que simula a carga incompleta: é o log esperado do FR-004a.
- A saída completa ficou em `t030.txt`, na raiz do clone do mantenedor (não versionado).

## Validação complementar sem Docker

Antes da T030, a suíte da fundação rodou num PostgreSQL 16.14 real, sem Docker (pacote npm
`@embedded-postgres/linux-x64`, fora do repositório), com o DDL e os seeds de `db/`: 58 testes,
57 pass, 1 skip, 0 fail. Também conferido à mão: o `npm test` mantém o código `1` de um teste
que falha mesmo com o aviso rodando depois; com o marcador na página, o bloco de aviso aparece
no fim; `JWT_SECRET` curta impede a subida com código `1`; com a carga incompleta, o aviso vai
para o log uma vez na subida, não a cada pedido.
