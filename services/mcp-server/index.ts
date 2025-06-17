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
    name: 'create_intelligent_booking',
    description: 'Creates a childcare booking intelligently based on user request. Automatically finds suitable childcare centers in the user\'s area and matches with their dependents.',
    parameters: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The ID of the user making the booking request'
        },
        request_date: {
          type: 'string',
          description: 'The requested date for childcare (optional, defaults to tomorrow if not specified). Format: YYYY-MM-DD'
        },
        dependent_name: {
          type: 'string',
          description: 'The name of the child/dependent (optional, will use first dependent if not specified)'
        }
      },
      required: ['user_id']
    }
  },
  {
    name: 'create_booking',
    description: 'Creates a new booking with the specified details (legacy format)',
    parameters: {
      type: 'object',
      properties: {
        customerId: {
          type: 'string',
          description: 'The ID of the customer making the booking'
        },
        serviceId: {
          type: 'string',
          description: 'The ID of the service being booked'
        },
        startTime: {
          type: 'string',
          description: 'The start time of the booking in ISO format'
        },
        endTime: {
          type: 'string',
          description: 'The end time of the booking in ISO format'
        }
      },
      required: ['customerId', 'serviceId', 'startTime', 'endTime']
    }
  },
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
  create_intelligent_booking: async (params: { 
    user_id: string;
    request_date?: string;
    dependent_name?: string;
  }) => {
    try {
      console.log('Creating intelligent booking with params:', params);
      
      const bookingPayload: any = {
        user_id: params.user_id
      };
      
      if (params.request_date) {
        bookingPayload.request_date = params.request_date;
      }
      
      if (params.dependent_name) {
        bookingPayload.dependent_name = params.dependent_name;
      }
      
      const response = await axios.post(
        'http://localhost:3001/bookings/intelligent',
        bookingPayload
      );
      
      console.log('Intelligent booking created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating intelligent booking:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to create intelligent booking');
      }
      throw new Error('Failed to create intelligent booking');
    }
  },
  create_booking: async (params: { 
    customerId: string;
    serviceId: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      // Map parameters to booking service format
      const bookingPayload = {
        customerName: params.customerId, // Map customerId to customerName
        service: params.serviceId,      // Map serviceId to service
        date: params.startTime          // Use startTime as date
      };
      const response = await axios.post(
        'http://localhost:3001/bookings',
        bookingPayload
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to create booking');
      }
      throw new Error('Failed to create booking');
    }
  },
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