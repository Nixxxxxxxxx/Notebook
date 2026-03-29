create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform text not null,
  category text not null,
  description text default ''::text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  status text not null default 'idle',
  created_at timestamptz not null default now()
);

create table if not exists public.screens (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  batch_id uuid references public.batches (id) on delete set null,
  name text not null,
  image_url text not null,
  thumbnail_url text not null,
  file_size integer,
  width integer,
  height integer,
  status text not null default 'ungrouped',
  source text not null default 'upload',
  created_at timestamptz not null default now()
);

create table if not exists public.clusters (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  title text not null,
  status text not null default 'suggested',
  confidence numeric(4, 3) not null default 0.65,
  tags text[] not null default '{}'::text[],
  note text not null default ''::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cluster_screens (
  cluster_id uuid not null references public.clusters (id) on delete cascade,
  screen_id uuid not null references public.screens (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (cluster_id, screen_id),
  unique (screen_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  cluster_id uuid references public.clusters (id) on delete cascade,
  body text not null default ''::text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.shortlist_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  screen_id uuid not null references public.screens (id) on delete cascade,
  label text default ''::text,
  group_name text not null default 'Standout flows',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists shortlist_items_project_screen_idx
  on public.shortlist_items (project_id, screen_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists clusters_set_updated_at on public.clusters;
create trigger clusters_set_updated_at
before update on public.clusters
for each row
execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
before update on public.notes
for each row
execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('screens', 'screens', true)
on conflict (id) do nothing;

alter table public.projects enable row level security;
alter table public.batches enable row level security;
alter table public.screens enable row level security;
alter table public.clusters enable row level security;
alter table public.cluster_screens enable row level security;
alter table public.notes enable row level security;
alter table public.shortlist_items enable row level security;

create policy "projects_select_own" on public.projects
for select using (auth.uid() = user_id);

create policy "projects_insert_own" on public.projects
for insert with check (auth.uid() = user_id);

create policy "projects_update_own" on public.projects
for update using (auth.uid() = user_id);

create policy "projects_delete_own" on public.projects
for delete using (auth.uid() = user_id);

create policy "batches_manage_own" on public.batches
for all using (
  exists (
    select 1 from public.projects
    where projects.id = batches.project_id
      and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = batches.project_id
      and projects.user_id = auth.uid()
  )
);

create policy "screens_manage_own" on public.screens
for all using (
  exists (
    select 1 from public.projects
    where projects.id = screens.project_id
      and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = screens.project_id
      and projects.user_id = auth.uid()
  )
);

create policy "clusters_manage_own" on public.clusters
for all using (
  exists (
    select 1 from public.projects
    where projects.id = clusters.project_id
      and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = clusters.project_id
      and projects.user_id = auth.uid()
  )
);

create policy "notes_manage_own" on public.notes
for all using (
  exists (
    select 1 from public.projects
    where projects.id = notes.project_id
      and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = notes.project_id
      and projects.user_id = auth.uid()
  )
);

create policy "shortlist_manage_own" on public.shortlist_items
for all using (
  exists (
    select 1 from public.projects
    where projects.id = shortlist_items.project_id
      and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where projects.id = shortlist_items.project_id
      and projects.user_id = auth.uid()
  )
);

create policy "cluster_screens_manage_own" on public.cluster_screens
for all using (
  exists (
    select 1
    from public.clusters
    join public.projects on projects.id = clusters.project_id
    where clusters.id = cluster_screens.cluster_id
      and projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.clusters
    join public.projects on projects.id = clusters.project_id
    where clusters.id = cluster_screens.cluster_id
      and projects.user_id = auth.uid()
  )
);

create policy "storage_public_upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'screens');

create policy "storage_public_read" on storage.objects
for select using (bucket_id = 'screens');
