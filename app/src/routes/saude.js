const express = require('express');
const repositorioPadrao = require('../repositories/conteudo-repository');

// Volume esperado da carga inicial (FR-004 a FR-006).
const CARGA_ESPERADA = { temas: 12, questoes: 48, alternativas: 192 };

function cargaEstaCompleta(resumo) {
  return (
    resumo.temas === CARGA_ESPERADA.temas &&
    resumo.questoes === CARGA_ESPERADA.questoes &&
    resumo.alternativas === CARGA_ESPERADA.alternativas
  );
}

// O rodapé é público e só diz "Conteúdo em atualização."; o que falta na carga vai para o log do
// app, na subida e a cada mudança de estado, sem repetir a cada pedido (FR-004a, research R14).
function criarMonitorCarga(registrar = console.warn) {
  let completaAntes;

  return function observar(resumo) {
    const completa = cargaEstaCompleta(resumo);
    if (completa !== completaAntes) {
      if (!completa) {
        registrar(
          `Aviso: carga incompleta. Esperado ${CARGA_ESPERADA.temas} temas, ` +
            `${CARGA_ESPERADA.questoes} questões e ${CARGA_ESPERADA.alternativas} alternativas; ` +
            `encontrado ${resumo.temas} temas, ${resumo.questoes} questões e ` +
            `${resumo.alternativas} alternativas. Veja "Se a primeira carga falhar" no README.`,
        );
      } else if (completaAntes === false) {
        registrar('Carga completa de novo: 12 temas, 48 questões e 192 alternativas.');
      }
      completaAntes = completa;
    }
    return completa;
  };
}

// GET /api/saude: aplicação no ar, banco conectado e resumo da carga (FR-013 da 001).
// Também é o alvo do healthcheck do serviço app no Compose (research R15 da 001).
function criarRotaSaude(repositorioConteudo = repositorioPadrao, observarCarga = criarMonitorCarga()) {
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
    const cargaCompleta = observarCarga(resumo);

    res.json({ status: 'ok', banco: 'ok', conteudo: { ...resumo, cargaCompleta } });
  });

  return rota;
}

module.exports = { criarRotaSaude, criarMonitorCarga, CARGA_ESPERADA };
