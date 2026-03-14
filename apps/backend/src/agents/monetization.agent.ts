import { Injectable } from '@nestjs/common';
import { MonetizationStrategy } from '../../../packages/shared/src';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class MonetizationAgent implements Agent<MonetizationStrategy> {
  constructor(private ai: AIService) {}

  async execute(idea: string): Promise<MonetizationStrategy> {
    const prompt = `You are a SaaS monetization strategist.

For this startup idea:

${idea}

Suggest revenue models:

- subscription
- freemium
- usage based
- enterprise licensing

Explain which one is best and why.

Return JSON format:
{
  "recommendedModel": "subscription",
  "reasoning": "...",
  "pricingTiers": [
    {
      "name": "Basic",
      "price": "$9/month",
      "features": ["..."]
    }
  ]
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<MonetizationStrategy>(response);
  }
}
