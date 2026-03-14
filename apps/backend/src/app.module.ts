import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from './auth/auth.module';
import { AnalysisModule } from './analysis/analysis.module';
import { AgentsModule } from './agents/agents.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_HOST?.includes('upstash') ? {} : undefined,
      },
    }),
    AuthModule,
    AnalysisModule,
    AgentsModule,
  ],
})
export class AppModule {}
