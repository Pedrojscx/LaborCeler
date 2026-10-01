const { consultar } = require('../db');

// Contagens do conteúdo carregado e se ainda há marca de provisório (FR-009, FR-013).
// Sem dados externos: nada a parametrizar.
const SQL_RESUMO_CONTEUDO = `
  select
    (select count(*) from tbtema) as temas,
    (select count(*) from tbquestao) as questoes,
    (select count(*) from tbalternativa) as alternativas,
    (select count(*) from tbmaterial) as materiais,
    (
      exists (select 1 from tbquestao where enunciado like '[PROVISÓRIO]%')
      or exists (select 1 from tbmaterial where titulo like '[PROVISÓRIO]%')
      or exists (select 1 from tbimagem where credito like '[PROVISÓRIO]%')
    ) as provisorio
`;

async function obterResumoConteudo() {
  const { rows } = await consultar(SQL_RESUMO_CONTEUDO);
  const linha = rows[0];

  // O pg devolve count(*) (bigint) como texto.
  return {
    temas: Number(linha.temas),
    questoes: Number(linha.questoes),
    alternativas: Number(linha.alternativas),
    materiais: Number(linha.materiais),
    provisorio: linha.provisorio,
  };
}

module.exports = { obterResumoConteudo };
