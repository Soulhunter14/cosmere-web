/** Head of the crew sheet: scale, treasury and notoriety with what they mean, the organization's perks and, for the director, time passing. */
import type { CSSProperties, ReactNode } from 'react'
import { CalendarClock, ChevronsUp, Eye, RotateCcw } from 'lucide-react'
import { Button, Disclosure, Switch } from '../../components/ui'
import type { CatalogoBanda, TipoOrganizacionDef } from '../../lib/banda/tipos'
import { enEra } from '../../lib/banda/tipos'
import type { Era } from '../../types'
import type { ToneName } from '../../theme'
import { buttonReset, c, eyebrow, fs, numeral, radius, shadow, tone } from '../../theme'
import type { BandaEstado } from './estado'
import { DefinicionTexto, type Pista } from './hojas'
import { reiniciarVentajas, usarVentaja, type OpBanda } from './operaciones'
import { textoSuave, useEjecutar } from './etiquetas'
import { Puntos, TextoRegla } from './piezas'

export function CabeceraBanda({ banda, catalogo, era, editable, puedeActuar, dinero, imagenDinero, onAjustar, onDinero, onSemanas, aplicar }: {
  banda: BandaEstado
  catalogo: CatalogoBanda
  era: Era | null
  /** Director: adjusts scale and notoriety, marks perks, passes time */
  editable: boolean
  /** Director or a player with access: moves money */
  puedeActuar: boolean
  dinero: (v: number) => string
  /** Official art of the era's money, when the world has it */
  imagenDinero?: string
  onAjustar: (pista: Pista) => void
  onDinero: () => void
  onSemanas: () => void
  aplicar: (op: OpBanda) => void
}) {
  const alerta = banda.notoriedad >= 3
  const tipo = catalogo.tiposOrganizacion.find((t) => t.id === banda.tipoOrganizacion)
  const { definiciones } = catalogo

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
        <PistaTile
          etiqueta="Escala"
          valor={`${banda.escala}`}
          sub={`de ${catalogo.escalaMaxima}`}
          tono="topacio"
          icono={<ChevronsUp size={16} aria-hidden />}
          onClick={editable ? () => onAjustar('escala') : undefined}
        />
        <PistaTile
          etiqueta="Tesorería"
          valor={dinero(banda.tesoreria)}
          tono="gold"
          icono={imagenDinero ? <img src={imagenDinero} alt="" aria-hidden style={{ height: 18, width: 'auto' }} /> : undefined}
          onClick={puedeActuar ? onDinero : undefined}
          accion="Aportar o gastar"
        />
        <PistaTile
          etiqueta="Notoriedad"
          valor={`${banda.notoriedad}`}
          sub={<Puntos valor={banda.notoriedad} max={catalogo.notoriedadMaxima} tono={alerta ? 'rubi' : 'cuarzo'} etiqueta="Notoriedad" />}
          tono={alerta ? 'rubi' : 'cuarzo'}
          icono={<Eye size={16} aria-hidden />}
          onClick={editable ? () => onAjustar('notoriedad') : undefined}
        />
      </div>
      {alerta && (
        <p role="status" style={{ ...textoSuave, color: tone.rubi.fg }}>
          Notoriedad {banda.notoriedad}: los enemigos de la banda saben lo bastante para actuar contra ella.
        </p>
      )}
      <Disclosure title="Qué son la escala, la tesorería y la notoriedad" headingLevel={2}>
        <div style={{ display: 'grid', gap: 14 }}>
          {(['escala', 'tesoreria', 'notoriedad'] as const).map((k) => (
            <div key={k} style={{ display: 'grid', gap: 4 }}>
              <span style={{ fontWeight: 650, color: c.text }}>{definiciones[k].titulo}</span>
              <DefinicionTexto def={definiciones[k]} era={era} />
            </div>
          ))}
        </div>
      </Disclosure>
      {editable && (
        <div>
          <Button variant="secondary" icon={<CalendarClock size={16} aria-hidden />} onClick={onSemanas}>Pasar semanas</Button>
        </div>
      )}
      {tipo && <VentajasOrganizacion tipo={tipo} banda={banda} era={era} editable={editable} dinero={dinero} aplicar={aplicar} />}
    </div>
  )
}

/** One track of the head: a button when the viewer can act on it, plain otherwise */
function PistaTile({ etiqueta, valor, sub, tono: t, icono, onClick, accion = 'Ajustar' }: {
  etiqueta: string
  valor: string
  sub?: ReactNode
  tono: ToneName
  icono?: ReactNode
  onClick?: () => void
  accion?: string
}) {
  const contenido = (
    <>
      <span style={{ ...eyebrow, display: 'flex', alignItems: 'center', gap: 6, color: tone[t].fg }}>
        {icono}
        {etiqueta}
      </span>
      <span style={{ ...numeral, display: 'block', fontSize: fs.xl, color: c.text, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {valor}
      </span>
      {sub && <span style={{ display: 'block', fontSize: fs.xs, color: c.muted, marginTop: 6 }}>{sub}</span>}
    </>
  )
  const estilo: CSSProperties = {
    display: 'block', width: '100%', minWidth: 0, padding: '12px 12px 10px', borderRadius: radius.md, textAlign: 'left',
    background: `linear-gradient(160deg, ${tone[t].bg}, ${c.s1} 70%)`, border: `1px solid ${tone[t].border}`, boxShadow: shadow[1],
  }
  return onClick ? (
    <button type="button" className="ui-card--interactive" onClick={onClick} style={{ ...buttonReset, ...estilo }} aria-label={`${etiqueta}: ${valor}. ${accion}`}>
      {contenido}
    </button>
  ) : (
    <div style={estilo}>{contenido}</div>
  )
}

function VentajasOrganizacion({ tipo, banda, era, editable, dinero, aplicar }: {
  tipo: TipoOrganizacionDef
  banda: BandaEstado
  era: Era | null
  editable: boolean
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
}) {
  const { ejecutar } = useEjecutar(aplicar)
  const porEscala = (textos: string[]) => textos[Math.min(banda.escala, textos.length) - 1] ?? ''
  const beneficio = tipo.beneficioMensual ? enEra(tipo.beneficioMensual[Math.min(banda.escala, tipo.beneficioMensual.length) - 1], era) : null
  const hayDeSesion = tipo.ventajas.some((v) => v.uso === 'sesion')
  const usadas = tipo.ventajas.filter((v) => banda.ventajasUsadas.includes(v.id)).length
  // Closed, the summary still says which perks there are and how many were used this session
  const resumen = `Ventajas de escala ${banda.escala}: ${tipo.ventajas.map((v) => v.nombre).join(', ')}`
    + (usadas ? ` · ${usadas} ${usadas === 1 ? 'usada' : 'usadas'} esta sesión` : '')

  return (
    <Disclosure title={tipo.nombre} summary={resumen} headingLevel={2}>
      <div style={{ display: 'grid', gap: 10 }}>
      <TextoRegla texto={tipo.resumen} origen={tipo.origen} cita={tipo.cita} era={era} />
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
        {tipo.ventajas.map((v) => {
          const usada = banda.ventajasUsadas.includes(v.id)
          return (
            <li key={v.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0, opacity: usada ? 0.6 : 1 }}>
                <span style={{ fontWeight: 650, color: c.text }}>{v.nombre}</span>
                <span style={{ fontSize: fs.xs, color: c.subtle }}> · {v.uso === 'sesion' ? 'una vez por sesión' : v.uso === 'escena' ? 'una vez por escena' : 'siempre'}</span>
                <p style={textoSuave}>
                  {porEscala(v.porEscala)}
                  {v.uso === 'pasiva' && beneficio !== null ? ` Ahora: ${dinero(beneficio)} al mes.` : ''}
                </p>
              </div>
              {editable && v.uso === 'sesion' && (
                <Switch checked={usada} onChange={(si) => ejecutar(usarVentaja(v.id, si))} label={`${v.nombre}: usada esta sesión`} />
              )}
            </li>
          )
        })}
      </ul>
      {editable && hayDeSesion && banda.ventajasUsadas.length > 0 && (
        <div>
          <Button size="sm" variant="ghost" icon={<RotateCcw size={15} aria-hidden />} onClick={() => ejecutar(reiniciarVentajas())}>Nueva sesión</Button>
        </div>
      )}
      </div>
    </Disclosure>
  )
}
