import { Search, Bell, ChevronDown } from 'lucide-react'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const Header = ({ sidebarOpen, setSidebarOpen }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-md dark:bg-gray-900 dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-md md:px-6">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          {/* Mobile menu button */}
          <button
            className="z-99999 block rounded-sm border border-gray-300 bg-white p-1.5 shadow-sm dark:border-gray-800 dark:bg-gray-800 lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="absolute top-1/2 left-0 block h-0.5 w-full bg-gray-900 dark:bg-white transform -translate-y-1/2 transition-all duration-300"></span>
              <span className="absolute top-1/2 left-0 mt-1.5 block h-0.5 w-full bg-gray-900 dark:bg-white transition-all duration-300"></span>
              <span className="absolute top-1/2 left-0 -mt-1.5 block h-0.5 w-full bg-gray-900 dark:bg-white transition-all duration-300"></span>
            </span>
          </button>
        </div>

        <div className="hidden sm:block">
          <form>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Type to search..."
                className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-theme-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:ring-brand-400 xl:w-125"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          {/* Notifications */}
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <li className="relative">
              <button className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-gray-300 bg-gray-50 hover:text-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 z-1 h-2 w-2 rounded-full bg-error-500"></span>
              </button>
            </li>
          </ul>

          {/* User Avatar */}
          <div className="relative">
            <button className="flex items-center gap-4">
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-medium text-gray-900 dark:text-white">
                  Admin User
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">Administrator</span>
              </span>

              <span className="h-12 w-12 rounded-full">
                <div className="h-12 w-12 rounded-full bg-brand-500 flex items-center justify-center">
                  <span className="text-white font-medium">A</span>
                </div>
              </span>

              <ChevronDown className="hidden w-3 h-3 text-gray-400 sm:block" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header 