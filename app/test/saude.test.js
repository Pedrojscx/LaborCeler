// Testes de GET /api/saude, do 404 da API e da entrega do front e das imagens.
// Requisitos: FR-008, FR-012, FR-013, SC-003; RNF07, RP04.
// Rodar no container: docker compose exec app node --test test/saude.test.js

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');

const { criarAppTeste } = require('./apoio');
const { pool } = require('../src/db');

const IMAGEM_QUESTAO = path.resolve(__dirname, '../public/img/questoes/tema01-q1.svg');

function repositorioFalso(resumo) {
  return { obterResumoConteudo: async () => resumo };
}

after(() => pool.end());

test('(a) GET /api/saude com banco disponível responde 200 no formato do contrato', async () => {
  const resposta = await request(criarAppTeste()).get('/api/saude');

  assert.equal(resposta.status, 200);
  assert.equal(resposta.body.status, 'ok');
  assert.equal(resposta.body.banco, 'ok');

  const { conteudo } = resposta.body;
  for (const campo of ['temas', 'questoes', 'alternativas', 'materiais']) {
    assert.ok(Number.isInteger(conteudo[campo]), `${campo} deve ser inteiro`);
  }
  assert.equal(typeof conteudo.provisorio, 'boolean');
  assert.equal(typeof conteudo.cargaCompleta, 'boolean');
});

test('(b) GET /api/saude com o banco falhando responde 503', async () => {
  const repositorioConteudo = {
    obterResumoConteudo: async () => {
      throw new Error('banco fora do ar');
    },
  };
  const resposta = await request(criarAppTeste({ repositorioConteudo })).get('/api/saude');

  assert.equal(resposta.status, 503);
  assert.deepEqual(resposta.body, { status: 'erro', banco: 'indisponivel' });
});

test('(c) cargaCompleta só é true com 12 temas, 48 questões e 192 alternativas', async () => {
  const incompleta = repositorioFalso({
    temas: 12, questoes: 47, alternativas: 188, materiais: 12, provisorio: true,
  });
  let resposta = await request(criarAppTeste({ repositorioConteudo: incompleta })).get('/api/saude');
  assert.equal(resposta.status, 200);
  assert.equal(resposta.body.conteudo.cargaCompleta, false);

  const completa = repositorioFalso({
    temas: 12, questoes: 48, alternativas: 192, materiais: 12, provisorio: true,
  });
  resposta = await request(criarAppTeste({ repositorioConteudo: completa })).get('/api/saude');
  assert.equal(resposta.status, 200);
  assert.equal(resposta.body.conteudo.cargaCompleta, true);
});

test('(d) rota inexistente da API responde 404 em JSON', async () => {
  const resposta = await request(criarAppTeste()).get('/api/inexistente');

  assert.equal(resposta.status, 404);
  assert.match(resposta.headers['content-type'], /application\/json/);
  assert.deepEqual(resposta.body, { erro: 'Rota não encontrada' });
});

test('(e) GET / entrega a página inicial', async () => {
  const resposta = await request(criarAppTeste()).get('/');

  assert.equal(resposta.status, 200);
  assert.match(resposta.headers['content-type'], /text\/html/);
});

test(
  '(f) imagem de questão é servida como SVG',
  { skip: !fs.existsSync(IMAGEM_QUESTAO) && 'SVGs da US2 ainda não gerados' },
  async () => {
    const resposta = await request(criarAppTeste()).get('/img/questoes/tema01-q1.svg');

    assert.equal(resposta.status, 200);
    assert.match(resposta.headers['content-type'], /image\/svg\+xml/);
  },
);
