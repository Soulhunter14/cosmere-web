/**
 * «Creación» on the director's screen: the creation session (prepare it, start it, go back, end it), each character in creation with
 * its answers and the director's notes, and the record of what the table decides, which is written on each sheet as it comes. The tab
 * exists only while the world has guided creation and the creation session has not been played yet (`PantallaPage`).
 */
import type { CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Film } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { EmptyState } from '../../components/ui'
import { usePantalla } from './contexto'
import { useCreacionPantalla } from './creacionPantalla'
import { RegistroDecisiones } from './DecisionGuion'
import { SeccionSesionCreacion } from './SesionCreacion'
import { useAccionesSesionCreacion } from './sesionCreacionAcciones'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

export function PanelCreacion() {
  const { cId } = usePantalla()
  const { creacion } = useCreacionPantalla(cId)
  const { data: personajes = [] } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId) })
  const acc = useAccionesSesionCreacion()
  if (!creacion) {
    return <EmptyState icon={<Film size={22} aria-hidden />} title="Sin creación guiada" description="Este mundo no tiene sesión de creación." />
  }
  return (
    <div style={stack(14)}>
      <h2 className="sr-only">Creación</h2>
      <SeccionSesionCreacion acc={acc} />
      <RegistroDecisiones personajes={personajes} />
    </div>
  )
}
