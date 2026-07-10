import { Router } from 'express';
import { requireAuth, requirePermission, type ACoolRequest } from '../middleware/ACoolIAM.js';
import {
  calculateSavingsPlan,
  evaluateBargainGrading,
  recommendCollectionGaps,
  recommendDeckGaps,
  type BargainGradeInput,
  type CollectionGapCandidate,
  type DeckGapCandidate,
} from './ACoolRecommendationEngine.js';
import { assignExperimentVariant, validateExperimentEvent } from './ACoolExperimentEngine.js';
import { evaluatePromotionEntry, selectPromotionWinner, type PromotionCampaign } from './ACoolPromotionEngine.js';

const router = Router();

const requireConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) throw new Error('discovery_service_not_configured');
  return { supabaseUrl, anonKey };
};

const restRequest = async (accessToken: string, path: string, init: RequestInit = {}) => {
  const { supabaseUrl, anonKey } = requireConfig();
  const method = init.method?.toUpperCase() ?? 'GET';
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(method === 'POST' || method === 'PATCH' ? { Prefer: 'return=representation' } : {}),
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(String(payload?.message || payload?.error || `supabase_request_failed_${response.status}`));
  }
  return payload;
};

const textValue = (value: unknown, max = 250): string | null => {
  if (typeof value !== 'string') return null;
  const result = value.trim();
  return result ? result.slice(0, max) : null;
};

const centsValue = (value: unknown, required = false): number | null => {
  if (value === null || value === undefined || value === '') {
    if (required) throw new Error('money_cents_required');
    return null;
  }
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0) throw new Error('invalid_money_cents');
  return result;
};

router.use(requireAuth);

router.get('/profile', async (request: ACoolRequest, response) => {
  try {
    const rows = await restRequest(
      request.acoolIdentity!.accessToken,
      `profiles?user_id=eq.${encodeURIComponent(request.acoolIdentity!.userId)}&select=*&limit=1`,
    );
    return response.json({ profile: Array.isArray(rows) ? rows[0] ?? null : null });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'profile_read_failed' });
  }
});

router.patch('/profile', requirePermission('profile.manage_self'), async (request: ACoolRequest, response) => {
  try {
    const body = request.body ?? {};
    const privacySettings = typeof body.privacy_settings === 'object' && body.privacy_settings !== null
      ? body.privacy_settings
      : undefined;
    const notificationSettings = typeof body.notification_settings === 'object' && body.notification_settings !== null
      ? body.notification_settings
      : undefined;
    const collectingInterests = Array.isArray(body.collecting_interests)
      ? body.collecting_interests.slice(0, 100)
      : undefined;

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    const username = textValue(body.username, 40);
    const bio = textValue(body.bio, 1000);
    const homeRegion = textValue(body.home_region, 120);
    const currency = textValue(body.preferred_currency, 3);
    if (username !== null) patch.username = username;
    if (bio !== null) patch.bio = bio;
    if (homeRegion !== null) patch.home_region = homeRegion;
    if (currency !== null) patch.preferred_currency = currency.toUpperCase();
    if (privacySettings !== undefined) patch.privacy_settings = privacySettings;
    if (notificationSettings !== undefined) patch.notification_settings = notificationSettings;
    if (collectingInterests !== undefined) patch.collecting_interests = collectingInterests;

    const rows = await restRequest(
      request.acoolIdentity!.accessToken,
      `profiles?user_id=eq.${encodeURIComponent(request.acoolIdentity!.userId)}`,
      { method: 'PATCH', body: JSON.stringify(patch) },
    );
    return response.json({ profile: Array.isArray(rows) ? rows[0] ?? null : rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'profile_update_failed';
    return response.status(message.startsWith('invalid_') ? 400 : 503).json({ error: message });
  }
});

router.get('/catalog/categories', async (request: ACoolRequest, response) => {
  try {
    const rows = await restRequest(
      request.acoolIdentity!.accessToken,
      'collectible_categories?active=eq.true&select=id,slug,display_name,parent_id,schema_version&order=display_name.asc',
    );
    return response.json({ categories: rows });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'category_list_failed' });
  }
});

router.get('/catalog/sets', async (request: ACoolRequest, response) => {
  try {
    const franchise = textValue(request.query.franchise, 80);
    const upcoming = request.query.upcoming === 'true';
    const filters = ['select=*,franchises!inner(slug,display_name,publisher_or_brand),catalog_sources(display_name,source_type,last_checked_at)'];
    if (franchise) filters.push(`franchises.slug=eq.${encodeURIComponent(franchise)}`);
    if (upcoming) filters.push(`release_date=gte.${new Date().toISOString().slice(0, 10)}`);
    filters.push('order=release_date.asc.nullslast');
    const rows = await restRequest(request.acoolIdentity!.accessToken, `catalog_sets?${filters.join('&')}`);
    return response.json({ sets: rows, disclosure: 'Release dates are source-attributed and must display their last verified timestamp.' });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'set_list_failed' });
  }
});

router.get('/catalog/products', async (request: ACoolRequest, response) => {
  try {
    const franchise = textValue(request.query.franchise, 80);
    const filters = ['select=*,franchises!inner(slug,display_name),catalog_sources(display_name,source_type,last_checked_at)'];
    if (franchise) filters.push(`franchises.slug=eq.${encodeURIComponent(franchise)}`);
    filters.push('order=release_date.asc.nullslast');
    const rows = await restRequest(request.acoolIdentity!.accessToken, `catalog_products?${filters.join('&')}`);
    return response.json({ products: rows });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'product_list_failed' });
  }
});

router.get('/events', async (request: ACoolRequest, response) => {
  try {
    const from = textValue(request.query.from, 10) ?? new Date().toISOString().slice(0, 10);
    const region = textValue(request.query.region, 20);
    const filters = [`starts_at=gte.${encodeURIComponent(`${from}T00:00:00Z`)}`];
    if (region) filters.push(`region=eq.${encodeURIComponent(region)}`);
    filters.push('select=*,event_ticket_offers(*)&order=starts_at.asc&limit=500');
    const rows = await restRequest(request.acoolIdentity!.accessToken, `card_shows?${filters.join('&')}`);
    return response.json({ events: rows, ticket_mode: 'official_external_checkout' });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'event_list_failed' });
  }
});

router.post('/events/:eventId/plan', requirePermission('events.plan'), async (request: ACoolRequest, response) => {
  try {
    const eventId = textValue(request.params.eventId, 50);
    if (!eventId) return response.status(400).json({ error: 'event_id_required' });
    const body = request.body ?? {};
    const rows = await restRequest(request.acoolIdentity!.accessToken, 'user_event_plans?on_conflict=user_id,card_show_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        user_id: request.acoolIdentity!.userId,
        card_show_id: eventId,
        status: textValue(body.status, 20) ?? 'interested',
        ticket_offer_id: textValue(body.ticket_offer_id, 50),
        travel_budget_cents: centsValue(body.travel_budget_cents),
        show_budget_cents: centsValue(body.show_budget_cents),
        notes: textValue(body.notes, 2000),
        updated_at: new Date().toISOString(),
      }),
    });
    return response.status(201).json({ plan: Array.isArray(rows) ? rows[0] : rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'event_plan_failed';
    return response.status(message.startsWith('invalid_') ? 400 : 503).json({ error: message });
  }
});

router.post('/savings-goals', requirePermission('events.plan'), async (request: ACoolRequest, response) => {
  try {
    const body = request.body ?? {};
    const title = textValue(body.title, 160);
    const targetDate = textValue(body.target_date, 10);
    const targetCents = centsValue(body.target_cents, true)!;
    const currentCents = centsValue(body.current_cents) ?? 0;
    if (!title || !targetDate) return response.status(400).json({ error: 'title_and_target_date_required' });
    const plan = calculateSavingsPlan(targetCents, currentCents, targetDate);
    const rows = await restRequest(request.acoolIdentity!.accessToken, 'savings_goals', {
      method: 'POST',
      body: JSON.stringify({
        user_id: request.acoolIdentity!.userId,
        event_plan_id: textValue(body.event_plan_id, 50),
        goal_type: textValue(body.goal_type, 40) ?? 'other',
        title,
        target_cents: targetCents,
        current_cents: currentCents,
        currency: textValue(body.currency, 3) ?? 'USD',
        target_date: targetDate,
        cadence: textValue(body.cadence, 20) ?? 'weekly',
      }),
    });
    return response.status(201).json({ goal: Array.isArray(rows) ? rows[0] : rows, plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'savings_goal_failed';
    return response.status(message.startsWith('invalid_') || message.endsWith('_required') ? 400 : 503).json({ error: message });
  }
});

router.get('/savings-goals', requirePermission('events.plan'), async (request: ACoolRequest, response) => {
  try {
    const rows = await restRequest(
      request.acoolIdentity!.accessToken,
      `savings_goals?user_id=eq.${encodeURIComponent(request.acoolIdentity!.userId)}&select=*,savings_contributions(*)&order=target_date.asc.nullslast`,
    );
    return response.json({ savings_goals: rows });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'savings_goals_failed' });
  }
});

router.post('/recommendations/collection', requirePermission('recommendations.run'), (request, response) => {
  try {
    const body = request.body ?? {};
    const candidates = Array.isArray(body.candidates) ? body.candidates as CollectionGapCandidate[] : [];
    const budgetCents = centsValue(body.budget_cents, true)!;
    return response.json({ recommendations: recommendCollectionGaps(candidates, budgetCents), model_version: 'collection-gap-1.0' });
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : 'collection_recommendation_failed' });
  }
});

router.post('/recommendations/deck', requirePermission('recommendations.run'), (request, response) => {
  try {
    const body = request.body ?? {};
    const candidates = Array.isArray(body.candidates) ? body.candidates as DeckGapCandidate[] : [];
    const budgetCents = centsValue(body.budget_cents, true)!;
    return response.json({ recommendations: recommendDeckGaps(candidates, budgetCents), model_version: 'deck-gap-1.0' });
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : 'deck_recommendation_failed' });
  }
});

router.post('/recommendations/bargain-grading', requirePermission('recommendations.run'), (request, response) => {
  try {
    return response.json({ result: evaluateBargainGrading(request.body as BargainGradeInput), model_version: 'bargain-grade-1.0' });
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : 'bargain_grading_failed' });
  }
});

router.get('/grading/services', async (request: ACoolRequest, response) => {
  try {
    const rows = await restRequest(
      request.acoolIdentity!.accessToken,
      'grading_providers?active=eq.true&select=*,grading_service_levels(active,service_name,fee_cents,currency,max_declared_value_cents,estimated_turnaround_min_days,estimated_turnaround_max_days,official_url,source_last_verified_at)&order=display_name.asc',
    );
    return response.json({ providers: rows, disclosure: 'Fees and turnaround times can change. Display official source and last verified time.' });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'grading_services_failed' });
  }
});

router.get('/promotions', requirePermission('promotions.read'), async (request: ACoolRequest, response) => {
  try {
    const rows = await restRequest(
      request.acoolIdentity!.accessToken,
      'promotion_campaigns?published=eq.true&status=in.(approved,open,closed,draw_pending,drawn)&select=*,promotion_prizes(*)&order=opens_at.desc.nullslast',
    );
    return response.json({ promotions: rows, disclosure: 'Only legally approved and published promotions are visible.' });
  } catch (error) {
    return response.status(503).json({ error: error instanceof Error ? error.message : 'promotion_list_failed' });
  }
});

router.post('/promotions/:promotionId/enter', requirePermission('promotions.enter'), async (request: ACoolRequest, response) => {
  try {
    const promotionId = textValue(request.params.promotionId, 50);
    if (!promotionId) return response.status(400).json({ error: 'promotion_id_required' });
    const token = request.acoolIdentity!.accessToken;
    const rows = await restRequest(token, `promotion_campaigns?id=eq.${encodeURIComponent(promotionId)}&select=*&limit=1`);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) return response.status(404).json({ error: 'promotion_not_found' });

    const existing = await restRequest(
      token,
      `promotion_entries?promotion_campaign_id=eq.${encodeURIComponent(promotionId)}&user_id=eq.${encodeURIComponent(request.acoolIdentity!.userId)}&select=id`,
    );
    const body = request.body ?? {};
    const campaign: PromotionCampaign = {
      id: row.id,
      promotionKind: row.promotion_kind,
      status: row.status,
      purchaseRequired: row.purchase_required,
      noPurchaseMethod: row.no_purchase_method,
      minimumAge: row.minimum_age,
      allowedJurisdictions: row.allowed_jurisdictions ?? [],
      excludedJurisdictions: row.excluded_jurisdictions ?? [],
      officialRulesUrl: row.official_rules_url,
      legalApprovalReference: row.legal_approval_reference,
      legalApprovedAt: row.legal_approved_at,
      opensAt: row.opens_at,
      closesAt: row.closes_at,
      maximumEntriesPerUser: row.maximum_entries_per_user,
      published: row.published,
      seedCommitment: row.seed_commitment,
    };
    const evaluation = evaluatePromotionEntry(campaign, {
      userAge: Number(body.user_age),
      jurisdictionCode: textValue(body.jurisdiction_code, 20) ?? '',
      existingEntryCount: Array.isArray(existing) ? existing.length : 0,
      rulesAccepted: body.rules_accepted === true,
      entryMethod: textValue(body.entry_method, 80) ?? 'no_purchase_entry',
    });
    if (!evaluation.eligible) return response.status(422).json({ error: 'promotion_entry_ineligible', evaluation });

    const inserted = await restRequest(token, 'promotion_entries', {
      method: 'POST',
      body: JSON.stringify({
        promotion_campaign_id: promotionId,
        user_id: request.acoolIdentity!.userId,
        entry_method: textValue(body.entry_method, 80) ?? 'no_purchase_entry',
        jurisdiction_code: evaluation.jurisdiction,
        age_confirmed: true,
        rules_accepted_at: new Date().toISOString(),
        eligibility_snapshot: evaluation,
      }),
    });
    return response.status(201).json({ entry: Array.isArray(inserted) ? inserted[0] : inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'promotion_entry_failed';
    return response.status(message.startsWith('invalid_') ? 400 : 503).json({ error: message });
  }
});

router.post('/promotions/:promotionId/draw', requirePermission('promotions.draw'), async (request: ACoolRequest, response) => {
  try {
    const promotionId = textValue(request.params.promotionId, 50);
    const drawNumber = Number(request.body?.draw_number);
    const seedReveal = textValue(request.body?.seed_reveal, 500);
    if (!promotionId || !Number.isInteger(drawNumber) || !seedReveal) {
      return response.status(400).json({ error: 'promotion_draw_inputs_required' });
    }
    const token = request.acoolIdentity!.accessToken;
    const campaigns = await restRequest(token, `promotion_campaigns?id=eq.${encodeURIComponent(promotionId)}&select=*&limit=1`);
    const campaign = Array.isArray(campaigns) ? campaigns[0] : null;
    if (!campaign || campaign.status !== 'draw_pending' || !campaign.seed_commitment) {
      return response.status(409).json({ error: 'promotion_not_ready_for_draw' });
    }
    const entries = await restRequest(
      token,
      `promotion_entries?promotion_campaign_id=eq.${encodeURIComponent(promotionId)}&status=eq.eligible&select=id&order=id.asc`,
    );
    const result = selectPromotionWinner(
      promotionId,
      drawNumber,
      Array.isArray(entries) ? entries.map((item) => String(item.id)) : [],
      seedReveal,
      campaign.seed_commitment,
    );
    const inserted = await restRequest(token, 'promotion_draws', {
      method: 'POST',
      body: JSON.stringify({
        promotion_campaign_id: promotionId,
        draw_number: drawNumber,
        eligible_entry_count: result.eligibleEntryCount,
        algorithm_version: result.algorithmVersion,
        seed_reveal: seedReveal,
        seed_commitment_verified: result.seedCommitmentVerified,
        winner_entry_id: result.winnerEntryId,
        audit_payload: result,
        approved_by: request.acoolIdentity!.userId,
      }),
    });
    return response.json({ draw: Array.isArray(inserted) ? inserted[0] : inserted });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'promotion_draw_failed';
    return response.status(message.includes('mismatch') ? 409 : 503).json({ error: message });
  }
});

router.post('/experiments/:experimentKey/exposure', async (request: ACoolRequest, response) => {
  try {
    const experimentKey = textValue(request.params.experimentKey, 120);
    if (!experimentKey) return response.status(400).json({ error: 'experiment_key_required' });
    const token = request.acoolIdentity!.accessToken;
    const experiments = await restRequest(token, `experiments?experiment_key=eq.${encodeURIComponent(experimentKey)}&status=eq.running&privacy_reviewed=eq.true&select=*,experiment_variants(*)&limit=1`);
    const experiment = Array.isArray(experiments) ? experiments[0] : null;
    if (!experiment) return response.status(404).json({ error: 'active_experiment_not_found' });
    const variants = Array.isArray(experiment.experiment_variants)
      ? experiment.experiment_variants.map((variant: { variant_key: string; weight_basis_points: number }) => ({
          key: variant.variant_key,
          weightBasisPoints: variant.weight_basis_points,
        }))
      : [];
    const assignment = assignExperimentVariant(experimentKey, request.acoolIdentity!.userId, variants);
    const variant = experiment.experiment_variants.find((item: { variant_key: string }) => item.variant_key === assignment.variantKey);
    const event = validateExperimentEvent('experiment.exposure', {
      surface: textValue(request.body?.surface, 120) ?? 'unknown',
    });
    await restRequest(token, 'experiment_assignments?on_conflict=experiment_id,user_id', {
      method: 'POST',
      headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({
        experiment_id: experiment.id,
        user_id: request.acoolIdentity!.userId,
        variant_id: variant.id,
        assignment_hash: assignment.assignmentHash,
      }),
    });
    await restRequest(token, 'experiment_events', {
      method: 'POST',
      body: JSON.stringify({
        experiment_id: experiment.id,
        variant_id: variant.id,
        user_id: request.acoolIdentity!.userId,
        event_name: event.eventName,
        metadata: event.metadata,
      }),
    });
    return response.json({ assignment: { variant_key: assignment.variantKey, configuration: variant.configuration } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'experiment_exposure_failed';
    return response.status(message.startsWith('invalid_') ? 400 : 503).json({ error: message });
  }
});

export default router;
