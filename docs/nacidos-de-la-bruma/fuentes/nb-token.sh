#!/bin/bash
# Imprime el JWT del director (por defecto) o del jugador de prueba: bash nb-token.sh [gm|jugador]
. "/c/Users/xavie/Documents/Repositories/personal/cosmere-web/docs/nacidos-de-la-bruma/entorno-pruebas.md"
if [ "$1" = "jugador" ]; then U=$NB_JUGADOR_USER; P=$NB_JUGADOR_PASS; else U=$NB_GM_USER; P=$NB_GM_PASS; fi
curl -s -X POST http://localhost:5200/auth/login -H "Content-Type: application/json" -d "{\"username\":\"$U\",\"password\":\"$P\"}" \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);if(!j.token){console.error(s);process.exit(1)}process.stdout.write(j.token)})"
