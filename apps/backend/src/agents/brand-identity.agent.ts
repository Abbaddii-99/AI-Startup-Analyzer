import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface BrandColor {
  name: string;
  hex: string;
  usage: string;
}

export interface BrandIdentity {
  suggestedNames: Array<{ name: string; reason: string }>;
  tagline: string;
  colors: BrandColor[];
  typography: { primary: string; secondary: string };
  toneOfVoice: string[];
  brandPersonality: string[];
  logoStyle: string;
  brandStory: string;
}

@Injectable()
export class BrandIdentityAgent implements Agent<BrandIdentity> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context?: any): Promise<BrandIdentity> {
    const prompt = `You are a brand identity expert. Respond in the same language as the startup idea.

Create a complete brand identity for this startup idea.

Startup idea: ${idea}
${context?.ideaAnalysis ? `\nIdea context: ${JSON.stringify(context.ideaAnalysis)}` : ''}

Return ONLY valid JSON:
{
  "suggestedNames": [
    { "name": "BrandName", "reason": "why this name works" },
    { "name": "AltName", "reason": "why this name works" },
    { "name": "ThirdName", "reason": "why this name works" }
  ],
  "tagline": "Short memorable tagline",
  "colors": [
    { "name": "Primary", "hex": "#3B82F6", "usage": "Main brand color for CTAs and headers" },
    { "name": "Secondary", "hex": "#8B5CF6", "usage": "Accent color for highlights" },
    { "name": "Neutral", "hex": "#F8FAFC", "usage": "Background and whitespace" }
  ],
  "typography": {
    "primary": "Inter - clean and modern for headings",
    "secondary": "Roboto - readable for body text"
  },
  "toneOfVoice": ["Professional", "Innovative", "Trustworthy", "Approachable"],
  "brandPersonality": ["The Expert", "The Innovator", "The Guide"],
  "logoStyle": "Minimalist wordmark with a geometric icon representing data flow",
  "brandStory": "Two to three sentences about the brand story and origin"
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<BrandIdentity>(response);
  }
}
