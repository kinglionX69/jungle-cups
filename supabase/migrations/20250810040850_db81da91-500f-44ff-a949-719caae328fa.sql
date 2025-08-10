-- Enable RLS and add safe policies for referrals to satisfy linter while preserving functionality
alter table public.referrals enable row level security;

-- Drop any existing policies to avoid duplicates
drop policy if exists "Public can read referrals" on public.referrals;
drop policy if exists "Public can insert referrals" on public.referrals;
drop policy if exists "Service can manage referrals" on public.referrals;

-- Allow public read
create policy "Public can read referrals"
  on public.referrals
  for select
  using (true);

-- Allow public insert with strict checks to prevent abuse
create policy "Public can insert referrals"
  on public.referrals
  for insert
  with check (
    referrer_address <> referred_address
    and not exists (
      select 1 from public.referrals r2 where r2.referred_address = referred_address
    )
    and exists (
      select 1 from public.player_stats p where p.wallet_address = referrer_address
    )
  );

-- Restrict updates/deletes to service role only
create policy "Service can manage referrals"
  on public.referrals
  for all
  to service_role
  using (true)
  with check (true);
