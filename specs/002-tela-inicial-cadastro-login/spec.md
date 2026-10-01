# Feature Specification: Tela Inicial, Cadastro e Login

**Feature Branch**: `002-tela-inicial-cadastro-login`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Visitantes chegam a uma tela inicial que apresenta a certificação em metodologias ágeis: descrição, objetivos, regras (12 temas, uma questão por tema, 150 segundos por questão, resposta única, aprovação com 65% ou mais, certificado com QR Code) e instruções. A partir dela o visitante pode se cadastrar, entrar, ir para a área de estudos ou validar um certificado. O cadastro pede CPF, nome completo, e-mail, senha e aceite dos termos de uso e privacidade; o CPF identifica o candidato de forma única e deve ser válido. O login é feito exclusivamente com CPF e senha. Depois de entrar, o candidato decide se inicia a certificação agora ou volta depois, podendo estudar antes. Contexto em docs/dossie-sdd-borb.md seção 4.2, requisitos em docs/requisitos-desafio.md e identidade visual em docs/identidade-visual.md."

**Requisitos atendidos**: RF01, RF02, RF03, RF04, RNF01, RNF03, conforme dossiê seções 3 e 8 e
texto integral em `docs/requisitos-desafio.md`. Princípios da constituição envolvidos: II
(front sem frameworks, mobile-first), V (comando único) e VI (LGPD e minimização de dados).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Conhecer a certificação na tela inicial (Priority: P1)

Um visitante, sem conta e sem login, abre o portal e encontra a apresentação da certificação em
metodologias ágeis: o que é, para que serve, como funciona e quais são as regras. Dali ele
escolhe o próximo passo: cadastrar-se, entrar, estudar ou validar um certificado.

**Why this priority**: é a porta de entrada do portal e o requisito RF01; sem ela o visitante
não entende a certificação nem encontra os demais caminhos.

**Independent Test**: abrir o endereço do portal sem estar logado, em um celular e em um
computador, e conferir que a descrição, os objetivos, as seis regras e as instruções estão
visíveis e que os quatro caminhos levam aos destinos corretos.

**Acceptance Scenarios**:

1. **Given** um visitante sem login, **When** ele abre o portal, **Then** vê a descrição da
   certificação, seus objetivos, as regras e as instruções para realizar a avaliação.
2. **Given** a tela inicial, **When** o visitante lê as regras, **Then** encontra: 12 temas;
   uma questão por tema; 150 segundos por questão; resposta única (cada tema é respondido uma
   só vez); aprovação com 65% ou mais de acertos; certificado eletrônico com QR Code para
   validação.
3. **Given** a tela inicial, **When** o visitante lê as instruções, **Then** fica sabendo que
   pode estudar antes de começar, que pode interromper a certificação e retomá-la depois a
   partir do próximo tema não respondido, e que fechar ou recarregar a página, perder a conexão
   ou deixar o tempo acabar durante uma questão encerra aquela questão sem nova chance.
4. **Given** a tela inicial, **When** o visitante escolhe "cadastrar", "entrar", "estudar" ou
   "validar certificado", **Then** é levado ao destino correspondente.
5. **Given** a tela inicial aberta em uma tela estreita de celular, **When** o visitante a
   percorre, **Then** todo o conteúdo e os quatro caminhos ficam legíveis e acionáveis sem
   rolagem horizontal.

---

### User Story 2 - Cadastrar-se como candidato (Priority: P1)

O visitante cria sua conta informando CPF, nome completo, e-mail e senha, e aceitando os termos
de uso e privacidade. O CPF é o identificador único do candidato e precisa ser um CPF válido.
O cadastro não inicia a certificação.

**Why this priority**: sem cadastro não há candidato, e sem candidato não há certificação
(RF03); é também o ponto em que o portal passa a tratar dados pessoais (RNF03).

**Independent Test**: cadastrar um CPF válido (com e sem máscara), conferir que a conta foi
criada e que o candidato ficou conectado; tentar CPFs inválidos, um CPF repetido e um cadastro
sem aceite dos termos, e conferir que todos são recusados com mensagens claras.

**Acceptance Scenarios**:

1. **Given** um visitante no formulário de cadastro, **When** ele informa CPF válido, nome
   completo, e-mail válido, senha que atende às regras, a mesma senha na confirmação e aceita
   os termos, **Then** a conta é criada, ele passa a estar conectado e é levado à área do
   candidato, sem que a certificação seja iniciada.
2. **Given** o formulário de cadastro, **When** o CPF é digitado com máscara (000.000.000-00)
   ou só com os 11 dígitos, **Then** os dois formatos são aceitos e tratados como o mesmo CPF.
3. **Given** o formulário de cadastro, **When** o CPF tem dígitos verificadores errados, tem
   todos os dígitos iguais (ex.: 111.111.111-11), tem menos ou mais de 11 dígitos ou contém
   letras, **Then** o cadastro é recusado com a mensagem de CPF inválido.
4. **Given** um CPF já cadastrado, **When** alguém tenta cadastrá-lo de novo, **Then** o
   cadastro é recusado com uma mensagem clara de que o CPF já tem conta, sem revelar nenhum
   outro dado do titular, e com o caminho para entrar.
5. **Given** o formulário de cadastro, **When** o visitante não marca o aceite dos termos,
   **Then** o cadastro não é concluído e ele é avisado de que o aceite é obrigatório.
6. **Given** o formulário de cadastro, **When** o visitante abre os termos de uso e privacidade,
   **Then** lê o texto completo sem perder o que já digitou.
7. **Given** um cadastro recusado por qualquer motivo, **When** a mensagem aparece, **Then** ela
   indica qual campo corrigir, e os campos já preenchidos (exceto as senhas) continuam
   preenchidos.

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
4. **Given** um candidato conectado, **When** ele escolhe sair, **Then** a sessão é encerrada e
   a área do candidato só volta a ser acessível após novo login.
5. **Given** um candidato conectado há mais de 8 horas, **When** ele tenta usar a área do
   candidato, **Then** é levado ao login com a explicação de que a sessão expirou.
6. **Given** 5 tentativas de login malsucedidas para o mesmo CPF em 15 minutos, **When** alguém
   tenta entrar de novo com esse CPF, **Then** a tentativa é recusada por 15 minutos, mesmo com a
   senha certa, com uma mensagem pedindo para aguardar que é igual para CPF cadastrado ou não.
7. **Given** várias pessoas entrando ao mesmo tempo a partir da mesma rede (por exemplo, a sala
   da apresentação), **When** cada uma usa o seu próprio CPF, **Then** nenhuma é bloqueada pelas
   falhas das outras.

---

### User Story 4 - Decidir entre iniciar agora ou voltar depois (Priority: P2)

Já conectado, o candidato chega à área do candidato, onde escolhe entre iniciar a certificação
agora, estudar antes ou sair e voltar depois. Começar a certificação é sempre uma ação
explícita, nunca consequência automática do cadastro ou do login.

**Why this priority**: atende RF02 e liga esta feature às seguintes (área de estudos e fluxo da
certificação); depende do login (US3), por isso P2.

**Independent Test**: entrar como candidato e conferir que a área do candidato oferece os três
caminhos, que nenhum deles inicia a certificação sem escolha explícita e que, ao sair e entrar
de novo, o candidato volta à mesma escolha.

**Acceptance Scenarios**:

1. **Given** um candidato recém-cadastrado ou recém-conectado, **When** ele chega à área do
   candidato, **Then** é saudado pelo nome e vê três caminhos: iniciar a certificação, estudar
   antes e sair para voltar depois.
2. **Given** a área do candidato, **When** ele escolhe estudar, **Then** é levado à área de
   estudos e pode voltar à área do candidato depois.
3. **Given** a área do candidato, **When** ele escolhe iniciar a certificação, **Then** é levado
   ao início do fluxo da certificação, antes do qual uma confirmação lembra as regras
   principais (150 segundos por questão, resposta única, interrupção encerra a questão).
4. **Given** um candidato que saiu sem iniciar, **When** ele entra de novo em outro momento,
   **Then** volta à mesma área do candidato, com os mesmos três caminhos.
5. **Given** um candidato conectado, **When** ele abre a tela inicial, o cadastro ou o login,
   **Then** é direcionado à área do candidato em vez de ver formulários de cadastro ou login.

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
  cadastro pela metade.
- Sessão expirada no meio da navegação: ao agir, o candidato é levado ao login e, depois de
  entrar, volta à área do candidato.
- Visitante acessa diretamente o endereço da área do candidato sem estar conectado: é levado
  ao login.
- Destinos ainda não entregues (área de estudos, validação de certificado e fluxo da
  certificação, das features 003 a 005): o caminho existe e leva a uma página que informa que
  a funcionalidade estará disponível em breve, com retorno à tela de origem.

## Requirements *(mandatory)*

### Functional Requirements

**Tela inicial (RF01)**

- **FR-001**: A tela inicial MUST ser acessível sem login e apresentar a descrição da
  certificação, seus objetivos, as regras e as instruções para realizar a avaliação (RF01).
- **FR-002**: As regras MUST incluir, no mínimo: 12 temas; uma questão por tema, sorteada para
  cada candidato; 150 segundos por questão; resposta única (cada tema é respondido uma só
  vez); aprovação com 65% ou mais de acertos; certificado eletrônico com QR Code para
  validação pública.
- **FR-003**: As instruções MUST explicar que o candidato pode estudar antes de começar, pode
  interromper a certificação e retomá-la a partir do próximo tema não respondido, e que fechar
  ou recarregar a página, perder a conexão ou esgotar o tempo durante uma questão encerra a
  questão sem nova chance (RF13, RF14).
- **FR-004**: A tela inicial MUST oferecer quatro caminhos: cadastrar-se, entrar, ir para a área
  de estudos e validar um certificado.
- **FR-004a**: A tela inicial MUST manter, de forma discreta, a indicação de que o portal está no
  ar e conectado ao banco, e MUST exibir com destaque os avisos de banco indisponível e de carga
  incompleta, preservando o FR-013 da feature 001.
- **FR-004b**: As regras e instruções da certificação (12 temas, uma questão por tema, 150
  segundos por questão, resposta única, aprovação com 65% ou mais, interrupção encerra a
  questão) MUST ser exibidas em linguagem direta, sem metáfora astronômica, em todos os lugares
  onde aparecem (tela inicial, confirmação de início e demais telas). O tema visual pode
  aparecer em rótulos de ação e na decoração, conforme `docs/identidade-visual.md`, mas MUST NOT
  substituir termos ágeis nem o enunciado de uma regra.

**Cadastro (RF03, RNF03)**

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
- **FR-012**: Os termos de uso e privacidade MUST estar em uma página própria, acessível sem
  login a partir do cadastro e da tela inicial, explicando quais dados são coletados (CPF,
  nome, e-mail e senha), para que servem (identificar o candidato, emitir e permitir a
  validação pública do certificado), que a validação pública mostra o CPF mascarado e nunca o
  e-mail, e como pedir esclarecimentos sobre os dados.
- **FR-013**: Concluído o cadastro, o candidato MUST ficar conectado e ser levado à área do
  candidato; o cadastro MUST NOT iniciar a certificação (RF02).
- **FR-014**: Mensagens de recusa MUST indicar o campo a corrigir e preservar os campos já
  preenchidos, exceto senha e confirmação.

**Login e sessão (RF04)**

- **FR-015**: O login MUST aceitar exclusivamente CPF (com ou sem máscara) e senha; tentativas
  com e-mail ou qualquer outro identificador MUST ser recusadas com orientação para usar o CPF.
- **FR-016**: CPF não cadastrado e senha errada MUST gerar a mesma mensagem genérica ("CPF ou
  senha inválidos"), sem indicar qual dos dois falhou.
- **FR-017**: Falhas de login MUST ser contadas por CPF: após 5 tentativas malsucedidas para o
  mesmo CPF em 15 minutos, novas tentativas para esse CPF MUST ser recusadas por 15 minutos,
  inclusive com a senha correta. A contagem vale para qualquer CPF digitado, cadastrado ou não,
  e a mensagem de bloqueio MUST ser a mesma nos dois casos, sem revelar se o CPF existe; um
  login bem-sucedido zera a contagem daquele CPF.
- **FR-017a**: Por endereço de rede, MUST existir apenas um limite folgado contra abuso em massa
  (da ordem de 30 tentativas de login por minuto), que não bloqueie várias pessoas legítimas
  entrando a partir da mesma rede, como na sala da apresentação.
- **FR-018**: A sessão do candidato MUST durar até 8 horas; depois disso, ou após sair, o acesso
  à área do candidato MUST exigir novo login.
- **FR-019**: O candidato conectado MUST poder sair a qualquer momento, encerrando a sessão.
- **FR-020**: A identidade do candidato conectado MUST ser determinada pelo servidor a cada
  acesso; nenhum dado enviado pelo navegador pode, sozinho, fazer alguém passar por outro
  candidato (Princípio I).

**Área do candidato (RF02)**

- **FR-021**: A área do candidato MUST exigir login, saudar o candidato pelo nome e oferecer três
  caminhos: iniciar a certificação, estudar antes e sair para voltar depois (RF02).
- **FR-022**: Iniciar a certificação MUST ser sempre uma ação explícita do candidato, precedida
  de uma confirmação que lembre as regras principais; nem o cadastro nem o login iniciam a
  certificação.
- **FR-023**: Candidato conectado que abrir a tela inicial, o cadastro ou o login MUST ser
  direcionado à área do candidato; visitante não conectado que abrir a área do candidato MUST
  ser direcionado ao login.
- **FR-024**: Enquanto a área de estudos (003), a validação de certificado (005) e o fluxo da
  certificação (004) não forem entregues, os caminhos para eles MUST existir e levar a uma
  página que informe que a funcionalidade estará disponível em breve, com retorno à tela de
  origem; cada feature seguinte substitui a sua página provisória.

**Experiência, identidade visual e acessibilidade (RNF01)**

- **FR-025**: Todas as telas desta feature (inicial, cadastro, login, termos, área do candidato
  e páginas provisórias) MUST ser projetadas primeiro para celular e funcionar de telas
  estreitas a telas largas sem rolagem horizontal (RNF01, Princípio II).
- **FR-026**: As telas MUST seguir a identidade visual de `docs/identidade-visual.md`: céu escuro,
  a Lua como elemento central da tela inicial, cores e tipografia definidas, termos ágeis
  sempre com o nome oficial (nunca trocados por metáforas).
- **FR-027**: As telas MUST atender ao contraste mínimo AA, ter foco visível em todos os
  elementos acionáveis, ser utilizáveis só com teclado, ter texto alternativo em toda imagem
  e desligar animações quando o usuário pedir menos movimento.
- **FR-028**: O portal MUST funcionar sem acesso à internet durante a apresentação: nenhuma tela
  desta feature pode depender de recursos externos (fontes, imagens ou scripts de terceiros).

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
- **Termos de uso e privacidade**: texto público e estático, com data de vigência, cujo aceite
  é registrado no candidato.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um visitante encontra, na tela inicial e sem login, as seis regras da
  certificação e as instruções; em teste com 5 pessoas que não conhecem o portal, todas
  respondem corretamente, após até 2 minutos de leitura, quanto tempo há por questão e qual o
  percentual mínimo para aprovação.
- **SC-002**: Um visitante conclui o cadastro em até 2 minutos, do clique em "cadastrar" até a
  área do candidato.
- **SC-003**: Um candidato cadastrado entra no portal em até 30 segundos.
- **SC-004**: 100% de um conjunto de teste com CPFs válidos (com e sem máscara) é aceito, e 100%
  dos inválidos (dígitos verificadores errados, dígitos todos iguais, tamanho errado, letras) é
  recusado.
- **SC-005**: Em 100% das tentativas de login malsucedidas, a mensagem é idêntica para CPF não
  cadastrado e senha errada, e a mensagem de bloqueio é idêntica para CPF cadastrado e não
  cadastrado.
- **SC-009**: Pelo menos 30 pessoas conseguem entrar no mesmo minuto a partir da mesma rede sem
  nenhum bloqueio, enquanto um mesmo CPF fica bloqueado na 6ª tentativa errada dentro de 15
  minutos.
- **SC-010**: Em revisão das telas desta feature, 100% das regras e instruções aparecem com os
  termos ágeis e os números oficiais (12 temas, 150 segundos, 65%), sem nenhuma metáfora
  astronômica no enunciado.
- **SC-006**: 0 senhas legíveis armazenadas ou registradas em logs, conferido em inspeção do
  banco e dos registros após uma rodada de testes de cadastro e login.
- **SC-007**: Todas as telas desta feature ficam utilizáveis, sem rolagem horizontal, de 320 px a
  1920 px de largura, e passam na verificação de contraste AA.
- **SC-008**: O portal continua subindo com um único comando a partir de um clone limpo, e o
  fluxo cadastro → área do candidato → sair → entrar funciona logo na primeira subida, sem
  nenhum passo manual de configuração.

## Assumptions

- O texto da tela inicial (descrição, objetivos, regras e instruções) e o dos termos de uso e
  privacidade são escritos pela equipe do projeto com base no documento do desafio; não há
  revisão jurídica no escopo acadêmico. Pedidos sobre os dados pessoais (correção ou exclusão)
  são atendidos fora do sistema, pelo contato informado nos termos.
- Não há edição de perfil (decisão D5 do dossiê: o certificado lê do cadastro) nem recuperação
  de senha (fora do MVP, Princípio VII).
- Cada candidato faz uma única certificação (decisão D1, padrão assumido a confirmar com o
  professor); a tela inicial e a confirmação de início não prometem novas tentativas.
- Interromper ou recarregar a página durante uma questão encerra a questão (RF14 e decisão D6,
  padrão assumido); por isso as instruções avisam isso explicitamente.
- A área de estudos não exige login (decisão D8).
- Os padrões do dossiê seção 4.2 são adotados: senha com no mínimo 8 caracteres, sessão de 8
  horas, mensagem de login genérica. O limite de tentativas do dossiê (5 por minuto por IP)
  foi substituído, por decisão do mantenedor, pela contagem por CPF (5 falhas em 15 minutos,
  bloqueio de 15 minutos) mais um limite folgado por endereço de rede (cerca de 30 por
  minuto), para não bloquear a sala inteira durante a apresentação. O limite de 64 caracteres
  na senha é um padrão desta spec para evitar entradas abusivas.
- O campo de confirmação da senha é um padrão de usabilidade; ele não é armazenado.
- A indicação de progresso pela Lua (RF21, identidade visual) e o conteúdo real da área de
  estudos, da validação e da prova pertencem às features 003 a 005; nesta feature a área do
  candidato só oferece os caminhos.
- A identidade visual de `docs/identidade-visual.md` vale a partir desta feature, que também cria
  a base de estilos (cores e tipografia) usada pelas seguintes. A página inicial de status da
  feature 001 dá lugar à tela inicial de apresentação, que mantém o estado do portal de forma
  discreta (FR-004a); o quickstart e o README da 001 serão ajustados no plano desta feature.
- O ambiente-alvo continua sendo a execução local definida na feature 001; publicação em
  servidor com HTTPS está fora do escopo, mas nada nesta feature deve impedi-la.
