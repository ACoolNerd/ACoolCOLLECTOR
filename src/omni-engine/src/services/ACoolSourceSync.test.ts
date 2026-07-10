import test from 'node:test';
import assert from 'node:assert/strict';
import { fingerprintSourceContent, validateOfficialSourceUrl } from './ACoolSourceSync.js';

test('official source URL requires HTTPS and allowed host', () => {
  assert.throws(() => validateOfficialSourceUrl('http://example.com'), /https_required/);
  assert.throws(() => validateOfficialSourceUrl('https://evil.example/path', ['official.example']), /host_not_allowed/);
  const url = validateOfficialSourceUrl('https://official.example/events#today', ['official.example']);
  assert.equal(url.toString(), 'https://official.example/events');
});

test('official source URL rejects embedded credentials', () => {
  assert.throws(() => validateOfficialSourceUrl('https://user:pass@official.example', ['official.example']), /credentials_forbidden/);
});

test('source fingerprint is deterministic and change-sensitive', () => {
  const first = fingerprintSourceContent('event-date=2026-07-16');
  const same = fingerprintSourceContent('event-date=2026-07-16');
  const changed = fingerprintSourceContent('event-date=2026-07-17');
  assert.equal(first, same);
  assert.notEqual(first, changed);
  assert.match(first, /^[a-f0-9]{64}$/);
});
