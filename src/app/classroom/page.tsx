import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ClassroomCliente from './ClassroomCliente'

export default async function ClassroomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('perfiles').select('rol, nombre, avatar_url').eq('id', user.id).single()

  const { data: modulos } = await supabase
    .from('modulos')
    .select('*, lecciones(id)')
    .eq('estado', 'publicado')
    .order('orden')

  const { data: progresos } = await supabase
    .from('progreso_lecciones')
    .select('leccion_id')
    .eq('alumna_id', user.id)
    .eq('completada', true)

  const leccionesCompletadas = new Set(progresos?.map(p => p.leccion_id) ?? [])

  return (
    <ClassroomCliente
      modulos={modulos ?? []}
      leccionesCompletadas={leccionesCompletadas}
      perfil={perfil}
      esAdmin={perfil?.rol === 'admin'}
    />
  )
}
