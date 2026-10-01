-- ============================================================
-- Portal de Certificação em Metodologias Ágeis
-- ABP 1º DSM 2026-2 · FATEC Jacareí
-- Carga inicial 1/2: temas e materiais de estudo · 01/10/2026
-- Executado automaticamente na primeira subida do banco (volume vazio),
-- logo depois de 01-ddl.sql. Alterações só têm efeito com "docker compose down -v".
--
-- Temas: definitivos (nomes e ordem da seção 6 do dossiê, FR-009).
-- Materiais e imagens: PROVISÓRIOS, marcados com [PROVISÓRIO] no título e no crédito;
-- serão substituídos pela carga definitiva sem mudança no esquema (FR-009b).
-- Faixas de id (research R5): temas 1-12; imagens de material 101-112; materiais 1-12.
-- Requisitos: RF05, RF07, RP02, RP04.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Temas da certificação (RF05): 12, com ordem de 1 a 12 e id = ordem
-- ------------------------------------------------------------
insert into tbtema (id, nome, descricao, ordem) values
   (1, 'Fundamentos da Agilidade',
    'Origem e conceitos centrais da agilidade: desenvolvimento iterativo e incremental, entregas frequentes de valor, feedback contínuo e adaptação a mudanças.',
    1),
   (2, 'Manifesto Ágil',
    'Os 4 valores e os 12 princípios do Manifesto para Desenvolvimento Ágil de Software (2001) e como eles orientam as decisões das equipes.',
    2),
   (3, 'Introdução ao Scrum',
    'Visão geral do Scrum como framework leve: empirismo (transparência, inspeção e adaptação), valores do Scrum e a Sprint como ciclo de trabalho.',
    3),
   (4, 'Papéis do Scrum',
    'As responsabilidades do Scrum Team: Product Owner, Scrum Master e Developers, e como colaboram de forma auto-gerenciável.',
    4),
   (5, 'Eventos do Scrum',
    'A Sprint e seus eventos: Sprint Planning, Daily Scrum, Sprint Review e Sprint Retrospective, com objetivos e limites de tempo.',
    5),
   (6, 'Artefatos do Scrum',
    'Product Backlog, Sprint Backlog e Incremento, e os compromissos associados: Meta do Produto, Meta da Sprint e Definição de Pronto.',
    6),
   (7, 'User Stories',
    'Escrita de User Stories no formato papel, ação e benefício, os critérios INVEST, os 3 Cs e os critérios de aceite.',
    7),
   (8, 'Gestão do Product Backlog',
    'Ordenação, refinamento e priorização do Product Backlog por valor, esforço e risco, sob responsabilidade do Product Owner.',
    8),
   (9, 'Kanban',
    'O método Kanban: visualização do fluxo, limites de trabalho em progresso (WIP), gestão do fluxo e métricas como lead time e cycle time.',
    9),
   (10, 'Planejamento Ágil',
    'Estimativas relativas, Planning Poker, velocidade do time e planejamento em ondas sucessivas para releases e iterações.',
    10),
   (11, 'Métricas Ágeis',
    'Burndown, burnup, velocidade, cycle time e diagrama de fluxo cumulativo, e o uso responsável de métricas para melhoria contínua.',
    11),
   (12, 'Qualidade em Projetos Ágeis',
    'Práticas de qualidade no ágil: Definição de Pronto, TDD, integração contínua, refatoração e testes automatizados.',
    12);

-- ------------------------------------------------------------
-- Imagens dos materiais (PROVISÓRIAS, autoria própria)
-- arquivo: caminho relativo a app/public, sem barra inicial (padrão D7, research R8)
-- ------------------------------------------------------------
insert into tbimagem (id, arquivo, texto_alternativo, credito) values
   (101, 'img/materiais/tema01.svg', 'Ilustração provisória do tema Fundamentos da Agilidade: setas em ciclo representando iterações curtas.', '[PROVISÓRIO] Autoria própria'),
   (102, 'img/materiais/tema02.svg', 'Ilustração provisória do tema Manifesto Ágil: documento com quatro linhas destacadas representando os quatro valores.', '[PROVISÓRIO] Autoria própria'),
   (103, 'img/materiais/tema03.svg', 'Ilustração provisória do tema Introdução ao Scrum: ciclo tracejado com um marcador de entrega representando a Sprint.', '[PROVISÓRIO] Autoria própria'),
   (104, 'img/materiais/tema04.svg', 'Ilustração provisória do tema Papéis do Scrum: três pessoas representando Product Owner, Scrum Master e Developers.', '[PROVISÓRIO] Autoria própria'),
   (105, 'img/materiais/tema05.svg', 'Ilustração provisória do tema Eventos do Scrum: linha do tempo com cinco marcos representando os eventos da Sprint.', '[PROVISÓRIO] Autoria própria'),
   (106, 'img/materiais/tema06.svg', 'Ilustração provisória do tema Artefatos do Scrum: três blocos empilhados representando os artefatos do Scrum.', '[PROVISÓRIO] Autoria própria'),
   (107, 'img/materiais/tema07.svg', 'Ilustração provisória do tema User Stories: cartão de história com cabeçalho e linhas de texto.', '[PROVISÓRIO] Autoria própria'),
   (108, 'img/materiais/tema08.svg', 'Ilustração provisória do tema Gestão do Product Backlog: barras em ordem decrescente representando a priorização.', '[PROVISÓRIO] Autoria própria'),
   (109, 'img/materiais/tema09.svg', 'Ilustração provisória do tema Kanban: quadro com três colunas e cartões em fluxo.', '[PROVISÓRIO] Autoria própria'),
   (110, 'img/materiais/tema10.svg', 'Ilustração provisória do tema Planejamento Ágil: calendário em grade com dias marcados.', '[PROVISÓRIO] Autoria própria'),
   (111, 'img/materiais/tema11.svg', 'Ilustração provisória do tema Métricas Ágeis: gráfico de burndown com linha descendente.', '[PROVISÓRIO] Autoria própria'),
   (112, 'img/materiais/tema12.svg', 'Ilustração provisória do tema Qualidade em Projetos Ágeis: escudo com marca de verificação.', '[PROVISÓRIO] Autoria própria');

-- ------------------------------------------------------------
-- Materiais de estudo (RF07, PROVISÓRIOS): 1 por tema, tipo TEXTO, conteúdo em Markdown
-- ------------------------------------------------------------
insert into tbmaterial (id, idtema, titulo, conteudo, tipo, ordem) values
   (1, 1, '[PROVISÓRIO] Fundamentos da Agilidade: visão geral',
'## Fundamentos da Agilidade

A agilidade é uma forma de trabalhar que entrega valor em **ciclos curtos**, com
**feedback frequente** do cliente e adaptação constante.

- **Iterativo e incremental**: o produto cresce em pequenas partes, revisadas a cada ciclo.
- **Requisitos incertos**: ciclos curtos permitem ajustar o rumo quando o cenário muda.
- **Feedback**: orienta ajustes no produto e no processo a cada iteração.',
    'TEXTO', 1),
   (2, 2, '[PROVISÓRIO] Manifesto Ágil: valores e princípios',
'## Manifesto Ágil

Publicado em 2001, o manifesto declara **4 valores** e **12 princípios**.

- Indivíduos e interações mais que processos e ferramentas.
- Software em funcionamento mais que documentação abrangente.
- Colaboração com o cliente mais que negociação de contratos.
- Responder a mudanças mais que seguir um plano.

Entre os princípios: acolher mudanças, mesmo tardias, e medir o progresso
principalmente por **software funcionando**.',
    'TEXTO', 1),
   (3, 3, '[PROVISÓRIO] Introdução ao Scrum: o framework',
'## Introdução ao Scrum

O Scrum é um **framework leve** para gerar valor com soluções adaptativas para
problemas complexos.

- **Pilares do empirismo**: transparência, inspeção e adaptação.
- **Sprint**: ciclo de duração fixa de **um mês ou menos**.
- **Valores**: compromisso, foco, abertura, respeito e coragem.',
    'TEXTO', 1),
   (4, 4, '[PROVISÓRIO] Papéis do Scrum: o Scrum Team',
'## Papéis do Scrum

O Scrum Team é pequeno, em geral com **10 pessoas ou menos**, e auto-gerenciável.

- **Product Owner**: maximiza o valor do produto e ordena o Product Backlog.
- **Scrum Master**: ajuda o time a entender e aplicar o Scrum e remove impedimentos.
- **Developers**: decidem como transformar itens do backlog em Incremento.',
    'TEXTO', 1),
   (5, 5, '[PROVISÓRIO] Eventos do Scrum: a Sprint e seus eventos',
'## Eventos do Scrum

- **Sprint Planning**: define a Meta da Sprint e o trabalho selecionado.
- **Daily Scrum**: 15 minutos por dia para inspecionar o progresso rumo à meta.
- **Sprint Review**: inspeciona o resultado com os stakeholders e adapta os próximos passos.
- **Sprint Retrospective**: planeja formas de aumentar a qualidade e a eficácia do time.',
    'TEXTO', 1),
   (6, 6, '[PROVISÓRIO] Artefatos do Scrum: backlog e incremento',
'## Artefatos do Scrum

Cada artefato tem um compromisso que dá transparência ao trabalho.

- **Product Backlog**: compromisso com a **Meta do Produto**.
- **Sprint Backlog**: Meta da Sprint, itens selecionados e plano de entrega.
- **Incremento**: compromisso com a **Definição de Pronto**.',
    'TEXTO', 1),
   (7, 7, '[PROVISÓRIO] User Stories: como escrever boas histórias',
'## User Stories

Formato comum: **Como [papel], quero [ação], para [benefício].**

- **3 Cs**: cartão, conversa e confirmação.
- **INVEST**: independente, negociável, valiosa, estimável, pequena e testável.
- **Critérios de aceite**: condições para considerar a história atendida.',
    'TEXTO', 1),
   (8, 8, '[PROVISÓRIO] Gestão do Product Backlog: ordenar e refinar',
'## Gestão do Product Backlog

O Product Backlog é uma lista **ordenada** e **emergente**, sob responsabilidade do
Product Owner.

- **Refinamento**: detalhar, dividir e estimar itens até ficarem prontos para seleção.
- **Priorização**: valor de negócio em relação ao esforço e ao risco.',
    'TEXTO', 1),
   (9, 9, '[PROVISÓRIO] Kanban: fluxo e limites de WIP',
'## Kanban

- **Quadro Kanban**: torna visível o fluxo de trabalho e o estado de cada item.
- **Limite de WIP**: restringe o trabalho em progresso e expõe gargalos.
- **Lead time**: do pedido até a entrega de um item.
- **Fluxo contínuo**: não há iterações de tamanho fixo, ao contrário do Scrum.',
    'TEXTO', 1),
   (10, 10, '[PROVISÓRIO] Planejamento Ágil: estimar e prever',
'## Planejamento Ágil

- **Planning Poker**: estimativa colaborativa por consenso.
- **Fibonacci**: intervalos crescentes refletem a incerteza maior em itens grandes.
- **Velocidade**: trabalho concluído por iteração, usado para previsão.
- **Ondas sucessivas**: detalha o trabalho próximo e mantém o distante em nível mais alto.',
    'TEXTO', 1),
   (11, 11, '[PROVISÓRIO] Métricas Ágeis: medir para melhorar',
'## Métricas Ágeis

- **Burndown**: trabalho restante em relação ao tempo.
- **Cycle time**: do início do trabalho em um item até a sua conclusão.
- **Diagrama de fluxo cumulativo (CFD)**: mostra gargalos e acúmulo em cada etapa.

Métricas servem para o time melhorar; não devem ranquear times diferentes.',
    'TEXTO', 1),
   (12, 12, '[PROVISÓRIO] Qualidade em Projetos Ágeis: práticas essenciais',
'## Qualidade em Projetos Ágeis

- **TDD**: escrever o teste antes do código que o faz passar.
- **Definição de Pronto**: padrão de qualidade compartilhado para o Incremento.
- **Integração contínua**: integrar e testar o código automaticamente, várias vezes ao dia.
- **Refatoração**: melhorar o código continuamente, com o apoio de testes automatizados.',
    'TEXTO', 1);

-- material do tema NN ilustrado pela imagem 100 + NN
insert into tbmaterial_por_imagem (idmaterial, idimagem) values
   (1, 101), (2, 102), (3, 103), (4, 104), (5, 105), (6, 106),
   (7, 107), (8, 108), (9, 109), (10, 110), (11, 111), (12, 112);

-- ------------------------------------------------------------
-- Ajuste das sequências após os ids explícitos (research R5)
-- ------------------------------------------------------------
select setval(pg_get_serial_sequence('tbtema', 'id'), (select max(id) from tbtema));
select setval(pg_get_serial_sequence('tbimagem', 'id'), (select max(id) from tbimagem));
select setval(pg_get_serial_sequence('tbmaterial', 'id'), (select max(id) from tbmaterial));

commit;
