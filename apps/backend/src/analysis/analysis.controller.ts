import { Controller, Post, Get, Delete, Body, Param, Query, UseGuards, Request, BadRequestException, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { randomBytes } from 'crypto';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AIService } from '../agents/ai.service';

function sanitizeIdea(idea: string): string {
  return idea
    .trim()
    .slice(0, 2000)
    .replace(/[<>"'`]/g, '')
    .replace(/ignore\s+(previous|above|all)\s+instructions?/gi, '')
    .replace(/system\s*:/gi, '')
    .replace(/\\n|\\r/g, ' ');
}

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(
    private analysisService: AnalysisService,
    private aiService: AIService,
  ) {}

  /** Return a CSRF token for the Double Submit Cookie pattern */
  @Get('csrf-token')
  csrfToken(@Request() req: any, @Res() res: Response) {
    const token = randomBytes(32).toString('hex');
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Must be readable by JS to set in header
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return res.json({ csrfToken: token });
  }

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
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  async chat(@Request() req, @Body() body: { message: string; context: string; analysisId?: string }): Promise<any> {
    if (!body.message?.trim()) throw new BadRequestException('Message is required');

    // Verify the analysis belongs to the user if analysisId provided
    if (body.analysisId) {
      const analysis = await this.analysisService.getAnalysis(body.analysisId, req.user.userId);
      if (!analysis) throw new BadRequestException('Analysis not found');
    }

    // Apply the same sanitization as the queue processor
    const safeContext = String(body.context ?? '').slice(0, 3000).replace(/[<>]/g, '');
    const safeMessage = sanitizeIdea(body.message.trim().slice(0, 500));
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
  async getAll(@Request() req, @Query('skip') skip?: string, @Query('take') take?: string): Promise<any[]> {
    return this.analysisService.getUserAnalyses(
      req.user.userId,
      skip ? parseInt(skip, 10) : 0,
      take ? Math.min(parseInt(take, 10), 50) : 20,
    );
  }

  @Get(':id')
  async getAnalysis(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.getAnalysis(id, req.user.userId);
  }

  @Get(':id/idea-analysis')
  async getIdeaAnalysis(@Request() req, @Param('id') id: string): Promise<any> {
    const analysis = await this.analysisService.getAnalysis(id, req.user.userId);
    return analysis.ideaAnalysis || null;
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.deleteAnalysis(id, req.user.userId);
  }

  @Post(':id/retry')
  async retry(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.retryAnalysis(id, req.user.userId);
  }

  @Post(':id/regenerate/:section')
  async regenerate(
    @Request() req,
    @Param('id') id: string,
    @Param('section') section: string,
  ): Promise<any> {
    return this.analysisService.regenerateSection(id, req.user.userId, section);
  }

  @Get(':id/progress')
  async getProgress(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.getAnalysisProgress(id, req.user.userId);
  }
}
