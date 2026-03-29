import type { FinalReport } from '../types/analysis.types';

export const FINAL_REPORT_TEXT_FALLBACK = 'Not provided by model.';
export const FINAL_REPORT_RISKS_FALLBACK = 'No explicit risks provided by model.';

export interface NormalizedFinalReportDraft {
  ideaSummary: string;
  problem: string;
  targetMarket: string;
  marketAnalysis: string;
  competitors: string;
  mvp: string;
  monetization: string;
  goToMarket: string;
  risks: string[];
  verdict: string;
  score: {
    marketDemand: number | null;
    competition: number | null;
    executionDifficulty: number | null;
    profitPotential: number | null;
    overall: number | null;
  };
}

export interface NormalizationReport {
  coercions: string[];
  defaultsApplied: string[];
  droppedValues: string[];
  warnings: string[];
  sourceQuality: 'good' | 'degraded';
}

export interface NormalizedFinalReportResult {
  draft: NormalizedFinalReportDraft;
  report: NormalizationReport;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function normalizeText(
  value: unknown,
  field: keyof Omit<FinalReport, 'score' | 'risks'>,
  report: NormalizationReport,
): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  report.defaultsApplied.push(field);
  report.warnings.push(`${field} defaulted`);
  return FINAL_REPORT_TEXT_FALLBACK;
}

function normalizeRisks(value: unknown, report: NormalizationReport): string[] {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item, idx) => {
        if (typeof item === 'string') return item.trim();
        if (item == null) {
          report.droppedValues.push(`risks[${idx}]`);
          return '';
        }
        report.coercions.push(`risks[${idx}] -> string`);
        return String(item).trim();
      })
      .filter(Boolean);

    if (cleaned.length > 0) return cleaned;
  } else if (typeof value === 'string' && value.trim()) {
    report.coercions.push('risks string -> risks array');
    return [value.trim()];
  }

  report.defaultsApplied.push('risks');
  report.warnings.push('risks defaulted');
  return [FINAL_REPORT_RISKS_FALLBACK];
}

function toNumberOrNull(value: unknown, field: string, report: NormalizationReport): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    if (normalized) {
      const n = Number(normalized);
      if (!Number.isNaN(n)) {
        report.coercions.push(`${field} string -> number`);
        return n;
      }
    }
  }
  report.warnings.push(`${field} is not numeric`);
  return null;
}

export function normalizeFinalReport(input: unknown): NormalizedFinalReportResult {
  const report: NormalizationReport = {
    coercions: [],
    defaultsApplied: [],
    droppedValues: [],
    warnings: [],
    sourceQuality: 'good',
  };

  const root = asRecord(input);
  const score = asRecord(root.score);

  const draft: NormalizedFinalReportDraft = {
    ideaSummary: normalizeText(root.ideaSummary, 'ideaSummary', report),
    problem: normalizeText(root.problem, 'problem', report),
    targetMarket: normalizeText(root.targetMarket, 'targetMarket', report),
    marketAnalysis: normalizeText(root.marketAnalysis, 'marketAnalysis', report),
    competitors: normalizeText(root.competitors, 'competitors', report),
    mvp: normalizeText(root.mvp, 'mvp', report),
    monetization: normalizeText(root.monetization, 'monetization', report),
    goToMarket: normalizeText(root.goToMarket, 'goToMarket', report),
    risks: normalizeRisks(root.risks, report),
    verdict: normalizeText(root.verdict, 'verdict', report),
    score: {
      marketDemand: toNumberOrNull(score.marketDemand, 'score.marketDemand', report),
      competition: toNumberOrNull(score.competition, 'score.competition', report),
      executionDifficulty: toNumberOrNull(score.executionDifficulty, 'score.executionDifficulty', report),
      profitPotential: toNumberOrNull(score.profitPotential, 'score.profitPotential', report),
      overall: toNumberOrNull(score.overall, 'score.overall', report),
    },
  };

  if (report.defaultsApplied.length > 0 || report.warnings.length > 0) {
    report.sourceQuality = 'degraded';
  }

  return { draft, report };
}

export function computeNormalizationConfidence(report: NormalizationReport): number {
  const penalty = report.coercions.length * 0.08 + report.defaultsApplied.length * 0.12 + report.warnings.length * 0.05;
  return Math.max(0, Number((1 - penalty).toFixed(2)));
}
