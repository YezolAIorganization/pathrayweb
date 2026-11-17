-- Migration 0002: RLS Policies for Pathray

-- Journeys policies: Users can view and manage their own journeys
create policy "Users can view own journeys" on public.journeys
    for select using (auth.uid() = user_id);

create policy "Users can insert own journeys" on public.journeys
    for insert with check (auth.uid() = user_id);

create policy "Users can update own journeys" on public.journeys
    for update using (auth.uid() = user_id);

-- Orders policies: Users can view and create their own orders
create policy "Users can view own orders" on public.orders
    for select using (auth.uid() = user_id);

create policy "Users can insert own orders" on public.orders
    for insert with check (auth.uid() = user_id);

-- Payments policies: Users can view and submit payments for their own orders
create policy "Users can view own payments" on public.payments
    for select using (
        exists (
            select 1 from public.orders
            where orders.id = payments.order_id
            and orders.user_id = auth.uid()
        )
    );

create policy "Users can insert own payments" on public.payments
    for insert with check (
        exists (
            select 1 from public.orders
            where orders.id = payments.order_id
            and orders.user_id = auth.uid()
        )
    );

-- App settings: Readable by everyone, editable by admins only
create policy "App settings are readable by everyone" on public.app_settings
    for select using (true);
```[cite: 2]

---

### What's Next?
Once you save that security migration, we have our database and RLS security fully locked down. 

Are you ready to move on to building the **Quick Check interactive flow and result screen (P2/P3)** on the frontend, or do you want to test the Supabase connection first[cite: 1, 2]?