begin;

create extension if not exists pgcrypto;

create table if not exists public.collector_storefronts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid null,
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{2,62}$'),
  display_name text not null check (char_length(display_name) between 1 and 100),
  bio text null check (char_length(coalesce(bio, '')) <= 1000),
  avatar_asset_id uuid null,
  banner_asset_id uuid null,
  seller_type text not null default 'collector' check (seller_type in ('collector','dealer','vendor','shop','consignor','creator')),
  specialties text[] not null default '{}',
  shipping_regions text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','pending_review','published','limited','suspended','closed')),
  business_verification_status text not null default 'not_started' check (business_verification_status in ('not_applicable','not_started','pending','verified','rejected','expired')),
  identity_verification_status text not null default 'not_started' check (identity_verification_status in ('not_started','pending','verified','rejected','expired')),
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storefront_members (
  storefront_id uuid not null references public.collector_storefronts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','manager','catalog_editor','support','viewer')),
  status text not null default 'active' check (status in ('invited','active','suspended','removed')),
  created_at timestamptz not null default now(),
  primary key (storefront_id, user_id)
);

create table if not exists public.showcase_collections (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  storefront_id uuid null references public.collector_storefronts(id) on delete set null,
  title text not null check (char_length(title) between 1 and 160),
  description text null check (char_length(coalesce(description, '')) <= 3000),
  showcase_type text not null default 'collection' check (showcase_type in ('collection','set','master_set','deck','player_run','character_run','team_run','artist_run','grading_journey','event_finds','custom')),
  visibility text not null default 'private' check (visibility in ('private','connections','members','public')),
  cover_asset_id uuid null,
  tags text[] not null default '{}',
  estimated_value_min_cents bigint null check (estimated_value_min_cents is null or estimated_value_min_cents >= 0),
  estimated_value_max_cents bigint null check (estimated_value_max_cents is null or estimated_value_max_cents >= 0),
  value_currency char(3) not null default 'USD',
  value_source text null,
  value_retrieved_at timestamptz null,
  status text not null default 'draft' check (status in ('draft','pending_review','published','archived','removed')),
  published_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.showcase_items (
  showcase_id uuid not null references public.showcase_collections(id) on delete cascade,
  acool_asset_id text not null,
  position integer not null default 0 check (position >= 0),
  public_title text null check (char_length(coalesce(public_title, '')) <= 240),
  public_story text null check (char_length(coalesce(public_story, '')) <= 3000),
  public_asset_id uuid null,
  hide_certification_number boolean not null default true,
  hide_serial_number boolean not null default true,
  hide_value boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (showcase_id, acool_asset_id)
);

create table if not exists public.community_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  storefront_id uuid null references public.collector_storefronts(id) on delete set null,
  title text not null check (char_length(title) between 1 and 180),
  description text null check (char_length(coalesce(description, '')) <= 5000),
  campaign_type text not null check (campaign_type in ('giveaway','sweepstakes','skill_contest','charitable_raffle','collaborative_drop','community_art_project')),
  status text not null default 'draft' check (status in ('draft','pending_rights_review','pending_legal_review','pending_ruth_review','approved','open','closed','drawing_pending','fulfilled','cancelled','suspended')),
  official_rules_url text null,
  legal_approval_reference text null,
  rights_approval_reference text null,
  ruth_review_reference text null,
  opens_at timestamptz null,
  closes_at timestamptz null,
  minimum_age integer null check (minimum_age is null or minimum_age between 0 and 99),
  eligible_jurisdictions text[] not null default '{}',
  excluded_jurisdictions text[] not null default '{}',
  no_purchase_method_required boolean not null default true,
  purchase_required boolean not null default false check (purchase_required = false),
  approximate_retail_value_cents bigint null check (approximate_retail_value_cents is null or approximate_retail_value_cents >= 0),
  currency char(3) not null default 'USD',
  entry_limit_per_user integer not null default 1 check (entry_limit_per_user between 1 and 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.campaign_contributors (
  campaign_id uuid not null references public.community_campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner','artist','designer','manufacturer','sponsor','fulfillment','moderator','legal_reviewer','rights_holder')),
  rights_status text not null default 'pending' check (rights_status in ('pending','attested','verified','rejected','revoked')),
  revenue_share_basis_points integer null check (revenue_share_basis_points is null or revenue_share_basis_points between 0 and 10000),
  approval_reference text null,
  created_at timestamptz not null default now(),
  primary key (campaign_id, user_id, role)
);

create table if not exists public.campaign_items (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.community_campaigns(id) on delete cascade,
  acool_asset_id text null,
  title text not null check (char_length(title) between 1 and 240),
  item_type text not null check (item_type in ('existing_collectible','original_art','custom_collectible','digital_collectible','experience','other')),
  ownership_verification_status text not null default 'pending' check (ownership_verification_status in ('pending','self_attested','evidence_submitted','verified','rejected','not_applicable')),
  rights_verification_status text not null default 'pending' check (rights_verification_status in ('pending','self_attested','evidence_submitted','verified','rejected','not_applicable')),
  edition_size integer null check (edition_size is null or edition_size > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.ownership_attestations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  acool_asset_id text not null,
  evidence_type text not null check (evidence_type in ('purchase_receipt','marketplace_receipt','grading_certification','event_receipt','custody_record','possession_challenge','consignor_agreement','manufacturer_record','artist_record','other')),
  evidence_asset_id uuid null,
  evidence_reference text null,
  nonce text null,
  status text not null default 'submitted' check (status in ('submitted','under_review','verified','rejected','expired','revoked')),
  verified_by_user_id uuid null references auth.users(id) on delete set null,
  verified_at timestamptz null,
  expires_at timestamptz null,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_provenance_events (
  id uuid primary key default gen_random_uuid(),
  acool_asset_id text not null,
  actor_user_id uuid null references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('created','acquired','sold','transferred','consigned','submitted_for_grading','returned_from_grading','placed_in_custody','released_from_custody','reported_stolen','recovered','ownership_verified','ownership_revoked')),
  source_type text not null check (source_type in ('user_attestation','transaction','grader','vendor','event','custody','administrator','import')),
  source_reference text null,
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.asset_image_fingerprints (
  id uuid primary key default gen_random_uuid(),
  acool_asset_id text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  image_role text not null check (image_role in ('front','back','edge','slab_label','certification','serial','security_feature','receipt','possession_challenge')),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  perceptual_hash text null,
  source_asset_id uuid null,
  created_at timestamptz not null default now(),
  unique (sha256, image_role)
);

create table if not exists public.marketplace_risk_decisions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid null,
  seller_user_id uuid not null references auth.users(id) on delete cascade,
  risk_score integer not null check (risk_score between 0 and 100),
  decision text not null check (decision in ('allow_with_disclosure','manual_review_required','hold_transaction','block_listing','suspend_seller_review')),
  reasons text[] not null default '{}',
  signals jsonb not null default '{}'::jsonb,
  model_version text not null,
  reviewer_user_id uuid null references auth.users(id) on delete set null,
  review_status text not null default 'automated_recommendation' check (review_status in ('automated_recommendation','human_confirmed','human_overridden','appealed','resolved')),
  created_at timestamptz not null default now()
);

create table if not exists public.fraud_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  subject_type text not null check (subject_type in ('listing','asset','storefront','seller','campaign','transaction','review','message')),
  subject_id text not null,
  report_type text not null check (report_type in ('counterfeit','stolen_item','stolen_image','certification_mismatch','non_delivery','payment_fraud','off_platform_pressure','misrepresentation','harassment','prohibited_item','other')),
  description text null check (char_length(coalesce(description, '')) <= 5000),
  evidence_asset_ids uuid[] not null default '{}',
  status text not null default 'submitted' check (status in ('submitted','triaged','investigating','actioned','dismissed','appealed','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transaction_holds (
  id uuid primary key default gen_random_uuid(),
  transaction_id text not null,
  imposed_by_user_id uuid null references auth.users(id) on delete set null,
  hold_type text not null check (hold_type in ('identity','ownership','counterfeit','payment','shipping','chargeback','dispute','compliance','manual_review')),
  status text not null default 'active' check (status in ('active','released','escalated','cancelled')),
  reason text not null check (char_length(reason) between 1 and 1000),
  created_at timestamptz not null default now(),
  released_at timestamptz null,
  release_reference text null
);

create table if not exists public.audio_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  music_enabled boolean not null default false,
  provider_key text null,
  source_mode text not null default 'external_deep_link' check (source_mode in ('acool_owned','user_owned','licensed_provider','external_deep_link','none')),
  duck_for_navigation boolean not null default true,
  pause_for_safety_alerts boolean not null default true,
  spoken_collection_stories boolean not null default false,
  speech_rate numeric(3,2) not null default 1.00 check (speech_rate between 0.50 and 2.00),
  updated_at timestamptz not null default now()
);

create index if not exists collector_storefronts_owner_idx on public.collector_storefronts(owner_user_id);
create index if not exists collector_storefronts_status_idx on public.collector_storefronts(status, published_at desc);
create index if not exists showcase_collections_owner_idx on public.showcase_collections(owner_user_id);
create index if not exists showcase_collections_public_idx on public.showcase_collections(status, visibility, published_at desc);
create index if not exists community_campaigns_status_idx on public.community_campaigns(status, opens_at, closes_at);
create index if not exists ownership_attestations_asset_idx on public.ownership_attestations(acool_asset_id, status);
create index if not exists asset_provenance_events_asset_idx on public.asset_provenance_events(acool_asset_id, occurred_at desc);
create index if not exists asset_image_fingerprints_phash_idx on public.asset_image_fingerprints(perceptual_hash) where perceptual_hash is not null;
create index if not exists marketplace_risk_decisions_seller_idx on public.marketplace_risk_decisions(seller_user_id, created_at desc);
create index if not exists fraud_reports_subject_idx on public.fraud_reports(subject_type, subject_id, created_at desc);

alter table public.collector_storefronts enable row level security;
alter table public.storefront_members enable row level security;
alter table public.showcase_collections enable row level security;
alter table public.showcase_items enable row level security;
alter table public.community_campaigns enable row level security;
alter table public.campaign_contributors enable row level security;
alter table public.campaign_items enable row level security;
alter table public.ownership_attestations enable row level security;
alter table public.asset_provenance_events enable row level security;
alter table public.asset_image_fingerprints enable row level security;
alter table public.marketplace_risk_decisions enable row level security;
alter table public.fraud_reports enable row level security;
alter table public.transaction_holds enable row level security;
alter table public.audio_preferences enable row level security;

create policy storefront_public_read on public.collector_storefronts for select using (status = 'published' or owner_user_id = auth.uid());
create policy storefront_owner_write on public.collector_storefronts for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy storefront_member_read on public.storefront_members for select using (user_id = auth.uid() or exists (select 1 from public.collector_storefronts s where s.id = storefront_id and s.owner_user_id = auth.uid()));
create policy showcase_public_read on public.showcase_collections for select using ((status = 'published' and visibility = 'public') or owner_user_id = auth.uid());
create policy showcase_owner_write on public.showcase_collections for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy showcase_item_read on public.showcase_items for select using (exists (select 1 from public.showcase_collections s where s.id = showcase_id and ((s.status = 'published' and s.visibility = 'public') or s.owner_user_id = auth.uid())));
create policy showcase_item_owner_write on public.showcase_items for all using (exists (select 1 from public.showcase_collections s where s.id = showcase_id and s.owner_user_id = auth.uid())) with check (exists (select 1 from public.showcase_collections s where s.id = showcase_id and s.owner_user_id = auth.uid()));
create policy campaign_public_read on public.community_campaigns for select using (status in ('approved','open','closed','drawing_pending','fulfilled') or owner_user_id = auth.uid());
create policy campaign_owner_write on public.community_campaigns for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy campaign_contributor_read on public.campaign_contributors for select using (user_id = auth.uid() or exists (select 1 from public.community_campaigns c where c.id = campaign_id and c.owner_user_id = auth.uid()));
create policy campaign_item_read on public.campaign_items for select using (exists (select 1 from public.community_campaigns c where c.id = campaign_id and (c.status in ('approved','open','closed','drawing_pending','fulfilled') or c.owner_user_id = auth.uid())));
create policy ownership_owner_access on public.ownership_attestations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy provenance_actor_read on public.asset_provenance_events for select using (actor_user_id = auth.uid());
create policy fingerprint_owner_access on public.asset_image_fingerprints for all using (owner_user_id = auth.uid()) with check (owner_user_id = auth.uid());
create policy risk_seller_read on public.marketplace_risk_decisions for select using (seller_user_id = auth.uid());
create policy fraud_reporter_access on public.fraud_reports for all using (reporter_user_id = auth.uid()) with check (reporter_user_id = auth.uid());
create policy audio_owner_access on public.audio_preferences for all using (user_id = auth.uid()) with check (user_id = auth.uid());

commit;
