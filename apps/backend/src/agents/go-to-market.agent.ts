import { Injectable } from '@nestjs/common';
import { GoToMarketStrategy, wrapUserInput } from '@ai-analyzer/shared';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class GoToMarketAgent implements Agent<GoToMarketStrategy> {
  constructor(private ai: AIService) {}

  async execute(idea: string): Promise<GoToMarketStrategy> {
    const prompt = `You are a startup growth strategist. Respond in the same language as the startup idea.

Explain how to launch this startup and get the first 100 users.

Idea:
${wrapUserInput(idea)}

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
