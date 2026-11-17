-- Migration 0001: Core schema for Pathray

-- 1. Journeys & Quick Check states
create table if not exists public.journeys (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade,
    status text not null default 'quick_check',
    funding_tier text,
    answers jsonb not null default '{}'::jsonb,
    waiting_on_student boolean not null default true,
    waiting_reason text,
    clock_paused_at timestamptz,
    paused_seconds integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Orders with unique reference codes
create table if not exists public.orders (
    id uuid primary key default gen_random_uuid(),
    journey_id uuid references public.journeys(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    reference text unique not null,
    amount_pkr numeric not null,
    status text not null default 'pending',
    created_at timestamptz not null default now()
);

-- 3. Payment proofs
create table if not exists public.payments (
    id uuid primary key default gen_random_uuid(),
    order_id uuid references public.orders(id) on delete cascade,
    method text not null,
    proof_url text not null,
    status text not null default 'pending_review',
    reject_reason text,
    created_at timestamptz not null default now()
);

-- 4. Email outbox queue
create table if not exists public.email_outbox (
    id uuid primary key default gen_random_uuid(),
    to_email text not null,
    template text not null,
    payload jsonb not null default '{}'::jsonb,
    status text not null default 'pending',
    attempts integer not null default 0,
    send_after timestamptz not null default now(),
    sent_at timestamptz,
    error text
);

-- 5. App Settings & Config KV store
create table if not exists public.app_settings (
    key text primary key,
    value jsonb not null,
    updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS) on core tables
alter table public.journeys enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.email_outbox enable row level security;
alter table public.app_settings enable row level security;
```[cite: 2]

---

### What's Next?
Save that migration file in your Supabase migrations folder. Once you have it in place, let me know if you want to write out the matching **Row-Level Security (RLS) policies** for students and admins next, or if you want to jump into building the **Quick Check screen (P2/P3)**[cite: 1, 2]!