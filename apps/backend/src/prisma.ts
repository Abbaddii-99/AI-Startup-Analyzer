import { PrismaClient } from '@prisma/client';
import * as path from 'path';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

// On Android (Termux): use WASM-based libsql adapter (no native modules)
// On Linux/macOS/Windows: use standard Prisma with native query engine
let client: PrismaClient;

if (process.platform === 'android') {
  const { PrismaLibSql } = require('@prisma/adapter-libsql');
  const dbPath = path.resolve(process.cwd(), '../../packages/db/prisma/dev.db');
  const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
  client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
} else {
  client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? client;

globalForPrisma.prisma = prisma;
