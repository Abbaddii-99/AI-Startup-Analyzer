import { Injectable } from '@nestjs/common';
import { GoToMarketStrategy } from '../../../packages/shared/src';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class GoToMarketAgent implements Agent<GoToMarketStrategy> {
  constructor(private ai: AIService) {}

  async execute(idea: string): Promise<GoToMarketStrategy> {
    const prompt = `You are a startup growth strategist.

Explain how to launch this startup and get the first 100 users.

Idea:
${idea}

Include:

- marketing channels
- communities
- partnerships
- growth hacks

Return JSON format:
{
  "marketingChannels": ["..."],
  "communities": ["..."],
  "partnerships": ["..."],
  "growthHacks": ["..."]
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<GoToMarketStrategy>(response);
  }
}
