/**
 * Card of one metallic power of the character in the «Artes metálicas» tab (§7.6, T30; sheet L.404 / PDF 410): glyph, name, subtitle, state
 * (nascent / complete, Desprovisto, origin), the table state of the power and, folded, its actions and the talents of its tree that the
 * character has learnt.
 *
 * The table state is what the book's sheet notes per power: the goal «Meta de nacido del metal completada» (a switch that marks the power
 * complete, a shortcut of the table, Q14), the charges of the metalmind (feruchemy), the vials (rare alomantic metals) or the atium beads.
 * Nothing is computed here: the maximum charges come from the server (`derivadosSet['poder.<metal>.cargasMax']`, passed as `cargasMax`) and
 * every change goes up through `onPatch` as the body of `PATCH …/recursos` or as a function of the latest character (`CambioPoder`).
 *
 * Rules of the book the card follows: a nascent power has no metalmind, so it stores no charges (L.162 / PDF 168); a medallion holds at most
 * 8 charges, a player only spends them and the director swaps it for a new one (L.293 / PDF 299); Componedor spends a fragment of the
 * metalmind for good, -1 maximum charge (L.155 / PDF 161); alomancia de atium needs no goal and counts atium beads instead of vials
 * (L.176-177 / PDF 182-183).
 */
import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { Badge, Button, Card, ConfirmDialog, Stepper, Switch } from '../ui'
import { TalentActivation } from '../TalentActivation'
import type { PoderPersonaje } from '../../types'
import type { PoderDef } from '../../data/mistborn/tipos'
import { METALES } from '../../data/mistborn/metales'
import { buttonReset, c, eyebrow, font, fs, radius } from '../../theme'
import { GlifoProvisional } from './MetalPicker'
import {
  NOMBRE_ORIGEN, cambioComponedor, cambioCompleto, cambioDeCargas, cambioDeCuentasAtium, cambioDeViales, cambioMedallonNuevo, esMetalComun,
  nombrePoder, subtituloPoder, type CambioPoder, type RefPoder,
} from './poderes'

export interface PoderCardProps {
  poder: PoderPersonaje
  /** Static definition of the power (effect, actions, tree): `useWorldData().poderes`, never a static import. Without it the card has no folded detail */
  def?: PoderDef
  /** Maximum charges of the metalmind (feruchemy), from `derivadosSet['poder.<metal>.cargasMax']`: 0 while the power is nascent, 8 in a medallion */
  cargasMax?: number
  /** Names of the talents of the power's tree that the character has learnt */
  talentosAprendidos: string[]
  /** One sentence per talent (`TalentRules.summaries`, `TALENT_SUMMARIES_MISTBORN`) */
  resumenes?: Record<string, string>
  /** The sheet is being edited, or the viewer is neither the owner nor the director: nothing moves */
  disabled: boolean
  /** The director: sets any number of charges of a medallion and swaps it for a new one */
  esGm: boolean
  /** The character has learnt Componedor and this power is its metalmind: it can spend a fragment (L.155 / PDF 161) */
  componedor?: boolean
  /** Alomancia de atium only: the atium beads of the character (`recursos.cuentasAtium`) */
  cuentasAtium?: number
  onPatch: (cambio: CambioPoder) => void
}

/** A line of the controls: its label on the left (it takes what the control leaves and wraps its text), the control on the right */
function Fila({ etiqueta, children }: { etiqueta: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44 }}>
      <span style={{ flex: '1 1 0', minWidth: 0, fontSize: fs.base - 1, fontWeight: 600, color: c.text, lineHeight: 1.35 }}>{etiqueta}</span>
      <span style={{ flexShrink: 0, display: 'inline-flex' }}>{children}</span>
    </div>
  )
}

const nota = { fontSize: fs.sm, color: c.muted, lineHeight: 1.45 } as const

export function PoderCard({
  poder, def, cargasMax = 0, talentosAprendidos, resumenes, disabled, esGm, componedor = false, cuentasAtium = 0, onPatch,
}: PoderCardProps) {
  const detalleId = useId()
  const [abierto, setAbierto] = useState(false)
  const [confirmarComponedor, setConfirmarComponedor] = useState(false)

  const ref: RefPoder = { arte: poder.arte, metal: poder.metal }
  const nombre = nombrePoder(poder)
  const metal = METALES.find((m) => m.id === poder.metal)
  const feruquimia = poder.arte === 'feruquimia'
  const atium = poder.arte === 'alomancia' && poder.metal === 'atium'
  const medallon = poder.origen === 'medallon'
  const naciente = !poder.completo
  // The goal of the path unlocks the full version; a power from another origin is born complete and alomancia de atium needs no goal (L.177 / PDF 183)
  const conMeta = poder.origen === 'camino' && (def?.requiereMeta ?? !atium)
  const conViales = poder.arte === 'alomancia' && !atium && !esMetalComun(poder.metal)

  const cargas = Math.min(cargasMax, Math.max(0, poder.cargas))
  // A player only spends the charges of a medallion: its «+» is off (the director can add them, up to its 8)
  const topeCargas = medallon && !esGm ? cargas : cargasMax
  const aprendidos = talentosAprendidos
    .map((n) => def?.talentos.find((t) => t.name === n) ?? { name: n, cost: 'passive' as const })
    .map((t) => ({ ...t, resumen: resumenes?.[t.name] }))

  return (
    <Card as="li" padding="14px 16px" style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {metal && <GlifoProvisional metal={metal} arte={poder.arte} size={18} />}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.25, color: c.text, overflowWrap: 'anywhere' }}>{nombre}</h3>
          <p style={{ ...nota, marginTop: 2 }}>{subtituloPoder(poder)}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            <Badge tone={naciente ? 'cuarzo' : 'esmeralda'}>{naciente ? 'Naciente' : 'Completo'}</Badge>
            {poder.origen !== 'camino' && <Badge tone="zafiro">{NOMBRE_ORIGEN[poder.origen]}</Badge>}
            {poder.desprovisto && <Badge tone="topacio">Desprovisto</Badge>}
          </div>
        </div>
      </div>

      {(conMeta || feruquimia || conViales || atium) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 8, borderTop: `1px solid ${c.border}` }}>
          {conMeta && (
            <Fila etiqueta="Meta de nacido del metal completada">
              <Switch
                checked={poder.completo}
                disabled={disabled}
                label={`Meta de nacido del metal completada (${nombre})`}
                onChange={() => onPatch((vivo) => cambioCompleto(vivo, ref))}
              />
            </Fila>
          )}

          {feruquimia && (
            <>
              <Fila etiqueta="Cargas">
                <Stepper
                  label={`Cargas de ${nombre}`}
                  value={cargas}
                  min={0}
                  max={topeCargas}
                  // A nascent power has no metalmind: it stores nothing until its goal is done (L.162 / PDF 168)
                  disabled={disabled || naciente}
                  onChange={(v) => onPatch((vivo) => cambioDeCargas(vivo, ref, v - cargas, esGm))}
                  format={naciente ? undefined : (v) => <>{v}<span style={{ fontSize: fs.base, fontWeight: 500, color: c.subtle }}> / {cargasMax}</span></>}
                />
              </Fila>
              {naciente && <p style={nota}>Fabrica tu mente de metal para almacenar cargas</p>}
              {medallon && !esGm && (
                <p style={nota}>Un medallón solo se gasta: almacenar en él no genera cargas. Para recargarlo hay que canjearlo por uno nuevo.</p>
              )}
              {medallon && esGm && (
                <Fila etiqueta="Canjear por un medallón nuevo">
                  <Button variant="secondary" disabled={disabled} onClick={() => onPatch((vivo) => cambioMedallonNuevo(vivo, ref))}>
                    Medallón nuevo
                  </Button>
                </Fila>
              )}
              {poder.ajusteCargasMax < 0 && (
                <p style={nota}>
                  Componedor: −{Math.abs(poder.ajusteCargasMax)} {Math.abs(poder.ajusteCargasMax) === 1 ? 'carga máxima' : 'cargas máximas'}, hasta que repares la mente.
                </p>
              )}
              {componedor && (
                <div style={{ paddingTop: 4 }}>
                  <Button
                    variant="secondary"
                    disabled={disabled || naciente || cargasMax <= 0}
                    aria-haspopup="dialog"
                    onClick={() => setConfirmarComponedor(true)}
                  >
                    Usar Componedor (−1 máx.)
                  </Button>
                </div>
              )}
            </>
          )}

          {conViales && (
            <Fila etiqueta="Viales">
              <Stepper
                label={`Viales de ${nombre}`}
                value={poder.viales}
                min={0}
                disabled={disabled}
                onChange={(v) => onPatch((vivo) => cambioDeViales(vivo, ref, v - poder.viales))}
              />
            </Fila>
          )}

          {atium && (
            <Fila etiqueta="Cuentas de atium">
              <Stepper
                label="Cuentas de atium"
                value={cuentasAtium}
                min={0}
                disabled={disabled}
                onChange={(v) => onPatch((vivo) => cambioDeCuentasAtium(vivo, v - cuentasAtium))}
              />
            </Fila>
          )}
        </div>
      )}

      {def && (
        <div style={{ borderTop: `1px solid ${c.border}` }}>
          <button
            type="button"
            aria-expanded={abierto}
            aria-controls={detalleId}
            onClick={() => setAbierto(!abierto)}
            className="ui-row"
            style={{
              ...buttonReset, width: '100%', minHeight: 44, display: 'flex', alignItems: 'center', gap: 8,
              fontSize: fs.base - 1, fontWeight: 600, color: c.muted, borderRadius: radius.sm,
            }}
          >
            <span style={{ flex: 1, minWidth: 0 }}>Acciones y talentos</span>
            {aprendidos.length > 0 && (
              <span style={{ fontSize: fs.xs, color: c.subtle }}>{aprendidos.length} {aprendidos.length === 1 ? 'talento' : 'talentos'}</span>
            )}
            <ChevronDown
              size={16}
              aria-hidden
              style={{ color: c.subtle, flexShrink: 0, transform: abierto ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
            />
          </button>
          {abierto && (
            <div id={detalleId} className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
              {def.descripcion && <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>{def.descripcion}</p>}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={eyebrow}>Acciones</p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {def.acciones.map((a) => (
                    <li key={a.nombre} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <TalentActivation type={a.activacion} compact />
                        <span style={{ fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>{a.nombre}</span>
                      </span>
                      <span style={{ ...nota, lineHeight: 1.5 }}>{a.descripcion}</span>
                      <span style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.4 }}>Coste: {a.coste} · Duración: {a.duracion}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <p style={eyebrow}>Talentos aprendidos</p>
                {aprendidos.length === 0 ? (
                  <p style={nota}>Todavía no has aprendido ningún talento de este poder.</p>
                ) : (
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {aprendidos.map((t) => (
                      <li key={t.name} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <TalentActivation type={t.cost} compact />
                          <span style={{ fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.3 }}>{t.name}</span>
                        </span>
                        {t.resumen && <span style={{ ...nota, lineHeight: 1.5 }}>{t.resumen}</span>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmarComponedor}
        title="¿Usar Componedor?"
        message={`Consumes un fragmento de la mente de metal de ${nombre}: sus cargas máximas bajan de ${cargasMax} a ${Math.max(0, cargasMax - 1)} y no se recuperan solas. Solo se reparan renunciando a los beneficios de un descanso largo y con el metal necesario.`}
        confirmLabel="Usar Componedor"
        tone="brand"
        icon="warning"
        onConfirm={() => { setConfirmarComponedor(false); onPatch((vivo) => cambioComponedor(vivo, ref)) }}
        onCancel={() => setConfirmarComponedor(false)}
      />
    </Card>
  )
}
