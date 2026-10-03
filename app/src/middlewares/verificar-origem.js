// Origem e formato dos pedidos que alteram dados sob /api (FR-020, research R3):
// 1) Origin com host diferente do Host do pedido, ou que não é URL (como "null") → 403;
// 2) sem Origin, Sec-Fetch-Site diferente de same-origin e none → 403;
// 3) corpo que não é application/json → 415.
// Sem Origin nem Sec-Fetch-Site (cliente que não é navegador), segue. Sem CORS.

const METODOS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

const ORIGEM_NEGADA = { erro: 'Origem da requisição não permitida.' };
const SOMENTE_JSON = { erro: 'Envie os dados em JSON.' };

function hostDaOrigem(origem) {
  try {
    return new URL(origem).host;
  } catch {
    return null;
  }
}

function origemPermitida(req) {
  const origem = req.get('origin');
  if (origem !== undefined) {
    const host = hostDaOrigem(origem);
    return host !== null && host !== '' && host === req.get('host');
  }
  const site = req.get('sec-fetch-site');
  return site === undefined || site === 'same-origin' || site === 'none';
}

function temCorpo(req) {
  return req.get('transfer-encoding') !== undefined || Number(req.get('content-length')) > 0;
}

function verificarOrigem(req, res, next) {
  if (!METODOS.has(req.method)) return next();
  if (!origemPermitida(req)) return res.status(403).json(ORIGEM_NEGADA);
  if (temCorpo(req) && !req.is('application/json')) return res.status(415).json(SOMENTE_JSON);
  return next();
}

module.exports = { verificarOrigem, SOMENTE_JSON };
