-- ============================================================
-- Portal de Certificação em Metodologias Ágeis
-- ABP 1º DSM 2026-2 · FATEC Jacareí
-- Modelo físico (PostgreSQL) · versão 1.0 · 30/09/2026
-- Responsável: Pedro Lucas
-- ============================================================

-- É boa prática primeiro excluir as tabelas.
-- As tabelas que possuem chave estrangeira são excluídas antes.
drop table if exists tbresposta;
drop table if exists tbcertificado;
drop table if exists tbcertificacao;
drop table if exists tbcandidato;
drop table if exists tbalternativa;
drop table if exists tbquestao;
drop table if exists tbmaterial_por_imagem;
drop table if exists tbmaterial;
drop table if exists tbimagem;
drop table if exists tbtema;
drop function if exists fn_uma_resposta_por_tema();

-- ------------------------------------------------------------
-- Catálogo (carregado por script SQL)
-- Primeiro são criadas as tabelas referenciadas pelas chaves estrangeiras.
-- ------------------------------------------------------------

create table if not exists tbtema(
   id serial not null primary key,
   nome varchar(80) not null unique,
   descricao varchar(500) not null,
   ordem integer not null unique,
   -- a certificação tem 12 temas (RF05)
   check (ordem between 1 and 12)
);

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
   -- a ordem não se repete dentro do mesmo tema
   unique (idtema, ordem),
   foreign key (idtema)
   references tbtema(id)
);

-- relacionamento N:N entre material de estudo e imagem
create table if not exists tbmaterial_por_imagem(
   idmaterial integer not null,
   idimagem integer not null,
   primary key(idmaterial, idimagem),
   foreign key (idmaterial)
   references tbmaterial(id),
   foreign key (idimagem)
   references tbimagem(id)
);

create table if not exists tbquestao(
   id serial not null primary key,
   idtema integer not null,
   -- unique: cada imagem ilustra no máximo uma questão (1:1)
   idimagem integer not null unique,
   enunciado varchar not null,
   justificativa varchar null,
   foreign key (idtema)
   references tbtema(id),
   foreign key (idimagem)
   references tbimagem(id)
);

create table if not exists tbalternativa(
   id serial not null primary key,
   idquestao integer not null,
   letra char(1) not null,
   texto varchar(500) not null,
   correta boolean not null,
   check (letra in ('A', 'B', 'C', 'D')),
   -- a mesma letra não se repete na questão (RF08)
   unique (idquestao, letra),
   -- permite à tbresposta conferir se a alternativa é da questão sorteada
   unique (id, idquestao),
   foreign key (idquestao)
   references tbquestao(id)
);

-- apenas uma alternativa correta por questão (RF08)
create unique index if not exists ux_alternativa_correta
   on tbalternativa(idquestao)
   where correta;

-- ------------------------------------------------------------
-- Uso do portal (preenchido pelo back-end)
-- ------------------------------------------------------------

create table if not exists tbcandidato(
   id serial not null primary key,
   -- somente os 11 dígitos, guardado como texto para manter zeros à esquerda
   cpf varchar(11) not null unique,
   nome varchar(150) not null,
   email varchar(254) not null,
   -- hash da senha, nunca o texto digitado (RNF03)
   senha varchar(255) not null,
   data_cadastro timestamp not null default now(),
   data_aceite_termos timestamp not null,
   check (cpf ~ '^[0-9]{11}$')
);

create table if not exists tbcertificacao(
   id serial not null primary key,
   -- unique: cada candidato faz uma única certificação (1:1)
   idcandidato integer not null unique,
   data_inicio timestamp not null default now(),
   -- nula enquanto a prova está em andamento
   data_conclusao timestamp null,
   check (data_conclusao is null or data_conclusao >= data_inicio),
   foreign key (idcandidato)
   references tbcandidato(id)
);

create table if not exists tbcertificado(
   id serial not null primary key,
   -- unique: no máximo um certificado por certificação (1:1)
   idcertificacao integer not null unique,
   -- código aleatório gravado no QR Code (RF19, RP08)
   codigo_validacao uuid not null unique default gen_random_uuid(),
   data_hora_emissao timestamp not null default now(),
   foreign key (idcertificacao)
   references tbcertificacao(id)
);

create table if not exists tbresposta(
   id serial not null primary key,
   idcertificacao integer not null,
   idquestao integer not null,
   -- nula quando o tempo expira ou a questão é interrompida
   idalternativa integer null,
   -- início dos 150 segundos, pelo relógio do servidor (RF10, RNF04)
   data_hora_exibicao timestamp not null default now(),
   data_hora_resposta timestamp null,
   situacao varchar(12) not null default 'EXIBIDA',
   check (situacao in ('EXIBIDA', 'RESPONDIDA', 'EXPIRADA', 'INTERROMPIDA')),
   -- só a resposta enviada tem alternativa e horário de resposta
   check ((situacao = 'RESPONDIDA') = (idalternativa is not null)),
   check ((situacao = 'RESPONDIDA') = (data_hora_resposta is not null)),
   check (data_hora_resposta is null or data_hora_resposta >= data_hora_exibicao),
   unique (idcertificacao, idquestao),
   foreign key (idcertificacao)
   references tbcertificacao(id),
   foreign key (idquestao)
   references tbquestao(id),
   -- a alternativa escolhida precisa ser da questão sorteada
   foreign key (idalternativa, idquestao)
   references tbalternativa(id, idquestao)
);

-- ------------------------------------------------------------
-- Uma resposta por tema em cada certificação (RF05, RF15)
-- O tema está na tbquestao, por isso a regra é conferida por trigger.
-- ------------------------------------------------------------
create or replace function fn_uma_resposta_por_tema()
returns trigger as $$
begin
   if exists (
      select 1
        from tbresposta r
        join tbquestao q on q.id = r.idquestao
       where r.idcertificacao = new.idcertificacao
         and r.id <> new.id
         and q.idtema = (select idtema from tbquestao where id = new.idquestao)
   ) then
      raise exception 'A certificação % já possui resposta para este tema', new.idcertificacao;
   end if;
   return new;
end;
$$ language plpgsql;

create trigger tg_uma_resposta_por_tema
   before insert or update of idcertificacao, idquestao on tbresposta
   for each row execute function fn_uma_resposta_por_tema();
