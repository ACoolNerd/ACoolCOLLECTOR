import assert from 'node:assert/strict';
import test from 'node:test';
import { assessMarketplaceRisk, canPublishListing } from './ACoolMarketplaceTrust.js';

test('low-risk verified listing can proceed with disclosure', () => {
  const decision = assessMarketplaceRisk({
    ownershipVerified: true,
    identityConfidence: 96,
    certificationVerified: true,
    sellerAccountAgeDays: 800,
    completedTransactions: 120,
    deviceRiskScore: 4,
    priceDeviationPercent: 6,
  });

  assert.equal(decision.decision, 'allow_with_disclosure');
  assert.equal(canPublishListing(decision), true);
  assert.equal(decision.humanReviewRequired, false);
});

test('stolen-image evidence suspends automated publication', () => {
  const decision = assessMarketplaceRisk({
    ownershipVerified: false,
    identityConfidence: 40,
    stolenImageReport: true,
    duplicateImageCount: 3,
  });

  assert.equal(decision.decision, 'suspend_seller_review');
  assert.equal(canPublishListing(decision), false);
  assert.ok(decision.reasons.includes('stolen_image_report'));
  assert.ok(decision.mandatoryChecks.includes('stolen_image_investigation'));
});

test('off-platform payment pressure produces a human review gate', () => {
  const decision = assessMarketplaceRisk({
    ownershipVerified: true,
    identityConfidence: 90,
    offPlatformPaymentRequested: true,
    deviceRiskScore: 60,
  });

  assert.notEqual(decision.decision, 'allow_with_disclosure');
  assert.equal(decision.humanReviewRequired, true);
  assert.ok(decision.reasons.includes('off_platform_payment_requested'));
});

test('high-value new seller without ownership evidence receives a hold or stronger decision', () => {
  const decision = assessMarketplaceRisk({
    ownershipVerified: false,
    identityConfidence: 55,
    sellerAccountAgeDays: 2,
    completedTransactions: 0,
    highValueListing: true,
    priceDeviationPercent: 70,
  });

  assert.ok(['hold_transaction', 'block_listing', 'suspend_seller_review'].includes(decision.decision));
  assert.equal(canPublishListing(decision), false);
});
