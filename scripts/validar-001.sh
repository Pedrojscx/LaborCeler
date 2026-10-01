#!/usr/bin/env bash
# ============================================================
# Validação final da feature 001 antes da entrega
# Tarefas adiadas: T037 (casos-limite, cenário 5 do quickstart) e a medição completa do
# T038 (clone limpo cronometrado com a carga completa, cenários 1 e 2).
#
# Roda em um CLONE LIMPO, numa pasta temporária e com nome de projeto próprio
# ("validar001"): não toca no banco, nos containers nem nos arquivos da sua cópia de trabalho.
# No fim, apaga o projeto de validação (containers e volume) e a pasta temporária.
#
# Uso:
#   scripts/validar-001.sh [origem-do-clone]
#     origem-do-clone  URL ou caminho do repositório (padrão: este repositório local, no
#                      branch que estiver ativo nele)
#   Variáveis opcionais:
#     PORTA=3100       porta do portal na validação (diferente de 3000 de propósito: cobre o
#                      caso "porta ocupada" e não conflita com uma instância já rodando)
#     MANTER=1         não apaga nada no fim, para conferir a página "Carga incompleta" no
#                      navegador; depois: docker compose -p validar001 down -v
#
# Para cronometrar "sem cache", como numa máquina nova, remova antes as imagens base:
#   docker image rm postgres:16 node:24-bookworm-slim
# O script não faz isso sozinho porque essas imagens podem ser usadas por outros projetos.
#
# Requisitos: bash, git, curl e Docker com Compose (README, Pré-requisitos).
# Saída: uma linha OK/FALHA por verificação; código 0 só se todas passarem.
# ============================================================

set -uo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ORIGEM="${1:-$RAIZ}"
PORTA="${PORTA:-3100}"
PROJETO="validar001"
URL="http://localhost:${PORTA}"
PASTA_TEMP="$(mktemp -d -t validar-001-XXXXXX)"
CLONE="$PASTA_TEMP/portal"
LIMITE_SC001=600   # SC-001: até 10 minutos
falhas=0

# O Compose lê PORT na interpolação; PUBLIC_BASE_URL fica sem valor e o app a deriva da porta.
export PORT="$PORTA"
unset PUBLIC_BASE_URL

ok() { printf 'OK     %s\n' "$1"; }
falha() { printf 'FALHA  %s\n' "$1"; falhas=$((falhas + 1)); }
etapa() { printf '\n== %s\n' "$1"; }

# conferir "descrição" comando [args...]: OK se o comando terminar com 0
conferir() {
  local descricao="$1"
  shift
  if "$@" >/dev/null 2>&1; then ok "$descricao"; else falha "$descricao"; fi
}

# esperar <segundos> comando [args...]: repete até o comando passar ou o tempo acabar
esperar() {
  local fim=$((SECONDS + $1))
  shift
  until "$@" >/dev/null 2>&1; do
    [ "$SECONDS" -ge "$fim" ] && return 1
    sleep 2
  done
}

compose() { docker compose -p "$PROJETO" "$@"; }

saude_contem() { curl -s "$URL/api/saude" | grep -q "$1"; }
status_saude_e() { [ "$(curl -s -o /dev/null -w '%{http_code}' "$URL/api/saude")" = "$1" ]; }
app_esta() { [ "$(docker inspect -f '{{.State.Health.Status}}' "$(compose ps -q app)")" = "$1" ]; }
log_contem() { compose logs "$1" 2>&1 | grep -q "$2"; }
imagem_svg_ok() {
  [ "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$URL/img/questoes/tema07-q2.svg")" = "200 image/svg+xml" ]
}
verificacao_sai_com() {
  compose exec -T app npm run --silent verificar-carga >/dev/null 2>&1
  [ "$?" -eq "$1" ]
}
testes_passam_sem_skip() {
  local saida
  saida="$(compose exec -T app node --test --test-reporter=tap "test/**/*.test.js" 2>&1)" || return 1
  grep -q '^# fail 0' <<<"$saida" && grep -q '^# skipped 0' <<<"$saida"
}

limpar() {
  if [ "${MANTER:-0}" = "1" ]; then
    printf '\nMANTER=1: projeto %s e pasta %s preservados.\n' "$PROJETO" "$CLONE"
    printf 'Para apagar: (cd %s && docker compose -p %s down -v) && rm -rf %s\n' \
      "$CLONE" "$PROJETO" "$PASTA_TEMP"
    return
  fi
  if [ -d "$CLONE" ]; then (cd "$CLONE" && compose down -v --remove-orphans >/dev/null 2>&1); fi
  rm -rf "$PASTA_TEMP"
}
trap limpar EXIT

# ------------------------------------------------------------
etapa "T038: clone limpo cronometrado (cenários 1 e 2)"
# ------------------------------------------------------------
if ! git clone --quiet "$ORIGEM" "$CLONE"; then
  falha "git clone de $ORIGEM"
  exit 1
fi
cd "$CLONE" || exit 1
printf 'clone: %s (%s)\n' "$ORIGEM" "$(git log -1 --format='%h %s')"
conferir "clone sem .env nem docker-compose.override.yml" test ! -e .env -a ! -e docker-compose.override.yml

inicio=$SECONDS
if compose up -d --build --wait; then
  duracao=$((SECONDS - inicio))
  if [ "$duracao" -le "$LIMITE_SC001" ]; then
    ok "subida com um comando em ${duracao}s (SC-001: até ${LIMITE_SC001}s)"
  else
    falha "subida em ${duracao}s, acima do limite de ${LIMITE_SC001}s (SC-001)"
  fi
else
  falha "docker compose up -d --build --wait no clone limpo"
  compose logs --tail 40
  exit 1
fi

conferir "/api/saude: status ok e banco ok" saude_contem '"status":"ok","banco":"ok"'
conferir "/api/saude: 12 temas, 48 questões, 192 alternativas" \
  saude_contem '"temas":12,"questoes":48,"alternativas":192'
conferir "/api/saude: cargaCompleta true" saude_contem '"cargaCompleta":true'
conferir "página inicial servida" bash -c "curl -s '$URL/' | grep -q 'Portal de Certificação'"
conferir "SVG tema07-q2 servido como image/svg+xml" imagem_svg_ok
conferir "verificar-carga termina com código 0" verificacao_sai_com 0
conferir "npm test: nenhuma falha e nenhum skip" testes_passam_sem_skip

# ------------------------------------------------------------
etapa "T037: porta alternativa (cenário 5, porta ocupada)"
# ------------------------------------------------------------
conferir "portal respondendo em $URL" status_saude_e 200
conferir "log do app mostra 'Portal no ar em $URL'" log_contem app "Portal no ar em $URL"

# ------------------------------------------------------------
etapa "T037: banco fora do ar e de volta (cenário 5)"
# ------------------------------------------------------------
compose stop db >/dev/null 2>&1
conferir "com o banco parado, /api/saude responde 503" esperar 30 status_saude_e 503
conferir "com o banco parado, o app fica unhealthy" esperar 90 app_esta unhealthy
compose start db >/dev/null 2>&1
conferir "com o banco de volta, /api/saude responde 200 sem reiniciar o app" esperar 90 status_saude_e 200
conferir "com o banco de volta, o app volta a healthy" esperar 90 app_esta healthy

# ------------------------------------------------------------
etapa "T037: carga com erro e nova subida sem -v (cenário 5)"
# ------------------------------------------------------------
SEED=db/03-seed-questoes.sql
ALTERNATIVA="(1, 1, 'A', 'Planejar todo o projeto em detalhe antes de iniciar a construção.'"
sed -i "s/${ALTERNATIVA}, false)/${ALTERNATIVA}, true)/" "$SEED"
if ! grep -qF "${ALTERNATIVA}, true)" "$SEED"; then
  falha "não foi possível inserir a segunda alternativa correta em $SEED (o seed mudou?)"
else
  compose down -v >/dev/null 2>&1
  if compose up -d --build --wait >/dev/null 2>&1; then
    falha "a subida com a carga inválida deveria falhar"
  else
    ok "a subida com a carga inválida falha"
  fi
  conferir "o log do db cita ux_alternativa_correta" log_contem db ux_alternativa_correta

  if compose up -d --build --wait >/dev/null 2>&1; then
    ok "nova subida sem -v: initdb pulado e app no ar"
    conferir "/api/saude: cargaCompleta false, 12 temas e 0 questões" \
      saude_contem '"temas":12,"questoes":0'
    conferir "/api/saude: cargaCompleta false" saude_contem '"cargaCompleta":false'
    conferir "verificar-carga termina com código 1" verificacao_sai_com 1
    printf 'conferir no navegador: %s mostra "Carga incompleta" (rode com MANTER=1)\n' "$URL"
  else
    falha "nova subida sem -v"
    compose logs --tail 40 db
  fi
fi
git checkout --quiet -- "$SEED"

# ------------------------------------------------------------
printf '\n'
if [ "$falhas" -eq 0 ]; then
  printf 'Validação final da 001: todas as verificações passaram.\n'
  exit 0
fi
printf 'Validação final da 001: %d verificação(ões) com FALHA.\n' "$falhas"
exit 1
