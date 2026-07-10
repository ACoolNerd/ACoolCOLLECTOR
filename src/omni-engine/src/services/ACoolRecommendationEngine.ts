export type RankedRecommendation = {
  id: string;
  rank: number;
  score: number;
  estimatedCostCents: number;
  confidence: number;
  explanation: string[];
  riskFlags: string[];
};

export type CollectionGapCandidate = {
  id: string;
  name: string;
  missingQuantity: number;
  priority: number;
  completionImpact: number;
  marketPriceCents: number;
  priceConfidence: number;
  liquidity: number;
  conditionConfidence: number;
};

export type DeckGapCandidate = {
  id: string;
  name: string;
  requiredQuantity: number;
  ownedQuantity: number;
  marketPriceCents: number;
  metaImportance: number;
  substitutionFlexibility: number;
  priceConfidence: number;
};

export type GradeOutcome = {
  label: string;
  probability: number;
  expectedValueCents: number;
};

export type BargainGradeInput = {
  id: string;
  purchasePriceCents: number;
  gradingFeeCents: number;
  shippingAndInsuranceCents: number;
  sellingFeeRate: number;
  rawResaleValueCents: number;
  outcomes: GradeOutcome[];
  identityConfidence: number;
  conditionConfidence: number;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const clamp100 = (value: number) => Math.max(0, Math.min(100, value));
const safeMoney = (value: number) => Math.max(0, Math.round(value));

const normalizePriority = (priority: number) => clamp01((priority - 1) / 4);
const affordability = (priceCents: number, budgetCents: number) => {
  if (budgetCents <= 0) return 0;
  return clamp01(1 - priceCents / budgetCents);
};

export const recommendCollectionGaps = (
  candidates: CollectionGapCandidate[],
  budgetCents: number,
): RankedRecommendation[] => {
  const ranked = candidates
    .filter((candidate) => candidate.missingQuantity > 0 && candidate.marketPriceCents >= 0)
    .map((candidate) => {
      const cost = safeMoney(candidate.marketPriceCents * candidate.missingQuantity);
      const confidence = clamp100(
        (clamp01(candidate.priceConfidence) * 0.65 + clamp01(candidate.conditionConfidence) * 0.35) * 100,
      );
      const score =
        normalizePriority(candidate.priority) * 35 +
        clamp01(candidate.completionImpact) * 30 +
        affordability(cost, budgetCents) * 20 +
        clamp01(candidate.liquidity) * 10 +
        (confidence / 100) * 5;

      const riskFlags: string[] = [];
      if (cost > budgetCents) riskFlags.push('over_budget');
      if (candidate.priceConfidence < 0.6) riskFlags.push('low_price_confidence');
      if (candidate.conditionConfidence < 0.6) riskFlags.push('condition_review_required');

      return {
        id: candidate.id,
        rank: 0,
        score: Number(score.toFixed(4)),
        estimatedCostCents: cost,
        confidence: Number(confidence.toFixed(2)),
        explanation: [
          `${candidate.missingQuantity} missing copy or copies`,
          `${Math.round(clamp01(candidate.completionImpact) * 100)}% completion impact`,
          `priority ${candidate.priority} of 5`,
        ],
        riskFlags,
      };
    })
    .sort((a, b) => b.score - a.score || a.estimatedCostCents - b.estimatedCostCents);

  return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
};

export const recommendDeckGaps = (
  candidates: DeckGapCandidate[],
  budgetCents: number,
): RankedRecommendation[] => {
  const ranked = candidates
    .map((candidate) => ({
      ...candidate,
      missingQuantity: Math.max(0, candidate.requiredQuantity - candidate.ownedQuantity),
    }))
    .filter((candidate) => candidate.missingQuantity > 0)
    .map((candidate) => {
      const cost = safeMoney(candidate.marketPriceCents * candidate.missingQuantity);
      const confidence = clamp100(clamp01(candidate.priceConfidence) * 100);
      const score =
        clamp01(candidate.metaImportance) * 45 +
        affordability(cost, budgetCents) * 25 +
        clamp01(candidate.substitutionFlexibility) * -10 +
        (confidence / 100) * 20 +
        Math.min(candidate.missingQuantity, 4) * 5;

      const riskFlags: string[] = [];
      if (cost > budgetCents) riskFlags.push('over_budget');
      if (candidate.priceConfidence < 0.6) riskFlags.push('low_price_confidence');
      if (candidate.substitutionFlexibility >= 0.7) riskFlags.push('lower_cost_substitute_possible');

      return {
        id: candidate.id,
        rank: 0,
        score: Number(score.toFixed(4)),
        estimatedCostCents: cost,
        confidence: Number(confidence.toFixed(2)),
        explanation: [
          `${candidate.missingQuantity} copies needed`,
          `${Math.round(clamp01(candidate.metaImportance) * 100)}% deck importance`,
          candidate.substitutionFlexibility >= 0.7 ? 'substitutes may exist' : 'limited substitution options',
        ],
        riskFlags,
      };
    })
    .sort((a, b) => b.score - a.score || a.estimatedCostCents - b.estimatedCostCents);

  return ranked.map((item, index) => ({ ...item, rank: index + 1 }));
};

export const evaluateBargainGrading = (input: BargainGradeInput) => {
  const probabilityTotal = input.outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
  if (Math.abs(probabilityTotal - 1) > 0.001) {
    throw new Error('grade_probabilities_must_sum_to_one');
  }
  if (input.sellingFeeRate < 0 || input.sellingFeeRate >= 1) {
    throw new Error('invalid_selling_fee_rate');
  }

  const grossExpectedValue = input.outcomes.reduce(
    (sum, outcome) => sum + clamp01(outcome.probability) * safeMoney(outcome.expectedValueCents),
    0,
  );
  const afterSaleFees = grossExpectedValue * (1 - input.sellingFeeRate);
  const totalInvested =
    safeMoney(input.purchasePriceCents) +
    safeMoney(input.gradingFeeCents) +
    safeMoney(input.shippingAndInsuranceCents);
  const expectedProfitCents = Math.round(afterSaleFees - totalInvested);
  const rawProfitCents = Math.round(
    safeMoney(input.rawResaleValueCents) * (1 - input.sellingFeeRate) - safeMoney(input.purchasePriceCents),
  );
  const confidence = clamp100(
    (clamp01(input.identityConfidence) * 0.45 + clamp01(input.conditionConfidence) * 0.55) * 100,
  );

  const riskFlags: string[] = [];
  if (input.identityConfidence < 0.8) riskFlags.push('identity_not_verified');
  if (input.conditionConfidence < 0.7) riskFlags.push('condition_uncertain');
  if (expectedProfitCents <= 0) riskFlags.push('negative_expected_value');
  if (totalInvested > grossExpectedValue) riskFlags.push('cost_exceeds_gross_expected_value');

  let recommendation: 'grade_candidate' | 'buy_raw' | 'pass' | 'manual_review' = 'manual_review';
  if (confidence < 70) recommendation = 'manual_review';
  else if (expectedProfitCents >= Math.max(2000, totalInvested * 0.25)) recommendation = 'grade_candidate';
  else if (rawProfitCents >= 500) recommendation = 'buy_raw';
  else recommendation = 'pass';

  return {
    id: input.id,
    recommendation,
    expectedGrossValueCents: Math.round(grossExpectedValue),
    totalInvestedCents: totalInvested,
    expectedProfitCents,
    rawProfitCents,
    confidence: Number(confidence.toFixed(2)),
    riskFlags,
    disclaimer: 'Scenario only. An AI estimate is not a grading-company result or guaranteed resale value.',
  };
};

export const calculateSavingsPlan = (
  targetCents: number,
  currentCents: number,
  targetDate: string,
  asOfDate = new Date(),
) => {
  const target = safeMoney(targetCents);
  const current = safeMoney(currentCents);
  const remainingCents = Math.max(0, target - current);
  const deadline = new Date(`${targetDate}T23:59:59.999Z`);
  if (Number.isNaN(deadline.getTime())) throw new Error('invalid_target_date');
  const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - asOfDate.getTime()) / 86_400_000));
  const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30.4375));

  return {
    targetCents: target,
    currentCents: current,
    remainingCents,
    daysRemaining,
    weeklyContributionCents: Math.ceil(remainingCents / weeksRemaining),
    monthlyContributionCents: Math.ceil(remainingCents / monthsRemaining),
    status: remainingCents === 0 ? 'funded' : daysRemaining === 0 ? 'past_due' : 'saving',
  };
};
