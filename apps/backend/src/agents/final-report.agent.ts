import { Injectable, Logger } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  FinalReport,
  type FinalReportAttemptRecord,
  type ValidationIssue,
  computeNormalizationConfidence,
  normalizeFinalReport,
  validateFinalReportDetailed,
  wrapUserInput,
} from '@ai-analyzer/shared';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';
import { compareFinalReportAttempts, shouldRetryFinalReportAttempt } from './final-report.retry-policy';
import { evaluateFinalReportQuality, type FinalReportOutcome } from './final-report-quality';

export interface FinalReportAgentResult {
  report: FinalReport;
  quality: {
    shouldGround: boolean;
    reason: string;
  };
}

@Injectable()
export class FinalReportAgent implements Agent<FinalReportAgentResult> {
  private readonly logger = new Logger(FinalReportAgent.name);
  private readonly maxRetries = 2;
  private readonly significantConfidenceDrop = 0.2;
  private readonly minConfidenceForMediumRetry = 0.45;
  constructor(private ai: AIService) {}

  private isRepairable(issues: ValidationIssue[]): boolean {
    return issues.length > 0;
  }

  private expectedForIssue(issue: ValidationIssue): string {
    if (issue.code === 'INVALID_SCORE') return 'number between 0 and 10';
    if (issue.code === 'INVALID_RISKS') return 'non-empty array of strings';
    if (issue.code === 'INVALID_RISK_ITEM') return 'array items must be non-empty strings';
    if (issue.code === 'INVALID_TEXT_FIELD') return 'non-empty string';
    if (issue.code === 'DEFAULTED_TEXT_FIELD') return 'meaningful non-empty string (not fallback)';
    if (issue.code === 'DEFAULTED_RISKS') return 'real risk items array (not fallback)';
    return 'valid value according to FinalReport schema';
  }

  private createTargetedRepairPrompt(normalizedJson: unknown, issues: ValidationIssue[]): string {
    const currentJson = JSON.stringify(normalizedJson ?? {}, null, 2);
    const repairLines = issues.map((issue, index) => [
      `${index + 1}. Fix field: ${issue.path}`,
      `   Expected: ${this.expectedForIssue(issue)}`,
      `   Current issue: ${issue.message} [${issue.code}]`,
    ].join('\n'));
    const repairInstructions = repairLines.length > 0 ? repairLines.join('\n\n') : 'No issues detected.';

    return [
      'CURRENT_JSON',
      currentJson,
      '',
      'REPAIR_INSTRUCTIONS',
      repairInstructions,
      '',
      'CONSTRAINTS',
      '- Modify ONLY fields listed in REPAIR_INSTRUCTIONS.',
      '- Do NOT modify any valid field not listed in REPAIR_INSTRUCTIONS.',
      '- Output STRICT JSON only (no markdown, no explanation, no extra text).',
      '- If you cannot fully fix all issues, still return valid JSON with the best possible corrections.',
      '- Keep the same FinalReport schema keys.',
      '- Ensure all score fields are numeric and within 0..10.',
      '- Ensure risks is a non-empty array of strings.',
    ].join('\n');
  }

  private buildIssueSignature(issues: ValidationIssue[]): string {
    if (!issues.length) return 'OK';
    const payload = issues
      .map((issue) => `${issue.code}|${issue.path}`)
      .sort()
      .join('||');
    return createHash('sha256').update(payload).digest('hex');
  }

  private summarizeAttempt(attempt: FinalReportAttemptRecord): string {
    const severity = attempt.validation.highestSeverity ?? 'NONE';
    const issues = attempt.validation.issues.length;
    return `attempt=${attempt.attempt} confidence=${attempt.confidence.toFixed(2)} severity=${severity} issues=${issues} sig=${attempt.issueSignature.slice(0, 12)}`;
  }

  private logAttempt(attempt: FinalReportAttemptRecord): void {
    const summary = this.summarizeAttempt(attempt);
    if (!attempt.validation.ok) {
      this.logger.warn(`FinalReport attempt summary: ${summary}`);
      return;
    }
    if (attempt.validation.issues.length > 0) {
      this.logger.log(`FinalReport attempt summary: ${summary}`);
      return;
    }
    this.logger.debug(`FinalReport attempt summary: ${summary}`);
  }

  async execute(idea: string, context: any): Promise<FinalReportAgentResult> {
    const prompt = `You are a venture capital startup analyst. Respond in the same language as the startup idea.

Combine the following analyses into a professional startup report.

Sections:

1. Idea Summary
2. Problem
3. Target Market
4. Market Analysis
5. Competitors
6. MVP
7. Monetization
8. Go To Market
9. Risks
10. Final Verdict
11. Score (marketDemand, competition, executionDifficulty, profitPotential, overall out of 10)

Data:

Idea: ${wrapUserInput(idea)}

Idea Analysis: ${JSON.stringify(context.ideaAnalysis)}

Market Research: ${JSON.stringify(context.marketResearch)}

Competitors: ${JSON.stringify(context.competitorAnalysis)}

MVP: ${JSON.stringify(context.mvpPlan)}

Monetization: ${JSON.stringify(context.monetization)}

Go-To-Market: ${JSON.stringify(context.goToMarket)}

Return JSON format:
{
  "ideaSummary": "...",
  "problem": "...",
  "targetMarket": "...",
  "marketAnalysis": "...",
  "competitors": "...",
  "mvp": "...",
  "monetization": "...",
  "goToMarket": "...",
  "risks": ["..."],
  "verdict": "...",
  "score": {
    "marketDemand": 8,
    "competition": 6,
    "executionDifficulty": 7,
    "profitPotential": 9,
    "overall": 7.5
  }
}`;

    const attemptHistory: FinalReportAttemptRecord[] = [];
    let attemptPrompt = prompt;
    let previousSignature: string | null = null;
    let previousConfidence: number | null = null;

    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      const response = await this.ai.generate(attemptPrompt);
      const parsed = this.ai.parseJSON<unknown>(response);
      const normalized = normalizeFinalReport(parsed);
      const validation = validateFinalReportDetailed(normalized.draft);
      const confidence = computeNormalizationConfidence(normalized.report);
      const issueSignature = this.buildIssueSignature(validation.issues);

      const attemptRecord: FinalReportAttemptRecord = {
        attempt,
        normalizationReport: normalized.report,
        confidence,
        issueSignature,
        validation,
        repairPrompt: validation.issues.length > 0
          ? this.createTargetedRepairPrompt(normalized.draft, validation.issues)
          : undefined,
      };
      attemptHistory.push(attemptRecord);
      this.logAttempt(attemptRecord);

      const retriesLeft = this.maxRetries - (attempt - 1);
      const repairable = this.isRepairable(validation.issues);
      const repeatedSignature =
        previousSignature !== null &&
        issueSignature !== 'OK' &&
        issueSignature === previousSignature;
      const degradingConfidence =
        previousConfidence !== null &&
        previousConfidence - confidence >= this.significantConfidenceDrop;

      const shouldRetry = shouldRetryFinalReportAttempt({
        highestSeverity: validation.highestSeverity,
        confidence,
        retriesLeft,
        repairable,
        repeatedSignature,
        degradingConfidence,
        minConfidenceForMediumRetry: this.minConfidenceForMediumRetry,
      });
      if (!shouldRetry) {
        break;
      }

      if (!attemptRecord.repairPrompt) {
        break;
      }

      previousSignature = issueSignature;
      previousConfidence = confidence;
      attemptPrompt = attemptRecord.repairPrompt;
    }

    const successfulAttempts = attemptHistory.filter((item) => item.validation.ok && item.validation.data);
    if (successfulAttempts.length === 0) {
      const last = attemptHistory[attemptHistory.length - 1];
      const summary = last.validation.issues
        .map((issue) => `${issue.severity}:${issue.path}:${issue.code}`)
        .slice(0, 6)
        .join(', ');
      throw new Error(`FinalReport pipeline failed after ${attemptHistory.length} attempt(s). ${summary}`);
    }

    const best = successfulAttempts.sort(compareFinalReportAttempts)[0];
    const report = best.validation.data as FinalReport;
    const outcome: FinalReportOutcome =
      best.validation.issues.length > 0 ? 'ACCEPT_WITH_WARNINGS' : 'ACCEPT_CLEAN';
    const quality = evaluateFinalReportQuality({
      confidence: best.confidence,
      highestSeverity: best.validation.highestSeverity,
      issues: best.validation.issues,
      outcome,
    });

    this.logger.log(
      `FinalReport selected attempt=${best.attempt} severity=${best.validation.highestSeverity ?? 'NONE'} confidence=${best.confidence.toFixed(2)}`,
    );
    return { report, quality };
  }
}
