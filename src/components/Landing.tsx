import React from 'react';
import { ArrowRight, Clock, MapPin, Phone, Scissors } from 'lucide-react';

interface LandingProps {
  onPageChange: (page: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onPageChange }) => {
  return (
    <div className="min-h-screen bg-metallic-beige-100">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background image - very subtle */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('https://businessandplans.com/wp-content/uploads/2023/01/barbershop-SWOT-analysis-1080x675.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: 0.15
          }}
        ></div>
        
        {/* Animated overlay - on top */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(-45deg, rgba(212, 196, 168, 0.4), rgba(191, 177, 152, 0.3), rgba(165, 157, 144, 0.4), rgba(141, 125, 102, 0.3), rgba(122, 112, 98, 0.4), rgba(97, 85, 69, 0.3))',
            backgroundSize: '400% 400%',
            animation: 'gradientFlow 7s ease-in-out infinite'
          }}
        ></div>
        <div className="text-center text-brown-900 max-w-5xl mx-auto px-4 relative z-20">
          {/* Main Logo/Title */}
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-0.5 bg-brown-800 mr-6"></div>
              <Scissors className="h-12 w-12 text-brown-800" />
              <div className="w-20 h-0.5 bg-brown-800 ml-6"></div>
            </div>
            <h1 className="text-6xl md:text-8xl font-bold mb-4 text-brown-900 font-serif animate-slide-up">
              Elite Cuts
            </h1>
            <div className="text-sm font-semibold tracking-[0.3em] text-brown-700 mb-2 animate-slide-up" style={{animationDelay: '0.2s'}}>
              BARBER & SUPPLY
            </div>
            <div className="text-xs text-brown-600 font-medium tracking-wider animate-slide-up" style={{animationDelay: '0.3s'}}>
              EST. 2010 • NEW YORK
            </div>
          </div>

          <p className="text-xl md:text-2xl mb-6 font-medium text-brown-800 animate-slide-up" style={{animationDelay: '0.4s'}}>
            "Where Tradition Meets Excellence"
          </p>
          <p className="text-lg mb-12 max-w-3xl mx-auto text-brown-700 leading-relaxed animate-slide-up" style={{animationDelay: '0.5s'}}>
            Experience the finest in traditional barbering with modern precision. 
            Our master craftsmen deliver timeless cuts with contemporary flair.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up" style={{animationDelay: '0.6s'}}>
            <button
              onClick={() => onPageChange('appointment')}
              className="bg-brown-800 hover:bg-brown-900 text-vintage-cream px-10 py-4 text-lg font-bold rounded-none transition-all duration-300 transform hover:scale-105 hover:shadow-vintage-lg inline-flex items-center uppercase tracking-wide border-2 border-brown-800 hover:border-brown-900"
            >
              Book Appointment
              <ArrowRight className="ml-3 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => onPageChange('services')}
              className="bg-transparent hover:bg-brown-800 text-brown-800 hover:text-vintage-cream px-10 py-4 text-lg font-bold rounded-none transition-all duration-300 transform hover:scale-105 inline-flex items-center uppercase tracking-wide border-2 border-brown-800"
            >
              View Services
            </button>
          </div>
        </div>
      </section>

      {/* Quick Info Section */}
      <section className="py-20 bg-brown-800 relative">
        <div className="absolute inset-0 bg-vintage-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-vintage-cream mb-4 font-serif">Visit Our Shop</h2>
            <div className="w-24 h-0.5 bg-vintage-accent mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group animate-slide-in-left">
              <div className="bg-vintage-cream rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-vintage border-2 border-brown-700">
                <Clock className="h-10 w-10 text-brown-800" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-vintage-cream font-serif">Hours</h3>
              <div className="text-cream-200 space-y-2 font-medium">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>10:00 AM - 4:00 PM</span>
                </div>
              </div>
            </div>
            
            <div className="text-center group animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="bg-vintage-cream rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-vintage border-2 border-brown-700">
                <MapPin className="h-10 w-10 text-brown-800" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-vintage-cream font-serif">Location</h3>
              <p className="text-cream-200 font-medium leading-relaxed">
                123 Main Street<br />
                Downtown District<br />
                New York, NY 10001
              </p>
            </div>
            
            <div className="text-center group animate-slide-in-right" style={{animationDelay: '0.4s'}}>
              <div className="bg-vintage-cream rounded-full p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-vintage border-2 border-brown-700">
                <Phone className="h-10 w-10 text-brown-800" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-vintage-cream font-serif">Contact</h3>
              <p className="text-cream-200 font-medium leading-relaxed">
                (555) 123-4567<br />
                info@elitecuts.com<br />
                Walk-ins Welcome
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;