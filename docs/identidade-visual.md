# Identidade visual: Portal de Certificação (tema Lua)

Decidido em 01/10/2026 pelo mantenedor. Vale para as features 002 a 006.

## Princípio
O tema astronômico é moldura de experiência, nunca conteúdo. Termos ágeis (Sprint, Product Owner, Backlog etc.) nunca são trocados por metáforas. O nome oficial do tema aparece sempre junto do corpo celeste, no formato "Ceres · Eventos do Scrum", nunca só o planeta.

## Mapeamento dos 12 temas (ordem de distância do Sol)
| Ordem | Corpo | Tema | Cor |
|---|---|---|---|
| 1 | Mercúrio | Fundamentos da Agilidade | #B5B0A8 |
| 2 | Vênus | Manifesto Ágil | #E8C77A |
| 3 | Terra | Introdução ao Scrum | #4F8FD9 |
| 4 | Marte | Papéis do Scrum | #D9644A |
| 5 | Ceres | Eventos do Scrum | #8C8A86 |
| 6 | Júpiter | Artefatos do Scrum | #D9A066 |
| 7 | Saturno | User Stories | #E3C98E |
| 8 | Urano | Gestão do Product Backlog | #7FD4D9 |
| 9 | Netuno | Kanban | #4A6FD9 |
| 10 | Plutão | Planejamento Ágil | #C9A98C |
| 11 | Makemake | Métricas Ágeis | #C46F5E |
| 12 | Éris | Qualidade em Projetos Ágeis | #D8D8E0 |

Depende da decisão aberta D3 (quais 12 temas); se o professor mudar a lista, o mapeamento acompanha a ordem.

## A Lua como indicador de progresso
A Lua é o elemento central. Na certificação, ela representa o progresso (RF21): cada tema concluído ilumina 1/12 do disco, da Lua nova (0) à Lua cheia (12). A iluminação reflete temas CONCLUÍDOS, nunca acertos, para não revelar nota parcial durante a prova.

## Telas
- Inicial (RF01): Lua grande sobre céu escuro, regras da certificação e dois caminhos: estudar ou iniciar.
- Área de estudos (RF07): os 12 corpos como trajetória a partir do Sol. Desktop: órbitas estilizadas. Celular: lista vertical em ordem, sem órbitas.
- Questão (RF10): cronômetro como anel orbital que se esvazia ao redor de uma Lua pequena, SEMPRE com os segundos em número ao lado. A imagem da questão fica num painel de fundo claro para preservar o contraste dos diagramas.
- Correção (RF09, RF11): acerto e erro com ícone e texto, além da cor.
- Resultado (RF16, RF17): aprovado vê a Lua cheia; reprovado vê a fase alcançada e o caminho de volta para os estudos.
- Certificado (RF18): selo lunar; versão clara obrigatória para impressão (@media print).
- Validação pública (RF19): clima de "observatório"; CPF mascarado, e-mail nunca exibido.

## Tokens (app/public/css/tokens.css, criado na 002)
--ceu-profundo: #0B1020; --ceu: #141B33; --superficie: #1E2747;
--lua: #E8E6DF; --lua-sombra: #9A9890;
--texto: #F2F1EC; --texto-suave: #A9B0C7;
--acento: #F5C46B (luz solar; botões com texto escuro);
--sucesso: #4CC38A; --erro: #F07178; --painel-claro: #F7F6F2.

Variantes para texto sobre o painel claro (acrescentadas na 002, em 01/10/2026):
--erro-sobre-claro: #C5151F; --sucesso-sobre-claro: #256F4C.

Uso: --sucesso e --erro só sobre os fundos escuros (céu e superfície), onde passam no AA; sobre
--painel-claro elas não passam (2,65:1 e 2,05:1). Para mensagem de erro ou sucesso sobre o
painel claro (e na impressão), use as variantes, no mesmo matiz e mais escuras:
--erro-sobre-claro tem 5,55:1 sobre o painel claro e 6,00:1 sobre branco; --sucesso-sobre-claro,
5,62:1 e 6,07:1. Contraste calculado pela fórmula WCAG 2.x (mínimo 4,5:1 para texto comum).

## Tipografia
Títulos: Sora. Corpo: Source Sans 3. Arquivos .woff2 hospedados em app/public/fonts, sem depender de CDN, para o portal funcionar sem internet na apresentação. Pilha de fallback: system-ui, sans-serif.

## Implementação
- Só HTML, CSS e JS puros (RP01). Lua e fases em SVG com máscara; anel do cronômetro com stroke-dashoffset; estrelas em CSS leve. Sem WebGL, sem bibliotecas 3D, sem imagens externas; corpos celestes em SVG de autoria própria.
- Acessibilidade: contraste mínimo AA, foco visível, prefers-reduced-motion desliga animações, alt em toda imagem.
- Mobile-first (RNF01).
