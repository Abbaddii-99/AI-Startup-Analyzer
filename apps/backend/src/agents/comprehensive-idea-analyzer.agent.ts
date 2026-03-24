import { Injectable } from '@nestjs/common';
import { AgentInterface } from './agent.interface';
import { PrismaService } from '../prisma';
import { Analysis, AnalysisStatus } from '@prisma/client';
import { OpenAIService } from './ai.service';
import { AnalysisDto } from '../analysis/analysis.dto';

@Injectable()
export class ComprehensiveIdeaAnalyzerAgent implements AgentInterface {
  constructor(
    private readonly prisma: PrismaService,
    private readonly openAiService: OpenAIService,
  ) {}

  async process(analysisId: string): Promise<void> {
    try {
      // Get the analysis with all related data
      const analysis = await this.prisma.analysis.findUnique({
        where: { id: analysisId },
        include: {
          idea: true,
          targetAudience: true,
          competitorAnalysis: true,
          marketResearch: true,
          budgetEstimate: true,
          riskRadar: true,
          businessModel: true,
          visionMission: true,
          brandIdentity: true,
          goToMarket: true,
          financialPlan: true,
          finalReport: true,
        },
      });

      if (!analysis) {
        throw new Error(`Analysis with ID ${analysisId} not found`);
      }

      // Prepare data for analysis
      const analysisData = this.prepareAnalysisData(analysis);

      // Generate comprehensive idea analysis
      const analysisResult = await this.generateIdeaAnalysis(analysisData);

      // Update the analysis with the results
      await this.prisma.analysis.update({
        where: { id: analysisId },
        data: {
          comprehensiveIdeaAnalysis: analysisResult,
          status: AnalysisStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      console.log(`Comprehensive idea analysis completed for analysis ID: ${analysisId}`);
    } catch (error) {
      console.error(`Error processing comprehensive idea analysis for ID ${analysisId}:`, error);
      throw error;
    }
  }

  private prepareAnalysisData(analysis: Analysis & {
    idea: any;
    targetAudience: any;
    competitorAnalysis: any;
    marketResearch: any;
    budgetEstimate: any;
    riskRadar: any;
    businessModel: any;
    visionMission: any;
    brandIdentity: any;
    goToMarket: any;
    financialPlan: any;
    finalReport: any;
  }): any {
    return {
      idea: analysis.idea,
      targetAudience: analysis.targetAudience,
      competitorAnalysis: analysis.competitorAnalysis,
      marketResearch: analysis.marketResearch,
      budgetEstimate: analysis.budgetEstimate,
      riskRadar: analysis.riskRadar,
      businessModel: analysis.businessModel,
      visionMission: analysis.visionMission,
      brandIdentity: analysis.brandIdentity,
      goToMarket: analysis.goToMarket,
      financialPlan: analysis.financialPlan,
      finalReport: analysis.finalReport,
    };
  }

  private async generateIdeaAnalysis(analysisData: any): Promise<any> {
    const prompt = this.buildAnalysisPrompt(analysisData);
    
    const response = await this.openAiService.generateContent({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert startup idea analyst. Your task is to provide a comprehensive analysis of startup ideas based on all available data including market research, competitor analysis, target audience, financial projections, and business model. 

Provide a detailed analysis that includes:
1. Overall idea viability assessment
2. Market opportunity evaluation
3. Competitive landscape analysis
4. Target audience fit assessment
5. Financial feasibility analysis
6. Risk assessment
7. Recommendations for improvement
8. Final recommendation score (1-10)

Focus on providing actionable insights and specific recommendations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    return {
      overallViability: this.extractOverallViability(response),
      marketOpportunity: this.extractMarketOpportunity(response),
      competitiveAnalysis: this.extractCompetitiveAnalysis(response),
      targetAudienceFit: this.extractTargetAudienceFit(response),
      financialFeasibility: this.extractFinancialFeasibility(response),
      riskAssessment: this.extractRiskAssessment(response),
      recommendations: this.extractRecommendations(response),
      finalScore: this.extractFinalScore(response),
      detailedAnalysis: response,
      generatedAt: new Date().toISOString(),
    };
  }

  private buildAnalysisPrompt(analysisData: any): string {
    return `
Please analyze this startup idea comprehensively:

## Startup Idea
${JSON.stringify(analysisData.idea, null, 2)}

## Target Audience Analysis
${JSON.stringify(analysisData.targetAudience, null, 2)}

## Competitor Analysis
${JSON.stringify(analysisData.competitorAnalysis, null, 2)}

## Market Research
${JSON.stringify(analysisData.marketResearch, null, 2)}

## Budget Estimate
${JSON.stringify(analysisData.budgetEstimate, null, 2)}

## Risk Assessment
${JSON.stringify(analysisData.riskRadar, null, 2)}

## Business Model
${JSON.stringify(analysisData.businessModel, null, 2)}

## Vision & Mission
${JSON.stringify(analysisData.visionMission, null, 2)}

## Brand Identity
${JSON.stringify(analysisData.brandIdentity, null, 2)}

## Go-to-Market Strategy
${JSON.stringify(analysisData.goToMarket, null, 2)}

## Financial Plan
${JSON.stringify(analysisData.financialPlan, null, 2)}

## Final Report
${JSON.stringify(analysisData.finalReport, null, 2)}

Please provide a comprehensive analysis with specific scores, recommendations, and actionable insights.
`;
  }

  private extractOverallViability(response: string): any {
    // Extract overall viability assessment from the response
    const viabilityMatch = response.match(/Overall Viability:[\s\S]*?Market Opportunity:/i);
    return {
      score: this.extractScore(response, 'Overall Viability'),
      assessment: viabilityMatch ? viabilityMatch[0].replace('Market Opportunity:', '').trim() : 'Unable to extract',
      strengths: this.extractList(response, 'Strengths:'),
      weaknesses: this.extractList(response, 'Weaknesses:'),
    };
  }

  private extractMarketOpportunity(response: string): any {
    const marketMatch = response.match(/Market Opportunity:[\s\S]*?Competitive Analysis:/i);
    return {
      score: this.extractScore(response, 'Market Opportunity'),
      assessment: marketMatch ? marketMatch[0].replace('Competitive Analysis:', '').trim() : 'Unable to extract',
      marketSize: this.extractValue(response, 'Market Size:'),
      growthPotential: this.extractValue(response, 'Growth Potential:'),
      timing: this.extractValue(response, 'Timing:'),
    };
  }

  private extractCompetitiveAnalysis(response: string): any {
    const compMatch = response.match(/Competitive Analysis:[\s\S]*?Target Audience Fit:/i);
    return {
      score: this.extractScore(response, 'Competitive Analysis'),
      assessment: compMatch ? compMatch[0].replace('Target Audience Fit:', '').trim() : 'Unable to extract',
      competitiveAdvantage: this.extractValue(response, 'Competitive Advantage:'),
      barriersToEntry: this.extractValue(response, 'Barriers to Entry:'),
      differentiation: this.extractList(response, 'Differentiation:'),
    };
  }

  private extractTargetAudienceFit(response: string): any {
    const audienceMatch = response.match(/Target Audience Fit:[\s\S]*?Financial Feasibility:/i);
    return {
      score: this.extractScore(response, 'Target Audience Fit'),
      assessment: audienceMatch ? audienceMatch[0].replace('Financial Feasibility:', '').trim() : 'Unable to extract',
      audienceUnderstanding: this.extractValue(response, 'Audience Understanding:'),
      painPointsAddressed: this.extractList(response, 'Pain Points Addressed:'),
      valueProposition: this.extractValue(response, 'Value Proposition:'),
    };
  }

  private extractFinancialFeasibility(response: string): any {
    const financialMatch = response.match(/Financial Feasibility:[\s\S]*?Risk Assessment:/i);
    return {
      score: this.extractScore(response, 'Financial Feasibility'),
      assessment: financialMatch ? financialMatch[0].replace('Risk Assessment:', '').trim() : 'Unable to extract',
      revenuePotential: this.extractValue(response, 'Revenue Potential:'),
      costStructure: this.extractValue(response, 'Cost Structure:'),
      breakEvenAnalysis: this.extractValue(response, 'Break-even Analysis:'),
      roiPotential: this.extractValue(response, 'ROI Potential:'),
    };
  }

  private extractRiskAssessment(response: string): any {
    const riskMatch = response.match(/Risk Assessment:[\s\S]*?Recommendations:/i);
    return {
      score: this.extractScore(response, 'Risk Assessment'),
      assessment: riskMatch ? riskMatch[0].replace('Recommendations:', '').trim() : 'Unable to extract',
      highRiskFactors: this.extractList(response, 'High Risk Factors:'),
      mitigationStrategies: this.extractList(response, 'Mitigation Strategies:'),
      probabilityOfSuccess: this.extractValue(response, 'Probability of Success:'),
    };
  }

  private extractRecommendations(response: string): any {
    const recMatch = response.match(/Recommendations:[\s\S]*?Final Recommendation Score:/i);
    return {
      priority: this.extractList(response, 'Priority Recommendations:'),
      quickWins: this.extractList(response, 'Quick Wins:'),
      longTermStrategies: this.extractList(response, 'Long-term Strategies:'),
      assessment: recMatch ? recMatch[0].replace('Final Recommendation Score:', '').trim() : 'Unable to extract',
    };
  }

  private extractFinalScore(response: string): number {
    return this.extractScore(response, 'Final Recommendation Score') || 5;
  }

  private extractScore(response: string, section: string): number {
    const match = response.match(new RegExp(`${section}:.*?(\\d+(?:\\.\\d+)?)`, 'i'));
    return match ? parseFloat(match[1]) : 5;
  }

  private extractValue(response: string, key: string): string {
    const match = response.match(new RegExp(`${key}:(.*?)(?:\\n|$)`, 'i'));
    return match ? match[1].trim() : '';
  }

  private extractList(response: string, key: string): string[] {
    const match = response.match(new RegExp(`${key}:[\\s\\S]*?(?=\\n\\w+:|$)`, 'i'));
    if (!match) return [];
    
    const listText = match[0].replace(key + ':', '').trim();
    return listText.split(/[\n-]/)
      .map(item => item.trim())
      .filter(item => item.length > 0 && !item.match(/^\w+:/));
  }
}