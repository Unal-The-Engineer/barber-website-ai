import React, { useState, useEffect } from 'react';
import { SERVICES, TIME_SLOTS } from '../utils/constants';
import { Calendar, Clock, User, Mail, Phone, Check, Scissors } from 'lucide-react';
import { Appointment as AppointmentType } from '../types/types';

interface AppointmentProps {
  onPageChange: (page: string, appointment?: AppointmentType) => void;
  preSelectedServices?: string[];
}

const Appointment: React.FC<AppointmentProps> = ({ onPageChange, preSelectedServices = [] }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>(preSelectedServices);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [reservedTimes, setReservedTimes] = useState<string[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);

  // Update selected services when preSelectedServices changes
  useEffect(() => {
    setSelectedServices(preSelectedServices);
  }, [preSelectedServices]);

  // Generate dates starting from today
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    // Add today as the first option
    dates.push(today);
    
    // Add next 13 days (total 14 days including today)
    for (let i = 1; i <= 13; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get available time slots based on selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    const selectedDateObj = new Date(selectedDate);
    const today = new Date();
    const now = new Date();
    
    // Check if selected date is today
    const isToday = selectedDateObj.toDateString() === today.toDateString();
    
    if (isToday) {
      // For today, only show times after current time
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      return TIME_SLOTS.filter(timeSlot => {
        const [time, period] = timeSlot.split(' ');
        const [hours, minutes] = time.split(':').map(Number);
        
        // Convert to 24-hour format
        let hour24 = hours;
        if (period === 'PM' && hours !== 12) {
          hour24 += 12;
        } else if (period === 'AM' && hours === 12) {
          hour24 = 0;
        }
        
        // Check if this time slot is after current time
        if (hour24 > currentHour) {
          return true;
        } else if (hour24 === currentHour && minutes > currentMinute) {
          return true;
        }
        return false;
      });
    } else {
      // For future dates, show all time slots
      return TIME_SLOTS;
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getDateValue = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime && selectedServices.length > 0 && formData.name && formData.email && formData.phone) {
      const selectedServiceNames = selectedServices.map(serviceId => 
        SERVICES.find(s => s.id === serviceId)?.name
      ).filter(Boolean).join(', ');
      
      // Backend'e gönderilecek rezervasyon verisi
      const reservationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        service: selectedServiceNames,
        date: new Date(selectedDate + 'T' + convertTo24Hour(selectedTime)).toISOString(),
        time: selectedTime
      };

      try {
        const response = await fetch('http://localhost:8000/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reservationData),
        });

        if (response.ok) {
          const createdReservation = await response.json();
          // Başarılı rezervasyon sonrası confirmation sayfasına yönlendir
      const appointment: AppointmentType = {
        date: selectedDate,
        time: selectedTime,
        service: selectedServiceNames,
        name: formData.name,
        email: formData.email,
        phone: formData.phone
      };
      onPageChange('confirmation', appointment);
        } else {
          const errorData = await response.json();
          alert('Rezervasyon oluşturulamadı: ' + (errorData.detail || 'Bilinmeyen hata'));
        }
      } catch (error) {
        console.error('Rezervasyon hatası:', error);
        alert('Rezervasyon oluşturulamadı. Lütfen tekrar deneyin.');
      }
    }
  };

  // Saat formatını 24 saatlik formata çeviren yardımcı fonksiyon
  const convertTo24Hour = (time12h: string) => {
    const [time, period] = time12h.split(' ');
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (period === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes}:00`;
  };

  // Telefon numarası formatı: (xxx) xxx xx xx
  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '');
    
    // Maksimum 10 rakam
    const limitedNumbers = numbers.slice(0, 10);
    
    // Format uygula
    if (limitedNumbers.length === 0) return '';
    if (limitedNumbers.length <= 3) return `(${limitedNumbers}`;
    if (limitedNumbers.length <= 6) return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3)}`;
    if (limitedNumbers.length <= 8) return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3, 6)} ${limitedNumbers.slice(6)}`;
    return `(${limitedNumbers.slice(0, 3)}) ${limitedNumbers.slice(3, 6)} ${limitedNumbers.slice(6, 8)} ${limitedNumbers.slice(8)}`;
  };

  // Telefon numarası geçerli mi kontrol et
  const isPhoneValid = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10;
  };

  // Telefon numarası değişikliği
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  // Email validation - Geçerli domain'ler
  const validEmailDomains = [
    'gmail.com',
    'hotmail.com',
    'outlook.com',
    'yahoo.com',
    'yandex.com',
    'mynet.com',
    'superonline.com',
    'ttnet.net.tr'
  ];

  // Email geçerli mi kontrol et
  const isEmailValid = (email: string) => {
    if (!email) return false;
    
    // @ sayısı kontrolü (tam 1 tane olmalı)
    const atCount = (email.match(/@/g) || []).length;
    if (atCount !== 1) return false;
    
    // @ ile böl
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const [localPart, domain] = parts;
    
    // Local part boş olmamalı
    if (!localPart || localPart.length === 0) return false;
    
    // Domain geçerli listede olmalı
    return validEmailDomains.includes(domain.toLowerCase());
  };

  // Email değişikliği
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const isFormValid = selectedDate && selectedTime && selectedServices.length > 0 && formData.name && isEmailValid(formData.email) && isPhoneValid(formData.phone);

  // Generate tooltip message for missing requirements
  const getTooltipMessage = () => {
    const missing = [];
    if (selectedServices.length === 0) missing.push('Please select at least one service');
    if (!selectedDate) missing.push('Please choose a date');
    if (!selectedTime) missing.push('Please select a time');
    if (!formData.name) missing.push('Please enter your name');
    if (!formData.email) missing.push('Please enter your email');
    if (formData.email && !isEmailValid(formData.email)) missing.push('Please enter a valid email address');
    if (!formData.phone) missing.push('Please enter your phone number');
    if (formData.phone && !isPhoneValid(formData.phone)) missing.push('Please enter a valid phone number');
    
    return missing.join(' • ');
  };

  // Fetch available times when selectedDate changes
  useEffect(() => {
    if (!selectedDate) {
      setReservedTimes([]);
      setAvailableTimeSlots([]);
      return;
    }
    fetch(`http://localhost:8000/reservations/available-times?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => {
        // data: { date: string, all_time_slots: string[], available_times: string[], reserved_times: string[] }
        setAllTimeSlots(data.all_time_slots || []);
        setAvailableTimeSlots(data.available_times || []);
        setReservedTimes(data.reserved_times || []);
      })
      .catch(() => {
        setAllTimeSlots([]);
        setAvailableTimeSlots([]);
        setReservedTimes([]);
      });
  }, [selectedDate]);

  return (
    <div 
      className="pt-20 min-h-screen"
      style={{
        background: 'linear-gradient(-45deg, #f2f0ec, #e8e4dc, #e2e0dc, #ddd6c8, #a59d90, #918776, #f2f0ec)',
        backgroundSize: '600% 600%',
        animation: 'gradientFlow 7s ease-in-out infinite'
      }}
    >
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center mb-6">
              <div className="w-20 h-0.5 bg-brown-800 mr-6"></div>
              <Scissors className="h-12 w-12 text-brown-800" />
              <div className="w-20 h-0.5 bg-brown-800 ml-6"></div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-brown-900 mb-6 font-serif">
              Book Appointment
            </h1>
            <div className="w-32 h-0.5 bg-brown-800 mx-auto mb-6"></div>
            <p className="text-xl text-brown-700">
              Reserve your time with our master barbers
            </p>
          </div>

          <div className="bg-vintage-cream border-4 border-brown-800 shadow-vintage-lg p-10 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Service Selection */}
              <div className="animate-slide-in-left">
                <label className="block text-2xl font-bold text-brown-900 mb-8 font-serif text-center">
                  <User className="inline h-6 w-6 mr-3" />
                  Select Your Service
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {SERVICES.map((service, index) => {
                    const isSelected = selectedServices.includes(service.id);
                    return (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setSelectedServices(selectedServices.filter(id => id !== service.id));
                          } else {
                            setSelectedServices([...selectedServices, service.id]);
                          }
                        }}
                        className={`p-6 border-2 text-left transition-all duration-300 transform hover:scale-105 animate-slide-up relative ${
                          isSelected
                            ? 'border-brown-800 bg-brown-800 text-vintage-cream shadow-vintage-lg'
                            : 'border-brown-600 bg-vintage-cream text-brown-900 hover:border-brown-800 hover:shadow-vintage'
                        }`}
                        style={{animationDelay: `${index * 0.1}s`}}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <Check className="h-6 w-6 text-vintage-accent" />
                          </div>
                        )}
                        <div className="flex justify-between items-start mb-3 pr-8">
                          <h3 className="text-xl font-bold font-serif">{service.name}</h3>
                          <span className={`text-2xl font-bold font-serif ${isSelected ? 'text-vintage-accent' : 'text-brown-800'}`}>
                            ${service.price}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${isSelected ? 'text-cream-200' : 'text-brown-700'}`}>
                          {service.description}
                        </p>
                        <div className={`flex items-center text-sm ${isSelected ? 'text-cream-300' : 'text-brown-600'}`}>
                          <Clock className="h-4 w-4 mr-2" />
                          {service.duration} minutes
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Selection */}
              <div className="animate-slide-in-right">
                <label className="block text-2xl font-bold text-brown-900 mb-8 font-serif text-center">
                  <Calendar className="inline h-6 w-6 mr-3" />
                  Choose Your Date
                </label>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                  {getAvailableDates().map((date, index) => (
                    <button
                      key={getDateValue(date)}
                      type="button"
                      onClick={() => {
                        setSelectedDate(getDateValue(date));
                        setSelectedTime(''); // Reset time when date changes
                      }}
                      className={`p-4 border-2 text-center transition-all duration-300 transform hover:scale-105 animate-slide-up ${
                        selectedDate === getDateValue(date)
                          ? 'border-brown-800 bg-brown-800 text-vintage-cream shadow-vintage-lg'
                          : 'border-brown-600 bg-vintage-cream text-brown-900 hover:border-brown-800 hover:shadow-vintage'
                      }`}
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      <div className="font-bold font-serif">{formatDate(date)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="animate-slide-up">
                  <label className="block text-2xl font-bold text-brown-900 mb-8 font-serif text-center">
                    <Clock className="inline h-6 w-6 mr-3" />
                    Select Your Time
                  </label>
                  {allTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {allTimeSlots.map((time, index) => {
                        const isReserved = reservedTimes.includes(time);
                        const isAvailable = availableTimeSlots.includes(time);
                        return (
                          <div key={time} className="relative group">
                        <button
                          type="button"
                              onClick={() => isAvailable && !isReserved && setSelectedTime(time)}
                              disabled={isReserved || !isAvailable}
                              className={`w-full p-4 border-2 text-center transition-all duration-300 transform animate-slide-up relative ${
                            selectedTime === time
                              ? 'border-brown-800 bg-brown-800 text-vintage-cream shadow-vintage-lg'
                                  : (isReserved || !isAvailable)
                                  ? 'border-brown-300 bg-vintage-cream text-brown-400 cursor-not-allowed opacity-50'
                                  : 'border-brown-600 bg-vintage-cream text-brown-900 hover:border-brown-800 hover:shadow-vintage hover:scale-105'
                          }`}
                          style={{animationDelay: `${index * 0.03}s`}}
                        >
                              <div className="font-bold font-serif relative">
                                {time}
                                {(isReserved || !isAvailable) && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full h-0.5 bg-brown-400 opacity-70"></div>
                                  </div>
                                )}
                              </div>
                        </button>
                            {(isReserved || !isAvailable) && (
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                <div className="bg-brown-800 text-vintage-cream px-4 py-2 text-xs font-medium whitespace-nowrap border-2 border-brown-700 shadow-vintage-lg">
                                  {isReserved ? "This time slot is reserved, please select another time." : "This time slot is not available, please select another time."}
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-brown-800"></div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-brown-700 text-lg">
                        No available appointments for this date. Please select another date.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Contact Information - Fixed condition */}
              {selectedDate && selectedTime && selectedServices.length > 0 && (
                <div className="animate-slide-up">
                  <h3 className="text-2xl font-bold text-brown-900 mb-8 font-serif text-center">
                    Your Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="animate-slide-in-left">
                      <label className="block text-lg font-bold text-brown-900 mb-3 font-serif">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-4 top-4 h-6 w-6 text-brown-600" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full pl-12 pr-4 py-4 border-2 border-brown-600 bg-vintage-cream text-brown-900 focus:ring-2 focus:ring-brown-800 focus:border-brown-800 transition-all duration-300 placeholder-brown-500 font-medium"
                          placeholder="Your name"
                        />
                      </div>
                    </div>
                    
                    <div className="animate-slide-up" style={{animationDelay: '0.1s'}}>
                      <label className="block text-lg font-bold text-brown-900 mb-3 font-serif">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 h-6 w-6 text-brown-600" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleEmailChange}
                          className={`w-full pl-12 pr-4 py-4 border-2 bg-vintage-cream text-brown-900 focus:ring-2 focus:ring-brown-800 focus:border-brown-800 transition-all duration-300 placeholder-brown-500 font-medium ${
                            formData.email && !isEmailValid(formData.email)
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-brown-600'
                          }`}
                          placeholder="your@gmail.com"
                        />
                      </div>
                      {formData.email && !isEmailValid(formData.email) && (
                        <p className="text-red-500 text-sm mt-2 font-medium">
                          Please enter a valid email address: example@gmail.com
                        </p>
                      )}
                    </div>
                    
                    <div className="animate-slide-in-right" style={{animationDelay: '0.2s'}}>
                      <label className="block text-lg font-bold text-brown-900 mb-3 font-serif">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-4 h-6 w-6 text-brown-600" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          maxLength={15} // (xxx) xxx xx xx = 15 karakter
                          className={`w-full pl-12 pr-4 py-4 border-2 bg-vintage-cream text-brown-900 focus:ring-2 focus:ring-brown-800 focus:border-brown-800 transition-all duration-300 placeholder-brown-500 font-medium ${
                            formData.phone && !isPhoneValid(formData.phone)
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-brown-600'
                          }`}
                          placeholder="(555) 123 45 67"
                        />
                      </div>
                      {formData.phone && !isPhoneValid(formData.phone) && (
                        <p className="text-red-500 text-sm mt-2 font-medium">
                          Please enter a valid phone number: (555) 123 45 67
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button with Tooltip */}
              <div className="pt-8 animate-bounce-gentle">
                <div className="relative group">
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`w-full py-6 px-8 text-xl font-bold transition-all duration-300 transform border-2 uppercase tracking-wide font-serif ${
                      isFormValid
                        ? 'bg-brown-800 hover:bg-brown-900 text-vintage-cream border-brown-800 hover:scale-105 shadow-vintage hover:shadow-vintage-lg'
                        : 'bg-brown-300 text-brown-600 cursor-not-allowed border-brown-300'
                    }`}
                  >
                    <Check className="inline h-6 w-6 mr-3" />
                    Confirm Your Appointment
                  </button>
                  
                  {/* Tooltip for disabled button */}
                  {!isFormValid && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                      <div className="bg-brown-800 text-vintage-cream px-6 py-4 text-sm font-medium whitespace-nowrap border-2 border-brown-700 shadow-vintage-lg max-w-md">
                        <div className="text-center">
                          <div className="font-bold mb-2 text-vintage-accent">Complete these steps:</div>
                          <div className="text-left space-y-1">
                            {getTooltipMessage().split(' • ').map((item, index) => (
                              <div key={index} className="flex items-center">
                                <span className="w-2 h-2 bg-vintage-accent rounded-full mr-3 flex-shrink-0"></span>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Tooltip arrow */}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-brown-800"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Appointment;