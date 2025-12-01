

export type Language = 'en' | 'ku' | 'ar';

export interface Channel {
  id: string;
  name: string;
  group: string;
  logo: string;
  url: string;
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop: string;
  url: string;
  year: string;
  genre: string[];
  rating: string;
  type: 'movie' | 'series';
}

export interface HistoryItem {
  id: string;
  type: 'channel' | 'movie';
  title: string;
  image: string;
  url: string;
  timestamp: number;
}

export interface Customer {
  id: string; // Document ID (Device ID)
  deviceId: string;
  name?: string;
  location?: string;
  subscriptionEnd: any; // Firestore Timestamp or ISO string
  lastActive: any; // Firestore Timestamp or ISO string
  status: 'Active' | 'Expired' | 'Pending' | 'Banned';
  createdAt: any;
}

export type ThemeId = 'dark' | 'glossy-white' | 'sport' | 'ramadan' | 'nawroz' | 'black-friday' | 'goat';

export interface AppConfig {
  appName: string;
  theme: ThemeId;
  language: Language;
  adminPassword?: string; 
  featuredMovieId?: string;
  welcomeMessage: string;
  remoteDbUrl?: string;
  firebaseConfig?: string;
  requireSubscription: boolean;
}

declare global {
  interface Window {
    Hls: any;
  }
}