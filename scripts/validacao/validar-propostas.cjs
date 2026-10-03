'use strict';
// Validação das propostas de modelo de dados das features 003, 004 (com a 005), 006 e 007 num
// PostgreSQL de verdade (o 16 do docker compose), com as mesmas verificações feitas no PGlite.
// Os blocos SQL são lidos das propostas como estão. Cada conjunto roda num banco descartável,
// criado e apagado por este script; o banco do portal (bdcertificacao) não é tocado.
//
// Uso: PGURL_ADMIN=postgres://usuario:senha@host:5432/postgres node validar-propostas.cjs [conjuntos]
//   conjuntos: lista separada por vírgula (padrão: 003,004,005,006,007)
// Normalmente chamado por scripts/validar-propostas-pg16.sh, dentro do container do app.

process.env.TZ = 'America/Sao_Paulo';

const { readFileSync } = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const RAIZ = process.env.RAIZ_REPO || path.resolve(__dirname, '../..');
// conexão de administração: PGURL_ADMIN ou, no container do app, o DATABASE_URL apontado para o
// banco "postgres" (o usuário do compose é o dono do servidor e pode criar bancos)
function urlAdmin() {
  if (process.env.PGURL_ADMIN) return process.env.PGURL_ADMIN;
  if (!process.env.DATABASE_URL) return null;
  const u = new URL(process.env.DATABASE_URL);
  u.pathname = '/postgres';
  return u.toString();
}
const ADMIN = urlAdmin();
if (!ADMIN) {
  console.error('Defina PGURL_ADMIN (ex.: postgres://portal:portal@db:5432/postgres) ou DATABASE_URL.');
  process.exit(2);
}

const ler = (p) => readFileSync(path.join(RAIZ, p), 'utf8');
const blocos = (p) => [...ler(p).matchAll(/```sql\n([\s\S]*?)```/g)].map((m) => m[1]);
const PROPOSTA = {
  p003: 'specs/003-area-de-estudos/proposta-modelo-de-dados.md',
  p004: 'specs/004-fluxo-certificacao/proposta-modelo-de-dados.md',
  p006: 'specs/006-historico-certificacao/proposta-modelo-de-dados.md',
  p007: 'specs/007-flashcards-perfil/proposta-modelo-de-dados.md',
};

// ---------------------------------------------------------------------------
// resultado

const placar = {};
let conjunto = '';
function conferir(nome, cond, detalhe) {
  placar[conjunto] = placar[conjunto] || { ok: 0, falhas: 0 };
  if (cond) {
    placar[conjunto].ok++;
    console.log('  ok   ', nome);
  } else {
    placar[conjunto].falhas++;
    console.log('  FALHA', nome, detalhe === undefined ? '' : JSON.stringify(detalhe));
  }
}
async function caso(db, nome, sql, esperado, params) {
  let aceito = true;
  let msg = '';
  try {
    await db.query(sql, params);
  } catch (e) {
    aceito = false;
    msg = e.message.split('\n')[0];
  }
  conferir(`${nome} (${esperado ? 'aceito' : 'recusado'})`, aceito === esperado, aceito ? 'aceito' : msg);
}

// ---------------------------------------------------------------------------
// bancos descartáveis

let sequencia = 0;
async function comAdmin(fn) {
  const admin = new Client({ connectionString: ADMIN });
  await admin.connect();
  try {
    return await fn(admin);
  } finally {
    await admin.end();
  }
}
async function novoBanco(nome) {
  const banco = `validacao_${nome}_${process.pid}_${++sequencia}`;
  await comAdmin(async (a) => {
    await a.query(`drop database if exists ${banco}`);
    await a.query(`create database ${banco}`);
  });
  const url = new URL(ADMIN);
  url.pathname = '/' + banco;
  const c = new Client({ connectionString: url.toString() });
  await c.connect();
  // mesmo fuso que o docker-compose.yml configura para o banco
  await c.query("set timezone to 'America/Sao_Paulo'");
  const db = {
    exec: (sql) => c.query(sql),
    query: (sql, params) => c.query(sql, params),
    async close() {
      await c.end();
      await comAdmin((a) => a.query(`drop database if exists ${banco}`));
    },
  };
  for (const f of ['01-ddl.sql', '02-seed-temas-materiais.sql', '03-seed-questoes.sql']) {
    await db.exec(ler('db/' + f));
  }
  return db;
}
function esquema004() {
  // blocos de esquema da 004 (o último é a consulta do sorteio)
  return blocos(PROPOSTA.p004).filter((b) => !b.includes('random()'));
}

const fmt = (d) => {
  if (d === null || d === undefined) return null;
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
};

// ---------------------------------------------------------------------------
// 003: área de estudos

async function validar003() {
  conjunto = '003';
  console.log('\n# 003: vídeo, leitura externa, legenda e imagens no Markdown');
  const b = blocos(PROPOSTA.p003);
  const ddl = b.find((x) => x.startsWith('alter table tbimagem'));
  const consulta = b.find((x) => x.includes('regexp_matches'));
  const db = await novoBanco('p003');
  try {
    await db.exec(ddl);
    conferir('DDL da proposta aplicado sobre a carga atual', true);
    const ins = (c, t, tipo, o, extra = {}) => {
      const cols = ['idtema', 'titulo', 'conteudo', 'tipo', 'ordem', ...Object.keys(extra)];
      const vals = [5, `'${t}'`, `'${c}'`, `'${tipo}'`, o, ...Object.values(extra).map((v) => `'${v}'`)];
      return `insert into tbmaterial (${cols}) values (${vals})`;
    };
    const casos = [
      ['vídeo completo', ins('Transcrição...', 'Retro', 'VIDEO', 2, { arquivo_video: 'video/materiais/t5.mp4', arquivo_legenda: 'video/materiais/t5.pt-br.vtt' }), true],
      ['vídeo sem legenda', ins('Transcrição', 'x', 'VIDEO', 3, { arquivo_video: 'v.mp4' }), false],
      ['vídeo com transcrição em branco', ins('   ', 'x', 'VIDEO', 4, { arquivo_video: 'v.mp4', arquivo_legenda: 'v.vtt' }), false],
      ['texto com arquivo de vídeo', ins('texto', 'x', 'TEXTO', 5, { arquivo_video: 'v.mp4', arquivo_legenda: 'v.vtt' }), false],
      ['leitura externa com https', ins('Leia a seção sobre eventos', 'Scrum Guide', 'LINK', 6, { endereco_externo: 'https://scrumguides.org/scrum-guide.html' }), true],
      ['leitura externa sem endereço', ins('frase', 'x', 'LINK', 7), false],
      ['leitura externa com http', ins('frase', 'x', 'LINK', 8, { endereco_externo: 'http://exemplo.org' }), false],
      ['texto com endereço externo', ins('texto', 'x', 'TEXTO', 9, { endereco_externo: 'https://exemplo.org' }), false],
      ['imagem com legenda', "insert into tbimagem (id, arquivo, texto_alternativo, legenda) values (900, 'img/x.svg', 'alt', 'Os eventos acontecem dentro da Sprint.')", true],
      ['imagem sem legenda', "insert into tbimagem (id, arquivo, texto_alternativo) values (901, 'img/y.svg', 'alt')", true],
    ];
    for (const [nome, sql, esperado] of casos) await caso(db, nome, sql, esperado);
    await db.exec("insert into tbmaterial (id, idtema, titulo, conteudo, tipo, ordem) values (500, 5, 'Teste', 'Antes ![](imagem:900) meio ![](imagem:901) fim', 'TEXTO', 20)");
    await db.exec('insert into tbmaterial_por_imagem (idmaterial, idimagem) values (500, 900)');
    const r = await db.query(consulta);
    conferir('consulta de referências acha só a imagem não ligada (901)', r.rows.length === 1 && r.rows[0].idmaterial === 500 && r.rows[0].idimagem === 901, r.rows);
    const base = await db.query(consulta.replace(/;\s*$/, '') + ' and m.id <> 500');
    conferir('nenhuma referência não ligada na carga atual', base.rows.length === 0, base.rows);
  } finally {
    await db.close();
  }
}

// ---------------------------------------------------------------------------
// 004: questão aberta, prazo, várias tentativas (D1) e sorteio

async function validar004() {
  conjunto = '004';
  console.log('\n# 004: questão aberta, 152 segundos, uma tentativa em andamento e sorteio');
  let db = await novoBanco('p004a');
  try {
    for (const b of esquema004()) await db.exec(b);
    conferir('proposta aplicada sobre a carga atual', true);
    await db.exec(`insert into tbcandidato (id, cpf, nome, email, senha, data_aceite_termos) values
      (1, '52998224725', 'Maria Souza', 'm@exemplo.org', 'hash', now()),
      (2, '11144477735', 'João Lima', 'j@exemplo.org', 'hash', now());
      insert into tbcertificacao (id, idcandidato, data_inicio) values (1, 1, '2026-10-03 10:00:00'), (2, 2, '2026-10-03 10:00:00');`);
    const T0 = "timestamp '2026-10-03 10:00:00'";
    const casos = [
      ['abrir tema 1 (questão 1) na certificação 1', `insert into tbresposta (id, idcertificacao, idquestao, data_hora_exibicao) values (1, 1, 1, ${T0})`, true],
      ['abrir tema 2 com a do tema 1 ainda aberta', `insert into tbresposta (id, idcertificacao, idquestao, data_hora_exibicao) values (2, 1, 5, ${T0})`, false],
      ['outra certificação com questão aberta ao mesmo tempo', `insert into tbresposta (id, idcertificacao, idquestao, data_hora_exibicao) values (3, 2, 1, ${T0})`, true],
      ['responder aos 153 s', `update tbresposta set situacao='RESPONDIDA', idalternativa=1, data_hora_resposta=${T0} + interval '153 seconds' where id=1`, false],
      ['responder aos 152 s exatos', `update tbresposta set situacao='RESPONDIDA', idalternativa=1, data_hora_resposta=${T0} + interval '152 seconds' where id=1`, true],
      ['abrir tema 2 depois de responder o tema 1', `insert into tbresposta (id, idcertificacao, idquestao, data_hora_exibicao) values (4, 1, 5, ${T0} + interval '3 minutes')`, true],
      ['responder aos 151 s', `update tbresposta set situacao='RESPONDIDA', idalternativa=17, data_hora_resposta=${T0} + interval '3 minutes 151 seconds' where id=4`, true],
      ['expirar a questão aberta da certificação 2', `update tbresposta set situacao='EXPIRADA' where id=3`, true],
      ['abrir de novo na certificação 2 depois de expirar', `insert into tbresposta (id, idcertificacao, idquestao, data_hora_exibicao) values (5, 2, 5, ${T0} + interval '5 minutes')`, true],
      ['interromper a aberta da certificação 2 com o horário (proposta da 006)', `update tbresposta set situacao='INTERROMPIDA', data_hora_interrupcao = ${T0} + interval '6 minutes' where id=5`, true],
    ];
    // a interrupção exige o horário da 006; aplica a coluna antes do último caso
    await db.exec(blocos(PROPOSTA.p006)[0]);
    for (const [nome, sql, esperado] of casos) await caso(db, nome, sql, esperado);
  } finally {
    await db.close();
  }

  db = await novoBanco('p004b');
  try {
    const b = blocos(PROPOSTA.p004);
    const sorteio = b.find((x) => x.includes('random()'));
    for (const x of esquema004()) await db.exec(x);
    await db.exec(`insert into tbcandidato (id, cpf, nome, email, senha, data_aceite_termos) values
      (1, '52998224725', 'Maria Souza', 'm@exemplo.org', 'hash', now()),
      (2, '11144477735', 'João Lima', 'j@exemplo.org', 'hash', now());`);
    await caso(db, 'D1: 1ª tentativa da candidata 1', "insert into tbcertificacao (id, idcandidato, data_inicio) values (1, 1, '2026-10-01 10:00')", true);
    await caso(db, 'D1: 2ª em andamento ao mesmo tempo', "insert into tbcertificacao (id, idcandidato, data_inicio) values (2, 1, '2026-10-01 11:00')", false);
    await caso(db, 'D1: outro candidato em andamento ao mesmo tempo', "insert into tbcertificacao (id, idcandidato, data_inicio) values (3, 2, '2026-10-01 10:00')", true);
    await caso(db, 'D1: concluir a 1ª', "update tbcertificacao set data_conclusao = '2026-10-01 10:40' where id = 1", true);
    await caso(db, 'D1: nova tentativa depois de concluir', "insert into tbcertificacao (id, idcandidato, data_inicio) values (4, 1, '2026-10-02 11:00')", true);
    await caso(db, 'D1: terceira em andamento junto da segunda', "insert into tbcertificacao (id, idcandidato, data_inicio) values (5, 1, '2026-10-02 12:00')", false);
    await caso(db, 'D1: concluir a 2ª e abrir a 3ª', "update tbcertificacao set data_conclusao = '2026-10-02 11:30' where id = 4; insert into tbcertificacao (id, idcandidato, data_inicio) values (6, 1, '2026-10-03 12:00')", true);
    await db.exec("insert into tbresposta (idcertificacao, idquestao, situacao, data_hora_exibicao) values (1, 1, 'EXPIRADA', '2026-10-01 10:00'), (4, 2, 'EXPIRADA', '2026-10-02 11:00')");
    const sortear = async (tema, cand, n) => {
      const c = {};
      for (let i = 0; i < n; i++) {
        const id = (await db.query(sorteio, [tema, cand])).rows[0].id;
        c[id] = (c[id] || 0) + 1;
      }
      return c;
    };
    const a = await sortear(1, 1, 2000);
    conferir('sorteio: viu as questões 1 e 2, só saem a 3 e a 4', Object.keys(a).every((k) => k === '3' || k === '4'), a);
    await db.exec("insert into tbresposta (idcertificacao, idquestao, situacao, data_hora_exibicao) values (6, 3, 'EXPIRADA', '2026-10-03 12:00')");
    const c2 = await sortear(1, 1, 2000);
    conferir('sorteio: viu 1, 2 e 3, só sai a 4', Object.keys(c2).join() === '4', c2);
    await db.exec("update tbcertificacao set data_conclusao = '2026-10-03 12:30' where id = 6; insert into tbcertificacao (id, idcandidato, data_inicio) values (7, 1, '2026-10-04 13:00'); insert into tbresposta (idcertificacao, idquestao, situacao, data_hora_exibicao) values (7, 4, 'EXPIRADA', '2026-10-04 13:00')");
    const c3 = await sortear(1, 1, 4000);
    conferir('sorteio: viu as 4, cada uma entre 20% e 30% de 4.000', Object.keys(c3).length === 4 && Object.values(c3).every((v) => v >= 800 && v <= 1200), c3);
    const c4 = await sortear(1, 2, 4000);
    conferir('sorteio: não viu nenhuma, cada uma entre 20% e 30% de 4.000', Object.keys(c4).length === 4 && Object.values(c4).every((v) => v >= 800 && v <= 1200), c4);
  } finally {
    await db.close();
  }
}

// ---------------------------------------------------------------------------
// 005: cálculo do resultado e emissão do certificado (sem proposta própria; usa a da 004)

async function validar005() {
  conjunto = '005';
  console.log('\n# 005: percentual, nota e emissão única do certificado');
  const db = await novoBanco('p005');
  try {
    for (const b of esquema004()) await db.exec(b);
    const t = await db.query("select k as acertos, to_char(round(k * 100.0 / 12, 1), 'FM990.0') as percentual, to_char(round(k * 10.0 / 12, 1), 'FM90.0') as nota from generate_series(0, 12) k");
    const perc = ['0.0', '8.3', '16.7', '25.0', '33.3', '41.7', '50.0', '58.3', '66.7', '75.0', '83.3', '91.7', '100.0'];
    const nota = ['0.0', '0.8', '1.7', '2.5', '3.3', '4.2', '5.0', '5.8', '6.7', '7.5', '8.3', '9.2', '10.0'];
    conferir('os 13 percentuais da tabela do FR-002', JSON.stringify(t.rows.map((r) => r.percentual)) === JSON.stringify(perc), t.rows.map((r) => r.percentual));
    conferir('as 13 notas da tabela do FR-002', JSON.stringify(t.rows.map((r) => r.nota)) === JSON.stringify(nota), t.rows.map((r) => r.nota));
    await db.exec("insert into tbcandidato (id, cpf, nome, email, senha, data_aceite_termos) values (1, '52998224725', 'Maria Souza', 'm@exemplo.org', 'hash', now())");
    const tentativa = async (id, inicio, acertos) => {
      await db.exec(`insert into tbcertificacao (id, idcandidato, data_inicio) values (${id}, 1, '${inicio}')`);
      for (let tema = 1; tema <= 12; tema++) {
        const q = (tema - 1) * 4 + 1;
        const correta = (await db.query('select id from tbalternativa where idquestao = $1 and correta', [q])).rows[0].id;
        const errada = (await db.query('select id from tbalternativa where idquestao = $1 and not correta limit 1', [q])).rows[0].id;
        let sql;
        if (tema <= acertos) sql = `insert into tbresposta (idcertificacao, idquestao, idalternativa, data_hora_exibicao, data_hora_resposta, situacao) values (${id}, ${q}, ${correta}, '${inicio}', '${inicio}'::timestamp + interval '60 seconds', 'RESPONDIDA')`;
        else if (tema === acertos + 1) sql = `insert into tbresposta (idcertificacao, idquestao, situacao, data_hora_exibicao) values (${id}, ${q}, 'EXPIRADA', '${inicio}')`;
        else sql = `insert into tbresposta (idcertificacao, idquestao, idalternativa, data_hora_exibicao, data_hora_resposta, situacao) values (${id}, ${q}, ${errada}, '${inicio}', '${inicio}'::timestamp + interval '60 seconds', 'RESPONDIDA')`;
        await db.exec(sql);
      }
    };
    const resultado = "select count(*) filter (where r.situacao = 'RESPONDIDA' and a.correta)::int as acertos from tbresposta r left join tbalternativa a on a.id = r.idalternativa where r.idcertificacao = $1";
    const concluir = async (id) => {
      await db.exec('begin');
      await db.query('update tbcertificacao set data_conclusao = now() where id = $1 and data_conclusao is null', [id]);
      const ac = (await db.query(resultado, [id])).rows[0].acertos;
      if (ac >= 8) await db.query('insert into tbcertificado (idcertificacao) values ($1) on conflict (idcertificacao) do nothing', [id]);
      await db.exec('commit');
      return ac;
    };
    const certificados = async (id) => (await db.query('select count(*)::int n from tbcertificado where idcertificacao = $1', [id])).rows[0].n;
    await tentativa(1, '2026-10-01 10:00', 7);
    const ac1 = await concluir(1);
    conferir('7 acertos (com um tempo esgotado): reprovado, sem certificado', ac1 === 7 && (await certificados(1)) === 0, ac1);
    await tentativa(2, '2026-10-02 11:00', 8);
    const ac2 = await concluir(2);
    conferir('8 acertos na segunda tentativa: aprovado, um certificado', ac2 === 8 && (await certificados(2)) === 1, ac2);
    await concluir(2);
    await concluir(2);
    conferir('conclusão repetida: continua um certificado', (await certificados(2)) === 1);
    const c = (await db.query('select codigo_validacao::text c, data_hora_emissao = (select data_conclusao from tbcertificacao where id = 2) mesma_hora from tbcertificado')).rows[0];
    conferir('código de validação em UUID gerado pelo banco', /^[0-9a-f-]{36}$/.test(c.c), c.c);
    conferir('emissão no mesmo instante da conclusão', c.mesma_hora === true);
    await caso(db, 'código malformado direto no banco', "select 1 from tbcertificado where codigo_validacao = $1::uuid", false, ['abc']);
  } finally {
    await db.close();
  }
}

// ---------------------------------------------------------------------------
// 006: horário da interrupção, tentativas, histórico e aviso de interrupção

async function validar006() {
  conjunto = '006';
  console.log('\n# 006: horário da interrupção, tentativas, histórico e aviso de interrupção');
  const b = blocos(PROPOSTA.p006);
  if (b.length !== 4) throw new Error(`proposta da 006: esperava 4 blocos SQL, achei ${b.length}`);
  const [ddl006, consultaAviso, consultaTentativas, consultaHistorico] = b;
  const db = await novoBanco('p006');
  try {
    for (const x of esquema004()) await db.exec(x);
    await db.exec(ddl006);
    conferir('propostas da 004 e da 006 aplicadas sobre a carga atual', true);
    await db.exec(`insert into tbcandidato (id, cpf, nome, email, senha, data_aceite_termos) values
      (1, '12345678901', 'Ana', 'ana@exemplo.com', 'x', now()),
      (2, '98765432100', 'Bruno', 'bruno@exemplo.com', 'x', now());`);
    await db.exec(`insert into tbcertificacao (id, idcandidato, data_inicio, data_conclusao) values (1, 1, '2026-11-14 19:00', '2026-11-15 14:23')`);
    const correta = async (q) => (await db.query('select id from tbalternativa where idquestao = $1 and correta', [q])).rows[0].id;
    const errada = async (q) => (await db.query('select id from tbalternativa where idquestao = $1 and not correta order by letra limit 1', [q])).rows[0].id;
    const plano1 = [
      [12, 'RESPONDIDA', 'certa'], [1, 'RESPONDIDA', 'certa'], [2, 'RESPONDIDA', 'errada'],
      [3, 'EXPIRADA'], [4, 'INTERROMPIDA'], [5, 'RESPONDIDA', 'certa'], [6, 'RESPONDIDA', 'certa'],
      [7, 'RESPONDIDA', 'certa'], [8, 'RESPONDIDA', 'certa'], [9, 'RESPONDIDA', 'certa'],
      [10, 'RESPONDIDA', 'certa'], [11, 'RESPONDIDA', 'certa'],
    ];
    for (const [t, sit, qual] of plano1) {
      const q = (t - 1) * 4 + 1;
      const exib = `timestamp '2026-11-14 19:00' + interval '${t * 3} minutes'`;
      if (sit === 'RESPONDIDA') {
        const alt = qual === 'certa' ? await correta(q) : await errada(q);
        await db.exec(`insert into tbresposta (idcertificacao, idquestao, idalternativa, data_hora_exibicao, data_hora_resposta, situacao)
          values (1, ${q}, ${alt}, ${exib}, ${exib} + interval '40 seconds', 'RESPONDIDA')`);
      } else if (sit === 'EXPIRADA') {
        await db.exec(`insert into tbresposta (idcertificacao, idquestao, data_hora_exibicao, situacao) values (1, ${q}, ${exib}, 'EXPIRADA')`);
      } else {
        await db.exec(`insert into tbresposta (idcertificacao, idquestao, data_hora_exibicao) values (1, ${q}, ${exib})`);
        await caso(db, 'exibida passa a interrompida com o horário da interrupção', `update tbresposta set situacao = 'INTERROMPIDA', data_hora_interrupcao = ${exib} + interval '70 seconds'
          where idcertificacao = 1 and idquestao = ${q}`, true);
      }
    }
    await db.exec(`insert into tbcertificacao (id, idcandidato, data_inicio) values (2, 1, '2026-11-16 15:00')`);
    await db.exec(`insert into tbresposta (idcertificacao, idquestao, idalternativa, data_hora_exibicao, data_hora_resposta, situacao)
      values (2, 2, ${await correta(2)}, '2026-11-16 15:01', '2026-11-16 15:02', 'RESPONDIDA'),
             (2, 6, ${await errada(6)}, '2026-11-16 15:03', '2026-11-16 15:04', 'RESPONDIDA')`);
    await db.exec(`insert into tbresposta (idcertificacao, idquestao, data_hora_exibicao) values (2, 10, '2026-11-16 15:05')`);
    await db.exec(`insert into tbcertificacao (id, idcandidato, data_inicio) values (3, 2, '2026-11-16 16:00')`);
    await db.exec(`insert into tbresposta (idcertificacao, idquestao, idalternativa, data_hora_exibicao, data_hora_resposta, situacao)
      values (3, 3, ${await correta(3)}, '2026-11-16 16:01', '2026-11-16 16:02', 'RESPONDIDA')`);

    await caso(db, 'interrompida sem horário da interrupção', `update tbresposta set situacao = 'INTERROMPIDA' where idcertificacao = 2 and idquestao = 10`, false);
    await caso(db, 'exibida com horário de interrupção', `update tbresposta set data_hora_interrupcao = now() where idcertificacao = 2 and idquestao = 10`, false);
    await caso(db, 'respondida com horário de interrupção', `update tbresposta set data_hora_interrupcao = data_hora_resposta where idcertificacao = 1 and idquestao = 1`, false);
    await caso(db, 'expirada com horário de interrupção', `update tbresposta set data_hora_interrupcao = now() where idcertificacao = 1 and idquestao = 9`, false);
    await caso(db, 'interrupção antes da exibição', `update tbresposta set situacao = 'INTERROMPIDA', data_hora_interrupcao = data_hora_exibicao - interval '1 second' where idcertificacao = 2 and idquestao = 10`, false);
    await caso(db, 'interrupção depois de 152 segundos', `update tbresposta set situacao = 'INTERROMPIDA', data_hora_interrupcao = data_hora_exibicao + interval '153 seconds' where idcertificacao = 2 and idquestao = 10`, false);
    await caso(db, 'interrupção aos 152 segundos exatos (desfeita)', `begin; update tbresposta set situacao = 'INTERROMPIDA', data_hora_interrupcao = data_hora_exibicao + interval '152 seconds' where idcertificacao = 2 and idquestao = 10; rollback;`, true);

    const t1 = await db.query(consultaTentativas, [1]);
    conferir('tentativas: mais recente primeiro, numeradas pela data de início', t1.rows.map((r) => `${r.numero}:${r.inicio}`).join(',') === '2:16/11/2026,1:14/11/2026', t1.rows);
    conferir('tentativa 1 com 9 acertos (errada, expirada e interrompida contam como erro)', t1.rows[1].acertos === 9, t1.rows[1]);
    conferir('tentativa em andamento com 2 temas encerrados (a aberta não conta)', t1.rows[0].temas_encerrados === 2, t1.rows[0]);
    conferir('lista sem o identificador interno da certificação', !t1.rows.some((r) => 'id' in r));
    const t2 = await db.query(consultaTentativas, [2]);
    conferir('candidato 2 vê só a sua tentativa, numerada 1', t2.rows.length === 1 && t2.rows[0].numero === 1, t2.rows);

    const h1 = await db.query(consultaHistorico, [1, 1]);
    conferir('histórico: 12 temas na ordem 1 a 12, apesar da gravação fora de ordem', h1.rows.map((r) => r.ordem).join(',') === '1,2,3,4,5,6,7,8,9,10,11,12');
    const po = Object.fromEntries(h1.rows.map((r) => [r.ordem, r]));
    conferir('acertou: escolhida igual à correta', po[1].situacao === 'ACERTOU' && po[1].escolhida_letra === po[1].correta_letra);
    conferir('errou: escolhida diferente da correta', po[2].situacao === 'ERROU' && po[2].escolhida_letra !== po[2].correta_letra);
    conferir('tempo esgotado: sem escolhida, horário da exibição mais 150 s', po[3].situacao === 'TEMPO_ESGOTADO' && po[3].escolhida_letra === null && po[3].data_hora === '14/11/2026 19:11', po[3]);
    conferir('interrompida: sem escolhida, horário da interrupção', po[4].situacao === 'INTERROMPIDA' && po[4].escolhida_letra === null && po[4].data_hora === '14/11/2026 19:13', po[4]);
    conferir('respondida: horário da resposta', po[2].data_hora === '14/11/2026 19:06', po[2].data_hora);
    conferir('toda linha tem enunciado e texto da correta', h1.rows.every((r) => r.correta_texto && r.enunciado));
    const h2 = await db.query(consultaHistorico, [1, 2]);
    conferir('em andamento: a questão aberta (tema 3) não aparece', h2.rows.length === 2 && !h2.rows.some((r) => r.ordem === 3), h2.rows.length);
    const aberta = (await db.query('select q.enunciado from tbquestao q where q.id = 10')).rows[0].enunciado;
    conferir('nada do enunciado da questão aberta no resultado', !JSON.stringify(h2.rows).includes(aberta.slice(0, 30)));
    conferir('candidato 2 pede a tentativa 2 (só a candidata 1 tem): vazio', (await db.query(consultaHistorico, [2, 2])).rows.length === 0);
    const h3b = await db.query(consultaHistorico, [2, 1]);
    conferir('candidato 2, tentativa 1: só a própria resposta', h3b.rows.length === 1 && h3b.rows[0].ordem === 1);
    conferir('tentativa inexistente (número 3): vazio', (await db.query(consultaHistorico, [1, 3])).rows.length === 0);

    await db.exec(`insert into tbcandidato (id, cpf, nome, email, senha, data_aceite_termos) values
      (3, '11122233344', 'Carla', 'carla@exemplo.com', 'x', now()),
      (4, '55566677788', 'Davi', 'davi@exemplo.com', 'x', now());
      insert into tbcertificacao (id, idcandidato, data_inicio) values (4, 3, now() - interval '1 minute'), (5, 4, now() - interval '5 minutes');
      insert into tbresposta (idcertificacao, idquestao, data_hora_exibicao) values (4, 1, now() - interval '30 seconds'), (5, 1, now() - interval '151 seconds');`);
    const situacao = async (cert) => (await db.query('select situacao, data_hora_interrupcao from tbresposta where idcertificacao = $1 and idquestao = 1', [cert])).rows[0];
    let a = await db.query(consultaAviso, [2, 2]);
    conferir('aviso sem questão aberta: nada muda', a.rows.length === 0);
    a = await db.query(consultaAviso, [2, 1]);
    conferir('aviso de outro candidato: a questão da candidata 3 continua aberta', a.rows.length === 0 && (await situacao(4)).situacao === 'EXIBIDA');
    a = await db.query(consultaAviso, [3, 2]);
    conferir('aviso atrasado (tema que não é o aberto): nada muda', a.rows.length === 0 && (await situacao(4)).situacao === 'EXIBIDA');
    a = await db.query(consultaAviso, [4, 1]);
    conferir('aviso depois de 150 segundos: não interrompe', a.rows.length === 0 && (await situacao(5)).situacao === 'EXIBIDA');
    a = await db.query(consultaAviso, [3, 1]);
    const s4 = await situacao(4);
    conferir('aviso válido: interrompe com o horário do recebimento', a.rows.length === 1 && s4.situacao === 'INTERROMPIDA' && s4.data_hora_interrupcao !== null);
    a = await db.query(consultaAviso, [3, 1]);
    conferir('aviso repetido: nada muda', a.rows.length === 0);
    const h5 = await db.query(consultaHistorico, [3, 1]);
    const agora = (await db.query(`select to_char(now(), 'DD/MM/YYYY HH24:MI') as h`)).rows[0].h;
    conferir('histórico da candidata 3: interrompida no horário do aviso', h5.rows.length === 1 && h5.rows[0].situacao === 'INTERROMPIDA' && h5.rows[0].data_hora === agora, h5.rows);
  } finally {
    await db.close();
  }
}

// ---------------------------------------------------------------------------
// 007: flashcards, sessão, domínio, fila, conquistas, raridade e aviso dos termos

async function validar007() {
  conjunto = '007';
  console.log('\n# 007: flashcards, sessão, domínio, fila, 14 dias, conquistas, raridade e aviso dos termos');
  const P = blocos(PROPOSTA.p007);
  const achar = (inicio) => {
    const b = P.find((x) => x.trimStart().startsWith(inicio));
    if (!b) throw new Error('proposta da 007: bloco não encontrado: ' + inicio);
    return b;
  };
  const DDL = achar('-- cartões de flashcards');
  const VIEW_DOMINIO = achar('-- estado de domínio');
  const Q_DOMINIO = achar('-- domínio atual');
  const Q_TEMA = achar('-- cartões e cartões dominados por tema');
  const Q_FILA = achar('-- fila da sessão');
  const Q_14 = achar('-- cartões dominados ao fim');
  const VIEW_CONQUISTA = achar('-- conquistas obtidas');
  const Q_RARIDADE = achar('-- raridade');
  const DDL_AVISO = achar('-- momento do último aviso');
  const Q_AVISO = achar('-- aviso de atualização dos termos');
  const V_FAIXA = achar('-- temas fora da faixa');
  const V_IMAGEM = achar('-- cartões que usam a imagem');

  const banco = async (nome) => {
    const db = await novoBanco(nome);
    for (const b of esquema004()) await db.exec(b);
    await db.exec(blocos(PROPOSTA.p006)[0]);
    await db.exec(DDL);
    await db.exec(VIEW_DOMINIO);
    await db.exec(VIEW_CONQUISTA);
    await db.exec(DDL_AVISO);
    return db;
  };
  const cartoes = (db) => db.exec(`
    insert into tbflashcard (id, idtema, frente, verso, ordem)
    select t.ordem * 100 + k, t.id, '[PROVISÓRIO] Pergunta ' || t.ordem || '.' || k, 'Resposta ' || t.ordem || '.' || k, k
      from tbtema t cross join generate_series(1, 8) k;
    select setval(pg_get_serial_sequence('tbflashcard', 'id'), 2000);`);
  const candidatos = async (db, de, ate) => {
    await db.query(`
      insert into tbcandidato (id, cpf, nome, email, senha, data_aceite_termos, data_cadastro)
      select n, lpad(n::text, 11, '0'), 'Pessoa ' || n, 'p' || n || '@exemplo.org', 'x', '2026-06-01', '2026-06-01'
        from generate_series($1::int, $2::int) n`, [de, ate]);
    await db.query(`insert into tbsessao_revisao (id, idcandidato, data_inicio) select n, n, '2026-01-01' from generate_series($1::int, $2::int) n`, [de, ate]);
    await db.exec(`select setval(pg_get_serial_sequence('tbcandidato', 'id'), 1000); select setval(pg_get_serial_sequence('tbsessao_revisao', 'id'), 5000);`);
  };
  const rev = (db, cand, card, aval, quando, sessao = cand) =>
    db.query('insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao) values ($1, $2, $3, $4::timestamp, $5)', [cand, card, aval, quando, sessao]);
  const conquistas = async (db, cand) => {
    const r = await db.query('select conquista, data_obtencao from vw_conquista where idcandidato = $1', [cand]);
    return Object.fromEntries(r.rows.map((x) => [x.conquista, fmt(x.data_obtencao)]));
  };
  const tentativa = async (db, id, cand, inicio, conclusao, acertos, expiradas = 0) => {
    await db.query('insert into tbcertificacao (id, idcandidato, data_inicio, data_conclusao) values ($1, $2, $3::timestamp, $4::timestamp)', [id, cand, inicio, conclusao]);
    const q = await db.query(`
      select t.ordem, q.id as idquestao,
             (select a.id from tbalternativa a where a.idquestao = q.id and a.correta) as certa,
             (select a.id from tbalternativa a where a.idquestao = q.id and not a.correta order by a.letra limit 1) as errada
        from tbtema t
        join lateral (select * from tbquestao q where q.idtema = t.id order by q.id limit 1) q on true
       order by t.ordem`);
    for (const x of q.rows) {
      const exib = `(timestamp '${inicio}' + interval '${x.ordem * 3} minutes')`;
      if (x.ordem <= acertos || x.ordem > acertos + expiradas) {
        const alt = x.ordem <= acertos ? x.certa : x.errada;
        await db.query(`insert into tbresposta (idcertificacao, idquestao, idalternativa, data_hora_exibicao, data_hora_resposta, situacao)
                        values ($1, $2, $3, ${exib}, ${exib} + interval '30 seconds', 'RESPONDIDA')`, [id, x.idquestao, alt]);
      } else {
        await db.query(`insert into tbresposta (idcertificacao, idquestao, data_hora_exibicao, situacao) values ($1, $2, ${exib}, 'EXPIRADA')`, [id, x.idquestao]);
      }
    }
  };

  // 1. esquema e verificação da carga
  let db = await banco('p007a');
  try {
    await cartoes(db);
    await candidatos(db, 1, 2);
    conferir('carga de teste com 96 cartões', (await db.query('select count(*)::int as n from tbflashcard')).rows[0].n === 96);
    await caso(db, 'frente em branco', "insert into tbflashcard (idtema, frente, verso, ordem) values (1, '   ', 'v', 20)", false);
    await caso(db, 'verso vazio', "insert into tbflashcard (idtema, frente, verso, ordem) values (1, 'f', '', 20)", false);
    await caso(db, 'ordem repetida no tema', "insert into tbflashcard (idtema, frente, verso, ordem) values (1, 'f', 'v', 1)", false);
    await caso(db, 'ordem zero', "insert into tbflashcard (idtema, frente, verso, ordem) values (1, 'f', 'v', 0)", false);
    await caso(db, 'tema inexistente', "insert into tbflashcard (idtema, frente, verso, ordem) values (99, 'f', 'v', 1)", false);
    await caso(db, 'imagem inexistente', "insert into tbflashcard (idtema, frente, verso, ordem, idimagem) values (1, 'f', 'v', 20, 99999)", false);
    await caso(db, 'avaliação fora das três', "insert into tbrevisao (idcandidato, idflashcard, avaliacao, idsessao_revisao) values (1, 101, 'TALVEZ', 1)", false);
    await caso(db, 'revisão de candidato inexistente', "insert into tbrevisao (idcandidato, idflashcard, avaliacao, idsessao_revisao) values (77, 101, 'SABIA', 1)", false);
    await caso(db, 'revisão de cartão inexistente', "insert into tbrevisao (idcandidato, idflashcard, avaliacao, idsessao_revisao) values (1, 9999, 'SABIA', 1)", false);
    await caso(db, 'revisão sem sessão', "insert into tbrevisao (idcandidato, idflashcard, avaliacao) values (1, 101, 'SABIA')", false);
    await caso(db, 'revisão na sessão de outro candidato', "insert into tbrevisao (idcandidato, idflashcard, avaliacao, idsessao_revisao) values (2, 101, 'SABIA', 1)", false);
    await caso(db, 'sessão concluída antes de começar', "insert into tbsessao_revisao (idcandidato, data_inicio, data_conclusao) values (1, '2026-07-02 10:00', '2026-07-02 09:00')", false);
    await caso(db, 'revisão com o momento do relógio do servidor', "insert into tbrevisao (idcandidato, idflashcard, avaliacao, idsessao_revisao) values (1, 101, 'SABIA', 1)", true);
    conferir('momento preenchido pelo servidor', (await db.query('select data_hora_revisao is not null as tem from tbrevisao')).rows[0].tem === true);
    let faixa = (await db.query(V_FAIXA)).rows;
    conferir('verificação: 8 cartões em cada tema, nenhum fora da faixa', faixa.length === 0, faixa);
    await db.exec("insert into tbflashcard (idtema, frente, verso, ordem) values (1, 'f9', 'v', 9), (1, 'f10', 'v', 10), (1, 'f11', 'v', 11)");
    await db.exec('delete from tbflashcard where id = 208');
    faixa = (await db.query(V_FAIXA)).rows;
    conferir('verificação: tema com 11 e tema com 7 acusados', faixa.length === 2 && faixa[0].ordem === 1 && faixa[0].cartoes === 11 && faixa[1].ordem === 2 && faixa[1].cartoes === 7, faixa);
    await caso(db, 'cartão com imagem de material', "insert into tbflashcard (idtema, frente, verso, ordem, idimagem) values (3, 'f', 'v', 9, 103)", true);
    conferir('verificação: imagem de material não é acusada', (await db.query(V_IMAGEM)).rows.length === 0);
    await db.exec("insert into tbflashcard (idtema, frente, verso, ordem, idimagem) select 3, 'f', 'v', 10, q.idimagem from tbquestao q where q.idtema = 3 order by q.id limit 1");
    conferir('verificação: cartão com imagem de questão acusado', (await db.query(V_IMAGEM)).rows.length === 1);
  } finally {
    await db.close();
  }

  // 2. domínio, fila, conquistas e 14 dias
  db = await banco('p007b');
  try {
    await cartoes(db);
    await candidatos(db, 1, 12);
    for (const [card, aval, q] of [
      [101, 'SABIA', '2026-07-01 10:00'], [101, 'SABIA', '2026-07-01 15:00'],
      [102, 'SABIA', '2026-07-01 10:00'], [102, 'SABIA', '2026-07-02 10:00'],
      [103, 'SABIA', '2026-07-01 10:00'], [103, 'SABIA', '2026-07-02 10:00'], [103, 'QUASE', '2026-07-03 10:00'],
      [104, 'SABIA', '2026-07-01 10:00'], [104, 'SABIA', '2026-07-02 10:00'], [104, 'NAO_SABIA', '2026-07-03 09:00'],
      [104, 'SABIA', '2026-07-03 10:00'], [104, 'SABIA', '2026-07-03 20:00'],
      [105, 'NAO_SABIA', '2026-07-01 08:00'], [105, 'SABIA', '2026-07-01 09:00'], [105, 'SABIA', '2026-07-02 09:00'],
      [106, 'SABIA', '2026-07-01 23:59:59'], [106, 'SABIA', '2026-07-02 00:00:01'],
      [108, 'SABIA', '2026-07-01 10:00'], [108, 'QUASE', '2026-07-01 11:00'], [108, 'SABIA', '2026-07-01 12:00'],
    ]) await rev(db, 1, card, aval, q);
    let dom = Object.fromEntries((await db.query(Q_DOMINIO, [1])).rows.map((x) => [x.idflashcard, x.dominado]));
    conferir('dois "Sabia" no mesmo dia: não domina', dom[101] === false);
    conferir('"Sabia" em dois dias: domina', dom[102] === true);
    conferir('"Quase" depois do domínio: perde', dom[103] === false);
    conferir('erro e dois "Sabia" no mesmo dia depois: não reconquista', dom[104] === false);
    conferir('erro e "Sabia" no mesmo dia, depois "Sabia" no dia seguinte: domina', dom[105] === true);
    conferir('"Sabia" às 23:59:59 e às 00:00:01: dias diferentes em São Paulo', dom[106] === true);
    conferir('nunca revisado: não domina', dom[107] === false);
    conferir('"Sabia", "Quase" e "Sabia" no mesmo dia: só um dia no trecho', dom[108] === false);
    await rev(db, 1, 104, 'SABIA', '2026-07-04 10:00');
    await rev(db, 1, 108, 'SABIA', '2026-07-02 10:00');
    dom = Object.fromEntries((await db.query(Q_DOMINIO, [1])).rows.map((x) => [x.idflashcard, x.dominado]));
    conferir('reconquista em dois dias novos depois do erro', dom[104] === true);
    conferir('reconquista: "Sabia" depois do "Quase" e no dia seguinte', dom[108] === true);
    conferir('consulta devolve todos os 96 cartões', Object.keys(dom).length === 96);
    const porTema = (await db.query(Q_TEMA, [1])).rows;
    conferir('domínio por tema: tema 1 com 5 de 8', porTema[0].tema === 1 && porTema[0].cartoes === 8 && porTema[0].dominados === 5, porTema[0]);
    conferir('domínio por tema: os outros 11 temas com 0 de 8', porTema.length === 12 && porTema.slice(1).every((x) => x.cartoes === 8 && x.dominados === 0));
    const foco = (await db.query(`select * from (${Q_TEMA.replace(/;\s*$/, '')}) d order by d.dominados::numeric / d.cartoes, d.tema limit 1`, [1])).rows[0];
    conferir('próximo foco: menor proporção, desempate pela ordem (tema 2)', foco.tema === 2, foco);
    conferir('domínio da candidata 1 não aparece para o candidato 2', (await db.query(Q_DOMINIO, [2])).rows.filter((x) => x.dominado).length === 0);

    for (const [card, aval, q] of [
      [201, 'SABIA', '2026-07-01 08:00'], [201, 'NAO_SABIA', '2026-07-05 10:00'], [202, 'NAO_SABIA', '2026-07-03 10:00'],
      [301, 'QUASE', '2026-07-01 10:00'], [203, 'QUASE', '2026-07-04 10:00'], [205, 'SABIA', '2026-07-02 10:00'],
      [206, 'SABIA', '2026-07-06 10:00'], [207, 'SABIA', '2026-07-01 09:00'], [207, 'SABIA', '2026-07-02 09:00'],
    ]) await rev(db, 2, card, aval, q);
    const ids = (r) => r.rows.map((x) => x.idflashcard);
    const esperada = [202, 201, 301, 203, 204, 208, 302, 303, 304, 305, 306, 307, 308, 205, 206];
    let fila = ids(await db.query(Q_FILA, [2, [2, 3], 'PENDENTES', null]));
    conferir('fila "só os que ainda não domino": Não sabia, Quase, nunca revisados, revisados há mais tempo', JSON.stringify(fila) === JSON.stringify(esperada), fila);
    conferir('fila "só os que ainda não domino": sem o dominado', !fila.includes(207));
    fila = ids(await db.query(Q_FILA, [2, [2, 3], 'TODOS', null]));
    conferir('fila "todos": mesma ordem, com o dominado no fim', JSON.stringify(fila) === JSON.stringify([...esperada, 207]), fila);
    fila = ids(await db.query(Q_FILA, [2, [2, 3], 'PENDENTES', 10]));
    conferir('fila com tamanho 10: os 10 primeiros', JSON.stringify(fila) === JSON.stringify(esperada.slice(0, 10)), fila);
    fila = ids(await db.query(Q_FILA, [2, [3], 'PENDENTES', 20]));
    conferir('fila de um tema só: o "Quase" primeiro', fila.length === 8 && fila[0] === 301 && fila.every((x) => x >= 300 && x < 400), fila);

    for (let k = 1; k <= 8; k++) await rev(db, 3, 400 + k, 'SABIA', `2026-07-10 10:0${k}`);
    for (let k = 1; k <= 8; k++) await rev(db, 3, 400 + k, 'SABIA', `2026-07-11 10:0${k}`);
    await rev(db, 3, 401, 'QUASE', '2026-07-12 10:00');
    await rev(db, 3, 501, 'SABIA', '2026-07-10 12:00');
    await rev(db, 3, 501, 'SABIA', '2026-07-13 09:00');
    await rev(db, 3, 601, 'SABIA', '2026-07-10 12:00');
    await rev(db, 3, 601, 'SABIA', '2026-07-13 10:00');
    for (const [t, h] of [[7, 11], [8, 12], [9, 13]]) {
      await rev(db, 3, t * 100 + 1, 'SABIA', '2026-07-10 12:00');
      await rev(db, 3, t * 100 + 1, 'SABIA', `2026-07-13 ${h}:00`);
    }
    const c3 = await conquistas(db, 3);
    conferir('Explorador de Marte: revisão que completou o tema', c3.EXPLORADOR_4 === '2026-07-11 10:08:00', c3);
    conferir('domínio do tema 4 caiu para 7 de 8 com o "Quase"', (await db.query(Q_TEMA, [3])).rows.find((x) => x.tema === 4).dominados === 7);
    conferir('Explorador continua obtido depois de perder o domínio', c3.EXPLORADOR_4 === '2026-07-11 10:08:00');
    conferir('Meio caminho: quando o 6º tema passou a ter cartão dominado', c3.MEIO_CAMINHO === '2026-07-13 13:00:00', c3);
    conferir('só sessão sem conclusão: sem Primeira órbita', !c3.PRIMEIRA_ORBITA, c3);
    conferir('sem Cem revisões, Constância, Sistema completo nem Lua cheia', !c3.CEM_REVISOES && !c3.SISTEMA_COMPLETO && !c3.LUA_CHEIA && !c3.CONSTANCIA, c3);

    await db.query(`insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao)
                    select 4, 101, case when n % 3 = 0 then 'QUASE' else 'SABIA' end, timestamp '2026-07-01 00:00' + n * interval '1 minute', 4
                      from generate_series(1, 120) n`);
    const c4 = await conquistas(db, 4);
    conferir('Cem revisões: data da 100ª revisão', c4.CEM_REVISOES === '2026-07-01 01:40:00', c4);
    conferir('120 revisões num dia só: sem Constância', !c4.CONSTANCIA, c4);
    for (const q of ['2026-07-01 10:00', '2026-07-03 10:00', '2026-07-03 11:00', '2026-07-07 10:00', '2026-07-10 10:00', '2026-07-15 10:00', '2026-07-15 08:00']) {
      await rev(db, 5, 101, 'QUASE', q);
    }
    const c5 = await conquistas(db, 5);
    conferir('Constância: primeira revisão do 5º dia diferente', c5.CONSTANCIA === '2026-07-15 08:00:00', c5);
    conferir('revisões em 4 dias: sem Constância', !(await conquistas(db, 1)).CONSTANCIA);

    await db.exec(`
      insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao)
      select 6, f.id, 'SABIA', timestamp '2026-07-20 10:00' + (row_number() over (order by f.id)) * interval '1 second', 6 from tbflashcard f;
      insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao)
      select 6, f.id, 'SABIA', timestamp '2026-07-21 10:00' + (row_number() over (order by f.id)) * interval '1 second', 6 from tbflashcard f;`);
    await rev(db, 6, 101, 'NAO_SABIA', '2026-07-22 10:00');
    const c6 = await conquistas(db, 6);
    conferir('Sistema completo: revisão que completou o último cartão', c6.SISTEMA_COMPLETO === '2026-07-21 10:01:36', c6);
    conferir('Sistema completo continua obtido depois do "Não sabia"', c6.SISTEMA_COMPLETO === '2026-07-21 10:01:36');
    conferir('Explorador dos 12 temas, cada um na sua data', [...Array(12)].every((_, i) => c6['EXPLORADOR_' + (i + 1)] === fmt(new Date(2026, 6, 21, 10, 0, (i + 1) * 8))), c6);
    conferir('Meio caminho no primeiro cartão do 6º tema', c6.MEIO_CAMINHO === '2026-07-21 10:00:41', c6);
    conferir('Cem revisões na 4ª revisão do segundo dia', c6.CEM_REVISOES === '2026-07-21 10:00:04', c6);
    conferir('domínio atual: 95 de 96 depois do "Não sabia"', (await db.query(Q_TEMA, [6])).rows.reduce((a, x) => a + x.dominados, 0) === 95);

    await tentativa(db, 7, 7, '2026-07-05 14:00', '2026-07-05 15:00', 8);
    await tentativa(db, 8, 8, '2026-07-05 14:00', '2026-07-05 15:00', 7, 1);
    await tentativa(db, 91, 9, '2026-07-01 11:00', '2026-07-01 12:00', 6);
    await tentativa(db, 92, 9, '2026-07-03 11:00', '2026-07-03 12:00', 9);
    await db.query('insert into tbcertificacao (id, idcandidato, data_inicio) values (93, 11, $1::timestamp)', ['2026-07-03 11:00']);
    const [c7, c8, c9, c11] = [await conquistas(db, 7), await conquistas(db, 8), await conquistas(db, 9), await conquistas(db, 11)];
    conferir('Lua cheia com 8 acertos: data da conclusão', c7.LUA_CHEIA === '2026-07-05 15:00:00', c7);
    conferir('7 acertos e 1 tempo esgotado: sem Lua cheia', !c8.LUA_CHEIA, c8);
    conferir('Lua cheia na segunda tentativa', c9.LUA_CHEIA === '2026-07-03 12:00:00', c9);
    conferir('tentativa em andamento: sem Lua cheia', !c11.LUA_CHEIA, c11);
    conferir('Lua cheia sem nenhuma revisão: só ela', Object.keys(c7).length === 1, c7);

    await db.exec(`insert into tbsessao_revisao (id, idcandidato, data_inicio, data_conclusao) values
      (1202, 12, '2026-07-02 10:00', '2026-07-02 10:15'), (1203, 12, '2026-07-05 10:00', '2026-07-05 10:20');`);
    await rev(db, 12, 101, 'SABIA', '2026-07-01 10:01');
    await rev(db, 12, 102, 'SABIA', '2026-07-02 10:01', 1202);
    await rev(db, 12, 103, 'QUASE', '2026-07-05 10:01', 1203);
    const c12 = await conquistas(db, 12);
    conferir('Primeira órbita: conclusão da primeira sessão concluída, ignorando a abandonada', c12.PRIMEIRA_ORBITA === '2026-07-02 10:15:00', c12);

    const d = (dias, hora = '10:00') => `(current_date + ${dias})::text || ' ${hora}'`;
    const revRel = (card, aval, dias, hora) => db.query(`insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao) values (10, $1, $2, (${d(dias, hora)})::timestamp, 10)`, [card, aval]);
    await revRel(101, 'SABIA', -10);
    await revRel(101, 'SABIA', -8);
    await revRel(102, 'SABIA', -5);
    await revRel(102, 'SABIA', -3);
    await revRel(102, 'QUASE', -1);
    await revRel(103, 'SABIA', -2);
    await revRel(103, 'SABIA', 0, '00:00:01');
    await revRel(104, 'SABIA', -20);
    await revRel(104, 'SABIA', -19);
    const serie = (await db.query(Q_14, [10])).rows.map((x) => x.dominados);
    conferir('14 dias: um valor por dia', serie.length === 14, serie.length);
    conferir('14 dias: dominados ao fim de cada dia, com ganho e perda', JSON.stringify(serie) === JSON.stringify([1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 2, 3]), serie);
    const lim = (await db.query(`select min(x.dia) = current_date - 13 as ini, max(x.dia) = current_date as fim from (${Q_14.replace(/;\s*$/, '')}) x`, [10])).rows[0];
    conferir('14 dias: de 13 dias antes de hoje até hoje', lim.ini === true && lim.fim === true, lim);
  } finally {
    await db.close();
  }

  // 3. raridade e contas ativas
  db = await banco('p007c');
  try {
    await cartoes(db);
    await candidatos(db, 1, 45);
    await db.exec(`
      insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao)
      select n, 101, 'SABIA', now() - interval '1 day', n from generate_series(1, 29) n;
      insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao)
      select c, 102, 'QUASE', now() - interval '2 days' + k * interval '1 second', c from generate_series(1, 3) c cross join generate_series(1, 100) k;
      insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao)
      select n, 101, 'SABIA', now() - interval '40 days', n from generate_series(30, 40) n;
      insert into tbrevisao (idcandidato, idflashcard, avaliacao, data_hora_revisao, idsessao_revisao)
      select 30, 102, 'QUASE', now() - interval '40 days' + k * interval '1 second', 30 from generate_series(1, 100) k;
      update tbsessao_revisao set data_conclusao = now() - interval '1 day' + interval '1 minute' where id between 1 and 29;
      update tbsessao_revisao set data_conclusao = now() - interval '40 days' + interval '1 hour' where id = 30;`);
    const rar = async () => Object.fromEntries((await db.query(Q_RARIDADE)).rows.map((x) => [x.conquista, x.percentual === null ? null : Number(x.percentual)]));
    let x = await rar();
    conferir('catálogo com 18 conquistas', Object.keys(x).length === 18, Object.keys(x));
    conferir('29 contas ativas: nenhuma raridade exibida', Object.values(x).every((v) => v === null), x);
    const q = (await db.query(`select q.id, (select a.id from tbalternativa a where a.idquestao = q.id and a.correta) as alt from tbquestao q where q.idtema = 1 order by q.id limit 1`)).rows[0];
    await db.exec("insert into tbcertificacao (id, idcandidato, data_inicio) values (1, 41, now() - interval '3 days')");
    await db.query(`insert into tbresposta (idcertificacao, idquestao, idalternativa, data_hora_exibicao, data_hora_resposta, situacao)
                    values (1, $1, $2, now() - interval '2 days', now() - interval '2 days' + interval '30 seconds', 'RESPONDIDA')`, [q.id, q.alt]);
    await db.exec("insert into tbcertificacao (id, idcandidato, data_inicio) values (2, 42, now() - interval '3 days')");
    await db.query("insert into tbresposta (idcertificacao, idquestao, data_hora_exibicao, situacao) values (2, $1, now() - interval '2 days', 'EXPIRADA')", [q.id]);
    x = await rar();
    conferir('30 contas ativas (29 por revisão e 1 por resposta): raridade exibida', Object.values(x).every((v) => v !== null), x);
    conferir('Primeira órbita: 29 de 30, sem contar a inativa (96,7%)', x.PRIMEIRA_ORBITA === 96.7, x.PRIMEIRA_ORBITA);
    conferir('Cem revisões: 3 de 30, sem contar a inativa (10,0%)', x.CEM_REVISOES === 10, x.CEM_REVISOES);
    conferir('conquista que ninguém ativo tem: 0,0%', x.SISTEMA_COMPLETO === 0, x.SISTEMA_COMPLETO);
    const colunas = (await db.query(Q_RARIDADE)).fields.map((f) => f.name);
    conferir('a consulta devolve só a conquista e o percentual', JSON.stringify(colunas) === JSON.stringify(['conquista', 'percentual']), colunas);
  } finally {
    await db.close();
  }

  // 4. aviso de atualização dos termos
  db = await banco('p007d');
  try {
    await candidatos(db, 1, 2);
    await db.exec("update tbcandidato set data_aceite_termos = '2026-09-20 10:00', data_cadastro = '2026-09-20 10:00' where id = 2");
    const avisar = async (cand, versao) => (await db.query(Q_AVISO, [cand, versao])).rows.length === 1;
    conferir('cadastro antes da versão vigente: avisado no próximo acesso', await avisar(1, '2026-09-15'));
    conferir('segundo acesso: não é avisado de novo', !(await avisar(1, '2026-09-15')));
    conferir('cadastro depois da versão vigente: não é avisado', !(await avisar(2, '2026-09-15')));
    conferir('momento do aviso gravado pelo servidor', (await db.query('select data_aviso_termos is not null as tem from tbcandidato where id = 1')).rows[0].tem === true);
    await db.exec("update tbcandidato set data_aviso_termos = '2026-09-16 09:00' where id = 1");
    conferir('versão nova: quem foi avisado da anterior é avisado de novo', await avisar(1, '2026-10-01'));
    conferir('versão nova: quem se cadastrou entre as duas também é avisado', await avisar(2, '2026-10-01'));
    conferir('versão nova: uma única vez', !(await avisar(1, '2026-10-01')) && !(await avisar(2, '2026-10-01')));
  } finally {
    await db.close();
  }
}

// ---------------------------------------------------------------------------

(async () => {
  const versao = await comAdmin(async (a) => (await a.query('show server_version')).rows[0].server_version);
  console.log(`PostgreSQL ${versao}`);
  if (!versao.startsWith('16')) console.log('  AVISO: o alvo desta validação é o PostgreSQL 16 do docker compose.');
  const escolhidos = (process.argv[2] || '003,004,005,006,007').split(',');
  const todos = { '003': validar003, '004': validar004, '005': validar005, '006': validar006, '007': validar007 };
  for (const k of escolhidos) {
    try {
      await todos[k]();
    } catch (e) {
      conjunto = k;
      conferir(`conjunto ${k} terminou com erro inesperado`, false, e.message);
    }
  }
  console.log('\nResumo (PostgreSQL ' + versao + ')');
  let total = 0;
  for (const [k, v] of Object.entries(placar)) {
    console.log(`  ${k}: ${v.ok} verificações aprovadas, ${v.falhas} falhas`);
    total += v.falhas;
  }
  process.exit(total ? 1 : 0);
})();
