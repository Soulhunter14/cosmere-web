// Exports the combats of a book's app data (title, map and enemies with their catalog names) for scripts/aventura/parsear_libro.py,
// so the chapters generated with the book's original text get `enemigos:` on their combat scenes.
//
// Usage (from cosmere-web; Node 22 or later loads the chapter files directly, they only import types):
//   node --experimental-strip-types --no-warnings scripts/aventura/exportar_combates.mjs src/data/mistborn/legado <combates.json>
import { readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const [dir, salida] = process.argv.slice(2)
if (!dir || !salida) {
  console.error('Uso: exportar_combates.mjs <carpeta de datos del libro> <combates.json>')
  process.exit(1)
}
const out = {}
const archivos = readdirSync(dir).filter((f) => /^cap\d+\.ts$/.test(f))
for (const f of archivos) {
  const m = await import(pathToFileURL(resolve(join(dir, f))).href)
  const cap = Object.values(m).find((v) => v && typeof v === 'object' && Array.isArray(v.combats))
  if (!cap) continue
  out[cap.number] = cap.combats.map((c) => ({
    id: c.id, title: c.title, mapRef: c.mapRef ?? null, enemies: c.enemies.map((e) => ({ name: e.name, count: e.count })),
  }))
}
writeFileSync(salida, JSON.stringify(out, null, 1))
for (const [n, cs] of Object.entries(out)) console.log(`capítulo ${n}: ${cs.length} combates`)
