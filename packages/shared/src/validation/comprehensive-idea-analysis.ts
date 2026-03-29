import type { ComprehensiveIdeaAnalysis } from '../types/analysis.types';

function asRecord(value: unknown, path: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${path} must be an object`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, path: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${path} must be a string`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${path} must not be empty`);
  }
  return trimmed;
}

function asStringArray(value: unknown, path: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${path} must be an array of strings`);
  }
  const arr = value.map((item, idx) => asString(item, `${path}[${idx}]`));
  if (arr.length === 0) {
    throw new Error(`${path} must not be empty`);
  }
  return arr;
}

function asScore(value: unknown, path: string): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`${path} must be a number`);
  }
  if (value < 0 || value > 10) {
    throw new Error(`${path} must be between 0 and 10`);
  }
  return value;
}

function scoredSection(value: unknown, path: string) {
  const section = asRecord(value, path);
  return {
    score: asScore(section.score, `${path}.score`),
    assessment: asString(section.assessment, `${path}.assessment`),
  };
}

export function validateComprehensiveIdeaAnalysis(input: unknown): ComprehensiveIdeaAnalysis {
  const obj = asRecord(input, 'comprehensiveIdeaAnalysis');

  const overallViability = asRecord(obj.overallViability, 'overallViability');
  const marketOpportunity = asRecord(obj.marketOpportunity, 'marketOpportunity');
  const competitiveAnalysis = asRecord(obj.competitiveAnalysis, 'competitiveAnalysis');
  const targetAudienceFit = asRecord(obj.targetAudienceFit, 'targetAudienceFit');
  const financialFeasibility = asRecord(obj.financialFeasibility, 'financialFeasibility');
  const riskAssessment = asRecord(obj.riskAssessment, 'riskAssessment');
  const recommendations = asRecord(obj.recommendations, 'recommendations');

  return {
    overallViability: {
      ...scoredSection(overallViability, 'overallViability'),
      strengths: asStringArray(overallViability.strengths, 'overallViability.strengths'),
      weaknesses: asStringArray(overallViability.weaknesses, 'overallViability.weaknesses'),
    },
    marketOpportunity: {
      ...scoredSection(marketOpportunity, 'marketOpportunity'),
      marketSize: asString(marketOpportunity.marketSize, 'marketOpportunity.marketSize'),
      growthPotential: asString(marketOpportunity.growthPotential, 'marketOpportunity.growthPotential'),
      timing: asString(marketOpportunity.timing, 'marketOpportunity.timing'),
    },
    competitiveAnalysis: {
      ...scoredSection(competitiveAnalysis, 'competitiveAnalysis'),
      competitiveAdvantage: asString(
        competitiveAnalysis.competitiveAdvantage,
        'competitiveAnalysis.competitiveAdvantage',
      ),
      barriersToEntry: asString(competitiveAnalysis.barriersToEntry, 'competitiveAnalysis.barriersToEntry'),
      differentiation: asStringArray(competitiveAnalysis.differentiation, 'competitiveAnalysis.differentiation'),
    },
    targetAudienceFit: {
      ...scoredSection(targetAudienceFit, 'targetAudienceFit'),
      audienceUnderstanding: asString(
        targetAudienceFit.audienceUnderstanding,
        'targetAudienceFit.audienceUnderstanding',
      ),
      painPointsAddressed: asStringArray(targetAudienceFit.painPointsAddressed, 'targetAudienceFit.painPointsAddressed'),
      valueProposition: asString(targetAudienceFit.valueProposition, 'targetAudienceFit.valueProposition'),
    },
    financialFeasibility: {
      ...scoredSection(financialFeasibility, 'financialFeasibility'),
      revenuePotential: asString(financialFeasibility.revenuePotential, 'financialFeasibility.revenuePotential'),
      costStructure: asString(financialFeasibility.costStructure, 'financialFeasibility.costStructure'),
      breakEvenAnalysis: asString(financialFeasibility.breakEvenAnalysis, 'financialFeasibility.breakEvenAnalysis'),
      roiPotential: asString(financialFeasibility.roiPotential, 'financialFeasibility.roiPotential'),
    },
    riskAssessment: {
      ...scoredSection(riskAssessment, 'riskAssessment'),
      highRiskFactors: asStringArray(riskAssessment.highRiskFactors, 'riskAssessment.highRiskFactors'),
      mitigationStrategies: asStringArray(riskAssessment.mitigationStrategies, 'riskAssessment.mitigationStrategies'),
      probabilityOfSuccess: asString(riskAssessment.probabilityOfSuccess, 'riskAssessment.probabilityOfSuccess'),
    },
    recommendations: {
      priority: asStringArray(recommendations.priority, 'recommendations.priority'),
      quickWins: asStringArray(recommendations.quickWins, 'recommendations.quickWins'),
      longTermStrategies: asStringArray(recommendations.longTermStrategies, 'recommendations.longTermStrategies'),
      assessment: asString(recommendations.assessment, 'recommendations.assessment'),
    },
    finalScore: asScore(obj.finalScore, 'finalScore'),
    detailedAnalysis: asString(obj.detailedAnalysis, 'detailedAnalysis'),
    generatedAt: asString(obj.generatedAt, 'generatedAt'),
  };
}
