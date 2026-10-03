# Identidade visual: Lunar Celer

Versão 2.0 (02/10/2026), decidida pelo mantenedor. Substitui integralmente a versão 1 (paleta azul-marinho, fontes Sora e Source Sans 3). Vale para todas as features a partir da 002.

Referência visual: protótipo navegável no canvas do projeto (https://claude.ai/artifact/5MK3DegETGbv3t81EsqtZF, acesso do mantenedor). A descrição de cada tela está em `docs/telas.md`. Em caso de divergência entre o protótipo e este documento, vale este documento.

---

## 1. Princípio

O tema astronômico é moldura de experiência, nunca conteúdo. Termos ágeis (Sprint, Product Owner, Product Backlog etc.) nunca são trocados por metáforas. Regras da certificação aparecem sempre em linguagem direta. O nome oficial de cada tema aparece sempre junto do corpo celeste, no formato "Ceres · Eventos do Scrum", nunca só o nome do planeta.

## 2. Nome e marca

- Nome: **Lunar Celer**. Em contextos de primeira apresentação, acompanha o descritivo "portal de certificação em metodologias ágeis".
- Marca: círculo com Lua crescente (SVG de 28 px no cabeçalho), seguida do nome em Inter 300.
- Rodapé de todas as páginas públicas e logadas: estado do portal (discreto), "Projeto acadêmico da Fatec Jacareí", links para termos e validação de certificado.

## 3. Cores

Fundo escuro único, um acento quente e cor semântica só onde há significado.

| Token | Valor | Uso |
|---|---|---|
| `--fundo` | `#050505` | Fundo de todas as páginas |
| `--superficie-1` | `#0A0A0B` | Faixas de seção (com 55% de opacidade sobre o céu) e cartões discretos |
| `--superficie-2` | `#111113` | Cartões, campos de formulário, painéis |
| `--superficie-3` | `#141416` | Notificações |
| `--borda` | `#1F1F23` | Divisórias e bordas leves |
| `--borda-forte` | `#2E2E33` | Bordas de campos e botões secundários |
| `--texto` | `#F5F5F4` | Texto principal |
| `--texto-suave` | `#A1A1AA` | Texto secundário (contraste 7,9:1 sobre o fundo) |
| `--texto-apagado` | `#8A8A93` | Legendas e dicas pequenas (contraste 6:1) |
| `--acento` | `#F2A43A` | Destaques, cronômetro, progresso, foco (contraste 9,8:1) |
| `--primario` | `#FAFAF9` | Fundo do botão principal, com texto `#050505` |
| `--sucesso` | `#4CC38A` | Ícones e textos de acerto |
| `--erro` | `#F07178` | Ícones e bordas de erro |
| `--erro-texto` | `#F7A5AC` | Mensagens de erro em texto |
| `--aviso` | `#E9B949` | Ícone de aviso |
| `--info` | `#7FB2FF` | Ícone informativo |
| `--painel-claro` | `#F7F6F2` | Imagens das questões e certificado |
| `--texto-sobre-claro` | `#1A2140` | Texto sobre o painel claro |
| `--texto-sobre-claro-suave` | `#4A5270` | Texto secundário sobre o painel claro |

Fundos de alerta: erro `#2A1820` com borda `#5A2A35`; sucesso `#12291F` com borda `#2C6A4C`.

**Correção em relação ao protótipo:** o protótipo usa `#71717A` em dicas de 13 e 14 px. Esse tom tem contraste de 4,2:1 sobre o fundo e não passa no nível AA para texto pequeno. Na implementação, todo texto abaixo de 18 px usa `--texto-apagado` (`#8A8A93`), e `#71717A` fica restrito a elementos decorativos.

## 4. Tipografia

- Família única: **Inter** (licença OFL 1.1), pesos 300, 400 e 500, arquivos `.woff2` com subconjunto latino hospedados em `app/public/fonts`. Nada de CDN, para o portal funcionar sem internet na apresentação. Fallback: `system-ui, sans-serif`.
- Números em tabelas, cronômetro e contagens: `font-variant-numeric: tabular-nums`.

| Papel | Tamanho | Peso | Detalhes |
|---|---|---|---|
| Título de destaque (hero, 404) | `clamp(48px, 7vw, 100px)` | 300 | `letter-spacing: -0.045em`, `line-height: 0.95` |
| Título de página (h1) | `clamp(28px, 3.2vw, 38px)` | 300 | `letter-spacing: -0.02em` |
| Título de seção (h2) | 20 a 36 px | 300 ou 400 | `letter-spacing: -0.01em` a `-0.035em` |
| Corpo | 17 px | 400 | `line-height: 1.55` |
| Apoio | 15 px | 400 | cor `--texto-suave` |
| Legenda | 13 a 14 px | 400 | cor `--texto-apagado` |

## 5. Forma

- Botões, chips e abas: pílula (`border-radius: 999px`), altura mínima de 44 a 50 px.
- Botão principal: fundo `--primario`, texto `#050505`, peso 500. Botão secundário: contorno de 1 px `--borda-forte`, fundo transparente.
- Cartões: raio de 16 a 28 px, borda de 1 px. Campos: raio de 12 px.
- Sombra só em notificações e no certificado. O resto se separa por borda e superfície.

## 6. Elementos de assinatura

### 6.1 Céu estrelado (todas as páginas)

- Um arquivo `app/public/img/ceu.svg` (bloco de 1200 × 1200 px que se repete) com cerca de 250 estrelas de tamanhos e brilhos variados, 16 estrelas maiores com halo e duas galáxias distantes desfocadas. Mais dois blocos menores (900 e 700 px) com estrelas brilhantes para a cintilação.
- Por cima do fundo: uma faixa diagonal tênue (inspirada na Via Láctea) e duas nebulosas difusas, violeta no topo esquerdo e âmbar no canto inferior direito, feitas com gradientes de CSS.
- Movimento: a camada principal desliza na diagonal com `transform: translate3d`, uma volta a cada 420 s; as camadas de brilho variam a opacidade em ciclos de 7 e 9 s, defasados.
- As camadas ficam atrás do conteúdo (`z-index: -1` dentro de um contêiner com `isolation: isolate`) e nunca recebem clique.
- Com `prefers-reduced-motion: reduce`, o céu fica parado. Na tela da questão com cronômetro, o céu também fica parado, para não disputar atenção.

### 6.2 Lua em rede (tela inicial)

- Esfera de pontos e linhas desenhada em **Canvas 2D com JavaScript puro**, sem three.js: cerca de 110 pontos distribuídos pelo método de Fibonacci, arestas entre pontos a menos de 0,40 de distância, opacidade maior na face da frente, alguns nós em `--acento` e um halo âmbar suave atrás.
- Rotação em 3D lenta e contínua. Pausa quando a aba está oculta (`visibilitychange`) ou quando a esfera sai da tela (`IntersectionObserver`). Parada com redução de movimento.
- Sem JavaScript, mostra a versão estática em SVG.
- Em volta dela, rótulos de vidro (fundo `rgba(5,5,5,0.55)`, `backdrop-filter: blur(10px)`, borda branca a 14%) com cinco empresas que usam Scrum. Ao passar o mouse, focar ou tocar, o rótulo acende em âmbar e um cartão abaixo da esfera mostra o fato da empresa (ver seção 9).

### 6.3 Buraco negro (página 404)

Disco de luz alaranjada em SVG com desfoque gaussiano, curvado por cima de uma sombra preta, com anel de fótons claro. Estático.

### 6.4 A Lua como progresso

Na área do candidato, a Lua acende 1/12 do disco por tema **concluído**, nunca por acerto, para não revelar nota parcial durante a prova. A trilha de 12 marcos acompanha: concluídos em `#E7E5E4`, atual com borda `--acento`, pendentes com borda `--borda-forte`.

## 7. Os 12 temas

Ordem de distância do Sol. As cores aparecem só em pontos pequenos ao lado do nome.

| Ordem | Corpo | Tema | Cor |
|---|---|---|---|
| 1 | Mercúrio | Fundamentos da Agilidade | `#B5B0A8` |
| 2 | Vênus | Manifesto Ágil | `#E8C77A` |
| 3 | Terra | Introdução ao Scrum | `#4F8FD9` |
| 4 | Marte | Papéis do Scrum | `#D9644A` |
| 5 | Ceres | Eventos do Scrum | `#8C8A86` |
| 6 | Júpiter | Artefatos do Scrum | `#D9A066` |
| 7 | Saturno | User Stories | `#E3C98E` |
| 8 | Urano | Gestão do Product Backlog | `#7FD4D9` |
| 9 | Netuno | Kanban | `#4A6FD9` |
| 10 | Plutão | Planejamento Ágil | `#C9A98C` |
| 11 | Makemake | Métricas Ágeis | `#C46F5E` |
| 12 | Éris | Qualidade em Projetos Ágeis | `#D8D8E0` |

Lista confirmada pela decisão D3 (03/10/2026): temas 1 a 12 da tabela de sugestões do desafio.

## 8. Componentes

- **Abas deslizantes (cabeçalho da tela inicial):** pílula com quatro abas de largura igual (Scrum, Trilha, Método, Sobre) e um cursor branco que desliza por `transform` até a aba sob o mouse ou foco; o texto usa `mix-blend-mode: difference` para inverter sobre o cursor. Nenhuma aba começa marcada; a aba marcada acompanha a seção visível ao rolar.
- **Chip de tema:** pílula `#1F1F23` com ponto da cor do corpo celeste e o texto "Corpo · Tema".
- **Campo de formulário:** rótulo visível acima, linha de ajuda abaixo, mensagem de erro em `--erro-texto` com borda `--erro`.
- **Alerta na página:** ícone e texto, `role="alert"` para erros e `role="status"` para confirmações.
- **Anel do cronômetro:** círculo de 8 px de espessura em volta da Lua; vira `--erro` abaixo de 30 s, com aviso escrito. Os segundos aparecem sempre em número.
- **Cartão de flashcard:** vira em 3D (`rotateY`, 0,55 s) ao mostrar a resposta; frente em `#0E0E10`, verso com borda âmbar escura.
- **Anel de progresso de conquista:** 52 px, traço branco sobre `#1F1F23`, porcentagem no centro.
- **Barra de domínio por tema:** 6 px, `--acento` quando completa e `#D4D4D8` em andamento.

### 8.1 Notificações (toasts)

- Cartão `--superficie-3`, borda `#26262B`, raio de 20 px, sombra suave, largura máxima de 420 px. Ícone de 26 px com a cor do tipo, título em peso 500, frase de apoio em `--texto-suave` e botão de fechar com rótulo acessível.
- Tipos: sucesso (`--sucesso`), conquista (`--acento`), informação (`--info`), aviso (`--aviso`) e erro (`--erro`).
- Posição: canto inferior direito; no celular, embaixo e centralizado, respeitando a área segura.
- Sucesso, conquista e informação somem em 5 s, com pausa enquanto o mouse ou o foco estiverem sobre eles, e usam `role="status"`. Erro e aviso ficam até serem fechados e usam `role="alert"`. No máximo três ao mesmo tempo.
- Nunca são o único lugar de uma informação necessária para decidir: resultado de questão, tempo esgotado e erros de formulário aparecem na própria tela.

## 9. Conteúdo factual da identidade

As cinco empresas da tela inicial só podem afirmar o que suas fontes sustentam. As fontes completas, com URL, data e a conferência de cada frase, estão em `docs/referencias.md`.

| Empresa | Fato exibido | Fonte |
|---|---|---|
| Google | O time do AdWords adotou o Scrum aos poucos, uma prática de cada vez. | Palestra de Jeff Sutherland no Google Tech Talks (2006) e artigo de Mark Striebeck na conferência Agile 2006 |
| Salesforce | Trocou o modelo em cascata pelo Scrum em 2006. Segundo a própria empresa, hoje ele é o framework principal de 70% dos seus times. | Salesforce, Trailhead ("Learn About Scrum"), e estudo de caso da Scrum Alliance |
| Spotify | Nos primeiros anos, era praticamente uma empresa Scrum; "squad" era o nome interno do time Scrum. | Henrik Kniberg, "Spotify Engineering Culture" (2014), e Kniberg e Ivarsson, "Scaling Agile @ Spotify" (2012) |
| Saab | Desenvolve o caça Gripen E, o mesmo da Força Aérea Brasileira, com mais de 100 times em sprints de três semanas. | Furuhjelm e outros, "Owning the Sky with Agile" (Saab Aeronautics e Scrum Inc., 2017), e comunicado da Saab sobre o Gripen E na FAB (2022) |
| Adobe | O time do Premiere Pro adotou o Scrum em 2008 e relatou ganhos de qualidade no produto. | Peter Green, relato de experiência na conferência Agile 2012 |

Nomes aparecem só como texto, nunca com logotipo.

## 10. Movimento

- Transições de interface entre 0,15 e 0,35 s; animações de ambiente (céu, rótulos flutuantes) longas e suaves.
- Toda animação respeita `prefers-reduced-motion: reduce`.
- Nenhuma animação depende de biblioteca; só CSS e JavaScript puro (RP01).

## 11. Acessibilidade

- Contraste mínimo AA em todo texto (ver correção na seção 3).
- Foco visível em âmbar, 2 px, com afastamento de 3 px.
- Alvos de toque com pelo menos 44 px.
- Toda imagem informativa com texto alternativo; ilustrações decorativas com `aria-hidden`.
- Formulários com rótulos visíveis, mensagens de erro ligadas ao campo e opções de resposta como botões de opção reais.
- Mobile-first (RNF01): toda tela funciona a partir de 360 px de largura.
