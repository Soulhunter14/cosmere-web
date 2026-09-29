/**
 * BudgetSheet — the book's talent budget, in a table, plus (when a route is given) an informative
 * "as soon as possible" plan by level. Never blocks anything: it only explains the numbers already
 * shown as a chip on the character row / the fixed bar.
 */
import type { CSSProperties } from 'react'
import { Info, TriangleAlert } from 'lucide-react'
import { Button, SectionTitle, Sheet } from '../ui'
import { c, eyebrow, fs, radius, tone } from '../../theme'
import type { RouteResult, talentBudget } from '../../lib/talentGraph'

type Budget = ReturnType<typeof talentBudget>

export function BudgetSheet({ open, onClose, budget, route, level }: {
  open: boolean
  onClose: () => void
  budget: Budget
  route?: RouteResult | null
  level: number
}) {
  const showRoute = !!route && route.reachable && !route.owned && route.steps.length > 0
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Presupuesto de talentos"
      description={budget.excessDetail}
      maxWidth={560}
      footer={<Button variant="secondary" size="lg" onClick={onClose} fullWidth data-autofocus>Cerrar</Button>}
    >
      {budget.missing.length > 0 && (
        <div
          role="status"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, background: tone.zafiro.bg,
            border: `1px solid ${tone.zafiro.border}`, borderRadius: radius.md, padding: '12px 14px', marginBottom: 12,
          }}
        >
          <Info size={17} aria-hidden style={{ color: tone.zafiro.fg, marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: fs.sm + 1, fontWeight: 700, color: tone.zafiro.fg, lineHeight: 1.35 }}>Falta una elección obligatoria</p>
            <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2, lineHeight: 1.4 }}>
              {budget.missing.map((r) => r.label).join(' · ')}
            </p>
          </div>
        </div>
      )}

      {budget.excessText && (
        <div
          role="status"
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, background: tone.topacio.bg,
            border: `1px solid ${tone.topacio.border}`, borderRadius: radius.md, padding: '12px 14px', marginBottom: 12,
          }}
        >
          <TriangleAlert size={17} aria-hidden style={{ color: tone.topacio.fg, marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: fs.sm + 1, color: tone.topacio.fg, lineHeight: 1.4 }}>{budget.excessText}</p>
        </div>
      )}

      <div style={{ overflowX: 'auto', border: `1px solid ${c.border}`, borderRadius: radius.md }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: fs.sm }}>
          <caption className="sr-only">Huecos de talento por nivel, su tipo y qué talento los ocupa</caption>
          <thead>
            <tr style={{ background: c.s2 }}>
              <th scope="col" style={thStyle}>Nivel</th>
              <th scope="col" style={thStyle}>Hueco</th>
              <th scope="col" style={thStyle}>Tipo</th>
              <th scope="col" style={thStyle}>Ocupado por</th>
            </tr>
          </thead>
          <tbody>
            {budget.rows.map((row, i) => {
              const empty = !row.filledBy
              const flagged = row.mandatory && empty
              return (
                <tr key={i} style={{ background: flagged ? tone.zafiro.bg : undefined, borderTop: `1px solid ${c.border}` }}>
                  <td style={{ ...tdStyle, fontVariantNumeric: 'tabular-nums', fontWeight: 650 }}>{row.level}</td>
                  <td style={tdStyle}>{row.label}</td>
                  <td style={{ ...tdStyle, color: c.muted }}>{row.acceptsLabel}</td>
                  <td style={{ ...tdStyle, color: empty ? (flagged ? tone.zafiro.fg : c.subtle) : c.text, fontWeight: empty ? 600 : 500 }}>
                    {row.filledBy ?? (row.mandatory ? 'Vacío (obligatorio)' : '—')}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {budget.unplaced.length > 0 && (
        <p style={{ fontSize: fs.xs, color: c.subtle, marginTop: 10, lineHeight: 1.4 }}>
          No caben en ningún hueco: {budget.unplaced.join(', ')}
        </p>
      )}

      {showRoute && route && (
        <div style={{ marginTop: 20 }}>
          <SectionTitle as="h3">Plan «lo antes posible»</SectionTitle>
          <p style={{ fontSize: fs.sm, color: c.muted, marginBottom: 10 }}>
            {route.talents} talento{route.talents !== 1 ? 's' : ''} · posible desde nivel {route.gateLevel}
            {route.earliestLevel > route.gateLevel && ` · lo antes posible en nivel ${route.earliestLevel}`}
            {level >= route.earliestLevel && ' · ya tienes hueco para él'}
          </p>
          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {route.steps.map((step, i) => (
              <li
                key={step.nodeId}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  background: c.s2, border: `1px solid ${c.border}`, borderRadius: radius.sm, padding: '8px 12px',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <span style={{ ...eyebrow, color: c.subtle, flexShrink: 0 }}>{i + 1}</span>
                  <span style={{ fontSize: fs.sm + 1, fontWeight: 600, color: c.text, overflowWrap: 'anywhere' }}>{step.name}</span>
                </span>
                <span style={{ fontSize: fs.xs, color: step.availableNow ? tone.esmeralda.fg : c.subtle, flexShrink: 0, fontWeight: 650 }}>
                  {step.availableNow ? 'Disponible ahora' : `Nivel mínimo ${step.minLevel}`}
                </span>
              </li>
            ))}
          </ol>
          {route.skills.length > 0 && (
            <p style={{ fontSize: fs.xs, color: c.subtle, marginTop: 10, lineHeight: 1.4 }}>
              Habilidades en la ruta: {route.skills.map((s) => `${s.skill} ${s.min} (tienes ${s.current})`).join(' · ')}
            </p>
          )}
          {route.gates.length > 0 && (
            <p style={{ fontSize: fs.xs, color: c.subtle, marginTop: 6, lineHeight: 1.4 }}>
              Otras condiciones: {route.gates.map((g) => g.text).join(' · ')}
            </p>
          )}
        </div>
      )}
    </Sheet>
  )
}

const thStyle: CSSProperties = {
  textAlign: 'left', padding: '8px 12px', fontSize: fs.xs, fontWeight: 700,
  letterSpacing: '0.04em', textTransform: 'uppercase', color: c.subtle,
}
const tdStyle: CSSProperties = { padding: '8px 12px', verticalAlign: 'top', lineHeight: 1.35 }
