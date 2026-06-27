import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/perfil'

  const supabase = await createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(new URL(next, request.url))
  }

  if (token_hash && type === 'invite') {
    return NextResponse.redirect(new URL(`/crear-contrasena?token_hash=${token_hash}&type=${type}`, request.url))
  }

  return NextResponse.redirect(new URL('/login', request.url))
}
