import type { ValidationIssue } from '@ai-analyzer/shared';
import { evaluateFinalReportQuality, type FinalReportProcessingResult } from './final-report-quality';

function issue(path: string, code = 'X', severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'): ValidationIssue {
  return { path, code, severity, message: `${path}:${code}` };
}

function baseResult(overrides: Partial<FinalReportProcessingResult> = {}): FinalReportProcessingResult {
  return {
    confidence: 0.9,
    highestSeverity: 'LOW',
    issues: [],
    outcome: 'ACCEPT_CLEAN',
    ...overrides,
  };
}

describe('evaluateFinalReportQuality', () => {
  it('returns shouldGround=true when confidence < 0.6', () => {
    const decision = evaluateFinalReportQuality(baseResult({ confidence: 0.59 }));
    expect(decision.shouldGround).toBe(true);
    expect(decision.reason).toContain('confidence below threshold');
  });

  it('returns shouldGround=false when confidence = 0.6 exactly (boundary)', () => {
    const decision = evaluateFinalReportQuality(baseResult({ confidence: 0.6 }));
    expect(decision.shouldGround).toBe(false);
  });

  it('returns shouldGround=true when highestSeverity=MEDIUM and issues.length > 3', () => {
    const decision = evaluateFinalReportQuality(
      baseResult({
        confidence: 0.95,
        highestSeverity: 'MEDIUM',
        issues: [issue('a'), issue('b'), issue('c'), issue('d')],
      }),
    );
    expect(decision.shouldGround).toBe(true);
    expect(decision.reason).toContain('severity MEDIUM');
  });

  it('returns shouldGround=true when outcome=ACCEPT_WITH_WARNINGS', () => {
    const decision = evaluateFinalReportQuality(baseResult({ outcome: 'ACCEPT_WITH_WARNINGS' }));
    expect(decision.shouldGround).toBe(true);
    expect(decision.reason).toContain('ACCEPT_WITH_WARNINGS');
  });

  it('returns shouldGround=false when no grounding rule matches', () => {
    const decision = evaluateFinalReportQuality(baseResult());
    expect(decision.shouldGround).toBe(false);
    expect(decision.reason).toContain('quality acceptable');
  });
});
