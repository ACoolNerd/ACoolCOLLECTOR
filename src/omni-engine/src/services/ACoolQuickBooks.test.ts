import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import {
  buildAccountingIdempotencyKey,
  buildQuickBooksAuthorizationUrl,
  buildQuickBooksInvoice,
  generateOAuthState,
  hashOAuthState,
  verifyIntuitWebhookSignature,
} from './ACoolQuickBooks.js';

test('OAuth state is high entropy and hashable without storing the raw value', () => {
  const state = generateOAuthState();
  assert.ok(state.length >= 32);
  assert.match(hashOAuthState(state), /^[a-f0-9]{64}$/);
  assert.notEqual(hashOAuthState(state), state);
});

test('QuickBooks authorization URL contains accounting scope, redirect, and state', () => {
  const state = generateOAuthState();
  const url = new URL(buildQuickBooksAuthorizationUrl({
    clientId: 'client-id',
    redirectUri: 'https://acoolcollector.com/oauth/intuit/callback',
    state,
  }));

  assert.equal(url.origin, 'https://appcenter.intuit.com');
  assert.equal(url.pathname, '/connect/oauth2');
  assert.equal(url.searchParams.get('client_id'), 'client-id');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://acoolcollector.com/oauth/intuit/callback');
  assert.equal(url.searchParams.get('state'), state);
  assert.match(url.searchParams.get('scope') ?? '', /com\.intuit\.quickbooks\.accounting/);
});

test('QuickBooks authorization URL rejects unsafe redirect and weak state', () => {
  assert.throws(() => buildQuickBooksAuthorizationUrl({
    clientId: 'client-id',
    redirectUri: 'http://localhost/callback',
    state: generateOAuthState(),
  }), /invalid_intuit_redirect_uri/);

  assert.throws(() => buildQuickBooksAuthorizationUrl({
    clientId: 'client-id',
    redirectUri: 'https://acoolcollector.com/oauth/intuit/callback',
    state: 'short',
  }), /oauth_state_too_short/);
});

test('Intuit webhook signature verifies exact raw body and rejects modifications', () => {
  const rawBody = JSON.stringify({ eventNotifications: [{ realmId: '123' }] });
  const verifierToken = 'verifier-token-for-test';
  const signature = createHmac('sha256', verifierToken).update(rawBody).digest('base64');

  assert.equal(verifyIntuitWebhookSignature({ rawBody, signature, verifierToken }), true);
  assert.equal(verifyIntuitWebhookSignature({
    rawBody: `${rawBody} `,
    signature,
    verifierToken,
  }), false);
});

test('QuickBooks invoice converts integer cents and preserves ACool references', () => {
  const invoice = buildQuickBooksInvoice({
    customerRef: '42',
    currency: 'USD',
    orderReference: 'ACOOL-ORDER-1001',
    classRef: 'class-1',
    departmentRef: 'location-1',
    customerMemo: 'Thank you for collecting with ACoolCOLLECTOR.',
    lines: [
      {
        localLineId: 'line-1',
        description: 'Approved collectible listing',
        quantity: 2,
        unitPriceCents: 12345,
        itemRef: 'item-1',
      },
    ],
  });

  assert.equal(invoice.CustomerRef.value, '42');
  assert.equal(invoice.CurrencyRef.value, 'USD');
  assert.equal(invoice.DocNumber, 'ACOOL-ORDER-1001');
  assert.equal(invoice.DepartmentRef?.value, 'location-1');
  assert.equal(invoice.Line[0].Amount, 246.9);
  assert.equal(invoice.Line[0].SalesItemLineDetail.UnitPrice, 123.45);
  assert.equal(invoice.Line[0].SalesItemLineDetail.ClassRef?.value, 'class-1');
  assert.match(invoice.Line[0].PrivateNote, /line-1/);
});

test('QuickBooks invoice rejects invalid money and empty lines', () => {
  assert.throws(() => buildQuickBooksInvoice({
    customerRef: '42',
    currency: 'USD',
    orderReference: 'ORDER-1',
    lines: [],
  }), /invoice_lines_required/);

  assert.throws(() => buildQuickBooksInvoice({
    customerRef: '42',
    currency: 'USD',
    orderReference: 'ORDER-1',
    lines: [{
      localLineId: 'line-1',
      description: 'Invalid',
      quantity: 1,
      unitPriceCents: 12.5,
    }],
  }), /invalid_money_cents/);
});

test('accounting idempotency key is deterministic and amount-sensitive', () => {
  const first = buildAccountingIdempotencyKey({
    organizationId: 'org-1',
    operation: 'invoice.create',
    localEntityId: 'order-1',
    amountCents: 10000,
    currency: 'USD',
  });
  const same = buildAccountingIdempotencyKey({
    organizationId: 'org-1',
    operation: 'invoice.create',
    localEntityId: 'order-1',
    amountCents: 10000,
    currency: 'USD',
  });
  const changed = buildAccountingIdempotencyKey({
    organizationId: 'org-1',
    operation: 'invoice.create',
    localEntityId: 'order-1',
    amountCents: 10001,
    currency: 'USD',
  });

  assert.equal(first, same);
  assert.notEqual(first, changed);
  assert.match(first, /^[a-f0-9]{64}$/);
});
