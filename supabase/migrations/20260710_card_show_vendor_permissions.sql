insert into public.permissions (permission_key, description) values
  ('card_show.capture','Create private card-show wishlist captures.'),
  ('vendor.profile.manage','Manage claimed vendor profile and public business contacts.'),
  ('vendor.review.moderate','Moderate vendor reviews using viewpoint-neutral policy.'),
  ('vendor.reputation.review','Calculate and review evidence-based vendor reputation snapshots.'),
  ('vendor.dispute.review','Review vendor disputes and evidence.'),
  ('vendor.claim.review','Review vendor profile claims and verification evidence.')
on conflict (permission_key) do update set description = excluded.description;

insert into public.role_permissions (role_key, permission_key) values
  ('collector','card_show.capture'),
  ('ambassador','card_show.capture'),
  ('affiliate','card_show.capture'),
  ('partner','card_show.capture'),
  ('dealer','card_show.capture'),
  ('dealer','vendor.profile.manage'),
  ('card_shop','card_show.capture'),
  ('card_shop','vendor.profile.manage'),
  ('marketplace_manager','vendor.review.moderate'),
  ('marketplace_manager','vendor.reputation.review'),
  ('compliance_reviewer','vendor.review.moderate'),
  ('compliance_reviewer','vendor.reputation.review'),
  ('compliance_reviewer','vendor.dispute.review'),
  ('compliance_reviewer','vendor.claim.review'),
  ('ruth_reviewer','vendor.review.moderate'),
  ('ruth_reviewer','vendor.reputation.review'),
  ('ruth_reviewer','vendor.dispute.review'),
  ('ruth_reviewer','vendor.claim.review'),
  ('org_admin','vendor.review.moderate'),
  ('org_admin','vendor.reputation.review'),
  ('org_admin','vendor.dispute.review'),
  ('org_admin','vendor.claim.review'),
  ('super_admin','card_show.capture'),
  ('super_admin','vendor.profile.manage'),
  ('super_admin','vendor.review.moderate'),
  ('super_admin','vendor.reputation.review'),
  ('super_admin','vendor.dispute.review'),
  ('super_admin','vendor.claim.review')
on conflict do nothing;
