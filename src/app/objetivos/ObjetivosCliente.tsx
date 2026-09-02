'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Objetivo {
  id: string
  alumna_id: string
  monto_objetivo: number
  producto_nombre: string
  producto_precio: number
  producto_comision_pct: number
}

interface Props {
  userId: string
  objetivoGuardado: Objetivo | null
}

const PRODUCTOS_PRESET = [
  { nombre: 'Socias Digitales', precio: 597, comisionPct: 50 },
]

export default function ObjetivosCliente({ userId, objetivoGuardado }: Props) {
  const supabase = createClient()

  // Estado inicial desde lo guardado
  const [montoObjetivo, setMontoObjetivo] = useState<string>(
    objetivoGuardado ? String(objetivoGuardado.monto_objetivo) : ''
  )
  const [modoProducto, setModoProducto] = useState<'preset' | 'manual'>(
    objetivoGuardado?.producto_nombre === 'Socias Digitales' ? 'preset' : objetivoGuardado ? 'manual' : 'preset'
  )
  const [presetIdx, setPresetIdx] = useState(0)
  const [nombreManual, setNombreManual] = useState(
    objetivoGuardado && objetivoGuardado.producto_nombre !== 'Socias Digitales'
      ? objetivoGuardado.producto_nombre : ''
  )
  const [precioManual, setPrecioManual] = useState<string>(
    objetivoGuardado && objetivoGuardado.producto_nombre !== 'Socias Digitales'
      ? String(objetivoGuardado.producto_precio) : ''
  )
  const [comisionManual, setComisionManual] = useState<string>(
    objetivoGuardado && objetivoGuardado.producto_nombre !== 'Socias Digitales'
      ? String(objetivoGuardado.producto_comision_pct) : ''
  )
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  // Producto activo
  const producto = modoProducto === 'preset'
    ? PRODUCTOS_PRESET[presetIdx]
    : {
        nombre: nombreManual || 'Mi producto',
        precio: parseFloat(precioManual) || 0,
        comisionPct: parseFloat(comisionManual) || 0,
      }

  const comisionPorVenta = producto.precio * (producto.comisionPct / 100)
  const objetivo = parseFloat(montoObjetivo) || 0
  const ventasNecesarias = comisionPorVenta > 0 && objetivo > 0
    ? Math.ceil(objetivo / comisionPorVenta)
    : null
  const gananciaTotal = ventasNecesarias !== null ? ventasNecesarias * comisionPorVenta : 0

  async function guardar() {
    if (!objetivo || !comisionPorVenta) return
    setGuardando(true)

    const datos = {
      alumna_id: userId,
      monto_objetivo: objetivo,
      producto_nombre: producto.nombre,
      producto_precio: producto.precio,
      producto_comision_pct: producto.comisionPct,
    }

    if (objetivoGuardado) {
      await supabase.from('objetivos').update(datos).eq('id', objetivoGuardado.id)
    } else {
      await supabase.from('objetivos').insert(datos)
    }

    setGuardando(false)
    setGuardado(true)
    setTimeout(() => setGuardado(false), 3000)
  }

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
          <p className="text-sm text-gray-500 mt-1">Calculá cuánto tenés que vender para llegar a tu meta</p>
        </div>

        {/* Paso 1 — Objetivo de facturación */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
              style={{ background: '#E27396' }}>1</span>
            <h2 className="font-bold text-gray-800 text-lg">¿Cuánto querés ganar?</h2>
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-lg">$</span>
            <input
              type="number"
              min={0}
              value={montoObjetivo}
              onChange={e => setMontoObjetivo(e.target.value)}
              placeholder="Ej: 1000"
              className="w-full border-2 rounded-xl pl-9 pr-4 py-3.5 text-xl font-bold text-gray-900 focus:outline-none transition-colors"
              style={{ borderColor: montoObjetivo ? '#E27396' : '#e5e7eb' }}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">USD</span>
          </div>

          {objetivo > 0 && (
            <p className="text-sm text-gray-500">
              Tu objetivo es <span className="font-bold" style={{ color: '#337357' }}>${objetivo.toLocaleString('es-AR')} USD</span>
            </p>
          )}
        </div>

        {/* Paso 2 — Producto */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center flex-shrink-0"
              style={{ background: '#E27396' }}>2</span>
            <h2 className="font-bold text-gray-800 text-lg">¿Qué producto vas a vender?</h2>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            <button
              onClick={() => setModoProducto('preset')}
              className="flex-1 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: modoProducto === 'preset' ? '#E27396' : 'white',
                color: modoProducto === 'preset' ? 'white' : '#9ca3af',
              }}>
              📋 Lista de productos
            </button>
            <button
              onClick={() => setModoProducto('manual')}
              className="flex-1 py-2.5 text-sm font-semibold transition-colors"
              style={{
                background: modoProducto === 'manual' ? '#E27396' : 'white',
                color: modoProducto === 'manual' ? 'white' : '#9ca3af',
              }}>
              ✏️ Cargarlo manualmente
            </button>
          </div>

          {modoProducto === 'preset' && (
            <div className="space-y-2">
              {PRODUCTOS_PRESET.map((p, i) => (
                <button key={i} onClick={() => setPresetIdx(i)}
                  className="w-full text-left rounded-xl border-2 p-4 transition-all"
                  style={{
                    borderColor: presetIdx === i ? '#E27396' : '#e5e7eb',
                    background: presetIdx === i ? '#fff5f8' : 'white',
                  }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{p.nombre}</p>
                      <p className="text-sm text-gray-500 mt-0.5">Precio: <span className="font-semibold">${p.precio} USD</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Comisión</p>
                      <p className="text-lg font-black" style={{ color: '#337357' }}>{p.comisionPct}%</p>
                      <p className="text-xs font-semibold" style={{ color: '#337357' }}>${p.precio * p.comisionPct / 100} USD/venta</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {modoProducto === 'manual' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">Nombre del producto</label>
                <input
                  type="text"
                  value={nombreManual}
                  onChange={e => setNombreManual(e.target.value)}
                  placeholder="Ej: Curso de marketing"
                  className="w-full border-2 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
                  style={{ borderColor: '#e5e7eb' }}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Precio (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      value={precioManual}
                      onChange={e => setPrecioManual(e.target.value)}
                      placeholder="0"
                      className="w-full border-2 rounded-xl pl-7 pr-3 py-2.5 text-sm text-gray-900 focus:outline-none"
                      style={{ borderColor: '#e5e7eb' }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-600 mb-1">Comisión (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={comisionManual}
                      onChange={e => setComisionManual(e.target.value)}
                      placeholder="0"
                      className="w-full border-2 rounded-xl px-3 pr-8 py-2.5 text-sm text-gray-900 focus:outline-none"
                      style={{ borderColor: '#e5e7eb' }}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">%</span>
                  </div>
                </div>
              </div>
              {comisionPorVenta > 0 && (
                <p className="text-sm" style={{ color: '#337357' }}>
                  💰 Ganás <span className="font-bold">${comisionPorVenta.toFixed(2)} USD</span> por cada venta
                </p>
              )}
            </div>
          )}
        </div>

        {/* Resultado */}
        {ventasNecesarias !== null && (
          <div className="rounded-2xl p-6 space-y-4" style={{ background: 'linear-gradient(135deg, #337357, #4a9970)' }}>
            <p className="text-white font-semibold text-sm opacity-80">Tu calculadora de éxito 🎯</p>

            <div className="text-center py-2">
              <p className="text-7xl font-black text-white">{ventasNecesarias}</p>
              <p className="text-white opacity-80 mt-1 text-sm">
                {ventasNecesarias === 1 ? 'venta necesaria' : 'ventas necesarias'}
              </p>
            </div>

            <div className="bg-white bg-opacity-15 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-white text-sm">
                <span className="opacity-75">Producto</span>
                <span className="font-semibold">{producto.nombre}</span>
              </div>
              <div className="flex justify-between text-white text-sm">
                <span className="opacity-75">Precio por venta</span>
                <span className="font-semibold">${producto.precio} USD</span>
              </div>
              <div className="flex justify-between text-white text-sm">
                <span className="opacity-75">Tu comisión ({producto.comisionPct}%)</span>
                <span className="font-semibold">${comisionPorVenta.toFixed(2)} USD/venta</span>
              </div>
              <div className="border-t border-white border-opacity-20 pt-2 flex justify-between text-white">
                <span className="opacity-75 text-sm">Total que ganarías</span>
                <span className="font-black text-lg">${gananciaTotal.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} USD</span>
              </div>
            </div>

            <p className="text-center text-white opacity-70 text-xs">
              ¡Vos podés! Una venta a la vez 💪
            </p>
          </div>
        )}

        {/* Botón guardar */}
        {objetivo > 0 && comisionPorVenta > 0 && (
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
