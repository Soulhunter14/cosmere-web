/**
 * Picker of the metalborn path of a character (Nacidos de la bruma, L.127-128 / PDF 133-134): the five paths of chapter 5 as options,
 * filtered by the era of the campaign and disabled for the ancestries that cannot take them, plus the «Camino inicial» choice when the
 * character already has a heroic path (L.17-18 / PDF 23-24, §3 k, §7.4 step 2).
 *
 * Only the director opens it, and only outside edit mode (Q6, §7.4 rule 5). It writes `caminoMetal` and `caminoInicial` and nothing
 * else: the rest of the flow (starting skill, powers, goals) is T28. Loaded lazily from components/mistborn/index.ts and importing its
 * data BY FILE, so none of it reaches the main chunk (§8, risk 6).
 */
import { useId, useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button, Segmented, Sheet } from '../ui'
import { CAMINOS_NACIDOS_DEL_METAL, type CaminoNacidoDelMetal } from '../../data/mistborn/caminosNacidosDelMetal'
import { ASCENDENCIAS_MB } from '../../data/mistborn/origenes'
import type { Era } from '../../types'
import { useWorldConfig } from '../../store/campaignStore'
import { isAvailable } from '../../worlds'
import { c, eyebrow, fs, pill, radius, tone, toneFrom } from '../../theme'
import { FilaOpcion } from './FilaOpcion'

export interface CaminoMetalPickerProps {
  open: boolean
  onClose: () => void
  /** Era of the campaign: the paths that do not exist in it are not offered (`null` = every era) */
  era: Era | null
  /** `Character.ascendencia` ('' = not chosen yet) */
  ascendencia: string
  /** Current `Character.caminoMetal` ('' = none) */
  caminoMetal: string
  /** Current `Character.caminoInicial` */
  caminoInicial: '' | 'heroico' | 'metal'
  /** The character has a heroic path: the picker asks which of the two is the starting one */
  tieneCaminoHeroico: boolean
  onConfirm: (caminoMetal: string, caminoInicial: 'heroico' | 'metal') => void
}

/** «Un poder alomántico», «Todos los poderes feruquímicos», «Un poder alomántico y un poder feruquímico»: the «Artes metálicas» column of L.19 / PDF 25 */
function textoPoderes(p: CaminoNacidoDelMetal['poderes']): string {
  const partes: string[] = []
  if (p.alomancia !== 0) partes.push(p.alomancia === 'todos' ? 'todos los poderes alománticos' : 'un poder alomántico')
  if (p.feruquimia !== 0) partes.push(p.feruquimia === 'todos' ? 'todos los poderes feruquímicos' : 'un poder feruquímico')
  const texto = partes.join(' y ')
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function CaminoMetalPicker({ open, onClose, era, ascendencia, caminoMetal, caminoInicial, tieneCaminoHeroico, onConfirm }: CaminoMetalPickerProps) {
  const cfg = useWorldConfig()
  const notaId = useId()
  const motivoId = useId()

  // The era only filters the options (§3 b); the ancestry disables them: the kandra take none (L.18 / PDF 24) and the other
  // restrictions come from the main talent of each path (nacido de la bruma and feruquimista: human only, L.141 / PDF 147, L.146 / PDF 152)
  const asc = ASCENDENCIAS_MB.find((a) => a.id === ascendencia)
  const ningunCamino = asc?.permiteCaminoMetal === false
  const permitido = (p: CaminoNacidoDelMetal) => ascendencia === '' || (!ningunCamino && p.ascendenciasPermitidas.includes(ascendencia))
  const caminos = CAMINOS_NACIDOS_DEL_METAL.filter((p) => isAvailable(p, era))

  // The picker is mounted when it opens (the sheet renders it only then), so the initial state is the current one
  const [seleccion, setSeleccion] = useState(() => (caminos.some((p) => p.id === caminoMetal && permitido(p)) ? caminoMetal : ''))
  const [inicial, setInicial] = useState<'heroico' | 'metal'>(caminoInicial === 'metal' ? 'metal' : 'heroico')

  // Without a heroic path the metalborn one is the starting path, with no question (§7.4 step 2)
  const inicialEfectivo = tieneCaminoHeroico ? inicial : 'metal'
  const hayCambio = seleccion !== '' && (seleccion !== caminoMetal || inicialEfectivo !== caminoInicial)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={cfg.caminoInvestido?.label ?? 'Camino de nacido del metal'}
      description="Los caminos de nacido del metal son excluyentes; el director puede asignarlo en cualquier nivel: el personaje toma su talento principal."
      maxWidth={480}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} disabled={!hayCambio} onClick={() => onConfirm(seleccion, inicialEfectivo)}>Asignar camino</Button>
        </>
      }
    >
      {ningunCamino && (
        <p
          id={notaId}
          role="note"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12, padding: '10px 14px', borderRadius: radius.sm,
            background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, fontSize: fs.sm, color: c.text, lineHeight: 1.5,
          }}
        >
          <TriangleAlert size={17} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0, marginTop: 1 }} />
          <span>Los {asc?.nombre.toLowerCase()} no pueden tomar talentos de los caminos de nacido del metal.</span>
        </p>
      )}

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {caminos.map((p) => {
          const t = toneFrom(p.color)
          const ok = permitido(p)
          const motivo = !ok && !ningunCamino ? `Requiere ${p.mainTalentPrerequisites.split(';')[0]}.` : null
          const idMotivo = `${motivoId}-${p.id}`
          return (
            <li key={p.id}>
              <FilaOpcion
                titulo={p.name}
                icono={cfg.iconos.caminoInvestido(p.id, 22)}
                t={t}
                selected={seleccion === p.id}
                disabled={!ok}
                describedBy={!ok ? (motivo ? idMotivo : notaId) : undefined}
                onClick={() => setSeleccion(p.id)}
              >
                <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4 }}>{textoPoderes(p.poderes)}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.4 }}>
                    {p.habilidadInicial ? `Habilidad inicial: ${p.habilidadInicial}` : 'Sin habilidad inicial'}
                  </span>
                  {p.soloExperimentados && <span style={{ ...pill(tone.topacio), fontSize: fs.xs }}>Para expertos</span>}
                </span>
              </FilaOpcion>
              {motivo && <p id={idMotivo} style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4, margin: '6px 4px 0' }}>{motivo}</p>}
            </li>
          )
        })}
      </ul>

      {tieneCaminoHeroico && (
        <div style={{ marginTop: 16 }}>
          <p style={{ ...eyebrow, marginBottom: 8 }}>Camino inicial</p>
          <Segmented<'heroico' | 'metal'>
            ariaLabel="Camino inicial"
            value={inicial}
            onChange={setInicial}
            options={[
              { value: 'heroico', label: 'Heroico', ariaLabel: 'Camino heroico' },
              { value: 'metal', label: 'Nacido del metal', ariaLabel: 'Camino de nacido del metal' },
            ]}
          />
          <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5, marginTop: 8 }}>
            El camino inicial da su talento principal sin ocupar un hueco de talento. Si es el de nacido del metal, además obtienes un grado
            gratuito en su habilidad inicial (si la tiene); si es el heroico, el talento principal del camino de nacido del metal ocupa un hueco.
          </p>
        </div>
      )}
    </Sheet>
  )
}
