const { criarApp } = require('./app');
const config = require('./config');
const { pool } = require('./db');
const { resolverSegredo } = require('./seguranca/segredo-sessao');
const { criarMonitorCarga } = require('./routes/saude');
const { obterResumoConteudo } = require('./repositories/conteudo-repository');

// O segredo é resolvido antes do listen: sem segredo válido, o portal não sobe (FR-029).
let segredo;
try {
  segredo = resolverSegredo();
} catch (erro) {
  console.error(`Segredo da sessão: ${erro.message}`);
  process.exit(1);
}

// Mesmo monitor na subida e no GET /api/saude: o aviso de carga incompleta sai uma vez na
// subida e de novo só quando o estado mudar (FR-004a).
const observarCarga = criarMonitorCarga();

const servidor = criarApp({ segredo, observarCarga }).listen(config.porta, () => {
  console.log(`Portal no ar em ${config.urlPublica}`);
  obterResumoConteudo()
    .then(observarCarga)
    .catch((erro) => console.error('Banco indisponível na subida:', erro.message));
});

function encerrar(sinal) {
  console.log(`Recebido ${sinal}, encerrando...`);
  servidor.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
