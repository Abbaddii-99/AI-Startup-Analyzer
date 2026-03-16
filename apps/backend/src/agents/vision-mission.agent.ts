import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface VisionMission {
  vision: string;
  mission: string;
  values: string[];
  uniqueValueProposition: string;
  elevatorPitch: string;
}

@Injectable()
export class VisionMissionAgent implements Agent<VisionMission> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context?: any): Promise<VisionMission> {
    const prompt = `You are a startup branding strategist. Respond in the same language as the startup idea.

Create Vision, Mission, and brand foundation for this startup. Keep ALL fields SHORT and concise.

Startup idea: ${idea}

Rules:
- vision: max 15 words
- mission: max 20 words
- values: exactly 4 short words or phrases
- uniqueValueProposition: max 15 words
- elevatorPitch: max 40 words

Return ONLY valid JSON:
{
  "vision": "short vision statement",
  "mission": "short mission statement",
  "values": ["Value1", "Value2", "Value3", "Value4"],
  "uniqueValueProposition": "short UVP sentence",
  "elevatorPitch": "short 2-sentence pitch for investors"
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<VisionMission>(response);
  }
}
