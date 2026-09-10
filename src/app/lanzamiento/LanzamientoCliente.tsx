'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Metricas {
  id?: string
  tipo_trafico: string
  inversion: number
  personas_grupo: number
  personas_seguimiento: number
  ventas_realizadas: number
  objetivo_septiembre: number
}

const FECHA_LANZAMIENTO = new Date('2026-09-28T00:00:00')

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

export default function LanzamientoCliente({ nombre, userId, metricasGuardadas }: { nombre: string, userId: string, metricasGuardadas: Metricas | null }) {
  const supabase = createClient()
  const [etapaActiva, setEtapaActiva] = useState(0)
  const { dias, horas, minutos } = usarCountdown()
  const etapa = ETAPAS[etapaActiva]

  const [metricas, setMetricas] = useState<Metricas>(metricasGuardadas ?? {
    tipo_trafico: 'organico',
    inversion: 0,
    personas_grupo: 0,
    personas_seguimiento: 0,
    ventas_realizadas: 0,
    objetivo_septiembre: 0,
  })
  const [guardandoMetricas, setGuardandoMetricas] = useState(false)
  const [metricasGuardadasOk, setMetricasGuardadasOk] = useState(false)

  async function guardarMetricas() {
    setGuardandoMetricas(true)
    const datos = { alumna_id: userId, ...metricas, actualizado_en: new Date().toISOString() }
    if (metricasGuardadas?.id) {
      await supabase.from('metricas_lanzamiento').update(datos).eq('id', metricasGuardadas.id)
    } else {
      await supabase.from('metricas_lanzamiento').insert(datos)
    }
    setGuardandoMetricas(false)
    setMetricasGuardadasOk(true)
    setTimeout(() => setMetricasGuardadasOk(false), 3000)
  }

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
                  { fecha: 'Septiembre 2026', evento: 'Preparación y captación', emoji: '📱' },
                  { fecha: '28 Sep 2026', evento: 'Apertura de carrito 🛒', emoji: '🎯' },
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

        {/* Métricas */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
          <div>
            <h2 className="font-black text-gray-800 text-lg">📊 Mis métricas de lanzamiento</h2>
            <p className="text-sm text-gray-400 mt-0.5">Completá tus números para llevar el seguimiento</p>
          </div>

          {/* Tipo de tráfico */}
          <div>
            <p className="text-sm font-bold text-gray-600 mb-2">Tipo de tráfico</p>
            <div className="flex gap-2">
              {['organico', 'pago'].map(tipo => (
                <button key={tipo} onClick={() => setMetricas(m => ({ ...m, tipo_trafico: tipo }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 capitalize transition-all"
                  style={{
                    borderColor: metricas.tipo_trafico === tipo ? '#E27396' : '#e5e7eb',
                    background: metricas.tipo_trafico === tipo ? '#fff0f4' : 'white',
                    color: metricas.tipo_trafico === tipo ? '#E27396' : '#9ca3af',
                  }}>
                  {tipo === 'organico' ? '🌱 Orgánico' : '💰 Pago'}
                </button>
              ))}
            </div>
          </div>

          {/* Inversión (solo si es pago) */}
          {metricas.tipo_trafico === 'pago' && (
            <div>
              <p className="text-sm font-bold text-gray-600 mb-2">Inversión en publicidad (USD)</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                <input type="number" min={0}
                  value={metricas.inversion || ''}
                  onChange={e => setMetricas(m => ({ ...m, inversion: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full border-2 rounded-xl pl-9 pr-4 py-3 text-gray-900 focus:outline-none"
                  style={{ borderColor: '#e5e7eb' }} />
              </div>
            </div>
          )}

          {/* Métricas numéricas */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'personas_grupo', label: 'En el grupo', emoji: '👥' },
              { key: 'personas_seguimiento', label: 'En seguimiento', emoji: '🎯' },
              { key: 'ventas_realizadas', label: 'Ventas', emoji: '🏆' },
            ].map(({ key, label, emoji }) => (
              <div key={key} className="text-center">
                <p className="text-xs text-gray-400 mb-1">{emoji} {label}</p>
                <input
                  type="number" min={0}
                  value={(metricas as any)[key] || ''}
                  onChange={e => setMetricas(m => ({ ...m, [key]: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full border-2 rounded-xl px-3 py-3 text-center text-xl font-black text-gray-800 focus:outline-none transition-colors"
                  style={{ borderColor: '#e5e7eb' }}
                  onFocus={e => e.target.style.borderColor = '#E27396'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            ))}
          </div>

          {/* Resumen visual */}
          {(metricas.personas_grupo > 0 || metricas.ventas_realizadas > 0) && (
            <div className="rounded-xl p-4 grid grid-cols-3 gap-3 text-center" style={{ background: '#f5f0eb' }}>
              <div>
                <p className="text-2xl font-black" style={{ color: '#337357' }}>{metricas.personas_grupo}</p>
                <p className="text-xs text-gray-500">en el grupo</p>
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: '#E27396' }}>{metricas.personas_seguimiento}</p>
                <p className="text-xs text-gray-500">en seguimiento</p>
              </div>
              <div>
                <p className="text-2xl font-black" style={{ color: '#d97706' }}>{metricas.ventas_realizadas}</p>
                <p className="text-xs text-gray-500">ventas</p>
              </div>
            </div>
          )}

          {/* Objetivo septiembre */}
          <div className="border-t border-gray-100 pt-5 space-y-3">
            <div>
              <p className="font-black text-gray-800">🎯 Objetivo septiembre</p>
              <p className="text-xs text-gray-400 mt-0.5">¿Cuánto querés ganar este mes? Te decimos cuántas ventas necesitás.</p>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-300 text-xl">$</span>
              <input
                type="number" min={0}
                value={metricas.objetivo_septiembre || ''}
                onChange={e => setMetricas(m => ({ ...m, objetivo_septiembre: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                className="w-full border-2 rounded-xl pl-10 pr-16 py-4 text-2xl font-black text-gray-900 focus:outline-none transition-colors"
                style={{ borderColor: metricas.objetivo_septiembre ? '#E27396' : '#f3f4f6' }}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">USD</span>
            </div>
            {metricas.objetivo_septiembre > 0 && (
              <div className="rounded-2xl p-5 text-center" style={{ background: 'linear-gradient(135deg, #337357, #4a9970)' }}>
                <p className="text-white text-sm opacity-80 mb-1">Con comisión de $290 por venta, necesitás:</p>
                <p className="text-white font-black text-6xl leading-none">
                  {Math.ceil(metricas.objetivo_septiembre / 290)}
                </p>
                <p className="text-white opacity-70 mt-1 text-sm">
                  {Math.ceil(metricas.objetivo_septiembre / 290) === 1 ? 'venta' : 'ventas'}
                </p>
                <p className="text-white opacity-60 text-xs mt-2">
                  = ${(Math.ceil(metricas.objetivo_septiembre / 290) * 290).toLocaleString('es-AR')} USD garantizados
                </p>
              </div>
            )}
          </div>

          <button onClick={guardarMetricas} disabled={guardandoMetricas}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm disabled:opacity-60 transition-all"
            style={{ background: metricasGuardadasOk ? '#337357' : 'linear-gradient(135deg, #E27396, #337357)' }}>
            {guardandoMetricas ? 'Guardando...' : metricasGuardadasOk ? '✓ Métricas guardadas' : 'Guardar métricas'}
          </button>
        </div>

      </div>
    </div>
  )
}
