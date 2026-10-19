/**
 * Loads «La banda» of a campaign and saves what the director and the players it is shared with do. Changes are operations
 * (operaciones.ts) or moves the server makes together with a character (money from the purse, goods from or to the inventory): each one
 * is applied at once on screen and queued, so only ONE request is in flight and quick taps never collide with each other. A 409 means
 * another device saved first: the operation is applied again on the sheet the server returns and saved once more; if it no longer fits,
 * it is dropped and its reason shown. A player saves only the public sheet; the director's private part never reaches them.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { crewApi } from '../../api/crew'
import { charactersApi } from '../../api/characters'
import type { CrewSheet, EntrarAlmacenRequest } from '../../types'
import type { CatalogoBanda } from '../../lib/banda/tipos'
import { formatMoneda } from '../../lib/moneda'
import { useAuthStore } from '../../store/authStore'
import { useCampaignStore, useEra, useWorld, useWorldConfig } from '../../store/campaignStore'
import {
  VERSION_BANDA, existeBanda, necesitaMigrar, normalizarBanda, normalizarSecretos, secretosVacios, versionDocumento, type Actor,
} from './estado'
import { anotar, migrar, type CtxBanda, type DocBanda, type OpBanda } from './operaciones'
import { vivos } from '../../lib/personajes'

export const claveBanda = (campaignId: number) => ['crew', campaignId] as const

const estadoHttp = (e: unknown) => (isAxiosError(e) ? e.response?.status : undefined)

export type CargaBanda = 'cargando' | 'sin-acceso' | 'error' | 'lista'

/**
 * What the queue sends: an operation on the sheet, or a move the server makes together with a character (with its copy on screen
 * meanwhile); the server answers with the new sheet
 */
type Tarea =
  | { tipo: 'op'; op: OpBanda }
  | { tipo: 'servidor'; characterId: number; enviar: () => Promise<CrewSheet> }

export interface AporteDatos { characterId: number; nombre: string; cantidad: number; motivo: string }

/** Goods of a character's inventory enter the store: the request, and the same lot on screen while the server moves them */
export interface EntradaAlmacen { peticion: EntrarAlmacenRequest; optimista: OpBanda }

/** A lot leaves the store for a character's inventory: who, why, and the closed lot on screen while the server moves it */
export interface SalidaAlmacen { loteId: string; characterId: number; motivo: string; optimista: OpBanda }

export function useBanda(campaignId: number) {
  const qc = useQueryClient()
  const cfg = useWorldConfig()
  const mundo = useWorld()
  const era = useEra()
  const isGm = useCampaignStore((s) => s.isGm)
  const autor = useAuthStore((s) => s.user?.displayName ?? '')

  const catalogoQ = useQuery({
    queryKey: ['banda-catalogo', mundo],
    queryFn: () => cfg.banda!.cargar(),
    enabled: !!cfg.banda,
    staleTime: Infinity,
    gcTime: Infinity,
    structuralSharing: false,
    networkMode: 'always',
  })

  const hojaQ = useQuery({
    queryKey: claveBanda(campaignId),
    queryFn: () => crewApi.get(campaignId),
    enabled: !!cfg.banda && campaignId > 0,
    // 403: not shared with this player; 404: not a member. Neither gets better by retrying
    retry: (fallos, e) => fallos < 1 && estadoHttp(e) !== 403 && estadoHttp(e) !== 404,
  })

  // The characters who can act: the director sees every PC; a player only their own (the API filters)
  const personajesQ = useQuery({
    queryKey: ['characters', campaignId],
    queryFn: () => charactersApi.getAll(campaignId),
    enabled: !!cfg.banda && campaignId > 0 && hojaQ.isSuccess,
  })

  // `confirmada`: the last sheet the server holds; `doc`: what the screen shows (confirmada plus the queued tasks)
  const confirmada = useRef<CrewSheet | null>(null)
  const cola = useRef<Tarea[]>([])
  const procesando = useRef(false)
  const [doc, setDoc] = useState<DocBanda | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [aviso, setAviso] = useState<{ tono: 'info' | 'error'; texto: string } | null>(null)

  const aDoc = useCallback((hoja: CrewSheet): DocBanda => ({
    banda: normalizarBanda(hoja.state),
    secretos: isGm ? normalizarSecretos(hoja.gmState, hoja.state) : secretosVacios(),
  }), [isGm])

  const catalogo = catalogoQ.data ?? null

  const ctx = useCallback((cat: CatalogoBanda): CtxBanda => ({
    autor: autor || (isGm ? 'Director' : 'Jugador'),
    ahora: new Date().toISOString(),
    catalogo: cat,
    era,
    dinero: (v: number) => formatMoneda(v, cfg.moneda),
  }), [autor, isGm, era, cfg.moneda])

  const guardarHoja = useCallback((hoja: CrewSheet) => {
    confirmada.current = hoja
    qc.setQueryData(claveBanda(campaignId), hoja)
  }, [campaignId, qc])

  const procesar = useCallback(async (cat: CatalogoBanda) => {
    if (procesando.current) return
    procesando.current = true
    setGuardando(true)
    try {
      while (cola.current.length) {
        const tarea = cola.current[0]
        if (tarea.tipo === 'servidor') {
          guardarHoja(await tarea.enviar())
          // The character changed on the server too (purse or inventory): the sheet and the lists read it again
          void qc.invalidateQueries({ queryKey: ['characters', campaignId] })
          void qc.invalidateQueries({ queryKey: ['character', campaignId, tarea.characterId] })
          cola.current.shift()
          continue
        }
        let reintentado = false
        for (;;) {
          const base = confirmada.current
          if (!base) throw new Error('la hoja aún no ha cargado')
          let siguiente: DocBanda
          try {
            siguiente = tarea.op(aDoc(base), ctx(cat))
          } catch (e) {
            // It fitted on screen but not on the newer sheet of another device
            setAviso({ tono: 'error', texto: `Otro dispositivo cambió la hoja y tu cambio ya no es posible: ${e instanceof Error ? e.message : 'error'}` })
            break
          }
          try {
            const cuerpo = isGm
              ? { state: siguiente.banda, gmState: siguiente.secretos, version: base.version }
              : { state: siguiente.banda, version: base.version }
            guardarHoja(await crewApi.save(campaignId, cuerpo))
            if (reintentado) setAviso({ tono: 'info', texto: 'Otro dispositivo cambió la hoja; tu cambio se ha aplicado sobre la versión nueva.' })
            break
          } catch (e) {
            if (estadoHttp(e) === 409 && !reintentado && isAxiosError(e) && e.response?.data) {
              guardarHoja(e.response.data as CrewSheet)
              reintentado = true
              continue
            }
            throw e
          }
        }
        cola.current.shift()
      }
    } catch (e) {
      // Saving failed (network, server, a refused contribution): nothing queued reached the server, so the screen goes back to it
      cola.current = []
      const status = estadoHttp(e)
      setAviso({
        tono: 'error',
        texto: status === 400
          ? 'No se ha podido hacer: comprueba que el personaje tiene lo que entrega (dinero u objetos) y que los datos son válidos.'
          : status === 403
            ? 'No tienes permiso para hacer ese cambio en la banda.'
            : `No se ha podido guardar: ${e instanceof Error ? e.message : 'error desconocido'}. Vuelve a intentarlo.`,
      })
    } finally {
      procesando.current = false
      setGuardando(false)
      if (confirmada.current) setDoc(aDoc(confirmada.current))
    }
  }, [campaignId, ctx, guardarHoja, aDoc, isGm, qc])

  const encolar = useCallback((tarea: Tarea, optimista: OpBanda) => {
    if (!catalogo || !doc) throw new Error('La hoja aún no ha cargado.')
    // Throws the reason (ErrorBanda) when it does not fit: nothing changes and the sheet that asked can show it
    const siguiente = optimista(doc, ctx(catalogo))
    setAviso(null)
    setDoc(siguiente)
    cola.current.push(tarea)
    void procesar(catalogo)
  }, [catalogo, doc, ctx, procesar])

  /** Applies an operation: on screen at once and saved in order. Throws `ErrorBanda` (nothing changes) when it does not fit the sheet on screen */
  const aplicar = useCallback((op: OpBanda) => encolar({ tipo: 'op', op }, op), [encolar])

  /** A character gives money to the crew from their purse (the server checks the purse and moves it) */
  const aportar = useCallback((a: AporteDatos) => {
    const actor: Actor = { tipo: 'pj', characterId: a.characterId, nombre: a.nombre }
    const optimista: OpBanda = (d, c) => ({
      ...d,
      banda: anotar({ ...d.banda, tesoreria: Math.round((d.banda.tesoreria + a.cantidad) * 100) / 100 }, c, {
        tipo: 'tesoreria', actor, dinero: a.cantidad, motivo: a.motivo.trim() || 'Aporte a la tesorería',
      }),
    })
    const peticion = { characterId: a.characterId, cantidad: a.cantidad, motivo: a.motivo.trim() }
    encolar({ tipo: 'servidor', characterId: a.characterId, enviar: () => crewApi.aportar(campaignId, peticion) }, optimista)
  }, [campaignId, encolar])

  /** Goods of a character's inventory enter the store (the server takes them out of the inventory). Throws like `aplicar` */
  const entrarAlmacen = useCallback((e: EntradaAlmacen) => {
    encolar({ tipo: 'servidor', characterId: e.peticion.characterId, enviar: () => crewApi.entrarAlmacen(campaignId, e.peticion) }, e.optimista)
  }, [campaignId, encolar])

  /** A lot leaves the store for a character's inventory (the server puts it there). Throws like `aplicar` */
  const sacarAlmacen = useCallback((s: SalidaAlmacen) => {
    const peticion = { characterId: s.characterId, motivo: s.motivo }
    encolar({ tipo: 'servidor', characterId: s.characterId, enviar: () => crewApi.sacarAlmacen(campaignId, s.loteId, peticion) }, s.optimista)
  }, [campaignId, encolar])

  // Whatever the server sends while nothing is queued becomes the truth; a sheet of the first version is saved again by the
  // director with the private data of its workers moved out of the public part
  useEffect(() => {
    if (!hojaQ.data || cola.current.length) return
    confirmada.current = hojaQ.data
    const nuevo = aDoc(hojaQ.data)
    setDoc(nuevo)
    if (isGm && catalogo && existeBanda(hojaQ.data.version) && necesitaMigrar(hojaQ.data.state)) {
      cola.current.push({ tipo: 'op', op: migrar() })
      void procesar(catalogo)
    }
  }, [hojaQ.data, aDoc, isGm, catalogo, procesar])

  // Another device saved: refetch, unless our own queue is about to save (a 409 will bring the newer sheet then)
  useEffect(() => {
    const alCambiar = (e: Event) => {
      const d = (e as CustomEvent<{ campaignId?: number; version?: number }>).detail
      if (d?.campaignId !== campaignId || cola.current.length) return
      if (d.version !== undefined && d.version === confirmada.current?.version) return
      void qc.invalidateQueries({ queryKey: claveBanda(campaignId) })
    }
    window.addEventListener('crewSheetUpdated', alCambiar)
    window.addEventListener('crewSheetShared', alCambiar)
    return () => {
      window.removeEventListener('crewSheetUpdated', alCambiar)
      window.removeEventListener('crewSheetShared', alCambiar)
    }
  }, [campaignId, qc])

  const compartir = useCallback(async (userIds: number[]) => {
    const hoja = await crewApi.share(campaignId, { userIds })
    // Sharing does not change the version: keep the sheet on screen and take only the new list
    const actual = confirmada.current
    guardarHoja(actual ? { ...actual, sharedWith: hoja.sharedWith } : hoja)
  }, [campaignId, guardarHoja])

  // Who can act: each living PC (the director, any of them; a player, their own) and, for the director, the director himself
  const personajes = useMemo(() => personajesQ.data ?? [], [personajesQ.data])
  const actores = useMemo<Actor[]>(() => [
    ...vivos(personajes).map((p): Actor => ({ tipo: 'pj', characterId: p.id, nombre: p.name })),
    ...(isGm ? [{ tipo: 'director', nombre: autor } as Actor] : []),
  ], [personajes, isGm, autor])

  const status = estadoHttp(hojaQ.error)
  const carga: CargaBanda = !cfg.banda || status === 403 ? 'sin-acceso'
    : hojaQ.isError ? 'error'
    : !doc || !catalogo ? 'cargando'
    : 'lista'
  const hoja = hojaQ.data
  const versionNueva = hoja ? versionDocumento(hoja.state) > VERSION_BANDA : false

  return {
    carga,
    reintentar: () => { void hojaQ.refetch(); void catalogoQ.refetch() },
    doc,
    catalogo,
    era,
    existe: !!hoja && (existeBanda(hoja.version) || cola.current.length > 0),
    esDirector: isGm,
    /** The director edits everything; a player with access acts as their character (money, hiring, upgrades). A newer app's sheet is only read */
    editable: isGm && !versionNueva,
    puedeActuar: !versionNueva,
    versionNueva,
    personajes,
    actores,
    compartidaCon: confirmada.current?.sharedWith ?? hoja?.sharedWith ?? null,
    guardando,
    aviso,
    cerrarAviso: () => setAviso(null),
    aplicar,
    aportar,
    entrarAlmacen,
    sacarAlmacen,
    compartir,
    ctx: catalogo ? () => ctx(catalogo) : null,
  }
}
