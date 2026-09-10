import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLanzamientoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase.from('perfiles').select('rol').eq('id', user.id).maybeSingle()
  if (perfil?.rol !== 'admin') redirect('/perfil')

  const { data: metricas } = await supabase
    .from('metricas_lanzamiento')
    .select('*, perfiles(nombre, email)')
    .order('actualizado_en', { ascending: false })

  const total = {
    grupo: metricas?.reduce((a, m) => a + (m.personas_grupo || 0), 0) ?? 0,
    seguimiento: metricas?.reduce((a, m) => a + (m.personas_seguimiento || 0), 0) ?? 0,
    ventas: metricas?.reduce((a, m) => a + (m.ventas_realizadas || 0), 0) ?? 0,
    inversion: metricas?.reduce((a, m) => a + (m.inversion || 0), 0) ?? 0,
  }

  return (
    <div className="min-h-screen" style={{ background: '#f5f0eb' }}>
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <img src="/logo.png" alt="Socias Digitales" style={{ height: 36, objectFit: 'contain' }} />
        <a href="/admin" className="text-sm text-gray-500 hover:text-gray-800">← Panel admin</a>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">

        <div>
          <h1 className="text-3xl font-black" style={{ color: '#1a1a1a' }}>📊 Métricas de lanzamiento</h1>
          <p className="text-sm text-gray-500 mt-1">{metricas?.length ?? 0} afiliadas con datos cargados</p>
        </div>

        {/* Totales */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total en grupo', value: total.grupo, emoji: '👥', color: '#337357' },
            { label: 'En seguimiento', value: total.seguimiento, emoji: '🎯', color: '#E27396' },
            { label: 'Ventas totales', value: total.ventas, emoji: '🏆', color: '#d97706' },
            { label: 'Inversión total', value: `$${total.inversion.toFixed(0)}`, emoji: '💰', color: '#7c3aed' },
          ].map(({ label, value, emoji, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-sm p-5 text-center">
              <p className="text-2xl mb-1">{emoji}</p>
              <p className="text-3xl font-black" style={{ color }}>{value}</p>
              <p className="text-xs text-gray-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabla por afiliada */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">Detalle por afiliada</h2>
          </div>
          {!metricas || metricas.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-400">
              <p className="text-3xl mb-2">📭</p>
              <p>Ninguna afiliada cargó métricas todavía.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: '#fafafa' }}>
                    <th className="text-left px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Afiliada</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Tráfico</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Inversión</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Grupo</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Seguimiento</th>
                    <th className="text-center px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide">Ventas</th>
                  </tr>
                </thead>
                <tbody>
                  {metricas.map((m: any) => (
                    <tr key={m.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-800">{m.perfiles?.nombre || '—'}</p>
                        <p className="text-xs text-gray-400">{m.perfiles?.email || ''}</p>
                        <p className="text-xs mt-0.5 font-medium" style={{ color: '#337357' }}>Valor $597 · Comisión 50%</p>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full"
                          style={{
                            background: m.tipo_trafico === 'pago' ? '#fef3c7' : '#f0fdf4',
                            color: m.tipo_trafico === 'pago' ? '#d97706' : '#337357',
                          }}>
                          {m.tipo_trafico === 'pago' ? '💰 Pago' : '🌱 Orgánico'}
                        </span>
                      </td>
                      <td className="text-center px-4 py-4 font-semibold text-gray-700">
                        {m.inversion > 0 ? `$${m.inversion}` : '—'}
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-lg font-black" style={{ color: '#337357' }}>{m.personas_grupo}</span>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-lg font-black" style={{ color: '#E27396' }}>{m.personas_seguimiento}</span>
                      </td>
                      <td className="text-center px-4 py-4">
                        <span className="text-lg font-black" style={{ color: '#d97706' }}>{m.ventas_realizadas}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
