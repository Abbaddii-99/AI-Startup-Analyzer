import type { ValidationSeverity } from '@ai-analyzer/shared';
import type { FinalReportProcessingResult } from './final-report-quality';

export interface GroundingEffectivenessInput {
  before: FinalReportProcessingResult;
  after: FinalReportProcessingResult;
}

export interface GroundingEffectiveness {
  confidenceDelta: number;
  issuesDelta: number;
  severityImproved: boolean;
}

function severityRank(severity: ValidationSeverity | null): number {
  if (severity === 'LOW') return 1;
  if (severity === 'MEDIUM') return 2;
  if (severity === 'HIGH') return 3;
  return 0;
}

export function trackGroundingEffectiveness(
  input: GroundingEffectivenessInput,
): GroundingEffectiveness {
  const confidenceDelta = input.after.confidence - input.before.confidence;
  const issuesDelta = input.before.issues.length - input.after.issues.length;
  const severityImproved =
    severityRank(input.after.highestSeverity) < severityRank(input.before.highestSeverity);

  return {
    confidenceDelta,
    issuesDelta,
    severityImproved,
  };
}
