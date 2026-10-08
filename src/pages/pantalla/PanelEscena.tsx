import { useState, type CSSProperties } from 'react'
import { BookOpen, Check, Clock, Heart, Info, MapPin, Pin, ScrollText, Shield, Star, Swords, UserPlus, Users, Zap, type LucideIcon } from 'lucide-react'
import { CHAPTERS, type AdventureChapter, type Combat, type Npc, type NpcRole, type Scene } from '../../data/caminapiedras'
import { RollTable } from '../gm/CaminapiedrasPage'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { Button, Disclosure, Segmented, Select } from '../../components/ui'
import { c, eyebrow, font, fs, pill, radius, shadow, tone, type Tone } from '../../theme'
import type { GlobalNpc } from '../../types'
import { guardarPreferencia, leerPreferencia, useCatalogo, usePaneles, usePantalla } from './contexto'
import { MAX_ENCUENTROS, encuentroEnPantalla } from './estado'
import { buscarAdversario, cantidadDe, eraNumero } from './adversarios'
import { abrirEncuentro, anadirAdversario, anadirEnemigos, asegurarEncuentro, destinoAnadir } from './encuentro'
import { Apartado, CabeceraEscena, Galeria, LeerEnVozAlta, NavegadorEscenas, Parrafos, Tesela } from './piezas'
import { BotonAnadirASesion, PanelGuion } from './PanelGuion'
import { mdDesdeCombateLibro, mdDesdeEscenaLibro } from './guion'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }
const tarjeta: CSSProperties = { padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }

type Vista = 'escenas' | 'pnj' | 'combates' | 'mapas' | 'resumen'
const VISTAS: Vista[] = ['escenas', 'pnj', 'combates', 'mapas', 'resumen']

/** What the panel shows, remembered on the device (it is not part of the shared document) */
interface PrefEscena {
  fuente: 'aventura' | 'propias'
  capituloId: string
  vista: Vista
  escenaId: string | null
  propiaId: string | null
  escala: number
}

const esPref = (v: unknown): v is PrefEscena =>
  typeof v === 'object' && v !== null && 'fuente' in v && 'capituloId' in v && 'vista' in v && VISTAS.includes((v as PrefEscena).vista) &&
  Number.isFinite((v as PrefEscena).escala)

const NPC_ROL: Record<NpcRole, { label: string; tone: Tone; icon: LucideIcon }> = {
  special: { label: 'Especial', tone: tone.topacio, icon: Star },
  ally: { label: 'Aliado', tone: tone.esmeralda, icon: Heart },
  villain: { label: 'Antagonista', tone: tone.rubi, icon: Shield },
  neutral: { label: 'Neutral', tone: tone.cuarzo, icon: Users },
}

const PROGRESION: Record<'key' | 'spren' | 'info', { label: string; tone: Tone }> = {
  key: { label: 'Clave', tone: tone.topacio },
  spren: { label: 'Spren', tone: tone.amatista },
  info: { label: 'Información', tone: tone.cuarzo },
}

// ── Panel ────────────────────────────────────────────────────────────────────

export function PanelEscena() {
  const { cId, estado } = usePantalla()
  const cfg = useWorldConfig()
  const conAventura = cfg.features.pestanaAventura && CHAPTERS.length > 0
  const clave = `cosmere-pantalla-escena-${cId}`

  const [pref, setPrefEstado] = useState<PrefEscena>(() => {
    const ref = estado.escenaActual
    const porDefecto: PrefEscena = {
      // The script when it is where the story is, or when there is one and the story is not in the book
      fuente: !conAventura || ref?.origen === 'propia' || (!ref && estado.escenasPropias.length > 0) ? 'propias' : 'aventura',
      capituloId: ref?.capituloId ?? CHAPTERS[0]?.id ?? '',
      vista: 'escenas',
      escenaId: ref?.origen === 'aventura' ? ref.escenaId : null,
      propiaId: ref?.origen === 'propia' ? ref.escenaId : null,
      escala: 1,
    }
    return leerPreferencia(clave, porDefecto, esPref)
  })
  const setPref = (p: Partial<PrefEscena>) => {
    const siguiente = { ...pref, ...p }
    setPrefEstado(siguiente)
    guardarPreferencia(clave, siguiente)
  }

  const fuente = conAventura ? pref.fuente : 'propias'
  const ref = estado.escenaActual
  const viendoActual =
    !ref ||
    (ref.origen === 'aventura'
      ? fuente === 'aventura' && pref.capituloId === ref.capituloId && pref.vista === 'escenas' &&
        // With nothing picked yet the chapter shows its first scene
        (pref.escenaId ?? CHAPTERS.find((ch) => ch.id === pref.capituloId)?.scenes[0]?.id) === ref.escenaId
      : fuente === 'propias' && (pref.propiaId ?? estado.escenasPropias[0]?.id) === ref.escenaId)
  const irAActual = () => {
    if (!ref) return
    if (ref.origen === 'aventura') setPref({ fuente: 'aventura', capituloId: ref.capituloId ?? pref.capituloId, escenaId: ref.escenaId, vista: 'escenas' })
    else setPref({ fuente: 'propias', propiaId: ref.escenaId })
  }

  return (
    <div style={stack(16)}>
      {conAventura && (
        <Segmented<'aventura' | 'propias'>
          ariaLabel="Fuente de las escenas"
          value={fuente}
          onChange={(v) => setPref({ fuente: v })}
          options={[
            { value: 'aventura', label: <><BookOpen size={15} aria-hidden />Libro</> },
            { value: 'propias', label: <><ScrollText size={15} aria-hidden />Sesión</> },
          ]}
        />
      )}
      {!viendoActual && (
        <Button variant="gold" size="sm" icon={<Pin size={14} aria-hidden />} onClick={irAActual} style={{ alignSelf: 'flex-start' }}>
          Ir a la escena actual
        </Button>
      )}
      {fuente === 'aventura' ? (
        <GuiaAventura pref={pref} setPref={setPref} />
      ) : (
        <PanelGuion seleccion={pref.propiaId} onElegir={(id) => setPref({ propiaId: id })} escala={pref.escala} onEscala={(v) => setPref({ escala: v })} />
      )}
    </div>
  )
}

// ── Book adventure ───────────────────────────────────────────────────────────

function GuiaAventura({ pref, setPref }: { pref: PrefEscena; setPref: (p: Partial<PrefEscena>) => void }) {
  const cap =CHAPTERS.find((ch) => ch.id === pref.capituloId) ?? CHAPTERS[0]
  const escena = cap.scenes.find((s) => s.id === pref.escenaId) ?? cap.scenes[0]

  return (
    <div style={stack(14)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Select
          aria-label="Capítulo"
          value={cap.id}
          onChange={(e) => setPref({ capituloId: e.target.value, escenaId: null })}
          style={{ flex: '1 1 240px', minWidth: 0, fontWeight: 650 }}
        >
          {CHAPTERS.map((ch) => (
            <option key={ch.id} value={ch.id}>Capítulo {ch.number} · {ch.title}</option>
          ))}
        </Select>
        <span style={pill(tone.gold)}>Nv. {cap.levelFrom}–{cap.levelTo}</span>
      </div>

      <Segmented<Vista>
        ariaLabel="Sección del capítulo"
        size="sm"
        value={pref.vista}
        onChange={(v) => setPref({ vista: v })}
        options={[
          { value: 'escenas', label: 'Escenas' },
          { value: 'pnj', label: 'PNJ' },
          { value: 'combates', label: 'Combates' },
          { value: 'mapas', label: 'Mapas' },
          { value: 'resumen', label: 'Resumen' },
        ]}
      />

      {pref.vista === 'escenas' && escena && (
        <>
          <NavegadorEscenas
            titulo={`Capítulo ${cap.number} · ${cap.title}`}
            ancla="escena-aventura"
            progreso={false}
            escenas={cap.scenes.map((s) => ({ id: s.id, titulo: s.title, tipo: s.type, grupo: s.section ?? '', jugada: false, actual: false }))}
            seleccion={escena.id}
            onElegir={(id) => setPref({ escenaId: id })}
          />
          <DetalleEscenaAventura cap={cap} escena={escena} escala={pref.escala} onEscala={(v) => setPref({ escala: v })} />
        </>
      )}
      {pref.vista === 'pnj' && <PnjCapitulo cap={cap} />}
      {pref.vista === 'combates' && <CombatesCapitulo cap={cap} />}
      {pref.vista === 'mapas' && <MapasCapitulo cap={cap} />}
      {pref.vista === 'resumen' && <ResumenCapitulo cap={cap} escala={pref.escala} />}
    </div>
  )
}

/** A scene of the book: to read and consult; «Añadir a la sesión» copies it into the session, where it is played */
function DetalleEscenaAventura({ cap, escena, escala, onEscala }: { cap: AdventureChapter; escena: Scene; escala: number; onEscala: (v: number) => void }) {

  return (
    <article id="escena-aventura" style={{ ...tarjeta, ...stack(18), padding: 18, scrollMarginTop: 76 }}>
      <CabeceraEscena
        titulo={escena.title}
        tipo={escena.type}
        kicker={`Capítulo ${cap.number}${escena.section && escena.section !== escena.title ? ` · ${escena.section}` : ''}`}
        escala={escala}
        onEscala={onEscala}
        acciones={<BotonAnadirASesion md={mdDesdeEscenaLibro(cap, escena)} />}
      />
      {escena.readAloud && <LeerEnVozAlta texto={escena.readAloud} escala={escala} />}
      {escena.content.length > 0 && <Parrafos textos={escena.content} escala={escala} />}
      {escena.branches && escena.branches.length > 0 && (
        <Apartado titulo="Caminos posibles" color={tone.topacio.fg}>
          <ul style={{ ...listReset, ...stack(8) }}>
            {escena.branches.map((br, i) => (
              <li key={i} style={{ padding: '10px 12px', borderRadius: radius.md, background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}` }}>
                <p style={{ fontWeight: 650, color: tone.topacio.fg, marginBottom: 3 }}>{br.label}</p>
                <p style={{ fontSize: fs.sm + 1, color: c.text, lineHeight: 1.5 }}>{br.description}</p>
              </li>
            ))}
          </ul>
        </Apartado>
      )}
      {escena.tips && escena.tips.length > 0 && (
        <Apartado titulo="Notas para la DJ" icono={<Info size={13} aria-hidden />}>
          <ul style={{ ...listReset, ...stack(6) }}>
            {escena.tips.map((t, i) => (
              <li key={i} style={{ fontSize: fs.sm + 1, color: c.text, lineHeight: 1.5, paddingLeft: 10, borderLeft: '2px solid var(--gold-border)' }}>{t}</li>
            ))}
          </ul>
        </Apartado>
      )}
      {escena.tables?.map((t, i) => <RollTable key={i} table={t} t={tone.gold} />)}
    </article>
  )
}

function PnjCapitulo({ cap }: { cap: AdventureChapter }) {
  const { catalogo } = useCatalogo()
  if (cap.npcs.length === 0) return <p style={{ color: c.muted }}>Este capítulo no tiene PNJ descritos.</p>
  return (
    <ul style={{ ...listReset, ...stack(8) }}>
      {(['special', 'ally', 'villain', 'neutral'] as NpcRole[]).flatMap((rol) =>
        cap.npcs.filter((n) => n.role === rol).map((n) => (
          <li key={n.name}>
            <TarjetaPnj npc={n} adversario={buscarAdversario(n.name, catalogo)} />
          </li>
        )))}
    </ul>
  )
}

function TarjetaPnj({ npc, adversario }: { npc: Npc; adversario: GlobalNpc | null }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const { irA } = usePaneles()
  const cfg = useWorldConfig()
  const era = eraNumero(useEra())
  const rol = NPC_ROL[npc.role]
  const Icon = rol.icon
  const dato: CSSProperties = { padding: '10px 12px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }
  return (
    <Disclosure
      headingLevel={3}
      accent={rol.tone.fg}
      icon={<Tesela t={rol.tone}><Icon size={17} /></Tesela>}
      title={<>{npc.name} <span style={{ fontFamily: font.ui, fontSize: fs.xs, fontWeight: 500, color: c.subtle }}>{npc.pronouns}</span></>}
      summary={<span style={{ display: 'block' }}>{npc.goal}</span>}
    >
      <div style={stack(10)}>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={pill(rol.tone)}>{rol.label}</span>
          <span style={pill(tone.cuarzo)}>{npc.type}</span>
          {npc.traits.map((t) => <span key={t} style={{ ...pill(tone.cuarzo), background: c.s2, color: c.muted }}>{t}</span>)}
        </span>
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
          <div style={dato}><dt style={{ ...eyebrow, marginBottom: 4 }}>Aspecto</dt><dd style={{ fontSize: fs.sm + 1, lineHeight: 1.5 }}>{npc.appearance}</dd></div>
          {npc.notes && <div style={{ ...dato, background: tone.gold.bg, border: `1px solid ${tone.gold.border}` }}><dt style={{ ...eyebrow, color: tone.gold.fg, marginBottom: 4 }}>Notas DJ</dt><dd style={{ fontSize: fs.sm + 1, lineHeight: 1.5 }}>{npc.notes}</dd></div>}
        </dl>
        {adversario && (
          <Button
            size="sm"
            variant="secondary"
            icon={<UserPlus size={15} aria-hidden />}
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              actualizar((b) => anadirAdversario(asegurarEncuentro(b, 'Encuentro', ultimoDiario), adversario, 1, cfg.habilidades, era, npc.name))
              irA('encuentro')
            }}
          >
            Añadir {destinoAnadir(estado)} ({adversario.name})
          </Button>
        )}
      </div>
    </Disclosure>
  )
}

function CombatesCapitulo({ cap }: { cap: AdventureChapter }) {
  if (cap.combats.length === 0) return <p style={{ color: c.muted }}>Este capítulo no tiene combates.</p>
  return (
    <ul style={{ ...listReset, ...stack(10) }}>
      {cap.combats.map((cb) => <li key={cb.id}><TarjetaCombate cap={cap} combate={cb} /></li>)}
    </ul>
  )
}

function TarjetaCombate({ cap, combate }: { cap: AdventureChapter; combate: Combat }) {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const { irA } = usePaneles()
  const cfg = useWorldConfig()
  const { catalogo, catalogoListo, catalogoFallo } = useCatalogo()
  const era = eraNumero(useEra())
  const hayEncuentro = encuentroEnPantalla(estado) !== null

  /** To the encounter on screen or, `simultaneo`, as a new fight at the same time as the open ones */
  const preparar = (simultaneo: boolean) => {
    actualizar((b) => {
      const enc = simultaneo ? abrirEncuentro(b, combate.title, ultimoDiario) : asegurarEncuentro(b, combate.title, ultimoDiario)
      anadirEnemigos(enc, combate.enemies.map((e) => ({ nombre: e.name, cantidad: cantidadDe(e.count), nota: e.bonus })), catalogo, cfg.habilidades, era)
    })
    irA('encuentro')
  }

  return (
    <article style={{ ...tarjeta, ...stack(12), boxShadow: `inset 3px 0 0 ${tone.rubi.fg}, ${shadow[1]}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Tesela t={tone.rubi}><Swords size={17} /></Tesela>
        <h3 style={{ flex: 1, fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, lineHeight: 1.25, color: c.text }}>{combate.title}</h3>
      </div>
      <ul aria-label="Enemigos" style={{ ...listReset, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {combate.enemies.map((e, i) => {
          const ficha = buscarAdversario(e.name, catalogo)
          return (
            <li key={i} style={{ ...pill(ficha ? tone.rubi : tone.cuarzo), whiteSpace: 'normal', borderRadius: radius.sm }} title={ficha ? `Ficha: ${ficha.name}` : 'Sin ficha en el catálogo'}>
              {e.count} {e.name}{e.bonus ? ` · ${e.bonus}` : ''}
            </li>
          )
        })}
      </ul>
      {combate.duration && (
        <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted }}>
          <Clock size={14} aria-hidden /> {combate.duration}
        </p>
      )}
      {combate.specialRules.length > 0 && (
        <Apartado titulo="Reglas especiales" color={tone.rubi.fg}>
          <ul style={{ ...listReset, ...stack(6) }}>
            {combate.specialRules.map((r, i) => (
              <li key={i} style={{ fontSize: fs.sm + 1, lineHeight: 1.5, paddingLeft: 10, borderLeft: `2px solid ${tone.rubi.border}` }}>{r}</li>
            ))}
          </ul>
        </Apartado>
      )}
      {combate.rewards && (
        <p style={{ padding: '10px 12px', borderRadius: radius.md, background: tone.esmeralda.bg, border: `1px solid ${tone.esmeralda.border}`, fontSize: fs.sm + 1, lineHeight: 1.5 }}>
          <strong style={{ color: tone.esmeralda.fg }}>Recompensas: </strong>{combate.rewards}
        </p>
      )}
      {combate.tables?.map((t, i) => <RollTable key={i} table={t} t={tone.rubi} />)}
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
        <BotonAnadirASesion md={mdDesdeCombateLibro(cap, combate)} />
      </div>
    </article>
  )
}

function MapasCapitulo({ cap }: { cap: AdventureChapter }) {
  if (cap.maps.length === 0) return <p style={{ color: c.muted }}>Este capítulo no tiene mapas.</p>
  return (
    <ul style={{ ...listReset, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
      {cap.maps.map((m) => (
        <li key={m.id} style={{ ...tarjeta, ...stack(10) }}>
          <h3 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text }}>Mapa {m.id}: {m.title}</h3>
          <p style={{ fontSize: fs.xs, color: c.subtle }}>{m.scale}{m.pdfPage ? ` · pág. ${m.pdfPage}` : ''}</p>
          {m.imagePath && <Galeria imagenes={[{ url: m.imagePath, titulo: `Mapa ${m.id}: ${m.title}` }]} />}
          <ul style={{ ...listReset, ...stack(4) }}>
            {m.locations.map((l, i) => (
              <li key={i} style={{ display: 'flex', gap: 6, fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>
                <MapPin size={14} aria-hidden style={{ color: tone.zafiro.fg, flexShrink: 0, marginTop: 3 }} />
                {l}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}

function ResumenCapitulo({ cap, escala }: { cap: AdventureChapter; escala: number }) {
  const punto = { fontSize: fs.sm + 1, lineHeight: 1.5, color: c.text, paddingLeft: 10, borderLeft: '2px solid var(--gold-border)' }
  return (
    <div style={stack(18)}>
      <p style={{ fontFamily: font.display, fontSize: Math.round(18 * escala), lineHeight: 1.55, color: c.text, padding: '14px 16px', borderRadius: radius.lg, background: tone.gold.bg, border: `1px solid ${tone.gold.border}` }}>
        {cap.summary}
      </p>
      <Apartado titulo="Trasfondo del capítulo">
        <p style={{ fontFamily: font.display, fontSize: Math.round(17 * escala), lineHeight: 1.6, color: c.text }}>{cap.background}</p>
      </Apartado>
      <Apartado titulo="Lista de verificación DJ" icono={<Check size={13} aria-hidden />}>
        <ul style={{ ...listReset, ...stack(6) }}>
          {cap.prepChecklist.map((t, i) => <li key={i} style={punto}>{t}</li>)}
        </ul>
      </Apartado>
      <Apartado titulo="Progresión de personajes" icono={<Zap size={13} aria-hidden />}>
        <ul style={{ ...listReset, ...stack(6) }}>
          {cap.progressionItems.map((p, i) => {
            const meta = PROGRESION[p.type]
            return (
              <li key={i} style={{ ...punto, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ flex: 1 }}>{p.text}</span>
                <span style={pill(meta.tone)}>{meta.label}</span>
              </li>
            )
          })}
        </ul>
      </Apartado>
      <p style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.sm, color: c.muted }}>
        <BookOpen size={15} aria-hidden style={{ color: tone.gold.fg }} />
        Páginas del libro: {cap.pdfPages.from}–{cap.pdfPages.to}
      </p>
    </div>
  )
}
