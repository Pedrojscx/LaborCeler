# Feature Specification: Fluxo da Certificação

**Feature Branch**: `004-fluxo-certificacao`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Fluxo da certificação (feature 004): telas 9 (Antes de começar), 10 (Questão com cronômetro) e 11 (Correção da questão) e os estados 'não iniciada' e 'em andamento' da área do candidato, com as regras do mantenedor sobre servidor como autoridade, prazo de 150 segundos com tolerância de 2 segundos, encerramento preguiçoso, interrupção (D6), sigilo da alternativa correta, ordem fixa e certificação única (D1), concorrência, conclusão no 12º tema, interface portada do protótipo, área do candidato e testes obrigatórios (Princípio IX)."

**Requisitos atendidos**: RF02, RF05, RF06, RF08, RF09, RF10, RF11, RF12, RF13, RF14, RF15, RF21,
RNF02 e RNF04, conforme `docs/requisitos-desafio.md`; telas 4 (estados "não iniciada" e "em
andamento"), 9, 10 e 11 de `docs/telas.md`; regras R1 a R11 do dossiê (seção 4). A conformidade
com a constituição 3.0.1 está no fim deste documento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Começar a certificação (Priority: P1)

O candidato conectado lê as regras na tela "Antes de começar" e confirma "Começar agora". Só
nesse momento a certificação passa a existir e a primeira questão, do primeiro tema, aparece com
o cronômetro.

**Why this priority**: é a porta do fluxo da prova (RF02, RF05); sem ela não há certificação.

**Independent Test**: entrar como candidato sem certificação, abrir "Antes de começar", conferir
as seis regras, voltar sem confirmar (nada é criado) e depois confirmar "Começar agora",
conferindo que a primeira questão de Mercúrio · Fundamentos da Agilidade aparece com 150
segundos.

**Acceptance Scenarios**:

1. **Given** um candidato sem certificação na área do candidato, **When** ele escolhe "Iniciar a
   certificação", **Then** vê a tela "Antes de começar", com as seis regras em linguagem direta,
   o cartão do primeiro tema e os botões "Começar agora" e "Voltar e estudar mais".
2. **Given** a tela "Antes de começar", **When** o candidato escolhe "Voltar e estudar mais" ou
   simplesmente sai da tela, **Then** nenhuma certificação é criada e a área do candidato
   continua no estado "não iniciada".
3. **Given** a tela "Antes de começar", **When** o candidato confirma "Começar agora", **Then** a
   certificação é criada com a data de início e a questão sorteada do primeiro tema aparece, com
   o cronômetro começando em 150 segundos.
4. **Given** um candidato que já tem certificação, **When** ele tenta começar outra, **Then** não
   consegue: a certificação é única (decisão D1).
5. **Given** esta feature entregue, **When** um visitante abre a tela inicial, **Then** vê a seção
   "Entre e use 100% do Lunar Celer" com a certificação como vantagem da conta, e nenhum caminho
   da certificação leva mais à página "Disponível em breve".

---

### User Story 2 - Responder a uma questão dentro do tempo (Priority: P1)

Na tela da questão, o candidato vê o tema, o enunciado, a imagem e as quatro alternativas, com o
cronômetro regressivo contado pelo servidor. Ele escolhe uma alternativa e confirma; a resposta é
única.

**Why this priority**: é o núcleo da certificação (RF05, RF06, RF08, RF10, RF15) e onde a
integridade da nota se decide (RNF04, Princípio I).

**Independent Test**: começar a certificação, conferir a questão (tema, enunciado, imagem com
texto alternativo, quatro alternativas, cronômetro), responder dentro do tempo e conferir que a
resposta foi registrada uma única vez, sem que a página tenha recebido antes a alternativa
correta.

**Acceptance Scenarios**:

1. **Given** uma questão aberta, **When** a página a exibe, **Then** mostra "Tema [n] de 12", o
   chip "Corpo · Tema", o enunciado, a imagem em painel claro com texto alternativo e, quando
   houver, legenda, as quatro alternativas A a D como opções de escolha única e o botão
   "Confirmar resposta", desativado até a escolha.
2. **Given** a questão aberta, **When** o candidato escolhe uma alternativa e confirma dentro de
   150 segundos, **Then** a resposta é registrada como respondida, com a alternativa e o horário
   do servidor, e a página passa à correção.
3. **Given** a questão aberta, **When** o cronômetro fica abaixo de 30 segundos, **Then** o anel
   e o número ficam vermelhos e aparece o aviso escrito "Menos de 30 segundos"; leitores de tela
   recebem avisos aos 60, 30 e 10 segundos.
4. **Given** a questão aberta, **When** alguém inspeciona tudo o que a página recebeu, **Then**
   não encontra qual alternativa é a correta nem a justificativa.
5. **Given** uma resposta já registrada, **When** chega outra resposta para a mesma questão,
   **Then** a segunda é recusada e a primeira continua valendo.
6. **Given** um candidato conectado, **When** ele tenta responder, encerrar ou consultar uma
   resposta ou certificação de outro candidato, **Then** recebe a mesma recusa que receberia para
   um identificador inexistente, sem saber se o recurso existe.

---

### User Story 3 - Ver a correção e decidir entre seguir ou pausar (Priority: P1)

Depois de cada questão encerrada, seja por resposta, por tempo esgotado ou por interrupção, o
candidato vê qual era a alternativa correta e por quê, e escolhe entre seguir para o próximo tema
ou encerrar a sessão e continuar depois.

**Why this priority**: atende RF09, RF11 e RF12; sem a correção e a escolha, o fluxo não segue as
regras do desafio.

**Independent Test**: encerrar uma questão de cada forma (certa, errada, tempo esgotado,
interrupção), conferir a faixa de resultado e as marcações, e testar os dois caminhos do painel
"O que você quer fazer agora?".

**Acceptance Scenarios**:

1. **Given** uma questão respondida corretamente, **When** a correção aparece, **Then** a faixa
   diz "Resposta correta", a alternativa escolhida aparece como "Correta, sua resposta" e o bloco
   "Por que a alternativa [X]" traz a justificativa.
2. **Given** uma questão respondida errado, **When** a correção aparece, **Then** a faixa diz
   "Resposta incorreta", a escolhida aparece como "Sua resposta" e a correta como "Alternativa
   correta".
3. **Given** uma questão cujo tempo acabou, **When** a correção aparece, **Then** a faixa diz "O
   tempo acabou", explica que a questão conta como erro e mostra a alternativa correta (RF11).
4. **Given** a correção de qualquer questão antes do 12º tema, **When** o candidato lê o painel
   "O que você quer fazer agora?", **Then** vê a trilha de 12 marcos, quantos temas concluiu, o
   próximo tema e os botões "Seguir para o próximo tema" e "Encerrar a sessão e continuar depois".
5. **Given** o painel, **When** o candidato escolhe "Seguir para o próximo tema", **Then** a
   questão do próximo tema é sorteada e aparece com 150 segundos.
6. **Given** o painel, **When** o candidato escolhe "Encerrar a sessão e continuar depois",
   **Then** volta à área do candidato, sem nenhuma penalidade.
7. **Given** a correção do 12º tema, **When** ela aparece, **Then** o painel mostra os 12 temas
   concluídos e leva de volta à área do candidato, e a certificação recebe a data de conclusão.

---

### User Story 4 - Retomar a certificação depois de uma pausa (Priority: P2)

O candidato que pausou volta à área do candidato, vê em que tema parou, quantos faltam e a Lua
acesa na proporção dos temas concluídos, e continua a partir do próximo tema pendente.

**Why this priority**: atende RF13 e RF21; depende do fluxo das US1 a US3.

**Independent Test**: responder alguns temas, encerrar a sessão, sair e entrar de novo, conferir
o estado "em andamento" e continuar, verificando que o tema seguinte é o primeiro pendente.

**Acceptance Scenarios**:

1. **Given** um candidato com alguns temas concluídos e nenhuma questão aberta, **When** ele abre
   a área do candidato, **Then** vê o estado "em andamento": "Você parou em [Corpo]", quantos
   temas faltam, a Lua com 1/12 aceso por tema concluído e a trilha de marcos.
2. **Given** o estado "em andamento", **When** o candidato escolhe "Continuar a certificação" e
   confirma na tela "Antes de começar", **Then** recebe a questão do primeiro tema ainda não
   concluído, nunca de um tema já encerrado nem de um tema adiante.
3. **Given** um candidato que errou todas as questões já encerradas, **When** ele vê a Lua,
   **Then** ela está acesa na mesma proporção de quem acertou todas: o progresso conta temas
   concluídos, nunca acertos.
4. **Given** um candidato que concluiu os 12 temas, **When** ele abre a área do candidato antes
   de a feature 005 existir, **Then** vê a conclusão (Lua cheia, 12 de 12 temas concluídos) sem
   nota nem resultado.

---

### User Story 5 - Interrupção da questão aberta (Priority: P2)

Se a questão aberta for pedida de novo (recarregar, reabrir, outra aba) ou o candidato escolher
"Interromper" e confirmar, a questão é encerrada como interrompida e conta como erro. Pausar só é
possível entre questões.

**Why this priority**: é a leitura literal do RF14 (decisão D6, padrão) e protege a integridade
da prova; P2 porque depende do fluxo principal.

**Independent Test**: com uma questão aberta, recarregar a página, abrir o endereço em outra aba
e usar "Interromper", conferindo em cada caso o encerramento como interrompida.

**Acceptance Scenarios**:

1. **Given** uma questão aberta dentro do prazo, **When** a página a pede de novo (recarregar,
   reabrir ou outra aba), **Then** a questão passa a interrompida, conta como erro e a página
   mostra a correção no estado "Questão encerrada por interrupção", com a alternativa correta e o
   painel de seguir ou pausar.
2. **Given** a questão aberta, **When** o candidato escolhe "Interromper", **Then** a página pede
   confirmação numa caixa de diálogo da própria página (nunca a janela do navegador), avisando
   que a questão aberta contará como erro; ao confirmar, a questão passa a interrompida e o
   candidato vê a correção no estado "Questão encerrada por interrupção", com a alternativa
   correta e o painel de seguir ou pausar; ao desistir, continua na questão com o cronômetro
   correndo.
3. **Given** uma questão interrompida, **When** chega uma resposta para ela, **Then** a resposta
   é recusada.
4. **Given** uma questão aberta cujo prazo já venceu, **When** qualquer requisição do candidato
   chega (por exemplo, ao voltar horas depois), **Then** a questão é encerrada como tempo esgotado
   antes de qualquer outra coisa.
5. **Given** a tela "Antes de começar", **When** o candidato lê a regra sobre sair da página,
   **Then** encontra o texto "Fechar ou recarregar a página durante uma questão a encerra como erro.
   Se a conexão cair, o tempo continua contando no servidor: se a resposta não chegar até o fim do
   prazo, a questão conta como erro."

---

### Edge Cases

- Resposta que chega até 2 segundos depois dos 150 (atraso da rede): aceita. Depois disso,
  recusada, e a questão é encerrada como tempo esgotado, com a alternativa descartada.
- A página avisa que o tempo acabou, mas pelo relógio do servidor ainda faltam segundos (relógio
  do aparelho adiantado): o servidor devolve o tempo restante e a página corrige a contagem.
- Duplo clique ou nova tentativa automática em "Começar agora" ou "Seguir para o próximo tema",
  na mesma sessão, com a mesma chave de pedido e em até 5 segundos: é o mesmo pedido; não sorteia
  outra questão nem interrompe a que acabou de ser entregue (FR-011). A mesma chave depois de 5
  segundos, de outra sessão ou um pedido com outra chave: vale a interrupção.
- Duas abas: a segunda pede a questão aberta e a interrompe; uma resposta enviada depois pela
  primeira aba é recusada e ela passa a mostrar a correção.
- Candidato abre a área do candidato em outra aba com uma questão aberta: a área mostra "em
  andamento"; se ele escolher continuar, a questão aberta é interrompida.
- Perda de conexão durante a questão, sem recarregar: o tempo continua contando no servidor; se a
  resposta chegar até 152 segundos depois da exibição, vale; se não chegar, a questão conta como
  erro e é encerrada como tempo esgotado na próxima requisição.
- Navegador fechado durante a questão e retorno depois do prazo: a questão é encerrada como tempo
  esgotado na primeira requisição seguinte, e o candidato retoma do próximo tema.
- Sessão de 8 horas expirada durante a questão: o candidato é levado ao login; ao voltar, a
  questão aberta é tratada pelas regras de prazo e de interrupção.
- Alternativa enviada que pertence a outra questão, alternativa inexistente, resposta para tema
  já encerrado ou para tema que não é o atual, resposta sem questão aberta ou resposta com nota,
  acerto ou tempo vindos do navegador: tudo recusado ou ignorado, sem alterar nada (Princípio I).
- Pedido com identificador de resposta ou de certificação de outro candidato: recusado com a
  mesma resposta dada a um identificador inexistente, sem revelar se o recurso existe.
- Pedido sem sessão: recusado, e a página leva ao login.
- Questão sem justificativa cadastrada: o bloco "Por que a alternativa [X]" não aparece, e a
  correção continua mostrando a alternativa correta.
- Questão sem legenda na imagem: a imagem aparece só com o texto alternativo.
- Banco indisponível durante a questão: mensagem amigável; o prazo continua correndo pelo
  servidor e a questão segue as mesmas regras quando o banco voltar.
- Pedido de menos movimento: o céu já fica parado na questão; o anel do cronômetro avança sem
  animação de transição.

## Requirements *(mandatory)*

### Functional Requirements

**Início e ordem (RF02, RF05, RF13, RF15)**

- **FR-001**: Iniciar a certificação MUST passar pela tela "Antes de começar" (tela 9); a
  certificação MUST ser criada só quando o candidato confirma "Começar agora", nunca ao abrir a
  tela, ao cadastrar ou ao entrar.
- **FR-002**: Cada candidato MUST ter no máximo uma certificação (decisão D1, padrão); depois de
  criada, não é possível começar outra.
- **FR-003**: Os temas MUST ser apresentados na ordem dos temas (1 a 12); o próximo tema é sempre
  o de menor ordem ainda sem questão encerrada, e o candidato MUST NOT conseguir pular, escolher
  ou repetir tema (RF15).
- **FR-004**: Ao confirmar "Começar agora" e ao escolher "Seguir para o próximo tema", a questão
  do tema seguinte MUST ser sorteada e exibida em seguida, sem outra confirmação. Na retomada
  depois de uma pausa, o caminho passa de novo pela tela "Antes de começar" (FR-020).

**Sorteio, exibição e prazo (RF06, RF10, RNF04, Princípio I)**

- **FR-005**: A questão de cada tema MUST ser sorteada no servidor, no momento da exibição, com
  chance igual entre as quatro questões do tema (RF06), e o registro da resposta MUST ser criado
  nesse momento, na situação "exibida", com o horário de exibição do servidor.
- **FR-006**: Cada certificação MUST ter no máximo uma questão aberta (exibida) por vez.
- **FR-007**: O prazo de cada questão MUST ser o horário de exibição mais 150 segundos, sempre
  pelo relógio do servidor. A página MUST receber só os segundos restantes e apenas exibir a
  contagem, com o cronômetro do kit, que se corrige (sincroniza) sempre que o servidor informa o
  tempo restante; nenhum valor de tempo vindo do navegador é usado.
- **FR-008**: Uma resposta recebida pelo servidor até 2 segundos depois do prazo (tolerância para
  a rede) MUST ser registrada como "respondida", com a alternativa e o horário de resposta do
  servidor. Recebida depois disso, MUST ser recusada, e a questão encerrada como "expirada", com a
  alternativa descartada.
- **FR-009**: O encerramento por tempo MUST ser preguiçoso: qualquer requisição do candidato que
  encontre uma questão aberta há mais de 152 segundos MUST encerrá-la como "expirada" antes de
  fazer qualquer outra coisa. Quando a própria página avisa que o tempo acabou, o servidor encerra
  a questão como "expirada" se já passaram 150 segundos; se não, devolve o tempo restante e a
  página corrige a contagem.

**Interrupção (RF14, decisão D6)**

- **FR-010**: A questão MUST ser entregue à página uma única vez. Se a página pedir de novo uma
  questão que está aberta e dentro do prazo (recarregar, reabrir, outra aba, retomar pela área do
  candidato), ela MUST passar a "interrompida" e contar como erro, e a página recebe a correção
  (FR-015). Encerrar a sessão entre questões é pausa, sem penalidade.
- **FR-011**: A repetição de um pedido de abertura de questão ("Começar agora" ou "Seguir para o
  próximo tema") MUST ser reconhecida como o mesmo pedido só quando vier da mesma sessão, com a
  mesma chave de pedido gerada pela página e em até 5 segundos do primeiro: nesse caso não sorteia
  outra questão, não interrompe a que foi entregue e não a entrega de novo. Fora dessas três
  condições, vale a interrupção (FR-010). A página MUST desativar o botão depois do primeiro
  clique.
- **FR-012**: O link "Interromper" da tela da questão MUST pedir confirmação na própria página,
  avisando que a questão aberta contará como erro. Ao confirmar, a questão passa a "interrompida"
  e o candidato vê a correção no estado "interrompida" (FR-015), com a alternativa correta e o
  painel de seguir ou pausar (FR-016); ao desistir, continua na questão, com o prazo correndo. O
  mesmo vale para quem volta depois de uma interrupção por recarga (FR-010).

**Resposta, sigilo e manipulação (RF08, RF09, RF15, RNF04, Princípio I)**

- **FR-013**: Antes de a questão ser encerrada, nada do que a página recebe MUST indicar qual
  alternativa é a correta nem trazer a justificativa; as duas só são enviadas depois do
  encerramento.
- **FR-014**: O servidor MUST recusar, sem alterar nada: alternativa que não pertence à questão
  aberta; resposta para questão já encerrada (inclusive resposta repetida, que mantém a
  primeira); resposta para tema que não é o atual; resposta sem questão aberta; resposta de
  outro candidato; e qualquer pedido sem sessão. Nota, acerto, tempo ou
  situação enviados pelo navegador MUST ser ignorados (Princípio I). Cada tema tem no máximo uma
  resposta por certificação (RF15), o que o banco já garante.
- **FR-015**: Depois do encerramento, por resposta, tempo esgotado ou interrupção, a página MUST
  mostrar a correção na própria tela (tela 11), nunca só numa notificação: faixa de resultado com
  ícone e texto conforme a situação ("Resposta correta", "Resposta incorreta", "O tempo acabou",
  "Questão encerrada por interrupção"), o enunciado, as alternativas marcadas ("Alternativa
  correta", "Sua resposta", "Correta, sua resposta") e, quando houver justificativa, o bloco "Por
  que a alternativa [X]" (RF09, RF11).
- **FR-016**: Depois da correção de qualquer tema antes do 12º, o painel "O que você quer fazer
  agora?" MUST mostrar a trilha de 12 marcos, quantos temas foram concluídos, o próximo tema e os
  botões "Seguir para o próximo tema" e "Encerrar a sessão e continuar depois", com o aviso "Ao
  voltar, você continua a partir de [Corpo]." (RF12).

**Concorrência (Princípio I)**

- **FR-017**: Abrir questão, responder, encerrar por tempo e interromper MUST rodar como operações
  indivisíveis, com bloqueio da certificação do candidato durante cada uma, de modo que pedidos
  simultâneos nunca gerem duas questões abertas, duas respostas para o mesmo tema nem uma
  resposta aceita para questão já encerrada.

**Acesso aos dados do candidato (Princípios I e VI)**

- **FR-030**: Todo pedido que traga identificador de resposta ou de certificação MUST ser conferido
  contra o candidato da sessão. Pedido sobre resposta ou certificação de outro candidato MUST ser
  recusado com a mesma resposta dada a um identificador inexistente, sem revelar se o recurso
  existe; pedido sem sessão MUST ser recusado.

**Conclusão (RF16 em parte, preparação para a 005)**

- **FR-018**: Ao encerrar o 12º tema, por qualquer situação, a certificação MUST receber a data de
  conclusão, e a correção desse tema MUST mostrar os 12 temas concluídos e levar de volta à área
  do candidato. Resultado, nota e certificado são da feature 005; enquanto ela não existir, nada
  nesta feature mostra nota ou resultado (regra de disponibilidade, FR-050 da 002).

**Área do candidato (RF02, RF13, RF21, tela 4)**

- **FR-019**: A área do candidato MUST passar a mostrar o estado real da certificação: "não
  iniciada" (sem certificação, com "Iniciar a certificação" levando à tela "Antes de começar");
  "em andamento" ("Você parou em [Corpo]", quantos temas faltam, "Continuar a certificação" e o
  aviso de que a questão aparece e o cronômetro começa assim que o candidato confirmar); e,
  enquanto a 005 não existir, "concluída" (Lua cheia, "12 de 12 temas concluídos", sem nota nem
  resultado). Os estados "aprovada" e "reprovada" são da 005.
- **FR-020**: Na retomada, "Continuar a certificação" MUST levar à tela "Antes de começar", com o
  cartão do próximo tema pendente no lugar do primeiro tema, e a questão só aparece depois de o
  candidato confirmar.
- **FR-021**: A Lua da área do candidato MUST acender 1/12 por tema concluído (respondido,
  expirado ou interrompido), nunca por acerto, e a trilha de marcos MUST mostrar os concluídos, o
  atual e os pendentes; o progresso é calculado a partir das respostas, nunca armazenado
  (Princípio IV, RF21).
- **FR-022**: Ao ser entregue, esta feature MUST substituir os destinos provisórios da
  certificação deixados pela 002: o destino "certificação" da página "Disponível em breve" (FR-024
  da 002) some; "Iniciar a certificação" passa a levar à tela "Antes de começar"; e os trechos que
  a 002 deixou ocultos até a 004 passam a aparecer, inclusive a seção "Entre e use 100% do Lunar
  Celer" da tela inicial, com a certificação como primeira vantagem da conta (FR-038 e FR-050 da
  002).

**Interface e acessibilidade (RNF01, RNF02, Princípios II e XI)**

- **FR-023**: As telas 9, 10 e 11 MUST usar o kit de interface e portar, sem redesenhar,
  `Confirmacao.dc.html`, `Questao.dc.html` e `Correcao.dc.html`, com as correções de
  `docs/identidade-visual.md`. A tela 9 tem cabeçalho logado e rodapé; as telas 10 e 11 têm o
  cabeçalho de foco ("Tema [n] de 12", e "Interromper" só na tela 10), sem rodapé; o céu fica
  parado na tela 10.
- **FR-024**: A tela 9 MUST trazer as seis regras do protótipo em linguagem direta (12 temas em
  ordem, sem pular; 150 segundos contados pelo servidor; resposta única; sair da página encerra a
  questão aberta; pausa entre temas; aprovação com 8 acertos em 12) e o cartão do tema que vai
  começar, com "Começar agora" e "Voltar e estudar mais" (que leva à área de estudos). A regra
  sobre sair da página MUST ter o texto "Fechar ou recarregar a página durante uma questão a
  encerra como erro. Se a conexão cair, o tempo continua contando no servidor: se a resposta não
  chegar até o fim do prazo, a questão conta como erro.", que é a interpretação do RF14 levada ao
  professor junto da decisão D6.
- **FR-025**: A tela 10 MUST trazer a coluna do tempo (Lua dentro do anel do cronômetro, tempo em
  número, "restantes de 02:30", aviso escrito abaixo de 30 segundos, trilha de 12 marcos, "[n] de
  12 temas concluídos" e o aviso de que o tempo é contado pelo servidor e de que sair da página
  encerra a questão) e a coluna da questão (chip do tema, enunciado, imagem em painel claro com
  texto alternativo e, quando houver, legenda, "Escolha uma alternativa", as quatro alternativas
  como botões de opção reais e "Confirmar resposta", desativado até a escolha, com o aviso de que
  não é possível trocar depois).
- **FR-026**: O cronômetro MUST mostrar sempre os segundos em número e avisar leitores de tela aos
  60, 30 e 10 segundos, só quando o marco for cruzado depois de a contagem começar (nunca
  anunciando de uma vez marcos que já tinham passado); abaixo de 30 segundos, o anel e o número
  ficam vermelhos, com aviso escrito. O ajuste no cronômetro do kit entra no plano.
- **FR-027**: As três telas MUST funcionar a partir de 360 px sem rolagem horizontal, com
  contraste AA, foco visível, alvos de toque de pelo menos 44 px, uso completo só com teclado
  (inclusive escolher e confirmar a alternativa e a confirmação de "Interromper") e respeito ao
  pedido de menos movimento.
- **FR-028**: A confirmação de "Interromper" MUST ser uma caixa de diálogo da própria página,
  acessível por teclado e leitor de tela, e nunca a janela de confirmação do navegador.

**Testes obrigatórios (Princípio IX)**

- **FR-029**: MUST existir testes automatizados, que passam a cada mudança nessas regras, para:
  sorteio entre as quatro questões do tema; prazo de 150 segundos com e sem a tolerância de 2
  segundos; encerramento preguiçoso; interrupção (pedido repetido da questão aberta e
  "Interromper"); repetição do mesmo pedido de abertura (FR-011); ausência da alternativa correta
  e da justificativa em tudo o que a página recebe antes do encerramento; concorrência (pedidos
  simultâneos de abrir e de responder); tentativas de manipulação (alternativa de outra questão,
  resposta repetida, resposta depois do prazo, resposta para tema que não é o atual, valores de
  nota ou tempo enviados pelo navegador); acesso a dados de outro candidato (responder, encerrar e
  consultar a resposta de outro candidato, esperando recusa igual à de recurso inexistente); e
  pedidos sem sessão.

**Carga das questões (RNF08)**

- **FR-031**: A verificação de conteúdo da carga MUST conferir a justificativa de cada questão:
  questão sem justificativa marcada como provisória gera AVISO; questão sem justificativa não
  provisória gera ERRO, o que impede a entrega da carga definitiva com questão sem justificativa.

### Key Entities *(include if feature involves data)*

- **Certificação**: a prova de um candidato, única (D1), com data de início (quando ele confirma
  "Começar agora") e data de conclusão (quando o 12º tema é encerrado). Já existe no esquema.
- **Resposta**: o registro de um tema dentro da certificação: questão sorteada, horário de
  exibição, situação (exibida, respondida, expirada ou interrompida), alternativa escolhida e
  horário de resposta, só quando respondida. É criada no sorteio. Já existe no esquema, com uma
  resposta por tema garantida pelo banco.
- **Questão**: pertence a um tema, tem enunciado, imagem, justificativa e quatro alternativas, uma
  correta. Já existe no esquema.
- **Imagem**: arquivo, texto alternativo, crédito e, se a proposta da 003 for aprovada, legenda.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 4.000 sorteios simulados de um mesmo tema, cada uma das quatro questões aparece
  entre 20% e 30% das vezes.
- **SC-002**: Em 100% dos testes, respostas recebidas até 152 segundos depois da exibição são
  aceitas e respostas recebidas depois disso são recusadas, com a questão encerrada como tempo
  esgotado.
- **SC-003**: Em 100% das inspeções do que a página recebe antes do encerramento, não há
  indicação da alternativa correta nem a justificativa.
- **SC-004**: Em 100 rodadas de pedidos simultâneos (abrir com abrir, responder com responder,
  abrir com responder), 0 casos de duas questões abertas na mesma certificação, de duas respostas
  para o mesmo tema ou de resposta aceita para questão encerrada.
- **SC-005**: 0 tentativas de manipulação aceitas no conjunto de testes do FR-029, e 100% dos
  pedidos sobre resposta ou certificação de outro candidato recebem a mesma recusa de um recurso
  inexistente.
- **SC-006**: Em 100% dos casos de recarregar, reabrir ou abrir em outra aba uma questão aberta
  dentro do prazo, ela é encerrada como interrompida; em 100% das repetições do mesmo pedido em
  até 5 segundos, na mesma sessão e com a mesma chave, a questão entregue continua aberta; com a
  mesma chave depois de 5 segundos, ela é interrompida.
- **SC-007**: Um candidato conclui os 12 temas em uma ou várias sessões e, em 100% das retomadas,
  recebe o primeiro tema pendente, sem pular nem repetir tema; ao fim, a certificação tem data de
  conclusão.
- **SC-008**: Na rede local da apresentação, a questão aparece em até 2 segundos depois de
  "Começar agora" ou "Seguir para o próximo tema", e o tempo mostrado difere do tempo do servidor
  em no máximo 1 segundo.
- **SC-009**: Em 100% dos estados da área do candidato, a Lua e a trilha correspondem ao número de
  temas concluídos, e nenhum elemento revela acertos durante a prova.
- **SC-010**: Navegando só com teclado, 100% dos elementos acionáveis das telas 9, 10 e 11 são
  alcançados com foco visível; 100% dos alvos medem pelo menos 44 px; leitores de tela recebem os
  três avisos do cronômetro; as telas passam no contraste AA e ficam sem rolagem horizontal de 360
  px a 1920 px.
- **SC-011**: Depois da entrega, 0 destinos provisórios da certificação permanecem, e os trechos
  da 002 que dependiam da 004 aparecem.
- **SC-012**: 100% dos testes do FR-029 passam a partir de um clone limpo.
- **SC-013**: Com a carga provisória atual, a verificação de conteúdo emite AVISO, e não ERRO, para
  questão sem justificativa; numa carga de teste com questão não provisória sem justificativa, ela
  emite ERRO.

## Assumptions

- As regras de negócio seguem o dossiê (seção 4, R1 a R11) e as decisões do mantenedor para esta
  feature. D1 (certificação única) e D6 (interrupção literal) são padrões ainda abertos com o
  professor; se mudarem, FR-002 e FR-010 mudam, com os testes.
- **Relógio de referência**: "relógio do servidor" é um relógio único para a exibição, a resposta
  e os encerramentos; o plano escolhe qual (o banco já grava a exibição pelo próprio relógio),
  para não haver diferença entre dois relógios.
- **Página que avisa o fim do tempo** (FR-009): a regra para esse pedido não estava nas regras do
  mantenedor; foi definida para que a correção do tempo esgotado apareça logo, sem esperar a
  tolerância de 2 segundos.
- **Pedido repetido** (FR-011, decisão do mantenedor): a regra de interrupção, lida ao pé da
  letra, faria um duplo clique interromper a questão recém-sorteada; a repetição só é o mesmo
  pedido na mesma sessão, com a mesma chave gerada pela página e em até 5 segundos.
- **Interromper** (FR-012, decisão do mantenedor): depois de confirmar, o candidato vê a correção
  no estado "interrompida", e não a área do candidato, como estava no protótipo.
- **Retomada** (FR-020): o protótipo leva "Iniciar" e "Continuar" para a mesma tela "Antes de
  começar"; na retomada, o cartão mostra o próximo tema pendente.
- **Estado "concluída" e correção do 12º tema** (FR-018, FR-019): não estão no protótipo nem em
  `docs/telas.md`; foram definidos para cobrir o período entre a 004 e a 005.
- **Legenda da imagem**: depende da aprovação da coluna proposta na 003
  (`specs/003-area-de-estudos/proposta-modelo-de-dados.md`); sem ela, a imagem aparece só com
  texto alternativo.
- **Diálogo de confirmação** (FR-028): o kit não tem esse componente; ele entra no kit como
  componente reutilizável, no plano.
- **Perda de conexão (decisão do mantenedor, interpretação do RF14)**: o servidor só percebe a
  interrupção quando a questão é pedida de novo ou quando o prazo vence. A regra exibida na tela 9
  passa a ser "Fechar ou recarregar a página durante uma questão a encerra como erro. Se a
  conexão cair, o tempo continua contando no servidor: se a resposta não chegar até o fim do
  prazo, a questão conta como erro." A interpretação vai ao professor junto da decisão D6
  (dossiê, seção 7).
- A ordem dos temas segue a decisão D3; a área de estudos (003) existe antes desta feature, e
  "Voltar e estudar mais" leva a ela.

## Pendências

- **P-01**: decisão D6 com o professor, incluindo a interpretação do RF14 sobre perda de conexão
  (registrada na linha D6 do dossiê); o padrão é a leitura literal do RF14 para recarregar,
  reabrir ou abrir em outra aba.
- **P-02**: decisão D1 (certificação única) com o professor.
- **P-03 (para a 002)**: corrigir para o mesmo texto da regra da tela 9 a pergunta frequente "E se
  a internet cair durante uma questão?" e as instruções que dizem que perder a conexão encerra a
  questão (FR-003 e cenário 4 da US1 da spec da 002); registrada também nas pendências de
  `docs/telas.md`.
- **P-04 (bloqueia o plano)**: revisão, pelo mantenedor, da proposta de modelo de dados
  (`proposta-modelo-de-dados.md`): índice único parcial para uma única resposta exibida por
  certificação e regra que impede horário de resposta além de 152 segundos, validados em PGlite;
  e atualização do Modelo Lógico em PDF. Falta rodar no PostgreSQL 16 do `docker compose`.
- **P-05**: legenda da imagem depende da proposta de modelo de dados da 003.

## Conformidade com a constituição (versão 3.0.1)

| Princípio | Como esta spec atende | Situação |
|---|---|---|
| I. Servidor é a autoridade | Sorteio, prazo, encerramentos e correção só no servidor (FR-005 a FR-010); a página só exibe a contagem (FR-007); correta e justificativa só depois do encerramento (FR-013); valores do navegador ignorados (FR-014); concorrência protegida (FR-017). | ✅ |
| II. Front-end sem bibliotecas de terceiros | Kit próprio, sem bibliotecas nem JavaScript inline (FR-023); diálogo da própria página, não a janela do navegador (FR-028). | ✅ |
| III. PostgreSQL com SQL explícito | Usa o esquema existente; o índice parcial e a regra dos 152 segundos estão propostos e validados em PGlite, e entram no DDL e no Modelo Lógico depois da revisão do mantenedor (P-04). | ⚠ P-04: proposta aguardando revisão |
| IV. Dados derivados não são armazenados | Progresso e Lua calculados das respostas (FR-021); nota fica para a 005, também calculada. | ✅ |
| V. Comando único | Nada novo de execução. | ✅ |
| VI. LGPD e minimização | Só as respostas da prova são registradas, como os termos da 002 descrevem; ninguém acessa resposta ou certificação de outro candidato, nem sabe se elas existem (FR-030). | ✅ |
| VII. Escopo do site final e ordem de entrega | Feature obrigatória; nota e certificado ficam para a 005 (FR-018). | ✅ |
| VIII. Rastreabilidade | Requisitos citam RF, RNF, telas e as regras R1 a R11 do dossiê. | ✅ |
| IX. Testes das regras críticas | Sorteio, prazo de 150 segundos e resposta única por tema com testes obrigatórios (FR-029). | ✅ |
| X. Padrões de código | Textos e identificadores de domínio em português. | ✅ |
| XI. Interface fiel e acessível | Telas portadas com o kit (FR-023), avisos do cronômetro (FR-026), 44 px, AA, teclado e menos movimento (FR-027). | ✅ |
