create table if not exists public.qbo_protected_material (
  qbo_connection_id uuid primary key references public.qbo_connections(id) on delete cascade,
  protected_payload text not null,
  initialization_vector text not null,
  authentication_tag text not null,
  key_version text not null default 'v1',
  material_fingerprint text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.qbo_protected_material is
  'Server-only encrypted integration material. Plaintext credentials are prohibited.';

alter table public.qbo_protected_material enable row level security;
