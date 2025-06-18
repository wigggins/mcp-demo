import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { Center, Booking, Dependent } from '../services/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface ApiListState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

// Hook for fetching centers
export function useCenters(zipCode?: string) {
  const [state, setState] = useState<ApiListState<Center>>({
    data: [],
    loading: true,
    error: null,
  });

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const centers = await apiService.getCenters(zipCode);
      setState({ data: centers, loading: false, error: null });
    } catch (error) {
      setState({ data: [], loading: false, error: 'Failed to fetch centers' });
      console.error('Error fetching centers:', error);
    }
  };

  useEffect(() => {
    refetch();
  }, [zipCode]);

  return { ...state, refetch };
}

// Hook for fetching bookings
export function useBookings(params?: {
  status?: string;
  user_id?: string;
  center_id?: string;
}) {
  const [state, setState] = useState<ApiListState<Booking>>({
    data: [],
    loading: true,
    error: null,
  });

  const refetch = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const bookings = await apiService.getBookings(params);
      setState({ data: bookings, loading: false, error: null });
    } catch (error) {
      setState({ data: [], loading: false, error: 'Failed to fetch bookings' });
      console.error('Error fetching bookings:', error);
    }
  };

  useEffect(() => {
    refetch();
  }, [params?.status, params?.user_id, params?.center_id]);

  return { ...state, refetch };
}

// Hook for fetching a single booking
export function useBooking(id: string) {
  const [state, setState] = useState<ApiState<Booking>>({
    data: null,
    loading: true,
    error: null,
  });

  const refetch = async () => {
    if (!id) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const booking = await apiService.getBooking(id);
      setState({ data: booking, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: 'Failed to fetch booking' });
      console.error('Error fetching booking:', error);
    }
  };

  useEffect(() => {
    refetch();
  }, [id]);

  return { ...state, refetch };
}

// Hook for fetching user dependents
export function useUserDependents(userId: string) {
  const [state, setState] = useState<ApiListState<Dependent>>({
    data: [],
    loading: true,
    error: null,
  });

  const refetch = async () => {
    if (!userId) return;
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const dependents = await apiService.getUserDependents(userId);
      setState({ data: dependents, loading: false, error: null });
    } catch (error) {
      setState({ data: [], loading: false, error: 'Failed to fetch dependents' });
      console.error('Error fetching dependents:', error);
    }
  };

  useEffect(() => {
    refetch();
  }, [userId]);

  return { ...state, refetch };
}

// Hook for health check
export function useHealthCheck() {
  const [state, setState] = useState<ApiState<{ status: string; database: string }>>({
    data: null,
    loading: true,
    error: null,
  });

  const check = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const health = await apiService.healthCheck();
      setState({ data: health, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: 'Service unavailable' });
      console.error('Health check failed:', error);
    }
  };

  useEffect(() => {
    check();
  }, []);

  return { ...state, check };
} 