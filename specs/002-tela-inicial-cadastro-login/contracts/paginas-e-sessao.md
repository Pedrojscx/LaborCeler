> **⚠ DESATUALIZADO (2026-10-02).** Este artefato foi gerado a partir da versão anterior da
> spec, antes da constituição 3.0.0, da identidade visual 2.0 e do kit de interface, e não vale
> como referência. Será regenerado depois que todas as specs estiverem prontas.

# Contrato: páginas, sessão, proteções e mensagens

Interfaces da feature 002 que não cabem no OpenAPI: as páginas e seus redirecionamentos, a
política de sessão e CSRF, os limites de tentativas, o catálogo de mensagens e o que muda na
execução. Os endpoints estão em [api-auth.openapi.yaml](api-auth.openapi.yaml).

## Páginas

| Caminho | Arquivo | Visitante sem sessão | Candidato com sessão | Requisito |
|---|---|---|---|---|
| `/` | `index.html` | tela inicial | `302` → `/candidato` | FR-001 a FR-004b, FR-023 |
| `/cadastro` | `cadastro.html` | formulário | `302` → `/candidato` | FR-005 a FR-014 |
| `/entrar` | `entrar.html` | formulário (`?motivo=expirada` mostra o aviso de sessão expirada) | `302` → `/candidato` | FR-015 a FR-018 |
| `/termos` | `termos.html` | termos de uso e privacidade | idem | FR-012 |
| `/candidato` | `candidato.html` | `302` → `/entrar` (`?motivo=expirada` se havia cookie inválido ou vencido) | área do candidato | FR-021 a FR-023 |
| `/estudos` | `em-breve.html` | página "disponível em breve" | idem | FR-024 (até a 003) |
| `/validar` | `em-breve.html` | idem | idem | FR-024 (até a 005) |
| `/certificacao` | `em-breve.html` | `302` → `/entrar` | página "disponível em breve" | FR-022, FR-024 (até a 004) |
| qualquer `*.html` | — | `301` → URL limpa (`/index.html` → `/`, `/candidato.html` → `/candidato`) | idem | FR-023 |

- As respostas de `/`, `/cadastro`, `/entrar` e `/candidato` levam `Cache-Control: no-store`
  (o redirecionamento depende da sessão).
- `em-breve.html` mostra o nome do recurso conforme o caminho e um botão de voltar para a tela
  de origem (ou para `/`).
- Na área do candidato, "Iniciar a certificação" abre uma confirmação com as regras principais
  (150 segundos por questão, resposta única, interrupção encerra a questão); só a confirmação
  leva a `/certificacao`.
- Todas as páginas (inicial, cadastro, entrar, termos, candidato e "em breve") têm o rodapé
  com o estado do portal ("Portal no ar · banco conectado") e o link para os termos, e mostram
  em destaque os alertas de banco indisponível e de carga incompleta (FR-004a).
- O redirecionamento de `*.html` acontece antes do estático, para que o acesso direto ao
  arquivo não escape das regras desta tabela.

## Sessão

- Cookie `sessao` com JWT HS256 (`sub`, `cad`, `iat`, `exp`); `HttpOnly`, `SameSite=Lax`,
  `Path=/`, `Max-Age=28800` (8 h) e `Secure` só quando `PUBLIC_BASE_URL` é HTTPS.
- A cada uso, o servidor confere a assinatura e a validade, busca o candidato só por `id` e
  compara em JS `Math.floor(data_cadastro / 1000) === cad`; se o candidato não existir ou a
  data não bater, a sessão é inválida e o cookie é apagado.
- Sair apaga o cookie (idempotente). Cadastro e login emitem um cookie novo.

## Proteção contra CSRF e formato

Em `POST`, `PUT`, `PATCH` e `DELETE` sob `/api`:

1. `Origin` presente cujo host (nome e porta) é diferente do cabeçalho `Host` da própria
   requisição, isto é, `new URL(origin).host !== req.get('host')`, ou `Origin` que não é URL
   válida (como `null`) → `403`. Não se compara o protocolo nem `PUBLIC_BASE_URL`: funciona em
   `localhost`, pelo IP da rede local e atrás de um proxy HTTPS.
2. Sem `Origin`, `Sec-Fetch-Site` presente e diferente de `same-origin` e `none` → `403`.
3. Corpo que não é `application/json` (quando a rota espera corpo) → `415`.
4. JSON malformado → `400`; corpo acima de 10 kB → `413`.

Sem CORS: nenhuma resposta envia `Access-Control-Allow-Origin`.

## Limites de tentativas

| Limite | Chave | Janela | Efeito | Resposta |
|---|---|---|---|---|
| Por CPF (login) | CPF válido digitado, cadastrado ou não | 5 falhas em 15 min | bloqueio de 15 min a partir da 5ª falha; senha não conferida | `429` + `Retry-After` |
| Por rede (login) | IP da conexão | 60 tentativas malsucedidas/min (as bem-sucedidas não contam) | recusa até virar o minuto | `429` + `Retry-After` |
| Por rede (cadastro) | IP da conexão | 60 tentativas malsucedidas/min (as bem-sucedidas não contam) | idem | `429` + `Retry-After` |

E-mail no lugar do CPF e CPF inválido são recusados com `400` e não contam para o bloqueio por
CPF. Login bem-sucedido zera a contagem do CPF.

## Cabeçalhos de segurança

`helmet` com CSP `default-src 'self'; script-src 'self'; style-src 'self'; font-src 'self';
img-src 'self' data:; form-action 'self'; frame-ancestors 'self'; object-src 'none';
base-uri 'self'`. `upgrade-insecure-requests` e `Strict-Transport-Security` só com
`PUBLIC_BASE_URL` em HTTPS.

Consequência para o front: nenhum HTML tem `<script>` inline, atributo de evento (`onclick`,
`onsubmit`, `onload` etc.), URL `javascript:` ou `style="..."`. Todo comportamento vem de arquivos
`.js` em `app/public/js`, ligados com `addEventListener`.

## Catálogo de mensagens

| Situação | Mensagem | Onde |
|---|---|---|
| CPF com dígitos verificadores, tamanho ou caracteres inválidos | CPF inválido. Confira os 11 dígitos. | cadastro, login |
| CPF já cadastrado | Este CPF já tem cadastro. Entre com o seu CPF e senha. | cadastro |
| Nome sem sobrenome | Informe o nome completo (nome e sobrenome). | cadastro |
| Nome longo ou com caracteres não permitidos | Use até 150 caracteres: letras, espaços, apóstrofo e hífen. | cadastro |
| E-mail inválido | Informe um e-mail válido. | cadastro |
| Senha fora de 8 a 64 caracteres | A senha deve ter entre 8 e 64 caracteres. | cadastro |
| Senha acima de 72 bytes | Senha longa demais: acentos, símbolos e emojis ocupam mais espaço. Use uma senha mais curta. | cadastro |
| Confirmação diferente | A confirmação não confere com a senha. | cadastro |
| Termos não aceitos | Para se cadastrar, é preciso aceitar os termos de uso e privacidade. | cadastro |
| E-mail no lugar do CPF | Use o seu CPF para entrar (não o e-mail). | login |
| CPF não cadastrado ou senha errada | CPF ou senha inválidos. | login |
| Bloqueio por CPF | Muitas tentativas para este CPF. Aguarde 15 minutos e tente de novo. | login |
| Limite por rede | Muitas tentativas a partir desta rede. Aguarde um minuto e tente de novo. | login, cadastro |
| Sessão expirada (página) | Sua sessão expirou. Entre de novo. | `/entrar?motivo=expirada` |
| Sessão ausente ou inválida (API) | Sessão expirada ou inexistente. Entre de novo. | `GET /api/auth/me` |
| Banco indisponível | O portal está temporariamente sem acesso ao banco. Tente de novo em instantes. | cadastro, login |
| Origem negada | Origem da requisição não permitida. | rotas POST |
| Corpo fora de JSON ou JSON malformado | Envie os dados em JSON. | rotas POST |
| Corpo acima de 10 kB | Dados grandes demais. | rotas POST |

Nenhuma mensagem ecoa o CPF, o e-mail ou a senha digitados.

## Mudanças na execução (complementa o contrato da 001)

| Item | Mudança |
|---|---|
| Volume | novo volume nomeado `segredo_sessao`, montado em `/app/segredo` no serviço `app` |
| `JWT_SECRET` | repassada ao `app` como `${JWT_SECRET:-}`; opcional; tem prioridade sobre o segredo gerado; com menos de 32 caracteres o app não sobe |
| `PASTA_SEGREDO` | opcional, só para desenvolvimento e testes fora do container; padrão `/app/segredo`; não é repassada pelo Compose |
| `docker compose down` | mantém o segredo: sessões abertas continuam válidas até expirar |
| `docker compose down -v` | apaga também o segredo: todas as sessões ficam inválidas |
| `.env.example` | `JWT_SECRET` continua vazia, com comentário explicando a geração automática |
| README | tabela de variáveis, efeito do `down -v` nas sessões e a nova tela inicial |
