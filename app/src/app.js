const path = require('node:path');
const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const config = require('./config');
const db = require('./db');
const { criarRotaSaude, criarMonitorCarga } = require('./routes/saude');
const { criarRotaPaginas } = require('./routes/paginas');
const { criarRotaDestinosProvisorios } = require('./routes/destinos-provisorios');
const { criarSessao } = require('./seguranca/sessao');
const { criarRepositorioCandidato } = require('./repositories/candidato-repository');
const { verificarOrigem, SOMENTE_JSON } = require('./middlewares/verificar-origem');
const { criarExigirSessao } = require('./middlewares/exigir-sessao');

// Pasta pública resolvida a partir deste módulo, nunca do diretório de trabalho (research R8 da 001).
const PASTA_PUBLICA = path.resolve(__dirname, '../public');

// CSP do contrato (research R7): sem 'unsafe-inline' e sem nada de outro domínio.
// upgrade-insecure-requests e HSTS só com endereço público HTTPS: o acesso por HTTP na rede local
// da apresentação precisa continuar funcionando.
function cabecalhosDeSeguranca(https) {
  const directives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    fontSrc: ["'self'"],
    imgSrc: ["'self'", 'data:'],
    formAction: ["'self'"],
    frameAncestors: ["'self'"],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
  };
  if (https) directives.upgradeInsecureRequests = [];

  return helmet({
    contentSecurityPolicy: { useDefaults: false, directives },
    strictTransportSecurity: https,
  });
}

// Monta a aplicação sem abrir porta, para ser testável com supertest (server.js faz o listen).
// Dependências substituíveis nos testes (research R16): consultar, segredo (obrigatório),
// custoBcrypt, relogio, cookieSeguro, repositorioConteudo e observarCarga.
function criarApp(dependencias = {}) {
  const {
    consultar = db.consultar,
    segredo,
    custoBcrypt = config.custoBcrypt,
    relogio = Date.now,
    cookieSeguro = config.cookieSeguro,
    repositorioConteudo,
    observarCarga = criarMonitorCarga(),
  } = dependencias;

  const repositorioCandidato = criarRepositorioCandidato(consultar);
  const sessao = criarSessao({
    segredo,
    cookieSeguro,
    buscarPorId: repositorioCandidato.buscarPorId,
  });
  const exigirSessaoPagina = criarExigirSessao({ sessao, relogio }, { tipo: 'pagina' });

  const app = express();
  // O IP do limite por rede é o da conexão; cabeçalhos X-Forwarded-* não são confiáveis aqui.
  app.set('trust proxy', false);
  app.set('x-powered-by', false);

  app.use(cabecalhosDeSeguranca(cookieSeguro));
  app.use(cookieParser());

  app.use(criarRotaPaginas({ pastaPublica: PASTA_PUBLICA, sessao, relogio, exigirSessaoPagina }));
  app.use(criarRotaDestinosProvisorios({ pastaPublica: PASTA_PUBLICA, exigirSessaoPagina }));
  app.use(express.static(PASTA_PUBLICA, { extensions: ['html'], index: false }));

  const api = express.Router();
  app.use('/api', api);

  api.use(verificarOrigem);
  api.use(express.json({ limit: '10kb' }));
  api.use(criarRotaSaude(repositorioConteudo, observarCarga));

  api.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada' });
  });

  // Erros inesperados não vazam stack nem detalhes para o cliente.
  app.use((erro, req, res, next) => {
    if (erro.type === 'entity.parse.failed') return res.status(400).json(SOMENTE_JSON);
    if (erro.type === 'entity.too.large') return res.status(413).json({ erro: 'Dados grandes demais.' });
    console.error(erro);
    return res.status(500).json({ erro: 'Erro interno' });
  });

  return app;
}

module.exports = { criarApp, PASTA_PUBLICA };
