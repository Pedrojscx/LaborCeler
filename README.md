# Portal de Certificação em Metodologias Ágeis

Portal web em que o candidato estuda os 12 temas de Metodologias Ágeis, faz uma prova com
uma questão sorteada por tema e, se aprovado, recebe um certificado com validação pública por
QR Code. Projeto acadêmico da ABP do 1º semestre de DSM da FATEC (2026-2).

Stack: Node.js 24 + Express 5 (API e front estático), PostgreSQL 16 com SQL escrito à mão,
front em HTML, CSS e JavaScript puros, tudo orquestrado com Docker Compose.

## Instalação

### Pré-requisitos

| Ferramenta | Versão mínima | Como conferir |
|---|---|---|
| Git | qualquer versão recente | `git --version` |
| Docker Engine | 20.10 | `docker version` |
| Docker Compose (plugin `docker compose`, v2) | v2.2.1 | `docker compose version` |
| Docker Buildx (plugin `docker buildx`) | recomendado | `docker buildx version` |

No Windows e no macOS, o **Docker Desktop 4.3 ou mais novo** já traz Engine, Compose e Buildx
nessas versões. O antigo `docker-compose` (v1, com hífen) não serve.

O Buildx não é obrigatório: sem ele o Compose constrói a imagem com o builder clássico e
emite um aviso, mas o portal sobe do mesmo jeito. No Linux ele costuma vir em um pacote à
parte (`docker-buildx-plugin` no repositório oficial do Docker para Debian/Ubuntu/Fedora,
`docker-buildx` no Arch).

**Não** é preciso instalar Node.js nem PostgreSQL na máquina, nem criar arquivo `.env`: tudo
roda dentro dos containers com valores padrão de desenvolvimento.

### Subir o portal

```bash
git clone <url-do-repositório>
cd <pasta-do-repositório>
docker compose up
```

É o único comando necessário. Na primeira vez ele constrói a imagem da aplicação, cria o
banco com o esquema oficial (`db/01-ddl.sql`) e carrega o conteúdo inicial. Variações úteis:

- `docker compose up -d`: sobe em segundo plano e devolve o terminal.
- `docker compose up -d --wait`: sobe em segundo plano e só retorna quando o portal já está
  respondendo com o banco conectado.

### Depois de atualizar o código

Depois de `git pull`, de trocar de branch ou de qualquer mudança no código, a recomendação é
subir com:

```bash
docker compose up -d --build --wait
```

O próprio `docker compose up` já reconstrói a imagem da aplicação a cada subida (o que não mudou
vem do cache), então não roda código antigo; o `--build` deixa isso explícito e o `--wait` só
retorna quando o portal já responde. Os scripts de `db/*.sql`, por outro lado, só rodam com o
banco vazio: mudanças neles exigem recriar o banco com `docker compose down -v`, o que **apaga
todos os dados**.

### Acessar

Abra **<http://localhost:3000>**. A página inicial mostra "Portal no ar" e "Banco conectado".
O estado também pode ser consultado em `http://localhost:3000/api/saude`.

### Portas

- **3000**: porta do portal. Se estiver ocupada, escolha outra com a variável `PORT`, por
  exemplo `PORT=3100 docker compose up`, e acesse `http://localhost:3100` (o endereço público
  acompanha a porta).
- **Banco de dados**: não é exposto no host, então não conflita com um PostgreSQL instalado na
  máquina. A aplicação fala com ele pela rede interna do Compose.
  Para inspecioná-lo com um cliente SQL, veja [Acesso ao banco por cliente SQL](#acesso-ao-banco-por-cliente-sql).

## Operação

### Parar e voltar a subir (os dados são mantidos)

```bash
docker compose down                   # para e remove os containers; os dados ficam
docker compose up -d --build --wait   # sobe de novo
```

Os dados gravados (cadastros, certificações, respostas e certificados) ficam no volume
`dados_banco` e sobrevivem a `down`/`up` e a reinícios da máquina. A carga inicial **não** roda
de novo: o banco continua com 12 temas e 48 questões, sem duplicar nada.

Depois de `git pull`, de trocar de branch ou de mudar o código, use o mesmo
`docker compose up -d --build --wait` (ver [Depois de atualizar o código](#depois-de-atualizar-o-código)).

### Recriar o banco do zero

```bash
docker compose down -v
docker compose up -d --build --wait
```

> **Atenção:** o `-v` apaga o volume `dados_banco` e, com ele, **todos os dados gravados**
> (candidatos, certificações, respostas e certificados). A subida seguinte recria o esquema e
> a carga inicial.

**Alterações nos scripts `db/*.sql` só têm efeito depois de recriar o banco do zero.** Os
scripts rodam apenas quando o banco está vazio; mudar um seed e só reiniciar o sistema não
muda nada no banco.

### Se a primeira carga falhar ou aparecer "Carga incompleta"

Se um script de `db/` falhar na primeira subida (por exemplo, um seed com erro), o serviço `db`
para com a mensagem do erro e a aplicação não sobe; veja a mensagem com `docker compose logs db`.
Como o volume já foi criado, uma nova subida **pula** a carga e o banco fica incompleto: a
página inicial mostra "Carga incompleta" e a verificação da carga lista o que falta. Para
resolver, corrija o script e recrie o banco do zero (`docker compose down -v` e
`docker compose up -d --build --wait`).

### Verificar a carga e rodar os testes

```bash
docker compose exec app npm run verificar-carga          # confere a carga inicial
docker compose exec app npm test                         # todos os testes
docker compose exec app node --test test/saude.test.js   # um único arquivo de teste
```

A verificação imprime uma linha por regra (`OK`, `ERRO` ou `AVISO`) e termina com código `0`
sem erros, `1` com algum `ERRO` e `2` se não conseguir conectar ao banco. Dois avisos são
esperados: "conteúdo provisório", enquanto as questões, materiais e imagens forem provisórios,
e "tabelas de uso com dados", depois que o portal começa a ser usado.

### Acesso ao banco por cliente SQL

Por padrão o banco não é exposto. Para um terminal SQL rápido, sem abrir porta nenhuma:

```bash
docker compose exec db psql -U portal -d bdcertificacao
```

Para usar um cliente gráfico (DBeaver, pgAdmin etc.), ative o arquivo de override opcional:

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
docker compose up -d --build --wait
```

Conecte em **host `127.0.0.1`, porta `5433`**, usuário `portal`, senha `portal` e banco
`bdcertificacao` (ou os valores de `POSTGRES_*`, se tiverem sido alterados). O banco fica
acessível só nesta máquina, nunca pela rede local, e a porta 5433 não conflita com um
PostgreSQL instalado na 5432. O `docker-compose.override.yml` não é versionado. Para fechar o
acesso de novo:

```bash
rm docker-compose.override.yml
docker compose up -d --build --wait
```

## Variáveis de ambiente

Nenhuma é obrigatória nesta versão: sem `.env`, valem os padrões abaixo. Para alterar alguma,
copie `.env.example` para `.env` (que não é versionado) e mude só o que precisar.

| Variável | Serviço | Padrão | Finalidade |
|---|---|---|---|
| `PORT` | app | `3000` | porta do portal, publicada no host com o mesmo número |
| `PUBLIC_BASE_URL` | app | `http://localhost:${PORT}` | endereço público do portal (usado no QR Code do certificado) |
| `DATABASE_URL` | app | `postgres://portal:portal@db:5432/bdcertificacao` | conexão da aplicação com o banco |
| `JWT_SECRET` | app | sem padrão | assinatura de sessão; ainda não usada (entra com o login) e nunca tem valor padrão versionado |
| `POSTGRES_USER` | db | `portal` | usuário criado na primeira subida |
| `POSTGRES_PASSWORD` | db | `portal` | senha desse usuário |
| `POSTGRES_DB` | db | `bdcertificacao` | banco criado na primeira subida |

As variáveis `POSTGRES_*` só têm efeito na primeira subida (banco ainda vazio) e precisam bater
com `DATABASE_URL`. Os valores padrão são só para desenvolvimento; credenciais reais nunca são
versionadas.
