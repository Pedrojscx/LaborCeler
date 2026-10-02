/*
 * Lunar Celer: notificações (docs/identidade-visual.md, seção 8.1)
 *
 * Uso:
 *   LunarCeler.notificar({ tipo: 'sucesso', titulo: 'Conta criada', texto: 'Sua conta está pronta.' });
 *   tipos: sucesso, conquista, info (somem em 5 s) | aviso, erro (ficam até fechar)
 *
 * Regras: no máximo três na tela; pausa com mouse ou foco sobre a notificação;
 * anúncio para leitores de tela por regiões vivas próprias (calma para sucesso,
 * conquista e info; imediata para aviso e erro). Título e texto entram como texto
 * puro (textContent), nunca como HTML.
 */
(function () {
  'use strict';

  var ICONES = {
    sucesso: '<circle cx="13" cy="13" r="11"/><path d="M8.5 13.4l3.1 3.1 6-6.3"/>',
    conquista: '<circle cx="13" cy="13" r="11"/><path d="M13 7.5l1.7 3.5 3.8.5-2.8 2.6.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.6 3.8-.5z"/>',
    info: '<circle cx="13" cy="13" r="11"/><path d="M13 12v6M13 8.5v.01"/>',
    aviso: '<path d="M13 3.5l10 17.5H3z"/><path d="M13 10v5M13 18v.01"/>',
    erro: '<circle cx="13" cy="13" r="11"/><path d="M9.5 9.5l7 7M16.5 9.5l-7 7"/>'
  };
  var MAXIMO = 3;
  var DURACAO_PADRAO = 5000;
  var pilha, regiaoCalma, regiaoUrgente;

  function criarRegiao(tipo) {
    var regiao = document.createElement('div');
    regiao.className = 'lc-apenas-leitor';
    regiao.setAttribute('aria-live', tipo);
    regiao.setAttribute('aria-atomic', 'true');
    document.body.appendChild(regiao);
    return regiao;
  }

  function preparar() {
    if (pilha) return;
    pilha = document.createElement('div');
    pilha.className = 'lc-toasts';
    document.body.appendChild(pilha);
    regiaoCalma = criarRegiao('polite');
    regiaoUrgente = criarRegiao('assertive');
  }

  function anunciar(regiao, mensagem) {
    regiao.textContent = '';
    window.setTimeout(function () { regiao.textContent = mensagem; }, 60);
  }

  function svg(tipo) {
    return '<svg class="lc-toast__icone" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONES[tipo] || ICONES.info) + '</svg>';
  }

  function notificar(opcoes) {
    preparar();
    var tipo = ICONES[opcoes.tipo] ? opcoes.tipo : 'info';
    var urgente = tipo === 'erro' || tipo === 'aviso';
    var duracao = urgente ? 0 : (typeof opcoes.duracao === 'number' ? opcoes.duracao : DURACAO_PADRAO);

    var toast = document.createElement('div');
    toast.className = 'lc-toast lc-toast--' + tipo;
    toast.innerHTML = svg(tipo);

    var corpo = document.createElement('div');
    corpo.className = 'lc-toast__corpo';
    var titulo = document.createElement('span');
    titulo.className = 'lc-toast__titulo';
    titulo.textContent = opcoes.titulo || '';
    corpo.appendChild(titulo);
    if (opcoes.texto) {
      var texto = document.createElement('span');
      texto.className = 'lc-toast__texto';
      texto.textContent = opcoes.texto;
      corpo.appendChild(texto);
    }
    toast.appendChild(corpo);

    var fechar = document.createElement('button');
    fechar.type = 'button';
    fechar.className = 'lc-toast__fechar';
    fechar.setAttribute('aria-label', 'Fechar notificação: ' + (opcoes.titulo || ''));
    fechar.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8"/></svg>';
    toast.appendChild(fechar);

    var temporizador = null, restante = duracao, inicio = 0, fechada = false;

    function remover() {
      if (fechada) return;
      fechada = true;
      window.clearTimeout(temporizador);
      var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduzido) { toast.remove(); return; }
      toast.classList.add('is-saindo');
      toast.addEventListener('animationend', function () { toast.remove(); }, { once: true });
      window.setTimeout(function () { toast.remove(); }, 400);
    }
    function contar() {
      if (!duracao || fechada) return;
      inicio = Date.now();
      temporizador = window.setTimeout(remover, restante);
    }
    function pausar() {
      if (!duracao || fechada) return;
      window.clearTimeout(temporizador);
      restante = Math.max(800, restante - (Date.now() - inicio));
    }

    fechar.addEventListener('click', remover);
    toast.addEventListener('mouseenter', pausar);
    toast.addEventListener('mouseleave', contar);
    toast.addEventListener('focusin', pausar);
    toast.addEventListener('focusout', function (evento) { if (!toast.contains(evento.relatedTarget)) contar(); });

    pilha.appendChild(toast);
    while (pilha.children.length > MAXIMO) pilha.firstElementChild.remove();
    anunciar(urgente ? regiaoUrgente : regiaoCalma, (opcoes.titulo || '') + (opcoes.texto ? '. ' + opcoes.texto : ''));
    contar();

    return { fechar: remover };
  }

  window.LunarCeler = window.LunarCeler || {};
  window.LunarCeler.notificar = notificar;
})();
