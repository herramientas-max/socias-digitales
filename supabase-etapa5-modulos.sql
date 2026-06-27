-- =============================================
-- ETAPA 5: Módulos y Lecciones (Classroom)
-- =============================================

create table if not exists public.modulos (
  id uuid default gen_random_uuid() primary key,
  titulo text not null,
  descripcion text,
  imagen_url text,
  orden integer default 0,
  estado text default 'borrador', -- borrador | publicado
  created_at timestamp with time zone default now()
);

create table if not exists public.lecciones (
  id uuid default gen_random_uuid() primary key,
  modulo_id uuid references public.modulos(id) on delete cascade,
  titulo text not null,
  descripcion text,
  video_url text,
  contenido text,
  duracion_min integer default 0,
  orden integer default 0,
  created_at timestamp with time zone default now()
);

create table if not exists public.progreso_lecciones (
  id uuid default gen_random_uuid() primary key,
  alumna_id uuid references public.perfiles(id) on delete cascade,
  leccion_id uuid references public.lecciones(id) on delete cascade,
  completada boolean default false,
  fecha_completado timestamp with time zone,
  unique(alumna_id, leccion_id)
);

-- Storage para imágenes de módulos
insert into storage.buckets (id, name, public) values ('modulos', 'modulos', true) on conflict do nothing;
create policy "Ver imagenes modulos" on storage.objects for select using (bucket_id = 'modulos');
create policy "Admin sube imagenes modulos" on storage.objects for insert with check (bucket_id = 'modulos' and auth.role() = 'authenticated');
create policy "Admin actualiza imagenes modulos" on storage.objects for update using (bucket_id = 'modulos' and auth.role() = 'authenticated');

-- RLS
alter table public.modulos enable row level security;
alter table public.lecciones enable row level security;
alter table public.progreso_lecciones enable row level security;

create policy "Ver modulos publicados" on public.modulos for select using (estado = 'publicado' or public.es_admin());
create policy "Admin gestiona modulos" on public.modulos for all using (public.es_admin());

create policy "Ver lecciones" on public.lecciones for select using (auth.role() = 'authenticated');
create policy "Admin gestiona lecciones" on public.lecciones for all using (public.es_admin());

create policy "Ver propio progreso" on public.progreso_lecciones for select using (alumna_id = auth.uid() or public.es_admin());
create policy "Guardar propio progreso" on public.progreso_lecciones for insert with check (alumna_id = auth.uid());
create policy "Actualizar propio progreso" on public.progreso_lecciones for update using (alumna_id = auth.uid());
