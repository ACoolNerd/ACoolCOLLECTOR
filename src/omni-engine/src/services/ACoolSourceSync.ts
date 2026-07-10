import { createHash } from 'node:crypto';

const MAX_SOURCE_BYTES = 2 * 1024 * 1024;

export const validateOfficialSourceUrl = (value: string, allowedHosts: string[] = []) => {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('official_source_https_required');
  if (url.username || url.password) throw new Error('official_source_credentials_forbidden');
  const hostname = url.hostname.toLowerCase();
  if (allowedHosts.length > 0 && !allowedHosts.map((host) => host.toLowerCase()).includes(hostname)) {
    throw new Error('official_source_host_not_allowed');
  }
  url.hash = '';
  return url;
};

export const fingerprintSourceContent = (content: string | Buffer) =>
  createHash('sha256').update(content).digest('hex');

export type SourceInspection = {
  source_url: string;
  http_status: number;
  content_type: string | null;
  etag: string | null;
  last_modified: string | null;
  response_fingerprint: string;
  previous_fingerprint: string | null;
  change_detected: boolean;
  checked_at: string;
};

export const inspectOfficialSource = async (input: {
  sourceUrl: string;
  allowedHosts?: string[];
  previousFingerprint?: string | null;
}): Promise<SourceInspection> => {
  const url = validateOfficialSourceUrl(input.sourceUrl, input.allowedHosts);
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ACoolCOLLECTOR-SourceMonitor/1.0',
      Accept: 'text/html,application/json,text/plain;q=0.8,*/*;q=0.2',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`official_source_http_${response.status}`);

  const length = Number(response.headers.get('content-length') ?? 0);
  if (Number.isFinite(length) && length > MAX_SOURCE_BYTES) throw new Error('official_source_too_large');
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.byteLength > MAX_SOURCE_BYTES) throw new Error('official_source_too_large');

  const fingerprint = fingerprintSourceContent(buffer);
  const previous = input.previousFingerprint ?? null;
  return {
    source_url: url.toString(),
    http_status: response.status,
    content_type: response.headers.get('content-type'),
    etag: response.headers.get('etag'),
    last_modified: response.headers.get('last-modified'),
    response_fingerprint: fingerprint,
    previous_fingerprint: previous,
    change_detected: Boolean(previous && previous !== fingerprint),
    checked_at: new Date().toISOString(),
  };
};
