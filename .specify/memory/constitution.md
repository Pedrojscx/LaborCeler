# Lunar Celer — Constituição

Lunar Celer, portal de certificação em metodologias ágeis. Projeto acadêmico FATEC — ABP 1º DSM
2026-2.

## Core Principles

### I. Servidor é a Autoridade (NÃO NEGOCIÁVEL)

- Nota, acertos, sorteio de questões, cronômetro e situação de cada resposta DEVEM ser
  calculados e validados exclusivamente no back-end.
- O front-end NUNCA recebe a alternativa correta antes de a questão estar encerrada
  (respondida ou com prazo expirado).
- O front-end NUNCA envia nota, acerto ou tempo restante como dado confiável; qualquer valor
  desse tipo vindo do cliente DEVE ser ignorado ou recalculado pelo servidor.
- O início e o prazo de cada questão DEVEM ser registrados com o horário do servidor.

**Justificativa**: garante a integridade da certificação contra manipulação no navegador
(RNF04).

### II. Front-end sem Bibliotecas de Terceiros, Mobile-First

- O front-end DEVE usar apenas HTML, CSS e JavaScript puros (RP01).
- É PROIBIDO usar no front-end qualquer biblioteca de terceiros, incluindo frameworks de
  interface (React, Vue, Angular, jQuery), de CSS (Bootstrap, Tailwind), de animação e de 3D
  (three.js) ou equivalentes.
- Animações DEVEM ser feitas só com CSS e JavaScript puro, com Canvas 2D e SVG quando houver
  desenho.
- Fontes, imagens, folhas de estilo e scripts DEVEM ser hospedados no próprio projeto. É
  PROIBIDO carregá-los de CDN ou de outro domínio: o portal DEVE funcionar sem internet.
- Todo comportamento DEVE ficar em arquivos `.js`, ligado aos elementos com
  `addEventListener`. É PROIBIDO JavaScript inline (código em `<script>` dentro do HTML,
  atributos como `onclick` e links `javascript:`).
- Toda tela DEVE ser responsiva e projetada primeiro para dispositivos móveis (RNF01).

**Justificativa**: requisito da disciplina (RP01) e foco nos fundamentos da web; sem CDN, a
apresentação não depende da rede; sem script inline, a CSP pode bloquear todo código injetado
na página.

### III. PostgreSQL com SQL Explícito, sem ORM

- O banco é PostgreSQL; DDL e DML DEVEM ser escritos à mão (RP02).
- É PROIBIDO usar ORM ou geradores de consulta que ocultem o SQL.
- Toda consulta com dados externos DEVE ser parametrizada; concatenação de valores em SQL é
  proibida.
- O esquema oficial é o `db/01-ddl.sql` do projeto. Qualquer mudança no esquema DEVE vir
  acompanhada da atualização do modelo lógico no mesmo PR.

**Justificativa**: requisito da disciplina, prevenção de SQL injection e fonte única de
verdade para o modelo de dados.

### IV. Dados Derivados Não São Armazenados

- Nota, percentual, aprovação e progresso NÃO DEVEM ser persistidos como colunas; DEVEM ser
  calculados a partir das respostas registradas (consultas ou views).
- Domínio de cartões (e o domínio por tema que dele resulta), conquistas e as datas em que
  foram obtidas NÃO DEVEM ser persistidos; DEVEM ser calculados a partir do histórico de
  revisões de flashcards. Conquista que dependa da certificação (ex.: "Lua cheia", aprovação)
  é calculada a partir das respostas registradas, também sem armazenamento.

**Justificativa**: evita inconsistência entre o que foi registrado e o que é exibido e segue a
normalização estudada em aula.

### V. Execução com um Único `docker compose up`

- A partir de um clone limpo, `docker compose up` DEVE subir toda a aplicação, incluindo o
  banco já criado e populado com a base de questões (RNF07, RP05).
- Nenhum passo manual adicional (instalar dependências, rodar scripts, criar tabelas) é
  aceitável para a execução padrão.

**Justificativa**: reprodutibilidade para avaliação docente e em qualquer máquina.

### VI. LGPD e Minimização de Dados

- Os dados cadastrais DEVEM se limitar a CPF, nome, e-mail e senha (RNF03). Além deles, o
  portal só registra dados gerados pelo uso (ex.: respostas da certificação, revisões de
  flashcards, aceite dos termos).
- Senhas DEVEM ser armazenadas apenas como hash bcrypt; nunca em texto puro ou em logs.
- O aceite dos termos de uso DEVE ser registrado (com data/hora) no cadastro.
- As revisões de flashcards e a evolução (domínio e conquistas) são dados pessoais: DEVEM ser
  visíveis só para o dono da conta e NUNCA aparecem em página pública nem para outro usuário.
- Estatísticas entre usuários (ex.: raridade das conquistas) DEVEM ser sempre agregadas, sem
  identificar ninguém, e só são exibidas a partir de 30 contas ativas; abaixo disso, ficam
  ocultas.
- Páginas públicas (ex.: validação de certificado) DEVEM exibir o CPF apenas mascarado no
  formato `***.456.789-**` (somente o 4º ao 9º dígito visíveis) e NUNCA exibem o e-mail,
  nem parcialmente.
- O canal de contato para pedidos sobre dados pessoais DEVE ser privado (ex.: e-mail dedicado
  do projeto); NUNCA as issues públicas do repositório.

**Justificativa**: conformidade com a LGPD e redução do impacto de eventuais vazamentos; com
poucas contas, uma estatística "agregada" ainda permitiria deduzir o que uma pessoa fez, e um
pedido em issue pública exporia o próprio titular.

### VII. Escopo do Site Final e Ordem de Entrega

- O escopo é o site final: RF01 a RF21, RNF01 a RNF08 e RP01 a RP09 de
  `docs/requisitos-desafio.md`, mais os complementos descritos em `docs/telas.md`:
  flashcards, perfil e conquistas e página 404. As notificações não são complemento: são
  componente de base do kit de interface, entregue com a feature 002.
- A ordem de implementação é obrigatória: primeiro as features que atendem os requisitos do
  desafio (002 a 006); depois os complementos (007 e 008).
- Nenhum complemento PODE ser implementado antes de as features 002 a 006 estarem concluídas
  e validadas em clone limpo (Princípio V).
- O que não consta nos requisitos nem em `docs/telas.md` (ex.: PDF gerado no servidor,
  recuperação de senha, painel administrativo) está fora do escopo e só entra por emenda a
  este princípio.
- A carga de conteúdo (temas, questões, alternativas e cartões de flashcards) é feita via SQL.
- "MVP" nos artefatos do Spec Kit (ex.: "MVP desta feature" em `tasks.md`) designa só o
  primeiro incremento testável de uma feature, nunca o escopo do projeto.

**Justificativa**: mantém a RP09, que pede priorizar o fluxo completo de certificação no
prazo: os complementos só consomem tempo depois que esse fluxo está entregue e validado.

### VIII. Rastreabilidade de Requisitos

- Toda spec, tarefa e PR DEVE citar os IDs de requisito que atende (RFxx, RNFxx, RPxx).
- Complementos (Princípio VII), que não têm ID no desafio, DEVEM citar o número da tela de
  `docs/telas.md` que atendem (ex.: "complemento, tela 16").
- Trabalho sem requisito nem tela associada DEVE ser justificado ou recusado.

**Justificativa**: permite comprovar a cobertura dos requisitos na avaliação da ABP.

### IX. Testes das Regras de Negócio Críticas

- As seguintes regras DEVEM ter testes automatizados: sorteio de questões, prazo de 150 s por
  questão, uma resposta por tema, cálculo de nota e emissão de certificado.
- Um PR que altere qualquer dessas regras DEVE incluir ou atualizar os testes
  correspondentes, e todos DEVEM passar.

**Justificativa**: são as regras que determinam a validade de um certificado.

### X. Padrões de Código, Banco e Versionamento

- Identificadores de domínio, identificadores de banco de dados, mensagens e textos exibidos ao
  usuário DEVEM estar em português.
- Nomes estruturais da stack (ex.: `server.js`, `app.js`, `config.js`, `db.js`, `routes/`,
  `repositories/`, `test/`) seguem a convenção do ecossistema Node/Express.
- Banco segue o padrão das aulas: tabelas com prefixo `tb` (ex.: `tbusuario`), chave primária
  `id`, chave estrangeira `id` + nome da tabela referenciada (ex.: `idusuario`).
- Commits no Git DEVEM ser pequenos, coesos e com mensagem descritiva.

**Justificativa**: consistência com o material da disciplina e histórico legível.

### XI. Interface Fiel à Identidade Visual e Acessível

- A fonte oficial da interface é `docs/identidade-visual.md` (versão 2.0), `docs/telas.md` e
  o protótipo em `docs/prototipo/`.
- O protótipo DEVE ser portado, não redesenhado: layout, textos e estilos vêm dele, adaptados
  às regras do Princípio II e aos tokens da identidade visual.
- Em caso de divergência entre essas fontes, vale `docs/identidade-visual.md`.
- Toda tela DEVE ter contraste mínimo AA em todo texto, foco visível e alvos de toque de pelo
  menos 44 px, e toda animação DEVE respeitar `prefers-reduced-motion`.

**Justificativa**: uma referência única evita redesenho a cada feature e decisões visuais
improvisadas; os critérios de acessibilidade garantem que qualquer candidato consiga fazer a
prova, inclusive no celular (RNF01).

## Restrições Técnicas e de Escopo

- **Banco**: PostgreSQL; esquema em `db/01-ddl.sql`; carga inicial de questões
  versionada no repositório e aplicada automaticamente pelo container.
- **Front-end**: HTML, CSS e JavaScript puros, sem bibliotecas de terceiros nem recursos de
  CDN (Princípio II), servidos pela aplicação ou por container próprio.
- **Interface**: `docs/identidade-visual.md` 2.0, `docs/telas.md` e `docs/prototipo/`
  (Princípio XI).
- **Back-end**: responsável por autenticação, sorteio, cronometragem, correção e emissão de
  certificados; expõe API documentada.
- **Infraestrutura**: `docker compose` é o único meio oficial de execução.
- **Fora do escopo (Princípio VII)**: tudo que não consta nos requisitos do desafio nem em
  `docs/telas.md`, como PDF gerado no servidor, recuperação de senha e painel administrativo.
  Coleta de dados cadastrais além dos listados no Princípio VI é proibida em qualquer caso.

## Fluxo de Desenvolvimento e Definition of Done

Um item só está **pronto** quando TODOS os critérios abaixo são atendidos:

1. Autoverificação concluída (ver abaixo).
2. Testes automatizados passando, incluindo os exigidos pelo Princípio IX.
3. Funciona a partir de um clone limpo com `docker compose up`.
4. Documentação da API atualizada quando houver endpoint novo ou alterado.
5. Requisito correspondente marcado no backlog, com IDs citados no PR.

**Autoverificação**: antes de cada merge na `main`, o próprio autor DEVE conferir
explicitamente os Princípios I, III, IV e VI, que são os de maior risco. O Claude Code PODE ser
usado como revisor nessa conferência.

## Governance

- Esta constituição prevalece sobre quaisquer outras práticas do projeto. Em conflito, ela
  vence.
- **Emendas**: propostas via PR que altere este arquivo, com justificativa, e decididas
  pelo mantenedor do repositório; se afetarem requisitos da disciplina (RP/RNF), o orientador
  DEVE ser consultado.
- **Versionamento** (SemVer):
  - MAJOR: remoção ou redefinição incompatível de princípio.
  - MINOR: novo princípio/seção ou ampliação material de orientação.
  - PATCH: esclarecimentos e correções de redação.
- **Conformidade**: toda spec e plano (`/speckit-plan`) DEVE passar pelo "Constitution Check";
  desvios DEVEM ser registrados e justificados no plano, com alternativa mais simples
  considerada.

**Version**: 3.0.1 | **Ratified**: 2026-09-30 | **Last Amended**: 2026-10-02
