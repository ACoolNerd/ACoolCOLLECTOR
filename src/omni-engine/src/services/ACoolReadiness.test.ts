import test from 'node:test';
import assert from 'node:assert/strict';
import {
  GOOGLE_CLOUD_CONTROLS,
  QUICKBOOKS_CONTROLS,
  releaseDecision,
  scoreReadiness,
} from './ACoolReadiness.js';

test('readiness scores only current passed evidence', () => {
  const now = new Date('2026-07-10T12:00:00Z');
  const result = scoreReadiness([
    { key: 'one', label: 'One', weight: 60, mandatory: true },
    { key: 'two', label: 'Two', weight: 40 },
  ], [
    { control_key: 'one', control_weight: 60, status: 'passed', observed_at: now.toISOString() },
    { control_key: 'two', control_weight: 40, status: 'passed', expires_at: '2026-07-09T00:00:00Z' },
  ], now);

  assert.equal(result.score, 60);
  assert.equal(result.mandatory_controls_passed, true);
  assert.deepEqual(result.expired, ['two']);
});

test('missing mandatory evidence forces no-go even with high score', () => {
  const result = scoreReadiness([
    { key: 'mandatory', label: 'Mandatory', weight: 5, mandatory: true },
    { key: 'large', label: 'Large', weight: 95 },
  ], [
    { control_key: 'large', control_weight: 95, status: 'passed' },
  ]);

  assert.equal(result.score, 95);
  assert.equal(result.mandatory_controls_passed, false);
  assert.equal(releaseDecision(result), 'no_go');
});

test('complete Google Cloud evidence reaches 100 and go', () => {
  const evidence = GOOGLE_CLOUD_CONTROLS.map((control) => ({
    control_key: control.key,
    control_weight: control.weight,
    status: 'passed' as const,
  }));
  const result = scoreReadiness(GOOGLE_CLOUD_CONTROLS, evidence);
  assert.equal(result.score, 100);
  assert.equal(result.mandatory_controls_passed, true);
  assert.equal(releaseDecision(result), 'go');
});

test('QuickBooks template totals 100 weight', () => {
  assert.equal(QUICKBOOKS_CONTROLS.reduce((sum, item) => sum + item.weight, 0), 100);
});
