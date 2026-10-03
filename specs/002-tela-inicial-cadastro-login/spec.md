# Feature Specification: Tela Inicial, Cadastro e Login

**Feature Branch**: `002-tela-inicial-cadastro-login`

**Created**: 2026-10-01

**Revisão**: 2026-10-02, alinhamento à constituição 3.0.0, à identidade visual 2.0, às telas 1 a 6
de `docs/telas.md`, ao protótipo em `docs/prototipo/` e ao kit de interface
(`docs/kit-interface.md`).

**Status**: Draft

**Input**: User description: "Visitantes chegam a uma tela inicial que apresenta a certificação em metodologias ágeis: descrição, objetivos, regras (12 temas, uma questão por tema, 150 segundos por questão, resposta única, aprovação com 65% ou mais, certificado com QR Code) e instruções. A partir dela o visitante pode se cadastrar, entrar, ir para a área de estudos ou validar um certificado. O cadastro pede CPF, nome completo, e-mail, senha e aceite dos termos de uso e privacidade; o CPF identifica o candidato de forma única e deve ser válido. O login é feito exclusivamente com CPF e senha. Depois de entrar, o candidato decide se inicia a certificação agora ou volta depois, podendo estudar antes. Contexto em docs/dossie-sdd-borb.md seção 4.2, requisitos em docs/requisitos-desafio.md e identidade visual em docs/identidade-visual.md."

**Requisitos atendidos**: RF01, RF02, RF03, RF04, RNF01, RNF03, conforme dossiê seções 3 e 8 e
texto integral em `docs/requisitos-desafio.md`; telas 1 a 6 de `docs/telas.md`. A conformidade com
a constituição 3.0.0 está na seção "Conformidade com a constituição", no fim deste documento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conhecer a certificação na tela inicial (Priority: P1)

Um visitante, sem conta e sem login, abre o Lunar Celer e encontra a apresentação da certificação
em metodologias ágeis: o que é, para que serve, como funciona e quais são as regras. Dali ele
escolhe o próximo passo: criar a conta, entrar, estudar ou validar um certificado.

**Why this priority**: é a porta de entrada do portal e o requisito RF01; sem ela o visitante
não entende a certificação nem encontra os demais caminhos.

**Independent Test**: abrir o endereço do portal sem estar logado, em um celular (360 px) e em um
computador, e conferir que as seções aparecem na ordem (nesta feature, sem "Entre e use 100%",
que espera a primeira vantagem da conta), que as seis regras e as instruções estão visíveis em
linguagem direta e que os caminhos levam aos destinos corretos.

**Acceptance Scenarios**:

1. **Given** um visitante sem login, **When** ele abre o portal, **Then** vê, nesta ordem: o
   hero, "O que é Scrum", a trilha dos 12 temas, "Por que estudar aqui funciona", "Entre e use
   100% do Lunar Celer" (só quando existir pelo menos uma vantagem da conta, FR-050), "De onde
   vem este portal", as perguntas frequentes e a chamada final.
2. **Given** o hero, **When** o visitante o lê, **Then** encontra o título "Um aprendizado
   astronômico", o parágrafo com as regras, os botões "Criar minha conta" e "Começar pelos
   estudos" e o bloco "Como funciona" com três passos numerados.
3. **Given** a tela inicial, **When** o visitante lê as regras, **Then** encontra: 12 temas; uma
   questão por tema, sorteada para cada candidato; 150 segundos por questão; resposta única (cada
   tema é respondido uma só vez); aprovação com 65% ou mais de acertos (8 de 12); certificado
   eletrônico com QR Code para validação.
4. **Given** a tela inicial, **When** o visitante lê as instruções, **Then** fica sabendo que
   pode estudar antes de começar, que pode pausar entre um tema e outro e retomar a partir do
   próximo tema pendente, que fechar ou recarregar a página durante uma questão a encerra como
   erro, que, se a conexão cair, o tempo continua contando no servidor e a questão conta como erro
   se a resposta não chegar até o fim do prazo, e que o tempo esgotado também encerra a questão
   como erro, sem nova chance.
5. **Given** a tela inicial, **When** o visitante escolhe "Criar minha conta", "Entrar" ou "Já
   tenho conta" ou "Validar certificado", **Then** é levado ao destino correspondente, e
   destinos ainda não entregues levam à página "Disponível em breve"; **When** ele escolhe
   "Começar pelos estudos", **Then** vai à seção da trilha na própria página enquanto a área de
   estudos não existir, e à área de estudos depois.
6. **Given** a tela inicial aberta em uma tela de celular a partir de 360 px, **When** o
   visitante a percorre, **Then** todo o conteúdo e os caminhos ficam legíveis e acionáveis sem
   rolagem horizontal.
7. **Given** qualquer tela desta feature, **When** o portal está no ar e o banco responde,
   **Then** o rodapé mostra de forma discreta "Portal no ar e banco conectado"; **When** o banco
   falha, **Then** o rodapé mostra a mensagem de instabilidade no lugar.
8. **Given** as perguntas frequentes, **When** o visitante abre cada item (com mouse, toque ou
   teclado), **Then** encontra as respostas sobre estudar antes, pausar, internet caindo durante
   uma questão, refazer a certificação e como alguém confere um certificado.

9. **Given** qualquer tela desta feature, **When** o visitante procura frases que afirmam a
   disponibilidade de um recurso ainda não entregue (por exemplo, "a área de estudos é aberta"),
   **Then** não as encontra; os links para esses recursos levam à página "Disponível em breve".
---

### User Story 2 - Cadastrar-se como candidato (Priority: P1)

O visitante cria sua conta informando CPF, nome completo, e-mail e senha, e aceitando os termos
de uso e privacidade. O CPF é o identificador único do candidato e precisa ser um CPF válido.
O cadastro não inicia a certificação.

**Why this priority**: sem cadastro não há candidato, e sem candidato não há certificação
(RF03); é também o ponto em que o portal passa a tratar dados pessoais (RNF03).

**Independent Test**: cadastrar um CPF válido (com e sem máscara), conferir que a conta foi
criada, que o candidato ficou conectado e que a notificação "Conta criada" apareceu; tentar CPFs
inválidos, um CPF repetido, uma senha longa demais e um cadastro sem aceite dos termos, e
conferir que todos são recusados com mensagens claras.

**Acceptance Scenarios**:

1. **Given** um visitante no formulário de cadastro, **When** ele informa CPF válido, nome
   completo, e-mail válido, senha que atende às regras, a mesma senha na confirmação e aceita
   os termos, **Then** a conta é criada, ele passa a estar conectado, é levado à área do
   candidato e vê a notificação de conta criada, sem que a certificação seja iniciada.
2. **Given** o formulário de cadastro, **When** o CPF é digitado com máscara (000.000.000-00)
   ou só com os 11 dígitos, **Then** os dois formatos são aceitos e tratados como o mesmo CPF.
3. **Given** o formulário de cadastro, **When** o CPF tem dígitos verificadores errados, tem
   todos os dígitos iguais (ex.: 111.111.111-11), tem menos ou mais de 11 dígitos ou contém
   letras, **Then** o cadastro é recusado com a mensagem de CPF inválido.
4. **Given** um CPF já cadastrado, **When** alguém tenta cadastrá-lo de novo, **Then** o
   cadastro é recusado com uma mensagem clara de que o CPF já tem conta, sem revelar nenhum
   outro dado do titular, e com o atalho para entrar.
5. **Given** o formulário de cadastro, **When** o visitante não marca o aceite dos termos,
   **Then** o cadastro não é concluído e ele é avisado de que o aceite é obrigatório.
6. **Given** o formulário de cadastro, **When** o visitante abre os termos de uso e privacidade,
   **Then** lê o texto completo sem perder o que já digitou.
7. **Given** um cadastro recusado por qualquer motivo, **When** a mensagem aparece, **Then** ela
   indica qual campo corrigir, e os campos já preenchidos (exceto as senhas) continuam
   preenchidos.
8. **Given** a tela de cadastro, **When** o visitante a abre, **Then** vê os avisos "Sua Lua
   começa nova" e "Criar a conta não inicia a prova", o formulário e os blocos "Já tem conta?" e
   "Como seus dados são usados", este dizendo que a senha é guardada de forma irreversível: nem
   a equipe do projeto consegue vê-la.
9. **Given** a página de termos de uso e privacidade, **When** o visitante a lê, **Then**
   encontra um índice das seções, a data da última atualização e, em linguagem simples, quem
   somos, quais dados são coletados, para que servem, o que fica público, por quanto tempo são
   guardados, os direitos pela LGPD e o canal de contato privado do projeto.

---

### User Story 3 - Entrar com CPF e senha (Priority: P1)

O candidato já cadastrado entra no portal usando exclusivamente o CPF e a senha. Ao entrar, é
levado à área do candidato. Ele pode sair quando quiser.

**Why this priority**: é o requisito RF04 e a condição para o candidato voltar ao portal e,
nas próximas features, fazer a prova e ver o resultado.

**Independent Test**: entrar com um CPF cadastrado e a senha correta (CPF com e sem máscara);
tentar senha errada, CPF não cadastrado e e-mail no lugar do CPF; sair e conferir que a área do
candidato deixa de estar acessível.

**Acceptance Scenarios**:

1. **Given** um candidato cadastrado, **When** ele informa CPF e senha corretos, **Then** entra
   no portal e é levado à área do candidato.
2. **Given** a tela de login, **When** o CPF não está cadastrado ou a senha está errada,
   **Then** a mensagem é a mesma nos dois casos ("CPF ou senha inválidos"), sem indicar qual
   dos dois falhou.
3. **Given** a tela de login, **When** a pessoa digita um e-mail no lugar do CPF, **Then** o
   login é recusado e ela é orientada a usar o CPF.
4. **Given** um candidato conectado, **When** ele escolhe sair, **Then** a sessão é encerrada, ele
   volta à tela inicial e a área do candidato só volta a ser acessível após novo login.
5. **Given** um candidato conectado há mais de 8 horas, **When** ele tenta usar a área do
   candidato, **Then** é levado ao login com a explicação de que a sessão expirou.
6. **Given** 5 tentativas de login malsucedidas para o mesmo CPF em 15 minutos, **When** alguém
   tenta entrar de novo com esse CPF, **Then** a tentativa é recusada por 15 minutos, mesmo com a
   senha certa, com uma mensagem pedindo para aguardar que é igual para CPF cadastrado ou não.
7. **Given** várias pessoas entrando ao mesmo tempo a partir da mesma rede (por exemplo, a sala
   da apresentação), **When** cada uma usa o seu próprio CPF, **Then** nenhuma é bloqueada pelas
   falhas das outras.
8. **Given** a tela de login, **When** a pessoa a abre, **Then** vê o formulário só com CPF e
   senha (com mostrar e ocultar), o aviso de que não há recuperação de senha nesta versão e os
   blocos "Ainda não tem conta?" e "Quer estudar antes?".

---

### User Story 4 - Decidir entre iniciar agora ou voltar depois (Priority: P2)

Já conectado, o candidato chega à área do candidato, onde vê que sua Lua ainda está nova e
escolhe entre iniciar a certificação agora, estudar antes ou sair e voltar depois. Começar a
certificação é sempre uma ação explícita, nunca consequência automática do cadastro ou do login.

**Why this priority**: atende RF02 e liga esta feature às seguintes (área de estudos e fluxo da
certificação); depende do login (US3), por isso P2.

**Independent Test**: entrar como candidato e conferir o estado "não iniciada" da área do
candidato, os três caminhos, que nenhum deles inicia a certificação sem escolha explícita e que,
ao sair e entrar de novo, o candidato volta à mesma escolha.

**Acceptance Scenarios**:

1. **Given** um candidato recém-cadastrado ou recém-conectado, **When** ele chega à área do
   candidato, **Then** é saudado pelo nome, lê "Sua Lua ainda está nova", vê a Lua sem nenhuma
   parte acesa com a trilha de 12 marcos e "0 de 12 temas concluídos", e encontra três caminhos:
   "Iniciar a certificação", ir para a área de estudos e sair.
2. **Given** a área do candidato, **When** ele escolhe estudar, **Then** é levado à área de
   estudos (ou à página "Disponível em breve" enquanto ela não existir) e pode voltar à área do
   candidato depois.
3. **Given** a área do candidato, **When** ele escolhe iniciar a certificação, **Then** é levado
   ao início do fluxo da certificação, antes do qual uma confirmação lembra as regras principais
   (enquanto o fluxo não existir, à página "Disponível em breve").
4. **Given** um candidato que saiu sem iniciar, **When** ele entra de novo em outro momento,
   **Then** volta à mesma área do candidato, com os mesmos três caminhos.
5. **Given** um candidato conectado, **When** ele abre o cadastro ou o login, **Then** é
   direcionado à área do candidato em vez de ver os formulários; **When** ele abre a tela
   inicial, **Then** consegue lê-la normalmente.
6. **Given** a área do candidato, **When** o candidato usa os links do cabeçalho para
   funcionalidades ainda não entregues (área de estudos, flashcards, perfil), **Then** é levado à
   página "Disponível em breve" correspondente.
7. **Given** a área do candidato, **When** o candidato lê o bloco "Antes de cada questão",
   **Then** fica sabendo que o cronômetro de 150 segundos começa quando a questão aparece e que
   sair da página encerra a questão aberta, e encontra o link "Rever as regras".
8. **Given** a área do candidato nesta feature, **When** o candidato lê o estado "não iniciada",
   **Then** nenhum texto promete começar a certificação agora nem diz que a área de estudos está
   aberta, e o botão "Iniciar a certificação" leva à página "Disponível em breve".

---

### User Story 5 - Explorar a apresentação do Scrum e do portal (Priority: P2)

Na tela inicial, o visitante se aprofunda: descobre empresas que usam Scrum, lê o que é Scrum, vê
a trilha dos 12 temas, entende por que estudar e depois se testar funciona, sabe o que a conta
libera e de onde vem o portal. As abas do cabeçalho levam a essas seções e acompanham a rolagem.

**Why this priority**: dá contexto e credibilidade à certificação, mas o RF01 já fica atendido
pela US1; por isso P2.

**Independent Test**: percorrer as seções 2 a 6 da tela inicial com mouse, toque e só teclado;
conferir os fatos das cinco empresas contra as fontes de `docs/referencias.md`, o conteúdo de
Scrum contra o Scrum Guide 2020 e o comportamento das abas ao rolar.

**Acceptance Scenarios**:

1. **Given** o hero, **When** nenhuma empresa foi escolhida, **Then** o cartão abaixo da Lua em
   rede mostra "Quem usa Scrum."; **When** o visitante passa o mouse, foca ou toca em uma das
   cinco empresas, **Then** o rótulo dela acende e o cartão mostra o fato daquela empresa.
2. **Given** qualquer fato exibido, **When** alguém o confere em `docs/referencias.md`, **Then**
   encontra a URL da fonte, e a fonte sustenta tudo o que a frase afirma.
3. **Given** a seção "O que é Scrum", **When** o visitante a lê e abre os blocos recolhíveis,
   **Then** encontra a definição, os três pilares, as três responsabilidades, os três artefatos
   com seus compromissos e a Sprint com os quatro eventos, tudo fiel ao Scrum Guide 2020.
4. **Given** a trilha, **When** o visitante escolhe um dos 12 corpos celestes, **Then** é levado
   à área de estudos (ou à página "Disponível em breve" enquanto ela não existir).
5. **Given** a seção "Por que estudar aqui funciona", **When** o visitante a lê, **Then** não
   encontra nenhum número de eficácia que não tenha sido medido.
6. **Given** a tela inicial nesta feature, **When** o visitante a percorre, **Then** a seção
   "Entre e use 100% do Lunar Celer" não aparece, porque nenhuma vantagem da conta existe ainda;
   **When** uma feature seguinte entrega a primeira vantagem, **Then** a seção aparece, com os
   botões "Criar minha conta" e "Já tenho conta" e só as vantagens já entregues.
7. **Given** a seção "De onde vem este portal", **When** o visitante a lê, **Then** encontra a
   origem acadêmica, os orientadores, o colaborador e o aviso de que o certificado não substitui
   certificações oficiais de Scrum.
8. **Given** o cabeçalho da tela inicial, **When** o visitante passa o mouse ou o foco pelas abas
   Scrum, Trilha, Método e Sobre, **Then** o cursor desliza até a aba; **When** ele escolhe uma
   aba, **Then** vai à seção correspondente; **When** ele rola a página, **Then** a aba marcada
   acompanha a seção visível, e nenhuma aba está marcada no topo da página.
9. **Given** o sistema configurado para reduzir movimento, **When** o visitante abre a tela
   inicial, **Then** o céu, os rótulos flutuantes, a Lua em rede e o cursor das abas ficam
   parados ou mudam sem animação.

---

### Edge Cases

- CPF digitado com espaços, pontos e hífen fora do lugar (ex.: "123 456 789 09"): só os dígitos
  contam; se forem 11 e válidos, o CPF é aceito.
- CPF válido em formato, mas com dígitos verificadores errados: recusado como inválido.
- CPF com todos os dígitos iguais: recusado, mesmo que passe no cálculo dos dígitos
  verificadores.
- Cadastro enviado duas vezes (duplo clique ou nova tentativa após lentidão): resulta em uma
  única conta; a segunda tentativa recebe a mensagem de CPF já cadastrado.
- Dois visitantes tentando cadastrar o mesmo CPF ao mesmo tempo: apenas um cadastro é criado.
- Nome com acentos, apóstrofo ou hífen (ex.: "Maria D'Ávila Souza-Lima"): aceito e exibido
  exatamente como digitado.
- E-mail já usado por outro candidato: aceito, pois o identificador único é o CPF.
- Senha com espaços ou caracteres especiais: aceita; a senha nunca é ecoada em mensagens,
  telas posteriores ou registros do sistema.
- Senha e confirmação diferentes: cadastro recusado, com a indicação do campo.
- Senha dentro de 64 caracteres, mas com muitos acentos, símbolos ou emojis, que ultrapassa o
  tamanho máximo que o sistema consegue proteger por inteiro: recusada com uma explicação, em
  vez de ter parte dela ignorada em silêncio.
- Várias pessoas na mesma rede errando a senha: cada CPF tem a sua própria contagem; as falhas
  de uma pessoa não bloqueiam as outras.
- Tentativas repetidas com um CPF que não existe: contam e bloqueiam como as de um CPF
  cadastrado, com a mesma mensagem, para não revelar quais CPFs têm conta.
- Login com o CPF digitado com máscara e cadastro feito sem máscara (ou o contrário):
  reconhecido como o mesmo CPF.
- Portal sem conexão com o banco no momento do cadastro ou do login: mensagem amigável de
  indisponibilidade temporária, sem perder o que foi digitado (exceto senhas) e sem criar
  cadastro pela metade; o rodapé mostra a mensagem de instabilidade.
- Sessão expirada no meio da navegação: ao agir, o candidato é levado ao login e, depois de
  entrar, volta à área do candidato.
- Visitante acessa diretamente o endereço da área do candidato sem estar conectado: é levado
  ao login.
- Visitante sem sessão, na página "Disponível em breve", escolhe "Voltar para a área do
  candidato": é levado ao login.
- Candidato conectado na tela inicial escolhe "Entrar" ou "Criar minha conta": é levado à área
  do candidato, sem ver os formulários.
- Destinos ainda não entregues (área de estudos e página do tema da 003, fluxo da certificação
  da 004, validação de certificado da 005, flashcards e perfil da 007): o caminho existe e leva à
  página "Disponível em breve" com o texto daquela funcionalidade.
- Feature seguinte entregue: os textos e links que dependiam do recurso dela (FR-050) passam a
  aparecer, e o destino provisório dela some.
- Navegador sem JavaScript ou sem suporte a desenho em canvas: a Lua em rede aparece como imagem
  estática, e o conteúdo da tela inicial continua legível.
- Navegador sem acesso à internet (só à rede local do portal): todas as telas carregam com as
  fontes, imagens e estilos completos.
- Carga de conteúdo do banco diferente de 12 temas, 48 questões e 192 alternativas: o rodapé
  sinaliza a carga incompleta no mesmo padrão discreto de falha (FR-013 da 001).

## Requirements *(mandatory)*

### Functional Requirements

**Tela inicial (RF01, tela 1)**

- **FR-001**: A tela inicial MUST ser acessível a qualquer pessoa, com ou sem login, e apresentar,
  nesta ordem, as oito seções da tela 1 de `docs/telas.md`: (1) hero; (2) O que é Scrum; (3) A
  trilha; (4) Por que estudar aqui funciona; (5) Entre e use 100% do Lunar Celer; (6) De onde vem
  este portal; (7) Perguntas frequentes; (8) Chamada final. A seção 5 segue o FR-050 e fica
  oculta nesta feature. Juntas, elas apresentam a descrição da certificação, seus objetivos, as
  regras e as instruções para realizar a avaliação (RF01).
- **FR-002**: As regras MUST incluir, no mínimo: 12 temas; uma questão por tema, sorteada para
  cada candidato; 150 segundos por questão; resposta única (cada tema é respondido uma só
  vez); aprovação com 65% ou mais de acertos (8 de 12); certificado eletrônico com QR Code para
  validação pública. Elas MUST aparecer no hero (parágrafo e "Como funciona"), mesmo onde o texto
  do protótipo não traz todas.
- **FR-003**: As instruções MUST explicar, no hero e nas perguntas frequentes, que o candidato
  pode estudar antes de começar, pode pausar entre um tema e outro e retomar a partir do próximo
  tema pendente, que fechar ou recarregar a página durante uma questão a encerra como erro, que,
  se a conexão cair, o tempo continua contando no servidor e a questão conta como erro se a
  resposta não chegar até o fim do prazo, e que o tempo esgotado também encerra a questão como
  erro, sem nova chance (RF11, RF13, RF14; decisão D6).
- **FR-004**: A tela inicial MUST oferecer os caminhos: criar conta ("Criar minha conta"),
  entrar ("Entrar" e "Já tenho conta"), ir para a área de estudos (cada corpo da trilha e
  "Aprofundar em Terra · Introdução ao Scrum") e validar um certificado (link do rodapé). Todo
  botão "Começar pelos estudos" (hero, "Por que estudar aqui funciona" e chamada final) MUST
  levar à seção da trilha na própria página enquanto a área de estudos (feature 003) não existir,
  e à área de estudos depois. Os demais destinos ainda não entregues seguem o FR-024.
- **FR-004a**: Todas as telas desta feature MUST ter o rodapé de `docs/telas.md`: o estado do
  portal de forma discreta ("Portal no ar e banco conectado"), "Projeto acadêmico da Fatec
  Jacareí" e os links "Termos de uso e privacidade" e "Validar certificado". Quando o banco
  falhar, o estado MUST dar lugar à mensagem de instabilidade no estilo de falha do kit (classe
  `lc-status--falha`, "Instabilidade no portal. Tente de novo em alguns minutos."). A sinalização
  de carga incompleta do FR-013 da feature 001 MUST continuar existindo, no mesmo estilo
  discreto de falha.
- **FR-004b**: As regras e instruções da certificação (12 temas, uma questão por tema, 150
  segundos por questão, resposta única, aprovação com 65% ou mais, interrupção encerra a
  questão) MUST ser exibidas em linguagem direta, sem metáfora astronômica, em todos os lugares
  onde aparecem (tela inicial, confirmação de início e demais telas). O tema visual pode
  aparecer em rótulos de ação e na decoração, conforme `docs/identidade-visual.md`, mas MUST NOT
  substituir termos ágeis nem o enunciado de uma regra.
- **FR-031**: O hero MUST trazer, à esquerda, o título "Um aprendizado astronômico", o parágrafo
  com as regras, os botões "Criar minha conta" (principal) e "Começar pelos estudos" e o bloco
  "Como funciona" com três passos numerados (Estude os 12 temas, Responda dentro do tempo,
  Alcance 65% de acertos); à direita, a Lua em rede com cinco rótulos de vidro (Google,
  Salesforce, Spotify, Saab e Adobe) e, abaixo dela, o cartão de fato, que mostra "Quem usa
  Scrum." até a pessoa interagir. Passar o mouse, focar ou tocar em um rótulo MUST acendê-lo e
  mostrar no cartão o fato daquela empresa; os rótulos MUST ser acionáveis por teclado.
- **FR-032**: A Lua em rede MUST girar de forma lenta e contínua, MUST pausar quando a aba do
  navegador estiver oculta ou quando ela sair da tela, MUST ficar parada quando o usuário pedir
  menos movimento e MUST aparecer como imagem estática quando não houver JavaScript ou suporte a
  desenho. Ela é decorativa: não carrega informação que não esteja também em texto.
- **FR-033**: Os fatos das empresas MUST afirmar só o que suas fontes sustentam, com o texto da
  seção 9 de `docs/identidade-visual.md` (que prevalece sobre o texto do protótipo), e as
  empresas MUST aparecer só pelo nome, em texto, nunca com logotipo.
- **FR-034**: Cada um dos cinco fatos (Google, Salesforce, Spotify, Saab e Adobe) MUST ter a URL
  da sua fonte registrada em `docs/referencias.md`, com a frase exibida, a fonte citada na
  identidade visual, a URL e a data de acesso. Cada fonte MUST ser pesquisada e conferida: a URL
  abre e o conteúdo sustenta a frase inteira. Um fato que a fonte encontrada não sustenta por
  inteiro MUST ser reescrito até caber nela; se nenhuma fonte for encontrada, o fato MUST sair da
  página e a troca da empresa MUST ser levada ao mantenedor.
- **FR-035**: A seção "O que é Scrum" MUST trazer a definição em uma frase (framework leve,
  ciclos curtos chamados Sprints, de no máximo um mês), os três pilares do empirismo, blocos
  recolhíveis com as três responsabilidades e com os três artefatos e seus compromissos, a Sprint
  desenhada como órbita com os quatro eventos que ela contém numerados (Sprint Planning, Daily
  Scrum, Sprint Review e Sprint Retrospective) e o link "Aprofundar em Terra · Introdução ao
  Scrum". Todo o conteúdo MUST ser fiel ao Scrum Guide 2020, com os termos usados no guia.
- **FR-036**: A trilha MUST mostrar os 12 corpos celestes na ordem de `docs/identidade-visual.md`,
  seção 7, com tamanho relativo e o nome no formato "Corpo · Tema", cada um levando à área de
  estudos.
- **FR-037**: A seção "Por que estudar aqui funciona" MUST seguir a grade em bento da tela 1: um
  bloco largo com o princípio "Estudar e depois se testar" (efeito de testagem), a ilustração do
  ciclo Estudar e Responder em volta da Lua e o botão "Começar pelos estudos", e três blocos
  menores (correção na hora, situações reais, progresso visível). A seção MUST NOT apresentar
  números de eficácia que não tenham sido medidos.
- **FR-038**: A seção "Entre e use 100% do Lunar Celer" MUST ficar oculta até existir pelo menos
  uma vantagem da conta (FR-050). Quando aparecer, MUST convidar a criar conta, oferecer os
  botões "Criar minha conta" e "Já tenho conta" e listar só as vantagens que já existem: a
  certificação entra com a feature 004; flashcards, evolução por tema e conquistas entram com a
  feature 007. A frase de que a área de estudos é aberta entra com a feature 003. Nesta feature,
  a seção não aparece.
- **FR-039**: A seção "De onde vem este portal" MUST trazer a origem acadêmica (ABP do 1º
  semestre de DSM da Fatec Jacareí, Centro Paula Souza), o problema que motivou o projeto, o
  aviso de que o certificado não substitui certificações oficiais de Scrum e a ficha com
  instituição, curso, programa, orientação (Prof. Antonio Egydio, Prof. Marcelo Sudo e Prof.
  Arley Souza), colaboradores (Pedro Lucas) e tecnologias (HTML, CSS e JavaScript, Node.js,
  PostgreSQL, Docker e Scrum; Figma só entra quando o protótipo existir no Figma).
- **FR-040**: As perguntas frequentes MUST ser itens recolhíveis sobre: estudar antes, pausar,
  internet caindo durante uma questão, refazer a certificação e como conferir um certificado. A
  resposta sobre a internet MUST ser "O tempo continua contando no servidor: se a resposta não
  chegar até o fim do prazo, a questão conta como erro. Já fechar ou recarregar a página encerra a
  questão na hora, e o histórico registra o horário. Os temas já respondidos continuam salvos."
  (decisão D6; texto do mantenedor de 03/10/2026, com o aviso de interrupção da spec 004). A resposta sobre refazer MUST ser "Sim, se você não for aprovado. Uma nova
  tentativa fica disponível 24 horas depois do fim da anterior, com as questões sorteadas de novo,
  dando preferência às que você ainda não viu." (decisão D1).
- **FR-041**: A chamada final MUST trazer "Sua jornada começa em Mercúrio", o texto de apoio e os
  botões "Criar minha conta" e "Começar pelos estudos".
- **FR-042**: O cabeçalho da tela inicial MUST ter, à direita, as abas deslizantes Scrum, Trilha,
  Método e Sobre (que levam às seções 2, 3, 4 e 6) e o botão "Entrar". O cursor das abas MUST
  deslizar até a aba sob o mouse ou o foco; nenhuma aba começa marcada; ao rolar, a aba marcada
  MUST acompanhar a seção visível, e essa marcação MUST ser anunciada como a localização atual
  para tecnologias assistivas.

**Cadastro (RF03, RNF03, tela 2)**

- **FR-005**: O cadastro MUST pedir CPF, nome completo, e-mail, senha, confirmação da senha e
  aceite dos termos de uso e privacidade, e nenhum outro dado pessoal (Princípio VI).
- **FR-006**: O CPF MUST ser aceito com ou sem máscara, considerado apenas pelos seus 11 dígitos
  e validado pelos dois dígitos verificadores; CPFs com todos os dígitos iguais MUST ser
  recusados.
- **FR-007**: O CPF MUST identificar o candidato de forma única: uma tentativa de cadastro com
  CPF já existente MUST ser recusada com mensagem clara que não revele nenhum outro dado do
  titular.
- **FR-008**: O nome completo MUST ter pelo menos nome e sobrenome, até 150 caracteres, e
  aceitar letras acentuadas, espaços, apóstrofo e hífen.
- **FR-009**: O e-mail MUST ter formato válido, até 254 caracteres; e-mails repetidos entre
  candidatos são permitidos.
- **FR-010**: A senha MUST ter entre 8 e 64 caracteres, MUST ser igual à confirmação e MUST ser
  guardada apenas de forma protegida e irreversível, nunca legível nem registrada em logs
  (RNF03, Princípio VI).
- **FR-011**: O cadastro MUST exigir o aceite explícito dos termos de uso e privacidade e
  registrar a data e a hora do aceite (Princípio VI).
- **FR-012**: Os termos de uso e privacidade MUST estar em uma página própria (tela 5), acessível
  sem login a partir do cadastro e do rodapé, com índice lateral, a data da última atualização no
  topo e, em linguagem simples, as seções: quem somos; quais dados são coletados (no cadastro:
  CPF, nome completo, e-mail, senha e data e hora do aceite; durante a certificação: tema,
  questão sorteada, alternativa escolhida, alternativa correta e data e hora de cada resposta);
  para que servem (identificar o candidato, compor o certificado, formar o histórico e calcular
  a nota), incluindo que o endereço de rede é usado só no momento do acesso para limitar
  tentativas, sem ser gravado; o que fica público (nome, CPF mascarado, resultado e data na
  validação; o e-mail nunca); por quanto tempo os dados são guardados ("os dados ficam guardados
  enquanto a conta existir; a exclusão pode ser pedida a qualquer momento e é atendida em até 15
  dias; ao fim do projeto acadêmico, a base é apagada"); os direitos pela LGPD (acesso, correção
  e exclusão da conta); e o contato. O contato MUST ser o e-mail exclusivo do projeto (pendência
  P-01) e MUST NOT ser as issues públicas do repositório nem outro canal público (Princípio
  VI).
- **FR-012a**: Os termos MUST NOT ser publicados com marcadores pendentes. Enquanto o e-mail
  exclusivo do projeto (pendência P-01) não existir, a página de termos fica bloqueada para
  publicação e nenhum endereço pode ser inventado para preenchê-la; como o cadastro exige o
  aceite dos termos (FR-011), a feature não pode ser entregue antes disso.
- **FR-013**: Concluído o cadastro, o candidato MUST ficar conectado e ser levado à área do
  candidato; o cadastro MUST NOT iniciar a certificação (RF02).
- **FR-014**: Mensagens de recusa MUST indicar o campo a corrigir e preservar os campos já
  preenchidos, exceto senha e confirmação.
- **FR-043**: A tela de cadastro MUST seguir a grade em bento da tela 2: no bloco largo, à
  esquerda, a Lua nova apagada, o título "Criar conta" e os avisos "Sua Lua começa nova" e
  "Criar a conta não inicia a prova"; à direita, o formulário com CPF (com ou sem pontuação,
  teclado numérico), nome completo ("do jeito que deve aparecer no certificado"), e-mail, senha
  e confirmação lado a lado com botão de mostrar e ocultar, e o aceite obrigatório dos termos com
  link; nos blocos menores, "Já tem conta?" e "Como seus dados são usados". A tela MUST ter os
  estados: normal; erros por campo; CPF já cadastrado (sem revelar dados do titular, com atalho
  para Entrar); senha longa demais para ser protegida por inteiro.
- **FR-044**: Ao concluir o cadastro, além de levar o candidato à área do candidato, o portal
  MUST confirmar a criação da conta com uma notificação de sucesso do kit
  (`LunarCeler.notificar`, título "Conta criada"); as notificações são infraestrutura do kit,
  entregue nesta feature (`docs/telas.md`, item 21). A notificação MUST NOT ser o único sinal: a
  própria área do candidato, com a saudação pelo nome, confirma que a conta existe.
- **FR-045**: Os textos que falam da senha (bloco "Como seus dados são usados" e termos) MUST
  dizer que ela é guardada de forma irreversível: nem a equipe do projeto consegue vê-la.

**Login e sessão (RF04, tela 3)**

- **FR-015**: O login MUST aceitar exclusivamente CPF (com ou sem máscara) e senha; tentativas
  com e-mail ou qualquer outro identificador MUST ser recusadas com orientação para usar o CPF.
- **FR-016**: CPF não cadastrado e senha errada MUST gerar a mesma mensagem genérica ("CPF ou
  senha inválidos"), sem indicar qual dos dois falhou.
- **FR-017**: Falhas de login MUST ser contadas por CPF: após 5 tentativas malsucedidas para o
  mesmo CPF em 15 minutos, novas tentativas para esse CPF MUST ser recusadas por 15 minutos,
  inclusive com a senha correta. A contagem vale para qualquer CPF digitado, cadastrado ou não,
  e a mensagem de bloqueio MUST ser a mesma nos dois casos, sem revelar se o CPF existe; um
  login bem-sucedido zera a contagem daquele CPF.
- **FR-017a**: Por endereço de rede, MUST existir apenas um limite folgado contra abuso em massa,
  tanto no login quanto no cadastro: da ordem de 60 tentativas **malsucedidas** por minuto em
  cada um, sem contar as bem-sucedidas, para não bloquear várias pessoas legítimas entrando ou se
  cadastrando a partir da mesma rede, como na sala da apresentação.
- **FR-018**: A sessão do candidato MUST durar até 8 horas; depois disso, ou após sair, o acesso
  à área do candidato MUST exigir novo login.
- **FR-019**: O candidato conectado MUST poder sair a qualquer momento, encerrando a sessão.
- **FR-020**: A identidade do candidato conectado MUST ser determinada pelo servidor a cada
  acesso; nenhum dado enviado pelo navegador pode, sozinho, fazer alguém passar por outro
  candidato (Princípio I).
- **FR-046**: A tela de login MUST seguir a grade em bento da tela 3: formulário só com CPF e
  senha (com mostrar e ocultar), o aviso de que não há recuperação de senha nesta versão e os
  blocos menores "Ainda não tem conta?" e "Quer estudar antes?". A tela MUST ter os estados:
  normal; erro genérico ("CPF ou senha inválidos"); bloqueio por excesso de tentativas, sem
  revelar se o CPF existe; tentativa com e-mail ("O login é feito com o CPF cadastrado"); sessão
  expirada.

**Área do candidato (RF02, tela 4)**

- **FR-021**: A área do candidato MUST exigir login e seguir a tela 4: no bloco largo, a
  saudação pelo nome, título e texto conforme a situação e, à direita, a Lua grande com a trilha
  de 12 marcos; nos blocos menores, "Estudar antes" (com o caminho para a área de estudos) e
  "Antes de cada questão" (o cronômetro de 150 segundos começa quando a questão aparece; sair da
  página encerra a questão aberta; link "Rever as regras", que leva às regras da tela inicial).
  Ela MUST oferecer três caminhos: iniciar a certificação, estudar antes e sair para voltar
  depois (RF02).
- **FR-022**: Iniciar a certificação MUST ser sempre uma ação explícita do candidato, precedida
  de uma confirmação que lembre as regras principais; nem o cadastro nem o login iniciam a
  certificação.
- **FR-023**: Candidato conectado que abrir o cadastro ou o login MUST ser direcionado à área do
  candidato; a tela inicial continua acessível a ele, para que o link "Rever as regras"
  funcione. Visitante não conectado que abrir a área do candidato MUST ser direcionado ao login.
- **FR-024**: Enquanto um destino não for entregue, o caminho para ele MUST existir e levar à
  página "Disponível em breve" (tela 6): ilustração de eclipse, título e texto conforme a
  funcionalidade, e os botões "Voltar para a área do candidato" e "Ir para o início". Os textos
  existem para área de estudos (003), certificação (004) e validação (005), e, para os links do
  cabeçalho logado, flashcards e perfil (007): título "Os flashcards estão a caminho" e texto "A
  revisão dos 12 temas com cartões de pergunta e resposta chega numa próxima versão do Lunar
  Celer."; título "O perfil está a caminho" e texto "Sua evolução nos estudos e as suas
  conquistas chegam numa próxima versão do Lunar Celer." (textos de flashcards e perfil definidos
  pelo mantenedor em 03/10/2026). Cada feature, ao ser entregue, substitui o seu destino
  provisório; a página some quando o último deles for substituído. Esses links são a
  exceção da regra de disponibilidade (FR-050): continuam visíveis porque levam a esta página,
  que diz que o recurso está a caminho.
- **FR-047**: A área do candidato tem cinco estados: não iniciada, em andamento, aprovada,
  reprovada e nova tentativa disponível (decisão D1). Nesta feature, MUST aparecer só o estado
  "não iniciada": título "Sua Lua ainda está nova", botão "Iniciar a certificação", aviso de que a
  primeira questão começa só depois de confirmar, Lua sem nenhuma parte acesa e "0 de 12 temas
  concluídos". Os estados "em andamento" e "nova tentativa disponível" (feature 004) e "aprovada"
  e "reprovada" (feature 005) só passam a aparecer quando essas features existirem, e esta
  feature MUST NOT simulá-los. A Lua acende 1/12 por tema concluído, nunca por acerto, e esse
  progresso é calculado, não armazenado (Princípio IV).

**Experiência, identidade visual e acessibilidade (RNF01, Princípios II e XI)**

- **FR-025**: Todas as telas desta feature (inicial, cadastro, login, termos, área do candidato
  e "Disponível em breve") MUST ser projetadas primeiro para celular e funcionar a partir de 360
  px de largura, sem rolagem horizontal (RNF01, Princípio II).
- **FR-026**: Toda a interface desta feature MUST usar o kit de interface em `app/public/kit`
  (`docs/kit-interface.md`) e portar, sem redesenhar, as telas Main, Cadastro, Entrar,
  AreaCandidato, Termos e EmBreve de `docs/prototipo/`: layout, textos e estilos vêm do
  protótipo, convertidos para as classes e os tokens do kit, sem bibliotecas de terceiros nem
  JavaScript inline (Princípio II). Onde o protótipo divergir de `docs/identidade-visual.md`,
  vale a identidade visual (Princípio XI), por exemplo: cinza `#8A8A93` em todo texto abaixo de
  18 px, Inter só nos pesos 300, 400 e 500 e os textos dos fatos da seção 9.
- **FR-027**: As telas MUST atender ao contraste mínimo AA em todo texto (o cinza `#71717A` do
  protótipo só em elementos decorativos), ter foco visível em âmbar em todos os elementos
  acionáveis, ter alvos de toque de pelo menos 44 px (incluindo abas, botão de mostrar senha e
  botão de fechar notificação), ser utilizáveis só com teclado, ter rótulos visíveis nos campos e
  mensagens de erro ligadas ao campo, ter texto alternativo em toda imagem informativa (as
  decorativas ficam ocultas para leitores de tela) e respeitar o pedido de menos movimento em
  toda animação (Princípio XI).
- **FR-028**: O portal MUST funcionar sem acesso à internet durante a apresentação: nenhuma tela
  desta feature pode carregar fontes, imagens, estilos ou scripts de outro domínio ou de CDN
  (Princípio II).
- **FR-048**: O portal MUST se apresentar como Lunar Celer: a marca (círculo com Lua crescente e
  o nome) abre o cabeçalho de todas as telas, e o título de cada página termina em "· Lunar
  Celer". O cabeçalho público MUST ter "Voltar ao início" nas páginas internas e, na tela
  inicial, as abas e o botão "Entrar" (FR-042). O cabeçalho logado MUST ter a marca (que leva à
  área do candidato) e os links "Área de estudos", "Flashcards", o nome do candidato (que leva ao
  perfil) e o botão "Sair", que encerra a sessão e leva à tela inicial.
- **FR-049**: Todas as telas desta feature MUST ter ao fundo o céu estrelado animado da
  identidade visual, que nunca recebe clique e fica parado quando o usuário pede menos
  movimento.

**Disponibilidade (regra geral, vale para todas as features)**

- **FR-050**: O portal pode descrever qualquer funcionalidade a qualquer momento, mas textos que
  afirmam disponibilidade (por exemplo, "a área de estudos é aberta" ou "com uma conta você
  tem...") e links que levam direto a um recurso MUST aparecer só quando o recurso existe. A
  exceção são os links para destinos ainda não entregues que levam à página "Disponível em
  breve" (FR-024). Cada feature, ao entregar um recurso, passa a exibir os textos e links que
  dependem dele. Nesta feature, os trechos do protótipo abaixo ficam ocultos até a feature
  indicada:

  | Tela | Trecho oculto | Aparece com |
  |---|---|---|
  | Tela inicial | Seção "Entre e use 100% do Lunar Celer" inteira | primeira vantagem da conta (certificação, 004) |
  | Tela inicial, perguntas frequentes | "A área de estudos é aberta", na resposta de "Preciso estudar antes de começar?" | 003 |
  | Cadastro | "depois do cadastro, você escolhe se começa agora ou estuda antes", depois de "Criar a conta não inicia a prova" | 004 |
  | Cadastro, bloco "Já tem conta?" | "e continue de onde parou" | 004 |
  | Entrar | "Depois de entrar, você decide se começa a certificação agora ou volta para estudar." | 004 |
  | Entrar, bloco "Quer estudar antes?" | "A área de estudos é aberta, sem login" | 003 |
  | Área do candidato, estado "não iniciada" | "Você pode começar a certificação agora ou estudar antes e voltar depois." e o aviso "A primeira questão [...] aparece assim que você confirmar." | 004 |
  | Área do candidato, bloco "Estudar antes" | "e fica aberta a qualquer momento" | 003 |

**Operação (Princípio V)**

- **FR-029**: O portal MUST continuar subindo com um único comando a partir de um clone limpo,
  sem criar arquivos de configuração à mão; nenhum segredo usado para proteger as sessões pode
  estar versionado no repositório nem ter um valor padrão conhecido (pendência P1 da feature
  001).
- **FR-030**: Falha de comunicação com o banco durante cadastro ou login MUST resultar em
  mensagem amigável de indisponibilidade temporária, sem cadastro parcial e sem expor detalhes
  técnicos.

### Key Entities *(include if feature involves data)*

- **Candidato**: pessoa cadastrada no portal. Tem CPF (11 dígitos, único), nome completo, e-mail,
  senha protegida, data e hora do cadastro e data e hora do aceite dos termos. Já existe no
  esquema oficial; esta feature passa a preenchê-lo.
- **Sessão do candidato**: estado de "conectado" de um candidato, com início e validade de até 8
  horas; termina ao sair ou ao expirar. Não guarda dados pessoais além da identificação do
  candidato.
- **Termos de uso e privacidade**: texto público e estático, com data da última atualização,
  cujo aceite é registrado no candidato.
- **Referência de fato**: registro em `docs/referencias.md` de cada fato exibido sobre uma
  empresa: frase, fonte, URL e data de acesso. É documentação do projeto, não dado do banco.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um visitante encontra, na tela inicial e sem login, as seis regras da
  certificação e as instruções; em teste com 5 pessoas que não conhecem o portal, todas
  respondem corretamente, após até 2 minutos de leitura, quanto tempo há por questão e qual o
  percentual mínimo para aprovação (teste com pessoas medido após a entrega; antes dela, a
  presença das regras e instruções é conferida no cenário 1 do quickstart).
- **SC-002**: Um visitante conclui o cadastro em até 2 minutos, do clique em "Criar minha conta"
  até a área do candidato.
- **SC-003**: Um candidato cadastrado entra no portal em até 30 segundos.
- **SC-004**: 100% de um conjunto de teste com CPFs válidos (com e sem máscara) é aceito, e 100%
  dos inválidos (dígitos verificadores errados, dígitos todos iguais, tamanho errado, letras) é
  recusado.
- **SC-005**: Em 100% das tentativas de login malsucedidas, a mensagem é idêntica para CPF não
  cadastrado e senha errada, e a mensagem de bloqueio é idêntica para CPF cadastrado e não
  cadastrado.
- **SC-006**: 0 senhas legíveis armazenadas ou registradas em logs, conferido em inspeção do
  banco e dos registros após uma rodada de testes de cadastro e login.
- **SC-007**: Todas as telas desta feature ficam utilizáveis, sem rolagem horizontal, de 360 px a
  1920 px de largura, e passam na verificação de contraste AA.
- **SC-008**: O portal continua subindo com um único comando a partir de um clone limpo, e o
  fluxo cadastro → área do candidato → sair → entrar funciona logo na primeira subida, sem
  nenhum passo manual de configuração.
- **SC-009**: Pelo menos 30 pessoas conseguem entrar no mesmo minuto a partir da mesma rede sem
  nenhum bloqueio, enquanto um mesmo CPF fica bloqueado na 6ª tentativa errada dentro de 15
  minutos.
- **SC-010**: Em revisão das telas desta feature, 100% das regras e instruções aparecem com os
  termos ágeis e os números oficiais (12 temas, 150 segundos, 65%), sem nenhuma metáfora
  astronômica no enunciado.
- **SC-011**: Os 5 fatos sobre empresas têm fonte registrada em `docs/referencias.md` com URL que
  abre, e, em conferência frase a frase contra cada fonte, 0 frases afirmam mais do que a fonte
  sustenta.
- **SC-012**: Em revisão lado a lado das 6 telas com o protótipo e com `docs/telas.md`, 100% das
  seções, textos e estados das telas 1 a 6 estão presentes (exceto os estados da área do
  candidato que dependem das features 004 e 005 e dos trechos ocultos pelo FR-050), e toda
  diferença visual em relação ao protótipo é uma correção prevista em
  `docs/identidade-visual.md`.
- **SC-013**: Navegando só com teclado, 100% dos elementos acionáveis das 6 telas são alcançados
  com foco visível; 100% dos alvos de toque medem pelo menos 44 px; com a redução de movimento
  ativada, 0 animações ficam em execução.
- **SC-014**: Com a máquina sem acesso à internet, as 6 telas carregam por completo, com fontes e
  imagens, e 0 requisições saem para outros domínios.
- **SC-015**: Em conferência da seção "O que é Scrum" contra o Scrum Guide 2020, 0 divergências
  de definição ou de termo.
- **SC-016**: Em revisão das 6 telas, 0 textos afirmam a disponibilidade de um recurso que ainda
  não existe e 0 links levam direto a ele; todo link para recurso ainda não entregue leva à
  página "Disponível em breve".

## Assumptions

- O texto das telas vem do protótipo e de `docs/telas.md`, escrito pela equipe do projeto com
  base no documento do desafio e no Scrum Guide 2020; não há revisão jurídica dos termos no
  escopo acadêmico. Pedidos sobre os dados pessoais (acesso, correção ou exclusão) são atendidos
  fora do sistema, pelo e-mail exclusivo do projeto, ainda a criar (pendência P-01).
- Não há edição de perfil (decisão D5 do dossiê: o certificado lê do cadastro) nem recuperação
  de senha (fora do escopo, Princípio VII). O link do nome do candidato para o perfil leva à
  página "Disponível em breve" até a feature 007.
- Decisão D1 (03/10/2026): o candidato reprovado pode fazer uma nova tentativa 24 horas depois da
  conclusão da anterior; quem é aprovado não refaz. A resposta da pergunta frequente sobre refazer
  segue essa decisão (FR-040).
- Decisão D6 (03/10/2026): leitura literal do RF14; fechar ou recarregar a página durante uma
  questão a encerra como erro, e a perda de conexão segue o texto adotado na spec 004. Por isso as
  instruções e a pergunta frequente avisam isso explicitamente (FR-003, FR-040). Com o aviso de
  interrupção da 004 (FR-010), o encerramento acontece no momento em que a página é fechada ou
  recarregada e fica registrado no histórico (spec 006), o que a pergunta frequente passa a dizer.
- A área de estudos não exige login (decisão D8).
- Os 12 temas e seus corpos celestes seguem `docs/identidade-visual.md`, seção 7, com a lista
  confirmada pela decisão D3 (03/10/2026).
- Os padrões do dossiê seção 4.2 são adotados: senha com no mínimo 8 caracteres, sessão de 8
  horas, mensagem de login genérica. O limite de tentativas do dossiê (5 por minuto por IP)
  foi substituído, por decisão do mantenedor, pela contagem por CPF (5 falhas em 15 minutos,
  bloqueio de 15 minutos) mais um limite folgado por endereço de rede (cerca de 60
  tentativas malsucedidas por minuto, no login e no cadastro), para não bloquear a sala
  inteira durante a apresentação. O limite de 64 caracteres na senha é um padrão desta spec
  para evitar entradas abusivas.
- O campo de confirmação da senha é um padrão de usabilidade; ele não é armazenado.
- O kit de interface (`app/public/kit`, versão 1.1) já existe e é a base de estilos e
  componentes desta feature e das seguintes; esta feature não cria outra base de estilos. A
  página de estado da feature 001 dá lugar à tela inicial, que mantém o estado do portal no
  rodapé (FR-004a); o quickstart e o README da 001 serão ajustados no plano desta feature.
- O protótipo é a referência de layout e texto, mas não de comportamento: os dados dele são
  fictícios, e os eventos no HTML viram código em arquivos próprios (`docs/prototipo/LEIAME.md`).
- Divergências entre as fontes resolvidas nesta spec: a ordem das seções segue `docs/telas.md`
  (o protótipo põe as perguntas frequentes antes de "Entre e use 100%"); "Começar pelos
  estudos" leva à trilha na própria página até a feature 003 e depois à área de estudos (decisão
  do mantenedor); o link "Rever as regras" leva às regras do hero (o protótipo aponta para uma
  âncora que não existe); a tela inicial deixa de redirecionar o candidato conectado (FR-023),
  para que esse link funcione.
- O ambiente-alvo continua sendo a execução local definida na feature 001; publicação em
  servidor com HTTPS está fora do escopo, mas nada nesta feature deve impedi-la.

## Pendências

- **P-01 (bloqueia a entrega da feature)**: e-mail exclusivo do projeto para pedidos sobre dados
  pessoais (Princípio VI), ainda a ser criado pelo mantenedor. Não usar as issues do repositório
  nem inventar endereço. Sem ele, os termos não são publicados e, como o cadastro exige o aceite
  (FR-011), a feature não pode ser entregue (FR-012a).
- **P-09 (para a feature 007)**: a spec da 007 deve atualizar os termos (FR-012) com as revisões
  de flashcards e a evolução entre os dados coletados (Princípio VI); registrada também nas
  pendências de `docs/telas.md`.

## Conformidade com a constituição (versão 3.0.1)

| Princípio | Como esta spec atende | Situação |
|---|---|---|
| I. Servidor é a autoridade | A identidade do candidato é determinada pelo servidor a cada acesso (FR-020); a validação de CPF, senha e aceite é do servidor. | ✅ |
| II. Front-end sem bibliotecas de terceiros | Kit próprio em CSS e JavaScript puros, sem JavaScript inline (FR-026); nada de CDN (FR-028); mobile-first a partir de 360 px (FR-025). | ✅ |
| III. PostgreSQL com SQL explícito | Cadastro e login usam o esquema oficial existente; nenhum requisito pede ORM ou mudança de esquema. | ✅ |
| IV. Dados derivados não são armazenados | A Lua e a trilha da área do candidato são calculadas, nunca gravadas (FR-047). | ✅ |
| V. Comando único | O portal continua subindo com um só comando e sem segredo versionado (FR-029, SC-008). | ✅ |
| VI. LGPD e minimização | Só CPF, nome, e-mail e senha no cadastro (FR-005); senha protegida e irreversível (FR-010, FR-045); aceite registrado (FR-011); CPF mascarado e e-mail nunca na validação, conforme os termos (FR-012); contato privado, nunca issues públicas (FR-012, FR-012a). | ⚠ P-01 em aberto: bloqueia a entrega |
| VII. Escopo do site final e ordem de entrega | Primeira das features obrigatórias (002 a 006). Os caminhos para 003 a 005 e para os complementos da 007 levam à página "Disponível em breve" (FR-024), sem implementar nada deles; textos e links que afirmam disponibilidade só aparecem com o recurso (FR-050), e "Entre e use 100%" fica oculta até a primeira vantagem (FR-038). As notificações (FR-044) são infraestrutura do kit entregue nesta feature, não complemento (`docs/telas.md`, item 21). | ✅ |
| VIII. Rastreabilidade | Requisitos citam RF, RNF e as telas de `docs/telas.md`. | ✅ |
| IX. Testes das regras críticas | Nenhuma das regras críticas (sorteio, prazo, resposta única, nota, certificado) é tocada. | Não se aplica |
| X. Padrões de código | Textos, mensagens e identificadores de domínio em português. | ✅ |
| XI. Interface fiel e acessível | Kit e protótipo portado sem redesenho (FR-026); identidade visual prevalece; AA com o cinza `#8A8A93`, foco visível, alvos de 44 px e menos movimento (FR-027, FR-032, FR-049, SC-013). | ✅ kit 1.1: abas e fechar notificação com 44 px; foco com afastamento de 3 px também nos campos |
