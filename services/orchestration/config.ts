import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 1000,
  },
  server: {
    port: process.env.PORT || 3000,
  },
  mcp: {
    url: process.env.MCP_SERVER_URL || 'http://localhost:3002',
  },
} as const; 