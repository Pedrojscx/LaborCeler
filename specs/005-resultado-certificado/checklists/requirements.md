# Specification Quality Checklist: Resultado, Certificado e Validação Pública

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

- Regras de negócio dadas pelo mantenedor (cálculo, aprovação, tentativas, emissão, certificado,
  validação, resultado, área do candidato, disponibilidade, segurança e testes) e decisões D1 e
  D2; nenhum marcador [NEEDS CLARIFICATION] foi necessário.
- Primeira iteração: falhou "All functional requirements have clear acceptance criteria" para o
  FR-022 (texto do bloco "Estudar antes" sem histórico), o FR-023 (link de validação real) e o
  FR-024 (histórico pela página "Disponível em breve"). Correções: cenário 6 da US1, cenário 5 da
  US3 e cenário 2 da US4. Segunda iteração: todos os itens aprovados.
- Exceções aceitas em "No implementation details", por virem das regras do mantenedor e da
  feature 001: rotas `/validar` e `/validar/[código]` (FR-016), `PUBLIC_BASE_URL` (FR-013),
  imagem vetorial embutida para o QR Code (FR-013), código aleatório gerado pelo banco (FR-004) e
  instrução para buscadores não indexarem (FR-019).
- Esquema conferido em PGlite (PostgreSQL 18) sobre o DDL atual mais a proposta da 004: a 005 não
  exige mudança própria; duas tentativas por candidato dependem da proposta da 004.
- Divergências entre as fontes resolvidas na spec (Assumptions): texto do aprovado com a data de
  emissão no lugar de "agora"; percentual com uma casa decimal também na área do candidato;
  situação "Interrompida" na lista tema a tema; "Revisar os temas que errei" levando à área de
  estudos; correção do 12º tema levando ao resultado.
- Decisões do mantenedor em 03/10/2026: mantidas as resoluções dos conflitos 1 a 9 entre as
  fontes; texto do histórico na página "Disponível em breve" (P-02, FR-024), também no protótipo
  (`EmBreve.dc.html`, opção "historico") e em `docs/telas.md`; textos da nova tentativa sem
  limite, sujeitos à D9 (P-03); D4 resolvida no dossiê pelo RF11 e pelo RF14 (P-04, FR-001).
  Resta a P-01 (proposta de modelo de dados da 004).
