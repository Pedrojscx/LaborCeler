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

relativo() { printf '%s\n' "${1#"$RAIZ"/}"; }

# ------------------------------------------------------------
# Checagens antes de subir qualquer coisa
# ------------------------------------------------------------
printf '== Conferindo o ambiente\n'

if ! command -v docker >/dev/null 2>&1; then
  printf 'FALHA  o comando docker não foi encontrado; instale o Docker (README, Pré-requisitos)\n'
  exit 1
fi

# Docker inacessível costuma ser "permission denied" no /var/run/docker.sock
if ! erro_docker="$(docker info 2>&1 >/dev/null)"; then
  printf 'FALHA  o Docker não está acessível para o usuário %s:\n' "$(id -un)"
  printf '%s\n' "$erro_docker" | grep -m1 -i -E 'permission denied|cannot connect|error' | sed 's/^/         /'
  printf '       Rode com sudo:  sudo %s\n' "$0"
  printf '       ou entre no grupo docker:  sudo usermod -aG docker %s\n' "$(id -un)"
  printf '       (depois saia e entre de novo na sessão para o grupo valer)\n'
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  printf 'FALHA  o plugin "docker compose" (v2) não está instalado (README, Pré-requisitos)\n'
  exit 1
fi

# Os containers leem estes arquivos com outros usuários (postgres no banco, node no app):
# cada arquivo precisa de leitura para "outros" e cada pasta, de acesso para "outros".
arquivos_sem_leitura="$(
  {
    find "$RAIZ/db" "$RAIZ/scripts/validacao" -type f ! -perm -o=r
    find "$RAIZ"/specs/00[3467]-*/proposta-modelo-de-dados.md ! -perm -o=r
  } 2>/dev/null
)"
pastas_sem_acesso="$(
  find "$RAIZ" "$RAIZ/db" "$RAIZ/scripts" "$RAIZ/scripts/validacao" "$RAIZ/specs" \
    "$RAIZ"/specs/00[3467]-* -maxdepth 0 -type d ! -perm -o=x 2>/dev/null
)"
if [ -n "$arquivos_sem_leitura" ] || [ -n "$pastas_sem_acesso" ]; then
  printf 'FALHA  há arquivos ou pastas que os containers não conseguem ler:\n'
  if [ -n "$arquivos_sem_leitura" ]; then
    while IFS= read -r f; do printf '         %s\n' "$(relativo "$f")"; done <<<"$arquivos_sem_leitura"
    printf '       Resolva com:  chmod o+r'
    while IFS= read -r f; do printf ' %q' "$(relativo "$f")"; done <<<"$arquivos_sem_leitura"
    printf '\n'
  fi
  if [ -n "$pastas_sem_acesso" ]; then
    while IFS= read -r d; do printf '         %s/\n' "$(relativo "$d")"; done <<<"$pastas_sem_acesso"
    printf '       Resolva com:  chmod o+x'
    while IFS= read -r d; do printf ' %q' "$(relativo "$d")"; done <<<"$pastas_sem_acesso"
    printf '\n'
  fi
  printf '       (rode na raiz do repositório)\n'
  exit 1
fi
printf 'ok     Docker acessível e arquivos legíveis pelos containers\n\n'

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
  printf 'FALHA  o banco do projeto de validação não ficou pronto; últimas linhas do log dele:\n'
  compose logs --no-color --tail 15 db 2>&1 | sed 's/^/         /'
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
