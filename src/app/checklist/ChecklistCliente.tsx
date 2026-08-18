'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Tarea {
  id: string
  texto: string
  completada: boolean
  fecha: string
}

interface Props {
  tareas: Tarea[]
  userId: string
  fecha: string
}

function GraficoCircular({ porcentaje }: { porcentaje: number }) {
  const radio = 54
  const circunferencia = 2 * Math.PI * radio
  const progreso = circunferencia - (porcentaje / 100) * circunferencia

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: 160, height: 160 }}>
        <svg width="160" height="160" viewBox="0 0 160 160">
          {/* Fondo */}
          <circle cx="80" cy="80" r={radio} fill="none" stroke="#f3f4f6" strokeWidth="14" />
          {/* Progreso */}
          <circle
            cx="80" cy="80" r={radio}
            fill="none"
            stroke={porcentaje === 100 ? '#337357' : '#E27396'}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circunferencia}
            strokeDashoffset={progreso}
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
          />
        </svg>
        {/* Número central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color: porcentaje === 100 ? '#337357' : '#E27396' }}>
            {porcentaje}%
          </span>
          <span className="text-xs text-gray-400 mt-0.5">completado</span>
        </div>
      </div>
      {porcentaje === 100 && (
        <p className="text-sm font-bold mt-3" style={{ color: '#337357' }}>🎉 ¡Día completado!</p>
      )}
      {porcentaje === 0 && (
        <p className="text-sm text-gray-400 mt-3">¡Arrancá el día!</p>
      )}
      {porcentaje > 0 && porcentaje < 100 && (
        <p className="text-sm text-gray-400 mt-3">¡Vas muy bien!</p>
      )}
    </div>
  )
}

export default function ChecklistCliente({ tareas: tareasIniciales, userId, fecha }: Props) {
  const supabase = createClient()
  const [tareas, setTareas] = useState<Tarea[]>(tareasIniciales)
  const [nueva, setNueva] = useState('')
  const [agregando, setAgregando] = useState(false)

  const completadas = tareas.filter(t => t.completada).length
  const porcentaje = tareas.length === 0 ? 0 : Math.round((completadas / tareas.length) * 100)

  const fechaFormateada = new Date(fecha + 'T12:00:00').toLocaleDateString('es-AR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

  async function agregarTarea(e: React.FormEvent) {
    e.preventDefault()
    if (!nueva.trim()) return
    setAgregando(true)

    const nuevaTarea: Tarea = {
      id: crypto.randomUUID(),
      texto: nueva.trim(),
      completada: false,
      fecha,
    }
    setTareas(prev => [...prev, nuevaTarea])
    setNueva('')

    await supabase.from('checklist_tareas').insert({
      id: nuevaTarea.id,
      alumna_id: userId,
      texto: nuevaTarea.texto,
      fecha,
    })
    setAgregando(false)
  }

  async function toggleTarea(id: string) {
    const tarea = tareas.find(t => t.id === id)
    if (!tarea) return
    const nuevo = !tarea.completada
    setTareas(prev => prev.map(t => t.id === id ? { ...t, completada: nuevo } : t))
    await supabase.from('checklist_tareas').update({ completada: nuevo }).eq('id', id)
  }

  async function eliminarTarea(id: string) {
    setTareas(prev => prev.filter(t => t.id !== id))
    await supabase.from('checklist_tareas').delete().eq('id', id)
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f0eb' }}>
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <img src="/logo.png" alt="Socias Digitales" style={{ height: 36, objectFit: 'contain' }} />
        <a href="/perfil" className="text-sm text-gray-500 hover:text-gray-800">← Mi perfil</a>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black capitalize" style={{ color: '#1a1a1a' }}>
            Mi día de hoy
          </h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{fechaFormateada}</p>
        </div>

        {/* Contenido principal: checklist + gráfico */}
        <div className="flex flex-col sm:flex-row gap-6 items-start">

          {/* Checklist */}
          <div className="flex-1 space-y-3">

            {/* Agregar tarea */}
            <form onSubmit={agregarTarea} className="flex gap-2">
              <input
                type="text"
                value={nueva}
                onChange={e => setNueva(e.target.value)}
                placeholder="Agregar tarea..."
                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 shadow-sm"
                style={{ '--tw-ring-color': '#E27396' } as React.CSSProperties}
              />
              <button type="submit" disabled={!nueva.trim() || agregando}
                className="px-4 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-40 transition-colors flex-shrink-0"
                style={{ background: '#E27396' }}>
                + Agregar
              </button>
            </form>

            {/* Lista */}
            {tareas.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
                <p className="text-3xl mb-2">📝</p>
                <p className="text-gray-500 text-sm">No hay tareas todavía.</p>
                <p className="text-gray-400 text-xs mt-1">Agregá la primera arriba</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tareas.map(tarea => (
                  <div key={tarea.id}
                    className={`bg-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-sm border transition-all ${tarea.completada ? 'border-green-100' : 'border-transparent'}`}>

                    {/* Checkbox */}
                    <button onClick={() => toggleTarea(tarea.id)}
                      className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        borderColor: tarea.completada ? '#337357' : '#d1d5db',
                        background: tarea.completada ? '#337357' : 'white'
                      }}>
                      {tarea.completada && <span className="text-white text-xs font-bold">✓</span>}
                    </button>

                    {/* Texto */}
                    <span className={`flex-1 text-sm transition-all ${tarea.completada ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                      {tarea.texto}
                    </span>

                    {/* Eliminar */}
                    <button onClick={() => eliminarTarea(tarea.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg flex-shrink-0">
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Resumen */}
            {tareas.length > 0 && (
              <p className="text-xs text-gray-400 text-center pt-1">
                {completadas} de {tareas.length} tarea{tareas.length !== 1 ? 's' : ''} completada{completadas !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* Gráfico circular */}
          <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center sm:w-48 w-full"
            style={{ border: '1px solid #f3f4f6' }}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Progreso del día</p>
            <GraficoCircular porcentaje={porcentaje} />
          </div>

        </div>
      </div>
    </div>
  )
}
