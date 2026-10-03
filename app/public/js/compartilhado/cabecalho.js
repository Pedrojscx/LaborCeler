/*
 * Cabeçalho logado (FR-019, FR-048): preenche o nome do candidato e liga "Sair".
 * Depende de compartilhado/api.js.
 *
 * No HTML: elementos com data-nome-candidato recebem o nome (textContent); o botão com
 * data-sair encerra a sessão e leva à tela inicial.
 *
 * Uso: LunarCeler.cabecalho(document).then(function (candidato) { ... });
 *   Devolve o candidato de GET /api/auth/me ({ nome, primeiroNome }), ou null sem sessão
 *   (nesse caso, api.js já levou ao login).
 */
(function () {
  'use strict';

  function cabecalho(raiz) {
    raiz = raiz || document;
    var api = window.LunarCeler.api;

    raiz.querySelectorAll('[data-sair]').forEach(function (botao) {
      botao.addEventListener('click', function (evento) {
        evento.preventDefault();
        botao.disabled = true;
        api.enviar('POST', '/api/auth/logout').then(function () {
          window.location.assign('/');
        });
      });
    });

    return api.enviar('GET', '/api/auth/me').then(function (resultado) {
      if (resultado.status !== 200 || !resultado.corpo.candidato) return null;
      var candidato = resultado.corpo.candidato;
      raiz.querySelectorAll('[data-nome-candidato]').forEach(function (elemento) {
        elemento.textContent = candidato.nome;
      });
      return candidato;
    });
  }

  window.LunarCeler = window.LunarCeler || {};
  window.LunarCeler.cabecalho = cabecalho;
})();
