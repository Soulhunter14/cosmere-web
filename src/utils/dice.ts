// ── Tipos ──────────────────────────────────────────────────────────────────

export type TramaDieResult = 'blank' | 'O' | 'C1' | 'C2' | 'C3' | 'C4'
export type AdvantageMode = 'normal' | 'ventaja' | 'desventaja'

export interface SkillRollResult {
  type: 'skill'
  skillName: string
  d20a: number
  d20b: number | null   // second die (ventaja/desventaja)
  finalD20: number
  modifier: number
  total: number
  advantage: AdvantageMode
  trama: TramaDieResult
}

export interface DamageRollResult {
  type: 'damage'
  dice: number[]          // dados usados
  diceAlt: number[] | null // dados descartados (null = tirada normal)
  total: number
  modifier: number
  dieFaces: number
  advantage: AdvantageMode
}

export interface RecoveryRollResult {
  type: 'recovery'
  voluntad: number
  dieFaces: number
  result: number
  medicineBonus: number
}

export interface ContestedRollResult {
  type: 'contested'
  attackerName: string
  defenderName: string
  attacker: { d20: number; modifier: number; total: number; trama: TramaDieResult }
  defender: { d20: number; modifier: number; total: number }
  winner: 'attacker' | 'defender' | 'tie'
}

export interface FreeRollResult {
  type: 'free'
  count: number
  faces: number
  results: number[]
  total: number
}

export interface CombatRollResult {
  type: 'combat'
  // ── Ataque (d20) ──
  skillName: string
  d20a: number
  d20b: number | null
  finalD20: number
  attackModifier: number
  attackTotal: number
  advantage: AdvantageMode
  trama: TramaDieResult
  // ── Daño ──
  dice: number[]            // dados usados
  diceAlt: number[] | null  // dados descartados
  damageTotal: number
  damageModifier: number
  dieFaces: number
  damageAdvantage: AdvantageMode
}

export type AnyRollResult =
  | SkillRollResult
  | DamageRollResult
  | RecoveryRollResult
  | ContestedRollResult
  | FreeRollResult
  | CombatRollResult

// ── Dado de trama (d12 con 12 caras) ──────────────────────────────────────
// Distribución: blank ×4, O ×3, C1 ×2, C2 ×1, C3 ×1, C4 ×1 = 12
const TRAMA_FACES: TramaDieResult[] = [
  'blank', 'blank', 'blank', 'blank',
  'O', 'O', 'O',
  'C1', 'C1',
  'C2',
  'C3',
  'C4',
]

// ── Funciones primitivas ───────────────────────────────────────────────────

export function rollDN(n: number): number {
  return Math.floor(Math.random() * n) + 1
}

export function rollD20(): number {
  return rollDN(20)
}

export function rollTrama(): TramaDieResult {
  return TRAMA_FACES[Math.floor(Math.random() * TRAMA_FACES.length)]
}

/** Tamaño del dado de recuperación según Voluntad */
export function recoveryDieFaces(voluntad: number): number {
  if (voluntad <= 0)  return 4
  if (voluntad <= 2)  return 6
  if (voluntad <= 4)  return 8
  if (voluntad <= 6)  return 10
  if (voluntad <= 8)  return 12
  return 20
}

// ── Tiradas compuestas ─────────────────────────────────────────────────────

export function rollSkill(params: {
  skillName: string
  modifier: number
  advantage: AdvantageMode
  useTrama?: boolean
}): SkillRollResult {
  const d20a = rollD20()
  let d20b: number | null = null
  let finalD20: number

  if (params.advantage !== 'normal') {
    d20b = rollD20()
    finalD20 = params.advantage === 'ventaja'
      ? Math.max(d20a, d20b)
      : Math.min(d20a, d20b)
  } else {
    finalD20 = d20a
  }

  // Natural 20 → Oportunidad garantizada; natural 1 → Complicación 2
  let trama: TramaDieResult
  if (params.useTrama === false) {
    trama = 'blank'
  } else if (finalD20 === 20) {
    trama = 'O'
  } else if (finalD20 === 1) {
    trama = 'C2'
  } else {
    trama = rollTrama()
  }

  return {
    type: 'skill',
    skillName: params.skillName,
    d20a,
    d20b,
    finalD20,
    modifier: params.modifier,
    total: finalD20 + params.modifier,
    advantage: params.advantage,
    trama,
  }
}

export function rollDamage(params: {
  count: number
  faces: number
  modifier: number
  advantage?: AdvantageMode
}): DamageRollResult {
  const adv = params.advantage ?? 'normal'
  const rollSet = () => Array.from({ length: params.count }, () => rollDN(params.faces))
  const setA = rollSet()
  const setB = adv !== 'normal' ? rollSet() : null

  let dice: number[]
  let diceAlt: number[] | null

  if (setB !== null) {
    const sumA = setA.reduce((a, b) => a + b, 0)
    const sumB = setB.reduce((a, b) => a + b, 0)
    const useA = adv === 'ventaja' ? sumA >= sumB : sumA <= sumB
    dice    = useA ? setA : setB
    diceAlt = useA ? setB : setA
  } else {
    dice    = setA
    diceAlt = null
  }

  const total = Math.max(0, dice.reduce((a, b) => a + b, 0) + params.modifier)

  return {
    type: 'damage',
    dice,
    diceAlt,
    total,
    modifier: params.modifier,
    dieFaces: params.faces,
    advantage: adv,
  }
}

export function rollRecovery(params: {
  voluntad: number
  medicineBonus: number
}): RecoveryRollResult {
  const faces = recoveryDieFaces(params.voluntad)
  const raw = rollDN(faces)
  const result = Math.max(1, raw + params.medicineBonus)
  return {
    type: 'recovery',
    voluntad: params.voluntad,
    dieFaces: faces,
    result,
    medicineBonus: params.medicineBonus,
  }
}

export function rollContested(params: {
  attackerName: string
  defenderName: string
  attackerMod: number
  defenderMod: number
  useTrama?: boolean
}): ContestedRollResult {
  const ad20 = rollD20()
  const dd20 = rollD20()
  const atotal = ad20 + params.attackerMod
  const dtotal = dd20 + params.defenderMod

  let trama: TramaDieResult
  if (params.useTrama === false) {
    trama = 'blank'
  } else if (ad20 === 20) {
    trama = 'O'
  } else if (ad20 === 1) {
    trama = 'C2'
  } else {
    trama = rollTrama()
  }

  return {
    type: 'contested',
    attackerName: params.attackerName,
    defenderName: params.defenderName,
    attacker: { d20: ad20, modifier: params.attackerMod, total: atotal, trama },
    defender: { d20: dd20, modifier: params.defenderMod, total: dtotal },
    winner: atotal > dtotal ? 'attacker' : atotal < dtotal ? 'defender' : 'tie',
  }
}

// ── Etiqueta legible para el registro compartido ───────────────────────────

export function buildRollLabel(r: AnyRollResult): string {
  switch (r.type) {
    case 'skill': {
      const adv = r.advantage === 'ventaja' ? ' ↑' : r.advantage === 'desventaja' ? ' ↓' : ''
      const trama = r.trama !== 'blank' ? ` · ${r.trama}` : ''
      return `${r.skillName}${adv}: ${r.total}${trama}`
    }
    case 'damage':
      return `${r.dice.length}d${r.dieFaces} — ${r.total} daño`
    case 'recovery':
      return `Recuperación (d${r.dieFaces}) — +${r.result}`
    case 'contested': {
      const winner =
        r.winner === 'attacker' ? r.attackerName
        : r.winner === 'defender' ? r.defenderName
        : 'Empate'
      return `${r.attackerName} vs ${r.defenderName}: ${r.attacker.total} vs ${r.defender.total} — ${winner}`
    }
    case 'free':
      return `${r.count}d${r.faces} — ${r.total}`
    case 'combat': {
      const adv = r.advantage === 'ventaja' ? ' ↑' : r.advantage === 'desventaja' ? ' ↓' : ''
      const trama = r.trama !== 'blank' ? ` · ${r.trama}` : ''
      return `${r.skillName}${adv}: ${r.attackTotal} · ${r.damageTotal} daño${trama}`
    }
  }
}

export function rollCombat(params: {
  skillName: string
  attackModifier: number
  advantage: AdvantageMode
  diceCount: number
  diceFaces: number
  damageModifier: number
  damageAdvantage?: AdvantageMode
  useTrama?: boolean
}): CombatRollResult {
  // ── Tirada de ataque ──
  const d20a = rollD20()
  let d20b: number | null = null
  let finalD20: number

  if (params.advantage !== 'normal') {
    d20b = rollD20()
    finalD20 = params.advantage === 'ventaja'
      ? Math.max(d20a, d20b)
      : Math.min(d20a, d20b)
  } else {
    finalD20 = d20a
  }

  let trama: TramaDieResult
  if (params.useTrama === false) {
    trama = 'blank'
  } else if (finalD20 === 20) {
    trama = 'O'
  } else if (finalD20 === 1) {
    trama = 'C2'
  } else {
    trama = rollTrama()
  }

  const attackTotal = finalD20 + params.attackModifier

  // ── Tirada de daño (simultánea) ──
  const dmgAdv = params.damageAdvantage ?? 'normal'
  const rollSet = () => Array.from({ length: params.diceCount }, () => rollDN(params.diceFaces))
  const dmgSetA = rollSet()
  const dmgSetB = dmgAdv !== 'normal' ? rollSet() : null

  let dice: number[]
  let diceAlt: number[] | null

  if (dmgSetB !== null) {
    const sumA = dmgSetA.reduce((a, b) => a + b, 0)
    const sumB = dmgSetB.reduce((a, b) => a + b, 0)
    const useA = dmgAdv === 'ventaja' ? sumA >= sumB : sumA <= sumB
    dice    = useA ? dmgSetA : dmgSetB
    diceAlt = useA ? dmgSetB : dmgSetA
  } else {
    dice    = dmgSetA
    diceAlt = null
  }

  const damageTotal = Math.max(0, dice.reduce((a, b) => a + b, 0) + params.damageModifier)

  return {
    type: 'combat',
    skillName: params.skillName,
    d20a,
    d20b,
    finalD20,
    attackModifier: params.attackModifier,
    attackTotal,
    advantage: params.advantage,
    trama,
    dice,
    diceAlt,
    damageTotal,
    damageModifier: params.damageModifier,
    dieFaces: params.diceFaces,
    damageAdvantage: dmgAdv,
  }
}

export function rollFree(count: number, faces: number): FreeRollResult {
  const results = Array.from({ length: count }, () => rollDN(faces))
  return {
    type: 'free',
    count,
    faces,
    results,
    total: results.reduce((a, b) => a + b, 0),
  }
}
