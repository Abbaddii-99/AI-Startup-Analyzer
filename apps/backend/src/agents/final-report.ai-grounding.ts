import type { FinalReport } from '@ai-analyzer/shared';
import type { GroundingResult } from './final-report.adaptive-grounding';

type UpdatableTextField =
  | 'ideaSummary'
  | 'problem'
  | 'targetMarket'
  | 'marketAnalysis'
  | 'competitors'
  | 'mvp'
  | 'monetization'
  | 'goToMarket'
  | 'verdict';

type UpdatableField = UpdatableTextField | 'risks';

interface AIGroundingPatch {
  updates?: Partial<Record<UpdatableField, string | string[]>>;
  notes?: string;
}

export interface AIGroundingDependencies {
  generate(prompt: string): Promise<string>;
  parseJSON<T>(text: string): T;
}

const TEXT_FIELDS: UpdatableTextField[] = [
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

const GENERIC_PATTERNS = [
  /\bvarious competitors\b/i,
  /\bmany competitors\b/i,
  /\bthere are many risks\b/i,
  /\bgood market\b/i,
  /\bgood potential\b/i,
  /\bstrong potential\b/i,
  /\bneeds more analysis\b/i,
];

function cloneReport(report: FinalReport): FinalReport {
  return JSON.parse(JSON.stringify(report)) as FinalReport;
}

function isWeakText(value: string): boolean {
  const normalized = value.trim();
  if (normalized.length < 45) return true;
  return GENERIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

function isWeakRisks(risks: string[]): boolean {
  if (risks.length < 2) return true;
  return risks.some((risk) => risk.trim().length < 20 || GENERIC_PATTERNS.some((pattern) => pattern.test(risk)));
}

function detectWeakFields(report: FinalReport): UpdatableField[] {
  const weak: UpdatableField[] = [];
  for (const field of TEXT_FIELDS) {
    if (isWeakText(report[field])) weak.push(field);
  }
  if (isWeakRisks(report.risks)) weak.push('risks');
  return weak;
}

function buildPrompt(report: FinalReport, weakFields: UpdatableField[]): string {
  return [
    'You are improving selected weak sections of a startup final report.',
    'Do NOT regenerate the whole report.',
    'Modify ONLY the listed weak fields.',
    '',
    'CURRENT_REPORT',
    JSON.stringify(report, null, 2),
    '',
    `WEAK_FIELDS: ${weakFields.join(', ')}`,
    '',
    'INSTRUCTIONS',
    '- Return STRICT JSON only.',
    '- Output shape:',
    '{',
    '  "updates": { "<field>": "<improved text or risks array>" },',
    '  "notes": "short summary"',
    '}',
    '- Include ONLY fields from WEAK_FIELDS inside updates.',
    '- Keep language and domain context consistent with current report.',
    '- Do not add new top-level keys.',
  ].join('\n');
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function applyPatch(
  report: FinalReport,
  patch: AIGroundingPatch,
  weakFields: UpdatableField[],
): { groundedReport: FinalReport; changedFields: string[] } {
  const groundedReport = cloneReport(report);
  const changedFields: string[] = [];
  const updates = patch.updates ?? {};

  for (const field of weakFields) {
    const incoming = updates[field];
    if (field === 'risks') {
      if (!Array.isArray(incoming)) continue;
      const normalizedRisks = incoming
        .map((item) => (typeof item === 'string' ? normalizeText(item) : ''))
        .filter((item) => item.length > 0);
      if (normalizedRisks.length === 0) continue;
      if (JSON.stringify(normalizedRisks) !== JSON.stringify(groundedReport.risks)) {
        groundedReport.risks = normalizedRisks;
        changedFields.push(field);
      }
      continue;
    }

    if (typeof incoming !== 'string') continue;
    const normalized = normalizeText(incoming);
    if (!normalized) continue;
    if (normalized !== groundedReport[field]) {
      groundedReport[field] = normalized;
      changedFields.push(field);
    }
  }

  return { groundedReport, changedFields };
}

export async function enhanceFinalReportWithAI(
  report: FinalReport,
  deps: AIGroundingDependencies,
): Promise<GroundingResult> {
  const weakFields = detectWeakFields(report);
  if (weakFields.length === 0) {
    return {
      groundedReport: cloneReport(report),
      notes: 'No weak sections detected; no AI grounding changes applied.',
    };
  }

  const prompt = buildPrompt(report, weakFields);
  const raw = await deps.generate(prompt);
  const parsed = deps.parseJSON<AIGroundingPatch>(raw);
  const { groundedReport, changedFields } = applyPatch(report, parsed, weakFields);

  const modelNotes = typeof parsed.notes === 'string' ? normalizeText(parsed.notes) : '';
  const notes = changedFields.length > 0
    ? `AI grounded fields: ${changedFields.join(', ')}${modelNotes ? ` | ${modelNotes}` : ''}`
    : `AI grounding returned no applicable field updates.${modelNotes ? ` | ${modelNotes}` : ''}`;

  return {
    groundedReport,
    notes,
  };
}
