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

export interface MVPPlan {
  coreFeatures: string[];
  userFlow: string[];
  systemArchitecture: string;
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

export interface AnalysisResult {
  id: string;
  idea: string;
  ideaAnalysis: IdeaAnalysis;
  marketResearch: MarketResearch;
  competitorAnalysis: CompetitorAnalysis;
  mvpPlan: MVPPlan;
  monetization: MonetizationStrategy;
  goToMarket: GoToMarketStrategy;
  finalReport: FinalReport;
  createdAt: Date;
}
