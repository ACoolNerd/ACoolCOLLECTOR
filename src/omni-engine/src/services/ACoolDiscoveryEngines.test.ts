import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateSavingsPlan,
  evaluateBargainGrading,
  recommendCollectionGaps,
  recommendDeckGaps,
} from './ACoolRecommendationEngine.js';
import {
  createSeedCommitment,
  evaluatePromotionEntry,
  selectPromotionWinner,
} from './ACoolPromotionEngine.js';
import { assignExperimentVariant, validateExperimentEvent } from './ACoolExperimentEngine.js';

test('collection recommendations prioritize completion impact and budget fit', () => {
  const results = recommendCollectionGaps([
    {
      id: 'grail', name: 'Grail', missingQuantity: 1, priority: 5, completionImpact: 1,
      marketPriceCents: 5000, priceConfidence: 0.9, liquidity: 0.8, conditionConfidence: 0.9,
    },
    {
      id: 'filler', name: 'Filler', missingQuantity: 1, priority: 2, completionImpact: 0.1,
      marketPriceCents: 100, priceConfidence: 1, liquidity: 1, conditionConfidence: 1,
    },
  ], 10000);
  assert.equal(results[0].id, 'grail');
  assert.equal(results[0].rank, 1);
});

test('deck recommendations recognize missing copies and substitutes', () => {
  const results = recommendDeckGaps([
    {
      id: 'core', name: 'Core card', requiredQuantity: 4, ownedQuantity: 1,
      marketPriceCents: 300, metaImportance: 1, substitutionFlexibility: 0.1, priceConfidence: 0.9,
    },
    {
      id: 'flex', name: 'Flexible card', requiredQuantity: 2, ownedQuantity: 0,
      marketPriceCents: 100, metaImportance: 0.3, substitutionFlexibility: 0.9, priceConfidence: 0.9,
    },
  ], 5000);
  assert.equal(results[0].id, 'core');
  assert.ok(results[1].riskFlags.includes('lower_cost_substitute_possible'));
});

test('bargain grading returns expected-value result without claiming a grade', () => {
  const result = evaluateBargainGrading({
    id: 'cheap-card',
    purchasePriceCents: 300,
    gradingFeeCents: 2500,
    shippingAndInsuranceCents: 700,
    sellingFeeRate: 0.13,
    rawResaleValueCents: 500,
    identityConfidence: 0.95,
    conditionConfidence: 0.9,
    outcomes: [
      { label: '8', probability: 0.2, expectedValueCents: 2500 },
      { label: '9', probability: 0.5, expectedValueCents: 5000 },
      { label: '10', probability: 0.3, expectedValueCents: 12000 },
    ],
  });
  assert.equal(result.recommendation, 'grade_candidate');
  assert.match(result.disclaimer, /not a grading-company result/);
});

test('bargain grading rejects malformed probability models', () => {
  assert.throws(() => evaluateBargainGrading({
    id: 'bad', purchasePriceCents: 100, gradingFeeCents: 100, shippingAndInsuranceCents: 0,
    sellingFeeRate: 0.1, rawResaleValueCents: 100, identityConfidence: 1, conditionConfidence: 1,
    outcomes: [{ label: '10', probability: 0.5, expectedValueCents: 1000 }],
  }), /sum_to_one/);
});

test('savings plan calculates remaining weekly and monthly amounts', () => {
  const result = calculateSavingsPlan(10000, 2000, '2026-08-31', new Date('2026-07-10T00:00:00Z'));
  assert.equal(result.remainingCents, 8000);
  assert.ok(result.weeklyContributionCents > 0);
  assert.ok(result.monthlyContributionCents > 0);
});

test('promotions fail closed without legal approval and official rules', () => {
  const evaluation = evaluatePromotionEntry({
    id: 'p1', promotionKind: 'sweepstakes', status: 'open', purchaseRequired: false,
    noPurchaseMethod: 'web_form', minimumAge: 18, allowedJurisdictions: ['US-MD'],
    excludedJurisdictions: [], maximumEntriesPerUser: 1, published: true,
  }, {
    userAge: 21, jurisdictionCode: 'US-MD', existingEntryCount: 0,
    rulesAccepted: true, entryMethod: 'web_form', now: new Date('2026-07-10T12:00:00Z'),
  });
  assert.equal(evaluation.eligible, false);
  assert.ok(evaluation.reasons.includes('official_rules_missing'));
  assert.ok(evaluation.reasons.includes('legal_approval_missing'));
});

test('purchase-required promotion entries are blocked by policy', () => {
  const evaluation = evaluatePromotionEntry({
    id: 'p2', promotionKind: 'giveaway', status: 'open', purchaseRequired: true,
    minimumAge: 18, allowedJurisdictions: [], excludedJurisdictions: [],
    maximumEntriesPerUser: 1, published: true, officialRulesUrl: 'https://example.com/rules',
    legalApprovalReference: 'COUNSEL-1', legalApprovedAt: '2026-07-01T00:00:00Z',
  }, {
    userAge: 21, jurisdictionCode: 'US-MD', existingEntryCount: 0,
    rulesAccepted: true, entryMethod: 'purchase', now: new Date('2026-07-10T12:00:00Z'),
  });
  assert.ok(evaluation.reasons.includes('purchase_required_promotions_disabled'));
});

test('commit-reveal drawing is deterministic and auditable', () => {
  const seed = 'private-seed-for-test';
  const commitment = createSeedCommitment(seed);
  const first = selectPromotionWinner('campaign-1', 1, ['e3', 'e1', 'e2'], seed, commitment);
  const second = selectPromotionWinner('campaign-1', 1, ['e2', 'e3', 'e1'], seed, commitment);
  assert.equal(first.winnerEntryId, second.winnerEntryId);
  assert.equal(first.auditDigest, second.auditDigest);
});

test('experiment assignment is stable and weights must total 10000', () => {
  const variants = [
    { key: 'control', weightBasisPoints: 5000 },
    { key: 'treatment', weightBasisPoints: 5000 },
  ];
  const a = assignExperimentVariant('onboarding-v1', 'user-1', variants);
  const b = assignExperimentVariant('onboarding-v1', 'user-1', variants);
  assert.deepEqual(a, b);
  assert.throws(() => assignExperimentVariant('bad', 'user', [{ key: 'a', weightBasisPoints: 100 }]), /10000/);
});

test('experiment events reject sensitive metadata', () => {
  assert.throws(() => validateExperimentEvent('checkout.complete', { email: 'private@example.com' }), /prohibited/);
  assert.equal(validateExperimentEvent('wishlist.capture', { surface: 'card_show' }).validated, true);
});
