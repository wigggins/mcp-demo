const Navbar = () => {
  return (
    <div className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <span className="sr-only">Notifications</span>
            {/* Add notification icon here */}
          </button>
          <div className="relative">
            <button className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gray-300"></div>
              <span className="text-sm font-medium text-gray-700">User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar; 