import { Link } from 'react-router-dom'
import { 
  Calendar, 
  Building2, 
  Clock, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Plus,
  ArrowRight,
  Activity
} from 'lucide-react'

const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-title-md font-bold text-gray-900 dark:text-white mb-2">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to your booking management dashboard
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4">
        {/* Total Bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/12">
            <Calendar className="w-6 h-6 text-brand-500 dark:text-brand-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-sm font-bold text-gray-900 dark:text-white">
                245
              </h4>
              <span className="text-theme-sm font-medium text-gray-500 dark:text-gray-400">
                Total Bookings
              </span>
            </div>
            <span className="flex items-center gap-1 text-theme-sm font-medium text-success-600">
              <TrendingUp className="w-3 h-3" />
              12%
            </span>
          </div>
        </div>

        {/* Active Care Centers */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/12">
            <Building2 className="w-6 h-6 text-success-600 dark:text-success-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-sm font-bold text-gray-900 dark:text-white">
                18
              </h4>
              <span className="text-theme-sm font-medium text-gray-500 dark:text-gray-400">
                Active Care Centers
              </span>
            </div>
            <span className="flex items-center gap-1 text-theme-sm font-medium text-success-600">
              <TrendingUp className="w-3 h-3" />
              8%
            </span>
          </div>
        </div>

        {/* Pending Bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-50 dark:bg-warning-500/12">
            <Clock className="w-6 h-6 text-warning-600 dark:text-warning-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-sm font-bold text-gray-900 dark:text-white">
                32
              </h4>
              <span className="text-theme-sm font-medium text-gray-500 dark:text-gray-400">
                Pending Bookings
              </span>
            </div>
            <span className="flex items-center gap-1 text-theme-sm font-medium text-warning-600">
              <TrendingDown className="w-3 h-3" />
              2%
            </span>
          </div>
        </div>

        {/* Available Capacity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-50 dark:bg-error-500/12">
            <Users className="w-6 h-6 text-error-600 dark:text-error-400" />
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h4 className="text-title-sm font-bold text-gray-900 dark:text-white">
                89%
              </h4>
              <span className="text-theme-sm font-medium text-gray-500 dark:text-gray-400">
                Capacity Used
              </span>
            </div>
            <span className="flex items-center gap-1 text-theme-sm font-medium text-error-600">
              <TrendingDown className="w-3 h-3" />
              5%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/bookings"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-brand-50 dark:bg-brand-500/12 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                </div>
                <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                  View All Bookings
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <Link
              to="/care-centers"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-success-50 dark:bg-success-500/12 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-success-500 dark:text-success-400" />
                </div>
                <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                  Manage Care Centers
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </Link>
            
            <button className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-warning-50 dark:bg-warning-500/12 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-warning-500 dark:text-warning-400" />
                </div>
                <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                  Create New Booking
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-success-50 dark:bg-success-500/12 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-success-500 dark:text-success-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-theme-sm font-medium text-gray-900 dark:text-white">
                  New booking confirmed
                </p>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Sarah Johnson - Sunrise Care Center
                </p>
                <p className="text-theme-xs text-gray-400 dark:text-gray-500">
                  2 minutes ago
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-500/12 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-theme-sm font-medium text-gray-900 dark:text-white">
                  Care center updated
                </p>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Golden Years Facility - Capacity increased
                </p>
                <p className="text-theme-xs text-gray-400 dark:text-gray-500">
                  15 minutes ago
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-warning-50 dark:bg-warning-500/12 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-warning-500 dark:text-warning-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-theme-sm font-medium text-gray-900 dark:text-white">
                  Booking pending review
                </p>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Michael Chen - Comfort Care Home
                </p>
                <p className="text-theme-xs text-gray-400 dark:text-gray-500">
                  1 hour ago
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-error-50 dark:bg-error-500/12 flex items-center justify-center flex-shrink-0">
                <Activity className="w-4 h-4 text-error-500 dark:text-error-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-theme-sm font-medium text-gray-900 dark:text-white">
                  System maintenance
                </p>
                <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                  Scheduled maintenance completed
                </p>
                <p className="text-theme-xs text-gray-400 dark:text-gray-500">
                  3 hours ago
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 