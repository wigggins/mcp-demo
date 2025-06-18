import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Plus, Search, Filter, Star, MapPin, Phone, Mail, Eye, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { useCenters } from '../hooks/useApi'

const CareCentersList = () => {
  const [searchZipCode, setSearchZipCode] = useState<string>('')
  const { data: centers, loading, error, refetch } = useCenters()

  const handleZipCodeFilter = (zipCode: string) => {
    setSearchZipCode(zipCode)
    // We'll use this for filtering client-side since API doesn't currently filter by zip
    // In a real app, you'd want to refetch with the zip code parameter
  }

  // Filter centers by zip code if search is active
  const filteredCenters = searchZipCode 
    ? centers.filter(center => center.zip_code.includes(searchZipCode))
    : centers

  // Convert API data to match UI expectations
  const careCenters = filteredCenters.map(center => ({
    id: center.id,
    name: center.name,
    address: `${center.zip_code} ZIP Code Area`, // Since we don't have full address in DB
    phone: "(555) XXX-XXXX", // Placeholder since not in DB
    email: "contact@center.com", // Placeholder since not in DB
    totalCapacity: center.daily_capacity,
    currentOccupancy: Math.floor(center.daily_capacity * 0.7), // Simulated occupancy
    services: ["Childcare Services"], // Placeholder
    status: "active",
    rating: 4.5 + Math.random() * 0.5, // Simulated rating
    manager: "Center Manager", // Placeholder
    zip_code: center.zip_code,
    operating_days: center.operating_days || []
  }))

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-error-600 dark:text-error-400'
    if (percentage >= 75) return 'text-warning-600 dark:text-warning-400'
    return 'text-success-600 dark:text-success-400'
  }

  const getOccupancyBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-error-500'
    if (percentage >= 75) return 'bg-warning-500'
    return 'bg-success-500'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500'
      case 'maintenance':
        return 'bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400'
      case 'inactive':
        return 'bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400'
      default:
        return 'bg-gray-50 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400'
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-title-md font-bold text-gray-900 dark:text-white mb-2">
              Care Centers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Loading care centers...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-title-md font-bold text-gray-900 dark:text-white mb-2">
              Care Centers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Error loading care centers
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <AlertCircle className="w-12 h-12 text-error-500" />
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Failed to load care centers
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <button
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white mb-2">
            Care Centers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage care centers, monitor capacity, and view facility details
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700">
          <Plus className="w-4 h-4" />
          Add Care Center
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            All Centers
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-theme-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {careCenters.length}
            </span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Active
            <span className="ml-2 rounded-full bg-success-100 px-2 py-0.5 text-theme-xs font-medium text-success-600 dark:bg-success-500/15 dark:text-success-400">
              {careCenters.filter(c => c.status === 'active').length}
            </span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            High Capacity
            <span className="ml-2 rounded-full bg-error-100 px-2 py-0.5 text-theme-xs font-medium text-error-600 dark:bg-error-500/15 dark:text-error-400">
              {careCenters.filter(c => (c.currentOccupancy / c.totalCapacity) >= 0.9).length}
            </span>
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ZIP code..."
              value={searchZipCode}
              onChange={(e) => setSearchZipCode(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-theme-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-brand-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Care Centers Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {careCenters.map((center) => {
          const occupancyPercentage = Math.round((center.currentOccupancy / center.totalCapacity) * 100)
          
          return (
            <div key={center.id} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {center.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(center.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-theme-sm font-medium text-gray-600 dark:text-gray-400 ml-1">
                      {center.rating}
                    </span>
                  </div>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-theme-xs font-medium capitalize ${getStatusColor(center.status)}`}>
                  {center.status}
                </span>
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-theme-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{center.address}</span>
                </div>
                <div className="flex items-center gap-2 text-theme-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{center.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-theme-sm text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{center.email}</span>
                </div>
              </div>

              {/* Capacity */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                    Capacity
                  </span>
                  <span className={`text-theme-sm font-semibold ${getOccupancyColor(occupancyPercentage)}`}>
                    {center.currentOccupancy}/{center.totalCapacity} ({occupancyPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div
                    className={`h-2 rounded-full ${getOccupancyBgColor(occupancyPercentage)}`}
                    style={{ width: `${occupancyPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Services */}
              <div className="mb-4">
                <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Services
                </span>
                <div className="flex flex-wrap gap-1">
                  {center.services.slice(0, 3).map((service, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center rounded-full bg-brand-50 px-2 py-1 text-theme-xs font-medium text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
                    >
                      {service}
                    </span>
                  ))}
                  {center.services.length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-theme-xs font-medium text-gray-600 dark:bg-gray-500/15 dark:text-gray-400">
                      +{center.services.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link
                  to={`/care-centers/${center.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-theme-sm font-medium text-white hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
                <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-300">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CareCentersList 