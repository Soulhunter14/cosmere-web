import { useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ExternalLink, EyeOff, Image as ImageIcon, Link2, Projector, RotateCcw, Search, Swords, Trash2, Upload, X } from 'lucide-react'
import { mesaApi } from '../../api/mesa'
import { Button, ConfirmDialog, EmptyState, Field, IconButton, Input, Segmented, Spinner, Switch, Textarea } from '../../components/ui'
import { foldText } from '../../lib/catalogo'
import { buttonReset, c, eyebrow, font, fs, pill, radius, shadow, tone } from '../../theme'
import type { CampaignImage, GlobalNpc } from '../../types'
import { useImagenMesa } from '../mesa/imagenes'
import { CapaNiebla } from '../mesa/Niebla'
import { ZONA_MINIMA, type OrigenImagen, type Proyeccion, type ZonaNiebla } from '../mesa/publica'
import { useCatalogo, usePantalla } from './contexto'
import { hora } from './exportar'
import { leerEscena } from './guion'
import { useLibro } from './libro'
import { anotarProyeccion, cambiarNiebla, destaparZona, enemigosOcultos, quitarDeMesa, volverAMostrar } from './mesa'
import { Conmutador } from './piezas'
import { useMostrarEnMesa } from './useMesa'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }
const tarjeta: CSSProperties = { padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }
const rejilla: CSSProperties = { ...listReset, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }

/** Largest upload the API takes (MesaService.MaxImageBytes) */
const MAX_IMAGEN_BYTES = 3 * 1024 * 1024

type Fuente = 'subidas' | 'guion' | 'mapas' | 'retratos' | 'url'

// ── Panel ────────────────────────────────────────────────────────────────────

/** What the players have on their phones: the image shown, which fights they see, and where to pick the next image from */
export function PanelMesa() {
  const { cId, estado } = usePantalla()
  const [fuente, setFuente] = useState<Fuente>('subidas')
  return (
    <div style={stack(18)}>
      <h2 className="sr-only">Mesa</h2>
      <AhoraEnLaMesa />
      <section aria-labelledby="mesa-encuentros" style={stack(10)}>
        <Titulo id="mesa-encuentros" icono={<Swords size={16} aria-hidden />}>Combates en la mesa</Titulo>
        <EncuentrosEnMesa />
      </section>
      <section aria-labelledby="mesa-elegir" style={stack(10)}>
        <Titulo id="mesa-elegir" icono={<ImageIcon size={16} aria-hidden />}>Mostrar una imagen</Titulo>
        <Segmented<Fuente>
          ariaLabel="De dónde sale la imagen"
          tone="zafiro"
          size="sm"
          value={fuente}
          onChange={setFuente}
          options={[
            { value: 'subidas', label: 'Subidas' },
            { value: 'guion', label: 'Guion' },
            { value: 'mapas', label: 'Mapas' },
            { value: 'retratos', label: 'Retratos' },
            { value: 'url', label: 'URL' },
          ]}
        />
        {fuente === 'subidas' && <Subidas />}
        {fuente === 'guion' && <ImagenesDelGuion />}
        {fuente === 'mapas' && <MapasDelLibro />}
        {fuente === 'retratos' && <Retratos />}
        {fuente === 'url' && <PorUrl />}
      </section>
      {estado.mesa.proyecciones.length > 0 && (
        <section aria-labelledby="mesa-historial" style={stack(10)}>
          <Titulo id="mesa-historial" icono={<RotateCcw size={16} aria-hidden />}>Mostradas en esta sesión</Titulo>
          <MostradasEnSesion />
        </section>
      )}
      <p style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.5 }}>
        Los jugadores abren la mesa en su móvil desde el menú «Mesa».{' '}
        <a href={`/campaigns/${cId}/mesa`} target="_blank" rel="noopener noreferrer" style={{ color: tone.zafiro.fg, fontWeight: 650 }}>
          Ver la mesa como jugador <ExternalLink size={12} aria-hidden style={{ verticalAlign: '-2px' }} />
        </a>
      </p>
    </div>
  )
}

function Titulo({ id, icono, children }: { id: string; icono: ReactNode; children: ReactNode }) {
  return (
    <h3
      id={id}
      style={{
        display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: fs.lg + 1,
        fontWeight: 600, letterSpacing: '0.05em', color: tone.zafiro.fg,
      }}
    >
      {icono}
      {children}
      <span aria-hidden style={{ flex: 1, height: 1, background: 'var(--gold-rule)' }} />
    </h3>
  )
}

// ── What is on the table now ─────────────────────────────────────────────────

function AhoraEnLaMesa() {
  const { estado } = usePantalla()
  const p = estado.mesa.proyeccion
  if (!p) {
    return (
      <EmptyState
        icon={<Projector size={22} aria-hidden />}
        title="Nada en la mesa"
        description="Elige abajo una imagen, un mapa o un retrato y los jugadores lo verán en su móvil al momento."
      />
    )
  }
  // Keyed by the projection: a new image starts with its own title and caption
  return <ProyeccionActual key={p.id} p={p} />
}

function ProyeccionActual({ p }: { p: Proyeccion }) {
  const { cId, actualizar } = usePantalla()
  const { url, cargando, fallo } = useImagenMesa(cId, p.imagen)
  const [titulo, setTitulo] = useState(p.titulo)
  const [pie, setPie] = useState(p.pie)
  const guardar = () => {
    if (titulo.trim() === p.titulo && pie.trim() === p.pie) return
    actualizar((b) => anotarProyeccion(b, { titulo, pie }))
  }
  return (
    <section aria-label="Ahora en la mesa" style={{ ...tarjeta, ...stack(12), borderColor: tone.zafiro.border }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={pill(tone.zafiro)}><Projector size={12} aria-hidden />Ahora en la mesa</span>
        <span style={{ fontSize: fs.xs, color: c.subtle }}>desde las {hora(p.en)}</span>
        <Button size="sm" variant="secondary" icon={<X size={14} aria-hidden />} onClick={() => actualizar((b) => quitarDeMesa(b))} style={{ marginLeft: 'auto' }}>
          Quitar de la mesa
        </Button>
      </div>
      {url ? <EditorNiebla p={p} url={url} /> : <Vista url={url} cargando={cargando} fallo={fallo} alt={p.titulo || 'Imagen en la mesa'} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <Field label="Título">
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} onBlur={guardar} placeholder="Lo que ven" />
        </Field>
        <Field label="Pie para los jugadores" hint="«Veis esto…», «El personaje se ve así»">
          <Textarea rows={2} value={pie} onChange={(e) => setPie(e.target.value)} onBlur={guardar} placeholder="Opcional" />
        </Field>
      </div>
    </section>
  )
}

const acotar = (v: number) => Math.min(1, Math.max(0, v))
const rectangulo = (a: { x: number; y: number }, b: { x: number; y: number }): ZonaNiebla =>
  ({ x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y) })

/**
 * The projected image with its fog of war: the director sees the whole map under a veil, drags (finger, mouse or pen) to
 * uncover a rectangle for the players, taps the «×» of a zone to cover it again, or covers everything. Zones are fractions of
 * the image, so they land on the same spot of every phone. A drag shorter than 1 % of the image uncovers nothing.
 */
function EditorNiebla({ p, url }: { p: Proyeccion; url: string }) {
  const { actualizar } = usePantalla()
  const zona = useRef<HTMLDivElement>(null)
  const inicio = useRef<{ x: number; y: number } | null>(null)
  const [borrador, setBorrador] = useState<ZonaNiebla | null>(null)
  const n = p.niebla

  const fraccion = (ev: PointerEvent<HTMLDivElement>) => {
    const r = zona.current?.getBoundingClientRect()
    return r && r.width > 0 && r.height > 0 ? { x: acotar((ev.clientX - r.left) / r.width), y: acotar((ev.clientY - r.top) / r.height) } : null
  }
  const empezar = (ev: PointerEvent<HTMLDivElement>) => {
    if (!n.activa || ev.button !== 0) return
    const f = fraccion(ev)
    if (!f) return
    ev.preventDefault()
    ev.currentTarget.setPointerCapture(ev.pointerId)
    inicio.current = f
    setBorrador({ ...f, w: 0, h: 0 })
  }
  const mover = (ev: PointerEvent<HTMLDivElement>) => {
    if (!inicio.current) return
    const f = fraccion(ev)
    if (f) setBorrador(rectangulo(inicio.current, f))
  }
  const soltar = (ev: PointerEvent<HTMLDivElement>) => {
    if (!inicio.current) return
    const f = fraccion(ev)
    const z = f ? rectangulo(inicio.current, f) : null
    inicio.current = null
    setBorrador(null)
    if (z && z.w >= ZONA_MINIMA && z.h >= ZONA_MINIMA) actualizar((b) => { destaparZona(b, z) })
  }
  const cancelar = () => {
    inicio.current = null
    setBorrador(null)
  }
  const cuantas = n.zonas.length

  return (
    <div style={stack(8)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: fs.sm, fontWeight: 650, color: c.text }}>
          <Switch checked={n.activa} onChange={(v) => actualizar((b) => cambiarNiebla(b, (x) => { x.activa = v }))} label="Niebla: los jugadores solo ven las zonas destapadas" />
          Niebla
        </span>
        {n.activa && (
          <span style={{ fontSize: fs.xs, color: c.muted }}>
            {cuantas === 0 ? 'Todo tapado para los jugadores: arrastra sobre el mapa para destapar una zona.' : `${cuantas} zona${cuantas === 1 ? '' : 's'} destapada${cuantas === 1 ? '' : 's'} · arrastra para destapar otra.`}
          </span>
        )}
        {n.activa && cuantas > 0 && (
          <Button size="sm" variant="ghost" icon={<EyeOff size={14} aria-hidden />} onClick={() => actualizar((b) => cambiarNiebla(b, (x) => { x.zonas = [] }))} style={{ marginLeft: 'auto', minHeight: 32 }}>
            Tapar todo
          </Button>
        )}
      </div>
      <div
        ref={zona}
        onPointerDown={empezar}
        onPointerMove={mover}
        onPointerUp={soltar}
        onPointerCancel={cancelar}
        style={{
          position: 'relative', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${c.border}`, background: c.s2,
          touchAction: n.activa ? 'none' : 'auto', cursor: n.activa ? 'crosshair' : 'default', userSelect: 'none',
        }}
      >
        <img src={url} alt={p.titulo || 'Imagen en la mesa'} decoding="async" draggable={false} style={{ display: 'block', width: '100%', height: 'auto' }} />
        <CapaNiebla niebla={n} opaca={false} borrador={borrador} />
        {n.activa && n.zonas.map((z, i) => (
          <IconButton
            key={`${z.x}-${z.y}-${i}`}
            label={`Volver a tapar la zona ${i + 1}`}
            variant="surface"
            size={26}
            onPointerDown={(ev) => ev.stopPropagation()}
            onClick={() => actualizar((b) => cambiarNiebla(b, (x) => { x.zonas.splice(i, 1) }))}
            style={{ position: 'absolute', left: `calc(${(z.x + z.w) * 100}% - 13px)`, top: `calc(${z.y * 100}% - 13px)` }}
          >
            <X size={14} aria-hidden />
          </IconButton>
        ))}
      </div>
    </div>
  )
}

/** The image while it loads, or why it is not there */
function Vista({ url, cargando, fallo, alt }: { url: string | null; cargando: boolean; fallo: boolean; alt: string }) {
  if (cargando) return <Spinner label="Cargando la imagen…" />
  if (fallo || !url) return <p style={{ fontSize: fs.sm, color: tone.rubi.fg }}>No se pudo cargar la imagen.</p>
  return (
    <img
      src={url}
      alt={alt}
      decoding="async"
      style={{ display: 'block', width: '100%', maxHeight: 360, objectFit: 'contain', borderRadius: radius.md, border: `1px solid ${c.border}`, background: c.s2 }}
    />
  )
}

// ── Which fights the players see ─────────────────────────────────────────────

function EncuentrosEnMesa() {
  const { estado, actualizar } = usePantalla()
  if (estado.encuentros.length === 0) return <p style={{ fontSize: fs.sm, color: c.subtle }}>Sin combates abiertos. Un combate nace oculto: se muestra desde aquí o desde el Encuentro.</p>
  return (
    <ul style={{ ...listReset, ...stack(8) }}>
      {estado.encuentros.map((e) => {
        const ocultos = enemigosOcultos(e)
        return (
          <li key={e.id} style={{ ...tarjeta, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ flex: '1 1 160px', minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text }}>{e.titulo}</span>
              <span style={{ fontSize: fs.xs, color: c.muted }}>
                Ronda {e.ronda} · {e.combatientes.filter((x) => x.bando === 'pj').length} del grupo · {e.combatientes.filter((x) => x.bando === 'pnj').length} enemigos
                {ocultos ? ` (${ocultos} oculto${ocultos === 1 ? '' : 's'})` : ''}
              </span>
            </span>
            <Conmutador
              compacto
              activo={e.enMesa}
              t={tone.zafiro}
              icono={e.enMesa ? <Projector size={14} aria-hidden /> : <EyeOff size={14} aria-hidden />}
              etiqueta={e.enMesa ? 'En la mesa' : 'Mostrar en la mesa'}
              titulo={e.enMesa ? `Los jugadores ven «${e.titulo}» (toca para ocultarlo)` : `«${e.titulo}» está oculto a los jugadores (toca para mostrarlo)`}
              onClick={() => actualizar((b) => { const x = b.encuentros.find((y) => y.id === e.id); if (x) x.enMesa = !x.enMesa })}
            />
          </li>
        )
      })}
    </ul>
  )
}

// ── Picking an image ─────────────────────────────────────────────────────────

/** A thumbnail that shows its image to the players when tapped (`mapa`: covered by the fog until the director uncovers it) */
function Miniatura({ origen, titulo, detalle, accion, mapa }: { origen: OrigenImagen; titulo: string; detalle?: string; accion?: ReactNode; mapa?: boolean }) {
  const { cId } = usePantalla()
  const mostrar = useMostrarEnMesa()
  const { url, cargando } = useImagenMesa(cId, origen)
  return (
    <li style={{ display: 'flex', flexDirection: 'column', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${c.border}`, background: c.s2 }}>
      <button
        type="button"
        onClick={() => mostrar(origen, titulo, '', { mapa })}
        aria-label={`Mostrar a la mesa: ${titulo || 'imagen'}`}
        title="Mostrar a la mesa"
        style={{ ...buttonReset, display: 'block', width: '100%', cursor: 'pointer', textAlign: 'left' }}
      >
        <span style={{ display: 'block', aspectRatio: '4 / 3', background: c.s3 }}>
          {url ? (
            <img src={url} alt="" loading="lazy" decoding="async" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: c.subtle }}>
              {cargando ? <Spinner label="" /> : <ImageIcon size={22} aria-hidden />}
            </span>
          )}
        </span>
        <span style={{ display: 'block', padding: '7px 10px 4px', fontSize: fs.xs, fontWeight: 600, color: c.text, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{titulo || 'Sin título'}</span>
        {detalle && <span style={{ display: 'block', padding: '0 10px 6px', fontSize: fs.xs, color: c.subtle }}>{detalle}</span>}
      </button>
      {accion && <span style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 6px 6px' }}>{accion}</span>}
    </li>
  )
}

/** Why the server refused an upload, in the director's words */
function motivoSubida(e: unknown): string {
  const status = isAxiosError(e) ? e.response?.status : undefined
  const data: unknown = isAxiosError(e) ? e.response?.data : undefined
  const error = typeof data === 'object' && data !== null && 'error' in data ? String((data as { error: unknown }).error) : ''
  if (status === 413 || /weigh|too large/i.test(error)) return 'La imagen pesa más de 3 MB.'
  if (/WebP|PNG|JPEG/i.test(error)) return 'Tiene que ser una imagen WebP, PNG o JPEG.'
  if (/already has/i.test(error)) return 'La campaña ya tiene 50 imágenes: borra alguna antes de subir otra.'
  if (status === 403) return 'Solo el director puede subir imágenes.'
  return 'No se pudo subir la imagen.'
}

function Subidas() {
  const { cId, estado, actualizar } = usePantalla()
  const qc = useQueryClient()
  const { data: imagenes, isLoading, isError } = useQuery({ queryKey: ['mesa-imagenes', cId], queryFn: () => mesaApi.listImages(cId) })
  const [aviso, setAviso] = useState<string | null>(null)
  const [borrando, setBorrando] = useState<CampaignImage | null>(null)
  const entrada = useRef<HTMLInputElement>(null)

  const subir = useMutation({
    mutationFn: (file: File) => mesaApi.uploadImage(cId, file),
    onSuccess: () => { setAviso(null); void qc.invalidateQueries({ queryKey: ['mesa-imagenes', cId] }) },
    onError: (e) => setAviso(motivoSubida(e)),
  })
  const borrar = useMutation({
    mutationFn: (id: number) => mesaApi.deleteImage(cId, id),
    onSuccess: (_r, id) => {
      // The players would get a 404 for it: it leaves the table and the history too
      actualizar((b) => {
        const es = (p: Proyeccion) => p.imagen.tipo === 'subida' && p.imagen.imagenId === id
        if (b.mesa.proyeccion && es(b.mesa.proyeccion)) b.mesa.proyeccion = null
        b.mesa.proyecciones = b.mesa.proyecciones.filter((p) => !es(p))
      })
      qc.removeQueries({ queryKey: ['mesa-imagen', cId, id] })
      void qc.invalidateQueries({ queryKey: ['mesa-imagenes', cId] })
    },
    onError: () => setAviso('No se pudo borrar la imagen.'),
  })

  const elegirArchivo = (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    if (file.size > MAX_IMAGEN_BYTES) {
      setAviso('La imagen pesa más de 3 MB.')
      return
    }
    subir.mutate(file)
  }
  const enLaMesa = (id: number) => estado.mesa.proyeccion?.imagen.tipo === 'subida' && estado.mesa.proyeccion.imagen.imagenId === id

  return (
    <div style={stack(10)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <input
          ref={entrada}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => { elegirArchivo(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
          aria-hidden
          tabIndex={-1}
        />
        <Button variant="secondary" icon={<Upload size={16} aria-hidden />} loading={subir.isPending} onClick={() => entrada.current?.click()}>
          Subir imagen
        </Button>
        <span style={{ fontSize: fs.xs, color: c.subtle }}>WebP, PNG o JPEG, hasta 3 MB; 50 por campaña.</span>
      </div>
      {aviso && <p role="alert" style={{ fontSize: fs.sm, color: tone.rubi.fg }}>{aviso}</p>}
      {isLoading ? (
        <Spinner label="Cargando las imágenes…" />
      ) : isError ? (
        <p style={{ fontSize: fs.sm, color: tone.rubi.fg }}>No se pudieron cargar las imágenes de la campaña.</p>
      ) : !imagenes || imagenes.length === 0 ? (
        <p style={{ fontSize: fs.sm, color: c.subtle }}>Aún no hay imágenes subidas: un mapa dibujado, una foto, el retrato de un PNJ propio…</p>
      ) : (
        <ul style={rejilla}>
          {imagenes.map((img) => (
            <Miniatura
              key={img.id}
              origen={{ tipo: 'subida', imagenId: img.id }}
              titulo={sinExtension(img.name)}
              detalle={`${enLaMesa(img.id) ? 'En la mesa · ' : ''}${Math.max(1, Math.round(img.bytes / 1024))} KB`}
              accion={
                <Button size="sm" variant="ghost" icon={<Trash2 size={14} aria-hidden />} onClick={() => setBorrando(img)} style={{ minHeight: 32, color: tone.rubi.fg }} aria-label={`Borrar ${img.name}`}>
                  Borrar
                </Button>
              }
            />
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={borrando !== null}
        icon="trash"
        title={`¿Borrar «${borrando ? sinExtension(borrando.name) : ''}»?`}
        message="Desaparece de la campaña y, si está en la mesa, de los móviles de los jugadores."
        confirmLabel="Borrar"
        onConfirm={() => { if (borrando) borrar.mutate(borrando.id); setBorrando(null) }}
        onCancel={() => setBorrando(null)}
      />
    </div>
  )
}

/** «mapa-de-luthadel.webp» → «mapa-de-luthadel» */
const sinExtension = (nombre: string) => nombre.replace(/\.(webp|png|jpe?g)$/i, '')

function ImagenesDelGuion() {
  const { estado } = usePantalla()
  const actual = estado.escenaActual?.origen === 'propia' ? estado.escenaActual.escenaId : null
  const escenas = useMemo(() => {
    const todas = estado.escenasPropias.map((esc) => ({ id: esc.id, e: leerEscena(esc.md) })).filter((x) => x.e.imagenes.length > 0)
    // The current scene first: its images are the ones the table is at
    return [...todas.filter((x) => x.id === actual), ...todas.filter((x) => x.id !== actual)]
  }, [estado.escenasPropias, actual])
  if (escenas.length === 0) return <p style={{ fontSize: fs.sm, color: c.subtle }}>Las escenas de la sesión no tienen imágenes («imagen:» en el guion).</p>
  return (
    <div style={stack(14)}>
      {escenas.map(({ id, e }) => (
        <section key={id} aria-label={e.titulo} style={stack(8)}>
          <h4 style={{ ...eyebrow, color: id === actual ? tone.gold.fg : c.subtle, display: 'flex', gap: 6, alignItems: 'center' }}>
            {e.titulo}
            {id === actual && <span style={pill(tone.gold)}>Escena actual</span>}
          </h4>
          <ul style={rejilla}>
            {e.imagenes.map((img, i) => <Miniatura key={`${img.url}-${i}`} origen={{ tipo: 'publica', url: img.url }} titulo={img.titulo || e.titulo} />)}
          </ul>
        </section>
      ))}
    </div>
  )
}

function MapasDelLibro() {
  const libro = useLibro()
  const capitulos = (libro?.capitulos ?? []).map((cap) => ({ cap, mapas: cap.maps.filter((m) => m.imagePath) })).filter((x) => x.mapas.length > 0)
  if (capitulos.length === 0) return <p style={{ fontSize: fs.sm, color: c.subtle }}>El libro de este mundo no tiene mapas con imagen.</p>
  return (
    <div style={stack(14)}>
      {capitulos.map(({ cap, mapas }) => (
        <section key={cap.id} aria-label={cap.title} style={stack(8)}>
          <h4 style={{ ...eyebrow, color: c.subtle }}>Capítulo {cap.number} · {cap.title}</h4>
          <ul style={rejilla}>
            {mapas.map((m) => <Miniatura key={m.id} origen={{ tipo: 'publica', url: m.imagePath as string }} titulo={`Mapa ${m.id}: ${m.title}`} detalle={m.scale} mapa />)}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Retratos() {
  const { estado } = usePantalla()
  const { catalogo, catalogoListo } = useCatalogo()
  const [busqueda, setBusqueda] = useState('')
  const conRetrato = useMemo(() => catalogo.filter((n) => n.bookImages.includes('retrato')), [catalogo])
  // The adversaries of the open fights first: «el personaje se ve así» is said about who is in front of the party
  const enCombate = useMemo(() => {
    const ids = new Set(estado.encuentros.flatMap((e) => e.combatientes.map((x) => x.adversarioId)).filter((id): id is number => id !== null))
    return conRetrato.filter((n) => ids.has(n.id))
  }, [estado.encuentros, conRetrato])
  const q = foldText(busqueda.trim())
  const encontrados = q ? conRetrato.filter((n) => foldText(n.name).includes(q)).slice(0, 30) : []
  if (!catalogoListo) return <Spinner label="Cargando el catálogo…" />
  if (conRetrato.length === 0) return <p style={{ fontSize: fs.sm, color: c.subtle }}>Ningún adversario del catálogo tiene su retrato subido (Director → NPCs → «Subir fichas del libro»).</p>
  return (
    <div style={stack(12)}>
      {enCombate.length > 0 && (
        <section aria-label="En el combate" style={stack(8)}>
          <h4 style={{ ...eyebrow, color: tone.rubi.fg }}>En el combate</h4>
          <RejillaRetratos npcs={enCombate} />
        </section>
      )}
      <Field label="Buscar en el catálogo">
        <div style={{ position: 'relative' }}>
          <Search size={16} aria-hidden style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: c.subtle, pointerEvents: 'none' }} />
          <Input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre del adversario" style={{ paddingLeft: 36 }} />
        </div>
      </Field>
      {q && (encontrados.length === 0 ? <p style={{ fontSize: fs.sm, color: c.subtle }}>Nada con retrato se llama así.</p> : <RejillaRetratos npcs={encontrados} />)}
    </div>
  )
}

function RejillaRetratos({ npcs }: { npcs: GlobalNpc[] }) {
  return (
    <ul style={rejilla}>
      {npcs.map((n) => <Miniatura key={n.id} origen={{ tipo: 'retrato', adversarioId: n.id }} titulo={n.name} detalle={n.tipo} />)}
    </ul>
  )
}

function PorUrl() {
  const mostrar = useMostrarEnMesa()
  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const valida = /^(https?:\/\/|\/)\S+/i.test(url.trim())
  const enviar = () => {
    if (!valida) return
    mostrar({ tipo: 'publica', url: url.trim() }, titulo)
    setUrl('')
    setTitulo('')
  }
  return (
    <div style={stack(10)}>
      <Field label="Dirección de la imagen" hint="Una URL (https://…) o una ruta de la app (/maps/…)">
        <Input value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} placeholder="https://…" inputMode="url" />
      </Field>
      <Field label="Título">
        <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && enviar()} placeholder="Opcional" />
      </Field>
      <Button icon={<Link2 size={16} aria-hidden />} disabled={!valida} onClick={enviar} style={{ alignSelf: 'flex-start' }}>
        Mostrar a la mesa
      </Button>
    </div>
  )
}

// ── History of the session ───────────────────────────────────────────────────

function MostradasEnSesion() {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const actual = estado.mesa.proyeccion?.id ?? null
  return (
    <ul style={rejilla}>
      {estado.mesa.proyecciones.map((p) => (
        <Miniatura
          key={p.id}
          origen={p.imagen}
          titulo={p.titulo || 'Sin título'}
          mapa={p.niebla.activa}
          detalle={p.id === actual ? 'En la mesa ahora' : `A las ${hora(p.en)}${p.niebla.activa ? ` · niebla, ${p.niebla.zonas.length} zona${p.niebla.zonas.length === 1 ? '' : 's'}` : ''}`}
          accion={p.id !== actual && (
            <Button size="sm" variant="ghost" icon={<RotateCcw size={14} aria-hidden />} onClick={() => actualizar((b) => { volverAMostrar(b, p.id, ultimoDiario) })} style={{ minHeight: 32 }}>
              Volver a mostrar
            </Button>
          )}
        />
      ))}
    </ul>
  )
}
