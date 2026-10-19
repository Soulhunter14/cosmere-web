/* A dead character (core, both worlds): the notice on its sheet and pages, the tag of the lists and «Lo que llevaba», the read-only copy of the
   gear that left the sheet at death. The world's own gear (`equipoAlMorir.mundo`) is read through the world's configuration, never its id */
import type { CSSProperties, ReactNode } from 'react'
import { Skull } from 'lucide-react'
import type { Character, EquipoGuardado } from '../types'
import type { ArteMetal } from '../data/mistborn/metales'
import { useWorldConfig } from '../store/campaignStore'
import { formatMoneda } from '../lib/moneda'
import { c, eyebrow, font, fs, pill, radius, tone } from '../theme'
import { Card, SectionTitle } from './ui'
import { MetalGlyph } from './mistborn/MetalGlyph'

const fecha = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : null

/** The notice at the top of a dead character's sheet, Bolsa, Metas and Talentos */
export function MuerteBanner({ character, style }: { character: Pick<Character, 'muerto' | 'muertoEn' | 'causaMuerte'>; style?: CSSProperties }) {
  if (!character.muerto) return null
  const cuando = fecha(character.muertoEn)
  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderRadius: radius.md,
        background: tone.rubi.bg, border: `1px solid ${tone.rubi.border}`, ...style,
      }}
    >
      <Skull size={20} aria-hidden style={{ color: tone.rubi.fg, flexShrink: 0, marginTop: 2 }} />
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 650, color: tone.rubi.fg }}>Muerto</p>
        {(cuando || character.causaMuerte) && (
          <p style={{ fontSize: fs.sm, color: c.text, marginTop: 2, overflowWrap: 'anywhere' }}>
            {cuando && `Cayó el ${cuando}`}
            {cuando && character.causaMuerte && ' · '}
            {character.causaMuerte}
          </p>
        )}
        <p style={{ fontSize: fs.xs, color: c.muted, marginTop: 4 }}>La ficha es de solo lectura.</p>
      </div>
    </div>
  )
}

/** The small tag of a dead character on the lists */
export function EtiquetaMuerto({ style }: { style?: CSSProperties }) {
  return (
    <span style={{ ...pill(tone.rubi), display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 8px', fontSize: fs.eyebrow, ...style }}>
      <Skull size={12} aria-hidden />
      Muerto
    </span>
  )
}

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** The world's keys «viales:<arte>:<metal>» and «cargas:<arte>:<metal>» */
function porMetal(mundo: Record<string, number>, prefijo: 'viales' | 'cargas') {
  return Object.entries(mundo).flatMap(([clave, valor]) => {
    const [tipo, arte, metal] = clave.split(':')
    return tipo === prefijo && arte && metal && valor > 0 ? [{ arte: arte as ArteMetal, metal, valor }] : []
  })
}

function Fila({ etiqueta, children }: { etiqueta: string; children: ReactNode }) {
  return (
    <div>
      <p style={{ ...eyebrow, color: c.subtle, marginBottom: 4 }}>{etiqueta}</p>
      <div style={{ fontSize: fs.sm + 1, color: c.text, lineHeight: 1.5 }}>{children}</div>
    </div>
  )
}

const lista = (items: string[]) => (
  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
    {items.map((it, i) => <li key={i} style={{ overflowWrap: 'anywhere' }}>{it}</li>)}
  </ul>
)

/** «Lo que llevaba»: the gear and the money a dead character carried, kept read-only until the director brings them back to life */
export function EquipoAlMorirCard({ equipo }: { equipo: EquipoGuardado }) {
  const cfg = useWorldConfig()
  const { mundo } = equipo
  const viales = porMetal(mundo, 'viales')
  const cargas = porMetal(mundo, 'cargas')
  const armaduras = equipo.armor.map((a) => (a === equipo.equippedArmor ? `${a} (puesta)` : a))
  const dinero = cfg.features.arquillas
    ? ((mundo.arquillas ?? 0) > 0 ? formatMoneda(mundo.arquillas, cfg.moneda, { fija: true }) : null)
    : (equipo.marcosInfusas > 0 || equipo.marcosOpacas > 0 ? `${equipo.marcosInfusas} infusas · ${equipo.marcosOpacas} opacas` : null)
  const cuentasAtium = mundo.cuentasAtium ?? 0
  const vacio = equipo.weapons.length + equipo.armor.length + equipo.equipment.length + equipo.spells.length === 0
    && !dinero && cuentasAtium === 0 && viales.length === 0 && cargas.length === 0

  return (
    <div>
      <SectionTitle>Lo que llevaba</SectionTitle>
      <Card padding="16px 18px">
        {vacio ? (
          <p style={{ fontSize: fs.sm, color: c.subtle }}>No llevaba nada.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {equipo.weapons.length > 0 && <Fila etiqueta="Armas">{lista(equipo.weapons)}</Fila>}
            {armaduras.length > 0 && <Fila etiqueta="Armaduras">{lista(armaduras)}</Fila>}
            {equipo.equipment.length > 0 && <Fila etiqueta="Equipo">{lista(equipo.equipment)}</Fila>}
            {equipo.spells.length > 0 && <Fila etiqueta="Otros">{lista(equipo.spells)}</Fila>}
            {dinero && <Fila etiqueta={cfg.moneda.nombre}>{dinero}</Fila>}
            {cuentasAtium > 0 && <Fila etiqueta="Cuentas de atium">{cuentasAtium}</Fila>}
            {viales.length > 0 && (
              <Fila etiqueta="Viales">
                {viales.map((v) => (
                  <span key={`${v.arte}:${v.metal}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 12 }}>
                    <MetalGlyph metal={v.metal} arte={v.arte} size={18} />
                    {`${v.valor} × ${capital(v.metal)}`}
                  </span>
                ))}
              </Fila>
            )}
            {cargas.length > 0 && (
              <Fila etiqueta="Cargas de las mentes de metal">
                {cargas.map((v) => (
                  <span key={`${v.arte}:${v.metal}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginRight: 12 }}>
                    <MetalGlyph metal={v.metal} arte={v.arte} size={18} />
                    {`${v.valor} × ${capital(v.metal)}`}
                  </span>
                ))}
              </Fila>
            )}
          </div>
        )}
        <p style={{ fontSize: fs.xs, color: c.muted, marginTop: 14 }}>
          Lo perdió al morir. Si el director lo devuelve a la vida, lo recupera todo.
        </p>
      </Card>
    </div>
  )
}
