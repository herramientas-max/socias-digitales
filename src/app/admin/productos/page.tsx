import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductosAdmin from './ProductosAdmin'

export default async function ProductosAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') redirect('/perfil')

  const [{ data: productos }, { data: config }] = await Promise.all([
    supabase.from('productos').select('*').order('orden'),
    supabase.from('configuracion').select('*'),
  ])

  const cotizacion = Number(config?.find(c => c.clave === 'cotizacion_dolar')?.valor ?? 1000)

  return <ProductosAdmin productos={productos ?? []} cotizacion={cotizacion} />
}
