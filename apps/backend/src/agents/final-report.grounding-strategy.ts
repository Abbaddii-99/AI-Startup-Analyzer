import type { GroundingEffectiveness } from './final-report-grounding-effectiveness';

export interface GroundingQualitySignal {
  shouldGround: boolean;
  reason: string;
}

export interface GroundingStrategyInput {
  quality: GroundingQualitySignal;
  effectiveness?: GroundingEffectiveness;
}

export interface GroundingStrategyDecision {
  useRuleBased: boolean;
  useAIGrounding: boolean;
  reason: string;
}

function includesAny(text: string, patterns: string[]): boolean {
  const normalized = text.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

export function decideGroundingStrategy(
  input: GroundingStrategyInput,
): GroundingStrategyDecision {
  const reasonText = input.quality.reason ?? '';

  if (!input.quality.shouldGround) {
    return {
      useRuleBased: false,
      useAIGrounding: false,
      reason: 'Grounding not required by quality signal',
    };
  }

  if (includesAny(reasonText, ['low confidence', 'too many issues'])) {
    return {
      useRuleBased: false,
      useAIGrounding: true,
      reason: `AI grounding selected: ${reasonText}`,
    };
  }

  if (includesAny(reasonText, ['formatting', 'minor cleanup'])) {
    return {
      useRuleBased: true,
      useAIGrounding: false,
      reason: `Rule-based grounding selected: ${reasonText}`,
    };
  }

  return {
    useRuleBased: true,
    useAIGrounding: false,
    reason: `Defaulted to rule-based grounding: ${reasonText || 'no specific reason provided'}`,
  };
}
