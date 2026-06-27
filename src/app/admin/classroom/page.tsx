import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClassroomAdmin from './ClassroomAdmin'

export default async function ClassroomAdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).single()
  if (perfil?.rol !== 'admin') redirect('/perfil')

  const { data: modulos } = await supabase
    .from('modulos')
    .select('*, lecciones(id, titulo, orden, duracion_min)')
    .order('orden')

  return <ClassroomAdmin modulos={modulos ?? []} />
}
