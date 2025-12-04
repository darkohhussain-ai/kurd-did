
import { AppConfig, Channel, Movie, Language, ThemeId, HistoryItem } from '../types';

const CONFIG_KEY = 'streamgenius_config';
const CHANNELS_KEY = 'streamgenius_channels';
const MOVIES_KEY = 'streamgenius_movies';
const DEVICE_ID_KEY = 'streamgenius_device_id';
const LAST_WATCHED_KEY = 'streamgenius_last_watched';
const HISTORY_KEY = 'streamgenius_watch_history';

// Default Demo Channels
const DEMO_CHANNELS: Channel[] = [
    {
        id: 'zaro',
        name: 'Zarok TV',
        group: 'Kurdish',
        logo: 'https://yt3.googleusercontent.com/ytc/AIdro_k2a6uf2YwB4t4qD8yq8Xk5F7Wj9lX_1X5l=s900-c-k-c0x00ffffff-no-rj',
        url: 'https://zindikurmanci.zaroktv.com.tr/hls/0/stream.m3u8'
    },
    {
        id: 'kurdsat',
        name: 'Kurdsat HD',
        group: 'Kurdish',
        logo: 'https://kurdsat.tv/assets/images/logo.svg',
        url: 'https://linear-124.oz.com/kurdsat/index.m3u8'
    },
    {
        id: 'nrt',
        name: 'NRT HD',
        group: 'News',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/2/23/NRT_Logo.png',
        url: 'https://media.streambrothers.com:1936/8226/8226/playlist.m3u8'
    },
    {
        id: 'rudaw',
        name: 'Rudaw',
        group: 'News',
        logo: 'https://upload.wikimedia.org/wikipedia/en/2/24/Rudaw_logo.png',
        url: 'https://cdn-livetv.rudaw.net/live/hls/playlist.m3u8'
    },
    {
        id: 'ashti',
        name: 'Ashti Quran',
        group: 'Religious',
        logo: 'https://static.wikia.nocookie.net/logopedia/images/4/47/Ashti_TV.png',
        url: 'http://avrstream.com:1935/live/AshtiTV/playlist.m3u8'
    },
    // New Iraqi Channels
    {
        id: 'alhurra_iraq',
        name: 'Al-Hurra Iraq',
        group: 'Iraq',
        logo: 'https://i.imgur.com/mXBZEQP.png',
        url: 'https://mbnvvideoingest-i.akamaihd.net/hls/live/1004674/MBNV_ALHURRA_IRAQ/playlist.m3u8'
    },
    {
        id: 'alhurra',
        name: 'Al-Hurra',
        group: 'Iraq',
        logo: 'https://i.imgur.com/0izeu5z.png',
        url: 'https://mbnvvideoingest-i.akamaihd.net/hls/live/1004673/MBNV_ALHURRA_MAIN/playlist.m3u8'
    },
    {
        id: 'aliraqiya',
        name: 'Al-Iraqiya',
        group: 'Iraq',
        logo: 'https://i.imgur.com/imdV6kL.png',
        url: 'https://cdn.catiacast.video/abr/8d2ffb0aba244e8d9101a9488a7daa05/playlist.m3u8'
    },
    {
        id: 'alrafidain',
        name: 'Al-Rafidain',
        group: 'Iraq',
        logo: 'https://i.imgur.com/D78qG91.png',
        url: 'https://cdg8.edge.technocdn.com/arrafidaintv/abr_live/playlist.m3u8'
    },
    {
        id: 'alrasheed',
        name: 'Al-Rasheed',
        group: 'Iraq',
        logo: 'https://i.imgur.com/SU9HbXY.png',
        url: 'https://media1.livaat.com/AL-RASHEED-HD/tracks-v1a1/playlist.m3u8'
    },
    {
        id: 'alsharqiya_news',
        name: 'Al-Sharqiya News',
        group: 'Iraq',
        logo: 'https://i.imgur.com/P6p17ZY.jpg',
        url: 'https://5d94523502c2d.streamlock.net/alsharqiyalive/mystream/playlist.m3u8'
    },
    {
        id: 'alsharqiya',
        name: 'Al-Sharqiya',
        group: 'Iraq',
        logo: 'https://i.imgur.com/bPYyXNf.png',
        url: 'https://5d94523502c2d.streamlock.net/home/mystream/playlist.m3u8'
    },
    {
        id: 'dijlah_tarab',
        name: 'Dijlah Tarab',
        group: 'Music',
        logo: 'https://i.imgur.com/2SBjjBQ.png',
        url: 'https://ghaasiflu.online/tarab/tracks-v1a1/playlist.m3u8'
    },
    {
        id: 'dijlah_tv',
        name: 'Dijlah TV',
        group: 'Iraq',
        logo: 'https://i.imgur.com/FJEeYiz.png',
        url: 'https://ghaasiflu.online/Dijlah/tracks-v1a1/playlist.m3u8'
    },
    {
        id: 'inews',
        name: 'iNEWS',
        group: 'News',
        logo: 'https://i.imgur.com/PeuBkaH.png',
        url: 'https://svs.itworkscdn.net/inewsiqlive/inewsiq.smil/playlist.m3u8'
    },
    {
        id: 'iraq_future',
        name: 'Iraq Future',
        group: 'Iraq',
        logo: 'https://i.imgur.com/Z7woTe5.png',
        url: 'https://streaming.viewmedia.tv/viewsatstream40/viewsatstream40.smil/playlist.m3u8'
    },
    {
        id: 'turkmeneli',
        name: 'Turkmeneli TV',
        group: 'Iraq',
        logo: 'https://i.imgur.com/iUhhg4B.png',
        url: 'https://137840.global.ssl.fastly.net/edge/live_6b7c6e205afb11ebb010f5a331abaf98/playlist.m3u8'
    },
    {
        id: 'zagros',
        name: 'Zagros TV',
        group: 'Iraq',
        logo: 'https://i.imgur.com/UjIuIQX.png',
        url: 'https://5a3ed7a72ed4b.streamlock.net/zagrostv/SMIL:myStream.smil/playlist.m3u8'
    }
];

// Default Demo Movies
const DEMO_MOVIES: Movie[] = [
    {
        id: 'm1', title: 'Big Buck Bunny', description: 'A giant rabbit with a heart bigger than himself.', 
        poster: 'https://upload.wikimedia.org/wikipedia/commons/c/c5/Big_buck_bunny_poster_big.jpg',
        backdrop: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        year: '2008', rating: '7.5', genre: ['Animation', 'Comedy'], type: 'movie'
    },
    {
        id: 'm2', title: 'Sintel', description: 'A lonely young woman searches for a pet dragon.', 
        poster: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Sintel_poster.jpg/800px-Sintel_poster.jpg',
        backdrop: 'https://durian.blender.org/wp-content/uploads/2010/09/sintel_front_cover_small.jpg',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        year: '2010', rating: '7.8', genre: ['Fantasy', 'Animation'], type: 'movie'
    },
    {
        id: 's1', title: 'Cosmos Laundromat', description: 'On a desolate island, a suicidal sheep named Franck meets his fate.',
        poster: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Cosmos_Laundromat_Poster.jpg',
        backdrop: 'https://durian.blender.org/wp-content/uploads/2010/09/sintel_front_cover_small.jpg',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        year: '2015', rating: '8.1', genre: ['Sci-Fi', 'Comedy'], type: 'series'
    },
    {
        id: 's2', title: 'Breaking Bad', description: 'A high school chemistry teacher turned methamphetamine manufacturing drug dealer.',
        poster: 'https://upload.wikimedia.org/wikipedia/en/6/61/Breaking_Bad_title_card.png',
        backdrop: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Breaking_Bad_logo.svg/1200px-Breaking_Bad_logo.svg.png',
        url: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        year: '2008', rating: '9.5', genre: ['Crime', 'Drama'], type: 'series'
    }
];

const DEFAULT_CONFIG: AppConfig = {
  appName: 'Kurd24 TV',
  theme: 'ultra-glass',
  language: 'en',
  welcomeMessage: 'Welcome to your premium streaming experience.',
  featuredMovieId: 'm1',
  remoteDbUrl: '',
  firebaseConfig: '',
  requireSubscription: true,
  adminPassword: 'admin'
};

export const THEMES: Record<ThemeId, { name: string; bg: string; glass: string; text: string; accent: string }> = {
  'dark': { name: 'Classic Dark', bg: 'bg-[#020617]', glass: 'bg-slate-800/70 backdrop-blur-md border-slate-700', text: 'text-slate-200', accent: 'indigo' },
  'glossy-white': { name: 'Glossy White', bg: 'bg-gray-100', glass: 'bg-white/60 backdrop-blur-xl border-white/50 shadow-xl', text: 'text-slate-800', accent: 'blue' },
  'sport': { name: 'Sport Action', bg: 'bg-slate-900', glass: 'bg-red-900/80 backdrop-blur-md border-red-500/30', text: 'text-white', accent: 'red' },
  'ramadan': { name: 'Ramadan Gold', bg: 'bg-[#064e3b]', glass: 'bg-[#064e3b]/80 backdrop-blur-md border-[#fbbf24]/50', text: 'text-[#fef3c7]', accent: 'emerald' },
  'nawroz': { name: 'Nawroz Spring', bg: 'bg-gradient-to-br from-green-600 to-yellow-400', glass: 'bg-white/30 backdrop-blur-lg border-white/40', text: 'text-white', accent: 'green' },
  'black-friday': { name: 'Black Friday', bg: 'bg-black', glass: 'bg-zinc-900/90 border-zinc-800', text: 'text-white', accent: 'purple' },
  'goat': { name: 'G.O.A.T Luxury', bg: 'bg-neutral-900', glass: 'bg-neutral-900/80 border-[#d4af37]', text: 'text-[#d4af37]', accent: 'yellow' },
  'ultra-glass': { name: 'Ultra GlassOS', bg: 'bg-black', glass: 'glass-panel', text: 'text-white', accent: 'cyan' }
};

export const t = (key: string, lang: Language = 'en') => key; // Simplified for robustness
export const isRTL = (lang: Language) => lang === 'ku' || lang === 'ar';

export const parseM3U = (data: string): Channel[] => {
  const lines = data.split('\n');
  const result: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (const line of lines) {
    const l = line.trim();
    if (l.startsWith('#EXTINF:')) {
      const nameMatch = l.match(/,(.+)$/);
      const name = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
      const logoMatch = l.match(/tvg-logo="([^"]+)"/);
      const groupMatch = l.match(/group-title="([^"]+)"/);
      
      currentChannel = { 
        id: `ch-${Date.now()}-${Math.random().toString(36).substr(2,6)}`,
        name, 
        group: groupMatch ? groupMatch[1] : 'Uncategorized', 
        logo: logoMatch ? logoMatch[1] : '' 
      };
    } else if (l.startsWith('http')) {
      if (currentChannel.name) {
        result.push({ ...currentChannel as Channel, url: l });
        currentChannel = {};
      }
    }
  }
  return result;
};

export const getDeviceId = (): string => {
    let id = localStorage.getItem(DEVICE_ID_KEY);
    if (!id) {
        id = Math.random().toString(36).substring(2, 10).toUpperCase();
        localStorage.setItem(DEVICE_ID_KEY, id);
    }
    return id;
};

export const getAppConfig = (): AppConfig => {
  try {
      const stored = localStorage.getItem(CONFIG_KEY);
      const config = stored ? JSON.parse(stored) : DEFAULT_CONFIG;
      // Ensure theme is valid to prevent crashes
      if (!THEMES[config.theme as ThemeId]) config.theme = 'ultra-glass';
      return { ...DEFAULT_CONFIG, ...config };
  } catch { return DEFAULT_CONFIG; }
};

export const saveAppConfig = (config: AppConfig) => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event('config-updated'));
};

export const getChannels = (): Channel[] => {
  try {
      const stored = localStorage.getItem(CHANNELS_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      // Return stored channels if they exist, otherwise return DEMO_CHANNELS
      return (parsed && parsed.length > 0) ? parsed : DEMO_CHANNELS;
  } catch { return DEMO_CHANNELS; }
};

export const saveChannels = (channels: Channel[]) => {
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
};

export const getMovies = (): Movie[] => {
  try {
      const stored = localStorage.getItem(MOVIES_KEY);
      return stored ? JSON.parse(stored) : DEMO_MOVIES;
  } catch { return DEMO_MOVIES; }
};

export const saveMovies = (movies: Movie[]) => {
  localStorage.setItem(MOVIES_KEY, JSON.stringify(movies));
};

export const getLastWatched = (): string | null => localStorage.getItem(LAST_WATCHED_KEY);
export const saveLastWatched = (channelId: string) => localStorage.setItem(LAST_WATCHED_KEY, channelId);

export const getWatchHistory = (): HistoryItem[] => {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
};

export const addToWatchHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
    try {
        const history = getWatchHistory().filter(h => h.id !== item.id);
        history.unshift({ ...item, timestamp: Date.now() });
        if (history.length > 15) history.pop();
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) { console.error("History save failed", e); }
};
