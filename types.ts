
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
}

export interface Customer {
  id: string;
  name: string;
  deviceId: string;
  location: string;
  subscriptionEnd: string; // ISO Date
  lastActive: string; // ISO Date
  planType: '1 Month' | '6 Months' | '12 Months' | 'Trial' | 'Premium';
  status: 'Active' | 'Expired' | 'Banned';
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
  firebaseConfig?: string; // Field for "Firebase Test Code"
  requireSubscription: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  url: string;
  type: 'LIVE' | 'VOD';
  items: Channel[] | Movie[];
}

// Global window extension for Hls.js
declare global {
  interface Window {
    Hls: any;
  }
}