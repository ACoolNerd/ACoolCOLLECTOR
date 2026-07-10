export type VendorVerificationLevel =
  | 'unclaimed'
  | 'claimed'
  | 'identity_verified'
  | 'business_verified'
  | 'platform_partner';

export type VendorReputationInputs = {
  verification_level?: VendorVerificationLevel;
  verified_transaction_count?: number;
  disputed_transaction_count?: number;
  on_time_count?: number;
  fulfillment_count?: number;
  review_count?: number;
  verified_review_count?: number;
  average_overall_rating?: number | null;
  average_communication_rating?: number | null;
  verified_social_count?: number;
  distinct_social_sources?: number;
};

export type VendorReputationResult = {
  overallScore: number | null;
  evidenceConfidence: number;
  scoreStatus: 'insufficient_evidence' | 'provisional' | 'established';
  componentScores: Record<string, number | null>;
  evidenceCounts: Record<string, number | string>;
  explanation: string[];
  scoringModelVersion: 'vendor-trust-v1.0';
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const round2 = (value: number) => Math.round(value * 100) / 100;
const finite = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const ratingToScore = (rating: number | null | undefined): number | null => {
  if (rating === null || rating === undefined || !Number.isFinite(Number(rating))) return null;
  return clamp(((Number(rating) - 1) / 4) * 100);
};

const identityScore = (level: VendorVerificationLevel): number => ({
  unclaimed: 10,
  claimed: 45,
  identity_verified: 75,
  business_verified: 90,
  platform_partner: 100,
})[level];

const weightedAverage = (
  values: Array<{ value: number | null; weight: number }>,
): number | null => {
  const available = values.filter((item): item is { value: number; weight: number } => item.value !== null);
  const weight = available.reduce((sum, item) => sum + item.weight, 0);
  if (weight === 0) return null;
  return available.reduce((sum, item) => sum + item.value * item.weight, 0) / weight;
};

export const calculateVendorReputation = (
  raw: VendorReputationInputs,
): VendorReputationResult => {
  const verificationLevel = raw.verification_level ?? 'unclaimed';
  const verifiedTransactions = Math.max(0, finite(raw.verified_transaction_count));
  const disputedTransactions = Math.max(0, finite(raw.disputed_transaction_count));
  const fulfillmentCount = Math.max(0, finite(raw.fulfillment_count));
  const onTimeCount = Math.max(0, finite(raw.on_time_count));
  const reviewCount = Math.max(0, finite(raw.review_count));
  const verifiedReviewCount = Math.max(0, finite(raw.verified_review_count));
  const verifiedSocialCount = Math.max(0, finite(raw.verified_social_count));
  const distinctSocialSources = Math.max(0, finite(raw.distinct_social_sources));

  const transactionReliability = verifiedTransactions > 0
    ? clamp(100 * (1 - disputedTransactions / verifiedTransactions))
    : null;
  const reviewQuality = reviewCount > 0 ? ratingToScore(raw.average_overall_rating) : null;
  const fulfillmentReliability = fulfillmentCount > 0
    ? clamp((onTimeCount / fulfillmentCount) * 100)
    : null;
  const communication = reviewCount > 0
    ? ratingToScore(raw.average_communication_rating)
    : null;
  const identityVerification = identityScore(verificationLevel);
  const socialConsistency = verifiedSocialCount > 0
    ? clamp(verifiedSocialCount * 20 + distinctSocialSources * 10)
    : null;

  const calculatedScore = weightedAverage([
    { value: transactionReliability, weight: 25 },
    { value: reviewQuality, weight: 20 },
    { value: identityVerification, weight: 15 },
    { value: fulfillmentReliability, weight: 15 },
    { value: communication, weight: 15 },
    { value: socialConsistency, weight: 10 },
  ]);

  const confidence = clamp(
    Math.min(35, verifiedTransactions * 3.5)
      + Math.min(25, verifiedReviewCount * 3 + Math.max(0, reviewCount - verifiedReviewCount))
      + ({ unclaimed: 0, claimed: 5, identity_verified: 12, business_verified: 17, platform_partner: 20 })[verificationLevel]
      + Math.min(15, distinctSocialSources * 5),
  );

  const insufficient = confidence < 25 || (verifiedTransactions < 2 && reviewCount < 3);
  const scoreStatus: VendorReputationResult['scoreStatus'] = insufficient
    ? 'insufficient_evidence'
    : confidence < 60
      ? 'provisional'
      : 'established';

  const explanation: string[] = [
    'The score uses verified transactions, published reviews, disputes, fulfillment, identity verification, communication, and cross-platform account consistency.',
    'Follower counts, likes, views, and other popularity metrics do not directly increase the score.',
    'Public social accounts are evidence of identity consistency only; private messages, contact lists, and personal accounts are not collected.',
  ];

  if (insufficient) {
    explanation.push('Not enough verified evidence exists to publish a reliable overall score. Component evidence may still be displayed with an insufficient-evidence label.');
  }
  if (disputedTransactions > 0) {
    explanation.push(`${disputedTransactions} disputed or charged-back transaction(s) are included in the transaction-reliability component.`);
  }
  if (reviewCount > verifiedReviewCount) {
    explanation.push('Some published reviews are not linked to a verified ACoolCOLLECTOR transaction and receive less confidence weight.');
  }

  return {
    overallScore: insufficient || calculatedScore === null ? null : round2(calculatedScore),
    evidenceConfidence: round2(confidence),
    scoreStatus,
    componentScores: {
      transaction_reliability: transactionReliability === null ? null : round2(transactionReliability),
      review_quality: reviewQuality === null ? null : round2(reviewQuality),
      identity_verification: round2(identityVerification),
      fulfillment_reliability: fulfillmentReliability === null ? null : round2(fulfillmentReliability),
      communication: communication === null ? null : round2(communication),
      social_account_consistency: socialConsistency === null ? null : round2(socialConsistency),
    },
    evidenceCounts: {
      verification_level: verificationLevel,
      verified_transactions: verifiedTransactions,
      disputed_transactions: disputedTransactions,
      reviews: reviewCount,
      verified_reviews: verifiedReviewCount,
      fulfillment_observations: fulfillmentCount,
      verified_social_accounts: verifiedSocialCount,
      distinct_social_sources: distinctSocialSources,
    },
    explanation,
    scoringModelVersion: 'vendor-trust-v1.0',
  };
};
