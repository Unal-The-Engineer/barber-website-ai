import React from 'react';
import { SERVICES, SERVICE_PACKAGES } from '../utils/constants';
import { Scissors, User, Star, Flame, Droplets, Smile, Clock } from 'lucide-react';

interface ServicesProps {
  onPageChange: (page: string, appointment?: any, selectedServices?: string[]) => void;
}

const Services: React.FC<ServicesProps> = ({ onPageChange }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'scissors': return <Scissors className="h-10 w-10" />;
      case 'user': return <User className="h-10 w-10" />;
      case 'star': return <Star className="h-10 w-10" />;
      case 'flame': return <Flame className="h-10 w-10" />;
      case 'droplets': return <Droplets className="h-10 w-10" />;
      case 'smile': return <Smile className="h-10 w-10" />;
      default: return <Scissors className="h-10 w-10" />;
    }
  };

  return (
    <div 
      className="pt-20"
      style={{
        background: 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776, #f2f0ec)',
        backgroundSize: '600% 600%',
        animation: 'gradientFlow 7s ease-in-out infinite'
      }}
    >
      {/* Services Hero */}
      <section className="py-20 bg-vintage-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6 animate-fade-in">
            <div className="w-20 h-0.5 bg-brown-800 mr-6"></div>
            <Scissors className="h-12 w-12 text-brown-800" />
            <div className="w-20 h-0.5 bg-brown-800 ml-6"></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-brown-900 mb-6 font-serif animate-slide-up">
            Our Services
          </h1>
          <div className="w-32 h-0.5 bg-brown-800 mx-auto mb-8"></div>
          <p className="text-xl text-brown-700 max-w-4xl mx-auto mb-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
            From timeless classics to contemporary styles, we offer a comprehensive range of grooming services 
            crafted for the modern gentleman. Each service is performed with meticulous attention to detail.
          </p>
          <button
            onClick={() => onPageChange('appointment')}
            className="bg-brown-800 hover:bg-brown-900 text-vintage-cream px-12 py-4 text-lg font-bold transition-all duration-300 hover:scale-105 shadow-vintage hover:shadow-vintage-lg border-2 border-brown-800 uppercase tracking-wide animate-bounce-gentle"
          >
            Book Now
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-brown-800 relative">
        <div className="absolute inset-0 bg-vintage-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES.map((service, index) => (
              <div 
                key={service.id} 
                className={`bg-vintage-cream border-2 border-brown-700 p-8 hover:shadow-vintage-lg transition-all duration-300 hover:-translate-y-2 shadow-vintage animate-slide-up`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="flex items-center justify-center w-20 h-20 bg-brown-800 border-2 border-brown-700 mb-6 text-vintage-cream mx-auto">
                  {getIcon(service.icon)}
                </div>
                
                <h3 className="text-2xl font-bold text-brown-900 mb-4 text-center font-serif">
                  {service.name}
                </h3>
                
                <p className="text-brown-700 mb-6 leading-relaxed text-center">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between text-brown-700 mb-6 border-t border-brown-300 pt-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-semibold">{service.duration} min</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-brown-900 font-serif">${service.price}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => onPageChange('appointment', undefined, [service.id])}
                  className="w-full bg-brown-800 hover:bg-brown-900 text-vintage-cream py-3 px-6 transition-all duration-300 font-bold uppercase tracking-wide border-2 border-brown-800 hover:shadow-vintage"
                >
                  Book This Service
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Packages */}
      <section className="py-20 bg-vintage-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-brown-900 mb-6 font-serif">
              Signature Packages
            </h2>
            <div className="w-32 h-0.5 bg-brown-800 mx-auto mb-6"></div>
            <p className="text-xl text-brown-700 max-w-3xl mx-auto">
              Curated combinations for the complete gentleman's experience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SERVICE_PACKAGES.map((servicePackage, index) => {
              const isPopular = servicePackage.popular;
              const packageServices = servicePackage.services.map(serviceId => 
                SERVICES.find(s => s.id === serviceId)?.name
              ).filter(Boolean);
              
              return (
                <div 
                  key={servicePackage.id}
                  className={`${
                    isPopular 
                      ? 'bg-brown-800 text-vintage-cream p-10 shadow-vintage-lg transform scale-105 border-4 border-vintage-accent' 
                      : 'bg-vintage-cream border-2 border-brown-800 p-10 shadow-vintage hover:shadow-vintage-lg'
                  } transition-all duration-300 animate-slide-up`}
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className="text-center">
                    {isPopular && (
                      <div className="bg-vintage-accent text-brown-900 px-4 py-2 text-sm font-bold mb-6 inline-block uppercase tracking-wider">
                        Most Popular
                      </div>
                    )}
                    <h3 className={`text-3xl font-bold mb-6 font-serif ${isPopular ? '' : 'text-brown-900'}`}>
                      {servicePackage.name}
                    </h3>
                    <p className={`mb-8 text-lg ${isPopular ? 'text-cream-200' : 'text-brown-700'}`}>
                      {servicePackage.description}
                    </p>
                    <ul className="text-left space-y-3 mb-10">
                      {packageServices.map((serviceName, serviceIndex) => (
                        <li key={serviceIndex} className="flex items-center">
                          <span className={`w-3 h-3 mr-4 ${isPopular ? 'bg-vintage-accent' : 'bg-brown-800'}`}></span>
                          <span className={`font-medium ${isPopular ? '' : 'text-brown-700'}`}>
                            {serviceName}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => onPageChange('appointment', undefined, servicePackage.services)}
                      className={`w-full py-4 px-6 transition-all duration-300 font-bold uppercase tracking-wide border-2 ${
                        isPopular 
                          ? 'bg-vintage-accent text-brown-900 hover:bg-vintage-cream border-vintage-accent'
                          : 'bg-brown-800 hover:bg-brown-900 text-vintage-cream border-brown-800'
                      }`}
                    >
                      Choose {servicePackage.name.replace('The ', '')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;