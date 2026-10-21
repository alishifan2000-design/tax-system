-- =========================================================
-- TAX DOCUMENT STORAGE
-- 21 October 2026
-- =========================================================

-- Create the private tax document bucket
insert into storage.buckets (id, name, public)
values ('tax-documents', 'tax-documents', false)
on conflict (id) do update
set public = false;

-- =========================================================
-- STORAGE OBJECT POLICIES
-- Files must be stored under:
-- <organization-id>/<file-or-folder>
-- =========================================================

create policy "Admins and seniors can view tax documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'tax-documents'
  and exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id::text =
          (storage.foldername(name))[1]
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);

create policy "Admins and seniors can upload tax documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'tax-documents'
  and exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id::text =
          (storage.foldername(name))[1]
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);

create policy "Admins and seniors can delete tax documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'tax-documents'
  and exists (
    select 1
    from public.organization_users
    where organization_users.user_id = auth.uid()
      and organization_users.organization_id::text =
          (storage.foldername(name))[1]
      and lower(trim(organization_users.role)) in ('admin', 'senior')
  )
);