-- ============================================================
-- Portal de Certificação em Metodologias Ágeis
-- ABP 1º DSM 2026-2 · FATEC Jacareí
-- Carga inicial 2/2: questões e alternativas · 01/10/2026
-- Executado automaticamente na primeira subida do banco (volume vazio),
-- depois de 02-seed-temas-materiais.sql.
--
-- ARQUIVO PROVISÓRIO (FR-009, FR-009b): questões, alternativas e imagens são conteúdo
-- provisório no volume final (12 temas x 4 questões x 4 alternativas). Este arquivo será
-- SUBSTITUÍDO INTEIRO pela carga definitiva, sem nenhuma mudança no esquema (01-ddl.sql).
-- Marcação: enunciado e crédito da imagem começam com [PROVISÓRIO]; as alternativas não
-- têm marca própria, são provisórias porque a sua questão é (research R7).
--
-- Faixas de id (research R5): imagens de questão 1-48; questões 1-48, com
-- id = (tema - 1) * 4 + K e idimagem = id; alternativas 1-192, com as da questão Q
-- em (Q - 1) * 4 + 1 a (Q - 1) * 4 + 4, letras A a D nessa ordem.
-- Regras (RP06, RF08): 4 questões por tema, 1 imagem exclusiva por questão,
-- 4 alternativas A-D por questão com exatamente 1 correta (índice ux_alternativa_correta).
-- Requisitos: RP06, RF06, RF08, RP02, RP04.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- Imagens das questões (PROVISÓRIAS, autoria própria), uma por questão
-- arquivo: caminho relativo a app/public, sem barra inicial (padrão D7, research R8)
-- ------------------------------------------------------------
insert into tbimagem (id, arquivo, texto_alternativo, credito) values
   -- tema 1: Fundamentos da Agilidade
   (1, 'img/questoes/tema01-q1.svg', 'Ilustração provisória da questão 1 do tema Fundamentos da Agilidade: setas em ciclo representando iterações curtas.', '[PROVISÓRIO] Autoria própria'),
   (2, 'img/questoes/tema01-q2.svg', 'Ilustração provisória da questão 2 do tema Fundamentos da Agilidade: setas em ciclo representando iterações curtas.', '[PROVISÓRIO] Autoria própria'),
   (3, 'img/questoes/tema01-q3.svg', 'Ilustração provisória da questão 3 do tema Fundamentos da Agilidade: setas em ciclo representando iterações curtas.', '[PROVISÓRIO] Autoria própria'),
   (4, 'img/questoes/tema01-q4.svg', 'Ilustração provisória da questão 4 do tema Fundamentos da Agilidade: setas em ciclo representando iterações curtas.', '[PROVISÓRIO] Autoria própria'),
   -- tema 2: Manifesto Ágil
   (5, 'img/questoes/tema02-q1.svg', 'Ilustração provisória da questão 1 do tema Manifesto Ágil: documento com quatro linhas destacadas representando os quatro valores.', '[PROVISÓRIO] Autoria própria'),
   (6, 'img/questoes/tema02-q2.svg', 'Ilustração provisória da questão 2 do tema Manifesto Ágil: documento com quatro linhas destacadas representando os quatro valores.', '[PROVISÓRIO] Autoria própria'),
   (7, 'img/questoes/tema02-q3.svg', 'Ilustração provisória da questão 3 do tema Manifesto Ágil: documento com quatro linhas destacadas representando os quatro valores.', '[PROVISÓRIO] Autoria própria'),
   (8, 'img/questoes/tema02-q4.svg', 'Ilustração provisória da questão 4 do tema Manifesto Ágil: documento com quatro linhas destacadas representando os quatro valores.', '[PROVISÓRIO] Autoria própria'),
   -- tema 3: Introdução ao Scrum
   (9, 'img/questoes/tema03-q1.svg', 'Ilustração provisória da questão 1 do tema Introdução ao Scrum: ciclo tracejado com um marcador de entrega representando a Sprint.', '[PROVISÓRIO] Autoria própria'),
   (10, 'img/questoes/tema03-q2.svg', 'Ilustração provisória da questão 2 do tema Introdução ao Scrum: ciclo tracejado com um marcador de entrega representando a Sprint.', '[PROVISÓRIO] Autoria própria'),
   (11, 'img/questoes/tema03-q3.svg', 'Ilustração provisória da questão 3 do tema Introdução ao Scrum: ciclo tracejado com um marcador de entrega representando a Sprint.', '[PROVISÓRIO] Autoria própria'),
   (12, 'img/questoes/tema03-q4.svg', 'Ilustração provisória da questão 4 do tema Introdução ao Scrum: ciclo tracejado com um marcador de entrega representando a Sprint.', '[PROVISÓRIO] Autoria própria'),
   -- tema 4: Papéis do Scrum
   (13, 'img/questoes/tema04-q1.svg', 'Ilustração provisória da questão 1 do tema Papéis do Scrum: três pessoas representando Product Owner, Scrum Master e Developers.', '[PROVISÓRIO] Autoria própria'),
   (14, 'img/questoes/tema04-q2.svg', 'Ilustração provisória da questão 2 do tema Papéis do Scrum: três pessoas representando Product Owner, Scrum Master e Developers.', '[PROVISÓRIO] Autoria própria'),
   (15, 'img/questoes/tema04-q3.svg', 'Ilustração provisória da questão 3 do tema Papéis do Scrum: três pessoas representando Product Owner, Scrum Master e Developers.', '[PROVISÓRIO] Autoria própria'),
   (16, 'img/questoes/tema04-q4.svg', 'Ilustração provisória da questão 4 do tema Papéis do Scrum: três pessoas representando Product Owner, Scrum Master e Developers.', '[PROVISÓRIO] Autoria própria'),
   -- tema 5: Eventos do Scrum
   (17, 'img/questoes/tema05-q1.svg', 'Ilustração provisória da questão 1 do tema Eventos do Scrum: linha do tempo com cinco marcos representando os eventos da Sprint.', '[PROVISÓRIO] Autoria própria'),
   (18, 'img/questoes/tema05-q2.svg', 'Ilustração provisória da questão 2 do tema Eventos do Scrum: linha do tempo com cinco marcos representando os eventos da Sprint.', '[PROVISÓRIO] Autoria própria'),
   (19, 'img/questoes/tema05-q3.svg', 'Ilustração provisória da questão 3 do tema Eventos do Scrum: linha do tempo com cinco marcos representando os eventos da Sprint.', '[PROVISÓRIO] Autoria própria'),
   (20, 'img/questoes/tema05-q4.svg', 'Ilustração provisória da questão 4 do tema Eventos do Scrum: linha do tempo com cinco marcos representando os eventos da Sprint.', '[PROVISÓRIO] Autoria própria'),
   -- tema 6: Artefatos do Scrum
   (21, 'img/questoes/tema06-q1.svg', 'Ilustração provisória da questão 1 do tema Artefatos do Scrum: três blocos empilhados representando os artefatos do Scrum.', '[PROVISÓRIO] Autoria própria'),
   (22, 'img/questoes/tema06-q2.svg', 'Ilustração provisória da questão 2 do tema Artefatos do Scrum: três blocos empilhados representando os artefatos do Scrum.', '[PROVISÓRIO] Autoria própria'),
   (23, 'img/questoes/tema06-q3.svg', 'Ilustração provisória da questão 3 do tema Artefatos do Scrum: três blocos empilhados representando os artefatos do Scrum.', '[PROVISÓRIO] Autoria própria'),
   (24, 'img/questoes/tema06-q4.svg', 'Ilustração provisória da questão 4 do tema Artefatos do Scrum: três blocos empilhados representando os artefatos do Scrum.', '[PROVISÓRIO] Autoria própria'),
   -- tema 7: User Stories
   (25, 'img/questoes/tema07-q1.svg', 'Ilustração provisória da questão 1 do tema User Stories: cartão de história com cabeçalho e linhas de texto.', '[PROVISÓRIO] Autoria própria'),
   (26, 'img/questoes/tema07-q2.svg', 'Ilustração provisória da questão 2 do tema User Stories: cartão de história com cabeçalho e linhas de texto.', '[PROVISÓRIO] Autoria própria'),
   (27, 'img/questoes/tema07-q3.svg', 'Ilustração provisória da questão 3 do tema User Stories: cartão de história com cabeçalho e linhas de texto.', '[PROVISÓRIO] Autoria própria'),
   (28, 'img/questoes/tema07-q4.svg', 'Ilustração provisória da questão 4 do tema User Stories: cartão de história com cabeçalho e linhas de texto.', '[PROVISÓRIO] Autoria própria'),
   -- tema 8: Gestão do Product Backlog
   (29, 'img/questoes/tema08-q1.svg', 'Ilustração provisória da questão 1 do tema Gestão do Product Backlog: barras em ordem decrescente representando a priorização.', '[PROVISÓRIO] Autoria própria'),
   (30, 'img/questoes/tema08-q2.svg', 'Ilustração provisória da questão 2 do tema Gestão do Product Backlog: barras em ordem decrescente representando a priorização.', '[PROVISÓRIO] Autoria própria'),
   (31, 'img/questoes/tema08-q3.svg', 'Ilustração provisória da questão 3 do tema Gestão do Product Backlog: barras em ordem decrescente representando a priorização.', '[PROVISÓRIO] Autoria própria'),
   (32, 'img/questoes/tema08-q4.svg', 'Ilustração provisória da questão 4 do tema Gestão do Product Backlog: barras em ordem decrescente representando a priorização.', '[PROVISÓRIO] Autoria própria'),
   -- tema 9: Kanban
   (33, 'img/questoes/tema09-q1.svg', 'Ilustração provisória da questão 1 do tema Kanban: quadro com três colunas e cartões em fluxo.', '[PROVISÓRIO] Autoria própria'),
   (34, 'img/questoes/tema09-q2.svg', 'Ilustração provisória da questão 2 do tema Kanban: quadro com três colunas e cartões em fluxo.', '[PROVISÓRIO] Autoria própria'),
   (35, 'img/questoes/tema09-q3.svg', 'Ilustração provisória da questão 3 do tema Kanban: quadro com três colunas e cartões em fluxo.', '[PROVISÓRIO] Autoria própria'),
   (36, 'img/questoes/tema09-q4.svg', 'Ilustração provisória da questão 4 do tema Kanban: quadro com três colunas e cartões em fluxo.', '[PROVISÓRIO] Autoria própria'),
   -- tema 10: Planejamento Ágil
   (37, 'img/questoes/tema10-q1.svg', 'Ilustração provisória da questão 1 do tema Planejamento Ágil: calendário em grade com dias marcados.', '[PROVISÓRIO] Autoria própria'),
   (38, 'img/questoes/tema10-q2.svg', 'Ilustração provisória da questão 2 do tema Planejamento Ágil: calendário em grade com dias marcados.', '[PROVISÓRIO] Autoria própria'),
   (39, 'img/questoes/tema10-q3.svg', 'Ilustração provisória da questão 3 do tema Planejamento Ágil: calendário em grade com dias marcados.', '[PROVISÓRIO] Autoria própria'),
   (40, 'img/questoes/tema10-q4.svg', 'Ilustração provisória da questão 4 do tema Planejamento Ágil: calendário em grade com dias marcados.', '[PROVISÓRIO] Autoria própria'),
   -- tema 11: Métricas Ágeis
   (41, 'img/questoes/tema11-q1.svg', 'Ilustração provisória da questão 1 do tema Métricas Ágeis: gráfico de burndown com linha descendente.', '[PROVISÓRIO] Autoria própria'),
   (42, 'img/questoes/tema11-q2.svg', 'Ilustração provisória da questão 2 do tema Métricas Ágeis: gráfico de burndown com linha descendente.', '[PROVISÓRIO] Autoria própria'),
   (43, 'img/questoes/tema11-q3.svg', 'Ilustração provisória da questão 3 do tema Métricas Ágeis: gráfico de burndown com linha descendente.', '[PROVISÓRIO] Autoria própria'),
   (44, 'img/questoes/tema11-q4.svg', 'Ilustração provisória da questão 4 do tema Métricas Ágeis: gráfico de burndown com linha descendente.', '[PROVISÓRIO] Autoria própria'),
   -- tema 12: Qualidade em Projetos Ágeis
   (45, 'img/questoes/tema12-q1.svg', 'Ilustração provisória da questão 1 do tema Qualidade em Projetos Ágeis: escudo com marca de verificação.', '[PROVISÓRIO] Autoria própria'),
   (46, 'img/questoes/tema12-q2.svg', 'Ilustração provisória da questão 2 do tema Qualidade em Projetos Ágeis: escudo com marca de verificação.', '[PROVISÓRIO] Autoria própria'),
   (47, 'img/questoes/tema12-q3.svg', 'Ilustração provisória da questão 3 do tema Qualidade em Projetos Ágeis: escudo com marca de verificação.', '[PROVISÓRIO] Autoria própria'),
   (48, 'img/questoes/tema12-q4.svg', 'Ilustração provisória da questão 4 do tema Qualidade em Projetos Ágeis: escudo com marca de verificação.', '[PROVISÓRIO] Autoria própria');

-- ------------------------------------------------------------
-- Tema 1: Fundamentos da Agilidade (questões 1-4; corretas B, D, A, C)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (1, 1, 1, '[PROVISÓRIO] Qual característica melhor descreve o desenvolvimento ágil?',
    'A agilidade se apoia em entregas incrementais e feedback contínuo do cliente.'),
   (2, 1, 2, '[PROVISÓRIO] O que significa trabalhar de forma iterativa e incremental?',
    'Cada iteração gera um incremento que é avaliado e melhorado no ciclo seguinte.'),
   (3, 1, 3, '[PROVISÓRIO] Em qual situação uma abordagem ágil tende a ser mais vantajosa?',
    'Ciclos curtos permitem adaptar o produto a requisitos que mudam.'),
   (4, 1, 4, '[PROVISÓRIO] Qual é o papel do feedback no desenvolvimento ágil?',
    'Inspeção e adaptação frequentes dependem de feedback rápido.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (1, 1, 'A', 'Planejar todo o projeto em detalhe antes de iniciar a construção.', false),
   (2, 1, 'B', 'Entregar valor em ciclos curtos, com feedback frequente do cliente.', true),
   (3, 1, 'C', 'Evitar mudanças de escopo depois que o contrato é assinado.', false),
   (4, 1, 'D', 'Documentar todos os requisitos antes de qualquer entrega.', false),
   (5, 2, 'A', 'Executar cada fase do projeto uma única vez, em sequência.', false),
   (6, 2, 'B', 'Entregar o produto completo apenas ao final do projeto.', false),
   (7, 2, 'C', 'Repetir o mesmo trabalho até eliminar todos os riscos.', false),
   (8, 2, 'D', 'Construir o produto em pequenas partes, revisando-o a cada ciclo.', true),
   (9, 3, 'A', 'Quando os requisitos são incertos e devem mudar ao longo do projeto.', true),
   (10, 3, 'B', 'Quando o escopo é fixo e conhecido em todos os detalhes desde o início.', false),
   (11, 3, 'C', 'Quando o cliente não pode participar do projeto em nenhum momento.', false),
   (12, 3, 'D', 'Quando não há necessidade de entregar nada antes do prazo final.', false),
   (13, 4, 'A', 'Avaliar o desempenho individual dos desenvolvedores ao fim do ano.', false),
   (14, 4, 'B', 'Substituir os testes automatizados do produto.', false),
   (15, 4, 'C', 'Orientar ajustes no produto e no processo a cada ciclo.', true),
   (16, 4, 'D', 'Registrar formalmente as mudanças de contrato.', false);

-- ------------------------------------------------------------
-- Tema 2: Manifesto Ágil (questões 5-8; corretas C, A, D, B)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (5, 2, 5, '[PROVISÓRIO] Segundo o Manifesto Ágil, o que é mais valorizado do que processos e ferramentas?',
    'O primeiro valor do manifesto é indivíduos e interações mais que processos e ferramentas.'),
   (6, 2, 6, '[PROVISÓRIO] Quantos valores e quantos princípios compõem o Manifesto Ágil?',
    'O manifesto de 2001 declara 4 valores, detalhados em 12 princípios.'),
   (7, 2, 7, '[PROVISÓRIO] Como o Manifesto Ágil trata a mudança de requisitos?',
    'Responder a mudanças é mais valorizado do que seguir um plano.'),
   (8, 2, 8, '[PROVISÓRIO] Qual é a principal medida de progresso segundo os princípios ágeis?',
    'Um dos 12 princípios afirma que software funcionando é a medida primária de progresso.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (17, 5, 'A', 'Documentação abrangente.', false),
   (18, 5, 'B', 'Seguir um plano.', false),
   (19, 5, 'C', 'Indivíduos e interações.', true),
   (20, 5, 'D', 'Negociação de contratos.', false),
   (21, 6, 'A', '4 valores e 12 princípios.', true),
   (22, 6, 'B', '12 valores e 4 princípios.', false),
   (23, 6, 'C', '5 valores e 10 princípios.', false),
   (24, 6, 'D', '3 valores e 12 princípios.', false),
   (25, 7, 'A', 'Proíbe mudanças depois do início do desenvolvimento.', false),
   (26, 7, 'B', 'Aceita mudanças apenas com aditivo contratual.', false),
   (27, 7, 'C', 'Considera mudanças um sinal de falha no planejamento.', false),
   (28, 7, 'D', 'Acolhe mudanças, mesmo tardias, como vantagem competitiva para o cliente.', true),
   (29, 8, 'A', 'Quantidade de documentos produzidos.', false),
   (30, 8, 'B', 'Software funcionando.', true),
   (31, 8, 'C', 'Horas trabalhadas pela equipe.', false),
   (32, 8, 'D', 'Percentual do cronograma consumido.', false);

-- ------------------------------------------------------------
-- Tema 3: Introdução ao Scrum (questões 9-12; corretas D, B, C, A)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (9, 3, 9, '[PROVISÓRIO] Qual alternativa melhor define o Scrum?',
    'O Guia do Scrum define o Scrum como um framework leve, e não como uma metodologia completa.'),
   (10, 3, 10, '[PROVISÓRIO] Quais são os três pilares do empirismo no Scrum?',
    'O empirismo no Scrum se sustenta em transparência, inspeção e adaptação.'),
   (11, 3, 11, '[PROVISÓRIO] Qual é a duração máxima de uma Sprint?',
    'Sprints têm duração fixa de um mês ou menos.'),
   (12, 3, 12, '[PROVISÓRIO] Qual alternativa lista os valores do Scrum?',
    'O Guia do Scrum lista cinco valores: compromisso, foco, abertura, respeito e coragem.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (33, 9, 'A', 'Uma metodologia que prescreve todas as práticas de engenharia.', false),
   (34, 9, 'B', 'Uma ferramenta de software para gerenciar tarefas.', false),
   (35, 9, 'C', 'Um modelo sequencial dividido em fases fixas.', false),
   (36, 9, 'D', 'Um framework leve para gerar valor por meio de soluções adaptativas para problemas complexos.', true),
   (37, 10, 'A', 'Planejamento, execução e controle.', false),
   (38, 10, 'B', 'Transparência, inspeção e adaptação.', true),
   (39, 10, 'C', 'Escopo, prazo e custo.', false),
   (40, 10, 'D', 'Foco, coragem e respeito.', false),
   (41, 11, 'A', 'Uma semana.', false),
   (42, 11, 'B', 'Três meses.', false),
   (43, 11, 'C', 'Um mês.', true),
   (44, 11, 'D', 'Não há limite.', false),
   (45, 12, 'A', 'Compromisso, foco, abertura, respeito e coragem.', true),
   (46, 12, 'B', 'Velocidade, eficiência, controle e disciplina.', false),
   (47, 12, 'C', 'Hierarquia, padronização e previsibilidade.', false),
   (48, 12, 'D', 'Documentação, aprovação e auditoria.', false);

-- ------------------------------------------------------------
-- Tema 4: Papéis do Scrum (questões 13-16; corretas A, C, B, D)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (13, 4, 13, '[PROVISÓRIO] Quem é responsável por maximizar o valor do produto?',
    'O Product Owner responde pela maximização do valor do produto resultante do trabalho do time.'),
   (14, 4, 14, '[PROVISÓRIO] Qual é uma responsabilidade do Scrum Master?',
    'O Scrum Master serve ao time e à organização promovendo a eficácia do Scrum.'),
   (15, 4, 15, '[PROVISÓRIO] Quem decide como transformar os itens do Product Backlog em Incremento?',
    'Os Developers são auto-gerenciáveis quanto à forma de realizar o trabalho.'),
   (16, 4, 16, '[PROVISÓRIO] Qual é o tamanho recomendado para um Scrum Team?',
    'O Guia do Scrum recomenda times pequenos, tipicamente com 10 pessoas ou menos.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (49, 13, 'A', 'Product Owner.', true),
   (50, 13, 'B', 'Scrum Master.', false),
   (51, 13, 'C', 'Developers.', false),
   (52, 13, 'D', 'Gerente de projeto.', false),
   (53, 14, 'A', 'Definir sozinho a prioridade do Product Backlog.', false),
   (54, 14, 'B', 'Distribuir tarefas individualmente aos Developers.', false),
   (55, 14, 'C', 'Ajudar o time a entender e aplicar o Scrum, removendo impedimentos.', true),
   (56, 14, 'D', 'Aprovar cada linha de código antes da entrega.', false),
   (57, 15, 'A', 'O Product Owner.', false),
   (58, 15, 'B', 'Os Developers.', true),
   (59, 15, 'C', 'O Scrum Master.', false),
   (60, 15, 'D', 'Os stakeholders.', false),
   (61, 16, 'A', 'Exatamente 3 pessoas.', false),
   (62, 16, 'B', 'Entre 20 e 30 pessoas.', false),
   (63, 16, 'C', 'Sem limite: quanto maior, melhor.', false),
   (64, 16, 'D', 'Em geral 10 pessoas ou menos.', true);

-- ------------------------------------------------------------
-- Tema 5: Eventos do Scrum (questões 17-20; corretas B, D, A, C)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (17, 5, 17, '[PROVISÓRIO] Qual evento ocorre diariamente para inspecionar o progresso rumo à Meta da Sprint?',
    'A Daily Scrum é um evento de 15 minutos para os Developers inspecionarem o progresso.'),
   (18, 5, 18, '[PROVISÓRIO] Qual é o objetivo da Sprint Retrospective?',
    'Na Retrospective o Scrum Team inspeciona como foi a Sprint e planeja melhorias.'),
   (19, 5, 19, '[PROVISÓRIO] Em qual evento o Scrum Team define a Meta da Sprint?',
    'A Meta da Sprint é definida durante a Sprint Planning.'),
   (20, 5, 20, '[PROVISÓRIO] Qual é o propósito da Sprint Review?',
    'A Sprint Review é uma sessão de trabalho para inspecionar o resultado e adaptar o Product Backlog.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (65, 17, 'A', 'Sprint Review.', false),
   (66, 17, 'B', 'Daily Scrum.', true),
   (67, 17, 'C', 'Sprint Retrospective.', false),
   (68, 17, 'D', 'Sprint Planning.', false),
   (69, 18, 'A', 'Apresentar o Incremento aos stakeholders.', false),
   (70, 18, 'B', 'Estimar os itens do Product Backlog.', false),
   (71, 18, 'C', 'Definir a Meta da próxima Sprint.', false),
   (72, 18, 'D', 'Planejar formas de aumentar a qualidade e a eficácia do time.', true),
   (73, 19, 'A', 'Sprint Planning.', true),
   (74, 19, 'B', 'Daily Scrum.', false),
   (75, 19, 'C', 'Sprint Review.', false),
   (76, 19, 'D', 'Sprint Retrospective.', false),
   (77, 20, 'A', 'Avaliar individualmente cada Developer.', false),
   (78, 20, 'B', 'Corrigir os defeitos encontrados na Sprint.', false),
   (79, 20, 'C', 'Inspecionar o resultado da Sprint com os stakeholders e adaptar os próximos passos.', true),
   (80, 20, 'D', 'Substituir a Daily Scrum no último dia da Sprint.', false);

-- ------------------------------------------------------------
-- Tema 6: Artefatos do Scrum (questões 21-24; corretas C, A, D, B)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (21, 6, 21, '[PROVISÓRIO] Qual alternativa lista os três artefatos do Scrum?',
    'O Guia do Scrum define três artefatos: Product Backlog, Sprint Backlog e Incremento.'),
   (22, 6, 22, '[PROVISÓRIO] Qual compromisso está associado ao Incremento?',
    'Cada artefato tem um compromisso; o do Incremento é a Definição de Pronto.'),
   (23, 6, 23, '[PROVISÓRIO] O que compõe o Sprint Backlog?',
    'O Sprint Backlog reúne o porquê (meta), o quê (itens) e o como (plano).'),
   (24, 6, 24, '[PROVISÓRIO] Qual compromisso está associado ao Product Backlog?',
    'A Meta do Produto é o compromisso do Product Backlog.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (81, 21, 'A', 'Cronograma, orçamento e termo de abertura.', false),
   (82, 21, 'B', 'User Story, Épico e Tema.', false),
   (83, 21, 'C', 'Product Backlog, Sprint Backlog e Incremento.', true),
   (84, 21, 'D', 'Burndown, quadro Kanban e Roadmap.', false),
   (85, 22, 'A', 'Definição de Pronto.', true),
   (86, 22, 'B', 'Meta do Produto.', false),
   (87, 22, 'C', 'Meta da Sprint.', false),
   (88, 22, 'D', 'Critério de aceite.', false),
   (89, 23, 'A', 'Somente a lista de defeitos conhecidos.', false),
   (90, 23, 'B', 'Todo o Product Backlog ordenado.', false),
   (91, 23, 'C', 'As metas de longo prazo do produto.', false),
   (92, 23, 'D', 'A Meta da Sprint, os itens selecionados e o plano para entregá-los.', true),
   (93, 24, 'A', 'Definição de Pronto.', false),
   (94, 24, 'B', 'Meta do Produto.', true),
   (95, 24, 'C', 'Meta da Sprint.', false),
   (96, 24, 'D', 'Velocidade do time.', false);

-- ------------------------------------------------------------
-- Tema 7: User Stories (questões 25-28; corretas D, B, C, A)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (25, 7, 25, '[PROVISÓRIO] Qual é o formato mais comum de uma User Story?',
    'O formato papel, ação e benefício deixa claro quem precisa, o quê e por quê.'),
   (26, 7, 26, '[PROVISÓRIO] O que o acrônimo INVEST descreve?',
    'INVEST: independente, negociável, valiosa, estimável, pequena e testável.'),
   (27, 7, 27, '[PROVISÓRIO] Para que servem os critérios de aceite de uma User Story?',
    'Critérios de aceite tornam a história testável e verificável.'),
   (28, 7, 28, '[PROVISÓRIO] Quais são os 3 Cs de uma User Story?',
    'Ron Jeffries descreve a história como cartão, conversa e confirmação.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (97, 25, 'A', 'Requisito: o sistema deve executar uma função.', false),
   (98, 25, 'B', 'Caso de uso com fluxo principal e fluxos alternativos.', false),
   (99, 25, 'C', 'Diagrama de classes com atributos e métodos.', false),
   (100, 25, 'D', 'Como [papel], quero [ação], para [benefício].', true),
   (101, 26, 'A', 'As etapas de uma Sprint.', false),
   (102, 26, 'B', 'Características de uma boa User Story.', true),
   (103, 26, 'C', 'As responsabilidades do Scrum Team.', false),
   (104, 26, 'D', 'Um método de estimativa de custos.', false),
   (105, 27, 'A', 'Definir a remuneração do time.', false),
   (106, 27, 'B', 'Substituir a conversa com o Product Owner.', false),
   (107, 27, 'C', 'Estabelecer as condições para a história ser considerada atendida.', true),
   (108, 27, 'D', 'Ordenar o Product Backlog.', false),
   (109, 28, 'A', 'Cartão, conversa e confirmação.', true),
   (110, 28, 'B', 'Custo, cronograma e controle.', false),
   (111, 28, 'C', 'Código, compilação e cobertura.', false),
   (112, 28, 'D', 'Cliente, contrato e cobrança.', false);

-- ------------------------------------------------------------
-- Tema 8: Gestão do Product Backlog (questões 29-32; corretas A, C, B, D)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (29, 8, 29, '[PROVISÓRIO] Quem é o responsável final pela ordenação do Product Backlog?',
    'O Product Owner é responsável pelo Product Backlog e por sua ordenação.'),
   (30, 8, 30, '[PROVISÓRIO] O que é o refinamento do Product Backlog?',
    'Refinar é dividir e detalhar itens, acrescentando descrição, ordem e tamanho.'),
   (31, 8, 31, '[PROVISÓRIO] Que característica deve ter o Product Backlog?',
    'O Product Backlog é uma lista emergente e ordenada do que é necessário para melhorar o produto.'),
   (32, 8, 32, '[PROVISÓRIO] Qual critério é usado com frequência para priorizar itens do Product Backlog?',
    'Priorizar por valor, esforço e risco maximiza o retorno de cada Sprint.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (113, 29, 'A', 'Product Owner.', true),
   (114, 29, 'B', 'Scrum Master.', false),
   (115, 29, 'C', 'Developers.', false),
   (116, 29, 'D', 'Diretor da empresa.', false),
   (117, 30, 'A', 'Um evento formal obrigatório no fim da Sprint.', false),
   (118, 30, 'B', 'A exclusão de todos os itens antigos.', false),
   (119, 30, 'C', 'Detalhar, dividir e estimar itens para deixá-los prontos para seleção.', true),
   (120, 30, 'D', 'A aprovação do orçamento do produto.', false),
   (121, 31, 'A', 'Ser fixo durante todo o projeto.', false),
   (122, 31, 'B', 'Ser ordenado e evoluir continuamente.', true),
   (123, 31, 'C', 'Conter apenas defeitos.', false),
   (124, 31, 'D', 'Ser visível apenas ao Scrum Master.', false),
   (125, 32, 'A', 'A ordem alfabética dos títulos.', false),
   (126, 32, 'B', 'A data de criação do item.', false),
   (127, 32, 'C', 'A preferência pessoal de cada Developer.', false),
   (128, 32, 'D', 'O valor de negócio em relação ao esforço e ao risco.', true);

-- ------------------------------------------------------------
-- Tema 9: Kanban (questões 33-36; corretas B, D, A, C)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (33, 9, 33, '[PROVISÓRIO] Qual prática central do Kanban ajuda a evitar a sobrecarga do time?',
    'Limites de WIP reduzem a multitarefa e expõem gargalos.'),
   (34, 9, 34, '[PROVISÓRIO] O que é lead time no Kanban?',
    'Lead time mede do pedido até a entrega; o cycle time mede do início do trabalho até a entrega.'),
   (35, 9, 35, '[PROVISÓRIO] Para que serve o quadro Kanban?',
    'Visualizar o trabalho é uma das práticas centrais do Kanban.'),
   (36, 9, 36, '[PROVISÓRIO] Em comparação com o Scrum, o que caracteriza o Kanban?',
    'O Kanban trabalha com fluxo contínuo, sem iterações obrigatórias de duração fixa.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (129, 33, 'A', 'Aumentar o número de tarefas simultâneas.', false),
   (130, 33, 'B', 'Limitar o trabalho em progresso (WIP).', true),
   (131, 33, 'C', 'Eliminar o quadro visual.', false),
   (132, 33, 'D', 'Planejar entregas apenas uma vez por ano.', false),
   (133, 34, 'A', 'O tempo em que o item fica bloqueado.', false),
   (134, 34, 'B', 'O número de itens concluídos por semana.', false),
   (135, 34, 'C', 'A duração de uma reunião diária.', false),
   (136, 34, 'D', 'O tempo entre o pedido de um item e a sua entrega.', true),
   (137, 35, 'A', 'Visualizar o fluxo de trabalho e o estado de cada item.', true),
   (138, 35, 'B', 'Registrar as horas trabalhadas para pagamento.', false),
   (139, 35, 'C', 'Substituir a comunicação entre as pessoas.', false),
   (140, 35, 'D', 'Armazenar o código-fonte do produto.', false),
   (141, 36, 'A', 'Exige Sprints de duração fixa.', false),
   (142, 36, 'B', 'Define três papéis obrigatórios.', false),
   (143, 36, 'C', 'Não prescreve iterações de tamanho fixo e foca no fluxo contínuo.', true),
   (144, 36, 'D', 'Proíbe o uso de métricas de desempenho.', false);

-- ------------------------------------------------------------
-- Tema 10: Planejamento Ágil (questões 37-40; corretas C, A, D, B)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (37, 10, 37, '[PROVISÓRIO] O que é Planning Poker?',
    'No Planning Poker cada pessoa estima em segredo e as divergências são discutidas até o consenso.'),
   (38, 10, 38, '[PROVISÓRIO] Por que muitas equipes usam a sequência de Fibonacci nas estimativas?',
    'Os saltos maiores entre números grandes evitam falsa precisão.'),
   (39, 10, 39, '[PROVISÓRIO] O que é a velocidade de um time ágil?',
    'A velocidade histórica ajuda a prever quanto o time consegue entregar.'),
   (40, 10, 40, '[PROVISÓRIO] O que caracteriza o planejamento em ondas sucessivas (rolling wave)?',
    'O nível de detalhe do plano aumenta à medida que o trabalho se aproxima.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (145, 37, 'A', 'Um jogo de integração da equipe sem relação com o trabalho.', false),
   (146, 37, 'B', 'Uma forma de sortear tarefas entre os Developers.', false),
   (147, 37, 'C', 'Uma técnica colaborativa de estimativa por consenso.', true),
   (148, 37, 'D', 'Um relatório de custos do projeto.', false),
   (149, 38, 'A', 'Porque os intervalos crescentes refletem a incerteza maior em itens grandes.', true),
   (150, 38, 'B', 'Porque cada número representa horas exatas de trabalho.', false),
   (151, 38, 'C', 'Porque a sequência é exigida pelo Guia do Scrum.', false),
   (152, 38, 'D', 'Porque impede estimativas acima de 10.', false),
   (153, 39, 'A', 'O número de horas extras feitas na Sprint.', false),
   (154, 39, 'B', 'A rapidez de digitação dos Developers.', false),
   (155, 39, 'C', 'O tempo de resposta do sistema em produção.', false),
   (156, 39, 'D', 'A quantidade de trabalho concluída por iteração, usada para previsão.', true),
   (157, 40, 'A', 'Planejar todo o projeto em detalhe no primeiro dia.', false),
   (158, 40, 'B', 'Detalhar o trabalho próximo e manter o trabalho distante em nível mais alto.', true),
   (159, 40, 'C', 'Não fazer nenhum tipo de planejamento.', false),
   (160, 40, 'D', 'Planejar apenas depois da entrega final.', false);

-- ------------------------------------------------------------
-- Tema 11: Métricas Ágeis (questões 41-44; corretas D, B, C, A)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (41, 11, 41, '[PROVISÓRIO] O que mostra um gráfico de burndown?',
    'O burndown mostra quanto trabalho falta e como ele diminui ao longo da iteração.'),
   (42, 11, 42, '[PROVISÓRIO] O que é cycle time?',
    'Cycle time mede o tempo de execução efetiva de um item.'),
   (43, 11, 43, '[PROVISÓRIO] O que um diagrama de fluxo cumulativo (CFD) ajuda a identificar?',
    'Faixas que se alargam no CFD indicam acúmulo de trabalho em uma etapa.'),
   (44, 11, 44, '[PROVISÓRIO] Qual é um uso inadequado de métricas ágeis?',
    'A velocidade é relativa a cada time; usá-la como ranking distorce as estimativas.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (161, 41, 'A', 'A satisfação do cliente ao longo do tempo.', false),
   (162, 41, 'B', 'O custo acumulado do projeto.', false),
   (163, 41, 'C', 'O número de defeitos por Developer.', false),
   (164, 41, 'D', 'O trabalho restante em relação ao tempo.', true),
   (165, 42, 'A', 'O tempo total do projeto.', false),
   (166, 42, 'B', 'O tempo desde o início do trabalho em um item até a sua conclusão.', true),
   (167, 42, 'C', 'O intervalo entre duas Sprints.', false),
   (168, 42, 'D', 'A duração de uma reunião de planejamento.', false),
   (169, 43, 'A', 'O salário médio do time.', false),
   (170, 43, 'B', 'Os requisitos legais do produto.', false),
   (171, 43, 'C', 'Gargalos e acúmulo de trabalho em cada etapa do fluxo.', true),
   (172, 43, 'D', 'A linguagem de programação mais adequada.', false),
   (173, 44, 'A', 'Comparar a velocidade de times diferentes para ranqueá-los.', true),
   (174, 44, 'B', 'Acompanhar as tendências do próprio time.', false),
   (175, 44, 'C', 'Apoiar previsões de entrega.', false),
   (176, 44, 'D', 'Identificar oportunidades de melhoria.', false);

-- ------------------------------------------------------------
-- Tema 12: Qualidade em Projetos Ágeis (questões 45-48; corretas A, C, B, D)
-- ------------------------------------------------------------
insert into tbquestao (id, idtema, idimagem, enunciado, justificativa) values
   (45, 12, 45, '[PROVISÓRIO] Qual é a ideia central do TDD (Test-Driven Development)?',
    'No TDD o ciclo é: teste falhando, código mínimo para passar e refatoração.'),
   (46, 12, 46, '[PROVISÓRIO] Para que serve a Definição de Pronto (Definition of Done)?',
    'A Definição de Pronto dá transparência ao que significa trabalho concluído.'),
   (47, 12, 47, '[PROVISÓRIO] O que é integração contínua?',
    'Integrações frequentes e automatizadas detectam problemas cedo.'),
   (48, 12, 48, '[PROVISÓRIO] Qual prática ajuda a manter a qualidade do código ao longo do tempo?',
    'A refatoração apoiada por testes reduz a dívida técnica sem quebrar o comportamento.');

insert into tbalternativa (id, idquestao, letra, texto, correta) values
   (177, 45, 'A', 'Escrever o teste antes do código que o faz passar.', true),
   (178, 45, 'B', 'Testar apenas no fim do projeto.', false),
   (179, 45, 'C', 'Deixar os testes para a equipe de suporte.', false),
   (180, 45, 'D', 'Substituir os testes por revisões de documentação.', false),
   (181, 46, 'A', 'Definir a data de entrega do projeto.', false),
   (182, 46, 'B', 'Listar os membros do time.', false),
   (183, 46, 'C', 'Estabelecer um padrão de qualidade compartilhado para o Incremento.', true),
   (184, 46, 'D', 'Substituir os critérios de aceite de cada história.', false),
   (185, 47, 'A', 'Reunir o time uma vez por mês.', false),
   (186, 47, 'B', 'Integrar e testar o código automaticamente, várias vezes ao dia.', true),
   (187, 47, 'C', 'Contratar novos membros continuamente.', false),
   (188, 47, 'D', 'Integrar o produto apenas antes da entrega final.', false),
   (189, 48, 'A', 'Evitar alterar código que já funciona.', false),
   (190, 48, 'B', 'Aumentar o prazo de todas as Sprints.', false),
   (191, 48, 'C', 'Remover os testes automatizados para ganhar tempo.', false),
   (192, 48, 'D', 'Refatorar continuamente com o apoio de testes automatizados.', true);

-- ------------------------------------------------------------
-- Ajuste das sequências após os ids explícitos (research R5)
-- ------------------------------------------------------------
select setval(pg_get_serial_sequence('tbimagem', 'id'), (select max(id) from tbimagem));
select setval(pg_get_serial_sequence('tbquestao', 'id'), (select max(id) from tbquestao));
select setval(pg_get_serial_sequence('tbalternativa', 'id'), (select max(id) from tbalternativa));

commit;
