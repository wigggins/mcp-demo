const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export class ChatService {
  private static instance: ChatService;

  private constructor() {}

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public async sendMessage(message: string): Promise<{ message: string; component?: any }> {
    try {
      // Get user data from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, user }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Check if there are tool results with component data
      let component = null;
      if (data.toolResults && Array.isArray(data.toolResults)) {
        const componentResult = data.toolResults.find((result: any) => 
          result && typeof result === 'object' && result.result && result.result.type === 'component_render'
        );
        if (componentResult && componentResult.result) {
          component = {
            type: componentResult.result.component,
            data: componentResult.result.data,
            metadata: componentResult.result.metadata
          };
        }
      }
      
      return { 
        message: data.message,
        component 
      };
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  public async clearHistory(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/chat/clear`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to clear chat history');
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw new Error('Failed to clear chat history');
    }
  }
} 