import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Landing from './components/Landing';
import About from './components/About';
import Services from './components/Services';
import Appointment from './components/Appointment';
import Confirmation from './components/Confirmation';
import Chatbot from './components/Chatbot';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { AdminProvider } from './context/AdminContext';
import { Appointment as AppointmentType } from './types/types';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<AppointmentType | null>(null);
  const [preSelectedServices, setPreSelectedServices] = useState<string[]>([]);

  const handlePageChange = (page: string, appointment?: AppointmentType, selectedServices?: string[]) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    if (appointment) {
      setCurrentAppointment(appointment);
    }
    if (selectedServices) {
      setPreSelectedServices(selectedServices);
    } else {
      setPreSelectedServices([]);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'about':
        return <About />;
      case 'services':
        return <Services onPageChange={handlePageChange} />;
      case 'appointment':
        return <Appointment onPageChange={handlePageChange} preSelectedServices={preSelectedServices} />;
      case 'confirmation':
        return <Confirmation appointment={currentAppointment} onPageChange={handlePageChange} />;
      default:
        return <Landing onPageChange={handlePageChange} />;
    }
  };

  return (
    <AdminProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          
          {/* Main Application Route */}
          <Route path="/*" element={
    <div className="min-h-screen bg-vintage-cream bg-vintage-pattern font-inter">
      <Navigation
        currentPage={currentPage}
        onPageChange={handlePageChange}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />
      
      <main>
        {renderCurrentPage()}
      </main>
      
      <Chatbot />
    </div>
          } />
        </Routes>
      </Router>
    </AdminProvider>
  );
}

export default App;