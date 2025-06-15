import { Plus, Filter, Edit, Trash2 } from 'lucide-react'

const BookingsList = () => {
  // Sample booking data
  const bookings = [
    {
      id: 1,
      patientName: "John Smith",
      careCenter: "Sunshine Care Center",
      date: "2024-01-15",
      time: "10:00 AM",
      service: "Physical Therapy",
      status: "confirmed",
      duration: "60 min"
    },
    {
      id: 2,
      patientName: "Sarah Johnson",
      careCenter: "Green Valley Center",
      date: "2024-01-16",
      time: "2:30 PM",
      service: "Consultation",
      status: "pending",
      duration: "30 min"
    },
    {
      id: 3,
      patientName: "Michael Brown",
      careCenter: "Riverside Care",
      date: "2024-01-16",
      time: "9:15 AM",
      service: "Occupational Therapy",
      status: "completed",
      duration: "45 min"
    },
    {
      id: 4,
      patientName: "Emily Davis",
      careCenter: "Sunrise Medical",
      date: "2024-01-17",
      time: "11:00 AM",
      service: "Speech Therapy",
      status: "cancelled",
      duration: "30 min"
    },
    {
      id: 5,
      patientName: "David Wilson",
      careCenter: "Harmony Health",
      date: "2024-01-17",
      time: "3:45 PM",
      service: "Physical Therapy",
      status: "confirmed",
      duration: "60 min"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
      case 'pending':
        return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400'
      case 'completed':
        return 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
      case 'cancelled':
        return 'bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500'
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white mb-2">
            Bookings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all booking appointments and schedules
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700">
          <Plus className="w-4 h-4" />
          New Booking
        </button>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        {/* Table Header */}
        <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              All Bookings
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-full">
            {/* Table Header */}
            <thead>
              <tr className="border-gray-100 border-y dark:border-gray-800">
                <th className="py-3">
                  <div className="flex items-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Patient
                    </p>
                  </div>
                </th>
                <th className="py-3">
                  <div className="flex items-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Care Center
                    </p>
                  </div>
                </th>
                <th className="py-3">
                  <div className="flex items-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Date & Time
                    </p>
                  </div>
                </th>
                <th className="py-3">
                  <div className="flex items-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Service
                    </p>
                  </div>
                </th>
                <th className="py-3">
                  <div className="flex items-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Status
                    </p>
                  </div>
                </th>
                <th className="py-3">
                  <div className="flex items-center">
                    <p className="font-medium text-gray-500 text-theme-xs dark:text-gray-400">
                      Actions
                    </p>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  {/* Patient */}
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {booking.patientName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-theme-sm">
                          {booking.patientName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-theme-xs">
                          {booking.duration}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Care Center */}
                  <td className="py-4">
                    <p className="text-gray-900 dark:text-white text-theme-sm">
                      {booking.careCenter}
                    </p>
                  </td>

                  {/* Date & Time */}
                  <td className="py-4">
                    <div>
                      <p className="text-gray-900 dark:text-white text-theme-sm">
                        {booking.date}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-theme-xs">
                        {booking.time}
                      </p>
                    </div>
                  </td>

                  {/* Service */}
                  <td className="py-4">
                    <p className="text-gray-900 dark:text-white text-theme-sm">
                      {booking.service}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-theme-xs font-medium capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-theme-sm text-gray-500 dark:text-gray-400">
              Showing 1 to 5 of 5 results
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              Previous
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookingsList 