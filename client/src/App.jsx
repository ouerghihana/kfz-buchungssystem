import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/HomePage';
import DashboardServiceProvider from './pages/DashboardServiceProvider';
import ProfilePage from './pages/ProfilePage';
import CustomerDashboard from './pages/CustomerDashboard';
import WorkshopDetail from './pages/WorkshopDetails';
import MyBookings from './pages/MyBooking';
import WorkshopForm from './components/WorkshopForm';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import ProtectedRoute from './components/ProtectedRoutes';
import HelpCenter from './pages/HelpCenter';
import ThankYou from './pages/ThankYou';
import ThankYouBooking from './pages/ThankYouBooking';
function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/workshop/:id" element={<WorkshopDetail />} />
            <Route path="/hilfe" element={<HelpCenter />} />
            <Route path="/danke" element={<ThankYou />} />
            <Route path="/buchung-erfolgreich" element={<ThankYouBooking />} />

            <Route
              path="/meine-buchungen"
              element={
                <ProtectedRoute>
                  {user?.role === 'customer' ? <MyBookings /> : <Navigate to="/" />}
                </ProtectedRoute>
              }
            />

            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/werkstatt-hinzufuegen"
              element={
                <ProtectedRoute allowedRoles={['service_provider']}>
                  <WorkshopForm />
                </ProtectedRoute>
              }
            />

            <Route
              path="/provider/dashboard"
              element={
                <ProtectedRoute>
                  {user?.role === 'service_provider' ? (
                    <DashboardServiceProvider />
                  ) : (
                    <Navigate to="/" />
                  )}
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* ✅ Footer global */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
