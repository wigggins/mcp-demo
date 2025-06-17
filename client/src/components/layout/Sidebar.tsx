import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-gray-800 text-white fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-2xl font-bold">MCP Demo</h1>
      </div>
      <nav className="mt-8">
        <ul>
          <li>
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-2 hover:bg-gray-700"
            >
              <span className="ml-2">Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/bookings"
              className="flex items-center px-4 py-2 hover:bg-gray-700"
            >
              <span className="ml-2">Bookings</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/children"
              className="flex items-center px-4 py-2 hover:bg-gray-700"
            >
              <span className="ml-2">Children</span>
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/settings"
              className="flex items-center px-4 py-2 hover:bg-gray-700"
            >
              <span className="ml-2">Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar; 