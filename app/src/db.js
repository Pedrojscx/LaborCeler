const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({ connectionString: config.urlBanco });

// Uma conexão ociosa perdida (ex.: banco reiniciado) não deve derrubar o processo.
pool.on('error', (erro) => {
  console.error('Erro em conexão ociosa com o banco:', erro.message);
});

// Consultas sempre parametrizadas; nunca concatenar valores no SQL (Princípio III).
function consultar(sql, parametros = []) {
  return pool.query(sql, parametros);
}

module.exports = { pool, consultar };
