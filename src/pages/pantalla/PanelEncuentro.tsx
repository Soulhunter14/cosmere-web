import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowRightLeft, BookOpen, ChevronDown, ChevronRight, ChevronUp, CopyPlus, Dices, EyeOff, LogOut, Pencil, Plus, Search, ShieldOff, Skull, Swords, Undo2, Users,
} from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { globalNpcsApi } from '../../api/global-npcs'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import type { Character } from '../../types'
import {
  Button, ConfirmDialog, Disclosure, EmptyState, ErrorMessage, Field, IconButton, Input, Segmented, Sheet, Spinner, Stepper, Switch, Textarea,
} from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { StatIcons } from '../../lib/gameIcons'
import { buildRollLabel, rollCombat, type CombatRollResult } from '../../utils/dice'
import { buttonReset, c, eyebrow, font, fs, numeral, pill, radius, shadow, tone, type Tone } from '../../theme'
import type { EstadoDef } from '../../worlds/types'
import { guardarPreferencia, leerPreferencia, usePantalla } from './contexto'
import {
  FASES, FASE_INFO, MAX_ENCUENTROS, actuoEnFase, anotar, aplicarDano, avanzarFase, curar, dejarACero, encuentroDe, encuentroEnPantalla,
  guardarTiradaPrivada, juegaEnFase, marcaDe, moverCombatiente, nombrarSerie, nombresNuevos, nuevoId, pasoRecurso, personajeEnCombate, registrarCambio, retirarCaidos,
  sacarDelCombate, tramo,
  type AtaqueDef, type Bando, type Combatiente, type Encuentro, type Fase, type MotivoSalida, type PantallaEstado, type Rango,
} from './estado'
import { deOtraEra, eraNumero, etiquetaEra, formatoDado, type EraNum } from './adversarios'
import { abrirEncuentro, anadirAdversario, anadirLibre, anadirPersonajes, asegurarEncuentro, cerrarEncuentro, nombreBase } from './encuentro'
import { RANGO_META } from './meta'
import { BarraRecurso, Conmutador, TecladoNumerico, Tesela } from './piezas'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }

/** Official action glyph of each turn: a fast turn has 2 actions, a slow one 3 */
const ICONO_TURNO = { rapido: 'accion-2', lento: 'accion-3' } as const

/** Mutates one combatant, in whichever open encounter it fights, inside a document change */
function conCombatiente(b: PantallaEstado, id: string, f: (x: Combatiente) => void) {
  const x = encuentroDe(b, id)?.combatientes.find((y) => y.id === id)
  if (x) f(x)
}

/** Mutates one open encounter by id inside a document change */
function conEncuentro(b: PantallaEstado, id: string, f: (e: Encuentro) => void) {
  const e = b.encuentros.find((x) => x.id === id)
  if (e) f(e)
}

/** How the list of those out of the fight names each reason */
const ETIQUETA_SALIDA: Record<MotivoSalida, string> = { derrotado: 'derrotado', huido: 'huido', rendido: 'rendido' }

/** Combatants that still have to act in the phase being played */
const pendientesDe = (e: Encuentro) => e.combatientes.filter((x) => !x.derrotado && juegaEnFase(x, e.fase) && !actuoEnFase(x, e.fase)).length

// ── Panel ────────────────────────────────────────────────────────────────────

export function PanelEncuentro() {
  const { cId, estado, actualizar, ultimoDiario } = usePantalla()
  const cfg = useWorldConfig()
  const enc = encuentroEnPantalla(estado)
  const [anadiendo, setAnadiendo] = useState(false)
  const [terminando, setTerminando] = useState(false)
  const [renombrando, setRenombrando] = useState(false)
  const [retirandoTodos, setRetirandoTodos] = useState(false)
  const [simultaneo, setSimultaneo] = useState(false)

  const { data: personajes = [] } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId) })
  // The characters that fight nowhere yet (with a split party, «Todo el grupo» never pulls one out of the other fight)
  const sinCombate = personajes.filter((ch) => !personajeEnCombate(estado, ch.id))

  const todoElGrupo = () =>
    actualizar((b) => {
      const libres = personajes.filter((ch) => !personajeEnCombate(b, ch.id))
      anadirPersonajes(b, asegurarEncuentro(b, 'Encuentro', ultimoDiario), libres, cfg.habilidades, cfg.features.bonosServidor, ultimoDiario)
    })

  if (!enc) {
    return (
      <div style={stack(16)}>
        <EmptyState
          icon={<Swords size={22} aria-hidden />}
          title="Sin encuentro en curso"
          description="Añade adversarios del catálogo, personajes o enemigos libres. También puedes prepararlo desde una escena o un combate de la aventura."
          action={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button icon={<Plus size={16} aria-hidden />} onClick={() => { actualizar((b) => { asegurarEncuentro(b, 'Encuentro', ultimoDiario) }); setAnadiendo(true) }}>
                Nuevo encuentro
              </Button>
              {personajes.length > 0 && (
                <Button variant="secondary" icon={<Users size={16} aria-hidden />} onClick={todoElGrupo}>
                  Empezar con el grupo
                </Button>
              )}
            </div>
          }
        />
        {anadiendo && <HojaAnadir onClose={() => setAnadiendo(false)} />}
      </div>
    )
  }

  const activos = enc.combatientes.filter((x) => !x.derrotado)
  const fuera = enc.combatientes.filter((x) => x.derrotado)
  const ultimaFase = enc.fase === FASES[FASES.length - 1]
  const varios = estado.encuentros.length > 1
  const siguiente = estado.encuentros.find((e) => e.id !== enc.id)
  const cambiarEnc = (f: (e: Encuentro) => void) => actualizar((b) => conEncuentro(b, enc.id, f))

  const terminar = () => {
    actualizar((b) => cerrarEncuentro(b, enc.id, ultimoDiario))
    setTerminando(false)
  }

  return (
    <div style={stack(18)}>
      {/* ── Open fights: one tab each, with its round, phase and who still has to act ── */}
      {varios && (
        <nav aria-label="Combates en curso" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {estado.encuentros.map((e) => {
            const on = e.id === enc.id
            const faltan = pendientesDe(e)
            return (
              <button
                key={e.id}
                type="button"
                aria-pressed={on}
                onClick={() => { if (!on) actualizar((b) => { b.encuentroActivo = e.id }) }}
                className="ui-btn"
                style={{
                  ...buttonReset, flex: '1 1 0', minWidth: 170, display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 12px', textAlign: 'left',
                  borderRadius: radius.md, background: on ? tone.rubi.bg : c.s1, border: `1px solid ${on ? tone.rubi.border : c.border}`,
                  boxShadow: on ? `inset 0 -3px 0 ${tone.rubi.fg}` : shadow[1],
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0, fontSize: fs.base, fontWeight: 650, color: on ? tone.rubi.fg : c.text }}>
                  <Swords size={14} aria-hidden style={{ flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.titulo}</span>
                </span>
                <span style={{ fontSize: fs.xs, color: c.muted, fontVariantNumeric: 'tabular-nums' }}>
                  Ronda {e.ronda} · {FASE_INFO[e.fase].label}{faltan ? ` · falta${faltan === 1 ? '' : 'n'} ${faltan}` : ''}
                </span>
              </button>
            )
          })}
        </nav>
      )}

      {/* ── Header: title, round, phases ── */}
      <section aria-label="Ronda y fases" style={{ ...stack(12), padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
            <span style={{ ...eyebrow, color: tone.rubi.fg }}>Ronda</span>
            <span style={{ ...numeral, fontSize: fs['2xl'], color: c.text }}>{enc.ronda}</span>
          </div>
          <h2 style={{ flex: 1, minWidth: 140, fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.2, color: c.text }}>
            {enc.titulo}
          </h2>
          <IconButton label="Cambiar el título del encuentro" variant="surface" size={40} onClick={() => setRenombrando(true)}>
            <Pencil size={16} aria-hidden />
          </IconButton>
        </div>

        <Segmented<Fase>
          ariaLabel="Fase de la ronda"
          tone="rubi"
          size="sm"
          value={enc.fase}
          onChange={(f) => cambiarEnc((e) => { e.fase = f })}
          options={FASES.map((f) => ({
            value: f,
            label: (
              <>
                <CosmereIcon name={ICONO_TURNO[FASE_INFO[f].turno]} size={14} />
                {FASE_INFO[f].label}
              </>
            ),
          }))}
        />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            icon={ultimaFase ? <Undo2 size={16} aria-hidden /> : <ChevronRight size={16} aria-hidden />}
            onClick={() => cambiarEnc((e) => { avanzarFase(e) })}
          >
            {ultimaFase ? 'Nueva ronda' : 'Fase siguiente'}
          </Button>
          <Button variant="secondary" icon={<Plus size={16} aria-hidden />} onClick={() => setAnadiendo(true)}>
            Añadir
          </Button>
          {sinCombate.length > 0 && (
            <Button variant="secondary" icon={<Users size={16} aria-hidden />} onClick={todoElGrupo}>
              {varios ? 'Resto del grupo' : 'Todo el grupo'}
            </Button>
          )}
          {estado.encuentros.length < MAX_ENCUENTROS ? (
            <Button variant="secondary" icon={<Swords size={16} aria-hidden />} onClick={() => setSimultaneo(true)}>
              Combate simultáneo
            </Button>
          ) : (
            <span style={{ alignSelf: 'center', fontSize: fs.xs, color: c.subtle }}>Máximo {MAX_ENCUENTROS} combates a la vez</span>
          )}
          <Button variant="ghost" onClick={() => setTerminando(true)} style={{ marginLeft: 'auto' }}>
            Terminar combate
          </Button>
        </div>
      </section>

      {/* ── One lane per phase (a Jefe is in both of its side) ── */}
      {FASES.map((fase) => {
        const lista = activos.filter((x) => juegaEnFase(x, fase))
        const enJuego = fase === enc.fase
        const titulo = `fase-${fase}`
        return (
          <section key={fase} aria-labelledby={titulo} style={stack(10)}>
            <h3
              id={titulo}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, margin: 0,
                fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: fs.lg + 1, fontWeight: 600, letterSpacing: '0.05em',
                color: enJuego ? tone.rubi.fg : c.muted,
              }}
            >
              <CosmereIcon name={ICONO_TURNO[FASE_INFO[fase].turno]} size={16} />
              {FASE_INFO[fase].label}
              <span style={{ fontFamily: font.ui, fontVariantCaps: 'normal', fontSize: fs.xs, color: c.subtle, letterSpacing: 0 }}>
                {lista.filter((x) => actuoEnFase(x, fase)).length}/{lista.length}
              </span>
              {enJuego && <span style={{ ...pill(tone.rubi), fontFamily: font.ui, fontVariantCaps: 'normal', letterSpacing: 0 }}>En juego</span>}
              <span aria-hidden style={{ flex: 1, height: 1, background: enJuego ? tone.rubi.border : 'var(--gold-rule)' }} />
            </h3>
            {lista.length === 0 ? (
              <p style={{ fontSize: fs.sm, color: c.subtle, paddingLeft: 4 }}>Nadie juega en esta fase.</p>
            ) : (
              <ul style={{ ...listReset, ...stack(10) }}>
                {lista.map((x) => (
                  <li key={`${fase}-${x.id}`}>
                    <TarjetaCombatiente cb={x} fase={fase} enJuego={enJuego} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}

      {fuera.length > 0 && (
        <Disclosure
          headingLevel={3}
          accent={tone.cuarzo.fg}
          icon={<Skull size={18} aria-hidden />}
          title={`Caídos (${fuera.length})`}
          summary="Llegaron a 0 y ya no juegan. Retíralos de la pantalla cuando quieras."
        >
          <div style={stack(10)}>
            <Button
              size="sm"
              variant="secondary"
              icon={<EyeOff size={15} aria-hidden />}
              onClick={() => setRetirandoTodos(true)}
              style={{ alignSelf: 'flex-start' }}
            >
              Retirar todos de la pantalla
            </Button>
            <ul style={{ ...listReset, ...stack(10) }}>
              {fuera.map((x) => (
                <li key={x.id}>
                  <TarjetaCombatiente cb={x} fase={null} enJuego={false} />
                </li>
              ))}
            </ul>
          </div>
        </Disclosure>
      )}
      {enc.retirados.length > 0 && (
        <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fs.sm, color: c.subtle, lineHeight: 1.5 }}>
          <EyeOff size={14} aria-hidden style={{ marginTop: 3, flexShrink: 0 }} />
          <span>Fuera del combate: {enc.retirados.map((r) => `${r.nombre} (${ETIQUETA_SALIDA[r.motivo]})`).join(', ')}</span>
        </p>
      )}

      {anadiendo && <HojaAnadir onClose={() => setAnadiendo(false)} />}
      {simultaneo && <HojaSimultaneo onClose={() => setSimultaneo(false)} onCreado={() => { setSimultaneo(false); setAnadiendo(true) }} />}
      {renombrando && <HojaTitulo enc={enc} onClose={() => setRenombrando(false)} />}
      <ConfirmDialog
        open={retirandoTodos}
        icon="trash"
        title={`¿Retirar ${fuera.length === 1 ? 'al caído' : `a los ${fuera.length} caídos`} de la pantalla?`}
        message="Desaparecen del encuentro; la bitácora los contará como derrotados al terminar el combate."
        confirmLabel="Retirar"
        onConfirm={() => {
          cambiarEnc((e) => { retirarCaidos(e) })
          setRetirandoTodos(false)
        }}
        onCancel={() => setRetirandoTodos(false)}
      />
      <ConfirmDialog
        open={terminando}
        tone="brand"
        icon="warning"
        title={varios ? `¿Terminar «${enc.titulo}»?` : '¿Terminar el combate?'}
        message={`Se anota en la bitácora con las rondas y los derrotados, y el encuentro se vacía.${siguiente ? ` La pantalla pasa a «${siguiente.titulo}».` : ''}`}
        confirmLabel="Terminar combate"
        onConfirm={terminar}
        onCancel={() => setTerminando(false)}
      />
    </div>
  )
}

/** Characters to pick for a fight: those already here are fixed, those fighting elsewhere say where (they would move) */
function ListaPersonajes({
  personajes, encId, marcados, onCambio,
}: { personajes: Character[]; encId: string | null; marcados: number[]; onCambio: (ids: number[]) => void }) {
  const { estado } = usePantalla()
  return (
    <ul style={{ ...listReset, ...stack(6) }}>
      {personajes.map((ch) => {
        const donde = personajeEnCombate(estado, ch.id)?.enc ?? null
        const esta = donde !== null && donde.id === encId
        const on = marcados.includes(ch.id)
        return (
          <li key={ch.id}>
            <button
              type="button"
              aria-pressed={on}
              disabled={esta}
              onClick={() => onCambio(on ? marcados.filter((x) => x !== ch.id) : [...marcados, ch.id])}
              className="ui-row"
              style={{
                ...buttonReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '8px 12px',
                borderRadius: radius.md, background: on ? tone.brand.bg : c.s2, border: `1px solid ${on ? tone.brand.border : c.border}`,
                opacity: esta ? 0.55 : 1, cursor: esta ? 'not-allowed' : 'pointer',
              }}
            >
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: fs.base, fontWeight: 650, color: c.text }}>{ch.name}</span>
                <span style={{ display: 'block', fontSize: fs.xs, color: c.muted }}>{ch.playerName || 'Sin jugador'} · Nv. {ch.level}</span>
              </span>
              {esta ? <span style={pill(tone.cuarzo)}>Ya está</span> : donde && <span style={pill(tone.rubi)}>En «{donde.titulo}»</span>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** A second fight somewhere else at the same time: its own round and phases, and the characters that fight there */
function HojaSimultaneo({ onClose, onCreado }: { onClose: () => void; onCreado: () => void }) {
  const { cId, estado, actualizar, ultimoDiario } = usePantalla()
  const cfg = useWorldConfig()
  const { data: personajes = [] } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId) })
  const [titulo, setTitulo] = useState('')
  const [marcados, setMarcados] = useState<number[]>([])
  const mueve = marcados.some((id) => personajeEnCombate(estado, id))

  const empezar = () => {
    actualizar((b) => {
      const enc = abrirEncuentro(b, titulo, ultimoDiario)
      anadirPersonajes(b, enc, personajes.filter((ch) => marcados.includes(ch.id)), cfg.habilidades, cfg.features.bonosServidor, ultimoDiario)
    })
    onCreado()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Combate simultáneo"
      description="Otro combate a la vez, en otro lugar: lleva su ronda y sus fases, y la pantalla pasa a él. Cambias de uno a otro con las pestañas."
      maxWidth={560}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} onClick={empezar}>Empezar combate</Button>
        </>
      }
    >
      <div style={stack(14)}>
        <Field label="Título" hint="Dónde o contra quién. Si lo dejas vacío, se llama «Encuentro» con su número.">
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="En el muelle" data-autofocus />
        </Field>
        {personajes.length > 0 && (
          <div style={stack(8)}>
            <span style={eyebrow}>Personajes que luchan aquí</span>
            <ListaPersonajes personajes={personajes} encId={null} marcados={marcados} onCambio={setMarcados} />
            {mueve && (
              <p style={{ fontSize: fs.xs, color: c.muted }}>Los que están en otro combate se mueven a este con su salud y sus estados.</p>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}

// ── Combatant card ───────────────────────────────────────────────────────────

type Hoja = null | 'salud' | 'editar' | 'estado' | 'ficha' | 'retirar' | { estado: number }

function TarjetaCombatiente({ cb, fase, enJuego }: { cb: Combatiente; fase: Fase | null; enJuego: boolean }) {
  const { actualizar } = usePantalla()
  const cfg = useWorldConfig()
  const [hoja, setHoja] = useState<Hoja>(null)
  const [ultima, setUltima] = useState<{ ataque: string; r: CombatRollResult } | null>(null)
  const [expandido, setExpandido] = useState(false)
  const [retirando, setRetirando] = useState(false)
  const cambiar = (f: (x: Combatiente) => void) => actualizar((b) => conCombatiente(b, cb.id, f))

  const rango = cb.rango ? RANGO_META[cb.rango] : null
  const pj = cb.bando === 'pj'
  const acento = pj ? tone.brand : tone.rubi
  const actuo = fase ? actuoEnFase(cb, fase) : false
  const nombreEstado = (id: string) => cfg.estados.find((e) => e.id === id)?.nombre ?? id

  const tirarAtaque = (a: AtaqueDef) => {
    const r = rollCombat({
      skillName: `${cb.nombre} · ${a.nombre}`,
      attackModifier: a.bono,
      advantage: 'normal',
      diceCount: a.impacto?.dados ?? 1,
      diceFaces: a.impacto?.caras ?? 4,
      damageModifier: a.impacto?.mod ?? 0,
      useTrama: false,
    })
    setUltima({ ataque: a.nombre, r })
    actualizar((b) => guardarTiradaPrivada(b, { quien: cb.nombre, etiqueta: buildRollLabel(r), resultado: r }))
  }

  // Each step also goes to the record of the Tiradas panel (quick taps join one line)
  const recursoPaso = (clave: 'concentracion' | 'investidura', d: number) =>
    actualizar((b) => conCombatiente(b, cb.id, (x) => pasoRecurso(b, x, clave, d)))

  const marcarActuado = () => {
    if (!fase) return
    cambiar((x) => { if (FASE_INFO[fase].turno === 'rapido') x.actuoRapido = !x.actuoRapido; else x.actuoLento = !x.actuoLento })
  }
  const borde = enJuego && !actuo ? acento.border : c.border
  const sombra = enJuego && !actuo ? `inset 3px 0 0 ${acento.fg}, ${shadow[1]}` : shadow[1]

  // Turn (fast/slow) and reaction: shown on the folded PJ card and on the full one
  const controlTurno = cb.rango === 'jefe' ? (
    <span style={pill(tone.rubi)} title="El Jefe juega un turno rápido y uno lento cada ronda">Rápido y lento</span>
  ) : (
    <Segmented<'rapido' | 'lento'>
      ariaLabel={`Turno de ${cb.nombre}`}
      size="sm"
      stretch={false}
      tone={pj ? 'brand' : 'rubi'}
      value={cb.turno}
      onChange={(t) => cambiar((x) => { x.turno = t })}
      options={[
        { value: 'rapido', label: 'Rápido' },
        { value: 'lento', label: 'Lento' },
      ]}
    />
  )
  const controlReaccion = (
    <Conmutador
      compacto
      activo={cb.reaccionUsada}
      t={tone.topacio}
      titulo={cb.reaccionUsada ? 'Reacción usada (toca para recuperarla)' : 'Reacción disponible (toca al usarla)'}
      icono={<CosmereIcon name="reaccion" size={16} />}
      etiqueta={cb.reaccionUsada ? 'Usada' : 'Reacción'}
      onClick={() => cambiar((x) => { x.reaccionUsada = !x.reaccionUsada })}
    />
  )

  // A PJ is folded by default: the players keep their own health, so the director marks its turn, whether it acted and its
  // reaction, and sees its defenses and deflect for the rolls made with real dice; the arrow opens everything else
  if (pj && !expandido) {
    return (
      <article
        aria-label={cb.nombre}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 8px 8px 12px', borderRadius: radius.lg,
          background: c.s1, border: `1px solid ${borde}`, boxShadow: sombra, opacity: fase && actuo ? 0.72 : 1,
        }}
      >
        <Tesela t={acento} tam={32}>
          <span style={{ fontFamily: font.title, fontSize: fs.md }}>{marcaDe(cb)}</span>
        </Tesela>
        <span style={{ flex: '1 1 140px', minWidth: 0, fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text, overflowWrap: 'anywhere' }}>
          {cb.nombre}
          {cb.estados.length > 0 && (
            <span style={{ display: 'block', fontFamily: font.ui, fontSize: fs.xs, fontWeight: 600, color: tone.topacio.fg }}>
              {cb.estados.map((e) => `${nombreEstado(e.id)}${e.valor ? ` [${e.valor}]` : ''}`).join(' · ')}
            </span>
          )}
          <DefensasEnLinea cb={cb} />
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {controlTurno}
          {fase && (
            <Conmutador compacto activo={actuo} etiqueta="Actuado" titulo={`${cb.nombre} ha actuado en ${FASE_INFO[fase].label}`} onClick={marcarActuado} />
          )}
          {controlReaccion}
          <IconButton label={`Mostrar las opciones de ${cb.nombre}`} aria-expanded={false} variant="surface" size={36} onClick={() => setExpandido(true)}>
            <ChevronDown size={16} aria-hidden />
          </IconButton>
        </span>
      </article>
    )
  }

  return (
    <article
      aria-label={cb.nombre}
      style={{
        ...stack(12), padding: 14, borderRadius: radius.lg,
        background: c.s1, border: `1px solid ${borde}`, boxShadow: sombra,
        opacity: cb.derrotado || (fase && actuo) ? 0.72 : 1,
      }}
    >
      {/* Identity + turn controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Tesela t={acento} tam={38}>
          <span style={{ fontFamily: font.title, fontSize: fs.lg }}>{marcaDe(cb)}</span>
        </Tesela>
        {/* A wide basis: when the turn controls do not fit beside a long name they drop to their own line */}
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <button
            type="button"
            onClick={() => setHoja('editar')}
            aria-label={`Editar ${cb.nombre}`}
            style={{ ...buttonReset, display: 'block', maxWidth: '100%', fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, lineHeight: 1.2, color: c.text, overflowWrap: 'anywhere' }}
          >
            {cb.nombre}
          </button>
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={pill(acento)}>{pj ? 'PJ' : 'PNJ'}</span>
            {rango && <span style={pill(rango.tone)}>{rango.label}</span>}
            {cb.derrotado && <span style={pill(tone.cuarzo)}><Skull size={12} aria-hidden />Derrotado</span>}
          </span>
        </div>
        {!cb.derrotado && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {controlTurno}
            {fase && (
              <Conmutador
                compacto
                activo={actuo}
                etiqueta="Actuado"
                titulo={`${cb.nombre} ha actuado en ${FASE_INFO[fase].label}`}
                onClick={marcarActuado}
              />
            )}
            {controlReaccion}
          </div>
        )}
        {cb.adversarioId !== null && (
          <IconButton label={`Ficha de ${cb.nombre}`} variant="surface" size={36} onClick={() => setHoja('ficha')}>
            <BookOpen size={16} aria-hidden />
          </IconButton>
        )}
        <IconButton label={`Retirar a ${cb.nombre} del combate (huye, se rinde…)`} variant="surface" size={36} onClick={() => setHoja('retirar')}>
          <LogOut size={16} aria-hidden />
        </IconButton>
        {pj && (
          <IconButton label={`Plegar las opciones de ${cb.nombre}`} aria-expanded variant="surface" size={36} onClick={() => setExpandido(false)}>
            <ChevronUp size={16} aria-hidden />
          </IconButton>
        )}
      </div>

      {/* Health */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 180px', minWidth: 0 }}>
          <BarraRecurso etiqueta="Salud" icono={<StatIcons.salud size={13} aria-hidden />} actual={cb.salud.actual} max={cb.salud.max} t={tone.granate} alto={10} />
        </div>
        <Button size="sm" variant="danger" onClick={() => setHoja('salud')}>Daño / Curar</Button>
      </div>

      {/* Focus and Investiture (adversaries: the director spends them; a character tracks its own) */}
      {!pj && (cb.concentracion.max > 0 || cb.investidura.max > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 10 }}>
          {cb.concentracion.max > 0 && (
            <Recurso etiqueta="Concentración" t={tone.heliodoro} icono={<StatIcons.concentracion size={13} aria-hidden />} actual={cb.concentracion.actual} max={cb.concentracion.max} onPaso={(d) => recursoPaso('concentracion', d)} />
          )}
          {cb.investidura.max > 0 && (
            <Recurso etiqueta="Investidura" t={tone.amatista} icono={<cfg.iconos.investidura size={13} aria-hidden />} actual={cb.investidura.actual} max={cb.investidura.max} onPaso={(d) => recursoPaso('investidura', d)} />
          )}
        </div>
      )}

      {/* Defenses, deflect, immunities */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px 14px', flexWrap: 'wrap' }}>
        <Defensa etiqueta="Física" valor={cb.defensas.fisica} t={tone.granate} />
        <Defensa etiqueta="Cognitiva" valor={cb.defensas.cognitiva} t={tone.zafiro} />
        <Defensa etiqueta="Espiritual" valor={cb.defensas.espiritual} t={tone.amatista} />
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted }}>
          <CosmereIcon name="marco-desvio" size={18} style={{ color: tone.topacio.fg }} />
          Desvío <strong style={{ ...numeral, fontSize: fs.md, color: c.text }}>{cb.desvio}</strong>
          {cb.desvioNota && <span style={{ fontSize: fs.xs, color: c.subtle }}>({cb.desvioNota})</span>}
        </span>
        {cb.inmunidades.length > 0 && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: fs.xs, color: c.subtle }}>
            <ShieldOff size={13} aria-hidden />
            Inmune: {cb.inmunidades.join(', ')}
          </span>
        )}
      </div>

      {/* Conditions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        {cb.estados.map((e, i) => (
          <button
            key={`${e.id}-${i}`}
            type="button"
            onClick={() => setHoja({ estado: i })}
            aria-haspopup="dialog"
            aria-label={`Estado ${nombreEstado(e.id)}${e.valor ? ` ${e.valor}` : ''}: ver o quitar`}
            className="ui-btn"
            style={{ ...pill(tone.topacio), minHeight: 32, cursor: 'pointer', borderRadius: radius.sm }}
          >
            {nombreEstado(e.id)}{e.valor ? ` [${e.valor}]` : ''}
          </button>
        ))}
        {!cb.derrotado && (
          <Button size="sm" variant="ghost" icon={<Plus size={14} aria-hidden />} onClick={() => setHoja('estado')} style={{ minHeight: 32 }}>
            Estado
          </Button>
        )}
      </div>

      {/* Attacks of the stat block: one tap rolls a private attack + damage */}
      {cb.ataques.length > 0 && !cb.derrotado && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {cb.ataques.map((a, i) => (
            <button
              key={`${a.nombre}-${i}`}
              type="button"
              onClick={() => tirarAtaque(a)}
              aria-label={`Tirar ${a.nombre}: ataque +${a.bono}, daño ${formatoDado(a.impacto)} (tirada privada)`}
              className="ui-btn ui-btn--secondary"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 36, padding: '0 10px', borderRadius: radius.sm, cursor: 'pointer',
                background: c.s2, border: `1px solid ${c.borderBright}`, color: c.text, fontSize: fs.sm, fontWeight: 600,
              }}
            >
              <Dices size={14} aria-hidden style={{ color: tone.rubi.fg }} />
              {a.nombre} <span style={{ color: c.muted, fontVariantNumeric: 'tabular-nums' }}>+{a.bono} · {formatoDado(a.impacto)}{a.nota ? ` ${a.nota}` : ''}</span>
            </button>
          ))}
        </div>
      )}
      {ultima && (
        <p role="status" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 12px', borderRadius: radius.md, background: tone.rubi.bg, border: `1px solid ${tone.rubi.border}`, fontSize: fs.sm, color: c.text }}>
          <Dices size={15} aria-hidden style={{ color: tone.rubi.fg }} />
          <span>{ultima.ataque}:</span>
          <strong style={{ ...numeral, fontSize: fs.lg }}>{ultima.r.attackTotal}</strong>
          <span style={{ color: c.muted }}>
            (d20 {ultima.r.finalD20}{ultima.r.finalD20 === 20 ? ', ¡20 natural!' : ultima.r.finalD20 === 1 ? ', 1 natural' : ''})
          </span>
          <span>→ Impacto <strong style={numeral}>{ultima.r.damageTotal}</strong></span>
          <span>· Rasguño <strong style={numeral}>{ultima.r.dice.reduce((s, d) => s + d, 0)}</strong></span>
        </p>
      )}

      {cb.notas && (
        <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5, whiteSpace: 'pre-line', paddingLeft: 10, borderLeft: '2px solid var(--gold-border)' }}>
          {cb.notas}
        </p>
      )}

      {cb.derrotado && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => actualizar((b) => conCombatiente(b, cb.id, (x) => {
              const antes = x.salud.actual
              x.derrotado = false
              if (x.salud.actual === 0) x.salud.actual = 1
              x.estados = x.estados.filter((e) => e.id !== 'inconsciente')
              registrarCambio(b, x, 'estado', `Vuelve al combate · ${tramo('salud', antes, x.salud.actual, x.salud.max)}`)
            }))}
          >
            Vuelve al combate
          </Button>
          <Button size="sm" variant="ghost" icon={<EyeOff size={15} aria-hidden />} onClick={() => setRetirando(true)}>
            Retirar de la pantalla
          </Button>
        </div>
      )}
      <ConfirmDialog
        open={retirando}
        icon="trash"
        title={`¿Retirar a ${cb.nombre} de la pantalla?`}
        message="Desaparece del encuentro; la bitácora lo contará como derrotado al terminar el combate."
        confirmLabel="Retirar"
        onConfirm={() => {
          actualizar((b) => {
            const e = encuentroDe(b, cb.id)
            if (e) retirarCaidos(e, cb.id)
          })
          setRetirando(false)
        }}
        onCancel={() => setRetirando(false)}
      />

      {hoja === 'salud' && <HojaSalud cb={cb} onClose={() => setHoja(null)} />}
      {hoja === 'ficha' && <HojaFicha cb={cb} onClose={() => setHoja(null)} />}
      {hoja === 'retirar' && <HojaRetirar cb={cb} onClose={() => setHoja(null)} />}
      {hoja === 'editar' && <HojaEditar cb={cb} onClose={() => setHoja(null)} />}
      {hoja === 'estado' && <HojaEstadoNuevo cb={cb} estados={cfg.estados} onClose={() => setHoja(null)} />}
      {hoja && typeof hoja === 'object' && cb.estados[hoja.estado] && (
        <HojaEstadoAplicado cb={cb} indice={hoja.estado} estados={cfg.estados} onClose={() => setHoja(null)} />
      )}
    </article>
  )
}

function Defensa({ etiqueta, valor, t, compacta = false }: { etiqueta: string; valor: number; t: Tone; compacta?: boolean }) {
  const tam = compacta ? 24 : 30
  return (
    <span title={`Defensa ${etiqueta.toLowerCase()}`} style={{ display: 'inline-flex', alignItems: 'center', gap: compacta ? 3 : 6 }}>
      <span style={{ position: 'relative', width: tam, height: tam, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <CosmereIcon name="marco-defensa" size={tam} style={{ position: 'absolute', inset: 0, margin: 'auto', color: t.fg }} />
        <span style={{ ...numeral, position: 'relative', fontSize: compacta ? fs.xs : fs.sm, color: c.text, marginTop: 1 }}>{valor}</span>
      </span>
      <span style={{ fontSize: fs.xs, color: compacta ? t.fg : c.subtle, fontWeight: compacta ? 700 : 400 }}>{compacta ? etiqueta[0] : etiqueta}</span>
    </span>
  )
}

/** The three defenses and the deflect in one short line (folded card): what a roll made with real dice is resolved against */
function DefensasEnLinea({ cb }: { cb: Combatiente }) {
  const d = cb.defensas
  return (
    <span
      role="img"
      aria-label={`Defensa física ${d.fisica}, cognitiva ${d.cognitiva}, espiritual ${d.espiritual}; desvío ${cb.desvio}`}
      style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 6, fontFamily: font.ui, fontWeight: 400 }}
    >
      <Defensa compacta etiqueta="Física" valor={d.fisica} t={tone.granate} />
      <Defensa compacta etiqueta="Cognitiva" valor={d.cognitiva} t={tone.zafiro} />
      <Defensa compacta etiqueta="Espiritual" valor={d.espiritual} t={tone.amatista} />
      <span title="Desvío" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: fs.xs, color: c.muted }}>
        <CosmereIcon name="marco-desvio" size={18} style={{ color: tone.topacio.fg }} />
        <strong style={{ ...numeral, fontSize: fs.sm, color: c.text }}>{cb.desvio}</strong>
      </span>
    </span>
  )
}

function Recurso({
  etiqueta, t, icono, actual, max, onPaso,
}: { etiqueta: string; t: Tone; icono: ReactNode; actual: number; max: number; onPaso: (d: number) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <BarraRecurso etiqueta={etiqueta} icono={icono} actual={actual} max={max} t={t} />
      </div>
      <IconButton label={`Gastar ${etiqueta.toLowerCase()}`} size={36} variant="surface" disabled={actual <= 0} onClick={() => onPaso(-1)}>
        <span aria-hidden style={{ fontSize: fs.lg, fontWeight: 700 }}>−</span>
      </IconButton>
      <IconButton label={`Recuperar ${etiqueta.toLowerCase()}`} size={36} variant="surface" disabled={actual >= max} onClick={() => onPaso(1)}>
        <span aria-hidden style={{ fontSize: fs.lg, fontWeight: 700 }}>+</span>
      </IconButton>
    </div>
  )
}

// ── Sheets ───────────────────────────────────────────────────────────────────

/** Action cost written by the transcriptions at the start of a line («1 Acometida…», «r Carroñero…») → official glyph */
const ICONO_COSTE: Record<string, string> = { '1': 'accion-1', '2': 'accion-2', '3': 'accion-3', '0': 'accion-gratuita', r: 'reaccion' }

/**
 * Stat block of a catalog adversary (traits, actions, tactics) without leaving the encounter. In a campaign with an era, the lines
 * the book marks for the other era are left out and a note says how many
 */
function HojaFicha({ cb, onClose }: { cb: Combatiente; onClose: () => void }) {
  const { cId } = usePantalla()
  const era = eraNumero(useEra())
  const { data: catalogo, isLoading, isError } = useQuery({ queryKey: ['global-npcs', cId], queryFn: () => globalNpcsApi.getAll(cId) })
  const npc = catalogo?.find((n) => n.id === cb.adversarioId)
  const ocultas = npc ? `${npc.talentos}\n${npc.notas}`.split('\n').filter((l) => deOtraEra(l, era)).length : 0
  return (
    <Sheet
      open
      onClose={onClose}
      title={npc?.name ?? cb.nombre}
      description={npc ? `${npc.tipo}${npc.source ? ` · ${npc.source}` : ''}` : undefined}
      maxWidth={680}
      footer={<Button size="lg" style={{ flex: 1 }} onClick={onClose}>Cerrar</Button>}
    >
      {isLoading ? (
        <Spinner label="Cargando la ficha…" />
      ) : !npc ? (
        <p style={{ fontSize: fs.sm, color: c.muted }}>
          {isError ? 'No se pudo cargar el catálogo de adversarios. Cierra la ficha y vuelve a abrirla.' : 'Este adversario ya no está en el catálogo.'}
        </p>
      ) : (
        <div style={stack(18)}>
          <SeccionFicha titulo="Rasgos" texto={npc.talentos} era={era} />
          <SeccionFicha titulo="Acciones y notas" texto={npc.notas} era={era} />
          {ocultas > 0 && (
            <p style={{ fontSize: fs.xs, color: c.subtle }}>
              {ocultas === 1 ? 'Se oculta 1 capacidad' : `Se ocultan ${ocultas} capacidades`} que el libro marca solo para la Era {era === 1 ? 2 : 1}.
            </p>
          )}
        </div>
      )}
    </Sheet>
  )
}

/** The world's chip of an era («Era 1» / «Era 2»), as the catalog shows the items of one era */
function ChipEra({ era }: { era: 1 | 2 }) {
  const { eras } = useWorldConfig()
  const def = eras?.find((e) => e.id === `era${era}`)
  return <span style={{ ...pill(def?.tone ?? tone.cuarzo), marginRight: 6 }}>{def?.label ?? `Era ${era}`}</span>
}

function SeccionFicha({ titulo, texto, era }: { titulo: string; texto: string; era: EraNum }) {
  const lineas = texto.split('\n').map((l) => l.trim()).filter((l) => l && !deOtraEra(l, era))
  if (lineas.length === 0) return null
  return (
    <section style={stack(8)}>
      <h3 style={{ ...eyebrow, color: tone.rubi.fg }}>{titulo}</h3>
      {lineas.map((linea, i) => {
        // The book's era mark becomes the era chip, after the action's title
        const marca = etiquetaEra(linea)
        const limpia = marca ? linea.replace(/\s*\bERA\s*[12]\b\s*/, ' ').trim() : linea
        const coste = /^([0-3r])\s+(.*)$/.exec(limpia)
        const resto = coste ? coste[2] : limpia
        // An action's title runs to its first full stop («Escoltar (Coste: 1 punto de concentración).»); other lines, to the colon
        const m = coste ? /^(.{1,90}?\.)(\s.*)$/.exec(resto) : /^([^:]{1,60}:)(\s.*)$/.exec(resto)
        const chip = marca ? <ChipEra era={marca} /> : null
        return (
          <p key={i} style={{ display: 'flex', gap: 8, fontSize: fs.sm + 1, lineHeight: 1.55, color: c.text, paddingLeft: 10, borderLeft: '2px solid var(--gold-border)' }}>
            {coste && <CosmereIcon name={ICONO_COSTE[coste[1]]} size={16} title={coste[1] === 'r' ? 'Reacción' : coste[1] === '0' ? 'Acción gratuita' : `${coste[1]} acción${coste[1] === '1' ? '' : 'es'}`} style={{ marginTop: 3, color: tone.rubi.fg }} />}
            <span>{m ? <><strong style={{ fontWeight: 700 }}>{m[1]}</strong> {chip}{m[2].trimStart()}</> : <>{chip}{resto}</>}</span>
          </p>
        )
      })}
    </section>
  )
}

/**
 * «Restar el desvío» of the health keypad, remembered on the device. On by default: the number typed is the attacker's damage and
 * the book takes the deflect off energy, impact and keen damage; the sheet always shows the sum. (New key: the first version
 * stored «off» as its default.)
 */
const PREF_DESVIO = 'cosmere-pantalla-restar-desvio-v2'
const esBool = (v: unknown): v is boolean => typeof v === 'boolean'

/** Log line of a fall: a PNJ goes to «Caídos»; a PJ stays, unconscious and injured */
const textoCaida = (x: Combatiente) =>
  x.bando === 'pj' ? `${x.nombre} queda Inconsciente y sufre una lesión`
    : x.rango === 'secuaz' ? `${x.nombre} cae derrotado`
      : `${x.nombre} cae inconsciente`

/** End of a record line when the blow drops it to 0 */
const finCaida = (x: Combatiente) => (x.bando === 'pj' ? ' · Inconsciente y con una lesión' : x.rango === 'secuaz' ? ' · derrotado' : ' · inconsciente')

function HojaSalud({ cb, onClose }: { cb: Combatiente; onClose: () => void }) {
  const { actualizar, ultimoDiario } = usePantalla()
  const [valor, setValor] = useState('')
  const [restarDesvio, setRestarDesvioEstado] = useState(() => leerPreferencia(PREF_DESVIO, true, esBool))
  const setRestarDesvio = (v: boolean) => {
    setRestarDesvioEstado(v)
    guardarPreferencia(PREF_DESVIO, v)
  }
  const n = Number(valor || 0)
  const restar = restarDesvio && cb.desvio > 0
  const sufrido = Math.max(0, n - (restar ? cb.desvio : 0))
  const trasDano = Math.max(0, cb.salud.actual - sufrido)
  const trasCura = Math.min(cb.salud.max, cb.salud.actual + n)

  // Every change also goes to the record of the Tiradas panel, next to the rolls («Recibe 7 de daño (10 − 3 de desvío) · salud 12 → 5/14»)
  const aplicar = (modo: 'dano' | 'cura' | 'cero') => {
    actualizar((b) =>
      conCombatiente(b, cb.id, (x) => {
        const antes = x.salud.actual
        if (modo === 'cura') {
          curar(x, n)
          registrarCambio(b, x, 'cura', `Se cura ${x.salud.actual - antes} · ${tramo('salud', antes, x.salud.actual, x.salud.max)}`)
          return
        }
        const { sufrido, cae } = modo === 'cero' ? dejarACero(x) : aplicarDano(x, n, restar)
        const detalle = modo === 'cero' ? 'Queda a 0' : restar ? `Recibe ${sufrido} de daño (${n} − ${x.desvio} de desvío)` : `Recibe ${sufrido} de daño`
        registrarCambio(b, x, 'dano', `${detalle} · ${tramo('salud', antes, x.salud.actual, x.salud.max)}${cae ? finCaida(x) : ''}`)
        if (cae) anotar(b, { tipo: 'combate', etiqueta: 'Combate', texto: textoCaida(x) }, ultimoDiario)
      }),
    )
    onClose()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Salud de ${cb.nombre}`}
      description={`Ahora ${cb.salud.actual} de ${cb.salud.max}${cb.desvio ? ` · desvío ${cb.desvio}` : ''}`}
      maxWidth={420}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} disabled={n <= 0} onClick={() => aplicar('cura')}>
            Curar → {trasCura}
          </Button>
          <Button variant="danger" size="lg" style={{ flex: 1 }} disabled={n <= 0} onClick={() => aplicar('dano')}>
            Daño {sufrido} → {trasDano}
          </Button>
        </>
      }
    >
      <div style={stack(14)}>
        <output
          aria-live="polite"
          style={{
            display: 'block', textAlign: 'center', padding: '10px 0', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`,
            ...numeral, fontSize: fs['3xl'], color: valor ? c.text : c.subtle,
          }}
        >
          {valor || '0'}
        </output>
        {/* The sum of the damage, always in sight: «Daño 5 − 1 por desvío = 4» */}
        {cb.desvio > 0 && n > 0 && (
          <p
            role="status"
            style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, flexWrap: 'wrap', padding: '8px 12px',
              borderRadius: radius.md, background: restar ? tone.topacio.bg : c.s2, border: `1px solid ${restar ? tone.topacio.border : c.border}`,
              fontSize: fs.md, color: c.text,
            }}
          >
            {restar ? (
              <>
                <span>Daño <strong style={numeral}>{n}</strong></span>
                <span style={{ color: tone.topacio.fg, fontWeight: 650 }}>− {cb.desvio} por desvío{cb.desvioNota ? ` (${cb.desvioNota})` : ''}</span>
                <span>=</span>
                <strong style={{ ...numeral, fontSize: fs.xl }}>{sufrido}</strong>
              </>
            ) : (
              <span style={{ color: c.muted }}>Daño <strong style={{ ...numeral, color: c.text }}>{n}</strong>, sin restar el desvío ({cb.desvio})</span>
            )}
          </p>
        )}
        <TecladoNumerico valor={valor} onChange={setValor} etiqueta="Cantidad" />
        {cb.desvio > 0 && (
          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: fs.sm, color: c.text }}>
            <span>
              Restar el desvío ({cb.desvio}{cb.desvioNota ? ` · ${cb.desvioNota}` : ''})
              <span style={{ display: 'block', fontSize: fs.xs, color: c.subtle }}>
                Energía, golpe y laceración. Quítalo para el daño espiritual o vital, o si ya lo has restado tú.
              </span>
            </span>
            <Switch checked={restarDesvio} onChange={setRestarDesvio} label="Restar el desvío" />
          </label>
        )}
        {cb.salud.actual > 0 && (
          <Button variant="ghost" icon={<Skull size={16} aria-hidden />} onClick={() => aplicar('cero')} style={{ alignSelf: 'center' }}>
            Dejar a 0
          </Button>
        )}
      </div>
    </Sheet>
  )
}

/** Conditions that may be on a combatant more than once («Afligido» by two effects, «Agotado» that stacks…): those with a value */
const acumulable = (def: EstadoDef | undefined) => !!def?.valor

function HojaEstadoNuevo({ cb, estados, onClose }: { cb: Combatiente; estados: EstadoDef[]; onClose: () => void }) {
  const { actualizar } = usePantalla()
  const [sel, setSel] = useState<string | null>(null)
  const [valor, setValor] = useState('')
  const def = estados.find((e) => e.id === sel)
  const inmune = (d: EstadoDef) => cb.inmunidades.some((i) => i.toLowerCase() === d.nombre.toLowerCase())

  const aplicar = () => {
    if (!def) return
    actualizar((b) =>
      conCombatiente(b, cb.id, (x) => {
        const i = x.estados.findIndex((e) => e.id === def.id)
        if (i >= 0 && !acumulable(def)) x.estados[i].valor = valor.trim()
        else x.estados.push({ id: def.id, valor: valor.trim() })
        registrarCambio(b, x, 'estado', `Estado: ${def.nombre}${valor.trim() ? ` [${valor.trim()}]` : ''}`)
      }),
    )
    onClose()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={`Estado para ${cb.nombre}`}
      maxWidth={560}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} disabled={!def} onClick={aplicar}>Aplicar</Button>
        </>
      }
    >
      <div style={stack(12)}>
        <div role="group" aria-label="Estados" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
          {estados.map((e) => {
            const on = e.id === sel
            return (
              <button
                key={e.id}
                type="button"
                aria-pressed={on}
                onClick={() => { setSel(e.id); setValor('') }}
                className="ui-btn"
                style={{
                  ...buttonReset, display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 12px', borderRadius: radius.md, textAlign: 'left',
                  background: on ? tone.topacio.bg : c.s2, border: `1px solid ${on ? tone.topacio.border : c.border}`,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.base, fontWeight: 650, color: on ? tone.topacio.fg : c.text }}>
                  {e.nombre}
                  {inmune(e) && <span style={pill(tone.cuarzo)}>Inmune</span>}
                </span>
                <span style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.4 }}>{e.resumen}</span>
              </button>
            )
          })}
        </div>
        {def?.valor && (
          <Field label={`Valor de ${def.nombre}`} hint="Lo que el efecto pone entre corchetes.">
            <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder={def.valor} data-autofocus />
          </Field>
        )}
      </div>
    </Sheet>
  )
}

function HojaEstadoAplicado({ cb, indice, estados, onClose }: { cb: Combatiente; indice: number; estados: EstadoDef[]; onClose: () => void }) {
  const { actualizar } = usePantalla()
  const aplicado = cb.estados[indice]
  const def = estados.find((e) => e.id === aplicado.id)
  const [valor, setValor] = useState(aplicado.valor)
  const nombre = def?.nombre ?? aplicado.id
  const cambiar = (f: (x: Combatiente) => void, linea: string) => {
    actualizar((b) => conCombatiente(b, cb.id, (x) => { f(x); registrarCambio(b, x, 'estado', linea) }))
    onClose()
  }
  return (
    <Sheet
      open
      onClose={onClose}
      title={`${def?.nombre ?? aplicado.id} · ${cb.nombre}`}
      description={def?.resumen}
      maxWidth={440}
      footer={
        <>
          <Button variant="danger" size="lg" style={{ flex: 1 }} onClick={() => cambiar((x) => { x.estados.splice(indice, 1) }, `Sin ${nombre}`)}>
            Quitar estado
          </Button>
          {(def?.valor || aplicado.valor) && (
            <Button
              size="lg"
              style={{ flex: 1 }}
              onClick={() => cambiar((x) => { if (x.estados[indice]) x.estados[indice].valor = valor.trim() }, `Estado: ${nombre}${valor.trim() ? ` [${valor.trim()}]` : ''}`)}
            >
              Guardar
            </Button>
          )}
        </>
      }
    >
      {def?.valor || aplicado.valor ? (
        <Field label="Valor">
          <Input value={valor} onChange={(e) => setValor(e.target.value)} placeholder={def?.valor} />
        </Field>
      ) : (
        <p style={{ fontSize: fs.sm, color: c.muted }}>Quítalo cuando termine su efecto.</p>
      )}
    </Sheet>
  )
}

function HojaEditar({ cb, onClose }: { cb: Combatiente; onClose: () => void }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const suyo = encuentroDe(estado, cb.id)
  const otros = estado.encuentros.filter((e) => e !== suyo)
  const [f, setF] = useState(() => ({
    nombre: cb.nombre,
    bando: cb.bando,
    rango: cb.rango ?? ('ninguno' as const),
    salud: String(cb.salud.max),
    concentracion: String(cb.concentracion.max),
    investidura: String(cb.investidura.max),
    fisica: String(cb.defensas.fisica),
    cognitiva: String(cb.defensas.cognitiva),
    espiritual: String(cb.defensas.espiritual),
    desvio: String(cb.desvio),
    notas: cb.notas,
  }))
  const [quitando, setQuitando] = useState(false)
  const num = (s: string, min = 0) => Math.max(min, Math.trunc(Number(s) || 0))
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }))

  const guardar = () => {
    actualizar((b) =>
      conCombatiente(b, cb.id, (x) => {
        x.nombre = f.nombre.trim() || x.nombre
        x.bando = f.bando
        x.rango = f.rango === 'ninguno' ? null : f.rango
        const ajusta = (r: { actual: number; max: number }, max: number) => { r.actual = Math.min(max, r.actual + Math.max(0, max - r.max)); r.max = max }
        ajusta(x.salud, num(f.salud, 1))
        ajusta(x.concentracion, num(f.concentracion))
        ajusta(x.investidura, num(f.investidura))
        x.defensas = { fisica: num(f.fisica), cognitiva: num(f.cognitiva), espiritual: num(f.espiritual) }
        x.desvio = num(f.desvio)
        x.notas = f.notas
      }),
    )
    onClose()
  }

  const duplicar = () => {
    actualizar((b) => {
      const enc = encuentroDe(b, cb.id)
      const x = enc?.combatientes.find((y) => y.id === cb.id)
      if (!enc || !x) return
      const [nombre] = nombrarSerie(enc, nombreBase(x.nombre.replace(/\s+\d+$/, '')), 1)
      enc.combatientes.push({
        ...structuredClone(x), id: nuevoId(), nombre, characterId: null, derrotado: false, estados: [],
        salud: { ...x.salud, actual: x.salud.max }, actuoRapido: false, actuoLento: false, reaccionUsada: false,
        concentracion: { ...x.concentracion, actual: x.concentracion.max }, investidura: { ...x.investidura, actual: x.investidura.max },
      })
    })
    onClose()
  }

  /** To another open fight, with its health and conditions; the log says so */
  const mover = (destino: Encuentro) => {
    actualizar((b) => {
      const origen = encuentroDe(b, cb.id)
      if (origen && moverCombatiente(b, cb.id, destino.id)) {
        // An enemy may join the series of its namesakes there under another number
        const ahora = encuentroDe(b, cb.id)?.combatientes.find((y) => y.id === cb.id)?.nombre ?? cb.nombre
        const como = ahora !== cb.nombre ? ` como ${ahora}` : ''
        anotar(b, { tipo: 'combate', etiqueta: 'Combate', texto: `${cb.nombre} pasa de «${origen.titulo}» a «${destino.titulo}»${como}` }, ultimoDiario)
      }
    })
    onClose()
  }

  const numero = (k: keyof typeof f, etiqueta: string) => (
    <Field label={etiqueta}>
      <Input type="number" inputMode="numeric" min={0} value={f[k]} onChange={set(k)} style={{ textAlign: 'center', fontVariantNumeric: 'tabular-nums' }} />
    </Field>
  )

  return (
    <>
      <Sheet
        open={!quitando}
        onClose={onClose}
        title={`Editar ${cb.nombre}`}
        maxWidth={560}
        footer={
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
            <Button size="lg" style={{ flex: 2 }} onClick={guardar}>Guardar</Button>
          </>
        }
      >
        <div style={stack(14)}>
          <Field label="Nombre">
            <Input value={f.nombre} onChange={set('nombre')} />
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <div>
              <span style={{ ...eyebrow, display: 'block', marginBottom: 8 }}>Bando</span>
              <Segmented<Bando> ariaLabel="Bando" value={f.bando} onChange={(v) => setF((p) => ({ ...p, bando: v }))}
                options={[{ value: 'pj', label: 'PJ' }, { value: 'pnj', label: 'PNJ' }]} />
            </div>
            <div>
              <span style={{ ...eyebrow, display: 'block', marginBottom: 8 }}>Rango</span>
              <Segmented<Rango | 'ninguno'> ariaLabel="Rango" size="sm" value={f.rango} onChange={(v) => setF((p) => ({ ...p, rango: v }))}
                options={[{ value: 'ninguno', label: '—', ariaLabel: 'Sin rango' }, { value: 'secuaz', label: 'Secuaz' }, { value: 'rival', label: 'Rival' }, { value: 'jefe', label: 'Jefe' }]} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
            {numero('salud', 'Salud máx.')}
            {numero('concentracion', 'Concentración máx.')}
            {numero('investidura', 'Investidura máx.')}
            {numero('fisica', 'Def. física')}
            {numero('cognitiva', 'Def. cognitiva')}
            {numero('espiritual', 'Def. espiritual')}
            {numero('desvio', 'Desvío')}
          </div>
          <Field label="Notas">
            <Textarea rows={3} value={f.notas} onChange={set('notas')} />
          </Field>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="secondary" icon={<CopyPlus size={16} aria-hidden />} onClick={duplicar}>Duplicar</Button>
            {otros.map((e) => (
              <Button key={e.id} variant="secondary" icon={<ArrowRightLeft size={16} aria-hidden />} onClick={() => mover(e)}>
                Mover a «{e.titulo}»
              </Button>
            ))}
            <Button variant="danger" icon={<LogOut size={16} aria-hidden />} onClick={() => setQuitando(true)}>Retirar del combate…</Button>
          </div>
        </div>
      </Sheet>
      {quitando && <HojaRetirar cb={cb} onClose={() => setQuitando(false)} onRetirado={onClose} />}
    </>
  )
}

type Salida = MotivoSalida | 'quitar'

/** The reasons to take a combatant out of the fight before its end, and what the log writes for each */
const SALIDAS: { id: Salida; titulo: string; detalle: string; t: Tone; bitacora?: (nombre: string) => string }[] = [
  { id: 'huido', titulo: 'Ha huido', detalle: 'Sale del combate; la bitácora lo anota y el resumen lo cuenta entre los que huyeron.', t: tone.topacio, bitacora: (n) => `${n} huye` },
  { id: 'rendido', titulo: 'Se rinde', detalle: 'Sale del combate; la bitácora lo anota y el resumen lo cuenta entre los que se rindieron.', t: tone.zafiro, bitacora: (n) => `${n} se rinde` },
  { id: 'derrotado', titulo: 'Derrotado', detalle: 'Fuera de combate (atado, dormido, capturado…): cuenta entre los derrotados del resumen.', t: tone.cuarzo, bitacora: (n) => `${n} queda fuera de combate` },
  { id: 'quitar', titulo: 'Quitar sin más', detalle: 'Desaparece del encuentro sin dejar rastro, con su salud y sus estados: para quien se añadió por error.', t: tone.rubi },
]

/**
 * Takes a combatant out of the fight, saying why. `onClose` cancels (back to where it was opened) and `onRetirado` follows the
 * exit; «Quitar sin más» deletes without a trace, so it asks once more
 */
function HojaRetirar({ cb, onClose, onRetirado = onClose }: { cb: Combatiente; onClose: () => void; onRetirado?: () => void }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const [confirmando, setConfirmando] = useState(false)
  // A fallen enemy can no longer flee or surrender: it leaves as defeated (or is removed)
  const caido = cb.derrotado && cb.bando === 'pnj'
  const opciones = caido ? SALIDAS.filter((s) => s.id === 'derrotado' || s.id === 'quitar') : SALIDAS
  const [motivo, setMotivo] = useState<Salida>(caido ? 'derrotado' : 'huido')
  const elegida = opciones.find((s) => s.id === motivo) ?? opciones[0]
  const varios = estado.encuentros.length > 1

  const retirar = () => {
    actualizar((b) => {
      const enc = encuentroDe(b, cb.id)
      const x = enc?.combatientes.find((y) => y.id === cb.id)
      if (!enc || !x) return
      if (motivo === 'quitar') {
        sacarDelCombate(enc, cb.id, null)
        return
      }
      // The record line first: it still finds the fight the combatant is in
      registrarCambio(b, x, 'estado', `Sale del combate: ${elegida.titulo.toLowerCase()}`)
      sacarDelCombate(enc, cb.id, motivo)
      anotar(b, { tipo: 'combate', etiqueta: 'Combate', texto: `${elegida.bitacora?.(x.nombre) ?? x.nombre}${varios ? ` («${enc.titulo}»)` : ''}` }, ultimoDiario)
    })
    onRetirado()
  }

  return (
    <>
      <Sheet
        open={!confirmando}
        onClose={onClose}
        title={`Retirar a ${cb.nombre} del combate`}
        maxWidth={520}
        footer={
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
            <Button variant="danger" size="lg" style={{ flex: 2 }} onClick={() => (motivo === 'quitar' ? setConfirmando(true) : retirar())}>
              {motivo === 'quitar' ? 'Quitar' : 'Retirar'}
            </Button>
          </>
        }
      >
        <div role="radiogroup" aria-label="Por qué sale del combate" style={stack(8)}>
          {opciones.map((s) => {
            const on = s.id === motivo
            return (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setMotivo(s.id)}
                className="ui-btn"
                style={{
                  ...buttonReset, display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 12px', borderRadius: radius.md, textAlign: 'left',
                  background: on ? s.t.bg : c.s2, border: `1px solid ${on ? s.t.border : c.border}`,
                }}
              >
                <span style={{ fontSize: fs.base, fontWeight: 650, color: on ? s.t.fg : c.text }}>{s.titulo}</span>
                <span style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.4 }}>{s.detalle}</span>
              </button>
            )
          })}
        </div>
      </Sheet>
      <ConfirmDialog
        open={confirmando}
        title={`¿Quitar a ${cb.nombre} sin más?`}
        message="Desaparece del encuentro con su salud y sus estados, y ni la bitácora ni el resumen lo cuentan."
        confirmLabel="Quitar"
        onConfirm={retirar}
        onCancel={() => setConfirmando(false)}
      />
    </>
  )
}

function HojaTitulo({ enc, onClose }: { enc: Encuentro; onClose: () => void }) {
  const { actualizar } = usePantalla()
  const [valor, setValor] = useState(enc.titulo)
  const guardar = () => {
    actualizar((b) => conEncuentro(b, enc.id, (e) => {
      const [titulo] = nombresNuevos(valor.trim() || 'Encuentro', 1, b.encuentros.filter((x) => x.id !== e.id).map((x) => x.titulo))
      e.titulo = titulo
    }))
    onClose()
  }
  return (
    <Sheet
      open
      onClose={onClose}
      title="Título del encuentro"
      maxWidth={420}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} onClick={guardar}>Guardar</Button>
        </>
      }
    >
      <Field label="Título">
        <Input value={valor} onChange={(e) => setValor(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && guardar()} data-autofocus />
      </Field>
    </Sheet>
  )
}

type Origen = 'catalogo' | 'personajes' | 'libre'

function HojaAnadir({ onClose }: { onClose: () => void }) {
  const { cId, estado, actualizar, ultimoDiario } = usePantalla()
  const cfg = useWorldConfig()
  const era = eraNumero(useEra())
  const destino = encuentroEnPantalla(estado)
  const [origen, setOrigen] = useState<Origen>('catalogo')
  const [busca, setBusca] = useState('')
  const [elegido, setElegido] = useState<number | null>(null)
  const [cantidad, setCantidad] = useState(1)
  const [marcados, setMarcados] = useState<number[]>([])
  const [libre, setLibre] = useState({ nombre: '', bando: 'pnj' as Bando, rango: 'ninguno' as Rango | 'ninguno', salud: '10', defensa: '12', desvio: '0' })

  const catalogo = useQuery({ queryKey: ['global-npcs', cId], queryFn: () => globalNpcsApi.getAll(cId) })
  const { data: personajes = [] } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId) })
  const mueve = marcados.some((id) => { const d = personajeEnCombate(estado, id); return d !== null && d.enc.id !== destino?.id })

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase()
    const todos = catalogo.data ?? []
    return q ? todos.filter((n) => `${n.name} ${n.tipo}`.toLowerCase().includes(q)) : todos
  }, [busca, catalogo.data])

  const anadir = () => {
    actualizar((b) => {
      const enc = asegurarEncuentro(b, 'Encuentro', ultimoDiario)
      if (origen === 'catalogo') {
        const npc = catalogo.data?.find((n) => n.id === elegido)
        if (npc) anadirAdversario(enc, npc, cantidad, cfg.habilidades, era)
      } else if (origen === 'personajes') {
        anadirPersonajes(b, enc, personajes.filter((ch) => marcados.includes(ch.id)), cfg.habilidades, cfg.features.bonosServidor, ultimoDiario)
      } else if (libre.nombre.trim()) {
        const n = (s: string) => Math.max(0, Math.trunc(Number(s) || 0))
        anadirLibre(enc, {
          nombre: libre.nombre.trim(), bando: libre.bando, rango: libre.rango === 'ninguno' ? null : libre.rango,
          salud: n(libre.salud), defensa: n(libre.defensa), desvio: n(libre.desvio),
        }, cantidad)
      }
    })
    onClose()
  }

  const listo =
    origen === 'catalogo' ? elegido !== null : origen === 'personajes' ? marcados.length > 0 : libre.nombre.trim().length > 0
  const elegidoNpc = catalogo.data?.find((n) => n.id === elegido)
  const textoBoton =
    origen === 'catalogo' ? (elegidoNpc ? `Añadir ${cantidad} × ${elegidoNpc.name}` : 'Añadir')
      : origen === 'libre' ? `Añadir ${cantidad}`
      : marcados.length ? `Añadir ${marcados.length} personaje${marcados.length === 1 ? '' : 's'}` : 'Añadir personajes'

  return (
    <Sheet
      open
      onClose={onClose}
      title={destino && estado.encuentros.length > 1 ? `Añadir a «${destino.titulo}»` : 'Añadir al encuentro'}
      maxWidth={620}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} disabled={!listo} onClick={anadir}>{textoBoton}</Button>
        </>
      }
    >
      <div style={stack(14)}>
        <Segmented<Origen>
          ariaLabel="Qué añadir"
          value={origen}
          onChange={(v) => { setOrigen(v); setCantidad(1) }}
          options={[
            { value: 'catalogo', label: 'Adversario' },
            { value: 'personajes', label: 'Personajes' },
            { value: 'libre', label: 'Libre' },
          ]}
        />

        {origen === 'catalogo' && (
          <>
            <div style={{ position: 'relative' }}>
              <Search size={16} aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.subtle }} />
              <Input aria-label="Buscar adversario" placeholder="Buscar en el catálogo…" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ paddingLeft: 36 }} />
            </div>
            {catalogo.isLoading && <Spinner label="Cargando adversarios…" />}
            {catalogo.isError && <ErrorMessage message="No se pudo cargar el catálogo de adversarios." />}
            {catalogo.data?.length === 0 && (
              <p style={{ fontSize: fs.sm, color: c.muted }}>Este mundo aún no tiene adversarios en el catálogo (Director → NPCs). Usa «Libre».</p>
            )}
            {!!catalogo.data?.length && filtrados.length === 0 && (
              <p style={{ fontSize: fs.sm, color: c.muted }}>Ningún adversario coincide con «{busca.trim()}».</p>
            )}
            <ul aria-label="Adversarios" style={{ ...listReset, ...stack(6), maxHeight: 320, overflowY: 'auto' }}>
              {filtrados.map((n) => {
                const on = n.id === elegido
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setElegido(n.id)}
                      className="ui-row"
                      style={{
                        ...buttonReset, width: '100%', display: 'flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '8px 12px',
                        borderRadius: radius.md, background: on ? tone.rubi.bg : c.s2, border: `1px solid ${on ? tone.rubi.border : c.border}`,
                      }}
                    >
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontSize: fs.base, fontWeight: 650, color: c.text }}>{n.name}</span>
                        <span style={{ display: 'block', fontSize: fs.xs, color: c.muted }}>{n.tipo}{n.source ? ` · ${n.source}` : ''}</span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: fs.sm, color: c.muted, fontVariantNumeric: 'tabular-nums' }}>
                        <StatIcons.salud size={13} aria-hidden style={{ color: tone.granate.fg }} />
                        {n.maxHealth}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
            {elegido !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={eyebrow}>Cantidad</span>
                <Stepper label="Cantidad" value={cantidad} min={1} max={12} onChange={setCantidad} size="sm" />
              </div>
            )}
          </>
        )}

        {origen === 'personajes' && (
          personajes.length === 0 ? (
            <p style={{ fontSize: fs.sm, color: c.muted }}>La campaña no tiene personajes.</p>
          ) : (
            <>
              <ListaPersonajes personajes={personajes} encId={destino?.id ?? null} marcados={marcados} onCambio={setMarcados} />
              {mueve && (
                <p style={{ fontSize: fs.xs, color: c.muted }}>Los que están en otro combate se mueven a este con su salud y sus estados.</p>
              )}
            </>
          )
        )}

        {origen === 'libre' && (
          <div style={stack(12)}>
            <Field label="Nombre">
              <Input value={libre.nombre} onChange={(e) => setLibre((p) => ({ ...p, nombre: e.target.value }))} placeholder="Guardia de la caravana" />
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div>
                <span style={{ ...eyebrow, display: 'block', marginBottom: 8 }}>Bando</span>
                <Segmented<Bando> ariaLabel="Bando" value={libre.bando} onChange={(v) => setLibre((p) => ({ ...p, bando: v }))}
                  options={[{ value: 'pnj', label: 'PNJ' }, { value: 'pj', label: 'PJ' }]} />
              </div>
              <div>
                <span style={{ ...eyebrow, display: 'block', marginBottom: 8 }}>Rango</span>
                <Segmented<Rango | 'ninguno'> ariaLabel="Rango" size="sm" value={libre.rango} onChange={(v) => setLibre((p) => ({ ...p, rango: v }))}
                  options={[{ value: 'ninguno', label: '—', ariaLabel: 'Sin rango' }, { value: 'secuaz', label: 'Secuaz' }, { value: 'rival', label: 'Rival' }, { value: 'jefe', label: 'Jefe' }]} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
              <Field label="Salud">
                <Input type="number" inputMode="numeric" min={1} value={libre.salud} onChange={(e) => setLibre((p) => ({ ...p, salud: e.target.value }))} />
              </Field>
              <Field label="Defensas" hint="Las tres iguales; ajústalas después.">
                <Input type="number" inputMode="numeric" min={0} value={libre.defensa} onChange={(e) => setLibre((p) => ({ ...p, defensa: e.target.value }))} />
              </Field>
              <Field label="Desvío">
                <Input type="number" inputMode="numeric" min={0} value={libre.desvio} onChange={(e) => setLibre((p) => ({ ...p, desvio: e.target.value }))} />
              </Field>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={eyebrow}>Cantidad</span>
              <Stepper label="Cantidad" value={cantidad} min={1} max={12} onChange={setCantidad} size="sm" />
            </div>
          </div>
        )}
      </div>
    </Sheet>
  )
}
