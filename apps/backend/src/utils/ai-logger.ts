export interface AIEvent {
  stage: 'decision' | 'grounding' | 'effectiveness' | string;
  type: 'applied' | 'skipped' | 'ai_used' | 'rule_used' | 'limit_reached' | string;
  reason?: string;
  confidenceBefore?: number;
  confidenceAfter?: number;
  issuesBefore?: number;
  issuesAfter?: number;
  severityBefore?: string;
  severityAfter?: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

export function logAIEvent(event: AIEvent): void {
  console.log(JSON.stringify(event));
}
