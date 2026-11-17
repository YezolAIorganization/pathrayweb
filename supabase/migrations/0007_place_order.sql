-- Migration 0007: place_order function
-- Applied by hand in the Supabase SQL Editor on 16 Nov 2026.
-- Creates an order for the signed-in student's own journey. The price always comes from
-- service_market_prices for the journey's market, never from the browser. Reuses an unpaid
-- order for the same journey and service, and moves the journey to awaiting_payment.

create or replace function public.place_order(
  p_journey_id uuid,
  p_service_slug text default 'report'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_journey journeys%rowtype;
  v_service services%rowtype;
  v_price service_market_prices%rowtype;
  v_order orders%rowtype;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  select * into v_journey
  from journeys
  where id = p_journey_id and student_id = v_uid;
  if not found then
    raise exception 'Journey not found';
  end if;

  if v_journey.status::text not in ('quick_check', 'awaiting_payment') then
    raise exception 'This journey cannot place a new order';
  end if;

  select * into v_service
  from services
  where slug = coalesce(p_service_slug, 'report') and is_active;
  if not found then
    raise exception 'Service not available';
  end if;

  select * into v_price
  from service_market_prices
  where service_id = v_service.id and market_id = v_journey.market_id;
  if not found then
    raise exception 'No price for this market';
  end if;

  -- Reuse an unpaid order for the same journey and service.
  select * into v_order
  from orders
  where journey_id = v_journey.id
    and service_id = v_service.id
    and not is_paid
  order by created_at desc
  limit 1;

  if not found then
    insert into orders (journey_id, service_id, amount, currency)
    values (v_journey.id, v_service.id, v_price.price, v_price.currency)
    returning * into v_order;
  end if;

  update journeys
  set status = 'awaiting_payment', updated_at = now()
  where id = v_journey.id and status::text = 'quick_check';

  return jsonb_build_object(
    'order_id', v_order.id,
    'reference', v_order.reference,
    'amount', v_order.amount,
    'currency', v_order.currency,
    'service', v_service.title
  );
end;
$$;

revoke all on function public.place_order(uuid, text) from public, anon;
grant execute on function public.place_order(uuid, text) to authenticated;
