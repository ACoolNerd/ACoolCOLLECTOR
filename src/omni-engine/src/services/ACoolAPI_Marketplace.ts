import { Router } from 'express';
import {
  requireAuth,
  requirePermission,
  type ACoolRequest,
} from '../middleware/ACoolIAM.js';

const router = Router();

const requireConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) throw new Error('marketplace_service_not_configured');
  return { supabaseUrl, anonKey };
};

const safeText = (value: unknown, max: number) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > max) return null;
  return normalized;
};

router.get('/listings', async (request, response) => {
  const limit = Math.min(100, Math.max(1, Number(request.query.limit ?? 25)));
  const offset = Math.max(0, Number(request.query.offset ?? 0));

  try {
    const { supabaseUrl, anonKey } = requireConfig();
    const query = new URLSearchParams({
      select: 'id,acool_asset_id,title,condition_label,asking_price_cents,currency,published_at',
      status: 'eq.published',
      order: 'published_at.desc',
      limit: String(limit),
      offset: String(offset),
    });
    const upstream = await fetch(`${supabaseUrl}/rest/v1/marketplace_listings?${query}`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    const payload = await upstream.json();
    return response.status(upstream.status).json({
      status: upstream.ok ? 'success' : 'error',
      listings: upstream.ok && Array.isArray(payload) ? payload : [],
      error: upstream.ok ? undefined : payload,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'marketplace_unavailable';
    return response.status(503).json({ error: message });
  }
});

router.post(
  '/listings/drafts',
  requireAuth,
  requirePermission('listing.prepare'),
  async (request: ACoolRequest, response) => {
    const organizationId = request.header('x-acool-organization-id');
    const acoolAssetId = safeText(request.body?.acoolAssetId, 128);
    const title = safeText(request.body?.title, 240);
    const conditionLabel = request.body?.conditionLabel === null
      ? null
      : safeText(request.body?.conditionLabel, 120);
    const askingPriceCents = Number(request.body?.askingPriceCents);

    if (!organizationId || !acoolAssetId || !title || !Number.isSafeInteger(askingPriceCents) || askingPriceCents < 0) {
      return response.status(400).json({ error: 'invalid_listing_draft_payload' });
    }

    try {
      const { supabaseUrl, anonKey } = requireConfig();
      const accessToken = request.acoolIdentity!.accessToken;
      const upstream = await fetch(`${supabaseUrl}/rest/v1/marketplace_listings`, {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          organization_id: organizationId,
          owner_user_id: request.acoolIdentity!.userId,
          acool_asset_id: acoolAssetId,
          title,
          condition_label: conditionLabel,
          asking_price_cents: askingPriceCents,
          currency: 'USD',
          status: 'draft_private_review',
          identity_verified: false,
          ownership_verified: false,
          condition_verified: false,
          pricing_reviewed: false,
          ruth_review_approved: false,
          owner_approved: false,
        }),
      });
      const payload = await upstream.json();
      return response.status(upstream.status).json(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'listing_draft_failed';
      return response.status(503).json({ error: message });
    }
  },
);

export default router;
