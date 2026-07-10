import { Router } from 'express';
import { requireAuth, type ACoolRequest } from '../middleware/ACoolIAM.js';

const router = Router();

const requireConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) throw new Error('referral_service_not_configured');
  return { supabaseUrl, anonKey };
};

const normalizeCode = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toUpperCase();
  if (!/^[A-Z0-9-]{4,64}$/.test(normalized)) return null;
  return normalized;
};

router.post('/verify', async (request, response) => {
  const code = normalizeCode(request.body?.code);
  if (!code) return response.status(400).json({ error: 'invalid_referral_code_format' });

  try {
    const { supabaseUrl, anonKey } = requireConfig();
    const upstream = await fetch(`${supabaseUrl}/rest/v1/rpc/verify_referral_code`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_code: code }),
    });
    const payload = await upstream.json();
    if (!upstream.ok) return response.status(upstream.status).json(payload);
    const result = Array.isArray(payload) ? payload[0] : payload;
    return response.json(result ?? { valid: false, reason: 'not_found' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'verification_failed';
    return response.status(503).json({ error: message });
  }
});

router.post('/redeem', requireAuth, async (request: ACoolRequest, response) => {
  const code = normalizeCode(request.body?.code);
  if (!code) return response.status(400).json({ error: 'invalid_referral_code_format' });

  try {
    const { supabaseUrl, anonKey } = requireConfig();
    const accessToken = request.acoolIdentity!.accessToken;
    const upstream = await fetch(`${supabaseUrl}/rest/v1/rpc/redeem_referral_code`, {
      method: 'POST',
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ p_code: code }),
    });
    const payload = await upstream.json();
    return response.status(upstream.status).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'redemption_failed';
    return response.status(503).json({ error: message });
  }
});

router.get('/access-context', requireAuth, (request: ACoolRequest, response) => {
  return response.json({
    user_id: request.acoolIdentity!.userId,
    memberships: request.acoolIdentity!.memberships,
  });
});

export default router;
