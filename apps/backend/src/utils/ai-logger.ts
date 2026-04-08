import { Logger } from '@nestjs/common';

const logger = new Logger('AIEvent');

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
  logger.debug(`[${event.stage}] ${event.type}: ${event.reason ?? ''} ${JSON.stringify(event)}`);
}
