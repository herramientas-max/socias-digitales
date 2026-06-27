import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MetricasCliente from './MetricasCliente'

export default async function MetricasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: historial } = await supabase
    .from('metricas')
    .select('*')
    .eq('alumna_id', user.id)
    .order('created_at', { ascending: false })

  return <MetricasCliente userId={user.id} historial={historial ?? []} />
}
