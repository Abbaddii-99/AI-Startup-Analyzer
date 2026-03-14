import { Injectable } from '@nestjs/common';
import { MarketResearch } from '../../../packages/shared/src';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class MarketResearchAgent implements Agent<MarketResearch> {
  constructor(private ai: AIService) {}

  async execute(idea: string): Promise<MarketResearch> {
    const prompt = `You are a startup market researcher.

Based on this startup idea:

${idea}

Analyze:

1. market demand
2. TAM (total addressable market)
3. SAM
4. SOM
5. industry growth trends
6. geographic opportunities

Explain your reasoning.

Return JSON format:
{
  "marketDemand": "...",
  "tam": "...",
  "sam": "...",
  "som": "...",
  "growthTrends": ["..."],
  "geographicOpportunities": ["..."]
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<MarketResearch>(response);
  }
}
