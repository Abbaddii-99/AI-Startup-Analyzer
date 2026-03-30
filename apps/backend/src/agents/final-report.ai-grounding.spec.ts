import type { FinalReport } from '@ai-analyzer/shared';
import { enhanceFinalReportWithAI, type AIGroundingDependencies } from './final-report.ai-grounding';

function report(overrides: Partial<FinalReport> = {}): FinalReport {
  return {
    ideaSummary: 'AI SaaS assistant for local retail operations with workflow automation.',
    problem: 'Retail teams lose time due to manual inventory and customer follow-up processes.',
    targetMarket: 'Independent retail stores in MENA with 5-50 employees.',
    marketAnalysis: 'Demand is rising as SMBs seek practical automation with low setup complexity.',
    competitors: 'Various competitors',
    mvp: 'Automated task board with inventory alerts and CRM reminders.',
    monetization: 'Tiered subscription with optional onboarding package.',
    goToMarket: 'Partnerships with POS providers and targeted content marketing.',
    risks: ['Many risks'],
    verdict: 'Strong potential',
    score: {
      marketDemand: 8,
      competition: 6,
      executionDifficulty: 7,
      profitPotential: 8,
      overall: 7.25,
    },
    ...overrides,
  };
}

function depsWithResponse(payload: unknown): AIGroundingDependencies {
  return {
    generate: async () => JSON.stringify(payload),
    parseJSON: <T>(text: string) => JSON.parse(text) as T,
  };
}

describe('enhanceFinalReportWithAI', () => {
  it('improves weak sections only and preserves valid fields', async () => {
    const input = report();
    const result = await enhanceFinalReportWithAI(
      input,
      depsWithResponse({
        updates: {
          competitors: 'Primary competitors are no-code automation suites focused on generic workflows; this idea can differentiate through retail-specific templates and localized onboarding.',
          risks: [
            'Dependency on POS integrations may delay rollout in some markets.',
            'Customer onboarding complexity could increase churn if not simplified.',
          ],
          problem: 'THIS SHOULD NOT APPLY',
        },
        notes: 'Improved competitors and risks only.',
      }),
    );

    expect(result.groundedReport.competitors).toContain('Primary competitors are no-code automation suites');
    expect(result.groundedReport.risks).toHaveLength(2);
    expect(result.groundedReport.problem).toBe(input.problem);
    expect(result.groundedReport.marketAnalysis).toBe(input.marketAnalysis);
    expect(result.notes).toContain('competitors, risks');
  });

  it('returns unchanged report when no weak sections are detected', async () => {
    const strong = report({
      competitors: 'Competitors include vertical CRM providers and retail analytics tools with clear strengths and pricing tiers.',
      risks: [
        'Integration maintenance overhead can reduce engineering velocity in early phases.',
        'SMB budget sensitivity may slow expansion unless ROI is clearly demonstrated.',
      ],
      verdict: 'The opportunity is promising if execution remains focused on measurable retailer outcomes.',
    });

    const deps: AIGroundingDependencies = {
      generate: async () => {
        throw new Error('generate should not be called');
      },
      parseJSON: <T>(_text: string) => ({} as T),
    };

    const result = await enhanceFinalReportWithAI(strong, deps);
    expect(result.groundedReport).toEqual(strong);
    expect(result.notes).toContain('No weak sections detected');
  });

  it('ignores invalid or empty AI updates and keeps original values', async () => {
    const input = report();
    const result = await enhanceFinalReportWithAI(
      input,
      depsWithResponse({
        updates: {
          competitors: '   ',
          risks: ['', '   '],
        },
        notes: 'No valid updates',
      }),
    );

    expect(result.groundedReport.competitors).toBe(input.competitors);
    expect(result.groundedReport.risks).toEqual(input.risks);
    expect(result.notes).toContain('no applicable field updates');
  });
});
