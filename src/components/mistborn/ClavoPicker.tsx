/**
 * Picker of the spike to implant (T49b, §9; «Efectos conocidos de los clavos hemalúrgicos», L.291 / PDF 297): the 12 types of `TIPOS_CLAVO`. The four of
 * rank 2 (cinc, cobre, estaño, hierro) raise an attribute by 1 and grant no power; the eight of rank 3 grant ONE power of their group, chosen among
 * four, and the metal of the spike is not the metal of the power (an acero spike grants an alomancy to pick among hierro, peltre, acero and estaño).
 *
 * It only chooses: `onConfirm(tipo, poderElegido)` hands the choice back and the section saves it (ArtesMetalicasTab, `planImplantarClavo`). Nothing is
 * computed here: the effects (bonus, Defensa espiritual, extra grade) come from the server. Rules it only advises about, as the book words them and as the
 * server leaves them to the client (P6): a character carries as many implanted spikes as its rank, at most 3 (L.289 / PDF 295: with four or more it
 * succumbs to a Shard and stops being a player character), and the reward rank of the next spike of a metal goes up by 1 for each one of that metal already
 * owned (L.288 / PDF 294). A power the character already has gives one more grade instead of a new power (L.290 / PDF 296); a power of an art whose Investida
 * skill has no free cognitive slot waits until the director frees one (Q4), as in «Añadir poder» (T30).
 *
 * Loaded together with ArtesMetalicasTab (components/mistborn/index.ts, §7.4 rule 4) and importing its data BY FILE, so none of it reaches the main chunk
 * (§8, risk 6).
 */
import { useId, useState } from 'react'
import { Anvil, Flame, Pin, TriangleAlert } from 'lucide-react'
import { Button, Sheet } from '../ui'
import { METALES, type ArteMetal } from '../../data/mistborn/metales'
import { TIPOS_CLAVO, type OpcionPoderClavo, type TipoClavo, type TipoClavoPoder } from '../../data/mistborn/hemalurgia'
import type { ClavoHemalurgico, PoderPersonaje } from '../../types'
import { c, eyebrow, font, fs, pill, radius, tone, toneFrom } from '../../theme'
import { FilaOpcion } from './FilaOpcion'
import { idPoder } from './caminoMetalFlujo'
import { NOMBRE_ARTE, subtituloPoder } from './poderes'
import { implantados, nombreClavo, partesPoder, rangoDeRecompensa } from './clavos'

export interface ClavoPickerProps {
  open: boolean
  onClose: () => void
  /** Powers the character has, from any origin: one of them that the spike grants gives a grade instead of a new power */
  poderes: PoderPersonaje[]
  /** Spikes the character owns (`Character.clavos`): the count of implanted ones against the limit and of the same metal for the reward rank */
  clavos: ClavoHemalurgico[]
  /** `derivadosSet['hemalurgia.clavosMax']`: the server emits it once the character has a spike, so it is `undefined` for the first one */
  clavosMax: number | undefined
  /** Arts whose Investida skill has no free cognitive slot: a power of that art cannot be chosen until the director frees one (Q4) */
  sinHueco: ArteMetal[]
  onConfirm: (tipo: TipoClavo, poderElegido: OpcionPoderClavo | null) => void
}

const nota = { fontSize: fs.sm, color: c.muted, lineHeight: 1.45 } as const

/** Glyph of a spike: a pin on the tint of its metal (the book has no hemalurgy glyph; the encyclopedia uses the same Lucide icon) */
export function GlifoClavo({ metal, size = 18 }: { metal: string; size?: number }) {
  const m = METALES.find((x) => x.id === metal)
  const t = m ? toneFrom(m.color) : tone.cuarzo
  const caja = Math.round(size * 1.9)
  return (
    <span
      aria-hidden
      style={{
        width: caja, height: caja, flexShrink: 0, borderRadius: radius.sm,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      }}
    >
      <Pin size={size} />
    </span>
  )
}

const GRUPOS: { tipo: TipoClavo['tipo']; titulo: string; texto: string }[] = [
  { tipo: 'atributo', titulo: 'Rango 2 · Atributo', texto: 'Suben un atributo en 1 y no conceden ningún poder. Los clavos del mismo metal se acumulan.' },
  { tipo: 'poder', titulo: 'Rango 3 · Poder', texto: 'Conceden un poder alomántico o feruquímico completo, a elegir entre los cuatro de su grupo.' },
]

const minuscula = (texto: string) => texto.charAt(0).toLowerCase() + texto.slice(1)

export function ClavoPicker({ open, onClose, poderes, clavos, clavosMax, sinHueco, onConfirm }: ClavoPickerProps) {
  const baseId = useId()
  // The picker is mounted when it opens (the section renders it only then), so every opening starts with nothing chosen
  const [metal, setMetal] = useState<string | null>(null)
  const [poder, setPoder] = useState<OpcionPoderClavo | null>(null)

  const tipo = TIPOS_CLAVO.find((t) => t.metal === metal)
  const poderQueTiene = (id: string) => poderes.find((p) => idPoder(p) === id)
  const tienePoder = (id: string) => poderQueTiene(id) !== undefined
  // «Poder existente» (L.290 / PDF 296): the spike adds one grade, except when the power is of origin «clavo» and no spike of the list grants it yet (a power
  // added by hand with «Añadir poder»): the server takes the first spike that picks such a power as the one that grants it, so this one only links to it
  const daGrado = (id: string) => { const p = poderQueTiene(id); return p !== undefined && (p.origen !== 'clavo' || clavos.some((k) => k.implantado && k.poderElegido === id)) }
  const listo = !!tipo && (tipo.tipo === 'atributo' || poder !== null)

  // The limit is advice (P6, T49a): the director may implant the spike anyway
  const puestos = implantados(clavos).length
  const excede = clavosMax !== undefined && puestos + 1 > clavosMax

  const elegirTipo = (m: string) => { setMetal(m); setPoder(null) }

  const fila = (t: TipoClavo) => {
    const m = METALES.find((x) => x.id === t.metal)
    const propios = clavos.filter((k) => k.metalClavo === t.metal).length
    return (
      <FilaOpcion
        titulo={nombreClavo(t.metal)}
        icono={<Pin size={20} />}
        t={m ? toneFrom(m.color) : tone.cuarzo}
        selected={metal === t.metal}
        onClick={() => elegirTipo(t.metal)}
      >
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ ...pill(tone.topacio), fontSize: fs.xs }}>Rango {rangoDeRecompensa(t, clavos)}</span>
          <span style={{ ...pill(tone.amatista), fontSize: fs.xs }}>{t.tipo === 'atributo' ? t.efecto : `Poder de ${NOMBRE_ARTE[t.arte].toLowerCase()}`}</span>
        </span>
        <span style={nota}>Roba: {minuscula(t.roba)}</span>
        {propios > 0 && (
          <span style={nota}>
            Ya {propios === 1 ? 'tiene 1 clavo' : `tiene ${propios} clavos`} de este metal: el rango de recompensa de este sube en {propios}.
          </span>
        )}
      </FilaOpcion>
    )
  }

  /** The four powers a power spike offers, under its row once it is chosen */
  const opciones = (t: TipoClavoPoder) => {
    const Icono = t.arte === 'alomancia' ? Flame : Anvil
    // A power the character already has gives a grade and needs no skill; a new one brings the skill of its art, which needs a free cognitive slot.
    // The four powers of a spike are of the same art, so the explanation is one, and it ties to every option it blocks
    const bloqueaOpcion = (op: OpcionPoderClavo) => !tienePoder(op) && sinHueco.includes(t.arte)
    const huecoId = `${baseId}-hueco-${t.metal}`
    return (
      <div
        role="group"
        aria-label={`Poder que concede el ${nombreClavo(t.metal).toLowerCase()}`}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '8px 0 4px', paddingLeft: 12, borderLeft: `2px solid ${c.border}` }}
      >
        <p style={nota}>Elige el poder que concede, uno de estos cuatro:</p>
        {t.opciones.map((op) => {
          const { arte, metal: id } = partesPoder(op)
          const def = METALES.find((x) => x.id === id)
          const bloqueada = bloqueaOpcion(op)
          return (
            <FilaOpcion
              key={op}
              titulo={`${NOMBRE_ARTE[arte]} de ${(def?.nombre ?? id).toLowerCase()}`}
              icono={<Icono size={20} />}
              t={def ? toneFrom(def.color) : tone.cuarzo}
              selected={poder === op}
              disabled={bloqueada}
              describedBy={bloqueada ? huecoId : undefined}
              onClick={() => setPoder(op)}
            >
              <span style={nota}>{subtituloPoder({ arte, metal: id })}</span>
              {daGrado(op) && (
                <span style={nota}>Ya lo tiene: el clavo suma un grado adicional que no cuenta para el máximo de grados (L.290 / PDF 296).</span>
              )}
              {tienePoder(op) && !daGrado(op) && (
                <span style={nota}>Ya lo tiene, concedido a mano como poder de clavo: este clavo pasa a ser el que lo concede y no suma ningún grado.</span>
              )}
            </FilaOpcion>
          )
        })}
        {t.opciones.some(bloqueaOpcion) && (
          <p id={huecoId} style={nota}>
            No queda ningún hueco libre de habilidad cognitiva para {NOMBRE_ARTE[t.arte]}. Libera uno en la pestaña Atributos, en modo edición, y vuelve a implantar el clavo.
          </p>
        )}
      </div>
    )
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Implantar clavo"
      description="Elige el clavo que recibe el personaje. En mesa son 3 acciones y una prueba de Medicina CD 20 (L.289 / PDF 295); aquí solo se anota el resultado."
      maxWidth={560}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          {/* A fixed label: «Implantar clavo de bendaleo» would not fit the footer of a 360 px phone; the accessible name does say which one */}
          <Button
            size="lg"
            style={{ flex: 2 }}
            disabled={!listo}
            aria-label={tipo ? `Implantar ${nombreClavo(tipo.metal).toLowerCase()}` : undefined}
            onClick={() => tipo && onConfirm(tipo, tipo.tipo === 'poder' ? poder : null)}
          >
            Implantar clavo
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <p style={nota}>
          Cada clavo implantado reduce la Defensa espiritual: 2 el primero de cada metal y 5 cada uno de los siguientes del mismo metal (L.290 / PDF 296).
        </p>

        {excede && (
          <p
            role="note"
            style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: radius.sm,
              background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, fontSize: fs.sm, color: c.text, lineHeight: 1.5,
            }}
          >
            <TriangleAlert size={17} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0, marginTop: 1 }} />
            <span>
              Lleva {puestos} {puestos === 1 ? 'clavo implantado' : 'clavos implantados'} y su rango solo permite {clavosMax}. Puedes implantarlo igualmente
              {puestos + 1 >= 4 ? ', pero con cuatro o más el personaje sucumbe a la influencia de una Esquirla y deja de ser personaje jugador' : ''} (L.289 / PDF 295).
            </span>
          </p>
        )}

        {GRUPOS.map((g) => (
          <section key={g.tipo} aria-labelledby={`${baseId}-${g.tipo}`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <h3 id={`${baseId}-${g.tipo}`} style={{ ...eyebrow, fontFamily: font.ui }}>{g.titulo}</h3>
              <p style={{ ...nota, marginTop: 4 }}>{g.texto}</p>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TIPOS_CLAVO.filter((t) => t.tipo === g.tipo).map((t) => (
                <li key={t.metal}>
                  {fila(t)}
                  {metal === t.metal && t.tipo === 'poder' && opciones(t)}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Sheet>
  )
}
