create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  status text not null default 'active' check (status in ('active','suspended','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  status text not null default 'active' check (status in ('active','suspended','closed')),
  mfa_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  role_key text primary key,
  display_name text not null,
  description text not null,
  is_privileged boolean not null default false
);

create table if not exists public.permissions (
  permission_key text primary key,
  description text not null
);

create table if not exists public.role_permissions (
  role_key text not null references public.roles(role_key) on delete cascade,
  permission_key text not null references public.permissions(permission_key) on delete cascade,
  primary key (role_key, permission_key)
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null references public.roles(role_key),
  status text not null default 'active' check (status in ('invited','active','suspended','revoked')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists public.referral_programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  program_type text not null check (program_type in ('ambassador','affiliate','partner')),
  name text not null,
  default_role_key text not null references public.roles(role_key),
  commission_bps integer not null default 0 check (commission_bps between 0 and 10000),
  max_redemptions integer,
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.referral_codes (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.referral_programs(id) on delete cascade,
  code_hash text not null unique,
  code_last4 text not null,
  max_redemptions integer,
  active boolean not null default true,
  expires_at timestamptz,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.referral_redemptions (
  id uuid primary key default gen_random_uuid(),
  referral_code_id uuid not null references public.referral_codes(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assigned_role_key text not null references public.roles(role_key),
  redeemed_at timestamptz not null default now(),
  unique (referral_code_id, user_id)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  subject_type text not null,
  subject_id text,
  outcome text not null check (outcome in ('success','denied','failed','review_required')),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  acool_asset_id text not null,
  title text not null,
  condition_label text,
  asking_price_cents bigint not null check (asking_price_cents >= 0),
  currency text not null default 'USD',
  status text not null default 'draft_private_review' check (
    status in ('draft_private_review','in_review','approved','published','reserved','sold','withdrawn','rejected')
  ),
  identity_verified boolean not null default false,
  ownership_verified boolean not null default false,
  condition_verified boolean not null default false,
  pricing_reviewed boolean not null default false,
  ruth_review_approved boolean not null default false,
  owner_approved boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, acool_asset_id)
);

insert into public.roles (role_key, display_name, description, is_privileged) values
  ('collector','Collector','Manage the user-owned collection and requests.',false),
  ('ambassador','Ambassador','Collector access plus approved ambassador referral reporting.',false),
  ('affiliate','Affiliate','Approved affiliate attribution and reporting.',false),
  ('partner','Partner','Approved partner organization access.',false),
  ('dealer','Dealer','Dealer inventory and commerce operations.',false),
  ('card_shop','Card Shop','Approved card shop intake and submission operations.',false),
  ('intake_specialist','Intake Specialist','Prepare asset identity and evidence.',true),
  ('pricing_analyst','Pricing Analyst','Prepare market evidence and pricing recommendations.',true),
  ('grading_specialist','Grading Specialist','Prepare grading assessments and submissions.',true),
  ('vault_custodian','Vault Custodian','Record approved custody events.',true),
  ('marketplace_manager','Marketplace Manager','Review marketplace drafts and offers.',true),
  ('pos_operator','POS Operator','Create on-site orders and payment handoffs.',true),
  ('finance_admin','Finance Administrator','Manage accounting and payment reconciliation.',true),
  ('compliance_reviewer','Compliance Reviewer','Review policy, risk and disclosures.',true),
  ('ruth_reviewer','Ruth Reviewer','Approve claims, publication and release gates.',true),
  ('org_admin','Organization Administrator','Manage users and configuration for one organization.',true),
  ('super_admin','Platform Super Administrator','Emergency platform administration.',true)
on conflict (role_key) do update set
  display_name = excluded.display_name,
  description = excluded.description,
  is_privileged = excluded.is_privileged;

insert into public.permissions (permission_key, description) values
  ('collection.read','Read authorized collection records.'),
  ('collection.write','Create or update authorized private collection records.'),
  ('pricing.read','Read current guide and market evidence.'),
  ('pricing.prepare','Prepare pricing recommendations.'),
  ('listing.prepare','Create private listing drafts.'),
  ('listing.review','Review listing evidence.'),
  ('listing.publish','Publish an approved listing.'),
  ('referral.read_self','Read the actor’s referral performance.'),
  ('referral.manage','Create and manage referral programs and codes.'),
  ('iam.read_self','Read the actor’s access context.'),
  ('iam.manage','Manage organization memberships and roles.'),
  ('audit.read','Read authorized audit events.'),
  ('audit.export','Export authorized audit events.'),
  ('custody.record','Record approved custody events.'),
  ('finance.reconcile','Reconcile authorized payments and accounting entries.'),
  ('release.approve','Approve restricted publication or production release.')
on conflict (permission_key) do update set description = excluded.description;

insert into public.role_permissions (role_key, permission_key) values
  ('collector','collection.read'),('collector','collection.write'),('collector','pricing.read'),('collector','listing.prepare'),('collector','iam.read_self'),
  ('ambassador','collection.read'),('ambassador','collection.write'),('ambassador','pricing.read'),('ambassador','listing.prepare'),('ambassador','referral.read_self'),('ambassador','iam.read_self'),
  ('affiliate','collection.read'),('affiliate','pricing.read'),('affiliate','referral.read_self'),('affiliate','iam.read_self'),
  ('partner','collection.read'),('partner','pricing.read'),('partner','referral.read_self'),('partner','iam.read_self'),
  ('dealer','collection.read'),('dealer','collection.write'),('dealer','pricing.read'),('dealer','listing.prepare'),('dealer','iam.read_self'),
  ('card_shop','collection.read'),('card_shop','collection.write'),('card_shop','pricing.read'),('card_shop','listing.prepare'),('card_shop','iam.read_self'),
  ('intake_specialist','collection.read'),('intake_specialist','collection.write'),('intake_specialist','audit.read'),
  ('pricing_analyst','collection.read'),('pricing_analyst','pricing.read'),('pricing_analyst','pricing.prepare'),('pricing_analyst','listing.review'),('pricing_analyst','audit.read'),
  ('grading_specialist','collection.read'),('grading_specialist','pricing.read'),('grading_specialist','audit.read'),
  ('vault_custodian','collection.read'),('vault_custodian','custody.record'),('vault_custodian','audit.read'),
  ('marketplace_manager','collection.read'),('marketplace_manager','pricing.read'),('marketplace_manager','listing.review'),('marketplace_manager','audit.read'),
  ('pos_operator','collection.read'),('pos_operator','pricing.read'),
  ('finance_admin','pricing.read'),('finance_admin','finance.reconcile'),('finance_admin','audit.read'),('finance_admin','audit.export'),
  ('compliance_reviewer','collection.read'),('compliance_reviewer','pricing.read'),('compliance_reviewer','listing.review'),('compliance_reviewer','audit.read'),('compliance_reviewer','release.approve'),
  ('ruth_reviewer','collection.read'),('ruth_reviewer','pricing.read'),('ruth_reviewer','listing.review'),('ruth_reviewer','listing.publish'),('ruth_reviewer','audit.read'),('ruth_reviewer','release.approve'),
  ('org_admin','collection.read'),('org_admin','pricing.read'),('org_admin','listing.review'),('org_admin','referral.manage'),('org_admin','iam.manage'),('org_admin','audit.read'),('org_admin','audit.export'),
  ('super_admin','collection.read'),('super_admin','collection.write'),('super_admin','pricing.read'),('super_admin','pricing.prepare'),('super_admin','listing.prepare'),('super_admin','listing.review'),('super_admin','listing.publish'),('super_admin','referral.manage'),('super_admin','iam.manage'),('super_admin','audit.read'),('super_admin','audit.export'),('super_admin','custody.record'),('super_admin','finance.reconcile'),('super_admin','release.approve')
on conflict do nothing;

create or replace function public.hash_referral_code(raw_code text)
returns text
language sql
immutable
strict
as $$
  select encode(digest(upper(trim(raw_code)), 'sha256'), 'hex');
$$;

create or replace function public.verify_referral_code(p_code text)
returns table (
  valid boolean,
  program_type text,
  organization_name text,
  default_role_key text,
  commission_bps integer,
  reason text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  code_record record;
begin
  select rc.id, rc.active as code_active, rc.expires_at as code_expires_at,
         rc.max_redemptions as code_max_redemptions,
         rp.id as program_id, rp.active as program_active,
         rp.expires_at as program_expires_at, rp.starts_at,
         rp.max_redemptions as program_max_redemptions,
         rp.program_type, rp.default_role_key, rp.commission_bps,
         o.name as organization_name
    into code_record
    from public.referral_codes rc
    join public.referral_programs rp on rp.id = rc.program_id
    join public.organizations o on o.id = rp.organization_id
   where rc.code_hash = public.hash_referral_code(p_code)
   limit 1;

  if code_record is null then
    return query select false, null::text, null::text, null::text, null::integer, 'not_found'::text;
    return;
  end if;

  if not code_record.code_active or not code_record.program_active then
    return query select false, null::text, null::text, null::text, null::integer, 'inactive'::text;
    return;
  end if;

  if code_record.starts_at is not null and now() < code_record.starts_at then
    return query select false, null::text, null::text, null::text, null::integer, 'not_started'::text;
    return;
  end if;

  if (code_record.code_expires_at is not null and now() >= code_record.code_expires_at)
     or (code_record.program_expires_at is not null and now() >= code_record.program_expires_at) then
    return query select false, null::text, null::text, null::text, null::integer, 'expired'::text;
    return;
  end if;

  if code_record.code_max_redemptions is not null and
     (select count(*) from public.referral_redemptions rr where rr.referral_code_id = code_record.id) >= code_record.code_max_redemptions then
    return query select false, null::text, null::text, null::text, null::integer, 'code_limit_reached'::text;
    return;
  end if;

  if code_record.program_max_redemptions is not null and
     (select count(*) from public.referral_redemptions rr
       join public.referral_codes rc2 on rc2.id = rr.referral_code_id
      where rc2.program_id = code_record.program_id) >= code_record.program_max_redemptions then
    return query select false, null::text, null::text, null::text, null::integer, 'program_limit_reached'::text;
    return;
  end if;

  return query select true, code_record.program_type, code_record.organization_name,
                      code_record.default_role_key, code_record.commission_bps, null::text;
end;
$$;

create or replace function public.redeem_referral_code(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  code_record record;
  membership_id uuid;
begin
  if current_user_id is null then
    raise exception 'authentication_required';
  end if;

  select rc.id as code_id, rp.organization_id, rp.default_role_key
    into code_record
    from public.referral_codes rc
    join public.referral_programs rp on rp.id = rc.program_id
    join public.verify_referral_code(p_code) v on v.valid = true
   where rc.code_hash = public.hash_referral_code(p_code)
   limit 1;

  if code_record is null then
    raise exception 'invalid_or_unavailable_referral_code';
  end if;

  if exists (
    select 1 from public.referral_redemptions
     where referral_code_id = code_record.code_id and user_id = current_user_id
  ) then
    raise exception 'referral_code_already_redeemed';
  end if;

  insert into public.organization_memberships (organization_id, user_id, role_key, status, created_by)
  values (code_record.organization_id, current_user_id, code_record.default_role_key, 'active', current_user_id)
  on conflict (organization_id, user_id) do nothing
  returning id into membership_id;

  if membership_id is null then
    select id into membership_id from public.organization_memberships
     where organization_id = code_record.organization_id and user_id = current_user_id;
  end if;

  insert into public.referral_redemptions (
    referral_code_id, user_id, organization_id, assigned_role_key
  ) values (
    code_record.code_id, current_user_id, code_record.organization_id, code_record.default_role_key
  );

  insert into public.audit_events (
    organization_id, actor_user_id, event_type, subject_type, subject_id, outcome, evidence
  ) values (
    code_record.organization_id, current_user_id, 'referral.redeemed', 'organization_membership',
    membership_id::text, 'success', jsonb_build_object('role_key', code_record.default_role_key)
  );

  return jsonb_build_object(
    'organization_id', code_record.organization_id,
    'membership_id', membership_id,
    'role_key', code_record.default_role_key
  );
end;
$$;

create or replace function public.get_my_access_context()
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'user_id', auth.uid(),
    'memberships', coalesce(
      jsonb_agg(
        distinct jsonb_build_object(
          'organization_id', om.organization_id,
          'organization_name', o.name,
          'role_key', om.role_key,
          'status', om.status,
          'permissions', (
            select coalesce(jsonb_agg(rp.permission_key order by rp.permission_key), '[]'::jsonb)
              from public.role_permissions rp
             where rp.role_key = om.role_key
          )
        )
      ) filter (where om.id is not null),
      '[]'::jsonb
    )
  )
  from public.organization_memberships om
  join public.organizations o on o.id = om.organization_id
  where om.user_id = auth.uid() and om.status = 'active';
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.referral_programs enable row level security;
alter table public.referral_codes enable row level security;
alter table public.referral_redemptions enable row level security;
alter table public.audit_events enable row level security;
alter table public.marketplace_listings enable row level security;

create policy "authenticated can read role catalog" on public.roles
  for select to authenticated using (true);
create policy "authenticated can read permission catalog" on public.permissions
  for select to authenticated using (true);
create policy "authenticated can read role permissions" on public.role_permissions
  for select to authenticated using (true);
create policy "users can read own profile" on public.profiles
  for select to authenticated using (user_id = auth.uid());
create policy "users can read own memberships" on public.organization_memberships
  for select to authenticated using (user_id = auth.uid());
create policy "users can read own referral redemptions" on public.referral_redemptions
  for select to authenticated using (user_id = auth.uid());
create policy "actors can read own audit events" on public.audit_events
  for select to authenticated using (actor_user_id = auth.uid());
create policy "public can read published listings" on public.marketplace_listings
  for select to anon, authenticated using (status = 'published');
create policy "owners can read their listing drafts" on public.marketplace_listings
  for select to authenticated using (owner_user_id = auth.uid());
create policy "owners can create private listing drafts" on public.marketplace_listings
  for insert to authenticated with check (
    owner_user_id = auth.uid()
    and status = 'draft_private_review'
    and identity_verified = false
    and ownership_verified = false
    and condition_verified = false
    and pricing_reviewed = false
    and ruth_review_approved = false
    and owner_approved = false
  );

revoke all on function public.redeem_referral_code(text) from public;
grant execute on function public.redeem_referral_code(text) to authenticated;
grant execute on function public.verify_referral_code(text) to anon, authenticated;
grant execute on function public.get_my_access_context() to authenticated;
