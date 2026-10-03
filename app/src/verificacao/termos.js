const fs = require('node:fs');
const path = require('node:path');

// Marcador do contato dos termos enquanto o e-mail do projeto não existir (P-01, FR-012a, FR-012b,
// research R15). Constante única: a página e as verificações usam sempre o mesmo texto.
const MARCADOR_EMAIL_TERMOS = '[E-mail do projeto pendente: P-01]';

const MENSAGEM_MARCADOR =
  'Termos com marcador de e-mail: a publicação será bloqueada até P-01 da 002 ser resolvida';

const CAMINHO_TERMOS = path.resolve(__dirname, '../../public/termos.html');

const MAILTO_VALIDO = /mailto:[^\s"'<>@?]+@[^\s"'<>@?]+\.[A-Za-z]{2,}/;

// { existe, marcador, mailto }: a página deve ter o marcador ou um mailto: válido, nunca os dois
// nem nenhum (conferido pelos testes da US2 e pelo validar-002.sh).
function verificarTermos(caminho = CAMINHO_TERMOS) {
  let html;
  try {
    html = fs.readFileSync(caminho, 'utf8');
  } catch (erro) {
    if (erro.code === 'ENOENT') return { existe: false, marcador: false, mailto: false };
    throw erro;
  }
  return {
    existe: true,
    marcador: html.includes(MARCADOR_EMAIL_TERMOS),
    mailto: MAILTO_VALIDO.test(html),
  };
}

module.exports = { MARCADOR_EMAIL_TERMOS, MENSAGEM_MARCADOR, CAMINHO_TERMOS, verificarTermos };
