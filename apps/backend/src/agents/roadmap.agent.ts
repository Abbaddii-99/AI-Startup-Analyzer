import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface RoadmapTask {
  title: string;
  type: string;
  role: string;
}

export interface RoadmapMilestone {
  phase: number;
  title: string;
  description: string;
  weeks: number;
  tasks: RoadmapTask[];
  deliverable: string;
}

export interface ProjectRoadmap {
  milestones: RoadmapMilestone[];
  totalWeeks: number;
  summary: string;
}

@Injectable()
export class RoadmapAgent implements Agent<ProjectRoadmap> {
  constructor(private ai: AIService) {}

  async execute(idea: string, context?: any): Promise<ProjectRoadmap> {
    const prompt = `You are a startup project manager. Respond in the same language as the startup idea.

Create a realistic 4-phase project roadmap for this startup idea.

Startup idea: ${idea}

${context?.mvpPlan ? `MVP Plan: ${JSON.stringify(context.mvpPlan)}` : ''}

Return exactly 4 phases with realistic week estimates. Each phase should build on the previous one.

Return ONLY valid JSON:
{
  "milestones": [
    {
      "phase": 1,
      "title": "Research & Planning",
      "description": "brief description",
      "weeks": 4,
      "tasks": [
        { "title": "Market research", "type": "بحث", "role": "مدير المنتج، باحث سوق" },
        { "title": "Define MVP features", "type": "تخطيط", "role": "قائد فني، مدير المنتج" }
      ],
      "deliverable": "main output"
    },
    {
      "phase": 2,
      "title": "MVP Development",
      "description": "...",
      "weeks": 6,
      "tasks": [
        { "title": "Build core features", "type": "تطوير", "role": "مهندس برمجيات، عالم بيانات" }
      ],
      "deliverable": "..."
    },
    {
      "phase": 3,
      "title": "Launch Preparation",
      "description": "...",
      "weeks": 3,
      "tasks": [
        { "title": "Prepare launch strategy", "type": "تسويق", "role": "مدير التسويق، مدير المنتج" }
      ],
      "deliverable": "..."
    },
    {
      "phase": 4,
      "title": "Launch & Iterate",
      "description": "...",
      "weeks": 4,
      "tasks": [
        { "title": "Track user adoption", "type": "تقييم", "role": "مدير المنتج، محلل بيانات" }
      ],
      "deliverable": "..."
    }
  ],
  "totalWeeks": 17,
  "summary": "one sentence overview"
}

Rules:
- Each task must have title, type (one word category), and role (2 roles max separated by comma)
- All text in the same language as the idea
- 3-4 tasks per phase`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<ProjectRoadmap>(response);
  }
}
