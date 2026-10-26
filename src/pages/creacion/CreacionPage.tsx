/**
 * «Creación de personajes»: the director releases the world's steps one by one and the players fill them in; «Personaje creado» sends
 * the sheet to «Personajes». Both views read GET …/creacion and refresh on the hub event `CreacionUpdated`. Own chunk (lazy route),
 * only in worlds with `features.creacionGuiada`.
 */
import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { creacionApi } from '../../api/creacion'
import { ErrorMessage, Spinner } from '../../components/ui'
import { useCampaignHub } from '../../hooks/useCampaignHub'
import { useAuthStore } from '../../store/authStore'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { page } from '../../theme'
import { CreacionDirector } from './CreacionDirector'
import { CreacionJugador } from './CreacionJugador'

export function CreacionPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const { isGm } = useCampaignStore()
  const cfg = useWorldConfig()
  const userId = useAuthStore((s) => s.user?.id ?? null)
  const qc = useQueryClient()

  const { data: estado, isLoading, error } = useQuery({
    queryKey: ['creacion', cId],
    queryFn: () => creacionApi.get(cId),
    enabled: cId > 0,
  })

  // The event carries no data: whoever hears it reads the state again (and the characters, whose names and answers changed)
  const handlers = useMemo(() => ({
    CreacionUpdated: () => {
      qc.invalidateQueries({ queryKey: ['creacion', cId] })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
      qc.invalidateQueries({ queryKey: ['character', cId] })
    },
  }), [qc, cId])
  useCampaignHub(cId, handlers)

  if (!cfg.creacion) return <Navigate to="../personajes" replace />
  if (isLoading) return <Spinner />
  if (error || !estado) {
    return (
      <div style={page}>
        <ErrorMessage message="No se ha podido cargar la creación de personajes." />
      </div>
    )
  }
  return isGm
    ? <CreacionDirector cId={cId} estado={estado} pasos={cfg.creacion.pasos} />
    : <CreacionJugador cId={cId} estado={estado} pasos={cfg.creacion.pasos} userId={userId} />
}
