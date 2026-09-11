'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function RegistroForm() {
  const router = useRouter()
  const params = useSearchParams()
  const tipo = params.get('tipo') // 'afiliada' o null
  const esAfiliada = tipo === 'afiliada'

  const supabase = createClient()
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [instagram, setInstagram] = useState('')
  const [pais, setPais] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegistro(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre, rol: esAfiliada ? 'afiliada_lanzamiento' : 'alumna' } }
    })

    if (signUpError) {
      setError('No se pudo crear la cuenta. Verificá que el email no esté registrado.')
      setLoading(false)
      return
    }

    if (data.user) {
      // Guardar perfil
      await supabase.from('perfiles').upsert({
        id: data.user.id,
        nombre,
        email,
        instagram: instagram || null,
        pais: pais || null,
        rol: esAfiliada ? 'afiliada_lanzamiento' : 'alumna',
      })
    }

    router.push(esAfiliada ? '/lanzamiento' : '/perfil')
  }

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center px-12"
        style={{ background: 'linear-gradient(135deg, #E27396, #337357)' }}>
        <img src="/logo.png" alt="Socias Digitales" style={{ width: 100, height: 100, objectFit: 'contain' }} className="mb-6" />
        <h2 className="text-white font-black text-3xl text-center leading-tight">
          {esAfiliada ? 'Escritorio de afiliadas 🚀' : 'Bienvenida a Socias Digitales'}
        </h2>
        <p className="text-white opacity-80 text-center mt-3 text-sm">
          {esAfiliada
            ? 'Creá tu cuenta para acceder al escritorio exclusivo del lanzamiento.'
            : 'Creá tu cuenta para empezar a aprender y ganar.'}
        </p>
      </div>

      {/* Panel derecho */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12" style={{ background: '#FFDBE5' }}>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-black" style={{ color: '#337357' }}>
              {esAfiliada ? 'Acceso afiliadas 🚀' : 'Crear cuenta'}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#6D9F71' }}>
              Completá tus datos para continuar
            </p>
          </div>

          <form onSubmit={handleRegistro} className="space-y-4">

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>Nombre completo</label>
              <input type="text" required value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:outline-none bg-white"
                style={{ borderColor: '#EA9AB2' }} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:outline-none bg-white"
                style={{ borderColor: '#EA9AB2' }} />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>Contraseña</label>
              <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:outline-none bg-white"
                style={{ borderColor: '#EA9AB2' }} />
            </div>

            {esAfiliada && (
              <>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>Instagram</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">@</span>
                    <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)}
                      placeholder="tuusuario"
                      className="w-full border-2 rounded-xl pl-9 pr-4 py-3 text-gray-900 focus:outline-none bg-white"
                      style={{ borderColor: '#EA9AB2' }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>País</label>
                  <input type="text" value={pais} onChange={e => setPais(e.target.value)}
                    placeholder="Argentina, México, España..."
                    className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 focus:outline-none bg-white"
                    style={{ borderColor: '#EA9AB2' }} />
                </div>
              </>
            )}

            {error && (
              <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#fff0f3', color: '#E27396', border: '1px solid #EA9AB2' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full text-white font-bold py-3.5 rounded-xl disabled:opacity-60 text-sm tracking-wide mt-2"
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
