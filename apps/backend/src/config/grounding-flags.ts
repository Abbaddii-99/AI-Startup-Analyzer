export const groundingFlags = {
  enableAIGrounding: true,
  enableRuleGrounding: true,
};

export function isAIGroundingEnabled(): boolean {
  return groundingFlags.enableAIGrounding;
}

export function isRuleGroundingEnabled(): boolean {
  return groundingFlags.enableRuleGrounding;
}
