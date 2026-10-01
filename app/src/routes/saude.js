const express = require('express');
const repositorioPadrao = require('../repositories/conteudo-repository');

// Volume esperado da carga inicial (FR-004 a FR-006).
const CARGA_ESPERADA = { temas: 12, questoes: 48, alternativas: 192 };

// GET /api/saude: aplicação no ar, banco conectado e resumo da carga (FR-013).
// Também é o alvo do healthcheck do serviço app no Compose (research R15).
function criarRotaSaude(repositorioConteudo = repositorioPadrao) {
  const rota = express.Router();

  rota.get('/saude', async (req, res) => {
    let resumo;
    try {
      resumo = await repositorioConteudo.obterResumoConteudo();
    } catch (erro) {
      console.error('Banco indisponível:', erro.message);
      return res.status(503).json({ status: 'erro', banco: 'indisponivel' });
    }

    // Calculado na hora, nunca gravado (Princípio IV).
    const cargaCompleta =
      resumo.temas === CARGA_ESPERADA.temas &&
      resumo.questoes === CARGA_ESPERADA.questoes &&
      resumo.alternativas === CARGA_ESPERADA.alternativas;

    res.json({ status: 'ok', banco: 'ok', conteudo: { ...resumo, cargaCompleta } });
  });

  return rota;
}

module.exports = { criarRotaSaude };
