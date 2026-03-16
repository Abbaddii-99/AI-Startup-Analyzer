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

Based on this startup idea, craft a compelling Vision, Mission, and core values.

Startup idea: ${idea}
${context?.ideaAnalysis ? `\nIdea Analysis: ${JSON.stringify(context.ideaAnalysis)}` : ''}

Definitions:
- Vision: The long-term aspirational future state (where we want to be in 10 years)
- Mission: The current purpose and how we achieve the vision (what we do today)
- Values: 3-4 core principles that guide the company
- Unique Value Proposition: One sentence that explains what makes this different
- Elevator Pitch: A 2-3 sentence pitch you'd give to an investor in 30 seconds

Return ONLY valid JSON:
{
  "vision": "To become the world's leading platform for...",
  "mission": "We empower entrepreneurs by providing...",
  "values": ["Innovation", "Transparency", "Customer First", "Impact"],
  "uniqueValueProposition": "The only platform that...",
  "elevatorPitch": "We help [target users] who struggle with [problem] by providing [solution]. Unlike [alternatives], we [key differentiator]. We're targeting a $[X]B market opportunity."
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<VisionMission>(response);
  }
}
