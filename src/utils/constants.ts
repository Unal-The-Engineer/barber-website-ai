import { Service, Staff } from '../types/types';

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Classic Haircut',
    description: 'Traditional scissor cut with styling',
    price: 22,
    duration: 45,
    icon: 'scissors'
  },
  {
    id: '2',
    name: 'Beard Trim',
    description: 'Professional beard shaping and grooming',
    price: 15,
    duration: 30,
    icon: 'user'
  },
  {
    id: '3',
    name: 'Hair & Beard Combo',
    description: 'Complete grooming package',
    price: 32,
    duration: 75,
    icon: 'star'
  },
  {
    id: '4',
    name: 'Hot Towel Shave',
    description: 'Luxury wet shave experience',
    price: 25,
    duration: 60,
    icon: 'flame'
  },
  {
    id: '5',
    name: 'Hair Wash & Style',
    description: 'Deep cleanse with premium styling',
    price: 18,
    duration: 40,
    icon: 'droplets'
  },
  {
    id: '6',
    name: 'Mustache Grooming',
    description: 'Precision mustache trimming',
    price: 12,
    duration: 25,
    icon: 'smile'
  }
];

export const STAFF: Staff[] = [
  {
    id: '1',
    name: 'Marcus Johnson',
    role: 'Master Barber',
    experience: '15 years',
    image: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Marcus brings over 15 years of experience in classic and modern barbering techniques.'
  },
  {
    id: '2',
    name: 'David Rodriguez',
    role: 'Senior Barber',
    experience: '8 years',
    image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Specializing in modern cuts and beard artistry with a keen eye for detail.'
  },
  {
    id: '3',
    name: 'James Thompson',
    role: 'Barber',
    experience: '5 years',
    image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=400',
    bio: 'Passionate about traditional barbering with expertise in hot towel shaves.'
  }
];

// Service Packages
export interface ServicePackage {
  id: string;
  name: string;
  description: string;
  services: string[]; // Service IDs included in the package
  popular?: boolean;
}

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'classic',
    name: 'The Classic',
    description: 'Perfect for regular maintenance',
    services: ['1', '5'] // Classic Haircut + Hair Wash & Style
  },
  {
    id: 'gentleman',
    name: 'The Gentleman',
    description: 'The complete experience',
    services: ['1', '2', '5', '4'], // Classic Haircut + Beard Trim + Hair Wash & Style + Hot Towel Treatment
    popular: true
  },
  {
    id: 'royal',
    name: 'The Royal',
    description: 'The ultimate luxury',
    services: ['1', '4', '2', '5', '6'] // Premium Haircut + Hot Towel Shave + Beard Grooming + Hair Wash & Style + Mustache Grooming
  }
];

export const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM', '6:00 PM'
];