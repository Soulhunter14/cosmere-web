import { lazy, Suspense, useState } from 'react'
import { Backpack } from 'lucide-react'
import { Button, Card, Sheet, Spinner } from '../../components/ui'
import { useAuthStore } from '../../store/authStore'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import type { Character } from '../../types'
import { c, fs, radius, tone } from '../../theme'

// The sheet and the data of the seven packages (equipoInicial.ts) are a lazy chunk: only whoever opens the sheet downloads them (§7.4 rule 4, §8 risk 6)
const EquipoInicialSheet = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.EquipoInicialSheet })))

/**
 * Entry of the «Equipo inicial» flow in the Bolsa of a character (T47; L.254-255 / PDF 260-261): a card with the button that opens
 * the sheet of the seven packages. It is visible for the director and for the owner of the character, and only in a world that has the
 * capability (`features.equipoInicial`, never a comparison of world ids): everywhere else it renders nothing at all, so the Bolsa of
 * Archivo de las Tormentas is the same page as before (P1). It lives in its own file so that BolsaDetailPage only gains one line.
 */
export function EquipoInicialButton({ campaignId, character, catalogWeapons }: {
  campaignId: number
  character: Character
  /** Weapons of the catalog of the campaign, as the Bolsa has them: the sheet offers only names that exist in it */
  catalogWeapons: readonly { name: string }[]
}) {
  const cfg = useWorldConfig()
  const isGm = useCampaignStore((s) => s.isGm)
  const user = useAuthStore((s) => s.user)
  const [abierto, setAbierto] = useState(false)

  if (!cfg.features.equipoInicial || !(isGm || (!!user && character.ownerId === user.id))) return null

  return (
    <>
      <section aria-label="Equipo inicial">
        <Card padding="14px 16px" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span
            aria-hidden
            style={{ width: 40, height: 40, flexShrink: 0, borderRadius: radius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', background: tone.brand.bg, border: `1px solid ${tone.brand.border}`, color: tone.brand.fg }}
          >
            <Backpack size={20} />
          </span>
          <p style={{ flex: '1 1 180px', minWidth: 0, fontSize: fs.sm + 1, color: c.muted, lineHeight: 1.5 }}>
            Para un personaje nuevo: elige uno de los siete paquetes del libro y añade a esta bolsa sus armas, su armadura, su equipo y sus arquillas.
          </p>
          <Button variant="secondary" aria-haspopup="dialog" onClick={() => setAbierto(true)}>
            Equipo inicial
          </Button>
        </Card>
      </section>
      {abierto && (
        <Suspense fallback={<Sheet open onClose={() => setAbierto(false)} title="Cargando…" maxWidth={560}><Spinner /></Sheet>}>
          <EquipoInicialSheet open onClose={() => setAbierto(false)} campaignId={campaignId} character={character} catalogWeapons={catalogWeapons} />
        </Suspense>
      )}
    </>
  )
}
