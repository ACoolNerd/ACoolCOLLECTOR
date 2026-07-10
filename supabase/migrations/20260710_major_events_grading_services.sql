create extension if not exists pgcrypto;

with verified_events(name, venue_name, city, region, country_code, starts_at, ends_at, organizer_name, website_url, status) as (
  values
    ('Fanatics Fest NYC 2026', 'Javits Center', 'New York City', 'NY', 'US', '2026-07-16T00:00:00-04:00'::timestamptz, '2026-07-19T23:59:59-04:00'::timestamptz, 'Fanatics Events', 'https://www.fanaticsfest.com/', 'platform_verified'),
    ('46th National Sports Collectors Convention', 'Donald E. Stephens Convention Center', 'Rosemont', 'IL', 'US', '2026-07-29T00:00:00-05:00'::timestamptz, '2026-08-02T23:59:59-05:00'::timestamptz, 'National Sports Collectors Convention', 'https://www.nsccshow.com/', 'platform_verified'),
    ('Comic-Con 2026', 'San Diego Convention Center', 'San Diego', 'CA', 'US', '2026-07-23T00:00:00-07:00'::timestamptz, '2026-07-26T23:59:59-07:00'::timestamptz, 'San Diego Comic Convention', 'https://www.comic-con.org/cc/', 'platform_verified'),
    ('WonderCon 2026', 'Anaheim Convention Center', 'Anaheim', 'CA', 'US', '2026-03-27T00:00:00-07:00'::timestamptz, '2026-03-29T23:59:59-07:00'::timestamptz, 'San Diego Comic Convention', 'https://www.comic-con.org/wc/', 'platform_verified')
)
insert into public.card_shows(name, venue_name, city, region, country_code, starts_at, ends_at, organizer_name, website_url, verification_status)
select name, venue_name, city, region, country_code, starts_at, ends_at, organizer_name, website_url, status
from verified_events e
where not exists (
  select 1 from public.card_shows existing
  where existing.name=e.name and existing.starts_at::date=e.starts_at::date
);

insert into public.event_ticket_offers(card_show_id, provider_name, ticket_type, purchase_url, purchase_mode, availability_status, source_last_verified_at)
select id, 'Fanatics Events', 'general_admission', 'https://tickets.fanaticsevents.com/', 'external_checkout', 'available', '2026-07-10T00:00:00Z'
from public.card_shows
where name='Fanatics Fest NYC 2026'
on conflict (card_show_id, provider_name, ticket_type) do update set
  purchase_url=excluded.purchase_url,
  purchase_mode=excluded.purchase_mode,
  availability_status=excluded.availability_status,
  source_last_verified_at=excluded.source_last_verified_at;

insert into public.event_ticket_offers(card_show_id, provider_name, ticket_type, price_cents, currency, purchase_url, purchase_mode, availability_status, source_last_verified_at)
select id, 'National Sports Collectors Convention', 'general_admission', 3000, 'USD', 'https://www.nsccshow.com/', 'external_checkout', 'available', '2026-07-10T00:00:00Z'
from public.card_shows
where name='46th National Sports Collectors Convention'
on conflict (card_show_id, provider_name, ticket_type) do update set
  price_cents=excluded.price_cents,
  currency=excluded.currency,
  purchase_url=excluded.purchase_url,
  purchase_mode=excluded.purchase_mode,
  availability_status=excluded.availability_status,
  source_last_verified_at=excluded.source_last_verified_at;

insert into public.grading_providers(provider_key, display_name, official_url, certification_lookup_url, active, source_last_verified_at) values
  ('psa', 'PSA', 'https://www.psacard.com/services/tradingcardgrading', 'https://www.psacard.com/cert/', true, '2026-07-10T00:00:00Z'),
  ('bgs', 'Beckett Grading Services', 'https://www.beckett.com/grading', null, true, '2026-07-10T00:00:00Z')
on conflict (provider_key) do update set
  display_name=excluded.display_name,
  official_url=excluded.official_url,
  certification_lookup_url=coalesce(excluded.certification_lookup_url, public.grading_providers.certification_lookup_url),
  active=excluded.active,
  source_last_verified_at=excluded.source_last_verified_at;

with provider as (select id from public.grading_providers where provider_key='psa')
insert into public.grading_service_levels(grading_provider_id, service_name, fee_cents, currency, max_declared_value_cents, estimated_turnaround_min_days, estimated_turnaround_max_days, membership_required, official_url, source_last_verified_at, active)
select provider.id, service_name, fee_cents, 'USD', max_value, min_days, max_days, false, 'https://www.psacard.com/services/tradingcardgrading', '2026-07-10T00:00:00Z', true
from provider, (values
  ('Regular', 7999::bigint, 150000::bigint, 40, 50),
  ('Express', 14900::bigint, 250000::bigint, 20, 30),
  ('Super Express', 34900::bigint, 500000::bigint, 7, 10),
  ('Walk-Through', 59900::bigint, 1000000::bigint, 5, 7)
) as service(service_name, fee_cents, max_value, min_days, max_days)
on conflict (grading_provider_id, service_name, source_last_verified_at) do update set
  fee_cents=excluded.fee_cents,
  max_declared_value_cents=excluded.max_declared_value_cents,
  estimated_turnaround_min_days=excluded.estimated_turnaround_min_days,
  estimated_turnaround_max_days=excluded.estimated_turnaround_max_days,
  active=true;

with provider as (select id from public.grading_providers where provider_key='bgs')
insert into public.grading_service_levels(grading_provider_id, service_name, fee_cents, currency, max_declared_value_cents, estimated_turnaround_min_days, estimated_turnaround_max_days, membership_required, official_url, source_last_verified_at, active)
select provider.id, service_name, fee_cents, 'USD', null, min_days, max_days, false, 'https://www.beckett.com/grading', '2026-07-10T00:00:00Z', true
from provider, (values
  ('Base Without Subgrades', 1495::bigint, 75, null::integer),
  ('Base With Subgrades', 1795::bigint, 75, null::integer),
  ('Standard With Subgrades', 3495::bigint, 45, 45),
  ('Express With Subgrades', 7995::bigint, 15, 15),
  ('Priority With Subgrades', 12495::bigint, 5, 5)
) as service(service_name, fee_cents, min_days, max_days)
on conflict (grading_provider_id, service_name, source_last_verified_at) do update set
  fee_cents=excluded.fee_cents,
  estimated_turnaround_min_days=excluded.estimated_turnaround_min_days,
  estimated_turnaround_max_days=excluded.estimated_turnaround_max_days,
  active=true;
