const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.resolve(ROOT, 'SECURITY_AUDIT_REPORT.md');
const PLACEHOLDER = 'REDACTED_SECRET';
const IGNORED_DIRS = new Set(['node_modules', '.git', '.internal', '.private_notes']);
const TARGET_EXTENSIONS = ['.env', '.json', '.js', '.ts', '.py', '.yml', '.yaml', '.md', '.cfg', '.ini'];

const PATTERNS = [
  { name: 'OpenAI key', regex: /\bsk-[A-Za-z0-9-_]{30,}/g, risk: 'high', comment: 'Rotate via OpenAI dashboard' },
  { name: 'Gemini key', regex: /AIza[0-9A-Za-z-_]{35}/g, risk: 'high', comment: 'Rotate at Google Cloud --> API Keys' },
  { name: 'OpenRouter key', regex: /sk-or-[A-Za-z0-9-_]{30,}/g, risk: 'high', comment: 'Rotate in OpenRouter settings' },
  { name: 'JWT secret', regex: /JWT_SECRET\s*=\s*['"]?[^'\n]+['"]?/gi, risk: 'high', comment: 'Generate new secret, update env files' },
  { name: 'Database URL', regex: /(postgresql|mysql|mongodb|redis|neon):\/\/[^'"\s]+/gi, risk: 'high', comment: 'Rotate user/pass, update config' },
  { name: 'Redis URL', regex: /rediss?:\/\/[^'"\s]+/gi, risk: 'high', comment: 'Rotate Redis credential' },
];

const entries = [];

async function walk(dir) {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    if (dirent.name.startsWith('.') && IGNORED_DIRS.has(dirent.name)) continue;
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (!TARGET_EXTENSIONS.includes(path.extname(dirent.name))) continue;
    await processFile(fullPath);
  }
}

async function processFile(filePath) {
  const relPath = path.relative(ROOT, filePath);
  const data = await fs.promises.readFile(filePath, 'utf8');
  let replaced = data;
  let dirty = false;
  for (const pattern of PATTERNS) {
    replaced = replaced.replace(pattern.regex, (match, offset) => {
      dirty = true;
      entries.push({
        file: relPath,
        line: data.slice(0, offset).split('\n').length,
        secret: pattern.name,
        value: match,
        risk: pattern.risk,
        comment: pattern.comment,
      });
      return PLACEHOLDER;
    });
  }
  if (dirty) {
    await fs.promises.writeFile(filePath, replaced, 'utf8');
  }
}

async function writeReport() {
  const lines = [
    '# SECURITY AUDIT REPORT',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Detected Secrets',
  ];
  for (const entry of entries) {
    lines.push(
      `- **${entry.secret}** in \`${entry.file}\` (line ${entry.line}) — risk: ${entry.risk.toUpperCase()}, action: ${entry.comment}`
    );
  }
  if (entries.length === 0) {
    lines.push('- No secrets detected.');
  }
  await fs.promises.writeFile(REPORT_PATH, lines.join('\n'), 'utf8');
}

(async () => {
  console.log('Scanning repository for secrets...');
  await walk(ROOT);
  await writeReport();
  console.log(`Scan complete. ${entries.length} issues recorded in SECURITY_AUDIT_REPORT.md`);
})();
