/*
 * Lunar Celer: estado do portal no rodapé (kit 1.3; docs/identidade-visual.md, rodapé)
 *
 * Uso: LunarCeler.estadoPortal(document);
 *   No HTML, o rodapé traz <span class="lc-status" hidden></span>: sem JavaScript, o rodapé
 *   mostra só o texto neutro e os links, sem estado.
 *
 * Consulta GET /api/saude e preenche cada .lc-status da página:
 *   200 com carga completa   → "Portal no ar e banco conectado"
 *   200 com carga incompleta → lc-status--falha, "Conteúdo em atualização."
 *   503 ou falha de rede     → lc-status--falha, "Instabilidade no portal. Tente de novo em alguns minutos."
 * O rodapé é público: o que falta na carga vai só para o log do servidor.
 */
(function () {
  'use strict';

  var TEXTOS = {
    ok: 'Portal no ar e banco conectado',
    atualizacao: 'Conteúdo em atualização.',
    instabilidade: 'Instabilidade no portal. Tente de novo em alguns minutos.'
  };

  function mostrar(raiz, estado) {
    (raiz || document).querySelectorAll('.lc-status').forEach(function (status) {
      status.textContent = TEXTOS[estado];
      status.classList.toggle('lc-status--falha', estado !== 'ok');
      status.hidden = false;
    });
  }

  function estadoPortal(raiz) {
    return fetch('/api/saude', { headers: { Accept: 'application/json' }, cache: 'no-store' })
      .then(function (resposta) {
        if (!resposta.ok) return 'instabilidade';
        return resposta.json().then(function (corpo) {
          return corpo.conteudo && corpo.conteudo.cargaCompleta ? 'ok' : 'atualizacao';
        });
      })
      .catch(function () { return 'instabilidade'; })
      .then(function (estado) {
        mostrar(raiz, estado);
        return estado;
      });
  }

  window.LunarCeler = window.LunarCeler || {};
  window.LunarCeler.estadoPortal = estadoPortal;
})();
