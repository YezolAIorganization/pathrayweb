-- Migration 0005: order references, payment status, price read access
-- Applied by hand in the Supabase SQL Editor on 16 Nov 2026.
-- The Pathray Report service and its three market prices (PK 4000 PKR, IN 1200 INR, XX 20 USD)
-- were inserted by hand at the same time.

-- Order reference codes (PR- plus 6 characters)
alter table public.orders add column if not exists reference text;

create or replace function public.set_order_reference()
returns trigger
language plpgsql
as $$
declare
  v_ref text;
begin
  if new.reference is null then
    loop
      v_ref := 'PR-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
      exit when not exists (select 1 from public.orders where reference = v_ref);
    end loop;
    new.reference := v_ref;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_set_reference on public.orders;
create trigger orders_set_reference
before insert on public.orders
for each row execute function public.set_order_reference();

create unique index if not exists orders_reference_key
  on public.orders (reference);

-- Payment status, reject reason, and no repeated transaction ids
alter table public.payments
  add column if not exists status text not null default 'pending_review'
    check (status in ('pending_review', 'confirmed', 'rejected')),
  add column if not exists reject_reason text;

create unique index if not exists payments_method_trx_unique
  on public.payments (payment_method, trx_id)
  where trx_id is not null and status <> 'rejected';

-- Signed-in students (anonymous ones too) can read active services and prices
drop policy if exists "Signed in users view active services" on public.services;
create policy "Signed in users view active services"
  on public.services for select to authenticated
  using (is_active);

drop policy if exists "Signed in users view market prices" on public.service_market_prices;
create policy "Signed in users view market prices"
  on public.service_market_prices for select to authenticated
  using (true);
