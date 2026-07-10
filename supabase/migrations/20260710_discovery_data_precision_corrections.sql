alter table public.catalog_sets
  add column if not exists release_date_precision text not null default 'exact'
    check (release_date_precision in ('exact','month','quarter','year','unknown'));

alter table public.catalog_products
  add column if not exists release_date_precision text not null default 'exact'
    check (release_date_precision in ('exact','month','quarter','year','unknown'));

update public.catalog_products
set release_date_precision='month',
    metadata=coalesce(metadata, '{}'::jsonb) || '{"display_release":"October 2026","date_precision":"month"}'::jsonb
where product_code='EB-05'
  and franchise_id=(select id from public.franchises where slug='one-piece-card-game')
  and release_date='2026-10-01'::date;
