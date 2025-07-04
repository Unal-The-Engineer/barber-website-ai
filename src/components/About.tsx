import React from 'react';
import { STAFF } from '../utils/constants';
import { Scissors } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div 
      className="pt-20"
      style={{
        background: 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776, #f2f0ec)',
        backgroundSize: '600% 600%',
        animation: 'gradientFlow 7s ease-in-out infinite'
      }}
    >
      {/* About Hero */}
      <section className="py-20 bg-vintage-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-in-left">
              <div className="flex items-center mb-6">
                <div className="w-16 h-0.5 bg-brown-800 mr-4"></div>
                <Scissors className="h-8 w-8 text-brown-800" />
                <div className="w-16 h-0.5 bg-brown-800 ml-4"></div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-brown-900 mb-8 font-serif">
                Our Legacy
              </h1>
              <p className="text-lg text-brown-700 mb-6 leading-relaxed">
                Since 2010, Elite Cuts has stood as a beacon of traditional barbering excellence 
                in the heart of New York. What began as a humble neighborhood shop has evolved 
                into a distinguished establishment where craftsmanship meets artistry.
              </p>
              <p className="text-lg text-brown-700 mb-8 leading-relaxed">
                Our commitment to time-honored techniques, combined with contemporary styling, 
                has earned us the trust of discerning gentlemen who appreciate the finer details 
                of superior grooming.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-6 bg-brown-800 text-vintage-cream border-2 border-brown-700">
                  <div className="text-4xl font-bold mb-2 font-serif">13+</div>
                  <div className="text-sm uppercase tracking-wider">Years Excellence</div>
                </div>
                <div className="text-center p-6 bg-brown-800 text-vintage-cream border-2 border-brown-700">
                  <div className="text-4xl font-bold mb-2 font-serif">5000+</div>
                  <div className="text-sm uppercase tracking-wider">Satisfied Clients</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-slide-in-right">
              <div className="absolute -top-4 -left-4 w-full h-full border-2 border-brown-800 opacity-30"></div>
              <img
                src="https://images.pexels.com/photos/1319460/pexels-photo-1319460.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Barbershop Interior"
                className="relative z-10 shadow-vintage-lg border-4 border-vintage-cream"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team */}
      <section className="py-20 bg-vintage-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-brown-900 mb-6 font-serif">
              Master Barbers
            </h2>
            <div className="w-32 h-0.5 bg-brown-800 mx-auto mb-6"></div>
            <p className="text-xl text-brown-700 max-w-3xl mx-auto">
              Our distinguished team brings generations of expertise and passion for the craft
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {STAFF.map((member, index) => (
              <div key={member.id} className={`bg-vintage-cream border-2 border-brown-800 shadow-vintage hover:shadow-vintage-lg transition-all duration-300 hover:-translate-y-2 animate-slide-up`} style={{animationDelay: `${index * 0.1}s`}}>
                <div className="relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-brown-800 bg-opacity-90 text-vintage-cream p-4">
                    <h3 className="text-2xl font-bold mb-1 font-serif">
                      {member.name}
                    </h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-vintage-accent font-semibold uppercase tracking-wide text-sm">{member.role}</span>
                      <span className="text-sm text-cream-200">{member.experience}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-brown-700 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="py-20 bg-brown-800 relative">
        <div className="absolute inset-0 bg-vintage-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div className="animate-slide-in-left">
              <h2 className="text-4xl font-bold text-vintage-cream mb-8 font-serif">
                Visit Our Establishment
              </h2>
              <div className="space-y-8">
                <div className="border-l-4 border-vintage-accent pl-6">
                  <h3 className="text-2xl font-bold mb-3 text-vintage-cream font-serif">Address</h3>
                  <p className="text-cream-200 text-lg leading-relaxed">
                    123 Main Street<br />
                    Downtown District<br />
                    New York, NY 10001
                  </p>
                </div>
                
                <div className="border-l-4 border-vintage-accent pl-6">
                  <h3 className="text-2xl font-bold mb-3 text-vintage-cream font-serif">Hours</h3>
                  <div className="text-cream-200 space-y-2">
                    <div className="flex justify-between text-lg">
                      <span>Monday - Friday:</span>
                      <span className="font-semibold">9:00 AM - 7:00 PM</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Saturday:</span>
                      <span className="font-semibold">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span>Sunday:</span>
                      <span className="font-semibold">10:00 AM - 4:00 PM</span>
                    </div>
                  </div>
                </div>
                
                <div className="border-l-4 border-vintage-accent pl-6">
                  <h3 className="text-2xl font-bold mb-3 text-vintage-cream font-serif">Contact</h3>
                  <p className="text-cream-200 text-lg leading-relaxed">
                    Phone: (555) 123-4567<br />
                    Email: info@elitecuts.com
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-vintage-cream border-4 border-brown-700 h-96 shadow-vintage-lg animate-slide-in-right overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.3977!2d-74.0059!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25a316e30b3db%3A0x7f4b10f1b6d8a5f5!2s123%20Main%20St%2C%20New%20York%2C%20NY%2010001%2C%20USA!5e0!3m2!1sen!2str!4v1703001234567!5m2!1sen!2str"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Elite Cuts Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;