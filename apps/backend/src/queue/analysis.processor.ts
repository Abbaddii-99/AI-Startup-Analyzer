import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import {
  computeNormalizationConfidence,
  normalizeFinalReport,
  validateFinalReportDetailed,
} from '@ai-analyzer/shared';
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
import { AIService } from '../agents/ai.service';
import { adaptiveGroundingTrigger } from '../agents/final-report.adaptive-grounding';
import { trackGroundingEffectiveness } from '../agents/final-report-grounding-effectiveness';
import {
  evaluateFinalReportQuality,
  type FinalReportProcessingResult,
} from '../agents/final-report-quality';
import { decideGroundingStrategy } from '../agents/final-report.grounding-strategy';
import { enhanceFinalReportWithAI } from '../agents/final-report.ai-grounding';

function sanitizeIdea(idea: string): string {
  return idea
    .trim()
    .slice(0, 2000)
    .replace(/[<>"'`]/g, '')
    .replace(/ignore\s+(previous|above|all)\s+instructions?/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/\\n|\\r/g, ' ');
}

function toProcessingResult(report: unknown): FinalReportProcessingResult {
  const normalized = normalizeFinalReport(report);
  const validation = validateFinalReportDetailed(normalized.draft);
  return {
    confidence: computeNormalizationConfidence(normalized.report),
    highestSeverity: validation.highestSeverity,
    issues: validation.issues,
    outcome: validation.issues.length > 0 ? 'ACCEPT_WITH_WARNINGS' : 'ACCEPT_CLEAN',
  };
}

function toStrategyReason(qualityReason: string): string {
  const normalized = qualityReason.toLowerCase();
  if (normalized.includes('confidence below threshold')) return 'low confidence';
  if (normalized.includes('high issue count')) return 'too many issues';
  return qualityReason;
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
    private ai: AIService,
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

      const [finalReportResult, riskRadarData, roadmapData, businessModelData, visionMissionData, brandIdentityData, budgetEstimateData] = await Promise.all([
        this.finalReport.execute(idea, agentResults),
        this.riskRadar.execute(idea, agentResults),
        this.roadmap.execute(idea, agentResults),
        this.businessModel.execute(idea, agentResults),
        this.visionMission.execute(idea, agentResults),
        this.brandIdentity.execute(idea, agentResults),
        this.budgetEstimator.execute(idea, agentResults),
      ]);
      const beforeProcessing = toProcessingResult(finalReportResult.report);
      const quality = evaluateFinalReportQuality(beforeProcessing);
      const strategy = decideGroundingStrategy({
        quality: {
          shouldGround: quality.shouldGround,
          reason: toStrategyReason(quality.reason),
        },
      });

      let selectedFinalReportResult = {
        report: finalReportResult.report,
        quality,
      };

      if (strategy.useRuleBased) {
        const adaptiveFinalReportResult = await adaptiveGroundingTrigger(selectedFinalReportResult, {
          attemptNumber: 1,
          onLog: (event) => {
            this.logger.log(
              `FinalReport grounding ${event.action} attempt=${event.attemptNumber} reason=${event.reason} hash=${event.sourceReportHash.slice(0, 12)}=>${event.resultReportHash.slice(0, 12)}`,
            );
          },
        });
        selectedFinalReportResult = {
          report: adaptiveFinalReportResult.report,
          quality: selectedFinalReportResult.quality,
        };
      } else if (strategy.useAIGrounding) {
        const aiGrounded = await enhanceFinalReportWithAI(selectedFinalReportResult.report, this.ai);
        this.logger.log(`FinalReport AI grounding applied: ${aiGrounded.notes ?? 'no notes'}`);
        selectedFinalReportResult = {
          report: aiGrounded.groundedReport,
          quality: selectedFinalReportResult.quality,
        };
      }

      if (strategy.useRuleBased || strategy.useAIGrounding) {
        const afterProcessing = toProcessingResult(selectedFinalReportResult.report);
        const effectiveness = trackGroundingEffectiveness({
          before: beforeProcessing,
          after: afterProcessing,
        });
        const signedConfidenceDelta = effectiveness.confidenceDelta >= 0
          ? `+${effectiveness.confidenceDelta.toFixed(2)}`
          : effectiveness.confidenceDelta.toFixed(2);
        const beforeSeverity = beforeProcessing.highestSeverity ?? 'NONE';
        const afterSeverity = afterProcessing.highestSeverity ?? 'NONE';
        this.logger.log(
          `[GroundingEffectiveness] confidence: ${beforeProcessing.confidence.toFixed(2)} → ${afterProcessing.confidence.toFixed(2)} confidenceDelta: ${signedConfidenceDelta} issues: ${beforeProcessing.issues.length} → ${afterProcessing.issues.length} issuesDelta: ${effectiveness.issuesDelta} severity: ${beforeSeverity} → ${afterSeverity} severityImproved: ${effectiveness.severityImproved}`,
        );
      }

      const finalReportData = selectedFinalReportResult.report;
      await job.updateProgress(98);

      // Run comprehensive idea analysis after all other agents
      const comprehensiveResult = await this.comprehensiveIdeaAnalyzer.execute(idea, agentResults);

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          ideaAnalysis: agentResults.ideaAnalysis as any,
          comprehensiveIdeaAnalysis: comprehensiveResult as any,
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
