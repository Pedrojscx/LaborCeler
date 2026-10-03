// Lê as variáveis de ambiente com padrões de desenvolvimento, para que o projeto suba sem .env
// (FR-015 da 001). JWT_SECRET não é lida aqui: o segredo da sessão é resolvido na subida por
// seguranca/segredo-sessao.js (research R4 da 002).

const porta = Number(process.env.PORT) || 3000;

// Sem PUBLIC_BASE_URL, o endereço público acompanha a porta (research R9 da 001).
const urlPublica = process.env.PUBLIC_BASE_URL || `http://localhost:${porta}`;

const urlBanco =
  process.env.DATABASE_URL || 'postgres://portal:portal@db:5432/bdcertificacao';

// Secure no cookie e cabeçalhos só-HTTPS apenas quando o endereço público é HTTPS: o acesso
// por HTTP na rede local da apresentação precisa continuar funcionando (research R2, R7).
const cookieSeguro = urlPublica.startsWith('https://');

// Pasta do arquivo do segredo gerado; PASTA_SEGREDO só serve para testes fora do container.
const pastaSegredo = process.env.PASTA_SEGREDO || '/app/segredo';

// Custo do bcrypt em produção; os testes usam 4 (research R5, R16).
const custoBcrypt = 12;

// Números dos dois limites de tentativas, num só lugar (FR-017, FR-017a, research R6).
const limites = {
  falhasCpf: 5,
  janelaCpfMinutos: 15,
  bloqueioCpfMinutos: 15,
  falhasRedePorMinuto: 60,
  janelaRedeMinutos: 1,
};

// Maior tempo de espera entre os dois limites: vai na mensagem e no Retry-After, iguais nos dois
// casos para não revelar qual limite foi atingido (FR-017).
function minutosDeEspera() {
  return Math.max(limites.bloqueioCpfMinutos, limites.janelaRedeMinutos);
}

module.exports = {
  porta,
  urlPublica,
  urlBanco,
  cookieSeguro,
  pastaSegredo,
  custoBcrypt,
  limites,
  minutosDeEspera,
};
