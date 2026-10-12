#!/bin/bash
set -euo pipefail
export PATH="/usr/local/bin:$HOME/.local/bin:$HOME/.acool/mcp/bin:$PATH"

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

printf '%s\n' 'ACoolCOLLECTOR Omni Manifest'
docker --version
docker compose version

docker compose config --quiet
docker compose up -d --build --pull always

for service in acool_db acool_redis acool_ai_engine acool_web acool_adminer acool_portainer; do
  docker inspect "$service" >/dev/null
done

for url in \
  http://localhost:3000 \
  http://localhost:8000/docs \
  http://localhost:8080 \
  http://localhost:9000; do
  curl --fail --silent --show-error --max-time 15 -o /dev/null "$url"
  printf 'reachable %s\n' "$url"
done

acool-mcp doctor
printf '%s\n' 'Omni manifest verified.'
