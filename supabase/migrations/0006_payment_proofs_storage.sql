-- Migration 0006: private storage bucket for payment proofs
-- Applied by hand in the Supabase SQL Editor on 16 Nov 2026.
-- Private bucket, 5 MB limit, PDF and images only. Each student can upload to and read
-- only their own folder. Admins and experts can read all. No update or delete for students.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'payment-proofs',
  'payment-proofs',
  false,
  5242880,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Students upload own payment proofs" on storage.objects;
create policy "Students upload own payment proofs"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-proofs'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Students view own payment proofs" on storage.objects;
create policy "Students view own payment proofs"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-proofs'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin_or_expert())
  );
