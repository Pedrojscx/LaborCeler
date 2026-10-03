# Feature Specification: Área de Estudos

**Feature Branch**: `003-area-de-estudos`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Visitantes e candidatos estudam os 12 temas da certificação numa área aberta, sem login, organizada na mesma ordem da prova. A entrada mostra os temas como uma trilha do Sistema Solar e em cartões com a quantidade de materiais e o tempo estimado de leitura. Cada tema tem uma página com descrição, sumário e os materiais em ordem: textos com imagens, vídeos hospedados no próprio portal com legendas, transcrição e aviso de conteúdo gerado por IA, e leituras externas. O conteúdo de cada tema precisa ser coerente com as questões desse tema na certificação. A página termina com a navegação para o tema anterior e o próximo. Referências: docs/requisitos-desafio.md (RF07 e RP07), docs/prototipo/AreaEstudos.dc.html e AreaTema.dc.html, docs/kit-interface.md e docs/telas.md."

**Requisitos atendidos**: RF07 e RP07 (organização pelos mesmos 12 temas da certificação; a
coerência do conteúdo definitivo com as questões fica com a carga definitiva, ver Assumptions),
RNF01 e RNF02, conforme `docs/requisitos-desafio.md`; telas 7 e 8 de `docs/telas.md`, com o
desenho de `docs/prototipo/AreaEstudos.dc.html` e `docs/prototipo/AreaTema.dc.html`. A
conformidade com a constituição 3.0.1 está no fim deste documento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escolher o que estudar na área de estudos (Priority: P1)

Um visitante ou candidato abre a área de estudos, sem precisar de conta, e vê os 12 temas da
certificação na mesma ordem da prova: primeiro como uma trilha do Sistema Solar e depois em
cartões que dizem quantos materiais cada tema tem e quanto tempo leva para estudá-lo. Dali ele
escolhe um tema.

**Why this priority**: é a porta de entrada do RF07; sem ela ninguém encontra o material de
estudo, e a tela inicial e a área do candidato não têm para onde mandar quem quer estudar antes.

**Independent Test**: abrir a área de estudos sem login, em um celular (360 px) e em um
computador, e conferir os 12 temas na ordem da prova, a trilha, os cartões com quantidade de
materiais e tempo estimado, e que cada tema leva à sua página.

**Acceptance Scenarios**:

1. **Given** um visitante sem login, **When** ele abre a área de estudos, **Then** vê o
   cabeçalho com a marca e os links "Início" e "Entrar", o título "Área de estudos", o texto de
   apresentação, a trilha com os 12 corpos celestes na ordem da prova e um cartão por tema.
2. **Given** a área de estudos, **When** o visitante lê um cartão, **Then** encontra a posição
   do tema ("Tema 5"), o corpo celeste e o nome no formato "Ceres · Eventos do Scrum", a
   quantidade de materiais e o tempo estimado ("4 materiais · cerca de 14 min de leitura").
3. **Given** a área de estudos, **When** o visitante escolhe um corpo da trilha ou um cartão,
   **Then** é levado à página daquele tema.
4. **Given** um candidato conectado, **When** ele abre a área de estudos, **Then** vê o mesmo
   conteúdo do visitante, com o cabeçalho de quem está logado, e não vê os blocos de flashcards
   e domínio de cartões ("Próximo foco", "Flashcards dominados"), que esperam a feature 007.
5. **Given** a área de estudos aberta em uma tela de celular a partir de 360 px, **When** a
   pessoa a percorre, **Then** a trilha e os cartões ficam legíveis e acionáveis sem rolagem
   horizontal.
6. **Given** esta feature entregue, **When** alguém escolhe "Começar pelos estudos" na tela
   inicial, "Área de estudos" no cabeçalho logado ou "Estudar antes" na área do candidato,
   **Then** chega à área de estudos, e não mais à página "Disponível em breve" ou à trilha da
   tela inicial; **When** escolhe um corpo da trilha da tela inicial, **Then** chega à página
   daquele tema.
7. **Given** um clone limpo do projeto, **When** o portal sobe pela primeira vez, **Then** a área
   de estudos já mostra os 12 temas com os materiais da carga, sem nenhum passo manual.

---

### User Story 2 - Estudar um tema na página do tema (Priority: P1)

Na página de um tema, a pessoa lê a descrição, usa o sumário para ver o que há ali e percorre os
materiais na ordem: textos com imagens, vídeos e leituras externas. No fim, segue para o tema
seguinte ou volta ao anterior.

**Why this priority**: é onde o estudo acontece (RF07); a área de estudos só tem valor se cada
tema tiver uma página completa e fácil de percorrer.

**Independent Test**: abrir a página de um tema com os três tipos de material e conferir
cabeçalho, sumário, materiais em ordem, imagens com texto alternativo e a navegação para os
temas vizinhos; repetir no primeiro e no último tema.

**Acceptance Scenarios**:

1. **Given** a página de um tema, **When** a pessoa a abre, **Then** vê o caminho "Área de
   estudos › Ceres · Eventos do Scrum", a indicação "Tema 5 de 12 · Ceres", o nome do tema, a
   descrição e a quantidade de materiais com o tempo estimado.
2. **Given** a página de um tema, **When** a pessoa lê o sumário "Neste tema", **Then** vê todos
   os materiais na ordem, cada um com o tipo (Texto, Vídeo ou Leitura externa), e ao escolher um
   deles vai direto a ele na página.
3. **Given** um material de texto, **When** a pessoa o lê, **Then** encontra o título, o texto, as
   imagens com legenda e texto alternativo, o crédito das imagens de terceiros e, quando houver,
   o destaque "Para lembrar".
4. **Given** uma leitura externa ou um link para fora do portal dentro de um texto, **When** a
   pessoa o escolhe, **Then** a fonte abre em outra aba, e o link avisa isso antes do clique.
5. **Given** o fim da página de um tema, **When** a pessoa chega lá, **Then** encontra o tema
   anterior e o próximo, com corpo e nome ("Tema anterior: Marte · Papéis do Scrum"); no tema 1
   não há anterior e no tema 12 não há próximo.
6. **Given** a página de um tema aberta em um celular, **When** a pessoa a percorre, **Then** o
   sumário, os materiais e a navegação ficam legíveis e acionáveis sem rolagem horizontal.

7. **Given** a área de estudos ou a página de um tema, **When** a pessoa chega ao fim, **Then**
   encontra o aviso de que o conteúdo didático está sob a licença CC BY-SA 4.0, com a atribuição
   ao Scrum Guide 2020 e o link para o texto da licença.
---

### User Story 3 - Assistir a um vídeo com legendas e transcrição (Priority: P2)

Quando um tema tem vídeo, a pessoa o assiste no próprio portal, liga e desliga as legendas em
português, pode ler a transcrição completa e sabe, por um aviso, como o vídeo foi produzido e de
que fonte ele vem.

**Why this priority**: os vídeos são opcionais por tema; o estudo funciona sem eles, mas quando
existem precisam ser acessíveis e transparentes quanto ao uso de IA.

**Independent Test**: abrir a página de um tema com vídeo, reproduzir e pausar com mouse e só
com teclado, ligar e desligar as legendas, abrir a transcrição e conferir o aviso; repetir sem
internet e com o vídeo indisponível.

**Acceptance Scenarios**:

1. **Given** um material de vídeo, **When** a pessoa chega a ele, **Then** vê o título, o vídeo
   parado (nunca começa sozinho), a duração, a indicação "legendas em português" e o aviso "Vídeo
   gerado com NotebookLM e revisado pela equipe do projeto." seguido, quando o vídeo se baseia no
   Scrum Guide, de "Baseado no Scrum Guide 2020, de Ken Schwaber e Jeff Sutherland (CC BY-SA
   4.0)."
2. **Given** o vídeo, **When** a pessoa usa os controles com mouse, toque ou teclado, **Then**
   consegue reproduzir, pausar, ver o tempo decorrido e o total, ligar e desligar as legendas
   (que começam ligadas) e abrir em tela cheia; sem JavaScript, os controles nativos do navegador
   fazem o mesmo, com a legenda.
3. **Given** o vídeo, **When** a pessoa abre "Ler a transcrição", **Then** lê o texto completo do
   que é dito no vídeo.
4. **Given** o portal sem acesso à internet, **When** a pessoa reproduz o vídeo, **Then** ele
   toca normalmente, com as legendas.
5. **Given** um vídeo que não carrega, **When** a pessoa tenta reproduzi-lo, **Then** vê uma
   mensagem de que o vídeo não está disponível no momento, e a transcrição continua legível.

---

### Edge Cases

- Tema sem vídeo ou sem leitura externa: o sumário e a página mostram só os materiais que
  existem, e a contagem de materiais acompanha.
- Tema com um único material: a página funciona igual, com sumário de um item.
- Primeiro e último tema: a navegação mostra só o vizinho que existe.
- Endereço de um tema que não existe: o portal informa que o tema não foi encontrado e oferece o
  caminho para a área de estudos.
- Banco indisponível: a área de estudos e as páginas de tema mostram uma mensagem amigável de
  indisponibilidade temporária, sem detalhes técnicos, e o rodapé mostra a mensagem de
  instabilidade (FR-004a da 002).
- Navegador sem JavaScript: textos, imagens, transcrição e navegação continuam legíveis, e o
  vídeo continua reproduzível com os controles do próprio navegador.
- Portal sem acesso à internet: tudo funciona, menos a abertura das leituras externas, que
  dependem de outro site.
- Leitura externa fora do ar: o portal não tem como saber; por isso os links são conferidos na
  entrega (SC-007) e sempre apontam para fontes primárias (FR-011).
- Imagem que não carrega: o texto alternativo aparece no lugar, e o texto do material continua
  legível.
- Texto de material com código perigoso (script, atributo de evento, estilo embutido ou HTML
  solto): o servidor remove tudo isso na conversão, e a página mostra só o texto formatado.
- Vídeo acima do limite de tamanho, ou sem legenda ou sem transcrição: não entra na carga e não
  aparece no portal.
- Texto que referencia uma imagem não ligada ao material: a figura não aparece, e a verificação
  de conteúdo da carga acusa o problema antes da entrega.
- Leitura externa com endereço sem `https://`: não entra na carga.
- Pedido de menos movimento: o céu fica parado, as transições ficam instantâneas e nada começa
  a tocar sozinho.
- Visitante sem conta: vê todo o conteúdo; nenhum material exige login (decisão D8).
- Candidato conectado: vê o mesmo conteúdo, com o cabeçalho logado; os blocos de flashcards e
  domínio do protótipo ficam ocultos até a feature 007 (FR-017).

## Requirements *(mandatory)*

### Functional Requirements

**Área de estudos (RF07, RP07, tela 7)**

- **FR-001**: A área de estudos MUST ser acessível a qualquer pessoa, com ou sem login (decisão
  D8), e apresentar os 12 temas da certificação na ordem da prova, os mesmos temas a que as
  questões pertencem (RP07).
- **FR-002**: A área de estudos MUST trazer o título "Área de estudos", o texto de apresentação
  do protótipo, a trilha do Sistema Solar e um cartão por tema.
- **FR-003**: A trilha MUST mostrar os 12 corpos celestes na ordem da seção 7 de
  `docs/identidade-visual.md`, com tamanho relativo e o nome no formato "Corpo · Tema", com o
  mesmo desenho da trilha da tela inicial (FR-036 da 002); cada corpo MUST levar à página do seu
  tema.
- **FR-004**: Cada cartão MUST mostrar a posição do tema ("Tema 5"), o corpo celeste com sua cor,
  o nome do tema, a quantidade de materiais e o tempo estimado ("4 materiais · cerca de 14 min de
  leitura"), e MUST levar à página do tema.
- **FR-005**: A quantidade de materiais e o tempo estimado MUST ser calculados a partir dos
  materiais do tema, nunca digitados nem armazenados (Princípio IV), e MUST ser os mesmos no
  cartão e na página do tema. O tempo estimado soma a leitura dos textos, calculada pelo tamanho
  deles, e a duração dos vídeos, lida no servidor do próprio arquivo MP4, arredondado para cima
  em minutos inteiros, sem nenhum campo novo no banco; leituras externas não entram na conta.

**Página do tema (RF07, tela 8)**

- **FR-006**: Cada tema MUST ter uma página própria, com endereço estável, acessível sem login.
- **FR-007**: A página do tema MUST trazer: o caminho "Área de estudos › Corpo · Tema" (com o
  primeiro item levando à área de estudos); a indicação "Tema N de 12 · Corpo"; o nome do tema;
  a descrição do tema; a quantidade de materiais e o tempo estimado (FR-005).
- **FR-008**: A página do tema MUST ter o sumário "Neste tema", com todos os materiais na ordem e
  o tipo de cada um (Texto, Vídeo ou Leitura externa); cada item MUST levar direto ao material
  na própria página.
- **FR-009**: Os materiais MUST aparecer na ordem definida para o tema, cada um com seu título,
  e cada tema MUST ter pelo menos um material de texto com pelo menos uma imagem (RF07).
- **FR-010**: Um material de texto (em Markdown, FR-026) MUST mostrar o texto com títulos
  internos e parágrafos, as imagens com texto alternativo e, quando houver, legenda e, quando
  houver, o destaque "Para lembrar". Imagens de terceiros MUST exibir o crédito exigido pela
  licença. Texto alternativo, legenda e crédito vêm do cadastro da imagem (FR-026).
- **FR-011**: Um material de leitura externa MUST mostrar o título, uma frase sobre o que a
  pessoa vai encontrar e o link para a fonte, que abre em outra aba (com `rel="noopener
  noreferrer"`) e avisa isso no próprio texto ("abre em outra aba"). O endereço MUST começar com
  `https://`. As leituras externas MUST apontar para fontes primárias, publicadas pelo próprio
  autor ou pela organização responsável pelo conteúdo (por exemplo, o Scrum Guide em
  scrumguides.org, em português).
- **FR-012**: O fim da página do tema MUST ter a navegação para o tema anterior e o próximo, com
  corpo e nome ("Próximo tema: Júpiter · Artefatos do Scrum"); o tema 1 não tem anterior e o
  tema 12 não tem próximo.

**Vídeos (RF07, Princípios II e XI)**

- **FR-013**: Vídeos são opcionais por tema. Quando existirem, MUST ser arquivos MP4 em 720p, de
  poucos minutos (o do protótipo tem 4) e com no máximo cerca de 20 MB cada, hospedados no
  próprio projeto, sem plataforma externa, e tocados pelo elemento de vídeo do HTML; funcionam
  sem acesso à internet (Princípio II).
- **FR-014**: Todo vídeo MUST ter legenda em português no formato WebVTT, sincronizada, ligada
  por padrão e que a pessoa liga e desliga, entregue como faixa de legenda do próprio elemento de
  vídeo (`<track kind="captions" srclang="pt-BR" default>`), para funcionar também com os
  controles nativos do navegador; e transcrição completa do que é dito, em bloco recolhível "Ler
  a transcrição" logo abaixo do vídeo. Vídeo sem legenda ou sem transcrição MUST NOT ser
  publicado.
- **FR-015**: Todo vídeo gerado com NotebookLM MUST exibir, junto dele, o aviso "Vídeo gerado com
  NotebookLM e revisado pela equipe do projeto."; todo vídeo que se basear no Scrum Guide MUST
  exibir a atribuição "Baseado no Scrum
  Guide 2020, de Ken Schwaber e Jeff Sutherland (CC BY-SA 4.0).", além da duração e da indicação
  "legendas em português". Todo vídeo, com a legenda e a transcrição, MUST ser revisado por uma
  pessoa da equipe contra a fonte antes de publicado.
- **FR-016**: O vídeo MUST começar parado, nunca tocar sozinho, e ter os controles do protótipo
  sobre o elemento de vídeo do HTML: reproduzir e pausar, tempo decorrido e total, ligar e
  desligar as legendas e tela cheia, todos com rótulo acessível e operáveis por teclado. Sem
  JavaScript, os controles do próprio navegador MUST continuar funcionando. Se o vídeo não
  carregar, a página MUST avisar que ele não está disponível no momento, mantendo a transcrição.
  O player MUST entrar no kit de interface como componente reutilizável (Princípio XI).

**Disponibilidade e integração com as outras features**

- **FR-017**: A regra de disponibilidade (FR-050 da 002) vale aqui: o domínio nos flashcards, o
  próximo foco e os convites para os flashcards MUST aparecer só quando a feature 007 existir.
  No protótipo, são: na área de estudos, o bloco "Próximo foco" e a linha "Flashcards dominados"
  dos cartões (candidato conectado) e o convite "Quer fixar o que estudou?" (visitante); na
  página do tema, os blocos "Revise o que estudou" (candidato conectado) e "Revise com
  flashcards" (visitante). O link "Flashcards" e o nome do candidato no cabeçalho logado
  continuam levando à página "Disponível em breve".
- **FR-018**: Ao ser entregue, esta feature MUST substituir os destinos provisórios da área de
  estudos deixados pela 002: o destino "estudos" da página "Disponível em breve" (FR-024 da 002)
  some; "Começar pelos estudos" passa a levar à área de estudos (FR-004 da 002); os corpos da
  trilha da tela inicial e o link "Aprofundar em Terra · Introdução ao Scrum" passam a levar à
  página do tema correspondente; os links "Área de estudos" do cabeçalho logado, de "Quer estudar
  antes?" na tela de login e de "Estudar antes" na área do candidato passam a levar à área de
  estudos; e os trechos que a 002 deixou ocultos até a 003 passam a aparecer (tabela do FR-050
  da 002).

**Interface, acessibilidade e desempenho (RNF01, RNF02, Princípios II e XI)**

- **FR-019**: As duas telas MUST usar o kit de interface (`app/public/kit`) e portar, sem
  redesenhar, `AreaEstudos.dc.html` e `AreaTema.dc.html`, com as correções de
  `docs/identidade-visual.md` (cinza `#8A8A93` em texto pequeno, Inter só nos pesos 300, 400 e
  500, fontes do próprio projeto) e sem JavaScript inline nem bibliotecas de terceiros.
- **FR-020**: O cabeçalho MUST seguir o protótipo: para o visitante, a marca e os links "Início" e
  "Entrar"; para o candidato conectado, o cabeçalho logado da 002 (FR-048), com "Área de estudos"
  marcado como página atual.
- **FR-021**: As telas MUST ser projetadas primeiro para celular e funcionar a partir de 360 px de
  largura sem rolagem horizontal (RNF01), com contraste AA em todo texto, foco visível, alvos de
  toque de pelo menos 44 px (inclusive nos controles do vídeo), uso completo só com teclado e
  respeito ao pedido de menos movimento (Princípio XI).
- **FR-022**: O texto da página do tema MUST ficar legível sem esperar o vídeo carregar; o vídeo
  só é baixado quando a pessoa o reproduz (RNF02).
- **FR-023**: As duas telas MUST ter o céu estrelado e o rodapé da 002 (FR-004a e FR-049 da 002),
  e o título de cada página MUST terminar em "· Lunar Celer".
- **FR-024**: O conteúdo da área de estudos (temas, materiais, imagens, vídeos, legendas e
  transcrições) MUST vir da carga versionada no repositório e estar disponível logo na primeira
  subida a partir de um clone limpo, sem passo manual (Princípio V).

**Conteúdo: formato, licença e coerência (RF07, RP07)**

- **FR-025**: O conteúdo didático do portal (textos, vídeos e imagens de autoria própria) MUST ser
  publicado sob a licença CC BY-SA 4.0, com atribuição ao Scrum Guide 2020: título, autores (Ken
  Schwaber e Jeff Sutherland), fonte, licença e a indicação de que o conteúdo é adaptado. A
  licença MUST estar registrada no arquivo `LICENCA-CONTEUDO.md`, na raiz do repositório, que diz
  o que ela cobre (textos, vídeos e imagens próprias) e o que fica de fora (o código do portal e
  as imagens de terceiros, que têm licença e crédito próprios). A área de estudos e as páginas de
  tema MUST exibir, no fim, um aviso curto da licença com a atribuição e o link para o texto da
  licença, que abre em outra aba.
- **FR-026**: Os textos dos materiais MUST ser escritos em Markdown e convertidos em página no
  servidor, que MUST sanitizar o resultado: só formatação de texto (intertítulos, parágrafos,
  listas, ênfase, links, imagens e o destaque "Para lembrar"), nunca scripts, atributos de
  evento, estilos embutidos ou HTML fora dessa lista. Todo link para fora do portal, num texto ou
  numa leitura externa, MUST abrir em nova aba com `rel="noopener noreferrer"`. No Markdown, a
  imagem MUST ser referenciada só pelo identificador (por exemplo, `![](imagem:12)`); o servidor
  troca a referência pela figura completa do banco (arquivo, texto alternativo, legenda e
  crédito) e MUST recusar imagem que não esteja ligada ao material: a figura não é exibida, e a
  verificação de conteúdo da carga acusa o problema antes da entrega.
- **FR-027**: A coerência entre o material e as questões (RP07) MUST ser verificada por uma matriz
  de coerência versionada no repositório (`docs/conteudo/matriz-de-coerencia.md`), com uma linha
  por questão: tema, questão, conceito cobrado (em uma frase), material e trecho (título ou
  intertítulo) do mesmo tema que cobre o conceito, quem conferiu e a data. A verificação passa
  quando: (a) as 48 questões têm uma linha cada; (b) o material citado é do mesmo tema da
  questão; (c) o trecho citado existe no material atual; (d) uma pessoa que não escreveu a
  questão confirma que quem leu só aquele trecho consegue respondê-la; (e) qualquer mudança na
  questão ou no trecho citado reabre a linha, que precisa de nova conferência e nova data. As
  condições (a) a (c) podem ser conferidas automaticamente; (d) e (e) são revisão humana. Nesta
  feature, a matriz é criada com a estrutura e uma linha por questão; o preenchimento e a
  conferência acontecem na carga definitiva, com a trilha de conteúdo.

### Key Entities *(include if feature involves data)*

- **Tema**: um dos 12 temas da certificação, com nome, descrição, ordem de 1 a 12 e o corpo
  celeste associado pela ordem. Já existe no esquema oficial; é o mesmo tema das questões.
- **Material**: unidade de estudo de um tema, com título, tipo (texto, vídeo ou leitura externa)
  e posição na ordem do tema. A quantidade de materiais e o tempo estimado do tema são calculados
  a partir dos materiais.
- **Imagem**: figura usada em um material ou numa questão, com arquivo, texto alternativo,
  legenda opcional e crédito quando for de terceiros.
- **Vídeo**: material com arquivo MP4 hospedado no projeto, legenda WebVTT em português,
  transcrição completa e, quando gerado com NotebookLM, o aviso de produção; a duração é lida do
  próprio arquivo MP4, no servidor, não digitada. A forma de guardar no banco está em
  `proposta-modelo-de-dados.md`, aguardando revisão.
- **Matriz de coerência**: documento do repositório que liga cada questão ao trecho do material
  do mesmo tema que cobre o conceito cobrado, com quem conferiu e quando.
- **Leitura externa**: material com título, frase de apresentação e endereço `https://` da fonte.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Partindo da tela inicial, um visitante sem conta chega à página de qualquer tema em
  até 2 escolhas ("Começar pelos estudos" e o tema).
- **SC-002**: A área de estudos mostra 12 temas, na ordem 1 a 12, com 100% de correspondência de
  nome e ordem com os temas a que as questões da certificação pertencem.
- **SC-003**: Nas 12 páginas de tema, 100% dos materiais aparecem no sumário e na página, na
  ordem definida, e a navegação leva ao vizinho correto (sem anterior no tema 1 e sem próximo no
  tema 12).
- **SC-004**: Em 100% dos temas, a quantidade de materiais e o tempo estimado são iguais no
  cartão e na página e conferem com a regra do FR-005.
- **SC-005**: 100% dos vídeos publicados são MP4 em 720p com no máximo cerca de 20 MB e têm
  legenda WebVTT em português, transcrição completa, o aviso do FR-015 e registro de revisão
  humana; 0 vídeos tocam sozinhos.
- **SC-006**: Com a máquina sem acesso à internet, a área de estudos e as 12 páginas de tema
  carregam por completo, com imagens e vídeos, e 0 requisições saem para outros domínios até a
  pessoa abrir uma leitura externa.
- **SC-007**: Na conferência da entrega, 100% das leituras externas abrem a página indicada.
- **SC-008**: Navegando só com teclado, 100% dos elementos acionáveis das duas telas, inclusive
  os controles do vídeo, são alcançados com foco visível; 100% dos alvos de toque medem pelo menos
  44 px; as telas passam na verificação de contraste AA e ficam sem rolagem horizontal de 360 px a
  1920 px.
- **SC-009**: Na rede local da apresentação, o texto de qualquer página de tema fica legível em
  até 2 segundos, com ou sem vídeo no tema.
- **SC-010**: Em revisão das duas telas, 0 textos afirmam a disponibilidade de flashcards ou de
  domínio de cartões antes da feature 007, e 100% dos destinos provisórios da área de estudos
  deixados pela 002 foram substituídos (FR-018).
- **SC-011**: Na primeira subida a partir de um clone limpo, a área de estudos mostra os 12 temas
  com os materiais da carga, inclusive o vídeo e a leitura externa provisórios, sem nenhum passo
  manual.
- **SC-012**: A área de estudos e as 12 páginas de tema exibem o aviso da licença com a
  atribuição ao Scrum Guide 2020, e o arquivo `LICENCA-CONTEUDO.md` existe com o escopo da
  licença.
- **SC-013**: Um texto de teste com script, atributo de evento, estilo embutido e link para fora é
  exibido sem executar nem aplicar nada disso, e o link abre em nova aba com `rel="noopener
  noreferrer"`.
- **SC-014**: Na entrega desta feature, a matriz de coerência existe com uma linha para cada uma
  das 48 questões. Na carga definitiva, fora da conclusão desta feature, 48 de 48 linhas passam
  nas condições (a) a (e) do FR-027.

## Assumptions

- **Conteúdo e conclusão da feature (decisão do mantenedor)**: a 003 é concluída e validada com
  a área funcionando sobre a carga provisória da feature 001. O conteúdo definitivo dos 12 temas
  e a conferência de coerência com as questões de cada tema (RP07) ficam com a trilha de conteúdo,
  que corre em paralelo (dossiê, seção 2 e RNF08) e entra depois sem mudar o código. A regra para
  esse conteúdo continua valendo e é verificada pela matriz de coerência (FR-027).
- **Carga provisória**: para que os três tipos de material possam ser validados, a carga
  provisória passa a ter pelo menos um vídeo (com legendas, transcrição e aviso) e uma leitura
  externa, além do texto com imagem que cada tema já tem; os itens provisórios continuam marcados
  como provisórios.
- **Vídeos opcionais por tema (decisão do mantenedor)**: todo tema tem pelo menos um texto com
  imagem; vídeos entram só onde agregam.
- **Tempo estimado**: leitura de 200 palavras por minuto para os textos, mais a duração dos
  vídeos, arredondado para cima; leituras externas não contam, porque estão fora do portal.
- **Vídeos no repositório**: os vídeos são versionados direto no Git, sem extensões como o Git
  LFS, para que o clone limpo continue bastando (Princípio V); o limite de cerca de 20 MB por
  vídeo e o fato de serem opcionais mantêm o repositório num tamanho razoável.
- **Modelo de dados**: a recomendação está em `proposta-modelo-de-dados.md`, validada em PGlite
  e não aplicada: `tbmaterial` ganha o arquivo do vídeo, o da legenda e o endereço da leitura
  externa (só `https://`), com a transcrição e a frase da leitura em `conteudo`; `tbimagem` ganha
  a legenda opcional, que serve a materiais e questões. A revisão final e a atualização do
  Modelo Lógico em PDF ficam com o mantenedor.
- **Entregáveis da implementação**: o arquivo `LICENCA-CONTEUDO.md` (FR-025) e a matriz de
  coerência com uma linha por questão (FR-027) são criados na implementação desta feature.
- **Trilha**: o protótipo calcula a trilha do Sistema Solar, mas não a desenha; a trilha da área
  de estudos segue a descrição desta feature e reaproveita o desenho da trilha da tela inicial
  (FR-036 da 002).
- **Cabeçalho do visitante**: o protótipo usa "Início" e "Entrar", e `docs/telas.md` foi
  atualizado para registrar essa variação nas telas 7 e 8.
- **Tema inexistente**: até a página não encontrada da feature 008 existir, o endereço de um tema
  que não existe responde com uma mensagem simples e o caminho para a área de estudos.
- Os 12 temas e seus corpos celestes seguem `docs/identidade-visual.md`, seção 7, que depende da
  decisão D3; se a lista mudar, a área acompanha.
- A área de estudos não registra o que cada pessoa leu ou assistiu; nenhum dado pessoal é
  coletado aqui. O acompanhamento de estudo por pessoa (domínio de cartões) é da feature 007.

## Pendências

- **P-01 (bloqueia o plano)**: revisão final, pelo mantenedor, da proposta de modelo de dados
  (`proposta-modelo-de-dados.md`), que já traz as recomendações para vídeo, leitura externa,
  legenda das imagens e imagens no Markdown, e atualização do Modelo Lógico em PDF
  (`docs/modelagem/`). Falta também rodar a proposta no PostgreSQL 16 do `docker compose`.
- **P-02**: decisão D3 (os 12 temas), que afeta a trilha, os cartões e as páginas de tema.
- **P-03 (fora desta feature)**: carga definitiva dos 12 temas pela trilha de conteúdo, com a
  matriz de coerência preenchida e conferida (FR-027, SC-014).

## Conformidade com a constituição (versão 3.0.1)

| Princípio | Como esta spec atende | Situação |
|---|---|---|
| I. Servidor é a autoridade | Área pública de conteúdo; nada de nota, sorteio ou tempo de prova. | Não se aplica |
| II. Front-end sem bibliotecas de terceiros | Kit próprio, sem JavaScript inline nem bibliotecas (FR-019); vídeo no elemento de vídeo do HTML, hospedado no projeto, e nada carregado de CDN (FR-013, SC-006); Markdown convertido e sanitizado no servidor, sem script no resultado (FR-026); mobile-first (FR-021). | ✅ |
| III. PostgreSQL com SQL explícito | Conteúdo carregado por SQL; a mudança de esquema para vídeo está proposta e validada em PGlite, e entra no DDL e no Modelo Lógico no mesmo PR depois da revisão do mantenedor. | ⚠ P-01: proposta aguardando revisão |
| IV. Dados derivados não são armazenados | Quantidade de materiais e tempo estimado calculados (FR-005). | ✅ |
| V. Comando único | Conteúdo, vídeos e legendas disponíveis na primeira subida (FR-024). | ✅ |
| VI. LGPD e minimização | Nenhum dado pessoal coletado; nada sobre o estudo de cada pessoa é registrado. | ✅ |
| VII. Escopo do site final e ordem de entrega | Feature obrigatória (RF07); os trechos de flashcards (complemento 007) ficam ocultos (FR-017). | ✅ |
| VIII. Rastreabilidade | Requisitos citam RF07, RP07, RNF01, RNF02 e as telas 7 e 8. | ✅ |
| IX. Testes das regras críticas | Nenhuma regra crítica é tocada. | Não se aplica |
| X. Padrões de código | Textos e identificadores de domínio em português. | ✅ |
| XI. Interface fiel e acessível | Protótipo portado com o kit e as correções da identidade visual (FR-019); AA, foco, 44 px e menos movimento (FR-021, SC-008); vídeo com legendas e transcrição (FR-014). | ✅ |
