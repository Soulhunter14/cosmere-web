import { useCallback, useMemo, useState, useSyncExternalStore, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, Eye, EyeOff, ListChecks, Signpost, Trash2, X } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useWorldConfig } from '../../store/campaignStore'
import { ConfirmDialog, Disclosure, IconButton, Switch } from '../../components/ui'
import { c, eyebrow, font, fs, pill, radius, shadow, tone, type Tone } from '../../theme'
import { foldText as normalizar } from '../../lib/catalogo'
import type { Character } from '../../types'
import { guardarPreferencia, leerPreferencia, usePantalla } from './contexto'
import { ahoraIso, anotar, claveDecision, type Efecto, type ResultadoPrueba } from './estado'
import { acortar, leerDecision, pruebaDeOpcion, type Bloque, type OpcionDecision, type Seccion } from './guion'
import { EFECTOS_HOJA, EFECTOS_SECRETOS, ETIQUETA_EFECTO, quienesDeciden, registroDecisiones, resumenHoja, type Quien, type RegistroPersonaje, type Suma } from './decisiones'
import { Apartado, Conmutador, EnLinea, LeerEnVozAlta } from './piezas'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }

// ── Secret marks shown or hidden (per device: the tablet may face the players) ──

const CLAVE_MARCAS = 'cosmere-pantalla-marcas'
let verMarcas = leerPreferencia(CLAVE_MARCAS, false, (v): v is boolean => typeof v === 'boolean')
const oyentesMarcas = new Set<() => void>()
const suscribirMarcas = (cb: () => void) => {
  oyentesMarcas.add(cb)
  return () => { oyentesMarcas.delete(cb) }
}

/** Whether paths and metals are shown, the same in the scene and in the record (one switch for both) */
function useVerMarcas(): [boolean, (v: boolean) => void] {
  const v = useSyncExternalStore(suscribirMarcas, () => verMarcas)
  const poner = useCallback((x: boolean) => {
    verMarcas = x
    guardarPreferencia(CLAVE_MARCAS, x)
    oyentesMarcas.forEach((o) => o())
  }, [])
  return [v, poner]
}

const TONO_EFECTO: Record<Efecto['clave'], Tone> = {
  atributo: tone.gold, habilidad: tone.zafiro, pericia: tone.esmeralda, meta: tone.heliodoro, objeto: tone.cuarzo,
  camino: tone.amatista, metal: tone.amatista, eco: tone.cuarzo,
}

/** What an option gives: the sheet's effects always, the secret ones only when shown; the echo as a note for the director */
function Efectos({ efectos, marcas }: { efectos: Efecto[]; marcas: boolean }) {
  const visibles = efectos.filter((x) => EFECTOS_HOJA.includes(x.clave) || (marcas && EFECTOS_SECRETOS.includes(x.clave)))
  const ecos = efectos.filter((x) => x.clave === 'eco')
  if (visibles.length === 0 && ecos.length === 0) return null
  return (
    <span style={{ ...stack(6), marginTop: 6 }}>
      {visibles.length > 0 && (
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {visibles.map((x, i) => (
            <span key={i} style={{ ...pill(TONO_EFECTO[x.clave]), borderRadius: radius.sm, whiteSpace: 'normal', textAlign: 'left' }}>
              {x.clave === 'atributo' || x.clave === 'habilidad' ? x.valor : `${ETIQUETA_EFECTO[x.clave]}: ${x.valor}`}
            </span>
          ))}
        </span>
      )}
      {ecos.map((x, i) => (
        <span key={`eco-${i}`} style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.45 }}>
          <strong style={{ color: c.muted }}>Eco:</strong> <EnLinea texto={x.valor} />
        </span>
      ))}
    </span>
  )
}

/** Paragraphs and read-aloud boxes of a decision that are not its metadata */
function Notas({ bloques, escala }: { bloques: Bloque[]; escala: number }) {
  if (bloques.length === 0) return null
  return (
    <div style={stack(10)}>
      {bloques.map((b, i) =>
        b.tipo === 'cita' ? <LeerEnVozAlta key={i} texto={b.texto} escala={escala} />
          : b.tipo === 'parrafo' ? <p key={i} style={{ fontSize: Math.round(15 * escala), lineHeight: 1.55, color: c.text }}><EnLinea texto={b.texto} /></p>
            : null)}
    </div>
  )
}

// ── A decision of a scene ────────────────────────────────────────────────────

/**
 * A `### Decisión: …` section of a scene: the question and its options. In the session the director taps what each character picked
 * (the whole option with one character deciding, a name per option with several) and, if the decision has a test, how it went.
 * It all goes to the log and to `decisiones`, which outlives the scene. In the book it is only read.
 */
export function DecisionGuion({
  seccion, grupo, titulo, decide, escala, soloLectura = false,
}: {
  seccion: Seccion
  /** Group and title of the scene: they identify the decision (like the import does) */
  grupo: string
  titulo: string
  /** `decide:` of the scene; the section's own line wins */
  decide: string
  escala: number
  soloLectura?: boolean
}) {
  const { cId, estado, actualizar, ultimoDiario } = usePantalla()
  const { data: personajes = [] } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId), enabled: !soloLectura })
  const [marcas, setMarcas] = useVerMarcas()
  const d = leerDecision(seccion, decide)
  const { quienes, sinCoincidencia } = quienesDeciden(d.decide, personajes)
  const varios = quienes.length > 1
  const clave = (q: Quien) => claveDecision(grupo, titulo, d.pregunta, q.characterId)
  const eleccionDe = (q: Quien) => (soloLectura ? undefined : estado.decisiones[clave(q)])
  const eligio = (q: Quien, op: OpcionDecision) => normalizar(eleccionDe(q)?.opcion ?? '') === normalizar(op.texto)

  const elegir = (q: Quien, op: OpcionDecision) =>
    actualizar((b) => {
      const k = clave(q)
      if (normalizar(b.decisiones[k]?.opcion ?? '') === normalizar(op.texto)) {
        delete b.decisiones[k]
        return
      }
      b.decisiones[k] = {
        escena: titulo, grupo, pregunta: d.pregunta, characterId: q.characterId, personaje: q.nombre, opcion: op.texto, efectos: op.efectos,
        prueba: pruebaDeOpcion(d, op), resultado: null, exito: d.exito, en: ahoraIso(),
      }
      const hoja = resumenHoja(op.efectos)
      anotar(b, { tipo: 'avance', etiqueta: 'Decisión', texto: `${q.nombre}, ${d.pregunta}: ${acortar(op.texto)}${hoja ? ` (${hoja})` : ''}` }, ultimoDiario)
    })

  const marcarPrueba = (q: Quien, r: ResultadoPrueba) =>
    actualizar((b) => {
      const el = b.decisiones[clave(q)]
      if (!el) return
      if (el.resultado === r) {
        el.resultado = null
        return
      }
      el.resultado = r
      const premio = r === 'exito' && el.exito ? ` (${el.exito})` : ''
      anotar(b, { tipo: 'avance', etiqueta: 'Prueba', texto: `${q.nombre}: ${el.prueba} ${r === 'exito' ? 'superada' : 'fallada'} en «${titulo}»${premio}` }, ultimoDiario)
    })

  const conPrueba = soloLectura ? [] : quienes.filter((q) => eleccionDe(q)?.prueba)

  return (
    <Apartado titulo="Decisión" icono={<Signpost size={13} aria-hidden />} color={tone.topacio.fg}>
      <div style={{ ...stack(12), padding: 14, borderRadius: radius.lg, background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <p style={{ flex: 1, fontFamily: font.display, fontSize: Math.round(19 * escala), fontWeight: 600, lineHeight: 1.3, color: c.text }}>{d.pregunta}</p>
          <IconButton
            label={marcas ? 'Ocultar caminos y metales' : 'Mostrar caminos y metales'}
            variant="surface"
            size={34}
            onClick={() => setMarcas(!marcas)}
          >
            {marcas ? <EyeOff size={15} aria-hidden /> : <Eye size={15} aria-hidden />}
          </IconButton>
        </div>
        <Notas bloques={d.notas} escala={escala} />
        {!soloLectura && (
          <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
            Decide{varios ? 'n' : ''}: <strong style={{ color: c.text }}>{quienes.map((q) => q.nombre).join(', ')}</strong>
            {sinCoincidencia && ` · ningún personaje tiene el legado o el nombre «${d.decide}»: se guarda sin personaje.`}
            {d.prueba && ` · después, prueba de ${d.prueba.habilidad || 'la habilidad elegida'} CD ${d.prueba.cd}`}
          </p>
        )}

        <ul style={{ ...listReset, ...stack(8) }}>
          {d.opciones.map((op, i) => {
            const quienEligio = quienes.filter((q) => eligio(q, op))
            const activa = quienEligio.length > 0
            const borde = activa ? tone.esmeralda : tone.topacio
            const contenido = (
              <span style={{ display: 'flex', gap: 10, alignItems: 'flex-start', textAlign: 'left', width: '100%' }}>
                <span
                  aria-hidden
                  style={{
                    width: 26, height: 26, flexShrink: 0, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${borde.fg}`, background: activa ? tone.esmeralda.fg : 'transparent', color: activa ? c.bg : borde.fg,
                    fontSize: fs.xs, fontWeight: 700,
                  }}
                >
                  {activa ? <Check size={15} /> : i + 1}
                </span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: Math.round(15 * escala), lineHeight: 1.5, color: c.text, fontWeight: activa ? 650 : 400 }}>
                    <EnLinea texto={op.texto} />
                  </span>
                  <Efectos efectos={op.efectos} marcas={marcas} />
                </span>
              </span>
            )
            const caja: CSSProperties = {
              padding: '10px 12px', borderRadius: radius.md, background: activa ? tone.esmeralda.bg : c.s1,
              border: `1px solid ${activa ? tone.esmeralda.border : c.border}`, boxShadow: activa ? shadow[1] : 'none',
            }
            if (soloLectura) return <li key={i} style={caja}>{contenido}</li>
            if (!varios) {
              return (
                <li key={i}>
                  <button
                    type="button"
                    className="ui-btn"
                    aria-pressed={activa}
                    onClick={() => elegir(quienes[0], op)}
                    style={{ ...caja, width: '100%', cursor: 'pointer', display: 'block' }}
                  >
                    {contenido}
                  </button>
                </li>
              )
            }
            return (
              <li key={i} style={{ ...caja, ...stack(8) }}>
                {contenido}
                <div role="group" aria-label={`Quién elige: ${acortar(op.texto, 60)}`} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingLeft: 36 }}>
                  {quienes.map((q) => (
                    <Conmutador
                      key={q.characterId ?? q.nombre}
                      compacto
                      activo={eligio(q, op)}
                      t={tone.esmeralda}
                      etiqueta={q.nombre}
                      onClick={() => elegir(q, op)}
                    />
                  ))}
                </div>
              </li>
            )
          })}
        </ul>

        {conPrueba.length > 0 && (
          <ul aria-label="Pruebas de la decisión" style={{ ...listReset, ...stack(8) }}>
            {conPrueba.map((q) => {
              const el = eleccionDe(q)
              if (!el) return null
              const t = el.resultado === 'exito' ? tone.esmeralda : el.resultado === 'fallo' ? tone.rubi : tone.zafiro
              return (
                <li key={q.characterId ?? q.nombre} style={{ padding: '10px 12px', borderRadius: radius.md, background: t.bg, border: `1px solid ${t.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ flex: '1 1 220px', minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, color: t.fg }}>{varios ? `${q.nombre} · ` : ''}{el.prueba}</span>
                    {el.exito && <span style={{ fontSize: fs.sm, color: c.muted }}>Si la supera: {el.exito}</span>}
                  </span>
                  <span role="group" aria-label={`Resultado: ${el.prueba}`} style={{ display: 'flex', gap: 6 }}>
                    <Conmutador compacto activo={el.resultado === 'exito'} t={tone.esmeralda} icono={<Check size={15} aria-hidden />} etiqueta="Superada" onClick={() => marcarPrueba(q, 'exito')} />
                    <Conmutador compacto activo={el.resultado === 'fallo'} t={tone.rubi} icono={<X size={15} aria-hidden />} etiqueta="Fallada" onClick={() => marcarPrueba(q, 'fallo')} />
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Apartado>
  )
}

// ── Record of decisions (Grupo panel) ────────────────────────────────────────

function Sumas({ sumas, t }: { sumas: Suma[]; t: Tone }) {
  return (
    <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {sumas.map((s) => (
        <span key={s.nombre} style={{ ...pill(t), borderRadius: radius.sm }}>{s.total > 0 ? '+' : ''}{s.total} {s.nombre}</span>
      ))}
    </span>
  )
}

/** Marks counted: the most marked one stands out (it is the recommendation of the end of the session) */
function Marcas({ titulo, sumas }: { titulo: string; sumas: Suma[] }) {
  if (sumas.length === 0) return null
  const max = sumas[0].total
  return (
    <div style={stack(4)}>
      <span style={{ ...eyebrow, color: tone.amatista.fg }}>{titulo}</span>
      <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sumas.map((s) => (
          <span key={s.nombre} style={{ ...pill(s.total === max ? tone.amatista : tone.cuarzo), borderRadius: radius.sm, fontWeight: s.total === max ? 700 : 600 }}>
            {s.nombre} · {s.total}
          </span>
        ))}
      </span>
    </div>
  )
}

function Lista({ titulo, items, t }: { titulo: string; items: string[]; t: Tone }) {
  if (items.length === 0) return null
  return (
    <div style={stack(4)}>
      <span style={{ ...eyebrow, color: t.fg }}>{titulo}</span>
      <ul style={{ ...listReset, ...stack(3) }}>
        {items.map((x, i) => (
          <li key={i} style={{ display: 'flex', gap: 6, fontSize: fs.sm, lineHeight: 1.45, color: c.text }}>
            <span aria-hidden style={{ color: t.fg }}>•</span>
            <span><EnLinea texto={x} /></span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TarjetaRegistro({ r, marcas, onQuitar }: { r: RegistroPersonaje; marcas: boolean; onQuitar: (clave: string, texto: string) => void }) {
  const hoja = r.atributos.length + r.habilidades.length + r.pericias.length + r.metas.length + r.objetos.length
  return (
    <article style={{ ...stack(12), padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }}>
      <header>
        <h3 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text }}>{r.nombre}</h3>
        <p style={{ fontSize: fs.xs, color: c.subtle }}>
          {r.elecciones.length} decisi{r.elecciones.length === 1 ? 'ón' : 'ones'}{r.characterId === null ? ' · sin personaje de la campaña' : ''}
        </p>
      </header>

      {hoja > 0 && (
        <div style={stack(8)}>
          <span style={{ ...eyebrow, color: tone.gold.fg }}>Para la ficha</span>
          {(r.atributos.length > 0 || r.habilidades.length > 0) && (
            <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <Sumas sumas={r.atributos} t={tone.gold} />
              <Sumas sumas={r.habilidades} t={tone.zafiro} />
            </span>
          )}
          <Lista titulo="Pericias" items={r.pericias} t={tone.esmeralda} />
          <Lista titulo="Metas" items={r.metas} t={tone.heliodoro} />
          <Lista titulo="Objetos" items={r.objetos} t={tone.cuarzo} />
        </div>
      )}

      {(r.caminos.length > 0 || r.metales.length > 0) && (
        marcas ? (
          <div style={{ ...stack(8), padding: 10, borderRadius: radius.md, background: tone.amatista.bg, border: `1px solid ${tone.amatista.border}` }}>
            <Marcas titulo="Caminos" sumas={r.caminos} />
            <Marcas titulo="Metales" sumas={r.metales} />
          </div>
        ) : (
          <p style={{ fontSize: fs.xs, color: c.subtle }}>Caminos y metales ocultos.</p>
        )
      )}

      <Lista titulo="Ecos" items={r.ecos} t={tone.cuarzo} />
      <Lista titulo="Otros premios" items={r.otros} t={tone.esmeralda} />

      <Disclosure headingLevel={4} title={`Decisiones (${r.elecciones.length})`} style={{ boxShadow: 'none' }}>
        <ul style={{ ...listReset, ...stack(8) }}>
          {r.elecciones.map(({ clave, eleccion: el }) => (
            <li key={clave} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ flex: 1, minWidth: 0, fontSize: fs.sm, lineHeight: 1.45 }}>
                <span style={{ display: 'block', color: c.subtle }}>{el.grupo ? `${el.grupo} · ` : ''}{el.escena}</span>
                <span style={{ display: 'block', color: c.muted }}>{el.pregunta}</span>
                <span style={{ display: 'block', color: c.text, fontWeight: 600 }}><EnLinea texto={el.opcion} /></span>
                {el.prueba && (
                  <span style={{ display: 'block', color: el.resultado === 'exito' ? tone.esmeralda.fg : el.resultado === 'fallo' ? tone.rubi.fg : c.subtle }}>
                    {el.prueba}: {el.resultado === 'exito' ? 'superada' : el.resultado === 'fallo' ? 'fallada' : 'sin marcar'}
                  </span>
                )}
              </span>
              <IconButton label={`Quitar la decisión «${el.pregunta}» de ${r.nombre}`} variant="danger" size={32} onClick={() => onQuitar(clave, `${r.nombre}: ${el.pregunta}`)}>
                <Trash2 size={14} aria-hidden />
              </IconButton>
            </li>
          ))}
        </ul>
      </Disclosure>
    </article>
  )
}

/**
 * What each character decided in the scripts of the screen, added up: what goes to the sheet (by hand: the screen does not change
 * sheets), the secret marks of path and metal behind a switch, and the echoes. A wrong choice can be removed from here.
 */
export function RegistroDecisiones({ personajes }: { personajes: Character[] }) {
  const { estado, actualizar } = usePantalla()
  const cfg = useWorldConfig()
  const [marcas, setMarcas] = useVerMarcas()
  const [quitando, setQuitando] = useState<{ clave: string; texto: string } | null>(null)
  const registro = useMemo(() => registroDecisiones(estado.decisiones, cfg.habilidades, personajes), [estado.decisiones, cfg.habilidades, personajes])
  if (registro.length === 0) return null
  return (
    <Disclosure
      defaultOpen
      headingLevel={2}
      accent={tone.topacio.fg}
      icon={<ListChecks size={18} aria-hidden />}
      title="Registro de decisiones"
      summary="Lo que ha decidido cada personaje: lo que va a su ficha, sus marcas de camino y metal, y los ecos para la historia."
    >
      <div style={stack(12)}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: fs.sm, color: c.muted }}>
          <Switch checked={marcas} onChange={setMarcas} label="Mostrar caminos y metales" />
          Mostrar caminos y metales (ocúltalos si los jugadores ven la pantalla)
        </label>
        <ul style={{ ...listReset, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 12 }}>
          {registro.map((r) => (
            <li key={r.clave}><TarjetaRegistro r={r} marcas={marcas} onQuitar={(clave, texto) => setQuitando({ clave, texto })} /></li>
          ))}
        </ul>
        <p style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.45 }}>
          Lo de «Para la ficha» se pasa a la ficha de cada personaje a mano: la pantalla solo lo suma. Una prueba superada que da
          «+1 al atributo de la habilidad» ya cuenta en los atributos.
        </p>
      </div>
      <ConfirmDialog
        open={!!quitando}
        title="¿Quitar esta decisión?"
        message={quitando
          ? `Se borra del registro «${quitando.texto}»${estado.decisiones[quitando.clave]?.prueba ? ', con su prueba' : ''}. Esta acción no se puede deshacer.`
          : ''}
        confirmLabel="Quitar"
        onConfirm={() => {
          if (quitando) actualizar((b) => { delete b.decisiones[quitando.clave] })
          setQuitando(null)
        }}
        onCancel={() => setQuitando(null)}
      />
    </Disclosure>
  )
}
