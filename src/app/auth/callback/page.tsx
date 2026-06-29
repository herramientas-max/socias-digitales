'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        const hash = window.location.hash
        if (hash.includes('type=invite')) {
          router.push('/crear-contrasena')
        } else {
          router.push('/perfil')
        }
      }
    })

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const session = data.session
      if (session) {
        const hash = window.location.hash
        if (hash.includes('type=invite')) {
          router.push('/crear-contrasena')
        } else {
          router.push('/perfil')
        }
      }
    })

    return () => subscription.unsubscribe()
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
