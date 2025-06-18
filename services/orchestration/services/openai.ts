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
        
        FOR CARE CENTER REQUESTS:
        - When users ask about "care centers near me", "childcare centers in my area", "what centers are available", etc., use the "get_care_centers" tool
        - Extract zip_code from user data if available, or ask the user for their location if not provided
        - Include user_id from "User data" for personalized results
        
        FOR BOOKING REQUESTS:
        - For childcare booking requests (like "book care for my child tomorrow" or "book care at Sunshine Center"), use the "create_intelligent_booking" tool
        - ALWAYS extract the user_id from the "User data" provided in the conversation - this is the ID of the parent making the request
        - Parse dates from natural language (tomorrow, next Monday, etc.) into YYYY-MM-DD format
        - For dependent_name: ONLY include this if the user specifically mentions a child's name (like "book care for Emma" or "my daughter Sarah")
        - If the user says generic terms like "my child", "my kid", "my daughter" WITHOUT a specific name, do NOT include dependent_name - the system will automatically use their first child
        - For center_name: Extract if the user mentions a specific center name (like "book at Little Angels Preschool", "Sunshine Center", "Happy Kids Daycare")
        - NEVER use the parent's name (from User data) as the dependent_name - that's the parent, not the child
        - NEVER extract names from the parent's name field as dependent names
        
        FOR UNCLEAR BOOKING REQUESTS:
        - If the user wants to book but you're unsure which child, use "get_user_dependents" first to get their children, then ask for clarification
        - If a booking fails due to "No dependent found", use "get_user_dependents" to list their children and ask which one they meant
        
        RESPONSE FORMAT:
        - When using tools, respond with ONLY a JSON object (not an array) in this exact format:
        
        For care center requests:
        {
          "name": "get_care_centers",
          "parameters": {
            "user_id": "user-uuid-from-context",
            "zip_code": "12345"
          }
        }
        
        For booking with specific child name:
        {
          "name": "create_intelligent_booking",
          "parameters": {
            "user_id": "user-uuid-from-context",
            "request_date": "2024-01-16",
            "dependent_name": "Emma"
          }
        }
        
        For booking without specific child name (generic "my child"):
        {
          "name": "create_intelligent_booking",
          "parameters": {
            "user_id": "user-uuid-from-context",
            "request_date": "2024-01-16"
          }
        }
        
        For booking at a specific center:
        {
          "name": "create_intelligent_booking",
          "parameters": {
            "user_id": "user-uuid-from-context",
            "request_date": "2024-01-16",
            "center_name": "Little Angels Preschool"
          }
        }
        
        For getting user's children when unclear:
        {
          "name": "get_user_dependents",
          "parameters": {
            "user_id": "user-uuid-from-context"
          }
        }
        
        - For general conversation (greetings, questions, clarifications), respond with natural language
        
        The intelligent booking tool will:
        - Find childcare centers in the user's zip code area
        - Match with the user's dependents/children based on user_id
        - If dependent_name is provided, find that specific child belonging to the user
        - If dependent_name is NOT provided, use the user's first child automatically
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

        // For care center requests, provide a natural response about what we found
        let finalText = '';
        if (toolCalls[0].name === 'get_care_centers') {
          const result = toolResponse.data.results[0];
          if (result && result.metadata) {
            const count = result.metadata.count;
            const zipCode = result.metadata.zip_code;
            if (count === 0) {
              finalText = `I couldn't find any childcare centers${zipCode !== 'all areas' ? ` in ${zipCode}` : ''}. You might want to try searching in a nearby area.`;
            } else {
              finalText = `I found ${count} childcare center${count !== 1 ? 's' : ''}${zipCode !== 'all areas' ? ` in ${zipCode}` : ''}! Here are the available options:`;
            }
          } else {
            finalText = 'Here are the available childcare centers:';
          }
        } else {
          // Check for booking errors that need special handling
          const result = toolResponse.data.results[0];
          if (toolCalls[0].name === 'create_intelligent_booking' && result && result.error) {
            if (result.error.includes('No dependent found')) {
              // If booking failed due to no dependent found, try to get dependents and ask for clarification
              try {
                const userMatch = this.conversationHistory.find(msg => 
                  msg.content.includes('User data:') && msg.role === 'system'
                );
                if (userMatch) {
                  const userData = JSON.parse(userMatch.content.replace('User data: ', ''));
                  const dependentsCall = [{
                    name: 'get_user_dependents',
                    parameters: { user_id: userData.id }
                  }];
                  
                  const dependentsResponse = await axios.post(`${config.mcp.url}/execute`, {
                    toolCalls: dependentsCall
                  });
                  
                  const dependents = dependentsResponse.data.results[0]?.dependents || [];
                  if (dependents.length === 0) {
                    finalText = "I don't see any children associated with your account. You'll need to add your child's information before I can book childcare.";
                  } else if (dependents.length === 1) {
                    finalText = `I see you have one child: ${dependents[0].name}. Let me try booking for them instead.`;
                    // Retry booking with the found dependent
                    const retryCall = [{
                      name: 'create_intelligent_booking',
                      parameters: {
                        ...toolCalls[0].parameters,
                        dependent_name: dependents[0].name
                      }
                    }];
                    const retryResponse = await axios.post(`${config.mcp.url}/execute`, {
                      toolCalls: retryCall
                    });
                    
                    this.conversationHistory.push({
                      role: 'system',
                      content: `Tool execution results: ${JSON.stringify(retryResponse.data.results)}`
                    });
                    
                    const retryFinalResponse = await openai.chat.completions.create({
                      model: config.openai.model,
                      messages: this.conversationHistory,
                      temperature: config.openai.temperature,
                      max_tokens: config.openai.maxTokens,
                    });
                    finalText = retryFinalResponse.choices[0]?.message?.content || 'Successfully processed your booking request.';
                  } else {
                                         const childrenList = dependents.map((d: any) => d.name).join(', ');
                    finalText = `I see you have multiple children: ${childrenList}. Which child would you like me to book childcare for?`;
                  }
                } else {
                  finalText = "I had trouble identifying which child you'd like to book care for. Could you please specify your child's name?";
                }
              } catch (error) {
                console.error('Error handling booking failure:', error);
                finalText = "I had trouble with that booking request. Could you please specify which child you'd like to book care for?";
              }
            } else {
              // For other booking errors, ask LLM for a response
              const finalResponse = await openai.chat.completions.create({
                model: config.openai.model,
                messages: this.conversationHistory,
                temperature: config.openai.temperature,
                max_tokens: config.openai.maxTokens,
              });
              finalText = finalResponse.choices[0]?.message?.content || 'Sorry, I could not process your booking request.';
            }
          } else {
            // For other tools, ask LLM for a final response
            const finalResponse = await openai.chat.completions.create({
              model: config.openai.model,
              messages: this.conversationHistory,
              temperature: config.openai.temperature,
              max_tokens: config.openai.maxTokens,
            });
            finalText = finalResponse.choices[0]?.message?.content || 'Sorry, I could not process your request.';
          }
        }
        
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