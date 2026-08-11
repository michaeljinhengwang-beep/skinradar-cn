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

create or replace function public.read_market_listings(p_provider text)
returns table (
  id uuid,
  external_id text,
  provider text,
  market_hash_name text,
  weapon text,
  skin_name text,
  exterior text,
  price_amount text,
  currency text,
  float_value text,
  listing_url text,
  observed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    listing.id,
    listing.external_id,
    listing.provider,
    listing.market_hash_name,
    listing.weapon,
    listing.skin_name,
    listing.exterior,
    listing.price_amount::text,
    listing.currency,
    listing.float_value::text,
    listing.listing_url,
    listing.observed_at,
    listing.created_at,
    listing.updated_at
  from public.market_listings as listing
  where listing.provider = p_provider
  order by listing.observed_at desc, listing.id;
$$;

create or replace function public.read_market_listing(
  p_provider text,
  p_external_id text
)
returns table (
  id uuid,
  external_id text,
  provider text,
  market_hash_name text,
  weapon text,
  skin_name text,
  exterior text,
  price_amount text,
  currency text,
  float_value text,
  listing_url text,
  observed_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    listing.id,
    listing.external_id,
    listing.provider,
    listing.market_hash_name,
    listing.weapon,
    listing.skin_name,
    listing.exterior,
    listing.price_amount::text,
    listing.currency,
    listing.float_value::text,
    listing.listing_url,
    listing.observed_at,
    listing.created_at,
    listing.updated_at
  from public.market_listings as listing
  where listing.provider = p_provider
    and listing.external_id = p_external_id
  limit 1;
$$;

create or replace function public.upsert_market_cache(
  p_listings jsonb,
  p_cache_key text,
  p_source text,
  p_fetched_at timestamptz,
  p_expires_at timestamptz,
  p_fallback boolean
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  written_count integer;
begin
  if jsonb_typeof(p_listings) <> 'array' then
    raise exception 'p_listings must be a JSON array';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_listings) as item
    where item ->> 'provider' is distinct from p_source
  ) then
    raise exception 'listing provider must match cache source';
  end if;

  insert into public.market_listings (
    external_id,
    provider,
    market_hash_name,
    weapon,
    skin_name,
    exterior,
    price_amount,
    currency,
    float_value,
    listing_url,
    observed_at
  )
  select
    incoming.external_id,
    incoming.provider,
    incoming.market_hash_name,
    incoming.weapon,
    incoming.skin_name,
    incoming.exterior,
    incoming.price_amount,
    incoming.currency,
    incoming.float_value,
    incoming.listing_url,
    incoming.observed_at
  from jsonb_to_recordset(p_listings) as incoming (
    external_id text,
    provider text,
    market_hash_name text,
    weapon text,
    skin_name text,
    exterior text,
    price_amount numeric(24, 8),
    currency text,
    float_value numeric(10, 9),
    listing_url text,
    observed_at timestamptz
  )
  on conflict (provider, external_id) do update set
    market_hash_name = excluded.market_hash_name,
    weapon = excluded.weapon,
    skin_name = excluded.skin_name,
    exterior = excluded.exterior,
    price_amount = excluded.price_amount,
    currency = excluded.currency,
    float_value = excluded.float_value,
    listing_url = excluded.listing_url,
    observed_at = excluded.observed_at;

  get diagnostics written_count = row_count;

  insert into public.market_cache_state (
    cache_key,
    source,
    fetched_at,
    expires_at,
    fallback
  ) values (
    p_cache_key,
    p_source,
    p_fetched_at,
    p_expires_at,
    p_fallback
  )
  on conflict (cache_key) do update set
    source = excluded.source,
    fetched_at = excluded.fetched_at,
    expires_at = excluded.expires_at,
    fallback = excluded.fallback;

  return written_count;
end;
$$;

create or replace function public.try_start_market_sync(
  p_provider text,
  p_started_at timestamptz,
  p_stale_before timestamptz
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_run_id uuid;
begin
  update public.market_sync_runs
  set
    status = 'failed',
    completed_at = p_started_at,
    error_code = 'STALE_SYNC_RECOVERED'
  where provider = p_provider
    and status = 'running'
    and started_at <= p_stale_before;

  insert into public.market_sync_runs (
    provider,
    started_at,
    status
  ) values (
    p_provider,
    p_started_at,
    'running'
  )
  returning id into new_run_id;

  return new_run_id;
exception
  when unique_violation then
    return null;
end;
$$;

revoke all on function public.set_market_updated_at() from public, anon, authenticated;
revoke all on function public.read_market_listings(text) from public, anon, authenticated;
revoke all on function public.read_market_listing(text, text) from public, anon, authenticated;
revoke all on function public.upsert_market_cache(jsonb, text, text, timestamptz, timestamptz, boolean) from public, anon, authenticated;
revoke all on function public.try_start_market_sync(text, timestamptz, timestamptz) from public, anon, authenticated;

grant execute on function public.read_market_listings(text) to service_role;
grant execute on function public.read_market_listing(text, text) to service_role;
grant execute on function public.upsert_market_cache(jsonb, text, text, timestamptz, timestamptz, boolean) to service_role;
grant execute on function public.try_start_market_sync(text, timestamptz, timestamptz) to service_role;
