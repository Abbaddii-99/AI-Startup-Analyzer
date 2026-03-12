import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('analysis')
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private analysisService: AnalysisService) {}

  @Post()
  async create(@Request() req, @Body('idea') idea: string) {
    return this.analysisService.createAnalysis(req.user.userId, idea);
  }

  @Get()
  async getAll(@Request() req) {
    return this.analysisService.getUserAnalyses(req.user.userId);
  }

  @Get(':id')
  async getOne(@Request() req, @Param('id') id: string) {
    return this.analysisService.getAnalysis(id, req.user.userId);
  }

  @Get(':id/progress')
  async getProgress(@Request() req, @Param('id') id: string) {
    return this.analysisService.getAnalysisProgress(id, req.user.userId);
  }
}
