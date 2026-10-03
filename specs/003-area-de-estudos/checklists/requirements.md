# Specification Quality Checklist: Área de Estudos

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

- Decisões do mantenedor antes da redação (2026-10-03): a 003 é concluída com a carga
  provisória, e o conteúdo definitivo e a conferência de coerência com as questões (RP07) ficam
  com a trilha de conteúdo; vídeos são opcionais por tema. Por isso nenhum marcador
  [NEEDS CLARIFICATION] foi necessário.
- Primeira iteração: falhou "All functional requirements have clear acceptance criteria" para o
  FR-010 (crédito das imagens), o FR-017 (blocos de flashcards ocultos), o FR-018 (destinos da
  002 substituídos), o FR-020 (cabeçalho do visitante) e o FR-024 (conteúdo na primeira subida).
  Também ficou vago o critério "fontes oficiais ou estáveis" do FR-011. Correções: cenários 1, 4,
  6 e 7 da US1, cenário 3 da US2, SC-011 e FR-011 com "fontes primárias". Segunda iteração: todos
  os itens aprovados.
- Exceções aceitas em "No implementation details", como na spec da 002: o kit em
  `app/public/kit` (FR-019), as menções a JavaScript inline, CDN, controles do navegador e
  domínios externos (FR-013, FR-016, FR-019, SC-006), que vêm dos Princípios II e XI, e o nome
  da ferramenta de IA no texto do aviso dos vídeos (FR-015), que é conteúdo exibido.
- Divergências entre as fontes resolvidas na spec (Assumptions): a trilha do Sistema Solar é
  calculada no protótipo, mas não é desenhada; o cabeçalho do visitante segue o protótipo
  ("Início" e "Entrar") e não `docs/telas.md` ("Voltar ao início"); `docs/telas.md` ainda trata as
  telas 7 e 8 como "a desenhar" (pendência P-01).
- Revisão com as decisões do mantenedor (2026-10-03): vídeos em MP4 720p de até cerca de 20 MB,
  no elemento de vídeo do HTML, com legenda WebVTT e transcrição obrigatórias e aviso do
  NotebookLM (FR-013 a FR-016); licença CC BY-SA 4.0 do conteúdo didático (FR-025); Markdown
  convertido e sanitizado no servidor, links externos com `rel="noopener noreferrer"` (FR-026);
  matriz de coerência para o RP07 (FR-027); tempo estimado sem campo novo (FR-005); regra de
  disponibilidade dos flashcards (FR-017). Novos critérios SC-012 a SC-014 e cenário 7 da US2.
  `docs/telas.md` 1.2 descreve as telas 7 e 8 (P-01 anterior resolvida). Proposta de modelo de
  dados em `proposta-modelo-de-dados.md`, validada em PGlite e não aplicada.
- Revalidação: todos os itens continuam aprovados. Exceções novas em "No implementation
  details", todas por decisão explícita do mantenedor: MP4, 720p, WebVTT, elemento de vídeo do
  HTML, Markdown, `rel="noopener noreferrer"` e os caminhos `LICENCA-CONTEUDO.md` e
  `docs/conteudo/matriz-de-coerencia.md`.
- Decisões de 2026-10-03 sobre os conflitos e o modelo de dados: legenda como faixa
  `<track kind="captions" srclang="pt-BR" default>` (FR-014); player como componente do kit
  (FR-016); aviso do NotebookLM só nos vídeos do NotebookLM (FR-015); leitura externa só com
  `https://` (FR-011); imagens referenciadas no Markdown pelo identificador, recusadas se não
  ligadas ao material (FR-026); duração lida do MP4 no servidor (FR-005); licença e matriz como
  entregáveis da implementação. Proposta de modelo de dados revisada e validada em PGlite.
  Revalidação: todos os itens continuam aprovados.
