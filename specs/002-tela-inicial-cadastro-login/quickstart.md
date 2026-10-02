# Quickstart: validação da feature 002

Roteiro para provar, de ponta a ponta, que a tela inicial, o cadastro e o login atendem a spec.
Comandos e respostas estão em [contracts/api-auth.openapi.yaml](contracts/api-auth.openapi.yaml);
páginas, sessão, limites e mensagens em
[contracts/paginas-e-sessao.md](contracts/paginas-e-sessao.md); dados em
[data-model.md](data-model.md).

## Pré-requisitos

- Os mesmos da feature 001 (README, Pré-requisitos), com o portal no ar:
  `docker compose up -d --build --wait`.
- CPFs de teste **fictícios** (válidos pelo cálculo, sem dono conhecido):
  `529.982.247-25`, `111.444.777-35` e `123.456.789-09` (nunca cadastrado). Inválidos:
  `529.982.247-24` (dígito verificador errado) e `111.111.111-11` (dígitos repetidos).
- Para os comandos `curl`, a variável `P=http://localhost:3000` e um arquivo de cookies
  `/tmp/c.txt`. O cabeçalho `Origin: $P` imita o navegador.

## Cenário 1: tela inicial (US1, SC-001, SC-007, SC-010)

1. Abrir `http://localhost:3000` sem login, em largura de celular (320 px, pelas ferramentas
   do navegador) e de computador.
2. Conferir a descrição, os objetivos, as seis regras e as instruções, todas em linguagem
   direta (sem metáfora astronômica) e com os números oficiais: 12 temas, uma questão por
   tema, 150 segundos, resposta única, 65%, certificado com QR Code; e o aviso de que fechar ou
   recarregar a página, perder a conexão ou esgotar o tempo encerra a questão.
3. Conferir os quatro caminhos: "Cadastrar", "Entrar", "Estudar" (página "em breve") e
   "Validar certificado" (página "em breve"), cada um com volta à tela inicial.
4. Rodapé: "Portal no ar · banco conectado". Com `docker compose stop db`, a tela recarregada
   mostra o alerta de banco indisponível; `docker compose start db` e o rodapé volta (FR-004a).
5. Sem rolagem horizontal em 320 px; navegação completa só com teclado (Tab, foco visível); na
   aba Rede, nenhuma requisição para fora de `localhost` (fontes locais, FR-028).

## Cenário 2: cadastro (US2, SC-002, SC-004)

```bash
curl -s -c /tmp/c.txt -H "Origin: $P" -H 'Content-Type: application/json' \
  -d '{"cpf":"529.982.247-25","nome":"Maria D'"'"'Ávila Souza","email":"maria@exemplo.com","senha":"uma senha boa","confirmacaoSenha":"uma senha boa","aceiteTermos":true}' \
  -w ' %{http_code}\n' $P/api/auth/cadastro
```

Esperado: `201`, corpo `{"candidato":{"nome":"Maria D'Ávila Souza","primeiroNome":"Maria"}}` e
cookie `sessao` em `/tmp/c.txt` com `HttpOnly`. Depois, pelo navegador:

- Cadastro completo do CPF `111.444.777-35` **sem máscara** (`11144477735`), cronometrado do
  clique em "Cadastrar" até a área do candidato: até 2 minutos (SC-002).
- Recusas, cada uma com a mensagem do catálogo no campo certo e os outros campos preservados
  (exceto senhas): `529.982.247-24`, `111.111.111-11`, `123.456.789` (curto), `abc` no CPF;
  nome com uma palavra só; e-mail sem `@`; senha `1234567`; senha com 30 emojis (passa de 72
  bytes); confirmação diferente; termos sem marcar.
- CPF repetido (`529.982.247-25` de novo): `409`, "Este CPF já tem cadastro. Entre com o seu CPF
  e senha.", sem nenhum outro dado.
- Duplo clique rápido no botão "Cadastrar" com um CPF novo: uma única conta.
- O link dos termos abre `/termos` sem perder o que foi digitado.

## Cenário 3: login, sessão e saída (US3, SC-003, SC-005)

```bash
# login com o CPF sem máscara (o cadastro do cenário 2 foi feito com máscara)
curl -s -c /tmp/c.txt -H "Origin: $P" -H 'Content-Type: application/json' \
  -d '{"cpf":"52998224725","senha":"uma senha boa"}' -w ' %{http_code}\n' $P/api/auth/login
curl -s -b /tmp/c.txt -w ' %{http_code}\n' $P/api/auth/me
curl -s -b /tmp/c.txt -c /tmp/c.txt -X POST -H "Origin: $P" -w ' %{http_code}\n' $P/api/auth/logout
curl -s -b /tmp/c.txt -w ' %{http_code}\n' $P/api/auth/me
```

Esperado: `200` no login; `200` com o nome no `me`; `204` no logout; `401` no `me` seguinte.
E ainda:

- Senha errada e CPF `123.456.789-09` (não cadastrado): `401` com a **mesma** mensagem "CPF ou
  senha inválidos." (SC-005).
- `maria@exemplo.com` no campo de CPF: `400`, "Use o seu CPF para entrar (não o e-mail).".
- No navegador, entrar em até 30 segundos (SC-003); "Sair" leva à tela inicial e o botão Voltar
  não mostra a área do candidato.
- Expiração de 8 horas: coberta pelo teste automatizado (token com `exp` vencido leva a
  `/entrar?motivo=expirada`).

## Cenário 4: bloqueio por CPF (FR-017, SC-005, SC-009)

```bash
for i in 1 2 3 4 5 6; do
  curl -s -o /dev/null -H "Origin: $P" -H 'Content-Type: application/json' \
    -d '{"cpf":"52998224725","senha":"errada-'$i'"}' -w "$i:%{http_code} " $P/api/auth/login
done; echo
curl -s -H "Origin: $P" -H 'Content-Type: application/json' \
  -d '{"cpf":"52998224725","senha":"uma senha boa"}' -w ' %{http_code}\n' $P/api/auth/login
curl -s -o /dev/null -H "Origin: $P" -H 'Content-Type: application/json' \
  -d '{"cpf":"11144477735","senha":"uma senha boa"}' -w 'outro CPF: %{http_code}\n' $P/api/auth/login
```

Esperado: `1:401 2:401 3:401 4:401 5:401 6:429`; com a senha certa, ainda `429` e "Muitas
tentativas para este CPF. Aguarde 15 minutos e tente de novo."; outro CPF entra normalmente
(`200`). Repetir os 6 envios com `12345678909` (não cadastrado): mesma sequência e **mesma**
mensagem de bloqueio. Para liberar antes dos 15 minutos: `docker compose restart app` (o
contador fica em memória).

## Cenário 5: limite por rede (FR-017a, SC-009)

Aguardar 1 minuto depois do cenário 4 (as falhas dele também contam no limite por rede).

```bash
# 40 logins bem-sucedidos: não contam para o limite
for i in $(seq 1 40); do
  curl -s -o /dev/null -H "Origin: $P" -H 'Content-Type: application/json' \
    -d '{"cpf":"11144477735","senha":"uma senha boa"}' -w '%{http_code} ' $P/api/auth/login
done; echo
# 61 tentativas malsucedidas (CPF inválido: dá 400 e não aciona o bloqueio por CPF)
for i in $(seq 1 61); do
  curl -s -o /dev/null -H "Origin: $P" -H 'Content-Type: application/json' \
    -d '{"cpf":"52998224724","senha":"x"}' -w '%{http_code} ' $P/api/auth/login
done; echo
```

Esperado: os 40 logins dão `200` (sucessos não contam); nas falhas, 60 respostas `400` e a 61ª
`429` com "Muitas tentativas a partir desta rede. Aguarde um minuto e tente de novo.". O
cadastro tem o seu próprio limite, igual. Observação (research R6): no Docker Desktop, todas as
máquinas da sala podem aparecer com o mesmo IP; nesse caso o limite vale para a sala inteira,
por isso ele é folgado e só conta falhas.

## Cenário 6: área do candidato e redirecionamentos (US4, FR-021 a FR-024)

- Logado, abrir `/`, `/cadastro` e `/entrar`: todos levam a `/candidato`.
- Na área do candidato: saudação pelo primeiro nome e três caminhos. "Estudar" leva à página
  "em breve" com volta; "Iniciar a certificação" abre a confirmação com as regras (150
  segundos, resposta única, interrupção encerra a questão) e só depois leva a `/certificacao`
  ("em breve"); "Sair" encerra a sessão.
- Sem login, abrir `/candidato` e `/certificacao`: levam a `/entrar`; abrir `/candidato.html`
  leva primeiro a `/candidato` e daí a `/entrar`.
- Em todas as páginas (inicial, cadastro, entrar, termos, candidato e "em breve"), o rodapé
  mostra "Portal no ar · banco conectado" e o link dos termos.
- Em `/termos`, o contato para dúvidas sobre os dados é a página de issues do repositório no
  GitHub, com o aviso de não publicar dados pessoais; os termos dizem que o endereço de rede é
  usado só momentaneamente para limitar tentativas.
- Sair e entrar de novo: volta à mesma área do candidato, sem certificação iniciada.

## Cenário 7: proteções (R3, R7)

```bash
curl -s -H 'Origin: http://localhost:8080' -H 'Content-Type: application/json' \
  -d '{"cpf":"52998224725","senha":"uma senha boa"}' -w ' %{http_code}\n' $P/api/auth/login
curl -s -H "Origin: $P" -H 'Content-Type: text/plain' -d 'x' -w ' %{http_code}\n' $P/api/auth/login
curl -s -H "Origin: $P" -H 'Content-Type: application/json' -d '{"cpf":' -w ' %{http_code}\n' $P/api/auth/login
curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' $P/candidato.html
curl -sI $P/ | grep -i -E 'content-security-policy|x-content-type-options|access-control'
```

Esperado: `403` (outra porta é *same-site*, mas outro host); `415`; `400` "Envie os dados em
JSON." para o JSON malformado; `301` de `/candidato.html` para `/candidato` (o arquivo não
escapa da regra de sessão); CSP com `'self'` e sem `upgrade-insecure-requests`; nenhum
`Access-Control-Allow-Origin`.

## Cenário 8: segredo da sessão (FR-029, SC-008, research R4)

```bash
docker compose exec app ls -l /app/segredo            # segredo-sessao, dono node, -rw-------
# com uma sessão aberta no navegador:
docker compose down && docker compose up -d --build --wait   # sessão continua válida
docker compose down -v && docker compose up -d --build --wait # sessão inválida, volta ao login
JWT_SECRET=curto docker compose up -d --build --wait          # app não sobe: mensagem sobre 32 caracteres
docker compose up -d --build --wait                            # volta ao normal
```

Esperado: o segredo nasce sozinho na primeira subida, sem `.env`; `down` preserva as sessões;
`down -v` as invalida; `JWT_SECRET` curto impede a subida com mensagem clara; com
`JWT_SECRET` longa o bastante, ela tem prioridade sobre o arquivo.

## Cenário 9: dados pessoais (SC-006, Princípio VI)

```bash
docker compose exec db psql -U portal -d bdcertificacao -c \
  "select cpf, left(senha, 7) as inicio_hash, length(senha) as tamanho, data_aceite_termos from tbcandidato;"
docker compose logs app | grep -c -E 'uma senha boa|52998224725|maria@exemplo.com'
```

Esperado: CPF só com 11 dígitos; `senha` começando com `$2b$12$` e com 60 caracteres;
`data_aceite_termos` preenchida; `0` ocorrências de senha, CPF ou e-mail nos logs.

## Cenário 10: feature 001 continua valendo

- `docker compose exec app npm run verificar-carga`: código 0, com o `AVISO` de "tabelas de uso
  com dados" se houver candidatos cadastrados (esperado depois deste roteiro).
- `scripts/validar-001.sh` continua passando (a tela inicial mantém "Portal de Certificação" no
  título e o estado do portal no rodapé).

## Cenário 11: acesso pelo IP da rede local (celular na apresentação, R3)

A porta do portal é publicada em todas as interfaces da máquina, então outro aparelho na mesma
rede (Wi-Fi da sala) acessa pelo IP dela. Se não abrir, liberar a porta 3000 no firewall da
máquina (por exemplo, `ufw` no Linux ou o Firewall do Windows).

```bash
IP=$(hostname -I | awk '{print $1}')   # Linux; macOS: ipconfig getifaddr en0; Windows: ipconfig
curl -s -c /tmp/c-ip.txt -H "Origin: http://$IP:3000" -H 'Content-Type: application/json' \
  -d '{"cpf":"11144477735","senha":"uma senha boa"}' -w ' %{http_code}\n' http://$IP:3000/api/auth/login
curl -s -H 'Origin: http://localhost:3000' -H 'Content-Type: application/json' \
  -d '{"cpf":"11144477735","senha":"uma senha boa"}' -w ' %{http_code}\n' http://$IP:3000/api/auth/login
```

Esperado: `200` na primeira (o `Origin` bate com o endereço pelo qual a requisição chegou) e
`403` na segunda (`Origin` de `localhost` numa requisição que chegou pelo IP). Depois, no
celular, na mesma rede:

1. Abrir `http://<IP>:3000`: a tela inicial aparece, com o rodapé "Portal no ar · banco
   conectado" e as fontes do portal (nada vem da internet).
2. Entrar com `111.444.777-35`: chega à área do candidato, com a saudação pelo primeiro nome.
3. Sair e conferir que `/candidato` volta a levar a `/entrar`.

Nenhuma configuração muda entre o acesso por `localhost` e pelo IP: a checagem de origem usa o
endereço da própria requisição, não `PUBLIC_BASE_URL`.

## Testes automatizados

```bash
docker compose exec app npm test
```

Esperado: todos os testes passam, incluindo os novos (CPF, cadastro, login, sessão, bloqueios,
páginas e proteções), e o banco não fica com candidatos de teste (cada caso roda em transação
desfeita, research R12).
