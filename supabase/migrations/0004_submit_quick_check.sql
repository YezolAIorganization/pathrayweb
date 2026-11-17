-- Migration 0004: submit_quick_check function
-- Applied by hand in the Supabase SQL Editor on 13 Nov 2026.
-- Creates the profile, journey and quick check in one safe step, and works out the funding tier on the server.

create or replace function public.submit_quick_check(
  p_market text,
  p_answers jsonb,
  p_name text,
  p_email text,
  p_whatsapp text,
  p_consent boolean,
  p_marketing boolean
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_country text;
  v_market_id uuid;
  v_name text := btrim(coalesce(p_name, ''));
  v_email text := lower(btrim(coalesce(p_email, '')));
  v_whatsapp text := nullif(btrim(coalesce(p_whatsapp, '')), '');
  v_level text;
  v_field text;
  v_qualification text;
  v_result text;
  v_english text;
  v_need text;
  v_band smallint;
  v_dest text[];
  v_tier_letter text;
  v_tier funding_tier;
  v_journey_id uuid;
begin
  if v_uid is null then
    raise exception 'Not signed in';
  end if;

  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Invalid answers';
  end if;

  if p_consent is not true then
    raise exception 'Consent is required';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 100 then
    raise exception 'Invalid name';
  end if;

  if char_length(v_email) > 254 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    raise exception 'Invalid email';
  end if;

  if v_whatsapp is not null
     and (length(regexp_replace(v_whatsapp, '\D', '', 'g')) not between 7 and 15
          or char_length(v_whatsapp) > 30) then
    raise exception 'Invalid WhatsApp number';
  end if;

  v_country := case lower(coalesce(p_market, ''))
    when 'pk' then 'PK'
    when 'in' then 'IN'
    when 'other' then 'XX'
  end;
  if v_country is null then
    raise exception 'Invalid market';
  end if;

  select id into v_market_id
  from markets
  where country_code = v_country and is_active;
  if v_market_id is null then
    raise exception 'Market not available';
  end if;

  v_level := p_answers->>'level';
  v_field := p_answers->>'field';
  v_qualification := p_answers->>'qualification';
  v_result := p_answers->>'result';
  v_english := p_answers->>'englishTest';
  v_need := p_answers->>'scholarshipNeed';

  if coalesce(v_level, '') <> all (array['bachelors','masters','phd','unsure']) then
    raise exception 'Invalid level';
  end if;
  if coalesce(v_field, '') <> all (array['engineering-tech','business','health','sciences','social-humanities','arts-design','unsure']) then
    raise exception 'Invalid field';
  end if;
  if coalesce(v_qualification, '') <> all (array['school-secondary','school-higher','bachelors','masters','other']) then
    raise exception 'Invalid qualification';
  end if;
  if coalesce(v_result, '') <> all (array['high','good','pass','waiting']) then
    raise exception 'Invalid result';
  end if;
  if coalesce(v_english, '') <> all (array['have','planning','none','unsure']) then
    raise exception 'Invalid English test answer';
  end if;
  if coalesce(v_need, '') <> all (array['yes','partly','no']) then
    raise exception 'Invalid scholarship answer';
  end if;
  if coalesce(p_answers->>'budgetBand', '') !~ '^[0-3]$' then
    raise exception 'Invalid budget band';
  end if;
  v_band := (p_answers->>'budgetBand')::smallint;

  if jsonb_typeof(p_answers->'destinations') <> 'array' then
    raise exception 'Invalid destinations';
  end if;
  v_dest := array(select jsonb_array_elements_text(p_answers->'destinations'));
  if coalesce(array_length(v_dest, 1), 0) not between 1 and 3 then
    raise exception 'Choose between 1 and 3 destinations';
  end if;
  if exists (select 1 from unnest(v_dest) d where d !~ '^[a-z-]{2,30}$') then
    raise exception 'Invalid destination';
  end if;

  -- Simple rate limit: 5 submissions per hour for each visitor.
  if (select count(*) from journeys
      where student_id = v_uid and created_at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many submissions. Please try again later.';
  end if;

  -- The tier is always worked out here, never trusted from the browser.
  v_tier_letter := case v_need
    when 'yes' then (array['A','A','B','B'])[v_band + 1]
    when 'partly' then (array['B','C','C','C'])[v_band + 1]
    when 'no' then (array['C','C','C','D'])[v_band + 1]
  end;
  v_tier := ('tier_' || lower(v_tier_letter))::funding_tier;

  insert into profiles (id, email, full_name, phone, market_id)
  values (v_uid, v_email, v_name, v_whatsapp, v_market_id)
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        phone = excluded.phone,
        market_id = excluded.market_id,
        updated_at = now();

  insert into journeys (student_id, market_id, status, funding_tier)
  values (v_uid, v_market_id, 'quick_check', v_tier)
  returning id into v_journey_id;

  insert into quick_checks (
    journey_id, degree_level, field_of_study, english_status,
    preferred_countries, calculated_tier, qualification, academic_result,
    budget_band, scholarship_need, consent_version, consented_at, marketing_opt_in
  ) values (
    v_journey_id, v_level, v_field, v_english,
    v_dest, v_tier, v_qualification, v_result,
    v_band, v_need, 'quick-check-v1', now(), coalesce(p_marketing, false)
  );

  return jsonb_build_object('journey_id', v_journey_id, 'tier', v_tier_letter);
end;
$$;

revoke all on function public.submit_quick_check(text, jsonb, text, text, text, boolean, boolean) from public, anon;
grant execute on function public.submit_quick_check(text, jsonb, text, text, text, boolean, boolean) to authenticated;