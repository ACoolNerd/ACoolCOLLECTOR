import { Router } from 'express';
import { requireAuth, requirePermission, type ACoolRequest } from '../middleware/ACoolIAM.js';

const router = Router();

const requireSupabase = () => {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) throw new Error('supabase_not_configured');
  return { url, anonKey };
};

const headersFor = (request: ACoolRequest) => {
  const { anonKey } = requireSupabase();
  const token = request.acoolIdentity?.accessToken;
  if (!token) throw new Error('authentication_required');
  return {
    apikey: anonKey,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const safeLimit = (value: unknown) => {
  const parsed = Number(value ?? 50);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 100) throw new Error('invalid_limit');
  return parsed;
};

const allowedRequestTypes = new Set([
  'affiliate', 'referral', 'inventory_feed', 'event_feed', 'grading_submission',
  'certification_lookup', 'ticketing', 'oauth', 'webhook', 'sponsorship', 'other',
]);

router.use(requireAuth);

router.get('/organizations', async (request: ACoolRequest, response) => {
  try {
    const { url } = requireSupabase();
    const limit = safeLimit(request.query.limit);
    const type = typeof request.query.type === 'string' ? request.query.type.trim() : '';
    const search = typeof request.query.q === 'string' ? request.query.q.trim().slice(0, 100) : '';
    const params = new URLSearchParams({
      select: 'id,organization_key,display_name,organization_type,official_url,verification_status,relationship_status,official_partner_claim_allowed,public_disclosure_text,last_verified_at,metadata',
      order: 'display_name.asc',
      limit: String(limit),
    });
    if (type) params.set('organization_type', `eq.${type}`);
    if (search) params.set('display_name', `ilike.*${search.replace(/[,*()]/g, '')}*`);

    const upstream = await fetch(`${url}/rest/v1/external_organizations?${params.toString()}`, {
      headers: headersFor(request),
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json();
    if (!upstream.ok) throw new Error(data?.message || 'external_organizations_unavailable');
    return response.json({ organizations: data, count: Array.isArray(data) ? data.length : 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'external_organizations_failed';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

router.get('/organizations/:organizationKey', async (request: ACoolRequest, response) => {
  try {
    const { url } = requireSupabase();
    const key = request.params.organizationKey.trim().replace(/[^a-z0-9_-]/gi, '').slice(0, 80);
    if (!key) return response.status(400).json({ error: 'organization_key_required' });

    const upstream = await fetch(
      `${url}/rest/v1/external_organizations?organization_key=eq.${encodeURIComponent(key)}&select=*,external_locations(*),integration_capabilities(*)`,
      { headers: headersFor(request), signal: AbortSignal.timeout(15_000) },
    );
    const data = await upstream.json();
    if (!upstream.ok) throw new Error(data?.message || 'external_organization_unavailable');
    const organization = Array.isArray(data) ? data[0] : null;
    if (!organization) return response.status(404).json({ error: 'external_organization_not_found' });
    return response.json({ organization });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'external_organization_failed';
    return response.status(503).json({ error: message });
  }
});

router.post('/requests', requirePermission('integration_requests.manage'), async (request: ACoolRequest, response) => {
  try {
    const { url } = requireSupabase();
    const body = request.body ?? {};
    const externalOrganizationId = typeof body.external_organization_id === 'string'
      ? body.external_organization_id.trim()
      : '';
    const requestType = typeof body.request_type === 'string' ? body.request_type.trim() : '';
    const organizationId = request.header('x-acool-organization-id')?.trim() || null;
    const notes = typeof body.notes === 'string' ? body.notes.trim().slice(0, 4000) : null;

    if (!/^[0-9a-f-]{36}$/i.test(externalOrganizationId)) {
      return response.status(400).json({ error: 'invalid_external_organization_id' });
    }
    if (!allowedRequestTypes.has(requestType)) {
      return response.status(400).json({ error: 'invalid_integration_request_type' });
    }

    const upstream = await fetch(`${url}/rest/v1/integration_requests`, {
      method: 'POST',
      headers: { ...headersFor(request), Prefer: 'return=representation' },
      body: JSON.stringify({
        external_organization_id: externalOrganizationId,
        organization_id: organizationId,
        request_type: requestType,
        status: 'draft',
        owner_user_id: request.acoolIdentity?.userId,
        notes,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json();
    if (!upstream.ok) throw new Error(data?.message || 'integration_request_create_failed');
    return response.status(201).json({ request: Array.isArray(data) ? data[0] : data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'integration_request_failed';
    return response.status(503).json({ error: message });
  }
});

router.get('/requests', requirePermission('integration_requests.manage'), async (request: ACoolRequest, response) => {
  try {
    const { url } = requireSupabase();
    const organizationId = request.header('x-acool-organization-id')?.trim();
    const params = new URLSearchParams({
      select: '*,external_organizations(organization_key,display_name,relationship_status)',
      order: 'created_at.desc',
      limit: String(safeLimit(request.query.limit)),
    });
    if (organizationId) params.set('organization_id', `eq.${organizationId}`);
    const upstream = await fetch(`${url}/rest/v1/integration_requests?${params.toString()}`, {
      headers: headersFor(request),
      signal: AbortSignal.timeout(15_000),
    });
    const data = await upstream.json();
    if (!upstream.ok) throw new Error(data?.message || 'integration_requests_unavailable');
    return response.json({ requests: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'integration_requests_failed';
    const status = message.startsWith('invalid_') ? 400 : 503;
    return response.status(status).json({ error: message });
  }
});

export default router;
