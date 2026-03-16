import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface BudgetCategory {
  category: string;
  icon: string;
  items: Array<{ name: string; monthlyCost: number; oneTimeCost: number; notes: string }>;
  totalMonthly: number;
  totalOneTime: number;
}

export interface RevenueProjection {
  year: number;
  conservative: number;
  realistic: number;
  optimistic: number;
}

export interface BudgetEstimate {
  currency: string;
  categories: BudgetCategory[];
  totalMonthlyBurn: number;
  totalSetupCost: number;
  runwayMonths: number;
  breakEvenMonth: number;
  revenueProjections: RevenueProjection[];
  fundingRequired: number;
  summary: string;
}

@Injectable()
export class BudgetEstimatorAgent implements Agent<BudgetEstimate> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context?: any): Promise<BudgetEstimate> {
    const prompt = `You are a startup financial advisor. Respond in the same language as the startup idea.

Estimate the budget for this startup. Use realistic numbers for a lean early-stage startup.

Startup idea: ${idea}
${context?.ideaAnalysis ? `\nContext: ${JSON.stringify(context.ideaAnalysis)}` : ''}
${context?.mvpPlan ? `\nMVP: ${JSON.stringify(context.mvpPlan)}` : ''}

Return ONLY valid JSON (no markdown):
{
  "currency": "USD",
  "categories": [
    {
      "category": "Development",
      "icon": "💻",
      "items": [
        { "name": "Frontend Developer", "monthlyCost": 3000, "oneTimeCost": 0, "notes": "Part-time freelancer" },
        { "name": "Backend Developer", "monthlyCost": 3500, "oneTimeCost": 0, "notes": "Part-time freelancer" },
        { "name": "UI/UX Design", "monthlyCost": 0, "oneTimeCost": 2000, "notes": "One-time design sprint" }
      ],
      "totalMonthly": 6500,
      "totalOneTime": 2000
    },
    {
      "category": "Infrastructure",
      "icon": "☁️",
      "items": [
        { "name": "Cloud Hosting", "monthlyCost": 200, "oneTimeCost": 0, "notes": "AWS/GCP starter tier" },
        { "name": "Database", "monthlyCost": 50, "oneTimeCost": 0, "notes": "Managed PostgreSQL" }
      ],
      "totalMonthly": 250,
      "totalOneTime": 0
    },
    {
      "category": "Marketing",
      "icon": "📣",
      "items": [
        { "name": "Paid Ads", "monthlyCost": 500, "oneTimeCost": 0, "notes": "Google/Meta ads" },
        { "name": "Content Creation", "monthlyCost": 300, "oneTimeCost": 0, "notes": "Blog and social media" }
      ],
      "totalMonthly": 800,
      "totalOneTime": 0
    },
    {
      "category": "Operations",
      "icon": "⚙️",
      "items": [
        { "name": "Legal & Incorporation", "monthlyCost": 0, "oneTimeCost": 1500, "notes": "Company registration" },
        { "name": "Tools & Subscriptions", "monthlyCost": 150, "oneTimeCost": 0, "notes": "SaaS tools" }
      ],
      "totalMonthly": 150,
      "totalOneTime": 1500
    }
  ],
  "totalMonthlyBurn": 7700,
  "totalSetupCost": 3500,
  "runwayMonths": 12,
  "breakEvenMonth": 8,
  "revenueProjections": [
    { "year": 1, "conservative": 30000, "realistic": 60000, "optimistic": 120000 },
    { "year": 2, "conservative": 80000, "realistic": 180000, "optimistic": 400000 },
    { "year": 3, "conservative": 150000, "realistic": 400000, "optimistic": 900000 }
  ],
  "fundingRequired": 95900,
  "summary": "Two to three sentences summarizing the financial outlook and key assumptions."
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<BudgetEstimate>(response);
  }
}
