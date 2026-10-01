# Requisitos do desafio

Transcrição integral da seção "Requisitos" do documento do desafio da ABP:
**Portal de Certificação em Metodologias Ágeis**, FATEC Jacareí, 1º DSM, 2026-2
(arquivo `Desafio 1DSM - 2026-2.pdf`, versão do documento de 29/06/2026).

O texto dos requisitos é literal. As listas com marcadores do PDF foram reproduzidas como
listas em Markdown. Esta é a fonte para o conteúdo de qualquer RF, RNF ou RP citado nas specs,
tarefas e PRs (constituição, Princípio VIII); em caso de divergência, vale o PDF original.

## Requisitos Funcionais

**RF01**: O sistema deverá apresentar uma tela inicial contendo a descrição da certificação, seus
objetivos e instruções para realização da avaliação.

**RF02**: O candidato poderá optar por iniciar imediatamente a certificação ou retornar
posteriormente.

**RF03**: O sistema deverá permitir o cadastro do candidato utilizando CPF (identificador único),
nome completo, e-mail e senha.

**RF04**: O login deverá ser realizado exclusivamente por meio do CPF e da senha cadastrados.

**RF05**: A certificação deverá ser composta por 12 temas, sendo apresentada uma questão para cada
tema.

**RF06**: Cada tema deverá possuir um banco contendo exatamente 4 questões, das quais apenas
uma será sorteada aleatoriamente para cada candidato.

**RF07**: O portal deverá disponibilizar uma área de estudos organizada pelos mesmos 12 temas da
certificação, contendo conteúdo didático, imagens e demais recursos que auxiliem o candidato na
aprendizagem antes da realização da prova.

**RF08**: Todas as questões deverão possuir obrigatoriamente:

- uma imagem ilustrativa ou de análise;
- quatro alternativas (A, B, C e D);
- apenas uma alternativa correta.

**RF09**: Após responder uma questão, o sistema deverá informar ao candidato qual era a alternativa
correta.

**RF10**: Cada questão deverá ser apresentada juntamente com um cronômetro regressivo de 150
segundos, visível ao candidato durante toda a resolução.

**RF11**: Ao término do tempo de 150 segundos, caso o candidato não tenha enviado sua resposta, a
questão deverá ser encerrada automaticamente, considerada incorreta e o sistema deverá
apresentar a alternativa correta antes de prosseguir para o próximo tema ou permitir que o
candidato interrompa a certificação.

**RF12**: Após cada resposta, o sistema deverá perguntar ao candidato se deseja prosseguir
imediatamente para o próximo tema ou encerrar a sessão.

**RF13**: O candidato poderá interromper a certificação a qualquer momento e retomá-la
posteriormente a partir do próximo tema ainda não respondido.

**RF14**: Caso ocorra perda de conexão, fechamento do navegador, expiração do tempo da questão
ou qualquer outra interrupção durante sua resolução, a questão será considerada encerrada, não
podendo ser respondida novamente.

**RF15**: Cada tema poderá ser respondido apenas uma única vez.

**RF16**: Após a conclusão dos 12 temas, o sistema deverá calcular automaticamente a nota final da
certificação.

**RF17**: O sistema deverá emitir automaticamente um certificado eletrônico apenas para os
candidatos que obtiverem aproveitamento igual ou superior a 65% na certificação.

**RF18**: O sistema deverá emitir um certificado eletrônico contendo, no mínimo:

- nome completo;
- CPF;
- e-mail;
- data e hora de emissão;
- nota final obtida;
- percentual de acertos;
- QR Code para validação da autenticidade do certificado.

**RF19**: O sistema deverá disponibilizar uma funcionalidade para validação pública do certificado
utilizando o QR Code.

**RF20**: O sistema deverá manter o histórico da certificação contendo:

- temas respondidos;
- questão sorteada;
- resposta escolhida;
- resposta correta;
- data e horário de cada resposta.

**RF21**: O sistema deverá permitir que o candidato acompanhe seu progresso na certificação,
indicando os temas já concluídos e os ainda pendentes.

## Requisitos Não Funcionais

**RNF01**: A interface deverá ser responsiva e compatível com dispositivos móveis.

**RNF02**: O sistema deverá apresentar tempo de resposta adequado durante o carregamento das
páginas e das questões.

**RNF03**: Os dados pessoais deverão ser armazenados em conformidade com a LGPD.

**RNF04**: O sistema deverá impedir alterações indevidas na nota da certificação por manipulação do
front-end.

**RNF05**: O projeto deverá utilizar práticas básicas de desenvolvimento ágil, incluindo
gerenciamento do Product Backlog, planejamento em Sprints, versionamento em Git e utilização de
critérios de pronto (Definition of Done).

**RNF06**: O projeto deverá possuir documentação mínima contendo:

- modelo de dados;
- instruções de instalação;
- documentação da API;
- descrição das funcionalidades implementadas.

**RNF07**: O sistema deverá ser desenvolvido utilizando arquitetura baseada em containers Docker,
permitindo a execução da aplicação por meio do Docker Compose.

**RNF08**: A base de questões desenvolvida será considerada parte integrante do projeto e será
utilizada como um dos critérios de avaliação, considerando aspectos como qualidade técnica,
contextualização, clareza, coerência com o tema e qualidade das imagens utilizadas.

## Restrições de Projeto

**RP01**: O front-end deverá ser desenvolvido utilizando HTML, CSS e JavaScript, sem utilização de
frameworks.

**RP02**: O banco de dados deverá ser PostgreSQL, utilizando comandos DDL e DML.

**RP03**: O back-end deverá implementar todas as funcionalidades necessárias para comunicação
entre o banco de dados e o front-end utilizando tecnologia compatível com aplicações Web
modernas.

**RP04**: O sistema deverá armazenar, no mínimo:

- usuários;
- temas;
- questões;
- imagens das questões;
- alternativas;
- respostas dos candidatos;
- certificados;
- histórico da certificação.

**RP05**: Toda a aplicação deverá ser executada utilizando containers Docker, incluindo, no mínimo,
os serviços de aplicação e banco de dados, orquestrados por meio do Docker Compose.

**RP06**: Cada tema deverá possuir exatamente quatro questões, e cada questão deverá conter uma
imagem associada.

**RP07**: O conteúdo disponibilizado na área de estudos deverá estar organizado pelos mesmos 12
temas da certificação, mantendo coerência entre o material didático apresentado e as questões
cadastradas no banco de dados.

**RP08**: O QR Code presente no certificado deverá direcionar para uma página de validação do
certificado, permitindo verificar sua autenticidade.

**RP09**: O escopo do projeto deverá ser compatível com o tempo disponível para desenvolvimento
durante o semestre, priorizando um MVP funcional, porém contemplando integralmente o fluxo
de certificação descrito neste documento.
