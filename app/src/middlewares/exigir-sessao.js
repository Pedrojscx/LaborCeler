// Exige sessão válida (FR-018, FR-023, research R8). Para a API, 401 com a mensagem do catálogo;
// para páginas, 302 para /entrar, com ?motivo=expirada quando havia cookie inválido ou vencido.
// Com sessão válida, o candidato fica em req.candidato.

const SESSAO_EXPIRADA = { erro: 'Sua sessão expirou. Entre de novo.' };

function criarExigirSessao({ sessao, relogio }, { tipo }) {
  return async function exigirSessao(req, res, next) {
    try {
      const { estado, candidato } = await sessao.lerSessao(req, res, relogio());
      if (estado === 'valida') {
        req.candidato = candidato;
        return next();
      }
      if (tipo === 'api') return res.status(401).json(SESSAO_EXPIRADA);
      return res.redirect(302, estado === 'invalida' ? '/entrar?motivo=expirada' : '/entrar');
    } catch (erro) {
      return next(erro);
    }
  };
}

module.exports = { criarExigirSessao, SESSAO_EXPIRADA };
