// Testes da verificação da carga inicial (FR-016).
// Requisitos: FR-004 a FR-009, FR-016, SC-002, SC-003; RP06, RF05, RF06, RF07, RF08, RP04.
// Rodar no container: docker compose exec app node --test test/verificacao-carga.test.js

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  verificarCarga,
  CONSULTAS,
  TEMAS_OFICIAIS,
} = require('../src/verificacao/verificar-carga');
const { pool } = require('../src/db');

// Mesmo adaptador do cli.js: só o SQL e os parâmetros vão para o pg.
const consultarBanco = ({ sql }, parametros = []) => pool.query(sql, parametros);

const REGRAS_DE_CONTEUDO = [
  'temas',
  'questoes',
  'alternativas',
  'corretas',
  'materiais',
  'imagens',
  'arquivos',
];

after(() => pool.end());

function itemDaRegra(itens, regra) {
  return itens.find((item) => item.regra === regra);
}

function descreverErros(itens) {
  return itens
    .filter((item) => item.nivel === 'ERRO')
    .map((item) => `${item.mensagem}: ${item.detalhes.join('; ')}`)
    .join('\n');
}

// Respostas de uma carga válida, por nome de consulta, para o consultar falso.
function montarRespostasValidas() {
  const doisDigitos = (n) => String(n).padStart(2, '0');
  const respostas = {
    temas: [],
    questoes: [],
    alternativas: [],
    materiais: [],
    imagens: [],
    tabelasUso: [{ tbcandidato: 0, tbcertificacao: 0, tbcertificado: 0, tbresposta: 0 }],
    provisorio: [{ questoes: 48, materiais: 12, imagens: 60 }],
  };

  TEMAS_OFICIAIS.forEach((nome, indice) => {
    const tema = indice + 1;
    respostas.temas.push({ id: tema, ordem: tema, nome, descricao: `Descrição de ${nome}.` });
    respostas.materiais.push({ id: tema, idtema: tema });
    respostas.imagens.push({
      id: 100 + tema,
      arquivo: `img/materiais/tema${doisDigitos(tema)}.svg`,
      texto_alternativo: `Ilustração do tema ${nome}`,
    });

    for (let k = 1; k <= 4; k += 1) {
      const idquestao = (tema - 1) * 4 + k;
      respostas.questoes.push({
        id: idquestao,
        idtema: tema,
        idimagem: idquestao,
        enunciado: `[PROVISÓRIO] Enunciado da questão ${idquestao}`,
      });
      respostas.imagens.push({
        id: idquestao,
        arquivo: `img/questoes/tema${doisDigitos(tema)}-q${k}.svg`,
        texto_alternativo: `Ilustração da questão ${idquestao}`,
      });
      for (const letra of ['A', 'B', 'C', 'D']) {
        respostas.alternativas.push({ idquestao, letra, correta: letra === 'A' });
      }
    }
  });

  return respostas;
}

// Responde pelo nome da consulta, sem olhar o SQL. Falha se a consulta pedida não for uma
// das constantes exportadas em CONSULTAS.
function criarConsultarFalso(respostas, nomesPedidos = []) {
  return async (consulta) => {
    if (!Object.values(CONSULTAS).includes(consulta)) {
      throw new Error(`consulta fora de CONSULTAS: ${consulta && consulta.nome}`);
    }
    nomesPedidos.push(consulta.nome);
    return { rows: respostas[consulta.nome] };
  };
}

test('(a) a carga do banco não tem nenhum ERRO', async () => {
  const itens = await verificarCarga({ consultar: consultarBanco });

  assert.equal(descreverErros(itens), '');
});

test('(b) as 8 regras do contrato aparecem, as de conteúdo como OK', async () => {
  const itens = await verificarCarga({ consultar: consultarBanco });

  for (const regra of REGRAS_DE_CONTEUDO) {
    assert.equal(itemDaRegra(itens, regra)?.nivel, 'OK', `regra ${regra} deveria ser OK`);
  }
  // tabelas de uso: OK logo após a carga; AVISO (nunca ERRO) depois que o portal é usado
  assert.ok(['OK', 'AVISO'].includes(itemDaRegra(itens, 'tabelasUso')?.nivel));
});

test('(c) avisa o conteúdo provisório com as três contagens', async () => {
  const itens = await verificarCarga({ consultar: consultarBanco });
  const aviso = itemDaRegra(itens, 'provisorio');

  assert.equal(aviso?.nivel, 'AVISO');
  assert.deepEqual(aviso.contagens, { questoes: 48, materiais: 12, imagens: 60 });
});

test('(d) com a pasta pública vazia, a regra de arquivos vira ERRO', async () => {
  const pastaVazia = fs.mkdtempSync(path.join(os.tmpdir(), 'publica-vazia-'));
  try {
    const itens = await verificarCarga({ consultar: consultarBanco, pastaPublica: pastaVazia });
    const arquivos = itemDaRegra(itens, 'arquivos');

    assert.equal(arquivos.nivel, 'ERRO');
    assert.ok(arquivos.detalhes.includes('arquivo ausente: img/questoes/tema01-q1.svg'));
  } finally {
    fs.rmSync(pastaVazia, { recursive: true, force: true });
  }
});

test('(e) descrição de tema e enunciado só com espaços viram ERRO', async () => {
  const validas = montarRespostasValidas();
  let itens = await verificarCarga({ consultar: criarConsultarFalso(validas) });
  assert.equal(itemDaRegra(itens, 'temas').nivel, 'OK');
  assert.equal(itemDaRegra(itens, 'questoes').nivel, 'OK');

  const respostas = montarRespostasValidas();
  respostas.temas[2].descricao = '   ';
  respostas.questoes[6].enunciado = ' \n ';
  itens = await verificarCarga({ consultar: criarConsultarFalso(respostas) });

  const temas = itemDaRegra(itens, 'temas');
  assert.equal(temas.nivel, 'ERRO');
  assert.ok(temas.detalhes.includes('tema 3 com descrição vazia'), temas.detalhes.join('; '));

  const questoes = itemDaRegra(itens, 'questoes');
  assert.equal(questoes.nivel, 'ERRO');
  assert.ok(questoes.detalhes.includes('questão 7 com enunciado vazio'), questoes.detalhes.join('; '));
});

test('(e2) a verificação só pede consultas nomeadas de CONSULTAS', async () => {
  for (const [chave, consulta] of Object.entries(CONSULTAS)) {
    assert.equal(consulta.nome, chave);
    assert.equal(typeof consulta.sql, 'string');
  }

  const nomesPedidos = [];
  await verificarCarga({ consultar: criarConsultarFalso(montarRespostasValidas(), nomesPedidos) });

  assert.deepEqual([...new Set(nomesPedidos)].sort(), Object.keys(CONSULTAS).sort());
});

test('(f) sem pastaPublica, o padrão é app/public mesmo com outro diretório de trabalho', async () => {
  const diretorioOriginal = process.cwd();
  process.chdir(os.tmpdir());
  try {
    const itens = await verificarCarga({ consultar: criarConsultarFalso(montarRespostasValidas()) });
    const arquivos = itemDaRegra(itens, 'arquivos');

    assert.equal(arquivos.nivel, 'OK', arquivos.detalhes.join('; '));
    assert.match(arquivos.mensagem, /60 arquivos de imagem encontrados em app\/public/);
  } finally {
    process.chdir(diretorioOriginal);
  }
});
