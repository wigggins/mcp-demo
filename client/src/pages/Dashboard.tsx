import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Dependent {
  id: string;
  name: string;
  birth_date: string;
}

interface Booking {
  id: string;
  status: string;
  created_at: string;
  dependent_name: string;
  center_name: string;
  booking_days: Array<{
    date: string;
    status: string;
  }>;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    dependent_name: '',
    request_date: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  // Refresh data when returning to dashboard (useful after adding children)
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchUserData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch dependents
      const dependentsResponse = await fetch(`http://localhost:3001/users/${user.id}/dependents`);
      if (dependentsResponse.ok) {
        const dependentsData = await dependentsResponse.json();
        setDependents(dependentsData);
      }

      // Fetch bookings
      const bookingsResponse = await fetch(`http://localhost:3001/bookings?user_id=${user.id}`);
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch('http://localhost:3001/bookings/intelligent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          dependent_name: bookingForm.dependent_name || undefined,
          request_date: bookingForm.request_date || undefined,
        }),
      });

      if (response.ok) {
        const newBooking = await response.json();
        setBookings(prev => [newBooking, ...prev]);
        setIsBookingModalOpen(false);
        setBookingForm({ dependent_name: '', request_date: '' });
      } else {
        const error = await response.json();
        alert(`Booking failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred while creating the booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => ['PENDING', 'CONFIRMED'].includes(b.status));
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED');

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">
          Manage your childcare bookings and family information from your dashboard.
        </p>
        <button
          onClick={() => setIsBookingModalOpen(true)}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          + Quick Booking
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Total Bookings</h3>
          <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Active Bookings</h3>
          <p className="text-3xl font-bold text-gray-900">{activeBookings.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Children</h3>
          <p className="text-3xl font-bold text-gray-900">{dependents.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 text-sm font-medium">Cancelled</h3>
          <p className="text-3xl font-bold text-gray-900">{cancelledBookings.length}</p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
        </div>
        <div className="border-t border-gray-200">
          {bookings.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No bookings yet. Create your first booking above!
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {bookings.slice(0, 5).map((booking) => (
                <li key={booking.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {booking.dependent_name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {booking.dependent_name} - {booking.center_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.booking_days.length} day(s) - {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Booking Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Booking</h3>
            <form onSubmit={handleQuickBooking} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Child (optional)
                </label>
                <select
                  value={bookingForm.dependent_name}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, dependent_name: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a child or leave blank for first child</option>
                  {dependents.map((dep) => (
                    <option key={dep.id} value={dep.name}>
                      {dep.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date (optional, defaults to tomorrow)
                </label>
                <input
                  type="date"
                  value={bookingForm.request_date}
                  onChange={(e) => setBookingForm(prev => ({ ...prev, request_date: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Create Booking
                </button>
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 