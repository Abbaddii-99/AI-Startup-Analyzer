import type { ValidationIssue, ValidationSeverity } from '@ai-analyzer/shared';

export type FinalReportOutcome =
  | 'ACCEPT_CLEAN'
  | 'ACCEPT_WITH_WARNINGS'
  | 'FAILED_AFTER_RETRIES';

export interface FinalReportProcessingResult {
  confidence: number;
  highestSeverity: ValidationSeverity | null;
  issues: ValidationIssue[];
  outcome: FinalReportOutcome;
}

export interface FinalReportQualityDecision {
  shouldGround: boolean;
  reason: string;
}

export function evaluateFinalReportQuality(
  result: FinalReportProcessingResult,
): FinalReportQualityDecision {
  if (result.confidence < 0.6) {
    return {
      shouldGround: true,
      reason: `confidence below threshold: ${result.confidence.toFixed(2)} < 0.60`,
    };
  }

  if (result.highestSeverity === 'MEDIUM' && result.issues.length > 3) {
    return {
      shouldGround: true,
      reason: `severity MEDIUM with high issue count: ${result.issues.length}`,
    };
  }

  if (result.outcome === 'ACCEPT_WITH_WARNINGS') {
    return {
      shouldGround: true,
      reason: 'outcome is ACCEPT_WITH_WARNINGS',
    };
  }

  return {
    shouldGround: false,
    reason: 'quality acceptable without grounding',
  };
}
