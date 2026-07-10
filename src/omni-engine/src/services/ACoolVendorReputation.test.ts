import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateVendorReputation } from './ACoolVendorReputation.js';

test('withholds an overall score when verified evidence is insufficient', () => {
  const result = calculateVendorReputation({
    verification_level: 'unclaimed',
    verified_transaction_count: 0,
    review_count: 1,
    average_overall_rating: 5,
  });

  assert.equal(result.scoreStatus, 'insufficient_evidence');
  assert.equal(result.overallScore, null);
  assert.ok(result.evidenceConfidence < 25);
});

test('creates an established score from verified transaction and review evidence', () => {
  const result = calculateVendorReputation({
    verification_level: 'business_verified',
    verified_transaction_count: 30,
    disputed_transaction_count: 1,
    fulfillment_count: 28,
    on_time_count: 26,
    review_count: 20,
    verified_review_count: 18,
    average_overall_rating: 4.7,
    average_communication_rating: 4.6,
    verified_social_count: 3,
    distinct_social_sources: 3,
  });

  assert.equal(result.scoreStatus, 'established');
  assert.ok(result.overallScore !== null && result.overallScore > 80);
  assert.ok(result.evidenceConfidence >= 60);
});

test('disputes reduce transaction reliability without hiding the evidence', () => {
  const clean = calculateVendorReputation({
    verification_level: 'identity_verified',
    verified_transaction_count: 10,
    disputed_transaction_count: 0,
    review_count: 8,
    verified_review_count: 8,
    average_overall_rating: 4.5,
  });
  const disputed = calculateVendorReputation({
    verification_level: 'identity_verified',
    verified_transaction_count: 10,
    disputed_transaction_count: 4,
    review_count: 8,
    verified_review_count: 8,
    average_overall_rating: 4.5,
  });

  assert.ok(Number(disputed.componentScores.transaction_reliability) < Number(clean.componentScores.transaction_reliability));
  assert.ok(disputed.explanation.some((line) => line.includes('disputed')));
});
