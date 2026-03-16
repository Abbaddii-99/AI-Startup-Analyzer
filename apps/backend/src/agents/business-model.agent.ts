import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface BusinessModelItem {
  name: string;
  description: string;
  applicable: boolean;
  reason: string;
  examples: string[];
  icon: string;
}

export interface BusinessModelAnalysis {
  matchedCount: number;
  totalModels: number;
  percentMatch: number;
  primaryModel: string;
  summary: string;
  applicable: BusinessModelItem[];
  notApplicable: BusinessModelItem[];
}

const ALL_MODELS = [
  'SaaS','Marketplace','Freemium','Subscription','Usage-based','Enterprise','Platform',
  'API-as-a-Service','White-label','Affiliate','Advertising','Data Monetization',
  'Community','Open-source','Franchise','Licensing','Pay-per-use','Razor & Blade',
  'Reverse Razor & Blade','Two-sided Market','Multi-sided Platform','Crowdsourcing',
  'Crowdfunding','On-demand','Peer-to-peer','Direct Sales','Indirect Sales',
  'E-commerce','D2C','B2B','B2C','B2B2C','SaaS + Services','Consulting',
  'Productized Service','Agency','Reseller','Co-creation','Gamification',
  'Donation','Auction','Leasing','Brokerage'
];

@Injectable()
export class BusinessModelAgent implements Agent<BusinessModelAnalysis> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context?: any): Promise<BusinessModelAnalysis> {
    const prompt = `You are a business model expert. Respond in the same language as the startup idea.

Analyze this startup idea against ALL 43 known business model patterns.

Startup idea: ${idea}
${context?.monetization ? `\nMonetization context: ${JSON.stringify(context.monetization)}` : ''}

For EACH of these 43 models, decide if it is applicable or not, and explain why:
${ALL_MODELS.map((m, i) => `${i + 1}. ${m}`).join('\n')}

Rules:
- Be realistic: most ideas match 10-20 models
- For applicable models: explain clearly why it fits and give 1-2 real company examples
- For non-applicable models: explain briefly why it does NOT fit
- Choose a single emoji icon for each model
- primaryModel = the single best model

Return ONLY valid JSON:
{
  "matchedCount": 15,
  "totalModels": 43,
  "percentMatch": 35,
  "primaryModel": "SaaS",
  "summary": "one sentence summary",
  "applicable": [
    {
      "name": "SaaS",
      "description": "short description of this model",
      "applicable": true,
      "reason": "why it fits this idea",
      "examples": ["Salesforce", "Slack"],
      "icon": "☁️"
    }
  ],
  "notApplicable": [
    {
      "name": "Franchise",
      "description": "short description",
      "applicable": false,
      "reason": "why it does NOT fit",
      "examples": [],
      "icon": "🏪"
    }
  ]
}`;

    const response = await this.ai.generate(prompt);
    const result = this.ai.parseJSON<BusinessModelAnalysis>(response);
    result.totalModels = ALL_MODELS.length;
    result.matchedCount = result.applicable?.length || result.matchedCount;
    result.percentMatch = Math.round((result.matchedCount / result.totalModels) * 100);
    return result;
  }
}
