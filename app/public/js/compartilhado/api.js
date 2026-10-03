/*
 * Pedidos à API do portal e erros por campo (FR-014, FR-018).
 *
 * Uso:
 *   LunarCeler.api.enviar('POST', '/api/auth/login', { cpf: cpf, senha: senha })
 *     .then(function (resultado) { ... resultado.status, resultado.corpo ... });
 *   LunarCeler.api.mostrarErros(formulario, resultado.corpo);
 *   LunarCeler.api.limparErros(formulario);
 *
 * Sempre JSON e mesma origem (o servidor recusa outro formato e outra origem). Em 401 de uma rota
 * autenticada, leva a /entrar?motivo=expirada. Sem nenhuma resposta (falha de rede), devolve
 * status 0 com a mensagem do FR-030a. Mensagens entram com textContent, nunca como HTML.
 */
(function () {
  'use strict';

  // Rotas em que 401 significa "sessão ausente ou vencida" (no login, 401 é senha errada).
  var ROTAS_AUTENTICADAS = ['/api/auth/me'];
  // Status 0 quase sempre é a conexão de quem usa, não o portal: por isso não é a mensagem de
  // instabilidade do FR-030 (FR-030a).
  var SEM_CONEXAO = { erro: 'Não foi possível conectar ao portal. Confira sua internet e tente de novo.' };

  function enviar(metodo, endereco, corpo) {
    var opcoes = {
      method: metodo,
      credentials: 'same-origin',
      headers: { Accept: 'application/json' }
    };
    if (corpo !== undefined) {
      opcoes.headers['Content-Type'] = 'application/json';
      opcoes.body = JSON.stringify(corpo);
    }
    return fetch(endereco, opcoes)
      .then(function (resposta) {
        if (resposta.status === 401 && ROTAS_AUTENTICADAS.indexOf(endereco) !== -1) {
          window.location.assign('/entrar?motivo=expirada');
        }
        return resposta.json()
          .catch(function () { return {}; })
          .then(function (dados) { return { status: resposta.status, corpo: dados }; });
      })
      .catch(function () { return { status: 0, corpo: SEM_CONEXAO }; });
  }

  // A mensagem de cada campo fica num elemento com data-erro-campo="<nome do campo>" e um id;
  // o campo com erro passa a apontar para ele por aria-describedby e fica com aria-invalid.
  function limparErros(formulario) {
    formulario.querySelectorAll('[aria-invalid="true"]').forEach(function (campo) {
      campo.removeAttribute('aria-invalid');
    });
    formulario.querySelectorAll('[data-erro-campo]').forEach(function (mensagem) {
      mensagem.textContent = '';
      mensagem.hidden = true;
    });
  }

  function mostrarErros(formulario, corpo) {
    limparErros(formulario);
    var campos = (corpo && corpo.campos) || {};
    var primeiro = null;
    Object.keys(campos).forEach(function (nome) {
      var campo = formulario.elements.namedItem(nome);
      var mensagem = formulario.querySelector('[data-erro-campo="' + nome + '"]');
      if (!campo || !mensagem) return;
      mensagem.textContent = campos[nome];
      mensagem.hidden = false;
      campo.setAttribute('aria-invalid', 'true');
      var descritos = (campo.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (descritos.indexOf(mensagem.id) === -1) {
        descritos.push(mensagem.id);
        campo.setAttribute('aria-describedby', descritos.join(' '));
      }
      if (!primeiro) primeiro = campo;
    });
    if (primeiro) primeiro.focus();
    return primeiro !== null;
  }

  window.LunarCeler = window.LunarCeler || {};
  window.LunarCeler.api = { enviar: enviar, mostrarErros: mostrarErros, limparErros: limparErros };
})();
