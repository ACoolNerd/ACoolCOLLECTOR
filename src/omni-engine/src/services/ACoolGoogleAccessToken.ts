type MetadataTokenResponse = {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
};

let cachedToken: { value: string; expiresAt: number } | null = null;

const metadataUrl = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';

export const getGoogleAccessToken = async (): Promise<string> => {
  const configured = process.env.GOOGLE_CLOUD_ACCESS_TOKEN?.trim();
  if (configured) return configured;

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60_000) return cachedToken.value;

  const response = await fetch(metadataUrl, {
    headers: { 'Metadata-Flavor': 'Google' },
    signal: AbortSignal.timeout(4_000),
  });
  if (!response.ok) throw new Error(`google_metadata_token_failed_${response.status}`);

  const payload = await response.json() as MetadataTokenResponse;
  if (!payload.access_token || !payload.expires_in) throw new Error('google_metadata_token_invalid');

  cachedToken = {
    value: payload.access_token,
    expiresAt: now + Math.max(60, payload.expires_in - 120) * 1000,
  };
  return cachedToken.value;
};

export const resetGoogleAccessTokenCacheForTests = () => {
  cachedToken = null;
};
