import type { FinalReport } from '@ai-analyzer/shared';
import type { FinalReportAgentResult } from './final-report.agent';
import { adaptiveGroundingTrigger } from './final-report.adaptive-grounding';

function sampleReport(): FinalReport {
  return {
    ideaSummary: 'AI assistant for SMBs',
    problem: 'Teams lose time on repetitive tasks',
    targetMarket: 'Small and medium businesses',
    marketAnalysis: 'Growing automation demand',
    competitors: 'Several tools with limited localization',
    mvp: 'Task automation and reporting',
    monetization: 'Monthly subscription tiers',
    goToMarket: 'SEO and partner channels',
    risks: ['Customer churn', 'Execution delays'],
    verdict: 'Promising with focused execution',
    score: {
      marketDemand: 8,
      competition: 6,
      executionDifficulty: 7,
      profitPotential: 8,
      overall: 7.25,
    },
  };
}

function sampleResult(overrides: Partial<FinalReportAgentResult> = {}): FinalReportAgentResult {
  return {
    report: sampleReport(),
    quality: {
      shouldGround: false,
      reason: 'quality acceptable without grounding',
    },
    ...overrides,
  };
}

describe('adaptiveGroundingTrigger', () => {
  it('applies grounding when shouldGround=true', () => {
    const result = sampleResult({
      quality: {
        shouldGround: true,
        reason: 'confidence below threshold: 0.52 < 0.60',
      },
    });

    const adapted = adaptiveGroundingTrigger(result, {
      groundingFn: (report) => ({
        groundedReport: { ...report, verdict: `${report.verdict} (grounded)` },
        notes: 'grounded for demo',
      }),
    });

    expect(adapted.report.verdict).toContain('(grounded)');
    expect(adapted.grounded).toBeDefined();
    expect(adapted.grounded?.groundedReport.verdict).toContain('(grounded)');
    expect(adapted.quality.reason).toContain('confidence below threshold');
  });

  it('skips grounding when shouldGround=false', () => {
    const result = sampleResult();
    const adapted = adaptiveGroundingTrigger(result);

    expect(adapted.report).toEqual(result.report);
    expect(adapted.grounded).toBeUndefined();
    expect(adapted.quality.reason).toBe(result.quality.reason);
  });

  it('emits logging event with reason for both applied and skipped branches', () => {
    const events: Array<{ action: string; reason: string; attemptNumber: number; reportHash: string }> = [];

    adaptiveGroundingTrigger(
      sampleResult({
        quality: {
          shouldGround: false,
          reason: 'quality acceptable without grounding',
        },
      }),
      {
        attemptNumber: 3,
        onLog: (event) => events.push(event),
      },
    );

    adaptiveGroundingTrigger(
      sampleResult({
        quality: {
          shouldGround: true,
          reason: 'outcome is ACCEPT_WITH_WARNINGS',
        },
      }),
      {
        attemptNumber: 4,
        onLog: (event) => events.push(event),
      },
    );

    expect(events).toHaveLength(2);
    expect(events[0].action).toBe('skipped');
    expect(events[0].reason).toContain('quality acceptable');
    expect(events[0].attemptNumber).toBe(3);
    expect(events[0].reportHash).toHaveLength(64);

    expect(events[1].action).toBe('applied');
    expect(events[1].reason).toContain('ACCEPT_WITH_WARNINGS');
    expect(events[1].attemptNumber).toBe(4);
    expect(events[1].reportHash).toHaveLength(64);
  });
});
