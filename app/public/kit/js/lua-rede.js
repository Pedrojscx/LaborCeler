/*
 * Lunar Celer: Lua em rede (docs/identidade-visual.md, seção 6.2)
 * Esfera de pontos e linhas em Canvas 2D, com rotação 3D lenta.
 * Sem bibliotecas. Pausa com a aba oculta ou fora da tela; parada com redução de movimento.
 *
 * Uso:
 *   <div class="lc-lua-rede" data-lua-rede>
 *     <img src="/kit/img/lua-rede.svg" alt="">
 *     <canvas role="img" aria-label="A Lua desenhada como uma rede de pontos e linhas"></canvas>
 *   </div>
 *   LunarCeler.luaRede(document.querySelector('[data-lua-rede]'));
 */
(function () {
  'use strict';

  function pontosFibonacci(n) {
    var pontos = [];
    for (var i = 0; i < n; i++) {
      var phi = Math.acos(-1 + (2 * i + 1) / n);
      var theta = Math.sqrt(n * Math.PI) * phi;
      pontos.push([Math.cos(theta) * Math.sin(phi), Math.sin(theta) * Math.sin(phi), Math.cos(phi)]);
    }
    return pontos;
  }

  function arestas(pontos, limiar) {
    var lista = [];
    for (var i = 0; i < pontos.length; i++) {
      for (var j = i + 1; j < pontos.length; j++) {
        var dx = pontos[i][0] - pontos[j][0];
        var dy = pontos[i][1] - pontos[j][1];
        var dz = pontos[i][2] - pontos[j][2];
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < limiar) lista.push([i, j]);
      }
    }
    return lista;
  }

  function luaRede(contenedor, opcoes) {
    opcoes = opcoes || {};
    var canvas = contenedor.querySelector('canvas');
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return null; /* sem Canvas: fica a imagem estática */
    var pontos = pontosFibonacci(opcoes.pontos || 110);
    var ligacoes = arestas(pontos, opcoes.limiar || 0.4);
    var velocidade = opcoes.velocidade || 0.00008; /* radianos por milissegundo */
    var inclinacao = opcoes.inclinacao || 0.32;
    var acento = opcoes.acento || '242, 164, 58';
    var angulo = 0.55;
    var dpr = 1, largura = 0, altura = 0;
    var visivelNaTela = true, quadro = null, ultimo = null;
    var movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)');
    var projetados = new Array(pontos.length);

    function dimensionar() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      largura = canvas.clientWidth;
      altura = canvas.clientHeight;
      canvas.width = Math.round(largura * dpr);
      canvas.height = Math.round(altura * dpr);
      desenhar();
    }

    function projetar() {
      var cx = canvas.width / 2, cy = canvas.height / 2;
      var raio = Math.min(canvas.width, canvas.height) * 0.42;
      var cosA = Math.cos(angulo), senA = Math.sin(angulo);
      var cosB = Math.cos(inclinacao), senB = Math.sin(inclinacao);
      for (var i = 0; i < pontos.length; i++) {
        var x = pontos[i][0], y = pontos[i][1], z = pontos[i][2];
        var x1 = x * cosA + z * senA;
        var z1 = -x * senA + z * cosA;
        var y2 = y * cosB - z1 * senB;
        var z2 = y * senB + z1 * cosB;
        var escala = 1 + z2 * 0.12;
        projetados[i] = { x: cx + x1 * raio * escala, y: cy + y2 * raio * escala, z: z2 };
      }
      return raio;
    }

    function desenhar() {
      if (!largura) return;
      var raio = projetar();
      var cx = canvas.width / 2, cy = canvas.height / 2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      var halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, raio * 1.18);
      halo.addColorStop(0, 'rgba(' + acento + ', 0.20)');
      halo.addColorStop(0.6, 'rgba(' + acento + ', 0.06)');
      halo.addColorStop(1, 'rgba(' + acento + ', 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, raio * 1.18, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 0.85 * dpr;
      for (var k = 0; k < ligacoes.length; k++) {
        var a = projetados[ligacoes[k][0]], b = projetados[ligacoes[k][1]];
        var profundidade = (a.z + b.z) / 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.06 + 0.32 * (profundidade + 1) / 2).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      for (var i = 0; i < projetados.length; i++) {
        var p = projetados[i];
        var frente = (p.z + 1) / 2;
        var r = (1.1 + 1.7 * frente) * dpr;
        var destaque = i % 13 === 0 && p.z > 0.2;
        ctx.fillStyle = destaque ? 'rgb(' + acento + ')' : 'rgba(255, 255, 255, ' + (0.25 + 0.65 * frente).toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function passo(agora) {
      if (ultimo !== null) angulo += (agora - ultimo) * velocidade;
      ultimo = agora;
      desenhar();
      quadro = window.requestAnimationFrame(passo);
    }

    function iniciar() {
      if (quadro !== null || movimentoReduzido.matches || document.hidden || !visivelNaTela) return;
      ultimo = null;
      quadro = window.requestAnimationFrame(passo);
    }

    function pausar() {
      if (quadro !== null) window.cancelAnimationFrame(quadro);
      quadro = null;
    }

    function reavaliar() {
      if (movimentoReduzido.matches || document.hidden || !visivelNaTela) { pausar(); desenhar(); }
      else iniciar();
    }

    var observadorTamanho = 'ResizeObserver' in window ? new ResizeObserver(dimensionar) : null;
    if (observadorTamanho) observadorTamanho.observe(canvas); else window.addEventListener('resize', dimensionar);

    var observadorTela = 'IntersectionObserver' in window ? new IntersectionObserver(function (entradas) {
      visivelNaTela = entradas[0].isIntersecting;
      reavaliar();
    }) : null;
    if (observadorTela) observadorTela.observe(contenedor);

    document.addEventListener('visibilitychange', reavaliar);
    if (movimentoReduzido.addEventListener) movimentoReduzido.addEventListener('change', reavaliar);

    dimensionar();
    contenedor.classList.add('is-pronta');
    reavaliar();

    return {
      parar: pausar,
      destruir: function () {
        pausar();
        if (observadorTamanho) observadorTamanho.disconnect(); else window.removeEventListener('resize', dimensionar);
        if (observadorTela) observadorTela.disconnect();
        document.removeEventListener('visibilitychange', reavaliar);
        if (movimentoReduzido.removeEventListener) movimentoReduzido.removeEventListener('change', reavaliar);
      }
    };
  }

  window.LunarCeler = window.LunarCeler || {};
  window.LunarCeler.luaRede = luaRede;
})();
