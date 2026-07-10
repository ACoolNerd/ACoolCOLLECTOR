import { createHash } from 'node:crypto';
import { Router, type Request } from 'express';
import { requireAuth, requirePermission, type ACoolRequest } from '../middleware/ACoolIAM.js';
import {
  buildAccountingIdempotencyKey,
  buildQuickBooksApiUrl,
  buildQuickBooksAuthorizationUrl,
  buildQuickBooksInvoice,
  generateOAuthState,
  hashOAuthState,
  parseQuickBooksWebhookEntities,
  requestQuickBooksTokens,
  verifyIntuitWebhookSignature,
  type QuickBooksEnvironment,
  type QuickBooksTokenBundle,
} from './ACoolQuickBooks.js';
import { accessSecretVersion, addSecretVersion } from './ACoolSecretManager.js';
import { encodeFilter, supabaseAdminRequest } from './ACoolSupabaseAdmin.js';

const router = Router();

type QboConnection = {
  id: string;
  organization_id: string;
  realm_id: string;
  environment: QuickBooksEnvironment;
  status: string;
  encrypted_token_reference: string;
  access_token_expires_at?: string | null;
  refresh_token_expires_at?: string | null;
};

type OAuthSession = {
  id: string;
  organization_id: string;
  user_id: string;
  state_hash: string;
  environment: QuickBooksEnvironment;
  redirect_uri: string;
  expires_at: string;
  used_at?: string | null;
};

const qboConfig = () => {
  const clientId = process.env.INTUIT_CLIENT_ID?.trim();
  const clientSecret = process.env.INTUIT_CLIENT_SECRET?.trim();
  const redirectUri = process.env.INTUIT_REDIRECT_URI?.trim();
  if (!clientId || !clientSecret || !redirectUri) throw new Error('quickbooks_not_configured');
  const environment = process.env.INTUIT_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
  return { clientId, clientSecret, redirectUri, environment } as const;
};

const organizationIdFromRequest = (request: ACoolRequest) => {
  const organizationId = request.header('x-acool-organization-id')?.trim();
  if (!organizationId) throw new Error('organization_header_required');
  return organizationId;
};

const tokenSecretId = (organizationId: string, realmId: string, environment: QuickBooksEnvironment) => {
  const digest = createHash('sha256')
    .update(`${organizationId}|${realmId}|${environment}`, 'utf8')
    .digest('hex')
    .slice(0, 32);
  return `acool-qbo-${digest}`;
};

const tokenExpiry = (bundle: QuickBooksTokenBundle) => {
  const issued = new Date(bundle.issued_at).getTime();
  return {
    access: new Date(issued + bundle.expires_in * 1000).toISOString(),
    refresh: bundle.x_refresh_token_expires_in
      ? new Date(issued + bundle.x_refresh_token_expires_in * 1000).toISOString()
      : null,
  };
};

const getConnection = async (connectionId: string, organizationId: string) => {
  const rows = await supabaseAdminRequest<QboConnection[]>(
    `/rest/v1/qbo_connections?id=eq.${encodeFilter(connectionId)}&organization_id=eq.${encodeFilter(organizationId)}&select=*`,
  );
  if (!rows[0]) throw new Error('qbo_connection_not_found');
  return rows[0];
};

const getTokenBundle = async (connection: QboConnection) => {
  const payload = await accessSecretVersion(connection.encrypted_token_reference);
  const parsed = JSON.parse(payload) as QuickBooksTokenBundle;
  if (!parsed.access_token || !parsed.refresh_token) throw new Error('qbo_token_bundle_invalid');
  return parsed;
};

const refreshConnection = async (connection: QboConnection) => {
  const config = qboConfig();
  const current = await getTokenBundle(connection);
  const refreshed = await requestQuickBooksTokens({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: current.refresh_token,
  });
  await addSecretVersion(tokenSecretId(connection.organization_id, connection.realm_id, connection.environment), JSON.stringify(refreshed));
  const expiry = tokenExpiry(refreshed);
  await supabaseAdminRequest(`/rest/v1/qbo_connections?id=eq.${encodeFilter(connection.id)}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'active',
      access_token_expires_at: expiry.access,
      refresh_token_expires_at: expiry.refresh,
      last_refresh_at: new Date().toISOString(),
      last_error_code: null,
    }),
  });
  return refreshed;
};

router.post('/oauth/start', requireAuth, requirePermission('accounting.manage'), async (request: ACoolRequest, response) => {
  try {
    const config = qboConfig();
    const organizationId = organizationIdFromRequest(request);
    const userId = request.acoolIdentity?.userId;
    if (!userId) throw new Error('authentication_required');
    const state = generateOAuthState();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await supabaseAdminRequest('/rest/v1/qbo_oauth_sessions', {
      method: 'POST',
      body: JSON.stringify({
        organization_id: organizationId,
        user_id: userId,
        state_hash: hashOAuthState(state),
        environment: config.environment,
        redirect_uri: config.redirectUri,
        expires_at: expiresAt,
      }),
    });
    return response.json({
      authorization_url: buildQuickBooksAuthorizationUrl({
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        state,
      }),
      expires_at: expiresAt,
      environment: config.environment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'qbo_oauth_start_failed';
    return response.status(message.includes('required') ? 400 : 503).json({ error: message });
  }
});

router.get('/oauth/callback', async (request, response) => {
  try {
    const config = qboConfig();
    const code = typeof request.query.code === 'string' ? request.query.code : '';
    const state = typeof request.query.state === 'string' ? request.query.state : '';
    const realmId = typeof request.query.realmId === 'string' ? request.query.realmId : '';
    if (!code || !state || !realmId) throw new Error('qbo_callback_parameters_required');
    const now = new Date().toISOString();
    const sessions = await supabaseAdminRequest<OAuthSession[]>(
      `/rest/v1/qbo_oauth_sessions?state_hash=eq.${encodeFilter(hashOAuthState(state))}&used_at=is.null&expires_at=gt.${encodeFilter(now)}&select=*&limit=1`,
    );
    const session = sessions[0];
    if (!session) throw new Error('qbo_oauth_state_invalid_or_expired');

    await supabaseAdminRequest(`/rest/v1/qbo_oauth_sessions?id=eq.${encodeFilter(session.id)}&used_at=is.null`, {
      method: 'PATCH',
      body: JSON.stringify({ used_at: now }),
    });

    const bundle = await requestQuickBooksTokens({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      authorizationCode: code,
      redirectUri: session.redirect_uri,
    });
    const secretId = tokenSecretId(session.organization_id, realmId, session.environment);
    const secretVersion = await addSecretVersion(secretId, JSON.stringify(bundle));
    const secretReference = secretVersion.replace(/\/versions\/[^/]+$/, '');
    const expiry = tokenExpiry(bundle);

    const connections = await supabaseAdminRequest<QboConnection[]>('/rest/v1/qbo_connections?on_conflict=organization_id,realm_id,environment', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        organization_id: session.organization_id,
        realm_id: realmId,
        environment: session.environment,
        status: 'active',
        encrypted_token_reference: secretReference,
        granted_scopes: ['com.intuit.quickbooks.accounting'],
        access_token_expires_at: expiry.access,
        refresh_token_expires_at: expiry.refresh,
        connected_by: session.user_id,
        connected_at: now,
        last_refresh_at: now,
        last_error_code: null,
      }),
    });

    const redirect = process.env.QBO_POST_CONNECT_REDIRECT_URI?.trim();
    if (redirect) {
      const target = new URL(redirect);
      if (target.protocol !== 'https:') throw new Error('invalid_qbo_post_connect_redirect');
      target.searchParams.set('qbo_connected', '1');
      target.searchParams.set('connection_id', connections[0]?.id ?? '');
      return response.redirect(302, target.toString());
    }
    return response.json({
      connected: true,
      connection_id: connections[0]?.id ?? null,
      realm_id: realmId,
      environment: session.environment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'qbo_oauth_callback_failed';
    return response.status(message.includes('required') || message.includes('invalid') ? 400 : 503).json({ error: message });
  }
});

router.get('/connections', requireAuth, requirePermission('accounting.manage'), async (request: ACoolRequest, response) => {
  try {
    const organizationId = organizationIdFromRequest(request);
    const rows = await supabaseAdminRequest<QboConnection[]>(
      `/rest/v1/qbo_connections?organization_id=eq.${encodeFilter(organizationId)}&select=id,realm_id,environment,status,access_token_expires_at,refresh_token_expires_at,connected_at,last_refresh_at,last_error_code&order=connected_at.desc`,
    );
    return response.json({ connections: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'qbo_connections_failed';
    return response.status(message.includes('required') ? 400 : 503).json({ error: message });
  }
});

router.post('/connections/:connectionId/refresh', requireAuth, requirePermission('accounting.manage'), async (request: ACoolRequest, response) => {
  try {
    const organizationId = organizationIdFromRequest(request);
    const connection = await getConnection(request.params.connectionId, organizationId);
    const bundle = await refreshConnection(connection);
    const expiry = tokenExpiry(bundle);
    return response.json({ refreshed: true, access_token_expires_at: expiry.access, refresh_token_expires_at: expiry.refresh });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'qbo_refresh_failed';
    return response.status(message.includes('not_found') ? 404 : 503).json({ error: message });
  }
});

router.post('/connections/:connectionId/invoices', requireAuth, requirePermission('accounting.manage'), async (request: ACoolRequest, response) => {
  try {
    const organizationId = organizationIdFromRequest(request);
    const connection = await getConnection(request.params.connectionId, organizationId);
    const body = request.body as Record<string, unknown>;
    const localEntityId = typeof body.local_entity_id === 'string' ? body.local_entity_id : '';
    if (!localEntityId) throw new Error('local_entity_id_required');
    const invoice = buildQuickBooksInvoice(body.invoice as Parameters<typeof buildQuickBooksInvoice>[0]);
    const idempotencyKey = buildAccountingIdempotencyKey({
      organizationId,
      operation: 'invoice.create',
      localEntityId,
      currency: typeof body.currency === 'string' ? body.currency : 'USD',
    });
    const existing = await supabaseAdminRequest<Array<{ status: string; qbo_entity_id?: string; response_snapshot?: unknown }>>(
      `/rest/v1/qbo_sync_operations?idempotency_key=eq.${encodeFilter(idempotencyKey)}&select=status,qbo_entity_id,response_snapshot&limit=1`,
    );
    if (existing[0]?.status === 'completed') return response.json({ duplicate: true, operation: existing[0] });

    await supabaseAdminRequest('/rest/v1/qbo_sync_operations?on_conflict=idempotency_key', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        qbo_connection_id: connection.id,
        operation_key: 'invoice.create',
        local_entity_type: 'order',
        local_entity_id: localEntityId,
        idempotency_key: idempotencyKey,
        request_digest: createHash('sha256').update(JSON.stringify(invoice)).digest('hex'),
        qbo_entity_type: 'Invoice',
        status: 'processing',
      }),
    });

    let bundle = await getTokenBundle(connection);
    if (connection.access_token_expires_at && new Date(connection.access_token_expires_at).getTime() <= Date.now() + 60_000) {
      bundle = await refreshConnection(connection);
    }
    const qboResponse = await fetch(buildQuickBooksApiUrl({
      environment: connection.environment,
      realmId: connection.realm_id,
      resourcePath: '/invoice',
      requestId: idempotencyKey,
    }), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bundle.access_token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoice),
      signal: AbortSignal.timeout(25_000),
    });
    const result = await qboResponse.json() as { Invoice?: { Id?: string; SyncToken?: string }; Fault?: unknown };
    if (!qboResponse.ok || !result.Invoice?.Id) throw new Error(`qbo_invoice_create_failed_${qboResponse.status}`);

    await supabaseAdminRequest(`/rest/v1/qbo_sync_operations?idempotency_key=eq.${encodeFilter(idempotencyKey)}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'completed',
        qbo_entity_id: result.Invoice.Id,
        qbo_sync_token: result.Invoice.SyncToken ?? null,
        response_snapshot: result,
        attempt_count: 1,
        last_error_code: null,
        updated_at: new Date().toISOString(),
      }),
    });
    return response.status(201).json({ duplicate: false, idempotency_key: idempotencyKey, invoice: result.Invoice });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'qbo_invoice_failed';
    const status = message.includes('required') || message.includes('invalid') ? 400 : message.includes('not_found') ? 404 : 503;
    return response.status(status).json({ error: message });
  }
});

router.post('/webhook', async (request: Request & { rawBody?: Buffer }, response) => {
  try {
    const verifierToken = process.env.INTUIT_WEBHOOK_VERIFIER_TOKEN?.trim();
    const signature = request.header('intuit-signature') ?? '';
    const rawBody = request.rawBody ?? Buffer.from(JSON.stringify(request.body ?? {}));
    if (!verifierToken || !verifyIntuitWebhookSignature({ rawBody, signature, verifierToken })) {
      return response.status(401).json({ error: 'invalid_intuit_webhook_signature' });
    }
    const digest = createHash('sha256').update(rawBody).digest('hex');
    const entities = parseQuickBooksWebhookEntities(request.body);
    for (const entity of entities) {
      await supabaseAdminRequest('/rest/v1/qbo_webhook_events?on_conflict=realm_id,entity_name,entity_id,operation,payload_digest', {
        method: 'POST',
        headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
        body: JSON.stringify({
          realm_id: entity.realmId,
          entity_name: entity.name,
          entity_id: entity.id,
          operation: entity.operation,
          signature_verified: true,
          payload_digest: digest,
          processing_status: 'received',
        }),
      });
    }
    return response.status(200).json({ accepted: true, entity_count: entities.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'qbo_webhook_failed';
    return response.status(503).json({ error: message });
  }
});

export default router;
