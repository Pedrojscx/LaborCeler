// Apoio aos testes da 002: app com dependências de teste, transação desfeita no fim e cookie de
// sessão pronto. Requisitos: SC-006; Princípio IX; research R16.

const { pool } = require('../src/db');
const { criarApp } = require('../src/app');
const { criarSessao } = require('../src/seguranca/sessao');

// Segredo só dos testes (64 caracteres), nunca usado fora deles.
const SEGREDO_TESTE = 'segredo-de-teste-da-002-segredo-de-teste-da-002-segredo-de-teste';

// App com bcrypt de custo 4 e segredo fixo; o relógio é injetável (research R16).
function criarAppTeste({ segredo = SEGREDO_TESTE, custoBcrypt = 4, ...resto } = {}) {
  return criarApp({ segredo, custoBcrypt, ...resto });
}

// Roda o caso num cliente dedicado do pool, dentro de begin ... rollback: nada do teste fica no
// banco, mesmo se o caso falhar no meio.
async function emTransacao(fn) {
  const cliente = await pool.connect();
  try {
    await cliente.query('begin');
    const consultar = (sql, parametros = []) => cliente.query(sql, parametros);
    return await fn({ consultar, cliente });
  } finally {
    try {
      await cliente.query('rollback');
    } finally {
      cliente.release();
    }
  }
}

// Insere um candidato de teste (hash qualquer: estes casos não conferem a senha).
async function inserirCandidato(consultar, { cpf = '52998224725', nome = 'Maria Souza' } = {}) {
  const { rows } = await consultar(
    `insert into tbcandidato (cpf, nome, email, senha, data_aceite_termos)
     values ($1, $2, 'maria@exemplo.com', '$2b$04$hashdeteste', now())
     returning id, nome, data_cadastro`,
    [cpf, nome],
  );
  return rows[0];
}

// Cookie "sessao=<token>" para os testes de páginas com sessão.
function cookieDeSessao(candidato, segredo = SEGREDO_TESTE, agora = Date.now()) {
  const sessao = criarSessao({ segredo, buscarPorId: async () => null });
  return `sessao=${sessao.gerarToken(candidato, agora)}`;
}

module.exports = {
  SEGREDO_TESTE,
  criarAppTeste,
  emTransacao,
  inserirCandidato,
  cookieDeSessao,
  pool,
};
