import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface RiskItem {
  id: number;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
}

export interface RiskRadar {
  risks: RiskItem[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
}

@Injectable()
export class RiskRadarAgent implements Agent<RiskRadar> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context?: any): Promise<RiskRadar> {
    const prompt = `You are a startup risk analyst. Respond in the same language as the startup idea.

Analyze the following startup idea and identify 6-8 key risks.

Startup idea: ${idea}

${context ? `Additional context: ${JSON.stringify(context)}` : ''}

For each risk, classify:
- probability: how likely it is to occur (low/medium/high/critical)
- impact: how severe the damage would be (low/medium/high/critical)
- mitigation: a short actionable mitigation strategy

Return ONLY valid JSON:
{
  "risks": [
    {
      "id": 1,
      "title": "short risk title",
      "description": "brief description of the risk",
      "probability": "medium",
      "impact": "high",
      "mitigation": "how to mitigate this risk"
    }
  ],
  "overallRiskLevel": "medium",
  "summary": "one sentence overall risk assessment"
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<RiskRadar>(response);
  }
}
