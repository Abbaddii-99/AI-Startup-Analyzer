import { Injectable } from '@nestjs/common';
import { Agent } from './agent.interface';
import { AIService } from './ai.service';

export interface RoadmapMilestone {
  phase: number;
  title: string;
  description: string;
  weeks: number;
  tasks: string[];
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
      "description": "brief description of what happens in this phase",
      "weeks": 4,
      "tasks": ["task 1", "task 2", "task 3"],
      "deliverable": "main output of this phase"
    },
    {
      "phase": 2,
      "title": "MVP Development",
      "description": "...",
      "weeks": 6,
      "tasks": ["..."],
      "deliverable": "..."
    },
    {
      "phase": 3,
      "title": "Launch Preparation",
      "description": "...",
      "weeks": 3,
      "tasks": ["..."],
      "deliverable": "..."
    },
    {
      "phase": 4,
      "title": "Launch & Iterate",
      "description": "...",
      "weeks": 4,
      "tasks": ["..."],
      "deliverable": "..."
    }
  ],
  "totalWeeks": 17,
  "summary": "one sentence overview of the roadmap"
}`;

    const response = await this.ai.generate(prompt);
    return this.ai.parseJSON<ProjectRoadmap>(response);
  }
}
