import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogrosCliente from './LogrosCliente'

export default async function LogrosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: perfil }, { data: todasInsignias }, { data: misInsignias }] = await Promise.all([
    supabase.from('perfiles').select('*').eq('id', user.id).single(),
    supabase.from('insignias').select('*').order('orden'),
    supabase.from('insignias_alumnas').select('insignia_id, fecha_obtenida').eq('alumna_id', user.id),
  ])

  return (
    <LogrosCliente
      perfil={perfil}
      todasInsignias={todasInsignias ?? []}
      misInsignias={misInsignias ?? []}
    />
  )
}
