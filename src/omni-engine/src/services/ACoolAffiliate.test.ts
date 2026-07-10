import test from 'node:test';
import assert from 'node:assert/strict';
import { mayDisplayOfficialAffiliationBadge, resolveAffiliateLink } from './ACoolAffiliate.js';

const base = {
  programStatus: 'approved' as const,
  destinationUrl: 'https://tickets.example.com/event?id=123#fragment',
  approvedHosts: ['example.com'],
  disclosureText: 'ACoolCOLLECTOR may earn a commission from qualifying purchases.',
  linkStatus: 'active' as const,
  approvedAt: '2026-07-01T00:00:00Z',
  startsAt: '2026-07-01T00:00:00Z',
  expiresAt: '2026-12-31T23:59:59Z',
};

test('approved HTTPS affiliate link resolves with sponsored relationship attributes', () => {
  const result = resolveAffiliateLink(base, new Date('2026-07-10T00:00:00Z'));
  assert.equal(result.allowed, true);
  assert.equal(result.reason, 'approved');
  assert.equal(result.rel, 'sponsored nofollow noopener noreferrer');
  assert.equal(result.destinationUrl, 'https://tickets.example.com/event?id=123');
});

test('pending affiliate program cannot resolve or display an official badge', () => {
  const result = resolveAffiliateLink({ ...base, programStatus: 'pending_review' });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'program_not_approved');
  assert.equal(mayDisplayOfficialAffiliationBadge({
    programStatus: 'pending_review',
    agreementReference: 'agreement-1',
    trademarkApprovalReference: 'brand-1',
  }), false);
});

test('unapproved destination host is blocked', () => {
  const result = resolveAffiliateLink({ ...base, destinationUrl: 'https://attacker.invalid/redirect' });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'destination_host_not_allowlisted');
});

test('non-HTTPS destination is blocked', () => {
  const result = resolveAffiliateLink({ ...base, destinationUrl: 'http://tickets.example.com/event' });
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'invalid_destination_url');
});

test('badge requires approved status, agreement, trademark approval, and current term', () => {
  assert.equal(mayDisplayOfficialAffiliationBadge({
    programStatus: 'approved',
    agreementReference: 'agreement-1',
    trademarkApprovalReference: 'brand-1',
    expiresAt: '2026-12-31T23:59:59Z',
  }, new Date('2026-07-10T00:00:00Z')), true);

  assert.equal(mayDisplayOfficialAffiliationBadge({
    programStatus: 'approved',
    agreementReference: 'agreement-1',
    trademarkApprovalReference: null,
  }), false);
});
