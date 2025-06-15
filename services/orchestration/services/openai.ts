import OpenAI from 'openai';
import axios from 'axios';
import { config } from '../config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private conversationHistory: ChatMessage[] = [];
  private tools: any[] = [];

  private constructor() {
    this.initializeSystemMessage();
  }

  private async initializeSystemMessage() {
    try {
      // Fetch available tools from MCP server
      const response = await axios.get(`${config.mcp.url}/tools`);
      this.tools = response.data;

      // Set system message with tool descriptions
      this.conversationHistory = [{
        role: 'system',
        content: `You are a helpful assistant that helps users with their booking-related questions and tasks.
        You have access to the following tools:
        ${JSON.stringify(this.tools, null, 2)}
        
        When a user wants to create or cancel a booking, you MUST use these tools.
        IMPORTANT: When using tools, you must respond with ONLY a JSON array of tool calls.
        Each tool call should be an object with 'name' and 'parameters' fields.
        Example tool call format:
        [
          {
            "name": "create_booking",
            "parameters": {
              "customerId": "123",
              "serviceId": "456",
              "startTime": "2024-03-20T14:00:00Z",
              "endTime": "2024-03-20T15:00:00Z"
            }
          }
        ]
        
        If you're not using a tool, respond with a natural language message.
        DO NOT mix tool calls with natural language responses.`
      }];
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw new Error('Failed to initialize OpenAI service');
    }
  }

  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }

  public async sendMessage(message: string): Promise<{ message: string; toolResults?: any[] }> {
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

      // Try to parse tool calls from the response
      try {
        const toolCalls = JSON.parse(responseText);
        
        if (Array.isArray(toolCalls) && toolCalls.length > 0) {
          console.log('Executing tool calls:', JSON.stringify(toolCalls, null, 2));
          
          // Execute the tools
          const toolResponse = await axios.post(`${config.mcp.url}/execute`, {
            toolCalls
          });

          console.log('Tool execution results:', JSON.stringify(toolResponse.data, null, 2));

          // Add tool results to conversation history
          this.conversationHistory.push({
            role: 'system',
            content: `Tool execution results: ${JSON.stringify(toolResponse.data.results)}`
          });

          return {
            message: responseText,
            toolResults: toolResponse.data.results
          };
        }
      } catch (error) {
        console.log('Response is not a tool call:', responseText);
        // If parsing fails, it's a regular message
        return { message: responseText };
      }

      return { message: responseText };
    } catch (error) {
      console.error('Error in OpenAI service:', error);
      throw new Error('Failed to get response from OpenAI');
    }
  }

  public clearHistory(): void {
    this.initializeSystemMessage();
  }
} 