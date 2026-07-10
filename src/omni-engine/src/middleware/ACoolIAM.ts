import type { NextFunction, Request, Response } from 'express';

export type ACoolMembership = {
  organization_id: string;
  organization_name: string;
  role_key: string;
  status: string;
  permissions: string[];
};

export type ACoolIdentity = {
  userId: string;
  email?: string;
  accessToken: string;
  memberships: ACoolMembership[];
};

export type ACoolRequest = Request & {
  acoolIdentity?: ACoolIdentity;
};

const requireConfig = () => {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !anonKey) {
    throw new Error('IAM service is not configured');
  }
  return { supabaseUrl, anonKey };
};

const bearerToken = (request: Request): string | null => {
  const value = request.header('authorization');
  if (!value?.startsWith('Bearer ')) return null;
  const token = value.slice('Bearer '.length).trim();
  return token || null;
};

export const loadAccessContext = async (accessToken: string): Promise<ACoolIdentity> => {
  const { supabaseUrl, anonKey } = requireConfig();
  const authHeaders = {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: authHeaders,
  });
  const user = await userResponse.json();
  if (!userResponse.ok || !user?.id) {
    throw new Error('invalid_or_expired_access_token');
  }

  const contextResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_my_access_context`, {
    method: 'POST',
    headers: authHeaders,
    body: '{}',
  });
  const context = await contextResponse.json();
  if (!contextResponse.ok) {
    throw new Error('access_context_unavailable');
  }

  return {
    userId: user.id,
    email: user.email,
    accessToken,
    memberships: Array.isArray(context?.memberships) ? context.memberships : [],
  };
};

export const requireAuth = async (
  request: ACoolRequest,
  response: Response,
  next: NextFunction,
) => {
  const token = bearerToken(request);
  if (!token) {
    return response.status(401).json({ error: 'authentication_required' });
  }

  try {
    request.acoolIdentity = await loadAccessContext(token);
    return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'authentication_failed';
    return response.status(401).json({ error: message });
  }
};

export const requirePermission = (permission: string) => (
  request: ACoolRequest,
  response: Response,
  next: NextFunction,
) => {
  const identity = request.acoolIdentity;
  if (!identity) {
    return response.status(401).json({ error: 'authentication_required' });
  }

  const organizationId = request.header('x-acool-organization-id');
  const memberships = organizationId
    ? identity.memberships.filter((item) => item.organization_id === organizationId)
    : identity.memberships;

  const permitted = memberships.some((item) => item.permissions.includes(permission));
  if (!permitted) {
    return response.status(403).json({
      error: 'permission_denied',
      permission,
      organization_id: organizationId ?? null,
    });
  }

  return next();
};
