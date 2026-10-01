const { criarApp } = require('./app');
const config = require('./config');
const { pool } = require('./db');

const servidor = criarApp().listen(config.porta, () => {
  console.log(`Portal no ar em ${config.urlPublica}`);
});

function encerrar(sinal) {
  console.log(`Recebido ${sinal}, encerrando...`);
  servidor.close(() => {
    pool.end().finally(() => process.exit(0));
  });
}

process.on('SIGTERM', () => encerrar('SIGTERM'));
process.on('SIGINT', () => encerrar('SIGINT'));
