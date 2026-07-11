'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Clase {
  id: string
  titulo: string
  descripcion: string | null
  vimeo_url: string | null
  orden: number
  plan: '27' | '97'
  modulo: string
  activo: boolean
}

interface Perfil {
  nombre: string | null
  avatar_url: string | null
  rol: string
  plan: string | null
}

interface Props {
  clases: Clase[]
  planAlumna: string | null
  esAdmin: boolean
  perfil: Perfil | null
}

function vimeoEmbed(url: string) {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0` : null
}

export default function ClassroomCliente({ clases, planAlumna, esAdmin, perfil }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [claseAbierta, setClaseAbierta] = useState<Clase | null>(null)

  const tieneAcceso = (plan: string) => {
    if (esAdmin) return true
    if (!planAlumna) return false
    if (planAlumna === '97') return true
    return plan === '27'
  }

  // Agrupar por módulo
  const modulos = [...new Set(clases.map(c => c.modulo))]
  const totalDesbloqueadas = clases.filter(c => tieneAcceso(c.plan)).length
  const total = clases.length

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f0eb' }}>
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <img src="/logo.png" alt="Socias Digitales" style={{ height: 36, objectFit: 'contain' }} />
        <div className="flex items-center gap-4">
          <a href="/perfil" className="text-sm text-gray-500 hover:text-gray-800">← Mi perfil</a>
          {esAdmin && <a href="/admin/classroom" className="text-sm text-rose-600 font-medium">Gestionar clases</a>}
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-black" style={{ color: '#1a1a1a' }}>Programa Socias Digitales</h1>
          <p className="text-sm text-gray-500 mt-2">
            {totalDesbloqueadas} de {total} clases desbloqueadas
          </p>
        </div>

        {/* Badge de plan */}
        {!esAdmin && (
          <div className={`rounded-2xl px-5 py-4 flex items-center justify-between ${planAlumna ? 'bg-white' : 'bg-amber-50 border border-amber-200'}`}>
            {planAlumna ? (
              <>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Tu plan actual</p>
                  <p className="text-xl font-black mt-0.5" style={{ color: '#E27396' }}>
                    Socia ${planAlumna} USD
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{totalDesbloqueadas} clases</p>
                  <p className="text-xs font-semibold" style={{ color: '#337357' }}>desbloqueadas ✓</p>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm font-bold text-amber-800">No tenés un plan asignado todavía</p>
                <p className="text-xs text-amber-600 mt-0.5">Contactá a tu administradora para activar tu acceso</p>
              </div>
            )}
          </div>
        )}

        {/* Clases por módulo */}
        {modulos.map(modulo => {
          const clasesDelModulo = clases.filter(c => c.modulo === modulo)
          return (
            <div key={modulo} className="space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">{modulo}</h2>
              <div className="space-y-2">
                {clasesDelModulo.map((clase, i) => {
                  const desbloqueada = tieneAcceso(clase.plan)
                  return (
                    <div key={clase.id}
                      onClick={() => desbloqueada && clase.vimeo_url && setClaseAbierta(clase)}
                      className={`bg-white rounded-2xl p-4 flex items-center gap-4 transition-all ${desbloqueada ? 'cursor-pointer hover:shadow-md hover:border-rose-200 border border-transparent' : 'opacity-70 cursor-not-allowed border border-transparent'}`}>

                      {/* Número / candado */}
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm"
                        style={{ background: desbloqueada ? '#fce7f3' : '#f3f4f6', color: desbloqueada ? '#E27396' : '#9ca3af' }}>
                        {desbloqueada ? clase.orden + 1 : '🔒'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm ${desbloqueada ? 'text-gray-900' : 'text-gray-400'}`}>
                          {clase.titulo}
                        </p>
                        {clase.descripcion && (
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{clase.descripcion}</p>
                        )}
                      </div>

                      {/* Plan requerido si bloqueada */}
                      {!desbloqueada && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                          style={{ background: '#fce7f3', color: '#E27396' }}>
                          Plan $97
                        </span>
                      )}

                      {/* Play si desbloqueada */}
                      {desbloqueada && clase.vimeo_url && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: '#E27396' }}>
                          <span className="text-white text-xs">▶</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Upgrade banner si tiene $27 y hay clases de $97 */}
        {planAlumna === '27' && clases.some(c => c.plan === '97') && (
          <div className="rounded-3xl p-6 text-center" style={{ background: '#1a1a1a' }}>
            <p className="text-2xl mb-2">🚀</p>
            <p className="font-black text-white text-lg">Desbloqueá el curso completo</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">
              Con el plan Socia $97 accedés a {clases.filter(c => c.plan === '97').length} clases extra y contenido exclusivo
            </p>
            <span className="inline-block text-sm font-bold px-5 py-2.5 rounded-xl"
              style={{ background: '#E27396', color: 'white' }}>
              Contactá a tu administradora para hacer el upgrade
            </span>
          </div>
        )}

        {clases.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-bold text-gray-700">Las clases se están preparando</p>
            <p className="text-sm text-gray-400 mt-1">Muy pronto vas a poder empezar</p>
          </div>
        )}
      </div>

      {/* Modal reproductor */}
      {claseAbierta && claseAbierta.vimeo_url && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
          onClick={() => setClaseAbierta(null)}>
          <div className="w-full max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <p className="text-white font-bold">{claseAbierta.titulo}</p>
              <button onClick={() => setClaseAbierta(null)} className="text-white/70 hover:text-white text-2xl">✕</button>
            </div>
            <div className="relative rounded-2xl overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={vimeoEmbed(claseAbierta.vimeo_url) ?? ''}
                className="absolute inset-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
