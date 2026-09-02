'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProductoObj {
  id: string
  nombre: string
  precio: number
  comisionPct: number
  cantidad: number
}

interface ObjetivoDB {
  id: string
  alumna_id: string
  monto_objetivo: number
  productos: ProductoObj[]
}

interface Props {
  userId: string
  objetivoGuardado: ObjetivoDB | null
}

const PRESET = { nombre: 'Socias Digitales', precio: 597, comisionPct: 50 }

export default function ObjetivosCliente({ userId, objetivoGuardado }: Props) {
  const supabase = createClient()

  const [montoObjetivo, setMontoObjetivo] = useState<string>(
    objetivoGuardado ? String(objetivoGuardado.monto_objetivo) : ''
  )
  const [productos, setProductos] = useState<ProductoObj[]>(
    objetivoGuardado?.productos ?? []
  )

  // Formulario nuevo producto
  const [modo, setModo] = useState<'preset' | 'manual'>('preset')
  const [nombreManual, setNombreManual] = useState('')
  const [precioManual, setPrecioManual] = useState('')
  const [comisionManual, setComisionManual] = useState('')
  const [agregando, setAgregando] = useState(false)

  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  const objetivo = parseFloat(montoObjetivo) || 0

  // Totales combinados
  const totalGanado = productos.reduce((acc, p) => {
    return acc + p.precio * (p.comisionPct / 100) * p.cantidad
  }, 0)
  const progreso = objetivo > 0 ? Math.min((totalGanado / objetivo) * 100, 100) : 0
  const faltante = Math.max(objetivo - totalGanado, 0)

  function agregarProducto() {
    const prod = modo === 'preset'
      ? { ...PRESET }
      : { nombre: nombreManual.trim() || 'Mi producto', precio: parseFloat(precioManual) || 0, comisionPct: parseFloat(comisionManual) || 0 }

    if (prod.precio <= 0 || prod.comisionPct <= 0) return

    setProductos(prev => [...prev, {
      id: crypto.randomUUID(),
      ...prod,
      cantidad: 1,
    }])
    setNombreManual('')
    setPrecioManual('')
    setComisionManual('')
    setAgregando(false)
  }

  function actualizarCantidad(id: string, delta: number) {
    setProductos(prev => prev.map(p =>
      p.id === id ? { ...p, cantidad: Math.max(1, p.cantidad + delta) } : p
    ))
  }

  function eliminarProducto(id: string) {
    setProductos(prev => prev.filter(p => p.id !== id))
  }

  async function guardar() {
    if (!objetivo) return
    setGuardando(true)

    const datos = { alumna_id: userId, monto_objetivo: objetivo, productos }

    if (objetivoGuardado) {
      await supabase.from('objetivos').update(datos).eq('id', objetivoGuardado.id)
    } else {
      await supabase.from('objetivos').insert(datos)
    }

    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

  const comisionPreset = PRESET.precio * PRESET.comisionPct / 100

  return (
    <div className="min-h-screen" style={{ background: '#f5f0eb' }}>
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <img src="/logo.png" alt="Socias Digitales" style={{ height: 36, objectFit: 'contain' }} />
        <a href="/perfil" className="text-sm text-gray-500 hover:text-gray-800">← Mi perfil</a>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#1a1a1a' }}>Mis objetivos</h1>
          <p className="text-sm text-gray-500 mt-1">Combiná productos y calculá cuánto necesitás vender</p>
        </div>

        {/* Paso 1 — Objetivo */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ background: '#E27396' }}>1</span>
            <h2 className="font-bold text-gray-800 text-lg">¿Cuánto querés ganar?</h2>
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">$</span>
            <input
              type="number" min={0}
              value={montoObjetivo}
              onChange={e => setMontoObjetivo(e.target.value)}
              placeholder="Ej: 1000"
              className="w-full border-2 rounded-xl pl-9 pr-16 py-3.5 text-xl font-bold text-gray-900 focus:outline-none transition-colors"
              style={{ borderColor: montoObjetivo ? '#E27396' : '#e5e7eb' }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-semibold">USD</span>
          </div>
        </div>

        {/* Paso 2 — Productos */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ background: '#E27396' }}>2</span>
              <h2 className="font-bold text-gray-800 text-lg">Tus productos</h2>
            </div>
            {!agregando && (
              <button onClick={() => setAgregando(true)}
                className="text-sm font-semibold px-4 py-1.5 rounded-full border-2 transition-colors"
                style={{ borderColor: '#E27396', color: '#E27396' }}>
                + Agregar
              </button>
            )}
          </div>

          {/* Lista de productos agregados */}
          {productos.length === 0 && !agregando && (
            <div className="text-center py-6 text-gray-400 text-sm">
              <p className="text-3xl mb-2">🛍️</p>
              <p>Todavía no agregaste productos.</p>
              <p className="text-xs mt-1">Tocá "+ Agregar" para empezar</p>
            </div>
          )}

          {productos.map(p => {
            const ganancia = p.precio * (p.comisionPct / 100) * p.cantidad
            return (
              <div key={p.id} className="rounded-xl border border-gray-100 p-4 flex items-center gap-3" style={{ background: '#fafafa' }}>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-400">${p.precio} USD · {p.comisionPct}% comisión</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: '#337357' }}>
                    ${(p.precio * p.comisionPct / 100).toFixed(0)}/venta · Total: ${ganancia.toFixed(0)} USD
                  </p>
                </div>
                {/* Selector cantidad */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => actualizarCantidad(p.id, -1)}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 font-bold text-gray-500 hover:border-rose-300 transition-colors text-lg leading-none">−</button>
                  <span className="w-8 text-center font-black text-gray-800">{p.cantidad}</span>
                  <button onClick={() => actualizarCantidad(p.id, 1)}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 font-bold text-gray-500 hover:border-rose-300 transition-colors text-lg leading-none">+</button>
                </div>
                <button onClick={() => eliminarProducto(p.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xl flex-shrink-0 ml-1">×</button>
              </div>
            )
          })}

          {/* Formulario agregar */}
          {agregando && (
            <div className="border-2 border-dashed rounded-xl p-4 space-y-3" style={{ borderColor: '#E27396' }}>
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                <button onClick={() => setModo('preset')}
                  className="flex-1 py-2 text-sm font-semibold transition-colors"
                  style={{ background: modo === 'preset' ? '#E27396' : 'white', color: modo === 'preset' ? 'white' : '#9ca3af' }}>
                  📋 De la lista
                </button>
                <button onClick={() => setModo('manual')}
                  className="flex-1 py-2 text-sm font-semibold transition-colors"
                  style={{ background: modo === 'manual' ? '#E27396' : 'white', color: modo === 'manual' ? 'white' : '#9ca3af' }}>
                  ✏️ Manual
                </button>
              </div>

              {modo === 'preset' && (
                <div className="rounded-xl border-2 p-3 flex items-center justify-between" style={{ borderColor: '#E27396', background: '#fff5f8' }}>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{PRESET.nombre}</p>
                    <p className="text-xs text-gray-500">${PRESET.precio} USD · {PRESET.comisionPct}% = ${comisionPreset} por venta</p>
                  </div>
                  <span className="text-xl font-black" style={{ color: '#337357' }}>${comisionPreset}</span>
                </div>
              )}

              {modo === 'manual' && (
                <div className="space-y-2">
                  <input type="text" value={nombreManual} onChange={e => setNombreManual(e.target.value)}
                    placeholder="Nombre del producto"
                    className="w-full border-2 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none"
                    style={{ borderColor: '#e5e7eb' }} />
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                      <input type="number" min={0} value={precioManual} onChange={e => setPrecioManual(e.target.value)}
                        placeholder="Precio USD"
                        className="w-full border-2 rounded-xl pl-7 pr-3 py-2 text-sm text-gray-900 focus:outline-none"
                        style={{ borderColor: '#e5e7eb' }} />
                    </div>
                    <div className="relative flex-1">
                      <input type="number" min={0} max={100} value={comisionManual} onChange={e => setComisionManual(e.target.value)}
                        placeholder="Comisión %"
                        className="w-full border-2 rounded-xl px-3 pr-8 py-2 text-sm text-gray-900 focus:outline-none"
                        style={{ borderColor: '#e5e7eb' }} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={agregarProducto}
                  className="flex-1 py-2 rounded-xl text-white font-bold text-sm"
                  style={{ background: '#E27396' }}>
                  Agregar producto
                </button>
                <button onClick={() => setAgregando(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 border border-gray-200">
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resultado combinado */}
        {objetivo > 0 && productos.length > 0 && (
          <div className="rounded-2xl p-6 space-y-5" style={{ background: 'linear-gradient(135deg, #337357, #4a9970)' }}>
            <p className="text-white font-semibold text-sm opacity-80">Tu combinación 🎯</p>

            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between text-white text-xs opacity-75 mb-2">
                <span>Ganancia proyectada</span>
                <span>{Math.round(progreso)}% del objetivo</span>
              </div>
              <div className="h-4 rounded-full bg-white bg-opacity-20 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progreso}%`, background: progreso >= 100 ? '#fff' : 'rgba(255,255,255,0.85)' }} />
              </div>
            </div>

            {/* Números */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <p className="text-white opacity-70 text-xs mb-1">Ganancia total</p>
                <p className="text-white font-black text-2xl">${totalGanado.toFixed(0)}</p>
                <p className="text-white opacity-60 text-xs">USD</p>
              </div>
              <div className="bg-white bg-opacity-15 rounded-xl p-3 text-center">
                <p className="text-white opacity-70 text-xs mb-1">{faltante > 0 ? 'Faltante' : '¡Meta cumplida!'}</p>
                <p className="text-white font-black text-2xl">{faltante > 0 ? `$${faltante.toFixed(0)}` : '🎉'}</p>
                {faltante > 0 && <p className="text-white opacity-60 text-xs">USD</p>}
              </div>
            </div>

            {/* Desglose por producto */}
            <div className="bg-white bg-opacity-15 rounded-xl p-4 space-y-2">
              <p className="text-white text-xs font-semibold opacity-75 mb-3">Desglose</p>
              {productos.map(p => (
                <div key={p.id} className="flex justify-between text-white text-sm">
                  <span className="opacity-75">{p.cantidad}× {p.nombre}</span>
                  <span className="font-semibold">${(p.precio * p.comisionPct / 100 * p.cantidad).toFixed(0)} USD</span>
                </div>
              ))}
              <div className="border-t border-white border-opacity-20 pt-2 flex justify-between text-white font-black">
                <span>Total</span>
                <span>${totalGanado.toFixed(0)} USD</span>
              </div>
            </div>

            {faltante > 0 && (
              <p className="text-center text-white opacity-70 text-xs">
                Ajustá las cantidades para llegar a tu objetivo 💪
              </p>
            )}
          </div>
        )}

        {/* Guardar */}
        {objetivo > 0 && productos.length > 0 && (
          <button onClick={guardar} disabled={guardando}
            className="w-full py-4 rounded-2xl text-white font-bold text-base disabled:opacity-60 transition-all"
            style={{ background: guardado ? '#337357' : 'linear-gradient(135deg, #E27396, #337357)' }}>
            {guardando ? 'Guardando...' : guardado ? '✓ Objetivo guardado' : 'Guardar mi objetivo'}
          </button>
        )}

      </div>
    </div>
  )
}
