import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'

/**
 * «La banda»: when the director changes who can see the crew sheet (`crewSheetShared`, re-dispatched by the DiceRoller from the hub), the
 * campaign detail is fetched again so its `bandaVisible` shows or hides the section in the menu without reloading.
 */
export function useBandaCompartida(campaignId: number) {
  const qc = useQueryClient()
  useEffect(() => {
    if (!(campaignId > 0)) return
    const alCompartir = (e: Event) => {
      if ((e as CustomEvent<{ campaignId?: number }>).detail?.campaignId !== campaignId) return
      qc.invalidateQueries({ queryKey: ['campaign', campaignId] })
    }
    window.addEventListener('crewSheetShared', alCompartir)
    return () => window.removeEventListener('crewSheetShared', alCompartir)
  }, [campaignId, qc])
}
