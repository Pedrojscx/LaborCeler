# Feature Specification: Flashcards e Perfil

**Feature Branch**: `007-flashcards-perfil`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Candidatos com conta revisam os temas da certificação com flashcards e acompanham a própria evolução. Escolhem um ou mais temas, se querem revisar só os cartões que ainda não dominam ou todos, e o tamanho da sessão. Cada cartão mostra uma pergunta; a pessoa tenta lembrar, vira o cartão para ver a resposta e se avalia como "Não sabia", "Quase" ou "Sabia". Ao fim da sessão, vê o resumo. No perfil, acompanha o domínio de cada tema, a evolução ao longo dos dias, uma sugestão de próximo foco e as conquistas obtidas. Visitantes sem conta veem um convite para entrar. Referências: docs/telas.md (telas 16 a 19), docs/identidade-visual.md, docs/kit-interface.md e o protótipo em docs/prototipo (FlashcardsEscolha, FlashcardsRevisao, FlashcardsFim e Perfil)." Com as 17 regras do mantenedor sobre acesso, dados, domínio, fila da sessão, volta do "Não sabia", salvamento a cada avaliação, revisão no celular, perfil, conquistas, raridade, notificações, termos, disponibilidade, conteúdo, segurança, testes obrigatórios (Princípio IX) e escopo do documento.

**Requisitos atendidos**: complemento, telas 16, 17, 18 e 19 de `docs/telas.md` (Princípios VII e
VIII), com RNF01, RNF02 e RNF03 de `docs/requisitos-desafio.md`; integração com as telas 1, 5, 6,
7, 8, 12, 15 e 21. Pelo Princípio VII, esta feature só é implementada depois de as features 002 a
006 estarem concluídas e validadas em clone limpo. A conformidade com a constituição 3.0.1 está no
fim deste documento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher o que revisar (Priority: P1)

O candidato conectado abre os flashcards, vê os 12 temas com quantos cartões cada um tem e quantos
ele já domina, escolhe um ou mais temas, decide se revisa só os cartões que ainda não domina ou
todos, escolhe o tamanho da sessão e começa.

**Why this priority**: é a porta de entrada dos flashcards; sem ela não há sessão nem revisão.

**Independent Test**: entrar como candidato, abrir "Flashcards" no cabeçalho, conferir a grade dos
12 temas, escolher dois temas, trocar a opção de cartões e o tamanho, conferir o resumo da sessão
em cada combinação e começar a revisão.

**Acceptance Scenarios**:

1. **Given** um candidato conectado, **When** ele escolhe "Flashcards" no cabeçalho, **Then** vê o
   título "Flashcards", o texto de apresentação, a grade dos 12 temas na ordem da prova (cada um
   com o ponto da cor do corpo celeste, o corpo, o nome do tema e "[total] cartões, [n]
   dominados"), "Quais cartões" com "Só os que ainda não domino" marcada, "Tamanho da sessão" com
   20 marcado, "Escolha pelo menos um tema." e o botão "Começar revisão" desativado.
2. **Given** Ceres · Eventos do Scrum com 10 cartões e 8 dominados e Urano · Gestão do Product
   Backlog com 10 cartões e 3 dominados, **When** o candidato escolhe os dois temas, **Then** os
   dois aparecem marcados e o resumo diz "2 temas escolhidos, 9 cartões disponíveis. A sessão terá
   9 cartões."
3. **Given** os mesmos temas, **When** ele escolhe "Todos os cartões dos temas escolhidos" e o
   tamanho 10, **Then** o resumo diz "2 temas escolhidos, 20 cartões disponíveis. A sessão terá 10
   cartões."
4. **Given** temas escolhidos em que todos os cartões já estão dominados, **When** a opção é "Só os
   que ainda não domino", **Then** a tela avisa que todos os cartões desses temas já estão
   dominados, sugere a opção "Todos os cartões dos temas escolhidos" e mantém "Começar revisão"
   desativado.
5. **Given** a página de um tema, o perfil, o resultado reprovado ou o histórico, **When** o
   candidato segue o caminho para revisar com flashcards, **Then** chega a esta tela com o tema (ou
   os temas) daquele caminho já escolhidos, podendo mudar a escolha.
6. **Given** temas escolhidos e o resumo com pelo menos 1 cartão, **When** o candidato escolhe
   "Começar revisão", **Then** a sessão começa com o primeiro cartão da fila (US2).
7. **Given** cartões dos temas escolhidos cuja última avaliação foi "Não sabia", "Quase" ou "Sabia"
   (ainda sem domínio), cartões nunca revisados e cartões dominados, **When** a sessão começa na
   opção "Só os que ainda não domino", **Then** os cartões aparecem nesta ordem: "Não sabia",
   "Quase", nunca revisados e revisados há mais tempo, sem nenhum dominado; **When** a opção é
   "Todos os cartões dos temas escolhidos", **Then** a ordem é a mesma, com os dominados no fim.

---

### User Story 2 - Revisar os cartões e se avaliar (Priority: P1)

Cada cartão mostra uma pergunta. O candidato tenta lembrar, vira o cartão para ver a resposta e se
avalia como "Não sabia", "Quase" ou "Sabia". Cada avaliação fica salva na hora.

**Why this priority**: é o centro dos flashcards; sem a autoavaliação gravada não há domínio,
evolução nem conquistas.

**Independent Test**: começar uma sessão, virar e avaliar cartões com mouse, toque e só teclado,
marcar um "Não sabia" e conferir que ele volta no fim, fechar a página no meio e conferir que as
avaliações feitas ficaram gravadas; repetir num celular de 360 px.

**Acceptance Scenarios**:

1. **Given** uma sessão começada, **When** o primeiro cartão aparece, **Then** a tela mostra o
   cabeçalho de foco com "Encerrar revisão", "Cartão 1 de [total]" com a barra de progresso, o
   chip "Corpo · Tema", a pergunta, "Pense na resposta e toque no cartão para virar." e o botão
   "Mostrar resposta", sem os botões de avaliação.
2. **Given** um cartão pela frente, **When** o candidato escolhe "Mostrar resposta" ou toca (ou
   clica) no próprio cartão, **Then** o cartão vira e mostra "Resposta", a resposta e a pergunta, e
   aparecem os botões "Não sabia", "Quase" e "Sabia".
3. **Given** um cartão virado, **When** o candidato escolhe uma avaliação, **Then** ela é gravada
   naquele momento, com o horário do servidor, e o próximo cartão aparece pela frente.
4. **Given** uma sessão de 10 cartões, **When** o candidato avalia o 3º como "Não sabia", **Then**
   o total passa a "de 11" e esse cartão volta uma vez, depois do 10º; avaliado de novo, não volta
   mais, qualquer que seja a avaliação. Um cartão avaliado como "Quase" não volta na mesma sessão.
5. **Given** um celular de 360 px, **When** o candidato revisa, **Then** "Mostrar resposta" e,
   depois, os três botões de avaliação ficam numa barra fixa no rodapé da tela, de largura total,
   com botões de 60 px de altura, e nenhuma parte da pergunta ou da resposta fica escondida sob a
   barra; arrastar o cartão para os lados não avalia nem vira o cartão.
6. **Given** um computador, **When** o candidato usa o teclado, **Then** a barra de espaço vira o
   cartão e as teclas 1, 2 e 3 registram "Não sabia", "Quase" e "Sabia", e todas as ações também
   são alcançáveis com Tab e acionáveis com Enter.
7. **Given** uma sessão com 5 cartões avaliados, **When** o candidato fecha ou recarrega a página,
   **Then** as 5 avaliações continuam gravadas e já contam no domínio e na fila da próxima sessão.
8. **Given** um cartão virado, **When** o candidato dá um duplo clique em "Sabia", **Then** só uma
   avaliação é gravada para aquele cartão.
9. **Given** uma falha ao gravar a avaliação, **When** ela acontece, **Then** aparece a notificação
   "Não foi possível salvar", o cartão continua virado com os botões ativos para tentar de novo e a
   sessão não avança para o próximo cartão.
10. **Given** um leitor de tela, **When** o cartão aparece, **Then** só a pergunta é lida e o foco
    está em "Mostrar resposta"; **When** o cartão vira, **Then** a resposta é anunciada, a face da
    frente deixa de ser lida e a barra de espaço não registra nenhuma avaliação.

---

### User Story 3 - Dominar um cartão ao longo dos dias (Priority: P1)

Um cartão só conta como dominado quando a pessoa diz que sabia a resposta em dias diferentes, sem
errar no meio. Assim, o domínio mede lembrança que dura, e não só a revisão do mesmo momento.

**Why this priority**: o domínio alimenta a fila, o resumo, o perfil, a área de estudos e as
conquistas; uma regra errada aqui contamina tudo.

**Independent Test**: com o relógio do servidor controlado, avaliar um cartão em combinações de
dias e avaliações e conferir o domínio dele na escolha de temas e no perfil.

**Acceptance Scenarios**:

1. **Given** um cartão nunca revisado, **When** o candidato o avalia como "Sabia" duas vezes no
   mesmo dia, **Then** o cartão não está dominado.
2. **Given** um cartão avaliado como "Sabia" num dia, **When** o candidato o avalia como "Sabia" em
   outro dia, **Then** o cartão passa a estar dominado.
3. **Given** um cartão dominado, **When** o candidato o avalia como "Quase" ou "Não sabia",
   **Then** o cartão deixa de estar dominado; um "Sabia" no dia seguinte não o recupera, e ele só
   volta a estar dominado com "Sabia" em dois dias diferentes depois do erro.
4. **Given** um cartão avaliado como "Sabia" às 23:59 e de novo à 00:01 do dia seguinte, pelo
   horário de Brasília, **When** o domínio é calculado, **Then** as duas avaliações contam como dois
   dias diferentes e o cartão está dominado.
5. **Given** o domínio de um tema, **When** o candidato o confere na escolha de temas, no perfil,
   na área de estudos e na página do tema, **Then** o número é o mesmo nos quatro lugares.

---

### User Story 4 - Ver o resumo da sessão (Priority: P2)

Ao terminar a sessão, o candidato vê como se saiu, quantos cartões passou a dominar e o que mudou em
cada tema, e escolhe o que fazer em seguida.

**Why this priority**: fecha o ciclo da sessão e leva à próxima revisão; depende das US1 e US2.

**Independent Test**: concluir uma sessão com as três avaliações e pelo menos um cartão que passe a
dominado, conferir os números e as linhas por tema, seguir "Revisar os [n] que errei" e, em outra
sessão, encerrar no meio.

**Acceptance Scenarios**:

1. **Given** a última avaliação da sessão, **When** o resumo aparece, **Then** mostra "Sessão
   concluída", "Você revisou 20 cartões de Ceres · Eventos do Scrum e Urano · Gestão do Product
   Backlog. Os 8 que ficaram como "Quase" ou "Não sabia" vão aparecer primeiro na próxima revisão."
   e os números "Sabia", "Quase", "Não sabia" (que somam 20) e "Novos dominados".
2. **Given** o resumo, **When** o candidato lê "Por tema", **Then** cada tema da sessão aparece com
   "[n] de [total] dominados" e a variação na sessão: "(mais 2)" se ganhou domínio, "(menos 1)" se
   perdeu, e nada se não mudou.
3. **Given** o resumo, **When** ele aparece, **Then** a notificação "Sessão salva" confirma que a
   evolução foi atualizada no perfil.
4. **Given** 8 cartões que ficaram como "Quase" ou "Não sabia", **When** o candidato escolhe
   "Revisar os 8 que errei", **Then** começa uma nova sessão com exatamente esses 8 cartões; numa
   sessão sem nenhum, o botão não aparece.
5. **Given** uma sessão com 5 cartões avaliados, **When** o candidato escolhe "Encerrar revisão",
   **Then** vê o resumo dos 5; **When** ele encerra antes de avaliar qualquer cartão, **Then** volta
   à escolha de temas, sem resumo.

---

### User Story 5 - Acompanhar a evolução no perfil (Priority: P2)

No perfil, o candidato vê quanto domina de cada tema, como o número de cartões dominados evoluiu
nos últimos 14 dias e qual tema merece atenção agora.

**Why this priority**: é onde a revisão vira progresso visível; depende do domínio (US3).

**Independent Test**: com um candidato que revisou em vários dias, abrir o perfil pelo nome no
cabeçalho e conferir as 12 barras, o gráfico dos 14 dias (inclusive a alternativa em texto), o
próximo foco e o perfil de um candidato sem nenhuma revisão.

**Acceptance Scenarios**:

1. **Given** um candidato conectado, **When** ele escolhe o próprio nome no cabeçalho, **Then** vê o
   perfil com o nome e "Estudando desde [data do cadastro]", sem CPF, e-mail nem outro dado
   cadastral.
2. **Given** o perfil, **When** o candidato lê "Domínio por tema", **Then** vê "[n] de [total]
   cartões dominados" e uma barra por tema, na ordem da prova, com "Corpo · Tema" e "[n] de
   [total]", a barra em âmbar quando o tema está todo dominado, e o texto que explica que o domínio
   vem das próprias avaliações dele.
3. **Given** o perfil, **When** o candidato lê "Cartões dominados", **Then** vê 14 barras, uma por
   dia, de 13 dias atrás até hoje, com o número de cartões dominados ao fim de cada dia, e um leitor
   de tela encontra o valor de cada dia em texto.
4. **Given** temas com proporções diferentes de cartões dominados, **When** o candidato lê "Próximo
   foco", **Then** vê o tema com a menor proporção, como "Makemake · Métricas Ágeis, com nenhum
   cartão dominado ainda", e "Revisar agora" leva à escolha de temas com esse tema escolhido.
5. **Given** um candidato que nunca revisou, **When** ele abre o perfil, **Then** vê as 12 barras
   zeradas, o gráfico zerado, o próximo foco em Mercúrio · Fundamentos da Agilidade (empate
   desfeito pela ordem dos temas) e as conquistas no estado dele.

---

### User Story 6 - Desbloquear conquistas (Priority: P2)

O candidato ganha conquistas em marcos do estudo, da primeira sessão à aprovação na certificação,
vê a data de cada uma e, quando há contas suficientes, quão rara ela é.

**Why this priority**: dá motivação e marcos concretos; depende do domínio e das revisões.

**Independent Test**: com o relógio do servidor controlado, provocar cada conquista, conferir a
notificação no momento em que ela é obtida, a data no perfil, o anel de progresso das que faltam e
a raridade com 29 e com 30 contas ativas.

**Acceptance Scenarios**:

1. **Given** um candidato que nunca concluiu uma sessão, **When** chega ao resumo da primeira
   sessão com pelo menos uma avaliação, **Then** aparece a notificação "Conquista desbloqueada"
   com "Primeira órbita: você concluiu sua primeira sessão de flashcards." e o perfil mostra a
   conquista com a data e a hora da conclusão; uma sessão abandonada (página fechada) não conta.
2. **Given** 9 dos 10 cartões de Ceres · Eventos do Scrum dominados, **When** a avaliação que
   domina o 10º é gravada, **Then** o candidato obtém "Explorador de Ceres", com a data e a hora
   dessa avaliação.
3. **Given** "Explorador de Ceres" obtida, **When** o candidato perde o domínio de um cartão de
   Ceres, **Then** a conquista continua obtida, com a mesma data.
4. **Given** uma conquista ainda não obtida, **When** o candidato vê a lista, **Then** ela aparece
   com o critério e um anel de progresso com o percentual, como "Constância" com 60% depois de
   revisões em 3 dias diferentes.
5. **Given** um candidato aprovado na certificação, em qualquer tentativa, **When** ele abre o
   perfil, **Then** "Lua cheia" aparece obtida, com a data da conclusão da tentativa aprovada,
   mesmo que ele nunca tenha usado os flashcards.
6. **Given** 30 ou mais contas ativas, **When** o candidato vê as conquistas em destaque, **Then**
   cada uma mostra a raridade, como "31% dos estudantes"; **Given** 29 contas ativas ou menos,
   **Then** nenhuma raridade aparece.
7. **Given** um candidato com 4 conquistas obtidas, **When** ele vê os destaques, **Then** vê as 3
   obtidas mais recentemente, com a mais recente no meio, mais alta.

---

### User Story 7 - Visitante descobre os flashcards (Priority: P3)

Quem não tem conta vê que os flashcards existem e o que eles oferecem, é convidado a criar conta ou
entrar e continua com toda a área de estudos aberta.

**Why this priority**: os flashcards são exclusivos de quem tem conta (regra 1); o convite é
importante, mas depende das telas da US1.

**Independent Test**: sem login, abrir os flashcards, tentar abrir a revisão, o resumo e o perfil
pelo endereço, e conferir os convites na área de estudos e na página do tema.

**Acceptance Scenarios**:

1. **Given** um visitante, **When** ele abre os flashcards, **Then** vê o cabeçalho público, a
   grade dos 12 temas esmaecida, só com o total de cartões de cada tema e sem nenhuma interação, e
   o cartão de vidro "Entre para usar 100% do Lunar Celer", com o texto do protótipo e os botões
   "Criar minha conta" e "Entrar".
2. **Given** um visitante, **When** ele abre pelo endereço a revisão, o resumo ou o perfil,
   **Then** é levado à tela Entrar.
3. **Given** um visitante na área de estudos, **When** chega ao fim da lista de temas, **Then** vê
   "Quer fixar o que estudou?", com "Criar minha conta" e "Entrar"; **Given** a página de um tema,
   **Then** vê "Revise com flashcards", com "Entrar".
4. **Given** um visitante, **When** ele navega pela área de estudos, **Then** todo o conteúdo
   continua aberto, sem nenhum material exigir login (decisão D8).

---

### User Story 8 - Flashcards no restante do portal (Priority: P3)

Com a feature entregue, o portal passa a mostrar tudo o que as features anteriores deixaram oculto
por depender dela, e a página "Disponível em breve" deixa de existir.

**Why this priority**: integração com as telas 1, 5, 6, 7, 8, 12 e 15 e com a regra de
disponibilidade; depende das US1 a US6.

**Independent Test**: depois da entrega, percorrer a tela inicial, o cabeçalho logado, a área de
estudos, a página de um tema, o resultado reprovado, o histórico e os termos, e tentar abrir o
endereço da página "Disponível em breve".

**Acceptance Scenarios**:

1. **Given** a tela inicial, **When** um visitante chega a "Entre e use 100% do Lunar Celer",
   **Then** vê as quatro vantagens da conta: flashcards, evolução tema a tema, conquistas e a
   certificação.
2. **Given** o cabeçalho logado, **When** o candidato escolhe "Flashcards" ou o próprio nome,
   **Then** chega aos flashcards ou ao perfil, e não mais à página "Disponível em breve".
3. **Given** a área de estudos, **When** um candidato conectado a abre, **Then** vê "Próximo foco"
   e, em cada cartão de tema, "Flashcards dominados [n] de [total]" com a barra.
4. **Given** a página de um tema, **When** um candidato conectado chega ao fim, **Then** vê "Revise
   o que estudou", com o domínio dos cartões daquele tema e o botão para revisá-lo.
5. **Given** o resultado de uma tentativa reprovada, **When** o candidato o lê, **Then** o texto
   menciona os flashcards e há um caminho para revisar com flashcards os temas que errou.
6. **Given** o histórico de uma tentativa, **When** o candidato lê uma linha com "Errou", "Tempo
   esgotado" ou "Interrompida", **Then** encontra, além de "Revisar o tema", o caminho para revisar
   aquele tema com flashcards.
7. **Given** esta feature entregue, **When** alguém abre o endereço da página "Disponível em
   breve", **Then** ela não existe mais, e nenhum link do portal leva a ela.
8. **Given** os termos de uso e privacidade, **When** alguém os lê, **Then** encontra as revisões
   de flashcards, as sessões de revisão e a evolução entre os dados coletados, visíveis só para o
   dono da conta, e a data de atualização nova.
9. **Given** um candidato que criou a conta antes da atualização dos termos, **When** ele abre a
   primeira página com login depois da atualização, **Then** vê uma única vez a notificação
   informativa "Atualizamos os termos de uso e privacidade", com o link para os termos, sem
   precisar aceitá-los de novo; **When** ele volta em outro momento ou em outro aparelho, **Then**
   a notificação não aparece mais. Quem criou a conta depois da atualização nunca a vê.

---

### Edge Cases

- Tema escolhido com todos os cartões dominados, na opção "Só os que ainda não domino": não soma
  cartões disponíveis; se todos os temas escolhidos estiverem assim, a tela avisa e sugere a opção
  "Todos os cartões dos temas escolhidos" (US1, cenário 4).
- Sessão "Todos" com os 12 temas: pode ter mais de 100 cartões, mais as voltas do "Não sabia"; o
  progresso continua correto do primeiro ao último.
- "Não sabia" no cartão que voltou: não volta uma segunda vez; a próxima sessão o põe no começo da
  fila.
- Cartão com imagem: a imagem aparece na frente, em painel claro, com texto alternativo; se ela não
  carregar, o texto alternativo aparece no lugar e a pergunta continua legível. Cartão sem imagem:
  só o texto.
- Pergunta ou resposta longa: o texto nunca é cortado; o cartão cresce ou rola por dentro, e no
  celular nada fica sob a barra fixa.
- Duplo clique, toque repetido ou nova tentativa automática da rede numa avaliação: uma só revisão
  gravada para aquela apresentação do cartão (FR-021).
- Avaliação para cartão que não existe, que não está na sessão, de uma sessão já encerrada ou sem
  sessão de login: recusada, sem gravar nada (FR-022).
- Avaliação antes de virar o cartão: os botões não existem na frente; um pedido forjado sem virar é
  aceito como avaliação daquela apresentação, porque virar é só exibição e não muda nada no
  servidor.
- Fechar ou recarregar a página no meio da sessão: as avaliações feitas ficam gravadas; a sessão
  não é retomada, fica sem conclusão e não conta para "Primeira órbita", e a próxima fila já
  considera as avaliações (FR-019).
- Candidato com conta anterior à atualização dos termos que entra ao mesmo tempo em duas abas ou
  dois aparelhos: a notificação de termos atualizados aparece numa só (FR-045a).
- Duas abas com sessões ao mesmo tempo: cada uma tem a sua sessão; as avaliações das duas são
  gravadas, e o domínio considera todas, na ordem do horário do servidor.
- Sessão de login de 8 horas que expira no meio da revisão: a próxima avaliação é recusada e a
  pessoa é levada a Entrar; as avaliações anteriores continuam gravadas.
- Meia-noite durante a sessão: cada avaliação conta no dia do horário de Brasília em que foi
  gravada.
- Relógio do aparelho errado: não importa; todo momento é o do servidor.
- Várias conquistas obtidas pela mesma avaliação (por exemplo, "Explorador de Éris", "Meio
  caminho" e "Sistema completo"): uma notificação para cada uma, no máximo três ao mesmo tempo
  (regra do kit), e todas aparecem no perfil.
- Conquista obtida durante a revisão: a notificação aparece sem tirar o foco do cartão e, no
  celular, acima da barra fixa, sem cobrir os botões.
- Domínio perdido depois de uma conquista: a conquista continua obtida, com a data original
  (FR-036).
- Exatamente 30 contas ativas: a raridade aparece; 29: não aparece. Conta que só revisou ou só
  respondeu há mais de 30 dias: não é ativa.
- Candidato aprovado que nunca revisou: o perfil mostra "Lua cheia" obtida e as outras conquistas
  com progresso zero.
- Candidato sem nenhuma revisão nem aprovação: "Nenhuma conquista desbloqueada ainda", sem
  destaques, com a lista completa e o progresso de cada uma.
- Visitante que abre a revisão, o resumo ou o perfil pelo endereço: vai para Entrar (FR-001).
- Pedido sobre revisões, sessão, domínio ou conquistas de outro candidato: mesma recusa de um
  recurso inexistente (FR-042).
- Banco indisponível: mensagem amigável de instabilidade no padrão do kit, sem tela parcial; uma
  avaliação que não pôde ser gravada segue o FR-018.
- Navegador sem JavaScript: as telas dos flashcards e do perfil avisam que precisam de JavaScript
  ativo; a área de estudos continua legível.
- Pedido de menos movimento: o cartão vira sem animação, as barras e os anéis aparecem sem
  transição e o céu fica parado.
- Troca da carga de cartões: só acontece com o volume do banco recriado, o que apaga também as
  revisões; nenhuma revisão aponta para um cartão inexistente.

## Requirements *(mandatory)*

### Functional Requirements

**Acesso (regra 1; telas 16 a 19)**

- **FR-001**: Os flashcards, o resumo da sessão e o perfil MUST ser exclusivos de quem tem conta. A
  tela 16 (escolha de temas) MUST abrir também para o visitante, no estado de visitante (FR-002);
  as telas 17 (revisão), 18 (resumo) e 19 (perfil) MUST exigir sessão e levar o visitante à tela
  Entrar, como toda tela logada. A área de estudos continua aberta a qualquer pessoa (decisão D8).
- **FR-002**: No estado de visitante, a tela 16 MUST ter o cabeçalho público ("Início" e "Entrar",
  como nas telas 7 e 8), a grade dos 12 temas esmaecida, sem interação e oculta para leitores de
  tela, com o total de cartões de cada tema ("10 cartões") e nenhum domínio, e o cartão de vidro
  "Entre para usar 100% do Lunar Celer" com o texto "Os flashcards guardam o que você já domina e
  mostram sua evolução tema a tema, por isso são exclusivos para quem tem conta. A área de estudos
  continua aberta." e os botões "Criar minha conta" e "Entrar".

**Cartões e carga (regras 2 e 14; Princípio VII)**

- **FR-003**: Cada um dos 12 temas da certificação MUST ter cartões, cada um com frente (a
  pergunta), verso (a resposta), posição no tema e, opcionalmente, uma imagem com texto
  alternativo, mostrada na frente. Os cartões MUST vir de carga SQL versionada no repositório e
  estar disponíveis logo na primeira subida a partir de um clone limpo, sem passo manual
  (Princípios V e VII). A forma de guardar está em `proposta-modelo-de-dados.md` (`tbflashcard`).
- **FR-004**: A carga provisória MUST ter de 8 a 10 cartões por tema, marcados como
  `[PROVISÓRIO]` na frente, com a resposta de cada cartão sustentada pelo material do mesmo tema
  na área de estudos e os termos ágeis fiéis ao Scrum Guide 2020. Nenhum cartão MUST usar a imagem
  de uma questão da certificação, para não antecipar a prova.
- **FR-005**: A verificação de conteúdo da carga MUST passar a contar e conferir os cartões: de 8 a
  10 por tema, frente e verso preenchidos, posições sem repetição no tema, arquivo de imagem
  existente e com texto alternativo quando houver imagem, e nenhuma imagem de questão; cada
  violação gera ERRO. A verificação também informa quantos cartões estão marcados como
  provisórios. A sinalização de carga incompleta do rodapé (FR-013 da 001) continua tratando só do
  conteúdo da certificação.

**Escolha da sessão (tela 16)**

- **FR-006**: Para o candidato conectado, a tela 16 MUST portar `FlashcardsEscolha.dc.html` com o
  kit: cabeçalho logado, com "Flashcards" marcado como página atual, e rodapé; o título
  "Flashcards" e o texto "Escolha os temas que quer revisar. Leia a frente, tente lembrar a
  resposta e só depois vire o cartão. Os cartões que você erra voltam antes dos outros."; o grupo
  "Temas", com os 12 temas na ordem da prova como botões de seleção múltipla, cada um com o ponto
  da cor do corpo celeste, o corpo, o nome do tema e "[total] cartões, [n] dominados"; o grupo
  "Quais cartões", com as opções de escolha única "Só os que ainda não domino" (marcada ao abrir) e
  "Todos os cartões dos temas escolhidos"; o grupo "Tamanho da sessão", com 10, 20 (marcado ao
  abrir) e "Todos"; o resumo da sessão; e o botão "Começar revisão". Ao abrir, nenhum tema está
  escolhido, salvo quando a pessoa chega por um caminho que já escolhe temas (FR-008).
- **FR-007**: O resumo MUST dizer "[n] temas escolhidos, [d] cartões disponíveis. A sessão terá [s]
  cartões.", no singular quando couber, em que [d] é o número de cartões dos temas escolhidos que
  entram na opção marcada (os não dominados ou todos) e [s] é o menor entre [d] e o tamanho
  escolhido ("Todos" é [d]). Sem tema escolhido, o resumo MUST ser "Escolha pelo menos um tema.";
  com temas escolhidos e [d] igual a zero, MUST ser "Você já domina todos os cartões dos temas
  escolhidos. Para revisá-los mesmo assim, escolha "Todos os cartões dos temas escolhidos"." Nos
  dois casos, "Começar revisão" fica desativado.
- **FR-008**: Os caminhos para revisar um tema com flashcards ("Revisar [corpo]" na página do
  tema, "Revisar agora" no perfil, o caminho do resultado reprovado e o do histórico) MUST abrir a
  tela 16 com o tema ou os temas daquele caminho já escolhidos, com as demais escolhas no padrão; a
  pessoa pode mudar tudo antes de começar.

**Fila da sessão (regra 4)**

- **FR-009**: Na opção "Só os que ainda não domino", a sessão MUST ser montada só com cartões não
  dominados dos temas escolhidos, nesta ordem: primeiro os cartões cuja última avaliação foi "Não
  sabia"; depois os de última avaliação "Quase"; depois os nunca revisados; e, por fim, os
  revisados há mais tempo (última avaliação "Sabia", ainda sem domínio). Dentro de cada grupo, a
  última avaliação mais antiga vem antes; os nunca revisados e os empates seguem a ordem dos temas
  e a posição do cartão no tema.
- **FR-010**: Na opção "Todos os cartões dos temas escolhidos", a sessão MUST seguir a mesma ordem
  e acrescentar, no fim, os cartões dominados, do revisado há mais tempo para o mais recente.
  Cartões dominados MUST NOT aparecer na opção "Só os que ainda não domino".
- **FR-011**: A fila MUST ser montada pelo servidor no início da sessão, a partir do histórico de
  revisões, e cortada no tamanho escolhido a partir do começo; a página não escolhe nem reordena
  cartões.

**Revisão (tela 17; regras 5 e 7)**

- **FR-012**: A tela 17 MUST portar `FlashcardsRevisao.dc.html` com o kit: cabeçalho de foco (só a
  marca, sem link, e "Encerrar revisão"), sem rodapé; "Cartão [n] de [total]" com a barra de
  progresso e o tema atual; o cartão grande com o chip "Corpo · Tema", a pergunta, a imagem quando
  houver e "Pense na resposta e toque no cartão para virar."; e o botão "Mostrar resposta".
- **FR-013**: "Mostrar resposta" e o toque ou clique no próprio cartão MUST virar o cartão em 3D,
  mostrando no verso "Resposta", a resposta e a pergunta; só então aparecem os botões "Não sabia",
  "Quase" e "Sabia". Nenhum gesto de arrastar MUST avaliar nem virar o cartão.
- **FR-014**: Na mesma sessão, um cartão avaliado como "Não sabia" MUST voltar uma única vez, no
  fim da sessão, depois do último cartão planejado e na ordem em que foi marcado; avaliado de novo,
  não volta mais, qualquer que seja a avaliação. Cartões avaliados como "Quase" ou "Sabia" não
  voltam na mesma sessão (confirmado pelo mantenedor, P-03). O [total] de "Cartão [n] de [total]"
  MUST crescer em 1 a cada volta marcada, e a mudança é anunciada a leitores de tela.
- **FR-015**: No celular (telas de até 600 px de largura, como no protótipo), "Mostrar resposta" e,
  depois de virar, os três botões de avaliação MUST ficar numa barra fixa no rodapé da tela, de
  largura total, com botões de 60 px de altura, respeitando a área segura do aparelho; o conteúdo
  do cartão MUST ter espaço para nunca ficar sob a barra, e a dica de teclado não aparece.
- **FR-016**: No computador, a barra de espaço MUST virar o cartão e as teclas 1, 2 e 3 MUST
  registrar "Não sabia", "Quase" e "Sabia" quando o cartão está virado; as indicações "tecla 1",
  "tecla 2" e "tecla 3" e a dica "No computador, a barra de espaço vira o cartão e as teclas 1, 2 e
  3 registram como você se saiu." aparecem só em telas com mais de 600 px. Os atalhos MUST agir só
  com o foco na área da revisão (cartão e botões) e sem teclas modificadoras, nunca com o foco em
  "Encerrar revisão", e todas as ações MUST também ser alcançáveis com Tab e acionáveis pelos
  botões.
- **FR-017**: A face escondida do cartão MUST ficar fora do alcance de leitores de tela. Ao abrir
  cada cartão, o foco vai para "Mostrar resposta"; ao virar, o foco vai para a resposta, que é
  anunciada, e de lá Tab chega aos botões de avaliação, de modo que a barra de espaço nunca
  registre uma avaliação por acidente.

**Salvamento e sessão (regras 6 e 15)**

- **FR-018**: Cada avaliação MUST ser gravada pelo servidor no momento em que a pessoa a escolhe,
  com o candidato da sessão de login, o cartão, a avaliação e o momento pelo relógio do servidor
  (confirmado pelo mantenedor, P-04). O próximo cartão só aparece depois de o servidor confirmar a
  gravação. Se ela falhar, a página MUST mostrar a notificação de erro do kit "Não foi possível
  salvar", com o texto "A revisão deste cartão não foi registrada. Tente de novo em instantes.", e
  manter o cartão virado, com os botões ativos para tentar de novo.
- **FR-019**: Fechar ou recarregar a página no meio da sessão MUST NOT perder nenhuma avaliação já
  gravada. A sessão interrompida assim não é retomada e fica sem conclusão: quem volta à revisão é
  levado à escolha de temas, e a fila da próxima sessão já considera as avaliações feitas.
- **FR-020**: A sessão MUST ser registrada quando a pessoa escolhe "Começar revisão", com o início
  pelo relógio do servidor, e termina quando o último cartão (com as voltas) é avaliado ou quando
  a pessoa escolhe "Encerrar revisão", sem confirmação, porque tudo já está gravado. Nos dois casos,
  se houver pelo menos uma avaliação, a sessão MUST receber a conclusão, com o momento pelo relógio
  do servidor, e a pessoa vê o resumo (tela 18); sem nenhuma avaliação, a sessão fica sem conclusão
  e a pessoa volta à escolha de temas, sem resumo nem notificação. Só uma sessão concluída conta
  para "Primeira órbita" (FR-035).
- **FR-021**: Cada apresentação de um cartão na sessão MUST aceitar uma única avaliação; repetições
  da mesma avaliação (duplo clique, toque repetido, nova tentativa da rede) MUST ser ignoradas,
  mantendo a primeira. A volta de um cartão "Não sabia" é uma nova apresentação.
- **FR-022**: O servidor MUST recusar, sem gravar nada, a avaliação: de cartão que não existe; de
  cartão que não está na sessão; de apresentação já avaliada (FR-021); de sessão já encerrada; de
  outro candidato; com valor fora de "Não sabia", "Quase" e "Sabia"; e sem sessão de login.
  Momento, domínio, candidato ou qualquer outro valor enviado pela página MUST ser ignorado.
- **FR-023**: Cada sessão de revisão MUST ficar registrada com o candidato, o início e, quando
  houver, a conclusão (FR-020), e cada revisão MUST pertencer a uma sessão do mesmo candidato
  (decisão do mantenedor, P-01, 03/10/2026). Só se grava revisão numa sessão sem conclusão. A
  sessão registra só esses fatos; a lista de cartões da sessão em andamento não é gravada. A forma
  de guardar está em `proposta-modelo-de-dados.md` (`tbsessao_revisao`).

**Domínio (regra 3, decisão do mantenedor)**

- **FR-024**: Um cartão MUST ser considerado dominado quando recebeu "Sabia" em pelo menos duas
  revisões feitas em dias diferentes e a revisão mais recente dele foi "Sabia". A primeira
  avaliação "Quase" ou "Não sabia" derruba o domínio, que recomeça do zero: só as avaliações
  "Sabia" posteriores a ela contam, de novo em dois dias diferentes. O dia é o do calendário de São
  Paulo, pelo momento de cada revisão no relógio do servidor. Um cartão nunca revisado não está
  dominado. O domínio MUST ser calculado a partir do histórico de revisões, nunca armazenado
  (Princípio IV), e MUST ser o mesmo em todas as telas que o mostram. A consulta de referência
  está em `proposta-modelo-de-dados.md`.
- **FR-025**: O domínio de um tema MUST ser o número de cartões dominados do tema sobre o total de
  cartões do tema ("[n] de [total]"), sempre do próprio candidato, calculado na hora.

**Resumo da sessão (tela 18; regra 11)**

- **FR-026**: A tela 18 MUST portar `FlashcardsFim.dc.html` com o kit: cabeçalho logado, com
  "Flashcards" marcado como página atual, e rodapé; o título "Sessão concluída"; o texto "Você
  revisou [n] cartões de [temas]." seguido, quando houver, de "Os [m] que ficaram como "Quase" ou
  "Não sabia" vão aparecer primeiro na próxima revisão.", com os temas no formato "Corpo · Tema";
  e os números "Sabia", "Quase", "Não sabia" e "Novos dominados". [n] é o número de cartões
  diferentes avaliados na sessão; os três primeiros números contam cada cartão pela última
  avaliação que recebeu na sessão e somam [n]; [m] é a soma de "Quase" e "Não sabia"; "Novos
  dominados" conta os cartões que não estavam dominados no início da sessão e estão no fim.
- **FR-027**: O bloco "Por tema" MUST listar cada tema da sessão com "[n] de [total] dominados" e a
  variação na sessão: "(mais [k])" quando o tema ganhou domínio, "(menos [k])" quando perdeu, e
  nenhuma indicação quando não mudou. Os botões MUST ser "Revisar os [m] que errei" (só com [m]
  maior que zero), "Escolher outros temas" (tela 16) e "Ver minha evolução" (perfil).
- **FR-028**: "Revisar os [m] que errei" MUST começar uma nova sessão com exatamente os [m] cartões
  que ficaram como "Quase" ou "Não sabia" na sessão que acabou, na ordem da fila (FR-009), com as
  mesmas regras de volta e de salvamento. O resumo é o da sessão que acabou de terminar; abrir o
  endereço do resumo sem uma sessão recém-terminada leva à escolha de temas.

**Perfil e evolução (tela 19; regra 8)**

- **FR-029**: A tela 19 MUST portar `Perfil.dc.html` com o kit: cabeçalho logado, com o nome do
  candidato marcado como página atual, e rodapé; no topo, o ícone de pessoa, o nome do candidato e
  "Estudando desde [data]", com a data do cadastro no formato "03/10/2026"; a coluna das conquistas
  (FR-037) e a coluna da evolução (FR-030 a FR-032). O perfil MUST NOT mostrar CPF, e-mail nem
  outro dado cadastral e não tem edição (decisão D5).
- **FR-030**: O bloco "Domínio por tema" MUST mostrar "[n] de [total] cartões dominados" e, na
  ordem da prova, uma linha por tema com o ponto da cor, "Corpo · Tema", a barra de domínio e "[n]
  de [total]"; a barra fica em âmbar quando o tema está todo dominado. O bloco MUST deixar claro
  que o domínio reflete as avaliações da própria pessoa, com o texto "O domínio vem das suas
  próprias avaliações nos flashcards: um cartão conta como dominado quando você marca "Sabia" nele
  em pelo menos dois dias diferentes, sem nenhum "Quase" ou "Não sabia" depois."
- **FR-031**: O bloco "Cartões dominados", com "últimos 14 dias", MUST mostrar 14 barras, uma por
  dia, de 13 dias antes de hoje até hoje, no calendário de São Paulo, cada uma com o número de
  cartões dominados ao fim daquele dia (hoje: o número atual), a de hoje em âmbar e os rótulos do
  primeiro dia (dia e mês) e "hoje". O gráfico MUST ter alternativa em texto com a data completa e o
  valor de cada dia, e não só um resumo.
- **FR-032**: O "Próximo foco" MUST ser o tema com a menor proporção de cartões dominados, com
  empate desfeito pela ordem dos temas, e mostrar "[Corpo · Tema], com nenhum cartão dominado
  ainda" ou "[Corpo · Tema], com [n] de [total] cartões dominados". No perfil, "Revisar agora" leva
  à tela 16 com esse tema escolhido. Com todos os cartões dos 12 temas dominados, o bloco MUST
  dizer "Você domina todos os cartões dos 12 temas." e "Revisar agora" leva à tela 16 sem tema
  escolhido. A mesma regra vale para o "Próximo foco" da área de estudos (FR-048).
- **FR-033**: Para quem nunca revisou, o perfil MUST mostrar as 12 barras e o gráfico zerados, o
  próximo foco pela regra do FR-032 (Mercúrio · Fundamentos da Agilidade) e as conquistas no estado
  da pessoa (inclusive "Lua cheia", se ela foi aprovada).

**Conquistas (regra 9)**

- **FR-034**: O catálogo MUST ter 18 conquistas, cada uma com nome e critério: "Primeira órbita"
  ("Conclua sua primeira sessão de flashcards"); "Explorador de [corpo]", uma por tema ("Domine
  todos os cartões de [Corpo · Tema]"), com o nome "Explorador da Terra" no tema 3 (só Terra leva
  artigo; as demais ficam "de [corpo]", como "Explorador de Mercúrio") (P-08); "Meio caminho"
  ("Tenha cartões dominados em 6 temas diferentes"); "Cem revisões" ("Faça 100 revisões de
  cartões"); "Constância" ("Revise em 5 dias diferentes"); "Sistema completo" ("Domine todos os
  cartões dos 12 temas"); e "Lua cheia" ("Seja aprovado na certificação").
- **FR-035**: Cada conquista MUST ser obtida no primeiro momento em que a sua condição passa a valer,
  e a data de obtenção é esse momento: "Primeira órbita", a conclusão da primeira sessão concluída
  (FR-020); "Explorador de [corpo]", a revisão que deixou todos os cartões do tema dominados ao mesmo
  tempo; "Meio caminho", a revisão que levou a pelo menos um cartão dominado em 6 temas ao mesmo
  tempo; "Cem revisões", a 100ª revisão; "Constância", a primeira revisão do 5º dia diferente com
  revisões, seguidos ou não, no calendário de São Paulo; "Sistema completo", a revisão que deixou
  todos os cartões dos 12 temas dominados ao mesmo tempo; "Lua cheia", a conclusão de uma
  tentativa aprovada (8 acertos ou mais, regra da 005), em qualquer tentativa. "Revisão" é cada
  avaliação gravada de um cartão.
- **FR-036**: Conquistas e datas MUST ser calculadas a partir do histórico de revisões e das
  respostas da certificação, nunca armazenadas (Princípio IV). Uma conquista obtida MUST continuar
  obtida, com a data original, mesmo que a condição deixe de valer depois (por exemplo, quando um
  cartão perde o domínio) (confirmado pelo mantenedor, P-05).
- **FR-037**: A coluna das conquistas MUST mostrar o número grande "[n] conquistas desbloqueadas"
  ("1 conquista desbloqueada"; sem nenhuma, "Nenhuma conquista desbloqueada ainda"); os três
  destaques, que são as três obtidas mais recentemente, com a mais recente no meio e mais alta,
  cada uma com o nome e, quando exibida, a raridade (com menos de três obtidas, só as que existem;
  sem nenhuma, nenhum destaque) (confirmado pelo mantenedor, P-06); e a lista "Todas as conquistas",
  com as 18 na ordem do catálogo (as "Explorador" na ordem dos temas), cada uma com o nome, o
  critério e, se obtida, "Desde [data]" no formato "05/10/2026" ou, se não, o anel de progresso com
  o percentual arredondado para baixo, que nunca mostra 100% antes da obtenção. O progresso é:
  "Explorador", cartões dominados do tema sobre o total do tema; "Meio caminho", temas com cartão
  dominado sobre 6; "Cem revisões", revisões sobre 100; "Constância", dias com revisão sobre 5;
  "Sistema completo", cartões dominados sobre o total; "Primeira órbita" e "Lua cheia", 0% até a
  obtenção. O atalho "Ver todas" leva à lista.

**Raridade (regra 10; Princípio VI)**

- **FR-038**: A raridade de uma conquista MUST ser o percentual das contas ativas que a têm, sobre o
  total de contas ativas, e MUST aparecer só quando houver pelo menos 30 contas ativas; abaixo
  disso, nenhuma raridade aparece. Conta ativa é a que fez pelo menos uma revisão ou respondeu pelo
  menos uma questão (resposta registrada como respondida) nos últimos 30 dias, pelo relógio do
  servidor. O percentual aparece como "[x]% dos estudantes", arredondado para o inteiro mais
  próximo, e como "menos de 1% dos estudantes" quando é maior que zero e arredondaria para zero.
- **FR-039**: A raridade MUST ser sempre agregada: a página recebe só o percentual de cada
  conquista, nunca quais contas a têm, quantas são nem qualquer dado de outra pessoa. Contas
  ativas e raridade são calculadas na hora, nunca armazenadas (Princípios IV e VI).

**Notificações (regra 11; tela 21)**

- **FR-040**: Ao aparecer o resumo de uma sessão, o portal MUST mostrar a notificação de sucesso
  do kit "Sessão salva", com o texto "Sua evolução foi atualizada no perfil, com [k] cartões novos
  dominados." ou, sem novos dominados, "Sua evolução foi atualizada no perfil." A notificação não é
  o único sinal: o próprio resumo confirma a sessão.
- **FR-041**: Quando uma avaliação ou a conclusão de uma sessão faz o candidato obter uma
  conquista, o portal MUST mostrar a notificação do tipo conquista do kit, com o título "Conquista
  desbloqueada" e o texto "[Nome]: [frase]" (por exemplo, "Primeira órbita: você concluiu sua
  primeira sessão de flashcards." ou "Explorador de Ceres: você domina todos os cartões de Ceres ·
  Eventos do Scrum."), uma por conquista. Durante a revisão, ela não tira o
  foco do cartão e, no celular, aparece acima da barra fixa. "Lua cheia" é anunciada no resultado
  da tentativa aprovada aberto a partir da correção do 12º tema, uma única vez. A notificação nunca
  é o único lugar da informação: toda conquista aparece no perfil.

**Segurança e privacidade (regra 15; Princípios I e VI)**

- **FR-042**: Revisões, sessões, domínio, evolução, próximo foco e conquistas MUST ser acessíveis
  só pelo próprio candidato, com sessão de login; pedido sobre dados de outro candidato MUST
  receber a mesma recusa de um recurso inexistente, sem revelar se ele existe, e nada do que a
  página recebe MUST conter identificador interno ou dado de outro candidato.
- **FR-043**: Os únicos dados aceitos da página MUST ser: os temas escolhidos, a opção de cartões e
  o tamanho da sessão, a avaliação de uma apresentação de cartão (um dos três valores) e o pedido
  de encerrar a sessão. Fila, momento, domínio, conquistas e raridade são sempre do servidor.
- **FR-044**: Nenhuma tela desta feature MUST mostrar ou enviar à página CPF, e-mail ou outro dado
  cadastral além do nome do candidato (cabeçalho logado e perfil) e da data do cadastro (perfil).

**Termos de uso e privacidade (regra 12; tela 5; pendência P-09 da 002)**

- **FR-045**: Os termos MUST ser atualizados, com nova data de "Última atualização": em "Quais dados
  coletamos", "Nos flashcards: cada cartão que você avalia, a avaliação ("Não sabia", "Quase" ou
  "Sabia") e a data e a hora da avaliação, e o início e o fim de cada sessão de revisão." e, junto
  dos dados do cadastro, a data e a hora em que a pessoa foi avisada de uma atualização dos termos
  (FR-045a); em "Para que usamos esses dados", que as avaliações calculam o domínio de cada
  tema, a evolução, o próximo foco e as conquistas, visíveis só para o dono da conta; em "O que
  fica público", que nada dos flashcards nem do perfil é público e que a raridade das conquistas
  aparece só como percentual agregado das contas ativas, a partir de 30, sem identificar ninguém. O
  prazo de guarda e os direitos pela LGPD continuam os mesmos e passam a valer também para as
  revisões e as sessões.
- **FR-045a**: A atualização dos termos MUST NOT pedir novo aceite de quem já tem conta. Quem se
  cadastrou antes da versão vigente dos termos e ainda não foi avisado dela (o momento do último
  aviso é nulo ou anterior à data dessa versão) MUST ver, uma única vez, na primeira página com
  login que abrir depois da atualização, a notificação informativa do
  kit "Atualizamos os termos de uso e privacidade", com o link "Ler os termos", que leva à página
  dos termos. O momento do aviso MUST ser registrado pelo servidor na mesma operação que decide
  mostrá-lo, de modo que nem outro acesso nem outra aba ou aparelho o mostrem de novo; quem criou a
  conta depois da versão vigente não o vê, porque a aceitou no cadastro. A data da versão vigente é
  a exibida no topo da página dos termos, e a regra vale de novo a cada versão (decisão do
  mantenedor, P-10, 03/10/2026).

**Disponibilidade e integração (regra 13; FR-050 da 002)**

- **FR-046**: A seção "Entre e use 100% do Lunar Celer" da tela inicial MUST passar a listar, na
  ordem do protótipo, as quatro vantagens da conta: "Flashcards com revisão inteligente" ("Os
  cartões que você erra voltam antes dos outros."), "Sua evolução tema a tema" ("Veja quanto já
  domina de cada um dos 12 temas."), "Conquistas a cada etapa" ("Marcos do seu estudo, da primeira
  revisão à Lua cheia.") e "A certificação completa" (FR-038 da 002).
- **FR-047**: No cabeçalho logado, "Flashcards" MUST levar à tela 16 e o nome do candidato ao
  perfil (tela 19), e não mais à página "Disponível em breve" (FR-024 e FR-048 da 002).
- **FR-048**: Na área de estudos (tela 7), o candidato conectado MUST ver o bloco "Próximo foco"
  (regra do FR-032), com "Estudar [corpo]" levando à página do tema, e, em cada cartão de tema,
  "Flashcards dominados [n] de [total]" com a barra de domínio; o visitante MUST ver, depois da
  grade, "Quer fixar o que estudou?" com "Com uma conta, cada tema ganha flashcards para revisar, e
  o portal acompanha o quanto você já domina." e os botões "Criar minha conta" e "Entrar" (FR-017
  da 003).
- **FR-049**: Na página do tema (tela 8), antes da navegação entre temas, o candidato conectado MUST
  ver "Revise o que estudou", com "Você domina [n] de [total] cartões de [Corpo · Tema]. Revise os
  [r] que faltam." (ou, com o tema todo dominado, "Você domina todos os [total] cartões de [Corpo ·
  Tema].") e o botão "Revisar [corpo]", que leva à tela 16 com o tema escolhido; o visitante MUST
  ver "Revise com flashcards", com "Entre para revisar os cartões de [Corpo · Tema] e acompanhar o
  quanto você já domina." e o botão "Entrar" (FR-017 da 003).
- **FR-050**: No resultado reprovado (tela 12), o texto MUST terminar em "e até lá a área de
  estudos e os flashcards ajudam a revisar os temas que você errou." (FR-009 da 005), e MUST
  aparecer, depois de "Revisar os temas que errei", o botão "Revisar com flashcards", que leva à
  tela 16 com os temas errados (acerto não; erro, tempo esgotado e interrompida sim) já escolhidos
  (confirmado pelo mantenedor, P-07).
- **FR-051**: No histórico (tela 15), cada linha com "Errou", "Tempo esgotado" ou "Interrompida" MUST
  ganhar, depois de "Revisar o tema", o link "Revisar com flashcards", com nome acessível que inclui
  o corpo e o tema ("Revisar com flashcards o tema Urano, Gestão do Product Backlog"), levando à
  tela 16 com aquele tema escolhido (confirmado pelo mantenedor, P-07; FR-010 da 006).
- **FR-052**: Ao ser entregue, esta feature MUST tirar os destinos "flashcards" e "perfil" da página
  "Disponível em breve", e a página MUST deixar de existir (FR-024 da 002, FR-020 da 006): nenhum
  link do portal leva mais a ela, e o endereço dela responde como um endereço inexistente (com a
  página não encontrada, quando a feature 008 existir).

**Interface e acessibilidade (RNF01, RNF02; Princípios II e XI)**

- **FR-053**: As telas 16 a 19 MUST usar o kit de interface e portar, sem redesenhar,
  `FlashcardsEscolha.dc.html`, `FlashcardsRevisao.dc.html`, `FlashcardsFim.dc.html` e
  `Perfil.dc.html`, com as correções de `docs/identidade-visual.md` (cinza `#8A8A93` em texto
  pequeno, Inter só nos pesos 300, 400 e 500, fontes do próprio projeto), sem JavaScript inline nem
  bibliotecas de terceiros, com o céu estrelado e o título de cada página terminando em "· Lunar
  Celer". Todo texto que nomeia um tema MUST usar o formato "Corpo · Tema" (identidade visual,
  seção 1); rótulos curtos de ação mantêm só o corpo ("Revisar Ceres", "Estudar Makemake"), com
  nome acessível que inclui o corpo e o tema ("Revisar Ceres, Eventos do Scrum") (P-08).
- **FR-054**: As quatro telas e os blocos novos das telas 1, 7, 8, 12 e 15 MUST funcionar a partir de
  360 px de largura sem rolagem horizontal, com contraste AA em todo texto, foco visível, alvos de
  toque de pelo menos 44 px (60 px nos botões da barra fixa da revisão), uso completo só com
  teclado e respeito ao pedido de menos movimento (cartão que vira sem animação, barras e anéis sem
  transição). A seleção dos temas e do tamanho MUST informar o estado escolhido a leitores de tela
  (botões pressionados), as opções de cartões MUST ser botões de opção reais, e barras, anéis e
  gráfico MUST ter o valor também em texto, e não só em cor ou forma.

**Testes obrigatórios (regra 16; Princípio IX por regra do mantenedor)**

- **FR-055**: MUST existir testes automatizados, que passam a cada mudança nessas regras, para:
  domínio (dois "Sabia" no mesmo dia não dominam; "Sabia" em dois dias dominam; "Quase" ou "Não
  sabia" depois derruba; a reconquista exige dois dias novos; a virada da meia-noite em São Paulo);
  ordem da fila nas duas opções, com os cinco grupos e o corte pelo tamanho; volta do "Não sabia"
  uma única vez no fim da sessão, sem volta do "Quase"; salvamento por avaliação (avaliações
  gravadas antes de a página fechar, repetição ignorada, falha sem avanço); recusas do FR-022
  (cartão inexistente, fora da sessão, apresentação já avaliada, sessão encerrada, valor
  inválido, sem login); registro da sessão (início ao começar, conclusão só com pelo menos uma
  avaliação, revisão só em sessão aberta e do mesmo candidato); cada conquista e a sua data,
  inclusive "Primeira órbita" só com sessão concluída, a permanência depois de o domínio cair e "Lua
  cheia" em qualquer tentativa; raridade com 29 e com 30 contas ativas, conta inativa fora da conta
  e nenhum dado individual no que a página recebe; aviso de atualização dos termos (uma única vez
  para quem aceitou antes da atualização, nunca para quem aceitou depois, de novo a cada nova
  atualização); e acesso a dados de outro candidato (revisões, sessão, domínio, perfil e
  conquistas), com a mesma recusa de um recurso inexistente.

### Key Entities *(include if feature involves data)*

- **Cartão (flashcard)**: unidade de revisão de um tema, com frente (pergunta), verso (resposta),
  posição no tema e imagem opcional. Novo no esquema (`tbflashcard`, na proposta).
- **Revisão**: cada avaliação de um cartão por um candidato, numa sessão, com a avaliação ("Não
  sabia", "Quase" ou "Sabia") e o momento pelo relógio do servidor. Novo no esquema (`tbrevisao`,
  na proposta). É dado pessoal, visível só para o dono (Princípio VI).
- **Sessão de revisão**: os cartões revisados de uma vez, de "Começar revisão" ao resumo. Fica
  registrada com o candidato, o início e, quando chega ao resumo com pelo menos uma avaliação, a
  conclusão (`tbsessao_revisao`, na proposta). A fila montada no início e as voltas do "Não sabia"
  não são gravadas. É dado pessoal, visível só para o dono.
- **Domínio**: estado de um cartão para um candidato, calculado do histórico (FR-024); o domínio
  por tema e o próximo foco derivam dele. Nunca armazenado.
- **Conquista**: marco do catálogo de 18, obtido por um candidato numa data, calculado das revisões
  e das respostas da certificação. Nunca armazenada.
- **Conta ativa e raridade**: estatística agregada sobre as contas com revisão ou resposta nos
  últimos 30 dias. Nunca armazenada.
- **Candidato, Tema, Imagem, Certificação e Resposta**: já existem; o candidato dá o nome e a data
  do cadastro do perfil e ganha o momento do último aviso de atualização dos termos (FR-045a), o
  tema organiza os cartões, a imagem ilustra cartões, e certificação e resposta dão a "Lua cheia" e
  a atividade da conta.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A partir do cabeçalho logado, um candidato começa uma sessão em até 3 escolhas
  ("Flashcards", um tema e "Começar revisão") e em até 30 segundos.
- **SC-002**: Em 100% dos testes de domínio, dois "Sabia" no mesmo dia não dominam, "Sabia" em dois
  dias dominam, um "Quase" ou "Não sabia" depois derruba, a reconquista só acontece com dois dias
  novos, e a virada da meia-noite em São Paulo separa os dias.
- **SC-003**: Em 100% dos testes de fila com os cinco grupos de cartões, a ordem segue o FR-009 e o
  FR-010, e 0 cartões dominados aparecem na opção "Só os que ainda não domino".
- **SC-004**: 100% das avaliações confirmadas antes de fechar a página estão no histórico; em 100
  duplos cliques, 0 avaliações duplicadas; 0 avaliações aceitas para cartão fora da sessão.
- **SC-005**: Na rede local da apresentação, o próximo cartão aparece em até 1 segundo depois da
  avaliação, e a escolha de temas e o perfil aparecem em até 2 segundos para um candidato com 2.000
  revisões.
- **SC-006**: No celular de 360 px, os botões de avaliação ficam na barra fixa de largura total, com
  60 px de altura, e 0 linhas do cartão ficam sob a barra; uma sessão de 10 cartões é concluída só
  com teclado no computador.
- **SC-007**: As 18 conquistas aparecem com a data certa em 100% dos cenários de teste, inclusive
  depois de o domínio cair, e "Lua cheia" aparece para aprovação em qualquer tentativa.
- **SC-008**: Com 29 contas ativas, 0 raridades aparecem; com 30, todas aparecem, com o percentual
  igual ao cálculo agregado, e 0 dados que identifiquem alguém chegam à página.
- **SC-009**: 100% dos pedidos sobre revisões, sessão, domínio, perfil ou conquistas de outro
  candidato recebem a mesma recusa de um recurso inexistente.
- **SC-010**: Depois da entrega, 0 links levam à página "Disponível em breve", o endereço dela não
  existe mais e 100% dos trechos que as features 002, 003, 005 e 006 deixaram ocultos até a 007
  aparecem.
- **SC-011**: Na primeira subida a partir de um clone limpo, os 12 temas têm de 8 a 10 cartões
  provisórios cada, a verificação da carga passa e 0 cartões usam imagem de questão.
- **SC-012**: Navegando só com teclado, 100% dos elementos acionáveis das telas 16 a 19 são
  alcançados com foco visível; as telas passam no contraste AA e ficam sem rolagem horizontal de 360
  px a 1920 px; com a redução de movimento ativada, 0 animações ficam em execução.
- **SC-013**: Em teste com 5 pessoas depois da entrega, todas explicam, depois de ler o perfil, por
  que um cartão marcado "Sabia" duas vezes no mesmo dia ainda não está dominado.
- **SC-014**: 100% dos dados gravados pelos flashcards aparecem descritos nos termos de uso e
  privacidade.
- **SC-015**: 100% dos testes do FR-055 passam a partir de um clone limpo.
- **SC-016**: Depois de uma atualização dos termos, 100% das contas criadas antes dela recebem a
  notificação "Atualizamos os termos de uso e privacidade" exatamente uma vez, e 0 contas criadas
  depois a recebem.

## Assumptions

- **Ordem de entrega**: a spec é escrita agora, mas a implementação só começa depois de as
  features 002 a 006 estarem concluídas e validadas em clone limpo (Princípio VII).
- **Esquema**: a recomendação está em `proposta-modelo-de-dados.md`, validada em PGlite
  (PostgreSQL 18) sobre o esquema atual, as cargas e as propostas da 004 e da 006, sem aplicar:
  `tbflashcard`, `tbsessao_revisao` e `tbrevisao` (a terceira tabela é a decisão P-01, que amplia as
  duas da regra 2), a coluna do aviso dos termos em `tbcandidato` (decisão P-10), duas views de
  cálculo (domínio depois de cada revisão e conquistas com data) e consultas de referência para
  domínio, fila, 14 dias, raridade e aviso dos termos. "Lua cheia em qualquer tentativa" e a
  atividade da conta pelas respostas dependem das várias tentativas da proposta da 004.
- **Sessão concluída** (FR-020): é a que chega ao resumo com pelo menos uma avaliação, pelo último
  cartão ou por "Encerrar revisão"; é essa a sessão que conta para "Primeira órbita".
- **Revisão**: cada avaliação gravada de um cartão; é o que "Cem revisões" conta e o que entra no
  histórico.
- **Avaliação gravada antes do próximo cartão** (FR-018): na rede local, a confirmação é rápida; a
  espera evita pular um cartão cuja avaliação não foi gravada.
- **Sessão não retomada** (FR-019): fechar a página encerra a sessão em andamento sem resumo; as
  avaliações ficam e a próxima fila as considera, o que basta para a regra 6.
- **"Revisar os [m] que errei"** (FR-028): "errei" inclui "Quase", como no texto do protótipo ("Os 8
  que ficaram como "Quase" ou "Não sabia"").
- **"Todos os cartões"** (FR-010): a regra 4 não diz onde ficam os dominados; eles entram no fim,
  porque são os que menos precisam de revisão.
- **Conta ativa** (FR-038): "respondeu pelo menos uma questão" é ter uma resposta registrada como
  respondida; questão que expirou ou foi interrompida não conta.
- **Raridade em inteiro** (FR-038): o protótipo mostra percentuais inteiros ("31% dos
  estudantes"); "menos de 1%" evita mostrar 0% para uma conquista que alguém tem.
- **Lua cheia** (FR-041): o resultado aprovado já anuncia a aprovação; a notificação aparece só na
  primeira abertura dele, a partir da correção do 12º tema, para cumprir a regra 11 sem repetir.
- **Termos** (FR-045, FR-045a): as revisões só existem para quem usa os flashcards, que é uma ação
  voluntária; por isso a atualização dos termos não pede novo aceite, e quem já tinha conta é
  avisado uma única vez (decisão P-10). O aviso usa a notificação informativa do kit, que some
  sozinha em 5 segundos, com pausa enquanto o mouse ou o foco estão sobre ela; os termos continuam
  no rodapé de todas as telas, com a data da última atualização no topo. Lembrar que o aviso já
  foi dado exige gravar o momento dele, o que a proposta faz com uma coluna em `tbcandidato`.
- **Ordem dos temas e corpos celestes**: `docs/identidade-visual.md`, seção 7, com a lista da
  decisão D3.
- **Fuso horário**: horário de Brasília, o mesmo que o `docker-compose.yml` já configura para a
  aplicação e o banco; o dia do domínio, da constância e do gráfico é o do calendário de São Paulo.
- **Conteúdo**: a carga provisória entra com esta feature; os cartões definitivos e a conferência
  de coerência com o material ficam com a trilha de conteúdo (pendência P-11), sem mudar o código.
- Sem edição de perfil (decisão D5): o perfil só lê o nome e a data do cadastro.

## Conflitos entre as fontes

1. **Acesso à tela 16**: o mapa de `docs/telas.md` marca a tela 16 como "Logado", mas a própria tela
   16 descreve o estado de visitante, e o protótipo mostra o cabeçalho logado nesse estado.
   Resolução pela regra 1: a tela 16 abre para o visitante, com o cabeçalho público, e as telas 17
   a 19 exigem login (FR-001, FR-002). `docs/telas.md` alinhado (P-09).
2. **Regra de domínio**: a tela 19 de `docs/telas.md` diz que o cartão está dominado quando "as duas
   últimas avaliações dele foram Sabia". Resolução pela regra 3 (decisão do mantenedor): "Sabia" em
   dois dias diferentes, sem erro depois (FR-024). `docs/telas.md` alinhado (P-09).
3. **"Primeira órbita"**: `docs/telas.md` ("primeira revisão concluída") e o protótipo das
   notificações ("você concluiu sua primeira revisão de flashcards") falam de revisão; a regra 9
   fala de sessão concluída, e a regra 2 não registrava sessões. Resolução do mantenedor (P-01):
   sessão registrada numa terceira tabela e "Primeira órbita" na primeira sessão concluída
   (FR-020, FR-023, FR-035), com o texto "você concluiu sua primeira sessão de flashcards"
   (FR-041). A tela inicial ("da primeira revisão à Lua cheia") continua verdadeira, porque a
   primeira sessão é também a primeira revisão. `docs/telas.md` e `Notificacoes.dc.html` alinhados
   (P-09).
4. **Quando os cartões errados voltam**: a tela 16 de `docs/telas.md` diz que, na sessão, "Não
   sabia" e "Quase" voltam antes dos outros; `FlashcardsFim` diz que eles aparecem primeiro na
   próxima revisão. Resolução pelas regras 4 e 5: na sessão, só o "Não sabia" volta, uma vez, no
   fim (FR-014); na próxima sessão, "Não sabia" e "Quase" vêm primeiro (FR-009). Os textos do
   protótipo continuam verdadeiros. `docs/telas.md` alinhado (P-09).
5. **Contador da revisão**: o protótipo tem total fixo ("Cartão 5 de 20"), que não comporta a volta
   do "Não sabia". Resolução: o total cresce a cada volta (FR-014).
6. **Barra do celular**: a regra 7 fala em "barra com 60 px de altura"; o protótipo tem botões de
   60 px dentro de uma barra com espaçamento e área segura, e o kit usa 56 px nos botões de
   avaliação. Resolução: botões de 60 px numa barra de largura total (FR-015); o ajuste do kit fica
   para o plano.
7. **Tema só pelo corpo celeste**: textos do protótipo e de `docs/telas.md` citam só o corpo
   ("cartões de Ceres e Urano", "Você domina 8 de 10 cartões de Ceres", "Revisar Ceres", "Estudar
   Makemake") ou só o tema ("Domine todos os cartões de Fundamentos da Agilidade"), e a seção 1 da
   identidade visual, que prevalece (Princípio XI), manda usar sempre "Corpo · Tema". Resolução do
   mantenedor (P-08): frases com "Corpo · Tema" (FR-026, FR-034, FR-049); rótulos curtos de ação
   só com o corpo e nome acessível com corpo e tema (FR-053).
8. **Tema no cabeçalho de foco**: `docs/telas.md` põe o tema atual à direita do cabeçalho de foco; o
   protótipo da revisão põe o tema na linha de progresso e no chip. Resolução: protótipo (FR-012).
9. **Formato das datas**: o protótipo usa "Desde 05/10" nas conquistas e "20/10" no gráfico; a
   regra de escrita de `docs/telas.md` pede "14/11/2026" para data sem hora. Resolução: conquistas
   com a data completa (FR-037); o eixo do gráfico mantém dia e mês, com a data completa na
   alternativa em texto (FR-031).
10. **Quantidade de conquistas**: o protótipo lista 7 conquistas, com uma só "Explorador"; com uma
    "Explorador" por tema (`docs/telas.md` e regra 9), o catálogo tem 18. Resolução: lista com as 18
    (FR-034, FR-037).
11. **Destaques**: o protótipo mostra três conquistas em destaque sem critério de escolha (não são
    as mais recentes nem, com certeza, as mais raras, e a raridade some com menos de 30 contas).
    Resolução do mantenedor (P-06): as três mais recentes (FR-037).
12. **Flashcards no resultado e no histórico**: a regra 13 pede convites e links para flashcards no
    resultado reprovado e no histórico, mas os protótipos `Resultado.dc.html` e `Historico.dc.html`
    e as telas 12 e 15 de `docs/telas.md` só têm a menção no texto do resultado. Resolução do
    mantenedor (P-07): botão "Revisar com flashcards" no resultado reprovado e link de mesmo nome
    nas linhas de erro do histórico (FR-050, FR-051); protótipos e `docs/telas.md` alinhados (P-09).
13. **"Explorador de Terra"**: o padrão "Explorador de [corpo]" gera "Explorador de Terra"; em
    português, o natural é "Explorador da Terra", embora a tela inicial use "Aprofundar em Terra".
    Resolução do mantenedor (P-08): "Explorador da Terra"; só Terra leva artigo, e as demais ficam
    "de [corpo]" (FR-034).
14. **Novo aceite dos termos**: a constituição exige registrar o aceite no cadastro (Princípio VI),
    mas não diz o que fazer quando os termos mudam. Resolução do mantenedor (P-10): sem novo
    aceite, com aviso único a quem já tinha conta (FR-045a).

## Pendências

- **P-02 (bloqueia o plano)**: revisão, pelo mantenedor, da proposta de modelo de dados
  (`proposta-modelo-de-dados.md`): `tbflashcard`, `tbsessao_revisao`, `tbrevisao`, a coluna
  `data_aviso_termos` em `tbcandidato`, as duas views, as consultas de referência e a verificação
  da carga; atualização do Modelo Lógico em PDF. Falta rodar no PostgreSQL 16 do `docker compose`.
- **P-11 (fora desta feature)**: cartões definitivos dos 12 temas pela trilha de conteúdo, com a
  coerência com o material conferida por uma pessoa da equipe, no mesmo processo da carga
  definitiva das questões e dos materiais (P-03 da 003).

Resolvidas pelo mantenedor em 03/10/2026:

- **P-01**: sessão de revisão registrada numa terceira tabela, com início e conclusão, e "Primeira
  órbita" na primeira sessão concluída (FR-020, FR-023, FR-034, FR-035, FR-041, FR-045).
- **P-03**: o "Não sabia" volta uma vez no fim da mesma sessão (regra 5; FR-014).
- **P-04**: cada avaliação é gravada no momento do clique (regra 6; FR-018).
- **P-05**: a conquista obtida continua obtida quando a condição deixa de valer (FR-036).
- **P-06**: os três destaques são as três conquistas obtidas mais recentemente (FR-037).
- **P-07**: botão "Revisar com flashcards" no resultado reprovado e link de mesmo nome nas linhas de
  erro do histórico (FR-050, FR-051).
- **P-08**: frases com "Corpo · Tema"; rótulos curtos de ação só com o corpo e nome acessível com
  corpo e tema; "Explorador da Terra", e as demais "Explorador de [corpo]" (FR-034, FR-053).
- **P-10**: a atualização dos termos não pede novo aceite; quem se cadastrou antes da versão
  vigente e ainda não foi avisado dela vê uma única vez, no próximo acesso, a notificação
  informativa "Atualizamos os termos de uso e privacidade", com o link para os termos (FR-045a).
- **P-09**: `docs/telas.md` 1.6 (mapa e telas 5, 12, 15, 16, 17, 18, 19 e 21) e os protótipos
  `FlashcardsEscolha` (cabeçalho do visitante, escolha inicial, resumo e "Começar revisão"
  desativado), `FlashcardsRevisao` (contador que cresce com a volta do "Não sabia", barra fixa no
  celular com botões de 60 px), `FlashcardsFim` ("Corpo · Tema" e variação negativa), `Perfil` (18
  conquistas, "Explorador da Terra", três destaques mais recentes, raridade só com 30 contas ativas,
  explicação do domínio, datas completas e alternativa em texto do gráfico), `Resultado` e
  `Historico` ("Revisar com flashcards") e `Notificacoes` (texto da "Primeira órbita" e aviso dos
  termos) alinhados às decisões. Os links desses protótipos para a página "Disponível em breve"
  passaram à área de estudos. A partir de 03/10/2026, `docs/prototipo/` é a fonte da verdade do
  protótipo, registrada em `docs/prototipo/LEIAME.md`, `docs/telas.md` e
  `docs/identidade-visual.md`.

## Conformidade com a constituição (versão 3.0.1)

| Princípio | Como esta spec atende | Situação |
|---|---|---|
| I. Servidor é a autoridade | Fila, momento das revisões, domínio, conquistas e raridade só no servidor (FR-011, FR-018, FR-024, FR-036, FR-038); a página manda só escolhas e avaliações, e o resto é ignorado (FR-022, FR-043). Nenhuma regra da certificação é tocada. | ✅ |
| II. Front-end sem bibliotecas de terceiros | Kit próprio, sem JavaScript inline nem bibliotecas; cartão que vira, barras, anéis e gráfico em CSS e JavaScript puros (FR-053); mobile-first a partir de 360 px (FR-054). | ✅ |
| III. PostgreSQL com SQL explícito | Três tabelas, uma coluna em `tbcandidato` e duas views propostas, com consultas de referência em SQL, validadas em PGlite e não aplicadas; entram no DDL e no Modelo Lógico no mesmo PR depois da revisão do mantenedor (P-02). | ⚠ P-02: proposta aguardando revisão |
| IV. Dados derivados não são armazenados | Domínio, domínio por tema, próximo foco, fila, evolução de 14 dias, conquistas, datas, contas ativas e raridade calculados do histórico de revisões e das respostas (FR-024, FR-025, FR-031, FR-036, FR-039); "Lua cheia" calculada das respostas. | ✅ |
| V. Comando único | Cartões na carga SQL, disponíveis na primeira subida (FR-003). | ✅ |
| VI. LGPD e minimização | Revisões, sessões e evolução visíveis só para o dono (FR-042); nenhum dado cadastral além do nome e da data do cadastro (FR-044); raridade agregada, só com 30 contas ativas (FR-038, FR-039); termos atualizados e citando os dados novos, inclusive o momento do aviso, que é dado gerado pelo uso (FR-045, FR-045a). | ✅ |
| VII. Escopo do site final e ordem de entrega | Complemento das telas 16 a 19 de `docs/telas.md`; implementação só depois de 002 a 006 validadas; a página "Disponível em breve" some com a feature (FR-052). | ✅ |
| VIII. Rastreabilidade | Complemento citado pelas telas 16 a 19 e pelas telas integradas; RNF01, RNF02 e RNF03. | ✅ |
| IX. Testes das regras críticas | Nenhuma regra crítica da constituição é tocada; domínio, fila, salvamento, conquistas, raridade e acesso têm testes obrigatórios por regra do mantenedor (FR-055). | ✅ |
| X. Padrões de código | Textos e identificadores de domínio em português; proposta no padrão `tb`/`id`, com a chave estrangeira `idsessao_revisao` (o nome `tbflashcard` é o definido pelo mantenedor). | ✅ |
| XI. Interface fiel e acessível | Telas portadas do protótipo com o kit e as correções da identidade visual, incluindo "Corpo · Tema" (FR-053); AA, foco, 44 px (60 px na barra), teclado, leitores de tela e menos movimento (FR-016, FR-017, FR-054). | ✅ |
