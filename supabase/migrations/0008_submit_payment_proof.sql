-- Migration 0008: submit_payment_proof function
-- Run by hand in the Supabase SQL Editor, then keep this file in supabase/migrations.
-- A student records the payment they made for their own order. The proof file must already
-- be uploaded to the private payment-proofs bucket, inside the student's own folder.
-- The journey moves to payment_review. A transaction id cannot be reused (unique index from 0005).

create or replace function public.submit_payment_proof(
  p_order_id uuid,
  p_method text,
  p_trx_id text,
  p_proof_path text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_order orders%rowtype;
  v_journey journeys%rowtype;
  v_trx text := nullif(btrim(coalesce(p_trx_id, '')), '');
  v_payment_id uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  if coalesce(p_method, '') <> all (array['bank_transfer', 'jazzcash', 'easypaisa']) then
    raise exception 'Invalid payment method';
  end if;

  if v_trx is not null and char_length(v_trx) > 64 then
    raise exception 'Transaction ID is too long';
  end if;

  select * into v_order from orders where id = p_order_id;
  if not found then
    raise exception 'Order not found';
  end if;

  select * into v_journey
  from journeys
  where id = v_order.journey_id and student_id = v_uid;
  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.is_paid then
    raise exception 'This order is already paid';
  end if;

  if v_journey.status::text <> 'awaiting_payment' then
    raise exception 'This order is not waiting for payment';
  end if;

  if exists (select 1 from payments
             where order_id = v_order.id and status = 'pending_review') then
    raise exception 'A payment for this order is already under review';
  end if;

  -- The file must be inside the student's own folder and must really exist.
  if p_proof_path is null
     or split_part(p_proof_path, '/', 1) <> v_uid::text
     or not exists (select 1 from storage.objects
                    where bucket_id = 'payment-proofs' and name = p_proof_path) then
    raise exception 'Payment proof file not found';
  end if;

  begin
    insert into payments (order_id, payment_method, proof_file_path, trx_id)
    values (v_order.id, p_method, p_proof_path, v_trx)
    returning id into v_payment_id;
  exception when unique_violation then
    raise exception 'This transaction ID was already used';
  end;

  update journeys
  set status = 'payment_review', updated_at = now()
  where id = v_journey.id;

  return jsonb_build_object('payment_id', v_payment_id, 'status', 'pending_review');
end;
$$;

revoke all on function public.submit_payment_proof(uuid, text, text, text) from public, anon;
grant execute on function public.submit_payment_proof(uuid, text, text, text) to authenticated;
