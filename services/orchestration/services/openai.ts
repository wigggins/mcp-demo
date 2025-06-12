import OpenAI from 'openai';
import { config } from '../config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private conversationHistory: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant that helps users with their booking-related questions and tasks.',
    },
  ];

  private constructor() {}

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async sendMessage(message: string): Promise<string> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      // Get response from OpenAI
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: this.conversationHistory,
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens,
      });

      const responseText = response.choices[0]?.message?.content || 'Sorry, I could not process your request.';

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: responseText,
      });

      // Keep conversation history manageable
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = [
          this.conversationHistory[0], // Keep system message
          ...this.conversationHistory.slice(-9), // Keep last 9 messages
        ];
      }

      return responseText;
    } catch (error) {
      console.error('Error in OpenAI service:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  }

  public clearHistory(): void {
    this.conversationHistory = [
      {
        role: 'system',
        content: 'You are a helpful assistant that helps users with their booking-related questions and tasks.',
      },
    ];
  }
} 