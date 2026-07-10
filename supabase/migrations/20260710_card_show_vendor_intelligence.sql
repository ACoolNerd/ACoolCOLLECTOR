create extension if not exists pgcrypto;

create table if not exists public.card_shows (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  venue_name text,
  city text,
  region text,
  country_code text,
  starts_at timestamptz,
  ends_at timestamptz,
  organizer_name text,
  website_url text,
  verification_status text not null default 'community_submitted'
    check (verification_status in ('community_submitted','organizer_verified','platform_verified','rejected')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.card_show_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_show_id uuid references public.card_shows(id) on delete set null,
  session_name text not null,
  show_date date,
  venue_notes text,
  budget_cents bigint check (budget_cents is null or budget_cents >= 0),
  currency text not null default 'USD',
  offline_capture_enabled boolean not null default true,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vendors (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  legal_business_name text,
  normalized_name text generated always as (lower(regexp_replace(display_name, '[^a-zA-Z0-9]+', '', 'g'))) stored,
  description text,
  vendor_type text not null default 'independent'
    check (vendor_type in ('independent','card_shop','breaker','dealer','auction_house','consignor','show_promoter','other')),
  website_url text,
  logo_object_path text,
  primary_city text,
  primary_region text,
  country_code text,
  verification_level text not null default 'unclaimed'
    check (verification_level in ('unclaimed','claimed','identity_verified','business_verified','platform_partner')),
  claim_status text not null default 'unclaimed'
    check (claim_status in ('unclaimed','claim_pending','claimed','suspended')),
  profile_status text not null default 'active'
    check (profile_status in ('active','under_review','suspended','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists vendors_normalized_name_idx
  on public.vendors(normalized_name)
  where profile_status <> 'archived';

create table if not exists public.vendor_memberships (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  membership_role text not null check (membership_role in ('owner','manager','staff','analyst')),
  status text not null default 'active' check (status in ('pending','active','suspended','revoked')),
  created_at timestamptz not null default now(),
  unique (vendor_id, user_id)
);

create table if not exists public.vendor_show_appearances (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  card_show_id uuid not null references public.card_shows(id) on delete cascade,
  booth_label text,
  hall_name text,
  booth_notes text,
  verification_status text not null default 'community_submitted'
    check (verification_status in ('community_submitted','vendor_verified','organizer_verified','platform_verified','rejected')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (vendor_id, card_show_id, booth_label)
);

create table if not exists public.vendor_contacts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  contact_type text not null
    check (contact_type in ('website','email','phone','whatsapp','telegram','instagram','youtube','facebook','x','tiktok','discord','payment_link','other')),
  label text,
  public_value text not null,
  normalized_value text,
  deep_link_url text,
  visibility text not null default 'public' check (visibility in ('public','members_only','vendor_private')),
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','vendor_confirmed','platform_verified','rejected')),
  source_type text not null default 'user_submitted'
    check (source_type in ('vendor_submitted','user_submitted','public_business_page','official_api','organizer_directory')),
  source_url text,
  last_verified_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, contact_type, public_value)
);

create table if not exists public.vendor_social_accounts (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  platform text not null check (platform in ('instagram','youtube','facebook','x','tiktok','telegram','discord','other')),
  handle text,
  profile_url text not null,
  platform_account_id text,
  account_type text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified','vendor_confirmed','api_verified','platform_verified','rejected')),
  is_public_business_account boolean not null default false,
  last_checked_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (vendor_id, platform, profile_url)
);

create table if not exists public.vendor_social_snapshots (
  id uuid primary key default gen_random_uuid(),
  vendor_social_account_id uuid not null references public.vendor_social_accounts(id) on delete cascade,
  captured_at timestamptz not null default now(),
  source_method text not null check (source_method in ('official_api','vendor_export','manual_public_verification')),
  public_metrics jsonb not null default '{}'::jsonb,
  source_payload jsonb not null default '{}'::jsonb,
  evidence_confidence numeric(5,2) not null default 0 check (evidence_confidence between 0 and 100)
);

create table if not exists public.vendor_transactions (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  buyer_user_id uuid references auth.users(id) on delete set null,
  card_show_id uuid references public.card_shows(id) on delete set null,
  external_order_reference text,
  transaction_status text not null
    check (transaction_status in ('pending','completed','cancelled','refunded','chargeback','disputed')),
  amount_cents bigint check (amount_cents is null or amount_cents >= 0),
  currency text not null default 'USD',
  fulfillment_status text
    check (fulfillment_status is null or fulfillment_status in ('not_required','pending','on_time','late','failed','returned')),
  payment_method_label text,
  evidence_object_path text,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.vendor_reviews (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  reviewer_user_id uuid not null references auth.users(id) on delete cascade,
  vendor_transaction_id uuid references public.vendor_transactions(id) on delete set null,
  overall_rating smallint not null check (overall_rating between 1 and 5),
  communication_rating smallint check (communication_rating between 1 and 5),
  accuracy_rating smallint check (accuracy_rating between 1 and 5),
  pricing_fairness_rating smallint check (pricing_fairness_rating between 1 and 5),
  fulfillment_rating smallint check (fulfillment_rating between 1 and 5),
  review_title text,
  review_body text,
  verified_transaction boolean not null default false,
  incentive_received boolean not null default false,
  incentive_disclosure text,
  relationship_disclosure text,
  moderation_status text not null default 'pending'
    check (moderation_status in ('draft','pending','published','hidden_policy','removed_fraud','under_appeal')),
  moderation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (vendor_id, reviewer_user_id, vendor_transaction_id)
);

create table if not exists public.vendor_disputes (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete restrict,
  opened_by uuid not null references auth.users(id) on delete restrict,
  vendor_transaction_id uuid references public.vendor_transactions(id) on delete set null,
  dispute_type text not null
    check (dispute_type in ('identity','condition','authenticity','payment','delivery','return','conduct','review','other')),
  summary text not null,
  evidence_object_paths text[] not null default '{}',
  status text not null default 'open'
    check (status in ('open','awaiting_vendor','awaiting_user','mediation','resolved_user','resolved_vendor','inconclusive','closed')),
  resolution_summary text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.vendor_claims (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  claimant_user_id uuid not null references auth.users(id) on delete cascade,
  claim_basis text not null,
  evidence_object_paths text[] not null default '{}',
  status text not null default 'pending'
    check (status in ('pending','more_information','approved','rejected','withdrawn')),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.vendor_reputation_snapshots (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  calculated_at timestamptz not null default now(),
  overall_score numeric(5,2) check (overall_score is null or overall_score between 0 and 100),
  evidence_confidence numeric(5,2) not null check (evidence_confidence between 0 and 100),
  score_status text not null check (score_status in ('insufficient_evidence','provisional','established','under_review')),
  component_scores jsonb not null default '{}'::jsonb,
  evidence_counts jsonb not null default '{}'::jsonb,
  explanation text[] not null default '{}',
  scoring_model_version text not null,
  published boolean not null default false,
  calculated_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_show_session_id uuid references public.card_show_sessions(id) on delete set null,
  title text,
  player_or_character text,
  year text,
  manufacturer_or_game text,
  set_name text,
  card_number text,
  parallel_or_variant text,
  language_code text,
  grading_company text,
  grade_label text,
  certification_number text,
  condition_label text,
  serial_number text,
  recognition_status text not null default 'pending'
    check (recognition_status in ('pending','candidate','user_confirmed','expert_verified','rejected')),
  recognition_confidence numeric(5,2) check (recognition_confidence is null or recognition_confidence between 0 and 100),
  interest_level text not null default 'watch'
    check (interest_level in ('watch','want','priority','grail','pass')),
  follow_up_status text not null default 'new'
    check (follow_up_status in ('new','compare','contact_vendor','negotiating','purchased','passed','expired')),
  target_price_cents bigint check (target_price_cents is null or target_price_cents >= 0),
  maximum_price_cents bigint check (maximum_price_cents is null or maximum_price_cents >= 0),
  currency text not null default 'USD',
  private_notes text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_item_images (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  object_path text not null,
  image_role text not null default 'show_capture'
    check (image_role in ('show_capture','front','back','label','price_tag','booth','vendor_card','other')),
  sha256 text,
  captured_at timestamptz,
  capture_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.vendor_card_sightings (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  card_show_id uuid references public.card_shows(id) on delete set null,
  vendor_show_appearance_id uuid references public.vendor_show_appearances(id) on delete set null,
  asking_price_cents bigint check (asking_price_cents is null or asking_price_cents >= 0),
  currency text not null default 'USD',
  condition_claim text,
  vendor_claimed_grade text,
  availability_status text not null default 'seen'
    check (availability_status in ('seen','held','sold','still_available','unknown')),
  negotiation_notes text,
  captured_by uuid not null references auth.users(id) on delete cascade,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.card_recognition_candidates (
  id uuid primary key default gen_random_uuid(),
  wishlist_item_id uuid not null references public.wishlist_items(id) on delete cascade,
  provider_name text not null,
  provider_product_id text,
  candidate_payload jsonb not null,
  confidence numeric(5,2) not null check (confidence between 0 and 100),
  evidence_type text not null default 'ai_candidate'
    check (evidence_type in ('ocr','visual_similarity','provider_search','ai_candidate','human_research')),
  accepted_by_user boolean,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists card_show_sessions_user_idx on public.card_show_sessions(user_id, started_at desc);
create index if not exists vendor_search_idx on public.vendors using btree(normalized_name);
create index if not exists vendor_contacts_vendor_idx on public.vendor_contacts(vendor_id, visibility, verification_status);
create index if not exists vendor_reviews_vendor_idx on public.vendor_reviews(vendor_id, moderation_status, created_at desc);
create index if not exists vendor_reputation_vendor_idx on public.vendor_reputation_snapshots(vendor_id, published, calculated_at desc);
create index if not exists wishlist_user_idx on public.wishlist_items(user_id, created_at desc);
create index if not exists sightings_vendor_idx on public.vendor_card_sightings(vendor_id, captured_at desc);

create or replace function public.is_vendor_manager(target_vendor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.vendor_memberships vm
    where vm.vendor_id = target_vendor_id
      and vm.user_id = auth.uid()
      and vm.status = 'active'
      and vm.membership_role in ('owner','manager')
  );
$$;

create or replace function public.get_vendor_reputation_inputs(target_vendor_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with vendor_row as (
    select verification_level from public.vendors where id = target_vendor_id
  ), tx as (
    select
      count(*) filter (where transaction_status = 'completed')::int as verified_transaction_count,
      count(*) filter (where transaction_status in ('disputed','chargeback'))::int as disputed_transaction_count,
      count(*) filter (where transaction_status = 'completed' and fulfillment_status = 'on_time')::int as on_time_count,
      count(*) filter (where transaction_status = 'completed' and fulfillment_status in ('on_time','late','failed','returned'))::int as fulfillment_count
    from public.vendor_transactions where vendor_id = target_vendor_id
  ), reviews as (
    select
      count(*)::int as review_count,
      count(*) filter (where verified_transaction)::int as verified_review_count,
      avg(overall_rating)::numeric as average_overall_rating,
      avg(communication_rating)::numeric as average_communication_rating
    from public.vendor_reviews
    where vendor_id = target_vendor_id and moderation_status = 'published'
  ), socials as (
    select
      count(*) filter (where verification_status in ('vendor_confirmed','api_verified','platform_verified'))::int as verified_social_count,
      count(distinct platform)::int as distinct_social_sources
    from public.vendor_social_accounts where vendor_id = target_vendor_id
  )
  select jsonb_build_object(
    'verification_level', coalesce((select verification_level from vendor_row), 'unclaimed'),
    'verified_transaction_count', tx.verified_transaction_count,
    'disputed_transaction_count', tx.disputed_transaction_count,
    'on_time_count', tx.on_time_count,
    'fulfillment_count', tx.fulfillment_count,
    'review_count', reviews.review_count,
    'verified_review_count', reviews.verified_review_count,
    'average_overall_rating', reviews.average_overall_rating,
    'average_communication_rating', reviews.average_communication_rating,
    'verified_social_count', socials.verified_social_count,
    'distinct_social_sources', socials.distinct_social_sources
  )
  from tx, reviews, socials;
$$;

alter table public.card_shows enable row level security;
alter table public.card_show_sessions enable row level security;
alter table public.vendors enable row level security;
alter table public.vendor_memberships enable row level security;
alter table public.vendor_show_appearances enable row level security;
alter table public.vendor_contacts enable row level security;
alter table public.vendor_social_accounts enable row level security;
alter table public.vendor_social_snapshots enable row level security;
alter table public.vendor_transactions enable row level security;
alter table public.vendor_reviews enable row level security;
alter table public.vendor_disputes enable row level security;
alter table public.vendor_claims enable row level security;
alter table public.vendor_reputation_snapshots enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.wishlist_item_images enable row level security;
alter table public.vendor_card_sightings enable row level security;
alter table public.card_recognition_candidates enable row level security;

create policy card_shows_public_read on public.card_shows for select using (verification_status <> 'rejected');
create policy card_shows_authenticated_insert on public.card_shows for insert to authenticated with check (created_by = auth.uid());

create policy own_show_sessions on public.card_show_sessions for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy vendors_public_read on public.vendors for select using (profile_status in ('active','under_review'));
create policy vendors_authenticated_insert on public.vendors for insert to authenticated with check (created_by = auth.uid());
create policy vendors_manager_update on public.vendors for update to authenticated
  using (public.is_vendor_manager(id)) with check (public.is_vendor_manager(id));

create policy vendor_memberships_own_read on public.vendor_memberships for select to authenticated
  using (user_id = auth.uid() or public.is_vendor_manager(vendor_id));

create policy vendor_show_appearances_public_read on public.vendor_show_appearances for select using (verification_status <> 'rejected');
create policy vendor_show_appearances_authenticated_insert on public.vendor_show_appearances for insert to authenticated with check (created_by = auth.uid());

create policy vendor_contacts_public_read on public.vendor_contacts for select
  using (visibility = 'public' and verification_status <> 'rejected');
create policy vendor_contacts_manager_all on public.vendor_contacts for all to authenticated
  using (public.is_vendor_manager(vendor_id)) with check (public.is_vendor_manager(vendor_id));
create policy vendor_contacts_authenticated_insert on public.vendor_contacts for insert to authenticated with check (created_by = auth.uid());

create policy vendor_social_accounts_public_read on public.vendor_social_accounts for select using (verification_status <> 'rejected');
create policy vendor_social_accounts_manager_all on public.vendor_social_accounts for all to authenticated
  using (public.is_vendor_manager(vendor_id)) with check (public.is_vendor_manager(vendor_id));
create policy vendor_social_accounts_authenticated_insert on public.vendor_social_accounts for insert to authenticated with check (created_by = auth.uid());

create policy vendor_social_snapshots_public_read on public.vendor_social_snapshots for select using (evidence_confidence >= 50);

create policy vendor_transactions_participant_read on public.vendor_transactions for select to authenticated
  using (buyer_user_id = auth.uid() or public.is_vendor_manager(vendor_id));
create policy vendor_transactions_buyer_insert on public.vendor_transactions for insert to authenticated
  with check (buyer_user_id = auth.uid());

create policy vendor_reviews_public_read on public.vendor_reviews for select using (moderation_status = 'published');
create policy vendor_reviews_own_insert on public.vendor_reviews for insert to authenticated with check (reviewer_user_id = auth.uid());
create policy vendor_reviews_own_update on public.vendor_reviews for update to authenticated
  using (reviewer_user_id = auth.uid() and moderation_status in ('draft','pending'))
  with check (reviewer_user_id = auth.uid());

create policy vendor_disputes_participant_read on public.vendor_disputes for select to authenticated
  using (opened_by = auth.uid() or public.is_vendor_manager(vendor_id));
create policy vendor_disputes_own_insert on public.vendor_disputes for insert to authenticated with check (opened_by = auth.uid());

create policy vendor_claims_own_read on public.vendor_claims for select to authenticated
  using (claimant_user_id = auth.uid() or public.is_vendor_manager(vendor_id));
create policy vendor_claims_own_insert on public.vendor_claims for insert to authenticated with check (claimant_user_id = auth.uid());

create policy vendor_reputation_public_read on public.vendor_reputation_snapshots for select using (published);

create policy wishlist_own_all on public.wishlist_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy wishlist_images_own_all on public.wishlist_item_images for all to authenticated
  using (exists (select 1 from public.wishlist_items w where w.id = wishlist_item_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.wishlist_items w where w.id = wishlist_item_id and w.user_id = auth.uid()));
create policy sightings_own_all on public.vendor_card_sightings for all to authenticated
  using (captured_by = auth.uid()) with check (captured_by = auth.uid());
create policy recognition_own_all on public.card_recognition_candidates for all to authenticated
  using (exists (select 1 from public.wishlist_items w where w.id = wishlist_item_id and w.user_id = auth.uid()))
  with check (exists (select 1 from public.wishlist_items w where w.id = wishlist_item_id and w.user_id = auth.uid()));
