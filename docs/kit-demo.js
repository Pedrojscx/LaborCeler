/* Liga os componentes da página de demonstração do kit (docs/kit-demo.html). */
(function () {
  'use strict';
  var LC = window.LunarCeler;
  LC.luaRede(document.querySelector('[data-lua-rede]'));
  LC.abas(document.querySelector('[data-abas]'));
  LC.formularios(document);

  var exemplos = {
    sucesso: { titulo: 'Conta criada', texto: 'Boas-vindas ao Lunar Celer. Sua conta está pronta.' },
    conquista: { titulo: 'Conquista desbloqueada', texto: 'Primeira órbita: você concluiu sua primeira revisão.' },
    erro: { titulo: 'Não foi possível salvar', texto: 'A revisão deste cartão não foi registrada. Tente de novo.' }
  };
  document.querySelectorAll('[data-notificar]').forEach(function (botao) {
    botao.addEventListener('click', function () {
      var tipo = botao.getAttribute('data-notificar');
      LC.notificar({ tipo: tipo, titulo: exemplos[tipo].titulo, texto: exemplos[tipo].texto });
    });
  });

  LC.cronometro(document.querySelector('[data-cronometro]'), {
    restante: 40, total: 150,
    aoTerminar: function () { LC.notificar({ tipo: 'aviso', titulo: 'O tempo acabou', texto: 'Na tela real, o servidor encerra a questão.' }); }
  });

  var cartao = document.querySelector('[data-flashcard]');
  var virar = document.querySelector('[data-virar]');
  virar.addEventListener('click', function () {
    var virado = cartao.classList.toggle('is-virado');
    virar.textContent = virado ? 'Ver a pergunta' : 'Mostrar resposta';
  });
})();
