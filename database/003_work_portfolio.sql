-- FundiConnect artisan work portfolio
-- Run this file in Supabase SQL Editor to enable work sample uploads.

create table if not exists public.work_samples (
  id uuid primary key default gen_random_uuid(),
  artisan_id uuid not null references public.users(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text,
  image_url text not null,
  storage_path text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists work_samples_artisan_created_idx
  on public.work_samples (artisan_id, created_at desc);

alter table public.work_samples enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'work_samples'
      and policyname = 'Anyone can view artisan work samples'
  ) then
    create policy "Anyone can view artisan work samples"
      on public.work_samples for select to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'work_samples'
      and policyname = 'Artisans can add their own work samples'
  ) then
    create policy "Artisans can add their own work samples"
      on public.work_samples for insert to authenticated
      with check (
        artisan_id = auth.uid()
        and exists (
          select 1 from public.users u
          where u.id = auth.uid() and u.role = 'artisan'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'work_samples'
      and policyname = 'Artisans can update their own work samples'
  ) then
    create policy "Artisans can update their own work samples"
      on public.work_samples for update to authenticated
      using (
        artisan_id = auth.uid()
        and exists (
          select 1 from public.users u
          where u.id = auth.uid() and u.role = 'artisan'
        )
      )
      with check (
        artisan_id = auth.uid()
        and exists (
          select 1 from public.users u
          where u.id = auth.uid() and u.role = 'artisan'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'work_samples'
      and policyname = 'Artisans can delete their own work samples'
  ) then
    create policy "Artisans can delete their own work samples"
      on public.work_samples for delete to authenticated
      using (
        artisan_id = auth.uid()
        and exists (
          select 1 from public.users u
          where u.id = auth.uid() and u.role = 'artisan'
        )
      );
  end if;
end $$;

grant select on public.work_samples to anon, authenticated;
grant insert, update, delete on public.work_samples to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('work-portfolio', 'work-portfolio', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Artisans can upload their own work images'
  ) then
    create policy "Artisans can upload their own work images"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'work-portfolio'
        and (storage.foldername(name))[1] = auth.uid()::text
        and exists (
          select 1 from public.users u
          where u.id = auth.uid() and u.role = 'artisan'
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Artisans can update their own work images'
  ) then
    create policy "Artisans can update their own work images"
      on storage.objects for update to authenticated
      using (
        bucket_id = 'work-portfolio'
        and (storage.foldername(name))[1] = auth.uid()::text
      )
      with check (
        bucket_id = 'work-portfolio'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and policyname = 'Artisans can delete their own work images'
  ) then
    create policy "Artisans can delete their own work images"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'work-portfolio'
        and (storage.foldername(name))[1] = auth.uid()::text
      );
  end if;
end $$;
