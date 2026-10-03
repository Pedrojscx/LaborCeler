#!/usr/bin/env bash
# ============================================================
# Validação das propostas de modelo de dados no PostgreSQL 16 do docker compose
# Features 003, 004 (com a 005), 006 e 007: as mesmas verificações feitas no PGlite
# (PostgreSQL 18), lendo os blocos SQL das propostas como estão.
#
# Roda num projeto do Compose próprio ("validarpropostas"): sobe só o banco (imagem
# postgres:16 do docker-compose.yml) e roda o script de validação na imagem do app, que já
# tem o Node e o driver pg. Não toca nos seus containers, no seu volume nem no banco
# bdcertificacao. Cada conjunto de verificações cria e apaga o próprio banco descartável.
# No fim, apaga o projeto de validação (containers, volume e a imagem montada do app).
#
# Uso:
#   scripts/validar-propostas-pg16.sh [conjuntos]
#     conjuntos  lista separada por vírgula (padrão: 003,004,005,006,007)
#   Variável opcional:
#     MANTER=1   não apaga o projeto de validação no fim;
#                depois: docker compose -p validarpropostas down -v --rmi local
#
# Requisitos: bash e Docker com Compose (README, Pré-requisitos).
# Saída: uma linha ok/FALHA por verificação e o resumo por feature; código 0 só se todas
# passarem. Para devolver a saída: scripts/validar-propostas-pg16.sh 2>&1 | tee saida-pg16.txt
# ============================================================

set -uo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJETO="validarpropostas"
CONJUNTOS="${1:-003,004,005,006,007}"
compose() { docker compose -p "$PROJETO" -f "$RAIZ/docker-compose.yml" --project-directory "$RAIZ" "$@"; }

limpar() {
  if [ "${MANTER:-0}" = "1" ]; then
    printf '\nProjeto mantido. Para apagar: docker compose -p %s down -v --rmi local\n' "$PROJETO"
  else
    # --rmi local: apaga só a imagem montada para este projeto (validarpropostas-app);
    # a postgres:16, que tem nome próprio e é usada pelo projeto principal, fica
    compose down -v --remove-orphans --rmi local >/dev/null 2>&1
  fi
}
trap limpar EXIT

printf '== Subindo o banco PostgreSQL 16 do projeto de validação\n'
if ! compose up -d --wait db; then
  printf 'FALHA  o banco do projeto de validação não ficou pronto\n'
  exit 1
fi

printf '\n== Montando a imagem do app (Node e driver pg)\n'
if ! compose build app >/dev/null; then
  printf 'FALHA  não foi possível montar a imagem do app\n'
  exit 1
fi

printf '\n== Rodando as verificações (%s)\n' "$CONJUNTOS"
compose run --rm --no-deps -T \
  -v "$RAIZ:/repo:ro" \
  -e NODE_PATH=/app/node_modules \
  -e RAIZ_REPO=/repo \
  app node /repo/scripts/validacao/validar-propostas.cjs "$CONJUNTOS"
