// Varredura estática das páginas: nada que a CSP bloqueie, nada de outro domínio e título com a
// marca. Requisitos: FR-026, FR-028, FR-048; research R7.

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { PASTA_PUBLICA } = require('../src/app');

const PASTA_KIT = path.join(PASTA_PUBLICA, 'kit');

// O index.html da 001 ainda não tem a marca no título; a T032 o substitui e retira esta exceção.
const SEM_MARCA_NO_TITULO = new Set(['index.html']);

function paginas(pasta = PASTA_PUBLICA) {
  return fs.readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = path.join(pasta, item.name);
    if (item.isDirectory()) return caminho === PASTA_KIT ? [] : paginas(caminho);
    return item.name.endsWith('.html') ? [caminho] : [];
  });
}

const PROIBIDOS = [
  { regra: 'script inline', padrao: /<script\b(?![^>]*\bsrc=)[^>]*>\s*\S/i },
  { regra: 'atributo de evento', padrao: /<[^>]+\son[a-z]+\s*=/i },
  { regra: 'URL javascript:', padrao: /javascript:/i },
  { regra: 'atributo style', padrao: /<[^>]+\sstyle\s*=/i },
  { regra: 'recurso de outro domínio', padrao: /\s(?:src|href)\s*=\s*["']?(?:https?:)?\/\//i },
];

test('há páginas para varrer', () => {
  assert.ok(paginas().length > 0);
});

for (const arquivo of paginas()) {
  const nome = path.relative(PASTA_PUBLICA, arquivo);

  test(`${nome}: sem script inline, eventos, javascript:, style= nem recurso externo`, () => {
    const html = fs.readFileSync(arquivo, 'utf8');
    for (const { regra, padrao } of PROIBIDOS) {
      assert.doesNotMatch(html, padrao, `${nome} tem ${regra}`);
    }
  });

  test(`${nome}: título termina em "· Lunar Celer"`, (contexto) => {
    if (SEM_MARCA_NO_TITULO.has(nome)) {
      contexto.skip('index.html da 001, substituído na T032');
      return;
    }
    const html = fs.readFileSync(arquivo, 'utf8');
    const titulo = html.match(/<title>([^<]*)<\/title>/i);
    assert.ok(titulo, `${nome} não tem <title>`);
    assert.match(titulo[1].trim(), /· Lunar Celer$/);
  });
}
