'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos. Verificá tus datos.')
      setLoading(false)
      return
    }

    router.push('/perfil')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">

      {/* Panel izquierdo — marca */}
      <div className="hidden lg:flex flex-col items-center justify-center flex-1 relative overflow-hidden"
        style={{ background: '#faf7f4' }}>

        {/* Círculo decorativo SVG */}
        <div className="relative flex items-center justify-center" style={{ width: 480, height: 480 }}>
          <svg className="absolute inset-0" width="480" height="480" viewBox="0 0 480 480">
            <circle cx="240" cy="240" r="195" fill="none" stroke="#E27396" strokeWidth="1" strokeDasharray="6 6" opacity="0.4" />
          </svg>

            {/* Arriba centro — auriculares + libro */}
          <div className="absolute" style={{ top: 4, left: '50%', transform: 'translateX(-50%)' }}>
            <img src="/item1.png" alt="" style={{width:110,height:110,objectFit:"contain",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.1))"}} />
          </div>
          {/* Arriba derecha — birrete */}
          <div className="absolute" style={{ top: 60, right: 28 }}>
            <img src="/item4.png" alt="" style={{width:110,height:110,objectFit:"contain",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.1))"}} />
          </div>
          {/* Abajo derecha — laptop */}
          <div className="absolute" style={{ bottom: 60, right: 28 }}>
            <img src="/item5.png" alt="" style={{width:110,height:110,objectFit:"contain",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.1))"}} />
          </div>
          {/* Abajo centro — chica meditando */}
          <div className="absolute" style={{ bottom: 4, left: '50%', transform: 'translateX(-50%)' }}>
            <img src="/item3.png" alt="" style={{width:110,height:110,objectFit:"contain",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.1))"}} />
          </div>
          {/* Abajo izquierda — dinero */}
          <div className="absolute" style={{ bottom: 60, left: 28 }}>
            <img src="/item2.png" alt="" style={{width:110,height:110,objectFit:"contain",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.1))"}} />
          </div>
          {/* Arriba izquierda — libros */}
          <div className="absolute" style={{ top: 60, left: 28 }}>
            <img src="/item6.png" alt="" style={{width:110,height:110,objectFit:"contain",filter:"drop-shadow(0 2px 4px rgba(0,0,0,0.1))"}} />
          </div>

          {/* Logo central */}
          <div className="relative z-10 flex flex-col items-center">
            <img src="/logo.png" alt="Socias Digitales" style={{width:180,height:180,objectFit:"contain"}} />
            <p className="text-xs mt-2 tracking-[0.2em] uppercase" style={{ color: '#6D9F71' }}>Tu comunidad digital</p>
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-col items-center justify-center flex-1 px-6 py-12" style={{ background: '#FFDBE5' }}>

        {/* Logo mobile (solo visible en pantallas chicas) */}
        <div className="lg:hidden mb-8 text-center">
          <div className="bg-white rounded-2xl p-5 shadow-md inline-block mb-3">
            <img src="/logo.png" alt="Socias Digitales" style={{width:80,height:80,objectFit:"contain"}} />
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold" style={{ color: '#337357' }}>
                Bienvenida a Socias Digitales
              </h1>
              <img src="/item2.png" alt="" style={{ width: 64, height: 64, objectFit: 'contain', mixBlendMode: 'multiply' }} />
            </div>
            <p className="text-sm" style={{ color: '#6D9F71' }}>
              Ingresá con el mail que realizaste la compra para ingresar
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition-colors bg-white"
                style={{ borderColor: '#EA9AB2' }}
                onFocus={e => e.target.style.borderColor = '#E27396'}
                onBlur={e => e.target.style.borderColor = '#EA9AB2'}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: '#337357' }}>
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border-2 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none transition-colors bg-white"
                style={{ borderColor: '#EA9AB2' }}
                onFocus={e => e.target.style.borderColor = '#E27396'}
                onBlur={e => e.target.style.borderColor = '#EA9AB2'}
              />
            </div>

            {error && (
              <p className="text-sm rounded-xl px-4 py-3" style={{ background: '#fff0f3', color: '#E27396', border: '1px solid #EA9AB2' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3.5 rounded-xl transition-opacity disabled:opacity-60 text-sm tracking-wide"
              style={{ background: 'linear-gradient(135deg, #E27396, #337357)' }}
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: '#6D9F71' }}>
            ¿Problemas para ingresar? Contactá a tu administradora.
          </p>
        </div>
      </div>

    </div>
  )
}
