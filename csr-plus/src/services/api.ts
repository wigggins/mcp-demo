import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on the database schema
export interface User {
  id: string;
  name: string;
  email: string;
  zip_code: string;
  created_at: string;
  updated_at: string;
}

export interface Dependent {
  id: string;
  user_id: string;
  name: string;
  birth_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Center {
  id: string;
  name: string;
  daily_capacity: number;
  zip_code: string;
  operating_days?: number[];
  created_at: string;
  updated_at: string;
}

export interface BookingDay {
  id: string;
  booking_id: string;
  date: string;
  center_id?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  center_responded_at?: string;
  center_name?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  dependent_id: string;
  status: 'DRAFT' | 'PENDING' | 'PARTIAL' | 'CONFIRMED' | 'CANCELLED';
  user_name?: string;
  user_email?: string;
  dependent_name?: string;
  dependent_birth_date?: string;
  booking_days: BookingDay[];
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  message: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  zip_code: string;
}

export interface CreateBookingRequest {
  user_id: string;
  dependent_id: string;
  booking_days: Array<{
    date: string;
    center_id?: string;
  }>;
}

export interface IntelligentBookingRequest {
  user_id: string;
  request_date?: string;
  dependent_name?: string;
}

// API Service Class
class ApiService {
  // Authentication
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  // Users
  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await api.post('/users', userData);
    return response.data;
  }

  async getUserDependents(userId: string): Promise<Dependent[]> {
    const response = await api.get(`/users/${userId}/dependents`);
    return response.data;
  }

  // Dependents
  async createDependent(dependentData: Omit<Dependent, 'id' | 'created_at' | 'updated_at'>): Promise<Dependent> {
    const response = await api.post('/dependents', dependentData);
    return response.data;
  }

  async updateDependent(id: string, dependentData: Partial<Dependent>): Promise<Dependent> {
    const response = await api.put(`/dependents/${id}`, dependentData);
    return response.data;
  }

  async deleteDependent(id: string): Promise<void> {
    await api.delete(`/dependents/${id}`);
  }

  // Centers
  async getCenters(zipCode?: string): Promise<Center[]> {
    const params = zipCode ? { zip_code: zipCode } : {};
    const response = await api.get('/centers', { params });
    return response.data;
  }

  async createCenter(centerData: Omit<Center, 'id' | 'created_at' | 'updated_at'> & { operating_days?: number[] }): Promise<Center> {
    const response = await api.post('/centers', centerData);
    return response.data;
  }

  // Bookings
  async getBookings(params?: {
    status?: string;
    user_id?: string;
    center_id?: string;
  }): Promise<Booking[]> {
    const response = await api.get('/bookings', { params });
    return response.data;
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  }

  async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  }

  async createIntelligentBooking(bookingData: IntelligentBookingRequest): Promise<Booking> {
    const response = await api.post('/bookings/intelligent', bookingData);
    return response.data;
  }

  async updateBookingStatus(id: string, status: Booking['status']): Promise<Booking> {
    const response = await api.patch(`/bookings/${id}/status`, { status });
    return response.data;
  }

  async cancelBooking(id: string): Promise<Booking> {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  }

  // Booking Days
  async respondToBookingDay(id: string, status: BookingDay['status']): Promise<BookingDay> {
    const response = await api.patch(`/booking-days/${id}/respond`, { status });
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; database: string }> {
    const response = await api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService; 