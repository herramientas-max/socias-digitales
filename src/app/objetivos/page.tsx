import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ObjetivosCliente from './ObjetivosCliente'

export default async function ObjetivosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: objetivo } = await supabase
    .from('objetivos')
    .select('*')
    .eq('alumna_id', user.id)
    .maybeSingle()

  return <ObjetivosCliente userId={user.id} objetivoGuardado={objetivo} />
}
