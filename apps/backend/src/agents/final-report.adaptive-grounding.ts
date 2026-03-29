import { createHash } from 'crypto';
import type { FinalReport } from '@ai-analyzer/shared';
import type { FinalReportAgentResult } from './final-report.agent';

export interface GroundingResult {
  groundedReport: FinalReport;
  notes?: string;
}

export interface FinalReportAdaptiveResult {
  report: FinalReport;
  grounded?: GroundingResult;
  quality: FinalReportAgentResult['quality'];
}

export interface AdaptiveGroundingEvent {
  action: 'applied' | 'skipped';
  attemptNumber: number;
  reason: string;
  sourceReportHash: string;
  resultReportHash: string;
}

export interface AdaptiveGroundingOptions {
  attemptNumber?: number;
  groundingFn?: (report: FinalReport) => GroundingResult | Promise<GroundingResult>;
  onLog?: (event: AdaptiveGroundingEvent) => void;
}

function cloneReport(report: FinalReport): FinalReport {
  return JSON.parse(JSON.stringify(report)) as FinalReport;
}

export function mockGroundFinalReport(report: FinalReport): GroundingResult {
  return {
    groundedReport: cloneReport(report),
    notes: 'Mock grounding applied',
  };
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 10) return 10;
  return Number(value.toFixed(2));
}

export async function groundFinalReport(report: FinalReport): Promise<GroundingResult> {
  const groundedReport = cloneReport(report);
  const operations: string[] = [];

  const textFields: Array<keyof Omit<FinalReport, 'risks' | 'score'>> = [
    'ideaSummary',
    'problem',
    'targetMarket',
    'marketAnalysis',
    'competitors',
    'mvp',
    'monetization',
    'goToMarket',
    'verdict',
  ];

  for (const field of textFields) {
    const before = groundedReport[field];
    const after = normalizeText(before);
    if (before !== after) {
      groundedReport[field] = after;
      operations.push(`normalized:${field}`);
    }
  }

  const risks = groundedReport.risks
    .map((risk) => normalizeText(risk))
    .filter((risk) => risk.length > 0);
  const uniqueRisks = Array.from(new Set(risks));
  if (uniqueRisks.length === 0) {
    groundedReport.risks = ['Potential execution risk requires further validation.'];
    operations.push('fallback:risks');
  } else {
    if (uniqueRisks.length !== groundedReport.risks.length) {
      operations.push('normalized:risks');
    }
    groundedReport.risks = uniqueRisks;
  }

  const scoreFields: Array<keyof FinalReport['score']> = [
    'marketDemand',
    'competition',
    'executionDifficulty',
    'profitPotential',
    'overall',
  ];
  for (const field of scoreFields) {
    const before = groundedReport.score[field];
    const after = clampScore(before);
    if (before !== after) {
      groundedReport.score[field] = after;
      operations.push(`clamped:${field}`);
    }
  }

  return {
    groundedReport,
    notes: operations.length > 0
      ? `Applied adaptive grounding corrections: ${operations.join(', ')}`
      : 'Adaptive grounding made no changes',
  };
}

function hashReport(report: FinalReport): string {
  return createHash('sha256').update(JSON.stringify(report)).digest('hex');
}

export async function adaptiveGroundingTrigger(
  finalReportResult: FinalReportAgentResult,
  options: AdaptiveGroundingOptions = {},
): Promise<FinalReportAdaptiveResult> {
  const attemptNumber = options.attemptNumber ?? 1;
  const sourceReportHash = hashReport(finalReportResult.report);
  const onLog = options.onLog;

  if (!finalReportResult.quality.shouldGround) {
    onLog?.({
      action: 'skipped',
      attemptNumber,
      reason: finalReportResult.quality.reason,
      sourceReportHash,
      resultReportHash: sourceReportHash,
    });
    return {
      report: finalReportResult.report,
      quality: finalReportResult.quality,
    };
  }

  const groundingFn = options.groundingFn ?? groundFinalReport;
  const grounded = await groundingFn(finalReportResult.report);
  const groundedReport = grounded.groundedReport ?? finalReportResult.report;
  const resultReportHash = hashReport(groundedReport);

  onLog?.({
    action: 'applied',
    attemptNumber,
    reason: finalReportResult.quality.reason,
    sourceReportHash,
    resultReportHash,
  });

  return {
    report: groundedReport,
    grounded: {
      groundedReport,
      notes: grounded.notes,
    },
    quality: finalReportResult.quality,
  };
}
