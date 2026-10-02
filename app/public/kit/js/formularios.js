/*
 * Lunar Celer: pequenos comportamentos de formulário
 * - Mostrar e ocultar senha: botão com data-alternar-senha="id-do-campo" (o mesmo botão
 *   controla também os campos listados em data-alternar-tambem, separados por espaço).
 *
 * Uso: LunarCeler.formularios(document);
 */
(function () {
  'use strict';

  function formularios(raiz) {
    (raiz || document).querySelectorAll('[data-alternar-senha]').forEach(function (botao) {
      var ids = [botao.getAttribute('data-alternar-senha')].concat((botao.getAttribute('data-alternar-tambem') || '').split(' ').filter(Boolean));
      botao.setAttribute('aria-pressed', 'false');
      botao.setAttribute('aria-label', 'Mostrar senha');
      botao.addEventListener('click', function () {
        var mostrar = botao.getAttribute('aria-pressed') !== 'true';
        ids.forEach(function (id) {
          var campo = document.getElementById(id);
          if (campo) campo.type = mostrar ? 'text' : 'password';
        });
        botao.setAttribute('aria-pressed', String(mostrar));
        botao.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
      });
    });
  }

  window.LunarCeler = window.LunarCeler || {};
  window.LunarCeler.formularios = formularios;
})();
