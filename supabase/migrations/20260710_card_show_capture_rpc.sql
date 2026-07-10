create or replace function public.create_card_show_capture(capture jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  new_wishlist_id uuid;
  new_image_id uuid;
  new_sighting_id uuid;
  recognition jsonb;
  card jsonb := coalesce(capture->'card', '{}'::jsonb);
  sighting jsonb := coalesce(capture->'sighting', '{}'::jsonb);
  image jsonb := coalesce(capture->'image', '{}'::jsonb);
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if nullif(image->>'object_path', '') is null then
    raise exception 'private_image_object_path_required';
  end if;

  insert into public.wishlist_items (
    user_id,
    card_show_session_id,
    title,
    player_or_character,
    year,
    manufacturer_or_game,
    set_name,
    card_number,
    parallel_or_variant,
    language_code,
    grading_company,
    grade_label,
    certification_number,
    condition_label,
    serial_number,
    recognition_status,
    recognition_confidence,
    interest_level,
    follow_up_status,
    target_price_cents,
    maximum_price_cents,
    currency,
    private_notes,
    tags
  ) values (
    auth.uid(),
    nullif(capture->>'card_show_session_id', '')::uuid,
    nullif(card->>'title', ''),
    nullif(card->>'player_or_character', ''),
    nullif(card->>'year', ''),
    nullif(card->>'manufacturer_or_game', ''),
    nullif(card->>'set_name', ''),
    nullif(card->>'card_number', ''),
    nullif(card->>'parallel_or_variant', ''),
    nullif(card->>'language_code', ''),
    nullif(card->>'grading_company', ''),
    nullif(card->>'grade_label', ''),
    nullif(card->>'certification_number', ''),
    nullif(card->>'condition_label', ''),
    nullif(card->>'serial_number', ''),
    coalesce(nullif(card->>'recognition_status', ''), 'pending'),
    nullif(card->>'recognition_confidence', '')::numeric,
    coalesce(nullif(card->>'interest_level', ''), 'watch'),
    coalesce(nullif(card->>'follow_up_status', ''), 'new'),
    nullif(card->>'target_price_cents', '')::bigint,
    nullif(card->>'maximum_price_cents', '')::bigint,
    coalesce(nullif(card->>'currency', ''), 'USD'),
    nullif(card->>'private_notes', ''),
    coalesce(array(select jsonb_array_elements_text(coalesce(capture->'tags', '[]'::jsonb))), '{}')
  ) returning id into new_wishlist_id;

  insert into public.wishlist_item_images (
    wishlist_item_id,
    object_path,
    image_role,
    sha256,
    captured_at,
    capture_metadata
  ) values (
    new_wishlist_id,
    image->>'object_path',
    coalesce(nullif(image->>'image_role', ''), 'show_capture'),
    nullif(image->>'sha256', ''),
    coalesce(nullif(image->>'captured_at', '')::timestamptz, now()),
    coalesce(image->'capture_metadata', '{}'::jsonb)
  ) returning id into new_image_id;

  if nullif(sighting->>'vendor_id', '') is not null then
    insert into public.vendor_card_sightings (
      wishlist_item_id,
      vendor_id,
      card_show_id,
      vendor_show_appearance_id,
      asking_price_cents,
      currency,
      condition_claim,
      vendor_claimed_grade,
      availability_status,
      negotiation_notes,
      captured_by,
      captured_at
    ) values (
      new_wishlist_id,
      (sighting->>'vendor_id')::uuid,
      nullif(sighting->>'card_show_id', '')::uuid,
      nullif(sighting->>'vendor_show_appearance_id', '')::uuid,
      nullif(sighting->>'asking_price_cents', '')::bigint,
      coalesce(nullif(sighting->>'currency', ''), 'USD'),
      nullif(sighting->>'condition_claim', ''),
      nullif(sighting->>'vendor_claimed_grade', ''),
      coalesce(nullif(sighting->>'availability_status', ''), 'seen'),
      nullif(sighting->>'negotiation_notes', ''),
      auth.uid(),
      coalesce(nullif(sighting->>'captured_at', '')::timestamptz, now())
    ) returning id into new_sighting_id;
  end if;

  for recognition in select value from jsonb_array_elements(coalesce(capture->'recognition_candidates', '[]'::jsonb))
  loop
    insert into public.card_recognition_candidates (
      wishlist_item_id,
      provider_name,
      provider_product_id,
      candidate_payload,
      confidence,
      evidence_type
    ) values (
      new_wishlist_id,
      coalesce(nullif(recognition->>'provider_name', ''), 'unknown'),
      nullif(recognition->>'provider_product_id', ''),
      coalesce(recognition->'candidate_payload', '{}'::jsonb),
      coalesce(nullif(recognition->>'confidence', '')::numeric, 0),
      coalesce(nullif(recognition->>'evidence_type', ''), 'ai_candidate')
    );
  end loop;

  return jsonb_build_object(
    'wishlist_item_id', new_wishlist_id,
    'image_id', new_image_id,
    'sighting_id', new_sighting_id,
    'status', 'private_wishlist_capture_created'
  );
end;
$$;
