import type { GroundingEffectiveness } from './final-report-grounding-effectiveness';
import { evaluateGroundingPerformanceHistory } from './final-report-grounding-performance-history';

function eff(overrides: Partial<GroundingEffectiveness> = {}): GroundingEffectiveness {
  return {
    confidenceDelta: 0.1,
    issuesDelta: 1,
    severityImproved: true,
    ...overrides,
  };
}

describe('evaluateGroundingPerformanceHistory', () => {
  it('disables AI grounding when average confidenceDelta < 0', () => {
    const history = [
      eff({ confidenceDelta: -0.2 }),
      eff({ confidenceDelta: -0.1 }),
      eff({ confidenceDelta: 0.05 }),
    ];

    const decision = evaluateGroundingPerformanceHistory(history);
    expect(decision.shouldDisableAIGrounding).toBe(true);
    expect(decision.reason).toContain('Average confidenceDelta is negative');
  });

  it('disables AI grounding when severityImproved=false for 3 consecutive runs', () => {
    const history = [
      eff({ severityImproved: true }),
      eff({ severityImproved: false }),
      eff({ severityImproved: false }),
      eff({ severityImproved: false }),
    ];

    const decision = evaluateGroundingPerformanceHistory(history);
    expect(decision.shouldDisableAIGrounding).toBe(true);
    expect(decision.reason).toContain('3 consecutive runs');
  });

  it('keeps AI grounding enabled otherwise', () => {
    const history = [
      eff({ confidenceDelta: 0.05, severityImproved: false }),
      eff({ confidenceDelta: 0.04, severityImproved: true }),
      eff({ confidenceDelta: 0.03, severityImproved: false }),
    ];

    const decision = evaluateGroundingPerformanceHistory(history);
    expect(decision.shouldDisableAIGrounding).toBe(false);
  });
});
