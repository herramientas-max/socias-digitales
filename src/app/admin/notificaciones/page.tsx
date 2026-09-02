'use client'

import { useState } from 'react'

const TEMPLATES = [
  { label: '📚 Nueva clase', title: '¡Nueva clase disponible!', body: 'Entrá a la plataforma para verla.', url: '/classroom' },
  { label: '🏆 Cargá tu resultado', title: '¿Ya cargaste tu resultado del mes?', body: 'Compartí tus comisiones con la comunidad 💪', url: '/resultados' },
  { label: '💬 Comunidad activa', title: '¡Hay novedades en la comunidad!', body: 'Entrá a ver los últimos logros de tus socias.', url: '/comunidad' },
]

export default function NotificacionesAdmin() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('/perfil')
  const [enviando, setEnviando] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)

  function aplicarTemplate(t: typeof TEMPLATES[0]) {
    setTitle(t.title); setBody(t.body); setUrl(t.url)
  }

  async function enviar() {
    if (!title || !body) return
    setEnviando(true); setResultado(null)
    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body, url })
    })
    const data = await res.json()
    setResultado(`✅ Notificación enviada a ${data.enviadas} alumna${data.enviadas !== 1 ? 's' : ''}`)
    setEnviando(false)
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f0eb' }}>
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <img src="/logo.png" alt="Socias Digitales" style={{ height: 36, objectFit: 'contain' }} />
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-800">← Panel admin</a>
      </nav>

      <div className="max-w-xl mx-auto px-4 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#1a1a1a' }}>Enviar notificación</h1>
          <p className="text-sm text-gray-500 mt-1">Le llega a todas las alumnas que activaron las notificaciones</p>
        </div>

        {/* Templates rápidos */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mensajes rápidos</p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map(t => (
              <button key={t.label} onClick={() => aplicarTemplate(t)}
                className="px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all"
                style={{ borderColor: '#E27396', color: '#E27396', background: '#fff5f8' }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">Título</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ej: ¡Nueva clase disponible!"
              className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:outline-none transition-colors"
              style={{ borderColor: title ? '#E27396' : '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">Mensaje</label>
            <textarea value={body} onChange={e => setBody(e.target.value)}
              placeholder="Ej: Entrá a la plataforma para ver el contenido nuevo."
              rows={3}
              className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:outline-none transition-colors resize-none"
              style={{ borderColor: body ? '#E27396' : '#e5e7eb' }} />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1.5">Llevar a (URL)</label>
            <select value={url} onChange={e => setUrl(e.target.value)}
              className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:outline-none"
              style={{ borderColor: '#e5e7eb' }}>
              <option value="/perfil">Mi perfil</option>
              <option value="/classroom">Programa / Clases</option>
              <option value="/resultados">Mis resultados</option>
              <option value="/comunidad">Comunidad</option>
              <option value="/checklist">Mi día</option>
              <option value="/objetivos">Mis objetivos</option>
            </select>
          </div>
        </div>

        {resultado && (
          <div className="rounded-2xl px-5 py-4 text-sm font-semibold" style={{ background: '#edf7f2', color: '#337357' }}>
            {resultado}
          </div>
        )}

        <button onClick={enviar} disabled={!title || !body || enviando}
          className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-50 transition-all"
          style={{ background: 'linear-gradient(135deg, #E27396, #337357)' }}>
          {enviando ? 'Enviando...' : '🔔 Enviar a todas las alumnas'}
        </button>
      </div>
    </div>
  )
}
