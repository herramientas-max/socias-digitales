-- =============================================
-- ETAPA 6: Catálogo de productos y afiliadas
-- =============================================

create table if not exists public.productos (
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  descripcion text,
  tipo text not null, -- 'fisico' | 'digital'
  subtipo text, -- 'ebook' | 'membresia' | 'otro'
  precio numeric(10,2) not null,
  moneda text default 'USD',
  comision_pct numeric(5,2) not null default 20, -- % de comisión
  imagen_url text,
  link_compra text, -- link externo de venta
  activo boolean default true,
  orden integer default 0,
  created_at timestamp with time zone default now()
);

-- Links de afiliada por producto
create table if not exists public.links_afiliadas (
  id uuid default gen_random_uuid() primary key,
  afiliada_id uuid references public.perfiles(id) on delete cascade,
  producto_id uuid references public.productos(id) on delete cascade,
  codigo text unique not null, -- código único para tracking
  clicks integer default 0,
  ventas integer default 0,
  created_at timestamp with time zone default now(),
  unique(afiliada_id, producto_id)
);

-- Storage para imágenes de productos
insert into storage.buckets (id, name, public) values ('productos', 'productos', true) on conflict do nothing;
create policy "Ver imagenes productos" on storage.objects for select using (bucket_id = 'productos');
create policy "Admin sube imagenes productos" on storage.objects for insert with check (bucket_id = 'productos' and auth.role() = 'authenticated');
create policy "Admin actualiza imagenes productos" on storage.objects for update using (bucket_id = 'productos' and auth.role() = 'authenticated');

-- RLS
alter table public.productos enable row level security;
alter table public.links_afiliadas enable row level security;

create policy "Ver productos activos" on public.productos for select using (activo = true or public.es_admin());
create policy "Admin gestiona productos" on public.productos for all using (public.es_admin());

create policy "Ver propio link" on public.links_afiliadas for select using (afiliada_id = auth.uid() or public.es_admin());
create policy "Crear link afiliada" on public.links_afiliadas for insert with check (afiliada_id = auth.uid() or public.es_admin());
create policy "Actualizar link afiliada" on public.links_afiliadas for update using (afiliada_id = auth.uid() or public.es_admin());

-- Función para generar código único de afiliada
create or replace function public.generar_link_afiliada(p_afiliada_id uuid, p_producto_id uuid)
returns text as $$
declare
  codigo text;
begin
  codigo := substring(p_afiliada_id::text, 1, 8) || '-' || substring(p_producto_id::text, 1, 8);
  insert into public.links_afiliadas (afiliada_id, producto_id, codigo)
  values (p_afiliada_id, p_producto_id, codigo)
  on conflict (afiliada_id, producto_id) do nothing;
  return codigo;
end;
$$ language plpgsql security definer;
