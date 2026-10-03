// Roda no fim do "npm test" (FR-012b, SC-017, research R15): com o marcador do e-mail nos termos,
// imprime um aviso em destaque. Nunca muda o resultado: o script npm sai com o código dos testes.
// A falha de verdade fica no scripts/validar-002.sh, obrigatório para publicar.

const { verificarTermos, MENSAGEM_MARCADOR } = require('./termos');

const LINHA = '='.repeat(78);

try {
  if (verificarTermos().marcador) {
    console.log(`\n${LINHA}\n  AVISO: ${MENSAGEM_MARCADOR}\n${LINHA}\n`);
  }
} catch (erro) {
  console.log(`\nAviso dos termos não verificado: ${erro.message}\n`);
}

process.exitCode = 0;
