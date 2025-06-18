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
    name: 'get_care_centers',
    description: 'Retrieves a list of childcare centers, optionally filtered by ZIP code. Returns center information that can be displayed as cards to the user.',
    parameters: {
      type: 'object',
      properties: {
        zip_code: {
          type: 'string',
          description: 'The ZIP code to filter centers by (optional)'
        },
        user_id: {
          type: 'string',
          description: 'The ID of the user requesting centers (optional, used for personalized results)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_user_dependents',
    description: 'Retrieves a list of the user\'s children/dependents. Useful when the user wants to book care but hasn\'t specified which child.',
    parameters: {
      type: 'object',
      properties: {
        user_id: {
          type: 'string',
          description: 'The ID of the user whose dependents to retrieve'
        }
      },
      required: ['user_id']
    }
  },
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
        request_dates: {
          type: 'array',
          items: {
            type: 'string'
          },
          description: 'Multiple requested dates for childcare (optional, use this for multi-day bookings). Format: ["YYYY-MM-DD", "YYYY-MM-DD"]'
        },
        dependent_name: {
          type: 'string',
          description: 'The name of the child/dependent (optional, will use first dependent if not specified)'
        },
        center_name: {
          type: 'string',
          description: 'The name of the specific childcare center to book at (optional, will auto-select if not specified)'
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
  get_care_centers: async (params: { 
    zip_code?: string;
    user_id?: string;
  }) => {
    try {
      console.log('Fetching care centers with params:', params);
      
      const url = new URL('http://localhost:3001/centers');
      if (params.zip_code) {
        url.searchParams.append('zip_code', params.zip_code);
      }
      
      const response = await axios.get(url.toString());
      
      console.log('Care centers fetched successfully:', response.data);
      
      // Return structured data with component rendering flag
      return {
        type: 'component_render',
        component: 'care_center_cards',
        data: response.data,
        metadata: {
          zip_code: params.zip_code || 'all areas',
          count: response.data.length
        }
      };
    } catch (error) {
      console.error('Error fetching care centers:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to fetch care centers');
      }
      throw new Error('Failed to fetch care centers');
    }
  },
  get_user_dependents: async (params: { 
    user_id: string;
  }) => {
    try {
      console.log('Fetching user dependents with params:', params);
      
      const response = await axios.get(`http://localhost:3001/users/${params.user_id}/dependents`);
      
      console.log('User dependents fetched successfully:', response.data);
      
      return {
        dependents: response.data
      };
    } catch (error) {
      console.error('Error fetching user dependents:', error);
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.error || 'Failed to fetch user dependents');
      }
      throw new Error('Failed to fetch user dependents');
    }
  },
  create_intelligent_booking: async (params: { 
    user_id: string;
    request_date?: string;
    request_dates?: string[];
    dependent_name?: string;
    center_name?: string;
  }) => {
    try {
      console.log('Creating intelligent booking with params:', params);
      
      const bookingPayload: any = {
        user_id: params.user_id
      };
      
      if (params.request_date) {
        bookingPayload.request_date = params.request_date;
      }
      
      if (params.request_dates) {
        bookingPayload.request_dates = params.request_dates;
      }
      
      if (params.dependent_name) {
        bookingPayload.dependent_name = params.dependent_name;
      }
      
      if (params.center_name) {
        bookingPayload.center_name = params.center_name;
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
        // Return the full error response for better error handling
        return {
          error: error.response.data.error || 'Failed to create intelligent booking',
          unavailable_dates: error.response.data.unavailable_dates,
          available_centers: error.response.data.available_centers
        };
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