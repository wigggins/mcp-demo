import { useParams, Link } from 'react-router-dom'
import { 
  ChevronRight, 
  Edit, 
  Plus, 
  Building2, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock,
  Users,
  Calendar,
  Activity
} from 'lucide-react'

const CareCenterDetail = () => {
  const { id } = useParams()

  // Sample care center data (in real app, this would be fetched based on id)
  const careCenter = {
    id: 1,
    name: "Sunshine Care Center",
    address: "123 Main St, Springfield, IL 62701",
    phone: "(555) 123-4567",
    email: "info@sunshinecare.com",
    website: "www.sunshinecare.com",
    totalCapacity: 50,
    currentOccupancy: 42,
    availableRooms: 8,
    services: [
      "Physical Therapy",
      "Occupational Therapy", 
      "Speech Therapy",
      "Rehabilitation Services",
      "Long-term Care",
      "Memory Care"
    ],
    status: "active",
    rating: 4.8,
    manager: "Dr. Sarah Johnson",
    establishedYear: 2015,
    certifications: ["Joint Commission", "CMS Certified", "State Licensed"],
    description: "Sunshine Care Center is a premier healthcare facility dedicated to providing exceptional care and rehabilitation services. Our state-of-the-art facility features modern equipment and a highly trained staff committed to patient wellness and recovery.",
    staff: [
      { name: "Dr. Sarah Johnson", role: "Center Manager", department: "Administration" },
      { name: "Nurse Emily Parker", role: "Head Nurse", department: "Nursing" },
      { name: "Dr. Michael Chen", role: "Physical Therapist", department: "Therapy" },
      { name: "Lisa Rodriguez", role: "Occupational Therapist", department: "Therapy" }
    ],
    recentActivity: [
      { action: "New admission", details: "Patient John Doe admitted for rehabilitation", time: "2 hours ago" },
      { action: "Capacity update", details: "Available rooms updated to 8", time: "4 hours ago" },
      { action: "Staff schedule", details: "New shift schedule published", time: "1 day ago" }
    ],
    operatingHours: {
      weekdays: "7:00 AM - 9:00 PM",
      weekends: "8:00 AM - 6:00 PM",
      emergency: "24/7 Emergency Services"
    }
  }

  const occupancyPercentage = Math.round((careCenter.currentOccupancy / careCenter.totalCapacity) * 100)

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/care-centers"
              className="inline-flex items-center text-theme-sm font-medium text-gray-700 hover:text-brand-600 dark:text-gray-400 dark:hover:text-white"
            >
              Care Centers
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />
              <span className="ml-1 text-theme-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                {careCenter.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-title-md font-bold text-gray-900 dark:text-white mb-2">
            Care Center Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Detailed information about {careCenter.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-theme-sm font-medium text-white shadow-theme-xs hover:bg-brand-600 dark:bg-brand-600 dark:hover:bg-brand-700">
            <Plus className="w-4 h-4" />
            New Booking
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Care Center Information
        </h3>

        {/* Header Section */}
        <div className="p-5 mb-6 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/12 border border-gray-200 dark:border-gray-800">
                <Building2 className="w-10 h-10 text-brand-500 dark:text-brand-400" />
              </div>
              <div className="order-3 xl:order-2">
                <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                  {careCenter.name}
                </h4>
                <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {careCenter.manager}
                  </p>
                  <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Est. {careCenter.establishedYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
                <span className="rounded-full bg-success-50 px-3 py-1 text-theme-sm font-medium text-success-600 dark:bg-success-500/15 dark:text-success-500">
                  Active
                </span>
                
                <div className="flex items-center gap-1 ml-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.floor(careCenter.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                    {careCenter.rating}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Capacity Overview */}
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Capacity Overview
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {careCenter.totalCapacity}
                  </div>
                  <div className="text-theme-sm text-gray-600 dark:text-gray-400">
                    Total Capacity
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {careCenter.currentOccupancy}
                  </div>
                  <div className="text-theme-sm text-gray-600 dark:text-gray-400">
                    Current Occupancy
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {careCenter.availableRooms}
                  </div>
                  <div className="text-theme-sm text-gray-600 dark:text-gray-400">
                    Available Rooms
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                    Occupancy Rate
                  </span>
                  <span className={`text-theme-sm font-semibold ${getOccupancyColor(occupancyPercentage)}`}>
                    {occupancyPercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getOccupancyBgColor(occupancyPercentage)}`}
                    style={{ width: `${occupancyPercentage}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                {careCenter.description}
              </p>
            </div>

            {/* Services */}
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Services Offered
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {careCenter.services.map((service, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="h-2 w-2 rounded-full bg-brand-500"></div>
                    <span className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Staff Directory */}
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Staff Directory
              </h4>
              <div className="space-y-3">
                {careCenter.staff.map((member, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-theme-sm">
                        {member.name}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-theme-xs">
                        {member.role} • {member.department}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Contact Information
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </p>
                    <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                      {careCenter.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone
                    </p>
                    <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                      {careCenter.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                      Email
                    </p>
                    <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                      {careCenter.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                      Website
                    </p>
                    <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                      {careCenter.website}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Operating Hours
              </h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                      Weekdays
                    </p>
                    <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                      {careCenter.operatingHours.weekdays}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                      Weekends
                    </p>
                    <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                      {careCenter.operatingHours.weekends}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-theme-sm font-medium text-gray-700 dark:text-gray-300">
                      Emergency
                    </p>
                    <p className="text-theme-sm text-gray-600 dark:text-gray-400">
                      {careCenter.operatingHours.emergency}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
              <h4 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Recent Activity
              </h4>
              <div className="space-y-4">
                {careCenter.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-500/12 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-theme-sm font-medium text-gray-900 dark:text-white">
                        {activity.action}
                      </p>
                      <p className="text-theme-xs text-gray-500 dark:text-gray-400">
                        {activity.details}
                      </p>
                      <p className="text-theme-xs text-gray-400 dark:text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CareCenterDetail 