import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface BusinessModelMatch {
  name: string;
  description: string;
  fitScore: number;
  reason: string;
  examples: string[];
}

export interface BusinessModelAnalysis {
  matchedCount: number;
  totalModels: number;
  topMatches: BusinessModelMatch[];
  primaryModel: string;
  summary: string;
}

const TOTAL_MODELS = 43;

@Injectable()
export class BusinessModelAgent implements Agent<BusinessModelAnalysis> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context?: any): Promise<BusinessModelAnalysis> {
    const prompt = `You are a business model expert. Respond in the same language as the startup idea.

Analyze this startup idea and identify the best matching business models from the 43 known business model patterns.

Startup idea: ${idea}

${context?.monetization ? `Monetization context: ${JSON.stringify(context.monetization)}` : ''}

Select the top 4-5 most fitting business models and estimate how many of the 43 total models are compatible.

Known business model categories include: SaaS, Marketplace, Freemium, Subscription, Usage-based, Enterprise, Platform, API-as-a-Service, White-label, Franchise, Affiliate, Advertising, Data monetization, Community, Open-source, etc.

Return ONLY valid JSON:
{
  "matchedCount": 12,
  "totalModels": 43,
  "topMatches": [
    {
      "name": "SaaS",
      "description": "Software delivered as a service via subscription",
      "fitScore": 9,
      "reason": "why this model fits the idea",
      "examples": ["Salesforce", "Slack"]
    }
  ],
  "primaryModel": "SaaS",
  "summary": "one sentence about the best business model fit"
}`;

    const response = await this.ai.generate(prompt);
    const result = this.ai.parseJSON<BusinessModelAnalysis>(response);
    result.totalModels = TOTAL_MODELS;
    return result;
  }
}
