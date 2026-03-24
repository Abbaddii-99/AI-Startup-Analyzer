export interface IdeaAnalysis {
  summary: string;
  coreProblem: string;
  targetUsers: string[];
  industry: string;
  useCases: string[];
}

export interface MarketResearch {
  marketDemand: string;
  tam: string;
  sam: string;
  som: string;
  growthTrends: string[];
  geographicOpportunities: string[];
}

export interface Competitor {
  name: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  pricing?: string;
}

export interface CompetitorAnalysis {
  directCompetitors: Competitor[];
  indirectCompetitors: Competitor[];
}

export interface MVPFeature {
  title: string;
  description: string;
  priority: 'Must Have' | 'Should Have' | 'Nice to Have';
}

export interface MVPFeedbackLoop {
  title: string;
  description: string;
  method: string;
}

export interface MVPKPI {
  title: string;
  target: string;
  description: string;
  timeframe: string;
}

export interface MVPFeasibilityItem {
  question: string;
  answer: string;
  risk: 'Low' | 'Medium' | 'High';
}

export interface MVPPlan {
  productName: string;
  tagline: string;
  coreFeatures: MVPFeature[];
  feedbackLoops: MVPFeedbackLoop[];
  kpis: MVPKPI[];
  iterationStrategy: string;
  feasibilityChecks: MVPFeasibilityItem[];
  developmentComplexity: 'Low' | 'Medium' | 'High';
  estimatedTime: string;
}

export interface MonetizationStrategy {
  recommendedModel: 'subscription' | 'freemium' | 'usage-based' | 'enterprise';
  reasoning: string;
  pricingTiers?: Array<{
    name: string;
    price: string;
    features: string[];
  }>;
}

export interface GoToMarketStrategy {
  marketingChannels: string[];
  communities: string[];
  partnerships: string[];
  growthHacks: string[];
}

export interface IdeaScore {
  marketDemand: number;
  competition: number;
  executionDifficulty: number;
  profitPotential: number;
  overall: number;
}

export interface FinalReport {
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
  score: IdeaScore;
}

export interface ComprehensiveIdeaAnalysis {
  overallViability: {
    score: number;
    assessment: string;
    strengths: string[];
    weaknesses: string[];
  };
  marketOpportunity: {
    score: number;
    assessment: string;
    marketSize: string;
    growthPotential: string;
    timing: string;
  };
  competitiveAnalysis: {
    score: number;
    assessment: string;
    competitiveAdvantage: string;
    barriersToEntry: string;
    differentiation: string[];
  };
  targetAudienceFit: {
    score: number;
    assessment: string;
    audienceUnderstanding: string;
    painPointsAddressed: string[];
    valueProposition: string;
  };
  financialFeasibility: {
    score: number;
    assessment: string;
    revenuePotential: string;
    costStructure: string;
    breakEvenAnalysis: string;
    roiPotential: string;
  };
  riskAssessment: {
    score: number;
    assessment: string;
    highRiskFactors: string[];
    mitigationStrategies: string[];
    probabilityOfSuccess: string;
  };
  recommendations: {
    priority: string[];
    quickWins: string[];
    longTermStrategies: string[];
    assessment: string;
  };
  finalScore: number;
  detailedAnalysis: string;
  generatedAt: string;
}

export interface AnalysisResult {
  id: string;
  idea: string;
  ideaAnalysis: IdeaAnalysis;
  comprehensiveIdeaAnalysis?: ComprehensiveIdeaAnalysis;
  marketResearch: MarketResearch;
  competitorAnalysis: CompetitorAnalysis;
  mvpPlan: MVPPlan;
  monetization: MonetizationStrategy;
  goToMarket: GoToMarketStrategy;
  finalReport: FinalReport;
  createdAt: Date;
}
