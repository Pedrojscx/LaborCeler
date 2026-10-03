# Telas do Lunar Celer

Versão 1.5 (03/10/2026). Descreve as telas do protótipo (canvas do projeto, acesso do mantenedor: https://claude.ai/artifact/5MK3DegETGbv3t81EsqtZF) para orientar specs e implementação. Tokens, componentes e regras visuais estão em `docs/identidade-visual.md`. Requisitos citados pelo ID de `docs/requisitos-desafio.md`.

Convenções: as rotas são sugestões para o plano de cada feature; "Logado" significa que a tela exige sessão e redireciona para Entrar sem ela; textos entre colchetes são dados dinâmicos ou pendências.

Datas e horas (regra de escrita para todas as telas): em tabelas, no formato "14/11/2026 19:02"; em frases, no formato "15/11/2026 às 14:23"; sempre no horário de Brasília, pelo relógio do servidor. Data sem hora: "14/11/2026".

Disponibilidade (regra geral, FR-050 da spec da 002): as telas podem descrever qualquer funcionalidade a qualquer momento, mas textos que afirmam disponibilidade ("a área de estudos é aberta", "com uma conta você tem...") e links que levam direto a um recurso só aparecem quando ele existe; links para recursos ainda não entregues levam à tela 6.

---

## Estrutura comum

**Cabeçalho público:** marca Lunar Celer à esquerda; à direita, link "Voltar ao início" (páginas internas), links "Início" e "Entrar" (área de estudos e página do tema) ou, na tela inicial, abas deslizantes (Scrum, Trilha, Método, Sobre) e o botão "Entrar".

**Cabeçalho logado:** marca (leva à área do candidato); links "Área de estudos", "Flashcards", nome do candidato (leva ao perfil) e botão "Sair".

**Cabeçalho de foco** (questão, correção e revisão de flashcards): só a marca, sem link, e à direita o tema atual e a saída explícita ("Interromper" ou "Encerrar revisão"). Evita que um clique distraído tire a pessoa da tarefa.

**Rodapé:** estado do portal discreto (ponto verde e "Portal no ar e banco conectado"; se o banco falhar, aviso de instabilidade), "Projeto acadêmico da Fatec Jacareí", links "Termos de uso e privacidade" e "Validar certificado". As telas de foco não têm rodapé.

**Fundo:** céu estrelado animado em todas as telas, parado na tela da questão e com redução de movimento.

---

## Mapa

| # | Tela | Rota sugerida | Acesso | Feature | Requisitos |
|---|---|---|---|---|---|
| 1 | Tela inicial | `/` | Público | 002 | RF01, RF02 |
| 2 | Criar conta | `/cadastro` | Público | 002 | RF03, RNF03 |
| 3 | Entrar | `/entrar` | Público | 002 | RF04 |
| 4 | Área do candidato | `/candidato` | Logado | 002 e 004 | RF02, RF13, RF21 |
| 5 | Termos de uso e privacidade | `/termos` | Público | 002 | RNF03 |
| 6 | Disponível em breve | `/em-breve` | Público | 002 (temporária) | |
| 7 | Área de estudos | `/estudos` | Público | 003 | RF07, RP07 |
| 8 | Página do tema | `/estudos/:tema` | Público | 003 | RF07, RP07 |
| 9 | Antes de começar | `/certificacao/inicio` | Logado | 004 | RF02, RF05, RF10 |
| 10 | Questão com cronômetro | `/certificacao/questao` | Logado | 004 | RF05, RF06, RF08, RF10, RF14 |
| 11 | Correção da questão | `/certificacao/correcao` | Logado | 004 | RF09, RF11, RF12, RF14 |
| 12 | Resultado final | `/certificacao/resultado` | Logado | 005 | RF16, RF17 |
| 13 | Certificado | `/certificado` | Logado | 005 | RF18 |
| 14 | Validação pública | `/validar` e `/validar/:codigo` | Público | 005 | RF19, RP08 |
| 15 | Histórico | `/historico` e `/historico/:numero` | Logado | 006 | RF20 |
| 16 | Flashcards: escolher | `/flashcards` | Logado | 007 | complemento |
| 17 | Flashcards: revisão | `/flashcards/revisao` | Logado | 007 | complemento |
| 18 | Flashcards: fim da sessão | `/flashcards/resumo` | Logado | 007 | complemento |
| 19 | Perfil e evolução | `/perfil` | Logado | 007 | complemento |
| 20 | Página não encontrada | qualquer rota inexistente | Público | 008 | |
| 21 | Notificações | componente | Todas | 002 | |

Enquanto a feature 003 não existir, os links para as telas 7 e 8 levam provisoriamente à tela 6, exceto "Começar pelos estudos", que leva à seção da trilha na própria tela inicial.

As notificações (21) são infraestrutura do kit de interface, entregue na feature 002, e não complemento; a 008 fica só com a página não encontrada (20).

---

## 1. Tela inicial

Seções, na ordem:

1. **Hero.** À esquerda: título "Um aprendizado astronômico"; parágrafo com as regras em linguagem direta (12 temas, uma questão por tema, 150 segundos por questão, certificado com QR Code para 65% ou mais); botões "Criar minha conta" (principal) e "Começar pelos estudos"; bloco "Como funciona" com três passos numerados (Estude os 12 temas, Responda dentro do tempo, Alcance 65% de acertos). À direita: Lua em rede com cinco rótulos de vidro (Google, Salesforce, Spotify, Saab, Adobe) e o cartão de fato abaixo, que mostra "Quem usa Scrum." até a pessoa interagir.
2. **O que é Scrum.** Definição em uma frase (framework leve, ciclos curtos chamados Sprints de no máximo um mês), os três pilares do empirismo, blocos recolhíveis com as três responsabilidades e os três artefatos com seus compromissos, a Sprint desenhada como órbita com os quatro eventos numerados e o link "Aprofundar em Terra · Introdução ao Scrum". Conteúdo fiel ao Scrum Guide 2020.
3. **A trilha.** Os 12 corpos celestes em ordem, com tamanho relativo e o nome do tema, cada um levando à página do seu tema (tela 8).
4. **Por que estudar aqui funciona.** Grade em bento: bloco largo com o princípio "Estudar e depois se testar" (efeito de testagem), ilustração do ciclo Estudar e Responder em volta da Lua e o botão "Começar pelos estudos"; três blocos menores (correção na hora, situações reais, progresso visível). Sem números de eficácia não medidos.
5. **Entre e use 100% do Lunar Celer.** Convite para criar conta, explicando que a área de estudos é aberta e listando o que a conta libera: flashcards, evolução por tema, conquistas e a certificação. Botões "Criar minha conta" e "Já tenho conta".
6. **De onde vem este portal.** Origem acadêmica na ABP do 1º semestre de DSM da Fatec Jacareí (Centro Paula Souza), o problema que motivou o projeto e o aviso de que o certificado não substitui certificações oficiais de Scrum. Ficha: instituição, curso, programa, orientação (Prof. Antonio Egydio, Prof. Marcelo Sudo e Prof. Arley Souza), colaboradores (Pedro Lucas) e tecnologias.
7. **Perguntas frequentes.** Itens recolhíveis: estudar antes, pausar, internet caindo ("O tempo continua contando no servidor: se a resposta não chegar até o fim do prazo, a questão conta como erro. Já fechar ou recarregar a página encerra a questão na hora, e o histórico registra o horário. Os temas já respondidos continuam salvos."), refazer a certificação ("Sim, se você não for aprovado. Uma nova tentativa fica disponível 24 horas depois do fim da anterior, com as questões sorteadas de novo, dando preferência às que você ainda não viu.") e como conferir um certificado.
8. **Chamada final.** "Sua jornada começa em Mercúrio", com os dois botões.

## 2. Criar conta

Grade em bento. Bloco largo: à esquerda, Lua nova apagada, título "Criar conta" e os avisos "Sua Lua começa nova" e "Criar a conta não inicia a prova"; à direita, formulário: CPF (com ou sem pontuação, teclado numérico), nome completo ("do jeito que deve aparecer no certificado"), e-mail, senha e confirmação lado a lado com botão de mostrar, aceite obrigatório dos termos com link. Blocos menores: "Já tem conta?" e "Como seus dados são usados".

Estados: normal; erros por campo; CPF já cadastrado (sem revelar dados do titular, com atalho para Entrar); senha longa demais para o limite de 72 bytes.

## 3. Entrar

Mesmo bento. Formulário só com CPF e senha (com mostrar e ocultar) e o aviso de que não há recuperação de senha nesta versão. Blocos menores: "Ainda não tem conta?" e "Quer estudar antes?".

Estados: normal; erro genérico ("CPF ou senha inválidos"); bloqueio por excesso de tentativas, sem revelar se o CPF existe; tentativa com e-mail ("O login é feito com o CPF cadastrado").

## 4. Área do candidato

Bloco largo com saudação, título e texto que mudam com a situação, e à direita a Lua grande com a trilha de 12 marcos. Blocos menores: "Estudar antes" e "Antes de cada questão".

Estados: não iniciada ("Sua Lua ainda está nova", botão "Iniciar a certificação", aviso de que a primeira questão começa só após confirmar); em andamento ("Você parou em [tema]", botão "Continuar a certificação" e, abaixo do aviso do botão, o link "Ver meu histórico"); aprovada (Lua cheia, botões "Ver meu certificado" e "Ver meu histórico"); reprovada (resultado, revisão pelos temas errados e "Você pode tentar de novo a partir de [data e hora], 24 horas depois do fim desta tentativa."); nova tentativa disponível, 24 horas depois da conclusão de uma tentativa reprovada ("Você pode tentar de novo", "Sua tentativa anterior ficou em [percentual]. A nova tentativa começa do primeiro tema, com a Lua nova outra vez.", botão "Iniciar nova tentativa", aviso de que as questões são sorteadas de novo, dando preferência às que a pessoa ainda não viu, link "Ver meu histórico" abaixo desse aviso, Lua nova e "0 de 12 temas concluídos"). O cabeçalho logado não tem link para o histórico. Quem é aprovado não refaz; há no máximo uma certificação em andamento por candidato.

## 5. Termos de uso e privacidade

Índice lateral e texto em linguagem simples: quem somos; dados coletados (cadastro e respostas); para que são usados (o endereço de rede só no momento do acesso, para limitar tentativas, sem gravação); o que fica público (nome, CPF mascarado, resultado e data na validação; e-mail nunca); por quanto tempo (os dados ficam guardados enquanto a conta existir; a exclusão pode ser pedida a qualquer momento e é atendida em até 15 dias; ao fim do projeto acadêmico, a base é apagada); direitos pela LGPD; contato [e-mail exclusivo do projeto, ainda a criar; nunca as issues públicas do repositório].

## 6. Disponível em breve

Ilustração de eclipse, título e texto conforme a funcionalidade, botões para a área do candidato e para o início. Variações: estudos (003), certificação (004), validação (005), histórico (006) e, para os links "Flashcards" e nome do candidato do cabeçalho logado, flashcards e perfil (007, FR-024 da spec da 002). Flashcards: título "Os flashcards estão a caminho" e texto "A revisão dos 12 temas com cartões de pergunta e resposta chega numa próxima versão do Lunar Celer." Perfil: título "O perfil está a caminho" e texto "Sua evolução nos estudos e as suas conquistas chegam numa próxima versão do Lunar Celer." Histórico: título "O histórico está a caminho" e texto "O registro completo das suas tentativas, questão por questão, chega numa próxima versão do Lunar Celer."; recebe os botões "Ver o histórico completo" (tela 12) e "Ver meu histórico" (tela 4) até a feature 006 existir. Temporária: cada variação some quando a sua feature é entregue; depois da 006, a página fica só para flashcards e perfil e some com a 007.

## 7. Área de estudos

Aberta a qualquer pessoa, com ou sem conta. Título "Área de estudos" e texto de apresentação ("Os 12 temas da certificação, na mesma ordem da prova. Cada tema tem textos, imagens e indicações para aprofundar, e tudo aqui é aberto, com ou sem conta."). Abaixo, a trilha do Sistema Solar com os 12 corpos na ordem da prova, no mesmo desenho da trilha da tela inicial, cada corpo levando à página do seu tema. Depois, a grade de cartões, um por tema: "Tema [n]", o corpo celeste com sua cor (Saturno com anel), o nome no formato "Corpo · Tema" e "[n] materiais · cerca de [n] min de leitura", calculados a partir dos materiais; o cartão leva à página do tema. No fim, o aviso da licença do conteúdo didático (CC BY-SA 4.0, com atribuição ao Scrum Guide 2020).

Cabeçalho: o visitante vê a marca e os links "Início" e "Entrar"; o candidato conectado vê o cabeçalho logado, com "Área de estudos" marcado como página atual.

Estados: visitante; candidato conectado. Com a feature 007, o candidato conectado passa a ver o bloco "Próximo foco" (tema de menor domínio, com "Estudar [corpo]") e, em cada cartão, a barra "Flashcards dominados [n] de [n]"; o visitante passa a ver o convite "Quer fixar o que estudou?", com "Criar minha conta" e "Entrar". Antes da 007, esses blocos ficam ocultos (regra de disponibilidade).

## 8. Página do tema

Aberta a qualquer pessoa. Caminho "Área de estudos › Corpo · Tema"; cabeçalho do tema com "Tema [n] de 12 · Corpo", o nome do tema, a descrição e "[n] materiais · cerca de [n] min de leitura". Sumário "Neste tema" com os materiais em ordem e o tipo de cada um (Texto, Vídeo ou Leitura externa); cada item leva ao material na própria página.

Materiais, na ordem do tema:

- **Texto:** título, texto com intertítulos, figuras com legenda e texto alternativo (com crédito, se forem de terceiros) e, quando houver, o destaque "Para lembrar". Escrito em Markdown e convertido no servidor.
- **Vídeo:** arquivo do próprio portal, parado até a pessoa reproduzir, com reproduzir e pausar, tempo decorrido e total, legendas em português e tela cheia. Legenda em português ligada por padrão, que funciona também com os controles nativos do navegador. Junto dele, nos vídeos gerados com NotebookLM, o aviso "Vídeo gerado com NotebookLM e revisado pela equipe do projeto" e, quando baseado no Scrum Guide, a atribuição a Ken Schwaber e Jeff Sutherland (CC BY-SA 4.0); a duração e "legendas em português"; e o bloco recolhível "Ler a transcrição". Opcional por tema.
- **Leitura externa:** título, frase sobre o que a pessoa vai encontrar e link para a fonte primária, que abre em outra aba e avisa isso ("abre em outra aba").

No fim, a navegação "Tema anterior" e "Próximo tema", com corpo e nome (o tema 1 não tem anterior; o 12 não tem próximo), e o aviso da licença do conteúdo.

Estados: visitante; candidato conectado; tema sem vídeo; vídeo indisponível (aviso no lugar do vídeo, transcrição mantida). Com a feature 007, antes da navegação aparece "Revise o que estudou" (candidato conectado, com o domínio dos cartões do tema e "Revisar [corpo]") ou "Revise com flashcards" (visitante, com "Entrar"); antes da 007, esses blocos ficam ocultos.

## 9. Antes de começar

Lista das seis regras em linguagem direta (12 temas em ordem, 150 segundos, resposta única, sair da página encerra a questão aberta, pausa permitida entre temas, aprovação com 8 acertos) e cartão lateral com o tema que vai começar (o primeiro, Mercúrio · Fundamentos da Agilidade, ou, na retomada, o próximo tema pendente), botão "Começar agora" e "Voltar e estudar mais". A regra sobre sair da página diz: "Fechar ou recarregar a página durante uma questão a encerra como erro, e o histórico registra o horário em que isso aconteceu. Se a conexão cair, o tempo continua contando no servidor: se a resposta não chegar até o fim do prazo, a questão conta como erro." A certificação só é criada ao confirmar "Começar agora".

## 10. Questão com cronômetro

Cabeçalho de foco com "Tema [n] de 12" e "Interromper", que pede confirmação numa caixa de diálogo da própria página, avisando que a questão aberta contará como erro; ao confirmar, a pessoa vai para a correção no estado "interrompida". Coluna do tempo: Lua dentro do anel do cronômetro, tempo em número, "restantes de 02:30", trilha de 12 marcos e o aviso de que o tempo é contado pelo servidor. Coluna da questão: chip do tema, enunciado, imagem em painel claro com legenda, quatro alternativas como botões de opção reais (A a D) e o botão "Confirmar resposta", desativado até escolher, com o aviso de que não é possível trocar depois.

Estados: tempo normal; menos de 30 segundos (anel e número em vermelho e aviso escrito). O céu fica parado nesta tela.

## 11. Correção da questão

Faixa de resultado com ícone e texto; chip, enunciado e alternativas marcadas ("Alternativa correta", "Sua resposta", "Correta, sua resposta"); bloco "Por que a alternativa [X]" com a justificativa; e o painel "O que você quer fazer agora?" (RF12) com trilha, próximo tema, "Seguir para o próximo tema" e "Encerrar a sessão e continuar depois".

Estados: resposta certa; resposta errada; tempo esgotado; questão encerrada por interrupção (depois de "Interromper" ou de recarregar a questão). Todos terminam na mesma escolha de seguir ou encerrar; na correção do 12º tema, o painel mostra os 12 temas concluídos e leva à área do candidato.

## 12. Resultado final

Lua cheia, título e texto conforme o resultado; três números (acertos de 12, percentual e nota de 0 a 10, igual ao percentual dividido por 10, com uma casa decimal); lista tema a tema com "Acertou", "Errou" ou "Tempo esgotado".

Estados: aprovado (botões "Ver meu certificado" e "Ver o histórico completo"); reprovado ("faltaram [n] acertos", "Revisar os temas que errei" e "Uma nova tentativa fica disponível 24 horas depois do fim desta, e até lá a área de estudos e os flashcards ajudam a revisar os temas que você errou."; a menção aos flashcards só aparece com a feature 007, pela regra de disponibilidade).

## 13. Certificado

Botões "Imprimir ou salvar em PDF" e "Copiar link de validação" (confirma com notificação). Documento claro com todos os campos do RF18: nome completo, CPF, e-mail, acertos, percentual, nota, data e hora de emissão, código de validação, QR Code, selo lunar e o aviso de projeto acadêmico. A versão impressa sai sem cabeçalho, botões nem fundo escuro.

## 14. Validação pública

Campo "Código do certificado" e botão "Validar"; quem chega pelo QR Code vê o código preenchido e o resultado direto.

Estados: entrada; certificado autêntico (nome, CPF mascarado como `***.456.789-**`, resultado, nota e data; e-mail nunca); nenhum certificado encontrado.

## 15. Histórico

Todas as tentativas do candidato (decisão D1). Com duas ou mais, a lista "Suas tentativas", da mais recente para a mais antiga, mostra cada uma com "Tentativa [n]" e a data de conclusão e o percentual (em andamento: a data de início e "em andamento"); a mais recente aparece aberta e as outras podem ser escolhidas. Cada tentativa tem endereço próprio com o número da tentativa do candidato (`/historico/2`), nunca o identificador interno do banco; `/historico` abre a mais recente.

Resumo da tentativa aberta: início, conclusão, resultado ("10 de 12 (83,3%)"), nota ("8,3") e situação ("Aprovado, certificado emitido" ou "Reprovado, sem certificado"); em andamento, "Concluída em: Em andamento", "Resultado: O resultado sai ao concluir os 12 temas", sem nota, e "Situação: Em andamento, [n] de 12 temas concluídos". Tabela com uma linha por tema encerrado, na ordem da prova: tema, questão sorteada (enunciado longo recolhido, com opção de expandir), sua resposta ("Acertou", "Errou", "Tempo esgotado: sem resposta" ou "Interrompida: sem resposta", com a alternativa escolhida quando houver), resposta correta e data e hora (da resposta, do fim do prazo ou da interrupção). Nas linhas de erro, tempo esgotado ou interrupção, "Revisar o tema" leva à página do tema na área de estudos. A questão aberta de uma tentativa em andamento não aparece. Botões "Ver meu certificado" (só na tentativa aprovada) e "Voltar para a área do candidato". Sem nenhuma tentativa: "Você ainda não começou a certificação. Cada tema aparece aqui depois de encerrado." No celular, a tabela rola para o lado dentro do próprio contêiner.

## 16. Flashcards: escolher

Grade dos 12 temas como botões de seleção múltipla, cada um com o total de cartões e quantos a pessoa domina; opções "Só os que ainda não domino" e "Todos os cartões dos temas escolhidos"; tamanho da sessão (10, 20 ou todos); resumo da sessão e "Começar revisão". Na sessão, os cartões avaliados como "Não sabia" ou "Quase" voltam antes dos outros.

Estado de visitante: a grade aparece esmaecida e um cartão de vidro diz "Entre para usar 100% do Lunar Celer", com "Criar minha conta" e "Entrar", lembrando que a área de estudos continua aberta.

## 17. Flashcards: revisão

Cabeçalho de foco com "Encerrar revisão"; progresso "Cartão [n] de [total]"; cartão grande com chip do tema e a frente; "Mostrar resposta" vira o cartão em 3D; no verso, a resposta e três botões de autoavaliação: "Não sabia", "Quase" e "Sabia". Teclado: espaço vira o cartão; 1, 2 e 3 avaliam.

## 18. Flashcards: fim da sessão

Quatro números (sabia, quase, não sabia, novos dominados), domínio por tema revisado com o ganho da sessão, botões "Revisar os [n] que errei", "Escolher outros temas" e "Ver minha evolução", e a notificação "Sessão salva".

## 19. Perfil e evolução

Coluna de conquistas: número grande de conquistas desbloqueadas, três em destaque (a do meio mais alta) com raridade ("[x]% dos estudantes", exibida só a partir de 30 contas ativas) e a lista completa com anel de progresso nas que estão em andamento e a data nas obtidas. Coluna de evolução: domínio por tema (12 barras), cartões dominados nos últimos 14 dias e "Próximo foco" com o tema de menor domínio.

Conquistas iniciais: Primeira órbita (primeira revisão concluída), Explorador de [corpo] (todos os cartões de um tema dominados, uma por tema), Meio caminho (cartões dominados em 6 temas), Cem revisões, Constância (revisões em 5 dias diferentes, não precisam ser seguidos), Sistema completo (todos os cartões dos 12 temas) e Lua cheia (aprovação na certificação).

Regras de cálculo: tudo derivado do histórico, sem dado calculado armazenado (Princípio IV). Cartão dominado: as duas últimas avaliações dele foram "Sabia". A data de uma conquista é o momento em que a condição passou a valer.

## 20. Página não encontrada

"Erro 404", título "Esta página caiu num buraco negro", texto curto, botões "Voltar ao início" e "Validar um certificado" e a ilustração do buraco negro.

## 21. Notificações

Componente descrito em `docs/identidade-visual.md`, seção 8.1, e implementado no kit de interface (`docs/kit-interface.md`), entregue na feature 002; cada feature usa o componente nos seus próprios eventos. Usos previstos: conta criada, sessão de flashcards salva, conquista desbloqueada, link copiado, conexão instável e falha ao salvar.

---

## Pendências que afetam telas

- **D9** (limite de tentativas): sem limite por enquanto; afeta as telas 4 e 12 se mudar. As decisões D1, D2, D3 e D6 foram resolvidas em 03/10/2026 (dossiê, seção 7).
- Contato privado (e-mail exclusivo do projeto, ainda a criar): tela 5. Sem ele, a feature 002 não pode ser entregue.
- Termos (tela 5): incluir as revisões de flashcards e a evolução entre os dados coletados, na spec da feature 007 (Princípio VI).
