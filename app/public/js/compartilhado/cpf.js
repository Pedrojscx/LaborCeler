/*
 * Validação de CPF num só lugar (FR-006, research R10): o navegador usa para avisar antes de
 * enviar, e o servidor usa de novo, porque só a validação dele vale.
 *
 * Navegador: LunarCeler.cpf.validarCpf('529.982.247-25')
 * Node:      const { validarCpf } = require('../public/js/compartilhado/cpf');
 */
(function (raiz, fabrica) {
  'use strict';
  var cpf = fabrica();
  if (typeof module === 'object' && module.exports) {
    module.exports = cpf;
  } else {
    raiz.LunarCeler = raiz.LunarCeler || {};
    raiz.LunarCeler.cpf = cpf;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Aceita só dígitos, pontos, traço e espaços; qualquer outro caractere torna o CPF inválido.
  function normalizarCpf(valor) {
    var texto = String(valor == null ? '' : valor).trim();
    if (!/^[\d.\-\s]*$/.test(texto)) return null;
    var digitos = texto.replace(/\D/g, '');
    return digitos.length === 11 ? digitos : null;
  }

  function digitoVerificador(digitos, tamanho) {
    var soma = 0;
    for (var i = 0; i < tamanho; i++) soma += Number(digitos[i]) * (tamanho + 1 - i);
    var resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  }

  // Devolve os 11 dígitos se o CPF for válido; senão, null.
  function validarCpf(valor) {
    var digitos = normalizarCpf(valor);
    if (!digitos || /^(\d)\1{10}$/.test(digitos)) return null;
    if (digitoVerificador(digitos, 9) !== Number(digitos[9])) return null;
    if (digitoVerificador(digitos, 10) !== Number(digitos[10])) return null;
    return digitos;
  }

  function formatarCpf(valor) {
    var digitos = normalizarCpf(valor);
    if (!digitos) return String(valor == null ? '' : valor);
    return digitos.slice(0, 3) + '.' + digitos.slice(3, 6) + '.' + digitos.slice(6, 9) + '-' + digitos.slice(9);
  }

  return { normalizarCpf: normalizarCpf, validarCpf: validarCpf, formatarCpf: formatarCpf };
});
