import { Injectable } from '@nestjs/common';
import { AgentInterface } from './agent.interface';
import { prisma } from '../prisma';
import { Analysis } from '@prisma/client';
import { AIService } from './ai.service';

@Injectable()
export class ComprehensiveIdeaAnalyzerAgent implements AgentInterface {
  constructor(
    private readonly aiService: AIService,
  ) {}

  async execute(idea: string, context?: any): Promise<any> {
    const prompt = `
Analyze this startup idea comprehensively:

Idea: ${idea}

${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}

Provide a detailed analysis including:
1. Overall viability assessment
2. Market opportunity evaluation
3. Competitive landscape analysis
4. Target audience fit assessment
5. Financial feasibility analysis
6. Risk assessment
7. Recommendations for improvement
8. Final recommendation score (1-10)

Format the response as JSON with these sections.
`;

    const response = await this.aiService.generate(prompt);
    return this.aiService.parseJSON(response);
  }
}