import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/global-exception.filter';
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers (CSP, X-Frame-Options, HSTS, etc.)
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
  }));

  // Parse cookies for httpOnly cookie-based auth
  app.use(cookieParser());

  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProd
    ? (process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map(u => u.trim())
    : true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    exposedHeaders: ['Set-Cookie', 'X-CSRF-Token'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.BACKEND_PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
}

bootstrap();
