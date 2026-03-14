import { Injectable } from '@nestjs/common';
import { MVPPlan } from '../../../packages/shared/src';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class MVPGeneratorAgent implements Agent<MVPPlan> {
  constructor(private ai: AIService) {}

  async execute(idea: string): Promise<MVPPlan> {
    const prompt = `You are a startup product manager.

Design the simplest MVP for this idea:

${idea}

Return:

1. core features
2. user flow
3. basic system architecture
4. development complexity (Low/Medium/High)
5. estimated time to build

Return JSON format:
{
  "coreFeatures": ["..."],
  "userFlow": ["..."],
  "systemArchitecture": "...",
  "developmentComplexity": "Medium",
  "estimatedTime": "..."
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<MVPPlan>(response);
  }
}
