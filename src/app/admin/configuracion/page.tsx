import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConfiguracionAdmin from './ConfiguracionAdmin'

export default async function ConfiguracionAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') redirect('/perfil')

  const { data: config } = await supabase.from('configuracion').select('*')
  const cotizacion = config?.find(c => c.clave === 'cotizacion_dolar')?.valor ?? '1000'

  return <ConfiguracionAdmin cotizacion={Number(cotizacion)} />
}
