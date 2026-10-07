import { isAxiosError } from 'axios'

/**
 * Spanish message for a failed calendar action. The API answers in English ({ error }), so the text shown is chosen here:
 * no response → connection problem; 409 → `conflict` (something was already resolved or duplicated); else `fallback`.
 */
export function calendarError(err: unknown, fallback: string, conflict?: string) {
  if (isAxiosError(err)) {
    if (!err.response) return 'No hay conexión con el servidor. Inténtalo de nuevo.'
    if (err.response.status === 409 && conflict) return conflict
  }
  return fallback
}
