import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { Spinner } from '../../components/ui'
import type { Character, UpdateCharacterRequest } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { POTENCIAS } from '../../data/potencias'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { TalentActivation } from '../../components/TalentActivation'
import type { ActivationType } from '../../components/TalentActivation'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6366f1)',
  'linear-gradient(135deg,#0e7490,#0284c7)',
  'linear-gradient(135deg,#9d174d,#be185d)',
  'linear-gradient(135deg,#065f46,#0d9488)',
  'linear-gradient(135deg,#92400e,#b45309)',
  'linear-gradient(135deg,#4c1d95,#7c3aed)',
]

const SKILL_NAME_MAP: Record<string, string> = {
  'Agilidad': 'agilidad', 'Armas Ligeras': 'armasLigeras', 'Armas Pesadas': 'armasPesadas',
  'Atletismo': 'atletismo', 'Hurto': 'hurto', 'Sigilo': 'sigilo',
  'Deducción': 'deduccion', 'Disciplina': 'disciplina', 'Intimidación': 'intimidacion',
  'Manufactura': 'manufactura', 'Medicina': 'medicina', 'Conocimiento': 'conocimiento',
  'Saber': 'conocimiento', 'Engaño': 'engano', 'Liderazgo': 'liderazgo',
  'Percepción': 'percepcion', 'Perspicacia': 'perspicacia',
  'Persuasión': 'persuasion', 'Supervivencia': 'supervivencia',
}

function checkPrereq(
  prereq: string | undefined,
  char: Character,
  selected: string[],
  heroicMainTalent: string | undefined,
  radiantMainTalent: string | undefined,
): { met: boolean; missing: string[] } {
  if (!prereq) return { met: true, missing: [] }
  const missing: string[] = []
  const andClauses = prereq.split(/[,;]/).map((s) => s.trim()).filter(Boolean)
  for (const clause of andClauses) {
    const masked = clause.replace(/(\d+) o más/g, '$1__GTE__')
    const orParts = masked.split(/ [ou] /).map((s) => s.trim().replace(/__GTE__/g, ' o más'))
    const clauseMet = orParts.some((part) => {
      if (part.startsWith('tener ')) return true
      const mainMatch = part.match(/^talento principal (.+)$/)
      if (mainMatch) {
        const n = mainMatch[1]
        return heroicMainTalent === n || radiantMainTalent === n || selected.includes(n)
      }
      const talentMatch = part.match(/^talento (.+)$/)
      if (talentMatch) return selected.includes(talentMatch[1])
      const skillMatch = part.match(/^(.+?) (\d+) o más$/)
      if (skillMatch) {
        const skillName = skillMatch[1]
        const minVal = parseInt(skillMatch[2])
        const key = SKILL_NAME_MAP[skillName]
        if (key) return ((char as any)[key] ?? 0) >= minVal
        for (let i = 1; i <= 6; i++) {
          if ((char as any)[`habilidadPersonalizada${i}`] === skillName)
            return ((char as any)[`habilidadPersonalizada${i}Valor`] ?? 0) >= minVal
        }
        return false
      }
      return selected.includes(part)
    })
    if (!clauseMet) missing.push(clause)
  }
  return { met: missing.length === 0, missing }
}

type AvailableTalento = { name: string; activation: ActivationType | null; description: string; source: string; sourceColor: string; prereq?: string }

export function TalentosDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId)
  const charId = Number(characterId)
  const qc = useQueryClient()
  const [talentoPicker, setTalentoPicker] = useState(false)

  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, charId],
    queryFn: () => charactersApi.getById(cId, charId),
  })

  const talentosMutation = useMutation({
    mutationFn: (names: string[]) =>
      charactersApi.update(cId, charId, { ...(character as UpdateCharacterRequest), talentos: JSON.stringify(names) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, charId] }),
  })

  if (isLoading || !character) return <Spinner />

  const gradient = AVATAR_GRADIENTS[character.id % AVATAR_GRADIENTS.length]
  const heroicPath = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
  const radiantOrder = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)

  const availableTalentos: AvailableTalento[] = []
  if (heroicPath) {
    availableTalentos.push({ name: heroicPath.mainTalent, activation: null, description: heroicPath.mainTalentEffect, source: heroicPath.name, sourceColor: heroicPath.color })
    for (const spec of heroicPath.specialties)
      for (const kt of spec.talentos)
        availableTalentos.push({ name: kt.name, activation: kt.activation, description: kt.description, source: `${heroicPath.name} · ${spec.name}`, sourceColor: heroicPath.color, prereq: kt.prerequisites })
  }
  if (radiantOrder) {
    for (const t of radiantOrder.talentos)
      availableTalentos.push({ name: t.name, activation: t.cost, description: t.description, source: radiantOrder.name, sourceColor: radiantOrder.color, prereq: t.prereq })
    for (const surgeName of radiantOrder.surges) {
      const potencia = POTENCIAS.find((p) => p.name === surgeName)
      if (potencia) {
        availableTalentos.push({ name: potencia.name, activation: potencia.costoBase, description: potencia.descripcion, source: radiantOrder.name, sourceColor: radiantOrder.color })
        for (const t of potencia.talentos)
          availableTalentos.push({ name: t.name, activation: t.cost, description: t.description, source: surgeName, sourceColor: radiantOrder.color, prereq: t.prereq })
      }
    }
  }

  const selectedTalentos: string[] = (() => { try { return JSON.parse(character.talentos || '[]') } catch { return [] } })()
  const talentosMap = new Map(availableTalentos.map((t) => [t.name, t]))

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Hero header */}
      <div style={{ background: gradient, padding: '28px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              {character.name}
            </h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              Nv. {character.level}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
            {heroicPath && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}>
                {heroicPath.icon} {heroicPath.name}
              </span>
            )}
            {radiantOrder && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <RadiantOrderIcon orderId={radiantOrder.id} size={10} />
                {radiantOrder.name}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, margin: 0 }}>Talentos</p>
        </div>
      </div>

      <div style={{ padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>
            {selectedTalentos.length} TALENTO{selectedTalentos.length !== 1 ? 'S' : ''}
          </span>
          <button
            onClick={() => setTalentoPicker(true)}
            disabled={availableTalentos.filter((t) => !selectedTalentos.includes(t.name)).length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
              fontSize: 12, fontWeight: 700,
              opacity: availableTalentos.filter((t) => !selectedTalentos.includes(t.name)).length === 0 ? 0.4 : 1,
            }}
          >
            <Plus size={12} /> Añadir talento
          </button>
        </div>

        {/* No paths */}
        {!heroicPath && !radiantOrder && (
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
              Asigna un Camino Heroico u Orden Radiante en la ficha para ver los talentos disponibles.
            </p>
          </div>
        )}

        {/* Empty */}
        {selectedTalentos.length === 0 && (heroicPath || radiantOrder) && (
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Ningún talento aprendido aún.</p>
          </div>
        )}

        {/* Talento cards */}
        {selectedTalentos.map((name) => {
          const t = talentosMap.get(name)
          const isPotenciaMain = !!radiantOrder?.surges.includes(name)
          const isMainTalent = heroicPath?.mainTalent === name || radiantOrder?.talentos[0]?.name === name || isPotenciaMain
          const mainPath = heroicPath?.mainTalent === name ? heroicPath : (radiantOrder?.talentos[0]?.name === name || isPotenciaMain) ? radiantOrder : null
          return (
            <div key={name} style={{ background: 'var(--surface-1)', border: `1px solid ${isMainTalent ? (mainPath?.colorBorder ?? 'var(--border)') : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{name}</span>
                  {isMainTalent && mainPath && (
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 20, background: mainPath.colorBg, border: `1px solid ${mainPath.colorBorder}`, color: mainPath.color }}>
                      PRINCIPAL
                    </span>
                  )}
                  {t?.activation && <TalentActivation type={t.activation} compact />}
                  {t && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                      padding: '2px 6px', borderRadius: 20,
                      background: `color-mix(in srgb, ${t.sourceColor} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${t.sourceColor} 30%, transparent)`,
                      color: t.sourceColor,
                    }}>{t.source.toUpperCase()}</span>
                  )}
                </div>
                {!isMainTalent && (
                  <button
                    onClick={() => talentosMutation.mutate(selectedTalentos.filter((n) => n !== name))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'var(--text-subtle)', flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {t && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{t.description}</p>}
              {!t && <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0, fontStyle: 'italic' }}>Talento personalizado</p>}
            </div>
          )
        })}
      </div>

      {/* Talento picker sheet */}
      {talentoPicker && (() => {
        const autoAdded = new Set([heroicPath?.mainTalent, radiantOrder?.talentos[0]?.name, ...(radiantOrder?.surges ?? [])])
        const unselected = availableTalentos
          .filter((t) => !selectedTalentos.includes(t.name) && !autoAdded.has(t.name))
          .map((t) => {
            const { met, missing } = checkPrereq(t.prereq, character, selectedTalentos, heroicPath?.mainTalent, radiantOrder?.talentos[0]?.name)
            return { ...t, met, missing }
          })
        const available = unselected.filter((t) => t.met)
        const locked = unselected.filter((t) => !t.met)
        return (
          <>
            <div onClick={() => setTalentoPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
              background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
              border: '1px solid var(--border-bright)', borderBottom: 'none',
              maxHeight: '75vh', display: 'flex', flexDirection: 'column',
              paddingBottom: 'calc(16px + var(--sab, 0px))',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 14px', flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Añadir talento</span>
                <button onClick={() => setTalentoPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {available.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => { talentosMutation.mutate([...selectedTalentos, t.name]); setTalentoPicker(false) }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.name}</span>
                      {t.activation && <TalentActivation type={t.activation} compact />}
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 20, background: `color-mix(in srgb, ${t.sourceColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${t.sourceColor} 30%, transparent)`, color: t.sourceColor }}>{t.source.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{t.description}</p>
                  </button>
                ))}
                {available.length === 0 && locked.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: '20px 0' }}>
                    Ya has aprendido todos los talentos disponibles.
                  </p>
                )}
                {locked.length > 0 && (
                  <>
                    {available.length > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />}
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', margin: '4px 0 0' }}>BLOQUEADOS</p>
                    {locked.map((t) => (
                      <div key={t.name} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 12, textAlign: 'left', width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', opacity: 0.5 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>🔒 {t.name}</span>
                          {t.activation && <TalentActivation type={t.activation} compact />}
                          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 20, background: `color-mix(in srgb, ${t.sourceColor} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${t.sourceColor} 30%, transparent)`, color: t.sourceColor }}>{t.source.toUpperCase()}</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#f59e0b', lineHeight: 1.4, margin: 0, fontStyle: 'italic' }}>
                          Requiere: {t.missing.join(' · ')}
                        </p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{t.description}</p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}
