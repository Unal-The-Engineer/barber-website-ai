import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Scissors, Calendar, Clock, Users, Search, Filter, X, Trash2, History, CalendarDays, Database } from 'lucide-react';

interface Reservation {
  id: number;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

interface WorkingHours {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const AdminDashboard: React.FC = () => {
  const [activeReservations, setActiveReservations] = useState<Reservation[]>([]);
  const [pastReservations, setPastReservations] = useState<Reservation[]>([]);
  const [cancelledReservations, setCancelledReservations] = useState<Reservation[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active-reservations' | 'past-reservations' | 'cancelled-reservations' | 'working-hours'>('active-reservations');
  const [showConfirmDelete, setShowConfirmDelete] = useState<number | null>(null);

  const [newWorkingHour, setNewWorkingHour] = useState({
    date: '',
    start_time: '09:00',
    end_time: '18:30',
    is_available: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated, token, logout } = useAdmin();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
      return;
    }
    fetchData();
    
    // Force English locale for the entire page
    document.documentElement.setAttribute('lang', 'en-US');
    document.body.setAttribute('lang', 'en-US');
    
    // Override browser's date formatting
    const originalDateTimeFormat = Intl.DateTimeFormat;
    (window as any).Intl.DateTimeFormat = function(locale?: string | string[], options?: any) {
      return new originalDateTimeFormat('en-US', options);
    };
    
    // Force English locale for date inputs
    const forceEnglishDateInputs = () => {
      const dateInputs = document.querySelectorAll('input[type="date"]');
      dateInputs.forEach((input) => {
        input.setAttribute('lang', 'en-US');
        input.setAttribute('data-locale', 'en-US');
        // Try to force the format
        (input as HTMLInputElement).style.fontFamily = 'Inter, -apple-system, BlinkMacSystemFont, sans-serif';
      });
    };
    
    // Apply immediately and on DOM changes
    forceEnglishDateInputs();
    
    // Create observer to watch for new date inputs
    const observer = new MutationObserver(() => {
      forceEnglishDateInputs();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      observer.disconnect();
      // Reset on cleanup
      document.documentElement.removeAttribute('lang');
      document.body.removeAttribute('lang');
    };
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    try {
      const [activeRes, pastRes, cancelledRes, workingHoursRes] = await Promise.all([
        fetch('http://localhost:8000/admin/reservations/active', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/admin/reservations/past', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/admin/reservations/cancelled', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/admin/working-hours', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveReservations(activeData);
      }

      if (pastRes.ok) {
        const pastData = await pastRes.json();
        setPastReservations(pastData);
      }

      if (cancelledRes.ok) {
        const cancelledData = await cancelledRes.json();
        setCancelledReservations(cancelledData);
      }

      if (workingHoursRes.ok) {
        const workingHoursData = await workingHoursRes.json();
        setWorkingHours(workingHoursData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelReservation = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:8000/admin/reservations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        // Find the cancelled reservation
        const cancelledReservation = activeReservations.find(r => r.id === id);
        
        // Remove from active reservations
        setActiveReservations(activeReservations.filter(r => r.id !== id));
        
        // Add to cancelled reservations if found
        if (cancelledReservation) {
          setCancelledReservations(prev => [{
            ...cancelledReservation,
            status: 'cancelled'
          }, ...prev]);
        }
        
        setShowConfirmDelete(null);
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Reservation could not be cancelled');
      }
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      alert('Connection error');
    }
  };



  const addWorkingHours = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/admin/working-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newWorkingHour)
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message); // Show success message with cancellation info if any
        fetchData(); // Refresh data to update all tabs
        setNewWorkingHour({
          date: '',
          start_time: '09:00',
          end_time: '18:30',
          is_available: false
        });
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Failed to add working hours');
      }
    } catch (error) {
      console.error('Error adding working hours:', error);
      alert('Connection error');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredReservations = (reservations: Reservation[]) => {
    return reservations.filter(reservation => {
      const matchesSearch = reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           reservation.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = !filterDate || reservation.date.startsWith(filterDate);
      return matchesSearch && matchesDate;
    });
  };

  // Auto cleanup info component
  const AutoCleanupInfo = () => (
    <div className="bg-vintage-cream shadow-vintage-lg rounded-none p-4 border-2 border-brown-800 mb-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Database className="h-5 w-5 text-brown-800" />
        </div>
        <div className="ml-3">
          <div className="text-xs font-bold text-brown-800 mb-1 uppercase tracking-wide">Auto Cleanup System</div>
          <p className="text-sm text-brown-700 font-medium">
            Reservation data is automatically deleted 2 weeks after the appointment date to maintain database efficiency.
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776, #f2f0ec)',
          backgroundSize: '600% 600%',
          animation: 'gradientFlow 7s ease-in-out infinite'
        }}
      >
        <div className="text-brown-800 text-lg font-serif">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen font-inter text-sm"
      style={{
        background: 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776, #f2f0ec)',
        backgroundSize: '600% 600%',
        animation: 'gradientFlow 7s ease-in-out infinite'
      }}
    >
      {/* Header - Kompakt */}
              <nav className="bg-metallic-beige-100 shadow-vintage fixed w-full top-0 z-50 border-b-2 border-brown-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Küçültülmüş */}
            <div className="flex items-center space-x-2 cursor-pointer group">
              <div className="relative">
                <Scissors className="h-7 w-7 text-brown-800 group-hover:text-brown-900 transition-all duration-300 group-hover:rotate-12" />
              </div>
              <div className="text-center">
                <span className="text-lg font-bold text-brown-800 group-hover:text-brown-900 transition-colors duration-300 font-serif">
                  Elite Cuts
                </span>
                <div className="text-xs text-brown-600 font-medium tracking-wider">EST. 2010</div>
              </div>
              <div className="text-brown-700 text-sm font-medium ml-3">| Admin Panel</div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="bg-transparent hover:bg-brown-800 text-brown-800 hover:text-vintage-cream px-3 py-2 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide border-2 border-brown-800"
              >
                Main Site
              </button>
              <button
                onClick={logout}
                className="bg-brown-800 hover:bg-brown-900 text-vintage-cream px-3 py-2 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide border-2 border-brown-800 hover:border-brown-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Page Title - Kompakt */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold mb-2 text-brown-900 font-serif">
              Admin Dashboard
            </h1>
            <div className="w-16 h-0.5 bg-vintage-accent mx-auto"></div>
          </div>

          {/* Tabs - Kompakt */}
          <div className="flex justify-center mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex flex-wrap space-x-1 bg-brown-100 p-1 rounded-none border-2 border-brown-800">
              <button
                onClick={() => setActiveTab('active-reservations')}
                className={`px-4 py-2 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide ${
                  activeTab === 'active-reservations'
                    ? 'bg-brown-800 text-vintage-cream border-2 border-brown-800'
                    : 'text-brown-800 hover:bg-brown-200 border-2 border-transparent'
                }`}
              >
                <CalendarDays className="inline-block h-4 w-4 mr-1" />
                Active ({activeReservations.length})
              </button>
              <button
                onClick={() => setActiveTab('past-reservations')}
                className={`px-4 py-2 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide ${
                  activeTab === 'past-reservations'
                    ? 'bg-brown-800 text-vintage-cream border-2 border-brown-800'
                    : 'text-brown-800 hover:bg-brown-200 border-2 border-transparent'
                }`}
              >
                <History className="inline-block h-4 w-4 mr-1" />
                Past ({pastReservations.length})
              </button>
              <button
                onClick={() => setActiveTab('cancelled-reservations')}
                className={`px-4 py-2 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide ${
                  activeTab === 'cancelled-reservations'
                    ? 'bg-brown-800 text-vintage-cream border-2 border-brown-800'
                    : 'text-brown-800 hover:bg-brown-200 border-2 border-transparent'
                }`}
              >
                <X className="inline-block h-4 w-4 mr-1" />
                Cancelled ({cancelledReservations.length})
              </button>
              <button
                onClick={() => setActiveTab('working-hours')}
                className={`px-4 py-2 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide ${
                  activeTab === 'working-hours'
                    ? 'bg-brown-800 text-vintage-cream border-2 border-brown-800'
                    : 'text-brown-800 hover:bg-brown-200 border-2 border-transparent'
                }`}
              >
                <Clock className="inline-block h-4 w-4 mr-1" />
                Working Hours
              </button>
            </div>
          </div>

          {/* Active Reservations Tab */}
          {activeTab === 'active-reservations' && (
            <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
              {/* Auto Cleanup Info */}
              <AutoCleanupInfo />
              
              {/* Filters - Compact */}
              <div className="bg-vintage-cream shadow-vintage-lg rounded-none p-4 border-2 border-brown-800">
                <h3 className="text-lg font-bold text-brown-900 mb-4 font-serif">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      <Search className="inline-block h-3 w-3 mr-1" />
                      Search by Name or Email
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      placeholder="Customer name or email..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      <Filter className="inline-block h-3 w-3 mr-1" />
                      Filter by Date
                    </label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      lang="en-US"
                    />
                  </div>
                </div>
              </div>

              {/* Active Reservations List - Compact */}
              <div className="bg-vintage-cream shadow-vintage-lg rounded-none border-2 border-brown-800 overflow-hidden">
                <div className="p-4 border-b-2 border-brown-800 bg-brown-100">
                  <h2 className="text-lg font-bold text-brown-900 font-serif">
                    Active Reservations (Today and Future)
                  </h2>
                </div>
                
                {getFilteredReservations(activeReservations).length === 0 ? (
                  <div className="p-8 text-center text-brown-700 font-medium">
                    {searchTerm || filterDate ? 'No reservations found matching the filters.' : 'No active reservations found yet.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm">
                      <thead className="bg-brown-200 border-b-2 border-brown-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Customer</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[160px]">Email</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Phone</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[100px]">Service</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Date</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[70px]">Time</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[80px]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-brown-200">
                        {getFilteredReservations(activeReservations).map((reservation) => (
                          <tr key={reservation.id} className="hover:bg-brown-50 transition-colors duration-300">
                            <td className="px-3 py-3 text-brown-900 font-bold break-words text-sm">
                              {reservation.name}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium break-words text-xs">
                              {reservation.email}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {reservation.phone}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {reservation.service}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {formatDate(reservation.date)}
                            </td>
                            <td className="px-3 py-3 text-brown-900 font-bold text-sm">
                              {reservation.time}
                            </td>
                            <td className="px-3 py-3">
                              <button
                                onClick={() => setShowConfirmDelete(reservation.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide border-2 border-red-600 hover:border-red-700"
                              >
                                <Trash2 className="inline-block h-3 w-3 mr-1" />
                                Cancel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Past Reservations Tab */}
          {activeTab === 'past-reservations' && (
            <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
              {/* Auto Cleanup Info */}
              <AutoCleanupInfo />
              
              {/* Filters - Compact */}
              <div className="bg-vintage-cream shadow-vintage-lg rounded-none p-4 border-2 border-brown-800">
                <h3 className="text-lg font-bold text-brown-900 mb-4 font-serif">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      <Search className="inline-block h-3 w-3 mr-1" />
                      Search by Name or Email
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      placeholder="Customer name or email..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      <Filter className="inline-block h-3 w-3 mr-1" />
                      Filter by Date
                    </label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      lang="en-US"
                    />
                  </div>
                </div>
              </div>

              {/* Past Reservations List - Compact */}
              <div className="bg-vintage-cream shadow-vintage-lg rounded-none border-2 border-brown-800 overflow-hidden">
                <div className="p-4 border-b-2 border-brown-800 bg-brown-100">
                  <h2 className="text-lg font-bold text-brown-900 font-serif">
                    Past Reservations
                  </h2>
                </div>
                
                {getFilteredReservations(pastReservations).length === 0 ? (
                  <div className="p-8 text-center text-brown-700 font-medium">
                    {searchTerm || filterDate ? 'No reservations found matching the filters.' : 'No past reservations found yet.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                                              <thead className="bg-brown-200 border-b-2 border-brown-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Customer</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[160px]">Email</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Phone</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[100px]">Service</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Date</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[70px]">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-brown-200">
                        {getFilteredReservations(pastReservations).map((reservation) => (
                          <tr key={reservation.id} className="hover:bg-brown-50 transition-colors duration-300">
                            <td className="px-3 py-3 text-brown-900 font-bold break-words text-sm">
                              {reservation.name}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium break-words text-xs">
                              {reservation.email}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {reservation.phone}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {reservation.service}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {formatDate(reservation.date)}
                            </td>
                            <td className="px-3 py-3 text-brown-900 font-bold text-sm">
                              {reservation.time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancelled Reservations Tab */}
          {activeTab === 'cancelled-reservations' && (
            <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
              {/* Auto Cleanup Info */}
              <AutoCleanupInfo />
              
              {/* Filters - Compact */}
              <div className="bg-vintage-cream shadow-vintage-lg rounded-none p-4 border-2 border-brown-800">
                <h3 className="text-lg font-bold text-brown-900 mb-4 font-serif">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      <Search className="inline-block h-3 w-3 mr-1" />
                      Search by Name or Email
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      placeholder="Customer name or email..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      <Filter className="inline-block h-3 w-3 mr-1" />
                      Filter by Date
                    </label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      lang="en-US"
                    />
                  </div>
                </div>
              </div>

              {/* Cancelled Reservations List - Compact */}
              <div className="bg-vintage-cream shadow-vintage-lg rounded-none border-2 border-brown-800 overflow-hidden">
                <div className="p-4 border-b-2 border-brown-800 bg-brown-100">
                  <h2 className="text-lg font-bold text-brown-900 font-serif">
                    Cancelled Reservations
                  </h2>
                </div>
                
                {getFilteredReservations(cancelledReservations).length === 0 ? (
                  <div className="p-8 text-center text-brown-700 font-medium">
                    {searchTerm || filterDate ? 'No reservations found matching the filters.' : 'No cancelled reservations found yet.'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-sm">
                      <thead className="bg-brown-200 border-b-2 border-brown-800">
                        <tr>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Customer</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[160px]">Email</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Phone</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[100px]">Service</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[120px]">Date</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[70px]">Time</th>
                          <th className="px-3 py-2 text-left text-brown-900 font-bold uppercase tracking-wide min-w-[80px]">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-brown-200">
                        {getFilteredReservations(cancelledReservations).map((reservation) => (
                          <tr key={reservation.id} className="hover:bg-brown-50 transition-colors duration-300">
                            <td className="px-3 py-3 text-brown-900 font-bold break-words text-sm">
                              {reservation.name}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium break-words text-xs">
                              {reservation.email}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {reservation.phone}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {reservation.service}
                            </td>
                            <td className="px-3 py-3 text-brown-700 font-medium text-sm">
                              {formatDate(reservation.date)}
                            </td>
                            <td className="px-3 py-3 text-brown-900 font-bold text-sm">
                              {reservation.time}
                            </td>
                            <td className="px-3 py-3">
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-none font-bold text-xs border-2 border-red-300 uppercase tracking-wide">
                                Cancelled
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Working Hours Tab */}
          {activeTab === 'working-hours' && (
            <div className="space-y-6 animate-slide-up" style={{animationDelay: '0.4s'}}>
              {/* Auto Cleanup Info */}
              <AutoCleanupInfo />
              
              {/* Add Working Hours Form - Compact */}
              <div className="bg-vintage-cream shadow-vintage-lg rounded-none p-4 border-2 border-brown-800">
                <h2 className="text-lg font-bold text-brown-900 mb-4 font-serif">
                  <Calendar className="inline-block h-5 w-5 mr-2" />
                  Add Unavailable Hours
                </h2>
                <form onSubmit={addWorkingHours} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newWorkingHour.date}
                      onChange={(e) => setNewWorkingHour({...newWorkingHour, date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      lang="en-US"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={newWorkingHour.start_time}
                      onChange={(e) => setNewWorkingHour({...newWorkingHour, start_time: e.target.value})}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brown-800 mb-2 uppercase tracking-wide">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={newWorkingHour.end_time}
                      onChange={(e) => setNewWorkingHour({...newWorkingHour, end_time: e.target.value})}
                      className="w-full px-3 py-2 text-sm border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                      required
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-brown-800 hover:bg-brown-900 text-vintage-cream py-2 px-4 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide border-2 border-brown-800 hover:border-brown-900"
                    >
                      Add
                    </button>
                  </div>
                </form>
              </div>

              {/* Working Hours List - Compact */}
              <div className="bg-vintage-cream shadow-vintage-lg rounded-none border-2 border-brown-800 overflow-hidden">
                <div className="p-4 border-b-2 border-brown-800 bg-brown-100">
                  <h2 className="text-lg font-bold text-brown-900 font-serif">
                    Unavailable Hours
                  </h2>
                </div>
                
                {workingHours.filter(wh => !wh.is_available).length === 0 ? (
                  <div className="p-8 text-center text-brown-700 font-medium">
                    No unavailable hours defined yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-brown-200 border-b-2 border-brown-800">
                        <tr>
                          <th className="px-4 py-2 text-left text-brown-900 font-bold uppercase tracking-wide">Date</th>
                          <th className="px-4 py-2 text-left text-brown-900 font-bold uppercase tracking-wide">Start</th>
                          <th className="px-4 py-2 text-left text-brown-900 font-bold uppercase tracking-wide">End</th>
                          <th className="px-4 py-2 text-left text-brown-900 font-bold uppercase tracking-wide">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-brown-200">
                        {workingHours
                          .filter(wh => !wh.is_available)
                          .map((wh) => (
                          <tr key={wh.id} className="hover:bg-brown-50 transition-colors duration-300">
                            <td className="px-4 py-3 text-brown-900 font-bold text-sm">
                              {formatDate(wh.date)}
                            </td>
                            <td className="px-4 py-3 text-brown-700 font-medium text-sm">
                              {wh.start_time}
                            </td>
                            <td className="px-4 py-3 text-brown-700 font-medium text-sm">
                              {wh.end_time}
                            </td>
                            <td className="px-4 py-3">
                              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-none font-bold text-xs border-2 border-red-300 uppercase tracking-wide">
                                Unavailable
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal - Compact */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-vintage-cream rounded-none p-6 max-w-md w-full mx-4 border-2 border-brown-800 shadow-vintage-lg">
            <h3 className="text-lg font-bold text-brown-900 mb-4 font-serif">
              Cancel Reservation
            </h3>
            <p className="text-brown-700 mb-6 font-medium text-sm leading-relaxed">
              Are you sure you want to cancel this reservation? A cancellation email will be automatically sent to the customer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="flex-1 bg-transparent hover:bg-brown-800 text-brown-800 hover:text-vintage-cream py-2 px-4 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide border-2 border-brown-800"
              >
                <X className="inline-block h-3 w-3 mr-1" />
                Cancel
              </button>
              <button
                onClick={() => cancelReservation(showConfirmDelete)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 text-xs font-bold rounded-none transition-all duration-300 transform hover:scale-105 uppercase tracking-wide border-2 border-red-600 hover:border-red-700"
              >
                <Trash2 className="inline-block h-3 w-3 mr-1" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminDashboard; 