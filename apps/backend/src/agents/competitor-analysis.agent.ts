import { Injectable } from '@nestjs/common';
import { CompetitorAnalysis } from '../../../packages/shared/src';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class CompetitorAnalysisAgent implements Agent<CompetitorAnalysis> {
  constructor(private ai: AIService) {}

  async execute(idea: string): Promise<CompetitorAnalysis> {
    const prompt = `You are a startup competitor analyst.

Analyze the competitors for this startup idea:

${idea}

Return:

1. direct competitors
2. indirect competitors

For each competitor include:

- name
- what they do
- strengths
- weaknesses
- pricing if known

Return JSON format:
{
  "directCompetitors": [
    {
      "name": "...",
      "description": "...",
      "strengths": ["..."],
      "weaknesses": ["..."],
      "pricing": "..."
    }
  ],
  "indirectCompetitors": [...]
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<CompetitorAnalysis>(response);
  }
}
