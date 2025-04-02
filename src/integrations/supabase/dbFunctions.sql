
-- Function to increment a player's referral count
create or replace function public.increment_referral_count(referrer_wallet text)
returns void
language plpgsql
security definer
as $$
begin
  update public.player_stats
  set referrals = referrals + 1
  where wallet_address = referrer_wallet;
end;
$$;

-- Create referrals table if it doesn't exist
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_address text not null,
  referred_address text not null unique,
  created_at timestamp with time zone default now() not null,
  is_activated boolean default false,
  
  constraint fk_referrer
    foreign key(referrer_address)
    references public.player_stats(wallet_address)
    on delete cascade,
  
  constraint fk_referred
    foreign key(referred_address)
    references public.player_stats(wallet_address)
    on delete cascade
);

-- Create index for faster lookups
create index if not exists idx_referrals_referrer on public.referrals(referrer_address);

-- Add function to count activated referrals for a player
create or replace function public.count_activated_referrals(player_wallet text)
returns integer
language plpgsql
security definer
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

-- Function to activate a referral when a referred user plays their first game
create or replace function public.activate_referral(referred_wallet text)
returns void
language plpgsql
security definer
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
