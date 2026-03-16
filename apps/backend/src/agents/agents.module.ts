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
import { BusinessModelAgent } from './business-model.agent';
import { VisionMissionAgent } from './vision-mission.agent';

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
    BusinessModelAgent,
    VisionMissionAgent,
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
    BusinessModelAgent,
    VisionMissionAgent,
  ],
})
export class AgentsModule {}
