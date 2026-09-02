import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  // Solo admin
  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).maybeSingle()
  if (perfil?.rol !== 'admin') return NextResponse.json({ error: 'Sin permiso' }, { status: 403 })

  const { title, body, url } = await req.json()

  // Traer todas las suscripciones
  const { data: subs } = await supabase.from('push_subscriptions').select('*')
  if (!subs || subs.length === 0) return NextResponse.json({ enviadas: 0 })

  const payload = JSON.stringify({ title, body, url: url || '/perfil' })

  let enviadas = 0
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
      enviadas++
    } catch {
      // Suscripción expirada — eliminar
      await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
    }
  }

  return NextResponse.json({ enviadas })
}
