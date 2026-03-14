import { Injectable } from '@nestjs/common';
import { IdeaAnalysis } from '../../../packages/shared/src';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class IdeaAnalyzerAgent implements Agent<IdeaAnalysis> {
  constructor(private ai: AIService) {}

  async execute(idea: string): Promise<IdeaAnalysis> {
    const prompt = `You are a startup idea analyst.

Analyze the following startup idea and extract:

1. idea summary
2. core problem
3. target users
4. industry
5. possible use cases

Startup idea:
${idea}

Return structured output in JSON format:
{
  "summary": "...",
  "coreProblem": "...",
  "targetUsers": ["..."],
  "industry": "...",
  "useCases": ["..."]
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<IdeaAnalysis>(response);
  }
}
