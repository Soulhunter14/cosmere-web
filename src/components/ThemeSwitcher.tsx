import { Monitor, Moon, Sun } from 'lucide-react'
import { Segmented } from './ui'
import { useThemeStore, type ThemeMode } from '../store/themeStore'

/** Apariencia: Sistema · Libro (claro) · Noche (oscuro). `compact` shows icons only (names stay accessible). */
export function ThemeSwitcher({ size = 'md', stretch = true, compact = false }: { size?: 'sm' | 'md'; stretch?: boolean; compact?: boolean }) {
  const { mode, setMode } = useThemeStore()
  const item = (Icon: typeof Sun, text: string) =>
    compact ? <><Icon size={16} aria-hidden /><span className="sr-only">{text}</span></> : <><Icon size={15} aria-hidden /> {text}</>
  return (
    <Segmented<ThemeMode>
      ariaLabel="Apariencia"
      size={size}
      stretch={stretch}
      value={mode}
      onChange={setMode}
      options={[
        { value: 'system', label: item(Monitor, 'Sistema'), ariaLabel: compact ? 'Tema: seguir al sistema' : 'Seguir al sistema' },
        { value: 'light', label: item(Sun, 'Libro'), ariaLabel: compact ? 'Tema claro: libro' : 'Tema claro (libro)' },
        { value: 'dark', label: item(Moon, 'Noche'), ariaLabel: compact ? 'Tema oscuro: noche' : 'Tema oscuro (noche)' },
      ]}
    />
  )
}
