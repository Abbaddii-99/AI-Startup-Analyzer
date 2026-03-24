import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '../prisma';
import { IdeaAnalyzerAgent } from '../agents/idea-analyzer.agent';
import { ComprehensiveIdeaAnalyzerAgent } from '../agents/comprehensive-idea-analyzer.agent';
import { MarketResearchAgent } from '../agents/market-research.agent';
import { CompetitorAnalysisAgent } from '../agents/competitor-analysis.agent';
import { MVPGeneratorAgent } from '../agents/mvp-generator.agent';
import { MonetizationAgent } from '../agents/monetization.agent';
import { GoToMarketAgent } from '../agents/go-to-market.agent';
import { FinalReportAgent } from '../agents/final-report.agent';
import { RiskRadarAgent } from '../agents/risk-radar.agent';
import { RoadmapAgent } from '../agents/roadmap.agent';
import { BusinessModelAgent } from '../agents/business-model.agent';
import { VisionMissionAgent } from '../agents/vision-mission.agent';
import { BrandIdentityAgent } from '../agents/brand-identity.agent';
import { BudgetEstimatorAgent } from '../agents/budget-estimator.agent';
import { FinancialPlanAgent } from '../agents/financial-plan.agent';

function sanitizeIdea(idea: string): string {
  return idea
    .trim()
    .slice(0, 2000)
    .replace(/[<>"'`]/g, '')
    .replace(/ignore\s+(previous|above|all)\s+instructions?/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/\\n|\\r/g, ' ');
}

@Injectable()
@Processor('analysis')
export class AnalysisProcessor extends WorkerHost {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    private ideaAnalyzer: IdeaAnalyzerAgent,
    private comprehensiveIdeaAnalyzer: ComprehensiveIdeaAnalyzerAgent,
    private marketResearch: MarketResearchAgent,
    private competitorAnalysis: CompetitorAnalysisAgent,
    private mvpGenerator: MVPGeneratorAgent,
    private monetization: MonetizationAgent,
    private goToMarket: GoToMarketAgent,
    private finalReport: FinalReportAgent,
    private riskRadar: RiskRadarAgent,
    private roadmap: RoadmapAgent,
    private businessModel: BusinessModelAgent,
    private visionMission: VisionMissionAgent,
    private brandIdentity: BrandIdentityAgent,
    private budgetEstimator: BudgetEstimatorAgent,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const analysisId = String(job.data?.analysisId ?? '');
    const idea = sanitizeIdea(String(job.data?.idea ?? ''));

    if (!analysisId) throw new Error('Invalid analysisId');
    if (!idea) throw new Error('Idea is empty');

    this.logger.log(`Processing analysis ${analysisId}`);

    try {
      await prisma.analysis.update({ where: { id: analysisId }, data: { status: 'PROCESSING' } });
      await job.updateProgress(5);

      const agentResults = await this.runAgentsWithProgress(job, idea);
      await job.updateProgress(90);

      const [finalReportData, riskRadarData, roadmapData, businessModelData, visionMissionData, brandIdentityData, budgetEstimateData] = await Promise.all([
        this.finalReport.execute(idea, agentResults),
        this.riskRadar.execute(idea, agentResults),
        this.roadmap.execute(idea, agentResults),
        this.businessModel.execute(idea, agentResults),
        this.visionMission.execute(idea, agentResults),
        this.brandIdentity.execute(idea, agentResults),
        this.budgetEstimator.execute(idea, agentResults),
      ]);
      await job.updateProgress(98);

      // Run comprehensive idea analysis after all other agents
      const comprehensiveResult = await this.comprehensiveIdeaAnalyzer.execute(idea, agentResults);

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          ideaAnalysis: agentResults.ideaAnalysis as any,
          marketResearch: agentResults.marketResearch as any,
          competitorAnalysis: agentResults.competitorAnalysis as any,
          mvpPlan: agentResults.mvpPlan as any,
          monetization: agentResults.monetization as any,
          goToMarket: agentResults.goToMarket as any,
          finalReport: finalReportData as any,
          riskRadar: riskRadarData as any,
          roadmap: roadmapData as any,
          businessModel: businessModelData as any,
          visionMission: visionMissionData as any,
          brandIdentity: brandIdentityData as any,
          budgetEstimate: budgetEstimateData as any,
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
      const safeMessage = String(error.message ?? error).replace(/[\r\n]/g, ' ').slice(0, 200);
      this.logger.error(`Analysis ${analysisId} failed: ${safeMessage}`);
      await prisma.analysis.update({ where: { id: analysisId }, data: { status: 'FAILED' } });
      throw error;
    }
  }

  private async runAgentsWithProgress(job: Job, idea: string) {
    const steps = [
      { name: 'ideaAnalysis',       fn: () => this.ideaAnalyzer.execute(idea),        progress: 19 },
      { name: 'marketResearch',     fn: () => this.marketResearch.execute(idea),       progress: 33 },
      { name: 'competitorAnalysis', fn: () => this.competitorAnalysis.execute(idea),   progress: 47 },
      { name: 'mvpPlan',            fn: () => this.mvpGenerator.execute(idea),         progress: 61 },
      { name: 'monetization',       fn: () => this.monetization.execute(idea),         progress: 75 },
      { name: 'goToMarket',         fn: () => this.goToMarket.execute(idea),           progress: 89 },
    ];

    const results: Record<string, any> = {};
    for (const { name, fn, progress } of steps) {
      results[name] = await fn();
      await job.updateProgress(progress);
    }

    return results as {
      ideaAnalysis: any;
      marketResearch: any;
      competitorAnalysis: any;
      mvpPlan: any;
      monetization: any;
      goToMarket: any;
    };
  }
}
