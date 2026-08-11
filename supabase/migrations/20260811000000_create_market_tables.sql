create extension if not exists pgcrypto;

create table public.market_listings (
  id uuid primary key default gen_random_uuid(),
  external_id text not null check (length(btrim(external_id)) > 0),
  provider text not null check (provider in ('mock', 'csfloat')),
  market_hash_name text not null check (length(btrim(market_hash_name)) > 0),
  weapon text,
  skin_name text,
  exterior text,
  price_amount numeric(24, 8) not null check (price_amount >= 0),
  currency text not null check (currency in ('CAD', 'USD', 'UNSPECIFIED')),
  float_value numeric(10, 9) check (float_value between 0 and 1),
  listing_url text,
  observed_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint market_listings_provider_external_unique unique (provider, external_id)
);

create index market_listings_provider_observed_idx
  on public.market_listings (provider, observed_at desc);
create index market_listings_market_hash_name_idx
  on public.market_listings (market_hash_name);

create table public.market_cache_state (
  cache_key text primary key check (length(btrim(cache_key)) > 0),
  source text not null check (source in ('mock', 'csfloat')),
  fetched_at timestamptz not null,
  expires_at timestamptz not null,
  fallback boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint market_cache_expiry_order check (expires_at > fetched_at)
);

create table public.market_sync_runs (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('mock', 'csfloat')),
  started_at timestamptz not null,
  completed_at timestamptz,
  status text not null check (status in ('running', 'success', 'failed', 'partial')),
  listings_received integer not null default 0 check (listings_received >= 0),
  listings_written integer not null default 0 check (listings_written >= 0),
  error_code text,
  created_at timestamptz not null default now(),
  constraint market_sync_completion_state check (
    (status = 'running' and completed_at is null)
    or (status <> 'running' and completed_at is not null)
  )
);

create unique index market_sync_runs_one_running_per_provider
  on public.market_sync_runs (provider)
  where status = 'running';
create index market_sync_runs_provider_started_idx
  on public.market_sync_runs (provider, started_at desc);

create or replace function public.set_market_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger market_listings_set_updated_at
before update on public.market_listings
for each row execute function public.set_market_updated_at();

create trigger market_cache_state_set_updated_at
before update on public.market_cache_state
for each row execute function public.set_market_updated_at();

alter table public.market_listings enable row level security;
alter table public.market_cache_state enable row level security;
alter table public.market_sync_runs enable row level security;

revoke all on public.market_listings from anon, authenticated;
revoke all on public.market_cache_state from anon, authenticated;
revoke all on public.market_sync_runs from anon, authenticated;

grant select, insert, update on public.market_listings to service_role;
grant select, insert, update on public.market_cache_state to service_role;
grant select, insert, update on public.market_sync_runs to service_role;
