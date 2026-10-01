# Data Model: Base Executável do Portal

**Feature**: `001-base-executavel` | **Fonte da verdade**: [`db/01-ddl.sql`](../../db/01-ddl.sql)

Esta feature **não altera o esquema**. O DDL oficial é carregado sem mudanças; aqui ficam só o
que a carga inicial grava em cada tabela e as regras que a verificação confere. Constraints e
tipos completos estão no DDL e no Modelo Lógico (`docs/modelagem/`).

## Ordem de carga

| Arquivo | Conteúdo | Natureza |
|---|---|---|
| `db/01-ddl.sql` | esquema completo (10 tabelas, índice parcial, trigger) | oficial, sem mudança |
| `db/02-seed-temas-materiais.sql` | `tbtema`, imagens de material em `tbimagem`, `tbmaterial`, `tbmaterial_por_imagem` | temas definitivos; materiais provisórios |
| `db/03-seed-questoes.sql` | imagens de questão em `tbimagem`, `tbquestao`, `tbalternativa` | provisório; substituído inteiro pela carga definitiva |

Cada seed roda em `begin; ... commit;` e termina com `setval` das sequências que usou
(research R5).

## Entidades carregadas

### tbtema (12 linhas, definitivas)

| id / ordem | nome |
|---|---|
| 1 | Fundamentos da Agilidade |
| 2 | Manifesto Ágil |
| 3 | Introdução ao Scrum |
| 4 | Papéis do Scrum |
| 5 | Eventos do Scrum |
| 6 | Artefatos do Scrum |
| 7 | User Stories |
| 8 | Gestão do Product Backlog |
| 9 | Kanban |
| 10 | Planejamento Ágil |
| 11 | Métricas Ágeis |
| 12 | Qualidade em Projetos Ágeis |

- `id` = `ordem` na carga inicial. `descricao`: frase curta sobre o tema (≤ 500 caracteres),
  sem marca de provisório.

### tbimagem

| Faixa de id | Uso | `arquivo` | `texto_alternativo` | `credito` |
|---|---|---|---|---|
| 1–48 | uma por questão | `img/questoes/temaNN-qK.svg` (NN = 01–12, K = 1–4) | descreve o que a imagem mostra | `[PROVISÓRIO] Autoria própria` |
| 101–112 | uma por tema, para o material | `img/materiais/temaNN.svg` | idem | idem |

- `arquivo` é relativo a `app/public/`; a URL pública é `/` + `arquivo` (research R8).
- Regra verificada: todo `arquivo` existe em `app/public/`.

### tbmaterial (≥ 12 linhas, provisórias)

- Pelo menos 1 por tema; carga inicial: 1 material `TEXTO` por tema, `ordem` = 1.
- `titulo` começa com `[PROVISÓRIO]`; `conteudo` em Markdown simples (padrão da spec 003).
- `tbmaterial_por_imagem`: cada material do tema NN liga-se à imagem `100 + NN`.

### tbquestao (48 linhas, provisórias)

- `id` 1–48; questão `id = (tema − 1) × 4 + K`; `idimagem` = mesmo número do `id`.
- `enunciado` começa com `[PROVISÓRIO]`; `justificativa` preenchida (curta).
- Regras verificadas: exatamente 4 por tema; `idimagem` exclusiva (já garantido por `unique`).

### tbalternativa (192 linhas, provisórias)

- `id` 1–192; alternativas da questão Q têm `id` de `(Q − 1) × 4 + 1` a `(Q − 1) × 4 + 4`, letras
  A–D nessa ordem.
- Exatamente uma `correta = true` por questão (garantido pelo índice parcial
  `ux_alternativa_correta`). A letra correta varia entre as questões (não é sempre A).
- Regra verificada: exatamente 4 alternativas por questão, letras A, B, C e D.

### Tabelas de uso (vazias na carga)

`tbcandidato`, `tbcertificacao`, `tbcertificado`, `tbresposta`: criadas pelo DDL, sem linhas.
A verificação confere que continuam vazias logo após uma subida limpa (nenhum dado pessoal
na carga, Princípio VI).

## Regras garantidas pelo banco vs. pela verificação

| Regra (spec) | Banco (DDL) | Verificação (FR-016) |
|---|---|---|
| 12 temas, ordem 1–12 (FR-004) | `check (ordem between 1 and 12)`, `unique` | contagem = 12 e nomes da seção 6 |
| 4 questões por tema (FR-005) | — | contagem por tema = 4 |
| imagem exclusiva por questão (FR-005) | `unique (idimagem)` | — |
| 4 alternativas A–D (FR-006) | `check letra`, `unique (idquestao, letra)` | contagem por questão = 4 |
| exatamente 1 correta (FR-006) | índice parcial garante "no máximo 1" | "pelo menos 1" por questão |
| ≥ 1 material por tema (FR-007) | — | contagem por tema ≥ 1 |
| arquivo de imagem existe (FR-008) | — | `fs` em `app/public/` |
| conteúdo provisório marcado (FR-009) | — | `AVISO` (nunca `ERRO`) com a contagem de questões (`enunciado`), materiais (`titulo`) e imagens (`credito`) que começam com `[PROVISÓRIO]`; checagem antes da entrega final |

## Transições de estado

Nenhuma nesta feature: os estados de `tbresposta.situacao` (EXIBIDA → RESPONDIDA / EXPIRADA /
INTERROMPIDA) são da feature 004.
