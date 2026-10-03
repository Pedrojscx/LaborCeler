// Testes das páginas e das proteções da fundação: endereços limpos, origem e formato dos pedidos,
// CSP e ausência de CORS. Requisitos: FR-020, FR-028; research R3, R7, R8.

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { criarAppTeste, pool } = require('./apoio');

after(() => pool.end());

// Diretivas da CSP do contrato (contracts/paginas-e-sessao.md, "Cabeçalhos de segurança").
const CSP_ESPERADA = {
  'default-src': "'self'",
  'script-src': "'self'",
  'style-src': "'self'",
  'font-src': "'self'",
  'img-src': "'self' data:",
  'form-action': "'self'",
  'frame-ancestors': "'self'",
  'object-src': "'none'",
  'base-uri': "'self'",
};

function diretivas(csp) {
  return Object.fromEntries(
    csp.split(';').map((parte) => parte.trim()).filter(Boolean).map((parte) => {
      const [nome, ...valores] = parte.split(/\s+/);
      return [nome, valores.join(' ')];
    }),
  );
}

test('GET de um endereço terminado em .html responde 301 para o endereço limpo', async () => {
  const app = criarAppTeste();

  let resposta = await request(app).get('/qualquer.html');
  assert.equal(resposta.status, 301);
  assert.equal(resposta.headers.location, '/qualquer');

  resposta = await request(app).get('/index.html');
  assert.equal(resposta.status, 301);
  assert.equal(resposta.headers.location, '/');

  resposta = await request(app).get('/entrar.html?motivo=expirada');
  assert.equal(resposta.status, 301);
  assert.equal(resposta.headers.location, '/entrar?motivo=expirada');
});

test('o 301 de .html nunca leva a outro domínio', async () => {
  const app = criarAppTeste();
  for (const endereco of ['//outro.exemplo.html', '/\\outro.exemplo.html']) {
    const resposta = await request(app).get(endereco);
    assert.equal(resposta.status, 301, endereco);
    assert.match(resposta.headers.location, /^\/(?![/\\])/, endereco);
  }
});

test('o modelo da página "Disponível em breve" não é servido direto', async () => {
  const resposta = await request(criarAppTeste()).get('/em-breve');
  assert.equal(resposta.status, 404);
  assert.doesNotMatch(resposta.text, /__TITULO__/);
});

test('POST sob /api com Origin de outra porta do mesmo host responde 403', async () => {
  const resposta = await request(criarAppTeste())
    .post('/api/auth/login')
    .set('Host', 'localhost:3000')
    .set('Origin', 'http://localhost:8080')
    .send({ cpf: '52998224725', senha: 'qualquer' });

  assert.equal(resposta.status, 403);
  assert.deepEqual(resposta.body, { erro: 'Origem da requisição não permitida.' });
});

test('POST sob /api com Origin: null responde 403', async () => {
  const resposta = await request(criarAppTeste())
    .post('/api/auth/login')
    .set('Origin', 'null')
    .send({});
  assert.equal(resposta.status, 403);
});

test('POST sob /api sem Origin e com Sec-Fetch-Site: cross-site responde 403', async () => {
  const resposta = await request(criarAppTeste())
    .post('/api/auth/login')
    .set('Sec-Fetch-Site', 'cross-site')
    .send({});
  assert.equal(resposta.status, 403);
});

test('POST com Origin do próprio host não é barrado pela origem', async () => {
  const resposta = await request(criarAppTeste())
    .post('/api/rota-inexistente')
    .set('Host', 'localhost:3000')
    .set('Origin', 'http://localhost:3000')
    .set('Sec-Fetch-Site', 'same-origin')
    .send({});
  assert.equal(resposta.status, 404);
});

test('POST sob /api com corpo text/plain responde 415', async () => {
  const resposta = await request(criarAppTeste())
    .post('/api/auth/login')
    .set('Content-Type', 'text/plain')
    .send('cpf=52998224725');
  assert.equal(resposta.status, 415);
  assert.deepEqual(resposta.body, { erro: 'Envie os dados em JSON.' });
});

test('POST sob /api com JSON malformado responde 400 "Envie os dados em JSON."', async () => {
  const resposta = await request(criarAppTeste())
    .post('/api/auth/login')
    .set('Content-Type', 'application/json')
    .send('{"cpf": ');
  assert.equal(resposta.status, 400);
  assert.deepEqual(resposta.body, { erro: 'Envie os dados em JSON.' });
});

test('POST sob /api com mais de 10 kB responde 413 "Dados grandes demais."', async () => {
  const resposta = await request(criarAppTeste())
    .post('/api/auth/login')
    .send({ cpf: '52998224725', senha: 'a'.repeat(11 * 1024) });
  assert.equal(resposta.status, 413);
  assert.deepEqual(resposta.body, { erro: 'Dados grandes demais.' });
});

test('nenhuma resposta tem Access-Control-Allow-Origin', async () => {
  const app = criarAppTeste();
  for (const pedido of [
    request(app).get('/').set('Origin', 'http://outro.exemplo'),
    request(app).options('/api/auth/login').set('Origin', 'http://outro.exemplo'),
    request(app).post('/api/auth/login').set('Origin', 'http://outro.exemplo').send({}),
  ]) {
    const resposta = await pedido;
    assert.equal(resposta.headers['access-control-allow-origin'], undefined);
  }
});

test('a CSP é a do contrato e não tem upgrade-insecure-requests nem HSTS em HTTP', async () => {
  const resposta = await request(criarAppTeste({ cookieSeguro: false })).get('/');
  const csp = diretivas(resposta.headers['content-security-policy']);

  assert.deepEqual(csp, CSP_ESPERADA);
  assert.equal(resposta.headers['strict-transport-security'], undefined);
});

test('com endereço público HTTPS, a CSP acrescenta upgrade-insecure-requests e há HSTS', async () => {
  const resposta = await request(criarAppTeste({ cookieSeguro: true })).get('/');
  const csp = diretivas(resposta.headers['content-security-policy']);

  assert.ok('upgrade-insecure-requests' in csp);
  assert.ok(resposta.headers['strict-transport-security']);
});
