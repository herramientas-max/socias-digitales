'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Leccion { id: string }

interface Modulo {
  id: string
  titulo: string
  descripcion: string | null
  imagen_url: string | null
  orden: number
  lecciones: Leccion[]
}

interface Perfil {
  nombre: string | null
  avatar_url: string | null
  rol: string
}

interface Props {
  modulos: Modulo[]
  leccionesCompletadas: Set<string>
  perfil: Perfil | null
  esAdmin: boolean
}

const COLORES_GRADIENTE = [
  'from-violet-500 to-purple-700',
  'from-rose-500 to-pink-700',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-700',
  'from-sky-500 to-blue-700',
  'from-fuchsia-500 to-pink-700',
]

export default function ClassroomCliente({ modulos, leccionesCompletadas, perfil, esAdmin }: Props) {
  const router = useRouter()
  const supabase = createClient()

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function calcularProgreso(modulo: Modulo) {
    if (!modulo.lecciones.length) return 0
    const completadas = modulo.lecciones.filter(l => leccionesCompletadas.has(l.id)).length
    return Math.round((completadas / modulo.lecciones.length) * 100)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav estilo Skool */}
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <span className="font-bold text-rose-600 text-lg">Socias Digitales</span>
            <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500">
              <a href="/comunidad" className="px-3 py-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Comunidad</a>
              <a href="/classroom" className="px-3 py-1.5 text-gray-900 font-semibold border-b-2 border-rose-500">Classroom</a>
              <a href="/ranking" className="px-3 py-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Ranking</a>
              <a href="/logros" className="px-3 py-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Logros</a>
              {esAdmin && <a href="/admin" className="px-3 py-1.5 hover:text-gray-900 hover:bg-gray-100 rounded-lg">Admin</a>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/perfil">
              {perfil?.avatar_url
                ? <img src={perfil.avatar_url} className="w-8 h-8 rounded-full object-cover" alt="" />
                : <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-sm">🌸</div>
              }
            </a>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Classroom</h1>
            <p className="text-gray-500 text-sm mt-1">{modulos.length} módulos disponibles</p>
          </div>
          {esAdmin && (
            <a href="/admin/classroom"
              className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              + Gestionar módulos
            </a>
          )}
        </div>

        {modulos.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-lg font-medium">Próximamente</p>
            <p className="text-sm mt-1">Los módulos del curso aparecerán acá</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {modulos.map((modulo, i) => {
              const progreso = calcularProgreso(modulo)
              const gradiente = COLORES_GRADIENTE[i % COLORES_GRADIENTE.length]
              const completadas = modulo.lecciones.filter(l => leccionesCompletadas.has(l.id)).length

              return (
                <a key={modulo.id} href={`/classroom/${modulo.id}`}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer">

                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden">
                    {modulo.imagen_url ? (
                      <img
                        src={modulo.imagen_url}
                        alt={modulo.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${gradiente} flex items-center justify-center`}>
                        <span className="text-white font-black text-6xl opacity-30">{modulo.orden + 1}</span>
                      </div>
                    )}
                    {/* Número del episodio */}
                    <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-lg">
                      Ep {modulo.orden + 1}
                    </div>
                    {/* Badge completado */}
                    {progreso === 100 && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        ✓ Completado
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 text-base leading-snug mb-1 group-hover:text-rose-600 transition-colors">
                      {modulo.titulo}
                    </h3>
                    {modulo.descripcion && (
                      <p className="text-gray-500 text-sm line-clamp-2 mb-3">{modulo.descripcion}</p>
                    )}

                    {/* Progreso */}
                    <div className="space-y-1">
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-rose-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${progreso}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{progreso}%</span>
                        <span>{completadas}/{modulo.lecciones.length} lecciones</span>
                      </div>
                    </div>
                  </div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
