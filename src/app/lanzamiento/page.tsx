import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LanzamientoCliente from './LanzamientoCliente'

export default async function LanzamientoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('nombre, rol')
    .eq('id', user.id)
    .maybeSingle()

  return <LanzamientoCliente nombre={perfil?.nombre ?? ''} />
}
