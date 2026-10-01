// Página inicial: consulta GET /api/saude e mostra o estado do portal (FR-013).
// JavaScript puro, sem frameworks (Princípio II).

function definirStatus(idItem, idValor, estado, texto) {
  document.getElementById(idItem).dataset.estado = estado;
  document.getElementById(idValor).textContent = texto;
}

function mostrarConteudo(conteudo) {
  document.getElementById('contagem-temas').textContent = conteudo.temas;
  document.getElementById('contagem-questoes').textContent = conteudo.questoes;
  document.getElementById('contagem-alternativas').textContent = conteudo.alternativas;
  document.getElementById('contagem-materiais').textContent = conteudo.materiais;
  document.getElementById('resumo-conteudo').hidden = false;
  document.getElementById('nota-provisorio').hidden = !conteudo.provisorio;
  document.getElementById('alerta-carga').hidden = conteudo.cargaCompleta;
}

function mostrarErro(mensagem) {
  const elemento = document.getElementById('mensagem-erro');
  elemento.textContent = mensagem;
  elemento.hidden = false;
}

async function carregarSaude() {
  let resposta;
  try {
    resposta = await fetch('/api/saude', { headers: { Accept: 'application/json' } });
  } catch {
    definirStatus('status-aplicacao', 'valor-aplicacao', 'indisponivel', 'Sem resposta');
    definirStatus('status-banco', 'valor-banco', 'indisponivel', 'Desconhecido');
    mostrarErro('Não foi possível falar com o portal. Verifique se ele está no ar e tente de novo.');
    return;
  }

  definirStatus('status-aplicacao', 'valor-aplicacao', 'ok', 'Portal no ar');

  if (resposta.status === 503) {
    definirStatus('status-banco', 'valor-banco', 'indisponivel', 'Banco indisponível');
    return;
  }

  if (!resposta.ok) {
    definirStatus('status-banco', 'valor-banco', 'indisponivel', 'Desconhecido');
    mostrarErro(`Resposta inesperada do portal (HTTP ${resposta.status}).`);
    return;
  }

  const saude = await resposta.json();
  definirStatus('status-banco', 'valor-banco', 'ok', 'Banco conectado');
  mostrarConteudo(saude.conteudo);
}

carregarSaude();
