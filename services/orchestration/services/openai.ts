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
        content: `You are a helpful childcare booking assistant that helps parents book care for their children.
        You have access to the following tools:
        ${JSON.stringify(this.tools, null, 2)}
        
        IMPORTANT TOOL USAGE INSTRUCTIONS:
        - For childcare booking requests (like "book care for my child tomorrow"), use the "create_intelligent_booking" tool
        - Always extract the user_id from the user data provided in the conversation
        - Parse dates from natural language (tomorrow, next Monday, etc.) into YYYY-MM-DD format
        - Extract child/dependent names when mentioned
        
        RESPONSE FORMAT:
        - When using tools, respond with ONLY a JSON object (not an array) in this exact format:
        {
          "name": "create_intelligent_booking",
          "parameters": {
            "user_id": "user-uuid-from-context",
            "request_date": "2024-01-16",
            "dependent_name": "Emma"
          }
        }
        
        - For general conversation (greetings, questions, clarifications), respond with natural language
        
        The intelligent booking tool will:
        - Find childcare centers in the user's zip code area
        - Match with the user's dependents/children
        - Create the booking automatically
        - Handle all the complex logic for you
        
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
        // Remove forced JSON format to allow natural language responses
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
        // First, check if the response looks like JSON
        if (responseText.trim().startsWith('{') || responseText.trim().startsWith('[')) {
          const parsed = JSON.parse(responseText);
          // Accept both array and single object
          if (Array.isArray(parsed)) {
            toolCalls = parsed;
          } else if (parsed.name && parsed.parameters) {
            toolCalls = [parsed];
          }
        }
              } catch (error: any) {
          console.log('Response is not JSON, treating as natural language:', error.message);
          toolCalls = null;
        }

      if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0 && toolCalls[0].name && toolCalls[0].parameters) {
        console.log('Detected tool calls:', JSON.stringify(toolCalls, null, 2));
        // Execute the tools
        console.log('Sending tool calls to MCP server...');
        const toolResponse = await axios.post(`${config.mcp.url}/execute`, {
          toolCalls: toolCalls  // toolCalls is already an array from our parsing logic above
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
    } catch (error: any) {
      console.error('Error in OpenAI service:', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error(`Failed to get response from OpenAI: ${error.message}`);
    }
  }

  public clearHistory(): void {
    this.initializeSystemMessage();
  }
} 