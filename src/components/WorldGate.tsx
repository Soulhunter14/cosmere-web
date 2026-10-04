import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useWorldConfig } from '../store/campaignStore'
import type { WorldConfig } from '../worlds/types'

/**
 * Route guard by capability, never by world id (P4, P8): it renders its children when the world of the current campaign
 * has `feature` and otherwise sends the user back to the encyclopedia index. A new world only needs to declare its
 * `features`, so no route changes. The target is relative to the route that renders the gate, so `../encyclopedia`
 * resolves to /campaigns/:campaignId/encyclopedia (spec §7.2).
 */
export function WorldGate({ feature, children }: { feature: keyof WorldConfig['features']; children: ReactNode }) {
  const cfg = useWorldConfig()
  return cfg.features[feature] ? <>{children}</> : <Navigate to="../encyclopedia" replace />
}
