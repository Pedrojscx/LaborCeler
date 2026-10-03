# Specification Quality Checklist: Flashcards e Perfil

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-03
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

- Regras de negócio dadas pelo mantenedor (17 regras no Input). Na primeira versão, um marcador
  [NEEDS CLARIFICATION] ficou no FR-023 (P-01): as regras 2 (só duas tabelas) e 9 ("Primeira
  órbita" é a primeira sessão concluída) não cabiam juntas, porque o histórico de revisões não
  registra sessões.
- Primeira iteração: falharam "All functional requirements have clear acceptance criteria", para
  a ordem da fila (FR-009 a FR-011) e o comportamento com leitor de tela (FR-017), e "Requirements
  are testable and unambiguous", para "telas estreitas" e "telas largas" (FR-015 e FR-016).
  Correções: cenário 7 da US1 e cenário 10 da US2; limite de 600 px, o do protótipo, nos FR-015 e
  FR-016. Segunda iteração: todos os itens aprovados, exceto o marcador em aberto.
- Decisões do mantenedor (2026-10-03): P-01 com a sessão registrada numa terceira tabela e
  "Primeira órbita" na primeira sessão concluída (FR-020, FR-023, FR-034, FR-035, FR-041, FR-045);
  P-03 a P-08 confirmadas, inclusive "Explorador da Terra" (só Terra leva artigo); P-10 sem novo
  aceite dos termos, com aviso único a quem já tinha conta (FR-045a novo, cenário 9 da US8, SC-016).
  O aviso único exige gravar o momento do aviso, o que a proposta faz com uma coluna em
  `tbcandidato`. Conflitos 3, 7, 11, 12 e 13 resolvidos e conflito 14 acrescentado. Terceira
  iteração: todos os itens aprovados; pendências abertas só P-02 (revisão da proposta, bloqueia o
  plano), P-09 (alinhamento de `docs/telas.md` e dos protótipos) e P-11 (fora desta feature).
- P-09 resolvida (2026-10-03): `docs/telas.md` 1.6 e os protótipos das telas 12, 15 a 19 e 21
  alinhados às decisões; `docs/prototipo/` passa a ser a fonte da verdade do protótipo. FR-045a e a
  proposta registram a regra do aviso dos termos pela versão vigente (avisa quem se cadastrou antes
  dela e ainda não foi avisado). Quarta iteração: todos os itens continuam aprovados; pendências
  abertas só P-02 e P-11.
- Exceções aceitas em "No implementation details", por virem das regras do mantenedor e das
  features anteriores: nomes das tabelas propostas (`tbflashcard`, `tbsessao_revisao`,
  `tbrevisao`), "relógio do servidor", "carga SQL", o fuso do `docker-compose.yml` e a referência a
  `proposta-modelo-de-dados.md`.
- Esquema: proposta em `proposta-modelo-de-dados.md` (`tbflashcard`, `tbsessao_revisao`,
  `tbrevisao`, `data_aviso_termos` em `tbcandidato`, duas views de cálculo, consultas de referência
  de domínio, fila, 14 dias, raridade e aviso dos termos, e verificação da carga), executada como
  está em PGlite (PostgreSQL 18) sobre o DDL atual, as cargas e as propostas da 004 e da 006: 79
  verificações aprovadas, nenhuma falha. A variante sem sessão registrada também foi validada antes
  da decisão P-01 (74 verificações) e ficou entre as alternativas. Não aplicada.
