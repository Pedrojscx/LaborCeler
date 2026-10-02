/*
 * Lunar Celer: cronômetro em anel (docs/identidade-visual.md, seção 8)
 * Só exibe o tempo. Quem decide o prazo é o servidor (Princípio I): o valor inicial
 * vem da API em segundos restantes, e sincronizar() corrige a diferença a cada resposta.
 *
 * Uso:
 *   var c = LunarCeler.cronometro(document.querySelector('[data-cronometro]'), {
 *     restante: 107, total: 150, aoTerminar: function () { ...pedir ao servidor o encerramento... }
 *   });
 *   c.sincronizar(95); c.parar();
 */
(function () {
  'use strict';

  function formatar(segundos) {
    var m = Math.floor(segundos / 60), s = segundos % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  function cronometro(elemento, opcoes) {
    var total = opcoes.total || 150;
    var progresso = elemento.querySelector('.lc-anel__progresso');
    var tempo = elemento.querySelector('[data-tempo]');
    var anuncio = elemento.querySelector('[data-anuncio]');
    var raio = progresso ? parseFloat(progresso.getAttribute('r')) : 0;
    var circunferencia = 2 * Math.PI * raio;
    var fim = performance.now() + Math.max(0, opcoes.restante) * 1000;
    var anunciados = {};
    var terminou = false;
    if (progresso) progresso.style.strokeDasharray = circunferencia.toFixed(2);

    function atualizar() {
      var restante = Math.max(0, (fim - performance.now()) / 1000);
      var inteiro = Math.ceil(restante);
      if (tempo) {
        tempo.textContent = formatar(inteiro);
        tempo.setAttribute('aria-label', 'Restam ' + Math.floor(inteiro / 60) + ' minutos e ' + (inteiro % 60) + ' segundos');
      }
      if (progresso) progresso.style.strokeDashoffset = (circunferencia * (1 - restante / total)).toFixed(2);
      elemento.classList.toggle('is-alerta', inteiro <= 30);
      [60, 30, 10].forEach(function (marco) {
        if (inteiro <= marco && !anunciados[marco] && anuncio) {
          anunciados[marco] = true;
          anuncio.textContent = 'Restam ' + marco + ' segundos.';
        }
      });
      if (restante <= 0 && !terminou) {
        terminou = true;
        parar();
        if (typeof opcoes.aoTerminar === 'function') opcoes.aoTerminar();
      }
    }

    var intervalo = window.setInterval(atualizar, 250);
    function parar() { window.clearInterval(intervalo); }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) atualizar(); });
    atualizar();

    return {
      sincronizar: function (restanteDoServidor) { fim = performance.now() + Math.max(0, restanteDoServidor) * 1000; atualizar(); },
      parar: parar
    };
  }

  window.LunarCeler = window.LunarCeler || {};
  window.LunarCeler.cronometro = cronometro;
})();
