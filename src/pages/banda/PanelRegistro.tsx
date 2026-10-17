/**
 * «Registro» tab: every change of the crew sheet, most recent first, and the director's free notes in the ledger. The director also sees
 * here, mixed by date and marked «Solo tú», his private ledger (changes of hidden factions) and the events that came up while weeks
 * passed (his private part: a player never gets them)
 */
import { useState, type ReactNode } from 'react'
import { Lock, Plus } from 'lucide-react'
import { Badge, Button, ErrorMessage, Field, Input, Select } from '../../components/ui'
import { c, fs, radius, tone } from '../../theme'
import { nombreActor, type BandaEstado, type Movimiento, type SucesoTirado, type TipoMovimiento } from './estado'
import { anotarNota, type OpBanda } from './operaciones'
import { conSigno, textoSuave, useEjecutar } from './etiquetas'

const TIPO: Record<TipoMovimiento, string> = {
  tesoreria: 'Tesorería',
  notoriedad: 'Notoriedad',
  reputacion: 'Reputación',
  escala: 'Escala',
  banda: 'Banda',
  refugio: 'Refugio',
  mejora: 'Mejora',
  trabajador: 'Trabajador',
  contacto: 'Contacto',
  semanas: 'Semanas',
  almacen: 'Almacén',
  mercado: 'Mercado negro',
  cartel: 'Cartel',
  nota: 'Nota',
}

const POR_PAGINA = 40

/** The filter of the director's private events */
const SUCESOS = 'sucesos'
type Filtro = TipoMovimiento | typeof SUCESOS | ''

type Entrada = { clase: 'movimiento'; m: Movimiento; privado: boolean } | { clase: 'suceso'; s: SucesoTirado }

const fechaDe = (e: Entrada) => (e.clase === 'suceso' ? e.s.en : e.m.en)

/**
 * The lists (each one most recent first) in one, by date. The sort is stable: at the same moment the crew's ledger goes first, then the
 * private one, then the events, as they are passed
 */
const mezclar = (...listas: Entrada[][]): Entrada[] => listas.flat().sort((a, b) => fechaDe(b).localeCompare(fechaDe(a)))

const movimientos = (lista: Movimiento[], privado: boolean): Entrada[] => lista.map((m) => ({ clase: 'movimiento', m, privado }))

const fechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export function PanelRegistro({ banda, privados, sucesos, editable, dinero, aplicar }: {
  banda: BandaEstado
  /** The director's private ledger (empty for a player) */
  privados: Movimiento[]
  /** The director's private events (empty for a player) */
  sucesos: SucesoTirado[]
  editable: boolean
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
}) {
  const [filtro, setFiltro] = useState<Filtro>('')
  const [mostrar, setMostrar] = useState(POR_PAGINA)
  const [nota, setNota] = useState('')
  const { error, ejecutar } = useEjecutar(aplicar)
  const lista: Entrada[] = filtro === SUCESOS
    ? sucesos.map((s) => ({ clase: 'suceso', s }))
    : filtro
      ? mezclar(movimientos(banda.registro.filter((m) => m.tipo === filtro), false), movimientos(privados.filter((m) => m.tipo === filtro), true))
      : mezclar(movimientos(banda.registro, false), movimientos(privados, true), sucesos.map((s) => ({ clase: 'suceso', s })))

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {editable && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <Field label="Anotar en el registro" style={{ flex: 1 }}>
            <Input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="La banda se instala en el muelle del canal" maxLength={200} />
          </Field>
          <Button variant="secondary" icon={<Plus size={15} aria-hidden />} disabled={!nota.trim()} onClick={() => ejecutar(anotarNota(nota), () => setNota(''))}>
            Anotar
          </Button>
        </div>
      )}
      {error && <ErrorMessage message={error} />}
      <Field label="Mostrar">
        <Select value={filtro} onChange={(e) => { setFiltro(e.target.value as Filtro); setMostrar(POR_PAGINA) }}>
          <option value="">Todos los movimientos</option>
          {(Object.keys(TIPO) as TipoMovimiento[]).map((t) => <option key={t} value={t}>{TIPO[t]}</option>)}
          {sucesos.length > 0 && <option value={SUCESOS}>Sucesos (solo tú)</option>}
        </Select>
      </Field>
      {lista.length === 0 ? (
        <p style={textoSuave}>Aún no hay movimientos.</p>
      ) : (
        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {lista.slice(0, mostrar).map((e) => {
            if (e.clase === 'suceso') return <FilaSuceso key={`suceso-${e.s.id}`} s={e.s} />
            const m = e.m
            return (
              <li key={m.id} style={caja}>
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                  <Badge tone="cuarzo">{TIPO[m.tipo]}</Badge>
                  {m.dinero !== undefined && <Badge tone={m.dinero >= 0 ? 'esmeralda' : 'rubi'}>{m.dinero >= 0 ? '+' : '−'}{dinero(Math.abs(m.dinero))}</Badge>}
                  {m.cantidad !== undefined && m.tipo !== 'tesoreria' && <Badge tone="topacio">{conSigno(m.cantidad)}</Badge>}
                  <span style={{ fontSize: fs.xs, color: c.subtle, marginLeft: 'auto' }}>{fechaHora(m.en)}{m.autor ? ` · ${m.autor}` : ''}</span>
                </div>
                <p style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>{m.motivo}</p>
                {m.actor && <p style={{ fontSize: fs.xs, color: c.muted }}>Por {nombreActor(m.actor)}</p>}
                {e.privado && <SoloTu>Solo tú · no está en el registro de la banda</SoloTu>}
              </li>
            )
          })}
        </ol>
      )}
      {lista.length > mostrar && (
        <div><Button variant="ghost" onClick={() => setMostrar((n) => n + POR_PAGINA)}>Ver más</Button></div>
      )}
    </div>
  )
}

const caja = { padding: '10px 12px', borderRadius: radius.md, background: c.s1, border: `1px solid ${c.border}`, display: 'grid', gap: 4 } as const

/** An event of «Pasar semanas», with its dice: only the director sees it */
function FilaSuceso({ s }: { s: SucesoTirado }) {
  return (
    <li style={caja}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <Badge tone="granate">Suceso</Badge>
        <Badge tone={s.decision === 'jugado' ? 'topacio' : 'cuarzo'}>{s.decision === 'jugado' ? 'Jugado' : 'Omitido'}</Badge>
        {s.provisional && <Badge tone="cuarzo">Provisional</Badge>}
        <span style={{ fontSize: fs.xs, color: c.subtle, marginLeft: 'auto' }}>{fechaHora(s.en)}{s.autor ? ` · ${s.autor}` : ''}</span>
      </div>
      <p style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>
        <strong style={{ fontWeight: 650 }}>{s.titulo}</strong> · semana {s.semana} de {s.deSemanas}
      </p>
      {s.texto && <p style={{ fontSize: fs.xs, color: c.muted }}>{s.texto}</p>}
      {s.efectos.length > 0 && <p style={{ fontSize: fs.xs, color: tone.rubi.fg }}>{s.efectos.join(' · ')}</p>}
      <SoloTu>Solo tú · sacó {s.tirada} (hacía falta {s.umbral} o más) · en la tabla, {s.tiradaTabla}</SoloTu>
    </li>
  )
}

/** The mark of what only the director sees */
function SoloTu({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: fs.xs, color: 'var(--gm)', display: 'flex', alignItems: 'center', gap: 6 }}>
      <Lock size={12} aria-hidden style={{ flexShrink: 0 }} />
      <span>{children}</span>
    </p>
  )
}
