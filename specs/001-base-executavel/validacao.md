# Registro de validação: 001-base-executavel

**Feature**: [spec.md](spec.md) · **Roteiro**: [quickstart.md](quickstart.md) · **Data**: 01/10/2026

Registro das validações da feature e da autoverificação da Definition of Done (constituição
2.0.2), para citar no PR. Requisitos: RNF07, RP02, RP04, RP05, RP06, RNF06; apoio a RF06 e RF08.

## Validações com Docker (executadas pelo mantenedor)

| Tarefa | Cenário do quickstart | Resultado |
|---|---|---|
| T021 | 1: subida a partir de clone limpo do GitHub | `docker compose up -d --wait` em **1min53s** sem cache, dos quais 66 s de pull do `postgres:16`; `db` e `app` `healthy`; `/api/saude` com `status: ok`, `banco: ok`, contagens zeradas e `cargaCompleta: false` (os seeds ainda não existiam); página com "Portal no ar", "Banco conectado" e aviso de carga incompleta; `npm test`: 5 pass, 1 skip (imagem, aguardando os SVGs da US2), 0 fail |
| T032 | 2: conteúdo carregado e íntegro (clone limpo, `--build`) | `verificar-carga`: 8 `OK` + 1 `AVISO` (48 questões, 12 materiais e 60 imagens provisórias), código 0; `npm test`: 13 pass, 0 skip, 0 fail; `/api/saude`: 12 / 48 / 192 / 12, `provisorio: true`, `cargaCompleta: true`; SVG `tema07-q2` servido corretamente |
| T035 | 3: persistência (clone limpo) | candidato de teste presente nos 3 ciclos `down`/`up` (contagem 1 em todos), cada `up -d --build --wait` em ~11,5 s (SC-004, SC-005), nome com acento preservado |
| T035 | 4: recriar o banco do zero | após `down -v`, 0 candidatos; `verificar-carga` com 8 `OK` + 1 `AVISO`, código 0 |
| T035 | 6: acesso opcional ao banco | com o override, `docker compose port db 5432` → `127.0.0.1:5433` e `ss` com escuta só em `127.0.0.1`; sem o override, o comando retorna erro (`invalid IP:0`), porta não publicada |
| T038 | 1 e 2: clone limpo cronometrado (SC-001, ≤ 10 min) | evidência combinada: o tempo de **1min53s** do T021 e o conteúdo completo do T032, também a partir de clone limpo. **Ressalva**: o tempo foi medido com o código das fases 1 a 3, ainda sem os seeds; a carga completa não foi cronometrada a partir de clone limpo, mas a margem até o limite de SC-001 é de mais de 8 minutos. **A medição completa está adiada para a validação final antes da entrega** |

### Achados durante a validação

- **Imagem do app desatualizada (cenário 2)**: sem `--build`, o Compose reaproveitou a imagem
  `<pasta>-app` de uma execução anterior com o mesmo nome de projeto. Correção: `pull_policy:
  build` no serviço `app` (Compose ≥ v2.0.0, sem mudar o piso) e `docker compose up -d --build
  --wait` documentado no README e no quickstart (research R16).
- **Plugin `docker buildx`**: sem ele, o Compose usa o builder clássico e emite aviso;
  registrado como recomendado no README (research R14).

## Validação complementar sem Docker

O ambiente do assistente não tinha acesso ao daemon Docker. Para não deixar o SQL sem execução
antes da validação do mantenedor, `01-ddl.sql`, `02` e `03` foram carregados no PGlite 0.5.8
(PostgreSQL 18.3 compilado para WASM, fora do repositório). Resultados: carga sem erro;
`verificar-carga` idêntico ao exemplo do contrato, código 0; `npm test` com 13 pass, 0 skip,
0 fail; carga parcial do cenário 5 (alternativa correta duplicada) com o `03` desfeito
inteiro, `verificar-carga` com código 1 e `/api/saude` com `cargaCompleta: false`; banco
inacessível com código 2; página inicial e SVGs conferidos no Chromium (celular e desktop).
Não substitui as validações com Docker acima: o alvo é o PostgreSQL 16.

## Verificação de versões (T036)

Em 01/10/2026, `nodejs.org/dist/index.json`: a linha 26 ainda é Current (v26.10.0, de
21/09/2026, `lts: false`), e o Node 24 é a LTS ativa (v24.21.0, "Krypton"). A imagem continua
`node:24-bookworm-slim`, e não há troca de versão a revalidar (research R1).

## Autoverificação da DoD (T039)

Conferência feita pelo Claude Code como revisor, como a constituição permite. **O autor
confirma antes do merge na `main`.**

| Item | Verificação | Resultado |
|---|---|---|
| Princípio I: servidor é a autoridade | `/api/saude` devolve só contagens, `provisorio` e `cargaCompleta`; a única menção a `tbalternativa` nas rotas, repositórios e front é um `count(*)`; a verificação da carga é só CLI, sem rota HTTP | ✅ |
| Princípio II: front sem frameworks, mobile-first | `index.html`, `estilo.css` e `inicio.js` puros, sem script ou estilo externo; CSS com base para telas estreitas e `@media (min-width: 768px)` | ✅ |
| Princípio III: SQL explícito, sem ORM | dependências: `express` e `pg` (dev: `supertest`); seeds escritos à mão; `db/01-ddl.sql` sem nenhuma alteração desde o commit original (`e450fd7`); nenhuma interpolação de valores em SQL; `consultar(sql, parametros)` sempre parametrizado | ✅ |
| Princípio IV: dados derivados não armazenados | nenhuma coluna nova, nenhuma escrita no banco pelo app; `cargaCompleta` calculado na rota | ✅ |
| Princípio V: um único `docker compose up` | T021 e T038 (clone limpo, sem `.env` nem passo manual) | ✅ |
| Princípio VI: LGPD | a carga não toca as tabelas de uso (regra "tabelas de uso vazias" `OK` no T032); o candidato de teste do quickstart usa hash bcrypt fixo; nenhum log de dado pessoal | ✅ |
| Pendência P1: `JWT_SECRET` | ausente do Compose, não lida pelo `config.js`, vazia no `.env.example` | ✅ |
| Princípio VIII: rastreabilidade | spec, plano e todas as 40 tarefas citam IDs; **5 commits já publicados não citam IDs** (`57e3427`, `ea14a40`, `a8bc594`, `f2387b4`, `1fc9e8f`); o PR deve citar todos os IDs da feature | ⚠️ observação |
| Princípio IX: testes de regras críticas | as regras críticas (sorteio, 150 s, nota, certificado) não fazem parte desta feature; a verificação da carga e `/api/saude` têm testes | ✅ (n/a) |
| Princípio X: padrões | identificadores de domínio, banco, mensagens e textos em português; nomes estruturais da stack conforme a emenda 2.0.2; esquema com `tb`/`id`/`idtabela` | ✅ |
| DoD 2: testes passando | 13 pass, 0 skip, 0 fail no T032 (Docker); o código do app não mudou depois disso | ✅ |
| DoD 4: documentação da API | `docs/openapi.yaml` com `/api/saude` e schemas idênticos ao contrato (incluindo `cargaCompleta`) | ✅ |
| DoD 5: requisitos marcados no backlog | depende do T040 | ⏳ pendente |

## Adiado para a validação final antes da entrega

Decisão do mantenedor (01/10/2026): encerrar a feature 001 e seguir para a 002, deixando duas
validações com Docker para uma rodada final antes da entrega:

- **T037**: casos-limite do cenário 5 (porta alternativa, banco parado e retomado, carga com
  erro e nova subida sem `-v`).
- **T038, medição completa**: clone limpo cronometrado já com a carga completa (cenários 1 e 2).

As duas estão automatizadas em [`scripts/validar-001.sh`](../../scripts/validar-001.sh), que
roda em um clone limpo, numa pasta temporária e com o projeto Compose `validar001`, sem tocar
na cópia de trabalho; o resultado da rodada final deve ser registrado aqui. Para medir "sem
cache", remover antes as imagens `postgres:16` e `node:24-bookworm-slim` (instruções no
cabeçalho do script).

Antes da validação final, conferir no navegador, com `MANTER=1`, o aviso "Carga incompleta"
na página inicial, que o script não consegue verificar sozinho (é exibido pelo JavaScript).

## Pendências

- **T040** (backlog): o repositório ainda não tinha issues quando a feature foi encerrada;
  depende do `/speckit-taskstoissues`. O PR da feature cita os requisitos atendidos.
