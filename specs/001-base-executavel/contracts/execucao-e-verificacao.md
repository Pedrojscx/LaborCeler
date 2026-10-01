# Contrato: execução e verificação da carga

Interfaces que a feature 001 expõe a quem roda o projeto: comandos, variáveis de ambiente,
caminhos públicos e saída da verificação. O README (FR-014) é escrito a partir deste contrato.

## Comandos

| Comando | Efeito | Requisito |
|---|---|---|
| `docker compose up` (ou `up -d`) | constrói a imagem do app se preciso, sobe `db` e `app`; na primeira vez cria esquema e carga | FR-001 a FR-003 |
| `docker compose up -d --wait` | idem, e só retorna quando `db` e `app` estão `healthy` (o healthcheck do `app` chama `GET /api/saude`) | SC-005 |
| `docker compose up -d --build --wait` | idem, reconstruindo a imagem do `app` de forma explícita; **recomendado** depois de `git pull`, troca de branch ou mudança em código e `app/public`. O `app` já declara `pull_policy: build` (research R16), então o `up` simples também reconstrói em vez de reaproveitar a imagem `<pasta>-app` antiga | FR-001, FR-014 |
| `docker compose down` | para e remove os containers; **mantém** os dados | FR-010 |
| `docker compose down -v` | para e **apaga** o volume `dados_banco`; a próxima subida recria esquema e carga | FR-014, FR-014a |
| `docker compose exec app npm run verificar-carga` | roda a verificação da carga (abaixo) | FR-016 |
| `docker compose exec app npm test` | roda todos os testes: `node --test "test/**/*.test.js"` | Princípio IX, DoD |
| `docker compose exec app node --test test/saude.test.js` | roda um arquivo de teste (filtro sempre por arquivo, nunca por nome de teste) | — |

## Variáveis de ambiente

Todas opcionais na 001: sem `.env`, valem os padrões (FR-015). `.env.example` lista todas.

| Variável | Serviço | Padrão | Finalidade |
|---|---|---|---|
| `PORT` | app | `3000` | porta do portal, publicada no host com o mesmo número |
| `PUBLIC_BASE_URL` | app | `http://localhost:${PORT}` (derivado de `PORT` quando não definida) | endereço público do portal (usado no QR Code a partir da feature 005) |
| `DATABASE_URL` | app | `postgres://portal:portal@db:5432/bdcertificacao` | conexão do app com o banco |
| `JWT_SECRET` | app | — (sem padrão; vazio no `.env.example`) | assinatura de sessão; não usada na 001, regra definida na 002 (research P1) |
| `POSTGRES_USER` | db | `portal` | usuário criado na primeira subida |
| `POSTGRES_PASSWORD` | db | `portal` | senha desse usuário |
| `POSTGRES_DB` | db | `bdcertificacao` | banco criado na primeira subida |

`POSTGRES_*` só têm efeito na primeira subida (volume vazio) e precisam bater com
`DATABASE_URL`. Por padrão a porta do banco não é publicada no host.

## Versões mínimas

Docker Engine ≥ 20.10 e Docker Compose ≥ v2.2.1 (ou Docker Desktop ≥ 4.3), research R14. Os
healthchecks usam só `start_period`; `start_interval` exigiria Engine ≥ 25.0 e Compose ≥ v2.20.2.

## Acesso opcional ao banco por cliente SQL

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
docker compose up -d
# conectar em 127.0.0.1:5433, usuário/senha/banco conforme POSTGRES_*
```

- O override publica o banco só em `127.0.0.1:5433` (inacessível pela rede local).
- `docker-compose.override.yml` está no `.gitignore`; apagar o arquivo volta ao padrão fechado.

## Caminhos públicos

| Caminho | Conteúdo |
|---|---|
| `/` | `app/public/index.html`: página inicial mínima que consulta `/api/saude` e mostra o estado |
| `/api/saude` | ver [api-saude.openapi.yaml](api-saude.openapi.yaml) |
| `/img/questoes/temaNN-qK.svg` | imagens das questões |
| `/img/materiais/temaNN.svg` | imagens dos materiais |

Rota `/api/*` inexistente responde `404` em JSON (`{"erro": "Rota não encontrada"}`).

## Saída da verificação da carga

- Uma linha por regra, prefixada por `OK`, `ERRO` ou `AVISO`, por exemplo:

  ```text
  OK    12 temas com ordem de 1 a 12, nomes oficiais e descrição preenchida
  OK    4 questões em cada tema (48), todas com enunciado preenchido
  OK    4 alternativas A-D em cada questão (192)
  OK    exatamente 1 alternativa correta em cada questão
  OK    pelo menos 1 material em cada tema
  OK    48 imagens de questão exclusivas, com texto alternativo
  OK    60 arquivos de imagem encontrados em app/public
  OK    tabelas de uso vazias (nenhum dado pessoal na carga)
  AVISO conteúdo provisório: 48 questões, 12 materiais e 60 imagens marcados com [PROVISÓRIO]
  ```

- `ERRO` lista o que falhou (ex.: `tema 7 tem 3 questões`, `questão 12 com enunciado vazio`,
  `arquivo ausente: img/questoes/tema07-q2.svg`).
- Os arquivos são procurados na pasta pública resolvida a partir do módulo
  (`path.resolve(__dirname, '../../public')`), independentemente do diretório de trabalho.
- Código de saída: `0` sem nenhum `ERRO` (avisos não falham); `1` com pelo menos um `ERRO`;
  `2` se não conseguir conectar ao banco.
- O aviso de conteúdo provisório sempre informa as três contagens e só desaparece quando
  todas forem zero; é a checagem a fazer antes da entrega final.
- A regra "tabelas de uso vazias" só é exibida como `AVISO` (não `ERRO`) quando houver dados,
  pois depois de usar o portal elas deixam de estar vazias.
