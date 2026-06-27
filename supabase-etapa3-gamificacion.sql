-- =============================================
-- ETAPA 3: Sistema de Gamificación
-- =============================================

-- Tabla maestra de insignias disponibles
create table if not exists public.insignias (
  id text primary key,
  nombre text not null,
  descripcion text,
  emoji text not null,
  categoria text not null, -- 'ventas' | 'actividad' | 'especial'
  umbral numeric, -- para insignias de ventas, el monto requerido
  orden integer default 0
);

-- Insignias ganadas por cada alumna
create table if not exists public.insignias_alumnas (
  id uuid default gen_random_uuid() primary key,
  alumna_id uuid references public.perfiles(id) on delete cascade,
  insignia_id text references public.insignias(id),
  fecha_obtenida timestamp with time zone default now(),
  unique(alumna_id, insignia_id)
);

-- Racha de días conectadas
alter table public.perfiles
  add column if not exists racha_dias integer default 0,
  add column if not exists racha_maxima integer default 0,
  add column if not exists ventas_total numeric(10,2) default 0,
  add column if not exists comisiones_total numeric(10,2) default 0,
  add column if not exists modulos_completados integer default 0;

-- RLS
alter table public.insignias enable row level security;
alter table public.insignias_alumnas enable row level security;

create policy "Todas ven insignias"
  on public.insignias for select using (true);

create policy "Alumna ve sus insignias"
  on public.insignias_alumnas for select
  using (alumna_id = auth.uid() or public.es_admin());

create policy "Admin gestiona insignias alumnas"
  on public.insignias_alumnas for all
  using (public.es_admin());

-- =============================================
-- DATOS: Insignias predefinidas
-- =============================================
insert into public.insignias (id, nombre, descripcion, emoji, categoria, umbral, orden) values
  ('primera_comision',  'Primera comisión',   'Generaste tu primera venta como afiliada',  '🥉', 'ventas', 1,      1),
  ('ventas_100',        '$100 USD',           'Acumulaste $100 en comisiones',             '🥉', 'ventas', 100,    2),
  ('ventas_500',        '$500 USD',           'Acumulaste $500 en comisiones',             '🥈', 'ventas', 500,    3),
  ('ventas_1000',       '$1.000 USD',         'Acumulaste $1.000 en comisiones',           '🥇', 'ventas', 1000,   4),
  ('ventas_5000',       '$5.000 USD',         'Acumulaste $5.000 en comisiones',           '💎', 'ventas', 5000,   5),
  ('ventas_10000',      '$10.000 USD',        'Acumulaste $10.000 en comisiones',          '👑', 'ventas', 10000,  6),
  ('ventas_25000',      '$25.000 USD',        'Acumulaste $25.000 en comisiones',          '🚀', 'ventas', 25000,  7),
  ('ventas_50000',      '$50.000 USD',        'Acumulaste $50.000 en comisiones',          '🔥', 'ventas', 50000,  8),
  ('primer_modulo',     'Primer módulo',      'Completaste tu primer módulo del curso',    '📚', 'actividad', null, 9),
  ('primer_webinar',    'Primer webinar',     'Asististe a tu primer webinar en vivo',     '🎥', 'actividad', null, 10),
  ('primer_resultado',  'Primer resultado',   'Publicaste tu primer resultado',             '🌟', 'actividad', null, 11),
  ('racha_7',           '7 días seguidos',    'Ingresaste 7 días consecutivos',            '🔑', 'actividad', null, 12),
  ('racha_30',          '30 días seguidos',   'Ingresaste 30 días consecutivos',           '💫', 'actividad', null, 13),
  ('top_mes',           'Top del mes',        'Fuiste la colaboradora top del mes',         '🏆', 'especial', null, 14)
on conflict (id) do nothing;

-- =============================================
-- FUNCIÓN: asignar insignias de ventas automáticamente
-- =============================================
create or replace function public.asignar_insignias_ventas(p_alumna_id uuid)
returns void as $$
declare
  total_comisiones numeric;
  ins record;
begin
  select coalesce(sum(comision), 0) into total_comisiones
  from public.ventas_afiliadas
  where afiliada_id = p_alumna_id and estado != 'cancelada';

  update public.perfiles set comisiones_total = total_comisiones where id = p_alumna_id;

  for ins in
    select * from public.insignias
    where categoria = 'ventas' and umbral is not null and umbral <= total_comisiones
  loop
    insert into public.insignias_alumnas (alumna_id, insignia_id)
    values (p_alumna_id, ins.id)
    on conflict do nothing;
  end loop;
end;
$$ language plpgsql security definer;
