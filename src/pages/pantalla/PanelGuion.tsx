import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDown, ArrowUp, BookMarked, BookOpen, Check, ChevronLeft, ChevronRight, ClipboardCopy, Dices, Download, FileUp, GitFork, Info, Lightbulb, ListPlus, Pencil, Plus,
  ScrollText, Swords, Trash2, TrendingUp, Upload, UserPlus, UserRound, Users, X, type LucideIcon,
} from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { diaryApi } from '../../api/diary'
import { useCampaignStore, useEra, useWorldConfig, useWorldData } from '../../store/campaignStore'
import { Button, ConfirmDialog, Disclosure, EmptyState, Field, IconButton, Input, Segmented, Sheet, Stepper, Textarea } from '../../components/ui'
import { c, eyebrow, font, fs, numeral, pill, radius, shadow, tone, type Tone } from '../../theme'
import type { HeroicPath } from '../../data/heroicPaths'
import type { Character } from '../../types'
import type { WorldConfig } from '../../worlds/types'
import { useCatalogo, usePaneles, usePantalla } from './contexto'
import {
  MAX_ENCUENTROS, anotar, claveContador, claveEscenaPropia, claveResultado, encuentroEnPantalla, marcar, nuevoId, numeroSiguiente,
  quitarEscena, type EscenaPropia, type PantallaEstado, type ProgresoEmpeno, type ResultadoPrueba,
} from './estado'
import {
  FORMATO_GUION, PLANTILLA_ESCENA, cuentaEmpeno, detallesEscena, dividirGuion, escribirGuion, estadoEmpeno, etiquetaPrueba, fusionarGuion,
  leerEscena, leerPrueba, mdEscenaRapida, posicionTras, resumen, tituloDe, yaEnSesion,
  type Bloque, type ClaseSeccion, type Empeno, type EscenaGuion, type ModoImportar, type Seccion,
} from './guion'
import { buscarAdversario, eraNumero } from './adversarios'
import { abrirEncuentro, anadirAdversario, anadirEnemigos, asegurarEncuentro, destinoAnadir } from './encuentro'
import { copiarTexto, descargarTexto, promptSiguienteGuion, type EscenaJugada } from './exportar'
import { ESCENA_META } from './meta'
import { Apartado, CabeceraEscena, Conmutador, EnLinea, Galeria, LeerEnVozAlta, NavegadorEscenas, TecladoNumerico, Tesela } from './piezas'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }
const tarjeta: CSSProperties = { padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }
const fila = (t: Tone): CSSProperties => ({ padding: '10px 12px', borderRadius: radius.md, background: t.bg, border: `1px solid ${t.border}` })

/** Look of the sections the screen gives a behaviour to */
const SECCION_META: Record<ClaseSeccion, { tone: Tone; icon: LucideIcon }> = {
  pruebas: { tone: tone.zafiro, icon: Dices },
  pnj: { tone: tone.esmeralda, icon: Users },
  pj: { tone: tone.gold, icon: UserRound },
  caminos: { tone: tone.topacio, icon: GitFork },
  reglas: { tone: tone.rubi, icon: Swords },
  avances: { tone: tone.esmeralda, icon: TrendingUp },
  otra: { tone: tone.cuarzo, icon: Info },
}

/** The first bold text of an item («**Axies** (él): …» → «Axies»), or its text up to the colon */
const nombreDeItem = (item: string) => /\*\*([^*]+)\*\*/.exec(item)?.[1].trim() ?? item.split(':')[0].trim()

/** The catalog stat block an NPC item points to: «(él · ficha: Bandido)», or its own name («**Kaiana**») */
const fichaDeItem = (item: string) => /ficha:\s*([^)·;,]+)/i.exec(item)?.[1].trim() ?? nombreDeItem(item)

// ── Panel ────────────────────────────────────────────────────────────────────

/**
 * «Sesión»: the scenes prepared for the next sessions (the skeleton), in order and grouped, each written in Markdown (`guion.ts`).
 * Scenes come from an imported draft, from the book («Añadir a la sesión») or are added in situ during the game.
 * The director plays it from here: reads aloud, shows images, marks tests, endeavours, counters and progress, prepares the
 * fights, and goes on to the next scene. Scripts are imported (drafted with AI) and the prompt for the next one is exported.
 */
export function PanelGuion({
  seleccion, onElegir, escala, onEscala, onLibro,
}: {
  seleccion: string | null
  onElegir: (id: string) => void
  escala: number
  onEscala: (v: number) => void
  /** Opens the book to add scenes from it; absent when the world has no book */
  onLibro?: () => void
}) {
  const { estado } = usePantalla()
  /** An existing scene, or 'markdown' for a new one written as Markdown */
  const [editando, setEditando] = useState<EscenaPropia | 'markdown' | null>(null)
  const [rapida, setRapida] = useState(false)
  const [borrando, setBorrando] = useState<EscenaPropia | null>(null)
  const [importando, setImportando] = useState(false)
  const lista = estado.escenasPropias
  const ref = estado.escenaActual
  const sel = lista.find((e) => e.id === seleccion) ?? lista.find((e) => ref?.origen === 'propia' && e.id === ref.escenaId) ?? lista[0] ?? null

  return (
    <div style={stack(16)}>
      <BarraGuion onNueva={() => setRapida(true)} onImportar={() => setImportando(true)} onLibro={onLibro} />

      {lista.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={22} aria-hidden />}
          title={estado.sesion ? 'Esta sesión no tiene escenas' : 'La próxima sesión no tiene escenas'}
          description={
            'Importa el borrador de la sesión (un .md hecho con IA desde el libro y vuestra historia), añade escenas desde «Libro» o crea una ' +
            'en el momento.' +
            (estado.historial[0]?.escenas.length ? ' Las escenas jugadas en las sesiones anteriores están en Bitácora.' : '')
          }
          action={
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Button icon={<Upload size={16} aria-hidden />} onClick={() => setImportando(true)}>Importar</Button>
              {onLibro && <Button variant="secondary" icon={<BookOpen size={16} aria-hidden />} onClick={onLibro}>Del libro</Button>}
              <Button variant="secondary" icon={<Plus size={16} aria-hidden />} onClick={() => setRapida(true)}>Nueva escena</Button>
            </div>
          }
        />
      ) : (
        <>
          <IndiceGuion seleccion={sel?.id ?? null} onElegir={onElegir} />
          {sel && (
            <DetalleGuion
              esc={sel}
              escala={escala}
              onEscala={onEscala}
              onElegir={onElegir}
              onEditar={() => setEditando(sel)}
              onBorrar={() => setBorrando(sel)}
            />
          )}
        </>
      )}

      {editando && (
        <HojaEditarEscena escena={editando === 'markdown' ? null : editando} onClose={() => setEditando(null)} onGuardada={onElegir} />
      )}
      {rapida && (
        <HojaEscenaRapida
          onClose={() => setRapida(false)}
          onCreada={onElegir}
          onMarkdown={() => { setRapida(false); setEditando('markdown') }}
        />
      )}
      {importando && <HojaImportar onClose={() => setImportando(false)} onHecho={(id) => id && onElegir(id)} />}
      <BorrarEscena escena={borrando} onCerrar={() => setBorrando(null)} />
    </div>
  )
}

function BorrarEscena({ escena, onCerrar }: { escena: EscenaPropia | null; onCerrar: () => void }) {
  const { actualizar } = usePantalla()
  return (
    <ConfirmDialog
      open={!!escena}
      title={`¿Eliminar «${escena ? tituloDe(escena) : ''}»?`}
      message="Se borra la escena de la sesión con sus pruebas marcadas, contadores y empeño. Esta acción no se puede deshacer."
      onConfirm={() => {
        if (escena) actualizar((b) => quitarEscena(b, escena.id))
        onCerrar()
      }}
      onCancel={onCerrar}
    />
  )
}

// ── Toolbar: title, import, export, prompt for the next draft ────────────────

/** One line per PJ for the prompt: ancestry, level, paths, purpose, obstacle and active goals with their milestones */
function describirPj(p: Character, cfg: WorldConfig, heroicos: HeroicPath[]): string {
  const heroico = heroicos.find((h) => h.id === p.caminoHeroico)?.name ?? p.caminoHeroico
  const ci = cfg.caminoInvestido
  const valorInvestido = ci ? (ci.field === 'caminoRadiante' ? p.caminoRadiante : p.caminoMetal) : ''
  const investido = ci?.caminos.find((x) => x.id === valorInvestido)?.nombre ?? valorInvestido
  const caminos = [heroico, investido].filter(Boolean).join(' y ')
  const metas = (p.metas ?? []).filter((m) => m.estado === 'activa').map((m) => `${m.titulo.trim()} (${m.hitos}/3 hitos)`)
  return [
    `${p.name} (${p.ascendencia || 'sin ascendencia'}, nivel ${p.level}${caminos ? `, ${caminos}` : ''})`,
    p.proposito && `Propósito: ${p.proposito}`,
    p.obstaculo && `Obstáculo: ${p.obstaculo}`,
    metas.length > 0 && `Metas: ${metas.join(', ')}`,
  ].filter(Boolean).join('. ')
}

/**
 * How the scenes went (played, tests, endeavour, counters), for the prompt of the next draft: those of the session; with none
 * open, first the ones the last closed session took with it
 */
function escenasParaPrompt(estado: PantallaEstado): EscenaJugada[] {
  const ref = estado.escenaActual
  const archivadas = estado.sesion ? [] : (estado.historial[0]?.escenas ?? [])
  return [
    ...archivadas.map((e): EscenaJugada => ({ grupo: e.grupo, titulo: e.titulo, estado: 'jugada', detalles: e.detalles })),
    ...estado.escenasPropias.map((esc): EscenaJugada => {
      const e = leerEscena(esc.md)
      const actual = ref?.origen === 'propia' && ref.escenaId === esc.id
      return {
        grupo: e.grupo,
        titulo: e.titulo,
        estado: actual ? 'actual' : estado.marcas[claveEscenaPropia(esc.id)] ? 'jugada' : 'pendiente',
        detalles: detallesEscena(estado, esc),
      }
    }),
  ]
}

function BarraGuion({ onNueva, onImportar, onLibro }: { onNueva: () => void; onImportar: () => void; onLibro?: () => void }) {
  const { cId, estado, ultimoDiario } = usePantalla()
  const cfg = useWorldConfig()
  const campana = useCampaignStore((s) => s.currentCampaign)
  const { data: personajes = [] } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId) })
  const { data: diario } = useQuery({ queryKey: ['diary', cId], queryFn: () => diaryApi.getAll(cId) })
  const { data: datosMundo } = useWorldData()
  const [aviso, setAviso] = useState<string | null>(null)
  const lista = estado.escenasPropias
  const jugadas = lista.filter((e) => estado.marcas[claveEscenaPropia(e.id)]).length
  const titulo = estado.guionTitulo || 'Sesión preparada'
  const archivo = `${(estado.guionTitulo || 'Sesión').replace(/[\\/:*?"<>|]/g, '')}.md`
  /** The scenes belong to the open session, or to the next one while none is open */
  const deQueSesion = estado.sesion
    ? `Sesión ${estado.sesion.numero ?? '¿?'} · en curso`
    : `Sesión ${numeroSiguiente(estado, ultimoDiario)} · sin empezar`

  const copiarGuion = async () => {
    const ok = await copiarTexto(escribirGuion(estado.guionTitulo, lista))
    setAviso(ok ? 'Sesión copiada en Markdown.' : 'No se pudo copiar. Descárgala en su lugar.')
  }

  const copiarPrompt = async () => {
    const ultima = diario?.length ? diario.reduce((a, b) => (b.number > a.number ? b : a)) : null
    const texto = promptSiguienteGuion({
      campana: campana?.name ?? 'Campaña',
      mundo: cfg.nombre,
      pjs: personajes.map((p) => describirPj(p, cfg, datosMundo?.caminosHeroicos ?? [])),
      cronica: ultima ? { numero: ultima.number, titulo: ultima.title, texto: ultima.body } : null,
      guionTitulo: estado.guionTitulo,
      escenas: escenasParaPrompt(estado),
      notas: estado.sesion?.eventos ?? estado.historial[0]?.eventos ?? [],
      formato: FORMATO_GUION,
    })
    const ok = await copiarTexto(texto)
    setAviso(ok
      ? 'Prompt copiado: pégalo en tu IA (mejor con el libro a mano) e importa aquí lo que te devuelva.'
      : 'No se pudo copiar el prompt.')
  }

  return (
    <header style={{ ...stack(10), paddingBottom: 12, borderBottom: '1px solid var(--gold-rule)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px', minWidth: 0 }}>
          <p style={{ ...eyebrow, color: tone.gold.fg }}>{deQueSesion}</p>
          <h2 style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{titulo}</h2>
          {lista.length > 0 && (
            <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2 }}>
              {lista.length} escena{lista.length === 1 ? '' : 's'} · {jugadas} jugada{jugadas === 1 ? '' : 's'}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button size="sm" variant="secondary" icon={<Upload size={15} aria-hidden />} onClick={onImportar}>Importar</Button>
          {onLibro && <Button size="sm" variant="secondary" icon={<BookOpen size={15} aria-hidden />} onClick={onLibro}>Del libro</Button>}
          <Button size="sm" variant="secondary" icon={<Plus size={15} aria-hidden />} onClick={onNueva}>Nueva escena</Button>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button size="sm" variant="gold" icon={<Lightbulb size={15} aria-hidden />} onClick={copiarPrompt}>Prompt de la siguiente sesión</Button>
        {lista.length > 0 && (
          <>
            <Button size="sm" variant="ghost" icon={<ClipboardCopy size={15} aria-hidden />} onClick={copiarGuion}>Copiar sesión</Button>
            <Button size="sm" variant="ghost" icon={<Download size={15} aria-hidden />} onClick={() => descargarTexto(archivo, escribirGuion(estado.guionTitulo, lista))}>
              Descargar .md
            </Button>
          </>
        )}
      </div>
      <p role="status" className={aviso ? undefined : 'sr-only'} style={{ fontSize: fs.sm, color: c.muted }}>{aviso}</p>
    </header>
  )
}

// ── Index: the scenes by group, with what has been played ────────────────────

function IndiceGuion({ seleccion, onElegir }: { seleccion: string | null; onElegir: (id: string) => void }) {
  const { estado } = usePantalla()
  const ref = estado.escenaActual
  return (
    <NavegadorEscenas
      titulo={estado.guionTitulo || 'Sesión preparada'}
      ancla="escena-guion"
      seleccion={seleccion}
      onElegir={onElegir}
      escenas={estado.escenasPropias.map((esc) => {
        const e = leerEscena(esc.md)
        return {
          id: esc.id, titulo: e.titulo, tipo: e.tipo, grupo: e.grupo,
          jugada: !!estado.marcas[claveEscenaPropia(esc.id)],
          actual: ref?.origen === 'propia' && ref.escenaId === esc.id,
        }
      })}
    />
  )
}

// ── One scene ────────────────────────────────────────────────────────────────

function DetalleGuion({
  esc, escala, onEscala, onElegir, onEditar, onBorrar,
}: {
  esc: EscenaPropia
  escala: number
  onEscala: (v: number) => void
  onElegir: (id: string) => void
  onEditar: () => void
  onBorrar: () => void
}) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const e = leerEscena(esc.md)
  const lista = estado.escenasPropias
  const i = lista.findIndex((x) => x.id === esc.id)
  const anterior = lista[i - 1] ?? null
  const siguiente = lista[i + 1] ?? null
  const clave = claveEscenaPropia(esc.id)
  const jugada = !!estado.marcas[clave]
  const actual = estado.escenaActual?.origen === 'propia' && estado.escenaActual.escenaId === esc.id
  const articulo = useRef<HTMLElement>(null)
  /** To a neighbouring scene from the bottom of this one: the new scene is read from its top */
  const ir = (id: string) => {
    onElegir(id)
    requestAnimationFrame(() => articulo.current?.scrollIntoView({ block: 'start' }))
  }

  const fijarActual = (b: PantallaEstado, x: EscenaPropia) => {
    b.escenaActual = { origen: 'propia', capituloId: null, escenaId: x.id }
    anotar(b, { tipo: 'escena', etiqueta: 'Escena', texto: tituloDe(x) }, ultimoDiario)
  }
  /** The table moves on: this scene is played and the next one becomes the current one */
  const pasarALaSiguiente = () => {
    actualizar((b) => {
      if (!b.marcas[clave]) {
        marcar(b, clave, true)
        anotar(b, { tipo: 'avance', etiqueta: 'Escena jugada', texto: e.titulo }, ultimoDiario)
      }
      if (siguiente) fijarActual(b, siguiente)
      else b.escenaActual = null
    })
    if (siguiente) ir(siguiente.id)
  }
  const mover = (d: -1 | 1) =>
    actualizar((b) => {
      const a = b.escenasPropias
      const j = a.findIndex((x) => x.id === esc.id)
      const k = j + d
      if (j < 0 || k < 0 || k >= a.length) return
      ;[a[j], a[k]] = [a[k], a[j]]
    })

  return (
    <article id="escena-guion" ref={articulo} style={{ ...tarjeta, ...stack(18), padding: 18, scrollMarginTop: 76 }}>
      <CabeceraEscena
        titulo={e.titulo}
        tipo={e.tipo}
        kicker={e.grupo || undefined}
        actual={actual}
        jugada={jugada}
        escala={escala}
        onEscala={onEscala}
        onActual={() => actualizar((b) => {
          if (actual) { b.escenaActual = null; return }
          fijarActual(b, esc)
        })}
        onJugada={() => actualizar((b) => {
          marcar(b, clave, !jugada)
          if (!jugada) anotar(b, { tipo: 'avance', etiqueta: 'Escena jugada', texto: e.titulo }, ultimoDiario)
        })}
        acciones={
          <>
            <IconButton label={`Editar ${e.titulo}`} variant="surface" size={36} onClick={onEditar}><Pencil size={15} aria-hidden /></IconButton>
            <IconButton label="Subir en la sesión" variant="surface" size={36} disabled={!anterior} onClick={() => mover(-1)}><ArrowUp size={15} aria-hidden /></IconButton>
            <IconButton label="Bajar en la sesión" variant="surface" size={36} disabled={!siguiente} onClick={() => mover(1)}><ArrowDown size={15} aria-hidden /></IconButton>
            <IconButton label={`Eliminar ${e.titulo}`} variant="danger" size={36} onClick={onBorrar}><Trash2 size={15} aria-hidden /></IconButton>
          </>
        }
      />
      {e.fuente && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted, marginTop: -6 }}>
          <BookMarked size={14} aria-hidden style={{ color: tone.gold.fg, flexShrink: 0 }} />
          {e.fuente}
        </p>
      )}

      <Bloques bloques={e.cuerpo} escala={escala} />
      {e.imagenes.length > 0 && <Galeria imagenes={e.imagenes} />}
      {e.empeno && <TrackerEmpeno escenaId={esc.id} titulo={e.titulo} objetivo={e.empeno} />}
      {e.contadores.length > 0 && <Contadores key={esc.id} escenaId={esc.id} nombres={e.contadores} />}
      {e.secciones.map((s, k) => <SeccionGuion key={`${s.titulo}-${k}`} seccion={s} escenaId={esc.id} titulo={e.titulo} escala={escala} />)}
      {e.enemigos.length > 0 && <EnemigosEscena esc={esc} e={e} />}

      <nav aria-label="Escenas vecinas" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingTop: 12, borderTop: `1px solid ${c.border}` }}>
        <Button size="sm" variant="ghost" icon={<ChevronLeft size={16} aria-hidden />} disabled={!anterior} onClick={() => anterior && ir(anterior.id)}>
          Anterior
        </Button>
        <Button size="sm" variant="ghost" disabled={!siguiente} onClick={() => siguiente && ir(siguiente.id)}>
          Siguiente <ChevronRight size={16} aria-hidden />
        </Button>
        {actual && (
          <Button variant="gold" icon={<Check size={16} aria-hidden />} onClick={pasarALaSiguiente} style={{ marginLeft: 'auto' }}>
            {siguiente ? `Jugada · pasar a «${tituloDe(siguiente)}»` : 'Jugada · fin de la sesión'}
          </Button>
        )}
      </nav>
    </article>
  )
}

/**
 * A scene of the original book uploaded to the Libro (scripts/aventura/parsear_libro.py): read only, as the book is a static
 * reference. Tests are shown but marked in the session; its enemies can still prepare the encounter. «A la sesión» lives in the
 * fixed row of the index.
 */
export function DetalleEscenaLibro({ esc, escala, onEscala }: { esc: EscenaPropia; escala: number; onEscala: (v: number) => void }) {
  const e = leerEscena(esc.md)
  return (
    <article id="escena-aventura" style={{ ...tarjeta, ...stack(18), padding: 18, scrollMarginTop: 76 }}>
      <CabeceraEscena
        titulo={e.titulo}
        tipo={e.tipo}
        kicker={(e.apartado && e.apartado !== e.titulo ? e.apartado : e.grupo) || undefined}
        escala={escala}
        onEscala={onEscala}
      />
      {e.fuente && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted, marginTop: -6 }}>
          <BookMarked size={14} aria-hidden style={{ color: tone.gold.fg, flexShrink: 0 }} />
          {e.fuente}
        </p>
      )}
      <Bloques bloques={e.cuerpo} escala={escala} />
      {e.imagenes.length > 0 && <Galeria imagenes={e.imagenes} />}
      {e.secciones.map((s, k) => <SeccionGuion key={`${s.titulo}-${k}`} seccion={s} escenaId={esc.id} titulo={e.titulo} escala={escala} soloLectura />)}
      {e.enemigos.length > 0 && <EnemigosEscena esc={esc} e={e} />}
    </article>
  )
}

/** Paragraphs, read-aloud boxes, lists and checklists of the script's Markdown */
function Bloques({ bloques, escala }: { bloques: Bloque[]; escala: number }) {
  if (bloques.length === 0) return null
  return (
    <div style={stack(12)}>
      {bloques.map((b, i) => {
        if (b.tipo === 'cita') return <LeerEnVozAlta key={i} texto={b.texto} escala={escala} />
        if (b.tipo === 'lista') {
          return (
            <ul key={i} style={{ ...listReset, ...stack(6) }}>
              {b.items.map((t, j) => (
                <li key={j} style={{ display: 'flex', gap: 8, fontSize: Math.round(15 * escala), lineHeight: 1.55, color: c.text }}>
                  <span aria-hidden style={{ color: tone.gold.fg, flexShrink: 0 }}>•</span>
                  <span><EnLinea texto={t} /></span>
                </li>
              ))}
            </ul>
          )
        }
        return <p key={i} style={{ fontSize: Math.round(16 * escala), lineHeight: 1.6, color: c.text }}><EnLinea texto={b.texto} /></p>
      })}
    </div>
  )
}

function SeccionGuion({
  seccion, escenaId, titulo, escala, soloLectura = false,
}: { seccion: Seccion; escenaId: string; titulo: string; escala: number; soloLectura?: boolean }) {
  const meta = SECCION_META[seccion.clase]
  const Icon = meta.icon
  return (
    <Apartado titulo={seccion.titulo} icono={<Icon size={13} aria-hidden />} color={seccion.clase === 'otra' ? c.subtle : meta.tone.fg}>
      <div style={stack(8)}>
        {seccion.bloques.map((b, i) => {
          if (b.tipo !== 'lista' || seccion.clase === 'otra') return <Bloques key={i} bloques={[b]} escala={escala} />
          if (seccion.clase === 'pruebas') return <Pruebas key={i} items={b.items} escenaId={escenaId} titulo={titulo} soloLectura={soloLectura} />
          if (seccion.clase === 'pnj') return <ListaPnj key={i} items={b.items} />
          return (
            <ul key={i} style={{ ...listReset, ...stack(6) }}>
              {b.items.map((t, j) => (
                <li key={j} style={{ ...fila(meta.tone), fontSize: Math.round(15 * escala), lineHeight: 1.5, color: c.text }}>
                  <EnLinea texto={t} />
                </li>
              ))}
            </ul>
          )
        })}
        {seccion.clase === 'avances' && (
          <p style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.45 }}>
            Recomendaciones: se aplican en la ficha de cada personaje; la pantalla no cambia niveles, metas ni Ideales.
          </p>
        )}
      </div>
    </Apartado>
  )
}

/**
 * Tests: the difficulty in big, the skill, what it is for; in the session the director marks how it went (and the log keeps it),
 * in the book they are only read
 */
function Pruebas({ items, escenaId, titulo, soloLectura }: { items: string[]; escenaId: string; titulo: string; soloLectura: boolean }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const marcarResultado = (item: string, r: ResultadoPrueba) =>
    actualizar((b) => {
      const k = claveResultado(escenaId, item)
      if (b.resultados[k] === r) {
        delete b.resultados[k]
        return
      }
      b.resultados[k] = r
      const p = leerPrueba(item)
      anotar(b, {
        tipo: 'avance', etiqueta: 'Prueba',
        texto: `${etiquetaPrueba(p)} ${r === 'exito' ? 'superada' : 'fallada'} en «${titulo}»${p.texto ? `: ${resumen(p.texto)}` : ''}`,
      }, ultimoDiario)
    })
  return (
    <ul style={{ ...listReset, ...stack(8) }}>
      {items.map((item, i) => {
        const p = leerPrueba(item)
        const r = soloLectura ? undefined : estado.resultados[claveResultado(escenaId, item)]
        const t = r === 'exito' ? tone.esmeralda : r === 'fallo' ? tone.rubi : tone.zafiro
        return (
          <li key={i} style={{ ...fila(t), display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
            {p.cd !== null && (
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 46, flexShrink: 0 }}>
                <span style={{ ...eyebrow, fontSize: 10, color: t.fg }}>CD</span>
                <span style={{ ...numeral, fontSize: fs['2xl'], lineHeight: 1, color: c.text }}>{p.cd}</span>
              </span>
            )}
            {p.cd === null && p.contra && (
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 74, flexShrink: 0, textAlign: 'center' }}>
                <span style={{ ...eyebrow, fontSize: 10, color: t.fg }}>contra</span>
                <span style={{ fontSize: fs.xs, fontWeight: 700, lineHeight: 1.25, color: c.text }}>{p.contra}</span>
              </span>
            )}
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              {p.habilidad && <p style={{ fontWeight: 700, color: t.fg, fontSize: fs.base }}>{p.habilidad}</p>}
              <p style={{ fontSize: fs.sm + 1, lineHeight: 1.5, color: c.text }}><EnLinea texto={p.texto} /></p>
            </div>
            {!soloLectura && (
              <div role="group" aria-label={`Resultado: ${etiquetaPrueba(p)}`} style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <Conmutador compacto activo={r === 'exito'} t={tone.esmeralda} icono={<Check size={15} aria-hidden />} etiqueta="Superada" onClick={() => marcarResultado(item, 'exito')} />
                <Conmutador compacto activo={r === 'fallo'} t={tone.rubi} icono={<X size={15} aria-hidden />} etiqueta="Fallada" onClick={() => marcarResultado(item, 'fallo')} />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** NPCs of the scene; one with a stat block in the catalog can join the fight */
function ListaPnj({ items }: { items: string[] }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const { irA } = usePaneles()
  const cfg = useWorldConfig()
  const { catalogo } = useCatalogo()
  const era = eraNumero(useEra())
  return (
    <ul style={{ ...listReset, ...stack(8) }}>
      {items.map((item, i) => {
        const nombre = nombreDeItem(item)
        const ficha = buscarAdversario(fichaDeItem(item), catalogo)
        return (
          <li key={i} style={{ ...fila(tone.esmeralda), ...stack(8) }}>
            <p style={{ fontSize: fs.sm + 1, lineHeight: 1.5, color: c.text }}><EnLinea texto={item} /></p>
            {ficha && (
              <Button
                size="sm"
                variant="secondary"
                icon={<UserPlus size={15} aria-hidden />}
                style={{ alignSelf: 'flex-start' }}
                onClick={() => {
                  actualizar((b) => anadirAdversario(asegurarEncuentro(b, 'Encuentro', ultimoDiario), ficha, 1, cfg.habilidades, era, nombre))
                  irA('encuentro')
                }}
              >
                Añadir {destinoAnadir(estado)} ({ficha.name})
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

/** Successes before failures («6 éxitos antes de 4 fallos»): dots, steppers and the outcome, which goes to the log */
function TrackerEmpeno({ escenaId, titulo, objetivo }: { escenaId: string; titulo: string; objetivo: Empeno }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const prog = estado.empenos[escenaId] ?? { exitos: 0, fallos: 0 }
  const resultado = estadoEmpeno(prog, objetivo)
  const t = resultado === 'superado' ? tone.esmeralda : resultado === 'fracasado' ? tone.rubi : tone.topacio
  const cambiar = (campo: keyof ProgresoEmpeno, valor: number) =>
    actualizar((b) => {
      const p = { ...(b.empenos[escenaId] ?? { exitos: 0, fallos: 0 }) }
      const antes = estadoEmpeno(p, objetivo)
      p[campo] = Math.max(0, Math.min(99, valor))
      b.empenos[escenaId] = p
      const despues = estadoEmpeno(p, objetivo)
      if (despues !== 'en curso' && despues !== antes) {
        anotar(b, { tipo: 'avance', etiqueta: 'Empeño', texto: `«${titulo}» ${despues} (${cuentaEmpeno(p)})` }, ultimoDiario)
      }
    })
  const linea = (campo: keyof ProgresoEmpeno, etiqueta: string, max: number, tt: Tone) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
      <span style={{ ...eyebrow, color: tt.fg, minWidth: 54 }}>{etiqueta}</span>
      <span aria-hidden style={{ display: 'flex', gap: 5, flex: '1 1 120px', flexWrap: 'wrap' }}>
        {Array.from({ length: Math.max(max, prog[campo]) }, (_, k) => (
          <span key={k} style={{ width: 16, height: 16, borderRadius: 999, border: `1.5px solid ${tt.fg}`, background: k < prog[campo] ? tt.fg : 'transparent' }} />
        ))}
      </span>
      <Stepper size="sm" label={`${etiqueta} del empeño`} value={prog[campo]} min={0} max={99} onChange={(v) => cambiar(campo, v)} format={(v) => `${v}/${max}`} />
    </div>
  )
  return (
    <section aria-label={`Empeño: ${objetivo.exitos} éxitos antes de ${objetivo.fallos} fallos`} style={{ ...fila(t), ...stack(10), padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Tesela t={t} tam={32}><Dices size={16} /></Tesela>
        <p style={{ flex: 1, fontWeight: 650, color: c.text }}>
          Empeño · {objetivo.exitos} éxitos antes de {objetivo.fallos} fallos
        </p>
        <span style={pill(t)}>{resultado === 'en curso' ? 'En curso' : resultado === 'superado' ? 'Superado' : 'Fracasado'}</span>
      </div>
      {linea('exitos', 'Éxitos', objetivo.exitos, tone.esmeralda)}
      {linea('fallos', 'Fallos', objetivo.fallos, tone.rubi)}
    </section>
  )
}

/** Counters of a scene (the ship's damage, days lost…): also shown in the fight prepared from it */
function Contadores({ escenaId, nombres }: { escenaId: string; nombres: string[] }) {
  const { estado, actualizar } = usePantalla()
  const [cantidad, setCantidad] = useState<string | null>(null)
  const poner = (nombre: string, valor: number) =>
    actualizar((b) => { b.contadores[claveContador(escenaId, nombre)] = Math.max(0, Math.min(9999, valor)) })
  return (
    <ul aria-label="Contadores" style={{ ...listReset, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      {nombres.map((n) => {
        const v = estado.contadores[claveContador(escenaId, n)] ?? 0
        return (
          <li key={n} style={{ ...fila(tone.cuarzo), display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', flex: '1 1 260px' }}>
            <span style={{ flex: 1, minWidth: 0, fontWeight: 650, color: c.text }}>{n}</span>
            <Stepper size="sm" label={n} value={v} min={0} max={9999} onChange={(x) => poner(n, x)} />
            <Button size="sm" variant="secondary" onClick={() => setCantidad(n)}>± Cantidad</Button>
          </li>
        )
      })}
      {cantidad !== null && (
        <HojaCantidad
          nombre={cantidad}
          onClose={() => setCantidad(null)}
          onAplicar={(d) => poner(cantidad, (estado.contadores[claveContador(escenaId, cantidad)] ?? 0) + d)}
        />
      )}
    </ul>
  )
}

function HojaCantidad({ nombre, onClose, onAplicar }: { nombre: string; onClose: () => void; onAplicar: (delta: number) => void }) {
  const [valor, setValor] = useState('')
  const n = Number(valor) || 0
  const aplicar = (signo: 1 | -1) => {
    onAplicar(signo * n)
    onClose()
  }
  return (
    <Sheet
      open
      onClose={onClose}
      title={nombre}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} disabled={!n} onClick={() => aplicar(-1)}>Restar {n || ''}</Button>
          <Button size="lg" style={{ flex: 1 }} disabled={!n} onClick={() => aplicar(1)}>Sumar {n || ''}</Button>
        </>
      }
    >
      <div style={stack(12)}>
        <output style={{ ...numeral, fontSize: fs['3xl'], textAlign: 'center', color: c.text }}>{valor || '0'}</output>
        <TecladoNumerico valor={valor} onChange={setValor} etiqueta={`Cantidad para ${nombre}`} />
      </div>
    </Sheet>
  )
}

/** The enemies of the scene and «Preparar encuentro»: the fight remembers the scene, so its rules and counters go with it */
function EnemigosEscena({ esc, e }: { esc: EscenaPropia; e: EscenaGuion }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const { irA } = usePaneles()
  const cfg = useWorldConfig()
  const { catalogo, catalogoListo, catalogoFallo } = useCatalogo()
  const era = eraNumero(useEra())
  const hayEncuentro = encuentroEnPantalla(estado) !== null
  const preparar = (simultaneo: boolean) => {
    actualizar((b) => {
      const enc = simultaneo ? abrirEncuentro(b, e.titulo, ultimoDiario) : asegurarEncuentro(b, e.titulo, ultimoDiario)
      enc.escenaId ??= esc.id
      anadirEnemigos(enc, e.enemigos, catalogo, cfg.habilidades, era)
    })
    irA('encuentro')
  }
  return (
    <Apartado titulo="Enemigos" icono={<Swords size={13} aria-hidden />} color={tone.rubi.fg}>
      <ul style={{ ...listReset, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {e.enemigos.map((x, i) => {
          const ficha = buscarAdversario(x.nombre, catalogo)
          return (
            <li key={i} style={{ ...pill(ficha ? tone.rubi : tone.cuarzo), borderRadius: radius.sm }} title={ficha ? `Ficha: ${ficha.name}` : 'Sin ficha en el catálogo'}>
              {x.cantidad} {x.nombre}
            </li>
          )
        })}
      </ul>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button icon={<Swords size={16} aria-hidden />} disabled={!catalogoListo} onClick={() => preparar(false)}>
          {hayEncuentro ? `Añadir ${destinoAnadir(estado)}` : 'Preparar encuentro'}
        </Button>
        {hayEncuentro && estado.encuentros.length < MAX_ENCUENTROS && (
          <Button variant="secondary" icon={<Swords size={16} aria-hidden />} disabled={!catalogoListo} onClick={() => preparar(true)}>
            Como combate simultáneo
          </Button>
        )}
        {!catalogoListo && (
          <p style={{ width: '100%', fontSize: fs.xs, color: catalogoFallo ? tone.rubi.fg : c.subtle }}>
            {catalogoFallo ? 'No se pudo cargar el catálogo de adversarios: recarga la pantalla para preparar el encuentro con sus fichas.' : 'Cargando el catálogo de adversarios…'}
          </p>
        )}
      </div>
    </Apartado>
  )
}

/** In the Encuentro panel: the combat rules and counters of the script scene the fight was prepared from */
export function ReglasDeEscena({ escenaId }: { escenaId: string }) {
  const { estado } = usePantalla()
  const esc = estado.escenasPropias.find((x) => x.id === escenaId)
  if (!esc) return null
  const e = leerEscena(esc.md)
  const reglas = e.secciones.filter((s) => s.clase === 'reglas').flatMap((s) => s.bloques)
  if (reglas.length === 0 && e.contadores.length === 0) return null
  return (
    <Disclosure
      defaultOpen
      headingLevel={3}
      accent={tone.rubi.fg}
      icon={<ScrollText size={18} aria-hidden />}
      title={`Reglas de «${e.titulo}»`}
      summary="De la sesión: efectos del campo de batalla y contadores de la escena."
    >
      <div style={stack(12)}>
        {reglas.length > 0 && <Bloques bloques={reglas} escala={1} />}
        {e.contadores.length > 0 && <Contadores escenaId={esc.id} nombres={e.contadores} />}
      </div>
    </Disclosure>
  )
}

// ── Editing (the scene's Markdown) and importing ─────────────────────────────

/** What the parser understood, under the text being edited */
function resumenEscena(e: EscenaGuion): string {
  const pruebas = e.secciones.filter((s) => s.clase === 'pruebas').flatMap((s) => s.bloques).reduce((n, b) => n + (b.tipo === 'lista' ? b.items.length : 0), 0)
  const lecturas = [...e.cuerpo, ...e.secciones.flatMap((s) => s.bloques)].filter((b) => b.tipo === 'cita').length
  return [
    e.grupo && `Grupo: ${e.grupo}`,
    lecturas && `${lecturas} lectura${lecturas === 1 ? '' : 's'} en voz alta`,
    pruebas && `${pruebas} prueba${pruebas === 1 ? '' : 's'}`,
    e.imagenes.length && `${e.imagenes.length} imagen${e.imagenes.length === 1 ? '' : 'es'}`,
    e.enemigos.length && `enemigos: ${e.enemigos.map((x) => `${x.cantidad} ${x.nombre}`).join(', ')}`,
    e.empeno && `empeño ${e.empeno.exitos}/${e.empeno.fallos}`,
    e.contadores.length && `contadores: ${e.contadores.join(', ')}`,
    e.secciones.length && `secciones: ${e.secciones.map((s) => s.titulo).join(', ')}`,
  ].filter(Boolean).join(' · ')
}

function FormatoGuion() {
  return (
    <Disclosure headingLevel={3} icon={<Info size={18} aria-hidden />} title="Formato de las escenas" summary="Cómo escribir las escenas para que la pantalla las entienda.">
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: font.mono, fontSize: fs.xs + 1, lineHeight: 1.55, color: c.muted }}>{FORMATO_GUION}</pre>
    </Disclosure>
  )
}

function HojaEditarEscena({ escena, onClose, onGuardada }: { escena: EscenaPropia | null; onClose: () => void; onGuardada: (id: string) => void }) {
  const { actualizar } = usePantalla()
  const [md, setMd] = useState(escena?.md ?? PLANTILLA_ESCENA)
  const e = leerEscena(md)
  const guardar = () => {
    const id = escena?.id ?? nuevoId()
    actualizar((b) => {
      const i = b.escenasPropias.findIndex((x) => x.id === id)
      if (i >= 0) b.escenasPropias[i] = { id, md: md.trim() }
      else b.escenasPropias.splice(posicionTras(b.escenasPropias, actualDeSesion(b)), 0, { id, md: md.trim() })
    })
    onGuardada(id)
    onClose()
  }
  return (
    <Sheet
      open
      onClose={onClose}
      title={escena ? `Editar «${tituloDe(escena)}»` : 'Nueva escena'}
      description="La escena es texto en Markdown: el mismo formato que importas."
      maxWidth={860}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} disabled={!md.trim()} onClick={guardar}>Guardar</Button>
        </>
      }
    >
      <div style={stack(12)}>
        <Textarea
          aria-label="Texto de la escena"
          rows={18}
          value={md}
          onChange={(ev) => setMd(ev.target.value)}
          spellCheck={false}
          data-autofocus
          style={{ fontFamily: font.mono, fontSize: fs.sm, lineHeight: 1.55 }}
        />
        <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
          <strong style={{ color: c.text }}>{e.titulo}</strong> · {ESCENA_META[e.tipo].label}{resumenEscena(e) ? ` · ${resumenEscena(e)}` : ''}
        </p>
        <FormatoGuion />
      </div>
    </Sheet>
  )
}

function HojaImportar({ onClose, onHecho }: { onClose: () => void; onHecho: (primeraId: string | null) => void }) {
  const { estado, actualizar } = usePantalla()
  const [texto, setTexto] = useState('')
  const [modo, setModo] = useState<ModoImportar>('fusionar')
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  /** Scenes of the file left out (by position): a chapter of the book can be imported scene by scene */
  const [fuera, setFuera] = useState<Set<number>>(new Set())
  const archivo = useRef<HTMLInputElement>(null)
  const leido = useMemo(() => dividirGuion(texto), [texto])
  const elegidas = useMemo(() => leido.escenas.filter((_, i) => !fuera.has(i)), [leido, fuera])
  // Dry run with placeholder ids: what the import would do
  const previa = useMemo(() => fusionarGuion(estado.escenasPropias, elegidas, modo, () => ''), [estado.escenasPropias, elegidas, modo])
  const alternar = (i: number) => setFuera((f) => {
    const g = new Set(f)
    if (g.has(i)) g.delete(i)
    else g.add(i)
    return g
  })

  const leerArchivo = async (f: File | undefined) => {
    if (!f) return
    try {
      setTexto(await f.text())
      setFuera(new Set())
      setError(null)
    } catch {
      setError('No se pudo leer el archivo.')
    }
  }

  const aplicar = () => {
    let primera: string | null = null
    actualizar((b) => {
      const r = fusionarGuion(b.escenasPropias, elegidas, modo, nuevoId, actualDeSesion(b))
      for (const q of r.quitadas) quitarEscena(b, q.id)
      b.escenasPropias = r.escenas
      if (leido.titulo) b.guionTitulo = leido.titulo
      primera = r.escenas.find((x) => leerEscena(x.md).titulo === leerEscena(elegidas[0] ?? '').titulo)?.id ?? null
    })
    onHecho(primera)
    onClose()
  }

  const hay = elegidas.length > 0
  return (
    <Sheet
      open
      onClose={onClose}
      title="Importar a la sesión"
      description="Pega el Markdown que te ha dado la IA o elige el archivo .md. Las escenas con el mismo título conservan lo que ya marcaste."
      maxWidth={860}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button
            size="lg"
            style={{ flex: 2 }}
            disabled={!hay}
            onClick={() => (modo === 'reemplazar' && previa.quitadas.length > 0 ? setConfirmando(true) : aplicar())}
          >
            Importar {hay ? `${elegidas.length} escena${elegidas.length === 1 ? '' : 's'}` : ''}
          </Button>
        </>
      }
    >
      <div style={stack(12)}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button size="sm" variant="secondary" icon={<FileUp size={15} aria-hidden />} onClick={() => archivo.current?.click()}>Elegir archivo .md</Button>
          <input
            ref={archivo}
            type="file"
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            hidden
            onChange={(ev) => { void leerArchivo(ev.target.files?.[0]); ev.target.value = '' }}
          />
          <Segmented<ModoImportar>
            ariaLabel="Cómo importar"
            size="sm"
            value={modo}
            onChange={setModo}
            options={[
              { value: 'fusionar', label: 'Añadir y actualizar' },
              { value: 'reemplazar', label: 'Reemplazar la sesión' },
            ]}
          />
        </div>
        {error && <p role="alert" style={{ fontSize: fs.sm, color: tone.rubi.fg }}>{error}</p>}
        <Textarea
          aria-label="Markdown de la sesión"
          rows={14}
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          spellCheck={false}
          placeholder={'---\nguion: Tras la batalla del salón\n---\n# Capítulo 3 · La ciudad quemada\n## Repercusiones\ntipo: social\n\n> Lo que lees en voz alta…'}
          style={{ fontFamily: font.mono, fontSize: fs.sm, lineHeight: 1.55 }}
        />
        {leido.escenas.length > 0 && (
          <div role="status" style={{ ...fila(tone.zafiro), ...stack(6) }}>
            <p style={{ fontWeight: 650, color: c.text }}>
              {leido.titulo ? `«${leido.titulo}» · ` : ''}{elegidas.length} de {leido.escenas.length} escena{leido.escenas.length === 1 ? '' : 's'}:{' '}
              {previa.nuevas} nueva{previa.nuevas === 1 ? '' : 's'}, {previa.actualizadas} actualizada{previa.actualizadas === 1 ? '' : 's'}
              {modo === 'reemplazar' && previa.quitadas.length > 0 ? `, ${previa.quitadas.length} se quitan` : ''}
            </p>
            <p style={{ fontSize: fs.xs, color: c.subtle }}>
              Desmarca las que no quieras. Las nuevas entran tras la escena actual de la sesión (o al final si no hay ninguna).
            </p>
            <ul style={{ ...listReset, ...stack(4), maxHeight: 260, overflowY: 'auto' }}>
              {leido.escenas.map((md, i) => {
                const e = leerEscena(md)
                return (
                  <li key={i}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 32, fontSize: fs.sm, color: c.text, cursor: 'pointer' }}>
                      <input type="checkbox" checked={!fuera.has(i)} onChange={() => alternar(i)} style={{ width: 18, height: 18, accentColor: 'var(--brand)' }} />
                      <span>{e.grupo ? <span style={{ color: c.subtle }}>{e.grupo} · </span> : null}{e.titulo}</span>
                    </label>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
        <FormatoGuion />
      </div>
      <ConfirmDialog
        open={confirmando}
        title="¿Reemplazar la sesión?"
        message={`Se quitan ${previa.quitadas.length} escena${previa.quitadas.length === 1 ? '' : 's'} que no están en el archivo (${previa.quitadas.map(tituloDe).join(', ')}), con lo que tuvieran marcado.`}
        confirmLabel="Reemplazar"
        onConfirm={() => { setConfirmando(false); aplicar() }}
        onCancel={() => setConfirmando(false)}
      />
    </Sheet>
  )
}

// ── Adding scenes during the game ────────────────────────────────────────────

/** The current scene of the session (where added scenes go after), or null */
const actualDeSesion = (b: PantallaEstado) => (b.escenaActual?.origen === 'propia' ? b.escenaActual.escenaId : null)

/**
 * «Añadir a la sesión» on a scene or combat of the book: a copy of it goes into the session after the current scene. The book stays
 * as it is (a static reference); the copy can be edited and is played from the session.
 */
export function BotonAnadirASesion({ md, compacto = false }: { md: string; compacto?: boolean }) {
  const { estado, actualizar } = usePantalla()
  const [aviso, setAviso] = useState<string | null>(null)
  const yaEsta = yaEnSesion(estado.escenasPropias, md)
  const anadir = () => {
    const tras = actualDeSesion(estado)
    const titulo = tras ? tituloDe(estado.escenasPropias.find((e) => e.id === tras) ?? { id: '', md: '' }) : null
    actualizar((b) => {
      b.escenasPropias.splice(posicionTras(b.escenasPropias, actualDeSesion(b)), 0, { id: nuevoId(), md })
    })
    setAviso(titulo ? `Añadida a la sesión tras «${titulo}».` : 'Añadida al final de la sesión.')
  }
  if (compacto) {
    // In the fixed row of the index: a short label (only the icon on a phone); where it went is told by the tooltip and the status
    const etiqueta = yaEsta ? 'Ya está en la sesión' : 'Añadir a la sesión'
    return (
      <>
        <Button
          size="sm"
          variant={yaEsta ? 'ghost' : 'gold'}
          icon={yaEsta ? <Check size={15} aria-hidden /> : <ListPlus size={15} aria-hidden />}
          disabled={yaEsta}
          onClick={anadir}
          aria-label={etiqueta}
          title={aviso ?? etiqueta}
          style={{ flexShrink: 0 }}
        >
          <span className="hide-mobile">{yaEsta ? 'En la sesión' : 'A la sesión'}</span>
        </Button>
        <span role="status" className="sr-only">{aviso}</span>
      </>
    )
  }
  return (
    <>
      <Button size="sm" variant="secondary" icon={yaEsta ? <Check size={15} aria-hidden /> : <ListPlus size={15} aria-hidden />} disabled={yaEsta} onClick={anadir}>
        {yaEsta ? 'En la sesión' : 'Añadir a la sesión'}
      </Button>
      <span role="status" className={aviso ? undefined : 'sr-only'} style={{ fontSize: fs.xs, color: c.muted }}>{aviso}</span>
    </>
  )
}

/**
 * A scene created on the spot: title, type, what to read aloud and what happens. It goes after the current scene. During a
 * session it becomes the current one (the log notes it); with none open it is only prepared for the next one (no session is
 * opened). It can be completed later in Markdown.
 */
function HojaEscenaRapida({ onClose, onCreada, onMarkdown }: { onClose: () => void; onCreada: (id: string) => void; onMarkdown: () => void }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState<EscenaGuion['tipo']>('narrative')
  const [leer, setLeer] = useState('')
  const [texto, setTexto] = useState('')
  const tras = actualDeSesion(estado)
  const enJuego = !!estado.sesion
  // A new scene takes the group of the one it follows
  const grupo = tras ? leerEscena(estado.escenasPropias.find((e) => e.id === tras)?.md ?? '').grupo : ''
  const crear = () => {
    const id = nuevoId()
    const md = mdEscenaRapida({ titulo, tipo, grupo, leer, texto })
    actualizar((b) => {
      b.escenasPropias.splice(posicionTras(b.escenasPropias, actualDeSesion(b)), 0, { id, md })
      if (!b.sesion) return
      b.escenaActual = { origen: 'propia', capituloId: null, escenaId: id }
      anotar(b, { tipo: 'escena', etiqueta: 'Escena', texto: `${titulo.trim()} (añadida en la mesa)` }, ultimoDiario)
    })
    onCreada(id)
    onClose()
  }
  const descripcion = enJuego
    ? `${tras ? 'Entra tras la escena actual' : 'Entra al final de la sesión'} y pasa a ser la actual.`
    : `${tras ? 'Entra tras la escena actual' : 'Entra al final'}, preparada para la próxima sesión.`
  return (
    <Sheet
      open
      onClose={onClose}
      title="Nueva escena"
      description={descripcion}
      maxWidth={680}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} disabled={!titulo.trim()} onClick={crear}>{enJuego ? 'Crear y jugar' : 'Crear'}</Button>
        </>
      }
    >
      <div style={stack(14)}>
        <Field label="Título">
          <Input value={titulo} onChange={(ev) => setTitulo(ev.target.value)} placeholder="Una emboscada en el puerto" data-autofocus />
        </Field>
        <div>
          <span style={{ ...eyebrow, display: 'block', marginBottom: 8 }}>Tipo</span>
          <Segmented<EscenaGuion['tipo']>
            ariaLabel="Tipo de escena"
            size="sm"
            value={tipo}
            onChange={setTipo}
            options={(['narrative', 'social', 'exploration', 'combat', 'choice'] as const).map((t) => ({ value: t, label: ESCENA_META[t].label }))}
          />
        </div>
        <Field label="Leer en voz alta (opcional)" hint="Separa los párrafos con una línea en blanco.">
          <Textarea rows={4} value={leer} onChange={(ev) => setLeer(ev.target.value)} />
        </Field>
        <Field label="Qué pasa">
          <Textarea rows={5} value={texto} onChange={(ev) => setTexto(ev.target.value)} placeholder="Notas para dirigirla: quién aparece, qué quieren, qué pruebas pedir…" />
        </Field>
        <Button variant="ghost" size="sm" icon={<Pencil size={15} aria-hidden />} onClick={onMarkdown} style={{ alignSelf: 'flex-start' }}>
          Escribirla completa en Markdown
        </Button>
      </div>
    </Sheet>
  )
}
