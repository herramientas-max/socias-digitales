'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Si viene de una invitación, mandar a crear contraseña
        const hash = window.location.hash
        if (hash.includes('type=invite')) {
          router.push('/crear-contrasena')
        } else {
          router.push('/perfil')
        }
      }
    })

    // También chequear si ya hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const hash = window.location.hash
        if (hash.includes('type=invite')) {
          router.push('/crear-contrasena')
        } else {
          router.push('/perfil')
        }
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFDBE5' }}>
      <div className="text-center">
        <img src="/logo.png" alt="Socias Digitales" style={{ height: 60, objectFit: 'contain', margin: '0 auto 20px' }} />
        <p className="text-gray-600 font-medium">Verificando tu acceso...</p>
      </div>
    </div>
  )
}
