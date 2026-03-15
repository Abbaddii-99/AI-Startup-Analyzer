import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { createHash } from 'crypto';
import Redis from 'ioredis';

const CACHE_TTL = 60 * 60 * 24; // 24 hours
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private gemini: GoogleGenerativeAI | null = null;
  private openRouterKey: string | null = null;
  private redis: Redis | null = null;

  constructor(private config: ConfigService) {
    const geminiKey = this.config.get<string>('GEMINI_API_KEY');
    if (geminiKey && geminiKey !== 'your-gemini-api-key') {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
    const openRouterKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (openRouterKey && openRouterKey !== 'your-openrouter-api-key') {
      this.openRouterKey = openRouterKey;
    }
    try {
      this.redis = new Redis({
        host: this.config.get('REDIS_HOST') || 'localhost',
        port: parseInt(this.config.get('REDIS_PORT') || '6379'),
        password: this.config.get('REDIS_PASSWORD') || undefined,
        tls: this.config.get('REDIS_HOST')?.includes('upstash') ? {} : undefined,
        lazyConnect: true,
      });
    } catch (err) {
      this.logger.warn(`Redis unavailable, caching disabled: ${err.message}`);
      this.redis = null;
    }
  }

  private cacheKey(prompt: string): string {
    return `ai:cache:${createHash('sha256').update(prompt).digest('hex')}`;
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async generate(prompt: string): Promise<string> {
    if (this.redis) {
      try {
        const cached = await this.redis.get(this.cacheKey(prompt));
        if (cached) return cached;
      } catch { /* ignore */ }
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        let result: string;
        if (this.openRouterKey) {
          result = await this.generateWithOpenRouter(prompt);
        } else if (this.gemini) {
          result = await this.generateWithGemini(prompt);
        } else {
          throw new Error('No AI service configured. Set GEMINI_API_KEY or OPENROUTER_API_KEY.');
        }

        if (this.redis) {
          try {
            await this.redis.setex(this.cacheKey(prompt), CACHE_TTL, result);
          } catch { /* ignore */ }
        }

        return result;
      } catch (error) {
        lastError = error;
        this.logger.warn(`AI generate attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`);
        if (attempt < MAX_RETRIES) await this.sleep(RETRY_DELAY_MS * attempt);
      }
    }

    throw lastError;
  }

  private async generateWithGemini(prompt: string): Promise<string> {
    const model = this.gemini!.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  private async generateWithOpenRouter(prompt: string, model = 'openai/gpt-4o-mini'): Promise<string> {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      { model, messages: [{ role: 'user', content: prompt }] },
      { headers: { Authorization: `Bearer ${this.openRouterKey}`, 'Content-Type': 'application/json' } },
    );
    return response.data.choices[0].message.content;
  }

  parseJSON<T>(text: string): T {
    // Try ```json ... ``` block first
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch { /* fall through */ }
    }

    // Try extracting first { ... } or [ ... ] block
    const objectMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[1]);
      } catch { /* fall through */ }
    }

    // Last resort: parse the whole text
    try {
      return JSON.parse(text.trim());
    } catch (error) {
      this.logger.error(`Failed to parse AI JSON response: ${text.slice(0, 200)}`);
      throw new Error(`AI returned invalid JSON: ${error.message}`);
    }
  }
}
