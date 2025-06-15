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
      console.log('Initializing OpenAI service...');
      // Fetch available tools from MCP server
      const response = await axios.get(`${config.mcp.url}/tools`);
      this.tools = response.data;
      console.log('Available tools:', JSON.stringify(this.tools, null, 2));

      // Set system message with tool descriptions
      this.conversationHistory = [{
        role: 'system',
        content: `You are a helpful assistant that helps users with their booking-related questions and tasks.
        You have access to the following tools:
        ${JSON.stringify(this.tools, null, 2)}
        
        When a user wants to create or cancel a booking, you MUST use these tools.
        IMPORTANT: When using tools, you must respond with ONLY a JSON array of tool calls, with no additional text or explanation.
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
        DO NOT mix tool calls with natural language responses.
        DO NOT include any explanatory text when making tool calls.
        DO NOT use markdown formatting or code blocks when making tool calls.`
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

  public async sendMessage(message: string, user?: any): Promise<{ message: string; toolResults?: any[] }> {
    try {
      console.log('Processing new message:', {
        message,
        userId: user?.id,
        conversationLength: this.conversationHistory.length
      });

      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: message,
      });

      // If user object is provided, add it to the conversation history
      if (user) {
        this.conversationHistory.push({
          role: 'system',
          content: `User data: ${JSON.stringify(user)}`,
        });
      }

      console.log('Sending request to OpenAI...');
      // Get response from OpenAI
      const response = await openai.chat.completions.create({
        model: config.openai.model,
        messages: this.conversationHistory,
        temperature: config.openai.temperature,
        max_tokens: config.openai.maxTokens,
        response_format: { type: "json_object" }
      });

      const responseText = response.choices[0]?.message?.content || 'Sorry, I could not process your request.';
      console.log('Received OpenAI response:', responseText);

      // Add assistant response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: responseText,
      });

      // Try to parse tool calls from the response
      let toolCalls: any = null;
      try {
        toolCalls = JSON.parse(responseText);
        // Accept both array and single object
        if (!Array.isArray(toolCalls)) {
          toolCalls = [toolCalls];
        }
      } catch (error) {
        toolCalls = null;
      }

      if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0 && toolCalls[0].name && toolCalls[0].parameters) {
        console.log('Detected tool calls:', JSON.stringify(toolCalls, null, 2));
        // Execute the tools
        console.log('Sending tool calls to MCP server...');
        const toolResponse = await axios.post(`${config.mcp.url}/execute`, {
          toolCalls
        });
        console.log('Received tool execution results:', JSON.stringify(toolResponse.data, null, 2));

        // Add tool results to conversation history
        this.conversationHistory.push({
          role: 'system',
          content: `Tool execution results: ${JSON.stringify(toolResponse.data.results)}`
        });

        // Ask LLM for a final, user-facing response
        const finalResponse = await openai.chat.completions.create({
          model: config.openai.model,
          messages: this.conversationHistory,
          temperature: config.openai.temperature,
          max_tokens: config.openai.maxTokens,
        });
        const finalText = finalResponse.choices[0]?.message?.content || 'Sorry, I could not process your request.';
        this.conversationHistory.push({
          role: 'assistant',
          content: finalText,
        });
        return {
          message: finalText,
          toolResults: toolResponse.data.results
        };
      }

      // If not a tool call, just return the LLM's response
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