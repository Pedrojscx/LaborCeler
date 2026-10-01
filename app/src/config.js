// Lê as variáveis de ambiente com padrões de desenvolvimento, para que o projeto suba sem .env
// (FR-015). JWT_SECRET não é lida aqui: entra na feature 002 (research P1).

const porta = Number(process.env.PORT) || 3000;

// Sem PUBLIC_BASE_URL, o endereço público acompanha a porta (research R9).
const urlPublica = process.env.PUBLIC_BASE_URL || `http://localhost:${porta}`;

const urlBanco =
  process.env.DATABASE_URL || 'postgres://portal:portal@db:5432/bdcertificacao';

module.exports = { porta, urlPublica, urlBanco };
