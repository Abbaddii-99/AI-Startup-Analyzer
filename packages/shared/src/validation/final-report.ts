import type { FinalReport } from '../types/analysis.types';
import {
  FINAL_REPORT_RISKS_FALLBACK,
  FINAL_REPORT_TEXT_FALLBACK,
  type NormalizationReport,
  type NormalizedFinalReportDraft,
} from '../normalization/final-report';

export type ValidationSeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationResult<T> {
  ok: boolean;
  data?: T;
  issues: ValidationIssue[];
  highestSeverity: ValidationSeverity | null;
}

export interface FinalReportAttemptRecord {
  attempt: number;
  normalizationReport: NormalizationReport;
  confidence: number;
  issueSignature: string;
  validation: ValidationResult<FinalReport>;
  repairPrompt?: string;
}

function maxSeverity(a: ValidationSeverity | null, b: ValidationSeverity): ValidationSeverity {
  const rank: Record<ValidationSeverity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3 };
  if (!a) return b;
  return rank[b] > rank[a] ? b : a;
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function isBoundedScore(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0 && value <= 10;
}

export function validateFinalReportDetailed(
  draft: NormalizedFinalReportDraft,
): ValidationResult<FinalReport> {
  const issues: ValidationIssue[] = [];
  let highest: ValidationSeverity | null = null;

  const requiredTextFields: Array<keyof Omit<FinalReport, 'score' | 'risks'>> = [
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

  for (const field of requiredTextFields) {
    const val = asNonEmptyString(draft[field]);
    if (!val) {
      const severity: ValidationSeverity = 'HIGH';
      issues.push({
        code: 'INVALID_TEXT_FIELD',
        path: field,
        message: `${field} must be a non-empty string`,
        severity,
      });
      highest = maxSeverity(highest, severity);
      continue;
    }

    if (val === FINAL_REPORT_TEXT_FALLBACK) {
      const severity: ValidationSeverity = 'MEDIUM';
      issues.push({
        code: 'DEFAULTED_TEXT_FIELD',
        path: field,
        message: `${field} is defaulted`,
        severity,
      });
      highest = maxSeverity(highest, severity);
    }
  }

  if (!Array.isArray(draft.risks) || draft.risks.length === 0) {
    const severity: ValidationSeverity = 'HIGH';
    issues.push({
      code: 'INVALID_RISKS',
      path: 'risks',
      message: 'risks must be a non-empty array of strings',
      severity,
    });
    highest = maxSeverity(highest, severity);
  } else {
    const invalidRisk = draft.risks.find((risk) => !asNonEmptyString(risk));
    if (invalidRisk) {
      const severity: ValidationSeverity = 'HIGH';
      issues.push({
        code: 'INVALID_RISK_ITEM',
        path: 'risks',
        message: 'risks must contain only non-empty strings',
        severity,
      });
      highest = maxSeverity(highest, severity);
    } else if (draft.risks.length === 1 && draft.risks[0] === FINAL_REPORT_RISKS_FALLBACK) {
      const severity: ValidationSeverity = 'MEDIUM';
      issues.push({
        code: 'DEFAULTED_RISKS',
        path: 'risks',
        message: 'risks are defaulted',
        severity,
      });
      highest = maxSeverity(highest, severity);
    }
  }

  const scoreEntries: Array<[keyof FinalReport['score'], unknown]> = [
    ['marketDemand', draft.score.marketDemand],
    ['competition', draft.score.competition],
    ['executionDifficulty', draft.score.executionDifficulty],
    ['profitPotential', draft.score.profitPotential],
    ['overall', draft.score.overall],
  ];

  for (const [field, value] of scoreEntries) {
    if (!isBoundedScore(value)) {
      const severity: ValidationSeverity = 'HIGH';
      issues.push({
        code: 'INVALID_SCORE',
        path: `score.${field}`,
        message: `score.${field} must be a number between 0 and 10`,
        severity,
      });
      highest = maxSeverity(highest, severity);
    }
  }

  const hasHigh = issues.some((issue) => issue.severity === 'HIGH');
  if (hasHigh) {
    return { ok: false, issues, highestSeverity: highest };
  }

  const data: FinalReport = {
    ideaSummary: draft.ideaSummary,
    problem: draft.problem,
    targetMarket: draft.targetMarket,
    marketAnalysis: draft.marketAnalysis,
    competitors: draft.competitors,
    mvp: draft.mvp,
    monetization: draft.monetization,
    goToMarket: draft.goToMarket,
    risks: draft.risks,
    verdict: draft.verdict,
    score: {
      marketDemand: draft.score.marketDemand as number,
      competition: draft.score.competition as number,
      executionDifficulty: draft.score.executionDifficulty as number,
      profitPotential: draft.score.profitPotential as number,
      overall: draft.score.overall as number,
    },
  };

  return { ok: true, data, issues, highestSeverity: highest };
}

export function validateFinalReport(draft: NormalizedFinalReportDraft): FinalReport {
  const result = validateFinalReportDetailed(draft);
  if (!result.ok || !result.data) {
    const summary = result.issues
      .map((issue) => `${issue.path}:${issue.code}`)
      .slice(0, 5)
      .join(', ');
    throw new Error(`FinalReport validation failed: ${summary}`);
  }
  return result.data;
}

export function buildFinalReportRepairPrompt(issues: ValidationIssue[]): string {
  const critical = issues
    .filter((issue) => issue.severity === 'HIGH' || issue.severity === 'MEDIUM')
    .map((issue) => `- ${issue.path}: ${issue.message}`)
    .join('\n');

  return `Return ONLY valid JSON for FinalReport schema. Fix these fields:\n${critical}`;
}
