import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import BookingsList from './pages/BookingsList'
import CareCentersList from './pages/CareCentersList'
import CareCenterDetail from './pages/CareCenterDetail'

function App() {
  return (
    <div className="dark bg-gray-900">
      <Router>
        <DashboardLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bookings" element={<BookingsList />} />
            <Route path="/care-centers" element={<CareCentersList />} />
            <Route path="/care-centers/:id" element={<CareCenterDetail />} />
          </Routes>
        </DashboardLayout>
      </Router>
    </div>
  )
}

export default App
