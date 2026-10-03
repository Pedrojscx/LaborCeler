// Testes da sessão: token, cookie, amarração ao cadastro, validade de 8 horas e algoritmo.
// Requisitos: FR-018, FR-020; research R2.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const { criarSessao, NOME_COOKIE, DURACAO_SEGUNDOS } = require('../src/seguranca/sessao');
const { SEGREDO_TESTE } = require('./apoio');

const AGORA = Date.UTC(2026, 9, 3, 12, 0, 0);
const CANDIDATO = { id: 7, nome: 'Maria Souza', data_cadastro: new Date(AGORA - 60_000) };

// Resposta mínima que registra os cookies emitidos e apagados.
function respostaFalsa() {
  return {
    cookies: [],
    limpos: [],
    cookie(nome, valor, opcoes) { this.cookies.push({ nome, valor, opcoes }); },
    clearCookie(nome, opcoes) { this.limpos.push({ nome, opcoes }); },
  };
}

function pedidoCom(token) {
  return { cookies: token === undefined ? {} : { [NOME_COOKIE]: token } };
}

function sessaoPadrao(opcoes = {}) {
  return criarSessao({
    segredo: SEGREDO_TESTE,
    buscarPorId: async (id) => (id === CANDIDATO.id ? CANDIDATO : null),
    ...opcoes,
  });
}

test('o token é HS256 com sub, cad, iat e exp de 8 horas', () => {
  const token = sessaoPadrao().gerarToken(CANDIDATO, AGORA);
  const { header, payload } = jwt.decode(token, { complete: true });

  assert.equal(header.alg, 'HS256');
  assert.equal(payload.sub, '7');
  assert.equal(payload.cad, Math.floor(CANDIDATO.data_cadastro.getTime() / 1000));
  assert.equal(payload.iat, AGORA / 1000);
  assert.equal(payload.exp - payload.iat, 8 * 60 * 60);
  assert.equal(DURACAO_SEGUNDOS, 28800);
});

test('o cookie sessao é HttpOnly, SameSite=Lax, Path=/, Max-Age de 8 h e sem Secure em HTTP', () => {
  const res = respostaFalsa();
  sessaoPadrao({ cookieSeguro: false }).emitirSessao(res, CANDIDATO, AGORA);

  const [{ nome, opcoes }] = res.cookies;
  assert.equal(nome, 'sessao');
  assert.equal(opcoes.httpOnly, true);
  assert.equal(opcoes.sameSite, 'lax');
  assert.equal(opcoes.path, '/');
  assert.equal(opcoes.maxAge, 28800 * 1000);
  assert.equal(opcoes.secure, false);
});

test('com endereço público HTTPS, o cookie leva Secure', () => {
  const res = respostaFalsa();
  sessaoPadrao({ cookieSeguro: true }).emitirSessao(res, CANDIDATO, AGORA);
  assert.equal(res.cookies[0].opcoes.secure, true);
});

test('token válido devolve o candidato', async () => {
  const sessao = sessaoPadrao();
  const token = sessao.gerarToken(CANDIDATO, AGORA);
  const res = respostaFalsa();

  const resultado = await sessao.lerSessao(pedidoCom(token), res, AGORA + 1000);
  assert.equal(resultado.estado, 'valida');
  assert.equal(resultado.candidato.id, 7);
  assert.equal(res.limpos.length, 0);
});

test('sem cookie, a sessão está ausente e nada é apagado', async () => {
  const res = respostaFalsa();
  const resultado = await sessaoPadrao().lerSessao(pedidoCom(undefined), res, AGORA);
  assert.equal(resultado.estado, 'ausente');
  assert.equal(res.limpos.length, 0);
});

test('cad diferente de data_cadastro invalida o token e apaga o cookie', async () => {
  const sessao = sessaoPadrao();
  const outroCadastro = { ...CANDIDATO, data_cadastro: new Date(AGORA - 120_000) };
  const token = sessao.gerarToken(outroCadastro, AGORA);
  const res = respostaFalsa();

  const resultado = await sessao.lerSessao(pedidoCom(token), res, AGORA);
  assert.equal(resultado.estado, 'invalida');
  assert.equal(res.limpos[0].nome, 'sessao');
});

test('candidato que não existe mais invalida o token', async () => {
  const sessao = sessaoPadrao();
  const token = sessao.gerarToken({ ...CANDIDATO, id: 99 }, AGORA);
  const resultado = await sessao.lerSessao(pedidoCom(token), respostaFalsa(), AGORA);
  assert.equal(resultado.estado, 'invalida');
});

test('token vencido (8 h + 1 s, relógio injetado) é inválido', async () => {
  const sessao = sessaoPadrao();
  const token = sessao.gerarToken(CANDIDATO, AGORA);

  const noLimite = await sessao.lerSessao(pedidoCom(token), respostaFalsa(), AGORA + 28800 * 1000 - 1000);
  assert.equal(noLimite.estado, 'valida');

  const vencido = await sessao.lerSessao(pedidoCom(token), respostaFalsa(), AGORA + 28801 * 1000);
  assert.equal(vencido.estado, 'invalida');
});

test('algoritmo diferente de HS256 é recusado', async () => {
  const cad = Math.floor(CANDIDATO.data_cadastro.getTime() / 1000);
  const iat = AGORA / 1000;
  const token = jwt.sign({ sub: '7', cad, iat, exp: iat + 28800 }, SEGREDO_TESTE, { algorithm: 'HS512' });
  const resultado = await sessaoPadrao().lerSessao(pedidoCom(token), respostaFalsa(), AGORA);
  assert.equal(resultado.estado, 'invalida');
});

test('token assinado com outro segredo é recusado', async () => {
  const outra = criarSessao({ segredo: 'o'.repeat(64), buscarPorId: async () => CANDIDATO });
  const token = outra.gerarToken(CANDIDATO, AGORA);
  const resultado = await sessaoPadrao().lerSessao(pedidoCom(token), respostaFalsa(), AGORA);
  assert.equal(resultado.estado, 'invalida');
});

test('encerrar apaga o cookie com os mesmos atributos', () => {
  const res = respostaFalsa();
  sessaoPadrao().encerrarSessao(res);
  assert.equal(res.limpos[0].nome, 'sessao');
  assert.equal(res.limpos[0].opcoes.httpOnly, true);
  assert.equal(res.limpos[0].opcoes.path, '/');
});
