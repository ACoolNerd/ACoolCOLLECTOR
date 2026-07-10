import { Router } from 'express';
import { requireAuth, type ACoolRequest } from '../middleware/ACoolIAM.js';

const router = Router();

const requireConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('authentication_service_not_configured');
  }
  return { supabaseUrl, anonKey };
};

const supabaseHeaders = (anonKey: string, accessToken?: string) => ({
  apikey: anonKey,
  Authorization: `Bearer ${accessToken ?? anonKey}`,
  'Content-Type': 'application/json',
});

const validCredential = (value: unknown, minLength: number) =>
  typeof value === 'string' && value.trim().length >= minLength;

router.post('/signup', async (request, response) => {
  const { email, password, displayName, referralCode } = request.body ?? {};
  if (!validCredential(email, 3) || !validCredential(password, 10)) {
    return response.status(400).json({ error: 'invalid_signup_payload' });
  }

  try {
    const { supabaseUrl, anonKey } = requireConfig();
    const upstream = await fetch(`${supabaseUrl}/auth/v1/signup`, {
      method: 'POST',
      headers: supabaseHeaders(anonKey),
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password,
        data: {
          display_name: typeof displayName === 'string' ? displayName.trim() : null,
          referral_code_pending: typeof referralCode === 'string' ? referralCode.trim() : null,
        },
      }),
    });
    const payload = await upstream.json();
    return response.status(upstream.status).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'signup_failed';
    return response.status(503).json({ error: message });
  }
});

router.post('/login', async (request, response) => {
  const { email, password } = request.body ?? {};
  if (!validCredential(email, 3) || !validCredential(password, 1)) {
    return response.status(400).json({ error: 'invalid_login_payload' });
  }

  try {
    const { supabaseUrl, anonKey } = requireConfig();
    const upstream = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: supabaseHeaders(anonKey),
      body: JSON.stringify({
        email: String(email).trim().toLowerCase(),
        password,
      }),
    });
    const payload = await upstream.json();
    return response.status(upstream.status).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'login_failed';
    return response.status(503).json({ error: message });
  }
});

router.post('/refresh', async (request, response) => {
  const { refreshToken } = request.body ?? {};
  if (!validCredential(refreshToken, 10)) {
    return response.status(400).json({ error: 'refresh_token_required' });
  }

  try {
    const { supabaseUrl, anonKey } = requireConfig();
    const upstream = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: supabaseHeaders(anonKey),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    const payload = await upstream.json();
    return response.status(upstream.status).json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'refresh_failed';
    return response.status(503).json({ error: message });
  }
});

router.post('/logout', requireAuth, async (request: ACoolRequest, response) => {
  try {
    const { supabaseUrl, anonKey } = requireConfig();
    const accessToken = request.acoolIdentity!.accessToken;
    const upstream = await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: supabaseHeaders(anonKey, accessToken),
    });
    if (!upstream.ok && upstream.status !== 204) {
      const payload = await upstream.json();
      return response.status(upstream.status).json(payload);
    }
    return response.status(204).send();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'logout_failed';
    return response.status(503).json({ error: message });
  }
});

router.get('/validate', requireAuth, (request: ACoolRequest, response) => {
  const identity = request.acoolIdentity!;
  return response.json({
    valid: true,
    user: {
      id: identity.userId,
      email: identity.email ?? null,
      memberships: identity.memberships,
    },
  });
});

export default router;
