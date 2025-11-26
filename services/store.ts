
import { AppConfig, Channel, Movie, Language, ThemeId, Customer } from '../types';

const CONFIG_KEY = 'streamgenius_config';
const CHANNELS_KEY = 'streamgenius_channels';
const MOVIES_KEY = 'streamgenius_movies';
const AUTH_KEY = 'streamgenius_auth'; // Stores subscription expiry
const DEVICE_ID_KEY = 'streamgenius_device_id';
const LAST_WATCHED_KEY = 'streamgenius_last_watched';

// Provided by user
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCqDG-2C1mBh4L6CpPN_W1s3W5tabUEhfA",
  authDomain: "darko-tv-22932.firebaseapp.com",
  projectId: "darko-tv-22932",
  storageBucket: "darko-tv-22932.firebasestorage.app",
  messagingSenderId: "311159344444",
  appId: "1:311159344444:web:f559dba4b4ff6959392239",
  measurementId: "G-HSB9S5DLQD"
};

const DEFAULT_CONFIG: AppConfig = {
  appName: 'StreamGenius',
  theme: 'dark',
  language: 'en',
  welcomeMessage: 'Welcome to your premium streaming experience.',
  featuredMovieId: 'demo-1',
  remoteDbUrl: '',
  firebaseConfig: JSON.stringify(DEFAULT_FIREBASE_CONFIG),
  requireSubscription: true,
  adminPassword: 'admin' // Default password
};

// --- Themes ---

export const THEMES: Record<ThemeId, { name: string; bg: string; glass: string; text: string; accent: string }> = {
  'dark': {
    name: 'Classic Dark',
    bg: 'bg-[#020617]',
    glass: 'bg-slate-800/70 backdrop-blur-md border-slate-700',
    text: 'text-slate-200',
    accent: 'indigo'
  },
  'glossy-white': {
    name: 'Glossy White',
    bg: 'bg-gray-100', // Uses a gradient in CSS usually, but fallback here
    glass: 'bg-white/60 backdrop-blur-xl border-white/50 shadow-xl',
    text: 'text-slate-800',
    accent: 'blue'
  },
  'sport': {
    name: 'Sport Action',
    bg: 'bg-[url("https://images.unsplash.com/photo-1470468969717-61d5d54fd036?q=80&w=2666&auto=format&fit=crop")]',
    glass: 'bg-red-900/80 backdrop-blur-md border-red-500/30',
    text: 'text-white',
    accent: 'red'
  },
  'ramadan': {
    name: 'Ramadan Gold',
    bg: 'bg-[#064e3b]',
    glass: 'bg-[#064e3b]/80 backdrop-blur-md border-[#fbbf24]/50',
    text: 'text-[#fef3c7]',
    accent: 'emerald'
  },
  'nawroz': {
    name: 'Nawroz Spring',
    bg: 'bg-gradient-to-br from-green-600 to-yellow-400',
    glass: 'bg-white/30 backdrop-blur-lg border-white/40',
    text: 'text-white',
    accent: 'green'
  },
  'black-friday': {
    name: 'Black Friday',
    bg: 'bg-black',
    glass: 'bg-zinc-900/90 border-zinc-800',
    text: 'text-white',
    accent: 'purple'
  },
  'goat': {
    name: 'G.O.A.T Luxury',
    bg: 'bg-neutral-900',
    glass: 'bg-neutral-900/80 border-[#d4af37]',
    text: 'text-[#d4af37]',
    accent: 'yellow'
  }
};

// --- Localization ---

const TRANSLATIONS = {
  en: {
    home: 'Home',
    liveTv: 'Live TV',
    vod: 'Movies',
    series: 'Series',
    playNow: 'Play Now',
    trending: 'Trending Movies',
    search: 'Search channels...',
    admin: 'Admin Panel',
    settings: 'Settings',
    save: 'Save Changes',
    addChannel: 'Add Channel',
    addMovie: 'Add Movie',
    aiImport: 'Bulk Import',
    processAi: 'Import Playlist',
    general: 'General',
    channels: 'Channels',
    movies: 'Movies',
    database: 'Database / Online',
    customers: 'Customers & Codes',
    monitor: 'Live Monitor',
    welcomeDefault: 'Welcome to your premium streaming experience.',
    noChannels: 'No channels found',
    sync: 'Sync from URL',
    export: 'Export Data',
    enterCode: 'Enter Activation Code',
    deviceId: 'Your Device ID',
    activate: 'Activate',
    codeInvalid: 'Invalid Code',
    codeExpired: 'Code Expired',
    firebaseInfo: 'Paste your Firebase configuration or backend keys here for testing.',
    syncFirebase: 'Sync with Firebase',
    saveToCloud: 'Save to Cloud',
    loadFromCloud: 'Load from Cloud',
    about: 'About',
    multiScreen: 'Multi-Screen'
  },
  ku: {
    home: 'سەرەتا',
    liveTv: 'پەخشی ڕاستەوخۆ',
    vod: 'فیلمەکان',
    series: 'زنجیرەکان',
    playNow: 'بینین',
    trending: 'باوترین فیلمەکان',
    search: 'گەڕان...',
    admin: 'بەڕێوەبەرایەتی',
    settings: 'ڕێکخستنەکان',
    save: 'خەزن کردن',
    addChannel: 'زیادکردنی کەناڵ',
    addMovie: 'زیادکردنی فیلم',
    aiImport: 'هێنانی بە کۆمەڵ',
    processAi: 'هێنانی لیست',
    general: 'گشتی',
    channels: 'کەناڵەکان',
    movies: 'فیلمەکان',
    database: 'داتابەیس / ئۆنلاین',
    customers: 'بەشداربووان و کۆدەکان',
    monitor: 'چاودێری ڕاستەوخۆ',
    welcomeDefault: 'بەخێربێیت بۆ ئەزموونی بینینی نایاب',
    noChannels: 'هیچ کەناڵێک نەدۆزرایەوە',
    sync: 'نوێکردنەوە لە بەستەر',
    export: 'دەرهێنانی داتا',
    enterCode: 'کۆدی کاراکردن بنووسە',
    deviceId: 'ئایدی ئامێر',
    activate: 'کاراکردن',
    codeInvalid: 'کۆدەکە هەڵەیە',
    codeExpired: 'کۆدەکە بەسەرچووە',
    firebaseInfo: 'کۆدی فایەربەیس یان بەستەری سێرڤەر لێرە دابنێ بۆ تاقیکردنەوە.',
    syncFirebase: 'نوێکردنەوە لەگەڵ فایەربەیس',
    saveToCloud: 'خەزنکردن لە کڵاود',
    loadFromCloud: 'هێنان لە کڵاود',
    about: 'دەربارە',
    multiScreen: 'فرە-شاشە'
  },
  ar: {
    home: 'الرئيسية',
    liveTv: 'بث مباشر',
    vod: 'الأفلام',
    series: 'مسلسلات',
    playNow: 'شاهد الآن',
    trending: 'الأفلام الشائعة',
    search: 'بحث عن القنوات...',
    admin: 'لوحة التحكم',
    settings: 'الإعدادات',
    save: 'حفظ التغييرات',
    addChannel: 'إضافة قناة',
    addMovie: 'إضافة فيلم',
    aiImport: 'استيراد جماعي',
    processAi: 'معالجة القائمة',
    general: 'عام',
    channels: 'القنوات',
    movies: 'الأفلام',
    database: 'قاعدة البيانات',
    customers: 'المشتركين والأكواد',
    monitor: 'المراقبة الحية',
    welcomeDefault: 'مرحبًا بك في تجربة المشاهدة المميزة.',
    noChannels: 'لا توجد قنوات',
    sync: 'مزامنة من الرابط',
    export: 'تصدير البيانات',
    enterCode: 'أدخل كود التفعيل',
    deviceId: 'معرف الجهاز',
    activate: 'تفعيل',
    codeInvalid: 'الكود غير صحيح',
    codeExpired: 'انتهت صلاحية الكود',
    firebaseInfo: 'أدخل إعدادات Firebase أو أكواد الخادم هنا للاختبار.',
    syncFirebase: 'مزامنة مع Firebase',
    saveToCloud: 'حفظ في السحابة',
    loadFromCloud: 'تحميل من السحابة',
    about: 'حول',
    multiScreen: 'شاشات متعددة'
  }
};

export const t = (key: keyof typeof TRANSLATIONS['en'], lang: Language = 'en') => {
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en'][key];
};

export const isRTL = (lang: Language) => lang === 'ku' || lang === 'ar';

// --- Data & Helpers ---

export const parseM3U = (data: string): Channel[] => {
  const lines = data.split('\n');
  const result: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('#EXTINF:')) {
      // Extract name (after the last comma)
      const nameMatch = l.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
      
      // Extract logo (tvg-logo="...")
      const logoMatch = l.match(/tvg-logo="([^"]+)"/);
      const logo = logoMatch ? logoMatch[1] : '';

      // Extract group (group-title="...")
      const groupMatch = l.match(/group-title="([^"]+)"/);
      const group = groupMatch ? groupMatch[1] : 'Imported';

      currentChannel = { name, group, logo, id: `imp-${Date.now()}-${Math.random().toString(36).substr(2,5)}` };
    } else if (l.startsWith('http')) {
      if (currentChannel.name) {
        result.push({
          ...currentChannel as Channel,
          url: l
        });
        currentChannel = {};
      }
    }
  }
  return result;
};

// --- Security & Subscription ---

export const getDeviceId = (): string => {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
};

const simpleHash = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 6).toUpperCase();
};

export const generateCode = (targetDeviceId: string, months: number): string => {
    const salt = "STREAMGENIUS_SECRET";
    const hash = simpleHash(targetDeviceId + months + salt);
    return `${months}-${hash}`;
};

export const validateCode = (code: string, currentDeviceId: string): { valid: boolean; months?: number } => {
    try {
        const [monthsStr, hash] = code.split('-');
        const months = parseInt(monthsStr);
        const salt = "STREAMGENIUS_SECRET";
        const expectedHash = simpleHash(currentDeviceId + months + salt);
        
        if (hash === expectedHash) {
            return { valid: true, months };
        }
        return { valid: false };
    } catch (e) {
        return { valid: false };
    }
};

export const activateSubscription = (months: number) => {
    const now = new Date();
    const expiry = new Date(now.setMonth(now.getMonth() + months));
    localStorage.setItem(AUTH_KEY, expiry.toISOString());
    window.location.reload();
};

export const getSubscriptionStatus = (): { active: boolean; expiry: Date | null } => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return { active: false, expiry: null };
    
    const expiry = new Date(stored);
    if (new Date() > expiry) {
        return { active: false, expiry };
    }
    return { active: true, expiry };
};

// --- Mock Analytics Data ---

export const getMockCustomers = (): Customer[] => {
    const currentDevice = getDeviceId();
    const subStatus = getSubscriptionStatus();
    
    const randomCustomers: Customer[] = [
        { id: '1', name: 'Ahmed K.', deviceId: '7X2M9P1', location: 'Erbil, IQ', subscriptionEnd: '2025-12-01', lastActive: '2 mins ago', planType: '12 Months', status: 'Active' },
        { id: '2', name: 'Sarah J.', deviceId: '9K2L1M0', location: 'Dubai, UAE', subscriptionEnd: '2024-06-15', lastActive: 'Online', planType: '6 Months', status: 'Active' },
        { id: '3', name: 'User 102', deviceId: '3J9K8L2', location: 'Sulaymaniyah, IQ', subscriptionEnd: '2023-11-20', lastActive: '5 days ago', planType: '1 Month', status: 'Expired' },
        { id: '4', name: 'Demo TV', deviceId: '1A2B3C4', location: 'Riyadh, SA', subscriptionEnd: '2025-01-01', lastActive: '1 hour ago', planType: 'Trial', status: 'Active' },
    ];

    // Add current user to list
    randomCustomers.unshift({
        id: 'me',
        name: 'Current Device',
        deviceId: currentDevice,
        location: 'Local Session',
        subscriptionEnd: subStatus.expiry ? subStatus.expiry.toISOString().split('T')[0] : 'Not Subscribed',
        lastActive: 'Now',
        planType: subStatus.active ? 'Premium' : 'Trial',
        status: subStatus.active ? 'Active' : 'Expired'
    });

    return randomCustomers;
};

// --- EPG Mock Data ---

export const getMockEPG = (channelName: string) => {
    const programs = [
        { cur: "Morning News", next: "Weather Update" },
        { cur: "Live Sports: Final", next: "Post-Match Analysis" },
        { cur: "Movie: The Matrix", next: "Movie: John Wick" },
        { cur: "Documentary: Earth", next: "Wild Life" },
        { cur: "Music Hits", next: "Top 40 Countdown" }
    ];
    // Deterministic random based on channel name length
    const idx = channelName.length % programs.length;
    // Random progress bar 20-80%
    const progress = Math.floor(Math.random() * 60) + 20;
    
    return {
        current: programs[idx].cur,
        next: programs[idx].next,
        progress
    };
};

// --- Basic Data Getters/Setters ---

const DEMO_CHANNELS: Channel[] = [
  { id: 'zarok', name: 'زارۆک', group: 'ئاسمانی و ناوخۆیی', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Zarok_TV_logo.png/640px-Zarok_TV_logo.png', url: 'https://zindikurmanci.zaroktv.com.tr/hls/0/stream.m3u8' },
  { id: 'nrt', name: 'ئێن ئاڕ تی', group: 'ئاسمانی و ناوخۆیی', logo: 'https://upload.wikimedia.org/wikipedia/en/b/b3/NRT_HD_Logo.png', url: 'https://media.streambrothers.com:1936/8226/8226/playlist.m3u8' },
  { id: 'mekke', name: 'مەکە', group: 'ئاسمانی و ناوخۆیی', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Kaaba_mirror_edit_jj.jpg/1200px-Kaaba_mirror_edit_jj.jpg', url: 'https://media2.streambrothers.com:1936/8122/8122/chunklist_w300559019.m3u8' },
  { id: 'varzish2', name: 'وەرزش 2', group: 'ئاسمانی و ناوخۆیی', logo: '', url: 'https://lenz.splus.ir/PLTV/88888888/224/3221226845/index.m3u8' },
  { id: 'ashti', name: 'ئاشتی قورئان', group: 'قورئانی پیرۆز', logo: '', url: 'http://avrstream.com:1935/live/AshtiTV/playlist.m3u8' },
];

const DEMO_MOVIES: Movie[] = [
  { 
    id: 'm1', 
    title: 'Tears of Steel', 
    description: 'A group of warriors and scientists gather at the "Oude Kerk" in Amsterdam to stage a crucial event from the past in a desperate attempt to rescue the world from destructive robots.', 
    poster: 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Tears_of_Steel_poster.jpg',
    backdrop: 'https://mango.blender.org/wp-content/uploads/2012/09/mango-vfx-breakdown-01.jpg',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    year: '2012',
    genre: ['Sci-Fi', 'Action'],
    rating: '7.5'
  }
];

export const getAppConfig = (): AppConfig => {
  const stored = localStorage.getItem(CONFIG_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
};

export const saveAppConfig = (config: AppConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event('config-updated'));
};

export const getChannels = (): Channel[] => {
  const stored = localStorage.getItem(CHANNELS_KEY);
  return stored ? JSON.parse(stored) : DEMO_CHANNELS;
};

export const saveChannels = (channels: Channel[]) => {
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
};

export const getMovies = (): Movie[] => {
  const stored = localStorage.getItem(MOVIES_KEY);
  return stored ? JSON.parse(stored) : DEMO_MOVIES;
};

export const saveMovies = (movies: Movie[]) => {
  localStorage.setItem(MOVIES_KEY, JSON.stringify(movies));
};

export const getLastWatched = (): string | null => {
    return localStorage.getItem(LAST_WATCHED_KEY);
};

export const saveLastWatched = (channelId: string) => {
    localStorage.setItem(LAST_WATCHED_KEY, channelId);
};

export const fetchRemoteDatabase = async (url: string) => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        
        if (data.config) saveAppConfig({ ...getAppConfig(), ...data.config });
        if (data.channels) saveChannels(data.channels);
        if (data.movies) saveMovies(data.movies);
        
        return true;
    } catch (error) {
        console.error("Sync failed", error);
        return false;
    }
};

export const exportDatabase = () => {
    const data = {
        config: getAppConfig(),
        channels: getChannels(),
        movies: getMovies()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streamgenius_backup_${Date.now()}.json`;
    a.click();
};
