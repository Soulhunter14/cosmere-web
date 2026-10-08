import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Dices, Lock, Radio, Tag } from 'lucide-react'
import { diceRollsApi } from '../../api/diceRolls'
import { useWorldConfig } from '../../store/campaignStore'
import { Button, EmptyState, Select, Segmented, Spinner, Stepper, Switch } from '../../components/ui'
import { cosmereImage } from '../../lib/cosmereAssets'
import { StatIcons } from '../../lib/gameIcons'
import {
  buildRollLabel, rollCombat, rollDamage, rollFree, rollSkill, type AdvantageMode, type AnyRollResult, type TramaDieResult,
} from '../../utils/dice'
import { c, eyebrow, font, fs, numeral, pill, radius, shadow, tone, type Tone } from '../../theme'
import type { WorldConfig } from '../../worlds/types'
import { usePantalla } from './contexto'
import { guardarTiradaPrivada, type CambioCombate, type TipoCambio } from './estado'
import { formatoDado } from './adversarios'
import { hora } from './exportar'
import { ChipTrama } from './piezas'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const D20_IMG = cosmereImage('dado-d20')

type Modo = 'prueba' | 'ataque' | 'dano' | 'libre'
type Filtro = 'todas' | 'mesa' | 'privadas' | 'cambios'
const CARAS = [4, 6, 8, 10, 12, 20]

/** A roll of the table, a private roll of the director, or a change made in an encounter (damage, Focus…) */
interface Item {
  id: string
  tipo: 'mesa' | 'privada' | 'cambio'
  en: string
  quien: string
  etiqueta: string
  resultado: AnyRollResult | null
  cambio: CambioCombate | null
}

/** Icon and tone of each kind of change: the official stat glyphs of the character sheet */
const CAMBIO: Record<TipoCambio, { t: Tone; icono: (cfg: WorldConfig) => ReactNode }> = {
  dano: { t: tone.granate, icono: () => <StatIcons.salud size={15} /> },
  cura: { t: tone.esmeralda, icono: () => <StatIcons.salud size={15} /> },
  concentracion: { t: tone.heliodoro, icono: () => <StatIcons.concentracion size={15} /> },
  investidura: { t: tone.amatista, icono: (cfg) => <cfg.iconos.investidura size={15} /> },
  estado: { t: tone.topacio, icono: () => <Tag size={15} /> },
}

const leer = (json: string): AnyRollResult | null => {
  try {
    return JSON.parse(json) as AnyRollResult
  } catch {
    return null
  }
}

const tramaDe = (r: AnyRollResult | null): TramaDieResult | null => (r && 'trama' in r ? r.trama : null)
const naturalDe = (r: AnyRollResult | null): number | null => (r && (r.type === 'skill' || r.type === 'combat') ? r.finalD20 : null)

// ── Panel ────────────────────────────────────────────────────────────────────

export function PanelTiradas() {
  const { cId, estado } = usePantalla()
  const [filtro, setFiltro] = useState<Filtro>('todas')
  // Same key the screen keeps fed with the live rolls (PantallaPage listens to `diceRollReceived`)
  const { data: publicas = [], isLoading } = useQuery({
    queryKey: ['dice-rolls', cId],
    queryFn: () => diceRollsApi.getRecent(cId, 50),
    staleTime: Infinity,
  })

  const items = useMemo<Item[]>(() => {
    const ver = (f: Filtro) => filtro === 'todas' || filtro === f
    const mesa: Item[] = !ver('mesa') ? [] : publicas.map((r) => ({
      id: `m-${r.id}`, tipo: 'mesa', en: r.createdAt, quien: r.characterName ?? r.userDisplayName, etiqueta: r.rollLabel, resultado: leer(r.rollData), cambio: null,
    }))
    const privadas: Item[] = !ver('privadas') ? [] : estado.tiradasPrivadas.map((t) => ({
      id: `p-${t.id}`, tipo: 'privada', en: t.en, quien: t.quien, etiqueta: t.etiqueta, resultado: t.resultado, cambio: null,
    }))
    const cambios: Item[] = !ver('cambios') ? [] : estado.cambios.map((x) => ({
      id: `c-${x.id}`, tipo: 'cambio', en: x.en, quien: x.encuentro ? `${x.quien} · ${x.encuentro}` : x.quien, etiqueta: x.texto, resultado: null, cambio: x,
    }))
    return [...mesa, ...privadas, ...cambios].sort((a, b) => new Date(b.en).getTime() - new Date(a.en).getTime())
  }, [filtro, publicas, estado.tiradasPrivadas, estado.cambios])

  return (
    <div style={stack(18)}>
      <TiradaDirector />

      <section aria-labelledby="tiradas-registro" style={stack(10)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h2 id="tiradas-registro" style={{ flex: 1, fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: fs.lg + 1, fontWeight: 600, letterSpacing: '0.05em', color: c.text }}>
            Registro
          </h2>
          <Segmented<Filtro>
            ariaLabel="Qué tiradas ver"
            size="sm"
            stretch={false}
            value={filtro}
            onChange={setFiltro}
            options={[
              { value: 'todas', label: 'Todas' },
              { value: 'mesa', label: 'Mesa' },
              { value: 'privadas', label: 'Privadas' },
              { value: 'cambios', label: 'Cambios', ariaLabel: 'Cambios en el encuentro: daño, curación, concentración, Investidura y estados' },
            ]}
          />
        </div>
        {isLoading ? (
          <Spinner label="Cargando tiradas…" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={D20_IMG ? <img src={D20_IMG} alt="" width={30} height={29} draggable={false} /> : <Dices size={22} aria-hidden />}
            title={filtro === 'cambios' ? 'Sin cambios todavía' : 'Sin tiradas todavía'}
            description="Las tiradas de los jugadores aparecen aquí en tiempo real; las tuyas privadas, con un candado; y el daño, la curación, la concentración, la Investidura y los estados que anotes en el encuentro, con su icono."
          />
        ) : (
          <ul role="log" aria-live="polite" aria-label="Registro de tiradas y cambios" style={{ listStyle: 'none', margin: 0, padding: 0, ...stack(8) }}>
            {items.map((it) => <FilaTirada key={it.id} it={it} />)}
          </ul>
        )}
      </section>
    </div>
  )
}

function FilaTirada({ it }: { it: Item }) {
  const cfg = useWorldConfig()
  const nat = naturalDe(it.resultado)
  const privada = it.tipo === 'privada'
  const cambio = it.cambio ? CAMBIO[it.cambio.tipo] : null
  const acento = cambio ? cambio.t.fg : privada ? tone.rubi.fg : tone.brand.fg
  return (
    <li
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', borderRadius: radius.md,
        background: privada ? tone.rubi.bg : c.s1, border: `1px solid ${privada ? tone.rubi.border : c.border}`,
        boxShadow: cambio ? `inset 3px 0 0 ${cambio.t.fg}` : undefined,
      }}
    >
      <span aria-hidden style={{ display: 'flex', paddingTop: 2, color: acento }}>
        {cambio ? cambio.icono(cfg) : privada ? <Lock size={15} /> : <Radio size={15} />}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ display: 'flex', alignItems: 'baseline', gap: 8, fontSize: fs.xs, color: c.subtle }}>
          <span style={{ fontWeight: 700, color: acento }}>{it.quien}</span>
          <time dateTime={it.en} style={{ fontVariantNumeric: 'tabular-nums' }}>{hora(it.en)}</time>
          {privada && <span className="sr-only">tirada privada</span>}
          {cambio && <span className="sr-only">cambio en el encuentro</span>}
        </p>
        <p style={{ fontSize: fs.sm + 1, fontWeight: 600, color: c.text, lineHeight: 1.4, marginTop: 2 }}>{it.etiqueta}</p>
        {(nat === 20 || nat === 1 || (tramaDe(it.resultado) ?? 'blank') !== 'blank') && (
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {nat === 20 && <span style={pill(tone.esmeralda)}>20 natural</span>}
            {nat === 1 && <span style={pill(tone.rubi)}>1 natural</span>}
            <ChipTrama trama={tramaDe(it.resultado)} />
          </span>
        )}
      </div>
    </li>
  )
}

// ── Director's roll ──────────────────────────────────────────────────────────

function TiradaDirector() {
  const { cId, estado, actualizar } = usePantalla()
  const cfg = useWorldConfig()
  // Whoever is still fighting, in every open encounter (grouped by fight when there are several)
  const grupos = estado.encuentros.map((e) => ({ id: e.id, titulo: e.titulo, combatientes: e.combatientes.filter((x) => !x.derrotado) }))
  const combatientes = grupos.flatMap((g) => g.combatientes)

  const [quienId, setQuienId] = useState<string>('director')
  const [modo, setModo] = useState<Modo>('prueba')
  const [habilidad, setHabilidad] = useState<string>('libre')
  const [mod, setMod] = useState(0)
  const [ventaja, setVentaja] = useState<AdvantageMode>('normal')
  const [trama, setTrama] = useState(false)
  const [ataque, setAtaque] = useState<string>('manual')
  const [dados, setDados] = useState(1)
  const [caras, setCaras] = useState(6)
  const [modDano, setModDano] = useState(0)
  const [privada, setPrivada] = useState(true)
  const [ultima, setUltima] = useState<AnyRollResult | null>(null)
  const [enviando, setEnviando] = useState(false)

  const quien = combatientes.find((x) => x.id === quienId) ?? null
  const nombre = quien?.nombre ?? 'Director'
  const conHabilidades = quien !== null && Object.keys(quien.habilidades).length > 0
  const ataqueElegido = quien && ataque !== 'manual' ? quien.ataques[Number(ataque)] ?? null : null
  // The 18 skills of the world plus the Investiture ones of the stat block (Alomancia, Feruquimia: keys in lower case)
  const opcionesHabilidad = quien === null ? [] : [
    ...cfg.habilidades.map((h) => ({ clave: h.field as string, label: h.label })),
    ...Object.keys(quien.habilidades)
      .filter((k) => !cfg.habilidades.some((h) => h.field === k))
      .map((k) => ({ clave: k, label: k.charAt(0).toUpperCase() + k.slice(1) })),
  ]

  const modPrueba = conHabilidades && habilidad !== 'libre' ? quien.habilidades[habilidad] ?? 0 : mod
  const etiquetaPrueba = conHabilidades && habilidad !== 'libre' ? opcionesHabilidad.find((o) => o.clave === habilidad)?.label ?? 'Prueba' : 'Prueba'

  const tirar = () => {
    let r: AnyRollResult
    if (modo === 'prueba') {
      r = rollSkill({ skillName: quien ? `${nombre} · ${etiquetaPrueba}` : etiquetaPrueba, modifier: modPrueba, advantage: ventaja, useTrama: trama })
    } else if (modo === 'ataque') {
      const a = ataqueElegido
      r = rollCombat({
        skillName: quien ? `${nombre} · ${a?.nombre ?? 'Ataque'}` : 'Ataque',
        attackModifier: a ? a.bono : mod,
        advantage: ventaja,
        diceCount: a?.impacto?.dados ?? dados,
        diceFaces: a?.impacto?.caras ?? caras,
        damageModifier: a?.impacto?.mod ?? modDano,
        useTrama: trama,
      })
    } else if (modo === 'dano') {
      r = rollDamage({ count: dados, faces: caras, modifier: modDano, advantage: ventaja })
    } else {
      r = rollFree(dados, caras)
    }
    setUltima(r)
    const etiqueta = buildRollLabel(r)
    if (privada) {
      actualizar((b) => guardarTiradaPrivada(b, { quien: nombre, etiqueta, resultado: r }))
    } else {
      // Public: the server broadcasts it back and the log shows it like any other roll of the table
      setEnviando(true)
      diceRollsApi.create(cId, r.type, r, etiqueta, quien ? nombre : null).catch(() => {}).finally(() => setEnviando(false))
    }
  }

  const ventajaControl = (
    <Segmented<AdvantageMode>
      ariaLabel="Ventaja"
      size="sm"
      value={ventaja}
      onChange={setVentaja}
      options={[
        { value: 'desventaja', label: 'Desventaja' },
        { value: 'normal', label: 'Normal' },
        { value: 'ventaja', label: 'Ventaja' },
      ]}
    />
  )
  const dadosControl = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <Stepper label="Número de dados" size="sm" value={dados} min={1} max={10} onChange={setDados} />
      <Select aria-label="Caras" value={caras} onChange={(e) => setCaras(Number(e.target.value))} style={{ width: 'auto', minWidth: 84 }}>
        {CARAS.map((n) => <option key={n} value={n}>d{n}</option>)}
      </Select>
      {modo !== 'libre' && (
        <>
          <span style={{ ...eyebrow }}>Mod.</span>
          <Stepper label="Modificador de daño" size="sm" value={modDano} min={-10} max={30} onChange={setModDano} format={(v) => (v >= 0 ? `+${v}` : v)} />
        </>
      )}
    </div>
  )

  return (
    <section aria-labelledby="tirada-director" style={{ ...stack(12), padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${tone.rubi.border}`, boxShadow: shadow[1] }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <h2 id="tirada-director" style={{ flex: 1, fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: fs.lg + 1, fontWeight: 600, letterSpacing: '0.05em', color: c.text }}>
          Tirada del director
        </h2>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: fs.sm, color: privada ? tone.rubi.fg : tone.brand.fg, fontWeight: 650 }}>
          {privada ? <Lock size={14} aria-hidden /> : <Radio size={14} aria-hidden />}
          {privada ? 'Privada' : 'A la mesa'}
          <Switch checked={!privada} onChange={(v) => setPrivada(!v)} label="Enseñar la tirada a la mesa" />
        </label>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Select
          aria-label="Quién tira"
          value={quien ? quien.id : 'director'}
          onChange={(e) => { setQuienId(e.target.value); setHabilidad('libre'); setAtaque('manual') }}
          style={{ flex: '1 1 180px', minWidth: 0 }}
        >
          <option value="director">Director</option>
          {grupos.length > 1
            ? grupos.map((g) => (
              <optgroup key={g.id} label={g.titulo}>
                {g.combatientes.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
              </optgroup>
            ))
            : combatientes.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
        </Select>
        <Segmented<Modo>
          ariaLabel="Tipo de tirada"
          size="sm"
          value={modo}
          onChange={setModo}
          style={{ flex: '2 1 260px' }}
          options={[
            { value: 'prueba', label: 'Prueba' },
            { value: 'ataque', label: 'Ataque' },
            { value: 'dano', label: 'Daño' },
            { value: 'libre', label: 'Libre' },
          ]}
        />
      </div>

      {modo === 'prueba' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            {conHabilidades && (
              <Select aria-label="Habilidad" value={habilidad} onChange={(e) => setHabilidad(e.target.value)} style={{ flex: '1 1 200px', minWidth: 0 }}>
                <option value="libre">Modificador libre</option>
                {opcionesHabilidad.map((o) => (
                  <option key={o.clave} value={o.clave}>{o.label} {(quien.habilidades[o.clave] ?? 0) >= 0 ? '+' : ''}{quien.habilidades[o.clave] ?? 0}</option>
                ))}
              </Select>
            )}
            {(!conHabilidades || habilidad === 'libre') && (
              <>
                <span style={eyebrow}>Modificador</span>
                <Stepper label="Modificador" size="sm" value={mod} min={-10} max={30} onChange={setMod} format={(v) => (v >= 0 ? `+${v}` : v)} />
              </>
            )}
          </div>
          {ventajaControl}
        </>
      )}

      {modo === 'ataque' && (
        <>
          {quien && quien.ataques.length > 0 && (
            <Select aria-label="Ataque" value={ataque} onChange={(e) => setAtaque(e.target.value)}>
              <option value="manual">Ataque manual</option>
              {quien.ataques.map((a, i) => (
                <option key={i} value={String(i)}>{a.nombre} +{a.bono} · {formatoDado(a.impacto)}</option>
              ))}
            </Select>
          )}
          {!ataqueElegido && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={eyebrow}>Ataque</span>
                <Stepper label="Bonificador de ataque" size="sm" value={mod} min={-10} max={30} onChange={setMod} format={(v) => (v >= 0 ? `+${v}` : v)} />
              </div>
              {dadosControl}
            </>
          )}
          {ventajaControl}
        </>
      )}

      {(modo === 'dano' || modo === 'libre') && (
        <>
          {dadosControl}
          {modo === 'dano' && ventajaControl}
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {(modo === 'prueba' || modo === 'ataque') && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: fs.sm, color: c.muted }}>
            <Switch checked={trama} onChange={setTrama} label="Dado de trama" />
            Dado de trama
          </label>
        )}
        <Button
          size="lg"
          loading={enviando}
          icon={D20_IMG ? <img src={D20_IMG} alt="" width={22} height={21} draggable={false} /> : <Dices size={18} aria-hidden />}
          onClick={tirar}
          style={{ marginLeft: 'auto' }}
        >
          Tirar
        </Button>
      </div>

      {ultima && <Resultado r={ultima} />}
    </section>
  )
}

function Resultado({ r }: { r: AnyRollResult }) {
  const caja: CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: '12px 14px', borderRadius: radius.md,
    background: c.s2, border: `1px solid ${c.borderBright}`,
  }
  const grande: CSSProperties = { ...numeral, fontSize: fs['3xl'], color: c.text }
  const detalle: CSSProperties = { fontFamily: font.mono, fontSize: fs.xs, color: c.muted, fontVariantNumeric: 'tabular-nums' }
  return (
    <div role="status" aria-live="polite" style={caja}>
      {r.type === 'skill' && (
        <>
          <span style={grande}>{r.total}</span>
          <span style={detalle}>d20 {r.d20b !== null ? `${r.d20a}/${r.d20b} → ${r.finalD20}` : r.finalD20} {r.modifier >= 0 ? '+' : '−'} {Math.abs(r.modifier)}</span>
          <ChipTrama trama={r.trama} />
        </>
      )}
      {r.type === 'combat' && (
        <>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={eyebrow}>Ataque</span>
            <span style={grande}>{r.attackTotal}</span>
          </span>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={eyebrow}>Impacto</span>
            <span style={{ ...grande, color: tone.rubi.fg }}>{r.damageTotal}</span>
          </span>
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={eyebrow}>Rasguño</span>
            <span style={{ ...grande, fontSize: fs['2xl'], color: c.muted }}>{r.dice.reduce((s, d) => s + d, 0)}</span>
          </span>
          <span style={detalle}>d20 {r.finalD20} · dados {r.dice.join(', ')}</span>
          <ChipTrama trama={r.trama} />
        </>
      )}
      {r.type === 'damage' && (
        <>
          <span style={{ ...grande, color: tone.rubi.fg }}>{r.total}</span>
          <span style={detalle}>{r.dice.join(' + ')}{r.modifier ? ` ${r.modifier >= 0 ? '+' : '−'} ${Math.abs(r.modifier)}` : ''}</span>
        </>
      )}
      {r.type === 'free' && (
        <>
          <span style={grande}>{r.total}</span>
          <span style={detalle}>{r.count}d{r.faces}: {r.results.join(', ')}</span>
        </>
      )}
    </div>
  )
}
