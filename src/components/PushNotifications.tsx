'use client'

import { useEffect, useState } from 'react'

export default function PushNotifications() {
  const [mostrar, setMostrar] = useState(false)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    if (Notification.permission === 'granted') {
      registrar()
      return
    }
    if (Notification.permission === 'default') {
      // Mostrar banner después de 3 segundos
      setTimeout(() => setMostrar(true), 3000)
    }
  }, [])

  async function registrar() {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      })

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      })
    } catch { /* silencioso */ }
  }

  async function activar() {
    setCargando(true)
    const permiso = await Notification.requestPermission()
    if (permiso === 'granted') await registrar()
    setMostrar(false)
    setCargando(false)
  }

  if (!mostrar) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-4 flex items-start gap-3 border border-rose-100">
        <span className="text-2xl flex-shrink-0">🔔</span>
        <div className="flex-1">
          <p className="font-bold text-gray-800 text-sm">Activá las notificaciones</p>
          <p className="text-xs text-gray-500 mt-0.5">Avisarte cuando haya clases nuevas y novedades.</p>
          <div className="flex gap-2 mt-3">
            <button onClick={activar} disabled={cargando}
              className="flex-1 py-2 rounded-xl text-white text-xs font-bold disabled:opacity-60"
              style={{ background: '#E27396' }}>
              {cargando ? 'Activando...' : 'Activar'}
            </button>
            <button onClick={() => setMostrar(false)}
              className="px-3 py-2 rounded-xl text-xs text-gray-400 border border-gray-200">
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}
