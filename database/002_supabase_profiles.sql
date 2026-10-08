-- FundiConnect Supabase profile schema
-- Run this file in Supabase SQL Editor before using registration, profiles, or Discover.

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'customer' check (role in ('customer', 'artisan')),
  full_name text not null default '',
  phone_number text,
  trade_category text,
  hourly_rate numeric(12,2) check (hourly_rate is null or hourly_rate >= 0),
  headline text,
  bio text,
  location_label text,
  avatar_url text,
  is_verified boolean not null default false,
  is_available boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  total_reviews integer not null default 0,
  completed_jobs integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'Users can read their own profile') then
    create policy "Users can read their own profile" on public.users for select to authenticated using (id = auth.uid());
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'users' and policyname = 'Users can update their own profile') then
    create policy "Users can update their own profile" on public.users for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
  end if;
end $$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  selected_role text;
  selected_trade text;
  selected_rate numeric(12,2);
begin
  selected_role := case when new.raw_user_meta_data ->> 'role' = 'artisan' then 'artisan' else 'customer' end;

  selected_trade := case lower(trim(coalesce(new.raw_user_meta_data ->> 'trade_category', '')))
    when 'electrician' then 'ELECTRICAL'
    when 'electrical' then 'ELECTRICAL'
    when 'plumber' then 'PLUMBING'
    when 'plumbing' then 'PLUMBING'
    when 'carpenter' then 'CARPENTRY'
    when 'carpentry' then 'CARPENTRY'
    when 'mechanic' then 'MECHANIC'
    when 'tech repair' then 'TECH_REPAIR'
    when 'tech_repair' then 'TECH_REPAIR'
    when 'welder' then 'WELDING'
    when 'welding' then 'WELDING'
    when 'joiner' then 'JOINERY'
    when 'joinery' then 'JOINERY'
    when 'tailor' then 'TAILORING'
    when 'tailoring' then 'TAILORING'
    else null
  end;

  if coalesce(new.raw_user_meta_data ->> 'hourly_rate', '') ~ '^[0-9]+([.][0-9]{1,2})?$' then
    selected_rate := (new.raw_user_meta_data ->> 'hourly_rate')::numeric(12,2);
  else
    selected_rate := null;
  end if;

  insert into public.users (id, email, role, full_name, phone_number, trade_category, hourly_rate)
  values (
    new.id,
    new.email,
    selected_role,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, ''), '@', 1)),
    nullif(trim(new.raw_user_meta_data ->> 'phone_number'), ''),
    case when selected_role = 'artisan' then selected_trade else null end,
    case when selected_role = 'artisan' then selected_rate else null end
  )
  on conflict (id) do update set
    email = excluded.email,
    role = excluded.role,
    full_name = excluded.full_name,
    phone_number = excluded.phone_number,
    trade_category = coalesce(excluded.trade_category, public.users.trade_category),
    hourly_rate = coalesce(excluded.hourly_rate, public.users.hourly_rate);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_fundiconnect on auth.users;
create trigger on_auth_user_created_fundiconnect
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Backfill accounts created before this migration was applied.
insert into public.users (id, email, role, full_name, phone_number, trade_category, hourly_rate)
select
  a.id,
  a.email,
  case when a.raw_user_meta_data ->> 'role' = 'artisan' then 'artisan' else 'customer' end,
  coalesce(nullif(trim(a.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(a.email, ''), '@', 1)),
  nullif(trim(a.raw_user_meta_data ->> 'phone_number'), ''),
  case lower(trim(coalesce(a.raw_user_meta_data ->> 'trade_category', '')))
    when 'electrician' then 'ELECTRICAL'
    when 'electrical' then 'ELECTRICAL'
    when 'plumber' then 'PLUMBING'
    when 'plumbing' then 'PLUMBING'
    when 'carpenter' then 'CARPENTRY'
    when 'carpentry' then 'CARPENTRY'
    when 'mechanic' then 'MECHANIC'
    when 'tech repair' then 'TECH_REPAIR'
    when 'tech_repair' then 'TECH_REPAIR'
    when 'welder' then 'WELDING'
    when 'welding' then 'WELDING'
    when 'joiner' then 'JOINERY'
    when 'joinery' then 'JOINERY'
    when 'tailor' then 'TAILORING'
    when 'tailoring' then 'TAILORING'
    else null
  end,
  case when coalesce(a.raw_user_meta_data ->> 'hourly_rate', '') ~ '^[0-9]+([.][0-9]{1,2})?$'
       then (a.raw_user_meta_data ->> 'hourly_rate')::numeric(12,2)
       else null end
from auth.users a
on conflict (id) do nothing;

create or replace view public.public_artisan_directory as
select
  id,
  full_name,
  trade_category,
  is_verified,
  is_available,
  rating_avg,
  total_reviews,
  completed_jobs,
  avatar_url,
  headline,
  bio,
  location_label
from public.users
where role = 'artisan';

grant select on public.public_artisan_directory to anon, authenticated;
grant select on public.users to authenticated;
revoke update on public.users from authenticated;
grant update (full_name, phone_number, trade_category, hourly_rate, headline, bio, location_label, avatar_url, is_available)
  on public.users to authenticated;

-- Public avatar URLs are enabled; writes are limited to each user's own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload their own avatars') then
    create policy "Users can upload their own avatars" on storage.objects for insert to authenticated
      with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update their own avatars') then
    create policy "Users can update their own avatars" on storage.objects for update to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete their own avatars') then
    create policy "Users can delete their own avatars" on storage.objects for delete to authenticated
      using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
