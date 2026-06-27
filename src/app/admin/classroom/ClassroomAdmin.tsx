'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Leccion {
  id: string
  titulo: string
  orden: number
  duracion_min: number
}

interface Modulo {
  id: string
  titulo: string
  descripcion: string | null
  imagen_url: string | null
  orden: number
  estado: string
  lecciones: Leccion[]
}

interface Props {
  modulos: Modulo[]
}

const MODULO_VACIO = { titulo: '', descripcion: '', imagen_url: '', orden: 0, estado: 'borrador' }
const LECCION_VACIA = { titulo: '', descripcion: '', video_url: '', contenido: '', duracion_min: 0, orden: 0 }

export default function ClassroomAdmin({ modulos: modulosIniciales }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [modulos, setModulos] = useState(modulosIniciales)
  const [modalModulo, setModalModulo] = useState(false)
  const [modalLeccion, setModalLeccion] = useState<string | null>(null) // moduloId
  const [moduloEditando, setModuloEditando] = useState<typeof MODULO_VACIO & { id?: string }>(MODULO_VACIO)
  const [leccionEditando, setLeccionEditando] = useState<typeof LECCION_VACIA & { id?: string }>(LECCION_VACIA)
  const [guardando, setGuardando] = useState(false)
  const [subiendoImg, setSubiendoImg] = useState(false)
  const [moduloExpandido, setModuloExpandido] = useState<string | null>(null)

  async function guardarModulo() {
    setGuardando(true)
    if (moduloEditando.id) {
      await supabase.from('modulos').update(moduloEditando).eq('id', moduloEditando.id)
    } else {
      await supabase.from('modulos').insert({ ...moduloEditando, orden: modulos.length })
    }
    setModalModulo(false)
    setModuloEditando(MODULO_VACIO)
    setGuardando(false)
    router.refresh()
  }

  async function eliminarModulo(id: string) {
    if (!confirm('¿Eliminar este módulo y todas sus lecciones?')) return
    await supabase.from('modulos').delete().eq('id', id)
    router.refresh()
  }

  async function toggleEstado(modulo: Modulo) {
    const nuevoEstado = modulo.estado === 'publicado' ? 'borrador' : 'publicado'
    await supabase.from('modulos').update({ estado: nuevoEstado }).eq('id', modulo.id)
    router.refresh()
  }

  async function guardarLeccion(moduloId: string) {
    setGuardando(true)
    const modulo = modulos.find(m => m.id === moduloId)
    const datos = { ...leccionEditando, modulo_id: moduloId, orden: leccionEditando.id ? leccionEditando.orden : (modulo?.lecciones.length ?? 0) }
    if (leccionEditando.id) {
      await supabase.from('lecciones').update(datos).eq('id', leccionEditando.id)
    } else {
      await supabase.from('lecciones').insert(datos)
    }
    setModalLeccion(null)
    setLeccionEditando(LECCION_VACIA)
    setGuardando(false)
    router.refresh()
  }

  async function eliminarLeccion(id: string) {
    if (!confirm('¿Eliminar esta lección?')) return
    await supabase.from('lecciones').delete().eq('id', id)
    router.refresh()
  }

  async function subirImagenModulo(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendoImg(true)
    const nombre = `modulo-${Date.now()}.${archivo.name.split('.').pop()}`
    const { error } = await supabase.storage.from('modulos').upload(nombre, archivo, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('modulos').getPublicUrl(nombre)
      setModuloEditando(prev => ({ ...prev, imagen_url: data.publicUrl }))
    }
    setSubiendoImg(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <a href="/admin" className="text-gray-400 hover:text-gray-600 text-sm">← Admin</a>
          <h1 className="text-lg font-bold text-rose-600">Gestión de Classroom</h1>
        </div>
        <div className="flex items-center gap-3">
          <a href="/classroom" className="text-sm text-rose-600 hover:text-rose-800 font-medium">Ver classroom →</a>
          <button onClick={() => { setModuloEditando(MODULO_VACIO); setModalModulo(true) }}
            className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
            + Nuevo módulo
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        {modulos.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-gray-400">
            <p className="text-4xl mb-3">📚</p>
            <p>No hay módulos todavía. Creá el primero.</p>
          </div>
        ) : modulos.map((modulo, i) => (
          <div key={modulo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header módulo */}
            <div className="flex items-center gap-4 p-5">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {modulo.imagen_url
                  ? <img src={modulo.imagen_url} className="w-full h-full object-cover" alt="" />
                  : <div className="w-full h-full flex items-center justify-center text-2xl font-black text-gray-300">{i + 1}</div>
                }
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{modulo.titulo}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${modulo.estado === 'publicado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {modulo.estado}
                  </span>
                </div>
                {modulo.descripcion && <p className="text-sm text-gray-500 truncate mt-0.5">{modulo.descripcion}</p>}
                <p className="text-xs text-gray-400 mt-1">{modulo.lecciones.length} lecciones</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => toggleEstado(modulo)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors ${modulo.estado === 'publicado' ? 'border-gray-200 text-gray-500 hover:bg-gray-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}>
                  {modulo.estado === 'publicado' ? 'Despublicar' : 'Publicar'}
                </button>
                <button onClick={() => { setModuloEditando({ titulo: modulo.titulo, descripcion: modulo.descripcion ?? '', imagen_url: modulo.imagen_url ?? '', orden: modulo.orden, estado: modulo.estado, id: modulo.id }); setModalModulo(true) }}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">
                  Editar
                </button>
                <button onClick={() => setModuloExpandido(moduloExpandido === modulo.id ? null : modulo.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border border-gray-200 text-gray-500 hover:bg-gray-50">
                  {moduloExpandido === modulo.id ? '▲ Lecciones' : '▼ Lecciones'}
                </button>
                <button onClick={() => eliminarModulo(modulo.id)}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium border border-red-100 text-red-400 hover:bg-red-50">
                  Eliminar
                </button>
              </div>
            </div>

            {/* Lecciones */}
            {moduloExpandido === modulo.id && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-2">
                {modulo.lecciones.length === 0
                  ? <p className="text-sm text-gray-400 text-center py-4">No hay lecciones. Agregá la primera.</p>
                  : modulo.lecciones.map((lec, j) => (
                    <div key={lec.id} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3">
                      <span className="w-6 h-6 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{j + 1}</span>
                      <p className="text-sm font-medium text-gray-800 flex-1">{lec.titulo}</p>
                      {lec.duracion_min > 0 && <span className="text-xs text-gray-400">{lec.duracion_min} min</span>}
                      <button onClick={() => { setLeccionEditando({ ...lec, video_url: '', contenido: '', descripcion: '' }); setModalLeccion(modulo.id) }}
                        className="text-xs text-rose-500 hover:text-rose-700 font-medium">Editar</button>
                      <button onClick={() => eliminarLeccion(lec.id)}
                        className="text-xs text-red-400 hover:text-red-600 font-medium">×</button>
                    </div>
                  ))
                }
                <button onClick={() => { setLeccionEditando({ ...LECCION_VACIA, orden: modulo.lecciones.length }); setModalLeccion(modulo.id) }}
                  className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-rose-300 text-sm text-gray-400 hover:text-rose-500 rounded-lg transition-colors font-medium">
                  + Agregar lección
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal módulo */}
      {modalModulo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{moduloEditando.id ? 'Editar módulo' : 'Nuevo módulo'}</h3>
              <button onClick={() => setModalModulo(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Preview imagen */}
              <div className="h-32 bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                {moduloEditando.imagen_url
                  ? <img src={moduloEditando.imagen_url} className="w-full h-full object-cover" alt="" />
                  : <span className="text-gray-300 text-4xl font-black">📸</span>
                }
                <label className="absolute bottom-2 right-2 bg-white text-xs font-medium px-3 py-1.5 rounded-lg shadow cursor-pointer hover:bg-gray-50">
                  {subiendoImg ? 'Subiendo...' : 'Subir imagen'}
                  <input type="file" accept="image/*" onChange={subirImagenModulo} className="hidden" />
                </label>
              </div>

              {[
                { label: 'Título', key: 'titulo', placeholder: 'Ej: Ep1. Tu primera comisión' },
                { label: 'Descripción', key: 'descripcion', placeholder: 'Descripción breve del módulo' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input type="text" placeholder={placeholder}
                    value={(moduloEditando as unknown as Record<string, string>)[key] ?? ''}
                    onChange={e => setModuloEditando(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Orden</label>
                  <input type="number" min={0}
                    value={moduloEditando.orden}
                    onChange={e => setModuloEditando(prev => ({ ...prev, orden: parseInt(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                  <select value={moduloEditando.estado}
                    onChange={e => setModuloEditando(prev => ({ ...prev, estado: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300">
                    <option value="borrador">Borrador</option>
                    <option value="publicado">Publicado</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setModalModulo(false)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium">Cancelar</button>
              <button onClick={guardarModulo} disabled={guardando || !moduloEditando.titulo}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-2.5 rounded-lg text-sm font-medium">
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal lección */}
      {modalLeccion && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">{leccionEditando.id ? 'Editar lección' : 'Nueva lección'}</h3>
              <button onClick={() => setModalLeccion(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Título', key: 'titulo', placeholder: 'Título de la lección' },
                { label: 'Descripción', key: 'descripcion', placeholder: 'Descripción breve' },
                { label: 'URL del video (YouTube o Vimeo)', key: 'video_url', placeholder: 'https://youtube.com/watch?v=...' },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
                  <input type="text" placeholder={placeholder}
                    value={(leccionEditando as unknown as Record<string, string>)[key] ?? ''}
                    onChange={e => setLeccionEditando(prev => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Contenido / Notas</label>
                <textarea
                  placeholder="Texto, recursos, enlaces..."
                  rows={4}
                  value={leccionEditando.contenido ?? ''}
                  onChange={e => setLeccionEditando(prev => ({ ...prev, contenido: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Duración (minutos)</label>
                  <input type="number" min={0}
                    value={leccionEditando.duracion_min}
                    onChange={e => setLeccionEditando(prev => ({ ...prev, duracion_min: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Orden</label>
                  <input type="number" min={0}
                    value={leccionEditando.orden}
                    onChange={e => setLeccionEditando(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button onClick={() => setModalLeccion(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium">Cancelar</button>
              <button onClick={() => guardarLeccion(modalLeccion)} disabled={guardando || !leccionEditando.titulo}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-2.5 rounded-lg text-sm font-medium">
                {guardando ? 'Guardando...' : 'Guardar lección'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
