export type AffiliateProgramStatus =
  | 'not_applied'
  | 'application_draft'
  | 'applied'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'suspended'
  | 'expired'
  | 'revoked';

export type AffiliateLinkInput = {
  programStatus: AffiliateProgramStatus;
  destinationUrl: string;
  approvedHosts: string[];
  disclosureText: string;
  linkStatus: 'draft' | 'active' | 'paused' | 'expired' | 'revoked';
  approvedAt?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
};

export type AffiliateResolution = {
  allowed: boolean;
  reason: string;
  destinationUrl: string | null;
  disclosureText: string;
  rel: 'sponsored nofollow noopener noreferrer';
};

const normalizedHost = (value: string) => value.trim().toLowerCase().replace(/^www\./, '');

const parseHttps = (value: string): URL | null => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
};

const inWindow = (now: Date, startsAt?: string | null, expiresAt?: string | null) => {
  if (startsAt && now < new Date(startsAt)) return false;
  if (expiresAt && now >= new Date(expiresAt)) return false;
  return true;
};

export const resolveAffiliateLink = (
  input: AffiliateLinkInput,
  now = new Date(),
): AffiliateResolution => {
  const disclosureText = input.disclosureText.trim();
  const denied = (reason: string): AffiliateResolution => ({
    allowed: false,
    reason,
    destinationUrl: null,
    disclosureText,
    rel: 'sponsored nofollow noopener noreferrer',
  });

  if (input.programStatus !== 'approved') return denied('program_not_approved');
  if (input.linkStatus !== 'active') return denied('link_not_active');
  if (!input.approvedAt) return denied('link_approval_missing');
  if (!disclosureText) return denied('disclosure_missing');
  if (!inWindow(now, input.startsAt, input.expiresAt)) return denied('link_outside_active_window');

  const destination = parseHttps(input.destinationUrl);
  if (!destination) return denied('invalid_destination_url');

  const approvedHosts = input.approvedHosts.map(normalizedHost).filter(Boolean);
  const host = normalizedHost(destination.hostname);
  const allowedHost = approvedHosts.some((candidate) =>
    host === candidate || host.endsWith(`.${candidate}`));
  if (!allowedHost) return denied('destination_host_not_allowlisted');

  destination.username = '';
  destination.password = '';
  destination.hash = '';

  return {
    allowed: true,
    reason: 'approved',
    destinationUrl: destination.toString(),
    disclosureText,
    rel: 'sponsored nofollow noopener noreferrer',
  };
};

export const mayDisplayOfficialAffiliationBadge = (input: {
  programStatus: AffiliateProgramStatus;
  agreementReference?: string | null;
  trademarkApprovalReference?: string | null;
  expiresAt?: string | null;
}, now = new Date()): boolean => {
  if (input.programStatus !== 'approved') return false;
  if (!input.agreementReference || !input.trademarkApprovalReference) return false;
  if (input.expiresAt && now >= new Date(input.expiresAt)) return false;
  return true;
};
