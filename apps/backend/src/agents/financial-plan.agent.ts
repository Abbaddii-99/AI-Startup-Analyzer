import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface FinancialMetric {
  label: string;
  value: string;
  icon: string;
}

export interface CostItem {
  name: string;
  amount: number;
}

export interface RevenueMetrics {
  pricePerMonth: number;
  acquisitionCostPerCustomer: number;
  avgLifetimeMonths: number;
  churnRate: number;
  customerLifetimeValue: number;
}

export interface MarketingMetrics {
  monthlyBudget: number;
  costPerAcquisition: number;
  avgNewSubscriptionsPerMonth: number;
}

export interface ChartPoint {
  month: number;
  revenue: number;
  costs: number;
  profit: number;
}

export interface FinancialPlan {
  currency: string;
  fundingType: string;
  fundingTypeDescription: string;
  keyMetrics: {
    fundingRequired: number;
    breakEvenMonths: number;
    paybackMonths: number;
  };
  overview: {
    cumulativeProfit: number;
    monthlyRevenue: number;
    monthlyCosts: number;
    chartData: ChartPoint[];
  };
  startupCosts: {
    description: string;
    total: number;
    items: CostItem[];
  };
  recurringCosts: {
    description: string;
    totalPerMonth: number;
    items: CostItem[];
  };
  revenueModel: {
    description: string;
    metrics: RevenueMetrics;
  };
  marketing: {
    description: string;
    metrics: MarketingMetrics;
  };
}

@Injectable()
export class FinancialPlanAgent implements Agent<FinancialPlan> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context?: any): Promise<FinancialPlan> {
    const prompt = `You are a startup financial advisor. Respond in the same language as the startup idea.

Create a detailed financial plan for this startup. Use realistic lean startup numbers.

Startup idea: ${idea}
${context?.monetization ? `\nMonetization: ${JSON.stringify(context.monetization)}` : ''}
${context?.budgetEstimate ? `\nBudget context: ${JSON.stringify(context.budgetEstimate)}` : ''}

Return ONLY valid JSON:
{
  "currency": "USD",
  "fundingType": "Subscriptions",
  "fundingTypeDescription": "2-3 sentence description of this funding model and why it fits this startup",
  "keyMetrics": {
    "fundingRequired": 15000,
    "breakEvenMonths": 6,
    "paybackMonths": 10
  },
  "overview": {
    "cumulativeProfit": 8500,
    "monthlyRevenue": 4200,
    "monthlyCosts": 3100,
    "chartData": [
      { "month": 0, "revenue": 0, "costs": 3100, "profit": -3100 },
      { "month": 3, "revenue": 1500, "costs": 3100, "profit": -1600 },
      { "month": 6, "revenue": 3200, "costs": 3100, "profit": 100 },
      { "month": 9, "revenue": 4200, "costs": 3100, "profit": 1100 },
      { "month": 12, "revenue": 5500, "costs": 3100, "profit": 2400 }
    ]
  },
  "startupCosts": {
    "description": "2-3 sentences about startup costs and why they are needed before launch",
    "total": 8000,
    "items": [
      { "name": "Website Development", "amount": 5000 },
      { "name": "Legal & Incorporation", "amount": 1500 },
      { "name": "Initial Marketing", "amount": 1500 }
    ]
  },
  "recurringCosts": {
    "description": "2-3 sentences about recurring costs and their impact on the financial plan",
    "totalPerMonth": 3100,
    "items": [
      { "name": "Salaries", "amount": 2500 },
      { "name": "Marketing", "amount": 400 },
      { "name": "Hosting & Tools", "amount": 200 }
    ]
  },
  "revenueModel": {
    "description": "2-3 sentences about the revenue model and how subscriptions generate income",
    "metrics": {
      "pricePerMonth": 29,
      "acquisitionCostPerCustomer": 8,
      "avgLifetimeMonths": 14,
      "churnRate": 7,
      "customerLifetimeValue": 350
    }
  },
  "marketing": {
    "description": "2-3 sentences about marketing strategy and how budget is allocated",
    "metrics": {
      "monthlyBudget": 400,
      "costPerAcquisition": 18,
      "avgNewSubscriptionsPerMonth": 22
    }
  }
}

Rules:
- All numbers must be realistic for a lean early-stage startup
- chartData must have exactly 5 points from month 0 to month 12
- All text in the same language as the idea`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<FinancialPlan>(response);
  }
}
