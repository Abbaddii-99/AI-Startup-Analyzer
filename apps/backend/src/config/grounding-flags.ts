export const groundingFlags = {
  enableAIGrounding: process.env.ENABLE_AI_GROUNDING !== 'false',
  enableRuleGrounding: process.env.ENABLE_RULE_GROUNDING !== 'false',
};

export function isAIGroundingEnabled(): boolean {
  return groundingFlags.enableAIGrounding;
}

export function isRuleGroundingEnabled(): boolean {
  return groundingFlags.enableRuleGrounding;
}
