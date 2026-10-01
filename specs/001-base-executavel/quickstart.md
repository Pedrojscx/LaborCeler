# Quickstart: validação da feature 001

Roteiro para provar, de ponta a ponta, que a base executável atende a spec. Comandos e saídas
esperadas estão no contrato [execucao-e-verificacao.md](contracts/execucao-e-verificacao.md);
regras da carga em [data-model.md](data-model.md).

## Pré-requisitos

- Git, Docker Engine ≥ 20.10 e Docker Compose ≥ v2.2.1 (ou Docker Desktop ≥ 4.3)
  (`docker version`, `docker compose version`; research R14).
- Nenhum Node.js, PostgreSQL ou `.env` necessário na máquina.
- Porta 3000 livre (ou outra, via `PORT`).

## Cenário 1: subida a partir de clone limpo (História 1, SC-001)

```bash
git clone <url-do-repositório> portal-teste && cd portal-teste
time docker compose up -d --wait
docker compose ps
```

Esperado:
- `db` e `app` aparecem como `healthy`, sem nenhum passo além do `up` (o `--wait` só serve para
  cronometrar; `docker compose up` sozinho também sobe tudo).
- `http://localhost:3000` abre a página inicial mostrando "Portal no ar" e "Banco conectado".
- `curl -s localhost:3000/api/saude` devolve `status: ok`, `banco: ok`, 12 temas, 48 questões,
  192 alternativas, ≥ 12 materiais, `provisorio: true` e `cargaCompleta: true`.

## Cenário 2: conteúdo carregado e íntegro (História 2, SC-002, SC-003)

```bash
docker compose exec app npm run verificar-carga
docker compose exec db psql -U portal -d bdcertificacao -c "select count(*) from tbquestao;"
```

Esperado:
- Verificação termina com código 0, todas as regras `OK` e um `AVISO` de conteúdo provisório
  com 48 questões, 12 materiais e 60 imagens.
- A consulta retorna `48` (critério do dossiê 4.1).
- Abrir `http://localhost:3000/img/questoes/tema07-q2.svg` mostra a imagem com a faixa
  "PROVISÓRIO".

## Cenário 3: persistência (História 3, SC-004, SC-005)

```bash
docker compose exec db psql -U portal -d bdcertificacao -c \
  "insert into tbcandidato (cpf, nome, email, senha, data_aceite_termos)
   values ('00000000191', 'Teste Persistência', 'teste@exemplo.com',
           '\$2a\$10\$iF3Uyk5uDGHThv1WHmrEdOYjdV8034sc9IpVMoQ7mPZHP.2tH4Fb6', now());"
for i in 1 2 3; do docker compose down && docker compose up -d --wait; done
docker compose exec db psql -U portal -d bdcertificacao -c "select nome from tbcandidato;"
docker compose exec app npm run verificar-carga
```

Esperado:
- O candidato de teste continua presente após 3 ciclos.
- A verificação continua com 12 / 48 / 192 (sem duplicação) e mostra `AVISO` de tabelas de uso
  não vazias.
- Cada `up -d --wait` termina em até 1 minuto. Como o `--wait` espera o healthcheck do `app`
  (`GET /api/saude`), isso mede o portal respondendo com o banco conectado, não só os
  containers iniciados (SC-005).
- O candidato de teste usa um hash bcrypt fixo de exemplo (custo 10, da senha fictícia
  `senha-de-exemplo`; nunca senha em texto puro, Princípio VI); ele é apagado no cenário 4.

## Cenário 4: recriar o banco do zero (FR-014, FR-014a)

```bash
docker compose down -v && docker compose up -d --wait
docker compose exec db psql -U portal -d bdcertificacao -c "select count(*) from tbcandidato;"
```

Esperado: `0` (dados apagados) e verificação da carga novamente toda `OK`.

## Cenário 5: casos-limite

- **Carga com erro**: em uma cópia local, duplicar uma alternativa correta no
  `03-seed-questoes.sql`, rodar `docker compose down -v && docker compose up`. O `db` para com
  a mensagem do índice `ux_alternativa_correta` e o `app` não sobe. Rodar `docker compose up -d`
  de novo **sem** `-v`: o initdb é pulado, o `app` sobe e `/api/saude` mostra
  `cargaCompleta: false` (12 temas, 0 questões) e a página inicial mostra "Carga incompleta".
  Desfazer a alteração e rodar `down -v` de novo.
- **Porta ocupada**: `PORT=3100 docker compose up -d` e acessar `http://localhost:3100`.
- **Banco fora do ar**: `docker compose stop db`; `/api/saude` responde `503` e o `app` passa a
  `unhealthy` em `docker compose ps`; `docker compose start db` e o endpoint volta a `200` (e o
  `app` a `healthy`) sem reiniciar o app.

## Cenário 6: acesso opcional ao banco

```bash
docker compose port db 5432     # sem override: nenhuma porta publicada (erro)
cp docker-compose.override.example.yml docker-compose.override.yml
docker compose up -d
docker compose port db 5432     # esperado: 127.0.0.1:5433
rm docker-compose.override.yml && docker compose up -d
```

Esperado: com o override, um cliente SQL conecta em `127.0.0.1:5433`; de outra máquina da rede,
não conecta. Sem o override, a porta volta a ficar fechada.

## Testes automatizados

```bash
docker compose exec app npm test
```

Esperado: todos os testes passam (verificação da carga, `/api/saude` e entrega de imagem).
Para rodar um só arquivo: `docker compose exec app node --test test/saude.test.js`.
