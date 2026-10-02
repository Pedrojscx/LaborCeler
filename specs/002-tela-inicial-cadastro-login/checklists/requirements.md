# Specification Quality Checklist: Tela Inicial, Cadastro e Login

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-10-01
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
  pela página de issues do repositório; FR-026 deixa as regras de linguagem só no FR-004b; SC-001
  é medido após a entrega. Revalidação: todos os itens continuam aprovados.
- FR-029 transforma a pendência P1 da feature 001 (`JWT_SECRET` sem valor padrão) em requisito:
  subida sem passo manual e nenhum segredo de sessão versionado ou com padrão conhecido; o
  "como" fica para o `/speckit-plan`.
