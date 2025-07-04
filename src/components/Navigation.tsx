import React from 'react';
import { Menu, X, Scissors } from 'lucide-react';

interface NavigationProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage, 
  onPageChange, 
  isMenuOpen, 
  setIsMenuOpen 
}) => {
  const navItems = [
    { name: 'Home', page: 'landing' },
    { name: 'About & Contact', page: 'about' },
    { name: 'Services', page: 'services' },
    { name: 'Book Now', page: 'appointment' }
  ];

  return (
          <nav className="bg-metallic-beige-100 shadow-vintage fixed w-full top-0 z-50 border-b-2 border-brown-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onPageChange('landing')}
          >
            <div className="relative">
              <Scissors className="h-10 w-10 text-brown-800 group-hover:text-brown-900 transition-all duration-300 group-hover:rotate-12" />
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-brown-800 group-hover:text-brown-900 transition-colors duration-300 font-serif">
                Elite Cuts
              </span>
              <div className="text-xs text-brown-600 font-medium tracking-wider">EST. 2010</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onPageChange(item.page)}
                className={`px-4 py-2 text-sm font-semibold transition-all duration-300 relative uppercase tracking-wide ${
                  currentPage === item.page
                    ? 'text-brown-900'
                    : 'text-brown-700 hover:text-brown-900'
                }`}
              >
                {item.name}
                {currentPage === item.page && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brown-800 rounded-full"></div>
                )}
                <div className="absolute inset-0 bg-brown-800 opacity-0 hover:opacity-5 rounded transition-opacity duration-300"></div>
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brown-800 hover:text-brown-900 transition-colors duration-300 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-slide-up">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-cream-100 border-t border-brown-200 rounded-b-lg">
              {navItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onPageChange(item.page);
                    setIsMenuOpen(false);
                  }}
                  className={`block px-4 py-3 text-base font-semibold w-full text-left transition-all duration-300 rounded-lg uppercase tracking-wide ${
                    currentPage === item.page
                      ? 'text-brown-900 bg-brown-100'
                      : 'text-brown-700 hover:text-brown-900 hover:bg-brown-50'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;