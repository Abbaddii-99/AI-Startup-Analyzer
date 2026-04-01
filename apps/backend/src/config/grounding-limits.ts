export const groundingLimits = {
  maxAIGroundingCallsPerRequest: 1,
};

export function canRunAIGrounding(currentCount: number): boolean {
  return currentCount < groundingLimits.maxAIGroundingCallsPerRequest;
}
