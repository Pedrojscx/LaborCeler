# Proposta: modelo de dados dos flashcards e do perfil

**Feature**: `007-flashcards-perfil` | **Data**: 2026-10-03 | **Situação**: recomendação, **não
aplicada**; a sessão de revisão registrada foi adotada pelo mantenedor em 03/10/2026 (P-01 da
spec); a revisão final e a atualização do Modelo Lógico em PDF ficam com o mantenedor,
responsável pelo modelo de dados (Princípio III).

Nada aqui altera `db/01-ddl.sql` nem `docs/modelagem/`. Depois da revisão, a mudança aprovada
entra no DDL e no Modelo Lógico no mesmo PR, como exige o Princípio III. A proposta parte do
esquema atual mais as propostas da 004 (várias tentativas por candidato, usadas por "Lua cheia" e
pela conta ativa) e da 006.

## Situação atual

O esquema não tem onde guardar cartões, sessões nem revisões. A regra 2 do mantenedor previa duas
tabelas, `tbflashcard` (tema, frente, verso, imagem opcional e ordem) e `tbrevisao` (candidato,
cartão, avaliação e momento). Como "Primeira órbita" é a primeira **sessão concluída** (regra 9), e
o histórico de revisões não diz quais avaliações formaram uma sessão nem se ela foi concluída, o
mantenedor adotou uma terceira tabela, `tbsessao_revisao`, com o início e a conclusão de cada sessão
(P-01 da spec, 03/10/2026). Domínio, fila da sessão, evolução, próximo foco, conquistas, datas das
conquistas, contas ativas e raridade são calculados a partir dessas tabelas e das respostas da
certificação, sem nada armazenado à parte (Princípio IV).

A decisão sobre o aviso de atualização dos termos (P-10 da spec) acrescenta uma coluna em
`tbcandidato`, descrita no fim da recomendação.

## Recomendação

### `tbflashcard`: cartões por tema

- `idtema`: tema do cartão, um dos 12 da certificação.
- `frente` e `verso`: pergunta e resposta, nunca em branco.
- `idimagem`: imagem opcional, mostrada na frente do cartão, reaproveitando `tbimagem` (arquivo,
  texto alternativo, crédito e, com a proposta da 003, legenda).
- `ordem`: posição do cartão no tema, sem repetição dentro do tema, no mesmo padrão de
  `tbmaterial`.

### `tbsessao_revisao`: sessões de revisão

- Uma linha por sessão, criada quando a pessoa escolhe "Começar revisão", com o início pelo
  relógio do servidor.
- `data_conclusao` é preenchida quando a pessoa chega ao resumo com pelo menos uma avaliação, pelo
  último cartão ou por "Encerrar revisão" (spec, FR-020). Sessão abandonada (página fechada) ou
  encerrada sem nenhuma avaliação fica sem conclusão e não conta para "Primeira órbita".
- A lista de cartões da sessão não é gravada (ver "Ponto que fica para o plano").

### `tbrevisao`: histórico de revisões

- Uma linha por avaliação: candidato, cartão, sessão, avaliação (`NAO_SABIA`, `QUASE` ou `SABIA`) e
  o momento, pelo relógio do servidor (`default now()`, como `data_hora_exibicao`).
- O candidato continua na revisão, como a regra 2 pede, e a chave estrangeira composta
  `(idsessao_revisao, idcandidato)` garante que ele é o mesmo da sessão. É o mesmo padrão que o
  esquema já usa em `tbresposta`, que guarda `idquestao` junto de `idalternativa` e confere os dois
  contra `tbalternativa(id, idquestao)`.
- Nada mais: nem domínio, nem tema. O tema vem do cartão; o domínio e as conquistas, das consultas
  abaixo.

### Duas views de cálculo

O cálculo do domínio é o mesmo para a fila, o perfil, a área de estudos, o resumo da sessão e as
conquistas. Para não repetir a mesma consulta em cinco lugares, a proposta o põe em duas views,
que o Princípio IV admite ("consultas ou views"). Nenhuma delas grava dado: são consultas com
nome.

- `vw_revisao_dominio`: cada revisão com o estado de domínio do cartão logo depois dela.
- `vw_conquista`: cada conquista obtida por candidato, com a data de obtenção.

### DDL proposto

No DDL definitivo, as tabelas entram depois de `tbcandidato`, nesta ordem: `tbflashcard`,
`tbsessao_revisao` e `tbrevisao`. O `drop` de cada uma entra no topo do arquivo, antes de
`tbcandidato` e `tbtema` (primeiro `tbrevisao`, depois `tbsessao_revisao` e `tbflashcard`), junto
com o `drop view` das duas views.

```sql
-- cartões de flashcards, por tema (spec 007, FR-003)
create table if not exists tbflashcard(
   id serial not null primary key,
   idtema integer not null,
   -- pergunta (frente) e resposta (verso) do cartão
   frente varchar(300) not null,
   verso varchar(1000) not null,
   -- imagem opcional, mostrada na frente do cartão
   idimagem integer null,
   ordem integer not null,
   check (length(trim(frente)) > 0),
   check (length(trim(verso)) > 0),
   check (ordem > 0),
   -- a ordem não se repete dentro do mesmo tema
   unique (idtema, ordem),
   foreign key (idtema)
   references tbtema(id),
   foreign key (idimagem)
   references tbimagem(id)
);

-- sessão de revisão, de "Começar revisão" ao resumo (spec 007, FR-020 e FR-023)
create table if not exists tbsessao_revisao(
   id serial not null primary key,
   idcandidato integer not null,
   data_inicio timestamp not null default now(),
   -- preenchida quando a pessoa chega ao resumo com pelo menos uma avaliação
   data_conclusao timestamp null,
   check (data_conclusao is null or data_conclusao >= data_inicio),
   -- permite à tbrevisao conferir se a sessão é do mesmo candidato
   unique (id, idcandidato),
   foreign key (idcandidato)
   references tbcandidato(id)
);

-- histórico de revisões: cada avaliação de um cartão por um candidato (spec 007, FR-018)
create table if not exists tbrevisao(
   id serial not null primary key,
   idcandidato integer not null,
   idflashcard integer not null,
   idsessao_revisao integer not null,
   avaliacao varchar(9) not null,
   -- momento da avaliação, pelo relógio do servidor
   data_hora_revisao timestamp not null default now(),
   check (avaliacao in ('NAO_SABIA', 'QUASE', 'SABIA')),
   foreign key (idcandidato)
   references tbcandidato(id),
   foreign key (idflashcard)
   references tbflashcard(id),
   -- a revisão pertence a uma sessão do mesmo candidato
   foreign key (idsessao_revisao, idcandidato)
   references tbsessao_revisao(id, idcandidato)
);

-- revisões de um candidato, cartão a cartão, na ordem do tempo
create index if not exists ix_revisao_candidato
   on tbrevisao(idcandidato, idflashcard, data_hora_revisao);
```

Duas regras ligam linhas de tabelas diferentes e ficam no código, dentro da operação que grava a
avaliação ou conclui a sessão: só se grava revisão numa sessão sem conclusão, e só se conclui uma
sessão que tenha pelo menos uma revisão.

### Domínio (regra 3 do mantenedor)

Um cartão está dominado quando recebeu "Sabia" em pelo menos duas revisões feitas em dias
diferentes e a revisão mais recente dele foi "Sabia". O primeiro "Quase" ou "Não sabia" derruba o
domínio, que recomeça do zero. O dia é o do calendário de São Paulo.

A consulta divide as revisões de cada cartão em **trechos**: um trecho começa no início do
histórico e a cada "Quase" ou "Não sabia". Depois de uma revisão, o cartão está dominado se ela
foi "Sabia" e o trecho dela já tem "Sabia" em pelo menos dois dias diferentes. Como os horários
são `timestamp` no horário de Brasília (o `docker-compose.yml` configura `TZ` e `PGTZ` como
`America/Sao_Paulo`), o dia é `data_hora_revisao::date`, sem conversão de fuso. Empates no mesmo
instante são desfeitos pelo `id`.

```sql
-- estado de domínio do cartão depois de cada revisão (spec 007, FR-024; Princípio IV)
create or replace view vw_revisao_dominio as
with linha as (
   select r.id, r.idcandidato, r.idflashcard, r.avaliacao, r.data_hora_revisao,
          -- trecho: recomeça a cada "Quase" ou "Não sabia"
          count(*) filter (where r.avaliacao <> 'SABIA')
             over (partition by r.idcandidato, r.idflashcard
                   order by r.data_hora_revisao, r.id) as trecho
     from tbrevisao r
)
select l.id, l.idcandidato, l.idflashcard, l.avaliacao, l.data_hora_revisao,
       -- dominado depois desta revisão: é "Sabia" e o trecho já tem "Sabia" em dois dias
       l.avaliacao = 'SABIA'
       and dense_rank() over (partition by l.idcandidato, l.idflashcard, l.trecho, l.avaliacao
                              order by l.data_hora_revisao::date) >= 2 as dominado
  from linha l;
```

O `dense_rank` por dia, dentro do trecho e só entre as revisões "Sabia", conta quantos dias
diferentes de "Sabia" o trecho tem até o dia da revisão, inclusive. O "Quase" ou "Não sabia" que
abre o trecho fica numa partição à parte e não conta dia: um "Sabia" no mesmo dia de um erro conta
esse dia, desde que venha depois do erro.

#### Consulta de referência: domínio atual de cada cartão

```sql
-- domínio atual de cada cartão para o candidato $1 (spec 007, FR-024)
with ultima as (
   select distinct on (v.idflashcard) v.idflashcard, v.dominado
     from vw_revisao_dominio v
    where v.idcandidato = $1
    order by v.idflashcard, v.data_hora_revisao desc, v.id desc
)
select t.ordem as tema, f.ordem, f.id as idflashcard,
       coalesce(u.dominado, false) as dominado
  from tbflashcard f
  join tbtema t on t.id = f.idtema
  left join ultima u on u.idflashcard = f.id
 order by t.ordem, f.ordem;
```

#### Consulta de referência: domínio por tema e próximo foco

Serve a tela 16 ("[n] cartões, [n] dominados"), o perfil (12 barras e total), a área de estudos
("Flashcards dominados [n] de [n]") e a página do tema. O próximo foco é o tema com a menor
proporção de cartões dominados, com desempate pela ordem do tema (spec, FR-032): basta ordenar
esta consulta por `dominados::numeric / cartoes, tema`.

```sql
-- cartões e cartões dominados por tema, para o candidato $1 (spec 007, FR-025 e FR-032)
with ultima as (
   select distinct on (v.idflashcard) v.idflashcard, v.dominado
     from vw_revisao_dominio v
    where v.idcandidato = $1
    order by v.idflashcard, v.data_hora_revisao desc, v.id desc
)
select t.ordem as tema,
       count(f.id)::integer as cartoes,
       (count(f.id) filter (where u.dominado))::integer as dominados
  from tbtema t
  left join tbflashcard f on f.idtema = t.id
  left join ultima u on u.idflashcard = f.id
 group by t.ordem
 order by t.ordem;
```

### Consulta de referência: fila da sessão (regra 4)

Na opção "só os que ainda não domino": primeiro os cartões cuja última avaliação foi "Não sabia",
depois "Quase", depois os nunca revisados e, por fim, os revisados há mais tempo (última avaliação
"Sabia", ainda sem domínio). Dentro de cada grupo, a revisão mais antiga vem antes; empates e
cartões nunca revisados seguem a ordem do tema e a do cartão. Na opção "todos os cartões", os
dominados entram no fim, também do revisado há mais tempo para o mais recente (spec, FR-009 e
FR-010). `$4` nulo é "Todos" (`limit null` não limita).

```sql
-- fila da sessão do candidato $1: temas $2 (ordens), opção $3 ('PENDENTES' ou 'TODOS'),
-- tamanho $4 (nulo = todos) (spec 007, FR-009 a FR-011)
with ultima as (
   select distinct on (v.idflashcard)
          v.idflashcard, v.avaliacao, v.data_hora_revisao, v.dominado
     from vw_revisao_dominio v
    where v.idcandidato = $1
    order by v.idflashcard, v.data_hora_revisao desc, v.id desc
)
select f.id as idflashcard, t.ordem as tema, f.ordem,
       case
          when u.idflashcard is null then 3   -- nunca revisado
          when u.dominado then 5              -- dominado (só na opção 'TODOS')
          when u.avaliacao = 'NAO_SABIA' then 1
          when u.avaliacao = 'QUASE' then 2
          else 4                              -- "Sabia", ainda sem domínio
       end as grupo
  from tbflashcard f
  join tbtema t on t.id = f.idtema
  left join ultima u on u.idflashcard = f.id
 where t.ordem = any ($2::integer[])
   and ($3::text = 'TODOS' or not coalesce(u.dominado, false))
 order by grupo, u.data_hora_revisao nulls first, t.ordem, f.ordem
 limit $4::integer;
```

A volta do "Não sabia" no fim da mesma sessão (regra 5) não muda a fila guardada em lugar nenhum:
é um cartão a mais no fim da sessão em andamento (ver "Ponto que fica para o plano").

### Consulta de referência: cartões dominados nos últimos 14 dias

Cada barra do gráfico do perfil é o número de cartões dominados ao fim do dia, do 13º dia antes de
hoje até hoje (spec, FR-031). A consulta transforma o histórico em mudanças de domínio (+1 quando
o cartão passa a dominado, -1 quando perde) e soma as mudanças até o fim de cada dia.

```sql
-- cartões dominados ao fim de cada um dos últimos 14 dias, para o candidato $1 (spec 007, FR-031)
with mudanca as (
   select v.data_hora_revisao, case when v.dominado then 1 else -1 end as delta
     from (select v.*,
                  coalesce(lag(v.dominado) over (partition by v.idflashcard
                                                 order by v.data_hora_revisao, v.id),
                           false) as antes
             from vw_revisao_dominio v
            where v.idcandidato = $1) v
    where v.dominado <> v.antes
)
select d.dia::date as dia,
       coalesce((select sum(m.delta)
                   from mudanca m
                  where m.data_hora_revisao::date <= d.dia::date), 0)::integer as dominados
  from generate_series(current_date - 13, current_date, interval '1 day') as d(dia)
 order by d.dia;
```

### Conquistas e datas de obtenção (regra 9)

Cada conquista é obtida no primeiro momento em que a condição passa a valer, e a data é esse
momento (spec, FR-035). Pela decisão do mantenedor (spec, FR-036, P-05), a conquista continua
obtida mesmo que o domínio se perca depois: a view guarda o primeiro momento (`min`), e nada a
desfaz.

| Conquista | Chave | Condição | Data |
|---|---|---|---|
| Primeira órbita | `PRIMEIRA_ORBITA` | primeira sessão concluída | conclusão dessa sessão |
| Explorador de [corpo] | `EXPLORADOR_[ordem]` | todos os cartões do tema dominados ao mesmo tempo | revisão que completou o tema |
| Meio caminho | `MEIO_CAMINHO` | pelo menos um cartão dominado em 6 temas ao mesmo tempo | revisão que levou ao 6º tema |
| Cem revisões | `CEM_REVISOES` | 100 revisões | 100ª revisão |
| Constância | `CONSTANCIA` | revisões em 5 dias diferentes, seguidos ou não | primeira revisão do 5º dia |
| Sistema completo | `SISTEMA_COMPLETO` | todos os cartões dos 12 temas dominados ao mesmo tempo | revisão que completou o último |
| Lua cheia | `LUA_CHEIA` | tentativa concluída com 8 acertos ou mais, em qualquer tentativa | conclusão da tentativa aprovada |

"Lua cheia" é calculada das respostas, como manda o Princípio IV, com a regra de aprovação da 005
(FR-001 e FR-003): acerto é resposta `RESPONDIDA` com a alternativa correta.

```sql
-- conquistas obtidas e data de obtenção, por candidato (spec 007, FR-034 a FR-036)
create or replace view vw_conquista as
with mudanca as (
   -- +1 quando o cartão passa a dominado; -1 quando perde o domínio
   select v.idcandidato, v.id, v.data_hora_revisao as momento, f.idtema,
          case when v.dominado then 1 else -1 end as delta
     from (select v.*,
                  coalesce(lag(v.dominado) over (partition by v.idcandidato, v.idflashcard
                                                 order by v.data_hora_revisao, v.id),
                           false) as antes
             from vw_revisao_dominio v) v
     join tbflashcard f on f.id = v.idflashcard
    where v.dominado <> v.antes
),
contagem as (
   -- cartões dominados no tema e no total, logo depois de cada mudança
   select m.*,
          sum(m.delta) over (partition by m.idcandidato, m.idtema
                             order by m.momento, m.id) as no_tema,
          sum(m.delta) over (partition by m.idcandidato
                             order by m.momento, m.id) as no_total
     from mudanca m
),
temas as (
   -- temas com cartão dominado: +1 quando o tema sai de zero, -1 quando volta a zero
   select c.idcandidato, c.id, c.momento,
          sum(case when c.delta = 1 and c.no_tema = 1 then 1
                   when c.delta = -1 and c.no_tema = 0 then -1
                   else 0 end)
             over (partition by c.idcandidato order by c.momento, c.id) as com_dominio
     from contagem c
),
cartoes_por_tema as (
   select f.idtema, count(*) as total
     from tbflashcard f
    group by f.idtema
),
revisoes as (
   select r.idcandidato, r.data_hora_revisao,
          row_number() over (partition by r.idcandidato
                             order by r.data_hora_revisao, r.id) as n
     from tbrevisao r
),
dias as (
   select r.idcandidato, min(r.data_hora_revisao) as inicio,
          row_number() over (partition by r.idcandidato
                             order by r.data_hora_revisao::date) as n
     from tbrevisao r
    group by r.idcandidato, r.data_hora_revisao::date
)
-- primeira sessão concluída
select s.idcandidato, 'PRIMEIRA_ORBITA'::text as conquista,
       min(s.data_conclusao) as data_obtencao
  from tbsessao_revisao s
 where s.data_conclusao is not null
 group by s.idcandidato
union all
select c.idcandidato, 'EXPLORADOR_' || t.ordem, min(c.momento)
  from contagem c
  join cartoes_por_tema ct on ct.idtema = c.idtema
  join tbtema t on t.id = c.idtema
 where c.no_tema = ct.total
 group by c.idcandidato, t.ordem
union all
select t.idcandidato, 'MEIO_CAMINHO', min(t.momento)
  from temas t
 where t.com_dominio >= 6
 group by t.idcandidato
union all
select r.idcandidato, 'CEM_REVISOES', r.data_hora_revisao
  from revisoes r
 where r.n = 100
union all
select d.idcandidato, 'CONSTANCIA', d.inicio
  from dias d
 where d.n = 5
union all
select c.idcandidato, 'SISTEMA_COMPLETO', min(c.momento)
  from contagem c
 where c.no_total = (select count(*) from tbflashcard)
 group by c.idcandidato
union all
-- aprovação em qualquer tentativa: 8 acertos ou mais (spec 005, FR-001 e FR-003)
select ce.idcandidato, 'LUA_CHEIA', min(ce.data_conclusao)
  from tbcertificacao ce
 where ce.data_conclusao is not null
   and (select count(*)
          from tbresposta r
          join tbalternativa a on a.id = r.idalternativa
         where r.idcertificacao = ce.id
           and r.situacao = 'RESPONDIDA'
           and a.correta) >= 8
 group by ce.idcandidato;
```

As conquistas da própria pessoa saem de `select conquista, data_obtencao from vw_conquista where
idcandidato = $1`. O progresso das que ainda não foram obtidas (anel do perfil, spec FR-037) sai
do domínio por tema, da contagem de revisões e da contagem de dias, sem consulta nova.

### Consulta de referência: raridade (regra 10, Princípio VI)

Conta ativa é a que fez pelo menos uma revisão ou respondeu pelo menos uma questão nos últimos 30
dias, pelo relógio do servidor; "respondeu" é ter uma resposta `RESPONDIDA` (spec, FR-038). A
raridade de cada conquista é o percentual das contas ativas que a têm, e só sai com 30 contas
ativas ou mais; abaixo disso, o percentual vem nulo e a página não mostra nada. A consulta devolve
só o percentual por conquista, nunca quem a tem.

```sql
-- raridade de cada conquista entre as contas ativas (spec 007, FR-038 e FR-039)
with ativa as (
   select c.id as idcandidato
     from tbcandidato c
    where exists (select 1
                    from tbrevisao r
                   where r.idcandidato = c.id
                     and r.data_hora_revisao >= now() - interval '30 days')
       or exists (select 1
                    from tbresposta r
                    join tbcertificacao ce on ce.id = r.idcertificacao
                   where ce.idcandidato = c.id
                     and r.situacao = 'RESPONDIDA'
                     and r.data_hora_resposta >= now() - interval '30 days')
),
contas as (
   select count(*) as total from ativa
),
catalogo as (
   select 'PRIMEIRA_ORBITA'::text as conquista
   union all select 'EXPLORADOR_' || t.ordem from tbtema t
   union all select 'MEIO_CAMINHO'
   union all select 'CEM_REVISOES'
   union all select 'CONSTANCIA'
   union all select 'SISTEMA_COMPLETO'
   union all select 'LUA_CHEIA'
)
select k.conquista,
       case when ct.total >= 30
            then round(100.0 * count(q.idcandidato) / ct.total, 1)
       end as percentual
  from catalogo k
 cross join contas ct
  left join vw_conquista q
    on q.conquista = k.conquista
   and q.idcandidato in (select a.idcandidato from ativa a)
 group by k.conquista, ct.total
 order by k.conquista;
```

### `tbcandidato`: aviso de atualização dos termos (P-10 da spec)

Pela decisão do mantenedor (03/10/2026), a atualização dos termos não pede novo aceite, mas quem já
tinha conta antes dela recebe, uma única vez, no próximo acesso, a notificação "Atualizamos os
termos de uso e privacidade" com o link para os termos (spec, FR-045a). "Uma única vez" exige
lembrar que o aviso já foi dado, o que nenhuma coluna guarda hoje: `data_aceite_termos` é o aceite
do cadastro e não pode mudar de significado.

- `data_aviso_termos timestamp null`: momento em que o candidato recebeu o último aviso de
  atualização dos termos, pelo relógio do servidor. Nula para quem nunca precisou de aviso. É um
  dado gerado pelo uso, como o aceite (Princípio VI), e os termos passam a citá-lo.
- A data da versão vigente dos termos não vai para o banco: é a mesma data exibida no topo da
  página dos termos ("Última atualização"), que a aplicação passa como parâmetro.

**Regra do aviso (mantenedor, 03/10/2026)**: o aviso compara `data_aviso_termos` com a data da
versão vigente dos termos. Avisa quem se cadastrou antes dessa versão e ainda não foi avisado dela,
isto é, quem tem o aviso nulo ou anterior a ela. Quem se cadastrou depois já aceitou a versão
vigente no cadastro e nunca é avisado. No esquema, "se cadastrou antes" é conferido pelo aceite do
cadastro, `data_aceite_termos`, gravado junto com `data_cadastro` (spec 002, FR-011); a cada nova
versão dos termos, a mesma regra vale de novo.

```sql
-- momento do último aviso de atualização dos termos (spec 007, FR-045a)
alter table tbcandidato
   add column data_aviso_termos timestamp null;
```

No DDL definitivo, a coluna entra direto no `create table` de `tbcandidato`, logo depois de
`data_aceite_termos`, no lugar do `alter table`.

A consulta aplica a regra e registra o aviso numa única operação: devolve uma linha só quando o
candidato se cadastrou antes da versão vigente dos termos e ainda não foi avisado dela, e, ao
devolver, grava o momento do aviso, de modo que o próximo acesso (ou um acesso simultâneo em outra
aba) não devolve nada.

```sql
-- aviso de atualização dos termos para o candidato $1; $2 é a data da versão vigente dos
-- termos, a mesma exibida no topo da página dos termos (spec 007, FR-045a)
update tbcandidato c
   set data_aviso_termos = now()
 where c.id = $1
   and c.data_aceite_termos < $2::timestamp
   and (c.data_aviso_termos is null or c.data_aviso_termos < $2::timestamp)
returning true as avisar;
```

A comparação é pelo início do dia da versão vigente: quem se cadastrou nesse dia ou depois já
aceitou essa versão e não recebe o aviso.

### Modelo Lógico

- `tbtema` (1,1)–(0,n) `tbflashcard`: um tema tem vários cartões.
- `tbimagem` (0,1)–(0,n) `tbflashcard`: um cartão tem no máximo uma imagem.
- `tbcandidato` (1,1)–(0,n) `tbsessao_revisao`: um candidato tem várias sessões de revisão.
- `tbsessao_revisao` (1,1)–(1,n) `tbrevisao` e `tbflashcard` (1,1)–(0,n) `tbrevisao`: cada revisão é
  de um cartão, numa sessão; `tbrevisao` guarda também o candidato, conferido contra o da sessão.
- `tbcandidato` ganha o atributo opcional `data_aviso_termos`.
- As duas views não entram no modelo como entidades; podem ser anotadas como consultas
  derivadas.

## Regras fora do banco: verificação da carga (spec, FR-005)

A verificação de conteúdo da carga (`app/src/verificacao/`, que já emite OK, AVISO e ERRO) passa a
conferir os cartões com as consultas abaixo. Cada linha devolvida é um ERRO.

```sql
-- temas fora da faixa de 8 a 10 cartões (spec 007, FR-005)
select t.ordem, count(f.id)::integer as cartoes
  from tbtema t
  left join tbflashcard f on f.idtema = t.id
 group by t.ordem
having count(f.id) not between 8 and 10
 order by t.ordem;
```

```sql
-- cartões que usam a imagem de uma questão (spec 007, FR-004)
select f.id as idflashcard, q.id as idquestao
  from tbflashcard f
  join tbquestao q on q.idimagem = f.idimagem;
```

Frente e verso em branco e ordem repetida no tema já são recusados pelo próprio esquema; a
verificação confere também que o arquivo de cada imagem de cartão existe, como já faz com as
imagens das questões, e conta os cartões marcados `[PROVISÓRIO]` na frente.

## O que não é gravado (Princípio IV)

Domínio de cada cartão, domínio por tema, próximo foco, fila da sessão, cartões dominados por dia,
conquistas e as datas delas, progresso das conquistas, contas ativas e raridade: tudo sai das
consultas e views acima. O resumo da sessão (tela 18) sai das revisões da própria sessão e do
domínio antes e depois dela. A sessão grava só fatos (início e conclusão), e o aviso dos termos,
só o momento em que foi dado.

## Validação (2026-10-03)

Os blocos SQL deste documento foram executados como estão, lidos deste arquivo, em PGlite
(PostgreSQL 18 em WASM, não o 16 da imagem do projeto), com fuso `America/Sao_Paulo`, sobre
`db/01-ddl.sql`, as duas cargas atuais e as propostas da 004 e da 006, com uma carga de teste de
8 cartões por tema (96) e candidatos de teste. 79 verificações, nenhuma falha:

- esquema: recusados frente em branco, verso vazio, ordem repetida no tema, ordem zero, tema e
  imagem inexistentes, avaliação fora das três e revisão de candidato ou cartão inexistente;
  aceita a revisão sem momento informado, que recebe o horário do servidor;
- sessão: recusadas a revisão sem sessão, a revisão na sessão de outro candidato e a sessão
  concluída antes de começar;
- verificação da carga: nenhum tema fora da faixa com 8 cartões em cada; acusados um tema com 11
  e outro com 7; cartão com imagem de material aceito e não acusado; cartão com a imagem de uma
  questão acusado;
- domínio: dois "Sabia" no mesmo dia não dominam; "Sabia" em dois dias dominam; "Quase" depois do
  domínio derruba; depois de um "Não sabia", dois "Sabia" no mesmo dia não reconquistam e um
  terceiro no dia seguinte reconquista; um "Sabia" no mesmo dia de um erro, mas depois dele,
  conta o dia; "Sabia" às 23:59:59 e às 00:00:01 são dias diferentes em São Paulo; cartão nunca
  revisado não domina; o domínio de um candidato não aparece para outro;
- domínio por tema e próximo foco: contagens certas, e o empate de proporção é desfeito pela
  ordem do tema;
- fila: "Não sabia" (o mais antigo primeiro), "Quase", nunca revisados (na ordem do tema e do
  cartão) e revisados há mais tempo; o dominado fica fora em "só os que ainda não domino" e entra
  no fim em "todos"; o tamanho corta a fila no começo;
- conquistas: Primeira órbita na conclusão da primeira sessão concluída, ignorando a sessão
  aberta, e ausente para quem só tem sessões sem conclusão; Explorador na revisão que completou o
  tema e mantido depois de o domínio cair; Explorador dos 12 temas, cada um na sua data; Meio
  caminho na revisão que levou ao 6º tema; Cem revisões na 100ª; Constância na primeira revisão
  do 5º dia diferente, e ausente com 4 dias ou com 120 revisões num dia só; Sistema completo na
  revisão que completou o último cartão e mantido depois de um "Não sabia"; Lua cheia na conclusão
  da tentativa com 8 acertos, também na segunda tentativa, e ausente com 7 acertos e um tempo
  esgotado ou com a tentativa em andamento;
- 14 dias: um valor por dia, de 13 dias antes de hoje até hoje, com o domínio ganho e perdido no
  período e um cartão dominado antes dele;
- raridade: catálogo de 18 conquistas; com 29 contas ativas, nenhum percentual; com a 30ª conta
  ativa só por ter respondido uma questão, percentuais exibidos (29 de 30 com Primeira órbita,
  96,7%, sem contar a conta inativa que também a tem; 3 de 30 com Cem revisões, 10,0%; 0,0% para
  a que ninguém ativo tem); conta com questão só expirada não é ativa; a consulta devolve só a
  conquista e o percentual;
- aviso dos termos: quem se cadastrou antes da versão vigente é avisado uma vez, e o segundo
  acesso não devolve nada; quem se cadastrou depois não é avisado; numa versão nova, quem já tinha
  sido avisado da anterior é avisado de novo, uma vez, e quem se cadastrou entre as duas também.

Falta rodar no PostgreSQL 16 do `docker compose`.

## Alternativas consideradas

- **Só duas tabelas, sem sessão registrada** (regra 2 original): a sessão existiria só enquanto
  dura, e "Primeira órbita" passaria a ser a primeira revisão registrada. Validada em PGlite e
  descartada pelo mantenedor (P-01), porque a regra 9 define "Primeira órbita" pela primeira
  sessão concluída.
- **Revisão sem o candidato** (só a sessão): mais normalizada, mas toda consulta de domínio teria
  de passar pela sessão; a chave composta mantém o candidato na revisão sem permitir divergência,
  como em `tbresposta`.
- **Domínio guardado em coluna** (por exemplo, `dominado` em uma tabela por candidato e cartão):
  descartada pelo Princípio IV; o domínio é derivado do histórico.
- **Tabela de conquistas obtidas**: descartada pelo Princípio IV; a constituição exige que
  conquistas e datas sejam calculadas.
- **Aviso dos termos guardado no navegador**: dispensa a coluna, mas repetiria o aviso em cada
  aparelho e navegador, e não seria "uma única vez".
- **Consultas sem views**: possível, repetindo o cálculo do domínio na fila, no perfil, na área de
  estudos e nas conquistas. As views evitam a repetição e não gravam nada; a decisão final é do
  mantenedor.

## Ponto que fica para o plano

Onde fica a lista de cartões da sessão em andamento (a fila montada no início, as voltas do "Não
sabia" e quais apresentações já foram avaliadas), para recusar avaliação fora da sessão (spec,
FR-022) e montar o resumo (FR-026). A sessão registrada guarda início e conclusão; a lista fica
fora do banco.
