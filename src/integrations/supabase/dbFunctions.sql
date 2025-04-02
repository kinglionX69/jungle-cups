
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
