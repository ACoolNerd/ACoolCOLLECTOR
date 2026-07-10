import { createHash } from 'node:crypto';

export type ExternalSourceStatus = 'pending' | 'active' | 'stale' | 'error' | 'disabled';

export type ExternalSourceSnapshot = {
  sourceUrl: string;
  sourceType: 'official_website' | 'official_api' | 'approved_feed' | 'organizer_export' | 'manual_verified';
  fetchedAt: string;
  body: string;
  httpStatus: number;
  etag?: string | null;
  lastModified?: string | null;
};

export type ExternalSourceEvaluation = {
  normalizedUrl: string;
  fingerprint: string;
  checkedAt: string;
  status: ExternalSourceStatus;
  changed: boolean;
  staleAt: string;
  evidence: {
    httpStatus: number;
    etag: string | null;
    lastModified: string | null;
    sourceType: ExternalSourceSnapshot['sourceType'];
  };
};

const requireHttps = (value: string) => {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error('external_source_https_required');
  url.hash = '';
  url.username = '';
  url.password = '';
  return url.toString();
};

const normalizeBody = (value: string) => value
  .replace(/\r\n/g, '\n')
  .replace(/[ \t]+/g, ' ')
  .trim();

export const fingerprintExternalSource = (input: Pick<ExternalSourceSnapshot, 'sourceUrl' | 'body'>) => {
  const normalizedUrl = requireHttps(input.sourceUrl);
  const material = `${normalizedUrl}\n${normalizeBody(input.body)}`;
  return createHash('sha256').update(material, 'utf8').digest('hex');
};

export const evaluateExternalSource = (input: {
  snapshot: ExternalSourceSnapshot;
  previousFingerprint?: string | null;
  staleAfterHours?: number;
  now?: Date;
}): ExternalSourceEvaluation => {
  const now = input.now ?? new Date();
  const fetchedAt = new Date(input.snapshot.fetchedAt);
  if (Number.isNaN(fetchedAt.getTime())) throw new Error('invalid_source_fetched_at');
  if (!Number.isInteger(input.snapshot.httpStatus) || input.snapshot.httpStatus < 100 || input.snapshot.httpStatus > 599) {
    throw new Error('invalid_source_http_status');
  }

  const staleAfterHours = input.staleAfterHours ?? 48;
  if (!Number.isFinite(staleAfterHours) || staleAfterHours <= 0 || staleAfterHours > 24 * 365) {
    throw new Error('invalid_source_stale_window');
  }

  const normalizedUrl = requireHttps(input.snapshot.sourceUrl);
  const fingerprint = fingerprintExternalSource(input.snapshot);
  const staleAtDate = new Date(fetchedAt.getTime() + staleAfterHours * 60 * 60 * 1000);
  const successful = input.snapshot.httpStatus >= 200 && input.snapshot.httpStatus < 300;
  const stale = now.getTime() > staleAtDate.getTime();

  return {
    normalizedUrl,
    fingerprint,
    checkedAt: now.toISOString(),
    status: successful ? (stale ? 'stale' : 'active') : 'error',
    changed: Boolean(input.previousFingerprint && input.previousFingerprint !== fingerprint),
    staleAt: staleAtDate.toISOString(),
    evidence: {
      httpStatus: input.snapshot.httpStatus,
      etag: input.snapshot.etag ?? null,
      lastModified: input.snapshot.lastModified ?? null,
      sourceType: input.snapshot.sourceType,
    },
  };
};

export const buildSourceAlert = (evaluation: ExternalSourceEvaluation) => {
  if (evaluation.status === 'error') {
    return { severity: 'high', code: 'external_source_error', action: 'manual_review' } as const;
  }
  if (evaluation.status === 'stale') {
    return { severity: 'medium', code: 'external_source_stale', action: 'refresh_and_review' } as const;
  }
  if (evaluation.changed) {
    return { severity: 'medium', code: 'external_source_changed', action: 'review_before_publish' } as const;
  }
  return { severity: 'none', code: 'external_source_current', action: 'none' } as const;
};
