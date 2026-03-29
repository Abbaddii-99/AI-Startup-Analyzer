import type { FinalReportAttemptRecord, ValidationIssue, ValidationSeverity } from '@ai-analyzer/shared';
import { compareFinalReportAttempts, shouldRetryFinalReportAttempt } from './final-report.retry-policy';

function makeIssue(code: string, path: string, severity: ValidationSeverity): ValidationIssue {
  return { code, path, severity, message: `${path} ${code}` };
}

function makeAttempt(params: {
  attempt: number;
  severity: ValidationSeverity | null;
  confidence: number;
  issues?: ValidationIssue[];
}): FinalReportAttemptRecord {
  const issues = params.issues ?? [];
  return {
    attempt: params.attempt,
    confidence: params.confidence,
    issueSignature: `sig-${params.attempt}`,
    normalizationReport: {
      coercions: [],
      defaultsApplied: [],
      droppedValues: [],
      warnings: [],
      sourceQuality: 'good',
    },
    validation: {
      ok: true,
      highestSeverity: params.severity,
      issues,
      data: {
        ideaSummary: 'x',
        problem: 'x',
        targetMarket: 'x',
        marketAnalysis: 'x',
        competitors: 'x',
        mvp: 'x',
        monetization: 'x',
        goToMarket: 'x',
        risks: ['x'],
        verdict: 'x',
        score: {
          marketDemand: 7,
          competition: 7,
          executionDifficulty: 7,
          profitPotential: 7,
          overall: 7,
        },
      },
    },
  };
}

describe('FinalReport retry decision policy', () => {
  const base = {
    retriesLeft: 2,
    repairable: true,
    repeatedSignature: false,
    degradingConfidence: false,
    minConfidenceForMediumRetry: 0.45,
  };

  it('LOW severity -> no retry', () => {
    const decision = shouldRetryFinalReportAttempt({
      ...base,
      highestSeverity: 'LOW',
      confidence: 0.9,
    });
    expect(decision).toBe(false);
  });

  it('MEDIUM + confidence < 0.45 -> no retry', () => {
    const decision = shouldRetryFinalReportAttempt({
      ...base,
      highestSeverity: 'MEDIUM',
      confidence: 0.44,
    });
    expect(decision).toBe(false);
  });

  it('MEDIUM + confidence >= 0.45 -> retry', () => {
    const decision = shouldRetryFinalReportAttempt({
      ...base,
      highestSeverity: 'MEDIUM',
      confidence: 0.45,
    });
    expect(decision).toBe(true);
  });

  it('MEDIUM + confidence = 0.45 exactly -> retry (boundary)', () => {
    const decision = shouldRetryFinalReportAttempt({
      ...base,
      highestSeverity: 'MEDIUM',
      confidence: 0.45,
    });
    expect(decision).toBe(true);
  });

  it('HIGH + repairable -> retry', () => {
    const decision = shouldRetryFinalReportAttempt({
      ...base,
      highestSeverity: 'HIGH',
      confidence: 0.3,
    });
    expect(decision).toBe(true);
  });

  it('HIGH + non-repairable -> no retry', () => {
    const decision = shouldRetryFinalReportAttempt({
      ...base,
      highestSeverity: 'HIGH',
      confidence: 0.8,
      repairable: false,
    });
    expect(decision).toBe(false);
  });

  it('HIGH + repeated issue signature -> stop retry', () => {
    const decision = shouldRetryFinalReportAttempt({
      ...base,
      highestSeverity: 'HIGH',
      confidence: 0.7,
      repeatedSignature: true,
    });
    expect(decision).toBe(false);
  });

  it('confidence drop > 0.2 -> stop retry', () => {
    const decision = shouldRetryFinalReportAttempt({
      ...base,
      highestSeverity: 'HIGH',
      confidence: 0.7,
      degradingConfidence: true,
    });
    expect(decision).toBe(false);
  });
});

describe('FinalReport best-result selection comparator', () => {
  it('prefers lower severity', () => {
    const low = makeAttempt({ attempt: 1, severity: 'LOW', confidence: 0.5 });
    const medium = makeAttempt({ attempt: 2, severity: 'MEDIUM', confidence: 0.9 });
    const sorted = [medium, low].sort(compareFinalReportAttempts);
    expect(sorted[0]).toBe(low);
  });

  it('then higher confidence', () => {
    const a = makeAttempt({ attempt: 1, severity: 'MEDIUM', confidence: 0.7 });
    const b = makeAttempt({ attempt: 2, severity: 'MEDIUM', confidence: 0.8 });
    const sorted = [a, b].sort(compareFinalReportAttempts);
    expect(sorted[0]).toBe(b);
  });

  it('then fewer issues', () => {
    const oneIssue = makeAttempt({
      attempt: 1,
      severity: 'MEDIUM',
      confidence: 0.8,
      issues: [makeIssue('DEFAULTED_TEXT_FIELD', 'problem', 'MEDIUM')],
    });
    const twoIssues = makeAttempt({
      attempt: 2,
      severity: 'MEDIUM',
      confidence: 0.8,
      issues: [
        makeIssue('DEFAULTED_TEXT_FIELD', 'problem', 'MEDIUM'),
        makeIssue('DEFAULTED_RISKS', 'risks', 'MEDIUM'),
      ],
    });
    const sorted = [twoIssues, oneIssue].sort(compareFinalReportAttempts);
    expect(sorted[0]).toBe(oneIssue);
  });

  it('then earlier attempt', () => {
    const first = makeAttempt({ attempt: 1, severity: 'MEDIUM', confidence: 0.8 });
    const second = makeAttempt({ attempt: 2, severity: 'MEDIUM', confidence: 0.8 });
    const sorted = [second, first].sort(compareFinalReportAttempts);
    expect(sorted[0]).toBe(first);
  });

  it('same severity + same confidence + same issues count -> earlier attempt wins', () => {
    const aIssues = [makeIssue('DEFAULTED_TEXT_FIELD', 'problem', 'MEDIUM')];
    const bIssues = [makeIssue('DEFAULTED_RISKS', 'risks', 'MEDIUM')];
    const first = makeAttempt({
      attempt: 1,
      severity: 'MEDIUM',
      confidence: 0.81,
      issues: aIssues,
    });
    const second = makeAttempt({
      attempt: 2,
      severity: 'MEDIUM',
      confidence: 0.81,
      issues: bIssues,
    });
    const sorted = [second, first].sort(compareFinalReportAttempts);
    expect(sorted[0]).toBe(first);
  });
});
