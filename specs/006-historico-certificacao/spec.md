# Feature Specification: Histórico da Certificação

**Feature Branch**: `006-historico-certificacao`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "O candidato consulta o histórico de todas as suas tentativas de certificação. Para cada tentativa, vê quando começou e terminou, o resultado e, tema a tema, a questão sorteada, a alternativa que escolheu (ou a indicação de que o tempo esgotou ou de que a questão foi interrompida), a alternativa correta e a data e a hora da resposta. O histórico existe independentemente de aprovação ou reprovação, inclusive para uma tentativa ainda em andamento. Referências: RF20, RNF03, RNF04, dossiê seção 4.6, tela 15 e `Historico.dc.html`, com as regras do mantenedor sobre várias tentativas (D1), conteúdo, origem dos dados, questão aberta, caminho para estudar, segurança, interface, disponibilidade, testes obrigatórios (Princípio IX) e esquema."

**Requisitos atendidos**: RF20, RNF03 e RNF04, conforme `docs/requisitos-desafio.md`; decisões
D1 e D4 (03/10/2026); tela 15 de `docs/telas.md` e os links para ela nas telas 4 e 12; destino
"histórico" da tela 6; seção 4.6 do dossiê. A conformidade com a constituição 3.0.1 está no fim
deste documento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rever uma tentativa concluída, tema a tema (Priority: P1)

Depois de concluir a certificação, aprovado ou não, o candidato abre o histórico e vê, para cada
um dos 12 temas, a questão que foi sorteada para ele, o que respondeu, qual era a resposta certa
e quando respondeu.

**Why this priority**: é o RF20 inteiro; sem ele, a feature não existe.

**Independent Test**: concluir uma tentativa com as quatro situações (acerto, erro, tempo
esgotado e interrupção), abrir o histórico e conferir o resumo e cada uma das 12 linhas contra o
que foi feito na prova.

**Acceptance Scenarios**:

1. **Given** um candidato com uma tentativa concluída, **When** ele abre o histórico, **Then** vê
   "Histórico da certificação", o resumo ("Iniciada em", "Concluída em", "Resultado", "Nota" e
   "Situação") e uma tabela com os 12 temas na ordem da prova, de Mercúrio a Éris.
2. **Given** um tema respondido com a alternativa correta B, **When** o candidato lê a linha,
   **Then** vê "Corpo · Tema", o enunciado da questão sorteada, "Acertou" seguido de "B)
   [texto]", "B) [texto]" como resposta correta e a data e a hora da resposta, como "14/11/2026
   19:02".
3. **Given** um tema respondido com A quando a correta era C, **When** o candidato lê a linha,
   **Then** vê "Errou" seguido de "A) [texto]", "C) [texto]" como resposta correta e a data e a
   hora da resposta.
4. **Given** um tema exibido às 19:09:00 e encerrado por tempo esgotado, **When** o candidato lê
   a linha, **Then** vê "Tempo esgotado: sem resposta", a resposta correta e "14/11/2026 19:11",
   o fim do prazo de 150 segundos.
5. **Given** um tema cuja página o candidato fechou às 19:13, com o aviso de interrupção recebido
   pelo servidor, **When** o candidato lê a linha, **Then** vê "Interrompida: sem resposta", a
   resposta correta e "14/11/2026 19:13".
6. **Given** um tema interrompido sem que o aviso chegasse, pelo novo pedido da questão às 19:20,
   **When** o candidato lê a linha, **Then** vê "Interrompida: sem resposta" e "14/11/2026 19:20".
7. **Given** uma tentativa aprovada com 10 acertos, **When** o candidato vê o resumo, **Then** lê
   "Resultado: 10 de 12 (83,3%)", "Nota: 8,3", "Situação: Aprovado, certificado emitido" e o
   botão "Ver meu certificado".
8. **Given** uma tentativa reprovada com 6 acertos, **When** o candidato vê o resumo, **Then** lê
   "Resultado: 6 de 12 (50,0%)", "Nota: 5,0" e "Situação: Reprovado, sem certificado", sem o
   botão "Ver meu certificado".
9. **Given** um enunciado de cenário com mais de 200 caracteres, **When** a linha aparece,
   **Then** mostra o começo do enunciado e um controle para expandir, que funciona pelo teclado e
   informa a leitores de tela se o texto está expandido; um enunciado curto aparece inteiro.
10. **Given** o histórico aberto, **When** se confere tudo o que a página recebeu, **Then** não há
    CPF, e-mail nem outro dado cadastral além do nome do cabeçalho logado.

---

### User Story 2 - Escolher entre várias tentativas (Priority: P1)

O candidato que já fez mais de uma tentativa vê a lista delas, da mais recente para a mais
antiga, com a mais recente aberta, e escolhe qualquer outra para rever.

**Why this priority**: com a decisão D1, o reprovado pode tentar de novo; sem a escolha, o
histórico só mostraria parte do que o RF20 manda manter.

**Independent Test**: com um candidato que tem uma tentativa reprovada e outra concluída depois,
abrir o histórico, conferir a lista e a tentativa aberta, escolher a anterior e conferir que cada
uma mostra só as próprias respostas e tem o próprio endereço.

**Acceptance Scenarios**:

1. **Given** um candidato com duas tentativas, **When** ele abre o histórico, **Then** vê "Suas
   tentativas" com "Tentativa 2" ("15/11/2026, 83,3%") primeiro e "Tentativa 1" ("10/11/2026,
   50,0%") depois, e a tentativa 2 aberta e marcada como a atual.
2. **Given** a lista de tentativas, **When** o candidato escolhe a tentativa 1, **Then** chega ao
   endereço `/historico/1`, e o resumo e a tabela passam a ser os dela, no mesmo desenho, com a
   tentativa 1 marcada como a atual.
3. **Given** a mesma questão sorteada nas duas tentativas, **When** o candidato abre cada uma,
   **Then** cada tentativa mostra a resposta, a situação e a data e a hora dadas nela.
4. **Given** o resultado de uma tentativa (tela 12), **When** o candidato escolhe "Ver o
   histórico completo", **Then** o histórico abre naquela tentativa, pelo número dela, mesmo que
   não seja a mais recente.
5. **Given** um candidato com uma única tentativa, **When** ele abre o histórico, **Then** a lista
   de tentativas não aparece, e o resumo e a tabela são os da tentativa 1.
6. **Given** um candidato com duas tentativas, **When** ele abre `/historico/3`, `/historico/0` ou
   `/historico/abc`, **Then** recebe a mesma recusa de uma tentativa inexistente.

---

### User Story 3 - Acompanhar uma tentativa em andamento (Priority: P2)

Durante a certificação, entre um tema e outro, o candidato abre o histórico e vê os temas que já
encerrou, sem que nada da questão aberta apareça.

**Why this priority**: o histórico existe também para a tentativa em andamento, mas o candidato
já vê a correção de cada tema logo depois de encerrá-lo; depende das US1 e US2.

**Independent Test**: com uma tentativa de 5 temas encerrados e o 6º aberto, abrir o histórico em
outra aba e conferir que só aparecem os 5 e que nada do 6º chega à página; depois, deixar passar
o prazo do 6º e abrir de novo.

**Acceptance Scenarios**:

1. **Given** uma tentativa com 5 temas encerrados, **When** o candidato abre o histórico, **Then**
   vê "Concluída em: Em andamento", "Resultado: O resultado sai ao concluir os 12 temas", sem
   "Nota", "Situação: Em andamento, 5 de 12 temas concluídos", as 5 linhas e, abaixo da tabela,
   "Os próximos temas aparecem aqui depois de encerrados."
2. **Given** o 6º tema aberto e dentro do prazo, **When** o candidato abre o histórico em outra
   aba, **Then** o 6º tema não aparece, nada dele (enunciado, alternativas, resposta correta ou
   qual questão foi sorteada) chega à página, e a questão continua aberta, com o prazo correndo.
3. **Given** o 6º tema aberto há mais de 152 segundos, **When** o candidato abre o histórico,
   **Then** a questão é encerrada como tempo esgotado antes de o histórico ser montado e aparece
   na 6ª linha como "Tempo esgotado: sem resposta".
4. **Given** uma tentativa recém-criada, sem nenhum tema encerrado, **When** o candidato abre o
   histórico, **Then** vê o resumo e "Nenhum tema encerrado nesta tentativa ainda." no lugar da
   tabela.

---

### User Story 4 - Ir do erro ao estudo (Priority: P2)

Em cada tema que errou, por resposta errada, tempo esgotado ou interrupção, o candidato encontra
o caminho para a página daquele tema na área de estudos.

**Why this priority**: transforma o histórico em ponto de partida da revisão, como o protótipo da
área do candidato já promete ("O histórico mostra em quais temas você errou. Comece a revisão por
eles.").

**Independent Test**: numa tentativa com acertos e erros, conferir que só as linhas dos erros têm
"Revisar o tema" e que cada link abre a página do tema certo.

**Acceptance Scenarios**:

1. **Given** uma linha com "Errou", "Tempo esgotado" ou "Interrompida", **When** o candidato a lê,
   **Then** vê o link "Revisar o tema", que leva à página daquele tema na área de estudos.
2. **Given** uma linha com "Acertou", **When** o candidato a lê, **Then** ela não tem o link.
3. **Given** um leitor de tela, **When** ele chega a um link "Revisar o tema", **Then** o nome do
   link inclui o corpo e o tema, como "Revisar o tema Urano, Gestão do Product Backlog".
4. **Given** a feature 007 ainda não entregue, **When** o candidato percorre o histórico, **Then**
   não há menção nem link para flashcards fora do cabeçalho logado.

---

### User Story 5 - Chegar ao histórico pela área do candidato e pelo resultado (Priority: P3)

Os botões que até a 005 levavam à página "Disponível em breve" passam a levar ao histórico real,
a área do candidato ganha o caminho para ele também durante a tentativa e antes de uma nova, e o
texto que fala do histórico volta a aparecer.

**Why this priority**: integração com as telas 4 e 12 e com a regra de disponibilidade; depende
da US1.

**Independent Test**: depois da entrega, seguir "Ver meu histórico" nos quatro estados da área do
candidato que têm tentativa e "Ver o histórico completo" no resultado, e conferir o texto do
bloco "Estudar antes" no estado "reprovada".

**Acceptance Scenarios**:

1. **Given** a área do candidato nos estados "aprovada" ou "reprovada", **When** o candidato
   escolhe "Ver meu histórico", **Then** chega ao histórico com a última tentativa aberta.
2. **Given** a área do candidato nos estados "em andamento" ou "nova tentativa disponível",
   **When** o candidato lê o bloco principal, **Then** vê o link "Ver meu histórico" abaixo do
   aviso do botão principal, que abre a tentativa em andamento ou a última concluída; o cabeçalho
   logado não ganha link para o histórico.
3. **Given** a área do candidato no estado "reprovada", **When** o candidato lê o bloco "Estudar
   antes", **Then** vê "O histórico mostra em quais temas você errou. Comece a revisão por eles."
4. **Given** esta feature entregue, **When** qualquer link para o histórico é seguido, **Then**
   nenhum deles leva mais à página "Disponível em breve".
5. **Given** esta feature entregue e a 007 ainda não, **When** o candidato escolhe "Flashcards"
   ou o próprio nome no cabeçalho logado, **Then** continua chegando à página "Disponível em
   breve", que só existe para esses destinos.

---

### Edge Cases

- Candidato sem nenhuma tentativa que abre o endereço do histórico: vê "Você ainda não começou a
  certificação. Cada tema aparece aqui depois de encerrado." e "Voltar para a área do candidato".
- Questão aberta entre 150 e 152 segundos (tolerância da rede, FR-008 da 004): continua aberta e
  não aparece no histórico.
- Histórico aberto em outra aba durante uma questão: não interrompe a questão nem a entrega de
  novo (o histórico não pede a questão); a página da questão continua valendo. Trocar de aba não
  interrompe (FR-010 da 004).
- Horário da interrupção: o do recebimento do aviso enviado ao fechar ou recarregar a página; sem
  aviso, o do novo pedido da questão aberta; em "Interromper", o da confirmação (FR-010 e FR-012
  da 004).
- Mesma questão sorteada em duas tentativas (decisão D1, quando o candidato já viu as quatro do
  tema): cada tentativa mostra só a própria resposta.
- Número de tentativa que o candidato não tem, zero, negativo ou que não é número: a mesma recusa,
  sem revelar nada. Como o número é contado entre as tentativas do próprio candidato, nenhum
  endereço leva à tentativa de outra pessoa (Princípio VI).
- Pedido sem sessão: leva à tela Entrar, como toda tela logada.
- Enunciado longo, de cenário (RNF08): aparece recolhido e pode ser expandido, sem empurrar a
  tabela para fora da tela.
- Tabela no celular a 360 px: rola para o lado dentro do próprio contêiner; a página não rola
  para o lado.
- Candidato aprovado: a tentativa aprovada é sempre a mais recente, porque quem é aprovado não
  refaz (D1).
- Carga de questões substituída: só acontece com o volume do banco recriado, o que apaga também
  as respostas; o histórico nunca mostra uma questão diferente da sorteada.
- Banco indisponível: mensagem amigável de instabilidade, no padrão do kit, e nenhum histórico
  parcial.
- Pedido de menos movimento: nada no histórico depende de animação.

## Requirements *(mandatory)*

### Functional Requirements

**Tentativas (RF20, decisão D1)**

- **FR-001**: O histórico MUST listar todas as tentativas do candidato, da mais recente para a mais
  antiga, cada uma com o número ("Tentativa 1" é a primeira pela data de início) e, como no
  protótipo, a data de conclusão e o percentual ("15/11/2026, 83,3%") ou, em andamento, a data de
  início e "em andamento"; início, conclusão e resultado completos ficam no resumo (FR-003). O
  número MUST ser calculado, nunca armazenado (Princípio IV).
- **FR-002**: Ao abrir o histórico, a tentativa mais recente MUST aparecer aberta. Com duas ou mais
  tentativas, a lista "Suas tentativas" MUST aparecer acima do resumo, com a tentativa aberta
  marcada como a atual, e escolher outra MUST mostrar o resumo e a tabela dela no mesmo desenho
  do protótipo. Cada tentativa MUST ter endereço próprio com o número da tentativa do candidato
  (`/historico/2`), nunca com o identificador interno do banco; `/historico` abre a mais recente,
  e "Ver o histórico completo" (tela 12) abre a tentativa daquele resultado. Com uma única
  tentativa, a lista não aparece.
- **FR-003**: O resumo de cada tentativa MUST seguir o protótipo ("Iniciada em", "Concluída em",
  "Resultado", "Nota" e "Situação", com datas sem hora no formato "14/11/2026"):
  - aprovada: "Resultado" "[n] de 12 ([percentual])", "Nota" "[nota]" e "Situação" "Aprovado,
    certificado emitido";
  - reprovada: "Resultado" "[n] de 12 ([percentual])", "Nota" "[nota]" e "Situação" "Reprovado,
    sem certificado";
  - em andamento: "Concluída em" "Em andamento", "Resultado" "O resultado sai ao concluir os 12
    temas", sem "Nota", e "Situação" "Em andamento, [n] de 12 temas concluídos".

  Acertos, percentual, nota e aprovação MUST seguir as regras da 005 (FR-001 a FR-003: percentual
  e nota com uma casa decimal e vírgula).

**Linhas do histórico (RF20)**

- **FR-004**: Cada tema encerrado da tentativa MUST ter uma linha, na ordem dos temas da prova (1 a
  12, a mesma em que são respondidos), com as colunas do protótipo: "Tema" ("Corpo · Tema", com o
  corpo celeste), "Questão sorteada" (o enunciado), "Sua resposta", "Resposta correta" ("[letra])
  [texto]") e "Data e hora".
- **FR-005**: "Sua resposta" MUST trazer, como no protótipo, a situação do tema em linha própria
  ("Acertou", "Errou", "Tempo esgotado: sem resposta" ou "Interrompida: sem resposta") e, abaixo
  dela, a alternativa escolhida com a letra e o texto, quando houver. A situação MUST ser dita em
  texto, e não só por cor; "Acertou" usa a cor de sucesso do kit e as outras três, a de erro.
- **FR-006**: A situação MUST ser derivada da resposta registrada: acertou quando respondida com a
  alternativa correta; errou quando respondida com outra; tempo esgotado quando expirada;
  interrompida quando interrompida. Tempo esgotado e interrompida contam como erro (decisão D4).
- **FR-007**: "Data e hora" MUST mostrar, pelo relógio do servidor, no horário de Brasília e no
  formato de tabela da regra de escrita de `docs/telas.md` ("14/11/2026 19:02"): o horário da
  resposta, para respondida; o fim do prazo (exibição mais 150 segundos), para tempo esgotado; e
  o momento da interrupção, para interrompida. O momento da interrupção é o do recebimento do
  aviso enviado ao fechar ou recarregar a página; sem aviso, o do novo pedido da questão aberta;
  em "Interromper", o da confirmação (FR-010 e FR-012 da 004). Ele MUST ser registrado na coluna
  dedicada adotada pelo mantenedor (`proposta-modelo-de-dados.md`).
- **FR-008**: A questão aberta de uma tentativa em andamento MUST NOT aparecer no histórico, e
  nada do que a página recebe MUST indicar qual questão foi sorteada, o enunciado, as
  alternativas nem a resposta correta dela (Princípio I). Só entram questões encerradas. Antes de
  montar o histórico, MUST valer o encerramento preguiçoso da 004 (FR-009): a questão aberta há
  mais de 152 segundos é encerrada como expirada e entra como "Tempo esgotado". Abrir o histórico
  MUST NOT interromper nem entregar de novo a questão aberta.
- **FR-009**: Tudo o que o histórico mostra MUST vir das respostas registradas, das questões, das
  alternativas e dos temas, sem nada calculado armazenado nem copiado (Princípio IV). O único
  dado aceito da página MUST ser o número da tentativa a abrir; nenhum valor vindo dela entra no
  que é exibido (RNF04).

**Caminho para estudar (regra de disponibilidade)**

- **FR-010**: Cada linha com "Errou", "Tempo esgotado" ou "Interrompida" MUST ter o link "Revisar o
  tema", que leva à página daquele tema na área de estudos (tela 8, feature 003), com nome
  acessível que inclui o corpo e o tema ("Revisar o tema [Corpo], [Tema]"). Linhas com "Acertou"
  não têm o link. A menção a flashcards e qualquer link para eles MUST ficar fora do histórico
  até a feature 007.

**Ações**

- **FR-011**: Abaixo da tabela, MUST aparecer "Ver meu certificado" só quando a tentativa aberta
  for a aprovada, levando ao certificado dela (tela 13), e "Voltar para a área do candidato"
  sempre.

**Sem tentativas e sem temas encerrados**

- **FR-012**: Sem nenhuma tentativa, o histórico MUST mostrar o título, "Você ainda não começou a
  certificação. Cada tema aparece aqui depois de encerrado." e "Voltar para a área do candidato",
  sem resumo nem tabela. Numa tentativa sem tema encerrado, a tabela MUST dar lugar a "Nenhum
  tema encerrado nesta tentativa ainda."; numa tentativa em andamento com temas encerrados,
  MUST aparecer abaixo da tabela "Os próximos temas aparecem aqui depois de encerrados."

**Segurança e privacidade (RNF03, Princípios I e VI)**

- **FR-013**: O histórico MUST ser acessível só pelo próprio candidato, com sessão; sem sessão, o
  pedido leva à tela Entrar. O número da tentativa MUST ser conferido antes de qualquer consulta
  (inteiro positivo) e procurado só entre as tentativas do candidato da sessão; número que ele
  não tem, zero, negativo ou malformado MUST receber a mesma recusa de uma tentativa inexistente.
- **FR-014**: A página e tudo o que ela recebe MUST conter só dados das tentativas do próprio
  candidato, sem o identificador interno das tentativas e sem nenhum dado cadastral além do nome
  que o cabeçalho logado já mostra.

**Interface e acessibilidade (RNF01, Princípios II e XI)**

- **FR-015**: A tela 15 MUST portar `Historico.dc.html` com o kit: cabeçalho logado, "Histórico da
  certificação", o texto de apresentação do protótipo, a lista "Suas tentativas", o resumo, a
  tabela com a legenda "Role para o lado no celular para ver todas as colunas.", as ações e o
  rodapé. No celular, a tabela MUST rolar para o lado dentro do próprio contêiner, sem rolagem
  horizontal da página a partir de 360 px.
- **FR-016**: Enunciados com mais de 200 caracteres MUST aparecer recolhidos, mostrando o começo,
  com um controle para expandir e recolher, acessível por teclado e que informa a leitores de
  tela se o texto está expandido; enunciados mais curtos aparecem inteiros.
- **FR-017**: A tela MUST seguir o kit e as correções de `docs/identidade-visual.md`, com contraste
  AA, foco visível, alvos de pelo menos 44 px, uso completo só com teclado, cabeçalhos de coluna
  associados às células para leitores de tela e respeito ao pedido de menos movimento.

**Disponibilidade e integração (FR-050 da 002)**

- **FR-018**: Ao ser entregue, esta feature MUST tirar o destino "histórico" da página "Disponível
  em breve" (FR-024 da 005) e ligar ao histórico real: "Ver meu histórico", nos estados
  "aprovada" e "reprovada" da área do candidato, abrindo a última tentativa; e "Ver o histórico
  completo", no resultado, abrindo a tentativa daquele resultado. Nos estados "em andamento" e
  "nova tentativa disponível", a área do candidato MUST ganhar o link "Ver meu histórico", abaixo
  do aviso do botão principal, abrindo a tentativa em andamento ou a última concluída. O cabeçalho logado
  MUST NOT ganhar link para o histórico.
- **FR-019**: No estado "reprovada" da área do candidato, o bloco "Estudar antes" MUST passar a usar
  o texto do protótipo, "O histórico mostra em quais temas você errou. Comece a revisão por
  eles." (FR-022 da 005).
- **FR-020**: Depois desta feature, a página "Disponível em breve" MUST continuar existindo só para
  os destinos da 007 (flashcards e perfil, FR-024 da 002).

**Testes obrigatórios (Princípio IX)**

- **FR-021**: MUST existir testes automatizados, que passam a cada mudança nessas regras, para: um
  candidato com duas tentativas (ordem da lista, numeração, endereço pelo número e cada histórico
  só com as próprias respostas); tentativa em andamento sem a questão aberta em nada do que a
  página recebe; questão aberta há mais de 152 segundos encerrada e exibida como tempo esgotado;
  as quatro situações exibidas corretamente (situação, sua resposta, resposta correta e data e
  hora, inclusive o fim do prazo e o momento da interrupção, pelo aviso e pelo novo pedido);
  ordem dos temas de 1 a 12, mesmo com respostas gravadas fora de ordem; e acesso a dados de
  outro candidato (número de tentativa que só outro candidato tem, número inexistente e
  malformado, todos com a mesma recusa, sem identificador interno no que a página recebe). Os
  testes do aviso de interrupção ficam na 004 (FR-029 da 004).

### Key Entities *(include if feature involves data)*

- **Tentativa (certificação)**: já existe; pertence a um candidato, com data de início e de
  conclusão (nula em andamento). Com a proposta da 004, um candidato tem várias, no máximo uma em
  andamento. O número da tentativa é calculado pela ordem de início, entre as do candidato, e é o
  que aparece no endereço.
- **Resposta**: já existe; liga a tentativa à questão sorteada, com situação, alternativa
  escolhida, horário de exibição e de resposta. Ganha o momento da interrupção, só quando
  interrompida, na coluna dedicada adotada pelo mantenedor.
- **Questão, Alternativa e Tema**: já existem; dão o enunciado, a letra e o texto da escolhida e
  da correta, e o tema com a sua ordem.
- **Certificado**: já existe; indica, para a tentativa aprovada, o caminho "Ver meu certificado".

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para um candidato com duas tentativas, a lista mostra as duas, a mais recente
  primeiro e aberta, cada uma no endereço com o seu número, e 100% das linhas de cada histórico
  pertencem à sua tentativa.
- **SC-002**: Em 100% dos testes com uma questão aberta, nada dela (qual questão, enunciado,
  alternativas ou resposta correta) aparece no que a página do histórico recebe.
- **SC-003**: As quatro situações aparecem com a situação, a sua resposta, a resposta correta e a
  data e a hora certas em 100% dos casos testados, inclusive o tempo esgotado no fim do prazo e a
  interrupção no momento do aviso ou do novo pedido.
- **SC-004**: Os temas aparecem na ordem de 1 a 12 em 100% dos históricos testados.
- **SC-005**: 100% dos pedidos com número de tentativa que o candidato não tem, inclusive os que só
  outro candidato tem, e com número malformado recebem a mesma recusa de uma tentativa
  inexistente, e 0 respostas contêm o identificador interno de uma tentativa.
- **SC-006**: A partir do resultado de uma tentativa reprovada, o candidato chega à página de um
  tema que errou em 2 escolhas ("Ver o histórico completo" e "Revisar o tema").
- **SC-007**: Navegando só com teclado, 100% dos elementos acionáveis do histórico são alcançados
  com foco visível; a tela passa no contraste AA e não tem rolagem horizontal da página de 360 px
  a 1920 px, com a tabela rolando dentro do próprio contêiner no celular.
- **SC-008**: Na rede local da apresentação, o histórico de uma tentativa com 12 temas aparece em
  até 2 segundos, para um candidato com até 10 tentativas.
- **SC-009**: Depois da entrega, 0 links para o histórico levam à página "Disponível em breve", e
  0 textos do histórico mencionam flashcards antes da feature 007.
- **SC-010**: 100% dos testes do FR-021 passam a partir de um clone limpo.

## Assumptions

- **Esquema**: o momento da interrupção não é gravado hoje; a coluna dedicada, recomendada e
  adotada pelo mantenedor (P-02), está em `proposta-modelo-de-dados.md`, validada em PGlite
  (PostgreSQL 18) sobre o esquema atual mais a proposta da 004, com as consultas de referência do
  aviso de interrupção, das tentativas e do histórico, sem aplicar. O horário do tempo esgotado
  não precisa de coluna: é a exibição mais 150 segundos. Várias tentativas por candidato dependem
  da proposta da 004.
- **Fuso horário**: horário de Brasília, o mesmo que o `docker-compose.yml` já configura para a
  aplicação e o banco; os horários gravados já estão nesse fuso.
- **Ordem dos temas**: os temas são respondidos na ordem da prova (regra R2 do dossiê), então a
  ordem da tabela é também a ordem em que foram respondidos.
- **Imagem e justificativa**: o histórico mostra o enunciado, como o protótipo, sem a imagem da
  questão nem a justificativa, que aparecem na correção de cada tema (004); o RF20 não as pede.
- **Lista de tentativas** (FR-002): só aparece com duas ou mais tentativas, para que a tela de
  quem fez uma só fique sem um seletor de um item.
- **Enunciado recolhido** (FR-016): o limite de 200 caracteres deixa inteiros os enunciados curtos
  do protótipo e recolhe os de cenário que o RNF08 pede.
- **Sem limite de tentativas** (decisão D9, aberta): a lista não tem limite de tamanho; se a D9 for
  decidida com um limite, nada muda no histórico.
- Sem edição de perfil (decisão D5): o histórico não depende de dados cadastrais.

## Conflitos entre as fontes

Resolvidos pelo mantenedor em 03/10/2026:

1. **Uma tentativa ou várias**: o protótipo original, a tela 15 de `docs/telas.md` e a seção 4.6 do
   dossiê ("o histórico da sua certificação") mostravam uma tentativa só; a decisão D1 permite
   várias. Mantida a resolução: lista de tentativas acima do resumo (FR-001, FR-002), já no
   protótipo atualizado.
2. **Situações**: o protótipo original mostrava o tempo esgotado como "Errou: Sem resposta: tempo
   esgotado" e não tinha interrompida; `docs/telas.md` listava "acertou, errou ou sem resposta por
   tempo esgotado". Mantida a resolução: as quatro situações da 005 (FR-005), já no protótipo.
3. **Horário da interrupção**: o esquema não grava o momento da interrupção. Mantida a resolução:
   coluna dedicada (FR-007, P-02), com o horário registrado pelo aviso de interrupção (FR-010 da
   004).
4. **Formato de data e hora**: tabelas usam "14/11/2026 19:02" e frases usam "15/11/2026 às
   14:23", como regra de escrita de `docs/telas.md` para todas as telas (FR-003, FR-007).
5. **"Ver meu histórico" no estado "reprovada"**: o protótipo da área do candidato tem o botão nos
   estados "aprovada" e "reprovada"; o FR-021 da 005 o cita só em "aprovada". Mantida a
   resolução: os dois estados levam ao histórico (FR-018).
6. **Caminho para o histórico em andamento**: resolvido pela P-04: "Ver meu histórico" nos estados
   "em andamento" e "nova tentativa disponível", nada no cabeçalho (FR-018).
7. **Página "Disponível em breve" depois da 006**: a tela 6 de `docs/telas.md` dizia que a página
   sumia com as features 003 a 006, mas o FR-024 da 002 a mantém para flashcards e perfil até a
   007. Mantida a resolução: a página continua só para os destinos da 007 (FR-020); a tela 6 foi
   alinhada.
8. **Endereço de cada tentativa**: usa o número da tentativa do candidato (`/historico/2`), nunca o
   identificador interno do banco (FR-002, FR-013).
9. **Resultado no resumo**: o resumo mostra a nota ao lado do resultado (FR-003), como no protótipo
   atualizado.
10. **Caminho para estudar**: mantida a resolução: "Revisar o tema" na linha (FR-010), já no
    protótipo.

## Pendências

- **P-01**: aprovação, pelo mantenedor, da proposta de modelo de dados da 004, da qual dependem
  as várias tentativas por candidato (FR-001, FR-002, SC-001).

Resolvidas pelo mantenedor em 03/10/2026:

- **P-02**: coluna dedicada para o horário da interrupção, recomendada por não mudar o significado
  da coluna de horário de resposta e adotada; o horário é o momento em que a pessoa fechou ou
  recarregou a página, registrado pelo aviso de interrupção da 004 (FR-007).
- **P-03**: textos aprovados como propostos, com "O resultado sai ao concluir os 12 temas" no
  lugar de "Sai ao concluir os 12 temas" (FR-002, FR-003, FR-005, FR-010, FR-012, FR-016).
- **P-04**: "Ver meu histórico" nos estados "em andamento" e "nova tentativa disponível" da área
  do candidato; nada no cabeçalho (FR-018).
- **P-05**: telas 6 e 15 de `docs/telas.md` alinhadas, com a regra de escrita de datas e horas e a
  rota `/historico/:numero`; `Historico.dc.html` atualizado pelo mantenedor.
- **P-06**: tela 4 de `docs/telas.md` e `AreaCandidato.dc.html` alinhados com a P-04: o link "Ver
  meu histórico" fica abaixo do aviso do botão, só nos estados "em andamento" e "nova tentativa
  disponível" (FR-018).

## Conformidade com a constituição (versão 3.0.1)

| Princípio | Como esta spec atende | Situação |
|---|---|---|
| I. Servidor é a autoridade | Histórico montado no servidor a partir das respostas; a questão aberta não chega à página, e a correta só aparece depois do encerramento (FR-008); nada da página entra no que é exibido além do número da tentativa (FR-009). | ✅ |
| II. Front-end sem bibliotecas de terceiros | Kit próprio; tabela rolável e enunciado recolhível sem biblioteca (FR-015, FR-016). | ✅ |
| III. PostgreSQL com SQL explícito | Mudança de esquema adotada e descrita em proposta validada em PGlite, sem aplicar, com consultas de referência em SQL (`proposta-modelo-de-dados.md`). | ✅ |
| IV. Dados derivados não são armazenados | Situação, número da tentativa, acertos, percentual, nota e horário do tempo esgotado calculados (FR-001, FR-003, FR-006, FR-007, FR-009); o momento da interrupção é um fato, não um dado derivado. | ✅ |
| V. Comando único | Nada novo de execução. | ✅ |
| VI. LGPD e minimização | Histórico só para o dono, com números de tentativa contados entre as dele e a mesma recusa para os que ele não tem (FR-013), sem identificador interno nem dados cadastrais além do nome (FR-014). | ✅ |
| VII. Escopo do site final e ordem de entrega | Feature obrigatória (RF20); flashcards só com a 007 (FR-010, FR-020). | ✅ |
| VIII. Rastreabilidade | Requisitos citam RF20, RNF03, RNF04, as decisões D1 e D4 e as telas. | ✅ |
| IX. Testes das regras críticas | O histórico não é regra crítica da constituição, mas tem testes obrigatórios por regra do mantenedor (FR-021); os do aviso de interrupção ficam na 004. | ✅ |
| X. Padrões de código | Textos e identificadores de domínio em português; proposta segue o padrão `tb`/`id` do banco. | ✅ |
| XI. Interface fiel e acessível | Tela portada do protótipo atualizado com o kit (FR-015); AA, foco, 44 px e teclado (FR-017). | ✅ |
