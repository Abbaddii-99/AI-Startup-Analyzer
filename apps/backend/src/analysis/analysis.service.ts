import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { prisma } from '../../../packages/db';

@Injectable()
export class AnalysisService {
  constructor(@InjectQueue('analysis') private analysisQueue: Queue) {}

  async createAnalysis(userId: string, idea: string): Promise<any> {
    const analysis = await prisma.analysis.create({
      data: { userId, idea, status: 'PENDING' },
    });

    await this.analysisQueue.add('analyze', {
      analysisId: analysis.id,
      idea,
    });

    return analysis;
  }

  async getAnalysis(id: string, userId: string): Promise<any> {
    return prisma.analysis.findFirst({
      where: { id, userId },
    });
  }

  async getUserAnalyses(userId: string): Promise<any[]> {
    return prisma.analysis.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAnalysisProgress(id: string, userId: string): Promise<any> {
    const analysis = await this.getAnalysis(id, userId);
    if (!analysis) return null;

    const jobs = await this.analysisQueue.getJobs(['active', 'waiting']);
    const job = jobs.find((j) => j.data.analysisId === id);

    return {
      status: analysis.status,
      progress: job ? job.progress : 0,
    };
  }
}
