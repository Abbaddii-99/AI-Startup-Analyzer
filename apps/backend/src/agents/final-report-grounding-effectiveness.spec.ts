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
  it('1) confidence increased', () => {
    const before = result({ confidence: 0.55 });
    const after = result({ confidence: 0.73 });

    const metrics = trackGroundingEffectiveness({ before, after });
    expect(metrics.confidenceDelta).toBeCloseTo(0.18, 8);
  });

  it('2) issues reduced', () => {
    const before = result({ issues: [issue('a'), issue('b'), issue('c')] });
    const after = result({ issues: [issue('a')] });

    const metrics = trackGroundingEffectiveness({ before, after });
    expect(metrics.issuesDelta).toBe(2);
  });

  it('3) severity improved', () => {
    const before = result({ highestSeverity: 'HIGH' });
    const after = result({ highestSeverity: 'MEDIUM' });

    const metrics = trackGroundingEffectiveness({ before, after });
    expect(metrics.severityImproved).toBe(true);
  });

  it('4) no improvement', () => {
    const metrics = trackGroundingEffectiveness({
      before: result({ highestSeverity: 'MEDIUM' }),
      after: result({ highestSeverity: 'MEDIUM' }),
    });

    expect(metrics.confidenceDelta).toBe(0);
    expect(metrics.issuesDelta).toBe(0);
    expect(metrics.severityImproved).toBe(false);
  });

  it('5) regression (worse after grounding)', () => {
    const metrics = trackGroundingEffectiveness({
      before: result({ highestSeverity: 'LOW' }),
      after: result({
        highestSeverity: 'HIGH',
        confidence: 0.5,
        issues: [issue('a'), issue('b'), issue('c'), issue('d')],
      }),
    });

    expect(metrics.confidenceDelta).toBeLessThan(0);
    expect(metrics.issuesDelta).toBeLessThan(0);
    expect(metrics.severityImproved).toBe(false);
  });
});
