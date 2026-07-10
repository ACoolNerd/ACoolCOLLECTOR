import { createHash } from 'node:crypto';

export type ExperimentVariant = {
  key: string;
  weightBasisPoints: number;
};

export const assignExperimentVariant = (
  experimentKey: string,
  subjectId: string,
  variants: ExperimentVariant[],
) => {
  if (!experimentKey.trim() || !subjectId.trim()) throw new Error('experiment_identity_required');
  if (!variants.length) throw new Error('experiment_variants_required');
  const total = variants.reduce((sum, variant) => sum + variant.weightBasisPoints, 0);
  if (total !== 10000) throw new Error('variant_weights_must_total_10000');
  if (variants.some((variant) => variant.weightBasisPoints <= 0)) throw new Error('invalid_variant_weight');

  const assignmentHash = createHash('sha256')
    .update(`${experimentKey}|${subjectId}`, 'utf8')
    .digest('hex');
  const bucket = Number(BigInt(`0x${assignmentHash.slice(0, 12)}`) % 10000n);

  let cursor = 0;
  for (const variant of variants) {
    cursor += variant.weightBasisPoints;
    if (bucket < cursor) {
      return { variantKey: variant.key, bucket, assignmentHash };
    }
  }
  throw new Error('variant_assignment_failed');
};

export const validateExperimentEvent = (eventName: string, metadata: Record<string, unknown>) => {
  if (!/^[a-z][a-z0-9_.-]{1,79}$/.test(eventName)) throw new Error('invalid_experiment_event_name');
  const encoded = JSON.stringify(metadata);
  if (Buffer.byteLength(encoded, 'utf8') > 8192) throw new Error('experiment_metadata_too_large');

  const prohibitedKeys = ['email', 'phone', 'address', 'password', 'token', 'card_number', 'cvv'];
  const lowerKeys = Object.keys(metadata).map((key) => key.toLowerCase());
  const matched = prohibitedKeys.find((key) => lowerKeys.some((candidate) => candidate.includes(key)));
  if (matched) throw new Error(`prohibited_experiment_metadata:${matched}`);

  return { eventName, metadata, validated: true };
};
