/**
 * «Beber vial» (Nacidos de la bruma, L.129-130 / PDF 135-136; §7.6, T31): where the alomancer chooses the metals of the vial he drinks and sees what
 * it will do. Drinking it restores the Investiture to its maximum if the vial holds a metal the character burns, and leaves Desprovisto every power
 * whose metal is not in it. The server applies the rule (`charactersApi.beberVial`); this component only predicts it, in the summary above its buttons (the rule
 * of the Investiture lives in `vial.ts`, which the character sheet also uses for its optimistic copy).
 *
 * What the list holds: the alomantic powers of the character, atium aside (its beads are counted apart, L.176 / PDF 182). The common metals come in
 * every vial («los que el alomante desee», L.130 / PDF 136; L.267 / PDF 273) and only the director takes them out, if the story demands a more
 * limited supply (Q17). A rare metal goes in only if it is put in, and spends one of its vials: with none left it stays out, unless the director
 * forces it (the count of vials is his discretion, L.130 / PDF 136).
 *
 * It only chooses: `onBeber(metales)` hands the ids up and the caller sends them and closes it, as the other pickers of this folder do, so the
 * same component serves the character sheet and the talents page (T37b), each with its own mutation. It is mounted only while it is open, so the choice
 * starts afresh every time. Loaded lazily from components/mistborn/index.ts (§7.4 rule 4).
 */
import { useState, type ReactNode } from 'react'
import { Check, Info, TriangleAlert } from 'lucide-react'
import { Badge, Button, EmptyState, Sheet, Switch } from '../ui'
import type { Character, PoderPersonaje } from '../../types'
import { METALES, type MetalDef } from '../../data/mistborn/metales'
import { c, eyebrow, font, fs, radius, toneFrom, tone, type Tone } from '../../theme'
import { GlifoProvisional } from './MetalPicker'
import { esMetalComun, poderesDe } from './poderes'
import { esPoderDelVial, quemaElVial } from './vial'

export interface BeberVialSheetProps {
  open: boolean
  onClose: () => void
  /** The character who drinks: its alomantic powers, its Investiture and the Desprovisto state of each power are read from it */
  character: Pick<Character, 'poderes' | 'investidura' | 'recursos'>
  /** The director takes the common metals out of the vial and drinks a rare metal that has no vials left; a player does neither */
  isGm: boolean
  /** The vial that is drunk: the ids of its metals. The caller sends them (`charactersApi.beberVial`) and closes the sheet of the vial */
  onBeber: (metales: string[]) => void
}

/** «Si el vial contiene un metal que puedes quemar…» (L.129-130 / PDF 135-136) */
const REGLA = 'Si el vial contiene un metal que puedes quemar, restaura la Investidura al máximo; deja Desprovisto cualquier poder cuyo metal no esté en el vial.'

const nota = { fontSize: fs.sm, color: c.muted, lineHeight: 1.45 } as const
const titulo = { ...eyebrow, fontFamily: font.ui } as const

/** «oro, cobre y bronce» */
const lista = (nombres: string[]) => (nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres.join(''))
const nombreMetal = (metal: string) => (METALES.find((m) => m.id === metal)?.nombre ?? metal).toLowerCase()
const textoViales = (n: number) => (n > 0 ? `${n} ${n === 1 ? 'vial' : 'viales'}` : 'Sin viales')

/** A line of the summary: what drinking the vial does, with an icon so that the colour is never the only carrier of its meaning */
type Efecto = { clave: string; t: Tone; icono: ReactNode; texto: string }

/**
 * One metal of the vial: its glyph, its name and state, and the switch. The whole row is the tap target. The label toggles the switch itself (and cancels
 * its own forwarding) instead of relying on the browser to forward a tap on a label to the button inside it, which not every mobile browser does
 */
function FilaMetal({ poder, def, dentro, bloqueado, onAlternar }: {
  poder: PoderPersonaje
  def: MetalDef
  dentro: boolean
  /** Neither side can be changed: a player's common metal (it always goes in) or a rare metal without vials */
  bloqueado: boolean
  onAlternar: () => void
}) {
  const t = toneFrom(def.color)
  return (
    <li>
      <label
        onClick={(e) => {
          if (bloqueado || (e.target as HTMLElement).closest('[role="switch"]')) return // the switch handles its own tap
          e.preventDefault()
          onAlternar()
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 56,
          padding: '10px 14px',
          borderRadius: radius.md,
          background: dentro ? t.bg : c.s2,
          border: `1px solid ${dentro ? t.border : c.border}`,
          cursor: bloqueado ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          WebkitTapHighlightColor: 'transparent',
          // A rare metal that cannot be put in is out of reach; one that is locked in stays legible (it is what the vial holds)
          opacity: bloqueado && !dentro ? 0.7 : 1,
        }}
      >
        <GlifoProvisional metal={def} arte="alomancia" size={16} />
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: fs.base, fontWeight: 650, lineHeight: 1.3, color: dentro ? t.fg : c.text }}>{def.nombre}</span>
            {poder.desprovisto && <Badge tone="topacio">Desprovisto</Badge>}
          </span>
          <span style={{ ...nota, lineHeight: 1.35 }}>{def.comun ? 'Metal común' : textoViales(poder.viales)}</span>
        </span>
        <Switch checked={dentro} disabled={bloqueado} label={`${def.nombre} en el vial`} onChange={onAlternar} />
      </label>
    </li>
  )
}

function Vial({ onClose, character, isGm, onBeber }: BeberVialSheetProps) {
  const poderes = poderesDe(character.poderes, 'alomancia').filter(esPoderDelVial)
  // Each metal starts as it comes in a vial (the common ones in it, the rare ones out); `cambiados` holds the ones the user has flipped from there
  const [cambiados, setCambiados] = useState<ReadonlySet<string>>(new Set())
  const dentro = (p: PoderPersonaje) => esMetalComun(p.metal) !== cambiados.has(p.metal)
  const alternar = (metal: string) => setCambiados((cur) => {
    const siguiente = new Set(cur)
    if (!siguiente.delete(metal)) siguiente.add(metal)
    return siguiente
  })

  if (poderes.length === 0) {
    const soloAtium = character.poderes.some((p) => p.arte === 'alomancia')
    return (
      <Sheet
        open
        onClose={onClose}
        title="Beber vial"
        maxWidth={480}
        footer={<Button variant="secondary" size="lg" fullWidth onClick={onClose}>Cerrar</Button>}
      >
        <EmptyState
          title="Sin metales que beber"
          description={soloAtium
            ? 'El único poder alomántico de este personaje es el atium: sus cuentas se llevan aparte, en la pestaña Artes metálicas.'
            : 'Este personaje no tiene poderes de alomancia.'}
        />
      </Sheet>
    )
  }

  const comunes = poderes.filter((p) => esMetalComun(p.metal))
  const raros = poderes.filter((p) => !esMetalComun(p.metal))
  const metales = poderes.filter(dentro).map((p) => p.metal)
  // What the vial does to each power (L.129 / PDF 135): those whose metal is not in it are Desprovisto, those that are in it stop being so
  const desprovistos = poderes.filter((p) => !metales.includes(p.metal)).map((p) => nombreMetal(p.metal))
  const libres = poderes.filter((p) => metales.includes(p.metal) && p.desprovisto).map((p) => nombreMetal(p.metal))
  // The vials it spends: one of each rare metal that goes in and has any left (the server never refuses for lack of them)
  const gastados = raros.filter((p) => dentro(p) && p.viales > 0).map((p) => nombreMetal(p.metal))
  const total = character.investidura?.total ?? 0
  const actual = Math.min(total, Math.max(0, character.recursos.investiduraActual ?? 0))

  const efectos: Efecto[] = [
    quemaElVial(poderes, metales)
      ? {
        clave: 'investidura',
        t: tone.esmeralda,
        icono: <Check size={16} />,
        texto: actual < total ? `Recuperas Investidura hasta tu máximo: de ${actual} a ${total}.` : `La Investidura ya está al máximo (${total}).`,
      }
      : { clave: 'investidura', t: tone.topacio, icono: <TriangleAlert size={16} />, texto: 'El vial no contiene ningún metal que puedas quemar: no recuperas Investidura' },
  ]
  if (desprovistos.length > 0) {
    efectos.push({ clave: 'desprovistos', t: tone.topacio, icono: <TriangleAlert size={16} />, texto: `Quedas Desprovisto de: ${lista(desprovistos)}.` })
  }
  if (libres.length > 0) {
    efectos.push({ clave: 'libres', t: tone.esmeralda, icono: <Check size={16} />, texto: `Dejas de estar Desprovisto de: ${lista(libres)}.` })
  }
  if (gastados.length > 0) {
    efectos.push({
      clave: 'viales',
      t: tone.zafiro,
      icono: <Info size={16} />,
      texto: gastados.length === 1 ? `Gastas 1 vial de ${gastados[0]}.` : `Gastas 1 vial de cada uno de estos metales: ${lista(gastados)}.`,
    })
  }

  const fila = (p: PoderPersonaje, bloqueado: boolean) => {
    const def = METALES.find((m) => m.id === p.metal)
    return def ? <FilaMetal key={p.metal} poder={p} def={def} dentro={dentro(p)} bloqueado={bloqueado} onAlternar={() => alternar(p.metal)} /> : null
  }
  // The director may include a rare metal that has no vials left: say so only when there is one
  const forzable = isGm && raros.some((p) => p.viales <= 0)

  return (
    <Sheet
      open
      onClose={onClose}
      title="Beber vial"
      description={REGLA}
      maxWidth={480}
      // What the vial will do stays above the buttons, in sight however far down the list the user is
      footer={(
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            role="status"
            aria-label="Efecto del vial"
            style={{ padding: '10px 12px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}
          >
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
              {efectos.map((e) => (
                <li key={e.clave} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span aria-hidden style={{ display: 'flex', color: e.t.fg, marginTop: 2 }}>{e.icono}</span>
                  <span style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.4 }}>{e.texto}</span>
                </li>
              ))}
            </ul>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
            <Button size="lg" style={{ flex: 2 }} onClick={() => onBeber(metales)}>Beber</Button>
          </div>
        </div>
      )}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {comunes.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={titulo}>Metales comunes</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {comunes.map((p) => fila(p, !isGm))}
            </ul>
            <p style={nota}>
              {isGm
                ? 'Los viales llevan los metales comunes que el alomante desee. Quítalos solo si la historia exige un suministro más limitado.'
                : 'Tu vial lleva siempre los metales comunes: solo el director puede quitarlos.'}
            </p>
          </section>
        )}

        {raros.length > 0 && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <h3 style={titulo}>Metales raros</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {raros.map((p) => fila(p, !isGm && p.viales <= 0))}
            </ul>
            <p style={nota}>
              Cada metal raro que incluyas gasta uno de sus viales.{forzable ? ' Como director puedes incluir uno aunque no le queden viales.' : ''}
            </p>
          </section>
        )}
      </div>
    </Sheet>
  )
}

export function BeberVialSheet(props: BeberVialSheetProps) {
  return props.open ? <Vial {...props} /> : null
}
