-- =============================================
-- ETAPA 2: Ampliar tabla perfiles + pagos
-- =============================================

-- Ampliar tabla perfiles
alter table public.perfiles
  add column if not exists whatsapp text,
  add column if not exists pais text,
  add column if not exists plan text default 'basico',
  add column if not exists estado text default 'activa',
  add column if not exists ultimo_acceso timestamp with time zone,
  add column if not exists referido_por uuid references public.perfiles(id);

-- Tabla de pagos/suscripciones
create table if not exists public.pagos (
  id uuid default gen_random_uuid() primary key,
  alumna_id uuid references public.perfiles(id) on delete cascade,
  monto numeric(10,2) not null,
  moneda text default 'USD',
  concepto text,
  estado text default 'completado',
  fecha timestamp with time zone default now()
);

alter table public.pagos enable row level security;

create policy "Admin ve todos los pagos"
  on public.pagos for all
  using (public.es_admin());

-- Tabla de ventas de afiliadas
create table if not exists public.ventas_afiliadas (
  id uuid default gen_random_uuid() primary key,
  afiliada_id uuid references public.perfiles(id) on delete cascade,
  comprador_email text,
  monto numeric(10,2) not null,
  comision numeric(10,2) not null,
  estado text default 'pendiente',
  fecha timestamp with time zone default now()
);

alter table public.ventas_afiliadas enable row level security;

create policy "Admin ve todas las ventas"
  on public.ventas_afiliadas for all
  using (public.es_admin());

create policy "Afiliada ve sus ventas"
  on public.ventas_afiliadas for select
  using (afiliada_id = auth.uid());
