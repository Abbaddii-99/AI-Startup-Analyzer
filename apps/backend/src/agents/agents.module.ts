import { Module } from '@nestjs/common';
import { AIService } from './ai.service';
import { IdeaAnalyzerAgent } from './idea-analyzer.agent';
import { MarketResearchAgent } from './market-research.agent';
import { CompetitorAnalysisAgent } from './competitor-analysis.agent';
import { MVPGeneratorAgent } from './mvp-generator.agent';
import { MonetizationAgent } from './monetization.agent';
import { GoToMarketAgent } from './go-to-market.agent';
import { FinalReportAgent } from './final-report.agent';
import { RiskRadarAgent } from './risk-radar.agent';
import { RoadmapAgent } from './roadmap.agent';

@Module({
  providers: [
    AIService,
    IdeaAnalyzerAgent,
    MarketResearchAgent,
    CompetitorAnalysisAgent,
    MVPGeneratorAgent,
    MonetizationAgent,
    GoToMarketAgent,
    FinalReportAgent,
    RiskRadarAgent,
    RoadmapAgent,
  ],
  exports: [
    AIService,
    IdeaAnalyzerAgent,
    MarketResearchAgent,
    CompetitorAnalysisAgent,
    MVPGeneratorAgent,
    MonetizationAgent,
    GoToMarketAgent,
    FinalReportAgent,
    RiskRadarAgent,
    RoadmapAgent,
  ],
})
export class AgentsModule {}
