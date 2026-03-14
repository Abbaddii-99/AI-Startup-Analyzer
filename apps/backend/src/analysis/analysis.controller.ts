import { Controller, Post, Get, Body, Param, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

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

  @Get()
  async getAll(@Request() req): Promise<any[]> {
    return this.analysisService.getUserAnalyses(req.user.userId);
  }

  @Get(':id')
  async getOne(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.getAnalysis(id, req.user.userId);
  }

  @Get(':id/progress')
  async getProgress(@Request() req, @Param('id') id: string): Promise<any> {
    return this.analysisService.getAnalysisProgress(id, req.user.userId);
  }
}
