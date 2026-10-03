# Specification Quality Checklist: Tela Inicial, Cadastro e Login

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-01
**Revalidated**: 2026-10-02 (revisão para a constituição 3.0.0 e a nova interface)
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

- Validação em 2026-10-01, primeira iteração: todos os itens passaram.
- Menções a "banco", "servidor", "navegador", "logs" e "clone limpo" (FR-004a, FR-020, FR-029,
  FR-030, SC-006, SC-008) descrevem o domínio e restrições da constituição (Princípios I, V e
  VI) e da feature 001, não escolhas de implementação; aceitas como exceção, como na spec 001.
- Nenhum marcador [NEEDS CLARIFICATION]: os pontos abertos tinham padrão razoável no dossiê
  (seção 4.2 e decisões D1, D5, D6, D8) ou na feature 001 e estão registrados em Assumptions.
  Os padrões com mais impacto, candidatos a confirmação no `/speckit-clarify`:
  - páginas "disponível em breve" para estudos, validação e início da certificação até as
    features 003 a 005 (FR-024);
  - estado do portal mantido de forma discreta na tela inicial, preservando o FR-013 da 001
    (FR-004a);
  - nome completo com pelo menos nome e sobrenome (FR-008), e-mail não único (FR-009), senha
    de 8 a 64 caracteres com confirmação (FR-010);
  - bloqueio de tentativas de login (FR-017), padrão substituído na revisão abaixo.
- Revisão do mantenedor (2026-10-01): padrões 1 (páginas "em breve"), 2 (estado do portal na
  tela inicial), 3 (campos do cadastro) e 5 (segredo de sessão) aceitos. Ajustes: FR-004b
  (regras e instruções em linguagem direta, sem metáfora astronômica) e FR-017/FR-017a
  (bloqueio por CPF, 5 falhas em 15 minutos, mais limite folgado por endereço de rede);
  SC-009 e SC-010 acrescentados. Revalidação: todos os itens continuam aprovados.
- Decisões do analyze (2026-10-02): FR-017a passa a valer também no cadastro, com 60 tentativas
  malsucedidas por minuto (sucessos não contam); FR-012 ganha o uso momentâneo do IP e o contato
  pela página de issues do repositório (substituído na revisão de 2026-10-02: canal privado,
  P-01); FR-026 deixa as regras de linguagem só no FR-004b; SC-001 é medido após a entrega.
  Revalidação: todos os itens continuam aprovados.
- FR-029 transforma a pendência P1 da feature 001 (`JWT_SECRET` sem valor padrão) em requisito:
  subida sem passo manual e nenhum segredo de sessão versionado ou com padrão conhecido; o
  "como" fica para o `/speckit-plan`.
- Revisão de 2026-10-02 (constituição 3.0.0, identidade visual 2.0, telas 1 a 6, protótipo e
  kit). Primeira iteração: falhou "All functional requirements have clear acceptance criteria",
  porque FR-038 (Entre e use 100%), FR-040 (perguntas frequentes) e FR-045 (texto sobre a senha)
  não tinham cenário próprio; foram acrescentados US1 cenário 8, US2 cenário 8 e US5 cenário 6.
  Segunda iteração: todos os itens aprovados.
- Exceções aceitas em "No implementation details", por decisão explícita do mantenedor: o kit em
  `app/public/kit` (FR-026), `LunarCeler.notificar` (FR-044) e a classe `lc-status--falha`
  (FR-004a). Menções a CDN, JavaScript inline, canvas e domínios externos (FR-026, FR-028,
  FR-032, SC-014) vêm dos Princípios II e XI da constituição, como as exceções da primeira
  validação.
- Nenhum marcador [NEEDS CLARIFICATION]. As pendências da spec são decisões externas,
  registradas com padrão ou bloqueio explícito.
- Decisões do mantenedor sobre o relatório da revisão (2026-10-02): notificações passam a ser
  infraestrutura do kit na 002 (`docs/telas.md`, item 21; P-08 removida); kit 1.1 com alvos de
  44 px e foco com afastamento de 3 px nos campos; texto da senha sem "cifrada" (FR-045);
  "Começar pelos estudos" leva à trilha até a 003 (FR-004); lista de "Entre e use 100%" conforme
  as features existem (FR-038); prazo de guarda adotado (FR-012; P-02 resolvida); Figma fora da
  ficha (FR-039; P-07 resolvida); P-01 confirmada como bloqueio da entrega (e-mail exclusivo do
  projeto, a criar); P-09 registrada para a 007; P-03 pesquisada, com três fatos sustentados só
  em parte (`docs/referencias.md`). Revalidação: todos os itens continuam aprovados; o SC-011 só
  passa a ser atendido depois da decisão sobre os textos de Google, Salesforce e Saab.
- Segunda rodada de decisões (2026-10-02): textos finais de Google, Salesforce e Saab, os cinco
  fatos sustentados em `docs/referencias.md` (P-03 resolvida; SC-011 atendível); regra geral de
  disponibilidade (FR-050, SC-016), com a página "Disponível em breve" como exceção para links;
  "Entre e use 100%" oculta até a primeira vantagem (FR-038). Novos cenários: US1 9, US4 8 e US5
  6 reescrito. Revalidação: todos os itens continuam aprovados.
- Decisões D1, D3 e D6 resolvidas com o professor (2026-10-03): FR-040 com as respostas sobre
  internet (texto da D6, pendência P-03 da spec 004) e sobre refazer (D1); FR-003 e cenário 4 da
  US1 sem a promessa de que perder a conexão encerra a questão; FR-047 com cinco estados;
  pendências P-04, P-05 e P-06 removidas. Revalidação: todos os itens continuam aprovados.
