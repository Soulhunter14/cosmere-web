/**
 * The director's actions on the creation session (prepare, start, go back to the preparation, end), shared by the Creación panel and
 * the Bitácora: the campaign registers each step first (the API answers 409 out of order), then the screen opens or closes the table
 * session 0. Ending the creation session sends the decisions still pending, written on the sheets.
 */
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { creacionApi } from '../../api/creacion'
import { useWorldConfig } from '../../store/campaignStore'
import type { CreacionEstado } from '../../types'
import { usePantalla } from './contexto'
import { esSesionDeCreacion, personajesEnCreacion, useCreacionPantalla } from './creacionPantalla'
import { claveEscenaPropia, marcar, nuevaSesion, terminarSesion } from './estado'
import { archivarEscena } from './guion'
import { enviarTodos, mensajeDe, useUltimo } from './sincronizacion'

export interface AccionesSesionCreacion {
  creacion: CreacionEstado | undefined
  /** The open table session is the creation session */
  esCreacion: boolean
  /** Names of the characters still in creation (to warn when ending) */
  sinCrear: string[]
  ocupado: boolean
  aviso: string | null
  setAviso: (a: string | null) => void
  preparar: () => Promise<boolean>
  empezar: () => Promise<boolean>
  volver: () => Promise<boolean>
  /** Ends the open table session (any kind); with the creation session, the campaign closes it first */
  terminar: (marcarTodas: boolean) => Promise<boolean>
}

export function useAccionesSesionCreacion(): AccionesSesionCreacion {
  const { cId, estado, actualizar } = usePantalla()
  const qc = useQueryClient()
  const cfg = useWorldConfig()
  const { creacion } = useCreacionPantalla(cId)
  const ultimo = useUltimo(estado)
  const [ocupado, setOcupado] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const esCreacion = esSesionDeCreacion(estado.sesion?.id, creacion)
  const sinCrear = esCreacion ? personajesEnCreacion(creacion).map((p) => p.name) : []

  const guardar = (nuevo: CreacionEstado) => qc.setQueryData(['creacion', cId], nuevo)
  const correr = async (f: () => Promise<void>): Promise<boolean> => {
    setOcupado(true)
    setAviso(null)
    try {
      await f()
      return true
    } catch (e) {
      setAviso(mensajeDe(e))
      return false
    } finally {
      setOcupado(false)
    }
  }

  const preparar = () => correr(async () => {
    guardar(await creacionApi.sesion(cId, 'preparar'))
  })
  /** The campaign registers the session first (409 if it was played already), then the table session 0 opens */
  const empezar = () => correr(async () => {
    const s = nuevaSesion(0, 'Sesión de creación')
    guardar(await creacionApi.sesion(cId, 'iniciar', { mesaId: s.id, guion: estado.guionTitulo }))
    actualizar((b) => { b.sesion = s })
    setAviso('Sesión de creación en marcha: lo que decida la mesa se escribe en cada ficha según se elige.')
  })
  /** A creation session started by mistake goes back to the preparation: the campaign first, then the table session 0 is discarded */
  const volver = () => correr(async () => {
    guardar(await creacionApi.sesion(cId, 'volver'))
    actualizar((b) => { b.sesion = null })
    setAviso('La sesión de creación vuelve a la preparación.')
  })
  const terminar = (marcarTodas: boolean) => correr(async () => {
    if (esCreacion) {
      await enviarTodos(cId, () => ultimo.current, () => ({ habilidades: cfg.habilidades, aplicar: true }), true)
      guardar(await creacionApi.sesion(cId, 'terminar'))
    }
    actualizar((b) => {
      if (marcarTodas) for (const e of b.escenasPropias) if (!b.marcas[claveEscenaPropia(e.id)]) marcar(b, claveEscenaPropia(e.id), true)
      terminarSesion(b, (esc) => archivarEscena(b, esc))
    })
    setAviso(esCreacion ? 'Sesión de creación terminada. Marca «Personaje creado» en Creación a quien le falte.' : null)
  })

  return { creacion, esCreacion, sinCrear, ocupado, aviso, setAviso, preparar, empezar, volver, terminar }
}
