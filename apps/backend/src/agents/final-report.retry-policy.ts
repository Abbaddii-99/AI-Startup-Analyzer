import type { FinalReportAttemptRecord, ValidationSeverity } from '@ai-analyzer/shared';

const SEVERITY_RANK: Record<ValidationSeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export interface RetryDecisionInput {
  highestSeverity: ValidationSeverity | null;
  confidence: number;
  retriesLeft: number;
  repairable: boolean;
  repeatedSignature: boolean;
  degradingConfidence: boolean;
  minConfidenceForMediumRetry: number;
}

export function shouldRetryFinalReportAttempt(input: RetryDecisionInput): boolean {
  const retryableSeverity = input.highestSeverity === 'MEDIUM' || input.highestSeverity === 'HIGH';
  if (!retryableSeverity) return false;
  if (input.highestSeverity === 'MEDIUM' && input.confidence < input.minConfidenceForMediumRetry) return false;
  if (!input.repairable) return false;
  if (input.retriesLeft <= 0) return false;
  if (input.repeatedSignature) return false;
  if (input.degradingConfidence) return false;
  return true;
}

function attemptSeverityRank(attempt: FinalReportAttemptRecord): number {
  const severity = attempt.validation.highestSeverity;
  if (severity === null) return SEVERITY_RANK.LOW;
  return SEVERITY_RANK[severity];
}

export function compareFinalReportAttempts(
  a: FinalReportAttemptRecord,
  b: FinalReportAttemptRecord,
): number {
  const bySeverity = attemptSeverityRank(a) - attemptSeverityRank(b);
  if (bySeverity !== 0) return bySeverity;
  if (a.confidence !== b.confidence) return b.confidence - a.confidence;
  if (a.validation.issues.length !== b.validation.issues.length) {
    return a.validation.issues.length - b.validation.issues.length;
  }
  return a.attempt - b.attempt;
}
