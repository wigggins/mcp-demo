import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for bookings (replace with a database in production)
interface Booking {
  id: string;
  customerName: string;
  date: string;
  service: string;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

const bookings: Booking[] = [];

// Create booking endpoint
app.post('/bookings', (req: Request, res: Response) => {
  try {
    const { customerName, date, service } = req.body;

    // Validate required fields
    if (!customerName || !date || !service) {
      return res.status(400).json({ 
        error: 'Missing required fields: customerName, date, and service are required' 
      });
    }

    const newBooking: Booking = {
      id: uuidv4(),
      customerName,
      date,
      service,
      status: 'confirmed',
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);
    console.log('Booking created:', newBooking);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking endpoint
app.post('/bookings/:id/cancel', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = bookings.find(b => b.id === id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    booking.status = 'cancelled';
    res.json(booking);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List bookings endpoint
app.get('/bookings', (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    let filteredBookings = bookings;
    if (status) {
      filteredBookings = bookings.filter(b => b.status === status);
    }

    res.json(filteredBookings);
  } catch (error) {
    console.error('Error listing bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Start the server
app.listen(port, () => {
  console.log(`Booking service is running on port ${port}`);
}); 