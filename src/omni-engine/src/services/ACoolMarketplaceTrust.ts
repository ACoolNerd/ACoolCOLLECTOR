export type MarketplaceRiskSignals = {
  ownershipVerified?: boolean;
  identityConfidence?: number;
  certificationVerified?: boolean;
  duplicateImageCount?: number;
  perceptualHashCollisionCount?: number;
  priceDeviationPercent?: number;
  sellerAccountAgeDays?: number;
  completedTransactions?: number;
  confirmedCounterfeitReports?: number;
  unresolvedDisputes?: number;
  chargebackCount?: number;
  offPlatformPaymentRequested?: boolean;
  deviceRiskScore?: number;
  shippingIdentityMismatch?: boolean;
  manipulatedImageSuspected?: boolean;
  stolenImageReport?: boolean;
  highValueListing?: boolean;
};

export type MarketplaceRiskDecision = {
  riskScore: number;
  decision:
    | 'allow_with_disclosure'
    | 'manual_review_required'
    | 'hold_transaction'
    | 'block_listing'
    | 'suspend_seller_review';
  reasons: string[];
  mandatoryChecks: string[];
  modelVersion: string;
  humanReviewRequired: boolean;
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));

export const assessMarketplaceRisk = (signals: MarketplaceRiskSignals): MarketplaceRiskDecision => {
  let score = 0;
  const reasons: string[] = [];
  const mandatoryChecks = new Set<string>();

  const identityConfidence = clamp(Number(signals.identityConfidence ?? 0));
  const deviceRiskScore = clamp(Number(signals.deviceRiskScore ?? 0));
  const duplicateImageCount = Math.max(0, Number(signals.duplicateImageCount ?? 0));
  const phashCollisions = Math.max(0, Number(signals.perceptualHashCollisionCount ?? 0));
  const priceDeviation = Math.abs(Number(signals.priceDeviationPercent ?? 0));
  const accountAge = Math.max(0, Number(signals.sellerAccountAgeDays ?? 0));
  const completedTransactions = Math.max(0, Number(signals.completedTransactions ?? 0));
  const counterfeitReports = Math.max(0, Number(signals.confirmedCounterfeitReports ?? 0));
  const disputes = Math.max(0, Number(signals.unresolvedDisputes ?? 0));
  const chargebacks = Math.max(0, Number(signals.chargebackCount ?? 0));

  if (!signals.ownershipVerified) {
    score += signals.highValueListing ? 24 : 14;
    reasons.push('ownership_not_verified');
    mandatoryChecks.add('ownership_evidence');
  }

  if (identityConfidence < 60) {
    score += 18;
    reasons.push('low_collectible_identity_confidence');
    mandatoryChecks.add('manual_identity_review');
  } else if (identityConfidence < 80) {
    score += 8;
    reasons.push('moderate_collectible_identity_confidence');
  }

  if (signals.certificationVerified === false) {
    score += 22;
    reasons.push('certification_not_verified');
    mandatoryChecks.add('grader_certification_lookup');
  }

  if (duplicateImageCount > 0 || phashCollisions > 0) {
    score += Math.min(28, 10 + duplicateImageCount * 4 + phashCollisions * 3);
    reasons.push('duplicate_or_reused_image_signal');
    mandatoryChecks.add('image_provenance_review');
  }

  if (priceDeviation >= 65) {
    score += 18;
    reasons.push('extreme_price_deviation');
    mandatoryChecks.add('price_evidence_review');
  } else if (priceDeviation >= 35) {
    score += 8;
    reasons.push('material_price_deviation');
  }

  if (accountAge < 14 && signals.highValueListing) {
    score += 14;
    reasons.push('new_account_high_value_listing');
    mandatoryChecks.add('seller_identity_review');
  } else if (accountAge < 30 && completedTransactions === 0) {
    score += 6;
    reasons.push('new_seller_no_completed_transactions');
  }

  if (counterfeitReports > 0) {
    score += Math.min(35, counterfeitReports * 18);
    reasons.push('confirmed_counterfeit_report_history');
    mandatoryChecks.add('counterfeit_specialist_review');
  }

  if (disputes > 0) {
    score += Math.min(18, disputes * 6);
    reasons.push('unresolved_dispute_history');
  }

  if (chargebacks > 0) {
    score += Math.min(24, chargebacks * 8);
    reasons.push('chargeback_history');
    mandatoryChecks.add('payment_risk_review');
  }

  if (signals.offPlatformPaymentRequested) {
    score += 28;
    reasons.push('off_platform_payment_requested');
    mandatoryChecks.add('buyer_safety_review');
  }

  if (deviceRiskScore >= 80) {
    score += 22;
    reasons.push('high_device_risk');
    mandatoryChecks.add('device_and_account_review');
  } else if (deviceRiskScore >= 55) {
    score += 10;
    reasons.push('elevated_device_risk');
  }

  if (signals.shippingIdentityMismatch) {
    score += 18;
    reasons.push('shipping_identity_mismatch');
    mandatoryChecks.add('identity_and_shipping_review');
  }

  if (signals.manipulatedImageSuspected) {
    score += 24;
    reasons.push('image_manipulation_suspected');
    mandatoryChecks.add('forensic_image_review');
  }

  if (signals.stolenImageReport) {
    score += 40;
    reasons.push('stolen_image_report');
    mandatoryChecks.add('stolen_image_investigation');
  }

  score = clamp(Math.round(score));

  let decision: MarketplaceRiskDecision['decision'];
  if (signals.stolenImageReport || counterfeitReports >= 2 || score >= 90) {
    decision = 'suspend_seller_review';
  } else if (score >= 75) {
    decision = 'block_listing';
  } else if (score >= 55) {
    decision = 'hold_transaction';
  } else if (score >= 25 || mandatoryChecks.size > 0) {
    decision = 'manual_review_required';
  } else {
    decision = 'allow_with_disclosure';
  }

  return {
    riskScore: score,
    decision,
    reasons: [...new Set(reasons)],
    mandatoryChecks: [...mandatoryChecks],
    modelVersion: 'acool-marketplace-risk-2026-07-10-v1',
    humanReviewRequired: decision !== 'allow_with_disclosure',
  };
};

export const canPublishListing = (decision: MarketplaceRiskDecision) => (
  decision.decision === 'allow_with_disclosure'
  && decision.riskScore < 25
  && decision.mandatoryChecks.length === 0
);
