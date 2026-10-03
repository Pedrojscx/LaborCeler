// Testes do segredo da sessão: prioridade, mínimo de 32, leitura e geração com 0600.
// Requisitos: FR-029; research R4.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { resolverSegredo, NOME_ARQUIVO } = require('../src/seguranca/segredo-sessao');

function pastaTemporaria() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'lc-segredo-'));
}

const LONGO = 'x'.repeat(32);

test('JWT_SECRET tem prioridade sobre o arquivo', () => {
  const pasta = pastaTemporaria();
  fs.writeFileSync(path.join(pasta, NOME_ARQUIVO), 'y'.repeat(40));
  assert.equal(resolverSegredo({ env: { JWT_SECRET: LONGO }, pasta }), LONGO);
});

test('JWT_SECRET com menos de 32 caracteres impede a subida com mensagem clara', () => {
  assert.throws(
    () => resolverSegredo({ env: { JWT_SECRET: 'curto' }, pasta: pastaTemporaria() }),
    /JWT_SECRET.*32 caracteres/,
  );
});

test('JWT_SECRET vazia vale como ausente', () => {
  const pasta = pastaTemporaria();
  const segredo = resolverSegredo({ env: { JWT_SECRET: '' }, pasta });
  assert.ok(segredo.length >= 32);
});

test('sem variável, lê o arquivo da pasta', () => {
  const pasta = pastaTemporaria();
  fs.writeFileSync(path.join(pasta, NOME_ARQUIVO), `${'z'.repeat(50)}\n`);
  assert.equal(resolverSegredo({ env: {}, pasta }), 'z'.repeat(50));
});

test('sem variável nem arquivo, gera 64 bytes em base64url e grava com permissão 0600', () => {
  const pasta = pastaTemporaria();
  const segredo = resolverSegredo({ env: {}, pasta });
  const arquivo = path.join(pasta, NOME_ARQUIVO);

  assert.match(segredo, /^[A-Za-z0-9_-]{86}$/);
  assert.equal(fs.readFileSync(arquivo, 'utf8'), segredo);
  assert.equal(fs.statSync(arquivo).mode & 0o777, 0o600);

  // A segunda subida reaproveita o mesmo segredo.
  assert.equal(resolverSegredo({ env: {}, pasta }), segredo);
});

test('arquivo com segredo curto demais impede a subida', () => {
  const pasta = pastaTemporaria();
  fs.writeFileSync(path.join(pasta, NOME_ARQUIVO), 'curto');
  assert.throws(() => resolverSegredo({ env: {}, pasta }), /32 caracteres/);
});
