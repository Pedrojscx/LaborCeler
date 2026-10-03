# Contrato: páginas, sessão, proteções e mensagens

**Feature**: `002-tela-inicial-cadastro-login` | **Data**: 2026-10-03

Interfaces da feature 002 que não cabem no OpenAPI: páginas e endereços, cabeçalhos, destinos
provisórios, sessão, proteções, limites, catálogo de mensagens, a verificação do marcador do
e-mail (FR-012b) e o que muda na execução. Os endpoints estão em
[api-auth.openapi.yaml](api-auth.openapi.yaml). Decisões em [../research.md](../research.md).

## Páginas

| Endereço | Arquivo | Tela | Cabeçalho | Sem sessão | Com sessão |
|---|---|---|---|---|---|
| `/` | `index.html` | 1 | público com abas e "Entrar" (FR-042) | tela inicial | tela inicial (não redireciona) |
| `/cadastro` | `cadastro.html` | 2 | público com "Voltar ao início" | formulário | `302` → `/candidato` |
| `/entrar` | `entrar.html` | 3 | público com "Voltar ao início" | formulário (`?motivo=expirada` mostra o aviso) | `302` → `/candidato` |
| `/candidato` | `candidato.html` | 4 | logado (FR-048) | `302` → `/entrar` (`?motivo=expirada` se havia cookie inválido ou vencido) | área do candidato, estado "não iniciada" |
| `/termos` | `termos.html` | 5 | público com "Voltar ao início" | termos | termos |
| destinos provisórios | `em-breve.html` | 6 | público com "Voltar ao início" | ver tabela abaixo | ver tabela abaixo |
| `*.html` | | | | `301` → endereço limpo | `301` → endereço limpo |

- Respostas de `/`, `/cadastro`, `/entrar`, `/candidato` e dos destinos provisórios levam
  `Cache-Control: no-store`.
- O título de cada página termina em "· Lunar Celer" (FR-048), e a tela inicial mantém o
  descritivo "portal de certificação em metodologias ágeis" (identidade visual, seção 2).
- Todas as páginas têm o céu do kit (FR-049) e o rodapé comum (FR-004a): estado do portal,
  "Projeto acadêmico da Fatec Jacareí", "Termos de uso e privacidade" (`/termos`) e "Validar
  certificado" (`/validar`).

## Ligações

| Origem | Rótulo | Destino nesta feature |
|---|---|---|
| tela 1 | "Criar minha conta" | `/cadastro` |
| tela 1 | "Entrar", "Já tenho conta" | `/entrar` |
| tela 1 | "Começar pelos estudos" (hero, método e chamada final) | `#trilha`, na própria página (FR-004) |
| tela 1 | corpos da trilha, "Aprofundar em Terra · Introdução ao Scrum" | `/estudos` |
| tela 1, pergunta frequente | como conferir um certificado | `/validar` |
| tela 2 | termos de uso e privacidade | `/termos`, em outra aba, sem perder o que foi digitado |
| tela 2, "Já tem conta?"; tela 2, CPF já cadastrado | "Entrar", "entre com CPF e senha" | `/entrar` |
| tela 3, "Ainda não tem conta?" | "Criar minha conta" | `/cadastro` |
| tela 3, "Quer estudar antes?" | "Ir para a área de estudos" | `/estudos` |
| cabeçalho logado | marca | `/candidato` |
| cabeçalho logado | "Área de estudos", "Flashcards", nome do candidato | `/estudos`, `/flashcards`, `/perfil` |
| cabeçalho logado | "Sair" | `POST /api/auth/logout` e `/` |
| tela 4 | "Iniciar a certificação" | `/certificacao/inicio` |
| tela 4, "Estudar antes" | "Ir para a área de estudos" | `/estudos` |
| tela 4, "Antes de cada questão" | "Rever as regras" | `/#regras` (regras do hero) |
| tela 6 | "Voltar para a área do candidato", "Ir para o início" | `/candidato`, `/` |
| rodapé | "Validar certificado" | `/validar` |

## Destinos provisórios (página "Disponível em breve", FR-024)

Tabela única no servidor (`app/src/routes/destinos-provisorios.js`, research R9). O servidor
entrega `em-breve.html` com o título e o texto da variação, a partir de textos constantes do
próprio servidor, escapados para HTML. Cada feature, ao ser entregue, remove a sua linha.

| Endereço | Variação | Título | Texto | Exige sessão | Sai com |
|---|---|---|---|---|---|
| `/estudos`, `/estudos/:tema` | estudos | A área de estudos está a caminho | Os materiais e os flashcards dos 12 temas chegam numa próxima versão do Lunar Celer. | não | 003 |
| `/certificacao/inicio` | certificação | A certificação está a caminho | As questões dos 12 temas chegam numa próxima versão. Enquanto isso, sua conta já está pronta. | sim (tela 9 é logada) | 004 |
| `/validar`, `/validar/:codigo` | validação | A validação está a caminho | A conferência pública de certificados chega numa próxima versão do Lunar Celer. | não | 005 |
| `/flashcards` | flashcards | Os flashcards estão a caminho | A revisão dos 12 temas com cartões de pergunta e resposta chega numa próxima versão do Lunar Celer. | não | 007 |
| `/perfil` | perfil | O perfil está a caminho | Sua evolução nos estudos e as suas conquistas chegam numa próxima versão do Lunar Celer. | sim (tela 19 é logada) | 007 |

- Destino que exige sessão, aberto sem sessão: `302` → `/entrar`, como as telas logadas.
- "Voltar para a área do candidato" sem sessão leva ao login, pelo redirecionamento de
  `/candidato` (edge case da spec).
- A variação "histórico" entra com a feature 005 (FR-024 da 005), não nesta.

## Trechos ocultos pela regra de disponibilidade (FR-050)

Os trechos da tabela do FR-050 da spec não entram no HTML desta feature. Cada feature seguinte
acrescenta os seus, junto com os textos e links que dependem dela. A seção "Entre e use 100% do
Lunar Celer" não existe na tela 1 até a feature 004 (FR-038).

## Sessão

- Cookie `sessao` com JWT HS256 (`sub`, `cad`, `iat`, `exp` de 8 horas); `HttpOnly`,
  `SameSite=Lax`, `Path=/`, `Max-Age=28800`; `Secure` só com `PUBLIC_BASE_URL` em HTTPS.
- A cada uso, o servidor confere assinatura e validade, busca o candidato por `id` e compara o
  `cad` com `data_cadastro`; sessão inválida apaga o cookie.
- Sair apaga o cookie (idempotente). Cadastro e login emitem um cookie novo.
- API sem sessão válida: `401`; a página leva a `/entrar?motivo=expirada` e, depois do login,
  volta à área do candidato.

## Origem e formato dos pedidos

Em `POST`, `PUT`, `PATCH` e `DELETE` sob `/api` (research R3):

1. `Origin` cujo host (nome e porta) difere do `Host` do pedido, ou que não é URL válida → `403`;
2. sem `Origin`, `Sec-Fetch-Site` presente e diferente de `same-origin` e `none` → `403`;
3. corpo que não é `application/json`, quando a rota espera corpo → `415`;
4. JSON malformado → `400`; corpo acima de 10 kB → `413`.

Sem CORS: nenhuma resposta envia `Access-Control-Allow-Origin`.

## Cabeçalhos de segurança

`helmet` com CSP `default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self';
img-src 'self' data:; form-action 'self'; frame-ancestors 'self'; object-src 'none';
base-uri 'self'`; `upgrade-insecure-requests` e `Strict-Transport-Security` só com
`PUBLIC_BASE_URL` em HTTPS (research R7).

Consequência para o front, conferida por teste em todos os `.html` de `app/public` fora do kit:
nenhum `<script>` inline, atributo de evento (`onclick`, `onsubmit`, `onload` etc.), URL
`javascript:`, atributo `style="..."` nem recurso de outro domínio. Cores de corpo celeste vêm das
classes `lc-corpo-1` a `lc-corpo-12` do kit 1.2; valores calculados, de
`elemento.style.setProperty` em JavaScript.

## Limites de tentativas

| Limite | Chave | Janela | Efeito | Resposta |
|---|---|---|---|---|
| Por CPF (login) | CPF válido digitado, cadastrado ou não | 5 falhas em 15 min | bloqueio de 15 min a partir da 5ª falha; senha não conferida | `429` + `Retry-After` |
| Por rede (login) | IP da conexão | 60 tentativas malsucedidas por minuto | recusa até virar o minuto | `429` + `Retry-After` |
| Por rede (cadastro) | IP da conexão | 60 tentativas malsucedidas por minuto | idem | `429` + `Retry-After` |

E-mail no lugar do CPF e CPF inválido dão `400` e não contam para o bloqueio por CPF. Login
bem-sucedido zera a contagem do CPF.

Os números dos dois limites ficam numa configuração única do app (`config.limites`: falhas e
janela por CPF, duração do bloqueio, falhas por minuto por rede). A resposta `429` é a mesma nos
dois casos, para não revelar qual limite foi atingido (FR-017): a mensagem diz "Aguarde [n]
minutos", e o `Retry-After` vale [n] minutos em segundos, em que [n] é o maior tempo de espera
entre os dois limites, calculado dessa configuração (15 com os valores atuais), nunca fixo no
texto.

## Catálogo de mensagens

Textos dos protótipos `Cadastro`, `Entrar` e `Notificacoes` (fonte da verdade). Os marcados com
* não aparecem nos protótipos e foram aprovados pelo mantenedor em 03/10/2026; os protótipos
`Entrar` (bloqueio e sem conexão), `Cadastro` (sem conexão) e `Notificacoes` (primeiro nome)
foram atualizados com as decisões da mesma data.

| Situação | Mensagem | Onde |
|---|---|---|
| CPF com dígitos verificadores, tamanho ou caracteres inválidos | CPF inválido. Confira os 11 números. | cadastro, login |
| CPF já cadastrado | Este CPF já tem cadastro. Se a conta é sua, entre com CPF e senha. (com o atalho para Entrar) | cadastro |
| Nome sem sobrenome | Informe nome e sobrenome. | cadastro |
| Nome longo ou com caracteres não permitidos * | Use até 150 caracteres: letras, espaços, apóstrofo e hífen. | cadastro |
| E-mail inválido | Informe um e-mail válido, como nome@exemplo.com. | cadastro |
| Senha fora de 8 a 64 caracteres * | A senha precisa ter de 8 a 64 caracteres. | cadastro |
| Senha acima de 72 bytes | Essa senha é longa demais para ser protegida com segurança. Use uma senha mais curta ou com menos letras acentuadas. | cadastro |
| Confirmação diferente | As senhas não são iguais. | cadastro |
| Termos não aceitos | É preciso aceitar os termos para criar a conta. | cadastro |
| Resumo de campos inválidos * | Confira os campos destacados. | cadastro |
| E-mail no lugar do CPF | O login é feito com o CPF cadastrado, não com o e-mail. | login |
| CPF não cadastrado ou senha errada | CPF ou senha inválidos. Confira os dados e tente de novo. | login |
| Bloqueio por CPF ou limite por rede | Muitas tentativas sem sucesso. Aguarde [n] minutos e tente de novo. ([n] vem de `config.limites`: 15 com os valores atuais) | login, cadastro |
| Sessão expirada (página) * | Sua sessão expirou. Entre de novo. | `/entrar?motivo=expirada` |
| Sessão ausente ou inválida (API) * | Sua sessão expirou. Entre de novo. | `GET /api/auth/me` |
| Banco indisponível * | O portal está com instabilidade. Tente de novo em instantes. | cadastro, login |
| Sem resposta do portal (falha de rede, FR-030a) | Não foi possível conectar ao portal. Confira sua internet e tente de novo. | cadastro, login |
| Origem negada * | Origem da requisição não permitida. | rotas `POST` |
| Corpo fora de JSON ou JSON malformado * | Envie os dados em JSON. | rotas `POST` |
| Corpo acima de 10 kB * | Dados grandes demais. | rotas `POST` |
| Estado do portal, banco ok | Portal no ar e banco conectado | rodapé |
| Estado do portal, banco falhando | Instabilidade no portal. Tente de novo em alguns minutos. | rodapé |
| Estado do portal, carga incompleta * | Conteúdo em atualização. (o rodapé é público; o detalhe vai para o log do app) | rodapé |
| Conta criada (notificação) | Conta criada. Boas-vindas ao Lunar Celer, [primeiro nome]. Sua conta está pronta. | área do candidato |
| Marcador do e-mail nos termos | Termos com marcador de e-mail: a publicação será bloqueada até P-01 da 002 ser resolvida | `npm test` (aviso), `validar-002.sh` (falha) |

Nenhuma mensagem ecoa o CPF, o e-mail ou a senha digitados.

## Marcador do e-mail nos termos (FR-012a, FR-012b)

- Enquanto a P-01 não for resolvida, o contato de `termos.html` é o marcador
  `[E-mail do projeto pendente: P-01]`, definido numa constante única em
  `app/src/verificacao/termos.js`. Nenhum endereço é inventado.
- **Testes comuns** (`npm test`): depois dos testes, `aviso-termos.js` imprime no fim da saída,
  num bloco separado por linhas de destaque, a mensagem do catálogo; o código de saída continua
  sendo o dos testes.
- **Verificação de clone limpo** (`scripts/validar-002.sh`): com o marcador, falha com a mesma
  mensagem e código diferente de zero. Não há opção nem variável para pular a checagem.
- **Publicação**: a 002 só é integrada à `main` com o `validar-002.sh` aprovado e a saída
  registrada em `validacao.md`; o PR cita o resultado.
- Um teste confere que a página tem o marcador ou um `mailto:` válido, nunca os dois nem nenhum.

## Notificação "Conta criada" (FR-044)

Depois de `201` no cadastro, a página grava `lc-notificacao=conta-criada` em `sessionStorage` e
vai para `/candidato`; a área do candidato lê a marca, apaga-a e chama `LunarCeler.notificar`.
Sem `sessionStorage`, a notificação não aparece, e a saudação pelo nome continua confirmando a
conta.

## Mudanças na execução (complementa o contrato da 001)

| Item | Mudança |
|---|---|
| Volume | novo volume nomeado `segredo_sessao`, montado em `/app/segredo` no serviço `app` |
| `JWT_SECRET` | repassada ao `app` como `${JWT_SECRET:-}`; opcional; tem prioridade sobre o segredo gerado; com menos de 32 caracteres, o app não sobe |
| `PASTA_SEGREDO` | opcional, só para testes fora do container; padrão `/app/segredo`; não é repassada pelo Compose |
| `app/Dockerfile` | `RUN mkdir -p /app/segredo && chown node:node /app/segredo` antes do `USER node`; sem recursos exclusivos do BuildKit |
| `docker compose down` | mantém o segredo: as sessões continuam válidas até expirar |
| `docker compose down -v` | apaga também o segredo: todas as sessões ficam inválidas |
| `.env.example` | `JWT_SECRET` continua vazia, com comentário sobre a geração automática |
| `npm test` | roda os testes e, depois, o aviso do marcador do e-mail (FR-012b) |
| `scripts/validar-002.sh` | verificação de clone limpo da feature, obrigatória para publicar |
| `scripts/validar-001.sh` | a checagem da página inicial passa a procurar "portal de certificação" sem diferenciar maiúsculas; a dica do `MANTER=1` troca "Carga incompleta" por "Conteúdo em atualização" no rodapé |
| Log do app | com a carga incompleta, uma linha de aviso com o que falta (contagens esperadas e encontradas), na subida e a cada mudança de estado, sem repetir a cada pedido |
| README | tela inicial, variáveis, efeito do `down -v` nas sessões, `npm test` com o aviso, `validar-002.sh` e, em "Se a primeira carga falhar", o rodapé com "Conteúdo em atualização" e o detalhe em `docker compose logs app` |
