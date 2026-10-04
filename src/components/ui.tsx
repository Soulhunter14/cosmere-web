import React, { useId, useRef } from 'react'
import { useDialogA11y } from '../hooks/useDialogA11y'
import { createPortal } from 'react-dom'
import { Ban, LockOpen, RotateCcw, Trash2, TriangleAlert, XCircle } from 'lucide-react'
import { cn } from '../lib/utils'
import { c, eyebrow, font, fs, numeral, pill, radius, shadow, titleText, tone as tones, type Tone, type ToneName } from '../theme'

/* ═══════════════════════════════════════════════════════════════════════════
   Shared UI primitives — "Luz tormentosa".
   Inline styles + a few CSS classes in index.css for hover/focus states (ui-*).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ─── Card ─────────────────────────────────────────────── */
export function Card({
  className,
  children,
  style,
  padding = 20,
  interactive = false,
  as: Tag = 'div',
  ...rest
}: {
  className?: string
  children: React.ReactNode
  style?: React.CSSProperties
  padding?: number | string
  interactive?: boolean
  as?: 'div' | 'section' | 'article' | 'li'
} & Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'className' | 'children'>) {
  return (
    <Tag
      className={cn('ui-card', interactive && 'ui-card--interactive', className)}
      style={{
        background: c.s1,
        border: `1px solid ${c.border}`,
        borderRadius: radius.lg,
        boxShadow: shadow[1],
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/* ─── Button ────────────────────────────────────────────── */
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'gold'
type ButtonSize = 'sm' | 'md' | 'lg'

const BUTTON_VARIANTS: Record<ButtonVariant, React.CSSProperties> = {
  primary: { background: c.brandFill, color: c.onBrand, border: '1px solid transparent', boxShadow: '0 6px 20px -8px var(--brand-glow)' },
  secondary: { background: c.s2, color: c.text, border: `1px solid ${c.borderBright}` },
  ghost: { background: 'transparent', color: c.muted, border: '1px solid transparent' },
  danger: { background: 'var(--rubi-bg)', color: 'var(--rubi)', border: '1px solid var(--rubi-border)' },
  gold: { background: 'var(--gold-bg)', color: 'var(--gold)', border: '1px solid var(--gold-border)' },
}

const BUTTON_SIZES: Record<ButtonSize, React.CSSProperties> = {
  sm: { minHeight: 36, padding: '0 12px', fontSize: fs.sm, borderRadius: radius.sm, gap: 6 },
  md: { minHeight: 44, padding: '0 16px', fontSize: fs.base - 1, borderRadius: radius.md, gap: 8 },
  lg: { minHeight: 50, padding: '0 20px', fontSize: fs.base, borderRadius: radius.md, gap: 8 },
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  icon,
  fullWidth,
  loading,
  style,
  type = 'button',
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: React.ReactNode
  fullWidth?: boolean
  loading?: boolean
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn('ui-btn', `ui-btn--${variant}`, className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 650,
        letterSpacing: '0.005em',
        cursor: 'pointer',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        width: fullWidth ? '100%' : undefined,
        ...BUTTON_SIZES[size],
        ...BUTTON_VARIANTS[variant],
        ...style,
      }}
      {...props}
    >
      {loading ? <SpinnerGlyph size={size === 'sm' ? 14 : 16} /> : icon}
      {children}
    </button>
  )
}

/* ─── IconButton (label is mandatory: it becomes aria-label + tooltip) ─── */
export function IconButton({
  label,
  children,
  size = 40,
  variant = 'ghost',
  className,
  style,
  type = 'button',
  ...props
}: Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> & {
  label: string
  size?: number
  variant?: 'ghost' | 'surface' | 'danger'
}) {
  const v: React.CSSProperties =
    variant === 'surface'
      ? { background: c.s2, border: `1px solid ${c.borderBright}`, color: c.muted }
      : { background: 'transparent', border: '1px solid transparent', color: variant === 'danger' ? c.subtle : c.muted }
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn('ui-icon-btn', variant === 'danger' && 'ui-icon-btn--danger', className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        minWidth: size,
        borderRadius: radius.sm,
        cursor: 'pointer',
        padding: 0,
        ...v,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}

/* ─── Input ─────────────────────────────────────────────── */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, style, ...props }, ref) => (
    <input ref={ref} className={cn('ui-field', className)} style={style} {...props} />
  )
)
Input.displayName = 'Input'

/* ─── Textarea ──────────────────────────────────────────── */
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, style, ...props }, ref) => (
    <textarea ref={ref} className={cn('ui-field', className)} style={style} {...props} />
  )
)
Textarea.displayName = 'Textarea'

/* ─── Select ────────────────────────────────────────────── */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, style, children, ...props }, ref) => (
    <select ref={ref} className={cn('ui-field', className)} style={style} {...props}>
      {children}
    </select>
  )
)
Select.displayName = 'Select'

/* ─── Label ─────────────────────────────────────────────── */
export function Label({
  className,
  children,
  htmlFor,
  style,
}: {
  className?: string
  children: React.ReactNode
  htmlFor?: string
  style?: React.CSSProperties
}) {
  return (
    <label htmlFor={htmlFor} className={className} style={{ ...eyebrow, display: 'block', marginBottom: 8, ...style }}>
      {children}
    </label>
  )
}

/* ─── Field: label + control + hint/error, wired with ids ─── */
export function Field({
  label,
  hint,
  error,
  children,
  style,
}: {
  label: React.ReactNode
  hint?: React.ReactNode
  error?: React.ReactNode
  /** A single Input / Textarea / Select element. It receives id + aria-describedby. */
  children: React.ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>
  style?: React.CSSProperties
}) {
  const autoId = useId()
  const id = children.props.id ?? autoId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [children.props['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      <Label htmlFor={id}>{label}</Label>
      {React.cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : children.props['aria-invalid'] })}
      {hint && !error && (
        <p id={hintId} style={{ fontSize: fs.xs, color: c.subtle, marginTop: 6 }}>{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" style={{ fontSize: fs.xs, color: 'var(--rubi)', marginTop: 6, fontWeight: 550 }}>{error}</p>
      )}
    </div>
  )
}

/* ─── Switch ────────────────────────────────────────────── */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
  id,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  /** Accessible name (visually hidden if you render your own text next to it) */
  label: string
  disabled?: boolean
  id?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: 46,
        height: 28,
        flexShrink: 0,
        borderRadius: radius.full,
        border: `1px solid ${checked ? 'var(--brand-border)' : c.borderBright}`,
        background: checked ? 'var(--brand-dark)' : c.s3,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background var(--dur-2), border-color var(--dur-2)',
        padding: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          top: 3,
          left: checked ? 21 : 3,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: checked ? '#fff' : c.muted,
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          transition: 'left var(--dur-2) var(--ease-out), background var(--dur-2)',
        }}
      />
    </button>
  )
}

/* ─── Badge ─────────────────────────────────────────────── */
const BADGE_TONES: Record<'default' | 'success' | 'warning' | 'danger' | 'info', Tone> = {
  default: tones.cuarzo,
  success: tones.esmeralda,
  warning: tones.topacio,
  danger: tones.rubi,
  info: tones.zafiro,
}

export function Badge({
  variant = 'default',
  tone,
  children,
  style,
}: {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  /** Overrides variant with any gem tone */
  tone?: ToneName
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  const t = tone ? tones[tone] : BADGE_TONES[variant]
  return <span style={{ ...pill(t), ...style }}>{children}</span>
}

/* ─── Avatar ────────────────────────────────────────────── */
export function Avatar({ name, size = 32, tone = 'brand' }: { name?: string | null; size?: number; tone?: ToneName }) {
  const initials = name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'
  const t = tones[tone]
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        background: `radial-gradient(120% 120% at 30% 20%, ${t.bg}, var(--surface-2))`,
        border: `1.5px solid ${t.border}`,
        color: t.fg,
        fontSize: Math.max(11, Math.round(size * 0.36)),
        fontWeight: 700,
        letterSpacing: '0.02em',
      }}
    >
      {initials}
    </span>
  )
}

/* ─── StatBox ───────────────────────────────────────────── */
export function StatBox({ label, value, max }: { label: string; value: number; max?: number }) {
  const pct = max && max > 0 ? Math.min(100, Math.round((value / max) * 100)) : null
  return (
    <div
      style={{
        background: c.s2,
        border: `1px solid ${c.border}`,
        borderRadius: radius.lg,
        padding: 16,
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2, marginBottom: 6 }}>
        <span style={{ ...numeral, fontSize: fs['2xl'], color: c.text }}>{value}</span>
        {max !== undefined && <span style={{ fontSize: fs.sm, color: c.subtle }}>/{max}</span>}
      </div>
      {pct !== null && (
        <div
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-label={label}
          style={{ height: 4, borderRadius: 4, marginBottom: 8, overflow: 'hidden', background: c.track }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: '100%',
              borderRadius: 4,
              background: 'linear-gradient(90deg, var(--brand-dark), var(--brand))',
              transition: 'width 500ms var(--ease-out)',
            }}
          />
        </div>
      )}
      <div style={eyebrow}>{label}</div>
    </div>
  )
}

/* ─── PageHeader ────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow: kicker,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  eyebrow?: React.ReactNode
}) {
  return (
    <header style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
      <div style={{ minWidth: 0 }}>
        {kicker && <p style={{ ...eyebrow, color: 'var(--gold)', marginBottom: 6 }}>{kicker}</p>}
        <h1 style={{ ...titleText, fontSize: fs['2xl'], color: c.text }}>{title}</h1>
        {subtitle && <p style={{ fontSize: fs.sm, marginTop: 4, color: c.muted }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </header>
  )
}

/* ─── SectionTitle: official book style (serif small caps + gold rule), h2 by default ─── */
export function SectionTitle({
  children,
  action,
  as: Tag = 'h2',
  style,
  id,
  rule = true,
}: {
  children: React.ReactNode
  action?: React.ReactNode
  as?: 'h2' | 'h3' | 'h4'
  style?: React.CSSProperties
  id?: string
  /** Gold hairline under the title (as in the rulebooks) */
  rule?: boolean
}) {
  return (
    <div style={{ marginBottom: 14, ...style }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <Tag
          id={id}
          style={{
            fontFamily: font.display,
            fontVariantCaps: 'all-small-caps',
            fontSize: fs.lg + 1,
            fontWeight: 600,
            letterSpacing: '0.05em',
            lineHeight: 1.2,
            color: c.text,
          }}
        >
          {children}
        </Tag>
        {action}
      </div>
      {rule && <div aria-hidden style={{ height: 1, marginTop: 6, background: 'var(--gold-rule)' }} />}
    </div>
  )
}

/* ─── EmptyState ────────────────────────────────────────── */
export function EmptyState({
  icon,
  title,
  description,
  action,
  style,
}: {
  icon?: React.ReactNode
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        border: `1px dashed ${c.borderBright}`,
        borderRadius: radius.xl,
        padding: '40px 24px',
        textAlign: 'center',
        background: 'color-mix(in srgb, var(--surface-1) 60%, transparent)',
        ...style,
      }}
    >
      {icon && (
        <div
          aria-hidden
          style={{
            width: 52,
            height: 52,
            margin: '0 auto 14px',
            borderRadius: radius.md,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--brand-bg)',
            border: '1px solid var(--brand-border)',
            color: c.brand,
          }}
        >
          {icon}
        </div>
      )}
      <p style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, color: c.text }}>{title}</p>
      {description && <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 6, maxWidth: 360, marginInline: 'auto' }}>{description}</p>}
      {action && <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center' }}>{action}</div>}
    </div>
  )
}

/* ─── Spinner ───────────────────────────────────────────── */
function SpinnerGlyph({ size = 22 }: { size?: number }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        border: '2px solid var(--brand-bg)',
        borderTopColor: 'var(--brand)',
        animation: 'spin 0.8s linear infinite',
        flexShrink: 0,
      }}
    />
  )
}

export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 64 }}>
      <SpinnerGlyph size={26} />
      <span className="sr-only">{label}</span>
    </div>
  )
}

/* ─── Skeleton ──────────────────────────────────────────── */
export function Skeleton({ height = 16, width = '100%', radius: r = radius.sm, style }: { height?: number | string; width?: number | string; radius?: number; style?: React.CSSProperties }) {
  return <div aria-hidden className="ui-skeleton" style={{ height, width, borderRadius: r, ...style }} />
}

/* ─── Tabs (WAI-ARIA tablist with arrow-key navigation) ─── */
export interface TabItem<T extends string> {
  id: T
  label: React.ReactNode
  /** Accessible name when label is not plain text */
  ariaLabel?: string
  /** Numeric badge (unread count…) */
  badge?: number
  icon?: React.ReactNode
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  idPrefix,
  stretch = false,
  size = 'md',
  tone: t = 'brand',
  style,
}: {
  tabs: TabItem<T>[]
  value: T
  onChange: (id: T) => void
  ariaLabel: string
  /** Used to build tab/panel ids: `${idPrefix}-tab-${id}` / `${idPrefix}-panel-${id}` */
  idPrefix: string
  stretch?: boolean
  size?: 'sm' | 'md'
  /** Colour of the selected tab label (e.g. 'rubi' in the Director area) */
  tone?: ToneName
  style?: React.CSSProperties
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const selectedColor = t === 'brand' ? c.brandLight : tones[t].fg
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    let next = -1
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length
    else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = tabs.length - 1
    if (next >= 0) {
      e.preventDefault()
      onChange(tabs[next].id)
      refs.current[next]?.focus()
    }
  }
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      style={{
        display: 'flex',
        gap: 4,
        padding: 4,
        borderRadius: radius.full,
        background: c.s1,
        border: `1px solid ${c.border}`,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        width: stretch ? '100%' : 'fit-content',
        maxWidth: '100%',
        ...style,
      }}
    >
      {tabs.map((t, i) => {
        const selected = t.id === value
        return (
          <button
            key={t.id}
            ref={(el) => { refs.current[i] = el }}
            type="button"
            role="tab"
            id={`${idPrefix}-tab-${t.id}`}
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${t.id}`}
            aria-label={t.ariaLabel}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="ui-tab"
            style={{
              flex: stretch ? 1 : '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: size === 'sm' ? 38 : 42,
              padding: size === 'sm' ? '0 12px' : '0 16px',
              borderRadius: radius.full,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontSize: size === 'sm' ? fs.sm : fs.sm + 1,
              fontWeight: selected ? 650 : 550,
              background: selected ? c.s3 : 'transparent',
              color: selected ? selectedColor : c.muted,
              boxShadow: selected ? shadow[1] : 'none',
            }}
          >
            {t.icon}
            {t.label}
            {!!t.badge && t.badge > 0 && (
              <span
                aria-label={`${t.badge} sin leer`}
                style={{
                  minWidth: 18,
                  height: 18,
                  padding: '0 5px',
                  borderRadius: radius.full,
                  background: c.brandFill,
                  color: c.onBrand,
                  fontSize: 11,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                }}
              >
                {t.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function TabPanel({
  idPrefix,
  id,
  children,
  style,
}: {
  idPrefix: string
  id: string
  children: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-tab-${id}`} style={style}>
      {children}
    </div>
  )
}

/* ─── Segmented control (single choice; radiogroup semantics) ─── */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  tone: t = 'brand',
  size = 'md',
  stretch = true,
  style,
}: {
  options: { value: T; label: React.ReactNode; ariaLabel?: string; disabled?: boolean }[]
  value: T
  onChange: (v: T) => void
  ariaLabel: string
  tone?: ToneName
  size?: 'sm' | 'md'
  stretch?: boolean
  style?: React.CSSProperties
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const tn = tones[t]
  // Roving tabindex: only the checked radio is tabbable. With nothing checked (a choice still pending, e.g. the era of a
  // new campaign) the first enabled radio takes the Tab stop instead, as in the WAI-ARIA radio pattern; otherwise the
  // whole group would be unreachable by keyboard.
  const checkedIndex = options.findIndex((o) => o.value === value)
  const tabStop = checkedIndex >= 0 ? checkedIndex : options.findIndex((o) => !o.disabled)
  const move = (e: React.KeyboardEvent, i: number) => {
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
    if (!dir) return
    e.preventDefault()
    for (let k = 1; k <= options.length; k++) {
      const j = (i + dir * k + options.length) % options.length
      if (!options[j].disabled) { onChange(options[j].value); refs.current[j]?.focus(); break }
    }
  }
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      style={{
        display: 'flex', gap: 4, padding: 3,
        borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`,
        width: stretch ? '100%' : 'fit-content', ...style,
      }}
    >
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button
            key={String(o.value)}
            ref={(el) => { refs.current[i] = el }}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={o.ariaLabel}
            disabled={o.disabled}
            tabIndex={i === tabStop ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => move(e, i)}
            className="ui-seg"
            style={{
              flex: stretch ? 1 : '0 0 auto',
              minHeight: size === 'sm' ? 34 : 40,
              padding: size === 'sm' ? '0 10px' : '0 12px',
              borderRadius: radius.sm,
              border: `1px solid ${on ? tn.border : 'transparent'}`,
              background: on ? tn.bg : 'transparent',
              color: on ? tn.fg : c.muted,
              fontSize: size === 'sm' ? fs.xs + 1 : fs.sm,
              fontWeight: on ? 700 : 550,
              cursor: o.disabled ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/* ─── Stepper (− value +) ─── */
export function Stepper({
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
  label,
  format,
  size = 'md',
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  step?: number
  /** Accessible name, e.g. "Número de dados" */
  label: string
  format?: (v: number) => React.ReactNode
  size?: 'sm' | 'md'
}) {
  const h = size === 'sm' ? 36 : 44
  const btn: React.CSSProperties = {
    width: h, height: h, borderRadius: radius.sm, border: `1px solid ${c.borderBright}`,
    background: c.s2, color: c.text, fontSize: fs.lg, fontWeight: 600, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  }
  return (
    <div role="group" aria-label={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <button type="button" className="ui-btn ui-btn--secondary" style={btn} aria-label={`Restar (${label})`} disabled={value - step < min} onClick={() => onChange(Math.max(min, value - step))}>−</button>
      <output aria-live="polite" style={{ ...numeral, minWidth: 36, textAlign: 'center', fontSize: size === 'sm' ? fs.lg : fs.xl, color: c.text }}>
        {format ? format(value) : value}
      </output>
      <button type="button" className="ui-btn ui-btn--secondary" style={btn} aria-label={`Sumar (${label})`} disabled={value + step > max} onClick={() => onChange(Math.min(max, value + step))}>+</button>
    </div>
  )
}

/* ─── Disclosure / accordion card ─── */
export function Disclosure({
  title,
  summary,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onToggle,
  accent,
  icon,
  headingLevel = 3,
  style,
}: {
  title: React.ReactNode
  summary?: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  open?: boolean
  onToggle?: (open: boolean) => void
  /** Optional accent colour (any CSS colour) for the left rail when open */
  accent?: string
  icon?: React.ReactNode
  headingLevel?: 2 | 3 | 4
  style?: React.CSSProperties
}) {
  const [inner, setInner] = React.useState(defaultOpen)
  const isOpen = controlledOpen ?? inner
  const id = useId()
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4'
  const toggle = () => { const n = !isOpen; if (controlledOpen === undefined) setInner(n); onToggle?.(n) }
  return (
    <div
      className="ui-card"
      style={{
        background: c.s1,
        border: `1px solid ${isOpen ? c.borderBright : c.border}`,
        borderRadius: radius.lg,
        overflow: 'hidden',
        boxShadow: isOpen && accent ? `inset 3px 0 0 ${accent}` : undefined,
        ...style,
      }}
    >
      <H style={{ margin: 0, fontFamily: font.ui, fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 0 }}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          onClick={toggle}
          className="ui-row"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
            padding: '14px 16px', minHeight: 56, background: 'none', border: 'none', cursor: 'pointer', color: c.text,
          }}
        >
          {icon && <span aria-hidden style={{ display: 'flex', color: accent ?? c.brand }}>{icon}</span>}
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.25 }}>{title}</span>
            {summary && <span style={{ display: 'block', fontSize: fs.sm, color: c.muted, marginTop: 3, lineHeight: 1.45 }}>{summary}</span>}
          </span>
          <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ color: c.subtle, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}>
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </H>
      {isOpen && (
        <div id={`${id}-panel`} role="region" aria-labelledby={`${id}-btn`} className="fade-in" style={{ padding: '0 16px 16px', borderTop: `1px solid ${c.border}` }}>
          <div style={{ paddingTop: 14 }}>{children}</div>
        </div>
      )}
    </div>
  )
}

/* ─── StatTile: label + big value + optional breakdown ─── */
export function StatTile({
  label,
  value,
  sub,
  tone: t,
  icon,
  style,
}: {
  label: React.ReactNode
  value: React.ReactNode
  sub?: React.ReactNode
  tone?: ToneName
  icon?: React.ReactNode
  style?: React.CSSProperties
}) {
  const tn = t ? tones[t] : undefined
  return (
    <div
      style={{
        background: c.s1,
        border: `1px solid ${tn ? tn.border : c.border}`,
        borderRadius: radius.md,
        padding: '12px 14px',
        minWidth: 0,
        boxShadow: shadow[1],
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...eyebrow, color: tn ? tn.fg : c.subtle, marginBottom: 8 }}>
        {icon && <span aria-hidden style={{ display: 'flex' }}>{icon}</span>}
        {label}
      </div>
      <div style={{ ...numeral, fontSize: fs.xl + 2, color: tn ? tn.fg : c.text }}>{value}</div>
      {sub && <div style={{ fontSize: fs.xs, color: c.subtle, marginTop: 6, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  )
}

/* ─── Sheet: bottom sheet on mobile, centred dialog from 640px ─── */
export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 520,
  role = 'dialog',
  hideHeader = false,
  zIndex,
}: {
  open: boolean
  onClose: () => void
  /** Always required for the accessible name; hide it visually with hideHeader */
  title: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: number
  role?: 'dialog' | 'alertdialog'
  hideHeader?: boolean
  zIndex?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  useDialogA11y(ref, open, onClose)
  if (!open) return null
  return createPortal(
    <div className="ui-sheet-wrap" style={zIndex ? { zIndex } : undefined}>
      <div className="fade-in" onClick={onClose} aria-hidden style={{ position: 'absolute', inset: 0, background: c.overlay, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div
        ref={ref}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className="ui-sheet"
        style={{ maxWidth }}
      >
        <div aria-hidden className="ui-sheet-handle" />
        <div className={hideHeader ? 'sr-only' : undefined} style={hideHeader ? undefined : { padding: '4px 20px 12px' }}>
          <h2 id={titleId} style={{ fontSize: fs.xl, fontWeight: 650, color: c.text }}>{title}</h2>
          {description && <p id={descId} style={{ fontSize: fs.sm, color: c.muted, marginTop: 4 }}>{description}</p>}
        </div>
        <div style={{ padding: hideHeader ? '4px 20px 20px' : '0 20px 20px', overflowY: 'auto', flex: 1, minHeight: 0 }}>{children}</div>
        {footer && (
          <div style={{ padding: '12px 20px calc(16px + var(--sab))', borderTop: `1px solid ${c.border}`, display: 'flex', gap: 10 }}>{footer}</div>
        )}
      </div>
    </div>,
    document.body,
  )
}

/* ─── ConfirmDialog ─────────────────────────────────────── */
type ConfirmIcon = 'trash' | 'unlock' | 'reject' | 'discard' | 'warning' | 'ban'
const CONFIRM_ICONS = { trash: Trash2, unlock: LockOpen, reject: XCircle, discard: RotateCcw, warning: TriangleAlert, ban: Ban }
/** Picks the icon from the action when none is given, so "Desbloquear" or "Rechazar" don't show a trash can */
function inferConfirmIcon(label: string): ConfirmIcon {
  const l = label.toLowerCase()
  if (/eliminar|borrar|quitar|retirar|olvidar|expulsar/.test(l)) return 'trash'
  if (/desbloquear/.test(l)) return 'unlock'
  if (/rechazar/.test(l)) return 'reject'
  if (/descartar/.test(l)) return 'discard'
  return 'warning'
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  tone: t = 'danger',
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  /** Plain text or rich content (e.g. the item name in <strong>) */
  message?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'brand'
  /** Defaults to an icon inferred from confirmLabel */
  icon?: ConfirmIcon
  /** Disables both buttons and shows a spinner on the confirm button while the action runs */
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()
  useDialogA11y(ref, open, () => { if (!loading) onCancel() })
  if (!open) return null
  const accent = t === 'danger' ? tones.rubi : tones.brand
  const Icon = CONFIRM_ICONS[icon ?? inferConfirmIcon(confirmLabel)]
  return createPortal(
    <div className="ui-sheet-wrap">
      <div className="fade-in" onClick={() => { if (!loading) onCancel() }} aria-hidden style={{ position: 'absolute', inset: 0, background: c.overlay, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? descId : undefined}
        aria-busy={loading || undefined}
        tabIndex={-1}
        className="ui-sheet"
        style={{ maxWidth: 420, padding: '0 20px calc(24px + var(--sab))', textAlign: 'center' }}
      >
        <div aria-hidden className="ui-sheet-handle" />
        <div
          aria-hidden
          style={{
            width: 52, height: 52, borderRadius: radius.md, margin: '8px auto 16px',
            background: accent.bg, border: `1px solid ${accent.border}`, color: accent.fg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
        <h2 id={titleId} style={{ fontSize: fs.xl, fontWeight: 650, color: c.text, marginBottom: 8 }}>{title}</h2>
        {message ? (
          <div id={descId} style={{ fontSize: fs.sm + 1, color: c.muted, marginBottom: 24, lineHeight: 1.5 }}>{message}</div>
        ) : (
          <div style={{ marginBottom: 24 }} />
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" size="lg" onClick={onCancel} style={{ flex: 1 }} data-autofocus disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={t === 'danger' ? 'danger' : 'primary'} size="lg" onClick={onConfirm} style={{ flex: 1 }} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/* ─── ErrorMessage ──────────────────────────────────────── */
export function ErrorMessage({ message, className, style }: { message: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      role="alert"
      className={className}
      style={{
        borderRadius: radius.md,
        padding: '12px 16px',
        fontSize: fs.sm + 1,
        background: 'var(--rubi-bg)',
        border: '1px solid var(--rubi-border)',
        color: 'var(--rubi)',
        ...style,
      }}
    >
      {message}
    </div>
  )
}
