import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <Navbar />
      <main className="pt-16 pl-64 min-h-screen">
        <div className="p-6 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout; 