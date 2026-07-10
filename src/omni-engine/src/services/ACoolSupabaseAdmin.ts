const requireAdminConfig = () => {
  const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!baseUrl || !serviceRoleKey) throw new Error('supabase_admin_not_configured');
  return { baseUrl, serviceRoleKey };
};

export const supabaseAdminRequest = async <T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> => {
  const { baseUrl, serviceRoleKey } = requireAdminConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(20_000),
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = payload?.message || payload?.error || `supabase_admin_failed_${response.status}`;
    throw new Error(message);
  }
  return payload as T;
};

export const encodeFilter = (value: string) => encodeURIComponent(value);
