import type { ValidationIssue } from '@ai-analyzer/shared';
import type { FinalReportProcessingResult } from './final-report-quality';
import { trackGroundingEffectiveness } from './final-report-grounding-effectiveness';

function issue(path: string, code = 'X', severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'): ValidationIssue {
  return { path, code, severity, message: `${path}:${code}` };
}

function result(overrides: Partial<FinalReportProcessingResult> = {}): FinalReportProcessingResult {
  return {
    confidence: 0.8,
    highestSeverity: 'MEDIUM',
    issues: [issue('a'), issue('b')],
    outcome: 'ACCEPT_WITH_WARNINGS',
    ...overrides,
  };
}

describe('trackGroundingEffectiveness', () => {
  it('computes confidenceDelta and issuesDelta using the required formulas', () => {
    const before = result({ confidence: 0.55, issues: [issue('a'), issue('b'), issue('c')] });
    const after = result({ confidence: 0.73, issues: [issue('a')] });

    const metrics = trackGroundingEffectiveness({ before, after });

    expect(metrics.confidenceDelta).toBeCloseTo(0.18, 8);
    expect(metrics.issuesDelta).toBe(2);
  });

  it('returns severityImproved=true when after severity is lower than before', () => {
    const before = result({ highestSeverity: 'HIGH' });
    const after = result({ highestSeverity: 'MEDIUM' });

    const metrics = trackGroundingEffectiveness({ before, after });
    expect(metrics.severityImproved).toBe(true);
  });

  it('returns severityImproved=false when severity is unchanged or worse', () => {
    const unchanged = trackGroundingEffectiveness({
      before: result({ highestSeverity: 'MEDIUM' }),
      after: result({ highestSeverity: 'MEDIUM' }),
    });
    const worse = trackGroundingEffectiveness({
      before: result({ highestSeverity: 'LOW' }),
      after: result({ highestSeverity: 'HIGH' }),
    });

    expect(unchanged.severityImproved).toBe(false);
    expect(worse.severityImproved).toBe(false);
  });
});
