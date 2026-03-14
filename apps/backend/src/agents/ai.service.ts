import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

@Injectable()
export class AIService {
  private gemini: GoogleGenerativeAI | null = null;
  private openRouterKey: string | null = null;

  constructor(private config: ConfigService) {
    const geminiKey = this.config.get<string>('GEMINI_API_KEY');
    if (geminiKey && geminiKey !== 'your-gemini-api-key') {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
    const openRouterKey = this.config.get<string>('OPENROUTER_API_KEY');
    if (openRouterKey && openRouterKey !== 'your-openrouter-api-key') {
      this.openRouterKey = openRouterKey;
    }
  }

  async generateWithGemini(prompt: string): Promise<string> {
    const model = this.gemini!.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateWithOpenRouter(prompt: string, model = 'openai/gpt-4o-mini'): Promise<string> {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model,
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data.choices[0].message.content;
  }

  async generate(prompt: string): Promise<string> {
    if (this.gemini) {
      return this.generateWithGemini(prompt);
    } else if (this.openRouterKey) {
      return this.generateWithOpenRouter(prompt);
    }
    throw new Error('No AI service configured. Add GEMINI_API_KEY or OPENROUTER_API_KEY to .env');
  }

  parseJSON<T>(text: string): T {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }
    return JSON.parse(text);
  }
}
