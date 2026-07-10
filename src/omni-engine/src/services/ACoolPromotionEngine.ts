import { createHash, timingSafeEqual } from 'node:crypto';

export type PromotionCampaign = {
  id: string;
  promotionKind: 'giveaway' | 'sweepstakes' | 'skill_contest' | 'charitable_raffle';
  status: 'draft' | 'legal_review' | 'approved' | 'open' | 'closed' | 'draw_pending' | 'drawn' | 'cancelled';
  purchaseRequired: boolean;
  noPurchaseMethod?: string | null;
  minimumAge: number;
  allowedJurisdictions: string[];
  excludedJurisdictions: string[];
  officialRulesUrl?: string | null;
  legalApprovalReference?: string | null;
  legalApprovedAt?: string | null;
  opensAt?: string | null;
  closesAt?: string | null;
  maximumEntriesPerUser: number;
  published: boolean;
  seedCommitment?: string | null;
};

export type EntryRequest = {
  userAge: number;
  jurisdictionCode: string;
  existingEntryCount: number;
  rulesAccepted: boolean;
  entryMethod: string;
  now?: Date;
};

const normalizeJurisdiction = (value: string) => value.trim().toUpperCase();

export const evaluatePromotionEntry = (
  campaign: PromotionCampaign,
  request: EntryRequest,
) => {
  const reasons: string[] = [];
  const now = request.now ?? new Date();
  const jurisdiction = normalizeJurisdiction(request.jurisdictionCode);

  if (!campaign.published) reasons.push('campaign_not_published');
  if (campaign.status !== 'open') reasons.push('campaign_not_open');
  if (!campaign.officialRulesUrl) reasons.push('official_rules_missing');
  if (!campaign.legalApprovalReference || !campaign.legalApprovedAt) reasons.push('legal_approval_missing');
  if (!request.rulesAccepted) reasons.push('official_rules_not_accepted');
  if (request.userAge < campaign.minimumAge) reasons.push('minimum_age_not_met');
  if (campaign.excludedJurisdictions.map(normalizeJurisdiction).includes(jurisdiction)) {
    reasons.push('jurisdiction_excluded');
  }
  if (
    campaign.allowedJurisdictions.length > 0 &&
    !campaign.allowedJurisdictions.map(normalizeJurisdiction).includes(jurisdiction)
  ) {
    reasons.push('jurisdiction_not_allowed');
  }
  if (request.existingEntryCount >= campaign.maximumEntriesPerUser) reasons.push('entry_limit_reached');
  if (campaign.opensAt && now < new Date(campaign.opensAt)) reasons.push('campaign_not_started');
  if (campaign.closesAt && now >= new Date(campaign.closesAt)) reasons.push('campaign_closed');

  if (campaign.purchaseRequired) {
    reasons.push('purchase_required_promotions_disabled');
  }
  if (campaign.promotionKind === 'sweepstakes' && !campaign.noPurchaseMethod) {
    reasons.push('no_purchase_method_missing');
  }
  if (campaign.promotionKind === 'charitable_raffle') {
    reasons.push('charitable_raffle_requires_jurisdiction_specific_operator_review');
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    jurisdiction,
    evaluatedAt: now.toISOString(),
    policyVersion: 'acool-promotions-1.0',
  };
};

export const createSeedCommitment = (seedReveal: string) =>
  createHash('sha256').update(seedReveal, 'utf8').digest('hex');

export const verifySeedCommitment = (seedReveal: string, commitment: string) => {
  const expected = Buffer.from(createSeedCommitment(seedReveal), 'utf8');
  const actual = Buffer.from(commitment.trim().toLowerCase(), 'utf8');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export const selectPromotionWinner = (
  campaignId: string,
  drawNumber: number,
  eligibleEntryIds: string[],
  seedReveal: string,
  seedCommitment: string,
) => {
  if (!eligibleEntryIds.length) throw new Error('no_eligible_entries');
  if (!verifySeedCommitment(seedReveal, seedCommitment)) throw new Error('seed_commitment_mismatch');
  if (!Number.isInteger(drawNumber) || drawNumber < 1) throw new Error('invalid_draw_number');

  const sortedEntryIds = [...new Set(eligibleEntryIds)].sort();
  const digest = createHash('sha256')
    .update(`${campaignId}|${drawNumber}|${seedReveal}|${sortedEntryIds.join('|')}`, 'utf8')
    .digest();
  const integer = digest.readBigUInt64BE(0);
  const winnerIndex = Number(integer % BigInt(sortedEntryIds.length));

  return {
    winnerEntryId: sortedEntryIds[winnerIndex],
    winnerIndex,
    eligibleEntryCount: sortedEntryIds.length,
    algorithmVersion: 'sha256-commit-reveal-v1',
    seedCommitmentVerified: true,
    auditDigest: digest.toString('hex'),
  };
};
