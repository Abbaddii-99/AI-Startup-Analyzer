const sqlite3 = require('sqlite3').Database;
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');

// Ensure directory exists
if (!fs.existsSync(path.dirname(dbPath))) {
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

const db = new sqlite3(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at:', dbPath);
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    plan TEXT NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT UNIQUE,
    "stripeSubId" TEXT UNIQUE,
    "analysesThisMonth" INTEGER NOT NULL DEFAULT 0,
    "monthResetAt" TEXT NOT NULL DEFAULT (datetime('now'))
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS refresh_tokens (
    id TEXT PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_userId" ON refresh_tokens("userId")`);

  db.run(`CREATE TABLE IF NOT EXISTS analyses (
    id TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL,
    idea TEXT NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    "isPublic" INTEGER NOT NULL DEFAULT 0,
    version INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "ideaAnalysis" TEXT,
    "comprehensiveIdeaAnalysis" TEXT,
    "marketResearch" TEXT,
    "competitorAnalysis" TEXT,
    "mvpPlan" TEXT,
    monetization TEXT,
    "goToMarket" TEXT,
    "finalReport" TEXT,
    "riskRadar" TEXT,
    roadmap TEXT,
    "businessModel" TEXT,
    "visionMission" TEXT,
    "brandIdentity" TEXT,
    "budgetEstimate" TEXT,
    "marketDemandScore" REAL,
    "competitionScore" REAL,
    "executionDifficultyScore" REAL,
    "profitPotentialScore" REAL,
    "overallScore" REAL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS "idx_analyses_userId" ON analyses("userId")`);
  db.run(`CREATE INDEX IF NOT EXISTS "idx_analyses_status" ON analyses("status")`);
  db.run(`CREATE INDEX IF NOT EXISTS "idx_analyses_isPublic" ON analyses("isPublic")`);

  db.run(`CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users 
    BEGIN 
      UPDATE users SET updatedAt = datetime('now') WHERE id = NEW.id; 
    END`);

  db.run(`CREATE TRIGGER IF NOT EXISTS update_analyses_updated_at 
    AFTER UPDATE ON analyses 
    BEGIN 
      UPDATE analyses SET updatedAt = datetime('now') WHERE id = NEW.id; 
    END`);

  db.run(`CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    id TEXT PRIMARY KEY,
    checksum TEXT NOT NULL,
    finished_at TEXT,
    migration_name TEXT NOT NULL UNIQUE,
    logs TEXT,
    rolled_back_at TEXT,
    started_at TEXT NOT NULL DEFAULT (datetime('now')),
    applied_steps_count INTEGER NOT NULL DEFAULT 0
  )`);

  db.run(`INSERT OR IGNORE INTO "_prisma_migrations" (id, checksum, migration_name, finished_at, started_at, applied_steps_count) 
    VALUES ('init', 'checksum', 'init', datetime('now'), datetime('now'), 1)`);

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
      process.exit(1);
    }
    console.log('Database setup complete! Tables created: users, refresh_tokens, analyses, _prisma_migrations');
  });
});
