import React from 'react'
import { cn } from '../lib/utils'

/* ─── Card ─────────────────────────────────────────────── */
export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn('rounded-2xl p-5', className)}
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
      }}
    >
      {children}
    </div>
  )
}

/* ─── Button ────────────────────────────────────────────── */
export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}) {
  const base =
    'inline-flex items-center gap-2 font-medium rounded-xl transition-all duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none active:scale-[0.97]'

  const variants: Record<string, string> = {
    primary:
      'text-white shadow-lg active:scale-[0.97]',
    secondary:
      'text-[var(--text)] hover:text-white hover:bg-[var(--surface-3)]',
    danger:
      'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10',
    ghost:
      'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-white/[0.05]',
  }

  const secondaryStyle =
    variant === 'primary'
      ? {
          background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
          boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
        }
      : variant === 'secondary'
      ? { background: 'var(--surface-2)', border: '1px solid var(--border-bright)' }
      : variant === 'danger'
      ? { background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }
      : {}

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-sm',
  }

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      style={secondaryStyle}
      {...props}
    >
      {children}
    </button>
  )
}

/* ─── Input ─────────────────────────────────────────────── */
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-xl px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/30',
        className
      )}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        props.onBlur?.(e)
      }}
      {...props}
    />
  )
)

/* ─── Textarea ──────────────────────────────────────────── */
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full rounded-xl px-3 py-2 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] transition-all duration-150 resize-none',
        'focus:outline-none focus:ring-2 focus:ring-violet-500/30',
        className
      )}
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'
        props.onFocus?.(e)
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border)'
        props.onBlur?.(e)
      }}
      {...props}
    />
  )
}

/* ─── Label ─────────────────────────────────────────────── */
export function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <label
      className={cn('block text-[10px] font-bold uppercase tracking-widest mb-2', className)}
      style={{ color: 'var(--text-subtle)' }}
    >
      {children}
    </label>
  )
}

/* ─── Badge ─────────────────────────────────────────────── */
export function Badge({
  variant = 'default',
  children,
}: {
  variant?: 'default' | 'success' | 'warning' | 'danger'
  children: React.ReactNode
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.1)',
      color: 'var(--text-muted)',
    },
    success: {
      background: 'rgba(16,185,129,0.1)',
      border: '1px solid rgba(16,185,129,0.2)',
      color: '#34d399',
    },
    warning: {
      background: 'rgba(245,158,11,0.1)',
      border: '1px solid rgba(245,158,11,0.2)',
      color: '#fbbf24',
    },
    danger: {
      background: 'rgba(244,63,94,0.1)',
      border: '1px solid rgba(244,63,94,0.2)',
      color: '#fb7185',
    },
  }

  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={styles[variant]}
    >
      {children}
    </span>
  )
}

/* ─── StatBox ───────────────────────────────────────────── */
export function StatBox({ label, value, max }: { label: string; value: number; max?: number }) {
  const pct = max && max > 0 ? Math.min(100, Math.round((value / max) * 100)) : null

  return (
    <div
      className="rounded-2xl p-4 text-center"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-baseline justify-center gap-0.5 mb-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        {max !== undefined && (
          <span className="text-sm font-normal" style={{ color: 'var(--text-subtle)' }}>
            /{max}
          </span>
        )}
      </div>
      {pct !== null && (
        <div
          className="h-1 rounded-full mb-2 overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      <div
        className="text-[10px] font-bold uppercase tracking-widest"
        style={{ color: 'var(--text-subtle)' }}
      >
        {label}
      </div>
    </div>
  )
}

/* ─── PageHeader ────────────────────────────────────────── */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
    </div>
  )
}

/* ─── Spinner ───────────────────────────────────────────── */
export function Spinner() {
  return (
    <div className="flex items-center justify-center p-16">
      <div className="w-6 h-6 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
    </div>
  )
}

/* ─── ConfirmDialog ─────────────────────────────────────── */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  if (!open) return null
  return (
    <>
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
        onClick={onCancel}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 61,
        background: 'var(--surface-1)', borderTop: '1px solid var(--border-bright)',
        borderRadius: '20px 20px 0 0', padding: '8px 20px 32px',
        boxShadow: '0 -16px 48px rgba(0,0,0,0.5)',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 4, background: 'var(--surface-3)', margin: '8px auto 20px' }} />
        <div style={{
          width: 44, height: 44, borderRadius: 14, margin: '0 auto 14px',
          background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: 6 }}>
          {title}
        </h3>
        {message && (
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', marginBottom: 24 }}>
            {message}
          </p>
        )}
        {!message && <div style={{ marginBottom: 24 }} />}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px', borderRadius: 12,
              background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
              color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px', borderRadius: 12,
              background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)',
              color: '#fb7185', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}

/* ─── ErrorMessage ──────────────────────────────────────── */
export function ErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn('rounded-xl px-4 py-3 text-sm', className)}
      style={{
        background: 'rgba(244,63,94,0.08)',
        border: '1px solid rgba(244,63,94,0.2)',
        color: '#fb7185',
      }}
    >
      {message}
    </div>
  )
}
