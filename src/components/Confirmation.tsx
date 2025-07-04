import React from 'react';
import { CheckCircle, Calendar, Clock, User, Mail, Phone, Scissors } from 'lucide-react';
import { Appointment } from '../types/types';

interface ConfirmationProps {
  appointment: Appointment | null;
  onPageChange: (page: string) => void;
}

const Confirmation: React.FC<ConfirmationProps> = ({ appointment, onPageChange }) => {
  if (!appointment) {
    return (
              <div 
          className="pt-20 min-h-screen flex items-center justify-center"
          style={{
            background: 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776, #f2f0ec)',
            backgroundSize: '600% 600%',
            animation: 'gradientFlow 7s ease-in-out infinite'
          }}
        >
        <div className="text-center bg-vintage-cream border-4 border-brown-800 p-12 shadow-vintage-lg">
          <p className="text-brown-700 mb-6 text-xl">No appointment data found.</p>
          <button
            onClick={() => onPageChange('appointment')}
            className="bg-brown-800 hover:bg-brown-900 text-vintage-cream px-8 py-3 font-bold uppercase tracking-wide border-2 border-brown-800"
          >
            Book New Appointment
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="pt-20 min-h-screen"
      style={{
        background: 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776, #f2f0ec)',
        backgroundSize: '600% 600%',
        animation: 'gradientFlow 7s ease-in-out infinite'
      }}
    >
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Message */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="mx-auto w-16 h-16 bg-brown-800 border-4 border-brown-700 flex items-center justify-center mb-4 shadow-vintage">
              <CheckCircle className="h-8 w-8 text-vintage-cream" />
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-0.5 bg-brown-800 mr-4"></div>
              <Scissors className="h-6 w-6 text-brown-800" />
              <div className="w-16 h-0.5 bg-brown-800 ml-4"></div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-brown-900 mb-4 font-serif">
              Appointment Confirmed!
            </h1>
            <div className="w-24 h-0.5 bg-brown-800 mx-auto mb-4"></div>
            <p className="text-lg text-brown-700">
              Thank you for choosing Elite Cuts. We look forward to serving you!
            </p>
          </div>

          {/* Appointment Details */}
          <div className="bg-vintage-cream border-4 border-brown-800 shadow-vintage-lg p-6 mb-6 animate-slide-up">
            <h2 className="text-2xl font-bold text-brown-900 mb-6 text-center font-serif">
              Appointment Details
            </h2>
            
            <div className="space-y-6">
              {/* Service */}
              <div className="flex items-start border-l-4 border-brown-800 pl-4">
                <div className="bg-brown-800 border-2 border-brown-700 p-2 mr-4 shadow-vintage">
                  <User className="h-5 w-5 text-vintage-cream" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brown-700 mb-1 uppercase tracking-wide">Service</h3>
                  <p className="text-xl font-bold text-brown-900 font-serif">{appointment.service}</p>
                </div>
              </div>

              {/* Date */}
              <div className="flex items-start border-l-4 border-brown-800 pl-4">
                <div className="bg-brown-800 border-2 border-brown-700 p-2 mr-4 shadow-vintage">
                  <Calendar className="h-5 w-5 text-vintage-cream" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brown-700 mb-1 uppercase tracking-wide">Date</h3>
                  <p className="text-xl font-bold text-brown-900 font-serif">{formatDate(appointment.date)}</p>
                </div>
              </div>

              {/* Time */}
              <div className="flex items-start border-l-4 border-brown-800 pl-4">
                <div className="bg-brown-800 border-2 border-brown-700 p-2 mr-4 shadow-vintage">
                  <Clock className="h-5 w-5 text-vintage-cream" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-brown-700 mb-1 uppercase tracking-wide">Time</h3>
                  <p className="text-xl font-bold text-brown-900 font-serif">{appointment.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-vintage-cream border-4 border-brown-800 shadow-vintage-lg p-6 mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <h2 className="text-2xl font-bold text-brown-900 mb-6 text-center font-serif">
              Your Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center border-l-4 border-brown-800 pl-4">
                <User className="h-5 w-5 text-brown-700 mr-3" />
                <span className="text-lg font-bold text-brown-900 font-serif">{appointment.name}</span>
              </div>
              
              <div className="flex items-center border-l-4 border-brown-800 pl-4">
                <Mail className="h-5 w-5 text-brown-700 mr-3" />
                <span className="text-lg font-bold text-brown-900 font-serif">{appointment.email}</span>
              </div>
              
              <div className="flex items-center border-l-4 border-brown-800 pl-4">
                <Phone className="h-5 w-5 text-brown-700 mr-3" />
                <span className="text-lg font-bold text-brown-900 font-serif">{appointment.phone}</span>
              </div>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-brown-800 border-4 border-brown-700 p-5 mb-6 shadow-vintage-lg animate-slide-up" style={{animationDelay: '0.2s'}}>
            <h3 className="text-xl font-bold text-vintage-cream mb-4 font-serif text-center">
              Important Reminders
            </h3>
            <ul className="text-vintage-cream space-y-2 text-base">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-vintage-accent rounded-full mr-3 mt-2"></span>
                Please arrive 10 minutes before your scheduled appointment
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-vintage-accent rounded-full mr-3 mt-2"></span>
                Bring a valid ID for verification
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-vintage-accent rounded-full mr-3 mt-2"></span>
                For rescheduling, please call us at least 24 hours in advance
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-vintage-accent rounded-full mr-3 mt-2"></span>
                Late arrivals may result in shortened service time
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => onPageChange('appointment')}
                className="bg-vintage-cream hover:bg-cream-100 text-brown-900 py-3 px-6 font-bold transition-all duration-300 border-2 border-brown-800 hover:shadow-vintage uppercase tracking-wide font-serif"
              >
                Book Another
              </button>
              
              <button
                onClick={() => onPageChange('landing')}
                className="bg-brown-800 hover:bg-brown-900 text-vintage-cream py-3 px-6 font-bold transition-all duration-300 border-2 border-brown-800 hover:shadow-vintage-lg uppercase tracking-wide font-serif"
              >
                Return Home
              </button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="text-center pt-8 border-t-2 border-brown-800 mt-8 animate-fade-in" style={{animationDelay: '0.4s'}}>
            <p className="text-brown-700 mb-2 text-base">
              Questions about your appointment?
            </p>
            <p className="text-brown-900 font-bold text-lg font-serif">
              Call us at (555) 123-4567
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Confirmation;