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

### Acessar

Abra **<http://localhost:3000>**. A página inicial mostra "Portal no ar" e "Banco conectado".
O estado também pode ser consultado em `http://localhost:3000/api/saude`.

### Portas

- **3000**: porta do portal. Se estiver ocupada, escolha outra com a variável `PORT`, por
  exemplo `PORT=3100 docker compose up`, e acesse `http://localhost:3100` (o endereço público
  acompanha a porta).
- **Banco de dados**: não é exposto no host, então não conflita com um PostgreSQL instalado na
  máquina. A aplicação fala com ele pela rede interna do Compose.

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
