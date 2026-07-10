import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSourceAlert,
  evaluateExternalSource,
  fingerprintExternalSource,
} from './ACoolExternalSourceEngine.js';

const snapshot = {
  sourceUrl: 'https://example.com/events#calendar',
  sourceType: 'official_website' as const,
  fetchedAt: '2026-07-10T12:00:00.000Z',
  body: '<html>Official event calendar</html>',
  httpStatus: 200,
  etag: 'abc',
};

test('fingerprint is deterministic and strips URL fragments', () => {
  const first = fingerprintExternalSource(snapshot);
  const second = fingerprintExternalSource({ ...snapshot, sourceUrl: 'https://example.com/events' });
  assert.equal(first, second);
});

test('fresh successful source is active', () => {
  const evaluation = evaluateExternalSource({
    snapshot,
    now: new Date('2026-07-10T13:00:00.000Z'),
    staleAfterHours: 24,
  });
  assert.equal(evaluation.status, 'active');
  assert.equal(evaluation.changed, false);
  assert.equal(buildSourceAlert(evaluation).code, 'external_source_current');
});

test('changed source requires review', () => {
  const evaluation = evaluateExternalSource({
    snapshot,
    previousFingerprint: 'different',
    now: new Date('2026-07-10T13:00:00.000Z'),
  });
  assert.equal(evaluation.changed, true);
  assert.equal(buildSourceAlert(evaluation).action, 'review_before_publish');
});

test('stale and failed sources fail closed', () => {
  const stale = evaluateExternalSource({
    snapshot,
    now: new Date('2026-07-13T12:00:01.000Z'),
    staleAfterHours: 48,
  });
  assert.equal(stale.status, 'stale');
  assert.equal(buildSourceAlert(stale).action, 'refresh_and_review');

  const failed = evaluateExternalSource({
    snapshot: { ...snapshot, httpStatus: 503 },
    now: new Date('2026-07-10T13:00:00.000Z'),
  });
  assert.equal(failed.status, 'error');
  assert.equal(buildSourceAlert(failed).severity, 'high');
});

test('non-HTTPS sources are rejected', () => {
  assert.throws(
    () => evaluateExternalSource({ snapshot: { ...snapshot, sourceUrl: 'http://example.com' } }),
    /external_source_https_required/,
  );
});
