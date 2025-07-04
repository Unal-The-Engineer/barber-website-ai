export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  icon: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  experience: string;
  image: string;
  bio: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Appointment {
  date: string;
  time: string;
  service: string;
  name: string;
  email: string;
  phone: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}