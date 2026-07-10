create extension if not exists pgcrypto;

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  provider_key text not null,
  connection_type text not null,
  environment text not null default 'sandbox' check (environment in ('sandbox','development','staging','production')),
  status text not null default 'not_configured' check (status in ('not_configured','pending_authorization','active','degraded','revoked','disabled')),
  granted_scopes text[] not null default '{}',
  credential_reference text,
  external_account_reference text,
  last_verified_at timestamptz,
  last_error_code text,
  configuration jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider_key, connection_type, environment)
);

comment on column public.integration_connections.credential_reference is
  'Reference to a secret-manager object only. Never store a token or secret value in this table.';

create table if not exists public.affiliate_programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  provider_name text not null,
  program_name text not null,
  program_type text not null check (program_type in ('affiliate','referral','reseller','technology_partner','sponsor','other')),
  approval_status text not null default 'not_applied' check (approval_status in ('not_applied','applied','approved','rejected','suspended','expired')),
  official_program_url text,
  agreement_reference text,
  disclosure_text text not null,
  commission_model jsonb not null default '{}'::jsonb,
  qbo_income_account_name text,
  qbo_expense_account_name text,
  qbo_class_name text,
  qbo_location_name text,
  starts_at timestamptz,
  expires_at timestamptz,
  last_verified_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider_name, program_name)
);

create table if not exists public.affiliate_links (
  id uuid primary key default gen_random_uuid(),
  affiliate_program_id uuid not null references public.affiliate_programs(id) on delete cascade,
  slug text not null unique,
  destination_url text not null,
  campaign_key text,
  content_key text,
  disclosure_label text not null default 'Affiliate link',
  status text not null default 'draft' check (status in ('draft','active','paused','expired','revoked')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  starts_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.affiliate_attribution_events (
  id uuid primary key default gen_random_uuid(),
  affiliate_link_id uuid not null references public.affiliate_links(id) on delete restrict,
  user_id uuid references auth.users(id) on delete set null,
  anonymous_session_hash text,
  event_type text not null check (event_type in ('impression','click','checkout_start','conversion_reported','conversion_verified','reversal')),
  consent_status text not null default 'unknown' check (consent_status in ('unknown','not_required','granted','denied')),
  referrer_origin text,
  landing_path text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  affiliate_program_id uuid not null references public.affiliate_programs(id) on delete restrict,
  affiliate_link_id uuid references public.affiliate_links(id) on delete set null,
  external_conversion_reference text not null,
  user_id uuid references auth.users(id) on delete set null,
  gross_amount_cents bigint check (gross_amount_cents is null or gross_amount_cents >= 0),
  commission_amount_cents bigint check (commission_amount_cents is null or commission_amount_cents >= 0),
  currency text not null default 'USD',
  status text not null default 'reported' check (status in ('reported','verified','payable','paid','reversed','rejected')),
  source_method text not null check (source_method in ('provider_api','provider_csv','webhook','manual_verified')),
  occurred_at timestamptz,
  verified_at timestamptz,
  qbo_entity_type text,
  qbo_entity_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (affiliate_program_id, external_conversion_reference)
);

create table if not exists public.qbo_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  realm_id text not null,
  environment text not null check (environment in ('sandbox','production')),
  status text not null default 'pending' check (status in ('pending','active','refresh_required','revoked','error')),
  encrypted_token_reference text not null,
  granted_scopes text[] not null default '{}',
  access_token_expires_at timestamptz,
  refresh_token_expires_at timestamptz,
  connected_by uuid references auth.users(id),
  connected_at timestamptz not null default now(),
  last_refresh_at timestamptz,
  last_error_code text,
  unique (organization_id, realm_id, environment)
);

comment on column public.qbo_connections.encrypted_token_reference is
  'Envelope-encrypted token reference or secret-manager path. Never store plaintext Intuit tokens.';

create table if not exists public.qbo_account_mappings (
  id uuid primary key default gen_random_uuid(),
  qbo_connection_id uuid not null references public.qbo_connections(id) on delete cascade,
  purpose_key text not null,
  qbo_account_id text,
  qbo_account_name text,
  qbo_class_id text,
  qbo_class_name text,
  qbo_location_id text,
  qbo_location_name text,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (qbo_connection_id, purpose_key)
);

create table if not exists public.qbo_entity_links (
  id uuid primary key default gen_random_uuid(),
  qbo_connection_id uuid not null references public.qbo_connections(id) on delete cascade,
  local_entity_type text not null,
  local_entity_id text not null,
  qbo_entity_type text not null,
  qbo_entity_id text not null,
  sync_token text,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (qbo_connection_id, local_entity_type, local_entity_id, qbo_entity_type)
);

create table if not exists public.qbo_webhook_events (
  id uuid primary key default gen_random_uuid(),
  qbo_connection_id uuid references public.qbo_connections(id) on delete set null,
  intuit_event_id text,
  realm_id text,
  entity_name text,
  entity_id text,
  operation text,
  signature_verified boolean not null default false,
  payload_digest text not null,
  processing_status text not null default 'received' check (processing_status in ('received','processing','processed','ignored','failed')),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_code text,
  unique (realm_id, entity_name, entity_id, operation, payload_digest)
);

create table if not exists public.seo_page_metadata (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  canonical_url text not null,
  title text not null,
  description text not null,
  og_type text not null default 'website',
  og_image_url text not null,
  og_image_alt text not null,
  robots_directive text not null default 'index,follow,max-image-preview:large',
  locale text not null default 'en_US',
  structured_data jsonb not null default '{}'::jsonb,
  published boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  last_validated_at timestamptz,
  validation_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.google_place_links (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('card_show','vendor','venue','grading_location','card_shop')),
  entity_id uuid not null,
  google_place_id text not null,
  display_name text,
  formatted_address text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  source_fields text[] not null default '{}',
  last_verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (entity_type, entity_id, google_place_id)
);

create table if not exists public.google_contact_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vendor_id uuid references public.vendors(id) on delete cascade,
  google_resource_name text not null,
  google_etag text,
  sync_direction text not null default 'export_only' check (sync_direction in ('export_only','import_only','two_way')),
  consented_scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active','paused','revoked','error')),
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, google_resource_name)
);

insert into public.permissions(permission_key, description) values
  ('integrations.manage','Manage approved external integrations and connection status.'),
  ('affiliate.read','Read approved affiliate program and conversion reports.'),
  ('affiliate.manage','Manage affiliate programs, links, disclosures, and reconciliation.'),
  ('accounting.manage','Manage QuickBooks connections and accounting mappings.'),
  ('seo.manage','Manage canonical metadata, structured data, social metadata, and validation.'),
  ('contacts.sync_self','Synchronize the actor authorized vendor contacts with Google People API.')
on conflict (permission_key) do update set description=excluded.description;

insert into public.role_permissions(role_key, permission_key) values
  ('collector','contacts.sync_self'),
  ('ambassador','affiliate.read'),('ambassador','contacts.sync_self'),
  ('affiliate','affiliate.read'),
  ('partner','affiliate.read'),
  ('finance_admin','affiliate.read'),('finance_admin','affiliate.manage'),('finance_admin','accounting.manage'),
  ('org_admin','integrations.manage'),('org_admin','affiliate.read'),('org_admin','affiliate.manage'),('org_admin','seo.manage'),
  ('super_admin','integrations.manage'),('super_admin','affiliate.read'),('super_admin','affiliate.manage'),('super_admin','accounting.manage'),('super_admin','seo.manage')
on conflict do nothing;

alter table public.integration_connections enable row level security;
alter table public.affiliate_programs enable row level security;
alter table public.affiliate_links enable row level security;
alter table public.affiliate_attribution_events enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.qbo_connections enable row level security;
alter table public.qbo_account_mappings enable row level security;
alter table public.qbo_entity_links enable row level security;
alter table public.qbo_webhook_events enable row level security;
alter table public.seo_page_metadata enable row level security;
alter table public.google_place_links enable row level security;
alter table public.google_contact_links enable row level security;

create policy if not exists affiliate_links_approved_read
  on public.affiliate_links for select
  using (
    status='active'
    and approved_at is not null
    and (starts_at is null or starts_at <= now())
    and (expires_at is null or expires_at > now())
    and exists (
      select 1 from public.affiliate_programs p
      where p.id=affiliate_program_id and p.approval_status='approved'
    )
  );

create policy if not exists affiliate_events_owner_insert
  on public.affiliate_attribution_events for insert
  with check (user_id=auth.uid() or user_id is null);

create policy if not exists affiliate_events_owner_read
  on public.affiliate_attribution_events for select
  using (user_id=auth.uid());

create policy if not exists affiliate_conversions_owner_read
  on public.affiliate_conversions for select
  using (user_id=auth.uid());

create policy if not exists seo_published_read
  on public.seo_page_metadata for select
  using (published=true and approved_at is not null);

create policy if not exists google_places_authenticated_read
  on public.google_place_links for select
  to authenticated
  using (true);

create policy if not exists google_contacts_owner_all
  on public.google_contact_links for all
  using (user_id=auth.uid())
  with check (user_id=auth.uid());
