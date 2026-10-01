
# Portal de Certificação em Metodologias Ágeis — Constituição

Projeto acadêmico FATEC — ABP 1º DSM 2026-2.

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

### II. Front-end sem Frameworks, Mobile-First

- O front-end DEVE usar apenas HTML, CSS e JavaScript puros (RP01).
- É PROIBIDO usar React, Vue, Angular, jQuery, Bootstrap, Tailwind ou bibliotecas
  equivalentes de UI/CSS.
- Toda tela DEVE ser responsiva e projetada primeiro para dispositivos móveis (RNF01).

**Justificativa**: requisito da disciplina e foco no aprendizado dos fundamentos da web.

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

**Justificativa**: evita inconsistência entre respostas e resultados e segue a normalização
estudada em aula.

### V. Execução com um Único `docker compose up`

- A partir de um clone limpo, `docker compose up` DEVE subir toda a aplicação, incluindo o
  banco já criado e populado com a base de questões (RNF07, RP05).
- Nenhum passo manual adicional (instalar dependências, rodar scripts, criar tabelas) é
  aceitável para a execução padrão.

**Justificativa**: reprodutibilidade para avaliação docente e em qualquer máquina.

### VI. LGPD e Minimização de Dados

- Dados pessoais coletados DEVEM se limitar a CPF, nome, e-mail e senha (RNF03).
- Senhas DEVEM ser armazenadas apenas como hash bcrypt; nunca em texto puro ou em logs.
- O aceite dos termos de uso DEVE ser registrado (com data/hora) no cadastro.
- Páginas públicas (ex.: validação de certificado) DEVEM exibir o CPF apenas mascarado no
  formato `***.456.789-**` (somente o 4º ao 9º dígito visíveis) e NUNCA exibem o e-mail,
  nem parcialmente.

**Justificativa**: conformidade com a LGPD e redução do impacto de eventuais vazamentos.

### VII. Escopo de MVP

- O MVP é o atendimento integral de RF01 a RF21 e RP01 a RP09 do documento do desafio,
  incluindo a área de estudos (RF07), a validação pública do certificado via QR Code
  (RF19, RP08) e o histórico (RF20).
- "Extra" é apenas o que NÃO consta no documento do desafio (ex.: PDF gerado no servidor,
  recuperação de senha, painel administrativo).
- Extras só entram após o MVP estar completo e aprovado pelo mantenedor (RP09).
- A carga de conteúdo (temas, questões, alternativas) é feita via SQL.

**Justificativa**: prazo acadêmico curto; cumprir todo o desafio antes de qualquer adição.

### VIII. Rastreabilidade de Requisitos

- Toda spec, tarefa e PR DEVE citar os IDs de requisito que atende (RFxx, RNFxx, RPxx).
- Trabalho sem requisito associado DEVE ser justificado ou recusado.

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

## Restrições Técnicas e de Escopo

- **Banco**: PostgreSQL; esquema em `db/01-ddl.sql`; carga inicial de questões
  versionada no repositório e aplicada automaticamente pelo container.
- **Front-end**: HTML, CSS e JavaScript puros, servidos pela aplicação ou por container
  próprio.
- **Back-end**: responsável por autenticação, sorteio, cronometragem, correção e emissão de
  certificados; expõe API documentada.
- **Infraestrutura**: `docker compose` é o único meio oficial de execução.
- **Fora do MVP (extras, Princípio VII)**: tudo que não consta no documento do desafio, como
  PDF gerado no servidor, recuperação de senha e painel administrativo. Coleta de dados
  pessoais além dos listados no Princípio VI é proibida em qualquer fase.

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

**Version**: 2.0.2 | **Ratified**: 2026-09-30 | **Last Amended**: 2026-10-01
