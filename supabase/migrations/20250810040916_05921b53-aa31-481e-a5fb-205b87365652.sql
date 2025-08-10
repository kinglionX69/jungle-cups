-- SECURITY HARDENING MIGRATION (retry with DO-block guards)

-- 1) Lock down player_stats so clients cannot UPDATE rows directly
alter table public.player_stats enable row level security;

drop policy if exists "Allow users to update their own stats" on public.player_stats;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'player_stats' AND policyname = 'Allow anyone to read player stats'
  ) THEN
    create policy "Allow anyone to read player stats"
    on public.player_stats
    for select
    using (true);
  END IF;
END $$;

-- 2) Lock down game_transactions to be read-only from the client
alter table public.game_transactions enable row level security;

drop policy if exists "Players can view their own transactions" on public.game_transactions;
drop policy if exists "Service can manage transactions" on public.game_transactions;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'game_transactions' AND policyname = 'Allow read-only transactions'
  ) THEN
    create policy "Allow read-only transactions"
    on public.game_transactions
    for select
    using (true);
  END IF;
END $$;

-- 3) Enable RLS on referrals and allow read-only from the client
alter table public.referrals enable row level security;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'referrals' AND policyname = 'Allow reading referrals'
  ) THEN
    create policy "Allow reading referrals"
    on public.referrals
    for select
    using (true);
  END IF;
END $$;

-- 4) Harden SECURITY DEFINER functions with explicit search_path
create or replace function public.increment_referral_count(referrer_wallet text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
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
set search_path = public, pg_temp
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
set search_path = public, pg_temp
as $$
begin
  update public.referrals
  set is_activated = true
  where referred_address = referred_wallet and is_activated = false;
  
  -- Update the referrer's activated referral count
  with referrer as (
    select referrer_address from public.referrals where referred_address = referred_wallet
  )
  update public.player_stats
  set referrals = (select public.count_activated_referrals(referrer_address) from referrer)
  where wallet_address in (select referrer_address from referrer);
end;
$$;