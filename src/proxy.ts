import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Rutas que requieren login
  const rutasProtegidas = ['/perfil', '/admin', '/metricas', '/classroom', '/productos', '/ranking', '/logros', '/comunidad', '/resultados']
  if (!user && rutasProtegidas.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si ya está logueada, redirigir de login a perfil
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/perfil', request.url))
  }

  // Si fue invitada y nunca creó su contraseña, forzarla antes de cualquier otra cosa
  const debeCrearContrasena = user?.user_metadata?.password_set === false
  const rutasExentas = ['/crear-contrasena', '/auth/callback', '/login']
  if (user && debeCrearContrasena && !rutasExentas.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/crear-contrasena', request.url))
  }

  // Rutas aún no habilitadas — redirigir a perfil con aviso
  const rutasProximamente = ['/classroom', '/ranking', '/logros', '/comunidad']
  if (user && rutasProximamente.some(r => pathname.startsWith(r))) {
    return NextResponse.redirect(new URL('/perfil?proximamente=1', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
