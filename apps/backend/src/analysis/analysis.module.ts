import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { AnalysisProcessor } from '../queue/analysis.processor';
import { AgentsModule } from '../agents/agents.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'analysis' }),
    AgentsModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService, AnalysisProcessor],
})
export class AnalysisModule {}
