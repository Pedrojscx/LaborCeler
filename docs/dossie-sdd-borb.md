# Dossiê-fonte SDD: Portal de Certificação em Metodologias Ágeis (BorB)
> **Nota:** a seção 2 registra o texto original da constituição; a versão em vigor é `.specify/memory/constitution.md` (3.0.1), que prevalece em caso de divergência.


Versão 1.0 (30/09/2026). Fonte para o Claude Code gerar as specs com GitHub Spec Kit.
Documentos de origem: Desafio ABP 1º DSM 2026-2 (versão 29/06/2026), Modelo Conceitual v2.0 e Modelo Lógico/Físico (30/09/2026, Pedro Lucas).

Convenção deste dossiê: **[FONTE]** é texto do desafio; **[DECIDIDO]** é decisão já tomada pela equipe; **[PADRÃO]** é suposição assumida e ainda aberta (ver seção 7); **[SUGESTÃO]** é recomendação técnica para o /speckit.plan.

---

## 0. Como usar este dossiê no Claude Code

1. Rodar `specify init --here --ai claude` na raiz do repositório.
2. Colar a seção 2 como argumento de `/speckit.constitution`.
3. Para cada feature da seção 4, na ordem, rodar `/speckit.specify` com o bloco "Prompt specify". Cada feature vira uma branch `00N-nome` e uma pasta em `specs/`.
4. Rodar `/speckit.clarify` e responder com o bloco "Respostas para clarify" da feature.
5. Rodar `/speckit.plan` com a seção 5 (stack e arquitetura) mais o bloco "Notas de plano" da feature.
6. `/speckit.tasks`, `/speckit.analyze` (recomendado, checa consistência spec x plan x tasks) e só então `/speckit.implement`.
7. Manter este arquivo em `docs/dossie-sdd-borb.md` e citar o caminho nos prompts, para o agente consultar os detalhes.

Observação: dependendo da versão instalada, os comandos no Claude Code podem aparecer como `/speckit-specify` (hífen) em vez de `/speckit.specify`. Mesmo comportamento.

---

## 1. Contexto do projeto

- Projeto ABP do 1º semestre de DSM, FATEC Jacareí. Parceiro interno; contato Prof. Antonio Egydio São Thiago Graça; focal point Prof. Marcelo Augusto Sudo.
- Produto: portal onde um candidato se cadastra, estuda por uma área de estudos organizada em 12 temas e faz uma certificação de 12 questões (uma por tema, sorteada de um banco de 4 por tema), com cronômetro de 150 s por questão. Com aproveitamento ≥ 65% recebe certificado eletrônico com QR Code validável publicamente.
- Objetivo educacional [FONTE]: integrar Figma, HTML/CSS/JS, back-end, PostgreSQL, Docker, modelagem de dados, Scrum e produção de uma base de questões de qualidade.
- Cronograma [FONTE]:
  - Sprint 1: 28/09 a 22/10/2026
  - Sprint 2: 23/10 a 05/11/2026
  - Sprint 3: 06/11 a 25/11/2026
  - Apresentação final: 26/11/2026
- A base de questões (48 questões, 48 imagens, material de estudo dos 12 temas) é critério de avaliação [FONTE RNF08] e é trabalho de conteúdo, não de código. Deve correr em paralelo desde a Sprint 1.

---

## 2. Insumo para /speckit.constitution

```
Projeto acadêmico FATEC (ABP 1º DSM 2026-2): Portal de Certificação em Metodologias Ágeis. Princípios não negociáveis:

1. Servidor é a autoridade. Nota, acertos, sorteio, cronômetro e situação de cada resposta são calculados e validados exclusivamente no back-end. O front-end nunca recebe a alternativa correta antes de a questão estar encerrada e nunca envia nota, acerto ou tempo restante como dado confiável (RNF04).
2. Front-end sem frameworks: apenas HTML, CSS e JavaScript puros (RP01). Sem React, Vue, Angular, jQuery, Bootstrap ou Tailwind. Responsivo e mobile-first (RNF01).
3. Banco PostgreSQL com SQL explícito (DDL e DML escritos à mão, RP02). Sem ORM. Consultas sempre parametrizadas. O esquema oficial é o bdcertificacao.sql da equipe; mudanças no esquema exigem atualização do modelo lógico.
4. Dados derivados não são armazenados: nota, percentual, aprovação e progresso são calculados a partir das respostas.
5. Tudo roda com `docker compose up` a partir de um clone limpo, incluindo banco já populado com a base de questões (RNF07, RP05).
6. LGPD (RNF03): coletar só CPF, nome, e-mail e senha; senha com hash bcrypt; registrar aceite dos termos; páginas públicas nunca exibem CPF ou e-mail completos.
7. Escopo de MVP (RP09): o fluxo completo de certificação tem prioridade sobre qualquer extra. Nada de painel administrativo; carga de conteúdo via SQL.
8. Rastreabilidade: toda spec, tarefa e PR cita os IDs de requisito (RFxx, RNFxx, RPxx) que atende.
9. Qualidade mínima: regras de negócio críticas (sorteio, prazo de 150 s, uma resposta por tema, cálculo de nota, emissão de certificado) têm testes automatizados. Definition of Done: código revisado por outro membro, testes passando, funciona via docker compose, documentação da API atualizada, requisito marcado no backlog.
10. Código e identificadores de banco em português, seguindo o padrão das aulas (tabelas tbxxx, PK id, FK id+tabela). Commits pequenos e descritivos em Git.
```

---

## 3. Mapa de features (uma spec por feature)

| Spec | Feature | Requisitos | Sprint |
|---|---|---|---|
| 001 | Infraestrutura, banco e carga inicial | RNF07, RP02, RP04, RP05, RP06, RNF06 (instalação) | 1 |
| 002 | Tela inicial, cadastro e login | RF01, RF02, RF03, RF04, RNF01, RNF03 | 1 |
| 003 | Área de estudos | RF07, RP07 | 1 e 2 |
| 004 | Fluxo da certificação | RF05, RF06, RF08 a RF15, RF21, RNF02, RNF04 | 2 |
| 005 | Resultado, certificado e validação pública | RF16, RF17, RF18, RF19, RP08 | 3 |
| 006 | Histórico do candidato | RF20 | 3 |
| (transversal) | Documentação da API e funcionalidades | RNF05, RNF06 | 3 |

Dependências: 001 antes de tudo; 002 antes de 004; 004 antes de 005 e 006; 003 é independente de 004.

---

## 4. Features

### 4.1 Spec 001: Infraestrutura, banco e carga inicial

**Prompt specify**
```
Preparar a base executável do portal: o sistema inteiro (aplicação e banco de dados) deve subir com um único comando a partir de um clone limpo do repositório, já com o esquema criado e com o conteúdo inicial carregado (12 temas, 4 questões por tema, cada questão com uma imagem e 4 alternativas A a D com exatamente uma correta, e o material de estudo de cada tema). Qualquer membro da equipe ou o professor deve conseguir rodar o projeto seguindo apenas as instruções de instalação do README. Os dados do banco devem persistir entre reinicializações.
```

**Regras e critérios de aceite**
- Após `docker compose up` em máquina limpa, o portal responde no navegador e a consulta `select count(*) from tbquestao` retorna 48.
- Cada tema tem exatamente 4 questões; cada questão tem 1 imagem e 4 alternativas com exatamente 1 correta (garantido pelas constraints do bdcertificacao.sql e verificado por um script de checagem da carga).
- O README contém pré-requisitos, comando de subida, URL de acesso, como reiniciar o banco do zero e variáveis de ambiente.

**Respostas para clarify**
- Imagens: arquivos no repositório (pasta de estáticos) com o caminho registrado em tbimagem.arquivo [PADRÃO, ver D7].
- Carga: scripts SQL executados na criação do volume do Postgres.

**Notas de plano**
- Scripts em `db/` montados em `/docker-entrypoint-initdb.d/`: `01-ddl.sql` (bdcertificacao.sql), `02-seed-temas-materiais.sql`, `03-seed-questoes.sql`. Esses scripts só rodam com volume vazio; documentar `docker compose down -v` para recriar.
- Healthcheck no serviço do banco e `depends_on: condition: service_healthy` no app.
- `.env.example` com `DATABASE_URL`, `JWT_SECRET`, `PUBLIC_BASE_URL`, `PORT`.

---

### 4.2 Spec 002: Tela inicial, cadastro e login

**Prompt specify**
```
Visitantes chegam a uma tela inicial que apresenta a certificação em metodologias ágeis: descrição, objetivos, regras (12 temas, uma questão por tema, 150 segundos por questão, resposta única, aprovação com 65% ou mais, certificado com QR Code) e instruções. A partir dela o visitante pode se cadastrar, entrar, ir para a área de estudos ou validar um certificado. O cadastro pede CPF, nome completo, e-mail, senha e aceite dos termos de uso e privacidade; o CPF identifica o candidato de forma única e deve ser válido. O login é feito exclusivamente com CPF e senha. Depois de entrar, o candidato decide se inicia a certificação agora ou volta depois, podendo estudar antes.
```

**Regras e critérios de aceite**
- CPF aceito com ou sem máscara; armazenado só com os 11 dígitos; dígitos verificadores validados; CPFs de dígitos repetidos (111.111.111-11) rejeitados.
- CPF duplicado gera mensagem clara sem revelar outros dados do titular.
- Senha mínima de 8 caracteres [PADRÃO]; armazenada com bcrypt.
- Login com e-mail é recusado (RF04).
- Mensagem de erro de login é genérica ("CPF ou senha inválidos").
- Sem tela de edição de perfil [DECIDIDO].
- Cadastro não inicia a certificação; iniciar é ação explícita (RF02).

**Respostas para clarify**
- Recuperação de senha: fora do escopo do MVP.
- Tempo de sessão: 8 horas [PADRÃO].
- Termos de uso: texto estático em página própria; data de aceite gravada em tbcandidato.data_aceite_termos.

**Notas de plano**
- Autenticação com JWT em cookie httpOnly, SameSite=Lax, Secure quando em HTTPS [SUGESTÃO]. Front e API na mesma origem, sem CORS.
- Rate limit simples no login (ex.: 5 tentativas por minuto por IP) [SUGESTÃO].

---

### 4.3 Spec 003: Área de estudos

**Prompt specify**
```
O portal oferece uma área de estudos organizada pelos mesmos 12 temas da certificação, na mesma ordem. Cada tema tem uma descrição e uma lista ordenada de materiais (texto didático, vídeo ou link), que podem conter imagens explicativas. O conteúdo deve ser coerente com as questões cadastradas para o tema, de modo que quem estudou o material consiga responder às questões. A área de estudos é acessível sem iniciar a certificação, e o candidato pode voltar a ela entre um tema e outro da prova.
```

**Regras e critérios de aceite**
- Lista dos 12 temas por tbtema.ordem; página do tema lista materiais por tbmaterial.ordem.
- Imagens de material com texto alternativo (acessibilidade).
- Material do tipo VIDEO ou LINK abre externo em nova aba.
- Acesso público ou só logado: [PADRÃO] público (favorece RF02, "estudar antes").

**Respostas para clarify**
- Conteúdo em texto é armazenado como HTML simples ou Markdown convertido no servidor? [PADRÃO] Markdown em tbmaterial.conteudo, renderizado no back-end com sanitização.

**Notas de plano**
- Cada material de texto deve apontar, no mínimo, os conceitos cobrados pelas 4 questões do tema (checklist de coerência para a equipe de conteúdo, RP07).

---

### 4.4 Spec 004: Fluxo da certificação (núcleo do projeto)

**Prompt specify**
```
Um candidato autenticado inicia sua certificação, composta por 12 temas percorridos em ordem. Para cada tema, o sistema sorteia uma das 4 questões do banco daquele tema e a exibe com enunciado, imagem, quatro alternativas (A, B, C, D) e um cronômetro regressivo de 150 segundos visível o tempo todo. O candidato escolhe uma alternativa e confirma; a partir daí não pode mudar. Ao encerrar a questão (por resposta ou por fim do tempo), o sistema mostra se acertou e qual era a alternativa correta, com justificativa quando houver. Se o tempo acabar sem resposta, a questão é encerrada automaticamente e conta como erro. Após cada questão encerrada, o candidato escolhe entre seguir para o próximo tema ou encerrar a sessão e continuar depois, retomando no próximo tema ainda não respondido. Cada tema só pode ser respondido uma vez. Se a questão for interrompida (perda de conexão, fechamento do navegador ou qualquer outra interrupção) ela é considerada encerrada e não pode ser respondida de novo. O candidato acompanha seu progresso vendo quais temas já concluiu e quais faltam. Nenhuma manipulação da página pode alterar o resultado.
```

**Regras de negócio (servidor)**
- R1. Uma certificação por candidato [PADRÃO D1, reflete o unique em tbcertificacao.idcandidato].
- R2. Temas em ordem crescente de tbtema.ordem [PADRÃO]; o próximo tema é o de menor ordem sem resposta.
- R3. Sorteio no servidor no momento da exibição, uniforme entre as 4 questões do tema; o registro em tbresposta (situacao EXIBIDA, data_hora_exibicao = now()) é criado nesse momento [DECIDIDO P4].
- R4. No máximo uma resposta EXIBIDA por certificação a qualquer momento.
- R5. Prazo: `data_hora_exibicao + 150 s`, sempre pelo relógio do servidor. O front recebe o tempo restante em segundos e só faz a contagem visual.
- R6. Resposta recebida dentro do prazo → RESPONDIDA com idalternativa e data_hora_resposta. Recebida após o prazo → EXPIRADA, alternativa descartada. Tolerância de latência de 2 s [SUGESTÃO, registrar no plano].
- R7. Encerramento por tempo é preguiçoso: qualquer requisição que encontre uma EXIBIDA com prazo vencido a converte em EXPIRADA antes de prosseguir.
- R8. Interrupção [PADRÃO D6, interpretação literal do RF14]: a questão é entregue ao navegador uma única vez. Se o candidato pedir a questão de novo (recarregar, reabrir, outra aba) enquanto ela está EXIBIDA, ela passa a INTERROMPIDA e conta como erro. Encerrar a sessão entre questões (RF12) é pausa sem penalidade.
- R9. EXPIRADA e INTERROMPIDA contam como erro [PADRÃO D4].
- R10. O payload da questão nunca inclui qual alternativa é correta nem a justificativa; ambas só são enviadas após o encerramento.
- R11. Ao encerrar o 12º tema, grava tbcertificacao.data_conclusao e dispara o cálculo de resultado (spec 005).
- R12. Uma resposta por tema por certificação é garantida no banco pelo trigger tg_uma_resposta_por_tema, além da checagem no serviço.

**Critérios de aceite**
- Com o front adulterado (ex.: alterar o timer no console, enviar alternativa de outra questão, reenviar resposta), o servidor recusa e o resultado não muda.
- Responder aos 149 s é aceito; aos 155 s vira EXPIRADA.
- Fechar a aba no meio da questão e voltar: a questão aparece como encerrada/incorreta, com a correta exibida, e o fluxo segue no próximo tema.
- Progresso mostra 12 temas com estado: concluído, pendente, atual.
- Dois pedidos simultâneos de "próxima questão" não geram duas respostas (teste de concorrência).

**Respostas para clarify**
- Ordem dos temas: fixa, pela ordem cadastrada.
- Candidato pode pular tema? Não.
- Mostra a nota parcial durante a prova? Não; mostra só acertou/errou da questão atual e o progresso.

**Notas de plano**
- Operações de exibir e responder dentro de transação; `SELECT ... FOR UPDATE` na certificação para serializar o candidato.
- Front: `setInterval` de 1 s para exibição; ao zerar, chama o endpoint de encerramento e mostra a correta.

---

### 4.5 Spec 005: Resultado, certificado e validação pública

**Prompt specify**
```
Ao concluir os 12 temas, o sistema calcula automaticamente o resultado do candidato: número de acertos, nota final e percentual de acertos. Com aproveitamento de 65% ou mais, emite automaticamente um certificado eletrônico com nome completo, CPF, e-mail, data e hora de emissão, nota final, percentual de acertos e um QR Code. O candidato pode ver e imprimir/salvar o certificado. O QR Code leva a uma página pública de validação, acessível sem login, que confirma se o certificado é autêntico e mostra os dados essenciais sem expor dados pessoais completos. Códigos inválidos mostram claramente que o certificado não foi encontrado. Candidatos abaixo de 65% veem o resultado e não recebem certificado.
```

**Regras e critérios de aceite**
- 65% de 12 = 7,8 → aprovação exige **8 acertos** (8/12 = 66,7%); 7 acertos = 58,3% reprova. Teste de fronteira obrigatório.
- Nota [PADRÃO D2]: escala 0 a 10 com uma casa decimal (acertos ÷ 12 × 10); percentual com uma casa decimal.
- Certificado emitido uma única vez (unique em tbcertificado.idcertificacao); codigo_validacao é UUID gerado pelo banco.
- Página pública de validação exibe: nome completo, CPF mascarado (`***.456.789-**`), data de emissão, nota e percentual. Nunca e-mail nem CPF completo (LGPD).
- O certificado do próprio candidato (área logada) exibe todos os campos do RF18.
- O QR aponta para `PUBLIC_BASE_URL/validar/<codigo_validacao>`.

**Respostas para clarify**
- Formato do certificado: página HTML com CSS de impressão (o candidato usa "Salvar como PDF") [SUGESTÃO]. PDF gerado no servidor fica como extra se sobrar tempo.
- Dados do certificado vêm do cadastro atual, sem cópia [DECIDIDO, sem edição de perfil].

**Notas de plano**
- QR gerado no servidor com a biblioteca `qrcode` (data URL embutido na página).
- `PUBLIC_BASE_URL` configurável: na apresentação, um celular só consegue abrir o QR se a URL usar o IP da máquina na rede local, nunca `localhost`. Testar isso antes de 26/11.

---

### 4.6 Spec 006: Histórico do candidato

**Prompt specify**
```
O candidato consulta o histórico da sua certificação: para cada tema respondido, a questão sorteada, a alternativa que escolheu (ou a indicação de que o tempo expirou ou a questão foi interrompida), a alternativa correta e a data e hora da resposta. O histórico existe independentemente de aprovação ou reprovação e mostra também o resultado final quando a certificação estiver concluída.
```

**Regras e critérios de aceite**
- Histórico montado a partir de tbresposta + tbquestao + tbalternativa; nada duplicado.
- Questão EXIBIDA em andamento não aparece no histórico (evita vazar a correta).
- Data e hora exibidas em fuso America/Sao_Paulo.

---

## 5. Insumo para /speckit.plan (comum a todas as features)

**Stack [DECIDIDO/SUGESTÃO]**
- Node.js LTS (24 na data deste dossiê; confirmar a LTS vigente no momento do init) + Express 5.
- `pg` (node-postgres) com SQL puro, sem ORM.
- `bcrypt`, `jsonwebtoken`, `cookie-parser`, `qrcode`, `express-rate-limit`, `helmet`.
- Validação de entrada com funções próprias ou `zod` no back-end (RP01 restringe só o front).
- PostgreSQL 16 (imagem oficial), igual ao usado nos testes do DDL.
- Testes: `node:test` + `supertest`, rodando contra um banco de teste em container.
- Documentação da API: `openapi.yaml` servido com `swagger-ui-express` em `/api/docs` (RNF06).

**Arquitetura**
- Dois containers: `db` (postgres) e `app` (Node), orquestrados pelo Compose. O Express serve a API em `/api/*` e o front estático em `/`. Mesma origem, sem CORS, sem container extra.
- Camadas no back-end: rotas → controllers → services (regras) → repositories (SQL).

**Estrutura sugerida**
```
/
├── docker-compose.yml
├── .env.example
├── README.md
├── docs/ (dossie-sdd-borb.md, openapi.yaml, modelo conceitual/lógico)
├── db/ (01-ddl.sql, 02-seed-temas-materiais.sql, 03-seed-questoes.sql)
├── app/
│   ├── Dockerfile
│   ├── src/ (server.js, routes/, controllers/, services/, repositories/, middlewares/)
│   ├── public/ (index.html, css/, js/, img/questoes/, img/materiais/)
│   └── test/
└── .specify/ e specs/ (Spec Kit)
```

**Rascunho de endpoints**

| Método | Rota | Auth | Função |
|---|---|---|---|
| POST | /api/auth/cadastro | não | RF03 |
| POST | /api/auth/login | não | RF04 |
| POST | /api/auth/logout | sim | encerra sessão |
| GET | /api/auth/me | sim | dados do candidato logado |
| GET | /api/temas | não | lista dos 12 temas |
| GET | /api/temas/:id/materiais | não | RF07 |
| POST | /api/certificacao | sim | inicia (idempotente) |
| GET | /api/certificacao | sim | estado e progresso (RF21) |
| POST | /api/certificacao/questao | sim | exibe próxima questão ou marca INTERROMPIDA (R3, R8) |
| POST | /api/respostas/:id | sim | envia alternativa, retorna correção (RF09) |
| POST | /api/respostas/:id/encerrar | sim | fim do tempo, retorna correta (RF11) |
| GET | /api/certificacao/resultado | sim | RF16, RF17 |
| GET | /api/certificado | sim | certificado completo (RF18) |
| GET | /api/validacao/:codigo | não | validação pública mascarada (RF19) |
| GET | /api/historico | sim | RF20 |

**Modelo de dados**: usar exatamente o bdcertificacao.sql (tabelas tbtema, tbimagem, tbmaterial, tbmaterial_por_imagem, tbquestao, tbalternativa, tbcandidato, tbcertificacao, tbcertificado, tbresposta, com constraints, índice parcial e trigger descritos no Modelo Lógico de 30/09). Qualquer divergência encontrada durante o plano vira item de decisão, não alteração silenciosa.

---

## 6. Temas da certificação [PADRÃO D3]

Temas 1 a 12 da lista sugerida no desafio, nesta ordem:

1. Fundamentos da Agilidade
2. Manifesto Ágil
3. Introdução ao Scrum
4. Papéis do Scrum
5. Eventos do Scrum
6. Artefatos do Scrum
7. User Stories
8. Gestão do Product Backlog
9. Kanban
10. Planejamento Ágil
11. Métricas Ágeis
12. Qualidade em Projetos Ágeis

Ficam fora: XP, Ferramentas, Boas Práticas e Aplicação Prática (13 a 16). Conteúdo e exemplos de imagem por tema estão na tabela do desafio.

Checklist por questão (RNF08): enunciado contextualizado em cenário; imagem necessária para responder (não decorativa); distratores plausíveis; uma única correta sem ambiguidade; justificativa curta; coerência com o material do tema; imagem com crédito ou autoria própria.

---

## 7. Decisões abertas (padrão assumido, confirmar com o professor)

| ID | Pergunta | Padrão assumido | Impacto se mudar |
|---|---|---|---|
| D1 (Q1) | Tentativa única por candidato? | Sim, uma certificação por candidato. O texto do desafio fala em "retomar" e em "todas as avaliações" no histórico, o que pode indicar múltiplas tentativas. | Remover unique de tbcertificacao.idcandidato; histórico e certificado passam a ser por tentativa. Custo baixo agora, alto após a Sprint 2. |
| D2 (Q2) | Nota de 0 a 12 ou 0 a 10? | 0 a 10 com uma casa, já que RF18 lista nota e percentual como campos distintos. | Só a função de cálculo e a exibição. |
| D3 (Q3) | Quais 12 dos 16 temas? | Temas 1 a 12 da tabela. | Seed e conteúdo; decidir antes de produzir questões. |
| D4 (Q4) | Interrupção conta como erro? | Sim (RF11 e RF14). | Só o cálculo. |
| D5 (Q5) | Edição de nome/e-mail? | Não há; certificado lê do cadastro. | Se houver edição, tbcertificado precisa guardar cópia dos dados. |
| D6 | Recarregar a página durante a questão conta como interrupção? E a perda de conexão? | Sim, leitura literal do RF14. Alternativa: permitir retomar dentro do mesmo prazo de 150 s, que é mais amigável mas contraria o texto. Perda de conexão (interpretação do RF14, spec 004): o servidor só percebe a interrupção quando a questão é pedida de novo ou o prazo vence; por isso a regra exibida é "Fechar ou recarregar a página durante uma questão a encerra como erro. Se a conexão cair, o tempo continua contando no servidor: se a resposta não chegar até o fim do prazo, a questão conta como erro." | Regra R8, textos da tela 9 e da pergunta frequente e testes. |
| D7 | Imagens das questões no banco (bytea) ou em arquivo com caminho no banco? | Arquivo + caminho em tbimagem.arquivo. RP04 diz "armazenar imagens das questões"; confirmar se o caminho satisfaz. | Troca de coluna e do endpoint de imagem. |
| D8 | Área de estudos exige login? | Não. | Middleware de rota. |

Sugestão de ação: levar D1, D3, D6 e D7 ao Prof. Sudo até o fim da primeira semana da Sprint 1; são as que custam caro se mudarem tarde.

---

## 8. Rastreabilidade

| Req | Spec | Req | Spec |
|---|---|---|---|
| RF01 | 002 | RF16 | 005 |
| RF02 | 002 | RF17 | 005 |
| RF03 | 002 | RF18 | 005 |
| RF04 | 002 | RF19 | 005 |
| RF05 | 004 | RF20 | 006 |
| RF06 | 004 (+001 seed) | RF21 | 004 |
| RF07 | 003 | RNF01 | todas (front) |
| RF08 | 004 (+001 constraints) | RNF02 | 004 |
| RF09 | 004 | RNF03 | 002, 005 |
| RF10 | 004 | RNF04 | 004, 005 |
| RF11 | 004 | RNF05 | constitution, processo |
| RF12 | 004 | RNF06 | 001, transversal |
| RF13 | 004 | RNF07 | 001 |
| RF14 | 004 | RNF08 | conteúdo (seção 6) |
| RF15 | 004 | RP01 a RP09 | constitution, 001, 003, 005 |

---

## 9. Riscos

- **Conteúdo atrasar o código**: 48 questões com imagem própria de qualidade é o item mais trabalhoso e é avaliado. Dividir por tema entre os membros já na Sprint 1.
- **Regra de tempo implementada no front**: se o cronômetro decidir algo no cliente, RNF04 falha na banca. A spec 004 é o ponto a revisar com mais cuidado.
- **QR Code na apresentação**: `localhost` no QR não abre no celular do avaliador. Configurar `PUBLIC_BASE_URL` e ensaiar.
- **Volume do Postgres "velho"**: alterar os seeds sem recriar o volume não tem efeito; documentar no README.
- **Decisão D1 tardia**: mudar para múltiplas tentativas depois da Sprint 2 afeta resultado, certificado e histórico.
