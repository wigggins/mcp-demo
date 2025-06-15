import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { X, LayoutDashboard, Calendar, Building2 } from 'lucide-react'

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const location = useLocation()
  const [selectedMenu, setSelectedMenu] = useState('')

  const isActive = (path: string) => location.pathname === path

  return (
    <aside
      className={` sidebar ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between gap-2 pt-8 pb-7">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
            <span className="text-lg font-bold text-white">B</span>
          </div>
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            BookingAdmin
          </span>
        </Link>
        
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav>
          <div>
            <h3 className="mb-4 text-xs uppercase leading-5 text-gray-400">
              MENU
            </h3>

            <ul className="flex flex-col gap-4 mb-6">
              {/* Dashboard */}
              <li>
                <Link
                  to="/"
                  className={`menu-item group ${
                    isActive('/') ? 'menu-item-active' : 'menu-item-inactive'
                  }`}
                >
                  <LayoutDashboard
                    className={`w-6 h-6 ${
                      isActive('/') ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                    }`}
                  />
                  <span className="menu-item-text">
                    Dashboard
                  </span>
                </Link>
              </li>

              {/* Bookings */}
              <li>
                <Link
                  to="/bookings"
                  className={`menu-item group ${
                    isActive('/bookings') ? 'menu-item-active' : 'menu-item-inactive'
                  }`}
                >
                  <Calendar
                    className={`w-6 h-6 ${
                      isActive('/bookings') ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                    }`}
                  />
                  <span className="menu-item-text">
                    Bookings
                  </span>
                </Link>
              </li>

              {/* Care Centers */}
              <li>
                <Link
                  to="/care-centers"
                  className={`menu-item group ${
                    isActive('/care-centers') ? 'menu-item-active' : 'menu-item-inactive'
                  }`}
                >
                  <Building2
                    className={`w-6 h-6 ${
                      isActive('/care-centers') ? 'menu-item-icon-active' : 'menu-item-icon-inactive'
                    }`}
                  />
                  <span className="menu-item-text">
                    Care Centers
                  </span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </aside>
  )
}

export default Sidebar 