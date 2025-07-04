import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { Scissors, ArrowRight } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        login(data.access_token);
        navigate('/admin/dashboard');
      } else {
        setError('Invalid username or password');
      }
    } catch (error) {
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen font-inter"
      style={{
        background: 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776, #f2f0ec)',
        backgroundSize: '600% 600%',
        animation: 'gradientFlow 7s ease-in-out infinite'
      }}
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          {/* Logo - Ana site ile aynı tasarım */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-0.5 bg-brown-800 mr-6"></div>
              <Scissors className="h-12 w-12 text-brown-800" />
              <div className="w-20 h-0.5 bg-brown-800 ml-6"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 text-brown-900 font-serif">
              Elite Cuts
            </h1>
            <div className="text-sm font-semibold tracking-[0.3em] text-brown-700 mb-2">
              BARBER & SUPPLY
            </div>
            <div className="text-xs text-brown-600 font-medium tracking-wider">
              EST. 2010 • NEW YORK
            </div>
            <div className="w-24 h-0.5 bg-vintage-accent mx-auto mt-6"></div>
          </div>

          {/* Admin Panel Title */}
          <div className="text-center mb-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h2 className="text-3xl font-bold text-brown-900 mb-4 font-serif">
              Admin Panel
            </h2>
            <p className="text-brown-700 text-lg font-medium">
              Login to manage reservations
            </p>
          </div>

          {/* Login Form - Ana site kartlarıyla aynı stil */}
          <div className="bg-vintage-cream shadow-vintage-lg rounded-none p-8 border-2 border-brown-800 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-bold text-brown-800 mb-3 uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                  placeholder="admin"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-bold text-brown-800 mb-3 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 border-2 border-brown-800 rounded-none focus:outline-none focus:ring-0 focus:border-brown-900 bg-cream-50 text-brown-900 font-medium transition-all duration-300"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded-none font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brown-800 hover:bg-brown-900 text-vintage-cream px-8 py-4 text-lg font-bold rounded-none transition-all duration-300 transform hover:scale-105 hover:shadow-vintage-lg inline-flex items-center justify-center uppercase tracking-wide border-2 border-brown-800 hover:border-brown-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Logging in...' : (
                  <>
                    Login
                    <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Info - Ana site info kutularıyla aynı stil */}
            <div className="mt-8 p-6 bg-brown-100 border-l-4 border-brown-800 rounded-none">
              <p className="text-sm text-brown-800 font-medium leading-relaxed">
                <span className="font-bold uppercase tracking-wide">Default Login:</span><br />
                <span className="block mt-2">Username: <strong>admin</strong></span>
                <span className="block">Password: <strong>admin</strong></span>
              </p>
            </div>
          </div>

          {/* Back to Website - Ana site butonlarıyla aynı stil */}
          <div className="text-center mt-8 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <button
              onClick={() => navigate('/')}
              className="bg-transparent hover:bg-brown-800 text-brown-800 hover:text-vintage-cream px-8 py-3 text-base font-bold rounded-none transition-all duration-300 transform hover:scale-105 inline-flex items-center uppercase tracking-wide border-2 border-brown-800"
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin; 