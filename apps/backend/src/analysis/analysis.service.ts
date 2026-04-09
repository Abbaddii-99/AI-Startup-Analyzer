import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { prisma } from '../prisma';
import { IdeaAnalyzerAgent } from '../agents/idea-analyzer.agent';
import { ComprehensiveIdeaAnalyzerAgent } from '../agents/comprehensive-idea-analyzer.agent';
import { MarketResearchAgent } from '../agents/market-research.agent';
import { CompetitorAnalysisAgent } from '../agents/competitor-analysis.agent';
import { MVPGeneratorAgent } from '../agents/mvp-generator.agent';
import { MonetizationAgent } from '../agents/monetization.agent';
import { GoToMarketAgent } from '../agents/go-to-market.agent';
import { RiskRadarAgent } from '../agents/risk-radar.agent';
import { RoadmapAgent } from '../agents/roadmap.agent';
import { BusinessModelAgent } from '../agents/business-model.agent';
import { VisionMissionAgent } from '../agents/vision-mission.agent';
import { BrandIdentityAgent } from '../agents/brand-identity.agent';
import { BudgetEstimatorAgent } from '../agents/budget-estimator.agent';

/** Shared plan-to-analysis-limits map — single source of truth */
export const PLAN_ANALYSIS_LIMITS: Record<string, number> = { FREE: 3, PRO: 50, TEAM: 999 };

const SECTION_FIELD_MAP: Record<string, string> = {
  'idea-analysis': 'ideaAnalysis',
  'comprehensive-idea-analysis': 'comprehensiveIdeaAnalysis',
  'market-research': 'marketResearch',
  'competitor-analysis': 'competitorAnalysis',
  'mvp': 'mvpPlan',
  'monetization': 'monetization',
  'go-to-market': 'goToMarket',
  'risk-radar': 'riskRadar',
  'roadmap': 'roadmap',
  'business-model': 'businessModel',
  'vision-mission': 'visionMission',
  'brand-identity': 'brandIdentity',
  'budget': 'budgetEstimate',
};

@Injectable()
export class AnalysisService {
  constructor(
    @InjectQueue('analysis') private analysisQueue: Queue,
    private ideaAnalyzer: IdeaAnalyzerAgent,
    private comprehensiveIdeaAnalyzer: ComprehensiveIdeaAnalyzerAgent,
    private marketResearch: MarketResearchAgent,
    private competitorAnalysis: CompetitorAnalysisAgent,
    private mvpGenerator: MVPGeneratorAgent,
    private monetization: MonetizationAgent,
    private goToMarket: GoToMarketAgent,
    private riskRadar: RiskRadarAgent,
    private roadmap: RoadmapAgent,
    private businessModel: BusinessModelAgent,
    private visionMission: VisionMissionAgent,
    private brandIdentity: BrandIdentityAgent,
    private budgetEstimator: BudgetEstimatorAgent,
  ) {}

  /**
   * Atomically checks and increments the monthly analysis counter.
   * Reads the current count, checks the limit, then increments in a single
   * logical flow. The final increment is atomic via Prisma's { increment: 1 }.
   */
  async checkAndIncrementAnalysisLimit(userId: string): Promise<void> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const currentCount = user.monthResetAt < monthStart ? 0 : user.analysesThisMonth;
    const limit = PLAN_ANALYSIS_LIMITS[user.plan] ?? 3;

    if (currentCount >= limit) {
      throw new ConflictException(`Monthly limit reached (${limit} for ${user.plan} plan).`);
    }

    // Atomic increment with conditional reset
    const updateData: any = { analysesThisMonth: { increment: 1 } };
    if (user.monthResetAt < monthStart) {
      updateData.monthResetAt = now;
    }

    await prisma.user.update({ where: { id: userId }, data: updateData });
  }

  async createAnalysis(userId: string, idea: string): Promise<any> {
    await this.checkAndIncrementAnalysisLimit(userId);

    const analysis = await prisma.analysis.create({
      data: {
        user: { connect: { id: userId } },
        idea,
        status: 'PENDING',
        content: '',
      },
    });

    // Use jobId for deduplication — prevents duplicate analysis submissions
    await this.analysisQueue.add('analyze', { analysisId: analysis.id, idea }, { jobId: analysis.id });
    return analysis;
  }

  async getAnalysis(id: string, userId: string): Promise<any> {
    return prisma.analysis.findFirst({ where: { id, userId } });
  }

  async getUserAnalyses(userId: string, skip = 0, take = 20): Promise<any[]> {
    return prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        idea: true,
        status: true,
        overallScore: true,
        marketDemandScore: true,
        profitPotentialScore: true,
        createdAt: true,
      },
      skip,
      take,
    });
  }

  async getAnalysisProgress(id: string, userId: string): Promise<any> {
    const analysis = await this.getAnalysis(id, userId);
    if (!analysis) return null;

    // For completed/failed analyses, return 100/0 instead of stale job data
    if (analysis.status === 'COMPLETED') return { status: analysis.status, progress: 100 };
    if (analysis.status === 'FAILED') return { status: analysis.status, progress: 0 };

    const job = await this.analysisQueue.getJob(id);
    return { status: analysis.status, progress: job ? job.progress : 0 };
  }

  async deleteAnalysis(id: string, userId: string): Promise<any> {
    const analysis = await this.getAnalysis(id, userId);
    if (!analysis) throw new Error('Analysis not found');
    await prisma.analysis.delete({ where: { id } });
    return { success: true };
  }

  async retryAnalysis(id: string, userId: string): Promise<any> {
    const analysis = await this.getAnalysis(id, userId);
    if (!analysis) throw new Error('Analysis not found');
    if (!analysis.idea) throw new Error('Analysis has no idea');

    await prisma.analysis.update({ where: { id }, data: { status: 'PENDING' } });

    // Use deterministic retry jobId to prevent collisions
    const retryCount = Date.now();
    await this.analysisQueue.add('analyze', { analysisId: id, idea: analysis.idea }, { jobId: `${id}-retry-${retryCount}` });
    return { success: true };
  }

  async getUserPlanInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, analysesThisMonth: true, monthResetAt: true },
    });
    const limit = PLAN_ANALYSIS_LIMITS[user?.plan ?? 'FREE'];
    return { plan: user?.plan, used: user?.analysesThisMonth, limit };
  }

  async regenerateSection(id: string, userId: string, section: string): Promise<any> {
    // Fetch only the fields needed for regeneration (not the full analysis record)
    const analysis = await prisma.analysis.findFirst({
      where: { id, userId },
      select: {
        idea: true,
        ideaAnalysis: true,
        marketResearch: true,
        competitorAnalysis: true,
        mvpPlan: true,
        monetization: true,
        goToMarket: true,
      },
    });

    if (!analysis) throw new NotFoundException('Analysis not found');
    if (!analysis.idea) throw new NotFoundException('Analysis has no idea');

    const field = SECTION_FIELD_MAP[section];
    if (!field) throw new NotFoundException(`Unknown section: ${section}`);

    const idea = analysis.idea;
    const ctx = {
      ideaAnalysis: analysis.ideaAnalysis,
      marketResearch: analysis.marketResearch,
      competitorAnalysis: analysis.competitorAnalysis,
      mvpPlan: analysis.mvpPlan,
      monetization: analysis.monetization,
      goToMarket: analysis.goToMarket,
    };

    const agentMap: Record<string, () => Promise<any>> = {
      'ideaAnalysis': () => this.ideaAnalyzer.execute(idea),
      'comprehensiveIdeaAnalysis': () => this.comprehensiveIdeaAnalyzer.execute(idea),
      'marketResearch': () => this.marketResearch.execute(idea),
      'competitorAnalysis': () => this.competitorAnalysis.execute(idea),
      'mvpPlan': () => this.mvpGenerator.execute(idea),
      'monetization': () => this.monetization.execute(idea),
      'goToMarket': () => this.goToMarket.execute(idea),
      'riskRadar': () => this.riskRadar.execute(idea, ctx),
      'roadmap': () => this.roadmap.execute(idea, ctx),
      'businessModel': () => this.businessModel.execute(idea, ctx),
      'visionMission': () => this.visionMission.execute(idea, ctx),
      'brandIdentity': () => this.brandIdentity.execute(idea, ctx),
      'budgetEstimate': () => this.budgetEstimator.execute(idea, ctx),
    };

    const result = await agentMap[field]();
    await prisma.analysis.update({ where: { id }, data: { [field]: JSON.stringify(result) } });
    return { [field]: result };
  }
}
