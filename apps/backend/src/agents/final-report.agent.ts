import { Injectable } from '@nestjs/common';
import { FinalReport } from '../../../packages/shared/src';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class FinalReportAgent implements Agent<FinalReport> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context: any): Promise<FinalReport> {
    const prompt = `You are a venture capital startup analyst.

Combine the following analyses into a professional startup report.

Sections:

1. Idea Summary
2. Problem
3. Target Market
4. Market Analysis
5. Competitors
6. MVP
7. Monetization
8. Go To Market
9. Risks
10. Final Verdict
11. Score (marketDemand, competition, executionDifficulty, profitPotential, overall out of 10)

Data:

Idea: ${idea}

Idea Analysis: ${JSON.stringify(context.ideaAnalysis)}

Market Research: ${JSON.stringify(context.marketResearch)}

Competitors: ${JSON.stringify(context.competitorAnalysis)}

MVP: ${JSON.stringify(context.mvpPlan)}

Monetization: ${JSON.stringify(context.monetization)}

Go-To-Market: ${JSON.stringify(context.goToMarket)}

Return JSON format:
{
  "ideaSummary": "...",
  "problem": "...",
  "targetMarket": "...",
  "marketAnalysis": "...",
  "competitors": "...",
  "mvp": "...",
  "monetization": "...",
  "goToMarket": "...",
  "risks": ["..."],
  "verdict": "...",
  "score": {
    "marketDemand": 8,
    "competition": 6,
    "executionDifficulty": 7,
    "profitPotential": 9,
    "overall": 7.5
  }
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<FinalReport>(response);
  }
}
