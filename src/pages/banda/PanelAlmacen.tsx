/**
 * «Almacén» tab: what the crew keeps and what it puts on the black market (docs/banda/propuesta-mercado-negro.md). A player puts goods of
 * their character's inventory in it (the server takes them out of the inventory), puts them on sale at the price they choose (they see
 * the market price: the book's, half when used), changes it, withdraws them and takes them out to their inventory, as their character.
 * Only the director adds goods directly (from the price table or anything else), sees how the black market values each lot and its
 * chance of selling, and values what is not on the price table, sells by hand, seizes and deletes. «Pasar semanas» rolls the sales.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Ban, HandCoins, Lock, Package, PackageMinus, Pencil, Plus, Scale, Tag, Trash2, Undo2 } from 'lucide-react'
import {
  Badge, Button, ConfirmDialog, Disclosure, EmptyState, ErrorMessage, Field, IconButton, Input, SectionTitle, Segmented, Select, Sheet,
  Stepper, Switch, Textarea,
} from '../../components/ui'
import { catalogApi } from '../../api/catalog'
import type { CatalogoBanda, MercadoNegroDef } from '../../lib/banda/tipos'
import type { Character, Era, ListaInventario } from '../../types'
import { c, fs, radius, tone } from '../../theme'
import {
  juntarEnAlmacen, loteCerrado, nombreActor, nombreLote, nuevoId, type Actor, type Conservacion, type Mercancia, type TipoCatalogo,
} from './estado'
import {
  anotar, borrarMercancia, cambiarPrecio, editarMercancia, entrarMercancia, ponerALaVenta, requisarMercancia, retirarDeLaVenta,
  sacarDelAlmacen, tasarMercancia, venderEnMano, type DatosMercancia, type DocBanda, type OpBanda,
} from './operaciones'
import type { EntradaAlmacen, SalidaAlmacen } from './useBanda'
import { multiplicadorEscasez, probabilidadAcumulada, probabilidadVenta, puntosDeLaBanda } from './mercadoNegro'
import { CONSERVACION, SITUACION_MERCANCIA, conSigno, leerCantidad, porcentaje, textoSuave, tonoProbabilidad, useEjecutar } from './etiquetas'
import { CampoCantidad, SelectorActor, TextoRegla } from './piezas'

interface Props {
  doc: DocBanda
  catalogo: CatalogoBanda
  era: Era | null
  campaignId: number
  /** Director: values, sells by hand, seizes, deletes, and sees the black market's numbers */
  editable: boolean
  /** Director or a player with access: enters goods, puts them on sale, changes the price, withdraws and takes them out */
  puedeActuar: boolean
  actores: Actor[]
  /** The characters the viewer can act as, with their inventories (a player, their own; the director, every PC) */
  personajes: Character[]
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
  /** Goods of a character's inventory enter the store (the server moves them) */
  entrarAlmacen: (e: EntradaAlmacen) => void
  /** A lot goes to a character's inventory (the server moves it) */
  sacarAlmacen: (s: SalidaAlmacen) => void
}

type Accion = 'editar' | 'precio' | 'retirar' | 'sacar' | 'tasar' | 'mano' | 'requisar' | 'borrar'

/** What a character carries, by distinct name: one inventory entry per unit (Character.weapons / armor / equipment) */
interface ItemInventario {
  clave: string
  lista: ListaInventario
  nombre: string
  cantidad: number
  /** The armor they wear (Character.equippedArmor) */
  puesta: boolean
}

const GRUPO_INVENTARIO: Record<ListaInventario, string> = { weapons: 'Armas', armor: 'Armaduras', equipment: 'Equipo' }
/** The price table's type of each inventory list */
const TIPO_DE_LISTA: Record<ListaInventario, TipoCatalogo> = { weapons: 'arma', armor: 'armadura', equipment: 'equipo' }

function inventarioDe(p: Character | undefined): ItemInventario[] {
  if (!p) return []
  const items: ItemInventario[] = []
  for (const lista of ['weapons', 'armor', 'equipment'] as const) {
    const cuenta = new Map<string, number>()
    for (const nombre of p[lista] ?? []) cuenta.set(nombre, (cuenta.get(nombre) ?? 0) + 1)
    for (const [nombre, cantidad] of cuenta) {
      items.push({ clave: `${lista}:${nombre}`, lista, nombre, cantidad, puesta: lista === 'armor' && p.equippedArmor === nombre })
    }
  }
  return items
}
type Hoja = { tipo: 'nueva' } | { tipo: Accion; lote: Mercancia }

/** An item of the price table (the world's catalog) */
interface ItemTabla {
  clave: string
  tipo: TipoCatalogo
  id: number
  nombre: string
  precio: number | null
  grupo: string
}

const GRUPOS = ['Armas', 'Armaduras', 'Equipo', 'Viales de metal']

const redondear = (v: number) => Math.round(v * 100) / 100
const aTexto = (v: number | null) => (v === null ? '' : String(v).replace('.', ','))
const semanasTexto = (n: number) => (n === 0 ? 'recién puesto a la venta' : `lleva ${n} ${n === 1 ? 'semana' : 'semanas'} a la venta`)
const fecha = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '')
/** Without accents nor case, to search the price table */
const plano = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const etiquetaCampo = { fontSize: fs.sm, fontWeight: 650, color: c.text, marginBottom: 6 } as const
const soloDirector = { ...textoSuave, display: 'flex', alignItems: 'flex-start', gap: 6, color: 'var(--gm)' } as const

const pie = (onCancel: () => void, etiqueta: string, onOk: () => void, disabled = false, cancelar = 'Cancelar') => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
    <Button variant="ghost" onClick={onCancel}>{cancelar}</Button>
    <Button onClick={onOk} disabled={disabled}>{etiqueta}</Button>
  </div>
)

export function PanelAlmacen({ doc, catalogo, era, campaignId, editable, puedeActuar, actores, personajes, dinero, aplicar, entrarAlmacen, sacarAlmacen }: Props) {
  const { banda } = doc
  const [hoja, setHoja] = useState<Hoja | null>(null)
  const { error, ejecutar } = useEjecutar(aplicar)
  const cerrar = () => setHoja(null)

  const enVenta = banda.almacen.filter((m) => m.situacion === 'en-venta')
  const guardados = banda.almacen.filter((m) => m.situacion === 'guardada')
  const historial = banda.almacen.filter(loteCerrado).sort((a, b) => (b.cerradaEn ?? '').localeCompare(a.cerradaEn ?? ''))
  const siSeVende = redondear(enVenta.reduce((s, m) => s + (m.precio ?? 0) * m.cantidad, 0))
  const valorGuardado = redondear(guardados.reduce((s, m) => s + (m.valor ?? 0) * m.cantidad, 0))
  const comun = { doc, catalogo, esDirector: editable, actores, dinero, onClose: cerrar, aplicar }

  const tarjeta = (m: Mercancia) => (
    <TarjetaLote
      key={m.id} lote={m} doc={doc} catalogo={catalogo} editable={editable} puedeActuar={puedeActuar} dinero={dinero}
      onAccion={(tipo) => setHoja({ tipo, lote: m })}
    />
  )
  // On sale first, then stored; within each, used before new
  const secciones = [
    { titulo: 'A la venta · usados', lista: enVenta.filter((m) => m.conservacion === 'usado') },
    { titulo: 'A la venta · nuevos', lista: enVenta.filter((m) => m.conservacion !== 'usado') },
    { titulo: 'Guardado · usados', lista: guardados.filter((m) => m.conservacion === 'usado') },
    { titulo: 'Guardado · nuevos', lista: guardados.filter((m) => m.conservacion !== 'usado') },
  ].filter((s) => s.lista.length > 0)

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <p style={textoSuave}>
          A la venta <strong style={{ color: c.text }}>{enVenta.length}</strong>{enVenta.length ? ` · ${dinero(siSeVende)} si se vende todo` : ''}
          <br />
          Guardado <strong style={{ color: c.text }}>{guardados.length}</strong>{guardados.length ? ` · vale ${dinero(valorGuardado)}` : ''}
        </p>
        {puedeActuar && <Button size="sm" icon={<Plus size={15} aria-hidden />} onClick={() => setHoja({ tipo: 'nueva' })}>Añadir mercancía</Button>}
      </div>

      {enVenta.length === 0 && guardados.length === 0 && (
        <EmptyState icon={<Package size={28} aria-hidden />} title="El almacén está vacío" description="Lo que la banda guarda o quiere colocar en el mercado negro." />
      )}
      {secciones.map((s) => (
        <section key={s.titulo}>
          <SectionTitle as="h3">{s.titulo} ({s.lista.length})</SectionTitle>
          <div style={{ display: 'grid', gap: 8 }}>{s.lista.map(tarjeta)}</div>
        </section>
      ))}
      {historial.length > 0 && (
        <Disclosure title={`Historial (${historial.length})`} summary="Lo vendido, lo sacado y lo requisado.">
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
            {historial.map((m) => (
              <li key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: c.text }}>{nombreLote(m)}</span>
                  <span style={{ display: 'block', fontSize: fs.xs, color: c.muted }}>
                    {m.situacion === 'vendida' ? `Por ${dinero(m.importeVenta ?? 0)}` : m.situacion === 'retirada' ? 'Salió del almacén' : 'Requisado'} · {fecha(m.cerradaEn)}
                  </span>
                </span>
                <Badge tone={SITUACION_MERCANCIA[m.situacion].tono}>{SITUACION_MERCANCIA[m.situacion].label}</Badge>
                {editable && (
                  <IconButton label={`Borrar ${nombreLote(m)} del historial`} size={36} onClick={() => setHoja({ tipo: 'borrar', lote: m })}>
                    <Trash2 size={16} aria-hidden />
                  </IconButton>
                )}
              </li>
            ))}
          </ul>
        </Disclosure>
      )}
      {editable && catalogo.mercadoNegro && <ReglasMercado def={catalogo.mercadoNegro} doc={doc} catalogo={catalogo} era={era} />}
      {error && <ErrorMessage message={error} />}

      {hoja?.tipo === 'nueva' && <MercanciaSheet lote={null} campaignId={campaignId} personajes={personajes} entrarAlmacen={entrarAlmacen} {...comun} />}
      {hoja?.tipo === 'editar' && <MercanciaSheet lote={hoja.lote} campaignId={campaignId} personajes={personajes} entrarAlmacen={entrarAlmacen} {...comun} />}
      {hoja?.tipo === 'precio' && <PrecioSheet lote={hoja.lote} {...comun} />}
      {(hoja?.tipo === 'retirar' || hoja?.tipo === 'sacar') && <SalidaSheet modo={hoja.tipo} lote={hoja.lote} sacarAlmacen={sacarAlmacen} {...comun} />}
      {hoja?.tipo === 'tasar' && <TasarSheet lote={hoja.lote} onClose={cerrar} aplicar={aplicar} />}
      {hoja?.tipo === 'mano' && <VenderEnManoSheet lote={hoja.lote} onClose={cerrar} aplicar={aplicar} />}
      {hoja?.tipo === 'requisar' && <RequisarSheet lote={hoja.lote} onClose={cerrar} aplicar={aplicar} />}
      <ConfirmDialog
        open={hoja?.tipo === 'borrar'}
        title={`¿Borrar ${hoja?.tipo === 'borrar' ? nombreLote(hoja.lote) : ''}?`}
        message="Desaparece del almacén y de su historial; no se mueve dinero. El registro conserva sus movimientos."
        confirmLabel="Borrar"
        onConfirm={() => { if (hoja?.tipo === 'borrar') ejecutar(borrarMercancia(hoja.lote.id)); cerrar() }}
        onCancel={cerrar}
      />
    </div>
  )
}

function TarjetaLote({ lote, doc, catalogo, editable, puedeActuar, dinero, onAccion }: {
  lote: Mercancia
  doc: DocBanda
  catalogo: CatalogoBanda
  editable: boolean
  puedeActuar: boolean
  dinero: (v: number) => string
  onAccion: (a: Accion) => void
}) {
  const sit = SITUACION_MERCANCIA[lote.situacion]
  const precio = lote.situacion === 'en-venta' ? lote.precio : null
  const traida = nombreActor(lote.traidaPor)
  const puesta = precio !== null ? nombreActor(lote.puestaPor) : ''

  // Collapsed by default: the header shows the name, its condition and whether it is on sale
  return (
    <Disclosure
      headingLevel={4}
      title={nombreLote(lote)}
      summary={
        <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
          <Badge tone="cuarzo">{CONSERVACION[lote.conservacion]}</Badge>
          <Badge tone={sit.tono}>{sit.label}</Badge>
          {lote.valor === null && <Badge tone="topacio">Pendiente de tasar</Badge>}
        </span>
      }
    >
      <div style={{ display: 'grid', gap: 6 }}>
        <p style={textoSuave}>
          {lote.valor !== null ? (
            <>Precio de mercado: <strong style={{ color: c.text }}>{dinero(lote.valor)}</strong> por unidad</>
          ) : editable ? 'No está en la tabla de precios: tásalo para poder venderlo.' : 'La DJ tiene que tasarlo antes de venderlo.'}
        </p>
        {precio !== null && (
          <p style={textoSuave}>
            A la venta a <strong style={{ color: c.text }}>{dinero(precio)}</strong> por unidad
            {lote.cantidad > 1 ? ` (${dinero(redondear(precio * lote.cantidad))} el lote)` : ''} · {semanasTexto(lote.semanasALaVenta)}
          </p>
        )}
        {precio !== null && editable && <LineaDirector lote={lote} precio={precio} doc={doc} catalogo={catalogo} />}
        {(traida || puesta) && (
          <p style={{ ...textoSuave, fontSize: fs.xs }}>
            {[traida && `Lo trajo ${traida}`, puesta && `lo puso a la venta ${puesta}`].filter(Boolean).join(' · ')}
          </p>
        )}
        {lote.notas && <p style={{ ...textoSuave, whiteSpace: 'pre-line' }}>{lote.notas}</p>}

        {puedeActuar && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 2 }}>
            {precio !== null ? (
              <>
                <Button size="sm" variant="secondary" icon={<Tag size={15} aria-hidden />} onClick={() => onAccion('precio')}>Cambiar precio</Button>
                <Button size="sm" variant="ghost" icon={<Undo2 size={15} aria-hidden />} onClick={() => onAccion('retirar')}>Retirar de la venta</Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="secondary" icon={<Tag size={15} aria-hidden />} onClick={() => onAccion('precio')} disabled={lote.valor === null}>
                  Poner a la venta
                </Button>
                <Button size="sm" variant="ghost" icon={<PackageMinus size={15} aria-hidden />} onClick={() => onAccion('sacar')}>Sacar del almacén</Button>
              </>
            )}
            {editable && lote.valor === null && (
              <Button size="sm" variant="secondary" icon={<Scale size={15} aria-hidden />} onClick={() => onAccion('tasar')}>Tasar</Button>
            )}
            {editable && <Button size="sm" variant="ghost" icon={<HandCoins size={15} aria-hidden />} onClick={() => onAccion('mano')}>Vender en mano</Button>}
            {editable && <Button size="sm" variant="ghost" icon={<Ban size={15} aria-hidden />} onClick={() => onAccion('requisar')}>Requisar</Button>}
          </div>
        )}
        {editable && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {lote.situacion === 'guardada' && (
              <IconButton label={`Corregir ${nombreLote(lote)}`} onClick={() => onAccion('editar')}><Pencil size={18} aria-hidden /></IconButton>
            )}
            <IconButton label={`Borrar ${nombreLote(lote)}`} onClick={() => onAccion('borrar')}><Trash2 size={18} aria-hidden /></IconButton>
          </div>
        )}
      </div>
    </Disclosure>
  )
}

/** The director's line on a lot for sale: its band, this week's chance and the chance over the next weeks */
function LineaDirector({ lote, precio, doc, catalogo }: { lote: Mercancia; precio: number; doc: DocBanda; catalogo: CatalogoBanda }) {
  const def = catalogo.mercadoNegro
  const pv = probabilidadVenta(lote.valor, precio, lote.semanasALaVenta, doc, catalogo, doc.banda.escasez)
  if (!def || !pv) return null
  const probs = Array.from({ length: def.semanasMax }, (_, i) =>
    probabilidadVenta(lote.valor, precio, lote.semanasALaVenta + i, doc, catalogo, doc.banda.escasez)?.prob ?? 0)
  return (
    <p style={soloDirector}>
      <Lock size={14} aria-hidden style={{ flexShrink: 0, marginTop: 3 }} />
      <span>
        <span className="sr-only">Solo el director: </span>
        {pv.tramo.etiqueta} ({Math.round(pv.ratio)} % del valor de mercado) · {pv.prob > 0
          ? `esta semana ${pv.prob} % · en ${def.semanasMax} semanas ${probabilidadAcumulada(probs)} %`
          : 'a ese precio nadie lo compra'}
      </span>
    </p>
  )
}

/** How the black market sells, with the crew's points now (only the director) */
function ReglasMercado({ def, doc, catalogo, era }: { def: MercadoNegroDef; doc: DocBanda; catalogo: CatalogoBanda; era: Era | null }) {
  const { oficio, puesto, organizacion, notoriedad } = def.modificadores
  const ahora = puntosDeLaBanda(doc, catalogo)
  const escasez = catalogo.contextos.find((x) => x.id === doc.banda.escasez)
  const mult = multiplicadorEscasez(catalogo, doc.banda.escasez)
  const nombreOficio = catalogo.oficios.find((o) => o.id === oficio.id)?.nombre ?? oficio.id
  const nombrePuesto = catalogo.mejorasRefugio.find((m) => m.id === puesto.mejora)?.nombre ?? puesto.mejora
  const escondite = def.mejoraEscondite ? (catalogo.mejorasRefugio.find((m) => m.id === def.mejoraEscondite)?.nombre ?? def.mejoraEscondite) : null
  const suman = [
    `${nombreOficio} en la banda ${conSigno(oficio.puntos)}`,
    `cada trabajador en el ${nombrePuesto} ${conSigno(puesto.puntos)} (hasta ${conSigno(puesto.maximo)})`,
    ...Object.entries(organizacion).map(([id, p]) => `${catalogo.tiposOrganizacion.find((t) => t.id === id)?.nombre ?? id} ${conSigno(p)}`),
    `Notoriedad ${notoriedad.desde} o más ${conSigno(notoriedad.puntos)}`,
  ]

  return (
    <Disclosure title="Cómo vende el mercado negro" summary="Solo lo ves tú." headingLevel={3}>
      <div style={{ display: 'grid', gap: 12 }}>
        <TextoRegla texto={def.regla.texto} casero={def.regla.casero} origen={def.regla.origen} cita={def.regla.cita} era={era} />
        <div style={{ display: 'grid', gap: 4 }}>
          <span style={{ fontWeight: 650, color: c.text }}>Probabilidad por semana según el precio</span>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
            {def.tramos.map((t, i) => (
              <li key={t.etiqueta} style={{ fontSize: fs.sm, color: c.muted }}>
                {t.hasta === null ? `Más del ${def.tramos[i - 1]?.hasta ?? 0} %` : `Hasta el ${t.hasta} %`} del valor de mercado · {t.etiqueta}: {t.prob} %
              </li>
            ))}
          </ul>
        </div>
        <p style={textoSuave}>
          Cada semana que lleva a la venta suma el {def.crecimientoPorSemana} % de su tramo, hasta {def.semanasMax} semanas. Nunca pasa del {def.maximo} %.
          Usado vale el {def.usadoPct} % del precio del libro, y la escasez multiplica el valor de mercado
          {escasez && mult !== 1 ? ` (ahora, ${escasez.nombre})` : ''}.
        </p>
        <p style={textoSuave}>Suman: {suman.join(' · ')}.</p>
        <p style={textoSuave}>
          Ahora la banda suma: <strong style={{ color: c.text }}>{ahora.length ? ahora.map((l) => `${l.concepto} ${conSigno(l.puntos)}`).join(' · ') : 'nada'}</strong>.
        </p>
        <p style={textoSuave}>
          Un {101 - def.riesgo}-100 es un soplo: Notoriedad +1 (una vez cada vez que pasan semanas){escondite ? ` y, sin ${escondite} listo en un refugio, la mercancía se requisa` : ''}.
        </p>
      </div>
    </Disclosure>
  )
}

/** Price per unit with the market price as a reference; the director also sees the band and the chance as it is typed */
function PrecioVenta({ valor, cantidad, precioTexto, onPrecio, semanas, doc, catalogo, esDirector, dinero }: {
  valor: number
  cantidad: number
  precioTexto: string
  onPrecio: (t: string) => void
  /** Weeks it has been on sale (0: it goes on sale now) */
  semanas: number
  doc: DocBanda
  catalogo: CatalogoBanda
  esDirector: boolean
  dinero: (v: number) => string
}) {
  const precio = leerCantidad(precioTexto)
  const valido = Number.isFinite(precio) && precio > 0
  const pv = esDirector && valido ? probabilidadVenta(valor, precio, semanas, doc, catalogo, doc.banda.escasez) : null
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <Field label="Precio por unidad" hint={`Precio de mercado: ${dinero(valor)} por unidad.`}>
        <CampoCantidad valor={precioTexto} onCambio={onPrecio} placeholder={aTexto(valor)} />
      </Field>
      {valido && cantidad > 1 && (
        <p style={textoSuave}>El lote entero: <strong style={{ color: c.text }}>{dinero(redondear(precio * cantidad))}</strong></p>
      )}
      {pv && (
        <div style={{ padding: '10px 12px', borderRadius: radius.md, border: '1px dashed var(--gm)', display: 'grid', gap: 6 }}>
          <p style={soloDirector}><Lock size={14} aria-hidden style={{ flexShrink: 0, marginTop: 3 }} /> Solo tú: el mercado negro</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Badge tone={tonoProbabilidad(pv.prob)}>{pv.tramo.etiqueta}</Badge>
            <span style={{ fontSize: fs.sm, color: c.text }}>{pv.prob > 0 ? `${pv.prob} % esta semana` : 'A ese precio nadie lo compra'}</span>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 2 }}>
            {pv.desglose.map((l) => (
              <li key={l.concepto} style={{ fontSize: fs.xs, color: c.muted }}>{l.concepto}: {l.puntos < 0 ? '−' : '+'}{porcentaje(Math.abs(l.puntos))}</li>
            ))}
          </ul>
          <p style={{ fontSize: fs.xs, color: c.muted }}>Valor de mercado ahora: {dinero(pv.valorMercado)} por unidad.</p>
        </div>
      )}
    </div>
  )
}

type Origen = 'inventario' | 'tabla' | 'otra'

/**
 * Put goods in the store: a player from their character's inventory; the director also directly (from the price table or anything
 * else). The director also corrects here a lot that is not on sale
 */
function MercanciaSheet({ lote, doc, catalogo, campaignId, esDirector, actores, personajes, dinero, onClose, aplicar, entrarAlmacen }: {
  lote: Mercancia | null
  doc: DocBanda
  catalogo: CatalogoBanda
  campaignId: number
  esDirector: boolean
  actores: Actor[]
  personajes: Character[]
  dinero: (v: number) => string
  onClose: () => void
  aplicar: (op: OpBanda) => void
  entrarAlmacen: (e: EntradaAlmacen) => void
}) {
  const usadoPct = catalogo.mercadoNegro?.usadoPct ?? 50
  const opcionesActor = actores.filter((a) => esDirector || a.tipo === 'pj')
  const pjs = actores.filter((a): a is Extract<Actor, { tipo: 'pj' }> => a.tipo === 'pj')
  // A lot being corrected keeps its origin; new goods come from an inventory unless the director adds them directly
  const [origen, setOrigen] = useState<Origen>(lote ? (lote.deCatalogo ? 'tabla' : 'otra') : 'inventario')
  const [duenoId, setDuenoId] = useState<number | null>(pjs.length === 1 ? pjs[0].characterId : null)
  const [claveInventario, setClaveInventario] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [clave, setClave] = useState('')
  const [nombre, setNombre] = useState(lote?.nombre ?? '')
  const [cantidad, setCantidad] = useState(lote?.cantidad ?? 1)
  const [conservacion, setConservacion] = useState<Conservacion>(lote?.conservacion ?? 'nuevo')
  const [valorTexto, setValorTexto] = useState(lote && !lote.deCatalogo ? aTexto(lote.valor) : '')
  const [notas, setNotas] = useState(lote?.notas ?? '')
  const [actor, setActor] = useState<Actor | null>(opcionesActor.length === 1 ? opcionesActor[0] : null)
  const [vender, setVender] = useState(false)
  const [precioTexto, setPrecioTexto] = useState('')
  const { error, setError, ejecutar } = useEjecutar(aplicar)

  // The price table (Manual · Cap. 7 › Objetos), with the same queries as the catalog page, only while choosing from it or valuing what
  // comes from an inventory
  const conTabla = origen !== 'otra' && !lote
  const armas = useQuery({ queryKey: ['catalog', campaignId, 'weapons'], queryFn: () => catalogApi.getWeapons(campaignId), enabled: conTabla })
  const armaduras = useQuery({ queryKey: ['catalog', campaignId, 'armor'], queryFn: () => catalogApi.getArmor(campaignId), enabled: conTabla })
  const equipo = useQuery({ queryKey: ['catalog', campaignId, 'gear'], queryFn: () => catalogApi.getGear(campaignId), enabled: conTabla })
  const items = useMemo<ItemTabla[]>(() => [
    ...(armas.data ?? []).map((a) => ({ clave: `arma:${a.id}`, tipo: 'arma' as const, id: a.id, nombre: a.name, precio: a.price, grupo: 'Armas' })),
    ...(armaduras.data ?? []).map((a) => ({ clave: `armadura:${a.id}`, tipo: 'armadura' as const, id: a.id, nombre: a.name, precio: a.price, grupo: 'Armaduras' })),
    ...(equipo.data ?? []).map((g) => ({
      clave: `equipo:${g.id}`, tipo: 'equipo' as const, id: g.id, nombre: g.name, precio: g.price, grupo: g.category === 'vial' ? 'Viales de metal' : 'Equipo',
    })),
  ], [armas.data, armaduras.data, equipo.data])
  const cargando = conTabla && (armas.isLoading || armaduras.isLoading || equipo.isLoading)
  const buscado = plano(busqueda.trim())
  const grupos = GRUPOS
    .map((g) => ({ g, lista: items.filter((i) => i.grupo === g && (!buscado || plano(i.nombre).includes(buscado))) }))
    .filter((x) => x.lista.length > 0)
  const elegido = items.find((i) => i.clave === clave)

  // From an inventory: what the chosen character carries, and its item on the price table (by name and type) for the value
  const dueno = personajes.find((p) => p.id === duenoId)
  const inventario = useMemo(() => inventarioDe(dueno), [dueno])
  const delInventario = inventario.find((i) => i.clave === claveInventario)
  const enTabla = delInventario
    ? (items.find((i) => i.nombre === delInventario.nombre && i.tipo === TIPO_DE_LISTA[delInventario.lista]) ?? items.find((i) => i.nombre === delInventario.nombre))
    : undefined

  // The value: from the book price (of the item chosen now, or the one the lot was valued with), or the director's
  const precioLibro = lote?.deCatalogo
    ? lote.deCatalogo.precioLibro
    : origen === 'inventario' ? (enTabla?.precio ?? null) : (elegido?.precio ?? null)
  const valorTabla = precioLibro === null ? null : redondear(precioLibro * (conservacion === 'usado' ? usadoPct / 100 : 1))
  const valorDirector = leerCantidad(valorTexto)
  const valor = origen !== 'otra'
    ? valorTabla
    : esDirector && Number.isFinite(valorDirector) && valorDirector > 0 ? redondear(valorDirector) : (lote?.valor ?? null)
  const aLaVenta = vender && valor !== null
  const desdeInventario = origen === 'inventario' && !lote
  // A player only puts in what their character carries: until they choose it, the sheet shows only that choice (the director sees
  // every field, as always)
  const soloJugador = desdeInventario && !esDirector
  const nadaEncima = desdeInventario && (pjs.length === 0 || (!!dueno && inventario.length === 0))
  const ocultarCampos = soloJugador && !delInventario
  const mostrarCantidad = !soloJugador || (delInventario?.cantidad ?? 1) > 1

  /** The goods leave the character's inventory and enter the store: the server moves them; the lot shows on screen meanwhile */
  const meterDesdeInventario = () => {
    const pj = pjs.find((a) => a.characterId === duenoId)
    if (!pj || !dueno) return setError('Elige de qué personaje sale.')
    if (!delInventario) return setError('Elige qué objeto de su inventario entra en el almacén.')
    if (cantidad > delInventario.cantidad) return setError(`${dueno.name} solo lleva ${delInventario.cantidad}.`)
    const precio = aLaVenta ? leerCantidad(precioTexto) : null
    if (precio !== null && !(Number.isFinite(precio) && precio > 0)) return setError('Pon el precio por unidad.')
    const nuevo: Mercancia = {
      id: nuevoId(),
      nombre: delInventario.nombre,
      deCatalogo: enTabla ? { tipo: enTabla.tipo, id: enTabla.id, precioLibro: enTabla.precio } : null,
      lista: delInventario.lista,
      cantidad,
      conservacion,
      valor,
      precio: precio !== null ? redondear(precio) : null,
      semanasALaVenta: 0,
      situacion: precio !== null ? 'en-venta' : 'guardada',
      traidaPor: pj,
      entradaEn: new Date().toISOString(),
      puestaPor: precio !== null ? pj : null,
      cerradaEn: null,
      importeVenta: null,
      notas: notas.trim(),
    }
    // The ledger texts travel with the request: the server writes them as they are (the money's format is the world's)
    const motivo = `Entra en el almacén: ${nombreLote(nuevo)}${conservacion === 'usado' ? ', usado' : ''}`
      + (valor !== null ? `, ${dinero(valor)} por unidad` : ', sin tasar')
    const motivoVenta = nuevo.precio !== null ? `A la venta: ${nombreLote(nuevo)} a ${dinero(nuevo.precio)} por unidad` : undefined
    const optimista: OpBanda = (d, ctx) => {
      let b = anotar({ ...d.banda, almacen: juntarEnAlmacen(d.banda.almacen, { ...nuevo, entradaEn: ctx.ahora }) }, ctx, {
        tipo: 'almacen', actor: pj, objetivo: nuevo.nombre, motivo,
      })
      if (motivoVenta) b = anotar(b, ctx, { tipo: 'almacen', actor: pj, objetivo: nuevo.nombre, motivo: motivoVenta })
      return { ...d, banda: b }
    }
    try {
      entrarAlmacen({
        peticion: { characterId: pj.characterId, lista: delInventario.lista, nombre: delInventario.nombre, cantidad, lote: nuevo, motivo, motivoVenta },
        optimista,
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido meter en el almacén.')
    }
  }

  const guardar = () => {
    if (desdeInventario) return meterDesdeInventario()
    if (origen === 'tabla' && !lote && !elegido) return setError('Elige un objeto de la tabla de precios.')
    const deCatalogo = lote ? lote.deCatalogo : elegido ? { tipo: elegido.tipo, id: elegido.id, precioLibro: elegido.precio } : null
    const datos: DatosMercancia = {
      nombre: origen === 'tabla' ? (lote?.nombre ?? elegido?.nombre ?? '') : nombre, deCatalogo: origen === 'tabla' ? deCatalogo : null,
      cantidad, conservacion, valor, notas,
    }
    if (lote) return ejecutar(editarMercancia(lote.id, datos), onClose)
    const precio = aLaVenta ? leerCantidad(precioTexto) : null
    if (precio !== null && !(Number.isFinite(precio) && precio > 0)) return setError('Pon el precio por unidad.')
    ejecutar(entrarMercancia(datos, actor, precio), onClose)
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={lote ? `Corregir ${nombreLote(lote)}` : 'Añadir mercancía'}
      description={lote ? undefined : esDirector
        ? 'Del inventario de un personaje o, solo tú, directamente al almacén. Si quieres, ponlo ya a la venta en el mercado negro.'
        : 'Lo que tu personaje lleva encima pasa al almacén de la banda. Si quieres, ponlo ya a la venta en el mercado negro.'}
      footer={soloJugador && nadaEncima ? (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}><Button variant="ghost" onClick={onClose}>Cerrar</Button></div>
      ) : pie(
        onClose,
        lote ? 'Guardar' : desdeInventario ? (aLaVenta ? 'Meter y poner a la venta' : 'Meter en el almacén') : aLaVenta ? 'Añadir y poner a la venta' : 'Añadir al almacén',
        guardar,
        ocultarCampos,
      )}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        {/* Only the director adds goods directly; a player puts in what their character carries */}
        {!lote && esDirector && (
          <Segmented<Origen>
            ariaLabel="De dónde sale"
            value={origen}
            onChange={(o) => { setOrigen(o); setError(null) }}
            options={[{ value: 'inventario', label: 'De un inventario' }, { value: 'tabla', label: 'De la tabla' }, { value: 'otra', label: 'Otra cosa' }]}
          />
        )}

        {desdeInventario && (
          <>
            {pjs.length === 0 ? (
              <p style={{ fontSize: fs.sm, color: tone.topacio.fg }}>Hace falta un personaje en la campaña para meter algo de su inventario.</p>
            ) : pjs.length === 1 ? (
              <p style={textoSuave}>Sale del inventario de <strong style={{ color: c.text }}>{pjs[0].nombre}</strong>.</p>
            ) : (
              <Field label="¿De qué personaje sale?">
                <Select
                  value={duenoId ?? ''}
                  onChange={(e) => { setDuenoId(e.target.value ? Number(e.target.value) : null); setClaveInventario(''); setCantidad(1) }}
                >
                  <option value="">Elige…</option>
                  {pjs.map((a) => <option key={a.characterId} value={a.characterId}>{a.nombre}</option>)}
                </Select>
              </Field>
            )}
            {dueno && (inventario.length === 0 ? (
              <p style={textoSuave}>{dueno.name} no lleva nada encima.</p>
            ) : (
              <Field label="Objeto" hint="Sale de su inventario al confirmar; si es la armadura que lleva puesta y no le queda otra, se la quita.">
                <Select value={claveInventario} onChange={(e) => { setClaveInventario(e.target.value); setCantidad(1) }}>
                  <option value="">Elige…</option>
                  {(['weapons', 'armor', 'equipment'] as const).map((l) => {
                    const deLista = inventario.filter((i) => i.lista === l)
                    return deLista.length > 0 && (
                      <optgroup key={l} label={GRUPO_INVENTARIO[l]}>
                        {deLista.map((i) => (
                          <option key={i.clave} value={i.clave}>{i.nombre}{i.cantidad > 1 ? ` ×${i.cantidad}` : ''}{i.puesta ? ' (puesta)' : ''}</option>
                        ))}
                      </optgroup>
                    )
                  })}
                </Select>
              </Field>
            ))}
          </>
        )}

        {origen === 'tabla' && lote && (
          <p style={textoSuave}>
            <strong style={{ color: c.text }}>{lote.nombre}</strong>
            {lote.deCatalogo?.precioLibro != null ? ` · ${dinero(lote.deCatalogo.precioLibro)} en la tabla de precios` : ' · sin precio en la tabla'}
          </p>
        )}
        {origen === 'tabla' && !lote && (
          <>
            <Field label="Buscar en la tabla">
              <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Catalejo, revólver, vial…" autoFocus />
            </Field>
            <Field label="Objeto" hint={cargando ? 'Cargando la tabla de precios…' : 'Armas, armaduras y equipo del Manual, con su precio en la era de la campaña.'}>
              <Select value={clave} onChange={(e) => setClave(e.target.value)}>
                <option value="">Elige…</option>
                {grupos.map(({ g, lista }) => (
                  <optgroup key={g} label={g}>
                    {lista.map((i) => (
                      <option key={i.clave} value={i.clave}>{i.nombre} · {i.precio !== null ? dinero(i.precio) : 'sin precio: lo tasa la DJ'}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>
          </>
        )}
        {origen === 'otra' && (
          <>
            <Field label="Nombre">
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Cajas de licor de Fellise" maxLength={80} autoFocus={!lote} />
            </Field>
            {esDirector ? (
              <Field label="Valor por unidad" hint="Es su precio de mercado: los jugadores lo ven.">
                <CampoCantidad valor={valorTexto} onCambio={setValorTexto} placeholder="25" />
              </Field>
            ) : (
              <p style={textoSuave}>No está en la tabla de precios: la DJ lo tasará antes de que se pueda vender.</p>
            )}
          </>
        )}

        {!ocultarCampos && (
          <div style={{ display: 'grid', gridTemplateColumns: mostrarCantidad ? 'minmax(0, 1fr) minmax(0, 1fr)' : '1fr', gap: 12, alignItems: 'end' }}>
            {mostrarCantidad && (
              <div>
                <p style={etiquetaCampo}>Cantidad</p>
                <Stepper label="Cantidad" value={cantidad} onChange={setCantidad} min={1} max={desdeInventario ? (delInventario?.cantidad ?? 1) : 999} />
              </div>
            )}
            <div>
              <p style={etiquetaCampo}>Conservación</p>
              <Segmented<Conservacion>
                ariaLabel="Conservación"
                value={conservacion}
                onChange={setConservacion}
                options={[{ value: 'nuevo', label: 'Nuevo' }, { value: 'usado', label: 'Usado' }]}
              />
            </div>
          </div>
        )}
        {origen !== 'otra' && !ocultarCampos && (
          <p style={textoSuave}>
            {valorTabla !== null ? (
              <>
                Precio de mercado: <strong style={{ color: c.text }}>{dinero(valorTabla)}</strong> por unidad
                {conservacion === 'usado' && precioLibro !== null ? ` (en la tabla, ${dinero(precioLibro)}; usado vale el ${usadoPct} %)` : ''}.
              </>
            ) : elegido || lote || delInventario ? 'No tiene precio en la tabla: la DJ lo tasará.' : 'Elige el objeto para ver su precio de mercado.'}
          </p>
        )}

        {!ocultarCampos && (
          <Field label="Notas" hint="De dónde sale, dónde se guarda…">
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={2} placeholder="Botín del muelle de Kandor" />
          </Field>
        )}

        {!lote && !ocultarCampos && (
          <>
            {!desdeInventario && (
              <SelectorActor actores={opcionesActor} valor={actor} onChange={setActor} conDirector={esDirector} etiqueta="¿Quién lo trae?" />
            )}
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: fs.base, color: valor === null ? c.muted : c.text }}>Ponerlo ya a la venta en el mercado negro</span>
              <Switch checked={aLaVenta} onChange={setVender} disabled={valor === null} label="Ponerlo ya a la venta" />
            </label>
            {aLaVenta && (
              <PrecioVenta
                valor={valor} cantidad={cantidad} precioTexto={precioTexto} onPrecio={setPrecioTexto} semanas={0}
                doc={doc} catalogo={catalogo} esDirector={esDirector} dinero={dinero}
              />
            )}
          </>
        )}
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/** Put a lot on sale at a price, or change the price of one on sale (it keeps its weeks) */
function PrecioSheet({ lote, doc, catalogo, esDirector, actores, dinero, onClose, aplicar }: {
  lote: Mercancia
  doc: DocBanda
  catalogo: CatalogoBanda
  esDirector: boolean
  actores: Actor[]
  dinero: (v: number) => string
  onClose: () => void
  aplicar: (op: OpBanda) => void
}) {
  const cambiando = lote.situacion === 'en-venta'
  const opciones = actores.filter((a) => esDirector || a.tipo === 'pj')
  const [actor, setActor] = useState<Actor | null>(opciones.length === 1 ? opciones[0] : null)
  const [precioTexto, setPrecioTexto] = useState(aTexto(lote.precio))
  const { error, ejecutar } = useEjecutar(aplicar)
  const precio = leerCantidad(precioTexto)
  if (lote.valor === null) return null
  const n = lote.semanasALaVenta

  return (
    <Sheet
      open
      onClose={onClose}
      title={cambiando ? `Precio de ${nombreLote(lote)}` : `Poner a la venta ${nombreLote(lote)}`}
      description={cambiando
        ? (n === 0 ? 'Recién puesto a la venta.' : `Lleva ${n} ${n === 1 ? 'semana' : 'semanas'} a la venta; cambiar el precio no las borra.`)
        : 'Tú pones el precio; el mercado negro decide si lo paga.'}
      footer={pie(
        onClose,
        cambiando ? 'Cambiar precio' : 'Poner a la venta',
        () => ejecutar(cambiando ? cambiarPrecio(lote.id, precio, actor) : ponerALaVenta(lote.id, precio, actor), onClose),
        !(Number.isFinite(precio) && precio > 0),
      )}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <PrecioVenta
          valor={lote.valor} cantidad={lote.cantidad} precioTexto={precioTexto} onPrecio={setPrecioTexto} semanas={cambiando ? n : 0}
          doc={doc} catalogo={catalogo} esDirector={esDirector} dinero={dinero}
        />
        <SelectorActor
          actores={opciones} valor={actor} onChange={setActor} conDirector={esDirector}
          etiqueta={cambiando ? '¿Quién cambia el precio?' : '¿Quién lo pone a la venta?'}
        />
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/**
 * Withdraw a lot from sale, or take it out of the store (it stays in the history): both ask first, and who does it. A character takes
 * it to their inventory (the server moves it); the director, as the director, only takes it out of the store
 */
function SalidaSheet({ modo, lote, esDirector, actores, onClose, aplicar, sacarAlmacen }: {
  modo: 'retirar' | 'sacar'
  lote: Mercancia
  esDirector: boolean
  actores: Actor[]
  onClose: () => void
  aplicar: (op: OpBanda) => void
  sacarAlmacen: (s: SalidaAlmacen) => void
}) {
  const retirar = modo === 'retirar'
  const opciones = actores.filter((a) => esDirector || a.tipo === 'pj')
  const [actor, setActor] = useState<Actor | null>(opciones.length === 1 ? opciones[0] : null)
  const [motivo, setMotivo] = useState('')
  const { error, setError, ejecutar } = useEjecutar(aplicar)

  const confirmar = () => {
    if (retirar) return ejecutar(retirarDeLaVenta(lote.id, actor), onClose)
    if (actor?.tipo !== 'pj') return ejecutar(sacarDelAlmacen(lote.id, actor, motivo), onClose)
    try {
      sacarAlmacen({
        loteId: lote.id,
        characterId: actor.characterId,
        // The same ledger text the local operation writes
        motivo: `Sale del almacén: ${nombreLote(lote)}${motivo.trim() ? ` (${motivo.trim()})` : ''}`,
        optimista: sacarDelAlmacen(lote.id, actor, motivo),
      })
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido sacar del almacén.')
    }
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={retirar ? `¿Retirar ${nombreLote(lote)} de la venta?` : `¿Sacar ${nombreLote(lote)} del almacén?`}
      description={retirar
        ? 'Vuelve a «Guardado» y las semanas a la venta empiezan de nuevo.'
        : actor?.tipo === 'pj'
          ? `Va al inventario de ${actor.nombre} y el lote queda en el historial.`
          : actor ? 'Como director, sale del almacén sin ir a ningún inventario; queda en el historial.' : 'Va al inventario de quien lo saca y el lote queda en el historial.'}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>{retirar ? 'No retirar' : 'No sacar'}</Button>
          <Button variant={retirar ? 'primary' : 'danger'} onClick={confirmar}>
            {retirar ? 'Retirar de la venta' : 'Sacar del almacén'}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <SelectorActor actores={opciones} valor={actor} onChange={setActor} conDirector={esDirector} etiqueta={retirar ? '¿Quién lo retira?' : '¿Quién se lo lleva?'} />
        {!retirar && (
          <Field label="Motivo" hint="Opcional; queda en el registro.">
            <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Lo usa Vin en el golpe" maxLength={120} />
          </Field>
        )}
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/** The director values a lot that is not on the price table */
function TasarSheet({ lote, onClose, aplicar }: { lote: Mercancia; onClose: () => void; aplicar: (op: OpBanda) => void }) {
  const [valorTexto, setValorTexto] = useState(aTexto(lote.valor))
  const { error, ejecutar } = useEjecutar(aplicar)
  const valor = leerCantidad(valorTexto)
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Tasar ${nombreLote(lote)}`}
      description="Su precio de mercado por unidad: los jugadores lo verán y podrán ponerlo a la venta."
      footer={pie(onClose, 'Tasar', () => ejecutar(tasarMercancia(lote.id, valor), onClose), !(Number.isFinite(valor) && valor > 0))}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Valor por unidad">
          <CampoCantidad valor={valorTexto} onCambio={setValorTexto} placeholder="25" autoFocus />
        </Field>
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/** A sale agreed at the table (director): the amount goes to the treasury */
function VenderEnManoSheet({ lote, onClose, aplicar }: { lote: Mercancia; onClose: () => void; aplicar: (op: OpBanda) => void }) {
  const unidad = lote.precio ?? lote.valor
  const [importeTexto, setImporteTexto] = useState(unidad !== null ? aTexto(redondear(unidad * lote.cantidad)) : '')
  const [motivo, setMotivo] = useState('')
  const { error, ejecutar } = useEjecutar(aplicar)
  const importe = leerCantidad(importeTexto)
  return (
    <Sheet
      open
      onClose={onClose}
      title={`Vender ${nombreLote(lote)} en mano`}
      description="Una venta pactada en la partida: el dinero entra en la tesorería."
      footer={pie(onClose, 'Vender', () => ejecutar(venderEnMano(lote.id, importe, motivo), onClose), !(Number.isFinite(importe) && importe > 0))}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Importe del lote entero">
          <CampoCantidad valor={importeTexto} onCambio={setImporteTexto} placeholder="100" autoFocus />
        </Field>
        <Field label="Motivo" hint="Opcional; queda en el registro.">
          <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Se lo compra el perista de la calle Kenton" maxLength={120} />
        </Field>
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/** The goods are lost (director): a search, a theft… */
function RequisarSheet({ lote, onClose, aplicar }: { lote: Mercancia; onClose: () => void; aplicar: (op: OpBanda) => void }) {
  const [motivo, setMotivo] = useState('')
  const { error, ejecutar } = useEjecutar(aplicar)
  return (
    <Sheet
      open
      onClose={onClose}
      title={`¿Requisar ${nombreLote(lote)}?`}
      description="La banda lo pierde y queda en el historial."
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>No requisar</Button>
          <Button variant="danger" onClick={() => ejecutar(requisarMercancia(lote.id, motivo), onClose)}>Requisar</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Motivo" hint="Opcional; queda en el registro.">
          <Input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Registro de la Élite Dorada" maxLength={120} autoFocus />
        </Field>
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}
