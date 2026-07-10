import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto';

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

export type QuickBooksTokenBundle = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  x_refresh_token_expires_in?: number;
  issued_at: string;
};

export type ProtectedTokenBundle = {
  ciphertext: string;
  initialization_vector: string;
  authentication_tag: string;
  token_fingerprint: string;
  key_version: string;
};

const requireHttps = (value: string, field: string) => {
  const url = new URL(value);
  if (url.protocol !== 'https:') throw new Error(`invalid_${field}`);
  return url.toString();
};

const decodeEncryptionKey = (value: string) => {
  const key = Buffer.from(value, 'base64');
  if (key.length !== 32) throw new Error('qbo_encryption_key_must_be_32_bytes_base64');
  return key;
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

export const protectQuickBooksTokenBundle = (
  bundle: QuickBooksTokenBundle,
  encryptionKeyBase64: string,
  keyVersion = 'v1',
): ProtectedTokenBundle => {
  const key = decodeEncryptionKey(encryptionKeyBase64);
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(bundle), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authenticationTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString('base64'),
    initialization_vector: iv.toString('base64'),
    authentication_tag: authenticationTag.toString('base64'),
    token_fingerprint: createHash('sha256').update(bundle.refresh_token, 'utf8').digest('hex'),
    key_version: keyVersion,
  };
};

export const revealQuickBooksTokenBundle = (
  protectedBundle: ProtectedTokenBundle,
  encryptionKeyBase64: string,
): QuickBooksTokenBundle => {
  const key = decodeEncryptionKey(encryptionKeyBase64);
  const decipher = createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(protectedBundle.initialization_vector, 'base64'),
  );
  decipher.setAuthTag(Buffer.from(protectedBundle.authentication_tag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(protectedBundle.ciphertext, 'base64')),
    decipher.final(),
  ]).toString('utf8');
  return JSON.parse(plaintext) as QuickBooksTokenBundle;
};

export const buildQuickBooksTokenForm = (input: {
  authorizationCode?: string;
  refreshToken?: string;
  redirectUri?: string;
}) => {
  const hasCode = Boolean(input.authorizationCode);
  const hasRefresh = Boolean(input.refreshToken);
  if (hasCode === hasRefresh) throw new Error('provide_exactly_one_qbo_token_grant');
  const form = new URLSearchParams();
  if (input.authorizationCode) {
    if (!input.redirectUri) throw new Error('intuit_redirect_uri_required');
    form.set('grant_type', 'authorization_code');
    form.set('code', input.authorizationCode);
    form.set('redirect_uri', requireHttps(input.redirectUri, 'intuit_redirect_uri'));
  } else {
    form.set('grant_type', 'refresh_token');
    form.set('refresh_token', input.refreshToken ?? '');
  }
  return form;
};

export const requestQuickBooksTokens = async (input: {
  clientId: string;
  clientSecret: string;
  authorizationCode?: string;
  refreshToken?: string;
  redirectUri?: string;
}): Promise<QuickBooksTokenBundle> => {
  if (!input.clientId || !input.clientSecret) throw new Error('intuit_credentials_required');
  const form = buildQuickBooksTokenForm(input);
  const authorization = Buffer.from(`${input.clientId}:${input.clientSecret}`).toString('base64');
  const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${authorization}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form,
    signal: AbortSignal.timeout(20_000),
  });
  const payload = await response.json() as Partial<QuickBooksTokenBundle> & { error?: string; error_description?: string };
  if (!response.ok || !payload.access_token || !payload.refresh_token) {
    throw new Error(payload.error_description || payload.error || `intuit_token_exchange_failed_${response.status}`);
  }
  return {
    access_token: payload.access_token,
    refresh_token: payload.refresh_token,
    token_type: payload.token_type || 'bearer',
    expires_in: Number(payload.expires_in || 3600),
    x_refresh_token_expires_in: payload.x_refresh_token_expires_in
      ? Number(payload.x_refresh_token_expires_in)
      : undefined,
    issued_at: new Date().toISOString(),
  };
};

export const quickBooksApiBase = (environment: QuickBooksEnvironment) =>
  environment === 'sandbox'
    ? 'https://sandbox-quickbooks.api.intuit.com'
    : 'https://quickbooks.api.intuit.com';

export const buildQuickBooksApiUrl = (input: {
  environment: QuickBooksEnvironment;
  realmId: string;
  resourcePath: string;
  requestId?: string;
  minorVersion?: number;
}) => {
  if (!/^[A-Za-z0-9_-]+$/.test(input.realmId)) throw new Error('invalid_qbo_realm_id');
  if (!input.resourcePath.startsWith('/')) throw new Error('invalid_qbo_resource_path');
  const url = new URL(`${quickBooksApiBase(input.environment)}/v3/company/${input.realmId}${input.resourcePath}`);
  if (input.requestId) url.searchParams.set('requestid', input.requestId.slice(0, 50));
  url.searchParams.set('minorversion', String(input.minorVersion ?? 75));
  return url.toString();
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

export type QuickBooksWebhookEntity = {
  realmId: string;
  name: string;
  id: string;
  operation: string;
  lastUpdated?: string;
};

export const parseQuickBooksWebhookEntities = (payload: unknown): QuickBooksWebhookEntity[] => {
  const notifications = (payload as { eventNotifications?: unknown[] })?.eventNotifications;
  if (!Array.isArray(notifications)) return [];
  const entities: QuickBooksWebhookEntity[] = [];
  for (const notification of notifications) {
    const item = notification as {
      realmId?: unknown;
      dataChangeEvent?: { entities?: unknown[] };
    };
    const realmId = typeof item.realmId === 'string' ? item.realmId : '';
    const rows = item.dataChangeEvent?.entities;
    if (!realmId || !Array.isArray(rows)) continue;
    for (const row of rows) {
      const entity = row as Record<string, unknown>;
      if (
        typeof entity.name === 'string'
        && typeof entity.id === 'string'
        && typeof entity.operation === 'string'
      ) {
        entities.push({
          realmId,
          name: entity.name,
          id: entity.id,
          operation: entity.operation,
          lastUpdated: typeof entity.lastUpdated === 'string' ? entity.lastUpdated : undefined,
        });
      }
    }
  }
  return entities;
};
