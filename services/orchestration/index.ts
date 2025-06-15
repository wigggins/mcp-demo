import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config';
import { OpenAIService } from './services/openai';

const app = express();
const port = config.server.port;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize OpenAI service
const openAIService = OpenAIService.getInstance();

// Chat endpoint
app.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await openAIService.sendMessage(message);

    res.json({
      ...response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    });
  }
});

// Clear conversation history endpoint
app.post('/chat/clear', (req: Request, res: Response) => {
  try {
    openAIService.clearHistory();
    res.json({ message: 'Conversation history cleared' });
  } catch (error) {
    console.error('Error clearing conversation history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
