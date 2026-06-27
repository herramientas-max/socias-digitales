-- =============================================
-- EJECUTAR EN: Supabase > SQL Editor
-- =============================================

-- 1. Tabla de perfiles
create table if not exists public.perfiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text,
  avatar_url text,
  progreso integer default 0,
  rol text default 'alumna',
  created_at timestamp with time zone default now()
);

-- 2. Habilitar Row Level Security
alter table public.perfiles enable row level security;

-- 3. Políticas de acceso

-- Cada usuaria puede ver su propio perfil
create policy "Ver propio perfil"
  on public.perfiles for select
  using (auth.uid() = id);

-- Cada usuaria puede editar su propio perfil
create policy "Editar propio perfil"
  on public.perfiles for insert
  with check (auth.uid() = id);

create policy "Actualizar propio perfil"
  on public.perfiles for update
  using (auth.uid() = id);

-- Las admins pueden ver todos los perfiles
create policy "Admin ve todos los perfiles"
  on public.perfiles for select
  using (
    exists (
      select 1 from public.perfiles
      where id = auth.uid() and rol = 'admin'
    )
  );

-- 4. Crear perfil automáticamente cuando se registra una usuaria
create or replace function public.crear_perfil_nuevo_usuario()
returns trigger as $$
begin
  insert into public.perfiles (id, nombre)
  values (new.id, new.raw_user_meta_data->>'nombre');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.crear_perfil_nuevo_usuario();

-- 5. Storage bucket para fotos de perfil
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Política de storage: cualquier usuaria autenticada puede subir/ver
create policy "Subir avatar propio"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Ver avatares"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Actualizar avatar propio"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- =============================================
-- PARA HACERTE ADMIN:
-- Después de crear tu cuenta, ejecutá esto
-- reemplazando 'tu@email.com' con tu email:
-- =============================================
-- update public.perfiles
-- set rol = 'admin'
-- where id = (select id from auth.users where email = 'tu@email.com');
