import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { query, getClient } from './src/database';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Types matching our database enums
type BookingStatus = 'DRAFT' | 'PENDING' | 'PARTIAL' | 'CONFIRMED' | 'CANCELLED';
type BookingDayStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

// Create user endpoint
app.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email, password, zip_code } = req.body;

    if (!name || !email || !password || !zip_code) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, email, password, and zip_code are required' 
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashed_pass = await bcrypt.hash(password, saltRounds);

    const result = await query(
      'INSERT INTO users (name, email, hashed_pass, zip_code) VALUES ($1, $2, $3, $4) RETURNING id, name, email, zip_code, created_at',
      [name, email, hashed_pass, zip_code]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create dependent endpoint
app.post('/dependents', async (req: Request, res: Response) => {
  try {
    const { user_id, name, birth_date } = req.body;

    if (!user_id || !name) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id and name are required' 
      });
    }

    const result = await query(
      'INSERT INTO dependents (user_id, name, birth_date) VALUES ($1, $2, $3) RETURNING *',
      [user_id, name, birth_date || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating dependent:', error);
    if (error.code === '23503') { // Foreign key violation
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's dependents
app.get('/users/:userId/dependents', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await query(
      'SELECT * FROM dependents WHERE user_id = $1 ORDER BY name',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching dependents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create center endpoint
app.post('/centers', async (req: Request, res: Response) => {
  try {
    const { name, daily_capacity, zip_code, operating_days } = req.body;

    if (!name || daily_capacity === undefined || !zip_code) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, daily_capacity, and zip_code are required' 
      });
    }

    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Create center
      const centerResult = await client.query(
        'INSERT INTO centers (name, daily_capacity, zip_code) VALUES ($1, $2, $3) RETURNING *',
        [name, daily_capacity, zip_code]
      );

      const center = centerResult.rows[0];

      // Add operating days if provided
      if (operating_days && Array.isArray(operating_days)) {
        for (const weekday of operating_days) {
          await client.query(
            'INSERT INTO center_operating_days (center_id, weekday) VALUES ($1, $2)',
            [center.id, weekday]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json(center);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating center:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get centers with their operating days
app.get('/centers', async (req: Request, res: Response) => {
  try {
    const { zip_code } = req.query;
    
    let whereClause = '';
    const params: any[] = [];
    
    if (zip_code) {
      whereClause = 'WHERE c.zip_code = $1';
      params.push(zip_code);
    }

    const result = await query(`
      SELECT 
        c.*,
        COALESCE(
          json_agg(cod.weekday ORDER BY cod.weekday) FILTER (WHERE cod.weekday IS NOT NULL), 
          '[]'
        ) as operating_days
      FROM centers c
      LEFT JOIN center_operating_days cod ON c.id = cod.center_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.name
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching centers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Intelligent booking endpoint (for orchestration layer)
app.post('/bookings/intelligent', async (req: Request, res: Response) => {
  try {
    const { user_id, request_date, dependent_name } = req.body;

    if (!user_id) {
      return res.status(400).json({ 
        error: 'Missing required field: user_id is required' 
      });
    }

    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Get user details including zip code
      const userResult = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [user_id]
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userResult.rows[0];

      // Get user's dependents
      let dependentQuery = 'SELECT * FROM dependents WHERE user_id = $1';
      const dependentParams = [user_id];

      if (dependent_name) {
        dependentQuery += ' AND LOWER(name) LIKE LOWER($2)';
        dependentParams.push(`%${dependent_name}%`);
      }

      const dependentResult = await client.query(dependentQuery, dependentParams);

      if (dependentResult.rows.length === 0) {
        return res.status(404).json({ 
          error: dependent_name ? `No dependent found matching "${dependent_name}"` : 'No dependents found for user' 
        });
      }

      // Use first matching dependent
      const dependent = dependentResult.rows[0];

      // Find centers in user's zip code
      const centerResult = await client.query(
        'SELECT * FROM centers WHERE zip_code = $1 ORDER BY name LIMIT 1',
        [user.zip_code]
      );

      if (centerResult.rows.length === 0) {
        return res.status(404).json({ 
          error: `No childcare centers found in zip code ${user.zip_code}` 
        });
      }

      const center = centerResult.rows[0];

      // Parse date (default to tomorrow if not provided)
      let bookingDate;
      if (request_date) {
        bookingDate = new Date(request_date);
      } else {
        bookingDate = new Date();
        bookingDate.setDate(bookingDate.getDate() + 1); // Tomorrow
      }

      // Create booking
      const bookingResult = await client.query(
        'INSERT INTO bookings (user_id, dependent_id, status) VALUES ($1, $2, $3) RETURNING *',
        [user_id, dependent.id, 'DRAFT']
      );

      const booking = bookingResult.rows[0];

      // Create booking day
      const dayResult = await client.query(
        'INSERT INTO booking_days (booking_id, date, center_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [booking.id, bookingDate.toISOString().split('T')[0], center.id, 'PENDING']
      );

      await client.query('COMMIT');

      // Return comprehensive booking details
      const fullBooking = {
        ...booking,
        user_name: user.name,
        user_email: user.email,
        user_zip_code: user.zip_code,
        dependent_name: dependent.name,
        dependent_birth_date: dependent.birth_date,
        center_name: center.name,
        center_zip_code: center.zip_code,
        booking_days: [dayResult.rows[0]]
      };

      console.log('Intelligent booking created:', fullBooking);
      res.status(201).json(fullBooking);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating intelligent booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create booking endpoint
app.post('/bookings', async (req: Request, res: Response) => {
  try {
    const { user_id, dependent_id, booking_days } = req.body;

    if (!user_id || !dependent_id || !booking_days || !Array.isArray(booking_days) || booking_days.length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields: user_id, dependent_id, and booking_days (array) are required' 
      });
    }

    const client = await getClient();
    
    try {
      await client.query('BEGIN');

      // Create booking
      const bookingResult = await client.query(
        'INSERT INTO bookings (user_id, dependent_id, status) VALUES ($1, $2, $3) RETURNING *',
        [user_id, dependent_id, 'DRAFT']
      );

      const booking = bookingResult.rows[0];

      // Create booking days
      const bookingDayInserts = [];
      for (const day of booking_days) {
        const { date, center_id } = day;
        if (!date) {
          throw new Error('Each booking day must have a date');
        }

        const dayResult = await client.query(
          'INSERT INTO booking_days (booking_id, date, center_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
          [booking.id, date, center_id || null, 'PENDING']
        );
        bookingDayInserts.push(dayResult.rows[0]);
      }

      await client.query('COMMIT');

      // Return booking with days
      const fullBooking = {
        ...booking,
        booking_days: bookingDayInserts
      };

      console.log('Booking created:', fullBooking);
      res.status(201).json(fullBooking);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating booking:', error);
    if (error.code === '23503') { // Foreign key violation
      return res.status(404).json({ error: 'User or dependent not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update booking status
app.patch('/bookings/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: BookingStatus[] = ['DRAFT', 'PENDING', 'PARTIAL', 'CONFIRMED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking endpoint (for backward compatibility)
app.post('/bookings/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE bookings SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      ['CANCELLED', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Respond to booking day (for centers)
app.patch('/booking-days/:id/respond', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses: BookingDayStatus[] = ['PENDING', 'ACCEPTED', 'DECLINED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const result = await query(
      'UPDATE booking_days SET status = $1, center_responded_at = now() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking day not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error responding to booking day:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List bookings endpoint
app.get('/bookings', async (req: Request, res: Response) => {
  try {
    const { status, user_id, center_id } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      whereClause += ` AND b.status = $${paramCount}`;
      params.push(status);
    }

    if (user_id) {
      paramCount++;
      whereClause += ` AND b.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (center_id) {
      paramCount++;
      whereClause += ` AND EXISTS (SELECT 1 FROM booking_days bd WHERE bd.booking_id = b.id AND bd.center_id = $${paramCount})`;
      params.push(center_id);
    }

    const result = await query(`
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        d.name as dependent_name,
        d.birth_date as dependent_birth_date,
        COALESCE(
          json_agg(
            json_build_object(
              'id', bd.id,
              'date', bd.date,
              'center_id', bd.center_id,
              'status', bd.status,
              'center_responded_at', bd.center_responded_at,
              'center_name', c.name
            ) ORDER BY bd.date
          ) FILTER (WHERE bd.id IS NOT NULL), 
          '[]'
        ) as booking_days
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN dependents d ON b.dependent_id = d.id
      LEFT JOIN booking_days bd ON b.id = bd.booking_id
      LEFT JOIN centers c ON bd.center_id = c.id
      ${whereClause}
      GROUP BY b.id, u.name, u.email, d.name, d.birth_date
      ORDER BY b.created_at DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Error listing bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single booking with details
app.get('/bookings/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        b.*,
        u.name as user_name,
        u.email as user_email,
        d.name as dependent_name,
        d.birth_date as dependent_birth_date,
        COALESCE(
          json_agg(
            json_build_object(
              'id', bd.id,
              'date', bd.date,
              'center_id', bd.center_id,
              'status', bd.status,
              'center_responded_at', bd.center_responded_at,
              'center_name', c.name
            ) ORDER BY bd.date
          ) FILTER (WHERE bd.id IS NOT NULL), 
          '[]'
        ) as booking_days
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN dependents d ON b.dependent_id = d.id
      LEFT JOIN booking_days bd ON b.id = bd.booking_id
      LEFT JOIN centers c ON bd.center_id = c.id
      WHERE b.id = $1
      GROUP BY b.id, u.name, u.email, d.name, d.birth_date
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    await query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Booking service is running on port ${port}`);
  console.log(`Database: ${process.env.DATABASE_URL ? 'configured' : 'not configured'}`);
}); 