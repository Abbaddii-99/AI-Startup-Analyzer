import { Injectable, ConflictException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { prisma } from '../prisma';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectQueue('analysis') private analysisQueue: Queue,
  ) {}

  async createAnalysis(userId: string, idea: string): Promise<any> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    let count = user.analysesThisMonth;

    if (user.monthResetAt < monthStart) {
      await prisma.user.update({ where: { id: userId }, data: { analysesThisMonth: 0, monthResetAt: now } });
      count = 0;
    }

    const limits: Record<string, number> = { FREE: 3, PRO: 50, TEAM: 999 };
    const limit = limits[user.plan] ?? 3;
    if (count >= limit) {
      throw new ConflictException(`Monthly limit reached (${limit} for ${user.plan} plan).`);
    }

    await prisma.user.update({ where: { id: userId }, data: { analysesThisMonth: { increment: 1 } } });
    const analysis = await prisma.analysis.create({ data: { userId, idea, status: 'PENDING' } });

    await this.analysisQueue.add('analyze', { analysisId: analysis.id, idea }, { jobId: analysis.id });
    return analysis;
  }

  async getAnalysis(id: string, userId: string): Promise<any> {
    return prisma.analysis.findFirst({ where: { id, userId } });
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

    const job = await this.analysisQueue.getJob(id);
    return { status: analysis.status, progress: job ? job.progress : 0 };
  }

  async deleteAnalysis(id: string, userId: string): Promise<any> {
    const analysis = await this.getAnalysis(id, userId);
    if (!analysis) throw new Error('Analysis not found');
    await prisma.analysis.delete({ where: { id } });
    return { success: true };
  }

  async retryAnalysis(id: string, userId: string): Promise<any> {
    const analysis = await this.getAnalysis(id, userId);
    if (!analysis) throw new Error('Analysis not found');
    await prisma.analysis.update({ where: { id }, data: { status: 'PENDING' } });
    await this.analysisQueue.add('analyze', { analysisId: id, idea: analysis.idea }, { jobId: `${id}-retry-${Date.now()}` });
    return { success: true };
  }

  async getUserPlanInfo(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, analysesThisMonth: true, monthResetAt: true },
    });
    const limits: Record<string, number> = { FREE: 3, PRO: 50, TEAM: 999 };
    const limit = limits[user?.plan ?? 'FREE'];
    return { plan: user?.plan, used: user?.analysesThisMonth, limit };
  }
}
