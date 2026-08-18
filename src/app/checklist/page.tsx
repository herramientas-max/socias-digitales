import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ChecklistCliente from './ChecklistCliente'

export default async function ChecklistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const hoy = new Date().toISOString().split('T')[0]

  const { data: tareas } = await supabase
    .from('checklist_tareas')
    .select('*')
    .eq('alumna_id', user.id)
    .eq('fecha', hoy)
    .order('creado_en')

  return <ChecklistCliente tareas={tareas ?? []} userId={user.id} fecha={hoy} />
}
