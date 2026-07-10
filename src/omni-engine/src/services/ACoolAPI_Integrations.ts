import { Router } from 'express';
import { requireAuth, requirePermission, type ACoolRequest } from '../middleware/ACoolIAM.js';
import {
  GOOGLE_CLOUD_CONTROLS,
  QUICKBOOKS_CONTROLS,
  releaseDecision,
  scoreReadiness,
  type ReadinessEvidence,
} from './ACoolReadiness.js';
import { inspectOfficialSource } from './ACoolSourceSync.js';
import { encodeFilter, supabaseAdminRequest } from './ACoolSupabaseAdmin.js';

const router = Router();
router.use(requireAuth);

const organizationIdFromRequest = (request: ACoolRequest) => {
  const organizationId = request.header('x-acool-organization-id')?.trim();
  if (!organizationId) throw new Error('organization_header_required');
  return organizationId;
};

router.get('/readiness', requirePermission('integrations.evidence.read'), async (request: ACoolRequest, response) => {
  try {
    const organizationId = organizationIdFromRequest(request);
    const environment = typeof request.query.environment === 'string' ? request.query.environment : 'development';
    const integrationKey = typeof request.query.integration === 'string' ? request.query.integration : 'google_cloud';
    const controls = integrationKey === 'quickbooks_online' ? QUICKBOOKS_CONTROLS : GOOGLE_CLOUD_CONTROLS;
    const evidence = await supabaseAdminRequest<ReadinessEvidence[]>(
      `/rest/v1/integration_activation_evidence?organization_id=eq.${encodeFilter(organizationId)}&integration_key=eq.${encodeFilter(integrationKey)}&environment=eq.${encodeFilter(environment)}&select=control_key,control_weight,status,observed_at,expires_at,evidence_reference`,
    );
    const result = scoreReadiness(controls, evidence);
    return response.json({
      integration_key: integrationKey,
      environment,
      threshold: 90,
      decision: releaseDecision(result, 90),
      ...result,
      controls,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'integration_readiness_failed';
    return response.status(message.includes('required') ? 400 : 503).json({ error: message });
  }
});

router.post('/evidence', requirePermission('integrations.evidence.manage'), async (request: ACoolRequest, response) => {
  try {
    const organizationId = organizationIdFromRequest(request);
    const userId = request.acoolIdentity?.userId;
    if (!userId) throw new Error('authentication_required');
    const body = request.body as Record<string, unknown>;
    const integrationKey = typeof body.integration_key === 'string' ? body.integration_key.trim() : '';
    const controlKey = typeof body.control_key === 'string' ? body.control_key.trim() : '';
    const environment = typeof body.environment === 'string' ? body.environment : 'development';
    const status = typeof body.status === 'string' ? body.status : 'pending';
    const evidenceType = typeof body.evidence_type === 'string' ? body.evidence_type.trim() : '';
    const controlWeight = Number(body.control_weight);
    if (!integrationKey || !controlKey || !evidenceType || !Number.isFinite(controlWeight) || controlWeight <= 0) {
      throw new Error('invalid_activation_evidence');
    }
    const rows = await supabaseAdminRequest('/rest/v1/integration_activation_evidence?on_conflict=organization_id,integration_key,environment,control_key', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify({
        organization_id: organizationId,
        integration_key: integrationKey,
        environment,
        control_key: controlKey,
        control_weight: controlWeight,
        status,
        evidence_type: evidenceType,
        evidence_reference: typeof body.evidence_reference === 'string' ? body.evidence_reference : null,
        evidence_digest: typeof body.evidence_digest === 'string' ? body.evidence_digest : null,
        observed_at: typeof body.observed_at === 'string' ? body.observed_at : new Date().toISOString(),
        expires_at: typeof body.expires_at === 'string' ? body.expires_at : null,
        approved_by: status === 'passed' ? userId : null,
        approved_at: status === 'passed' ? new Date().toISOString() : null,
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 4000) : null,
        created_by: userId,
        updated_at: new Date().toISOString(),
      }),
    });
    return response.status(201).json({ evidence: rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'activation_evidence_failed';
    return response.status(message.startsWith('invalid_') || message.includes('required') ? 400 : 503).json({ error: message });
  }
});

router.post('/sources/check', requirePermission('integrations.manage'), async (request: ACoolRequest, response) => {
  try {
    const organizationId = organizationIdFromRequest(request);
    const body = request.body as Record<string, unknown>;
    const sourceKey = typeof body.source_key === 'string' ? body.source_key.trim() : '';
    const sourceUrl = typeof body.source_url === 'string' ? body.source_url.trim() : '';
    const sourceKind = typeof body.source_kind === 'string' ? body.source_kind : 'other';
    const allowedHosts = Array.isArray(body.allowed_hosts)
      ? body.allowed_hosts.filter((item): item is string => typeof item === 'string')
      : [];
    const previousFingerprint = typeof body.previous_fingerprint === 'string' ? body.previous_fingerprint : null;
    if (!sourceKey || !sourceUrl) throw new Error('source_key_and_url_required');

    try {
      const inspection = await inspectOfficialSource({ sourceUrl, allowedHosts, previousFingerprint });
      const runStatus = inspection.change_detected ? 'review_required' : 'unchanged';
      const rows = await supabaseAdminRequest('/rest/v1/source_sync_runs', {
        method: 'POST',
        body: JSON.stringify({
          organization_id: organizationId,
          source_key: sourceKey,
          source_url: inspection.source_url,
          source_kind: sourceKind,
          http_status: inspection.http_status,
          content_type: inspection.content_type,
          etag: inspection.etag,
          last_modified: inspection.last_modified,
          response_fingerprint: inspection.response_fingerprint,
          previous_fingerprint: inspection.previous_fingerprint,
          change_detected: inspection.change_detected,
          run_status: runStatus,
          checked_at: inspection.checked_at,
          stale_after: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });
      return response.json({ inspection, run_status: runStatus, records: rows });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'source_check_failed';
      await supabaseAdminRequest('/rest/v1/source_sync_runs', {
        method: 'POST',
        body: JSON.stringify({
          organization_id: organizationId,
          source_key: sourceKey,
          source_url: sourceUrl,
          source_kind: sourceKind,
          run_status: 'failed',
          checked_at: new Date().toISOString(),
          error_code: message.slice(0, 255),
        }),
      });
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'source_check_failed';
    return response.status(message.includes('required') || message.includes('not_allowed') ? 400 : 503).json({ error: message });
  }
});

export default router;
