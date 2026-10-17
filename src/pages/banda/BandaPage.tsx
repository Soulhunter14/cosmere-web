/**
 * «La banda»: the crew sheet of the campaign as a section of the app (route `banda`, lazy chunk). The director edits everything; the
 * players it is shared with act as their character (money, hiring, upgrades) and never see the director's private part; the rest never
 * see it (the server answers 403). Spec: docs/banda/propuesta.md.
 */
import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ClipboardList, Eye, EyeOff, Handshake, Lock, Package, Pencil, RefreshCw, ScrollText, Share2, Users, Warehouse } from 'lucide-react'
import { Button, EmptyState, ErrorMessage, IconButton, PageHeader, Spinner, TabPanel, Tabs } from '../../components/ui'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { formatMoneda, monedaImagen } from '../../lib/moneda'
import { c, fs, page, radius, tone } from '../../theme'
import { useBanda } from './useBanda'
import { CabeceraBanda } from './CabeceraBanda'
import { AjusteSheet, CompartirSheet, DatosBandaSheet, DineroSheet, NotasSecretasSheet, type Pista } from './hojas'
import { SemanasSheet } from './SemanasSheet'
import { PanelRefugio } from './PanelRefugio'
import { PanelCartel } from './PanelCartel'
import { PanelAlmacen } from './PanelAlmacen'
import { PanelTrabajadores } from './PanelTrabajadores'
import { PanelContactos } from './PanelContactos'
import { PanelRegistro } from './PanelRegistro'
import { guardarNotasSecretas } from './operaciones'
import { textoSuave } from './etiquetas'

type Tab = 'refugio' | 'cartel' | 'almacen' | 'trabajadores' | 'contactos' | 'registro'

const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
  { id: 'refugio', label: 'Refugio', icon: Warehouse },
  // The mission board (docs/banda/propuesta-cartel-misiones.md)
  { id: 'cartel', label: 'Cartel', icon: ClipboardList },
  // Only in a world with a black market (CatalogoBanda.mercadoNegro)
  { id: 'almacen', label: 'Almacén', icon: Package },
  { id: 'trabajadores', label: 'Trabajadores', icon: Users },
  { id: 'contactos', label: 'Contactos', icon: Handshake },
  { id: 'registro', label: 'Registro', icon: ScrollText },
]

const ID_PREFIX = 'banda'

type Hoja = 'datos' | 'compartir' | 'notas' | 'dinero' | 'semanas'

export function BandaPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const cfg = useWorldConfig()
  const campaign = useCampaignStore((s) => s.currentCampaign)
  const b = useBanda(cId)
  const [tab, setTab] = useState<Tab>('refugio')
  const [hoja, setHoja] = useState<Hoja | null>(null)
  const [pista, setPista] = useState<Pista | null>(null)

  // A world without a crew sheet (Stormlight) has no such section
  if (!cfg.features.banda) return <Navigate to={`/campaigns/${campaignId}/home`} replace />

  const dinero = (v: number) => formatMoneda(v, cfg.moneda)

  if (b.carga === 'cargando') return <div style={page}><Spinner label="Cargando la banda…" /></div>
  if (b.carga === 'sin-acceso') {
    return (
      <div style={page}>
        <EmptyState
          icon={<Lock size={28} aria-hidden />}
          title="La banda no está a tu alcance"
          description="El director aún no la ha compartido contigo."
        />
      </div>
    )
  }
  if (b.carga === 'error' || !b.doc || !b.catalogo) {
    return (
      <div style={{ ...page, display: 'grid', gap: 12 }}>
        <ErrorMessage message="No se ha podido cargar la banda." />
        <div><Button icon={<RefreshCw size={15} aria-hidden />} onClick={b.reintentar}>Reintentar</Button></div>
      </div>
    )
  }

  const { banda, secretos } = b.doc
  const catalogo = b.catalogo
  const jugadores = (campaign?.members ?? []).filter((m) => m.role === 'player')
  const compartidaCon = b.compartidaCon ?? []
  const nombresCompartida = jugadores.filter((j) => compartidaCon.includes(j.userId)).map((j) => j.displayName)
  const misPersonajes = b.actores.filter((a) => a.tipo === 'pj').map((a) => a.nombre)

  // Never saved: the director creates it; a player it was shared with waits
  if (!b.existe) {
    return (
      <div style={page}>
        <PageHeader eyebrow="Nacidos de la bruma" title="La banda" />
        <EmptyState
          icon={<Warehouse size={28} aria-hidden />}
          title={b.esDirector ? 'La banda aún no tiene hoja' : 'El director aún no ha creado la hoja de la banda'}
          description={b.esDirector ? 'Su escala, su tesorería, su refugio con mejoras, sus trabajadores y sus contactos. Por ahora solo la verás tú.' : undefined}
          action={b.esDirector ? <Button onClick={() => setHoja('datos')}>Crear la hoja de banda</Button> : undefined}
        />
        {hoja === 'datos' && <DatosBandaSheet open onClose={() => setHoja(null)} banda={null} catalogo={catalogo} era={b.era} aplicar={b.aplicar} />}
      </div>
    )
  }

  const tipo = catalogo.tiposOrganizacion.find((t) => t.id === banda.tipoOrganizacion)

  return (
    <div style={page}>
      <PageHeader
        eyebrow="La banda"
        title={banda.nombre || 'La banda'}
        subtitle={banda.concepto || tipo?.nombre}
        actions={b.esDirector ? (
          <>
            <IconButton label="Notas del director" variant="surface" onClick={() => setHoja('notas')}><Lock size={18} aria-hidden /></IconButton>
            {b.editable && <IconButton label="Editar los datos de la banda" variant="surface" onClick={() => setHoja('datos')}><Pencil size={18} aria-hidden /></IconButton>}
            <Button size="sm" variant="secondary" icon={<Share2 size={15} aria-hidden />} onClick={() => setHoja('compartir')}>Compartir</Button>
          </>
        ) : undefined}
      />

      {/* Who sees it: the director knows who it is shared with; a player knows as whom they act */}
      <p style={{ ...textoSuave, display: 'flex', alignItems: 'center', gap: 6, marginTop: -12, marginBottom: 14 }}>
        {b.esDirector ? (
          nombresCompartida.length
            ? <><Eye size={15} aria-hidden /> La comparten: {nombresCompartida.join(', ')}</>
            : <><EyeOff size={15} aria-hidden /> Oculta: solo la ves tú</>
        ) : (
          <><Eye size={15} aria-hidden /> {misPersonajes.length ? `Actúas como ${misPersonajes.join(' o ')}` : 'Necesitas un personaje en la campaña para actuar'}</>
        )}
        {b.guardando && <span style={{ marginLeft: 'auto', fontSize: fs.xs, color: c.subtle }}>Guardando…</span>}
      </p>

      {b.versionNueva && (
        <p role="status" style={{ ...textoSuave, padding: '10px 12px', borderRadius: radius.md, background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, marginBottom: 12 }}>
          Esta hoja se guardó con una versión más nueva de la app: recarga la página para poder cambiarla.
        </p>
      )}
      {b.aviso && (
        <div
          role={b.aviso.tono === 'error' ? 'alert' : 'status'}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: radius.md, marginBottom: 12,
            background: tone[b.aviso.tono === 'error' ? 'rubi' : 'zafiro'].bg, border: `1px solid ${tone[b.aviso.tono === 'error' ? 'rubi' : 'zafiro'].border}`,
          }}
        >
          <p style={{ ...textoSuave, color: c.text, flex: 1 }}>{b.aviso.texto}</p>
          <Button size="sm" variant="ghost" onClick={b.cerrarAviso}>Cerrar</Button>
        </div>
      )}

      <CabeceraBanda
        banda={banda}
        catalogo={catalogo}
        era={b.era}
        editable={b.editable}
        puedeActuar={b.puedeActuar}
        dinero={dinero}
        imagenDinero={monedaImagen(cfg.moneda, b.era)}
        onAjustar={setPista}
        onDinero={() => setHoja('dinero')}
        onSemanas={() => setHoja('semanas')}
        aplicar={b.aplicar}
      />

      <div style={{ marginTop: 18 }}>
        <Tabs<Tab>
          idPrefix={ID_PREFIX}
          ariaLabel="Secciones de la banda"
          value={tab}
          onChange={setTab}
          stretch
          tabs={TABS.filter((t) => t.id !== 'almacen' || !!catalogo.mercadoNegro).map((t) => ({ id: t.id, label: t.label, icon: <t.icon size={16} aria-hidden /> }))}
        />
        <TabPanel idPrefix={ID_PREFIX} id={tab} style={{ paddingTop: 14 }}>
          {tab === 'refugio' && (
            <PanelRefugio
              banda={banda} secretos={secretos} catalogo={catalogo} era={b.era} editable={b.editable} puedeActuar={b.puedeActuar}
              actores={b.actores} dinero={dinero} aplicar={b.aplicar}
            />
          )}
          {tab === 'cartel' && (
            <PanelCartel
              banda={banda} secretos={b.esDirector ? secretos : null} editable={b.editable} puedeActuar={b.puedeActuar} dinero={dinero} aplicar={b.aplicar}
            />
          )}
          {tab === 'almacen' && catalogo.mercadoNegro && (
            <PanelAlmacen
              doc={b.doc} catalogo={catalogo} era={b.era} campaignId={cId} editable={b.editable} puedeActuar={b.puedeActuar}
              actores={b.actores} personajes={b.personajes} dinero={dinero} aplicar={b.aplicar}
              entrarAlmacen={b.entrarAlmacen} sacarAlmacen={b.sacarAlmacen}
            />
          )}
          {tab === 'trabajadores' && (
            <PanelTrabajadores
              banda={banda} secretos={secretos} catalogo={catalogo} era={b.era} editable={b.editable} puedeActuar={b.puedeActuar}
              actores={b.actores} dinero={dinero} aplicar={b.aplicar}
            />
          )}
          {tab === 'contactos' && (
            <PanelContactos banda={banda} secretos={b.esDirector ? secretos : null} catalogo={catalogo} era={b.era} editable={b.editable} aplicar={b.aplicar} />
          )}
          {tab === 'registro' && (
            <PanelRegistro banda={banda} privados={b.esDirector ? secretos.registro : []} sucesos={b.esDirector ? secretos.sucesos : []} editable={b.editable} dinero={dinero} aplicar={b.aplicar} />
          )}
        </TabPanel>
      </div>

      {hoja === 'datos' && <DatosBandaSheet open onClose={() => setHoja(null)} banda={banda} catalogo={catalogo} era={b.era} aplicar={b.aplicar} />}
      {hoja === 'compartir' && (
        <CompartirSheet open onClose={() => setHoja(null)} jugadores={jugadores} compartidaCon={compartidaCon} compartir={b.compartir} />
      )}
      {hoja === 'notas' && (
        <NotasSecretasSheet open onClose={() => setHoja(null)} notas={secretos.notas} guardar={(texto) => b.aplicar(guardarNotasSecretas(texto))} />
      )}
      {hoja === 'dinero' && (
        <DineroSheet
          onClose={() => setHoja(null)} banda={banda} catalogo={catalogo} era={b.era} esDirector={b.esDirector} actores={b.actores}
          personajes={b.personajes} dinero={dinero} aplicar={b.aplicar} aportar={b.aportar}
        />
      )}
      {hoja === 'semanas' && b.ctx && (
        <SemanasSheet onClose={() => setHoja(null)} doc={b.doc} catalogo={catalogo} era={b.era} crearCtx={b.ctx} dinero={dinero} aplicar={b.aplicar} />
      )}
      {pista && <AjusteSheet key={pista} pista={pista} onClose={() => setPista(null)} banda={banda} catalogo={catalogo} era={b.era} aplicar={b.aplicar} />}
    </div>
  )
}
