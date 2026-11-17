-- Migration 0003: Quick Check columns
-- Applied by hand in the Supabase SQL Editor on 13 Nov 2026.
-- The markets rows (PK, IN, XX) were inserted by hand at the same time.

alter table public.quick_checks
  alter column academic_score drop not null,
  alter column yearly_budget drop not null,
  add column if not exists qualification text,
  add column if not exists academic_result text,
  add column if not exists budget_band smallint check (budget_band between 0 and 3),
  add column if not exists scholarship_need text check (scholarship_need in ('yes', 'partly', 'no')),
  add column if not exists consent_version text,
  add column if not exists consented_at timestamptz,
  add column if not exists marketing_opt_in boolean not null default false;

insert into public.markets (country_code, default_currency, currency_symbol, is_active)
select v.country_code, v.default_currency, v.currency_symbol, true
from (values
  ('PK', 'PKR', 'Rs'),
  ('IN', 'INR', '₹'),
  ('XX', 'USD', '$')
) as v(country_code, default_currency, currency_symbol)
where not exists (
  select 1 from public.markets m where m.country_code = v.country_code
);