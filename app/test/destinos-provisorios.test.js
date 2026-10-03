// Testes da página "Disponível em breve" e da tabela de destinos provisórios.
// Requisitos: FR-024, FR-050; tela 6; research R9.

const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { criarAppTeste, emTransacao, inserirCandidato, cookieDeSessao, pool } = require('./apoio');
const { DESTINOS } = require('../src/routes/destinos-provisorios');

after(() => pool.end());

// Títulos e textos da tabela do contrato (protótipo EmBreve).
const ESTUDOS = {
  titulo: 'A área de estudos está a caminho',
  texto: 'Os materiais e os flashcards dos 12 temas chegam numa próxima versão do Lunar Celer.',
};
const CERTIFICACAO = {
  titulo: 'A certificação está a caminho',
  texto: 'As questões dos 12 temas chegam numa próxima versão. Enquanto isso, sua conta já está pronta.',
};
const VALIDACAO = {
  titulo: 'A validação está a caminho',
  texto: 'A conferência pública de certificados chega numa próxima versão do Lunar Celer.',
};
const FLASHCARDS = {
  titulo: 'Os flashcards estão a caminho',
  texto: 'A revisão dos 12 temas com cartões de pergunta e resposta chega numa próxima versão do Lunar Celer.',
};
const PERFIL = {
  titulo: 'O perfil está a caminho',
  texto: 'Sua evolução nos estudos e as suas conquistas chegam numa próxima versão do Lunar Celer.',
};

function conferirVariacao(resposta, { titulo, texto }) {
  assert.equal(resposta.status, 200);
  assert.match(resposta.headers['content-type'], /text\/html/);
  assert.equal(resposta.headers['cache-control'], 'no-store');
  assert.ok(resposta.text.includes(`<title>${titulo} · Lunar Celer</title>`), 'título da aba');
  assert.ok(resposta.text.includes(titulo), 'título');
  assert.ok(resposta.text.includes(texto), 'texto');
  assert.doesNotMatch(resposta.text, /__TITULO__|__TEXTO__/);
}

test('os destinos públicos mostram a variação certa, sem cache', async () => {
  const app = criarAppTeste();
  const casos = [
    ['/estudos', ESTUDOS],
    ['/estudos/5', ESTUDOS],
    ['/validar', VALIDACAO],
    ['/validar/abc', VALIDACAO],
    ['/flashcards', FLASHCARDS],
  ];
  for (const [endereco, variacao] of casos) {
    conferirVariacao(await request(app).get(endereco), variacao);
  }
});

test('destinos que exigem sessão, sem sessão, levam ao login', async () => {
  const app = criarAppTeste();
  for (const endereco of ['/certificacao/inicio', '/perfil']) {
    const resposta = await request(app).get(endereco);
    assert.equal(resposta.status, 302, endereco);
    assert.equal(resposta.headers.location, '/entrar');
  }
});

test('destinos que exigem sessão, com sessão, mostram a variação', async () => {
  await emTransacao(async ({ consultar }) => {
    const candidato = await inserirCandidato(consultar);
    const app = criarAppTeste({ consultar });
    const cookie = cookieDeSessao(candidato);

    conferirVariacao(await request(app).get('/certificacao/inicio').set('Cookie', cookie), CERTIFICACAO);
    conferirVariacao(await request(app).get('/perfil').set('Cookie', cookie), PERFIL);
  });
});

test('o texto nunca reflete o endereço pedido', async () => {
  const app = criarAppTeste();
  const resposta = await request(app).get('/validar/%3Cscript%3Ealert(1)%3C%2Fscript%3E');
  conferirVariacao(resposta, VALIDACAO);
  assert.doesNotMatch(resposta.text, /<script>alert/);
  assert.doesNotMatch(resposta.text, /alert\(1\)/);
});

test('título e texto entram escapados para HTML', () => {
  const { escaparHtml } = require('../src/routes/destinos-provisorios');
  assert.equal(escaparHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
});

test('a tabela tem as sete entradas do contrato', () => {
  assert.deepEqual(
    DESTINOS.map((destino) => destino.endereco).sort(),
    ['/certificacao/inicio', '/estudos', '/estudos/:tema', '/flashcards', '/perfil', '/validar', '/validar/:codigo'],
  );
});
