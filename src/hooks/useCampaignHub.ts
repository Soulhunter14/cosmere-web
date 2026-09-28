import { useEffect, useRef, useCallback } from 'react'
import * as signalR from '@microsoft/signalr'
import { useAuthStore } from '../store/authStore'

type EventHandler = (data: unknown) => void

/**
 * Connects to /hubs/campaign, joins the campaign group, and allows subscribing
 * to server-push events. Handles reconnection automatically.
 */
export function useCampaignHub(
  campaignId: number | null,
  handlers: Record<string, EventHandler>
) {
  const token = useAuthStore((s) => s.token)
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  // Keep a stable reference to handlers without restarting the connection
  const handlersRef = useRef(handlers)
  useEffect(() => { handlersRef.current = handlers }, [handlers])

  useEffect(() => {
    if (!campaignId || !token) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/campaign', {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build()

    connectionRef.current = connection

    // Register handlers via proxy so they always call the latest version
    const eventNames = Object.keys(handlersRef.current)
    eventNames.forEach((event) => {
      connection.on(event, (data: unknown) => {
        handlersRef.current[event]?.(data)
      })
    })

    connection
      .start()
      .then(() => connection.invoke('JoinCampaign', String(campaignId)))
      .catch((err) => console.warn('[SignalR] connection error:', err))

    return () => {
      connection
        .invoke('LeaveCampaign', String(campaignId))
        .catch(() => {})
        .finally(() => connection.stop())
      connectionRef.current = null
    }
  }, [campaignId, token]) // only reconnect if campaign or token changes
}

/** One-shot hook to send a message to the hub (rarely needed) */
export function useHubSend() {
  const connectionRef = useRef<signalR.HubConnection | null>(null)
  const send = useCallback((method: string, ...args: unknown[]) => {
    connectionRef.current?.invoke(method, ...args).catch(console.warn)
  }, [])
  return send
}
