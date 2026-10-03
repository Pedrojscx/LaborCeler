/*
 * Lunar Celer: abas deslizantes (docs/identidade-visual.md, seção 8)
 * O cursor desliza até a aba sob o mouse ou o foco e volta para a aba ativa.
 * A aba ativa acompanha a seção visível ao rolar a página.
 *
 * Uso:
 *   <nav class="lc-abas" aria-label="Seções da página" data-abas>
 *     <span class="lc-abas__cursor" aria-hidden="true"></span>
 *     <a class="lc-abas__aba" href="#scrum">Scrum</a> ...
 *   </nav>
 *   LunarCeler.abas(document.querySelector('[data-abas]'));
 */
(function () {
  'use strict';

  function abas(nav) {
    var links = Array.prototype.slice.call(nav.querySelectorAll('.lc-abas__aba'));
    var cursor = nav.querySelector('.lc-abas__cursor');
    if (!links.length || !cursor) return null;
    nav.style.setProperty('--abas', String(links.length));
    var ativa = -1;

    function mover(indice) {
      if (indice < 0) { cursor.style.opacity = '0'; return; }
      cursor.style.transform = 'translateX(' + (indice * 100) + '%)';
      cursor.style.opacity = '1';
    }

    function marcar(indice) {
      ativa = indice;
      links.forEach(function (link, i) {
        if (i === indice) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      mover(indice);
    }

    links.forEach(function (link, i) {
      link.addEventListener('mouseenter', function () { mover(i); });
      link.addEventListener('focus', function () { mover(i); });
      link.addEventListener('click', function () { marcar(i); });
    });
    nav.addEventListener('mouseleave', function () { mover(ativa); });
    nav.addEventListener('focusout', function (evento) {
      if (!nav.contains(evento.relatedTarget)) mover(ativa);
    });

    var secoes = links.map(function (link) {
      var id = (link.getAttribute('href') || '').replace('#', '');
      return id ? document.getElementById(id) : null;
    });
    if ('IntersectionObserver' in window) {
      var visiveis = new Set();
      var observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          var i = secoes.indexOf(entrada.target);
          if (entrada.isIntersecting) visiveis.add(i); else visiveis.delete(i);
        });
        var primeira = -1;
        for (var i = 0; i < secoes.length; i++) if (visiveis.has(i)) { primeira = i; break; }
        if (!nav.matches(':hover') && !nav.contains(document.activeElement)) marcar(primeira);
        else ativa = primeira;
      }, { rootMargin: '-45% 0px -50% 0px' });
      secoes.forEach(function (secao) { if (secao) observador.observe(secao); });
    }

    return { marcar: marcar };
  }

  window.LunarCeler = window.LunarCeler || {};
  window.LunarCeler.abas = abas;
})();
