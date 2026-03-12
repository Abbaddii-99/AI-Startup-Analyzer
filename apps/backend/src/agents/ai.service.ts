import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

@Injectable()
export class AIService {
  private gemini: GoogleGenerativeAI;
  private openRouterKey: string;

  constructor(private config: ConfigService) {
    const geminiKey = this.config.get('GEMINI_API_KEY');
    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
    this.openRouterKey = this.config.get('OPENROUTER_API_KEY');
  }

  async generateWithGemini(prompt: string): Promise<string> {
    const model = this.gemini.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async generateWithOpenRouter(prompt: string, model = 'openai/gpt-4'): Promise<string> {
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
    throw new Error('No AI service configured');
  }

  parseJSON<T>(text: string): T {
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }
    return JSON.parse(text);
  }
}
