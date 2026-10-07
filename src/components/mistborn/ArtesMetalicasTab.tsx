/**
 * «Artes metálicas» tab of the character sheet (§7.6, T30; sheet L.404 / PDF 410): for each art the character has (alomancia, feruquimia) the
 * derived stats of the server (MOD., LÍMITE, DADO, ALCANCE and, in feruchemy, the maximum charges and the metalminds at a time; L.163 / PDF 169)
 * and a card per power, without a limit (a nacido de la bruma has far more than the four boxes of the paper sheet). The director can add a power
 * the character gets as a reward: a spike, a lerasium alloy or a medallion (L.288-295 / PDF 294-301).
 *
 * Nothing is computed here: the stats come from `derivadosSet` and every change of the table state (charges, vials, atium beads, goal done,
 * Componedor) goes up through `onPatch`, the same optimistic mutation by cache prefix as «Investidura actual» (T29). A step is counted from
 * the latest copy of the character (`vivo`), so three quick taps add three. Nothing moves while the sheet is being edited (a refetch would
 * wipe the form) nor for someone who is neither the owner nor the director.
 *
 * Loaded lazily (components/mistborn/index.ts, §7.4 rule 4): neither it nor the data it reads (`useWorldData().poderes`) reach the main chunk.
 * «Nueva meta de nacido del metal» (T33) and «Añadir poder» are independent blocks of the director at the end of the list below; T49b adds its
 * section «Clavos hemalúrgicos» as another one.
 */
import { useId, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, RefreshCw, Target } from 'lucide-react'
import { Button, Card, EmptyState, ErrorMessage, SectionTitle, Spinner, StatTile } from '../ui'
import { metasApi } from '../../api/metas'
import { charactersApi } from '../../api/characters'
import { useEra, useWorldConfig, useWorldData } from '../../store/campaignStore'
import type { Character, PoderPersonaje, RecursosPatch, UpdateCharacterRequest } from '../../types'
import type { PoderDef } from '../../data/mistborn/tipos'
import { CAMINOS_NACIDOS_DEL_METAL } from '../../data/mistborn/caminosNacidosDelMetal'
import { c, fs } from '../../theme'
import { PoderCard } from './PoderCard'
import { MetalPicker } from './MetalPicker'
import { enlazarMetas, faltaHuecoParaPoder, idPoder, metalesDelCamino, type EntornoCaminoMetal, type MetaPendiente } from './caminoMetalFlujo'
import { ARTES, NOMBRE_ARTE, cargasMaxDe, desgloseTexto, nombrePoder, poderesDe, talentosDe, textoDerivado, type CambioPoder } from './poderes'

export interface ArtesMetalicasTabProps {
  character: Character
  isGm: boolean
  /** The sheet is in edit mode: nothing in this tab moves, a refetch would wipe what is typed in the form */
  editing: boolean
  /** The owner and the director change the table state; for anyone else the tab is read-only */
  puedeActuar: boolean
  /** Where the Investida skills of the world go (the cognitive slots of the sheet), for the skill a spike or an alloy creates (§7.4 step 3) */
  entorno: EntornoCaminoMetal
  /** The latest copy of the character in the cache: it already holds the steps tapped before, so a step is counted from it and not from the rendered one */
  vivo: () => Character
  /** `PATCH …/recursos` with an optimistic update by prefix (`mesa` of the sheet, T29) */
  onPatch: (body: RecursosPatch) => void
  /** Adds a power the director grants: one `PUT` with the whole character plus the new power (and its Investida skill, if it is missing) */
  onAnadirPoder: (poder: PoderPersonaje) => void
  errorMesa: boolean
  errorAnadir: boolean
  anadiendo: boolean
}

/** Four tiles per row where there is room, two on a phone: no media query */
const GRID_DERIVADOS = 'repeat(auto-fit, minmax(max(128px, calc((100% - 24px) / 4)), 1fr))'

const nota = { fontSize: fs.sm, color: c.muted, lineHeight: 1.45 } as const

/** A nascent power of the path with no goal yet: the only kind that a new goal can train (L.141 / PDF 147; L.146 / PDF 152) */
const naciente = (p: PoderPersonaje) => p.origen === 'camino' && !p.completo && p.metaId === null

const lista = (nombres: string[]) => (nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres.join(''))

/**
 * «Nueva meta de nacido del metal» (T33, director): once the first goal is done, the book lets the DJ grant the goal again for another Empujón/Tirón pair
 * (nacido de la bruma, «Entrenar tus poderes», L.141 / PDF 147) or for another pure metal with its alloy, or atium (feruquimista, «Fabricar tus mentes de
 * metal», L.146 / PDF 152), «y así sucesivamente». The path already gave every power, nascent, so only the goal is new: the picker offers the nascent
 * powers without a goal, the goal is created with the title and text of the path, and ONE `PUT` links it (`metaId`) to the powers chosen; the others
 * keep their state (§5.1). It shows once a power of the path is complete: the conclusion of the first goal marks it on the server (T14) and the switch of
 * the power card is its shortcut at the table (Q14). Immediate, so it is off while the sheet is being edited (a refetch would wipe the form).
 */
function NuevaMetaNacidoDelMetal({ character, editing }: { character: Character; editing: boolean }) {
  const qc = useQueryClient()
  const era = useEra()
  const [eligiendo, setEligiendo] = useState(false)
  const cId = character.campaignId
  const chId = character.id
  // Every cached copy of the character moves together (§2): by prefix, the one read out of combat and the one in combat
  const prefijo = ['character', cId, chId]

  const crear = useMutation({
    mutationFn: async ({ meta }: { meta: MetaPendiente; nombres: string }) => {
      const base = qc.getQueryData<Character>(['character', cId, chId, false]) ?? character
      const creada = await metasApi.create(cId, chId, { titulo: meta.titulo, descripcion: meta.descripcion })
      try {
        qc.setQueriesData<Character>({ queryKey: prefijo }, (old) => old && { ...old, poderes: enlazarMetas(old.poderes, [meta], [creada.id]) })
        return await charactersApi.update(cId, chId, { ...base, poderes: enlazarMetas(base.poderes, [meta], [creada.id]) } as UpdateCharacterRequest)
      } catch (error) {
        // The PUT failed: the goal does not stay orphan
        await metasApi.delete(cId, chId, creada.id).catch(() => undefined)
        throw error
      }
    },
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: prefijo })
      return { previas: qc.getQueriesData<Character>({ queryKey: prefijo }) }
    },
    onError: (_error, _vars, ctx) => ctx?.previas.forEach(([key, data]) => qc.setQueryData(key, data)),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: prefijo })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
      // The new goal shows up in Metas at once, not after the 30 s of staleTime
      qc.invalidateQueries({ queryKey: ['metas', cId, chId] })
    },
  })

  const camino = CAMINOS_NACIDOS_DEL_METAL.find((p) => p.id === character.caminoMetal)
  const modo = camino?.seleccionMeta
  const libres = character.poderes.filter(naciente)
  // The first goal is done: a power of the path is complete (not counting the alomancia de atium, which is born complete, L.177 / PDF 183)
  const entrenado = character.poderes.some((p) => p.origen === 'camino' && p.completo && !(p.arte === 'alomancia' && p.metal === 'atium'))
  if (!camino || (modo !== 'pareja' && modo !== 'puro-aleacion-o-atium') || !entrenado || (libres.length === 0 && !crear.isSuccess && !crear.isPending)) return null

  const { arte } = metalesDelCamino(camino)
  const def = camino.metasIniciales.find((m) => m.arte === arte)
  if (!def) return null

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
        {libres.length > 0 && (
          <>
            <Button
              variant="secondary"
              icon={<Target size={16} aria-hidden />}
              aria-haspopup="dialog"
              aria-busy={crear.isPending || undefined}
              disabled={editing || crear.isPending}
              onClick={() => { crear.reset(); setEligiendo(true) }}
            >
              Nueva meta de nacido del metal
            </Button>
            <p style={nota}>
              {modo === 'pareja'
                ? `A discreción del director, otra pareja de metales Empujón/Tirón se entrena con una nueva meta «${def.titulo}».`
                : `A discreción del director, otro metal puro con su aleación, o el atium, fabrica sus mentes de metal con una nueva meta «${def.titulo}».`}
              {` Poderes nacientes sin meta: ${libres.length}.`}
            </p>
          </>
        )}
        {crear.isError && <ErrorMessage message="No se ha podido crear la meta. Inténtalo de nuevo." />}
        {crear.isSuccess && crear.variables && (
          <>
            <p role="status" style={{ ...nota, color: c.text }}>Meta «{crear.variables.meta.titulo}» creada para {crear.variables.nombres}.</p>
            <Link
              to={`/campaigns/${cId}/personajes/metas/${chId}`}
              className="ui-link"
              style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 2px', fontSize: fs.sm, fontWeight: 650 }}
            >
              Ver en Metas →
            </Link>
          </>
        )}
      </div>

      {eligiendo && (
        <MetalPicker
          open
          onClose={() => setEligiendo(false)}
          arte={arte}
          modo={modo}
          era={era}
          caminoMetal={character.caminoMetal}
          yaElegidos={[]}
          nuevaMeta={libres.map(idPoder)}
          onConfirm={(_poderes, paraMeta) => {
            setEligiendo(false)
            const elegidos = libres.filter((p) => paraMeta.includes(idPoder(p)))
            if (elegidos.length === 0) return
            const nombres = lista(elegidos.map(nombrePoder))
            crear.mutate({
              meta: { titulo: def.titulo, descripcion: `Poderes que entrena: ${nombres}. ${def.descripcion}`, poderes: elegidos.map(idPoder) },
              nombres,
            })
          }}
        />
      )}
    </>
  )
}

export function ArtesMetalicasTab({
  character, isGm, editing, puedeActuar, entorno, vivo, onPatch, onAnadirPoder, errorMesa, errorAnadir, anadiendo,
}: ArtesMetalicasTabProps) {
  const cfg = useWorldConfig()
  const era = useEra()
  const { data, isPending } = useWorldData()
  const idBase = useId()
  const [eligiendo, setEligiendo] = useState(false)

  if (isPending) return <Spinner />
  if (!data) {
    // A failed import() stays failed for the rest of the document: only reloading the page recovers it (pattern of T25)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-start' }}>
        <ErrorMessage message="No se pudieron cargar los poderes de los metales." />
        <Button onClick={() => window.location.reload()} icon={<RefreshCw size={15} aria-hidden />}>Recargar la página</Button>
      </div>
    )
  }

  const defs = data.poderes.filter((p): p is PoderDef => 'caminos' in p)
  const resumenes = data.talentos?.summaries
  const aprendidos = new Set(talentosDe(character))
  const parado = editing || !puedeActuar
  const cuentasAtium = character.recursos.cuentasAtium ?? 0

  // A card hands up a ready body or a function of the latest character (a step from the value in the cache); `null` = nothing to send
  const parchear = (cambio: CambioPoder) => {
    const cuerpo = typeof cambio === 'function' ? cambio(vivo()) : cambio
    if (cuerpo) onPatch(cuerpo)
  }

  // An art is shown when the server derives its stats (the Investida skill exists, the path implies it or a power of that art) or it has powers
  const secciones = ARTES.map((arte) => ({
    arte,
    poderes: poderesDe(character.poderes, arte),
    derivados: cfg.derivados
      .filter((d) => d.grupo === arte)
      .flatMap((d) => (character.derivadosSet[d.clave] ? [{ ...d, stat: character.derivadosSet[d.clave] }] : [])),
  })).filter((s) => s.poderes.length > 0 || s.derivados.length > 0)

  // The arts whose Investida skill has no free cognitive slot: a spike or an alloy of that art cannot be added until the director frees one (Q4)
  const sinHueco = isGm ? ARTES.filter((arte) => faltaHuecoParaPoder(vivo(), arte, entorno)) : []

  return (
    <>
      {editing && (
        <p role="note" style={nota}>Estás editando la ficha: guarda o cancela los cambios para mover cargas, viales o poderes.</p>
      )}
      {!editing && !puedeActuar && (
        <p role="note" style={nota}>Solo el propietario del personaje y el director pueden cambiar el estado de los poderes.</p>
      )}
      {errorMesa && <ErrorMessage message="No se ha podido guardar el cambio de los poderes. Inténtalo de nuevo." />}
      {errorAnadir && <ErrorMessage message="No se ha podido añadir el poder. Inténtalo de nuevo." />}

      {secciones.length === 0 && (
        <EmptyState
          title="Sin artes metálicas"
          description={isGm
            ? 'Este personaje no tiene camino de nacido del metal ni poderes. Asigna un camino en la pestaña Características o añade un poder concedido.'
            : 'Este personaje no tiene camino de nacido del metal ni poderes.'}
        />
      )}

      {secciones.map(({ arte, poderes, derivados }) => {
        const Icono = cfg.habilidadesInvestidas.find((h) => h.nombre === NOMBRE_ARTE[arte])?.icono
        const titulo = `${idBase}-${arte}`
        return (
          <section key={arte} aria-labelledby={titulo}>
            <SectionTitle id={titulo}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {Icono && <Icono size={18} aria-hidden />}
                {NOMBRE_ARTE[arte]}
              </span>
            </SectionTitle>

            {derivados.length > 0 && (
              <Card padding={12} style={{ marginBottom: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: GRID_DERIVADOS, gap: 8 }}>
                  {derivados.map((d) => (
                    <StatTile
                      key={d.clave}
                      label={d.label}
                      value={textoDerivado(d.stat)}
                      // The die has one line («Dado de artes metálicas»): nothing to add, except that «—» means there is no roll
                      sub={d.stat.unidad === 'd' ? (d.stat.total <= 1 ? 'Sin tirada' : undefined) : desgloseTexto(d.stat)}
                      style={{ background: c.s2, boxShadow: 'none' }}
                    />
                  ))}
                </div>
              </Card>
            )}

            {poderes.length === 0 ? (
              <p style={nota}>Todavía no tiene poderes de {NOMBRE_ARTE[arte].toLowerCase()}.</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {poderes.map((p) => {
                  const def = defs.find((d) => d.arte === p.arte && d.metal === p.metal)
                  return (
                    <PoderCard
                      key={idPoder(p)}
                      poder={p}
                      def={def}
                      cargasMax={cargasMaxDe(character, p)}
                      talentosAprendidos={(def?.talentos ?? []).map((t) => t.name).filter((n) => aprendidos.has(n))}
                      resumenes={resumenes}
                      disabled={parado}
                      esGm={isGm}
                      // Componedor spends a fragment of the metalmind that the nacidoble path gave (L.155 / PDF 161)
                      componedor={aprendidos.has('Componedor') && p.arte === 'feruquimia' && p.origen === 'camino'}
                      cuentasAtium={cuentasAtium}
                      onPatch={parchear}
                    />
                  )
                })}
              </ul>
            )}
          </section>
        )
      })}

      {isGm && <NuevaMetaNacidoDelMetal character={character} editing={editing} />}

      {isGm && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
          <Button
            variant="secondary"
            icon={<Plus size={16} aria-hidden />}
            aria-haspopup="dialog"
            disabled={editing || anadiendo}
            onClick={() => setEligiendo(true)}
          >
            Añadir poder
          </Button>
          <p style={nota}>Clavo hemalúrgico, aleación de lerasium o medallón feruquímico: recompensas del director. El poder se añade completo.</p>
        </div>
      )}

      {eligiendo && (
        <MetalPicker
          open
          onClose={() => setEligiendo(false)}
          arte="ambas"
          modo="concedido"
          era={era}
          caminoMetal=""
          // A power the character has, from whatever origin, cannot be added twice
          yaElegidos={character.poderes.map(idPoder)}
          sinHueco={sinHueco}
          onConfirm={(poderes) => {
            setEligiendo(false)
            if (poderes[0]) onAnadirPoder(poderes[0])
          }}
        />
      )}
    </>
  )
}
