# Feature Specification: Resultado, Certificado e Validação Pública

**Feature Branch**: `005-resultado-certificado`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Resultado, certificado e validação pública (feature 005): telas 12 (Resultado final), 13 (Certificado) e 14 (Validação pública) e os estados 'aprovada', 'reprovada' e o percentual do estado 'nova tentativa disponível' da área do candidato, com as regras do mantenedor sobre cálculo derivado, aprovação com 8 acertos, tentativas (D1), emissão única, certificado com QR Code gerado no servidor, validação pública sem dados sensíveis, resultado tema a tema, área do candidato, regra de disponibilidade, segurança e testes obrigatórios (Princípio IX)."

**Requisitos atendidos**: RF16, RF17, RF18, RF19, RP08, RNF03 e RNF04, conforme
`docs/requisitos-desafio.md`; decisões D1, D2 e D4 (03/10/2026); telas 4 (estados "aprovada",
"reprovada" e o percentual de "nova tentativa disponível"), 12, 13 e 14 de `docs/telas.md`;
seção da feature 005 no dossiê. A conformidade com a constituição 3.0.1 está no fim deste
documento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver o resultado da tentativa (Priority: P1)

Ao encerrar o 12º tema, o candidato vê o resultado da tentativa: acertos, percentual, nota e a
situação de cada tema, e fica sabendo se foi aprovado ou, se não foi, quando pode tentar de novo.

**Why this priority**: é o RF16 e o momento em que a certificação faz sentido para o candidato;
sem o resultado, o certificado e a validação não existem.

**Independent Test**: concluir uma tentativa com 8 acertos e outra com 7 e conferir, em cada
uma, os três números, a lista tema a tema, o estado da tela e a data da nova tentativa no caso
reprovado.

**Acceptance Scenarios**:

1. **Given** a correção do 12º tema, **When** o candidato segue pelo painel, **Then** vê o
   resultado da tentativa que acabou de concluir.
2. **Given** uma tentativa com 10 acertos, **When** o resultado aparece, **Then** mostra "Você
   concluiu os 12 temas", a Lua cheia, o título "Lua cheia: você foi aprovado", "10 de 12",
   "83,3%" e a nota "8,3", a lista tema a tema e os botões "Ver meu certificado" e "Ver o
   histórico completo".
3. **Given** uma tentativa com 6 acertos concluída em 15/11/2026 às 14:23, **When** o resultado
   aparece, **Then** mostra o título "Desta vez, o certificado não veio", "50,0%", a nota "5,0",
   que faltaram 2 acertos e que a nova tentativa fica disponível em 16/11/2026 às 14:23.
4. **Given** a lista tema a tema, **When** o candidato a lê, **Then** cada um dos 12 temas aparece
   com "Corpo · Tema" e uma situação: "Acertou", "Errou", "Tempo esgotado" ou "Interrompida".
5. **Given** um candidato com duas tentativas concluídas, **When** ele abre o resultado de cada
   uma, **Then** cada resultado mostra só as respostas daquela tentativa.
6. **Given** o resultado, antes de a feature 006 existir, **When** o candidato escolhe "Ver o
   histórico completo", **Then** vai à página "Disponível em breve", com o título "O histórico
   está a caminho".

---

### User Story 2 - Receber, imprimir e compartilhar o certificado (Priority: P1)

O candidato aprovado recebe o certificado na hora, sem pedir nada. Ele vê o documento com todos
os dados do RF18, salva em PDF pela impressão do navegador e copia o link de validação para
mandar a quem quiser conferir.

**Why this priority**: é o RF17 e o RF18, o produto final da certificação.

**Independent Test**: concluir uma tentativa aprovada, abrir o certificado, conferir todos os
campos, imprimir para PDF, copiar o link, ler o QR Code com um celular na mesma rede e repetir a
conclusão para conferir que nenhum outro certificado é emitido.

**Acceptance Scenarios**:

1. **Given** a conclusão de uma tentativa com 8 acertos ou mais, **When** ela é gravada, **Then**
   o certificado é emitido no mesmo momento, uma única vez, com código de validação próprio.
2. **Given** uma tentativa concluída com 7 acertos ou menos, **When** ela é gravada, **Then**
   nenhum certificado é emitido.
3. **Given** o certificado, **When** o candidato o abre, **Then** vê nome completo, CPF, e-mail,
   acertos, percentual, nota, data e hora de emissão, código de validação, QR Code, selo lunar,
   "Valide em [endereço do portal]/validar" e o aviso de que o certificado não substitui
   certificações oficiais de Scrum.
4. **Given** o certificado, **When** o candidato escolhe "Imprimir ou salvar em PDF", **Then** a
   impressão do navegador abre com o documento claro, sem cabeçalho, botões, rodapé nem fundo
   escuro.
5. **Given** o certificado, **When** o candidato escolhe "Copiar link de validação", **Then** o
   link de validação do certificado é copiado e uma notificação confirma; se o navegador não
   permitir copiar, o link aparece selecionado para cópia manual.
6. **Given** o QR Code impresso ou na tela, **When** alguém o lê com a câmera de um celular na
   rede do portal, **Then** abre a validação pública com o código preenchido e o resultado.

---

### User Story 3 - Validar um certificado publicamente (Priority: P1)

Qualquer pessoa, sem conta, confere se um certificado é autêntico digitando o código ou lendo o
QR Code, e vê só os dados essenciais, sem dados pessoais completos.

**Why this priority**: é o RF19 e o RP08; sem a validação, o certificado não tem como ser
conferido.

**Independent Test**: validar um código existente, um código inexistente bem formado e um texto
malformado, sem login, conferindo os dados exibidos e que as duas recusas são idênticas.

**Acceptance Scenarios**:

1. **Given** a página de validação sem código, **When** a pessoa a abre, **Then** vê o campo
   "Código do certificado", o botão "Validar" e a explicação de onde encontrar o código.
2. **Given** um código existente, **When** a pessoa o valida (digitando ou pelo QR Code), **Then**
   vê "Certificado autêntico" com nome, CPF mascarado no formato `***.456.789-**`, resultado ("10
   de 12 acertos (83,3%)"), nota e data de emissão, e o aviso de que, por privacidade, o CPF
   aparece mascarado e o e-mail não é exibido.
3. **Given** um código inexistente ou um texto que nem tem o formato de código, **When** a pessoa
   o valida, **Then** vê exatamente a mesma resposta: "Nenhum certificado encontrado", com a
   orientação de conferir o código.
4. **Given** muitas consultas sem resultado a partir do mesmo endereço de rede, **When** o limite
   folgado é atingido, **Then** novas consultas daquele endereço esperam um pouco, enquanto
   consultas com resultado nunca são bloqueadas.
5. **Given** esta feature entregue, **When** alguém escolhe "Validar certificado" no rodapé de
   qualquer tela ou na pergunta frequente da tela inicial, **Then** chega à validação real, e não
   mais à página "Disponível em breve".

---

### User Story 4 - Ver a situação final na área do candidato (Priority: P2)

Na área do candidato, quem foi aprovado vê a Lua cheia e o caminho para o certificado; quem foi
reprovado vê o resultado e quando pode tentar de novo; e quem já pode tentar de novo vê o
percentual da tentativa anterior.

**Why this priority**: completa o RF02 e o RF21 depois da prova; depende do resultado (US1).

**Independent Test**: abrir a área do candidato depois de uma tentativa aprovada, de uma
reprovada há menos de 24 horas e de uma reprovada há 24 horas ou mais, conferindo os três
estados.

**Acceptance Scenarios**:

1. **Given** um candidato aprovado, **When** ele abre a área do candidato, **Then** vê "Lua
   cheia: você foi aprovado", os acertos e o percentual da tentativa aprovada e os botões "Ver meu
   certificado" e "Ver meu histórico".
2. **Given** um candidato reprovado há menos de 24 horas, **When** ele abre a área do candidato,
   **Then** vê "Você concluiu os 12 temas", os acertos e o percentual ("Foram 6 acertos (50,0%),
   abaixo dos 65% necessários para o certificado.") e a data e a hora a partir das quais pode
   tentar de novo; enquanto a feature 006 não existir, o bloco "Estudar antes" não fala do
   histórico.
3. **Given** um candidato reprovado há 24 horas ou mais, **When** ele abre a área do candidato,
   **Then** vê o estado "nova tentativa disponível" com "Sua tentativa anterior ficou em 50,0%."

---

### Edge Cases

- Conclusão repetida da mesma tentativa (duplo pedido, nova tentativa automática da rede):
  continua havendo no máximo um certificado para ela.
- Falha ao gravar o certificado durante a conclusão de uma tentativa aprovada: nada da conclusão
  é gravado, e a questão do 12º tema pode ser encerrada de novo sem perder o direito ao
  certificado.
- Tentativa em andamento: não tem resultado nem certificado; pedir o resultado dela recebe a
  mesma recusa de uma tentativa inexistente.
- Candidato reprovado que tenta abrir um certificado: recusa igual à de certificado inexistente.
- Resultado ou certificado de outro candidato: mesma recusa de um inexistente, sem revelar que
  existe (Princípio VI).
- Código digitado com letras maiúsculas, com espaços nas pontas ou colado com quebra de linha:
  aceito, se o resto estiver certo.
- Código com hífens faltando, caracteres a mais ou formato que não é de código: mesma resposta de
  código inexistente, sem mensagem técnica.
- Candidato que mudou o nome no cadastro depois da emissão: não acontece nesta versão, porque não
  há edição de perfil (decisão D5); o certificado e a validação leem o cadastro atual.
- QR Code lido por um celular quando o endereço público do portal é `localhost`: o celular não
  abre a página; por isso a apresentação usa o endereço da máquina na rede local (Assumptions).
- Validação aberta em outro navegador, sem sessão: funciona igual; não depende de login.
- Banco indisponível na validação: mensagem amigável de indisponibilidade, diferente da resposta
  de código inexistente, para não dizer a ninguém que um certificado verdadeiro é falso.
- Pedido de menos movimento: nada nas três telas depende de animação.

## Requirements *(mandatory)*

### Functional Requirements

**Cálculo do resultado (RF16, RNF04, Princípios I e IV)**

- **FR-001**: Acertos, percentual e nota MUST ser calculados a partir das respostas de cada
  tentativa, nunca armazenados nem recebidos da página. Uma resposta só é acerto quando foi
  respondida dentro do prazo com a alternativa correta; questões expiradas e interrompidas contam
  como erro (decisão D4, pelo RF11 e pelo RF14).
- **FR-002**: O percentual MUST ter uma casa decimal, com vírgula ("83,3%"), e a nota, de 0 a 10,
  MUST ser o percentual dividido por 10, com uma casa decimal e vírgula ("8,3"), arredondados
  para a casa mais próxima (decisão D2). Os 13 resultados possíveis são:

  | Acertos | Percentual | Nota | Situação |
  |---|---|---|---|
  | 0 | 0,0% | 0,0 | reprovado |
  | 1 | 8,3% | 0,8 | reprovado |
  | 2 | 16,7% | 1,7 | reprovado |
  | 3 | 25,0% | 2,5 | reprovado |
  | 4 | 33,3% | 3,3 | reprovado |
  | 5 | 41,7% | 4,2 | reprovado |
  | 6 | 50,0% | 5,0 | reprovado |
  | 7 | 58,3% | 5,8 | reprovado |
  | 8 | 66,7% | 6,7 | aprovado |
  | 9 | 75,0% | 7,5 | aprovado |
  | 10 | 83,3% | 8,3 | aprovado |
  | 11 | 91,7% | 9,2 | aprovado |
  | 12 | 100,0% | 10,0 | aprovado |

- **FR-003**: A tentativa MUST ser aprovada com 8 acertos ou mais (aproveitamento de 65% ou mais,
  RF17); com 7 acertos ou menos, reprovada.

**Emissão do certificado (RF17, RF18, decisão D1)**

- **FR-004**: O certificado MUST ser emitido automaticamente, na mesma operação indivisível que
  grava a conclusão da tentativa aprovada (FR-018 da 004), com código de validação aleatório
  gerado pelo banco e data e hora de emissão iguais às da conclusão. Se a emissão falhar, a
  conclusão também não é gravada.
- **FR-005**: Cada tentativa MUST ter no máximo um certificado, e só a tentativa aprovada o tem;
  repetir a conclusão de uma tentativa MUST NOT gerar outro certificado. Como quem é aprovado não
  refaz (FR-002 da 004), cada candidato tem no máximo uma tentativa aprovada e um certificado.
- **FR-006**: Resultado e certificado MUST ser sempre de uma tentativa específica: cada tentativa
  concluída do candidato tem o seu resultado, com endereço próprio, e a área do candidato leva ao
  da última tentativa. Tentativa em andamento não tem resultado.

**Resultado (RF16, tela 12)**

- **FR-007**: A tela 12 MUST portar `Resultado.dc.html` com o kit: cabeçalho logado e rodapé,
  "Você concluiu os 12 temas", a Lua cheia, título e texto conforme o resultado, os três números
  ("Acertos [n] de 12", "Percentual de acertos", "Nota final, de 0 a 10") e a lista "Tema a tema",
  com "Corpo · Tema" e a situação de cada tema: "Acertou", "Errou", "Tempo esgotado" ou
  "Interrompida".
- **FR-008**: No estado aprovado, a tela MUST trazer o título "Lua cheia: você foi aprovado", o
  texto "Seu aproveitamento ficou acima dos 65% exigidos. O certificado foi emitido em [data] às
  [hora] e já pode ser validado por qualquer pessoa pelo QR Code." e os botões "Ver meu
  certificado" e "Ver o histórico completo".
- **FR-009**: No estado reprovado, a tela MUST trazer o título "Desta vez, o certificado não
  veio", o texto "Você acertou [percentual], e o mínimo é 65%: faltaram [n] acertos. Uma nova
  tentativa fica disponível em [data] às [hora], 24 horas depois do fim desta, e até lá a área de
  estudos ajuda a revisar os temas que você errou." com a data e a hora exatas da conclusão mais
  24 horas, pelo relógio do servidor, e os botões "Revisar os temas que errei" (que leva à área
  de estudos) e "Ver o histórico completo". Com a feature 007, o fim do texto passa a ser "e até
  lá a área de estudos e os flashcards ajudam a revisar os temas que você errou." (regra de
  disponibilidade, FR-050 da 002).
- **FR-010**: Com esta feature, o painel da correção do 12º tema (FR-018 da 004) MUST levar ao
  resultado da tentativa, e não mais à área do candidato.

**Certificado (RF18, RP08, tela 13)**

- **FR-011**: A tela 13 MUST portar `Certificado.dc.html` com o kit: cabeçalho logado e rodapé,
  "Seu certificado", a orientação "Salve em PDF pela opção de impressão do navegador. A versão
  impressa sai sem os botões e com fundo claro.", os botões "Imprimir ou salvar em PDF" e "Copiar
  link de validação" e o documento claro.
- **FR-012**: O documento MUST trazer, lidos do cadastro do candidato: "Certificado de aprovação",
  "Certificamos que [nome completo] CPF [000.000.000-00] e e-mail [e-mail]", "concluiu a
  certificação em Metodologias Ágeis do Lunar Celer, com [n] acertos em 12 questões,
  aproveitamento de [percentual] e nota final [nota].", "Emitido em [data] às [hora]", o código de
  validação, o QR Code, "Valide em [endereço público do portal]/validar", o selo lunar e o aviso
  "Projeto acadêmico da Fatec Jacareí. Este certificado comprova o desempenho nesta avaliação e
  não substitui certificações oficiais de Scrum." (RF18).
- **FR-013**: O QR Code MUST ser gerado no servidor como imagem vetorial embutida na página, sem
  serviço externo, e conter o endereço `[endereço público do portal]/validar/[código]`, a partir da
  configuração `PUBLIC_BASE_URL` que a feature 001 já criou. Ele MUST ter texto alternativo
  ("QR Code de validação do certificado") e continuar legível na impressão.
- **FR-014**: "Imprimir ou salvar em PDF" MUST usar a impressão do navegador, e a versão
  impressa MUST sair com o documento claro, sem cabeçalho, botões, rodapé, notificações nem fundo
  escuro.
- **FR-015**: "Copiar link de validação" MUST copiar o mesmo endereço do QR Code e confirmar com a
  notificação do kit ("Link copiado"). Se o navegador não permitir copiar (por exemplo, quando o
  portal é aberto pelo endereço da rede local, sem conexão segura), o link MUST aparecer
  selecionado, pronto para cópia manual, com aviso na própria página.

**Validação pública (RF19, RP08, RNF03, tela 14)**

- **FR-016**: A validação MUST estar em `/validar` e em `/validar/[código]`, sem login, e portar
  `Validacao.dc.html` com o kit: cabeçalho público com "Voltar ao início", "Validar certificado",
  a explicação de onde fica o código, o campo "Código do certificado", o botão "Validar", o aviso
  de que os certificados não substituem certificações oficiais de Scrum e o rodapé. Quem chega por
  `/validar/[código]` vê o código preenchido e o resultado direto.
- **FR-017**: Para um certificado autêntico, a página MUST mostrar "Certificado autêntico", o
  aviso "Emitido pelo Lunar Celer. Por privacidade, o CPF aparece mascarado e o e-mail não é
  exibido.", o nome completo, o CPF mascarado no formato `***.456.789-**` (só do 4º ao 9º
  dígito), o resultado ("[n] de 12 acertos ([percentual])"), a nota final e a data e a hora de
  emissão. A página e tudo o que ela recebe MUST NOT conter o e-mail nem o CPF completo
  (Princípio VI).
- **FR-018**: Código inexistente e código malformado MUST receber exatamente a mesma resposta
  ("Nenhum certificado encontrado" e a orientação do protótipo), sem mensagem técnica; o formato
  do código MUST ser conferido antes de qualquer consulta. Maiúsculas e minúsculas e espaços nas
  pontas MUST ser aceitos.
- **FR-019**: As páginas de validação MUST levar a instrução para que buscadores não as indexem,
  porque exibem o nome de uma pessoa.
- **FR-020**: Por endereço de rede, MUST existir um limite folgado contra varredura de códigos,
  contando só as consultas sem certificado encontrado, da ordem de 60 por minuto, no mesmo padrão
  do limite de login da 002 (FR-017a); consultas com resultado nunca contam, para não bloquear uma
  sala inteira lendo QR Codes da mesma rede. Ao atingir o limite, a página pede para aguardar, com
  a mesma mensagem para qualquer código.

**Área do candidato (RF02, RF21, tela 4)**

- **FR-021**: Esta feature MUST ativar, no lugar do estado "concluída" sem nota da 004, os
  estados "aprovada" ("Lua cheia: você foi aprovado", "Você concluiu os 12 temas com [n] acertos
  ([percentual]). O certificado já foi emitido e pode ser validado pelo QR Code.", botões "Ver meu
  certificado" e "Ver meu histórico") e "reprovada" ("Você concluiu os 12 temas", "Foram [n]
  acertos ([percentual]), abaixo dos 65% necessários para o certificado. Você pode tentar de novo
  a partir de [data] às [hora], 24 horas depois do fim desta tentativa."), e mostrar, no estado
  "nova tentativa disponível", a frase "Sua tentativa anterior ficou em [percentual]." Todo
  percentual da área segue o FR-002 ("50,0%").
- **FR-022**: No estado "reprovada", o bloco "Estudar antes" MUST usar o texto do protótipo ("O
  histórico mostra em quais temas você errou. Comece a revisão por eles.") só quando a feature 006
  existir; até lá, usa o texto do estado "não iniciada" (regra de disponibilidade).

**Disponibilidade e integração (FR-050 da 002)**

- **FR-023**: Ao ser entregue, esta feature MUST tirar o destino "validação" da página
  "Disponível em breve" (FR-024 da 002) e ligar à validação real o link "Validar certificado" do
  rodapé e o da pergunta frequente "Como alguém confere meu certificado?"; a página não encontrada
  (feature 008), quando existir, também leva a ela.
- **FR-024**: Os botões "Ver o histórico completo" e "Ver meu histórico" MUST levar à página
  "Disponível em breve" até a feature 006 existir, na variação do histórico, que esta feature
  acrescenta às da 002: título "O histórico está a caminho" e texto "O registro completo das suas
  tentativas, questão por questão, chega numa próxima versão do Lunar Celer." A variação vale até
  a feature 006 existir. A menção a flashcards e qualquer link para eles MUST ficar oculta até a
  feature 007.

**Segurança e acesso (Princípios I e VI)**

- **FR-025**: Resultado e certificado MUST ser acessíveis só pelo próprio candidato, com sessão;
  pedido sobre tentativa ou certificado de outro candidato, de tentativa em andamento ou de
  tentativa sem certificado MUST receber a mesma recusa de um recurso inexistente.
- **FR-026**: Nenhum valor vindo da página (acertos, percentual, nota, situação, aprovação ou
  código) MUST entrar no cálculo ou na emissão.

**Interface e acessibilidade (RNF01, RNF02, Princípios II e XI)**

- **FR-027**: As três telas MUST seguir o kit e as correções de `docs/identidade-visual.md` e
  funcionar a partir de 360 px sem rolagem horizontal, com contraste AA, foco visível, alvos de
  pelo menos 44 px, uso completo só com teclado e respeito ao pedido de menos movimento. Datas e
  horas aparecem no formato "15/11/2026 às 14:23", no horário de Brasília.

**Testes obrigatórios (Princípio IX)**

- **FR-028**: MUST existir testes automatizados, que passam a cada mudança nessas regras, para: a
  fronteira de 7 e 8 acertos; os 13 valores de percentual e nota do FR-002; expiradas e
  interrompidas contadas como erro; emissão única e idempotente (conclusão repetida e pedidos
  simultâneos); ausência de certificado para reprovado; resultado correto de um candidato com duas
  tentativas, uma reprovada e uma aprovada, com o certificado só na aprovada; validação sem e-mail
  e com CPF mascarado em tudo o que a página recebe; código inexistente e malformado com a mesma
  resposta; acesso a resultado e certificado de outro candidato; e o conteúdo do QR Code (o
  endereço de validação com o código certo).

### Key Entities *(include if feature involves data)*

- **Tentativa (certificação)**: já existe; tem data de início e de conclusão. O resultado
  (acertos, percentual, nota, aprovação) é calculado a partir das respostas dela.
- **Resposta**: já existe; a situação e a alternativa escolhida definem o acerto de cada tema.
- **Certificado**: já existe; pertence a uma tentativa aprovada, no máximo um por tentativa, com
  código de validação aleatório gerado pelo banco e data e hora de emissão.
- **Candidato**: já existe; nome, CPF e e-mail do certificado vêm do cadastro.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Os 13 resultados possíveis (0 a 12 acertos) aparecem com o percentual, a nota e a
  situação da tabela do FR-002 em 100% dos casos testados.
- **SC-002**: Uma tentativa com 7 acertos é reprovada e não recebe certificado; uma com 8 é
  aprovada e recebe exatamente um, em 100% dos testes de fronteira.
- **SC-003**: Com 10 repetições da conclusão de uma tentativa aprovada, inclusive simultâneas,
  existe exatamente 1 certificado para ela.
- **SC-004**: Para um candidato com uma tentativa reprovada e outra aprovada, cada resultado
  mostra só as respostas da sua tentativa, e o certificado existe só para a aprovada.
- **SC-005**: Em 100% das validações de certificado autêntico, o e-mail e o CPF completo não
  aparecem em nada do que a página recebe, e o CPF aparece no formato `***.456.789-**`.
- **SC-006**: Para 20 códigos inexistentes e 20 malformados, a resposta é idêntica em conteúdo e
  em situação em 100% dos casos.
- **SC-007**: 100% dos pedidos de resultado ou certificado de outro candidato recebem a mesma
  recusa de um recurso inexistente.
- **SC-008**: Na rede local da apresentação, com o endereço público configurado para o IP da
  máquina, o QR Code impresso abre a validação com o resultado em 2 câmeras de celular diferentes,
  e o conteúdo do QR Code é exatamente o endereço de validação do certificado.
- **SC-009**: A versão impressa do certificado cabe em uma página A4 em retrato, sem nenhum
  elemento de navegação e com fundo claro.
- **SC-010**: A partir de um mesmo endereço de rede, 100 validações com resultado em um minuto
  nunca são bloqueadas, e a varredura passa a esperar depois de cerca de 60 consultas sem
  resultado no mesmo minuto.
- **SC-011**: Navegando só com teclado, 100% dos elementos acionáveis das telas 12, 13 e 14 são
  alcançados com foco visível; as telas passam no contraste AA e ficam sem rolagem horizontal de
  360 px a 1920 px.
- **SC-012**: 100% dos testes do FR-028 passam a partir de um clone limpo.
- **SC-013**: Depois da entrega, 0 destinos provisórios da validação permanecem, e 0 textos
  mencionam flashcards antes da feature 007.
- **SC-014**: Na rede local da apresentação, o resultado aparece em até 2 segundos depois do
  painel da correção do 12º tema, e a validação em até 2 segundos depois da leitura do QR Code.

## Assumptions

- **Esquema**: esta feature não exige mudança de esquema própria. O cálculo, a emissão única e o
  código de validação usam as tabelas existentes; a conferência foi feita em PGlite (PostgreSQL
  18) sobre o esquema atual mais a proposta da 004: a tabela de 13 valores do FR-002, a fronteira
  de 7 e 8 acertos, a emissão única com conclusão repetida e a data de emissão igual à da
  conclusão. Duas tentativas por candidato dependem da proposta de modelo de dados da 004 (troca da
  restrição única de `tbcertificacao.idcandidato`).
- **Código malformado**: se chegasse ao banco, um texto fora do formato de código geraria erro de
  tipo; por isso o formato é conferido antes da consulta (FR-018).
- **Texto do aprovado** (FR-008): o protótipo diz "O certificado foi emitido agora", o que deixa de
  ser verdade quando o candidato reabre o resultado depois; a spec usa a data e a hora de emissão.
- **Percentual na área do candidato** (FR-021): o protótipo mostra "50%" na área e "50,0%" no
  resultado; vale a regra de uma casa decimal em todos os lugares.
- **"Interrompida" no resultado** (FR-007): `docs/telas.md` lista só "Acertou", "Errou" e "Tempo
  esgotado"; a regra do mantenedor acrescenta "Interrompida".
- **"Revisar os temas que errei"** (FR-009): leva à área de estudos (003); no protótipo levava à
  página "Disponível em breve".
- **Correção do 12º tema** (FR-010): com a 005, o painel leva ao resultado, e não mais à área do
  candidato, como estava na 004 e em `docs/telas.md`.
- **Fuso horário**: datas e horas no horário de Brasília, o mesmo fuso que o `docker-compose.yml`
  já configura para a aplicação e o banco.
- **Cópia do link** (FR-015): a cópia direta para a área de transferência só funciona em conexão
  segura ou em `localhost`; aberto pelo IP da rede local, o portal mostra o link para cópia
  manual.
- **Para o plano**: na apresentação, `PUBLIC_BASE_URL` precisa usar o IP da máquina na rede local
  (por exemplo, `http://192.168.0.10:3000`); com o padrão `localhost`, o QR Code não abre no
  celular de quem avalia. A geração do QR Code no servidor provavelmente exige uma dependência
  nova no back-end, a decidir no plano (o Princípio II só restringe o front-end).
- Sem edição de perfil (decisão D5): o certificado e a validação leem o cadastro atual, sem
  cópia dos dados.

## Pendências

- **P-01**: aprovação, pelo mantenedor, da proposta de modelo de dados da 004, da qual dependem
  as várias tentativas por candidato (FR-006, SC-004).

Resolvidas pelo mantenedor em 03/10/2026:

- **Divergências entre as fontes**: mantidas as resoluções desta spec (Assumptions), que
  prevalecem sobre o protótipo e sobre `docs/telas.md` onde os dois diferem.
- **P-02**: a página "Disponível em breve" ganha a variação do histórico (FR-024), com o título
  "O histórico está a caminho" e o texto "O registro completo das suas tentativas, questão por
  questão, chega numa próxima versão do Lunar Celer.", válida até a feature 006 existir. Aplicada
  também em `docs/prototipo/EmBreve.dc.html` (opção "historico") e em `docs/telas.md` (tela 6).
- **P-03**: os textos da nova tentativa (FR-009, FR-021) ficam sem limite de tentativas; mudam
  se a decisão D9 (limite de tentativas, aberta) for tomada.
- **P-04**: decisão D4 resolvida no dossiê, pelo RF11 e pelo RF14: questões expiradas e
  interrompidas contam como erro (FR-001).

## Conformidade com a constituição (versão 3.0.1)

| Princípio | Como esta spec atende | Situação |
|---|---|---|
| I. Servidor é a autoridade | Resultado, aprovação e emissão só no servidor, a partir das respostas (FR-001, FR-004); nada vindo da página entra no cálculo (FR-026). | ✅ |
| II. Front-end sem bibliotecas de terceiros | Kit próprio; QR Code gerado no servidor, sem serviço externo nem biblioteca no front (FR-013). | ✅ |
| III. PostgreSQL com SQL explícito | Sem mudança de esquema própria; código de validação gerado pelo banco (FR-004). | ✅ |
| IV. Dados derivados não são armazenados | Acertos, percentual, nota e aprovação calculados, nunca gravados (FR-001). | ✅ |
| V. Comando único | `PUBLIC_BASE_URL` já existe e tem valor padrão; nada novo de execução. | ✅ |
| VI. LGPD e minimização | Validação só com nome, CPF mascarado, resultado, nota e data; nunca e-mail nem CPF completo (FR-017); páginas fora dos buscadores (FR-019); resultado e certificado só para o dono (FR-025). | ✅ |
| VII. Escopo do site final e ordem de entrega | Feature obrigatória; histórico (006) e flashcards (007) só por "Disponível em breve" ou ocultos (FR-024). | ✅ |
| VIII. Rastreabilidade | Requisitos citam RF16 a RF19, RP08, RNF03, RNF04, as decisões D1, D2 e D4 e as telas. | ✅ |
| IX. Testes das regras críticas | Cálculo de nota e emissão de certificado com testes obrigatórios (FR-028). | ✅ |
| X. Padrões de código | Textos e identificadores de domínio em português. | ✅ |
| XI. Interface fiel e acessível | Telas portadas com o kit, AA, foco, 44 px e teclado (FR-027). | ✅ |
