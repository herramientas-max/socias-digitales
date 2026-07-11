import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClassroomCliente from './ClassroomCliente'

export default async function ClassroomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: perfil }, { data: clases }] = await Promise.all([
    supabase.from('perfiles').select('nombre, avatar_url, rol, plan').eq('id', user.id).single(),
    supabase.from('clases').select('*').eq('activo', true).order('orden'),
  ])

  return (
    <ClassroomCliente
      clases={clases ?? []}
      planAlumna={perfil?.plan ?? null}
      esAdmin={perfil?.rol === 'admin'}
      perfil={perfil}
    />
  )
}
