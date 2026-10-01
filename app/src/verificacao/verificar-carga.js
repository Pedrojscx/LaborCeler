// Verificação automatizada da carga inicial (FR-016, research R11).
// Confere as regras de FR-004 a FR-008 que o esquema não garante sozinho (data-model.md,
// "Regras garantidas pelo banco vs. pela verificação") e se os arquivos de imagem existem.
// Requisitos: RP06, RF05, RF06, RF07, RF08, RP04.

const fs = require('node:fs');
const path = require('node:path');

// Pasta pública resolvida a partir deste módulo, nunca do diretório de trabalho (research R8).
const PASTA_PUBLICA_PADRAO = path.resolve(__dirname, '../../public');

// Nomes e ordem definitivos dos temas (FR-009, dossiê seção 6).
const TEMAS_OFICIAIS = Object.freeze([
  'Fundamentos da Agilidade',
  'Manifesto Ágil',
  'Introdução ao Scrum',
  'Papéis do Scrum',
  'Eventos do Scrum',
  'Artefatos do Scrum',
  'User Stories',
  'Gestão do Product Backlog',
  'Kanban',
  'Planejamento Ágil',
  'Métricas Ágeis',
  'Qualidade em Projetos Ágeis',
]);

const QUESTOES_POR_TEMA = 4;
const LETRAS = 'ABCD';
const TABELAS_DE_USO = ['tbcandidato', 'tbcertificacao', 'tbcertificado', 'tbresposta'];

function consulta(nome, sql) {
  return Object.freeze({ nome, sql });
}

// Cada consulta tem um nome, para que um consultar falso (testes) responda por nome sem
// interpretar o SQL. Nenhuma recebe dados externos, então não há parâmetros.
const CONSULTAS = Object.freeze({
  temas: consulta('temas', 'select id, ordem, nome, descricao from tbtema order by ordem, id'),
  questoes: consulta('questoes', 'select id, idtema, idimagem, enunciado from tbquestao order by id'),
  alternativas: consulta(
    'alternativas',
    'select idquestao, letra, correta from tbalternativa order by idquestao, letra',
  ),
  materiais: consulta('materiais', 'select id, idtema from tbmaterial order by id'),
  imagens: consulta('imagens', 'select id, arquivo, texto_alternativo from tbimagem order by id'),
  tabelasUso: consulta(
    'tabelasUso',
    `select
       (select count(*) from tbcandidato)::int as tbcandidato,
       (select count(*) from tbcertificacao)::int as tbcertificacao,
       (select count(*) from tbcertificado)::int as tbcertificado,
       (select count(*) from tbresposta)::int as tbresposta`,
  ),
  provisorio: consulta(
    'provisorio',
    `select
       (select count(*) from tbquestao where enunciado like '[PROVISÓRIO]%')::int as questoes,
       (select count(*) from tbmaterial where titulo like '[PROVISÓRIO]%')::int as materiais,
       (select count(*) from tbimagem where credito like '[PROVISÓRIO]%')::int as imagens`,
  ),
});

// Vazio ou só com espaços, quebras de linha ou tabulações.
function vazio(texto) {
  return texto === null || texto === undefined || String(texto).trim() === '';
}

function agruparPor(linhas, campo) {
  const grupos = new Map();
  for (const linha of linhas) {
    if (!grupos.has(linha[campo])) grupos.set(linha[campo], []);
    grupos.get(linha[campo]).push(linha);
  }
  return grupos;
}

// Item de regra: OK sem detalhes; ERRO com a lista do que falhou.
function regra(nome, detalhes, mensagemOk, mensagemErro) {
  return detalhes.length === 0
    ? { regra: nome, nivel: 'OK', mensagem: mensagemOk, detalhes }
    : { regra: nome, nivel: 'ERRO', mensagem: mensagemErro, detalhes };
}

function regraTemas(temas) {
  const detalhes = [];
  if (temas.length !== TEMAS_OFICIAIS.length) {
    detalhes.push(`esperados ${TEMAS_OFICIAIS.length} temas, encontrados ${temas.length}`);
  }
  TEMAS_OFICIAIS.forEach((nomeOficial, indice) => {
    const ordem = indice + 1;
    const tema = temas.find((t) => t.ordem === ordem);
    if (!tema) {
      detalhes.push(`falta o tema de ordem ${ordem} (${nomeOficial})`);
    } else if (tema.nome !== nomeOficial) {
      detalhes.push(`tema ${ordem} com nome "${tema.nome}" (esperado "${nomeOficial}")`);
    }
  });
  for (const tema of temas) {
    if (vazio(tema.descricao)) detalhes.push(`tema ${tema.ordem} com descrição vazia`);
  }
  return regra(
    'temas',
    detalhes,
    '12 temas com ordem de 1 a 12, nomes oficiais e descrição preenchida',
    'temas fora do esperado (12, com ordem de 1 a 12, nomes oficiais e descrição preenchida)',
  );
}

function regraQuestoes(temas, questoes) {
  const detalhes = [];
  const esperadas = TEMAS_OFICIAIS.length * QUESTOES_POR_TEMA;
  if (questoes.length !== esperadas) {
    detalhes.push(`esperadas ${esperadas} questões, encontradas ${questoes.length}`);
  }
  const porTema = agruparPor(questoes, 'idtema');
  for (const tema of temas) {
    const total = (porTema.get(tema.id) || []).length;
    if (total !== QUESTOES_POR_TEMA) detalhes.push(`tema ${tema.ordem} tem ${total} questões`);
  }
  for (const questao of questoes) {
    if (vazio(questao.enunciado)) detalhes.push(`questão ${questao.id} com enunciado vazio`);
  }
  return regra(
    'questoes',
    detalhes,
    `4 questões em cada tema (${questoes.length}), todas com enunciado preenchido`,
    'questões fora do esperado (4 por tema, todas com enunciado preenchido)',
  );
}

function regraAlternativas(questoes, porQuestao, totalAlternativas) {
  const detalhes = [];
  if (questoes.length === 0) detalhes.push('nenhuma questão cadastrada');
  for (const questao of questoes) {
    const alternativas = porQuestao.get(questao.id) || [];
    const letras = alternativas.map((a) => String(a.letra).trim()).sort().join('');
    if (alternativas.length !== LETRAS.length || letras !== LETRAS) {
      detalhes.push(
        `questão ${questao.id} tem ${alternativas.length} alternativas (${letras || 'nenhuma letra'})`,
      );
    }
  }
  return regra(
    'alternativas',
    detalhes,
    `4 alternativas A-D em cada questão (${totalAlternativas})`,
    'alternativas fora do esperado (4 por questão, letras A, B, C e D)',
  );
}

function regraCorretas(questoes, porQuestao) {
  const detalhes = [];
  if (questoes.length === 0) detalhes.push('nenhuma questão cadastrada');
  for (const questao of questoes) {
    const corretas = (porQuestao.get(questao.id) || []).filter((a) => a.correta === true).length;
    if (corretas !== 1) detalhes.push(`questão ${questao.id} tem ${corretas} alternativas corretas`);
  }
  return regra(
    'corretas',
    detalhes,
    'exatamente 1 alternativa correta em cada questão',
    'questões sem exatamente 1 alternativa correta',
  );
}

function regraMateriais(temas, materiais) {
  const detalhes = [];
  if (temas.length === 0) detalhes.push('nenhum tema cadastrado');
  const porTema = agruparPor(materiais, 'idtema');
  for (const tema of temas) {
    if (!porTema.has(tema.id)) detalhes.push(`tema ${tema.ordem} sem material de estudo`);
  }
  return regra(
    'materiais',
    detalhes,
    'pelo menos 1 material em cada tema',
    'temas sem material de estudo',
  );
}

function regraImagens(questoes, imagens) {
  const detalhes = [];
  if (questoes.length === 0) detalhes.push('nenhuma questão cadastrada');
  const imagemPorId = new Map(imagens.map((imagem) => [imagem.id, imagem]));
  for (const [idimagem, usos] of agruparPor(questoes, 'idimagem')) {
    if (usos.length > 1) {
      detalhes.push(`imagem ${idimagem} usada pelas questões ${usos.map((q) => q.id).join(', ')}`);
    }
  }
  for (const questao of questoes) {
    const imagem = imagemPorId.get(questao.idimagem);
    if (!imagem) {
      detalhes.push(`questão ${questao.id} sem imagem`);
    } else if (vazio(imagem.texto_alternativo)) {
      detalhes.push(`imagem ${imagem.id} da questão ${questao.id} sem texto alternativo`);
    }
  }
  return regra(
    'imagens',
    detalhes,
    `${questoes.length} imagens de questão exclusivas, com texto alternativo`,
    'imagens de questão fora do esperado (uma exclusiva por questão, com texto alternativo)',
  );
}

// Caminho da pasta para exibição: relativo à raiz do projeto ("app/public") quando possível.
function descreverPasta(pasta) {
  const relativo = path.relative(path.resolve(__dirname, '../../..'), pasta);
  if (relativo === '' || relativo.startsWith('..') || path.isAbsolute(relativo)) return pasta;
  return relativo.split(path.sep).join('/');
}

function regraArquivos(imagens, pastaPublica) {
  const base = path.resolve(pastaPublica);
  const detalhes = [];
  if (imagens.length === 0) detalhes.push('nenhuma imagem cadastrada');
  for (const imagem of imagens) {
    const destino = path.resolve(base, String(imagem.arquivo));
    if (!destino.startsWith(base + path.sep)) {
      detalhes.push(`caminho fora da pasta pública: ${imagem.arquivo}`);
    } else if (!fs.existsSync(destino) || !fs.statSync(destino).isFile()) {
      detalhes.push(`arquivo ausente: ${imagem.arquivo}`);
    }
  }
  const pasta = descreverPasta(base);
  return regra(
    'arquivos',
    detalhes,
    `${imagens.length} arquivos de imagem encontrados em ${pasta}`,
    `arquivos de imagem com problema em ${pasta}`,
  );
}

// Depois que o portal é usado, as tabelas de uso deixam de estar vazias: AVISO, nunca ERRO.
function regraTabelasUso(contagens) {
  const comDados = TABELAS_DE_USO.filter((tabela) => Number(contagens[tabela]) > 0);
  if (comDados.length === 0) {
    return {
      regra: 'tabelasUso',
      nivel: 'OK',
      mensagem: 'tabelas de uso vazias (nenhum dado pessoal na carga)',
      detalhes: [],
    };
  }
  return {
    regra: 'tabelasUso',
    nivel: 'AVISO',
    mensagem: 'tabelas de uso com dados (esperado depois que o portal é usado)',
    detalhes: comDados.map((tabela) => `${tabela}: ${contagens[tabela]} linha(s)`),
  };
}

// Sempre avisa enquanto houver conteúdo marcado como provisório; some quando as três
// contagens forem zero (checagem antes da entrega final).
function avisoProvisorio(contagens) {
  const questoes = Number(contagens.questoes);
  const materiais = Number(contagens.materiais);
  const imagens = Number(contagens.imagens);
  if (questoes === 0 && materiais === 0 && imagens === 0) return [];
  return [
    {
      regra: 'provisorio',
      nivel: 'AVISO',
      mensagem: `conteúdo provisório: ${questoes} questões, ${materiais} materiais e ${imagens} imagens marcados com [PROVISÓRIO]`,
      detalhes: [],
      contagens: { questoes, materiais, imagens },
    },
  ];
}

// consultar recebe a consulta nomeada inteira ({ nome, sql }) e devolve { rows }.
async function verificarCarga({ consultar, pastaPublica = PASTA_PUBLICA_PADRAO } = {}) {
  const linhas = async (consultaNomeada) => (await consultar(consultaNomeada)).rows;

  const temas = await linhas(CONSULTAS.temas);
  const questoes = await linhas(CONSULTAS.questoes);
  const alternativas = await linhas(CONSULTAS.alternativas);
  const materiais = await linhas(CONSULTAS.materiais);
  const imagens = await linhas(CONSULTAS.imagens);
  const [tabelasUso] = await linhas(CONSULTAS.tabelasUso);
  const [provisorio] = await linhas(CONSULTAS.provisorio);

  const alternativasPorQuestao = agruparPor(alternativas, 'idquestao');

  return [
    regraTemas(temas),
    regraQuestoes(temas, questoes),
    regraAlternativas(questoes, alternativasPorQuestao, alternativas.length),
    regraCorretas(questoes, alternativasPorQuestao),
    regraMateriais(temas, materiais),
    regraImagens(questoes, imagens),
    regraArquivos(imagens, pastaPublica),
    regraTabelasUso(tabelasUso),
    ...avisoProvisorio(provisorio),
  ];
}

module.exports = { verificarCarga, CONSULTAS, TEMAS_OFICIAIS, PASTA_PUBLICA_PADRAO };
