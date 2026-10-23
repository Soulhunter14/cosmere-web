import { useState, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Projector } from 'lucide-react'
import { globalNpcsApi } from '../../api/global-npcs'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { Button, Segmented, Sheet, Spinner } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { FichaLibro } from '../../components/FichaLibro'
import { c, eyebrow, fs, pill, tone } from '../../theme'
import { usePantalla } from './contexto'
import { deOtraEra, eraNumero, etiquetaEra, type EraNum } from './adversarios'
import { useMostrarEnMesa } from './useMesa'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

/** Action cost written by the transcriptions at the start of a line («1 Acometida…», «r Carroñero…») → official glyph */
const ICONO_COSTE: Record<string, string> = { '1': 'accion-1', '2': 'accion-2', '3': 'accion-3', '0': 'accion-gratuita', r: 'reaccion' }

type Vista = 'libro' | 'resumen'

/**
 * Stat block of a catalog adversary without leaving the table (from a combatant of the encounter or an enemy of a scene). With
 * its book page uploaded, «Libro» shows it as printed and is the default; «Resumen» is the app's transcription, where a campaign
 * with an era leaves out the lines the book marks for the other era (a note says how many).
 */
export function HojaFichaAdversario({ adversarioId, nombre, onClose }: { adversarioId: number | null; nombre: string; onClose: () => void }) {
  const { cId } = usePantalla()
  const era = eraNumero(useEra())
  const { data: catalogo, isLoading, isError } = useQuery({ queryKey: ['global-npcs', cId], queryFn: () => globalNpcsApi.getAll(cId) })
  const npc = catalogo?.find((n) => n.id === adversarioId)
  const [elegida, setElegida] = useState<Vista | null>(null)
  const conLibro = (npc?.bookImages.length ?? 0) > 0
  const vista: Vista = conLibro ? elegida ?? 'libro' : 'resumen'
  const ocultas = npc ? `${npc.talentos}\n${npc.notas}`.split('\n').filter((l) => deOtraEra(l, era)).length : 0
  const mostrar = useMostrarEnMesa()
  const conRetrato = !!npc?.bookImages.includes('retrato')
  return (
    <Sheet
      open
      onClose={onClose}
      title={npc?.name ?? nombre}
      description={npc ? `${npc.tipo}${npc.source ? ` · ${npc.source}` : ''}` : undefined}
      maxWidth={vista === 'libro' ? 820 : 680}
      footer={
        <>
          {conRetrato && npc && (
            <Button
              size="lg"
              variant="secondary"
              icon={<Projector size={16} aria-hidden />}
              style={{ flex: 1 }}
              onClick={() => { mostrar({ tipo: 'retrato', adversarioId: npc.id }, nombre); onClose() }}
            >
              Retrato a la mesa
            </Button>
          )}
          <Button size="lg" style={{ flex: 1 }} onClick={onClose}>Cerrar</Button>
        </>
      }
    >
      {isLoading ? (
        <Spinner label="Cargando la ficha…" />
      ) : !npc ? (
        <p style={{ fontSize: fs.sm, color: c.muted }}>
          {isError ? 'No se pudo cargar el catálogo de adversarios. Cierra la ficha y vuelve a abrirla.' : 'Este adversario ya no está en el catálogo.'}
        </p>
      ) : (
        <div style={stack(18)}>
          {conLibro && (
            <Segmented<Vista>
              ariaLabel="Cómo ver la ficha"
              tone="rubi"
              size="sm"
              value={vista}
              onChange={setElegida}
              options={[{ value: 'libro', label: 'Libro' }, { value: 'resumen', label: 'Resumen' }]}
            />
          )}
          {vista === 'libro' ? (
            <FichaLibro cId={cId} npc={npc} />
          ) : (
            <>
              <SeccionFicha titulo="Rasgos" texto={npc.talentos} era={era} />
              <SeccionFicha titulo="Acciones y notas" texto={npc.notas} era={era} />
              {ocultas > 0 && (
                <p style={{ fontSize: fs.xs, color: c.subtle }}>
                  {ocultas === 1 ? 'Se oculta 1 capacidad' : `Se ocultan ${ocultas} capacidades`} que el libro marca solo para la Era {era === 1 ? 2 : 1}.
                </p>
              )}
            </>
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
