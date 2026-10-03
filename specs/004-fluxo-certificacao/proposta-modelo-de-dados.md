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

Com a decisão D1 (03/10/2026), o candidato reprovado pode fazer novas tentativas, e a restrição
`unique` de `tbcertificacao.idcandidato`, que hoje permite uma única certificação por candidato,
passa a impedir o que a decisão permite.

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

### No máximo uma certificação em andamento por candidato (D1)

A restrição única de `tbcertificacao.idcandidato` dá lugar a um índice único parcial que só
permite uma certificação sem data de conclusão por candidato. As tentativas concluídas ficam
como histórico.

```sql
-- D1 (03/10/2026): várias tentativas por candidato, no máximo uma em andamento (spec 004, FR-002)
alter table tbcertificacao drop constraint tbcertificacao_idcandidato_key;

create unique index if not exists ux_certificacao_em_andamento
   on tbcertificacao(idcandidato)
   where data_conclusao is null;
```

No DDL definitivo, `idcandidato integer not null unique` passa a `idcandidato integer not null`,
o comentário "cada candidato faz uma única certificação (1:1)" sai e o índice entra logo depois
do `create table`. O nome `tbcertificacao_idcandidato_key` é o que o PostgreSQL dá à restrição
criada pelo `unique` da coluna.

As outras regras da D1 dependem de outras linhas e ficam no código, dentro da operação que cria
a certificação, com bloqueio da linha do candidato (spec 004, FR-017): a nova tentativa só é
criada se a última estiver concluída há pelo menos 24 horas, pelo relógio do servidor, e não
tiver sido aprovada.

### Consulta de referência para o sorteio (D1)

O sorteio prefere as questões do tema que o candidato ainda não viu em tentativas anteriores;
se já viu as quatro, sorteia entre as quatro. Uma única consulta faz as duas coisas: ordena
primeiro as não vistas e, dentro de cada grupo, ao acaso.

```sql
-- questão sorteada para o tema $1 e o candidato $2 (spec 004, FR-005)
select q.id
  from tbquestao q
 where q.idtema = $1
 order by q.id in (
          select r.idquestao
            from tbresposta r
            join tbcertificacao c on c.id = r.idcertificacao
           where c.idcandidato = $2
       ),
       random()
 limit 1;
```

Na tentativa atual, o tema ainda não tem resposta (uma por tema), então as questões já vistas
são sempre de tentativas anteriores.

### Modelo Lógico

- O relacionamento entre `tbcandidato` e `tbcertificacao` passa de (1,1)–(0,1) para (1,1)–(0,n):
  um candidato pode ter várias certificações, no máximo uma sem data de conclusão.
- As regras sobre `tbresposta` (uma exibida por certificação e resposta até 152 segundos) e
  sobre `tbcertificacao` (uma em andamento por candidato) podem ser anotadas no modelo como
  regras de integridade; nenhum atributo muda.

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
- D1 (mesma data, com a troca da restrição de `tbcertificacao`): recusada uma segunda
  certificação em andamento para o mesmo candidato (`ux_certificacao_em_andamento`); aceitas uma
  certificação em andamento por candidato ao mesmo tempo e novas tentativas depois de concluir a
  anterior;
- consulta do sorteio, em 2.000 a 4.000 execuções por cenário: com as questões 1 e 2 já vistas,
  só saem a 3 e a 4; com 1, 2 e 3 vistas, só sai a 4; com as quatro vistas, as quatro saem entre
  23% e 27% das vezes; para quem não viu nenhuma, também entre 23% e 27%.

Falta rodar no PostgreSQL 16 do `docker compose`.
