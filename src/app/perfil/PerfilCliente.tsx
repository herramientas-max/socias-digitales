'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface Perfil {
  id: string
  nombre: string
  avatar_url: string | null
  progreso: number
  rol: string
  fecha_nacimiento: string | null
  ocupacion: string | null
  titulo_profesional: string | null
  es_mama: boolean | null
  ingresos_actuales: string | null
  pais: string | null
  provincia: string | null
}

interface Props {
  user: User
  perfil: Perfil | null
}

const OCUPACIONES = [
  'Estudiante',
  'Trabajo en relación de dependencia',
  'Emprendedora',
  'Profesional',
  'Desocupada',
]

const INGRESOS = [
  'Sin ingresos',
  'Menos de USD 500/mes',
  'USD 500 - 1.000/mes',
  'USD 1.000 - 3.000/mes',
  'Más de USD 3.000/mes',
]

export default function PerfilCliente({ user, perfil }: Props) {
  const router = useRouter()
  const supabase = createClient()

  const [nombre, setNombre] = useState(perfil?.nombre ?? '')
  const [fechaNacimiento, setFechaNacimiento] = useState(perfil?.fecha_nacimiento ?? '')
  const [ocupacion, setOcupacion] = useState(perfil?.ocupacion ?? '')
  const [tituloProfesional, setTituloProfesional] = useState(perfil?.titulo_profesional ?? '')
  const [esMama, setEsMama] = useState<boolean | null>(perfil?.es_mama ?? null)
  const [ingresosActuales, setIngresosActuales] = useState(perfil?.ingresos_actuales ?? '')
  const [pais, setPais] = useState(perfil?.pais ?? '')
  const [provincia, setProvincia] = useState(perfil?.provincia ?? '')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(perfil?.avatar_url ?? null)
  const [editando, setEditando] = useState(!perfil?.nombre)
  const [bannerProximamente, setBannerProximamente] = useState(false)

  const searchParams = useSearchParams()
  useEffect(() => {
    if (searchParams.get('proximamente') === '1') {
      setBannerProximamente(true)
      setTimeout(() => setBannerProximamente(false), 4000)
    }
  }, [searchParams])

  const progreso = perfil?.progreso ?? 0
  const esAdmin = perfil?.rol === 'admin'

  async function guardarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')

    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre,
        avatar_url: avatarUrl,
        fecha_nacimiento: fechaNacimiento || null,
        ocupacion: ocupacion || null,
        titulo_profesional: ocupacion === 'Profesional' ? tituloProfesional : null,
        es_mama: esMama,
        ingresos_actuales: ingresosActuales || null,
        pais: pais || null,
        provincia: provincia || null,
      })
      .eq('id', user.id)

    if (error) {
      setMensaje('Error al guardar. Intentá de nuevo.')
    } else {
      setMensaje('¡Perfil guardado con éxito!')
      setTimeout(() => { setEditando(false); setMensaje('') }, 1200)
    }
    setGuardando(false)
  }

  async function subirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setSubiendoFoto(true)
    const extension = archivo.name.split('.').pop()
    const nombreArchivo = `${user.id}.${extension}`
    const { error } = await supabase.storage.from('avatars').upload(nombreArchivo, archivo, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(nombreArchivo)
      setAvatarUrl(data.publicUrl)
    }
    setSubiendoFoto(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-400"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <img src="/logo.png" alt="Socias Digitales" style={{ height: 36, objectFit: 'contain' }} />
        <div className="flex items-center gap-4">
          <a href="/metricas" className="text-sm text-rose-600 hover:text-rose-800 font-medium hidden sm:block">Métricas</a>
          <a href="/productos" className="text-sm text-rose-600 hover:text-rose-800 font-medium hidden sm:block">Productos</a>
          {esAdmin && <a href="/admin" className="text-sm text-rose-600 hover:text-rose-800 font-medium">Panel Admin</a>}
          <button onClick={cerrarSesion} className="text-sm text-gray-500 hover:text-gray-800">Cerrar sesión</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">

        {/* Banner próximamente */}
        {bannerProximamente && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-center gap-3">
            <span className="text-2xl">🔒</span>
            <div>
              <p className="font-bold text-amber-800 text-sm">Sección en preparación</p>
              <p className="text-xs text-amber-600 mt-0.5">Esa sección estará disponible muy pronto. Por ahora podés completar tu perfil y cargar tus métricas.</p>
            </div>
          </div>
        )}

        {/* Tarjeta compacta de perfil */}
        {!editando && nombre ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} className="w-16 h-16 rounded-full object-cover border-4 border-rose-200" alt="" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-rose-100 border-4 border-rose-200 flex items-center justify-center text-3xl">🌸</div>
              )}
              <div>
                <p className="font-bold text-gray-900 text-lg">{nombre}</p>
                {(pais || provincia) && (
                  <p className="text-sm text-gray-500">📍 {[provincia, pais].filter(Boolean).join(', ')}</p>
                )}
                {ocupacion && <p className="text-xs text-rose-500 mt-0.5">{ocupacion}</p>}
              </div>
            </div>
            <button onClick={() => setEditando(true)}
              className="text-sm text-rose-600 hover:text-rose-800 font-medium border border-rose-200 rounded-lg px-4 py-2 hover:bg-rose-50 transition-colors">
              Editar perfil
            </button>
          </div>
        ) : null}

        {/* Accesos rápidos para alumnas */}
        <div className="grid grid-cols-2 gap-4">
          {/* Mi perfil */}
          <button onClick={() => setEditando(true)}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:border-rose-300 hover:shadow-md transition-all group overflow-hidden w-full">
            <img src="/banner-perfil.png" alt="Mi perfil" style={{ width: '100%', height: 140, objectFit: 'cover' }} className="group-hover:scale-105 transition-transform" />
            <div className="p-4 pt-3">
              <p className="font-bold text-gray-800 text-base">Mi perfil</p>
              <p className="text-xs text-gray-400 mt-1">Completá tus datos</p>
            </div>
          </button>

          {/* Métricas */}
          <a href="/metricas"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:border-rose-300 hover:shadow-md transition-all group overflow-hidden">
            <img src="/carpeta-metricas.png" alt="Métricas" style={{ width: '100%', height: 140, objectFit: 'cover' }} className="group-hover:scale-105 transition-transform" />
            <div className="p-4 pt-3">
              <p className="font-bold text-gray-800 text-base">Métricas</p>
              <p className="text-xs text-gray-400 mt-1">Analizá tus resultados</p>
            </div>
          </a>

          {/* Productos — activo */}
          <a href="/productos"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:border-rose-300 hover:shadow-md transition-all group overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="text-5xl mb-3">🛍️</div>
            <p className="font-bold text-gray-800 text-base">Productos</p>
            <p className="text-xs text-gray-400 mt-1">Tu catálogo de afiliada</p>
          </a>

          {/* Resultados — activo */}
          <a href="/resultados"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:border-rose-300 hover:shadow-md transition-all group overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="text-5xl mb-3">🏆</div>
            <p className="font-bold text-gray-800 text-base">Mis resultados</p>
            <p className="text-xs text-gray-400 mt-1">Cargá tus comisiones</p>
          </a>

          {/* Comunidad — activa */}
          <a href="/comunidad"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:border-rose-300 hover:shadow-md transition-all group overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="text-5xl mb-3">💬</div>
            <p className="font-bold text-gray-800 text-base">Comunidad</p>
            <p className="text-xs text-gray-400 mt-1">Muro de resultados</p>
          </a>

          {/* Programa — activo */}
          <a href="/classroom"
            className="bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:border-rose-300 hover:shadow-md transition-all group overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="text-5xl mb-3">📚</div>
            <p className="font-bold text-gray-800 text-base">Programa</p>
            <p className="text-xs text-gray-400 mt-1">Socias Digitales</p>
          </a>
        </div>

        {/* Formulario de perfil (colapsable) */}
        {editando && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mi Perfil</h2>
            {nombre && (
              <button onClick={() => setEditando(false)} className="text-sm text-gray-400 hover:text-gray-600">✕ Cerrar</button>
            )}
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-28 h-28 mb-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Foto de perfil" className="w-28 h-28 rounded-full object-cover border-4 border-rose-200" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-rose-100 border-4 border-rose-200 flex items-center justify-center text-5xl">🌸</div>
              )}
            </div>
            <label className="cursor-pointer text-sm text-rose-600 hover:text-rose-800 font-medium">
              {subiendoFoto ? 'Subiendo...' : 'Cambiar foto'}
              <input type="file" accept="image/*" onChange={subirFoto} className="hidden" />
            </label>
          </div>

          <form onSubmit={guardarPerfil} className="space-y-5">

            {/* Nombre */}
            <div>
              <label className={labelClass}>Nombre completo</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" className={inputClass} />
            </div>

            {/* Email */}
            <div>
              <label className={labelClass}>Email</label>
              <input type="email" value={user.email ?? ''} disabled className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-500 bg-gray-50" />
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label className={labelClass}>Fecha de nacimiento</label>
              <input type="date" value={fechaNacimiento} onChange={e => setFechaNacimiento(e.target.value)} className={inputClass} />
            </div>

            {/* Ocupación */}
            <div>
              <label className={labelClass}>Ocupación</label>
              <select value={ocupacion} onChange={e => setOcupacion(e.target.value)} className={inputClass}>
                <option value="">Seleccioná una opción</option>
                {OCUPACIONES.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* Título profesional (solo si es Profesional) */}
            {ocupacion === 'Profesional' && (
              <div>
                <label className={labelClass}>¿Cuál es tu título?</label>
                <input type="text" value={tituloProfesional} onChange={e => setTituloProfesional(e.target.value)} placeholder="Ej: Licenciada en Administración" className={inputClass} />
              </div>
            )}

            {/* ¿Sos mamá? */}
            <div>
              <label className={labelClass}>¿Sos mamá?</label>
              <div className="flex gap-4">
                <button type="button" onClick={() => setEsMama(true)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${esMama === true ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500 hover:border-rose-300'}`}>
                  Sí 🤱
                </button>
                <button type="button" onClick={() => setEsMama(false)}
                  className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${esMama === false ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-200 text-gray-500 hover:border-rose-300'}`}>
                  No
                </button>
              </div>
            </div>

            {/* Ingresos actuales */}
            <div>
              <label className={labelClass}>Ingresos actuales</label>
              <select value={ingresosActuales} onChange={e => setIngresosActuales(e.target.value)} className={inputClass}>
                <option value="">Seleccioná una opción</option>
                {INGRESOS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>

            {/* País */}
            <div>
              <label className={labelClass}>País</label>
              <input type="text" value={pais} onChange={e => setPais(e.target.value)} placeholder="Ej: Argentina" className={inputClass} />
            </div>

            {/* Provincia */}
            <div>
              <label className={labelClass}>Provincia / Estado</label>
              <input type="text" value={provincia} onChange={e => setProvincia(e.target.value)} placeholder="Ej: Buenos Aires" className={inputClass} />
            </div>

            {/* Progreso */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Progreso del curso</label>
                <span className="text-sm font-bold text-rose-600">{progreso}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div className="bg-rose-400 h-3 rounded-full transition-all" style={{ width: `${progreso}%` }} />
              </div>
            </div>

            {mensaje && (
              <p className={`text-sm rounded-lg px-3 py-2 ${mensaje.includes('Error') ? 'text-red-600 bg-red-50 border border-red-200' : 'text-green-700 bg-green-50 border border-green-200'}`}>
                {mensaje}
              </p>
            )}

            <button type="submit" disabled={guardando}
              className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-semibold py-2.5 rounded-lg transition-colors">
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
        )}
      </div>
    </div>
  )
}
