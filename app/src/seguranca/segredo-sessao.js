const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config');

// Segredo que assina a sessão, sem valor padrão conhecido (FR-029, research R4). Ordem:
// 1) JWT_SECRET do ambiente, se não vazia (mínimo de 32 caracteres, coerente com HS256);
// 2) arquivo segredo-sessao na pasta do volume segredo_sessao;
// 3) 64 bytes aleatórios gerados na primeira subida e gravados nesse arquivo com 0600.
// O segredo nunca vai para log.

const NOME_ARQUIVO = 'segredo-sessao';
const MINIMO = 32;

function conferirTamanho(segredo, origem) {
  if (segredo.length < MINIMO) {
    throw new Error(
      `${origem} precisa ter ${MINIMO} caracteres ou mais. Corrija o valor ou deixe JWT_SECRET ` +
        'vazia para o portal gerar o segredo sozinho.',
    );
  }
  return segredo;
}

function lerArquivo(arquivo) {
  try {
    return fs.readFileSync(arquivo, 'utf8').trim();
  } catch (erro) {
    if (erro.code === 'ENOENT') return null;
    throw erro;
  }
}

function resolverSegredo({ env = process.env, pasta = config.pastaSegredo } = {}) {
  if (env.JWT_SECRET) return conferirTamanho(env.JWT_SECRET, 'JWT_SECRET');

  const arquivo = path.join(pasta, NOME_ARQUIVO);
  const existente = lerArquivo(arquivo);
  if (existente !== null) return conferirTamanho(existente, `O arquivo ${arquivo}`);

  const gerado = crypto.randomBytes(64).toString('base64url');
  try {
    // "wx": se outra subida gravou ao mesmo tempo, fica valendo o arquivo dela.
    fs.writeFileSync(arquivo, gerado, { mode: 0o600, flag: 'wx' });
  } catch (erro) {
    if (erro.code === 'EEXIST') return conferirTamanho(lerArquivo(arquivo), `O arquivo ${arquivo}`);
    throw new Error(
      `Não foi possível gravar o segredo da sessão em ${arquivo} (${erro.code}). ` +
        'Confira o volume segredo_sessao ou defina JWT_SECRET.',
    );
  }
  return gerado;
}

module.exports = { resolverSegredo, NOME_ARQUIVO };
