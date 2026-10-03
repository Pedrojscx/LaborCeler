const jwt = require('jsonwebtoken');

// Sessão em cookie com JWT HS256 (FR-018 a FR-020, research R2). O servidor decide a identidade a
// cada pedido: confere assinatura e validade, busca o candidato e compara "cad" com a data do
// cadastro, para que um token antigo não vire a sessão de outro candidato com o mesmo id.

const NOME_COOKIE = 'sessao';
const DURACAO_SEGUNDOS = 8 * 60 * 60;

function segundos(ms) {
  return Math.floor(ms / 1000);
}

function criarSessao({ segredo, cookieSeguro = false, buscarPorId }) {
  if (!segredo) throw new Error('O segredo da sessão não foi informado.');

  const atributos = { httpOnly: true, sameSite: 'lax', path: '/', secure: cookieSeguro };

  function gerarToken(candidato, agora) {
    const iat = segundos(agora);
    const payload = {
      sub: String(candidato.id),
      cad: segundos(candidato.data_cadastro.getTime()),
      iat,
      exp: iat + DURACAO_SEGUNDOS,
    };
    return jwt.sign(payload, segredo, { algorithm: 'HS256' });
  }

  function emitirSessao(res, candidato, agora) {
    res.cookie(NOME_COOKIE, gerarToken(candidato, agora), {
      ...atributos,
      maxAge: DURACAO_SEGUNDOS * 1000,
    });
  }

  function encerrarSessao(res) {
    res.clearCookie(NOME_COOKIE, atributos);
  }

  // Devolve { estado: 'ausente' | 'invalida' | 'valida', candidato? }; apaga o cookie inválido.
  async function lerSessao(req, res, agora) {
    const token = req.cookies && req.cookies[NOME_COOKIE];
    if (!token) return { estado: 'ausente' };

    let payload;
    try {
      payload = jwt.verify(token, segredo, {
        algorithms: ['HS256'],
        clockTimestamp: segundos(agora),
      });
    } catch {
      encerrarSessao(res);
      return { estado: 'invalida' };
    }

    const id = Number(payload.sub);
    const candidato = Number.isInteger(id) && id > 0 ? await buscarPorId(id) : null;
    if (!candidato || segundos(candidato.data_cadastro.getTime()) !== payload.cad) {
      encerrarSessao(res);
      return { estado: 'invalida' };
    }
    return { estado: 'valida', candidato };
  }

  return { gerarToken, emitirSessao, lerSessao, encerrarSessao };
}

module.exports = { criarSessao, NOME_COOKIE, DURACAO_SEGUNDOS };
