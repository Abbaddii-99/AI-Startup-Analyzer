import { PrismaClient } from '@prisma/client';
import * as path from 'path';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// Resolve database path - works for both Android (Termux) and Linux (Codespaces/Render)
let client: PrismaClient;

if (process.platform === 'android') {
  // Android: use WASM-based libsql adapter
  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const dbPath = path.resolve(process.cwd(), '../../packages/db/prisma/dev.db');
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} else {
  // Linux/macOS/Windows: use native Prisma
  const dbPath = process.env.DATABASE_URL || `file:${path.resolve(process.cwd(), '../../packages/db/prisma/dev.db')}`;
  client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: { db: { url: dbPath } },
  });
}

export const prisma = globalForPrisma.prisma ?? client;

globalForPrisma.prisma = prisma;
