import { getGoogleAccessToken } from './ACoolGoogleAccessToken.js';

const requireProjectId = () => {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
  if (!projectId) throw new Error('google_cloud_project_not_configured');
  return projectId;
};

const validateSecretId = (secretId: string) => {
  if (!/^[A-Za-z0-9_-]{1,255}$/.test(secretId)) throw new Error('invalid_secret_id');
  return secretId;
};

const secretBase = (projectId: string, secretId: string) =>
  `https://secretmanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/secrets/${encodeURIComponent(secretId)}`;

const authorizedFetch = async (url: string, init: RequestInit = {}) => {
  const token = await getGoogleAccessToken();
  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    signal: init.signal ?? AbortSignal.timeout(20_000),
  });
};

export const ensureSecret = async (secretIdInput: string) => {
  const projectId = requireProjectId();
  const secretId = validateSecretId(secretIdInput);
  const getResponse = await authorizedFetch(secretBase(projectId, secretId));
  if (getResponse.ok) return `projects/${projectId}/secrets/${secretId}`;
  if (getResponse.status !== 404) throw new Error(`secret_lookup_failed_${getResponse.status}`);

  const createResponse = await authorizedFetch(
    `https://secretmanager.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/secrets?secretId=${encodeURIComponent(secretId)}`,
    {
      method: 'POST',
      body: JSON.stringify({ replication: { automatic: {} } }),
    },
  );
  if (!createResponse.ok) throw new Error(`secret_create_failed_${createResponse.status}`);
  return `projects/${projectId}/secrets/${secretId}`;
};

export const addSecretVersion = async (secretIdInput: string, payload: string) => {
  const projectId = requireProjectId();
  const secretId = validateSecretId(secretIdInput);
  await ensureSecret(secretId);
  const response = await authorizedFetch(`${secretBase(projectId, secretId)}:addVersion`, {
    method: 'POST',
    body: JSON.stringify({ payload: { data: Buffer.from(payload, 'utf8').toString('base64') } }),
  });
  const result = await response.json() as { name?: string; error?: { message?: string } };
  if (!response.ok || !result.name) {
    throw new Error(result.error?.message || `secret_version_add_failed_${response.status}`);
  }
  return result.name;
};

export const accessSecretVersion = async (secretReference: string) => {
  if (!/^projects\/[A-Za-z0-9_-]+\/secrets\/[A-Za-z0-9_-]+$/.test(secretReference)) {
    throw new Error('invalid_secret_reference');
  }
  const response = await authorizedFetch(
    `https://secretmanager.googleapis.com/v1/${secretReference}/versions/latest:access`,
  );
  const result = await response.json() as { payload?: { data?: string }; error?: { message?: string } };
  const data = result.payload?.data;
  if (!response.ok || !data) throw new Error(result.error?.message || `secret_access_failed_${response.status}`);
  return Buffer.from(data, 'base64').toString('utf8');
};
