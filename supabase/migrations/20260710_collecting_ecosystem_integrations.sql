create extension if not exists pgcrypto;

create table if not exists public.external_organizations (
  id uuid primary key default gen_random_uuid(),
  organization_key text not null unique,
  display_name text not null,
  organization_type text not null check (organization_type in ('event_series','retailer','marketplace','grader','publisher','ticket_provider','technology_provider','other')),
  official_url text,
  verification_status text not null default 'pending' check (verification_status in ('pending','official_source_verified','identity_verified','business_verified','rejected')),
  relationship_status text not null default 'not_affiliated' check (relationship_status in ('not_affiliated','research_only','application_draft','applied','approved','suspended','expired','revoked')),
  official_partner_claim_allowed boolean not null default false,
  agreement_reference text,
  trademark_use_reference text,
  public_disclosure_text text,
  last_verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.external_locations (
  id uuid primary key default gen_random_uuid(),
  external_organization_id uuid not null references public.external_organizations(id) on delete cascade,
  location_name text not null,
  address_line_1 text,
  city text,
  region text,
  postal_code text,
  country_code text,
  latitude numeric(10,7),
  longitude numeric(10,7),
  google_place_id text,
  website_url text,
  status text not null default 'unverified' check (status in ('unverified','verified','temporarily_closed','permanently_closed','planned')),
  source_url text,
  last_verified_at timestamptz,
  unique (external_organization_id, location_name, city, region)
);

create table if not exists public.integration_capabilities (
  id uuid primary key default gen_random_uuid(),
  external_organization_id uuid not null references public.external_organizations(id) on delete cascade,
  capability_key text not null,
  integration_mode text not null check (integration_mode in ('official_api','approved_feed','oauth','webhook','affiliate_link','public_link','manual_verified','not_available')),
  status text not null default 'research' check (status in ('research','application_required','pending_approval','sandbox','active','degraded','disabled','rejected')),
  documentation_url text,
  credential_reference text,
  data_scope text[] not null default '{}',
  restrictions jsonb not null default '{}'::jsonb,
  last_verified_at timestamptz,
  unique (external_organization_id, capability_key)
);

create table if not exists public.integration_requests (
  id uuid primary key default gen_random_uuid(),
  external_organization_id uuid not null references public.external_organizations(id) on delete cascade,
  organization_id uuid references public.organizations(id) on delete cascade,
  request_type text not null check (request_type in ('affiliate','referral','inventory_feed','event_feed','grading_submission','certification_lookup','ticketing','oauth','webhook','sponsorship','other')),
  status text not null default 'draft' check (status in ('draft','submitted','pending','approved','rejected','withdrawn','expired')),
  owner_user_id uuid references auth.users(id),
  submitted_at timestamptz,
  approved_at timestamptz,
  agreement_reference text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_source_syncs (
  id uuid primary key default gen_random_uuid(),
  external_organization_id uuid not null references public.external_organizations(id) on delete cascade,
  source_url text not null,
  source_type text not null check (source_type in ('official_website','official_api','approved_feed','organizer_export','manual_verified')),
  refresh_frequency text,
  last_checked_at timestamptz,
  last_changed_at timestamptz,
  source_fingerprint text,
  status text not null default 'pending' check (status in ('pending','active','stale','error','disabled')),
  last_error_code text,
  unique (external_organization_id, source_url)
);

insert into public.permissions(permission_key, description) values
  ('external_organizations.read','Read verified external organizations and integration status.'),
  ('external_organizations.manage','Manage external organization verification, affiliations, and integration requests.'),
  ('integration_requests.manage','Create and administer external integration and partnership requests.')
on conflict (permission_key) do update set description=excluded.description;

insert into public.role_permissions(role_key, permission_key) values
  ('collector','external_organizations.read'),
  ('dealer','external_organizations.read'),
  ('card_shop','external_organizations.read'),
  ('org_admin','external_organizations.read'),
  ('org_admin','external_organizations.manage'),
  ('org_admin','integration_requests.manage'),
  ('super_admin','external_organizations.read'),
  ('super_admin','external_organizations.manage'),
  ('super_admin','integration_requests.manage')
on conflict do nothing;

alter table public.external_organizations enable row level security;
alter table public.external_locations enable row level security;
alter table public.integration_capabilities enable row level security;
alter table public.integration_requests enable row level security;
alter table public.event_source_syncs enable row level security;

create policy if not exists external_organizations_public_read
  on public.external_organizations for select
  using (verification_status in ('official_source_verified','identity_verified','business_verified'));

create policy if not exists external_locations_verified_read
  on public.external_locations for select
  using (status in ('verified','planned'));

create policy if not exists integration_capabilities_public_read
  on public.integration_capabilities for select
  using (status in ('sandbox','active','degraded'));
