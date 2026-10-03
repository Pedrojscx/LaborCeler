const fs = require('node:fs');
const path = require('node:path');
const express = require('express');

// Destinos ainda não entregues → página "Disponível em breve" (FR-024, FR-050, tela 6, research
// R9). Tabela única: cada feature, ao ser entregue, remove a sua linha e liga a rota real.
// Título e texto são constantes daqui (textos do protótipo EmBreve), nunca dados do pedido.

const ESTUDOS = {
  titulo: 'A área de estudos está a caminho',
  texto: 'Os materiais e os flashcards dos 12 temas chegam numa próxima versão do Lunar Celer.',
};
const VALIDACAO = {
  titulo: 'A validação está a caminho',
  texto: 'A conferência pública de certificados chega numa próxima versão do Lunar Celer.',
};

const DESTINOS = [
  { endereco: '/estudos', ...ESTUDOS, exigeSessao: false, saiCom: '003' },
  { endereco: '/estudos/:tema', ...ESTUDOS, exigeSessao: false, saiCom: '003' },
  {
    endereco: '/certificacao/inicio',
    titulo: 'A certificação está a caminho',
    texto: 'As questões dos 12 temas chegam numa próxima versão. Enquanto isso, sua conta já está pronta.',
    exigeSessao: true,
    saiCom: '004',
  },
  { endereco: '/validar', ...VALIDACAO, exigeSessao: false, saiCom: '005' },
  { endereco: '/validar/:codigo', ...VALIDACAO, exigeSessao: false, saiCom: '005' },
  {
    endereco: '/flashcards',
    titulo: 'Os flashcards estão a caminho',
    texto: 'A revisão dos 12 temas com cartões de pergunta e resposta chega numa próxima versão do Lunar Celer.',
    exigeSessao: false,
    saiCom: '007',
  },
  {
    endereco: '/perfil',
    titulo: 'O perfil está a caminho',
    texto: 'Sua evolução nos estudos e as suas conquistas chegam numa próxima versão do Lunar Celer.',
    exigeSessao: true,
    saiCom: '007',
  },
];

const ARQUIVO_MODELO = 'em-breve.html';

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

function escaparHtml(texto) {
  return String(texto).replace(/[&<>"']/g, (caractere) => ESCAPES[caractere]);
}

function preencher(modelo, { titulo, texto }) {
  return modelo.split('__TITULO__').join(escaparHtml(titulo)).split('__TEXTO__').join(escaparHtml(texto));
}

// exigirSessaoPagina: middleware de páginas (302 para /entrar sem sessão).
function criarRotaDestinosProvisorios({ pastaPublica, exigirSessaoPagina }) {
  const rota = express.Router();
  let modelo;

  function entregar(destino) {
    return (req, res) => {
      // Lido uma vez, na primeira entrega.
      modelo ??= fs.readFileSync(path.join(pastaPublica, ARQUIVO_MODELO), 'utf8');
      res.set('Cache-Control', 'no-store');
      res.type('html').send(preencher(modelo, destino));
    };
  }

  for (const destino of DESTINOS) {
    const etapas = destino.exigeSessao ? [exigirSessaoPagina] : [];
    rota.get(destino.endereco, ...etapas, entregar(destino));
  }

  return rota;
}

module.exports = { criarRotaDestinosProvisorios, DESTINOS, ARQUIVO_MODELO, escaparHtml };
