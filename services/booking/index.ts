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

// Login endpoint
app.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing required fields: email and password are required' 
      });
    }

    // Find user by email
    const result = await query(
      'SELECT id, name, email, hashed_pass, zip_code, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.hashed_pass);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Return user data (excluding password hash)
    const { hashed_pass, ...userWithoutPassword } = user;
    res.json({ 
      user: userWithoutPassword,
      message: 'Login successful' 
    });
  } catch (error: any) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// Update dependent endpoint
app.put('/dependents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, birth_date } = req.body;

    if (!name) {
      return res.status(400).json({ 
        error: 'Missing required field: name is required' 
      });
    }

    const result = await query(
      'UPDATE dependents SET name = $1, birth_date = $2, updated_at = now() WHERE id = $3 RETURNING *',
      [name, birth_date || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dependent not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating dependent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete dependent endpoint
app.delete('/dependents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM dependents WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dependent not found' });
    }

    res.json({ message: 'Dependent deleted successfully', dependent: result.rows[0] });
  } catch (error: any) {
    console.error('Error deleting dependent:', error);
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

// Helper function to get center availability for given dates
async function getCenterAvailability(client: any, centerIds: string[], dates: string[]) {
  const availability: Record<string, Record<string, boolean>> = {};
  
  for (const centerId of centerIds) {
    availability[centerId] = {};
    
    for (const dateStr of dates) {
      const date = new Date(dateStr);
      const weekday = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday(0) to 7
      
      // Check if center operates on this weekday
      const operatingResult = await client.query(
        'SELECT 1 FROM center_operating_days WHERE center_id = $1 AND weekday = $2',
        [centerId, weekday]
      );
      
      let isAvailable = operatingResult.rows.length > 0;
      
      // Check for schedule exceptions (closures or capacity overrides)
      if (isAvailable) {
        const exceptionResult = await client.query(
          'SELECT is_closed, capacity_override FROM center_schedule_exceptions WHERE center_id = $1 AND date = $2',
          [centerId, dateStr]
        );
        
        if (exceptionResult.rows.length > 0) {
          const exception = exceptionResult.rows[0];
          if (exception.is_closed) {
            isAvailable = false;
          }
          // Note: We could also check capacity_override vs current bookings here
        }
      }
      
      availability[centerId][dateStr] = isAvailable;
    }
  }
  
  return availability;
}

// Helper function to find optimal center assignment for multiple dates
function optimizeCenterAssignment(availability: Record<string, Record<string, boolean>>, dates: string[], preferredCenterId?: string) {
  const assignments: Record<string, string> = {};
  const unassigned: string[] = [];
  
  // If a preferred center is specified and can handle all dates, use it
  if (preferredCenterId && availability[preferredCenterId]) {
    const canHandleAll = dates.every(date => availability[preferredCenterId!][date]);
    if (canHandleAll) {
      dates.forEach(date => {
        assignments[date] = preferredCenterId!;
      });
      return { assignments, unassigned: [] };
    }
  }
  
  // Try to minimize the number of different centers used
  const centerIds = Object.keys(availability);
  
  // First, try to find a single center that can handle all dates
  for (const centerId of centerIds) {
    const canHandleAll = dates.every(date => availability[centerId][date]);
    if (canHandleAll) {
      dates.forEach(date => {
        assignments[date] = centerId;
      });
      return { assignments, unassigned: [] };
    }
  }
  
  // If no single center can handle all dates, use greedy assignment
  // Prefer centers that can handle more dates
  const remainingDates = [...dates];
  
  while (remainingDates.length > 0) {
    let bestCenter = null;
    let bestCount = 0;
    
    // Find center that can handle the most remaining dates
    for (const centerId of centerIds) {
      const canHandle = remainingDates.filter(date => availability[centerId][date]);
      if (canHandle.length > bestCount) {
        bestCenter = centerId;
        bestCount = canHandle.length;
      }
    }
    
    if (!bestCenter || bestCount === 0) {
      // No center can handle remaining dates
      unassigned.push(...remainingDates);
      break;
    }
    
    // Assign dates to the best center
    const assignedDates = remainingDates.filter(date => availability[bestCenter!][date]);
    assignedDates.forEach(date => {
      assignments[date] = bestCenter!;
      const index = remainingDates.indexOf(date);
      remainingDates.splice(index, 1);
    });
  }
  
  return { assignments, unassigned };
}

// Intelligent booking endpoint (for orchestration layer) - Enhanced for multi-day bookings
app.post('/bookings/intelligent', async (req: Request, res: Response) => {
  try {
    const { user_id, request_date, request_dates, dependent_name, center_name } = req.body;

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
      
      // Order by created_at to get the first registered child when no specific name is provided
      dependentQuery += ' ORDER BY created_at ASC';

      const dependentResult = await client.query(dependentQuery, dependentParams);

      if (dependentResult.rows.length === 0) {
        return res.status(404).json({ 
          error: dependent_name ? `No dependent found matching "${dependent_name}"` : 'No dependents found for user' 
        });
      }

      // Use first matching dependent
      const dependent = dependentResult.rows[0];

      // Parse dates - support both single date and multiple dates
      let requestDates: string[] = [];
      
      if (request_dates && Array.isArray(request_dates)) {
        // Multiple dates provided
        requestDates = request_dates;
      } else if (request_date) {
        // Single date provided
        requestDates = [request_date];
      } else {
        // Default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        requestDates = [tomorrow.toISOString().split('T')[0]];
      }

      // Validate and sort dates
      requestDates = requestDates
        .map(dateStr => {
          const date = new Date(dateStr);
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date: ${dateStr}`);
          }
          return date.toISOString().split('T')[0];
        })
        .sort();

      // Find centers in user's zip code
      let centerQuery = `
        SELECT c.*, 
               array_agg(cod.weekday ORDER BY cod.weekday) as operating_days
        FROM centers c
        LEFT JOIN center_operating_days cod ON c.id = cod.center_id
        WHERE c.zip_code = $1
      `;
      const centerParams = [user.zip_code];
      
      if (center_name) {
        centerQuery += ' AND LOWER(c.name) LIKE LOWER($2)';
        centerParams.push(`%${center_name}%`);
      }
      
      centerQuery += ' GROUP BY c.id ORDER BY c.name';

      const centerResult = await client.query(centerQuery, centerParams);

      if (centerResult.rows.length === 0) {
        if (center_name) {
          return res.status(404).json({ 
            error: `No childcare center found matching "${center_name}" in zip code ${user.zip_code}` 
          });
        } else {
          return res.status(404).json({ 
            error: `No childcare centers found in zip code ${user.zip_code}` 
          });
        }
      }

      const availableCenters = centerResult.rows;
      const centerIds = availableCenters.map(c => c.id);

      // Get availability for all centers and dates
      const availability = await getCenterAvailability(client, centerIds, requestDates);
      
      // Find preferred center ID if center name was specified
      const preferredCenter = center_name ? 
        availableCenters.find(c => c.name.toLowerCase().includes(center_name.toLowerCase())) : 
        null;

      // Optimize center assignments
      const { assignments, unassigned } = optimizeCenterAssignment(
        availability, 
        requestDates, 
        preferredCenter?.id
      );

      if (unassigned.length > 0) {
        return res.status(400).json({
          error: `No available centers found for the following dates: ${unassigned.join(', ')}. Please check center schedules and try different dates.`,
          unavailable_dates: unassigned,
          available_centers: availableCenters.map(c => ({
            name: c.name,
            operating_days: c.operating_days
          }))
        });
      }

      // Create booking
      const bookingResult = await client.query(
        'INSERT INTO bookings (user_id, dependent_id, status) VALUES ($1, $2, $3) RETURNING *',
        [user_id, dependent.id, 'DRAFT']
      );

      const booking = bookingResult.rows[0];

      // Create booking days for each assigned date
      const bookingDays = [];
      const centerAssignments = Object.entries(assignments);
      
      for (const [dateStr, centerId] of centerAssignments) {
        const dayResult = await client.query(
          'INSERT INTO booking_days (booking_id, date, center_id, status) VALUES ($1, $2, $3, $4) RETURNING *',
          [booking.id, dateStr, centerId, 'PENDING']
        );
        
        const center = availableCenters.find(c => c.id === centerId);
        bookingDays.push({
          ...dayResult.rows[0],
          center_name: center?.name || 'Unknown Center'
        });
      }

      await client.query('COMMIT');

      // Calculate assignment summary
      const centerUsage = new Map<string, number>();
      centerAssignments.forEach(([_, centerId]) => {
        const center = availableCenters.find(c => c.id === centerId);
        if (center) {
          centerUsage.set(center.name, (centerUsage.get(center.name) || 0) + 1);
        }
      });

      // Return comprehensive booking details
      const fullBooking = {
        ...booking,
        user_name: user.name,
        user_email: user.email,
        user_zip_code: user.zip_code,
        dependent_name: dependent.name,
        dependent_birth_date: dependent.birth_date,
        booking_days: bookingDays,
        assignment_summary: {
          total_days: requestDates.length,
          centers_used: centerUsage.size,
          center_breakdown: Object.fromEntries(centerUsage)
        }
      };

      console.log('Multi-day intelligent booking created:', {
        bookingId: booking.id,
        dates: requestDates,
        assignments: Object.fromEntries(centerAssignments.map(([date, centerId]) => {
          const center = availableCenters.find(c => c.id === centerId);
          return [date, center?.name || centerId];
        }))
      });
      
      res.status(201).json(fullBooking);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating intelligent booking:', error);
    if (error.message.includes('Invalid date')) {
      return res.status(400).json({ error: error.message });
    }
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