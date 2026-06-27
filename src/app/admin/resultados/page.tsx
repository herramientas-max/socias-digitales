import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResultadosAdmin from './ResultadosAdmin'

export default async function ResultadosAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') redirect('/perfil')

  const { data: resultados } = await supabase
    .from('resultados')
    .select('*, perfiles(nombre, avatar_url)')
    .order('created_at', { ascending: false })

  return <ResultadosAdmin resultados={resultados ?? []} />
}
