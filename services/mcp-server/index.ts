import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Tool definitions
interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

interface ToolCall {
  name: string;
  parameters: Record<string, any>;
}

// Available tools
const tools: Tool[] = [
  {
    name: 'cancel_booking',
    description: 'Cancels a booking by its ID',
    parameters: {
      type: 'object',
      properties: {
        bookingId: {
          type: 'string',
          description: 'The ID of the booking to cancel'
        }
      },
      required: ['bookingId']
    }
  }
];

// Tool implementations
const toolImplementations: Record<string, (params: any) => Promise<any>> = {
  cancel_booking: async (params: { bookingId: string }) => {
    try {
      const response = await axios.post(
        `http://localhost:3001/bookings/${params.bookingId}/cancel`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to cancel booking');
      }
      throw new Error('Failed to cancel booking');
    }
  }
};

// List available tools
app.get('/tools', (req: Request, res: Response) => {
  res.json(tools);
});

// Execute a tool
app.post('/execute', async (req: Request, res: Response) => {
  try {
    const { toolCalls } = req.body;

    if (!Array.isArray(toolCalls)) {
      return res.status(400).json({ error: 'toolCalls must be an array' });
    }

    const results = await Promise.all(
      toolCalls.map(async (toolCall: ToolCall) => {
        const tool = tools.find(t => t.name === toolCall.name);
        if (!tool) {
          throw new Error(`Tool ${toolCall.name} not found`);
        }

        const implementation = toolImplementations[toolCall.name];
        if (!implementation) {
          throw new Error(`Implementation for tool ${toolCall.name} not found`);
        }

        // Validate required parameters
        const missingParams = tool.parameters.required.filter(
          param => !(param in toolCall.parameters)
        );

        if (missingParams.length > 0) {
          throw new Error(
            `Missing required parameters: ${missingParams.join(', ')}`
          );
        }

        return {
          tool: toolCall.name,
          result: await implementation(toolCall.parameters)
        };
      })
    );

    res.json({ results });
  } catch (error) {
    console.error('Error executing tools:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`MCP Server is running on port ${port}`);
}); 