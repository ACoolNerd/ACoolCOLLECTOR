import { Router } from 'express';
import { requireAuth, requirePermission, type ACoolRequest } from '../middleware/ACoolIAM.js';
import { calculateVendorReputation, type VendorReputationInputs } from './ACoolVendorReputation.js';

const router = Router();

const requireConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) throw new Error('card_show_service_not_configured');
  return { supabaseUrl, anonKey };
};

const headers = (accessToken: string, prefer?: string) => {
  const { anonKey } = requireConfig();
  return {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
};

const restRequest = async (
  accessToken: string,
  path: string,
  init: RequestInit = {},
) => {
  const { supabaseUrl } = requireConfig();
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      ...headers(accessToken, init.method === 'POST' ? 'return=representation' : undefined),
      ...(init.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload?.message || payload?.error || `supabase_request_failed_${response.status}`;
    throw new Error(String(message));
  }
  return payload;
};

const textValue = (value: unknown, max = 250): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
};

const centsValue = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) throw new Error('invalid_money_cents');
  return number;
};

router.use(requireAuth);

router.post('/sessions', async (request: ACoolRequest, response) => {
  try {
    const body = request.body ?? {};
    const sessionName = textValue(body.session_name, 120);
    if (!sessionName) return response.status(400).json({ error: 'session_name_required' });

    const payload = await restRequest(request.acoolIdentity!.accessToken, 'card_show_sessions', {
      method: 'POST',
      body: JSON.stringify({
        user_id: request.acoolIdentity!.userId,
        card_show_id: textValue(body.card_show_id, 50),
        session_name: sessionName,
        show_date: textValue(body.show_date, 10),
        venue_notes: textValue(body.venue_notes, 1000),
        budget_cents: centsValue(body.budget_cents),
        currency: textValue(body.currency, 3) ?? 'USD',
        offline_capture_enabled: body.offline_capture_enabled !== false,
      }),
    });
    return response.status(201).json(Array.isArray(payload) ? payload[0] : payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'session_create_failed';
    return response.status(message.startsWith('invalid_') ? 400 : 503).json({ error: message });
  }
});

router.get('/sessions', async (request: ACoolRequest, response) => {
  try {
    const userId = request.acoolIdentity!.userId;
    const payload = await restRequest(
      request.acoolIdentity!.accessToken,
      `card_show_sessions?user_id=eq.${encodeURIComponent(userId)}&select=*&order=started_at.desc`,
    );
    return response.json({ sessions: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'session_list_failed';
    return response.status(503).json({ error: message });
  }
});

router.post('/vendors', async (request: ACoolRequest, response) => {
  try {
    const body = request.body ?? {};
    const displayName = textValue(body.display_name, 160);
    if (!displayName) return response.status(400).json({ error: 'vendor_display_name_required' });

    const payload = await restRequest(request.acoolIdentity!.accessToken, 'vendors', {
      method: 'POST',
      body: JSON.stringify({
        display_name: displayName,
        legal_business_name: textValue(body.legal_business_name, 200),
        description: textValue(body.description, 1500),
        vendor_type: textValue(body.vendor_type, 40) ?? 'independent',
        website_url: textValue(body.website_url, 500),
        primary_city: textValue(body.primary_city, 120),
        primary_region: textValue(body.primary_region, 120),
        country_code: textValue(body.country_code, 2),
        created_by: request.acoolIdentity!.userId,
      }),
    });
    return response.status(201).json(Array.isArray(payload) ? payload[0] : payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'vendor_create_failed';
    const status = message.includes('duplicate') ? 409 : 503;
    return response.status(status).json({ error: message });
  }
});

router.get('/vendors/search', async (request: ACoolRequest, response) => {
  try {
    const query = textValue(request.query.q, 120);
    if (!query || query.length < 2) return response.status(400).json({ error: 'search_query_too_short' });
    const normalized = query.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const payload = await restRequest(
      request.acoolIdentity!.accessToken,
      `vendors?normalized_name=ilike.*${encodeURIComponent(normalized)}*&profile_status=in.(active,under_review)&select=id,display_name,vendor_type,website_url,primary_city,primary_region,verification_level,claim_status&limit=20`,
    );
    return response.json({ vendors: payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'vendor_search_failed';
    return response.status(503).json({ error: message });
  }
});

router.get('/vendors/:vendorId', async (request: ACoolRequest, response) => {
  try {
    const vendorId = textValue(request.params.vendorId, 50);
    if (!vendorId) return response.status(400).json({ error: 'vendor_id_required' });
    const token = request.acoolIdentity!.accessToken;

    const [vendorRows, contacts, socials, scores, appearances] = await Promise.all([
      restRequest(token, `vendors?id=eq.${encodeURIComponent(vendorId)}&select=*&limit=1`),
      restRequest(token, `vendor_contacts?vendor_id=eq.${encodeURIComponent(vendorId)}&visibility=eq.public&verification_status=neq.rejected&select=id,contact_type,label,public_value,deep_link_url,verification_status,source_type,last_verified_at&order=verification_status.desc`),
      restRequest(token, `vendor_social_accounts?vendor_id=eq.${encodeURIComponent(vendorId)}&verification_status=neq.rejected&select=id,platform,handle,profile_url,verification_status,is_public_business_account,last_checked_at`),
      restRequest(token, `vendor_reputation_snapshots?vendor_id=eq.${encodeURIComponent(vendorId)}&published=eq.true&select=*&order=calculated_at.desc&limit=1`),
      restRequest(token, `vendor_show_appearances?vendor_id=eq.${encodeURIComponent(vendorId)}&verification_status=neq.rejected&select=*,card_shows(id,name,venue_name,city,region,starts_at,ends_at)&order=created_at.desc&limit=25`),
    ]);

    const vendor = Array.isArray(vendorRows) ? vendorRows[0] : null;
    if (!vendor) return response.status(404).json({ error: 'vendor_not_found' });

    return response.json({
      vendor,
      contacts,
      social_accounts: socials,
      reputation: Array.isArray(scores) ? scores[0] ?? null : null,
      show_appearances: appearances,
      disclosure: 'Vendor profiles combine public business information, user-submitted evidence, verified transactions, and transparent reputation components. Social popularity alone does not determine the score.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'vendor_profile_failed';
    return response.status(503).json({ error: message });
  }
});

router.post('/wishlist/captures', async (request: ACoolRequest, response) => {
  try {
    const body = request.body ?? {};
    const objectPath = textValue(body?.image?.object_path, 1000);
    if (!objectPath) return response.status(400).json({ error: 'private_image_object_path_required' });

    const payload = await restRequest(request.acoolIdentity!.accessToken, 'rpc/create_card_show_capture', {
      method: 'POST',
      body: JSON.stringify({ capture: body }),
    });
    return response.status(201).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'wishlist_capture_failed';
    const status = message.includes('required') || message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

router.get('/wishlist', async (request: ACoolRequest, response) => {
  try {
    const userId = request.acoolIdentity!.userId;
    const sessionId = textValue(request.query.session_id, 50);
    const vendorId = textValue(request.query.vendor_id, 50);
    const filters = [`user_id=eq.${encodeURIComponent(userId)}`];
    if (sessionId) filters.push(`card_show_session_id=eq.${encodeURIComponent(sessionId)}`);

    const items = await restRequest(
      request.acoolIdentity!.accessToken,
      `wishlist_items?${filters.join('&')}&select=*,wishlist_item_images(*),vendor_card_sightings(*,vendors(id,display_name,verification_level))&order=created_at.desc&limit=250`,
    );

    const filtered = vendorId && Array.isArray(items)
      ? items.filter((item) => Array.isArray(item.vendor_card_sightings)
        && item.vendor_card_sightings.some((sighting: { vendor_id?: string }) => sighting.vendor_id === vendorId))
      : items;
    return response.json({ wishlist: filtered });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'wishlist_list_failed';
    return response.status(503).json({ error: message });
  }
});

router.post('/vendors/:vendorId/reviews', async (request: ACoolRequest, response) => {
  try {
    const vendorId = textValue(request.params.vendorId, 50);
    const body = request.body ?? {};
    const overallRating = Number(body.overall_rating);
    if (!vendorId || !Number.isInteger(overallRating) || overallRating < 1 || overallRating > 5) {
      return response.status(400).json({ error: 'valid_vendor_and_rating_required' });
    }

    const payload = await restRequest(request.acoolIdentity!.accessToken, 'vendor_reviews', {
      method: 'POST',
      body: JSON.stringify({
        vendor_id: vendorId,
        reviewer_user_id: request.acoolIdentity!.userId,
        vendor_transaction_id: textValue(body.vendor_transaction_id, 50),
        overall_rating: overallRating,
        communication_rating: body.communication_rating ?? null,
        accuracy_rating: body.accuracy_rating ?? null,
        pricing_fairness_rating: body.pricing_fairness_rating ?? null,
        fulfillment_rating: body.fulfillment_rating ?? null,
        review_title: textValue(body.review_title, 180),
        review_body: textValue(body.review_body, 4000),
        verified_transaction: false,
        incentive_received: body.incentive_received === true,
        incentive_disclosure: textValue(body.incentive_disclosure, 1000),
        relationship_disclosure: textValue(body.relationship_disclosure, 1000),
        moderation_status: 'pending',
      }),
    });
    return response.status(202).json({
      review: Array.isArray(payload) ? payload[0] : payload,
      status: 'pending_moderation',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'review_submit_failed';
    return response.status(503).json({ error: message });
  }
});

router.post(
  '/vendors/:vendorId/reputation/recalculate',
  requirePermission('vendor.reputation.review'),
  async (request: ACoolRequest, response) => {
    try {
      const vendorId = textValue(request.params.vendorId, 50);
      if (!vendorId) return response.status(400).json({ error: 'vendor_id_required' });
      const token = request.acoolIdentity!.accessToken;
      const inputs = await restRequest(token, 'rpc/get_vendor_reputation_inputs', {
        method: 'POST',
        body: JSON.stringify({ target_vendor_id: vendorId }),
      }) as VendorReputationInputs;
      const result = calculateVendorReputation(inputs);

      const rows = await restRequest(token, 'vendor_reputation_snapshots', {
        method: 'POST',
        body: JSON.stringify({
          vendor_id: vendorId,
          overall_score: result.overallScore,
          evidence_confidence: result.evidenceConfidence,
          score_status: result.scoreStatus,
          component_scores: result.componentScores,
          evidence_counts: result.evidenceCounts,
          explanation: result.explanation,
          scoring_model_version: result.scoringModelVersion,
          published: result.scoreStatus !== 'insufficient_evidence',
          calculated_by: request.acoolIdentity!.userId,
        }),
      });
      return response.json(Array.isArray(rows) ? rows[0] : rows);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'reputation_calculation_failed';
      return response.status(503).json({ error: message });
    }
  },
);

export default router;
