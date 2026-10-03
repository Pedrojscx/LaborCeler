# Proposta: modelo de dados da área de estudos

**Feature**: `003-area-de-estudos` | **Data**: 2026-10-03 | **Situação**: recomendação, **não
aplicada**; a revisão final e a atualização do Modelo Lógico em PDF ficam com o mantenedor,
responsável pelo modelo de dados (Princípio III).

Nada aqui altera `db/01-ddl.sql` nem `docs/modelagem/`. Depois da revisão, a mudança aprovada
entra no DDL e no Modelo Lógico no mesmo PR, como exige o Princípio III.

## Situação atual

```sql
create table if not exists tbimagem(
   id serial not null primary key,
   arquivo varchar(255) not null,
   texto_alternativo varchar(255) not null,
   credito varchar(255) null
);

create table if not exists tbmaterial(
   id serial not null primary key,
   idtema integer not null,
   titulo varchar(150) not null,
   conteudo varchar not null,
   tipo varchar(10) not null,
   ordem integer not null,
   check (tipo in ('TEXTO', 'VIDEO', 'LINK')),
   unique (idtema, ordem),
   foreign key (idtema) references tbtema(id)
);
```

Os tipos `VIDEO` e `LINK` já existem, mas não há onde guardar o arquivo do vídeo, o da legenda e
o endereço da leitura externa, e as imagens não têm legenda (spec, FR-010, FR-011, FR-013 e
FR-014).

## Recomendação

### `tbmaterial`: vídeo e leitura externa

- `arquivo_video varchar(255) null`: caminho do MP4, relativo a `app/public/` (mesmo padrão de
  `tbimagem.arquivo`), por exemplo `video/materiais/tema05-retrospective.mp4`.
- `arquivo_legenda varchar(255) null`: caminho do WebVTT em português, por exemplo
  `video/materiais/tema05-retrospective.pt-br.vtt`.
- `endereco_externo varchar(500) null`: endereço da leitura externa, sempre `https://`.
- `conteudo`, que já é obrigatório, passa a ter um significado por tipo: o Markdown do texto
  (`TEXTO`), a transcrição (`VIDEO`) e a frase sobre o que a pessoa vai encontrar (`LINK`).

Regras, todas declarativas, sem trigger:

- os dois arquivos existem se, e somente se, o material é vídeo;
- a transcrição de um vídeo não pode estar vazia;
- o endereço externo existe se, e somente se, o material é leitura externa, e começa com
  `https://`.

Nas regras, cada coluna aparece com `is not null` além da comparação: num `check`, uma expressão
que resulta em nulo é aceita, e sem isso um `LINK` sem endereço passaria.

### `tbimagem`: legenda

- `legenda varchar(255) null`: legenda opcional da figura, usada tanto nos materiais quanto nas
  questões (a tela da questão mostra a imagem com legenda).

### DDL proposto

No DDL definitivo, as colunas e as regras entram direto nos `create table`, no lugar dos
`alter table` abaixo, mantendo o padrão do arquivo.

```sql
alter table tbimagem
   add column legenda varchar(255) null;

alter table tbmaterial
   add column arquivo_video varchar(255) null,
   add column arquivo_legenda varchar(255) null,
   add column endereco_externo varchar(500) null,
   -- vídeo tem os dois arquivos; os outros tipos não têm nenhum
   add constraint ck_material_video_arquivos check (
      (tipo = 'VIDEO' and arquivo_video is not null and arquivo_legenda is not null)
      or (tipo <> 'VIDEO' and arquivo_video is null and arquivo_legenda is null)
   ),
   -- a transcrição (conteudo) de um vídeo não pode ser vazia
   add constraint ck_material_video_transcricao check (
      tipo <> 'VIDEO' or length(trim(conteudo)) > 0
   ),
   -- leitura externa tem endereço https; os outros tipos não têm endereço
   add constraint ck_material_link_endereco check (
      (tipo = 'LINK' and endereco_externo is not null and endereco_externo like 'https://%')
      or (tipo <> 'LINK' and endereco_externo is null)
   );
```

### Modelo Lógico

- `tbmaterial` ganha `arquivo_video` (0,1), `arquivo_legenda` (0,1) e `endereco_externo` (0,1).
- `tbimagem` ganha `legenda` (0,1).
- Relacionamentos e cardinalidades não mudam.

## Regras fora do banco

### Imagens no Markdown

- No texto em Markdown, a imagem é referenciada só pelo identificador, como `![](imagem:12)`.
- Na conversão, o servidor troca a referência pela figura completa, a partir de `tbimagem`:
  arquivo, texto alternativo, legenda e crédito. O autor do texto não repete esses dados.
- O servidor recusa a referência a uma imagem que não esteja ligada ao material em
  `tbmaterial_por_imagem`: a figura não é exibida, e a verificação de conteúdo da carga acusa o
  problema antes da entrega. A consulta abaixo lista essas referências:

```sql
-- referências a imagens no Markdown que não estão ligadas ao material
select m.id as idmaterial, ref.idimagem
  from tbmaterial m
 cross join lateral (
       select (r[1])::integer as idimagem
         from regexp_matches(m.conteudo, '!\[\]\(imagem:([0-9]+)\)', 'g') as r
       ) ref
  left join tbmaterial_por_imagem mi
    on mi.idmaterial = m.id and mi.idimagem = ref.idimagem
 where m.tipo = 'TEXTO'
   and mi.idimagem is null;
```

### Duração dos vídeos

A duração é lida do próprio arquivo MP4, no servidor, sem campo no banco. Ela alimenta o tempo
estimado do tema e a duração exibida junto do vídeo (Princípio IV).

### Quantidade de materiais

Contagem por tema, calculada (Princípio IV).

## Validação (2026-10-03)

Os blocos SQL deste documento foram executados como estão em PGlite (PostgreSQL 18 em WASM, não o
16 da imagem do projeto), sobre `db/01-ddl.sql` e as duas cargas atuais:

- a carga atual passa em todas as regras novas;
- aceitos: vídeo completo; leitura externa com `https://`; imagem com legenda e sem legenda;
- recusados: vídeo sem legenda; vídeo com transcrição em branco; texto com arquivo de vídeo;
  leitura externa sem endereço; leitura externa com `http://`; texto com endereço externo;
- a consulta de referências encontra só a imagem não ligada ao material de teste, ignora a que
  está ligada e não acha nenhum problema na carga atual;
- sem o `is not null` na regra do endereço, um `LINK` sem endereço é aceito, o que confirma a
  necessidade dele.

Falta rodar no PostgreSQL 16 do `docker compose`.

## Alternativa considerada

Especialização `tbvideo` (1:1 com `tbmaterial`): mais normalizada, mas exige trigger para
garantir que só materiais `VIDEO` tenham linha nela e que todo `VIDEO` tenha exatamente uma.
Descartada em favor das regras declarativas acima.

## Ponto que fica para o plano

A marcação, no Markdown, do destaque "Para lembrar" (por exemplo, citação com uma palavra-chave
na primeira linha). Não afeta o banco.
