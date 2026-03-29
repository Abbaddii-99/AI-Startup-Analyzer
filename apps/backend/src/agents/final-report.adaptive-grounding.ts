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
  reportHash: string;
}

export interface AdaptiveGroundingOptions {
  attemptNumber?: number;
  groundingFn?: (report: FinalReport) => GroundingResult;
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

function hashReport(report: FinalReport): string {
  return createHash('sha256').update(JSON.stringify(report)).digest('hex');
}

export function adaptiveGroundingTrigger(
  finalReportResult: FinalReportAgentResult,
  options: AdaptiveGroundingOptions = {},
): FinalReportAdaptiveResult {
  const attemptNumber = options.attemptNumber ?? 1;
  const reportHash = hashReport(finalReportResult.report);
  const onLog = options.onLog;

  if (!finalReportResult.quality.shouldGround) {
    onLog?.({
      action: 'skipped',
      attemptNumber,
      reason: finalReportResult.quality.reason,
      reportHash,
    });
    return {
      report: finalReportResult.report,
      quality: finalReportResult.quality,
    };
  }

  const groundingFn = options.groundingFn ?? mockGroundFinalReport;
  const grounded = groundingFn(finalReportResult.report);
  const groundedReport = grounded.groundedReport ?? finalReportResult.report;

  onLog?.({
    action: 'applied',
    attemptNumber,
    reason: finalReportResult.quality.reason,
    reportHash,
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
