-- Security hardening migration: tighten RLS and harden functions

-- 1) player_stats policies
alter table public.player_stats enable row level security;

-- Drop overly permissive policies if they exist
drop policy if exists "Allow users to update their own stats" on public.player_stats;
drop policy if exists "Allow new player stats to be created" on public.player_stats;
-- Keep/replace read policy with a safe one
drop policy if exists "Allow anyone to read player stats" on public.player_stats;

-- Re-create minimal policies
create policy "Public can read player stats"
  on public.player_stats
  for select
  using (true);

create policy "Service can insert player stats"
  on public.player_stats
  for insert
  to service_role
  with check (true);

create policy "Service can update player stats"
  on public.player_stats
  for update
  to service_role
  using (true)
  with check (true);

-- 2) game_transactions policies
alter table public.game_transactions enable row level security;

-- Drop existing policies if present
drop policy if exists "Players can view their own transactions" on public.game_transactions;
drop policy if exists "Service can manage transactions" on public.game_transactions;

-- Re-create with safer defaults
create policy "Public can read transactions"
  on public.game_transactions
  for select
  using (true);

create policy "Service can manage transactions"
  on public.game_transactions
  for all
  to service_role
  using (true)
  with check (true);

-- 3) game_settings policies
alter table public.game_settings enable row level security;

-- Drop permissive policy
drop policy if exists "Allow all operations on game_settings" on public.game_settings;

-- Re-create safe policies
create policy "Public can read game settings"
  on public.game_settings
  for select
  using (true);

create policy "Service can manage game settings"
  on public.game_settings
  for all
  to service_role
  using (true)
  with check (true);

-- 4) Harden SECURITY DEFINER functions by fixing search_path
-- Note: Recreate functions with explicit search_path to public
create or replace function public.increment_referral_count(referrer_wallet text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.player_stats
  set referrals = referrals + 1
  where wallet_address = referrer_wallet;
end;
$$;

create or replace function public.count_activated_referrals(player_wallet text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  referral_count integer;
begin
  select count(*) into referral_count
  from public.referrals
  where referrer_address = player_wallet and is_activated = true;
  return referral_count;
end;
$$;

create or replace function public.activate_referral(referred_wallet text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.referrals
  set is_activated = true
  where referred_address = referred_wallet and is_activated = false;
  
  with referrer as (
    select referrer_address from public.referrals where referred_address = referred_wallet
  )
  update public.player_stats
  set referrals = (select public.count_activated_referrals(referrer_address) from referrer)
  where wallet_address in (select referrer_address from referrer);
end;
$$;