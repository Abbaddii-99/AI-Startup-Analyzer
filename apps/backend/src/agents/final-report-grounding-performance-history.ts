import type { GroundingEffectiveness } from './final-report-grounding-effectiveness';

export interface GroundingPerformanceHistoryDecision {
  shouldDisableAIGrounding: boolean;
  reason: string;
}

export function evaluateGroundingPerformanceHistory(
  history: GroundingEffectiveness[],
): GroundingPerformanceHistoryDecision {
  if (history.length === 0) {
    return {
      shouldDisableAIGrounding: false,
      reason: 'No history available; keep AI grounding enabled',
    };
  }

  const averageConfidenceDelta =
    history.reduce((sum, item) => sum + item.confidenceDelta, 0) / history.length;
  if (averageConfidenceDelta < 0) {
    return {
      shouldDisableAIGrounding: true,
      reason: `Average confidenceDelta is negative: ${averageConfidenceDelta.toFixed(2)}`,
    };
  }

  const tail = history.slice(-3);
  const noSeverityImprovementForThreeRuns =
    tail.length === 3 && tail.every((item) => item.severityImproved === false);
  if (noSeverityImprovementForThreeRuns) {
    return {
      shouldDisableAIGrounding: true,
      reason: 'severityImproved=false for 3 consecutive runs',
    };
  }

  return {
    shouldDisableAIGrounding: false,
    reason: 'AI grounding performance is acceptable',
  };
}
