'use client'

import { useState } from 'react'

const FECHA_LANZAMIENTO = new Date('2025-09-28T00:00:00')

const ETAPAS = [
  {
    id: 'preparacion',
    label: 'Preparación de redes y contenido',
    emoji: '📱',
    color: '#E27396',
    descripcion: 'Todo lo que tenés que preparar antes de arrancar.',
    tareas: [
      'Actualizar bio con link de afiliada',
      'Preparar contenido para stories',
      'Diseñar plantillas de publicaciones',
      'Definir calendario de posteos',
    ],
    material: [
      { label: 'Material de oferta', url: '#' },
      { label: 'Clases de lanzamiento', url: '#' },
    ],
  },
  {
    id: 'captacion',
    label: 'Captación',
    emoji: '🎯',
    color: '#7c3aed',
    descripcion: 'Estrategias para atraer potenciales clientas.',
    tareas: [
      'Publicar stories de calentamiento',
      'Compartir testimonios y resultados',
      'Hacer lives de presentación',
      'Invitar a lista de espera',
    ],
    material: [
      { label: 'Guía de captación', url: '#' },
    ],
  },
  {
    id: 'apertura',
    label: 'Apertura de carrito',
    emoji: '🛒',
    color: '#337357',
    descripcion: '28 de septiembre — ¡Se abren las inscripciones!',
    tareas: [
      'Publicar apertura en todas las redes',
      'Enviar el link de compra a tu lista',
      'Stories con cuenta regresiva',
      'Responder consultas en tiempo real',
    ],
    material: [
      { label: 'Link de venta', url: '#' },
      { label: 'Plantillas de apertura', url: '#' },
    ],
  },
  {
    id: 'cierre',
    label: 'Cierre de ventas',
    emoji: '🔥',
    color: '#d97706',
    descripcion: 'Las últimas horas son las más importantes.',
    tareas: [
      'Recordatorio de últimas horas',
      'Stories de urgencia y escasez',
      'Seguimiento a personas interesadas',
      'Publicar cierre de carrito',
    ],
    material: [
      { label: 'Plantillas de cierre', url: '#' },
    ],
  },
]

function usarCountdown() {
  const ahora = new Date()
  const diff = FECHA_LANZAMIENTO.getTime() - ahora.getTime()
  if (diff <= 0) return { dias: 0, horas: 0, minutos: 0 }
  const dias = Math.floor(diff / (1000 * 60 * 60 * 24))
  const horas = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { dias, horas, minutos }
}

export default function LanzamientoCliente({ nombre }: { nombre: string }) {
  const [etapaActiva, setEtapaActiva] = useState(0)
  const { dias, horas, minutos } = usarCountdown()
  const etapa = ETAPAS[etapaActiva]

  return (
    <div className="min-h-screen" style={{ background: '#f5f0eb' }}>
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <img src="/logo.png" alt="Socias Digitales" style={{ height: 36, objectFit: 'contain' }} />
        <a href="/perfil" className="text-sm text-gray-500 hover:text-gray-800">← Mi perfil</a>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E27396' }}>Acceso exclusivo afiliadas</p>
              <h1 className="text-2xl font-black text-gray-900 mt-1">
                Escritorio de lanzamiento 🚀
              </h1>
              {nombre && <p className="text-sm text-gray-400 mt-0.5">Hola, {nombre} 👋</p>}
            </div>

            {/* Countdown */}
            <div className="rounded-2xl px-5 py-3 text-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #E27396, #337357)' }}>
              <p className="text-xs font-bold text-white opacity-80 mb-1">Apertura de carrito</p>
              <p className="text-xs text-white opacity-70 mb-2">28 de septiembre</p>
              {dias > 0 ? (
                <div className="flex gap-3 justify-center">
                  {[{ v: dias, l: 'días' }, { v: horas, l: 'hs' }, { v: minutos, l: 'min' }].map(({ v, l }) => (
                    <div key={l} className="text-center">
                      <p className="text-2xl font-black text-white leading-none">{v}</p>
                      <p className="text-xs text-white opacity-70">{l}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white font-black text-lg">¡Hoy es el día! 🎉</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline de etapas */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4 px-2">Etapas del lanzamiento</p>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {ETAPAS.map((e, i) => (
              <button key={e.id} onClick={() => setEtapaActiva(i)}
                className="flex-1 min-w-0 rounded-xl px-3 py-3 text-center transition-all border-2"
                style={{
                  borderColor: etapaActiva === i ? e.color : '#f3f4f6',
                  background: etapaActiva === i ? e.color + '12' : 'white',
                }}>
                <p className="text-xl mb-1">{e.emoji}</p>
                <p className="text-xs font-semibold leading-tight"
                  style={{ color: etapaActiva === i ? e.color : '#9ca3af' }}>
                  {e.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Contenido de la etapa activa */}
        <div className="grid sm:grid-cols-2 gap-4">

          {/* Tareas */}
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{etapa.emoji}</span>
              <h2 className="font-black text-gray-800">{etapa.label}</h2>
            </div>
            <p className="text-sm text-gray-500">{etapa.descripcion}</p>
            <div className="space-y-2 pt-1">
              {etapa.tareas.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5"
                    style={{ borderColor: etapa.color }} />
                  <p className="text-sm text-gray-700">{t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Material */}
          <div className="space-y-4">

            {/* Links de Drive */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Material de esta etapa</p>
              {etapa.material.map((m, i) => (
                <a key={i} href={m.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl p-3 transition-all hover:shadow-sm"
                  style={{ background: etapa.color + '10', border: `1.5px solid ${etapa.color}30` }}>
                  <span className="text-xl">📁</span>
                  <span className="text-sm font-semibold" style={{ color: etapa.color }}>{m.label}</span>
                  <span className="ml-auto text-gray-300 text-lg">→</span>
                </a>
              ))}
            </div>

            {/* Fecha clave */}
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Fechas clave</p>
              <div className="space-y-2">
                {[
                  { fecha: 'Septiembre 2025', evento: 'Preparación y captación', emoji: '📱' },
                  { fecha: '28 Sep 2025', evento: 'Apertura de carrito 🛒', emoji: '🎯' },
                  { fecha: 'Por confirmar', evento: 'Cierre de ventas', emoji: '🔥' },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span>{f.emoji}</span>
                    <div>
                      <p className="text-xs font-bold" style={{ color: '#337357' }}>{f.fecha}</p>
                      <p className="text-xs text-gray-500">{f.evento}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
