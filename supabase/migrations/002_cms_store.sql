-- =============================================================================
-- CUBE CMS — application data store (used by src/lib/db/cloud-store.ts)
--
-- The website keeps its CMS content as collections (news, projects, careers,
-- users, enquiries, ...). Each collection is stored as one JSONB row here, in
-- exactly the shape the application uses, so no workflow or data structure
-- changes when moving from the local JSON file to Supabase.
--
-- Run this once in the Supabase SQL editor (or `supabase db push`).
-- Safe to re-run.
-- =============================================================================

create table if not exists public.cms_store (
  key         text primary key,                 -- collection name, e.g. 'news'
  data        jsonb not null,                   -- the collection (array or object)
  version     integer not null default 1,       -- optimistic-concurrency counter
  updated_at  timestamptz not null default now()
);

create index if not exists cms_store_updated_at_idx on public.cms_store (updated_at desc);

-- Contains admin password hashes and applicant data: never expose it through
-- the public (anon / authenticated) API. Only the server's service-role key,
-- which bypasses RLS, can read or write it.
alter table public.cms_store enable row level security;
revoke all on table public.cms_store from anon, authenticated;

-- -----------------------------------------------------------------------------
-- Private storage buckets (files are served through the website's own routes:
-- /uploads/<name> for media, admin-only /api/admin/resumes/<name> for CVs).
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('cms-uploads', 'cms-uploads', false, 10485760,
     array['image/jpeg','image/png','image/gif','image/webp','image/avif']),
  ('resumes', 'resumes', false, 10485760,
     array['application/pdf','application/msword',
           'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict (id) do nothing;
