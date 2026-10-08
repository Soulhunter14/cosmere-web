/**
 * Reads what the encounter needs from the adversary catalog (`/global-npcs`) and from the campaign characters, and builds the
 * combatants of the «Pantalla del director». The catalog notes were transcribed with a stable shape («Desvío: 1 (cuero).»,
 * «Acometida: Maza +2. Rasguño 3(1d6). Impacto 5(1d6+2).», «Inmunidades: Aturdido, Agotado.»), which is what is parsed here.
 */
import type { Character, Era, GlobalNpc } from '../../types'
import type { AttrField, HabilidadDef } from '../../worlds/types'
import type { SkillField } from '../../lib/talentGraph'
import { COLUMNAS_COSMERE } from '../../worlds/skills'
import { nuevoId, type AtaqueDef, type Bando, type Combatiente, type DadoDano, type Defensas, type Rango } from './estado'

// ── Catalog text ─────────────────────────────────────────────────────────────

/** Era as the catalog numbers it (`GlobalNpc.era`, catalog items): 1 | 2, null = no era (a world without eras) */
export type EraNum = 1 | 2 | null
export const eraNumero = (era: Era | null): EraNum => (era === 'era1' ? 1 : era === 'era2' ? 2 : null)

/**
 * Era of one line of a stat block that serves both eras: the book marks a capability usable in only one with the symbol
 * «ERA 1» / «ERA 2» (Guía del mundo, «Eras de los adversarios», L.216 / PDF 222), in capitals. Prose («En la Era 2, …») is not a mark.
 */
export function etiquetaEra(linea: string): 1 | 2 | null {
  const m = /\bERA\s*([12])\b/.exec(linea)
  return m ? (Number(m[1]) as 1 | 2) : null
}

/** The line is marked for the other era than the campaign's (always false in a world without eras) */
export const deOtraEra = (linea: string, era: EraNum) => era !== null && (etiquetaEra(linea) ?? era) !== era

/** «Secuaz Rango 1 – Humanoide Mediano» → 'secuaz' */
export function rangoDe(tipo: string): Rango | null {
  const t = tipo.toLowerCase()
  if (t.includes('jefe')) return 'jefe'
  if (t.includes('secuaz')) return 'secuaz'
  if (t.includes('rival')) return 'rival'
  return null
}

export const RANGO_LABEL: Record<Rango, string> = { secuaz: 'Secuaz', rival: 'Rival', jefe: 'Jefe' }

/** «Desvío: 2 (caparazón).» → 2 */
export function desvioDe(texto: string): number {
  const m = /Desv[ií]o:\s*(\d+)/i.exec(texto)
  return m ? Number(m[1]) : 0
}

/** «Inmunidades: Afligido, Agotado, Aturdido.» → ['Afligido', 'Agotado', 'Aturdido'] */
export function inmunidadesDe(texto: string): string[] {
  const m = /Inmunidades:\s*([^.\n]+)/i.exec(texto)
  return m ? m[1].split(/,|\by\b/).map((s) => s.trim()).filter(Boolean) : []
}

const RE_IMPACTO = /Impacto:?\s*\d+\s*\((\d+)d(\d+)(?:\s*\+\s*(\d+))?\)\s*(esp\.?)?/i
const RE_RASGUNO = /Rasgu[ñn]o:?\s*\d+\s*\((\d+)d(\d+)\)/i

/** Mistborn wording (Guía del mundo): «1 Acometida: Porra. Ataque +4, cercanía 1,5 m, 1d6 + 4 de daño por golpe.» */
const RE_ATAQUE_BRUMA = /Ataque\s*\+(\d+)[^.]*?(\d+)d(\d+)(?:\s*\+\s*(\d+))?\s+de daño(?:\s+(espiritual|vital))?/i

/**
 * Attacks of the notes. Two wordings: Stormlight's transcriptions give hit and graze («Impacto 5(1d6+2)»), the Mistborn book gives
 * the damage once («Ataque +4, …, 1d6 + 4 de daño»; the graze is the dice without the modifier). The name is what comes before the
 * attack bonus, without the action cost («1 », «2 », «r »), the word «Acometida:», the «(1 conc)» costs and a trailing «: Ataque».
 * With the campaign's `era`, an attack marked for the other era is left out and the mark leaves the name.
 */
export function ataquesDe(texto: string, era: EraNum = null): AtaqueDef[] {
  const ataques: AtaqueDef[] = []
  for (const linea of texto.split('\n')) {
    if (deOtraEra(linea, era)) continue
    const imp = RE_IMPACTO.exec(linea)
    if (!imp) {
      const bruma = RE_ATAQUE_BRUMA.exec(linea)
      if (!bruma) continue
      const limpio = linea
        .slice(0, bruma.index)
        .replace(/^\s*(?:[0-3]|r)\s+/i, '')
        .replace(/^Acometida:\s*/i, '')
        .replace(/\([^)]*\)/g, '')
        .replace(/[\s:,;.]+$/, '')
        .trim()
      // A weapon of one era: «Arco largo. ERA 1» → «Arco largo», or «Arco largo (Era 1)» when the campaign has no era
      const marca = /^(.*?)\.\s*(?:ERA|Era)\s*(\d)$/.exec(limpio)
      const nombre = (marca ? (era ? marca[1].trim() : `${marca[1].trim()} (Era ${marca[2]})`) : limpio.split('. ')[0]).replace(/\s{2,}/g, ' ')
      const impacto: DadoDano = { dados: Number(bruma[2]), caras: Number(bruma[3]), mod: bruma[4] ? Number(bruma[4]) : 0 }
      ataques.push({
        nombre: nombre || 'Ataque',
        bono: Number(bruma[1]),
        impacto,
        rasguno: { ...impacto, mod: 0 },
        nota: bruma[5] ? bruma[5].toLowerCase() : '',
      })
      continue
    }
    const bono = /\+\s*(\d+)/.exec(linea)
    if (!bono || bono.index > imp.index) continue
    const nombre = linea
      .slice(0, bono.index)
      .replace(/^\s*(?:[0-3]|r)\s+/i, '')
      .replace(/^Acometida:\s*/i, '')
      .replace(/\([^)]*\)/g, '')
      .replace(/:\s*Ataque\s*$/i, '')
      .replace(/[\s:,;.]+$/, '')
      .trim()
    const ras = RE_RASGUNO.exec(linea)
    const impacto: DadoDano = { dados: Number(imp[1]), caras: Number(imp[2]), mod: imp[3] ? Number(imp[3]) : 0 }
    ataques.push({
      nombre: nombre || 'Ataque',
      bono: Number(bono[1]),
      impacto,
      rasguno: ras ? { dados: Number(ras[1]), caras: Number(ras[2]), mod: 0 } : { ...impacto, mod: 0 },
      nota: imp[4] ? 'esp.' : '',
    })
  }
  return ataques
}

export const formatoDado = (d: DadoDano | null) => (d ? `${d.dados}d${d.caras}${d.mod ? `+${d.mod}` : ''}` : '—')

/**
 * Defenses printed by the book when they differ from 10 + attributes: the seed writes them in a «Nota del libro» («…imprime las
 * defensas física 14, cognitiva 14 y espiritual 14…»), and the encounter uses the book's numbers. null when there is no such note.
 */
export function defensasLibroDe(texto: string): Defensas | null {
  const m = /imprime las defensas física (\d+), cognitiva (\d+) y espiritual (\d+)/i.exec(texto)
  return m ? { fisica: Number(m[1]), cognitiva: Number(m[2]), espiritual: Number(m[3]) } : null
}

/** Investiture skills of a stat block («Alomancia +8 (4 grados; Hierro)»): key in lower case → total modifier */
export function habilidadesInvestidasDe(texto: string): Record<string, number> {
  const r: Record<string, number> = {}
  for (const m of texto.matchAll(/\b(Alomancia|Feruquimia|Hemalurgia)\s*\+(\d+)/g)) {
    const clave = m[1].toLowerCase()
    if (!(clave in r)) r[clave] = Number(m[2])
  }
  return r
}

// ── Combatants ───────────────────────────────────────────────────────────────

type Atributos = Pick<GlobalNpc, AttrField>

/** 10 + the two attributes that head each column (Físico FUE+VEL, Cognitivo INT+VOL, Espiritual DIS+PRE) */
export function defensasDe(a: Atributos, bonos: Partial<Record<AttrField, number>> = {}): Defensas {
  const v = (k: AttrField) => (a[k] ?? 0) + (bonos[k] ?? 0)
  const col = (k: keyof typeof COLUMNAS_COSMERE) => 10 + v(COLUMNAS_COSMERE[k][0]) + v(COLUMNAS_COSMERE[k][1])
  return { fisica: col('fisico'), cognitiva: col('cognitivo'), espiritual: col('espiritual') }
}

/** Skill modifier = rank + attribute (+ the server's attribute bonus of a character, when the world counts it) */
export function habilidadesDe(
  fuente: Partial<Record<SkillField | AttrField, number>>,
  habilidades: HabilidadDef[],
  bonos: Partial<Record<AttrField, number>> = {},
): Record<string, number> {
  const r: Record<string, number> = {}
  for (const h of habilidades) r[h.field] = (fuente[h.field] ?? 0) + (fuente[h.atributo] ?? 0) + (bonos[h.atributo] ?? 0)
  return r
}

const base = (bando: Bando, nombre: string): Combatiente => ({
  id: nuevoId(),
  bando,
  nombre,
  characterId: null,
  adversarioId: null,
  rango: null,
  turno: 'rapido',
  actuoRapido: false,
  actuoLento: false,
  reaccionUsada: false,
  salud: { actual: 0, max: 0 },
  concentracion: { actual: 0, max: 0 },
  investidura: { actual: 0, max: 0 },
  defensas: { fisica: 10, cognitiva: 10, espiritual: 10 },
  desvio: 0,
  estados: [],
  inmunidades: [],
  ataques: [],
  habilidades: {},
  notas: '',
  derrotado: false,
})

const lleno = (max: number) => ({ actual: Math.max(0, max), max: Math.max(0, max) })

export function combatienteDeAdversario(npc: GlobalNpc, nombre: string, habilidades: HabilidadDef[], era: EraNum = null): Combatiente {
  const textoFicha = `${npc.notas ?? ''}\n${npc.talentos ?? ''}`
  return {
    ...base('pnj', nombre),
    adversarioId: npc.id,
    rango: rangoDe(npc.tipo ?? ''),
    salud: lleno(npc.maxHealth),
    concentracion: lleno(npc.maxConcentration),
    investidura: lleno(npc.maxInvestiture),
    defensas: defensasLibroDe(textoFicha) ?? defensasDe(npc),
    desvio: desvioDe(textoFicha),
    inmunidades: inmunidadesDe(textoFicha),
    ataques: ataquesDe(textoFicha, era),
    habilidades: { ...habilidadesDe(npc, habilidades), ...habilidadesInvestidasDe(textoFicha) },
  }
}

export function combatienteDePersonaje(ch: Character, habilidades: HabilidadDef[], contarBonos: boolean): Combatiente {
  const bonos = contarBonos ? ch.bonosAtributos : {}
  return {
    ...base('pj', ch.name),
    characterId: ch.id,
    salud: lleno(ch.salud?.total ?? ch.maxHealth),
    concentracion: lleno(ch.concentracion?.total ?? 0),
    investidura: lleno(ch.investidura?.total ?? 0),
    defensas: {
      fisica: ch.defensaFisica?.total ?? 10,
      cognitiva: ch.defensaCognitiva?.total ?? 10,
      espiritual: ch.defensaEspiritual?.total ?? 10,
    },
    desvio: ch.desvioCalculado?.total ?? ch.desvio ?? 0,
    habilidades: habilidadesDe(ch, habilidades, bonos),
  }
}

export function combatienteLibre(datos: {
  nombre: string
  bando: Bando
  salud: number
  defensa: number
  desvio: number
  rango: Rango | null
}): Combatiente {
  return {
    ...base(datos.bando, datos.nombre),
    rango: datos.rango,
    salud: lleno(datos.salud),
    defensas: { fisica: datos.defensa, cognitiva: datos.defensa, espiritual: datos.defensa },
    desvio: datos.desvio,
  }
}

// ── Adventure enemies → catalog ──────────────────────────────────────────────

const normal = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
/** «Bandido (Ojos de Pala)» → «bandido»; «Ylt, Vigilante de la Verdad» → «ylt» */
const nucleo = (s: string) => normal(s.replace(/\([^)]*\)/g, '').split(',')[0])
/** Rough Spanish singular word by word («cantores» → «cantor», «bandidos» → «bandido»); no lookbehind: older iPad Safari lacks it */
const singular = (s: string) => s.split(' ').map((w) => w.replace(/([^aeiou])es$/, '$1').replace(/s$/, '')).join(' ')

/**
 * Catalog adversary for an enemy name of the book: exact name, then the catalog name as a prefix of the enemy («Khornak» for
 * «Khornak adulto»), then the enemy as a prefix of the catalog name, each also in singular («Cantores de guerra»). The longest
 * catalog name wins, so «Anguila aérea mayor» never becomes «Anguila aérea».
 */
export function buscarAdversario(nombre: string, catalogo: GlobalNpc[]): GlobalNpc | null {
  const objetivo = nucleo(nombre)
  if (!objetivo) return null
  const candidatos = [...catalogo].sort((a, b) => b.name.length - a.name.length)
  for (const forma of [objetivo, singular(objetivo)]) {
    const exacto = candidatos.find((n) => normal(n.name) === forma)
    if (exacto) return exacto
    const prefijo = candidatos.find((n) => forma.startsWith(`${normal(n.name)} `))
    if (prefijo) return prefijo
    const contenido = candidatos.find((n) => normal(n.name).startsWith(`${forma} `))
    if (contenido) return contenido
  }
  return null
}

/** «6 (+2 si PJs están en la caravana)» → 6 */
export function cantidadDe(texto: string | number): number {
  if (typeof texto === 'number') return Math.max(1, Math.trunc(texto))
  const m = /\d+/.exec(texto)
  return m ? Math.max(1, Number(m[0])) : 1
}

/** One enemy per line: «3 Bandido», «Bandido x3», «Bandido» */
export function enemigosDeTexto(texto: string): { nombre: string; cantidad: number }[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const delante = /^(\d+)\s*[x×]?\s+(.+)$/i.exec(l)
      if (delante) return { nombre: delante[2].trim(), cantidad: Math.max(1, Number(delante[1])) }
      const detras = /^(.+?)\s*[x×]\s*(\d+)$/i.exec(l)
      if (detras) return { nombre: detras[1].trim(), cantidad: Math.max(1, Number(detras[2])) }
      return { nombre: l, cantidad: 1 }
    })
}
