import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export type QuickBooksEnvironment = 'sandbox' | 'production';

export type QuickBooksInvoiceLine = {
  localLineId: string;
  description: string;
  quantity: number;
  unitPriceCents: number;
  itemRef?: string;
};

export type QuickBooksInvoiceInput = {
  customerRef: string;
  currency: string;
  orderReference: string;
  lines: QuickBooksInvoiceLine[];
  classRef?: string;
  departmentRef?: string;
  customerMemo?: string;
};

const requireHttps = (value: string, field: string) => {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error(`invalid_${field}`);
  return url.toString();
};

export const generateOAuthState = () => randomBytes(32).toString('base64url');

export const hashOAuthState = (state: string) =>
  createHash('sha256').update(state, 'utf8').digest('hex');

export const buildQuickBooksAuthorizationUrl = (input: {
  clientId: string;
  redirectUri: string;
  state: string;
  scopes?: string[];
}) => {
  if (!input.clientId.trim()) throw new Error('intuit_client_id_required');
  if (input.state.length < 32) throw new Error('oauth_state_too_short');
  const redirectUri = requireHttps(input.redirectUri, 'intuit_redirect_uri');
  const scopes = input.scopes?.length
    ? input.scopes
    : ['com.intuit.quickbooks.accounting'];

  const url = new URL('https://appcenter.intuit.com/connect/oauth2');
  url.searchParams.set('client_id', input.clientId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scopes.join(' '));
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('state', input.state);
  return url.toString();
};

export const verifyIntuitWebhookSignature = (input: {
  rawBody: string | Buffer;
  signature: string;
  verifierToken: string;
}) => {
  if (!input.signature || !input.verifierToken) return false;
  const expected = createHmac('sha256', input.verifierToken)
    .update(input.rawBody)
    .digest('base64');
  const suppliedBuffer = Buffer.from(input.signature, 'utf8');
  const expectedBuffer = Buffer.from(expected, 'utf8');
  if (suppliedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(suppliedBuffer, expectedBuffer);
};

const centsToAmount = (cents: number) => {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new Error('invalid_money_cents');
  return Number((cents / 100).toFixed(2));
};

export const buildQuickBooksInvoice = (input: QuickBooksInvoiceInput) => {
  if (!input.customerRef.trim()) throw new Error('qbo_customer_ref_required');
  if (!/^[A-Z]{3}$/.test(input.currency)) throw new Error('invalid_currency');
  if (!input.orderReference.trim()) throw new Error('order_reference_required');
  if (!Array.isArray(input.lines) || input.lines.length === 0) throw new Error('invoice_lines_required');

  const Line = input.lines.map((line, index) => {
    if (!line.localLineId.trim()) throw new Error('local_line_id_required');
    if (!Number.isFinite(line.quantity) || line.quantity <= 0) throw new Error('invalid_quantity');
    const unitPrice = centsToAmount(line.unitPriceCents);
    const amount = Number((unitPrice * line.quantity).toFixed(2));
    return {
      Id: String(index + 1),
      LineNum: index + 1,
      Description: line.description.trim().slice(0, 4000),
      Amount: amount,
      DetailType: 'SalesItemLineDetail',
      SalesItemLineDetail: {
        Qty: line.quantity,
        UnitPrice: unitPrice,
        ...(line.itemRef ? { ItemRef: { value: line.itemRef } } : {}),
        ...(input.classRef ? { ClassRef: { value: input.classRef } } : {}),
      },
      PrivateNote: `ACool line ${line.localLineId}`,
    };
  });

  return {
    CustomerRef: { value: input.customerRef },
    CurrencyRef: { value: input.currency },
    DocNumber: input.orderReference.slice(0, 21),
    PrivateNote: `ACool order ${input.orderReference}`,
    ...(input.customerMemo ? { CustomerMemo: { value: input.customerMemo.slice(0, 1000) } } : {}),
    ...(input.departmentRef ? { DepartmentRef: { value: input.departmentRef } } : {}),
    Line,
  };
};

export const buildAccountingIdempotencyKey = (input: {
  organizationId: string;
  operation: string;
  localEntityId: string;
  amountCents?: number;
  currency?: string;
}) => {
  const material = [
    input.organizationId,
    input.operation,
    input.localEntityId,
    input.amountCents ?? '',
    input.currency ?? '',
  ].join('|');
  return createHash('sha256').update(material, 'utf8').digest('hex');
};
