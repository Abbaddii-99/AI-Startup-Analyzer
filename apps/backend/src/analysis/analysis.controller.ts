import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AIService } from '../agents/ai.service';

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(
    private analysisService: AnalysisService,
    private aiService: AIService,
  ) {}

  @Post()
  async create(@Request() req, @Body('idea') idea: string): Promise<any> {
    if (!idea || typeof idea !== 'string') {
      throw new BadRequestException('Idea is required');
    }
    const sanitized = idea.trim().slice(0, 2000);
    if (sanitized.length < 10) {
      throw new BadRequestException('Idea must be at least 10 characters');
    }
    return this.analysisService.createAnalysis(req.user.userId, sanitized);
  }

  @Post('chat')
  async chat(@Request() req, @Body() body: { message: string; context: string; analysisId?: string }): Promise<any> {
    if (!body.message?.trim()) throw new BadRequestException('Message is required');

    // Verify the analysis belongs to the user if analysisId provided
    if (body.analysisId) {
      const analysis = await this.analysisService.getAnalysis(body.analysisId, req.user.userId);
      if (!analysis) throw new BadRequestException('Analysis not found');
    }

    const safeContext = String(body.context ?? '').slice(0, 3000).replace(/[<>]/g, '');
    const safeMessage = body.message.trim().slice(0, 500);
    const prompt = `You are a startup analyst assistant. Based on this analysis report:\n\n${safeContext}\n\nAnswer this question concisely: ${safeMessage}`;
    const reply = await this.aiService.generate(prompt);
    return { reply };
  }

  // NOTE: static routes must come before :id param routes
  @Get('me/plan')
  async getPlan(@Request() req): Promise<any> {
    return this.analysisService.getUserPlanInfo(req.user.userId);
  }

  @Get()
  async getAll(@Request() req): Promise<any[]> {
    return this.analysisService.getUserAnalyses(req.user.userId);
  }

  @Get(':id')
  async getOne(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.getAnalysis(id, req.user.userId);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.deleteAnalysis(id, req.user.userId);
  }

  @Post(':id/retry')
  async retry(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.retryAnalysis(id, req.user.userId);
  }

  @Get(':id/progress')
  async getProgress(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.getAnalysisProgress(id, req.user.userId);
  }
}
