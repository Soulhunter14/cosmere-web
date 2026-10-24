/**
 * «La mesa»: comprueba que `proyectarMesa` (src/pages/pantalla/mesa.ts) es una lista blanca de verdad: de un enemigo nunca sale
 * su salud, sus defensas, su desvío, su rango, sus inmunidades, sus ataques, sus habilidades ni sus notas; un encuentro sin
 * `enMesa` y un enemigo `oculto` no salen; la pista de salud solo sale si el director la muestra; el turno de un enemigo solo
 * cuando el director lo revela o el enemigo actúa; las fichas del mapa salen resueltas y nunca las escondidas.
 *
 *   node scripts/mesa/probar_proyeccion.mjs
 *
 * Carga los módulos TypeScript con el propio Vite (modo SSR, sin servidor HTTP) y los ejecuta en Node.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const vite = await createServer({ root: raiz, configFile: false, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true, hmr: false } })
const { proyectarMesa, mostrarEnMesa, destaparZona, cambiarNiebla, ponerFicha, grupoAlMapa, moverFicha, quitarFicha, alternarFichaVisible } = await vite.ssrLoadModule('/src/pages/pantalla/mesa.ts')
const { normalizarEstado, nuevaRonda, revelarTurnos, sinTurno } = await vite.ssrLoadModule('/src/pages/pantalla/estado.ts')
const { normalizarMesa } = await vite.ssrLoadModule('/src/pages/mesa/publica.ts')
await vite.close()

const combatiente = (extra) => ({
  nombre: 'X', bando: 'pnj', salud: { actual: 7, max: 10 }, concentracion: { actual: 2, max: 2 }, investidura: { actual: 0, max: 0 },
  defensas: { fisica: 12, cognitiva: 11, espiritual: 13 }, desvio: 2, desvioNota: '', estados: [{ id: 'agotado', valor: '−2' }], inmunidades: ['Aturdido'],
  ataques: [{ nombre: 'Maza', bono: 3, impacto: { dados: 1, caras: 6, mod: 2 }, rasguno: null, nota: '' }], habilidades: { atletismo: 2 },
  notas: 'secreto del director', rango: 'secuaz', ...extra,
})

const estado = normalizarEstado({
  version: 6,
  sesion: { id: 's1', numero: 7, titulo: 'La emboscada', iniciadaEn: '2026-10-23T18:00:00.000Z', terminadaEn: null, eventos: [], escenas: [] },
  encuentros: [
    {
      id: 'e1', titulo: 'El muelle', ronda: 3, fase: 'pnj-rapido', enMesa: true,
      combatientes: [
        combatiente({ id: 'pj1', nombre: 'Nadia', bando: 'pj', characterId: 9, turno: 'rapido', actuoRapido: true, reaccionUsada: true, rango: null }),
        combatiente({ id: 'pj2', nombre: 'Kelsier', bando: 'pj', characterId: 12, rango: null }),
        combatiente({ id: 'en1', nombre: 'Guardia 1', adversarioId: 84, mostrarSalud: true, turno: 'lento' }),
        combatiente({ id: 'en2', nombre: 'Guardia 2', adversarioId: 84, salud: { actual: 10, max: 10 }, turno: 'rapido', turnoVisible: true }),
        combatiente({ id: 'en3', nombre: 'Francotirador', oculto: true }),
        combatiente({ id: 'en4', nombre: 'Guardia 3', derrotado: true, salud: { actual: 0, max: 10 }, mostrarSalud: true }),
        combatiente({ id: 'en5', nombre: 'Matón', turno: 'rapido', actuoRapido: true }),
        combatiente({ id: 'en6', nombre: 'Capitán', rango: 'jefe' }),
      ],
      retirados: [{ nombre: 'Guardia 4', motivo: 'huido' }],
    },
    { id: 'e2', titulo: 'La azotea', ronda: 1, fase: 'pj-rapido', enMesa: false, combatientes: [combatiente({ id: 'en9', nombre: 'Jefe' })], retirados: [] },
  ],
  encuentroActivo: 'e2',
})
mostrarEnMesa(estado, { tipo: 'publica', url: '/maps/legado/map_p104.webp' }, 'Mapa 1', 'Veis esto', null)

const mesa = proyectarMesa(estado)
const fallos = []
const espera = (cond, msg) => { if (!cond) fallos.push(msg) }

espera(mesa.version === 1, 'version 1')
espera(mesa.sesion?.numero === 7 && mesa.sesion.titulo === 'La emboscada', 'la sesión sale con número y título')
espera(mesa.encuentros.length === 1 && mesa.encuentros[0].id === 'e1', 'solo sale el encuentro con enMesa')
const enc = mesa.encuentros[0]
espera(enc.aliados.length === 2 && enc.aliados[0].salud.actual === 7 && enc.aliados[0].reaccionUsada === true, 'los aliados salen con su salud y su reacción')
espera(enc.enemigos.map((x) => x.id).join() === 'en1,en2,en4,en5,en6', `salen los enemigos visibles, no el oculto: ${enc.enemigos.map((x) => x.id).join()}`)
const PROHIBIDAS = ['salud', 'defensas', 'desvio', 'desvioNota', 'rango', 'inmunidades', 'ataques', 'habilidades', 'notas', 'concentracion', 'investidura', 'oculto', 'mostrarSalud', 'bando', 'reaccionUsada', 'turnoVisible']
const PERMITIDAS = ['id', 'nombre', 'adversarioId', 'turno', 'actuoRapido', 'actuoLento', 'estados', 'derrotado', 'pistaSalud']
for (const x of enc.enemigos) {
  const claves = Object.keys(x)
  espera(claves.every((k) => PERMITIDAS.includes(k)), `claves de ${x.nombre} fuera de la lista blanca: ${claves.filter((k) => !PERMITIDAS.includes(k)).join(', ')}`)
  espera(!claves.some((k) => PROHIBIDAS.includes(k)), `claves prohibidas en ${x.nombre}`)
  espera(!JSON.stringify(x).includes('secreto del director'), `las notas de ${x.nombre} salen en el JSON`)
}
espera(enc.enemigos[0].pistaSalud === 'herido', `pista de Guardia 1 (7/10, mostrada) = herido, es ${enc.enemigos[0].pistaSalud}`)
espera(enc.enemigos[1].pistaSalud === null, 'Guardia 2 no muestra la salud: pista null')
espera(enc.enemigos[2].pistaSalud === 'caido' && enc.enemigos[2].derrotado, 'Guardia 3 caído')
espera(enc.enemigos[0].estados[0].valor === '−2', 'los estados salen con su valor')
espera(enc.retirados.length === 1 && enc.retirados[0].motivo === 'huido', 'los retirados salen')
espera(mesa.proyeccion?.titulo === 'Mapa 1' && mesa.proyeccion.pie === 'Veis esto', 'la proyección sale con título y pie')
espera(!('proyecciones' in mesa), 'el historial de imágenes es del director: no sale en el documento público')

// Turns: a companion's turn goes as it is (null while not chosen); an enemy's only when revealed or once it acted
espera(enc.aliados[0].turno === 'rapido' && enc.aliados[1].turno === null, 'aliados: Nadia rápido, Kelsier sin turno')
espera(enc.enemigos[0].turno === null, 'Guardia 1 tiene turno lento pero no revelado: null')
espera(enc.enemigos[1].turno === 'rapido', 'Guardia 2 revelado: rápido')
espera(enc.enemigos[3].turno === 'rapido', 'Matón ha actuado: su turno se ve aunque no esté revelado')
const e1 = estado.encuentros[0]
espera(sinTurno(e1).map((x) => x.id).join() === 'pj2,en3', `sin turno: Kelsier y el Francotirador (el Jefe nunca elige): ${sinTurno(e1).map((x) => x.id).join()}`)
espera(revelarTurnos(e1) === 3 && e1.combatientes.find((x) => x.id === 'en1').turnoVisible && e1.combatientes.find((x) => x.id === 'en6').turnoVisible, '«Revelar turnos» revela Guardia 1, el Matón y el Jefe (los que tienen turno; Guardia 2 ya estaba)')
nuevaRonda(e1)
espera(e1.ronda === 4 && e1.combatientes.every((x) => x.rango === 'jefe' || x.turno === null), 'ronda nueva: todos sin turno salvo el Jefe')
espera(e1.combatientes.every((x) => !x.actuoRapido && !x.actuoLento && !x.turnoVisible), 'ronda nueva: nadie ha actuado y los turnos enemigos vuelven a estar ocultos')
espera(proyectarMesa(estado).encuentros[0].enemigos.every((x) => x.turno === null), 'tras la ronda nueva los jugadores no ven ningún turno enemigo')

// Taken off the table, nothing of the image reaches the players (the director keeps it in his history)
mostrarEnMesa(estado, { tipo: 'publica', url: '/maps/legado/map_p105.webp' }, 'Mapa 2', '', null)
estado.mesa.proyeccion = null
const vacia = proyectarMesa(estado)
espera(vacia.proyeccion === null && !JSON.stringify(vacia).includes('map_p10'), 'tras «Quitar de la mesa» ningún mapa llega a los jugadores')
espera(estado.mesa.proyecciones.length === 2, 'el director conserva las dos imágenes en su historial')
espera(!JSON.stringify(mesa).includes('La azotea'), 'el encuentro oculto no deja rastro')
espera(!JSON.stringify(mesa).includes('Francotirador'), 'el enemigo oculto no deja rastro')
// A document stored by an earlier build that still carried the history: the players' page reads it without the history
const antigua = normalizarMesa({ version: 1, proyeccion: null, proyecciones: [{ id: 'p', imagen: { tipo: 'publica', url: '/maps/x.webp' }, titulo: 'Mapa', pie: '', en: '' }] })
espera(antigua.proyeccion === null && !('proyecciones' in antigua), 'normalizarMesa descarta el historial de un documento antiguo')

// Fog of war: a map starts covered; zones are clipped to the image and a drag too short uncovers nothing; a portrait has no fog
mostrarEnMesa(estado, { tipo: 'publica', url: '/maps/legado/map_p104.webp' }, 'Mapa 1.3: El puerto', '', null)
espera(estado.mesa.proyeccion.niebla.activa === true && estado.mesa.proyeccion.niebla.zonas.length === 0, 'un mapa nace tapado del todo')
espera(destaparZona(estado, { x: 0.1, y: 0.2, w: 0.3, h: 0.25 }) === true, 'se destapa una zona normal')
espera(destaparZona(estado, { x: 0.5, y: 0.5, w: 0.004, h: 0.3 }) === false, 'una zona de menos del 1 % no se añade')
espera(destaparZona(estado, { x: 0.9, y: 0.9, w: 0.5, h: 0.5 }) === true, 'una zona que se sale se recorta al mapa')
const niebla = proyectarMesa(estado).proyeccion.niebla
espera(niebla.activa && niebla.zonas.length === 2, `salen 2 zonas publicadas, hay ${niebla.zonas.length}`)
espera(Math.abs(niebla.zonas[1].w - 0.1) < 1e-9 && Math.abs(niebla.zonas[1].h - 0.1) < 1e-9, 'la zona recortada mide 0,1 × 0,1')
espera(estado.mesa.proyecciones[0].niebla.zonas.length === 2, 'el historial del director guarda las zonas')

// Tokens: a companion's is always published; an enemy's only when visible, not «oculto» and (with fog) in an uncovered zone
const cb = (id) => e1.combatientes.find((x) => x.id === id)
espera(ponerFicha(estado, { combatiente: cb('pj1') }) !== null, 'se pone la ficha de Nadia')
espera(ponerFicha(estado, { combatiente: cb('pj1') }).id === estado.mesa.proyeccion.fichas[0].id, 'ponerla otra vez no la duplica')
const fichaEn1 = ponerFicha(estado, { combatiente: cb('en1') }, { x: 0.5, y: 0.5 })
espera(fichaEn1 !== null && fichaEn1.visible === false, 'la ficha de un enemigo nace escondida a los jugadores')
const fichaEn3 = ponerFicha(estado, { combatiente: cb('en3') }, { x: 0.15, y: 0.25 })
espera(fichaEn3 !== null, 'se pone la ficha del Francotirador (oculto a la mesa) en zona destapada')
alternarFichaVisible(estado, fichaEn3.id)
let pub = proyectarMesa(estado).proyeccion.fichas
espera(pub.length === 1 && pub[0].nombre === 'Nadia' && pub[0].bando === 'pj' && typeof pub[0].color === 'number', `solo sale la ficha de Nadia (Guardia 1 escondida, Francotirador oculto a la mesa): ${pub.map((f) => f.nombre).join()}`)
espera(pub.every((f) => !('combatienteId' in f) && !('visible' in f) && !('characterId' in f)), 'la ficha publicada no lleva combatienteId, characterId ni visible')
alternarFichaVisible(estado, fichaEn1.id)
espera(!proyectarMesa(estado).proyeccion.fichas.some((f) => f.nombre === 'Guardia 1'), 'mostrada por el director pero en zona tapada, la ficha de Guardia 1 no sale')
moverFicha(estado, fichaEn1.id, 0.15, 0.3)
pub = proyectarMesa(estado).proyeccion.fichas
espera(pub.some((f) => f.nombre === 'Guardia 1'), 'movida a una zona destapada, la ficha de Guardia 1 sale')
alternarFichaVisible(estado, fichaEn1.id)
espera(!proyectarMesa(estado).proyeccion.fichas.some((f) => f.nombre === 'Guardia 1'), 'escondida otra vez por el director, no sale')
alternarFichaVisible(estado, fichaEn1.id)
cambiarNiebla(estado, (n) => { n.activa = false })
pub = proyectarMesa(estado).proyeccion.fichas
espera(pub.map((f) => f.nombre).sort().join() === 'Guardia 1,Nadia', `sin niebla salen Nadia y Guardia 1, nunca el Francotirador: ${pub.map((f) => f.nombre).join()}`)
espera(grupoAlMapa(estado, [{ combatiente: cb('pj1') }, { combatiente: cb('pj2') }]) === 1, '«Todo el grupo al mapa» pone solo a Kelsier (Nadia ya estaba)')
espera(estado.mesa.proyeccion.fichas.length === 4 && estado.mesa.proyecciones[0].fichas.length === 4, 'el historial del director guarda las fichas')
quitarFicha(estado, fichaEn3.id)
espera(estado.mesa.proyeccion.fichas.length === 3, 'quitar una ficha la saca del mapa')
cambiarNiebla(estado, (n) => { n.zonas = [] })
espera(proyectarMesa(estado).proyeccion.niebla.zonas.length === 0, '«Tapar todo» vacía las zonas publicadas')
mostrarEnMesa(estado, { tipo: 'retrato', adversarioId: 84 }, 'Guardia', '', null)
espera(proyectarMesa(estado).proyeccion.niebla.activa === false && proyectarMesa(estado).proyeccion.fichas.length === 0, 'un retrato no lleva niebla ni fichas')
const leida = normalizarMesa({
  version: 1,
  proyeccion: {
    id: 'p', imagen: { tipo: 'publica', url: '/m.webp' }, titulo: 'Mapa', pie: '', en: '',
    niebla: { activa: true, zonas: [{ x: 0.2, y: 0.2, w: 0.3, h: 0.3 }, { x: 2, y: 0, w: 1, h: 1 }, { x: 0, y: 0, w: 0.001, h: 1 }] },
    fichas: [{ id: 'f1', nombre: 'Nadia', bando: 'pj', adversarioId: null, x: 0.3, y: 0.4, color: 2 }, { id: 'f2', nombre: '', x: 0.1, y: 0.1 }, { id: 'f3', nombre: 'Mal', bando: 'pnj', x: 'no', y: 0.1 }],
    tamanoFicha: 0.5,
  },
})
espera(leida.proyeccion.niebla.activa && leida.proyeccion.niebla.zonas.length === 1, `el jugador lee solo la zona válida (${leida.proyeccion.niebla.zonas.length})`)
espera(leida.proyeccion.fichas.length === 1 && leida.proyeccion.fichas[0].color === 2 && leida.proyeccion.tamanoFicha === 0.1 && leida.proyeccion.nombresFichas === true, 'el jugador lee solo la ficha válida, el tamaño acotado y los nombres por defecto')

if (fallos.length) {
  console.error(`✗ ${fallos.length} fallo(s):\n- ${fallos.join('\n- ')}`)
  process.exit(1)
}
console.log(`✓ proyectarMesa: lista blanca correcta (${enc.enemigos.length} enemigos visibles, ${enc.aliados.length} aliados, 1 encuentro de 2; turnos, niebla y fichas)`)
