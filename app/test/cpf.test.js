// Testes da validação de CPF compartilhada entre navegador e servidor.
// Requisitos: FR-006, SC-004; research R10.

const { test } = require('node:test');
const assert = require('node:assert/strict');

const { normalizarCpf, validarCpf, formatarCpf } = require('../public/js/compartilhado/cpf');

test('CPFs válidos com e sem máscara e com espaços fora do lugar', () => {
  for (const valor of [
    '52998224725',
    '529.982.247-25',
    ' 529.982.247-25 ',
    '529 982 247 25',
    '529.982 .247- 25',
    '11144477735',
    '000.000.001-91',
  ]) {
    assert.ok(validarCpf(valor), valor);
  }
  assert.equal(validarCpf('529.982.247-25'), '52998224725');
});

test('CPFs inválidos', () => {
  for (const valor of [
    '529.982.247-26', // segundo dígito verificador errado
    '529.982.247-15', // primeiro dígito verificador errado
    '111.111.111-11', // todos iguais
    '00000000000',
    '5299822472', // 10 dígitos
    '529982247250', // 12 dígitos
    '529.982.247-2a', // letra
    'abc.def.ghi-jk',
    'maria@exemplo.com',
    '',
    null,
    undefined,
  ]) {
    assert.equal(validarCpf(valor), null, String(valor));
  }
});

test('normalizar devolve só os 11 dígitos, ou null', () => {
  assert.equal(normalizarCpf('529.982.247-25'), '52998224725');
  assert.equal(normalizarCpf('529.982.247'), null);
  assert.equal(normalizarCpf('529/982/247-25'), null);
});

test('formatar aplica a máscara', () => {
  assert.equal(formatarCpf('52998224725'), '529.982.247-25');
});
