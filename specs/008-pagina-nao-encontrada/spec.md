# Feature Specification: Página Não Encontrada

**Feature Branch**: `008-pagina-nao-encontrada`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "Qualquer endereço de página que não existe no portal mostra a página "Esta página caiu num buraco negro", com a ilustração do buraco negro, um texto curto e os caminhos para o início e para a validação de certificados. Referências: docs/telas.md (tela 20), docs/identidade-visual.md (seção 6.3) e o protótipo em docs/prototipo/NaoEncontrada.dc.html." Com as regras do mantenedor sobre o código 404 de verdade e a instrução noindex, a API que continua respondendo 404 em JSON, os recursos de página inexistentes ou de outro candidato (com a mesma recusa para os dois), a troca da mensagem provisória de tema inexistente da 003, o link para a validação da 005 e os testes obrigatórios.

**Requisitos atendidos**: complemento, tela 20 de `docs/telas.md` (Princípios VII e VIII), com
RNF01 e RNF03 de `docs/requisitos-desafio.md`; integração com as telas 8 (feature 003), 12, 13 e 14
(feature 005), 15 (feature 006) e 6 (página "Disponível em breve", que some com a feature 007).
Pelo Princípio VII, esta feature só é implementada depois de as features 002 a 006 estarem
concluídas e validadas em clone limpo. A conformidade com a constituição 3.0.1 está no fim deste
documento.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Chegar a um endereço que não existe (Priority: P1)

Uma pessoa digita errado o endereço de uma página, segue um link antigo ou abre um endereço que não
existe no portal. Em vez de uma página de erro técnica, ela vê a página "Esta página caiu num buraco
negro" e encontra o caminho de volta para o início ou para a validação de certificados; se está
conectada, continua com o cabeçalho logado e todos os caminhos dele.

**Why this priority**: é a tela 20 inteira; sem ela, um endereço errado mostra a mensagem técnica do
servidor, sem identidade nem caminho de volta.

**Independent Test**: abrir, com e sem login, um endereço inventado, um endereço com acentos e
símbolos e um endereço de página antiga, e conferir em cada um a página, o código 404, a instrução
noindex, o cabeçalho conforme a sessão e os caminhos.

**Acceptance Scenarios**:

1. **Given** um visitante, **When** ele abre um endereço que não existe no portal (por exemplo,
   `/certificacoes`), **Then** vê o cabeçalho público e a página com "Erro 404", o título "Esta
   página caiu num buraco negro", o texto "Nem a luz sai daqui. O endereço pode ter sido digitado
   errado, ou a página não existe mais.", a ilustração do buraco negro e os botões "Voltar ao
   início" e "Validar um certificado".
2. **Given** a mesma resposta, **When** alguém confere o que o portal devolveu, **Then** o código é
   404, nunca 200, e a resposta traz a instrução para que buscadores não a indexem.
3. **Given** a página, **When** a pessoa escolhe "Voltar ao início", **Then** chega à tela inicial;
   **When** escolhe "Validar um certificado" ou o link "Validar certificado" do rodapé, **Then**
   chega à validação pública (tela 14).
4. **Given** um candidato conectado, **When** ele abre um endereço que não existe, **Then** vê o
   cabeçalho logado (área de estudos, flashcards, o próprio nome e "Sair"), sem nenhum botão
   "Entrar", com o mesmo corpo da página que o visitante vê, e continua conectado; a resposta não
   fica guardada em cache compartilhado.
5. **Given** um endereço com acentos, espaços, símbolos ou trechos como `../`, **When** alguém o
   abre, **Then** vê a mesma página, sem que nenhum trecho do endereço apareça nela e sem acesso a
   nenhum arquivo fora do portal.
6. **Given** um celular de 360 px, **When** a pessoa abre a página, **Then** o título, o texto, a
   ilustração e os botões ficam legíveis e acionáveis, sem rolagem horizontal.
7. **Given** a feature 007 entregue, **When** alguém abre o endereço da antiga página "Disponível
   em breve", um endereço inexistente terminado em `.html` ou o endereço do próprio arquivo da
   página não encontrada, **Then** vê a página não encontrada, com código 404 (no `.html`, depois do
   redirecionamento para o endereço limpo).

---

### User Story 2 - Abrir um recurso que não existe ou que é de outra pessoa (Priority: P1)

O candidato abre o endereço de um tema que não existe, de uma tentativa que ele não tem, ou do
resultado ou do certificado de uma tentativa que não é dele ou que não tem certificado. Em todos os
casos vê a mesma página não encontrada, sem nenhuma pista de que o recurso exista para outra pessoa.

**Why this priority**: as features 003, 005 e 006 exigem a mesma recusa para recurso inexistente e
alheio (Princípio VI); esta página passa a ser essa recusa nas telas, no lugar de soluções
provisórias.

**Independent Test**: com dois candidatos, um com duas tentativas e o outro com uma aprovada, abrir
o histórico, o resultado e o certificado por números que cada um não tem e o endereço de um tema
inexistente, e comparar as respostas entre si e com a de um endereço inventado, sempre com o mesmo
candidato conectado.

**Acceptance Scenarios**:

1. **Given** a área de estudos, **When** alguém abre o endereço de um tema que não existe (um número
   fora de 1 a 12 ou um texto qualquer), **Then** vê a página não encontrada, com código 404, no
   lugar da mensagem provisória da feature 003.
2. **Given** um candidato com duas tentativas, **When** ele abre `/historico/3`, `/historico/0` ou
   `/historico/abc`, **Then** vê a página não encontrada, com código 404, em resposta idêntica nos
   três casos.
3. **Given** um candidato reprovado, **When** ele abre o endereço do certificado da sua tentativa,
   **Then** vê a página não encontrada, igual à de um certificado inexistente.
4. **Given** dois candidatos, **When** um deles abre o endereço do resultado ou do certificado por
   um número de tentativa que só o outro tem, **Then** recebe, byte a byte, a mesma resposta de um
   número que ninguém tem.
5. **Given** um visitante sem sessão, **When** ele abre o endereço de uma página que exige login,
   exista o recurso ou não (por exemplo, `/historico/7`), **Then** é levado à tela Entrar, como em
   toda tela logada, sem saber se o recurso existe.
6. **Given** a validação pública, **When** alguém valida um código inexistente, **Then** continua
   vendo, na própria página de validação, "Nenhum certificado encontrado" (feature 005), e não a
   página não encontrada; **Given** a revisão ou o resumo dos flashcards sem sessão de revisão,
   **Then** continua indo à escolha de temas (feature 007).
7. **Given** o banco indisponível, **When** um candidato conectado abre o endereço de um tema, do
   histórico, do resultado ou do certificado, **Then** recebe a página "Tente novamente em
   instantes", com código 503 e a indicação de quando tentar de novo, e nunca a página não
   encontrada.

---

### User Story 3 - A API e os arquivos respondem sem a página (Priority: P2)

As páginas do portal conversam com a API e carregam imagens, estilos e scripts. Um endereço da API
que não existe continua respondendo 404 em JSON, como na feature 001, e um arquivo que não existe
recebe um 404 curto em texto, para que quem pediu saiba tratar a falha.

**Why this priority**: protege o comportamento da 001 e as páginas que dependem dele; P2 porque não
muda nada que a pessoa vê.

**Independent Test**: pedir um endereço inexistente sob `/api` e um arquivo inexistente, e conferir
o código 404, o formato de cada resposta e a ausência da página HTML.

**Acceptance Scenarios**:

1. **Given** um endereço inexistente sob `/api` (por exemplo, `/api/nada`), **When** ele é pedido,
   **Then** a resposta é 404 com o JSON `{"erro": "Rota não encontrada"}`, e nunca a página não
   encontrada.
2. **Given** um arquivo do portal que não existe (por exemplo, uma imagem com nome errado), **When**
   uma página o pede, **Then** a resposta é 404 em texto puro, só com "Não encontrado", sem a
   página não encontrada e sem repetir o caminho pedido.

---

### Edge Cases

- Endereço com acentos, espaços, símbolos codificados ou trechos como `../`: mesma página, sem ecoar
  o endereço e sem expor arquivo nenhum fora do portal.
- Endereço muito longo: mesma página, ou a recusa padrão do servidor para pedidos grandes demais,
  nunca uma página de erro com detalhes técnicos.
- Endereço antigo terminado em `.html`: o redirecionamento para o endereço limpo da feature 002
  acontece primeiro; se o endereço limpo não existir, vale a página não encontrada.
- Endereço da página "Disponível em breve" depois da feature 007: cai na página não encontrada
  (FR-052 da 007).
- Endereço do próprio arquivo da página não encontrada: também responde 404; a página não tem
  endereço próprio que responda 200.
- Pedido de outro método que não leitura (por exemplo, envio de formulário) para um endereço de
  página que não existe: 404, sem efeito nenhum.
- Pedido só de cabeçalhos (HEAD): 404, sem corpo.
- Visitante sem sessão num endereço de área logada: vai para Entrar antes de qualquer conferência
  do recurso (FR-009).
- Candidato conectado num recurso que não é dele: a mesma resposta de um inexistente, com o mesmo
  cabeçalho logado (FR-014, FR-020).
- Sessão expirada ou inválida num endereço inexistente fora da área logada: cabeçalho público, como
  para qualquer visitante (FR-020).
- Proxy ou cache compartilhado entre a pessoa e o portal: a página com sessão nunca é guardada nele
  (FR-021).
- Código de validação inexistente na validação pública: continua o estado "Nenhum certificado
  encontrado" da própria página de validação (FR-018 da 005), que não é esta página (FR-015).
- Resumo dos flashcards sem sessão recém-terminada e revisão sem sessão: continuam levando à escolha
  de temas (FR-019 e FR-028 da 007), porque são páginas que existem, sem recurso no endereço.
- Banco indisponível ao conferir a sessão ou um recurso de página: página "Tente novamente em
  instantes", com 503 e a indicação de quando tentar de novo, nunca a página não encontrada, para
  não dizer que algo que existe não existe (FR-022). Um endereço inexistente que não depende do
  banco continua respondendo 404, e "Voltar ao início" leva à tela inicial, que abre sem o banco
  (FR-024).
- Navegador sem JavaScript: as duas páginas aparecem inteiras, com texto e caminhos, porque nada
  nelas depende de script.
- Portal sem acesso à internet: a página carrega inteira, com fontes e ilustração.
- Pedido de menos movimento: o céu fica parado; a ilustração já é estática.

## Requirements *(mandatory)*

### Functional Requirements

**Página não encontrada (tela 20; regra 1)**

- **FR-001**: Todo endereço de página que não existe no portal MUST responder com a página não
  encontrada e o código HTTP 404 de verdade, nunca 200 e nunca um redirecionamento para outra página.
- **FR-002**: A resposta MUST trazer a instrução noindex, para que buscadores não indexem a página.
- **FR-003**: A página MUST portar `NaoEncontrada.dc.html` com o kit: o cabeçalho conforme a sessão
  (FR-020); "Erro 404"; o título "Esta página caiu num buraco negro"; o texto "Nem a luz sai daqui. O
  endereço pode ter sido digitado errado, ou a página não existe mais."; os botões "Voltar ao
  início" (principal, para a tela inicial) e "Validar um certificado" (para a validação pública,
  tela 14); a ilustração do buraco negro da seção 6.3 de `docs/identidade-visual.md`, estática e
  decorativa; e o rodapé comum, com "Validar certificado" levando à validação pública. O título da
  página MUST ser "Página não encontrada · Lunar Celer".
- **FR-004**: O corpo da página (tudo menos o cabeçalho) MUST ser o mesmo para qualquer endereço e
  qualquer pessoa, e MUST NOT repetir o endereço pedido nem mostrar nenhum dado sobre ele ou sobre
  quem pede, além do que o cabeçalho logado já mostra (o nome do candidato).
- **FR-005**: A página MUST seguir o kit e as correções de `docs/identidade-visual.md` (cinza
  `#8A8A93` em "Erro 404" e em todo texto abaixo de 18 px, Inter só nos pesos 300, 400 e 500), com
  o céu estrelado, sem JavaScript inline nem bibliotecas de terceiros, com tudo legível sem
  JavaScript e sem nenhum recurso de outro domínio (Princípio II).
- **FR-006**: A página MUST funcionar a partir de 360 px de largura sem rolagem horizontal, com
  contraste AA em todo texto, foco visível, alvos de toque de pelo menos 44 px, uso completo só com
  teclado e respeito ao pedido de menos movimento; o título é o cabeçalho principal da página, e a
  ilustração fica oculta para leitores de tela (Princípio XI).

**Cabeçalho e cache (decisão P-01)**

- **FR-020**: O cabeçalho da página não encontrada depende apenas do estado da sessão de quem pede,
  nunca do recurso pedido nem de sua existência ou dono. Com sessão válida, MUST ser o cabeçalho
  logado da feature 002 (FR-048 da 002: marca levando à área do candidato, "Área de estudos",
  "Flashcards", o nome do candidato e "Sair", com os destinos vigentes), sem nenhum botão "Entrar";
  sem sessão, ou com sessão expirada ou inválida, MUST ser o cabeçalho público do protótipo (marca
  levando à tela inicial e "Voltar ao início"). Para o mesmo pedido de uma mesma pessoa, a resposta
  a um recurso inexistente e a um recurso de outro candidato é a mesma, inclusive no cabeçalho.
- **FR-021**: A página não encontrada respondida com sessão MUST levar a instrução de cache
  `Cache-Control: private, no-store`, para nunca ser guardada em cache compartilhado.

**Endereços de página e arquivos (decisão P-02)**

- **FR-007**: "Endereço de página" é qualquer endereço fora de `/api` que não corresponde a uma
  página nem a um arquivo do portal. Pedidos de arquivos do portal que não existem (imagens,
  estilos, scripts, fontes, vídeos e legendas) MUST receber 404 com corpo curto em texto puro
  (`Content-Type: text/plain`), só com "Não encontrado", sem a página não encontrada e sem repetir
  o caminho pedido.
- **FR-008**: Endereços de páginas que deixaram de existir (como "Disponível em breve", depois da
  feature 007) e o próprio arquivo da página não encontrada MUST cair na página não encontrada, com
  404; o redirecionamento de endereços terminados em `.html` para o endereço limpo (feature 002)
  acontece antes.
- **FR-009**: Endereços sob uma página que exige login (como `/historico/...`) MUST levar o
  visitante sem sessão à tela Entrar antes de qualquer conferência do recurso, de modo que quem não
  está conectado não descubra se ele existe.

**Recursos de página inexistentes ou de outro candidato (regras 3 e 4; decisão P-03)**

- **FR-010**: O endereço de um tema que não existe na área de estudos (feature 003) MUST responder
  com a página não encontrada, no lugar da mensagem provisória com o caminho para a área de estudos
  (Assumptions da 003).
- **FR-011**: No histórico (feature 006), o número de tentativa que o candidato não tem, zero,
  negativo ou malformado MUST responder com a página não encontrada (FR-013 da 006).
- **FR-012**: O endereço do certificado (tela 13, feature 005) de uma tentativa que não existe, que é
  de outro candidato ou que não tem certificado MUST responder com a página não encontrada (FR-025
  da 005).
- **FR-013**: O endereço do resultado (tela 12, feature 005) de uma tentativa que não existe, que é
  de outro candidato ou que está em andamento MUST responder com a página não encontrada, pela
  mesma regra do FR-025 da 005, que dá ao resultado a mesma recusa do certificado (decisão do
  mantenedor, P-03).
- **FR-014**: Em cada um desses casos, a resposta a um recurso inexistente, a um recurso de outro
  candidato e a um endereço malformado MUST ser idêntica, para a mesma pessoa: mesmo código, mesmo
  conteúdo, byte a byte no corpo, e nenhum cabeçalho ou dado que dependa do recurso pedido
  (Princípio VI). As respostas da API para esses recursos continuam as das features 003, 005 e 006.
- **FR-015**: Continuam como estão, por serem páginas que existem com um estado próprio, e não
  recursos inexistentes no endereço: a validação pública com código inexistente ou malformado, que
  mostra "Nenhum certificado encontrado" (FR-018 da 005); a revisão e o resumo dos flashcards sem
  sessão, que levam à escolha de temas (FR-019 e FR-028 da 007); e as telas da questão e da correção,
  que seguem a feature 004.

**Banco indisponível (observação do mantenedor)**

- **FR-022**: Quando o banco estiver indisponível ao conferir a sessão ou um recurso de página (tema,
  histórico, resultado ou certificado), a resposta MUST ser o código 503, com o cabeçalho
  `Retry-After` de 30 segundos e a página de instabilidade, nunca a página não encontrada. A página
  MUST portar `Instabilidade.dc.html` com o kit: o cabeçalho do FR-023; o título "Tente novamente em
  instantes"; o texto "O portal está com instabilidade e não conseguiu abrir esta página agora."; os
  botões "Tentar de novo" (principal), que recarrega o mesmo endereço sem repeti-lo no conteúdo, e
  "Voltar ao início", que leva à tela inicial (FR-024); e o rodapé comum, com o estado de
  instabilidade do kit ("Instabilidade no portal. Tente de novo em alguns minutos."). Ela MUST levar
  a instrução noindex e `Cache-Control: no-store`, MUST NOT repetir o endereço pedido nem mostrar
  detalhes técnicos e segue o FR-005 e o FR-006. O título da página MUST ser "Portal instável ·
  Lunar Celer". Textos e `Retry-After` aprovados pelo mantenedor em 03/10/2026.
- **FR-023**: O cabeçalho da página de instabilidade MUST ter só a marca, sem os itens do cabeçalho
  logado e sem "Entrar": sem o banco, a sessão não pode ser confirmada, e o cabeçalho logado também
  dependeria do banco para mostrar o nome; na dúvida, a página não afirma nenhum dos dois estados
  (aplicação da decisão P-01). A marca leva à tela inicial (FR-024).
- **FR-024**: A tela inicial, destino de "Voltar ao início" e da marca na página de instabilidade,
  MUST continuar abrindo sem o banco, com o estado de instabilidade no rodapé (FR-004a da 002), para
  que esses caminhos nunca levem a outra resposta 503. Conferido em 03/10/2026 no código atual: com
  o banco fora do ar, a tela inicial responde 200 e só a verificação de saúde responde 503.

**API (regra 2)**

- **FR-016**: Endereços inexistentes sob `/api` MUST continuar respondendo 404 com o JSON
  `{"erro": "Rota não encontrada"}`, como na feature 001, e MUST NOT receber a página não encontrada.

**Integração (regra 5)**

- **FR-017**: O botão "Validar um certificado" e o link "Validar certificado" do rodapé MUST levar à
  validação pública da feature 005 (`/validar`), e "Voltar ao início" (no cabeçalho público e no
  botão), à tela inicial.
- **FR-018**: Nenhuma página do portal MUST mostrar uma mensagem própria de "não encontrado" para um
  recurso no endereço, além da validação pública (FR-015); a página não encontrada é a resposta
  única para esses casos.

**Testes obrigatórios (regra 6; Princípio IX por regra do mantenedor)**

- **FR-019**: MUST existir testes automatizados, que passam a cada mudança nessas regras, para: o
  código 404 em endereços inventados, com acentos e símbolos, com `../`, terminados em `.html`, da
  página "Disponível em breve" depois da 007 e do próprio arquivo da página; a presença da instrução
  noindex; a ausência do endereço pedido no conteúdo da página; a mesma resposta, byte a byte no
  corpo e com o mesmo cabeçalho, para inexistente, alheio e malformado no tema, no histórico, no
  resultado e no certificado, para o mesmo candidato; o cabeçalho logado com sessão e o público sem
  ela; `Cache-Control: private, no-store` com sessão; a ida do visitante sem sessão à tela Entrar
  nos endereços logados; o 404 em JSON da API; o 404 em texto puro dos arquivos, sem o caminho
  pedido; o 503 com `Retry-After`, noindex, cabeçalho só com a marca e sem o endereço pedido, com o
  banco indisponível; a tela inicial respondendo 200 com o banco indisponível; e os links corretos ("Voltar ao início" para a tela inicial, "Validar um certificado" e "Validar
  certificado" para a validação pública).

### Key Entities *(include if feature involves data)*

- Nenhuma entidade nova. A feature só consulta a sessão (002), os temas (003) e as tentativas e os
  certificados do candidato da sessão (005 e 006) para escolher o cabeçalho e decidir se o recurso
  do endereço existe e é dele.

## Dependências

- **Planos das features 003, 005 e 006 (P-05)**: a página não encontrada só garante a resposta
  idêntica se todas as rotas de página de recurso a usarem; uma única rota com tratamento próprio já
  quebra o sigilo. Por isso, os planos dessas features MUST usar esta página (e a de instabilidade,
  FR-022) nas rotas de tema (003, FR-010), resultado e certificado (005, FR-012 e FR-013) e
  histórico (006, FR-011), ou deixar o ponto de troca pronto para quando ela existir. Em 03/10/2026,
  nenhum desses três planos existe; a dependência fica registrada aqui e é conferida quando cada
  plano for escrito.
- **Feature 002**: cabeçalho logado e público (FR-048 da 002), conferência da sessão,
  redirecionamento de `.html` para o endereço limpo e tela inicial que abre sem o banco, com a
  instabilidade no rodapé (FR-004a da 002; FR-024 desta spec).
- **Conferência das specs 005 e 006 (03/10/2026)**: busca por banco indisponível, falha de
  carregamento e recurso inexistente. Na 005, nenhum trecho contradiz esta spec: resultado e
  certificado já recusam inexistente, alheio, em andamento e sem certificado da mesma forma (FR-025
  da 005), e o banco indisponível só aparece na validação pública, que mantém o próprio estado
  (FR-015). Na 006, o edge case de banco indisponível ("mensagem amigável de instabilidade, no
  padrão do kit") contradizia o FR-022 e foi alinhado em commit próprio, no mesmo padrão da 003; as
  recusas por número de tentativa já seguem esta spec.
- **Feature 005**: validação pública em `/validar` (destino dos dois links) e a regra de recusa do
  FR-025.
- **Feature 007**: quando entregue, o endereço da página "Disponível em breve" passa a cair nesta
  página (FR-052 da 007).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para 20 endereços inexistentes de formas diferentes (inventados, com acentos e
  símbolos, com `../`, terminados em `.html`), 100% respondem 404 com a página não encontrada e a
  instrução noindex, e 0 respondem 200.
- **SC-002**: 100% dos endereços inexistentes sob `/api` respondem 404 em JSON, e 0 recebem a página
  HTML; 100% dos arquivos inexistentes respondem 404 em texto puro, sem o caminho pedido.
- **SC-003**: Para o mesmo candidato conectado, as respostas a recurso inexistente, de outro
  candidato e malformado em tema, histórico, resultado e certificado são idênticas, byte a byte no
  corpo principal e com o mesmo cabeçalho, em 100% dos pares comparados.
- **SC-004**: Em 100% dos testes, a página com sessão mostra o cabeçalho logado, sem botão "Entrar",
  e leva `Cache-Control: private, no-store`; sem sessão, mostra o cabeçalho público.
- **SC-005**: A partir da página não encontrada, a pessoa chega à tela inicial ou à validação
  pública com 1 escolha, e 100% dos links levam ao destino certo.
- **SC-006**: Em 100% dos testes, nenhum trecho do endereço pedido aparece no conteúdo da página não
  encontrada, da página de instabilidade nem do 404 em texto.
- **SC-007**: Com o banco indisponível, 100% dos pedidos de tema, histórico, resultado e certificado
  respondem 503 com `Retry-After` e a página "Tente novamente em instantes", com o cabeçalho só com
  a marca, e 0 respondem 404; a tela inicial continua respondendo 200.
- **SC-008**: As duas páginas ficam utilizáveis, sem rolagem horizontal, de 360 px a 1920 px, passam
  no contraste AA, têm 100% dos elementos acionáveis alcançados com foco visível só pelo teclado e
  carregam por completo sem acesso à internet, com 0 requisições para outros domínios.
- **SC-009**: Na rede local da apresentação, a página não encontrada aparece em até 1 segundo.
- **SC-010**: Depois da entrega, 0 páginas mostram uma mensagem própria de "não encontrado" para um
  recurso no endereço, além da validação pública.
- **SC-011**: 100% dos testes do FR-019 passam a partir de um clone limpo.

## Assumptions

- **Ordem de entrega**: a spec é escrita agora, mas a implementação só começa depois de as features
  002 a 006 estarem concluídas e validadas em clone limpo (Princípio VII). A feature 007 pode vir
  antes ou depois: o endereço da página "Disponível em breve" cai nesta página quando a 007 a tira
  do portal.
- **Esquema**: nenhuma mudança. A feature não grava nada; só consulta, com as regras das features
  002, 003, 005 e 006, a sessão e se o recurso do endereço existe e é do candidato. Por isso não há
  proposta de modelo de dados.
- **Cabeçalho pela sessão** (FR-020, decisão P-01): a regra de sigilo é sobre o recurso, não sobre
  quem pede; a pessoa sabe se está conectada, então variar o cabeçalho pela sessão não revela nada,
  e o cabeçalho público faria quem está conectado achar que a sessão caiu.
- **Arquivos** (FR-007, decisão P-02): o navegador não exibe essas respostas; mandar a página
  inteira gastaria rede e faria o console mostrar erros de sintaxe no lugar de um 404.
- **Endereços das telas 12, 13 e 15**: os formatos exatos (por exemplo, o número da tentativa no
  endereço do resultado e do certificado) são definidos nos planos das features 005 e 006; esta
  feature vale para qualquer formato que eles definam.
- **`Retry-After` de 30 segundos** (FR-022, aprovado): curto o bastante para não segurar robôs por
  muito tempo depois que o banco volta e longo o bastante para não sobrecarregar o servidor durante a
  queda.
- **Texto da página**: o do protótipo, que vale também para recursos de outro candidato, porque
  "a página não existe mais" não revela nada sobre o recurso.

## Conflitos entre as fontes

1. **Tema inexistente**: a feature 003 previa, até esta feature existir, uma mensagem simples com o
   caminho para a área de estudos; a página não encontrada oferece o início e a validação no corpo.
   Resolução pela regra 4: a página não encontrada substitui a mensagem (FR-010); com sessão, a área
   de estudos continua no cabeçalho logado (FR-020). Nota da 003 alinhada (P-04).
2. **Resultado fora da lista da regra 3**: a regra 3 cita o tema (003), as tentativas do histórico
   (006) e o certificado (005), mas o FR-025 da 005 dá ao resultado a mesma recusa do certificado.
   Resolução do mantenedor (P-03): o resultado também usa esta página (FR-013).
3. **Validação pública com código inexistente**: a regra 3 cita "certificado da 005", e a 005 tem
   dois lugares com certificado: a tela 13 (logada) e a validação pública (tela 14), que mostra
   "Nenhum certificado encontrado" na própria página (FR-018 da 005). Resolução: só a tela 13 usa
   esta página; a validação mantém o seu estado (FR-012, FR-015).
4. **Cabeçalho para quem está conectado**: o protótipo e a tela 20 de `docs/telas.md` ("Acesso:
   Público") mostravam só o cabeçalho público. Resolução do mantenedor (P-01): o cabeçalho segue a
   sessão de quem pede, nunca o recurso (FR-020, FR-021); a tela 20 foi alinhada (P-04).
5. **Cinza do "Erro 404"**: o protótipo usa `#71717A` em 14 px, e a identidade visual, que prevalece
   (Princípio XI), pede `#8A8A93` em todo texto abaixo de 18 px. Resolução: `#8A8A93` (FR-005).
6. **"Qualquer endereço"**: a descrição fala de "qualquer endereço de página", e a tela 20 de
   `docs/telas.md` dizia "qualquer rota inexistente", o que incluiria os arquivos e a API.
   Resolução pelas regras 2 e da descrição e pela decisão P-02: a API mantém o 404 em JSON (FR-016),
   e os arquivos recebem 404 em texto puro (FR-007).
7. **Banco indisponível**: a primeira versão desta spec dizia só que a falha do banco não vira 404,
   com a mensagem de instabilidade do kit, e as specs 003 e 006 traziam essa mensagem nas suas
   páginas. Resolução do mantenedor: 503 com `Retry-After` e uma página própria, com cabeçalho só
   com a marca, sem ecoar o endereço (FR-022, FR-023), protótipo `Instabilidade.dc.html`; 003 e 006
   alinhadas.

## Pendências

Nenhuma pendência aberta.

Resolvidas pelo mantenedor em 03/10/2026:

- **P-01**: o cabeçalho segue a sessão de quem pede (logado com sessão, público sem ela), nunca o
  recurso; corpo, código e noindex iguais em todos os casos; `Cache-Control: private, no-store` com
  sessão (FR-020, FR-021, SC-003, SC-004).
- **P-02**: arquivos inexistentes recebem 404 em texto puro, só com "Não encontrado", sem repetir o
  caminho (FR-007).
- **P-03**: o resultado (tela 12) também usa esta página, pela regra do FR-025 da 005 (FR-013).
- **P-04**: tela 20 de `docs/telas.md` e nota sobre tema inexistente da spec 003 alinhadas a esta
  spec, em commit próprio na branch da 008.
- **P-05**: dependência dos planos das features 003, 005 e 006 registrada na seção "Dependências";
  nenhum desses planos existe ainda.
- **P-06**: textos da página de instabilidade e `Retry-After` de 30 segundos aprovados; cabeçalho só
  com a marca aprovado (FR-023); tela inicial conferida sem o banco (FR-024); protótipo criado em
  `docs/prototipo/Instabilidade.dc.html`.

## Conformidade com a constituição (versão 3.0.1)

| Princípio | Como esta spec atende | Situação |
|---|---|---|
| I. Servidor é a autoridade | É o servidor quem confere a sessão, decide se o recurso existe e é do candidato da sessão e responde 404 ou 503 (FR-001, FR-010 a FR-014, FR-020, FR-022, FR-023). | ✅ |
| II. Front-end sem bibliotecas de terceiros | Páginas com o kit, sem JavaScript inline, legíveis sem JavaScript e sem recursos de outro domínio (FR-005, FR-022). | ✅ |
| III. PostgreSQL com SQL explícito | Sem mudança de esquema; só as consultas de sessão e de existência das features 002, 003, 005 e 006. | ✅ |
| IV. Dados derivados não são armazenados | Nada é gravado. | ✅ |
| V. Comando único | Nada novo de execução. | ✅ |
| VI. LGPD e minimização | Mesma resposta para recurso inexistente e de outro candidato, com o cabeçalho dependendo só da sessão (FR-014, FR-020); a página não repete o endereço nem mostra dados além do nome do próprio candidato (FR-004); noindex (FR-002); sem cache compartilhado com sessão (FR-021). | ✅ |
| VII. Escopo do site final e ordem de entrega | Complemento da tela 20 de `docs/telas.md`; implementação só depois de 002 a 006 validadas. | ✅ |
| VIII. Rastreabilidade | Complemento citado pela tela 20 e pelas telas integradas; RNF01 e RNF03. | ✅ |
| IX. Testes das regras críticas | Nenhuma regra crítica da constituição é tocada; testes obrigatórios por regra do mantenedor (FR-019). | ✅ |
| X. Padrões de código | Textos em português; nada de banco. | ✅ |
| XI. Interface fiel e acessível | Protótipos `NaoEncontrada.dc.html` e `Instabilidade.dc.html` portados com o kit e a correção do cinza (FR-003, FR-005, FR-022); AA, foco, 44 px, teclado e menos movimento (FR-006). | ✅ |
