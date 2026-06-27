import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvitarCliente from './InvitarCliente'

export default async function InvitarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') redirect('/perfil')

  return <InvitarCliente />
}
