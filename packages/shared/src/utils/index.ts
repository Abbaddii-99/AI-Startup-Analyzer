export function scoreLabel(score: number): 'excellent' | 'good' | 'average' | 'poor' {
  if (score >= 8) return 'excellent';
  if (score >= 6) return 'good';
  if (score >= 4) return 'average';
  return 'poor';
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function sanitizeIdea(idea: string, maxLength = 2000): string {
  return idea.trim().slice(0, maxLength).replace(/[<>"'`\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '');
}

export function wrapUserInput(input: string): string {
  return `[USER_INPUT]\n${input}\n[/USER_INPUT]`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
