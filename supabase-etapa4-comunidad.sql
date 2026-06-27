-- =============================================
-- ETAPA 4: Comunidad, Q&A y Resultados
-- =============================================

-- Q&A: Preguntas
create table if not exists public.preguntas (
  id uuid default gen_random_uuid() primary key,
  alumna_id uuid references public.perfiles(id) on delete cascade,
  titulo text not null,
  contenido text not null,
  estado text default 'abierta', -- abierta | respondida | cerrada
  created_at timestamp with time zone default now()
);

-- Q&A: Respuestas
create table if not exists public.respuestas (
  id uuid default gen_random_uuid() primary key,
  pregunta_id uuid references public.preguntas(id) on delete cascade,
  autor_id uuid references public.perfiles(id) on delete cascade,
  contenido text not null,
  es_oficial boolean default false,
  created_at timestamp with time zone default now()
);

-- Comunidad: Publicaciones
create table if not exists public.publicaciones (
  id uuid default gen_random_uuid() primary key,
  alumna_id uuid references public.perfiles(id) on delete cascade,
  contenido text not null,
  imagen_url text,
  created_at timestamp with time zone default now()
);

-- Comunidad: Comentarios
create table if not exists public.comentarios (
  id uuid default gen_random_uuid() primary key,
  publicacion_id uuid references public.publicaciones(id) on delete cascade,
  autor_id uuid references public.perfiles(id) on delete cascade,
  contenido text not null,
  created_at timestamp with time zone default now()
);

-- Comunidad: Reacciones
create table if not exists public.reacciones (
  id uuid default gen_random_uuid() primary key,
  publicacion_id uuid references public.publicaciones(id) on delete cascade,
  alumna_id uuid references public.perfiles(id) on delete cascade,
  tipo text default '❤️',
  unique(publicacion_id, alumna_id)
);

-- Resultados / Testimonios
create table if not exists public.resultados (
  id uuid default gen_random_uuid() primary key,
  alumna_id uuid references public.perfiles(id) on delete cascade,
  tipo text not null, -- 'captura' | 'testimonio' | 'video' | 'caso_exito'
  titulo text,
  descripcion text,
  archivo_url text,
  monto numeric(10,2),
  pais text,
  estrategia text,
  estado text default 'pendiente', -- pendiente | aprobado | rechazado
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.preguntas enable row level security;
alter table public.respuestas enable row level security;
alter table public.publicaciones enable row level security;
alter table public.comentarios enable row level security;
alter table public.reacciones enable row level security;
alter table public.resultados enable row level security;

-- Políticas: autenticadas pueden leer todo
create policy "Ver preguntas" on public.preguntas for select using (auth.role() = 'authenticated');
create policy "Crear pregunta" on public.preguntas for insert with check (auth.uid() = alumna_id);
create policy "Admin gestiona preguntas" on public.preguntas for update using (public.es_admin());

create policy "Ver respuestas" on public.respuestas for select using (auth.role() = 'authenticated');
create policy "Crear respuesta" on public.respuestas for insert with check (auth.uid() = autor_id);

create policy "Ver publicaciones" on public.publicaciones for select using (auth.role() = 'authenticated');
create policy "Crear publicacion" on public.publicaciones for insert with check (auth.uid() = alumna_id);
create policy "Admin elimina publicacion" on public.publicaciones for delete using (public.es_admin());

create policy "Ver comentarios" on public.comentarios for select using (auth.role() = 'authenticated');
create policy "Crear comentario" on public.comentarios for insert with check (auth.uid() = autor_id);

create policy "Ver reacciones" on public.reacciones for select using (auth.role() = 'authenticated');
create policy "Gestionar reaccion" on public.reacciones for all using (auth.uid() = alumna_id);

create policy "Ver resultados aprobados" on public.resultados for select
  using (estado = 'aprobado' or alumna_id = auth.uid() or public.es_admin());
create policy "Subir resultado" on public.resultados for insert with check (auth.uid() = alumna_id);
create policy "Admin gestiona resultados" on public.resultados for update using (public.es_admin());

-- Storage para resultados
insert into storage.buckets (id, name, public) values ('resultados', 'resultados', true) on conflict do nothing;
create policy "Subir resultado storage" on storage.objects for insert with check (bucket_id = 'resultados' and auth.role() = 'authenticated');
create policy "Ver resultado storage" on storage.objects for select using (bucket_id = 'resultados');
