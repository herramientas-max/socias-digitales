import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const { userId, nombre, email, instagram, pais, rol } = await req.json()
  if (!userId || !rol) return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })

  const { error } = await supabaseAdmin.from('perfiles').upsert({
    id: userId,
    nombre,
    email,
    instagram: instagram || null,
    pais: pais || null,
    rol,
  }, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
