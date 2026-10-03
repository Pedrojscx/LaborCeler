# Specification Quality Checklist: Fluxo da Certificação

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

- Regras de negócio dadas pelo mantenedor e pelo dossiê (R1 a R11); D1 e D6 seguem como padrões
  abertos com o professor (P-01, P-02), sem marcador [NEEDS CLARIFICATION], porque o padrão está
  definido.
- Primeira iteração: falhou "All functional requirements have clear acceptance criteria" para o
  FR-022 (destinos provisórios da 002) e o FR-028 (diálogo da própria página). Correções: cenário
  5 da US1 e cenário 2 da US5. Segunda iteração: todos os itens aprovados.
- Exceções aceitas em "No implementation details", por virem das regras do mantenedor e da
  constituição: cronômetro do kit com sincronização (FR-007), operações indivisíveis com bloqueio
  da certificação (FR-017), caixa de diálogo em vez da janela do navegador (FR-028) e as sugestões
  de banco em P-04, que são pendências para o mantenedor, não requisitos.
- Lacunas das fontes preenchidas na spec (Assumptions): pedido da página quando o tempo acaba
  (FR-009), repetição do mesmo pedido de abertura (FR-011), destino depois de "Interromper"
  (FR-012), retomada pela tela 9 (FR-020), estado "concluída" e correção do 12º tema (FR-018,
  FR-019).
- Decisões do mantenedor (2026-10-03): texto da tela 9 sobre fechar, recarregar e perda de conexão
  (FR-024, US5 cenário 5), levado ao professor junto da D6 e registrado como pendência para a 002
  (P-03); pedido repetido só na mesma sessão, com a mesma chave e em até 5 segundos, com botão
  desativado (FR-011); "Interromper" e retorno depois de recarga levam à correção "interrompida"
  (FR-012); cronômetro só anuncia marcos cruzados depois de começar (FR-026); acesso a dados de
  outro candidato recusado como recurso inexistente (FR-030, US2 cenário 6); testes de tema que
  não é o atual, de outro candidato e sem sessão (FR-029); justificativa conferida pela
  verificação da carga, AVISO enquanto provisória e ERRO depois (FR-031, SC-013). Proposta de
  modelo de dados da 004 validada em PGlite e não aplicada (P-04). Revalidação: todos os itens
  continuam aprovados.
- Decisões D1, D2, D3 e D6 resolvidas com o professor (2026-10-03): FR-002 com várias tentativas
  (reprovado depois de 24 horas, aprovado não refaz, uma em andamento), FR-005 com sorteio que
  prefere questões não vistas, FR-017 com bloqueio do candidato ao criar a certificação, FR-019
  com o estado "nova tentativa disponível", nova US6 (P3), SC-001 revisto e SC-014 novo; P-01,
  P-02 e P-03 resolvidas (a P-03 aplicada na spec da 002) e P-06 (D9, limite de tentativas)
  aberta. Proposta de modelo de dados com a troca da restrição de `tbcertificacao` e a consulta
  do sorteio, validadas em PGlite. Revalidação: todos os itens continuam aprovados.
