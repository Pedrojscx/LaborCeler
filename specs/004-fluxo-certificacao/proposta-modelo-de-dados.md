# Proposta: modelo de dados do fluxo da certificação

**Feature**: `004-fluxo-certificacao` | **Data**: 2026-10-03 | **Situação**: recomendação, **não
aplicada**; a revisão final e a atualização do Modelo Lógico em PDF ficam com o mantenedor,
responsável pelo modelo de dados (Princípio III).

Nada aqui altera `db/01-ddl.sql` nem `docs/modelagem/`. Depois da revisão, a mudança aprovada
entra no DDL e no Modelo Lógico no mesmo PR, como exige o Princípio III.

## Situação atual

`tbresposta` já guarda a questão sorteada, a situação (`EXIBIDA`, `RESPONDIDA`, `EXPIRADA` ou
`INTERROMPIDA`), o horário de exibição pelo relógio do servidor, a alternativa e o horário de
resposta, com `unique (idcertificacao, idquestao)` e o gatilho `tg_uma_resposta_por_tema`, que
impede duas respostas para o mesmo tema.

Duas regras da spec (FR-006 e FR-008) ainda dependem só do código: no máximo uma questão aberta
por certificação e nenhuma resposta aceita depois de 152 segundos (150 do prazo e 2 de
tolerância para a rede). O bloqueio da certificação durante cada operação (FR-017) já garante as
duas; a proposta acrescenta uma segunda barreira no próprio banco (Princípio I).

## Recomendação

### Uma única questão aberta por certificação

Índice único parcial sobre as respostas na situação `EXIBIDA`, no mesmo padrão de
`ux_alternativa_correta`:

```sql
-- no máximo uma questão exibida (aberta) por certificação (spec 004, FR-006)
create unique index if not exists ux_resposta_exibida
   on tbresposta(idcertificacao)
   where situacao = 'EXIBIDA';
```

Se, por falha no código, dois pedidos tentarem abrir questão na mesma certificação, o segundo é
recusado pelo banco com violação de unicidade, e o código trata isso como "já existe questão
aberta".

### Resposta só até 152 segundos depois da exibição

```sql
alter table tbresposta
   -- a resposta só vale até 152 segundos depois da exibição: 150 do prazo e 2 de tolerância
   -- para a rede (spec 004, FR-008)
   add constraint ck_resposta_prazo check (
      data_hora_resposta is null
      or data_hora_resposta <= data_hora_exibicao + interval '152 seconds'
   );
```

A regra só vale se a exibição e a resposta forem gravadas pelo mesmo relógio, o do banco, como a
spec recomenda (Assumptions, "Relógio de referência"). No DDL definitivo, ela entra direto no
`create table` de `tbresposta`, no lugar do `alter table`.

### Modelo Lógico

Nenhuma entidade, atributo ou cardinalidade muda; as duas regras são restrições sobre
`tbresposta` e podem ser anotadas no modelo como regras de integridade.

## Regra fora do banco: justificativa das questões

A justificativa continua opcional no esquema, porque a carga provisória pode não tê-la. A
verificação de conteúdo da carga (`app/src/verificacao/`, que já emite OK, AVISO e ERRO) passa a
conferir cada questão: sem justificativa e marcada como provisória (`[PROVISÓRIO]` no enunciado),
AVISO; sem justificativa e não provisória, ERRO. Assim, a carga definitiva não pode ser entregue
com questão sem justificativa (spec 004, FR-031).

## Validação (2026-10-03)

Os blocos SQL deste documento foram executados como estão em PGlite (PostgreSQL 18 em WASM, não o
16 da imagem do projeto), sobre `db/01-ddl.sql` e as duas cargas atuais, com dois candidatos e
duas certificações de teste:

- a carga atual aceita o índice e a regra;
- recusados: abrir a questão do tema 2 com a do tema 1 ainda aberta na mesma certificação
  (`ux_resposta_exibida`); responder aos 153 segundos (`ck_resposta_prazo`);
- aceitos: uma questão aberta em cada certificação ao mesmo tempo; responder aos 152 segundos
  exatos e aos 151; abrir o tema seguinte depois de a questão anterior ser respondida, expirada
  ou interrompida.

Falta rodar no PostgreSQL 16 do `docker compose`.
