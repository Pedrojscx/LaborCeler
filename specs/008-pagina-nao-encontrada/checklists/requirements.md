# Specification Quality Checklist: Página Não Encontrada

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

- Regras de negócio dadas pelo mantenedor (seis regras no Input); nenhum marcador
  [NEEDS CLARIFICATION] foi necessário. As escolhas sem fonte ficaram como pendências (P-01 a P-03,
  padrões adotados a confirmar), e os desacordos entre as fontes, na seção "Conflitos entre as
  fontes" (6 itens).
- Primeira iteração: falhou "All functional requirements have clear acceptance criteria" para o
  FR-008 (páginas que deixaram de existir, `.html` e o arquivo da própria página) e o FR-015 (casos
  que continuam como estão), que só apareciam nos edge cases, e "Requirements are testable and
  unambiguous" para "404 curto" (FR-007). Correções: cenário 7 da US1, cenário 6 da US2 e a
  definição de "404 curto" no FR-007. Segunda iteração: todos os itens aprovados.
- Decisões do mantenedor (2026-10-03): P-01 com o cabeçalho conforme a sessão de quem pede, nunca
  o recurso, e `Cache-Control: private, no-store` com sessão (FR-020, FR-021 novos; cenário 4 da US1;
  SC-003 e SC-004); P-02 com 404 em texto puro, só "Não encontrado" (FR-007); P-03 com o resultado
  coberto pela regra do FR-025 da 005 (FR-013); P-04 com a tela 20 e a nota da 003 alinhadas em
  commit próprio; P-05 com a seção "Dependências" (nenhum plano da 003, 005 ou 006 existe ainda);
  banco indisponível com 503, `Retry-After` e página própria, sem ecoar o endereço (FR-022 novo;
  cenário 7 da US2; SC-007). Nova pendência P-06 (textos e protótipo da página de instabilidade).
  Terceira iteração: todos os itens aprovados.
- Exceções aceitas em "No implementation details", por virem das regras do mantenedor e da feature
  001: código HTTP 404 e 503, instrução noindex, `Cache-Control`, `Content-Type`, `Retry-After`,
  `/api` e o JSON `{"erro": "Rota não encontrada"}`.
- Esquema: nenhuma mudança; a feature só consulta, pelas regras das features 003, 005 e 006, se o
  recurso do endereço existe e é do candidato. Sem proposta de modelo de dados nem validação em
  PGlite.
