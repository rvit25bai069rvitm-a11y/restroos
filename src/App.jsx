import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RestOSProvider } from './context/RestOSContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';

// Pages
import LandingPage from './pages/LandingPage';
import GuestOrdering from './pages/GuestOrdering';
import KitchenDisplay from './pages/KitchenDisplay';
import OwnerDashboard from './pages/OwnerDashboard';
import Billing from './pages/Billing';

function App() {
  return (
    <RestOSProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-off-white">
          {/* Global Toast Alerts */}
          <ToastContainer />
          
          {/* Shared Navigation Bar */}
          <Navbar />
          
          {/* Main Workspace Router Content */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/guest-ordering" element={<GuestOrdering />} />
              <Route path="/kitchen-display" element={<KitchenDisplay />} />
              <Route path="/owner-dashboard" element={<OwnerDashboard />} />
              <Route path="/billing" element={<Billing />} />
            </Routes>
          </main>
          
          {/* Shared Footer */}
          <Footer />
        </div>
      </Router>
    </RestOSProvider>
  );
}

export default App;
