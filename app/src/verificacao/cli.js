// Comando: npm run verificar-carga (FR-016).
// Saída: uma linha por regra (OK, ERRO ou AVISO), com os detalhes indentados abaixo.
// Código de saída: 0 sem ERRO; 1 com algum ERRO; 2 se não conectar ao banco.

const { pool } = require('../db');
const { verificarCarga } = require('./verificar-carga');

const TEMPO_LIMITE_CONEXAO_MS = 10000;

// Adapta o Pool à interface da verificação: só o SQL e os parâmetros vão para o pg.
const consultar = ({ sql }, parametros = []) => pool.query(sql, parametros);

function formatar(item) {
  const linhas = [`${item.nivel.padEnd(6)}${item.mensagem}`];
  for (const detalhe of item.detalhes) linhas.push(`      - ${detalhe}`);
  return linhas.join('\n');
}

async function conectar() {
  let limite;
  const tempoEsgotado = new Promise((_, rejeitar) => {
    limite = setTimeout(
      () => rejeitar(new Error(`sem resposta em ${TEMPO_LIMITE_CONEXAO_MS / 1000} s`)),
      TEMPO_LIMITE_CONEXAO_MS,
    );
  });
  try {
    await Promise.race([pool.query('select 1'), tempoEsgotado]);
  } finally {
    clearTimeout(limite);
  }
}

async function principal() {
  try {
    await conectar();
  } catch (erro) {
    console.error(`ERRO  não foi possível conectar ao banco: ${erro.message}`);
    return 2;
  }

  try {
    const itens = await verificarCarga({ consultar });
    for (const item of itens) console.log(formatar(item));
    return itens.some((item) => item.nivel === 'ERRO') ? 1 : 0;
  } catch (erro) {
    console.error(`ERRO  falha ao consultar a carga: ${erro.message}`);
    return 1;
  }
}

principal().then(async (codigo) => {
  // Sem conexão, encerrar o Pool poderia esperar a tentativa pendente: sai direto.
  if (codigo !== 2) await pool.end().catch(() => {});
  process.exit(codigo);
});
