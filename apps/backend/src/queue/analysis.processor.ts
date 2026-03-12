import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { prisma } from '@ai-analyzer/db';
import { IdeaAnalyzerAgent } from '../agents/idea-analyzer.agent';
import { MarketResearchAgent } from '../agents/market-research.agent';
import { CompetitorAnalysisAgent } from '../agents/competitor-analysis.agent';
import { MVPGeneratorAgent } from '../agents/mvp-generator.agent';
import { MonetizationAgent } from '../agents/monetization.agent';
import { GoToMarketAgent } from '../agents/go-to-market.agent';
import { FinalReportAgent } from '../agents/final-report.agent';

@Injectable()
@Processor('analysis')
export class AnalysisProcessor extends WorkerHost {
  constructor(
    private ideaAnalyzer: IdeaAnalyzerAgent,
    private marketResearch: MarketResearchAgent,
    private competitorAnalysis: CompetitorAnalysisAgent,
    private mvpGenerator: MVPGeneratorAgent,
    private monetization: MonetizationAgent,
    private goToMarket: GoToMarketAgent,
    private finalReport: FinalReportAgent,
  ) {
    super();
  }

  async process(job: Job<{ analysisId: string; idea: string }>): Promise<void> {
    const { analysisId, idea } = job.data;

    try {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'PROCESSING' },
      });

      // Run agents sequentially
      const ideaAnalysis = await this.ideaAnalyzer.execute(idea);
      await job.updateProgress(15);

      const marketResearch = await this.marketResearch.execute(idea);
      await job.updateProgress(30);

      const competitorAnalysis = await this.competitorAnalysis.execute(idea);
      await job.updateProgress(45);

      const mvpPlan = await this.mvpGenerator.execute(idea);
      await job.updateProgress(60);

      const monetizationStrategy = await this.monetization.execute(idea);
      await job.updateProgress(75);

      const goToMarketStrategy = await this.goToMarket.execute(idea);
      await job.updateProgress(85);

      const context = {
        ideaAnalysis,
        marketResearch,
        competitorAnalysis,
        mvpPlan,
        monetization: monetizationStrategy,
        goToMarket: goToMarketStrategy,
      };

      const finalReportData = await this.finalReport.execute(idea, context);
      await job.updateProgress(95);

      // Save to database
      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          ideaAnalysis,
          marketResearch,
          competitorAnalysis,
          mvpPlan,
          monetization: monetizationStrategy,
          goToMarket: goToMarketStrategy,
          finalReport: finalReportData,
          marketDemandScore: finalReportData.score.marketDemand,
          competitionScore: finalReportData.score.competition,
          executionDifficultyScore: finalReportData.score.executionDifficulty,
          profitPotentialScore: finalReportData.score.profitPotential,
          overallScore: finalReportData.score.overall,
        },
      });

      await job.updateProgress(100);
    } catch (error) {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }
}
