# Feature Specification: Base Executável do Portal

**Feature Branch**: `001-base-executavel`

**Created**: 2026-09-30

**Status**: Draft

**Input**: User description: "Preparar a base executável do portal: o sistema inteiro (aplicação e banco de dados) deve subir com um único comando a partir de um clone limpo do repositório, já com o esquema criado e com o conteúdo inicial carregado (12 temas, 4 questões por tema, cada questão com uma imagem e 4 alternativas A a D com exatamente uma correta, e o material de estudo de cada tema). Qualquer pessoa deve conseguir rodar o projeto seguindo apenas as instruções de instalação do README. Os dados do banco devem persistir entre reinicializações. Contexto detalhado em docs/dossie-sdd-borb.md, seção 4.1, e esquema oficial em db/01-ddl.sql."

**Requisitos atendidos**: RNF07, RP02, RP04, RP05, RP06, RNF06 (instalação); apoio a RF06
(carga das questões) e RF08 (regras das alternativas no banco), conforme dossiê seções 3 e 8.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subir o portal a partir de um clone limpo (Priority: P1)

Uma pessoa avaliadora (professor, orientador ou o próprio mantenedor em outra máquina) clona o
repositório, lê a seção de instalação do README, executa um único comando e, ao final, acessa o
portal pelo navegador no endereço indicado no README.

**Why this priority**: é o pré-requisito de todas as demais funcionalidades e a forma oficial de
avaliação do projeto (Princípio V da constituição). Sem isso nada mais pode ser demonstrado.

**Independent Test**: em uma máquina que tenha apenas os pré-requisitos listados no README,
clonar o repositório, executar o comando indicado e abrir o endereço informado; o portal
responde sem nenhum passo manual extra.

**Acceptance Scenarios**:

1. **Given** uma máquina com apenas os pré-requisitos do README e um clone recém-feito,
   **When** a pessoa executa o único comando de inicialização documentado,
   **Then** aplicação e banco ficam disponíveis e o portal responde no endereço indicado no README.
2. **Given** o sistema iniciado pela primeira vez,
   **When** a pessoa acessa o portal,
   **Then** ela vê uma página inicial do portal (não uma página de erro) confirmando que a
   aplicação está em funcionamento e conectada ao banco.
3. **Given** o README do repositório,
   **When** a pessoa segue somente a seção de instalação,
   **Then** ela não precisa instalar dependências de linguagem, criar tabelas, rodar scripts ou
   editar arquivos de configuração manualmente.

---

### User Story 2 - Encontrar o conteúdo inicial já carregado (Priority: P1)

Logo após a primeira inicialização, o banco já contém toda a base de conteúdo da certificação:
12 temas, 4 questões por tema (48 no total), cada questão com uma imagem e 4 alternativas
(A, B, C e D) com exatamente uma correta, e o material de estudo de cada tema.

**Why this priority**: o fluxo de certificação (sorteio de uma questão por tema) e a área de
estudos dependem desse conteúdo; um banco vazio torna o portal inutilizável.

**Independent Test**: após a primeira inicialização, consultar o banco (ou uma verificação
fornecida pelo projeto) e conferir as contagens e regras de integridade do conteúdo.

**Acceptance Scenarios**:

1. **Given** a primeira inicialização concluída,
   **When** o conteúdo é conferido,
   **Then** existem exatamente 12 temas, numerados de 1 a 12, com os nomes definitivos da
   tabela do desafio e uma descrição cada.
2. **Given** a primeira inicialização concluída,
   **When** questões, materiais e imagens são exibidos,
   **Then** é possível identificar que são conteúdo provisório; as alternativas são
   consideradas provisórias junto com a questão a que pertencem, sem marca própria.
3. **Given** a primeira inicialização concluída,
   **When** as questões são conferidas,
   **Then** cada tema possui exatamente 4 questões, cada questão tem enunciado, uma imagem
   própria (com texto alternativo) e exatamente 4 alternativas A, B, C e D, das quais
   exatamente uma é correta.
4. **Given** a primeira inicialização concluída,
   **When** o material de estudo é conferido,
   **Then** cada um dos 12 temas possui ao menos um material de estudo.
5. **Given** as imagens das questões cadastradas,
   **When** o portal solicita qualquer uma delas,
   **Then** o arquivo de imagem correspondente existe no repositório e é entregue sem erro.

---

### User Story 3 - Dados preservados entre reinicializações (Priority: P2)

O mantenedor para e reinicia o sistema (ou reinicia a máquina) e todos os dados gravados
durante o uso — cadastros de candidatos, certificações, respostas e certificados — continuam
lá. O conteúdo inicial não é duplicado nem recarregado por cima dos dados existentes.

**Why this priority**: sem persistência, candidatos perderiam provas e certificados já
emitidos deixariam de ser validáveis. É P2 porque só tem valor depois de P1.

**Independent Test**: inserir um registro de teste (ex.: um candidato), parar e reiniciar o
sistema com o comando documentado e verificar que o registro permanece e que as contagens de
conteúdo não mudaram.

**Acceptance Scenarios**:

1. **Given** dados gravados após a primeira inicialização,
   **When** o sistema é parado e iniciado novamente pelo comando documentado,
   **Then** todos os dados continuam presentes e inalterados.
2. **Given** um sistema já inicializado anteriormente,
   **When** ele é iniciado de novo,
   **Then** a carga inicial não é executada novamente (continuam 12 temas e 48 questões).
3. **Given** o README,
   **When** o mantenedor precisa voltar o banco ao estado inicial,
   **Then** o README descreve o procedimento de reset, deixando claro que ele apaga os dados.

---

### Edge Cases

- O mantenedor altera um script de carga e reinicia o sistema sem recriar o banco: a alteração
  não tem efeito (comportamento esperado de FR-011); o README explica como recriar o banco.
- A porta usada pelo portal ou pelo banco já está ocupada na máquina: o README informa quais
  portas são usadas e como alterá-las.
- A aplicação tenta se conectar antes de o banco terminar de inicializar: a aplicação aguarda
  o banco ficar pronto em vez de falhar definitivamente.
- A carga inicial falha no meio (ex.: questão com duas alternativas corretas): a inicialização
  é interrompida com mensagem clara e o banco não fica com conteúdo parcial considerado válido;
  se o sistema for iniciado de novo sobre esse banco, a página inicial e a verificação de
  saúde sinalizam "carga incompleta" (FR-013) e o README indica como recriar o banco.
- Uma questão aponta para um arquivo de imagem inexistente: a verificação de conteúdo acusa o
  problema antes da entrega.
- Pré-requisito ausente na máquina (ex.: ferramenta de execução não instalada): o README lista
  os pré-requisitos e a versão mínima de cada um.
- Credenciais do banco: o projeto sobe com valores padrão de desenvolvimento sem exigir a
  criação manual de um arquivo de configuração; valores reais nunca ficam versionados.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST subir aplicação e banco de dados com um único comando, a partir de
  um clone limpo, sem passos manuais adicionais (RNF07, RP05).
- **FR-002**: Na primeira inicialização, o banco MUST ser criado exatamente com o esquema
  oficial definido em `db/01-ddl.sql` (RP02).
- **FR-003**: Na primeira inicialização, o conteúdo inicial MUST ser carregado automaticamente
  por script SQL versionado no repositório, logo após o esquema.
- **FR-004**: O conteúdo inicial MUST conter exatamente 12 temas, com ordem de 1 a 12, nome e
  descrição (RF05).
- **FR-005**: O conteúdo inicial MUST conter exatamente 4 questões por tema (48 no total), cada
  uma com enunciado e uma imagem exclusiva com texto alternativo.
- **FR-006**: Cada questão MUST ter exatamente 4 alternativas, identificadas por A, B, C e D,
  com exatamente uma correta (RF08).
- **FR-007**: Cada tema MUST ter ao menos um material de estudo (RF07).
- **FR-008**: As imagens MUST ser armazenadas como arquivos versionados no repositório, com o
  banco guardando apenas o caminho de cada arquivo em `tbimagem.arquivo` (padrão D7 do dossiê,
  RP04); todo arquivo referenciado MUST existir e ser servido pelo portal.
- **FR-009**: Os 12 temas MUST entrar com nomes e ordem definitivos (dossiê seção 6):
  1 Fundamentos da Agilidade, 2 Manifesto Ágil, 3 Introdução ao Scrum, 4 Papéis do Scrum,
  5 Eventos do Scrum, 6 Artefatos do Scrum, 7 User Stories, 8 Gestão do Product Backlog,
  9 Kanban, 10 Planejamento Ágil, 11 Métricas Ágeis, 12 Qualidade em Projetos Ágeis. Questões, alternativas, materiais de estudo e imagens MUST ser
  conteúdo provisório no volume final completo e obedecendo a todas as regras de FR-004 a
  FR-008, para que a verificação de FR-016 rode contra o volume real. Questões, materiais e
  imagens MUST ser claramente identificáveis como provisórios; as alternativas são
  consideradas provisórias quando a sua questão é provisória e não recebem marca própria.
- **FR-009a**: As imagens provisórias MUST ser de autoria própria do projeto (ex.: ilustrações
  vetoriais geradas), sem dependência de licença de terceiros.
- **FR-009b**: O conteúdo provisório MUST ficar isolado do esquema, de modo que a futura carga
  definitiva o substitua sem nenhuma alteração no esquema.
- **FR-010**: Os dados do banco MUST persistir quando o sistema é parado e reiniciado.
- **FR-011**: A carga do esquema e do conteúdo inicial MUST ocorrer somente quando o banco
  ainda não existe; reinicializações NÃO DEVEM recriar tabelas nem duplicar conteúdo.
- **FR-012**: A aplicação MUST aguardar o banco estar pronto antes de atender requisições.
- **FR-013**: A aplicação MUST exibir uma página inicial que confirme estar em funcionamento e
  conectada ao banco, e que sinalize "carga incompleta" quando o conteúdo carregado diferir de
  12 temas, 48 questões e 192 alternativas.
- **FR-014**: O README MUST conter uma seção de instalação (RNF06) com: pré-requisitos (com
  versões mínimas), o comando único de inicialização, o endereço de acesso, as portas
  utilizadas, as variáveis de ambiente (nome, finalidade e valor padrão), como parar o sistema
  e como recriar o banco do zero.
- **FR-014a**: O README MUST avisar que alterações nos scripts de carga só têm efeito após
  recriar o banco do zero, e que esse procedimento apaga todos os dados gravados.
- **FR-015**: Senhas, credenciais e configurações sensíveis reais NÃO DEVEM ser versionadas; o
  projeto MUST funcionar com valores padrão de desenvolvimento sem configuração manual.
- **FR-016**: O projeto MUST oferecer uma verificação automatizada do conteúdo inicial que
  confirme as regras de FR-004 a FR-008.

### Key Entities *(include if feature involves data)*

- **Tema**: uma das 12 áreas da certificação; tem nome, descrição e ordem de 1 a 12.
- **Questão**: pertence a um tema; tem enunciado, justificativa opcional e exatamente uma
  imagem.
- **Alternativa**: pertence a uma questão; tem letra (A–D), texto e a indicação de ser ou não
  a correta.
- **Imagem**: arquivo ilustrativo com texto alternativo e crédito opcional; ilustra no máximo
  uma questão e pode ser usada por materiais de estudo.
- **Material de estudo**: pertence a um tema; tem título, conteúdo, tipo (texto, vídeo ou link)
  e ordem dentro do tema.
- **Candidato, Certificação, Resposta, Certificado**: criados pelo esquema nesta feature, mas
  vazios na carga inicial; são preenchidos pelo uso do portal em features futuras.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Uma pessoa que nunca viu o projeto consegue colocá-lo no ar seguindo apenas o
  README, executando 1 único comando após o clone, em até 10 minutos (excluindo o tempo de
  download inicial).
- **SC-002**: Em 100% das inicializações a partir de um clone limpo, o conteúdo carregado tem
  12 temas, 48 questões, 192 alternativas (48 corretas) e pelo menos 12 materiais de estudo.
- **SC-003**: 100% das imagens referenciadas pelo conteúdo são exibidas sem erro.
- **SC-004**: Após 3 ciclos seguidos de parar e reiniciar o sistema, 100% dos registros
  gravados continuam presentes e as contagens de conteúdo não mudam.
- **SC-005**: Após uma reinicialização com o banco já existente, o portal volta a responder em
  até 1 minuto, medido até a verificação de saúde do portal (página de status e banco
  conectado) passar, e não apenas até os serviços estarem iniciados.

## Assumptions

- Spec revisada contra `docs/dossie-sdd-borb.md` (seção 4.1, seção 6 e decisão D7).
- `db/01-ddl.sql` é o arquivo que o dossiê chama de `bdcertificacao.sql`.
- **Decisões abertas no dossiê (seção 7) que afetam esta feature**: D3 (quais 12 temas) e D7
  (imagem em arquivo com caminho no banco, frente ao RP04 "armazenar imagens das questões").
  Ambas seguem o padrão assumido e devem ser confirmadas com o professor; se D7 mudar para
  imagem dentro do banco, FR-008 e o esquema mudam.
- **Pendência registrada**: uma feature separada fornecerá o conteúdo definitivo (questões,
  alternativas, materiais e imagens), substituindo a carga provisória sem mudar o esquema.
- Imagens provisórias são de autoria própria; imagens de terceiros só entrarão na carga
  definitiva, com licença compatível e crédito registrado.
- O "comando único" é o definido pelo Princípio V da constituição (`docker compose up`); os
  pré-requisitos do README se limitam ao necessário para executá-lo e ao Git.
- A página inicial desta feature é mínima (status do portal); cadastro, prova, área de estudos
  e certificado são features seguintes.
- O mesmo arquivo de imagem pode ser reaproveitado por materiais de estudo, mas cada questão tem
  sua própria imagem, conforme o esquema.
- O ambiente-alvo é uma máquina de desenvolvimento ou de avaliação local; implantação em
  servidor público está fora do escopo desta feature.
