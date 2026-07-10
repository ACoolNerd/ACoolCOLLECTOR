create extension if not exists pgcrypto;

create table if not exists public.integration_activation_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  integration_key text not null,
  environment text not null default 'development' check (environment in ('development','sandbox','staging','production')),
  control_key text not null,
  control_weight numeric(6,2) not null check (control_weight > 0 and control_weight <= 100),
  status text not null default 'pending' check (status in ('pending','passed','failed','expired','revoked','waived')),
  evidence_type text not null,
  evidence_reference text,
  evidence_digest text,
  observed_at timestamptz,
  expires_at timestamptz,
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, integration_key, environment, control_key)
);

create table if not exists public.deployment_releases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  environment text not null check (environment in ('development','staging','production')),
  provider text not null default 'google_cloud',
  project_reference text,
  service_name text not null,
  image_reference text not null,
  image_digest text not null,
  terraform_plan_digest text,
  source_commit_sha text not null,
  deployment_status text not null default 'planned' check (deployment_status in ('planned','applying','deployed','healthy','degraded','rolled_back','failed')),
  service_url text,
  health_checked_at timestamptz,
  rollback_reference text,
  deployed_by uuid references auth.users(id),
  deployed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (environment, service_name, image_digest)
);

create table if not exists public.source_sync_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  source_key text not null,
  source_url text not null,
  source_kind text not null check (source_kind in ('event','ticket','retailer','grader','publisher','marketplace','other')),
  http_status integer,
  content_type text,
  etag text,
  last_modified text,
  response_fingerprint text,
  previous_fingerprint text,
  change_detected boolean not null default false,
  stale_after timestamptz,
  run_status text not null default 'started' check (run_status in ('started','unchanged','changed','failed','blocked','review_required')),
  checked_at timestamptz not null default now(),
  error_code text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.qbo_oauth_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  state_hash text not null unique,
  environment text not null check (environment in ('sandbox','production')),
  redirect_uri text not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.qbo_sync_operations (
  id uuid primary key default gen_random_uuid(),
  qbo_connection_id uuid not null references public.qbo_connections(id) on delete cascade,
  operation_key text not null,
  local_entity_type text not null,
  local_entity_id text not null,
  idempotency_key text not null unique,
  request_digest text not null,
  qbo_entity_type text,
  qbo_entity_id text,
  qbo_sync_token text,
  status text not null default 'queued' check (status in ('queued','processing','completed','reconcile_required','failed','cancelled')),
  attempt_count integer not null default 0,
  last_error_code text,
  response_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.release_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  release_key text not null,
  environment text not null check (environment in ('development','staging','production')),
  overall_score numeric(5,2) not null check (overall_score between 0 and 100),
  mandatory_controls_passed boolean not null default false,
  decision text not null check (decision in ('go','conditional_go','no_go')),
  unresolved_blockers jsonb not null default '[]'::jsonb,
  evidence_snapshot jsonb not null,
  decided_by uuid references auth.users(id),
  decided_at timestamptz not null default now(),
  unique (release_key, environment)
);

create index if not exists integration_activation_evidence_score_idx on public.integration_activation_evidence(integration_key, environment, status, expires_at);
create index if not exists source_sync_runs_key_checked_idx on public.source_sync_runs(source_key, checked_at desc);
create index if not exists qbo_oauth_sessions_expiry_idx on public.qbo_oauth_sessions(expires_at, used_at);
create index if not exists qbo_sync_operations_status_idx on public.qbo_sync_operations(status, updated_at);

alter table public.integration_activation_evidence enable row level security;
alter table public.deployment_releases enable row level security;
alter table public.source_sync_runs enable row level security;
alter table public.qbo_oauth_sessions enable row level security;
alter table public.qbo_sync_operations enable row level security;
alter table public.release_decisions enable row level security;

insert into public.permissions(permission_key, description) values
  ('integrations.evidence.read','Read activation evidence and readiness scores.'),
  ('integrations.evidence.manage','Create and approve activation evidence.'),
  ('deployment.release.manage','Record deployment releases and go or no-go decisions.')
on conflict (permission_key) do update set description=excluded.description;

insert into public.role_permissions(role_key, permission_key) values
  ('finance_admin','integrations.evidence.read'),
  ('org_admin','integrations.evidence.read'),
  ('org_admin','integrations.evidence.manage'),
  ('org_admin','deployment.release.manage'),
  ('super_admin','integrations.evidence.read'),
  ('super_admin','integrations.evidence.manage'),
  ('super_admin','deployment.release.manage')
on conflict do nothing;
