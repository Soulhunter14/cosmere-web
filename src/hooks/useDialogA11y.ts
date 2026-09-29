import { useEffect, useRef, type RefObject } from 'react'

/* ─── Dialog accessibility hook: focus trap, Escape, restore focus, scroll lock ───
   Dialogs stack: only the top-most one reacts to Escape/Tab, so a ConfirmDialog opened from a Sheet
   closes alone. Use it for any custom overlay: `useDialogA11y(ref, open, onClose)` and give the
   element role="dialog" aria-modal="true" aria-labelledby tabIndex={-1}. */
const FOCUSABLE = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
const dialogStack: symbol[] = []
let lockedOverflow: string | null = null

export function useDialogA11y(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })
  useEffect(() => {
    if (!open) return
    const token = Symbol('dialog')
    dialogStack.push(token)
    const previous = document.activeElement as HTMLElement | null
    const node = ref.current
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? node)?.focus({ preventScroll: true })
    if (dialogStack.length === 1) {
      lockedOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    const onKey = (e: KeyboardEvent) => {
      if (dialogStack[dialogStack.length - 1] !== token) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key !== 'Tab' || !ref.current) return
      const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (items.length === 0) { e.preventDefault(); return }
      const firstEl = items[0]
      const lastEl = items[items.length - 1]
      if (!ref.current.contains(document.activeElement)) { e.preventDefault(); firstEl.focus(); return }
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus() }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus() }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      const i = dialogStack.indexOf(token)
      if (i >= 0) dialogStack.splice(i, 1)
      if (dialogStack.length === 0) {
        document.body.style.overflow = lockedOverflow ?? ''
        lockedOverflow = null
      }
      // Return focus to the opener; if it is gone (e.g. the row was deleted), fall back to the page's <main>
      // so keyboard and screen-reader users don't end up on <body>.
      const fallback = () => document.getElementById('main')?.focus({ preventScroll: true })
      if (previous && document.contains(previous)) {
        previous.focus({ preventScroll: true })
        // The opener may be removed a moment later (the confirmed delete resolves after the dialog closes)
        const observer = new MutationObserver(() => {
          if (!document.contains(previous)) {
            observer.disconnect()
            if (document.activeElement === document.body || document.activeElement === null) fallback()
          }
        })
        observer.observe(document.body, { childList: true, subtree: true })
        window.setTimeout(() => observer.disconnect(), 6000)
      } else {
        fallback()
      }
    }
  }, [open, ref])
}

