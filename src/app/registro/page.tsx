'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function RegistroForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tipo = searchParams.get('tipo') // 'afiliada' o null
  const esAfiliada = tipo === 'afiliada'

  const supabase = createClient()

  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nombre }
      }
    })

    if (signUpError) {
      setError('No se pudo crear la cuenta. Verificá que el email no esté registrado.')
      setLoading(false)
      return
    }

    if (data.user) {
      // Crear perfil con el rol correcto
      await supabase.from('perfiles').upsert({
        id: data.user.id,
        nombre,
        email,
        rol: esAfiliada ? 'afiliada_lanzamiento' : 'alumna',
      })
    }

    // Redirigir según tipo
    if (esAfiliada) {
      router.push('/lanzamiento')
    } else {
      router.push('/perfil')
    }
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo */}
      <div className="hidden lg:block flex-1 relative overflow-hidden">
        <img src="/banner-login.jpeg" alt="Socias Digitales" className="w-full h-full object-cover" />
      </div>

      {/* Panel derecho */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12" style={{ background: '#FFDBE5' }}>

        <div className="w-full max-w-sm">
          {esAfiliada && (
            <div className="mb-6 rounded-2xl px-4 py-3 text-sm font-semibold text-center"
              style={{ background: 'linear-gradient(135deg, #E27396, #337357)', color: 'white' }}>
              🚀 Acceso exclusivo afiliadas Socias Digitales
            </div>
          )}

          <div className="mb-8">
            <h1 className="text-3xl font-bold" style={{ color: '#337357' }}>
              {esAfiliada ? 'Crear tu acceso' : 'Crear cuenta'}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6D9F71' }}>
              {esAfiliada
                ? 'Ingresá tus datos para acceder al escritorio de lanzamiento'
                : 'Completá tus datos para empezar'}
            </p>
          </div>

          <form onSubmit={handleRegistro} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>Nombre</label>
              <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none bg-white"
                style={{ borderColor: '#EA9AB2' }} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none bg-white"
                style={{ borderColor: '#EA9AB2' }} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none bg-white"
                style={{ borderColor: '#EA9AB2' }} />
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#fff0f3', color: '#E27396', border: '1px solid #EA9AB2' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-opacity disabled:opacity-60 text-sm tracking-wide"
              style={{ background: 'linear-gradient(135deg, #E27396, #337357)' }}>
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: '#6D9F71' }}>
            ¿Ya tenés cuenta?{' '}
            <a href="/login" className="font-bold underline">Ingresá acá</a>
          </p>
        </div>
      </div>

    </div>
  )
}

export default function RegistroPage() {
  return (
    <Suspense>
      <RegistroForm />
    </Suspense>
  )
}
