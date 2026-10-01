// Gera as 60 imagens SVG provisórias da carga inicial (FR-009, FR-009a):
//   app/public/img/questoes/temaNN-qK.svg  (NN = 01–12, K = 1–4, 48 arquivos)
//   app/public/img/materiais/temaNN.svg    (12 arquivos)
// Ferramenta de desenvolvimento: não roda na subida do portal; a saída é versionada.
// As imagens são de autoria própria, sem fontes nem imagens externas, e trazem uma faixa
// "PROVISÓRIO" (research R6, R7). Uso: node app/scripts/gerar-svgs-provisorios.js

const fs = require('node:fs');
const path = require('node:path');

// Caminho resolvido a partir do script, nunca do diretório de trabalho (research R8).
const PASTA_IMAGENS = path.resolve(__dirname, '../public/img');

const CORES_QUESTAO = ['#1f4e8c', '#1b6e3a', '#8a4b00', '#6b2f8a'];
const COR_MATERIAL = '#3d4a5c';

// --- Ilustrações geométricas, uma por tema (área útil em torno de 320 x 225) ---

function ciclo(cor) {
  return `
  <g fill="none" stroke="${cor}" stroke-width="14" stroke-linecap="round">
    <path d="M 250 225 A 70 70 0 0 1 390 225"/>
    <path d="M 390 225 A 70 70 0 0 1 250 225"/>
  </g>
  <polygon points="390,252 368,214 412,214" fill="${cor}"/>
  <polygon points="250,198 228,236 272,236" fill="${cor}"/>`;
}

function documento(cor) {
  const linhas = [
    [190, 116],
    [225, 96],
    [260, 116],
    [295, 80],
  ]
    .map(([y, largura]) => `<rect x="262" y="${y - 7}" width="${largura}" height="14" rx="7" fill="${cor}"/>`)
    .join('\n    ');
  return `
  <path d="M 240 130 H 370 L 400 160 V 320 H 240 Z" fill="#ffffff" stroke="${cor}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M 370 130 V 160 H 400" fill="none" stroke="${cor}" stroke-width="6" stroke-linejoin="round"/>
  <g>
    ${linhas}
  </g>`;
}

function sprint(cor) {
  return `
  <circle cx="300" cy="235" r="78" fill="none" stroke="${cor}" stroke-width="12" stroke-dasharray="38 16"/>
  <circle cx="392" cy="162" r="36" fill="${cor}"/>
  <path d="M 376 162 L 388 175 L 409 150" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function pessoas(cor) {
  const pessoa = (x, opacidade) => `
  <g fill="${cor}" fill-opacity="${opacidade}">
    <circle cx="${x}" cy="182" r="26"/>
    <path d="M ${x - 44} 305 A 44 56 0 0 1 ${x + 44} 305 Z"/>
  </g>`;
  return pessoa(230, 0.7) + pessoa(410, 0.7) + pessoa(320, 1);
}

function linhaDoTempo(cor) {
  const marcos = [200, 260, 320, 380, 440]
    .map((x, i) => {
      const preenchido = i === 0 || i === 4 ? cor : '#ffffff';
      return `<circle cx="${x}" cy="225" r="18" fill="${preenchido}" stroke="${cor}" stroke-width="8"/>`;
    })
    .join('\n  ');
  return `
  <line x1="180" y1="225" x2="460" y2="225" stroke="${cor}" stroke-width="8" stroke-linecap="round"/>
  ${marcos}`;
}

function blocos(cor) {
  return `
  <rect x="210" y="145" width="200" height="50" rx="8" fill="${cor}" fill-opacity="0.45"/>
  <rect x="230" y="205" width="200" height="50" rx="8" fill="${cor}" fill-opacity="0.7"/>
  <rect x="250" y="265" width="200" height="50" rx="8" fill="${cor}"/>`;
}

function cartao(cor) {
  return `
  <rect x="210" y="140" width="220" height="165" rx="10" fill="#ffffff" stroke="${cor}" stroke-width="6"/>
  <path d="M 220 140 H 420 A 10 10 0 0 1 430 150 V 178 H 210 V 150 A 10 10 0 0 1 220 140 Z" fill="${cor}"/>
  <g fill="${cor}" fill-opacity="0.45">
    <rect x="232" y="202" width="176" height="12" rx="6"/>
    <rect x="232" y="232" width="150" height="12" rx="6"/>
    <rect x="232" y="262" width="110" height="12" rx="6"/>
  </g>`;
}

function barras(cor) {
  return [220, 180, 140, 100, 60]
    .map((largura, i) => {
      const opacidade = (1 - i * 0.15).toFixed(2);
      return `<rect x="210" y="${140 + i * 34}" width="${largura}" height="24" rx="6" fill="${cor}" fill-opacity="${opacidade}"/>`;
    })
    .map((rect) => `\n  ${rect}`)
    .join('');
}

function kanban(cor) {
  const cartoesPorColuna = [3, 2, 1];
  return [190, 280, 370]
    .map((x, coluna) => {
      const cartoes = Array.from({ length: cartoesPorColuna[coluna] }, (_, i) =>
        `<rect x="${x + 10}" y="${174 + i * 36}" width="60" height="28" rx="4" fill="${cor}" fill-opacity="0.4"/>`,
      ).join('\n    ');
      return `
  <g>
    <rect x="${x}" y="140" width="80" height="170" rx="8" fill="#eef1f5" stroke="#c4ccd6" stroke-width="2"/>
    <rect x="${x}" y="140" width="80" height="24" rx="8" fill="${cor}"/>
    ${cartoes}
  </g>`;
    })
    .join('');
}

function calendario(cor) {
  const marcados = new Set(['0,1', '1,3', '2,0', '3,2']);
  const celulas = [];
  for (let linha = 0; linha < 4; linha += 1) {
    for (let coluna = 0; coluna < 5; coluna += 1) {
      const preenchimento = marcados.has(`${linha},${coluna}`) ? cor : '#dfe5ec';
      celulas.push(
        `<rect x="${238 + coluna * 36}" y="${190 + linha * 28}" width="24" height="18" rx="3" fill="${preenchimento}"/>`,
      );
    }
  }
  return `
  <rect x="220" y="140" width="200" height="170" rx="10" fill="#ffffff" stroke="${cor}" stroke-width="6"/>
  <path d="M 230 140 H 410 A 10 10 0 0 1 420 150 V 174 H 220 V 150 A 10 10 0 0 1 230 140 Z" fill="${cor}"/>
  <rect x="258" y="126" width="10" height="26" rx="5" fill="${cor}"/>
  <rect x="372" y="126" width="10" height="26" rx="5" fill="${cor}"/>
  ${celulas.join('\n  ')}`;
}

function burndown(cor) {
  return `
  <path d="M 210 135 V 305 H 450" fill="none" stroke="#4a5565" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="216" y1="150" x2="440" y2="298" stroke="#9aa5b4" stroke-width="4" stroke-dasharray="10 8"/>
  <polyline points="216,150 258,166 298,200 338,212 378,252 416,276 440,298" fill="none" stroke="${cor}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
}

function escudo(cor) {
  return `
  <path d="M 320 132 L 400 162 V 222 C 400 268 365 298 320 314 C 275 298 240 268 240 222 V 162 Z" fill="${cor}"/>
  <path d="M 285 224 L 312 251 L 360 197" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// Nomes e ordem definitivos (FR-009); a descrição do desenho vai no <title> do SVG.
const TEMAS = [
  { nome: 'Fundamentos da Agilidade', desenhar: ciclo, desenho: 'setas em ciclo representando iterações curtas' },
  { nome: 'Manifesto Ágil', desenhar: documento, desenho: 'documento com quatro linhas destacadas representando os quatro valores' },
  { nome: 'Introdução ao Scrum', desenhar: sprint, desenho: 'ciclo tracejado com um marcador de entrega representando a Sprint' },
  { nome: 'Papéis do Scrum', desenhar: pessoas, desenho: 'três pessoas representando Product Owner, Scrum Master e Developers' },
  { nome: 'Eventos do Scrum', desenhar: linhaDoTempo, desenho: 'linha do tempo com cinco marcos representando os eventos da Sprint' },
  { nome: 'Artefatos do Scrum', desenhar: blocos, desenho: 'três blocos empilhados representando os artefatos do Scrum' },
  { nome: 'User Stories', desenhar: cartao, desenho: 'cartão de história com cabeçalho e linhas de texto' },
  { nome: 'Gestão do Product Backlog', desenhar: barras, desenho: 'barras em ordem decrescente representando a priorização' },
  { nome: 'Kanban', desenhar: kanban, desenho: 'quadro com três colunas e cartões em fluxo' },
  { nome: 'Planejamento Ágil', desenhar: calendario, desenho: 'calendário em grade com dias marcados' },
  { nome: 'Métricas Ágeis', desenhar: burndown, desenho: 'gráfico de burndown com linha descendente' },
  { nome: 'Qualidade em Projetos Ágeis', desenhar: escudo, desenho: 'escudo com marca de verificação' },
];

function escaparXml(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function montarSvg({ titulo, nomeTema, identificacao, ilustracao }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360" width="640" height="360" role="img" aria-labelledby="titulo">
  <title id="titulo">${escaparXml(titulo)}</title>
  <defs>
    <clipPath id="recorte">
      <rect x="16" y="16" width="608" height="328" rx="12"/>
    </clipPath>
  </defs>
  <rect width="640" height="360" fill="#f4f6f8"/>
  <rect x="16" y="16" width="608" height="328" rx="12" fill="#ffffff" stroke="#d5dbe3" stroke-width="2"/>
  <text x="40" y="60" font-family="system-ui, sans-serif" font-size="26" font-weight="700" fill="#1c2430">${escaparXml(nomeTema)}</text>
  <text x="40" y="92" font-family="system-ui, sans-serif" font-size="18" fill="#4a5565">${escaparXml(identificacao)}</text>
  ${ilustracao.trim()}
  <g clip-path="url(#recorte)">
    <g transform="translate(548 76) rotate(35)">
      <rect x="-170" y="-20" width="340" height="40" fill="#b42318"/>
      <text x="0" y="8" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="700" letter-spacing="4" fill="#ffffff">PROVISÓRIO</text>
    </g>
  </g>
</svg>
`;
}

function gravar(caminhoRelativo, conteudo) {
  const destino = path.join(PASTA_IMAGENS, caminhoRelativo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, conteudo, 'utf8');
}

function gerar() {
  let total = 0;

  TEMAS.forEach((tema, indice) => {
    const numero = indice + 1;
    const nn = String(numero).padStart(2, '0');

    for (let k = 1; k <= 4; k += 1) {
      gravar(
        `questoes/tema${nn}-q${k}.svg`,
        montarSvg({
          titulo: `Ilustração provisória da questão ${k} do tema ${numero}, ${tema.nome}: ${tema.desenho}`,
          nomeTema: tema.nome,
          identificacao: `Tema ${nn} · Questão ${k} de 4`,
          ilustracao: tema.desenhar(CORES_QUESTAO[k - 1]),
        }),
      );
      total += 1;
    }

    gravar(
      `materiais/tema${nn}.svg`,
      montarSvg({
        titulo: `Ilustração provisória do material de estudo do tema ${numero}, ${tema.nome}: ${tema.desenho}`,
        nomeTema: tema.nome,
        identificacao: `Tema ${nn} · Material de estudo`,
        ilustracao: tema.desenhar(COR_MATERIAL),
      }),
    );
    total += 1;
  });

  console.log(`${total} imagens SVG geradas em ${path.relative(process.cwd(), PASTA_IMAGENS) || '.'}`);
}

gerar();
