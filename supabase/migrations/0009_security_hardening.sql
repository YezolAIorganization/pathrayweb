-- Migration 0009: security hardening
-- Run by hand in the Supabase SQL Editor, then keep this file in supabase/migrations.
--
-- 1. The old "Users update own profile" policy let a student change ANY column of their own
--    profile through the API, including role. Only these three columns stay editable now.
-- 2. Journeys and payments are created only through the server functions
--    (submit_quick_check, place_order, submit_payment_proof), so the direct insert policies
--    are removed. A student could otherwise insert a journey with any status or tier, or a
--    payment already marked confirmed.

revoke update on public.profiles from authenticated;
grant update (full_name, phone, market_id) on public.profiles to authenticated;

drop policy if exists "Students create own journeys" on public.journeys;
drop policy if exists "Students submit payments" on public.payments;
