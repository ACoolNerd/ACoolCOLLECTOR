import { Router } from 'express';
import { requireAuth, requirePermission, type ACoolRequest } from '../middleware/ACoolIAM.js';
import { assessMarketplaceRisk } from './ACoolMarketplaceTrust.js';

const router = Router();

const config = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) throw new Error('community_marketplace_not_configured');
  return { supabaseUrl, anonKey };
};

const adminConfig = () => {
  const { supabaseUrl } = config();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) throw new Error('community_marketplace_admin_not_configured');
  return { supabaseUrl, serviceRoleKey };
};

const text = (value: unknown, max: number) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized && normalized.length <= max ? normalized : null;
};

const arrayOfText = (value: unknown, maxItems = 50, maxLength = 160) => (
  Array.isArray(value)
    ? value
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && item.length <= maxLength)
      .slice(0, maxItems)
    : []
);

const userHeaders = (request: ACoolRequest) => {
  const { anonKey } = config();
  return {
    apikey: anonKey,
    Authorization: `Bearer ${request.acoolIdentity!.accessToken}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };
};

router.get('/storefronts', async (request, response) => {
  try {
    const { supabaseUrl, anonKey } = config();
    const limit = Math.min(50, Math.max(1, Number(request.query.limit ?? 24)));
    const query = new URLSearchParams({
      select: 'id,slug,display_name,bio,avatar_asset_id,banner_asset_id,seller_type,specialties,shipping_regions,business_verification_status,identity_verification_status,published_at',
      status: 'eq.published',
      order: 'published_at.desc',
      limit: String(limit),
    });
    const upstream = await fetch(`${supabaseUrl}/rest/v1/collector_storefronts?${query}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    const payload = await upstream.json();
    return response.status(upstream.status).json({
      storefronts: upstream.ok && Array.isArray(payload) ? payload : [],
      error: upstream.ok ? undefined : payload,
      disclosure: 'Published storefronts remain subject to ACoolMARKET verification, moderation, and evidence rules.',
    });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'storefronts_unavailable' });
  }
});

router.get('/storefronts/:slug', async (request, response) => {
  try {
    const slug = text(request.params.slug, 63);
    if (!slug) return response.status(400).json({ error: 'invalid_storefront_slug' });
    const { supabaseUrl, anonKey } = config();
    const query = new URLSearchParams({
      select: '*',
      slug: `eq.${slug}`,
      status: 'eq.published',
      limit: '1',
    });
    const upstream = await fetch(`${supabaseUrl}/rest/v1/collector_storefronts?${query}`, {
      headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` },
    });
    const payload = await upstream.json();
    if (!upstream.ok) return response.status(upstream.status).json(payload);
    const storefront = Array.isArray(payload) ? payload[0] ?? null : null;
    return storefront
      ? response.json({ storefront, relationship_status: 'member_storefront_not_official_partner' })
      : response.status(404).json({ error: 'storefront_not_found' });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'storefront_unavailable' });
  }
});

router.post('/storefronts', requireAuth, async (request: ACoolRequest, response) => {
  const slug = text(request.body?.slug, 63)?.toLowerCase();
  const displayName = text(request.body?.display_name, 100);
  if (!slug || !/^[a-z0-9][a-z0-9-]{2,62}$/.test(slug) || !displayName) {
    return response.status(400).json({ error: 'invalid_storefront_payload' });
  }

  try {
    const { supabaseUrl } = config();
    const upstream = await fetch(`${supabaseUrl}/rest/v1/collector_storefronts`, {
      method: 'POST',
      headers: userHeaders(request),
      body: JSON.stringify({
        owner_user_id: request.acoolIdentity!.userId,
        organization_id: request.header('x-acool-organization-id') || null,
        slug,
        display_name: displayName,
        bio: text(request.body?.bio, 1000),
        seller_type: text(request.body?.seller_type, 40) || 'collector',
        specialties: arrayOfText(request.body?.specialties),
        shipping_regions: arrayOfText(request.body?.shipping_regions, 50, 10),
        status: 'draft',
        business_verification_status: 'not_started',
        identity_verification_status: 'not_started',
      }),
    });
    return response.status(upstream.status).json(await upstream.json());
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'storefront_create_failed' });
  }
});

router.post('/showcases', requireAuth, async (request: ACoolRequest, response) => {
  const title = text(request.body?.title, 160);
  if (!title) return response.status(400).json({ error: 'showcase_title_required' });

  try {
    const { supabaseUrl } = config();
    const upstream = await fetch(`${supabaseUrl}/rest/v1/showcase_collections`, {
      method: 'POST',
      headers: userHeaders(request),
      body: JSON.stringify({
        owner_user_id: request.acoolIdentity!.userId,
        storefront_id: request.body?.storefront_id || null,
        title,
        description: text(request.body?.description, 3000),
        showcase_type: text(request.body?.showcase_type, 40) || 'collection',
        visibility: 'private',
        tags: arrayOfText(request.body?.tags),
        status: 'draft',
      }),
    });
    return response.status(upstream.status).json(await upstream.json());
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'showcase_create_failed' });
  }
});

router.post('/campaigns', requireAuth, requirePermission('promotion.prepare'), async (request: ACoolRequest, response) => {
  const title = text(request.body?.title, 180);
  const campaignType = text(request.body?.campaign_type, 40);
  const allowedTypes = new Set(['giveaway', 'sweepstakes', 'skill_contest', 'charitable_raffle', 'collaborative_drop', 'community_art_project']);
  if (!title || !campaignType || !allowedTypes.has(campaignType)) {
    return response.status(400).json({ error: 'invalid_campaign_payload' });
  }

  try {
    const { supabaseUrl } = config();
    const upstream = await fetch(`${supabaseUrl}/rest/v1/community_campaigns`, {
      method: 'POST',
      headers: userHeaders(request),
      body: JSON.stringify({
        owner_user_id: request.acoolIdentity!.userId,
        storefront_id: request.body?.storefront_id || null,
        title,
        description: text(request.body?.description, 5000),
        campaign_type: campaignType,
        status: campaignType.includes('collaborative') || campaignType === 'community_art_project'
          ? 'pending_rights_review'
          : 'pending_legal_review',
        no_purchase_method_required: true,
        purchase_required: false,
        entry_limit_per_user: Math.min(1000, Math.max(1, Number(request.body?.entry_limit_per_user ?? 1))),
      }),
    });
    return response.status(upstream.status).json(await upstream.json());
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'campaign_create_failed' });
  }
});

router.post('/fraud/reports', requireAuth, async (request: ACoolRequest, response) => {
  const subjectType = text(request.body?.subject_type, 40);
  const subjectId = text(request.body?.subject_id, 240);
  const reportType = text(request.body?.report_type, 60);
  if (!subjectType || !subjectId || !reportType) {
    return response.status(400).json({ error: 'invalid_fraud_report' });
  }

  try {
    const { supabaseUrl } = config();
    const upstream = await fetch(`${supabaseUrl}/rest/v1/fraud_reports`, {
      method: 'POST',
      headers: userHeaders(request),
      body: JSON.stringify({
        reporter_user_id: request.acoolIdentity!.userId,
        subject_type: subjectType,
        subject_id: subjectId,
        report_type: reportType,
        description: text(request.body?.description, 5000),
        evidence_asset_ids: Array.isArray(request.body?.evidence_asset_ids) ? request.body.evidence_asset_ids.slice(0, 20) : [],
        status: 'submitted',
      }),
    });
    return response.status(upstream.status).json(await upstream.json());
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'fraud_report_failed' });
  }
});

router.post(
  '/fraud/evaluate',
  requireAuth,
  requirePermission('listing.review'),
  async (request: ACoolRequest, response) => {
    const decision = assessMarketplaceRisk(request.body?.signals || {});
    const listingId = text(request.body?.listing_id, 128);

    if (!listingId) return response.json({ decision, persisted: false });

    try {
      const { supabaseUrl, serviceRoleKey } = adminConfig();
      const upstream = await fetch(`${supabaseUrl}/rest/v1/marketplace_risk_decisions`, {
        method: 'POST',
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          listing_id: listingId,
          seller_user_id: text(request.body?.seller_user_id, 128) || request.acoolIdentity!.userId,
          risk_score: decision.riskScore,
          decision: decision.decision,
          reasons: decision.reasons,
          signals: request.body?.signals || {},
          model_version: decision.modelVersion,
          reviewer_user_id: request.acoolIdentity!.userId,
          review_status: 'automated_recommendation',
        }),
      });
      return response.status(upstream.status).json({ decision, persisted: upstream.ok, record: await upstream.json() });
    } catch (error) {
      return response.status(503).json({ error: error instanceof Error ? error.message : 'risk_decision_persist_failed', decision });
    }
  },
);

router.get('/audio/capabilities', requireAuth, (_request, response) => response.json({
  music_enabled: process.env.ACOOL_MUSIC_ENABLED === 'true',
  acool_owned_audio_enabled: process.env.ACOOL_OWNED_AUDIO_ENABLED === 'true',
  licensed_provider_keys: (process.env.ACOOL_LICENSED_MUSIC_PROVIDERS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  external_deep_links_enabled: true,
  navigation_audio_policy: 'duck_or_pause_for_navigation_and_safety_alerts',
  rights_policy: 'Only ACool-owned, user-owned, or properly licensed audio may be played inside the app.',
}));

export default router;
