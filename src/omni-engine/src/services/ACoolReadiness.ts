export type ReadinessEvidence = {
  control_key: string;
  control_weight: number | string;
  status: 'pending' | 'passed' | 'failed' | 'expired' | 'revoked' | 'waived';
  observed_at?: string | null;
  expires_at?: string | null;
  evidence_reference?: string | null;
};

export type ReadinessControl = {
  key: string;
  label: string;
  weight: number;
  mandatory?: boolean;
};

export type ReadinessResult = {
  score: number;
  passed_weight: number;
  total_weight: number;
  mandatory_controls_passed: boolean;
  passed: string[];
  pending: string[];
  failed: string[];
  expired: string[];
};

const isCurrent = (evidence: ReadinessEvidence, now: Date) => {
  if (!evidence.expires_at) return true;
  const expiry = new Date(evidence.expires_at);
  return Number.isFinite(expiry.getTime()) && expiry.getTime() > now.getTime();
};

export const scoreReadiness = (
  controls: ReadinessControl[],
  evidence: ReadinessEvidence[],
  now = new Date(),
): ReadinessResult => {
  if (controls.length === 0) throw new Error('readiness_controls_required');
  const keys = new Set<string>();
  for (const control of controls) {
    if (!control.key.trim()) throw new Error('readiness_control_key_required');
    if (!Number.isFinite(control.weight) || control.weight <= 0) throw new Error('invalid_readiness_weight');
    if (keys.has(control.key)) throw new Error('duplicate_readiness_control');
    keys.add(control.key);
  }

  const evidenceByKey = new Map(evidence.map((item) => [item.control_key, item]));
  const passed: string[] = [];
  const pending: string[] = [];
  const failed: string[] = [];
  const expired: string[] = [];
  let passedWeight = 0;
  let mandatoryControlsPassed = true;

  for (const control of controls) {
    const item = evidenceByKey.get(control.key);
    const current = item ? isCurrent(item, now) : false;
    if (item?.status === 'passed' && current) {
      passed.push(control.key);
      passedWeight += control.weight;
      continue;
    }
    if (item?.status === 'failed' || item?.status === 'revoked') {
      failed.push(control.key);
    } else if (item?.status === 'expired' || (item?.status === 'passed' && !current)) {
      expired.push(control.key);
    } else {
      pending.push(control.key);
    }
    if (control.mandatory) mandatoryControlsPassed = false;
  }

  const totalWeight = controls.reduce((sum, control) => sum + control.weight, 0);
  return {
    score: Number(((passedWeight / totalWeight) * 100).toFixed(2)),
    passed_weight: Number(passedWeight.toFixed(2)),
    total_weight: Number(totalWeight.toFixed(2)),
    mandatory_controls_passed: mandatoryControlsPassed,
    passed,
    pending,
    failed,
    expired,
  };
};

export const GOOGLE_CLOUD_CONTROLS: ReadinessControl[] = [
  { key: 'project_billing', label: 'Dedicated project and billing', weight: 8, mandatory: true },
  { key: 'oidc_federation', label: 'GitHub OIDC federation', weight: 8, mandatory: true },
  { key: 'terraform_plan', label: 'Reviewed Terraform plan', weight: 8, mandatory: true },
  { key: 'terraform_apply', label: 'Successful development apply', weight: 10, mandatory: true },
  { key: 'immutable_image', label: 'Immutable container image', weight: 8, mandatory: true },
  { key: 'cloud_run_health', label: 'Cloud Run health evidence', weight: 12, mandatory: true },
  { key: 'secret_manager', label: 'Secret Manager configuration', weight: 8, mandatory: true },
  { key: 'least_privilege', label: 'Least-privilege IAM review', weight: 8, mandatory: true },
  { key: 'vision_acceptance', label: 'Vision endpoint acceptance', weight: 7 },
  { key: 'speech_acceptance', label: 'Speech endpoint acceptance', weight: 7 },
  { key: 'monitoring_alerting', label: 'Monitoring and alerting', weight: 6, mandatory: true },
  { key: 'budget_alerts', label: 'Budget and cost alerts', weight: 4 },
  { key: 'rollback', label: 'Rollback evidence', weight: 6, mandatory: true },
];

export const QUICKBOOKS_CONTROLS: ReadinessControl[] = [
  { key: 'intuit_app', label: 'Intuit developer application', weight: 7, mandatory: true },
  { key: 'sandbox_oauth', label: 'Sandbox OAuth connection', weight: 12, mandatory: true },
  { key: 'realm_stored', label: 'Realm ID stored', weight: 5, mandatory: true },
  { key: 'token_reference', label: 'Protected token reference', weight: 8, mandatory: true },
  { key: 'token_refresh', label: 'Refresh-token acceptance', weight: 10, mandatory: true },
  { key: 'invoice_acceptance', label: 'Invoice acceptance', weight: 10, mandatory: true },
  { key: 'payment_reconciliation', label: 'Payment and deposit reconciliation', weight: 10, mandatory: true },
  { key: 'refund_acceptance', label: 'Refund acceptance', weight: 7 },
  { key: 'fees_commissions', label: 'Fees and commissions acceptance', weight: 7 },
  { key: 'webhook_signature', label: 'Webhook signature verification', weight: 7, mandatory: true },
  { key: 'webhook_replay', label: 'Webhook replay protection', weight: 5, mandatory: true },
  { key: 'idempotency', label: 'Idempotent accounting writes', weight: 5, mandatory: true },
  { key: 'accountant_review', label: 'Accountant approval', weight: 4, mandatory: true },
  { key: 'ruth_review', label: 'Ruth Review approval', weight: 3, mandatory: true },
];

export const releaseDecision = (result: ReadinessResult, threshold = 90) => {
  if (!result.mandatory_controls_passed) return 'no_go' as const;
  if (result.score >= threshold) return 'go' as const;
  if (result.score >= threshold - 5) return 'conditional_go' as const;
  return 'no_go' as const;
};
