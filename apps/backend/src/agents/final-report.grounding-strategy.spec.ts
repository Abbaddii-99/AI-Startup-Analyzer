import { decideGroundingStrategy } from './final-report.grounding-strategy';

describe('decideGroundingStrategy', () => {
  it('returns both false when shouldGround=false', () => {
    const decision = decideGroundingStrategy({
      quality: {
        shouldGround: false,
        reason: 'confidence is acceptable',
      },
    });

    expect(decision.useRuleBased).toBe(false);
    expect(decision.useAIGrounding).toBe(false);
  });

  it('selects AI grounding when reason includes low confidence', () => {
    const decision = decideGroundingStrategy({
      quality: {
        shouldGround: true,
        reason: 'low confidence after normalization',
      },
    });

    expect(decision.useRuleBased).toBe(false);
    expect(decision.useAIGrounding).toBe(true);
  });

  it('selects AI grounding when reason includes too many issues', () => {
    const decision = decideGroundingStrategy({
      quality: {
        shouldGround: true,
        reason: 'too many issues detected in report',
      },
    });

    expect(decision.useRuleBased).toBe(false);
    expect(decision.useAIGrounding).toBe(true);
  });

  it('selects rule-based grounding when reason includes formatting/minor cleanup', () => {
    const formattingDecision = decideGroundingStrategy({
      quality: {
        shouldGround: true,
        reason: 'formatting inconsistencies in several fields',
      },
    });
    const cleanupDecision = decideGroundingStrategy({
      quality: {
        shouldGround: true,
        reason: 'minor cleanup is needed',
      },
    });

    expect(formattingDecision.useRuleBased).toBe(true);
    expect(formattingDecision.useAIGrounding).toBe(false);
    expect(cleanupDecision.useRuleBased).toBe(true);
    expect(cleanupDecision.useAIGrounding).toBe(false);
  });

  it('defaults to rule-based grounding for other reasons', () => {
    const decision = decideGroundingStrategy({
      quality: {
        shouldGround: true,
        reason: 'outcome is ACCEPT_WITH_WARNINGS',
      },
    });

    expect(decision.useRuleBased).toBe(true);
    expect(decision.useAIGrounding).toBe(false);
  });
});
