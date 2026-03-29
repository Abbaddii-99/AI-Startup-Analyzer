// shared/src/index.ts
export * from './utils/wrapUserInput';
export * from './validation/final-report';
export * from './validation/comprehensive-idea-analysis';
export * from './normalization/final-report';
// صدّر كل الأنواع من ملفات الـ types
export type { 
  IdeaAnalysis,
  MarketResearch,
  Competitor,
  CompetitorAnalysis,
  MVPFeature,
  MVPFeedbackLoop,
  MVPKPI,
  MVPFeasibilityItem,
  MVPPlan,
  MonetizationStrategy,
  GoToMarketStrategy,
  IdeaScore,
  FinalReport,
  ComprehensiveIdeaAnalysis,
  AnalysisResult
} from './types/analysis.types';


