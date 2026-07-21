#!/usr/bin/env bash
# Levanta Zennyth en modo producción local y expone un túnel HTTPS público
# para probar la PWA en un celular.
set -euo pipefail

PORT=3001
NEXT_PID=""
CF_PID=""

cleanup() {
  echo ""
  echo "Cerrando servicios..."
  [ -n "$NEXT_PID" ] && kill "$NEXT_PID" 2>/dev/null || true
  [ -n "$CF_PID" ] && kill "$CF_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM EXIT

echo "==> Haciendo build de Zennyth..."
bun run build

echo "==> Iniciando Next.js en http://localhost:$PORT..."
nohup bun run start -- -p "$PORT" > /tmp/zennyth-next.log 2>&1 &
NEXT_PID=$!

# Esperar a que Next.js responda
for i in {1..30}; do
  if curl -s -o /dev/null "http://localhost:$PORT" 2>/dev/null; then
    echo "    Next.js listo en http://localhost:$PORT"
    break
  fi
  sleep 1
done

echo "==> Iniciando túnel HTTPS con cloudflared..."
nohup cloudflared tunnel --url "http://localhost:$PORT" > /tmp/zennyth-cf.log 2>&1 &
CF_PID=$!

# Esperar a que cloudflared imprima la URL
URL=""
for i in {1..60}; do
  URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' /tmp/zennyth-cf.log | head -1 || true)
  [ -n "$URL" ] && break
  sleep 1
done

if [ -z "$URL" ]; then
  echo "ERROR: No se pudo obtener la URL del túnel. Revisa /tmp/zennyth-cf.log"
  exit 1
fi

echo ""
echo "========================================"
echo "  Abre esta URL en tu celular:"
echo "  $URL"
echo "========================================"
echo ""
echo "En Android (Chrome): menú → Agregar a pantalla de inicio"
echo "En iOS (Safari): compartir → Agregar a pantalla de inicio"
echo ""
echo "Presiona Enter para detener el túnel y el servidor."
read -r
