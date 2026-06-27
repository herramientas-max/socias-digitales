import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PerfilCliente from './PerfilCliente'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <PerfilCliente user={user} perfil={perfil} />
}
