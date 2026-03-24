import { Injectable } from '@nestjs/common';
import { AgentInterface } from './agent.interface';
import { prisma } from '../prisma';
import { Analysis } from '@prisma/client';
import { AIService } from './ai.service';

@Injectable()
export class IdeaAnalyzerAgent implements AgentInterface {
  constructor(
    private readonly aiService: AIService,
  ) {}

  async execute(idea: string, context?: any): Promise<any> {
    const prompt = `
Analyze this startup idea:

Idea: ${idea}

${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}

Provide a detailed analysis including:
1. Problem statement validation
2. Solution approach assessment
3. Market potential evaluation
4. Competitive advantage analysis
5. Implementation feasibility
6. Risk factors
7. Recommendations
8. Overall score (1-10)

Format the response as JSON with these sections.
`;

    const response = await this.aiService.generate(prompt);
    return this.aiService.parseJSON(response);
  }
}