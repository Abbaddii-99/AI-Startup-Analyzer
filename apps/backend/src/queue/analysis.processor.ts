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
import { isAIGroundingEnabled, isRuleGroundingEnabled } from '../config/grounding-flags';
import { logAIEvent } from '../utils/ai-logger';
import { canRunAIGrounding } from '../config/grounding-limits';

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

      // Run advanced agents in parallel with allSettled to handle partial failures
      const [finalReportResult, riskRadarResult, roadmapResult, businessModelResult, visionMissionResult, brandIdentityResult, budgetEstimateResult] =
        await Promise.allSettled([
          this.finalReport.execute(idea, agentResults),
          this.riskRadar.execute(idea, agentResults),
          this.roadmap.execute(idea, agentResults),
          this.businessModel.execute(idea, agentResults),
          this.visionMission.execute(idea, agentResults),
          this.brandIdentity.execute(idea, agentResults),
          this.budgetEstimator.execute(idea, agentResults),
        ]);

      // Extract successful results, log failures but continue
      const getResult = <T>(result: PromiseSettledResult<T>, name: string): T | null => {
        if (result.status === 'fulfilled') return result.value;
        this.logger.warn(`Agent ${name} failed: ${result.reason?.message ?? 'unknown'}`);
        return null;
      };

      const finalReportResultValue = getResult(finalReportResult, 'FinalReport');
      const riskRadarData = getResult(riskRadarResult, 'RiskRadar');
      const roadmapData = getResult(roadmapResult, 'Roadmap');
      const businessModelData = getResult(businessModelResult, 'BusinessModel');
      const visionMissionData = getResult(visionMissionResult, 'VisionMission');
      const brandIdentityData = getResult(brandIdentityResult, 'BrandIdentity');
      const budgetEstimateData = getResult(budgetEstimateResult, 'BudgetEstimator');

      if (!finalReportResultValue) {
        throw new Error('Final report generation failed — cannot complete analysis without it');
      }

      let aiGroundingCalls = 0;
      const beforeProcessing = toProcessingResult(finalReportResultValue.report);
      const quality = evaluateFinalReportQuality(beforeProcessing);
      const strategy = decideGroundingStrategy({
        quality: {
          shouldGround: quality.shouldGround,
          reason: toStrategyReason(quality.reason),
        },
      });

      let selectedFinalReportResult = finalReportResultValue;
      let groundingExecuted = false;

      if (strategy.useRuleBased && isRuleGroundingEnabled()) {
        const adaptiveFinalReportResult = await adaptiveGroundingTrigger(selectedFinalReportResult, {
          attemptNumber: 1,
          onLog: (event) => {
            logAIEvent({
              stage: 'grounding',
              type: 'rule_used',
              reason: event.reason,
              confidenceBefore: beforeProcessing.confidence,
              confidenceAfter: beforeProcessing.confidence,
              metadata: {
                attemptNumber: event.attemptNumber,
                sourceReportHash: event.sourceReportHash.slice(0, 12),
                resultReportHash: event.resultReportHash.slice(0, 12),
                mode: 'RULE',
              },
              timestamp: Date.now(),
            });
          },
        });
        selectedFinalReportResult = {
          report: adaptiveFinalReportResult.report,
          quality: selectedFinalReportResult.quality,
        };
        groundingExecuted = true;
      } else if (strategy.useRuleBased && !isRuleGroundingEnabled()) {
        logAIEvent({
          stage: 'grounding',
          type: 'skipped',
          reason: 'flag_disabled',
          metadata: { type: 'RULE' },
          timestamp: Date.now(),
        });
      } else if (strategy.useAIGrounding && isAIGroundingEnabled()) {
        if (!canRunAIGrounding(aiGroundingCalls)) {
          logAIEvent({
            stage: 'grounding',
            type: 'skipped',
            reason: 'ai_limit_reached',
            timestamp: Date.now(),
          });
        } else {
          const aiGrounded = await enhanceFinalReportWithAI(selectedFinalReportResult.report, this.ai);
          aiGroundingCalls++;
          logAIEvent({
            stage: 'grounding',
            type: 'ai_used',
            reason: aiGrounded.notes ?? strategy.reason,
            confidenceBefore: beforeProcessing.confidence,
            confidenceAfter: beforeProcessing.confidence,
            metadata: { mode: 'AI' },
            timestamp: Date.now(),
          });
          selectedFinalReportResult = {
            report: aiGrounded.groundedReport,
            quality: selectedFinalReportResult.quality,
          };
          groundingExecuted = true;
        }
      } else if (strategy.useAIGrounding && !isAIGroundingEnabled()) {
        logAIEvent({
          stage: 'grounding',
          type: 'skipped',
          reason: 'flag_disabled',
          metadata: { type: 'AI' },
          timestamp: Date.now(),
        });
      }

      if (groundingExecuted) {
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
        logAIEvent({
          stage: 'effectiveness',
          type: 'evaluation',
          confidenceBefore: beforeProcessing.confidence,
          confidenceAfter: afterProcessing.confidence,
          issuesBefore: beforeProcessing.issues.length,
          issuesAfter: afterProcessing.issues.length,
          severityBefore: beforeSeverity,
          severityAfter: afterSeverity,
          metadata: {
            confidenceDelta: signedConfidenceDelta,
            issuesDelta: effectiveness.issuesDelta,
            severityImproved: effectiveness.severityImproved,
          },
          timestamp: Date.now(),
        });
      }

      const finalReportData = selectedFinalReportResult.report;
      await job.updateProgress(98);

      // Run comprehensive idea analysis after all other agents
      const comprehensiveResult = await this.comprehensiveIdeaAnalyzer.execute(idea, agentResults);

      await prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          ideaAnalysis: JSON.stringify(agentResults.ideaAnalysis),
          comprehensiveIdeaAnalysis: JSON.stringify(comprehensiveResult),
          marketResearch: JSON.stringify(agentResults.marketResearch),
          competitorAnalysis: JSON.stringify(agentResults.competitorAnalysis),
          mvpPlan: JSON.stringify(agentResults.mvpPlan),
          monetization: JSON.stringify(agentResults.monetization),
          goToMarket: JSON.stringify(agentResults.goToMarket),
          finalReport: JSON.stringify(finalReportData),
          riskRadar: riskRadarData ? JSON.stringify(riskRadarData) : null,
          roadmap: roadmapData ? JSON.stringify(roadmapData) : null,
          businessModel: businessModelData ? JSON.stringify(businessModelData) : null,
          visionMission: visionMissionData ? JSON.stringify(visionMissionData) : null,
          brandIdentity: brandIdentityData ? JSON.stringify(brandIdentityData) : null,
          budgetEstimate: budgetEstimateData ? JSON.stringify(budgetEstimateData) : null,
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

  /**
   * Run the first 6 independent agents in parallel with progress updates.
   * These agents all depend only on the raw idea, not on each other's output.
   */
  private async runAgentsWithProgress(job: Job, idea: string) {
    // Run all 6 core agents concurrently
    const [ideaAnalysis, marketResearch, competitorAnalysis, mvpPlan, monetization, goToMarket] =
      await Promise.all([
        this.ideaAnalyzer.execute(idea),
        this.marketResearch.execute(idea),
        this.competitorAnalysis.execute(idea),
        this.mvpGenerator.execute(idea),
        this.monetization.execute(idea),
        this.goToMarket.execute(idea),
      ]);

    await job.updateProgress(89);

    return {
      ideaAnalysis,
      marketResearch,
      competitorAnalysis,
      mvpPlan,
      monetization,
      goToMarket,
    } as {
      ideaAnalysis: any;
      marketResearch: any;
      competitorAnalysis: any;
      mvpPlan: any;
      monetization: any;
      goToMarket: any;
    };
  }
}
