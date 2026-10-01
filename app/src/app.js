const path = require('node:path');
const express = require('express');
const { criarRotaSaude } = require('./routes/saude');

// Pasta pública resolvida a partir deste módulo, nunca do diretório de trabalho (research R8).
const PASTA_PUBLICA = path.resolve(__dirname, '../public');

// Monta a aplicação sem abrir porta, para ser testável com supertest (server.js faz o listen).
// As dependências podem ser substituídas nos testes.
function criarApp(dependencias = {}) {
  const app = express();

  app.use(express.static(PASTA_PUBLICA));

  const api = express.Router();
  app.use('/api', api);

  api.use(criarRotaSaude(dependencias.repositorioConteudo));

  api.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });

  // Erros inesperados não vazam stack para o cliente.
  app.use((erro, req, res, next) => {
    console.error(erro);
    res.status(500).json({ erro: 'Erro interno' });
  });

  return app;
}

module.exports = { criarApp, PASTA_PUBLICA };
