import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') return NextResponse.json({ error: 'Sin permisos' }, { status: 403 })

  const { emails } = await request.json()
  if (!emails || !Array.isArray(emails)) return NextResponse.json({ error: 'Lista de emails inválida' }, { status: 400 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resultados: { email: string; ok: boolean; mensaje: string }[] = []

  for (const email of emails) {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !trimmed.includes('@')) continue

    const { error } = await admin.auth.admin.inviteUserByEmail(trimmed, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://socias-digitales.vercel.app'}/auth/callback`,
      data: { password_set: false },
    })

    if (error) {
      console.error('Error invitando', trimmed, error)
      resultados.push({ email: trimmed, ok: false, mensaje: error.message || error.code || JSON.stringify(error) || 'Error desconocido' })
    } else {
      resultados.push({ email: trimmed, ok: true, mensaje: 'Invitación enviada' })
    }
  }

  return NextResponse.json({ resultados })
}
