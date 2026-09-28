import { useState, useCallback, useEffect, useRef } from 'react'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import {
  rollSkill, rollDamage, rollRecovery, rollContested, rollFree, rollCombat,
  recoveryDieFaces, buildRollLabel,
  type AnyRollResult, type TramaDieResult, type AdvantageMode,
} from '../utils/dice'
import { diceRollsApi, type DiceRollResponse } from '../api/diceRolls'
import { charactersApi } from '../api/characters'
import { useCampaignHub } from '../hooks/useCampaignHub'
import { useCampaignStore } from '../store/campaignStore'
import { useAuthStore } from '../store/authStore'
import type { Character } from '../types'

// ── Constantes ─────────────────────────────────────────────────────────────

const SKILLS = [
  'Agilidad', 'Armas ligeras', 'Armas pesadas', 'Atletismo',
  'Deducción', 'Disciplina', 'Engaño', 'Hurto',
  'Intimidación', 'Liderazgo', 'Manufactura', 'Medicina',
  'Percepción', 'Perspicacia', 'Persuasión', 'Saber',
  'Sigilo', 'Supervivencia',
]

const DAMAGE_DICE = [4, 6, 8, 10, 12, 20]

// Mapa nombre de habilidad (UI) → [campo habilidad, campo atributo]
const SKILL_TO_FIELDS: Partial<Record<string, [keyof Character, keyof Character]>> = {
  'Agilidad':      ['agilidad',     'velocidad'],
  'Armas ligeras': ['armasLigeras', 'velocidad'],
  'Armas pesadas': ['armasPesadas', 'fuerza'],
  'Atletismo':     ['atletismo',    'fuerza'],
  'Deducción':     ['deduccion',    'intelecto'],
  'Disciplina':    ['disciplina',   'voluntad'],
  'Engaño':        ['engano',       'presencia'],
  'Hurto':         ['hurto',        'velocidad'],
  'Intimidación':  ['intimidacion', 'presencia'],
  'Liderazgo':     ['liderazgo',    'presencia'],
  'Manufactura':   ['manufactura',  'intelecto'],
  'Medicina':      ['medicina',     'intelecto'],
  'Percepción':    ['percepcion',   'discernimiento'],
  'Perspicacia':   ['perspicacia',  'discernimiento'],
  'Persuasión':    ['persuasion',   'presencia'],
  'Saber':         ['conocimiento', 'intelecto'],
  'Sigilo':        ['sigilo',       'velocidad'],
  'Supervivencia': ['supervivencia','discernimiento'],
}

// Mapa código de atributo (guardado en habilidades personalizadas) → campo del Character
const ATTR_CODE_TO_FIELD: Record<string, keyof Character> = {
  FUE: 'fuerza',
  VEL: 'velocidad',
  INT: 'intelecto',
  VOL: 'voluntad',
  DIS: 'discernimiento',
  PRE: 'presencia',
}

/** Devuelve el modificador del personaje para la habilidad dada: habilidad + atributo asociado */
function getCharMod(char: Character, skillName: string): number | null {
  const fields = SKILL_TO_FIELDS[skillName]
  if (fields !== undefined) {
    const skillVal = (char[fields[0]] as number) ?? 0
    const attrVal  = (char[fields[1]] as number) ?? 0
    return skillVal + attrVal
  }
  // Habilidades personalizadas
  for (let i = 1; i <= 6; i++) {
    const nombre = char[`habilidadPersonalizada${i}` as keyof Character] as string
    const valor  = char[`habilidadPersonalizada${i}Valor` as keyof Character] as number
    const attrCode = char[`habilidadPersonalizada${i}Atributo` as keyof Character] as string
    if (nombre && nombre.trim().toLowerCase() === skillName.trim().toLowerCase()) {
      const attrField = ATTR_CODE_TO_FIELD[attrCode?.toUpperCase?.() ?? '']
      const attrVal = attrField ? ((char[attrField] as number) ?? 0) : 0
      return (valor ?? 0) + attrVal
    }
  }
  return null
}

/** Lista de habilidades del personaje (estándar + personalizadas no vacías) */
function getCharSkills(char: Character): string[] {
  const custom: string[] = []
  for (let i = 1; i <= 6; i++) {
    const nombre = char[`habilidadPersonalizada${i}` as keyof Character] as string
    if (nombre?.trim()) custom.push(nombre.trim())
  }
  return [...SKILLS, ...custom.filter((s) => !SKILLS.includes(s))]
}

const TRAMA_STYLE: Record<TramaDieResult, { color: string; bg: string; border: string; label: string }> = {
  blank:  { color: 'var(--text-subtle)', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)', label: '—' },
  O:      { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)',  border: 'rgba(251,191,36,0.3)',  label: '◯  Oportunidad' },
  C1:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  label: '⚡  Complicación 1' },
  C2:     { color: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)',  label: '⚡  Complicación 2' },
  C3:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)',   label: '⚡  Complicación 3' },
  C4:     { color: '#dc2626', bg: 'rgba(220,38,38,0.12)',   border: 'rgba(220,38,38,0.3)',   label: '⚡  Complicación 4' },
}

// ── Grupo de dados de daño (con soporte ventaja) ──────────────────────────

function DiceGroup({ dice, modifier, dimmed }: { dice: number[]; modifier: number; dimmed?: boolean }) {
  const sum = dice.reduce((a, b) => a + b, 0)
  return (
    <div style={{ opacity: dimmed ? 0.35 : 1, position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {dice.map((v, i) => (
          <span key={i} style={{
            width: 30, height: 30, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: 'var(--text-muted)',
            background: 'var(--surface-1)', border: '1px solid var(--border)',
          }}>
            {v}
          </span>
        ))}
      </div>
      <span style={{ fontSize: 13, fontWeight: 900, color: dimmed ? 'var(--text-subtle)' : '#fb923c' }}>
        {sum}{modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier} = ${Math.max(0, sum + modifier)}` : ''}
      </span>
      {dimmed && (
        <span style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, color: 'var(--text-subtle)', pointerEvents: 'none', lineHeight: 1,
        }}>╱</span>
      )}
    </div>
  )
}

// ── Badge de personaje activo ──────────────────────────────────────────────

function CharacterBadge({ char }: { char: Character }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      padding: '6px 12px', borderRadius: 10,
      background: 'rgba(52,211,153,0.07)',
      border: '1px solid rgba(52,211,153,0.2)',
      fontSize: 11, fontWeight: 700, color: '#34d399',
    }}>
      <span style={{ fontSize: 13 }}>🗡️</span>
      <span>{char.name}</span>
      <span style={{ fontWeight: 400, color: 'rgba(52,211,153,0.7)', fontSize: 10 }}>
        · valores auto-rellenados
      </span>
    </div>
  )
}

// ── Toggle de dado de trama ────────────────────────────────────────────────

function TramaToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      title={value ? 'Desactivar dado de trama' : 'Activar dado de trama'}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 12px', borderRadius: 20, cursor: 'pointer',
        fontSize: 11, fontWeight: 700,
        border: `1px solid ${value ? 'rgba(251,191,36,0.35)' : 'var(--border)'}`,
        background: value ? 'rgba(251,191,36,0.08)' : 'transparent',
        color: value ? '#fbbf24' : 'var(--text-subtle)',
        transition: 'all 0.15s',
      }}
    >
      {/* pill switch */}
      <span style={{
        width: 28, height: 15, borderRadius: 8, position: 'relative', flexShrink: 0,
        background: value ? 'rgba(251,191,36,0.4)' : 'var(--surface-3)',
        border: `1px solid ${value ? 'rgba(251,191,36,0.5)' : 'var(--border)'}`,
        transition: 'background 0.15s',
        display: 'inline-block',
      }}>
        <span style={{
          position: 'absolute', top: 1, left: value ? 13 : 1,
          width: 11, height: 11, borderRadius: '50%',
          background: value ? '#fbbf24' : 'var(--text-subtle)',
          transition: 'left 0.15s, background 0.15s',
        }} />
      </span>
      🎴 Dado de trama
    </button>
  )
}

// ── Subcomponentes de resultado ────────────────────────────────────────────

function TramaBadge({ result }: { result: TramaDieResult }) {
  const s = TRAMA_STYLE[result]
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20,
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      letterSpacing: '0.02em',
    }}>
      {s.label}
    </span>
  )
}

function D20Display({ value }: { value: number }) {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 28, fontWeight: 900, letterSpacing: '-0.04em',
      background: value === 20 ? 'rgba(251,191,36,0.12)' :
                  value === 1  ? 'rgba(239,68,68,0.12)'  :
                  'rgba(180,190,254,0.07)',
      border: `2px solid ${
        value === 20 ? 'rgba(251,191,36,0.4)' :
        value === 1  ? 'rgba(239,68,68,0.4)'  :
        'rgba(180,190,254,0.2)'
      }`,
      color: value === 20 ? '#fbbf24' :
             value === 1  ? '#ef4444'  :
             'var(--brand-light)',
      flexShrink: 0,
    }}>
      {value}
    </div>
  )
}

// ── Historial ──────────────────────────────────────────────────────────────

function HistoryEntry({ r }: { r: AnyRollResult }) {
  if (r.type === 'skill') {
    const s = TRAMA_STYLE[r.trama]
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', minWidth: 72, fontWeight: 600 }}>{r.skillName}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-light)' }}>{r.total}</span>
        {r.trama !== 'blank' && (
          <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</span>
        )}
      </div>
    )
  }
  if (r.type === 'damage') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', minWidth: 72, fontWeight: 600 }}>
          {r.dice.length}d{r.dieFaces}
        </span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#fb923c' }}>{r.total} daño</span>
      </div>
    )
  }
  if (r.type === 'recovery') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', minWidth: 72, fontWeight: 600 }}>Recuperación</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#34d399' }}>+{r.result}</span>
      </div>
    )
  }
  if (r.type === 'contested') {
    const w = r.winner === 'attacker' ? r.attackerName : r.winner === 'defender' ? r.defenderName : 'Empate'
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', minWidth: 72, fontWeight: 600 }}>Enfrentada</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-light)' }}>
          {r.attacker.total} vs {r.defender.total} — {w}
        </span>
      </div>
    )
  }
  if (r.type === 'free') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', minWidth: 72, fontWeight: 600 }}>
          {r.count}d{r.faces}
        </span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-muted)' }}>{r.total}</span>
      </div>
    )
  }
  if (r.type === 'combat') {
    const s = TRAMA_STYLE[r.trama]
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, color: 'var(--text-subtle)', minWidth: 72, fontWeight: 600 }}>{r.skillName}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-light)' }}>{r.attackTotal}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: '#fb923c' }}>{r.damageTotal} daño</span>
        {r.trama !== 'blank' && (
          <span style={{ fontSize: 10, fontWeight: 700, color: s.color }}>{s.label}</span>
        )}
      </div>
    )
  }
  return null
}

// ── Pestañas de tirada ─────────────────────────────────────────────────────

// Tab: Habilidad
function SkillTab({ onRoll, char }: { onRoll: (r: AnyRollResult) => void; char?: Character | null }) {
  const skills = char ? getCharSkills(char) : SKILLS
  const [skillName, setSkillName] = useState(skills[0])
  const [modifier, setModifier] = useState(0)
  const [advantage, setAdvantage] = useState<AdvantageMode>('normal')
  const [useTrama, setUseTrama] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof rollSkill> | null>(null)

  // Auto-rellenar modificador desde el personaje
  useEffect(() => {
    if (!char) return
    setModifier(getCharMod(char, skillName) ?? 0)
  }, [char, skillName])

  const handleRoll = () => {
    const effectiveMod = char ? (getCharMod(char, skillName) ?? 0) : modifier
    const r = rollSkill({ skillName, modifier: effectiveMod, advantage, useTrama })
    setResult(r)
    onRoll(r)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {char && <CharacterBadge char={char} />}

      {/* Skill selector */}
      <div>
        <label style={labelStyle}>Habilidad</label>
        <select
          value={skillName}
          onChange={(e) => setSkillName(e.target.value)}
          style={inputStyle}
        >
          {skills.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Modifier — oculto cuando hay personaje (se auto-rellena) */}
      {!char && (
        <div>
          <label style={labelStyle}>Modificador</label>
          <input
            type="number"
            value={modifier}
            onChange={(e) => setModifier(Number(e.target.value))}
            style={{ ...inputStyle, textAlign: 'center' }}
          />
        </div>
      )}

      {/* Advantage */}
      <div>
        <label style={labelStyle}>Ventaja / Desventaja</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['normal', 'ventaja', 'desventaja'] as AdvantageMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setAdvantage(m)}
              style={{
                flex: 1, padding: '6px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                border: `1px solid ${advantage === m ? 'rgba(180,190,254,0.35)' : 'var(--border)'}`,
                background: advantage === m ? 'rgba(180,190,254,0.12)' : 'transparent',
                color: advantage === m ? 'var(--brand-light)' : 'var(--text-subtle)',
                textTransform: 'capitalize', transition: 'all 0.1s',
              }}
            >
              {m === 'normal' ? 'Normal' : m === 'ventaja' ? '↑ Ventaja' : '↓ Desventaja'}
            </button>
          ))}
        </div>
      </div>

      {/* Dado de trama */}
      <TramaToggle value={useTrama} onChange={setUseTrama} />

      {/* Roll button */}
      <RollButton onClick={handleRoll} label={`Tirar ${skillName}`} />

      {/* Result */}
      {result && (
        <div style={{ borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', padding: 16 }}>
          {/* Dados d20 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            {result.d20b !== null ? (
              <>
                <div style={{ opacity: result.finalD20 === result.d20a ? 1 : 0.35, position: 'relative' }}>
                  <D20Display value={result.d20a} />
                  {result.finalD20 !== result.d20a && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--text-subtle)', pointerEvents: 'none' }}>╱</span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-subtle)', fontWeight: 300 }}>
                  {result.advantage === 'ventaja' ? '↑' : '↓'}
                </span>
                <div style={{ opacity: result.finalD20 === result.d20b ? 1 : 0.35, position: 'relative' }}>
                  <D20Display value={result.d20b} />
                  {result.finalD20 !== result.d20b && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--text-subtle)', pointerEvents: 'none' }}>╱</span>
                  )}
                </div>
              </>
            ) : (
              <D20Display value={result.finalD20} />
            )}
            <div style={{ flex: 1, paddingLeft: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>
                {result.total}
              </span>
              {result.modifier !== 0 && (
                <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>
                  d20 ({result.finalD20}) {result.modifier >= 0 ? '+' : ''}{result.modifier} = {result.total}
                </p>
              )}
            </div>
          </div>
          <TramaBadge result={result.trama} />
          {result.finalD20 === 20 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', marginTop: 10, textAlign: 'center', letterSpacing: '0.04em' }}>
              ✦ ¡NATURAL 20! — Oportunidad garantizada
            </p>
          )}
          {result.finalD20 === 1 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginTop: 10, textAlign: 'center', letterSpacing: '0.04em' }}>
              ✦ NATURAL 1 — Complicación garantizada
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Tab: Daño
function DamageTab({ onRoll }: { onRoll: (r: AnyRollResult) => void }) {
  const [count, setCount] = useState(1)
  const [faces, setFaces] = useState(6)
  const [modifier, setModifier] = useState(0)
  const [advantage, setAdvantage] = useState<AdvantageMode>('normal')
  const [result, setResult] = useState<ReturnType<typeof rollDamage> | null>(null)

  const handleRoll = () => {
    const r = rollDamage({ count, faces, modifier, advantage })
    setResult(r)
    onRoll(r)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Dice config */}
      <div>
        <label style={labelStyle}>Dados</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Count */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 10px' }}>
            <button onClick={() => setCount(Math.max(1, count - 1))} style={spinBtnStyle}>−</button>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'white', minWidth: 20, textAlign: 'center' }}>{count}</span>
            <button onClick={() => setCount(Math.min(10, count + 1))} style={spinBtnStyle}>+</button>
          </div>
          <span style={{ fontSize: 18, color: 'var(--text-subtle)', fontWeight: 300 }}>d</span>
          {/* Faces */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
            {DAMAGE_DICE.map((d) => (
              <button
                key={d}
                onClick={() => setFaces(d)}
                style={{
                  padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                  background: faces === d ? 'rgba(180,190,254,0.15)' : 'transparent',
                  border: `1px solid ${faces === d ? 'rgba(180,190,254,0.35)' : 'var(--border)'}`,
                  color: faces === d ? 'var(--brand-light)' : 'var(--text-subtle)',
                  transition: 'all 0.1s',
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4 }}>
          Tirando {count}d{faces}
        </p>
      </div>

      {/* Modifier */}
      <div>
        <label style={labelStyle}>Modificador</label>
        <input
          type="number"
          value={modifier}
          onChange={(e) => setModifier(Number(e.target.value))}
          style={{ ...inputStyle, textAlign: 'center' }}
        />
      </div>

      {/* Ventaja / Desventaja */}
      <div>
        <label style={labelStyle}>Ventaja / Desventaja</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['normal', 'ventaja', 'desventaja'] as AdvantageMode[]).map((m) => (
            <button key={m} onClick={() => setAdvantage(m)} style={{
              flex: 1, padding: '6px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              border: `1px solid ${advantage === m ? 'rgba(251,146,60,0.4)' : 'var(--border)'}`,
              background: advantage === m ? 'rgba(251,146,60,0.1)' : 'transparent',
              color: advantage === m ? '#fb923c' : 'var(--text-subtle)',
              transition: 'all 0.1s',
            }}>
              {m === 'normal' ? 'Normal' : m === 'ventaja' ? '↑ Ventaja' : '↓ Desventaja'}
            </button>
          ))}
        </div>
      </div>

      <RollButton onClick={handleRoll} label={`Tirar ${count}d${faces}`} color="#fb923c" />

      {/* Result */}
      {result && (
        <div style={{ borderRadius: 14, background: 'var(--surface-2)', border: '1px solid rgba(251,146,60,0.2)', padding: 16 }}>
          {result.diceAlt ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <DiceGroup dice={result.dice}    modifier={result.modifier} />
              <span style={{ fontSize: 18, color: 'var(--text-subtle)', fontWeight: 300 }}>
                {result.advantage === 'ventaja' ? '↑' : '↓'}
              </span>
              <DiceGroup dice={result.diceAlt} modifier={result.modifier} dimmed />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 8, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 900, color: '#fb923c', letterSpacing: '-0.04em' }}>{result.total}</span>
                <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>daño</span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {result.dice.map((v, i) => (
                  <span key={i} style={{
                    width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 800, color: 'var(--text-muted)',
                    background: 'var(--surface-1)', border: '1px solid var(--border)',
                  }}>{v}</span>
                ))}
              </div>
              {result.modifier !== 0 && (
                <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 6 }}>
                  Dados ({result.dice.reduce((a, b) => a + b, 0)}) {result.modifier >= 0 ? '+' : ''}{result.modifier} = {result.total}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Tab: Recuperación
function RecoveryTab({ onRoll, char }: { onRoll: (r: AnyRollResult) => void; char?: Character | null }) {
  const [voluntad, setVoluntad] = useState(char?.voluntad ?? 3)
  const [medicineBonus, setMedicineBonus] = useState(0)
  const [result, setResult] = useState<ReturnType<typeof rollRecovery> | null>(null)

  // Sincronizar voluntad si cambia el personaje
  useEffect(() => {
    if (char?.voluntad != null) setVoluntad(char.voluntad)
  }, [char])

  const faces = recoveryDieFaces(voluntad)

  const handleRoll = () => {
    const r = rollRecovery({ voluntad, medicineBonus })
    setResult(r)
    onRoll(r)
  }

  const VOLUNTAD_TABLE = [
    { range: '0', die: 'd4' }, { range: '1–2', die: 'd6' },
    { range: '3–4', die: 'd8' }, { range: '5–6', die: 'd10' },
    { range: '7–8', die: 'd12' }, { range: '9+', die: 'd20' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {char && <CharacterBadge char={char} />}

      {/* Voluntad */}
      <div>
        <label style={labelStyle}>Voluntad del personaje</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 12px' }}>
            <button onClick={() => setVoluntad(Math.max(0, voluntad - 1))} style={spinBtnStyle}>−</button>
            <span style={{ fontSize: 20, fontWeight: 900, color: 'white', minWidth: 24, textAlign: 'center' }}>{voluntad}</span>
            <button onClick={() => setVoluntad(voluntad + 1)} style={spinBtnStyle}>+</button>
          </div>
          <div style={{
            padding: '6px 14px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)',
          }}>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Dado:</span>
            <span style={{ fontSize: 18, fontWeight: 900, color: '#34d399' }}>d{faces}</span>
          </div>
        </div>
      </div>

      {/* Voluntad table */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
        {VOLUNTAD_TABLE.map(({ range, die }) => {
          const isActive = die === `d${faces}`
          return (
            <div key={range} style={{
              padding: '5px 8px', borderRadius: 8, textAlign: 'center',
              background: isActive ? 'rgba(52,211,153,0.08)' : 'transparent',
              border: `1px solid ${isActive ? 'rgba(52,211,153,0.25)' : 'var(--border)'}`,
            }}>
              <div style={{ fontSize: 9, color: 'var(--text-subtle)', marginBottom: 1 }}>VOL {range}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isActive ? '#34d399' : 'var(--text-muted)' }}>{die}</div>
            </div>
          )
        })}
      </div>

      {/* Medicine bonus */}
      <div>
        <label style={labelStyle}>Bonus Medicina (aliado)</label>
        <input
          type="number"
          value={medicineBonus}
          onChange={(e) => setMedicineBonus(Number(e.target.value))}
          placeholder="0"
          style={{ ...inputStyle, textAlign: 'center' }}
        />
        <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 4 }}>
          Un aliado puede añadir su modificador de Medicina a tu tirada durante el descanso.
        </p>
      </div>

      <RollButton onClick={handleRoll} label={`Tirar d${faces}`} color="#34d399" />

      {/* Result */}
      {result && (
        <div style={{ borderRadius: 14, background: 'var(--surface-2)', border: '1px solid rgba(52,211,153,0.2)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 40, fontWeight: 900, color: '#34d399', letterSpacing: '-0.04em' }}>
              +{result.result}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>puntos</span>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Distribuye entre <strong>Salud</strong> y/o <strong>Concentración</strong> como prefieras.
          </p>
          {result.medicineBonus !== 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
              Tirada ({result.result - result.medicineBonus}) + Medicina ({result.medicineBonus}) = {result.result}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// Tab: Enfrentada
function ContestedTab({ onRoll, char }: { onRoll: (r: AnyRollResult) => void; char?: Character | null }) {
  const charSkills = char ? getCharSkills(char) : SKILLS
  const [atkName, setAtkName] = useState(char?.name ?? 'Atacante')
  const [atkSkill, setAtkSkill] = useState(charSkills[0])
  const [defName, setDefName] = useState('Defensor')
  const [atkMod, setAtkMod] = useState(0)
  const [defMod, setDefMod] = useState(0)
  const [useTrama, setUseTrama] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof rollContested> | null>(null)

  // Sincronizar lado atacante con el personaje
  useEffect(() => {
    if (!char) return
    setAtkName(char.name)
    setAtkMod(getCharMod(char, atkSkill) ?? 0)
  }, [char, atkSkill])

  const handleRoll = () => {
    const effectiveAtkMod = char ? (getCharMod(char, atkSkill) ?? 0) : atkMod
    const r = rollContested({ attackerName: atkName, defenderName: defName, attackerMod: effectiveAtkMod, defenderMod: defMod, useTrama })
    setResult(r)
    onRoll(r)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {char && <CharacterBadge char={char} />}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Attacker */}
        <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-light)', letterSpacing: '0.08em', marginBottom: 8 }}>ATACANTE</p>
          <input
            value={atkName}
            onChange={(e) => setAtkName(e.target.value)}
            style={{ ...inputStyle, marginBottom: 8, fontSize: 12 }}
            placeholder="Nombre"
          />
          {char ? (
            <>
              <label style={labelStyle}>Habilidad</label>
              <select
                value={atkSkill}
                onChange={(e) => setAtkSkill(e.target.value)}
                style={{ ...inputStyle, marginBottom: 8, fontSize: 12 }}
              >
                {charSkills.map((s) => <option key={s}>{s}</option>)}
              </select>
            </>
          ) : null}
          <label style={labelStyle}>Modificador</label>
          <input
            type="number"
            value={atkMod}
            onChange={(e) => setAtkMod(Number(e.target.value))}
            style={{ ...inputStyle, textAlign: 'center' }}
          />
        </div>

        {/* Defender */}
        <div style={{ padding: 12, borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>DEFENSOR</p>
          <input
            value={defName}
            onChange={(e) => setDefName(e.target.value)}
            style={{ ...inputStyle, marginBottom: 8, fontSize: 12 }}
            placeholder="Nombre"
          />
          <label style={labelStyle}>Modificador</label>
          <input
            type="number"
            value={defMod}
            onChange={(e) => setDefMod(Number(e.target.value))}
            style={{ ...inputStyle, textAlign: 'center' }}
          />
        </div>
      </div>

      {/* Dado de trama */}
      <TramaToggle value={useTrama} onChange={setUseTrama} />

      <RollButton onClick={handleRoll} label="Tirar enfrentada" color="var(--brand-light)" />

      {/* Result */}
      {result && (() => {
        const atkWin = result.winner === 'attacker'
        const tie = result.winner === 'tie'
        return (
          <div style={{ borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', padding: 16 }}>
            {/* Winner banner */}
            <div style={{
              textAlign: 'center', marginBottom: 14, padding: '6px 0',
              borderRadius: 8, fontSize: 13, fontWeight: 800,
              background: tie ? 'rgba(148,163,184,0.08)' : atkWin ? 'rgba(180,190,254,0.1)' : 'rgba(239,68,68,0.1)',
              color: tie ? 'var(--text-subtle)' : atkWin ? 'var(--brand-light)' : '#f87171',
            }}>
              {tie ? 'Empate' : `${result.winner === 'attacker' ? result.attackerName : result.defenderName} gana`}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 8, alignItems: 'center' }}>
              {/* Attacker side */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--brand-light)', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {result.attackerName.toUpperCase()}
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: atkWin ? 'var(--brand-light)' : 'var(--text-muted)', letterSpacing: '-0.04em' }}>
                  {result.attacker.total}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
                  d20 ({result.attacker.d20}) {result.attacker.modifier >= 0 ? '+' : ''}{result.attacker.modifier}
                </p>
              </div>

              <span style={{ fontSize: 18, color: 'var(--text-subtle)', fontWeight: 300 }}>vs</span>

              {/* Defender side */}
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {result.defenderName.toUpperCase()}
                </p>
                <p style={{ fontSize: 28, fontWeight: 900, color: !atkWin && !tie ? '#f87171' : 'var(--text-muted)', letterSpacing: '-0.04em' }}>
                  {result.defender.total}
                </p>
                <p style={{ fontSize: 10, color: 'var(--text-subtle)' }}>
                  d20 ({result.defender.d20}) {result.defender.modifier >= 0 ? '+' : ''}{result.defender.modifier}
                </p>
              </div>
            </div>

            {result.attacker.trama !== 'blank' && (
              <div style={{ marginTop: 12, textAlign: 'center' }}>
                <TramaBadge result={result.attacker.trama} />
              </div>
            )}
          </div>
        )
      })()}
    </div>
  )
}

// Tab: Libre
function FreeTab({ onRoll }: { onRoll: (r: AnyRollResult) => void }) {
  const [count, setCount] = useState(1)
  const [faces, setFaces] = useState(20)
  const [result, setResult] = useState<ReturnType<typeof rollFree> | null>(null)

  const handleRoll = () => {
    const r = rollFree(count, faces)
    setResult(r)
    onRoll(r)
  }

  const QUICK_DICE = [4, 6, 8, 10, 12, 20, 100]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Count */}
      <div>
        <label style={labelStyle}>Número de dados</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 12px' }}>
            <button onClick={() => setCount(Math.max(1, count - 1))} style={spinBtnStyle}>−</button>
            <span style={{ fontSize: 20, fontWeight: 900, color: 'white', minWidth: 24, textAlign: 'center' }}>{count}</span>
            <button onClick={() => setCount(Math.min(20, count + 1))} style={spinBtnStyle}>+</button>
          </div>
          <span style={{ fontSize: 20, fontWeight: 300, color: 'var(--text-subtle)' }}>d{faces}</span>
        </div>
      </div>

      {/* Faces */}
      <div>
        <label style={labelStyle}>Caras del dado</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {QUICK_DICE.map((d) => (
            <button
              key={d}
              onClick={() => setFaces(d)}
              style={{
                padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700,
                background: faces === d ? 'rgba(180,190,254,0.15)' : 'transparent',
                border: `1px solid ${faces === d ? 'rgba(180,190,254,0.35)' : 'var(--border)'}`,
                color: faces === d ? 'var(--brand-light)' : 'var(--text-subtle)',
                transition: 'all 0.1s',
              }}
            >
              d{d}
            </button>
          ))}
        </div>
        {/* Custom faces */}
        <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Otro:</span>
          <input
            type="number"
            value={faces}
            min={2}
            onChange={(e) => setFaces(Math.max(2, Number(e.target.value)))}
            style={{ ...inputStyle, width: 72, textAlign: 'center' }}
          />
        </div>
      </div>

      <RollButton onClick={handleRoll} label={`Tirar ${count}d${faces}`} />

      {/* Result */}
      {result && (
        <div style={{ borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>{result.total}</span>
            {result.count > 1 && <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>total</span>}
          </div>
          {result.count > 1 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {result.results.map((v, i) => (
                <span key={i} style={{
                  minWidth: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: 'var(--text-muted)', padding: '0 6px',
                  background: 'var(--surface-1)', border: '1px solid var(--border)',
                }}>
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Tab: Combate (ataque + daño simultáneos)
function CombatTab({ onRoll, char }: { onRoll: (r: AnyRollResult) => void; char?: Character | null }) {
  const WEAPON_SKILLS = ['Armas ligeras', 'Armas pesadas', 'Agilidad']
  const [skillName, setSkillName] = useState('Armas ligeras')
  const [attackMod, setAttackMod] = useState(0)
  const [advantage, setAdvantage] = useState<AdvantageMode>('normal')
  const [diceCount, setDiceCount] = useState(1)
  const [diceFaces, setDiceFaces] = useState(6)
  const [damageMod, setDamageMod] = useState(0)
  const [damageAdvantage, setDamageAdvantage] = useState<AdvantageMode>('normal')
  const [useTrama, setUseTrama] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof rollCombat> | null>(null)

  // Auto-rellenar modificador de ataque desde el personaje
  useEffect(() => {
    if (!char) return
    setAttackMod(getCharMod(char, skillName) ?? 0)
  }, [char, skillName])

  const handleRoll = () => {
    const effectiveAttackMod = char ? (getCharMod(char, skillName) ?? 0) : attackMod
    const r = rollCombat({ skillName, attackModifier: effectiveAttackMod, advantage, diceCount, diceFaces, damageModifier: damageMod, damageAdvantage, useTrama })
    setResult(r)
    onRoll(r)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {char && <CharacterBadge char={char} />}

      {/* Arma */}
      <div>
        <label style={labelStyle}>Habilidad de ataque</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {WEAPON_SKILLS.map((s) => (
            <button key={s} onClick={() => setSkillName(s)} style={{
              flex: 1, padding: '6px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              border: `1px solid ${skillName === s ? 'rgba(180,190,254,0.35)' : 'var(--border)'}`,
              background: skillName === s ? 'rgba(180,190,254,0.12)' : 'transparent',
              color: skillName === s ? 'var(--brand-light)' : 'var(--text-subtle)',
              transition: 'all 0.1s',
            }}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Modificador ataque — oculto cuando hay personaje (se auto-rellena) */}
      {!char && (
        <div>
          <label style={labelStyle}>Mod. ataque</label>
          <input type="number" value={attackMod} onChange={(e) => setAttackMod(Number(e.target.value))} style={{ ...inputStyle, textAlign: 'center' }} />
        </div>
      )}

      {/* Ventaja */}
      <div>
        <label style={labelStyle}>Ventaja / Desventaja</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['normal', 'ventaja', 'desventaja'] as AdvantageMode[]).map((m) => (
            <button key={m} onClick={() => setAdvantage(m)} style={{
              flex: 1, padding: '6px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              border: `1px solid ${advantage === m ? 'rgba(180,190,254,0.35)' : 'var(--border)'}`,
              background: advantage === m ? 'rgba(180,190,254,0.12)' : 'transparent',
              color: advantage === m ? 'var(--brand-light)' : 'var(--text-subtle)',
              textTransform: 'capitalize', transition: 'all 0.1s',
            }}>
              {m === 'normal' ? 'Normal' : m === 'ventaja' ? '↑ Ventaja' : '↓ Desventaja'}
            </button>
          ))}
        </div>
      </div>

      {/* Separador visual daño */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>DAÑO</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Dados de daño */}
      <div>
        <label style={labelStyle}>Dados</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '4px 10px' }}>
            <button onClick={() => setDiceCount(Math.max(1, diceCount - 1))} style={spinBtnStyle}>−</button>
            <span style={{ fontSize: 16, fontWeight: 800, color: 'white', minWidth: 20, textAlign: 'center' }}>{diceCount}</span>
            <button onClick={() => setDiceCount(Math.min(10, diceCount + 1))} style={spinBtnStyle}>+</button>
          </div>
          <span style={{ fontSize: 18, color: 'var(--text-subtle)', fontWeight: 300 }}>d</span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flex: 1 }}>
            {DAMAGE_DICE.map((d) => (
              <button key={d} onClick={() => setDiceFaces(d)} style={{
                padding: '5px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                background: diceFaces === d ? 'rgba(251,146,60,0.15)' : 'transparent',
                border: `1px solid ${diceFaces === d ? 'rgba(251,146,60,0.35)' : 'var(--border)'}`,
                color: diceFaces === d ? '#fb923c' : 'var(--text-subtle)',
                transition: 'all 0.1s',
              }}>
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ventaja daño */}
      <div>
        <label style={labelStyle}>Ventaja / Desventaja daño</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['normal', 'ventaja', 'desventaja'] as AdvantageMode[]).map((m) => (
            <button key={m} onClick={() => setDamageAdvantage(m)} style={{
              flex: 1, padding: '6px 4px', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700,
              border: `1px solid ${damageAdvantage === m ? 'rgba(251,146,60,0.4)' : 'var(--border)'}`,
              background: damageAdvantage === m ? 'rgba(251,146,60,0.1)' : 'transparent',
              color: damageAdvantage === m ? '#fb923c' : 'var(--text-subtle)',
              transition: 'all 0.1s',
            }}>
              {m === 'normal' ? 'Normal' : m === 'ventaja' ? '↑ Ventaja' : '↓ Desventaja'}
            </button>
          ))}
        </div>
      </div>

      {/* Mod. daño */}
      <div>
        <label style={labelStyle}>Mod. daño</label>
        <input type="number" value={damageMod} onChange={(e) => setDamageMod(Number(e.target.value))} style={{ ...inputStyle, textAlign: 'center' }} />
      </div>

      {/* Dado de trama */}
      <TramaToggle value={useTrama} onChange={setUseTrama} />

      <RollButton onClick={handleRoll} label={`Atacar con ${skillName}`} color="#fb923c" />

      {/* Resultado combinado */}
      {result && (
        <div style={{ borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Ataque */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            {result.d20b !== null ? (
              <>
                <div style={{ opacity: result.finalD20 === result.d20a ? 1 : 0.35, position: 'relative' }}>
                  <D20Display value={result.d20a} />
                  {result.finalD20 !== result.d20a && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--text-subtle)', pointerEvents: 'none' }}>╱</span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: 'var(--text-subtle)', fontWeight: 300 }}>
                  {result.advantage === 'ventaja' ? '↑' : '↓'}
                </span>
                <div style={{ opacity: result.finalD20 === result.d20b ? 1 : 0.35, position: 'relative' }}>
                  <D20Display value={result.d20b} />
                  {result.finalD20 !== result.d20b && (
                    <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: 'var(--text-subtle)', pointerEvents: 'none' }}>╱</span>
                  )}
                </div>
              </>
            ) : (
              <D20Display value={result.finalD20} />
            )}
            <div style={{ flex: 1, paddingLeft: 4 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-0.04em' }}>{result.attackTotal}</span>
              {result.attackModifier !== 0 && (
                <p style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 2 }}>
                  d20 ({result.finalD20}) {result.attackModifier >= 0 ? '+' : ''}{result.attackModifier} = {result.attackTotal}
                </p>
              )}
            </div>
          </div>
          <TramaBadge result={result.trama} />

          {/* Separador */}
          <div style={{ height: 1, background: 'var(--border)' }} />

          {/* Daño */}
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 32, fontWeight: 900, color: '#fb923c', letterSpacing: '-0.04em' }}>{result.damageTotal}</span>
              <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>daño</span>
            </div>
            {result.diceAlt ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <DiceGroup dice={result.dice}    modifier={result.damageModifier} />
                <span style={{ fontSize: 16, color: 'var(--text-subtle)', fontWeight: 300 }}>
                  {result.damageAdvantage === 'ventaja' ? '↑' : '↓'}
                </span>
                <DiceGroup dice={result.diceAlt} modifier={result.damageModifier} dimmed />
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {result.dice.map((v, i) => (
                    <span key={i} style={{
                      width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 800, color: 'var(--text-muted)',
                      background: 'var(--surface-1)', border: '1px solid var(--border)',
                    }}>{v}</span>
                  ))}
                </div>
                {result.damageModifier !== 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 6 }}>
                    Dados ({result.dice.reduce((a, b) => a + b, 0)}) {result.damageModifier >= 0 ? '+' : ''}{result.damageModifier} = {result.damageTotal}
                  </p>
                )}
              </>
            )}
          </div>

          {result.finalD20 === 20 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', textAlign: 'center', letterSpacing: '0.04em' }}>
              ✦ ¡NATURAL 20! — Oportunidad garantizada
            </p>
          )}
          {result.finalD20 === 1 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textAlign: 'center', letterSpacing: '0.04em' }}>
              ✦ NATURAL 1 — Complicación garantizada
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ── Helpers de estilo compartidos ──────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'var(--text-subtle)', letterSpacing: '0.06em',
  marginBottom: 5, textTransform: 'uppercase',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 12px', borderRadius: 10,
  background: 'var(--surface-2)', border: '1px solid var(--border)',
  color: 'var(--text)', fontSize: 14, fontWeight: 600,
  outline: 'none',
}

const spinBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-subtle)', fontSize: 18, lineHeight: 1,
  padding: '0 2px', display: 'flex', alignItems: 'center',
}

function RollButton({ onClick, label, color }: { onClick: () => void; label: string; color?: string }) {
  const c = color ?? 'var(--brand-light)'
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', padding: '12px', borderRadius: 12, cursor: 'pointer',
        fontSize: 14, fontWeight: 800, letterSpacing: '0.02em',
        background: `linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 100%)`,
        backgroundImage: 'none',
        backgroundColor: 'transparent',
        border: `1.5px solid ${c}`,
        color: c,
        transition: 'all 0.15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `${c}18`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      🎲 {label}
    </button>
  )
}

// ── Tab: Registro (tiradas compartidas en tiempo real) ─────────────────────

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

function RollTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    skill: '🎯', damage: '⚔️', recovery: '💚', contested: '⚡', free: '🎲',
  }
  return <span>{icons[type] ?? '🎲'}</span>
}

function RegistroEntry({ roll, myUserId }: { roll: DiceRollResponse; myUserId: number }) {
  const isMe = roll.userId === myUserId
  const parsed: AnyRollResult | null = (() => {
    try { return JSON.parse(roll.rollData) } catch { return null }
  })()

  const trama: TramaDieResult | null =
    parsed && 'trama' in parsed ? (parsed as { trama: TramaDieResult }).trama : null
  const ts = TRAMA_STYLE[trama ?? 'blank']

  // Nombre principal a mostrar: personaje si existe, si no el usuario
  const displayName = roll.characterName ?? roll.userDisplayName
  // Si el GM está personificando a un personaje, mostrar "(GM)" como aclaración
  const gmSuffix = roll.characterName && isMe ? ' (GM)' : ''

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: isMe ? 'flex-end' : 'flex-start',
      gap: 3,
    }}>
      {/* Name + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {!isMe && (
          <span style={{ fontSize: 10, fontWeight: 700, color: roll.characterName ? '#a78bfa' : 'var(--brand-light)' }}>
            {displayName}
          </span>
        )}
        <span style={{ fontSize: 9, color: 'var(--text-subtle)' }}>
          {formatTime(roll.createdAt)}
        </span>
        {isMe && (
          <span style={{ fontSize: 10, fontWeight: 700, color: roll.characterName ? '#a78bfa' : 'var(--text-subtle)' }}>
            {roll.characterName ? `${roll.characterName}${gmSuffix}` : 'Tú'}
          </span>
        )}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '90%', padding: '8px 12px', borderRadius: 12,
        borderBottomRightRadius: isMe ? 4 : 12,
        borderBottomLeftRadius: isMe ? 12 : 4,
        background: isMe ? 'rgba(180,190,254,0.1)' : 'var(--surface-2)',
        border: `1px solid ${isMe ? 'rgba(180,190,254,0.2)' : 'var(--border)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <RollTypeIcon type={roll.rollType} />
          <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
            {roll.rollLabel}
          </span>
        </div>
        {trama && trama !== 'blank' && (
          <span style={{
            display: 'inline-block', fontSize: 10, fontWeight: 700,
            padding: '1px 8px', borderRadius: 20, marginTop: 2,
            background: ts.bg, border: `1px solid ${ts.border}`, color: ts.color,
          }}>
            {ts.label}
          </span>
        )}
      </div>
    </div>
  )
}

function RegistroTab({ campaignId }: { campaignId: number }) {
  const [rolls, setRolls] = useState<DiceRollResponse[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const myUserId = useAuthStore((s) => s.user?.id ?? 0)

  // Load initial rolls
  useEffect(() => {
    setLoading(true)
    diceRollsApi.getRecent(campaignId, 50)
      .then(setRolls)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [campaignId])

  // Listen for new rolls via SignalR (passed from parent via context / prop)
  // Parent registers the handler and passes new rolls down
  // → handled by the addRoll callback below, exposed via window event for simplicity
  useEffect(() => {
    const handler = (e: Event) => {
      const roll = (e as CustomEvent<DiceRollResponse>).detail
      setRolls((prev) => [...prev, roll])
    }
    window.addEventListener('diceRollReceived', handler)
    return () => window.removeEventListener('diceRollReceived', handler)
  }, [])

  // Auto-scroll to bottom when new rolls arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rolls])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-subtle)', fontSize: 13 }}>
        Cargando...
      </div>
    )
  }

  if (rolls.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 16px' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🎲</div>
        <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>
          Aún no hay tiradas en esta campaña.
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 4 }}>
          Las tiradas de todos los jugadores aparecerán aquí en tiempo real.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {rolls.map((r) => (
        <RegistroEntry key={r.id} roll={r} myUserId={myUserId} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────

type TabId = 'combat' | 'skill' | 'damage' | 'recovery' | 'contested' | 'free' | 'registro'

const TABS: { id: TabId; label: string }[] = [
  { id: 'combat',    label: '⚔️ Combate' },
  { id: 'skill',     label: 'Habilidad' },
  { id: 'damage',    label: 'Daño' },
  { id: 'recovery',  label: 'Recuperación' },
  { id: 'contested', label: 'Enfrentada' },
  { id: 'free',      label: 'Libre' },
  { id: 'registro',  label: '📜 Registro' },
]

export function DiceRoller() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('combat')
  const [history, setHistory] = useState<AnyRollResult[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [pendingRolls, setPendingRolls] = useState(0)
  const [playerCharacter, setPlayerCharacter] = useState<Character | null>(null)
  const [campaignChars, setCampaignChars] = useState<Character[]>([])
  const [gmSelectedChar, setGmSelectedChar] = useState<Character | null>(null)

  const { currentCampaign, isGm } = useCampaignStore()
  const campaignId = currentCampaign?.id ?? null
  const { user } = useAuthStore()

  // Cargar personajes según el rol
  useEffect(() => {
    if (!campaignId) { setPlayerCharacter(null); setCampaignChars([]); return }
    charactersApi.getAll(campaignId)
      .then((chars) => {
        if (isGm) {
          setCampaignChars(chars)
        } else {
          const mine = chars.find((c) => c.ownerId === user?.id) ?? null
          setPlayerCharacter(mine)
        }
      })
      .catch(() => { setPlayerCharacter(null); setCampaignChars([]) })
  }, [campaignId, isGm, user?.id])

  // El personaje efectivo: GM usa el seleccionado, jugador usa el suyo
  const effectiveChar = isGm ? gmSelectedChar : playerCharacter

  // ── SignalR: escuchar tiradas de otros jugadores ──
  const hubHandlers = useCallback(() => ({
    DiceRollReceived: (data: unknown) => {
      const roll = data as DiceRollResponse
      // Dispatch a custom event so RegistroTab can update without prop drilling
      window.dispatchEvent(new CustomEvent('diceRollReceived', { detail: roll }))
      // If registro tab is not open, show badge
      if (activeTab !== 'registro' || !open) {
        setPendingRolls((n) => n + 1)
      }
    },
  }), [activeTab, open])

  useCampaignHub(campaignId, hubHandlers())

  // Clear badge when registro tab is opened
  useEffect(() => {
    if (activeTab === 'registro' && open) setPendingRolls(0)
  }, [activeTab, open])

  // ── After each local roll: save to API (fire-and-forget) ──
  const handleRoll = useCallback((r: AnyRollResult) => {
    setHistory((prev) => [r, ...prev].slice(0, 15))
    if (!campaignId) return
    const label = buildRollLabel(r)
    const charName = effectiveChar?.name ?? null
    diceRollsApi.create(campaignId, r.type, r, label, charName).catch(() => {})
    // Note: the server will broadcast DiceRollReceived back to us too,
    // so RegistroTab will update automatically via SignalR
  }, [campaignId, effectiveChar])

  return (
    <>
      {/* ── FAB ─────────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        title="Lanzador de dados"
        style={{
          position: 'fixed',
          bottom: 'calc(72px + var(--sab, 0px))',
          right: 16,
          zIndex: 45,
          width: 48,
          height: 48,
          borderRadius: '50%',
          isolation: 'isolate',
          background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))',
          border: '1px solid rgba(180,190,254,0.3)',
          boxShadow: '0 4px 20px rgba(124,58,237,0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          fontSize: 22,
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(124,58,237,0.6)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.45)'
        }}
      >
        🎲
        {pendingRolls > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            minWidth: 18, height: 18, borderRadius: 9,
            background: '#ef4444',
            border: '2px solid var(--surface-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: 'white',
            lineHeight: 1, padding: '0 3px',
          }}>
            {pendingRolls > 9 ? '9+' : pendingRolls}
          </span>
        )}
      </button>

      {/* ── Overlay + bottom sheet ───────────────────────────── */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 55,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          <div
            style={{
              position: 'fixed', left: 0, right: 0, bottom: 0,
              zIndex: 56,
              background: 'var(--surface-1)',
              borderRadius: '20px 20px 0 0',
              border: '1px solid var(--border-bright)',
              borderBottom: 'none',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              paddingBottom: 'calc(16px + var(--sab, 0px))',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>

            {/* Header */}
            <div style={{ padding: '12px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                🎲 Lanzador de dados
              </h2>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: 6, borderRadius: 8, display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* History collapsible */}
            {history.length > 0 && (
              <div style={{ margin: '10px 20px 0', flexShrink: 0 }}>
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 12px', borderRadius: 10, cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    color: 'var(--text-subtle)',
                  }}
                >
                  <span>Historial ({history.length})</span>
                  {historyOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>
                {historyOpen && (
                  <div style={{
                    marginTop: 6, padding: '8px 12px', borderRadius: 10,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    display: 'flex', flexDirection: 'column', gap: 7,
                    maxHeight: 160, overflowY: 'auto',
                  }}>
                    {history.map((r, i) => <HistoryEntry key={i} r={r} />)}
                  </div>
                )}
              </div>
            )}

            {/* Selector "Tirar como" — solo visible para el GM */}
            {isGm && campaignChars.length > 0 && (
              <div style={{
                margin: '10px 20px 0', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                  TIRAR COMO
                </span>
                <select
                  value={gmSelectedChar?.id ?? ''}
                  onChange={(e) => {
                    const id = Number(e.target.value)
                    setGmSelectedChar(id ? (campaignChars.find((c) => c.id === id) ?? null) : null)
                  }}
                  style={{
                    flex: 1, padding: '6px 10px', borderRadius: 10,
                    background: gmSelectedChar ? 'rgba(167,139,250,0.08)' : 'var(--surface-2)',
                    border: `1px solid ${gmSelectedChar ? 'rgba(167,139,250,0.3)' : 'var(--border)'}`,
                    color: gmSelectedChar ? '#a78bfa' : 'var(--text-subtle)',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  <option value="">🎭 GM (yo mismo)</option>
                  {campaignChars.map((c) => (
                    <option key={c.id} value={c.id}>
                      🗡️ {c.name}{c.playerName ? ` — ${c.playerName}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tab bar */}
            <div style={{
              display: 'flex', gap: 4, padding: '12px 20px 0',
              overflowX: 'auto', flexShrink: 0,
              scrollbarWidth: 'none',
            }}>
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    position: 'relative',
                    padding: '6px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 12, fontWeight: 700,
                    whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                    background: activeTab === t.id ? 'rgba(180,190,254,0.12)' : 'transparent',
                    border: `1px solid ${activeTab === t.id ? 'rgba(180,190,254,0.3)' : 'transparent'}`,
                    color: activeTab === t.id ? 'var(--brand-light)' : 'var(--text-subtle)',
                  }}
                >
                  {t.label}
                  {t.id === 'registro' && pendingRolls > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      minWidth: 16, height: 16, borderRadius: 8,
                      background: '#ef4444',
                      border: '2px solid var(--surface-1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 800, color: 'white',
                      lineHeight: 1, padding: '0 2px',
                    }}>
                      {pendingRolls > 9 ? '9+' : pendingRolls}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {activeTab === 'combat'    && <CombatTab    onRoll={handleRoll} char={effectiveChar} />}
              {activeTab === 'skill'     && <SkillTab     onRoll={handleRoll} char={effectiveChar} />}
              {activeTab === 'damage'    && <DamageTab    onRoll={handleRoll} />}
              {activeTab === 'recovery'  && <RecoveryTab  onRoll={handleRoll} char={effectiveChar} />}
              {activeTab === 'contested' && <ContestedTab onRoll={handleRoll} char={effectiveChar} />}
              {activeTab === 'free'      && <FreeTab      onRoll={handleRoll} />}
              {activeTab === 'registro'  && campaignId && <RegistroTab campaignId={campaignId} />}
              {activeTab === 'registro'  && !campaignId && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-subtle)', fontSize: 13 }}>
                  Selecciona una campaña para ver el registro de tiradas.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}
