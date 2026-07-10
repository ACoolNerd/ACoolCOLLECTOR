create extension if not exists pgcrypto;

create table if not exists public.qbo_oauth_states (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  state_hash text not null unique,
  redirect_uri text not null,
  environment text not null check (environment in ('sandbox','production')),
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.qbo_protected_tokens (
  id uuid primary key default gen_random_uuid(),
  qbo_connection_id uuid not null unique references public.qbo_connections(id) on delete cascade,
  ciphertext text not null,
  initialization_vector text not null,
  authentication_tag text not null,
  token_fingerprint text not null,
  key_version text not null,
  updated_at timestamptz not null default now()
);

comment on table public.qbo_protected_tokens is
  'Application-encrypted Intuit token bundles. The encryption key is never stored in this database.';

create table if not exists public.qbo_sync_jobs (
  id uuid primary key default gen_random_uuid(),
  qbo_connection_id uuid not null references public.qbo_connections(id) on delete cascade,
  job_type text not null check (job_type in ('token_refresh','customer_sync','vendor_sync','invoice_sync','sales_receipt_sync','payment_sync','deposit_sync','refund_sync','fee_sync','commission_sync','consignor_payable_sync','webhook_reconcile','full_acceptance_test')),
  local_entity_type text,
  local_entity_id text,
  idempotency_key text not null unique,
  status text not null default 'queued' check (status in ('queued','running','succeeded','retry','failed','cancelled')),
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  result jsonb not null default '{}'::jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.external_source_observations (
  id uuid primary key default gen_random_uuid(),
  event_source_sync_id uuid not null references public.event_source_syncs(id) on delete cascade,
  checked_at timestamptz not null,
  http_status integer not null check (http_status between 100 and 599),
  source_fingerprint text not null,
  etag text,
  last_modified text,
  stale_at timestamptz not null,
  evaluation_status text not null check (evaluation_status in ('active','stale','error')),
  changed boolean not null default false,
  alert_code text,
  evidence jsonb not null default '{}'::jsonb,
  unique (event_source_sync_id, source_fingerprint, checked_at)
);

create table if not exists public.integration_acceptance_evidence (
  id uuid primary key default gen_random_uuid(),
  integration_key text not null,
  environment text not null check (environment in ('development','sandbox','staging','production')),
  evidence_type text not null check (evidence_type in ('terraform_plan','deployment','health_check','api_test','oauth_test','webhook_test','accounting_test','privacy_review','security_review','accessibility_review','legal_review','trademark_review','partner_approval','go_no_go')),
  status text not null check (status in ('pending','passed','failed','blocked','expired')),
  evidence_reference text,
  summary text not null,
  verified_by uuid references auth.users(id),
  verified_at timestamptz,
  expires_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists qbo_sync_jobs_ready_idx
  on public.qbo_sync_jobs(status, available_at);
create index if not exists external_source_observations_latest_idx
  on public.external_source_observations(event_source_sync_id, checked_at desc);
create index if not exists integration_acceptance_evidence_lookup_idx
  on public.integration_acceptance_evidence(integration_key, environment, evidence_type, status);

insert into public.permissions(permission_key, description) values
  ('accounting.connect','Start and complete a QuickBooks organization connection.'),
  ('accounting.sync','Execute approved QuickBooks synchronization jobs.'),
  ('integration_evidence.read','Read deployment and partner acceptance evidence.'),
  ('integration_evidence.manage','Create and approve deployment and partner acceptance evidence.'),
  ('external_sources.sync','Run official-source checks and create change alerts.')
on conflict (permission_key) do update set description=excluded.description;

insert into public.role_permissions(role_key, permission_key) values
  ('finance_admin','accounting.connect'),('finance_admin','accounting.sync'),
  ('org_admin','integration_evidence.read'),('org_admin','external_sources.sync'),
  ('super_admin','accounting.connect'),('super_admin','accounting.sync'),
  ('super_admin','integration_evidence.read'),('super_admin','integration_evidence.manage'),('super_admin','external_sources.sync')
on conflict do nothing;

alter table public.qbo_oauth_states enable row level security;
alter table public.qbo_protected_tokens enable row level security;
alter table public.qbo_sync_jobs enable row level security;
alter table public.external_source_observations enable row level security;
alter table public.integration_acceptance_evidence enable row level security;

create policy if not exists integration_acceptance_evidence_privileged_read
  on public.integration_acceptance_evidence for select
  using (
    exists (
      select 1 from public.organization_memberships membership
      join public.role_permissions rp on rp.role_key=membership.role_key
      where membership.user_id=auth.uid()
        and membership.status='active'
        and rp.permission_key='integration_evidence.read'
    )
  );

create policy if not exists qbo_sync_jobs_finance_read
  on public.qbo_sync_jobs for select
  using (
    exists (
      select 1 from public.qbo_connections connection
      join public.organization_memberships membership on membership.organization_id=connection.organization_id
      join public.role_permissions rp on rp.role_key=membership.role_key
      where connection.id=qbo_connection_id
        and membership.user_id=auth.uid()
        and membership.status='active'
        and rp.permission_key in ('accounting.manage','accounting.sync')
    )
  );
