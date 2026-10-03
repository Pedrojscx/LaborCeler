# Proposta: modelo de dados do histórico da certificação

**Feature**: `006-historico-certificacao` | **Data**: 2026-10-03 | **Situação**: coluna dedicada
recomendada e adotada pelo mantenedor em 03/10/2026 (P-02), **não aplicada**; a atualização do
DDL e do Modelo Lógico em PDF fica com o mantenedor, responsável pelo modelo de dados
(Princípio III).

Nada aqui altera `db/01-ddl.sql` nem `docs/modelagem/`. A mudança entra no DDL e no Modelo Lógico
no mesmo PR, como exige o Princípio III, junto com a proposta da 004
(`specs/004-fluxo-certificacao/proposta-modelo-de-dados.md`), da qual dependem as várias
tentativas por candidato (decisão D1) e que é a primeira a gravar a coluna.

## Situação atual

O histórico (RF20) pede, para cada tema, a data e a hora da resposta e, quando não houve
resposta, a do encerramento (spec, FR-007). `tbresposta` já permite montar quase tudo:

| Situação | Alternativa escolhida | Data e hora exibidas | De onde vem |
|---|---|---|---|
| `RESPONDIDA` | `idalternativa` | horário da resposta | `data_hora_resposta` |
| `EXPIRADA` | nenhuma | fim do prazo | `data_hora_exibicao` + 150 segundos (derivado) |
| `INTERROMPIDA` | nenhuma | momento da interrupção | **não é gravado** |

O momento da interrupção é um fato, não um dado derivado. Pela decisão do mantenedor
(03/10/2026), é o momento em que a pessoa fechou ou recarregou a página, registrado quando o
servidor recebe o aviso de interrupção; se o aviso não chegar, é o momento do novo pedido da
questão aberta; e, em "Interromper", o momento da confirmação (spec 004, FR-010 e FR-012). A
restrição `check ((situacao = 'RESPONDIDA') = (data_hora_resposta is not null))` impede que ele
seja guardado em `data_hora_resposta`, e nenhuma outra coluna o registra.

## Recomendação

### Horário da interrupção (opção recomendada e adotada)

Uma coluna própria, preenchida só na situação `INTERROMPIDA`, com o relógio do servidor, no
mesmo padrão das restrições que já ligam `data_hora_resposta` à situação:

```sql
alter table tbresposta
   -- momento da interrupção, pelo relógio do servidor (RF14, RF20; spec 006, FR-007)
   add column data_hora_interrupcao timestamp null,
   -- só a questão interrompida tem horário de interrupção
   add constraint ck_resposta_interrupcao
      check ((situacao = 'INTERROMPIDA') = (data_hora_interrupcao is not null)),
   -- a interrupção acontece com a questão aberta: depois da exibição e até 152 segundos
   -- (150 do prazo e 2 de tolerância, como em ck_resposta_prazo da proposta da 004)
   add constraint ck_resposta_interrupcao_prazo
      check (data_hora_interrupcao is null
             or data_hora_interrupcao between data_hora_exibicao
                                         and data_hora_exibicao + interval '152 seconds');
```

**Justificativa**: a coluna dedicada não muda o significado de `data_hora_resposta`, que continua
sendo só "respondeu às", e as consultas que contam ou exibem respostas não precisam filtrar pela
situação para separar resposta de interrupção.

No DDL definitivo, a coluna e as duas restrições entram direto no `create table` de
`tbresposta`, no lugar do `alter table`. As operações de interromper da 004 (aviso de
interrupção, novo pedido da questão aberta e "Interromper", FR-010, FR-012 e FR-017) gravam
`data_hora_interrupcao = now()` junto com a troca da situação; como a 004 ainda não foi
implementada, a mudança entra nela sem migração de dados.

O horário do tempo esgotado continua sem coluna: é sempre a exibição mais 150 segundos, e
gravá-lo repetiria um dado que já existe (Princípio IV).

**Alternativa considerada e não recomendada**: aceitar `data_hora_resposta` também na situação
`INTERROMPIDA`, trocando a restrição por
`check ((situacao in ('RESPONDIDA', 'INTERROMPIDA')) = (data_hora_resposta is not null))`. Evita
uma coluna, mas a coluna passaria a significar duas coisas ("respondeu às" e "foi interrompida
às"), e toda consulta que conta respostas precisaria filtrar pela situação para não confundir as
duas.

### Consulta de referência: aviso de interrupção (spec 004)

O aviso enviado ao fechar ou recarregar a página identifica a questão pelo número do tema (o mesmo
de "Tema [n] de 12"), sem identificador interno do banco. A atualização só age sobre a questão
aberta da tentativa em andamento do candidato da sessão `$1`, se ela for a do tema `$2` e estiver
dentro dos 150 segundos; em qualquer outro caso, não altera nada. Depois dos 150 segundos, o
código encerra a questão como expirada (spec 004, FR-009).

```sql
-- aviso de interrupção do tema $2 recebido do candidato $1 (spec 004, FR-010)
update tbresposta r
   set situacao = 'INTERROMPIDA',
       data_hora_interrupcao = now()
  from tbcertificacao c, tbquestao q, tbtema t
 where c.idcandidato = $1
   and c.data_conclusao is null
   and r.idcertificacao = c.id
   and r.situacao = 'EXIBIDA'
   and q.id = r.idquestao
   and t.id = q.idtema
   and t.ordem = $2
   and now() <= r.data_hora_exibicao + interval '150 seconds'
returning r.id;
```

Na aplicação, a atualização roda dentro da operação indivisível da 004 (FR-017), com a
certificação bloqueada.

### Consulta de referência: tentativas do candidato

Lista as tentativas do candidato `$1`, da mais recente para a mais antiga, com o número da
tentativa, as datas, os temas encerrados e os acertos, tudo calculado na hora (Princípio IV). O
número é o que aparece no endereço (`/historico/2`); o identificador interno da certificação não
sai do servidor (spec, FR-002):

```sql
-- tentativas do candidato $1 (spec 006, FR-001 a FR-003)
select (row_number() over (order by c.data_inicio, c.id))::int as numero,
       to_char(c.data_inicio, 'DD/MM/YYYY') as inicio,
       to_char(c.data_conclusao, 'DD/MM/YYYY') as conclusao,
       (count(r.id) filter (where r.situacao <> 'EXIBIDA'))::int as temas_encerrados,
       (count(r.id) filter (where a.correta))::int as acertos,
       exists (select 1 from tbcertificado ce where ce.idcertificacao = c.id) as tem_certificado
  from tbcertificacao c
  left join tbresposta r on r.idcertificacao = c.id
  left join tbalternativa a on a.id = r.idalternativa
 where c.idcandidato = $1
 group by c.id
 order by c.data_inicio desc, c.id desc;
```

Percentual, nota e aprovação saem dos acertos pelas regras da 005 (FR-001 a FR-003).

### Consulta de referência: histórico de uma tentativa

Monta as linhas da tentativa de número `$2` do candidato `$1`. Como o número é sempre contado entre
as tentativas do próprio candidato, nenhum número leva à tentativa de outra pessoa; número sem
tentativa dá o mesmo resultado vazio (spec, FR-013). O formato do número (inteiro positivo) é
conferido antes da consulta. A questão aberta nunca entra:

```sql
-- histórico da tentativa de número $2 do candidato $1 (spec 006, FR-004 a FR-009)
with tentativa as (
   select n.id
     from (select c.id, row_number() over (order by c.data_inicio, c.id) as numero
             from tbcertificacao c
            where c.idcandidato = $1) n
    where n.numero = $2
)
select t.ordem,
       t.nome as tema,
       q.enunciado,
       esc.letra as escolhida_letra,
       esc.texto as escolhida_texto,
       cor.letra as correta_letra,
       cor.texto as correta_texto,
       case r.situacao
          when 'RESPONDIDA' then case when esc.correta then 'ACERTOU' else 'ERROU' end
          when 'EXPIRADA' then 'TEMPO_ESGOTADO'
          when 'INTERROMPIDA' then 'INTERROMPIDA'
       end as situacao,
       to_char(case r.situacao
                  when 'RESPONDIDA' then r.data_hora_resposta
                  when 'EXPIRADA' then r.data_hora_exibicao + interval '150 seconds'
                  when 'INTERROMPIDA' then r.data_hora_interrupcao
               end, 'DD/MM/YYYY HH24:MI') as data_hora
  from tentativa tt
  join tbresposta r on r.idcertificacao = tt.id
  join tbquestao q on q.id = r.idquestao
  join tbtema t on t.id = q.idtema
  join tbalternativa cor on cor.idquestao = q.id and cor.correta
  left join tbalternativa esc on esc.id = r.idalternativa
 -- a questão aberta não aparece, para não revelar nada antes do encerramento (FR-008)
 where r.situacao <> 'EXIBIDA'
 order by t.ordem;
```

Os horários são do tipo `timestamp` e já estão no horário de Brasília, porque o
`docker-compose.yml` configura `TZ` e `PGTZ` como `America/Sao_Paulo` para o banco; por isso a
consulta não converte fuso. Antes dela, o pedido aplica o encerramento preguiçoso da 004
(FR-009): a questão aberta há mais de 152 segundos passa a `EXPIRADA` e entra no histórico.

### Modelo Lógico

- `tbresposta` ganha o atributo opcional `data_hora_interrupcao`, preenchido só quando a situação
  é `INTERROMPIDA`, entre a exibição e 152 segundos depois dela.
- Nenhum relacionamento muda além do que a proposta da 004 já recomenda (candidato com várias
  certificações, no máximo uma em andamento).

## Validação (2026-10-03)

O bloco de mudança e as três consultas deste documento foram executados como estão, lidos deste
arquivo, em PGlite (PostgreSQL 18 em WASM, não o 16 da imagem do projeto), com fuso
`America/Sao_Paulo`, sobre `db/01-ddl.sql`, as duas cargas atuais e a proposta da 004. Dados de
teste: a candidata 1 com uma tentativa concluída (as quatro situações, temas gravados fora de
ordem) e outra em andamento (dois temas encerrados e um aberto); o candidato 2 com uma tentativa
em andamento, sem questão aberta; a candidata 3 com uma questão aberta há 30 segundos; e o
candidato 4 com uma questão aberta há 151 segundos. 32 verificações, nenhuma falha:

- a carga atual e a proposta da 004 aceitam a mudança;
- aceitos: passar uma questão exibida a interrompida com o horário da interrupção; interromper
  aos 152 segundos exatos;
- recusados (`ck_resposta_interrupcao`): interrompida sem horário; horário de interrupção em
  questão exibida, respondida ou expirada; recusados (`ck_resposta_interrupcao_prazo`):
  interrupção antes da exibição e depois de 152 segundos;
- tentativas: as da candidata 1 saem na ordem 2, 1, numeradas pela data de início, sem o
  identificador interno; a concluída tem 9 acertos, com a errada, a expirada e a interrompida
  contadas como erro; a em andamento tem 2 temas encerrados, sem contar o aberto; o candidato 2
  vê só a sua, numerada 1;
- histórico da tentativa 1 da candidata 1: 12 linhas na ordem dos temas, de 1 a 12, apesar da
  gravação fora de ordem; acertou com escolhida igual à correta; errou com escolhida diferente;
  tempo esgotado sem escolhida e com o horário da exibição mais 150 segundos; interrompida sem
  escolhida e com o horário da interrupção; respondida com o horário da resposta;
- histórico da tentativa 2 da candidata 1, em andamento: só os 2 temas encerrados, sem nenhum
  texto da questão aberta;
- numeração por candidato: o candidato 2 pedindo a tentativa 2 recebe o mesmo vazio de uma
  tentativa inexistente, e a tentativa 1 dele mostra só a própria resposta; a candidata 1 pedindo
  a tentativa 3 recebe o vazio;
- aviso de interrupção: sem questão aberta, nada muda; do candidato 2 para o tema aberto da
  candidata 3, a questão dela continua aberta; de um tema que não é o aberto (aviso atrasado),
  nada muda; depois de 150 segundos, não interrompe; aviso válido interrompe a questão aberta com
  o horário do recebimento; aviso repetido não muda nada; o histórico da candidata 3 mostra a
  interrompida com o horário do aviso.

Falta rodar no PostgreSQL 16 do `docker compose`.
