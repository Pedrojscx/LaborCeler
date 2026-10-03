# Specification Quality Checklist: Histórico da Certificação

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

- Regras de negócio dadas pelo mantenedor (várias tentativas, conteúdo, origem dos dados, questão
  aberta, caminho para estudar, segurança, interface, disponibilidade, testes e esquema) e
  decisões D1 e D4; nenhum marcador [NEEDS CLARIFICATION] foi necessário. As escolhas sem fonte
  ficaram como pendências (P-03 e P-04) e os desacordos entre as fontes, na seção "Conflitos
  entre as fontes".
- Primeira iteração: falhou "All functional requirements have clear acceptance criteria" para o
  FR-014 (nenhum dado cadastral na página), o FR-016 (enunciado recolhido) e o FR-020 (página
  "Disponível em breve" só para a 007). Correções: cenários 8 e 9 da US1 e cenário 4 da US5 (hoje 9 e 10 da US1 e 5 da US5).
  Segunda iteração: todos os itens aprovados.
- Exceções aceitas em "No implementation details", por virem das regras do mantenedor e das
  features anteriores: "relógio do servidor", tolerância de 152 segundos e encerramento
  preguiçoso (FR-008, da 004), endereço próprio por tentativa (FR-002) e referência a
  `proposta-modelo-de-dados.md` e ao fuso do `docker-compose.yml`.
- Esquema: o momento da interrupção não é gravado hoje. Proposta em `proposta-modelo-de-dados.md`
  (coluna própria em `tbresposta`, preenchida só na situação interrompida), com duas consultas de
  referência, executadas como estão em PGlite (PostgreSQL 18) sobre o DDL atual, as cargas e a
  proposta da 004: 23 verificações aprovadas, nenhuma falha. Não aplicada.
- Decisões do mantenedor (2026-10-03): conflitos 1, 2, 3, 5, 7 e 10 mantidos; datas em tabela
  "14/11/2026 19:02" e em frase "15/11/2026 às 14:23", como regra de escrita de `docs/telas.md`
  (conflito 4); endereço pelo número da tentativa do candidato, `/historico/2`, nunca o
  identificador interno (conflito 8; FR-002, FR-013, US2 cenários 2 e 6); nota no resumo
  (conflito 9; FR-003); P-02 com a coluna dedicada, recomendada e adotada, e horário registrado
  pelo aviso de interrupção da 004 (FR-007, US1 cenários 5 e 6); P-03 com "O resultado sai ao
  concluir os 12 temas"; P-04 com "Ver meu histórico" em "em andamento" e "nova tentativa
  disponível", nada no cabeçalho (FR-018, US5 cenário 2); P-05 com as telas 6 e 15 de
  `docs/telas.md` alinhadas. Spec ajustada ao `Historico.dc.html` atualizado pelo mantenedor
  (situação em linha própria, lista com data e percentual, nota, nome acessível com corpo e
  tema). Nova pendência P-06 (tela 4 e `AreaCandidato.dc.html`). Proposta revista (consultas
  pelo número da tentativa e consulta do aviso de interrupção) e revalidada em PGlite: 32
  verificações, nenhuma falha. Revalidação do checklist: todos os itens continuam aprovados.
