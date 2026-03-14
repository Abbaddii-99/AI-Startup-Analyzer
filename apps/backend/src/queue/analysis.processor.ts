import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '../../../packages/db';
import { IdeaAnalyzerAgent } from '../agents/idea-analyzer.agent';
import { MarketResearchAgent } from '../agents/market-research.agent';
import { CompetitorAnalysisAgent } from '../agents/competitor-analysis.agent';
import { MVPGeneratorAgent } from '../agents/mvp-generator.agent';
import { MonetizationAgent } from '../agents/monetization.agent';
import { GoToMarketAgent } from '../agents/go-to-market.agent';
import { FinalReportAgent } from '../agents/final-report.agent';

const MAX_IDEA_LENGTH = 2000;

function sanitizeIdea(idea: string): string {
  return idea
    .trim()
    .slice(0, MAX_IDEA_LENGTH)
    .replace(/[<>"'`]/g, '');
}

@Injectable()
@Processor('analysis')
export class AnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisProcessor.name);

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
    const { analysisId } = job.data;
    const idea = sanitizeIdea(job.data.idea);

    this.logger.log(`Processing analysis ${analysisId}`);

    try {
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'PROCESSING' },
      });

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

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          ideaAnalysis: ideaAnalysis as any,
          marketResearch: marketResearch as any,
          competitorAnalysis: competitorAnalysis as any,
          mvpPlan: mvpPlan as any,
          monetization: monetizationStrategy as any,
          goToMarket: goToMarketStrategy as any,
          finalReport: finalReportData as any,
          marketDemandScore: finalReportData.score.marketDemand,
          competitionScore: finalReportData.score.competition,
          executionDifficultyScore: finalReportData.score.executionDifficulty,
          profitPotentialScore: finalReportData.score.profitPotential,
          overallScore: finalReportData.score.overall,
        },
      });

      await job.updateProgress(100);
      this.logger.log(`Analysis ${analysisId} completed successfully`);
    } catch (error) {
      this.logger.error(`Analysis ${analysisId} failed: ${error.message}`);
      await prisma.analysis.update({
        where: { id: analysisId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  }
}
