create extension if not exists pgcrypto;

alter table public.profiles
  add column if not exists username text,
  add column if not exists avatar_object_path text,
  add column if not exists bio text,
  add column if not exists home_region text,
  add column if not exists preferred_currency text not null default 'USD',
  add column if not exists collecting_interests jsonb not null default '[]'::jsonb,
  add column if not exists privacy_settings jsonb not null default '{"profile_visibility":"private","show_collection_value":false,"show_wishlist":false}'::jsonb,
  add column if not exists notification_settings jsonb not null default '{}'::jsonb;

create unique index if not exists profiles_username_unique_idx
  on public.profiles(lower(username)) where username is not null;

create table if not exists public.feature_flags (
  flag_key text primary key,
  enabled boolean not null default false,
  configuration jsonb not null default '{}'::jsonb,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now()
);

insert into public.feature_flags(flag_key, enabled, configuration) values
  ('promotions.public_entry_enabled', false, '{"reason":"jurisdiction_and_official_rules_review_required"}'::jsonb),
  ('event_ticket_direct_purchase_enabled', false, '{"mode":"official_external_checkout_only"}'::jsonb),
  ('recommendations.production_publish_enabled', false, '{"reason":"evaluation_and_ruth_review_required"}'::jsonb)
on conflict (flag_key) do nothing;

create table if not exists public.catalog_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  display_name text not null,
  source_type text not null check (source_type in ('official_publisher','official_organizer','licensed_api','licensed_csv','manual_verified','community_submission')),
  base_url text not null,
  terms_url text,
  refresh_frequency text,
  enabled boolean not null default true,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','restricted','disabled')),
  last_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.collectible_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  display_name text not null,
  parent_id uuid references public.collectible_categories(id) on delete set null,
  schema_version text not null default '1.0',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.franchises (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.collectible_categories(id),
  slug text not null unique,
  display_name text not null,
  publisher_or_brand text,
  official_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.catalog_sets (
  id uuid primary key default gen_random_uuid(),
  franchise_id uuid not null references public.franchises(id) on delete cascade,
  source_id uuid references public.catalog_sources(id) on delete set null,
  set_code text,
  name text not null,
  region_code text not null default 'GLOBAL',
  language_code text,
  product_family text not null default 'set',
  release_date date,
  announced_at date,
  rotation_date date,
  status text not null default 'announced' check (status in ('rumored','announced','preorder','released','out_of_print','cancelled')),
  official_url text,
  source_last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (franchise_id, region_code, set_code)
);

create table if not exists public.catalog_products (
  id uuid primary key default gen_random_uuid(),
  franchise_id uuid not null references public.franchises(id) on delete cascade,
  catalog_set_id uuid references public.catalog_sets(id) on delete set null,
  source_id uuid references public.catalog_sources(id) on delete set null,
  product_code text,
  name text not null,
  product_type text not null check (product_type in ('booster','starter_deck','collection','box','pack','single','figure','building_set','vinyl_figure','comic','game','accessory','other')),
  release_date date,
  msrp_cents bigint check (msrp_cents is null or msrp_cents >= 0),
  currency text not null default 'USD',
  official_url text,
  source_last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (franchise_id, product_code, release_date)
);

create table if not exists public.set_checklist_items (
  id uuid primary key default gen_random_uuid(),
  catalog_set_id uuid not null references public.catalog_sets(id) on delete cascade,
  external_item_id text,
  item_number text,
  name text not null,
  rarity text,
  variant text,
  language_code text,
  attributes jsonb not null default '{}'::jsonb,
  source_last_verified_at timestamptz,
  unique (catalog_set_id, item_number, variant, language_code)
);

create table if not exists public.event_ticket_offers (
  id uuid primary key default gen_random_uuid(),
  card_show_id uuid not null references public.card_shows(id) on delete cascade,
  provider_name text not null,
  ticket_type text not null default 'general_admission',
  price_cents bigint check (price_cents is null or price_cents >= 0),
  currency text not null default 'USD',
  purchase_url text not null,
  purchase_mode text not null default 'external_checkout' check (purchase_mode in ('external_checkout','partner_checkout','unavailable')),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  availability_status text not null default 'unknown' check (availability_status in ('unknown','available','limited','sold_out','not_on_sale','cancelled')),
  source_last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (card_show_id, provider_name, ticket_type)
);

create table if not exists public.user_event_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_show_id uuid not null references public.card_shows(id) on delete cascade,
  status text not null default 'interested' check (status in ('interested','saving','ticketed','attending','attended','cancelled')),
  ticket_offer_id uuid references public.event_ticket_offers(id) on delete set null,
  ticket_reference text,
  travel_budget_cents bigint check (travel_budget_cents is null or travel_budget_cents >= 0),
  show_budget_cents bigint check (show_budget_cents is null or show_budget_cents >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, card_show_id)
);

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_plan_id uuid references public.user_event_plans(id) on delete cascade,
  goal_type text not null check (goal_type in ('event_ticket','travel','show_budget','release_product','grading_submission','collection_goal','deck_goal','other')),
  title text not null,
  target_cents bigint not null check (target_cents > 0),
  current_cents bigint not null default 0 check (current_cents >= 0),
  currency text not null default 'USD',
  target_date date,
  cadence text check (cadence is null or cadence in ('weekly','biweekly','monthly','manual')),
  status text not null default 'active' check (status in ('active','paused','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  savings_goal_id uuid not null references public.savings_goals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_cents bigint not null check (amount_cents > 0),
  contribution_date date not null default current_date,
  source_label text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.collection_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  catalog_set_id uuid references public.catalog_sets(id) on delete set null,
  title text not null,
  goal_type text not null check (goal_type in ('complete_set','master_set','character','player','team','artist','parallel_run','custom')),
  completion_rule jsonb not null default '{}'::jsonb,
  target_budget_cents bigint check (target_budget_cents is null or target_budget_cents >= 0),
  target_date date,
  status text not null default 'active' check (status in ('active','paused','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collection_goal_items (
  id uuid primary key default gen_random_uuid(),
  collection_goal_id uuid not null references public.collection_goals(id) on delete cascade,
  checklist_item_id uuid references public.set_checklist_items(id) on delete set null,
  external_item_reference text,
  required_quantity integer not null default 1 check (required_quantity > 0),
  owned_quantity integer not null default 0 check (owned_quantity >= 0),
  priority smallint not null default 3 check (priority between 1 and 5),
  maximum_price_cents bigint check (maximum_price_cents is null or maximum_price_cents >= 0),
  status text not null default 'missing' check (status in ('missing','watching','owned','upgrading','not_required')),
  unique (collection_goal_id, checklist_item_id, external_item_reference)
);

create table if not exists public.deck_archetypes (
  id uuid primary key default gen_random_uuid(),
  franchise_id uuid not null references public.franchises(id) on delete cascade,
  name text not null,
  format_name text not null,
  leader_or_identity text,
  source_url text,
  verification_status text not null default 'community' check (verification_status in ('community','tournament_verified','publisher_recommended','retired')),
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists public.deck_versions (
  id uuid primary key default gen_random_uuid(),
  deck_archetype_id uuid not null references public.deck_archetypes(id) on delete cascade,
  version_label text not null,
  effective_date date,
  source_url text,
  tournament_result_reference text,
  verification_status text not null default 'community' check (verification_status in ('community','tournament_verified','publisher_recommended','retired')),
  created_at timestamptz not null default now(),
  unique (deck_archetype_id, version_label)
);

create table if not exists public.deck_cards (
  id uuid primary key default gen_random_uuid(),
  deck_version_id uuid not null references public.deck_versions(id) on delete cascade,
  checklist_item_id uuid references public.set_checklist_items(id) on delete set null,
  external_item_reference text,
  required_quantity integer not null check (required_quantity > 0),
  role_tags text[] not null default '{}',
  substitution_group text,
  unique (deck_version_id, checklist_item_id, external_item_reference)
);

create table if not exists public.user_deck_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  deck_version_id uuid not null references public.deck_versions(id) on delete cascade,
  title text not null,
  target_budget_cents bigint check (target_budget_cents is null or target_budget_cents >= 0),
  target_date date,
  status text not null default 'active' check (status in ('active','paused','completed','retired')),
  created_at timestamptz not null default now(),
  unique (user_id, deck_version_id)
);

create table if not exists public.bargain_bin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_show_session_id uuid references public.card_show_sessions(id) on delete set null,
  vendor_id uuid references public.vendors(id) on delete set null,
  bin_label text,
  maximum_item_price_cents bigint not null default 500 check (maximum_item_price_cents > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.bargain_bin_items (
  id uuid primary key default gen_random_uuid(),
  bargain_bin_session_id uuid not null references public.bargain_bin_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  image_object_path text,
  identity_candidate jsonb not null default '{}'::jsonb,
  purchase_price_cents bigint check (purchase_price_cents is null or purchase_price_cents >= 0),
  raw_value_cents bigint check (raw_value_cents is null or raw_value_cents >= 0),
  condition_observations jsonb not null default '{}'::jsonb,
  recommendation_status text not null default 'review' check (recommendation_status in ('review','buy_raw','grade_candidate','pass','purchased')),
  created_at timestamptz not null default now()
);

create table if not exists public.grading_providers (
  id uuid primary key default gen_random_uuid(),
  provider_key text not null unique,
  display_name text not null,
  official_url text not null,
  certification_lookup_url text,
  active boolean not null default true,
  source_last_verified_at timestamptz
);

create table if not exists public.grading_service_levels (
  id uuid primary key default gen_random_uuid(),
  grading_provider_id uuid not null references public.grading_providers(id) on delete cascade,
  service_name text not null,
  fee_cents bigint not null check (fee_cents >= 0),
  currency text not null default 'USD',
  max_declared_value_cents bigint,
  estimated_turnaround_min_days integer,
  estimated_turnaround_max_days integer,
  membership_required boolean not null default false,
  official_url text not null,
  source_last_verified_at timestamptz not null,
  active boolean not null default true,
  unique (grading_provider_id, service_name, source_last_verified_at)
);

create table if not exists public.recommendation_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommendation_type text not null check (recommendation_type in ('collection_completion','deck_completion','release_planning','event_planning','bargain_bin','grading','portfolio')),
  input_snapshot jsonb not null,
  model_version text not null,
  policy_version text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recommendation_items (
  id uuid primary key default gen_random_uuid(),
  recommendation_run_id uuid not null references public.recommendation_runs(id) on delete cascade,
  subject_type text not null,
  subject_reference text not null,
  score numeric(8,4) not null,
  confidence numeric(5,2) not null check (confidence between 0 and 100),
  explanation text[] not null default '{}',
  estimated_cost_cents bigint,
  expected_value_cents bigint,
  risk_flags text[] not null default '{}',
  rank integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.promotion_campaigns (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  promotion_kind text not null check (promotion_kind in ('giveaway','sweepstakes','skill_contest','charitable_raffle')),
  status text not null default 'draft' check (status in ('draft','legal_review','approved','open','closed','draw_pending','drawn','cancelled')),
  purchase_required boolean not null default false,
  no_purchase_method text,
  minimum_age integer not null default 18 check (minimum_age between 0 and 100),
  allowed_jurisdictions text[] not null default '{}',
  excluded_jurisdictions text[] not null default '{}',
  official_rules_url text,
  legal_approval_reference text,
  legal_approved_at timestamptz,
  opens_at timestamptz,
  closes_at timestamptz,
  maximum_entries_per_user integer not null default 1 check (maximum_entries_per_user > 0),
  seed_commitment text,
  published boolean not null default false,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promotion_prizes (
  id uuid primary key default gen_random_uuid(),
  promotion_campaign_id uuid not null references public.promotion_campaigns(id) on delete cascade,
  title text not null,
  description text,
  approximate_retail_value_cents bigint check (approximate_retail_value_cents is null or approximate_retail_value_cents >= 0),
  quantity integer not null default 1 check (quantity > 0),
  inventory_reference text,
  created_at timestamptz not null default now()
);

create table if not exists public.promotion_entries (
  id uuid primary key default gen_random_uuid(),
  promotion_campaign_id uuid not null references public.promotion_campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_method text not null,
  jurisdiction_code text not null,
  age_confirmed boolean not null default false,
  rules_accepted_at timestamptz not null,
  eligibility_snapshot jsonb not null,
  status text not null default 'eligible' check (status in ('eligible','ineligible','withdrawn','winner','alternate')),
  created_at timestamptz not null default now()
);

create unique index if not exists promotion_entries_user_method_idx
  on public.promotion_entries(promotion_campaign_id, user_id, entry_method, created_at);

create table if not exists public.promotion_draws (
  id uuid primary key default gen_random_uuid(),
  promotion_campaign_id uuid not null references public.promotion_campaigns(id) on delete cascade,
  draw_number integer not null,
  eligible_entry_count integer not null,
  algorithm_version text not null,
  seed_reveal text not null,
  seed_commitment_verified boolean not null,
  winner_entry_id uuid references public.promotion_entries(id),
  audit_payload jsonb not null,
  approved_by uuid references auth.users(id),
  drawn_at timestamptz not null default now(),
  unique (promotion_campaign_id, draw_number)
);

create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  experiment_key text not null unique,
  name text not null,
  hypothesis text not null,
  status text not null default 'draft' check (status in ('draft','review','running','paused','completed','cancelled')),
  allocation_basis_points integer not null default 10000 check (allocation_basis_points between 1 and 10000),
  starts_at timestamptz,
  ends_at timestamptz,
  guardrail_metrics text[] not null default '{}',
  privacy_reviewed boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.experiment_variants (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments(id) on delete cascade,
  variant_key text not null,
  display_name text not null,
  weight_basis_points integer not null check (weight_basis_points > 0),
  configuration jsonb not null default '{}'::jsonb,
  unique (experiment_id, variant_key)
);

create table if not exists public.experiment_assignments (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  variant_id uuid not null references public.experiment_variants(id) on delete cascade,
  assignment_hash text not null,
  assigned_at timestamptz not null default now(),
  unique (experiment_id, user_id)
);

create table if not exists public.experiment_events (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid not null references public.experiments(id) on delete cascade,
  variant_id uuid not null references public.experiment_variants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null,
  event_value numeric,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

insert into public.catalog_sources(source_key, display_name, source_type, base_url, refresh_frequency, verification_status, last_checked_at) values
  ('one-piece-official-products','ONE PIECE CARD GAME Official Products','official_publisher','https://en.onepiece-cardgame.com/products/','daily','verified','2026-07-10T00:00:00Z'),
  ('disney-lorcana-official','Disney Lorcana Official Products','official_publisher','https://www.disneylorcana.com/','daily','pending',null),
  ('collect-a-con-official','Collect-A-Con Official Tour','official_organizer','https://collectaconusa.com/','daily','verified','2026-07-10T00:00:00Z'),
  ('sportscardspro','SportsCardsPro / PriceCharting subscription data','licensed_api','https://www.sportscardspro.com/','daily','restricted',null),
  ('psa-official','PSA Official Services','official_publisher','https://www.psacard.com/services/tradingcardgrading','daily','verified','2026-07-10T00:00:00Z'),
  ('cgc-official','CGC Cards Official Services','official_publisher','https://www.cgccards.com/submit/services-fees/cgc-grading/','daily','verified','2026-07-10T00:00:00Z')
on conflict (source_key) do update set base_url=excluded.base_url, verification_status=excluded.verification_status, last_checked_at=excluded.last_checked_at;

insert into public.collectible_categories(slug, display_name) values
  ('sports-cards','Sports Cards'),
  ('trading-card-games','Trading Card Games'),
  ('vinyl-figures','Vinyl Figures'),
  ('building-sets','Building Sets'),
  ('comics','Comics'),
  ('video-games','Video Games'),
  ('toys','Toys and Figures')
on conflict (slug) do update set display_name=excluded.display_name;

insert into public.franchises(category_id, slug, display_name, publisher_or_brand, official_url)
select c.id, v.slug, v.display_name, v.publisher_or_brand, v.official_url
from public.collectible_categories c
join (values
  ('trading-card-games','one-piece-card-game','ONE PIECE CARD GAME','Bandai','https://en.onepiece-cardgame.com/'),
  ('trading-card-games','disney-lorcana','Disney Lorcana','Ravensburger','https://www.disneylorcana.com/'),
  ('trading-card-games','pokemon-tcg','Pokémon TCG','The Pokémon Company International','https://www.pokemon.com/us/pokemon-tcg'),
  ('vinyl-figures','funko-pop','Funko Pop!','Funko','https://funko.com/'),
  ('building-sets','lego','LEGO','LEGO Group','https://www.lego.com/'),
  ('sports-cards','multi-sport-cards','Multi-Sport Cards',null,null)
) as v(category_slug,slug,display_name,publisher_or_brand,official_url) on c.slug=v.category_slug
on conflict (slug) do update set display_name=excluded.display_name, official_url=excluded.official_url;

with one_piece as (select id from public.franchises where slug='one-piece-card-game'),
source as (select id from public.catalog_sources where source_key='one-piece-official-products')
insert into public.catalog_products(franchise_id, source_id, product_code, name, product_type, release_date, msrp_cents, official_url, source_last_verified_at)
select one_piece.id, source.id, p.code, p.name, p.product_type, p.release_date, p.msrp_cents, p.url, '2026-07-10T00:00:00Z'
from one_piece, source, (values
  ('ST-32','STARTER DECK -GREEN Roronoa Zoro-','starter_deck','2026-07-31'::date,1199,'https://en.onepiece-cardgame.com/products/'),
  ('ST-33','STARTER DECK -BLUE Kuzan-','starter_deck','2026-07-31'::date,1199,'https://en.onepiece-cardgame.com/products/'),
  ('ST-34','STARTER DECK -PURPLE Charlotte Katakuri-','starter_deck','2026-07-31'::date,1199,'https://en.onepiece-cardgame.com/products/'),
  ('ST-35','STARTER DECK -RED/BLACK Sabo-','starter_deck','2026-07-31'::date,1199,'https://en.onepiece-cardgame.com/products/'),
  ('ST-36','STARTER DECK -YELLOW Eustass Captain Kid-','starter_deck','2026-07-31'::date,1199,'https://en.onepiece-cardgame.com/products/'),
  ('EB-05','EXTRA BOOSTER -ONE PIECE HEROINES EDITION vol.2-','booster','2026-10-01'::date,499,'https://en.onepiece-cardgame.com/products/')
) as p(code,name,product_type,release_date,msrp_cents,url)
on conflict (franchise_id, product_code, release_date) do update set name=excluded.name, msrp_cents=excluded.msrp_cents, source_last_verified_at=excluded.source_last_verified_at;

with events(name, city, region, start_date, end_date, page_url, ticket_url) as (values
  ('Collect-A-Con New Jersey','Edison','NJ','2026-07-11'::date,'2026-07-12'::date,'https://collectaconusa.com/newjersey/','https://www.universe.com/events/collect-a-con-new-jersey-tickets-2PGRNS'),
  ('Collect-A-Con Minneapolis','Minneapolis','MN','2026-07-18'::date,'2026-07-19'::date,'https://collectaconusa.com/minneapolis/','https://www.universe.com/events/collect-a-con-minneapolis-mn-tickets-753L6V'),
  ('Collect-A-Con Los Angeles','Los Angeles','CA','2026-08-01'::date,'2026-08-02'::date,'https://collectaconusa.com/losangeles/','https://www.universe.com/events/collect-a-con-los-angeles-ca-tickets-W0MHL8'),
  ('Collect-A-Con San Antonio','San Antonio','TX','2026-08-15'::date,'2026-08-16'::date,'https://collectaconusa.com/san-antonio/','https://www.universe.com/events/collect-a-con-san-antonio-tx-tickets-G89NQR'),
  ('Collect-A-Con Charlotte','Charlotte','NC','2026-08-22'::date,'2026-08-23'::date,'https://collectaconusa.com/charlotte/','https://www.universe.com/events/collect-a-con-charlotte-nc-tickets-VK13B0'),
  ('Collect-A-Con Richmond','Richmond','VA','2026-08-29'::date,'2026-08-30'::date,'https://collectaconusa.com/richmond/','https://www.universe.com/events/collect-a-con-richmond-va-tickets-6NK4R3'),
  ('Collect-A-Con San Francisco','San Francisco','CA','2026-09-12'::date,'2026-09-13'::date,'https://collectaconusa.com/san-francisco/','https://www.universe.com/events/collect-a-con-san-francisco-ca-tickets-2L05J4'),
  ('Collect-A-Con Atlanta 2','Atlanta','GA','2026-09-26'::date,'2026-09-27'::date,'https://collectaconusa.com/atlanta-2/','https://www.universe.com/events/collect-a-con-atlanta-2-ga-tickets-WHVL4T'),
  ('Collect-A-Con Chicago 2','Chicago','IL','2026-10-10'::date,'2026-10-11'::date,'https://collectaconusa.com/chicago-2/','https://www.universe.com/events/collect-a-con-chicago-2-il-tickets-63HX4L'),
  ('Collect-A-Con Dallas','Dallas','TX','2026-10-24'::date,'2026-10-25'::date,'https://collectaconusa.com/dallas/','https://www.universe.com/events/collect-a-con-dallas-tx-tickets-13NKP0'),
  ('Collect-A-Con Houston 2','Houston','TX','2026-11-07'::date,'2026-11-08'::date,'https://collectaconusa.com/houston2/','https://www.universe.com/events/collect-a-con-houston-2-tx-tickets-FXZ3PL'),
  ('Collect-A-Con New Jersey 2','Edison','NJ','2026-11-21'::date,'2026-11-22'::date,'https://collectaconusa.com/new-jersey-2/','https://www.universe.com/events/collect-a-con-new-jersey-2-tickets-CK5907'),
  ('Collect-A-Con Los Angeles 2','Los Angeles','CA','2026-12-19'::date,'2026-12-20'::date,'https://collectaconusa.com/losangeles2/','https://www.universe.com/events/collect-a-con-los-angeles-2-ca-tickets-9NVCZT')
), inserted as (
  insert into public.card_shows(name, city, region, country_code, starts_at, ends_at, organizer_name, website_url, verification_status)
  select e.name, e.city, e.region, 'US', e.start_date::timestamptz, (e.end_date + 1)::timestamptz, 'Collect-A-Con', e.page_url, 'organizer_verified'
  from events e
  where not exists (select 1 from public.card_shows c where c.name=e.name and c.starts_at::date=e.start_date)
  returning id, name, starts_at
)
insert into public.event_ticket_offers(card_show_id, provider_name, ticket_type, purchase_url, purchase_mode, availability_status, source_last_verified_at)
select c.id, 'Universe', 'general_admission', e.ticket_url, 'external_checkout', 'available', '2026-07-10T00:00:00Z'
from events e join public.card_shows c on c.name=e.name and c.starts_at::date=e.start_date
on conflict (card_show_id, provider_name, ticket_type) do update set purchase_url=excluded.purchase_url, availability_status=excluded.availability_status, source_last_verified_at=excluded.source_last_verified_at;

insert into public.grading_providers(provider_key, display_name, official_url, certification_lookup_url, source_last_verified_at) values
  ('psa','PSA','https://www.psacard.com/services/tradingcardgrading','https://www.psacard.com/cert/','2026-07-10T00:00:00Z'),
  ('cgc','CGC Cards','https://www.cgccards.com/submit/services-fees/cgc-grading/','https://www.cgccards.com/certlookup/','2026-07-10T00:00:00Z'),
  ('bgs','Beckett Grading Services','https://www.beckett.com/grading',null,null),
  ('tag','TAG Grading','https://taggrading.com/',null,null)
on conflict (provider_key) do update set official_url=excluded.official_url, source_last_verified_at=excluded.source_last_verified_at;

with psa as (select id from public.grading_providers where provider_key='psa')
insert into public.grading_service_levels(grading_provider_id, service_name, fee_cents, max_declared_value_cents, estimated_turnaround_min_days, estimated_turnaround_max_days, official_url, source_last_verified_at)
select psa.id, s.name, s.fee, s.max_value, s.min_days, s.max_days, 'https://www.psacard.com/services/tradingcardgrading', '2026-07-10T00:00:00Z'
from psa, (values
  ('Regular',7999,150000,40,50),
  ('Express',14900,250000,20,30),
  ('Super Express',34900,500000,7,10),
  ('Walk-Through',59900,1000000,5,7)
) as s(name,fee,max_value,min_days,max_days)
on conflict (grading_provider_id, service_name, source_last_verified_at) do nothing;

insert into public.permissions(permission_key, description) values
  ('catalog.read','Read verified collectible catalog and release data.'),
  ('catalog.manage','Manage catalog sources, sets and checklist items.'),
  ('events.read','Read verified events and ticket offers.'),
  ('events.plan','Create personal event plans and savings goals.'),
  ('goals.manage','Manage collection and deck goals.'),
  ('recommendations.run','Run personal recommendation scenarios.'),
  ('promotions.read','Read legally approved public promotions.'),
  ('promotions.enter','Enter an eligible approved promotion.'),
  ('promotions.manage','Create and administer promotion drafts.'),
  ('promotions.draw','Approve and execute audited promotion drawings.'),
  ('experiments.manage','Manage reviewed product experiments.'),
  ('profile.manage_self','Manage the actor profile and privacy settings.')
on conflict (permission_key) do update set description=excluded.description;

insert into public.role_permissions(role_key, permission_key) values
  ('collector','catalog.read'),('collector','events.read'),('collector','events.plan'),('collector','goals.manage'),('collector','recommendations.run'),('collector','promotions.read'),('collector','promotions.enter'),('collector','profile.manage_self'),
  ('ambassador','catalog.read'),('ambassador','events.read'),('ambassador','events.plan'),('ambassador','goals.manage'),('ambassador','recommendations.run'),('ambassador','promotions.read'),('ambassador','promotions.enter'),('ambassador','profile.manage_self'),
  ('dealer','catalog.read'),('dealer','events.read'),('dealer','recommendations.run'),('dealer','profile.manage_self'),
  ('card_shop','catalog.read'),('card_shop','events.read'),('card_shop','recommendations.run'),('card_shop','profile.manage_self'),
  ('org_admin','catalog.manage'),('org_admin','promotions.manage'),('org_admin','experiments.manage'),
  ('ruth_reviewer','promotions.draw'),('ruth_reviewer','promotions.manage'),
  ('super_admin','catalog.manage'),('super_admin','promotions.manage'),('super_admin','promotions.draw'),('super_admin','experiments.manage')
on conflict do nothing;

alter table public.catalog_sources enable row level security;
alter table public.collectible_categories enable row level security;
alter table public.franchises enable row level security;
alter table public.catalog_sets enable row level security;
alter table public.catalog_products enable row level security;
alter table public.set_checklist_items enable row level security;
alter table public.event_ticket_offers enable row level security;
alter table public.user_event_plans enable row level security;
alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;
alter table public.collection_goals enable row level security;
alter table public.collection_goal_items enable row level security;
alter table public.user_deck_goals enable row level security;
alter table public.bargain_bin_sessions enable row level security;
alter table public.bargain_bin_items enable row level security;
alter table public.recommendation_runs enable row level security;
alter table public.recommendation_items enable row level security;
alter table public.promotion_campaigns enable row level security;
alter table public.promotion_entries enable row level security;
alter table public.experiment_assignments enable row level security;
alter table public.experiment_events enable row level security;

create policy if not exists catalog_sources_read on public.catalog_sources for select using (enabled=true);
create policy if not exists categories_read on public.collectible_categories for select using (active=true);
create policy if not exists franchises_read on public.franchises for select using (active=true);
create policy if not exists catalog_sets_read on public.catalog_sets for select using (status <> 'rumored');
create policy if not exists catalog_products_read on public.catalog_products for select using (true);
create policy if not exists checklist_read on public.set_checklist_items for select using (true);
create policy if not exists ticket_offers_read on public.event_ticket_offers for select using (true);

create policy if not exists event_plans_owner_all on public.user_event_plans for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists savings_goals_owner_all on public.savings_goals for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists savings_contributions_owner_all on public.savings_contributions for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists collection_goals_owner_all on public.collection_goals for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists collection_goal_items_owner_all on public.collection_goal_items for all using (exists (select 1 from public.collection_goals g where g.id=collection_goal_id and g.user_id=auth.uid())) with check (exists (select 1 from public.collection_goals g where g.id=collection_goal_id and g.user_id=auth.uid()));
create policy if not exists user_deck_goals_owner_all on public.user_deck_goals for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists bargain_sessions_owner_all on public.bargain_bin_sessions for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists bargain_items_owner_all on public.bargain_bin_items for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists recommendation_runs_owner_all on public.recommendation_runs for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists recommendation_items_owner_read on public.recommendation_items for select using (exists (select 1 from public.recommendation_runs r where r.id=recommendation_run_id and r.user_id=auth.uid()));
create policy if not exists public_promotions_read on public.promotion_campaigns for select using (published=true and status in ('approved','open','closed','draw_pending','drawn'));
create policy if not exists promotion_entries_owner_all on public.promotion_entries for all using (user_id=auth.uid()) with check (user_id=auth.uid());
create policy if not exists experiment_assignments_owner_read on public.experiment_assignments for select using (user_id=auth.uid());
create policy if not exists experiment_events_owner_insert on public.experiment_events for insert with check (user_id=auth.uid() or user_id is null);
