import { Injectable } from '@nestjs/common';
import { MVPPlan, wrapUserInput } from '@ai-analyzer/shared';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

@Injectable()
export class MVPGeneratorAgent implements Agent<MVPPlan> {
  constructor(private ai: AIService) {}

  async execute(idea: string): Promise<MVPPlan> {
    const prompt = `You are a startup product manager. Respond in the same language as the startup idea.

Design a detailed MVP plan for this idea:

${wrapUserInput(idea)}

Return ONLY valid JSON in this exact format:
{
  "productName": "short product name",
  "tagline": "one-line description of what the product does",
  "coreFeatures": [
    { "title": "Feature name", "description": "What it does and why it matters", "priority": "Must Have" }
  ],
  "feedbackLoops": [
    { "title": "Loop name", "description": "How this feedback loop works", "method": "in-app survey" }
  ],
  "kpis": [
    { "title": "KPI name", "target": "> 100", "description": "What this measures", "timeframe": "Month 1" }
  ],
  "iterationStrategy": "How to improve the product based on feedback",
  "feasibilityChecks": [
    { "question": "Is X feasible?", "answer": "Yes because...", "risk": "Low" }
  ],
  "keyMilestones": [
    { "week": "Week 2", "title": "Milestone title", "description": "What gets achieved" }
  ],
  "developmentComplexity": "Medium",
  "estimatedTime": "3-4 months"
}

Rules:
- coreFeatures: 4-6 items, mix of Must Have / Should Have / Nice to Have
- feedbackLoops: exactly 4 items
- kpis: exactly 4 items with specific numeric targets
- feasibilityChecks: 4-5 critical questions about legal, data, tech, competition
- keyMilestones: exactly 4 critical milestones with specific week numbers
- All text in the same language as the idea`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<MVPPlan>(response);
  }
}
