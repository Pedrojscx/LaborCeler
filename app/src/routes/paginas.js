const path = require('node:path');
const express = require('express');
const { ARQUIVO_MODELO } = require('./destinos-provisorios');

// Páginas com endereço limpo e redirecionamentos decididos no servidor (FR-023, research R8).
// Registrado antes do express.static, para que o acesso direto ao arquivo não escape das regras.

const MODELO_SEM_EXTENSAO = `/${path.basename(ARQUIVO_MODELO, '.html')}`;

function criarRotaPaginas({ pastaPublica, sessao, relogio, exigirSessaoPagina }) {
  const rota = express.Router();

  function entregar(arquivo) {
    return (req, res, next) => {
      res.set('Cache-Control', 'no-store');
      res.sendFile(path.join(pastaPublica, arquivo), (erro) => {
        // Página que ainda não existe nesta fase segue para o 404 padrão.
        if (erro) next(erro.code === 'ENOENT' ? undefined : erro);
      });
    };
  }

  // O modelo da página "Disponível em breve" só sai preenchido, pelos destinos provisórios.
  rota.get([MODELO_SEM_EXTENSAO, `/${ARQUIVO_MODELO}`], (req, res) => res.sendStatus(404));

  // *.html → endereço limpo, mantendo a consulta. Barras iniciais repetidas viram uma só, para que
  // "//outro.site.html" nunca vire um redirecionamento para outro domínio.
  rota.get(/\.html$/, (req, res) => {
    const limpo = req.path
      .replace(/\.html$/, '')
      .replace(/\/index$/, '/')
      .replace(/^[/\\]+/, '/');
    const consulta = req.originalUrl.slice(req.originalUrl.split('?')[0].length);
    res.redirect(301, (limpo || '/') + consulta);
  });

  // Com sessão válida, cadastro e login levam à área do candidato.
  function redirecionarConectado(req, res, next) {
    sessao
      .lerSessao(req, res, relogio())
      .then(({ estado }) => (estado === 'valida' ? res.redirect(302, '/candidato') : next()))
      .catch(next);
  }

  // A tela inicial não redireciona: o candidato volta a ela por "Rever as regras".
  rota.get('/', entregar('index.html'));
  rota.get('/cadastro', redirecionarConectado, entregar('cadastro.html'));
  rota.get('/entrar', redirecionarConectado, entregar('entrar.html'));
  rota.get('/candidato', exigirSessaoPagina, entregar('candidato.html'));

  return rota;
}

module.exports = { criarRotaPaginas };
