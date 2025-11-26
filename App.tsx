
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { Tv, Film, Settings, Play, Home, Menu, X, MonitorPlay, Lock, Smartphone, Monitor, Layers, DownloadCloud, LayoutGrid, History, Bell, User, Video, Wifi, Info, Calendar, Clock, LogOut, Grid3X3, ArrowLeft, Maximize2 } from 'lucide-react';
import { 
    getAppConfig, getChannels, getMovies, t, isRTL, THEMES, 
    getSubscriptionStatus, validateCode, activateSubscription, getDeviceId, getMockEPG,
    getLastWatched, saveLastWatched
} from './services/store';
import { initFirebase } from './services/firebase';
import { AppConfig, Channel, Movie } from './types';
import VideoPlayer from './components/VideoPlayer';
import { AdminPanel } from './components/AdminPanel';

// --- Global Components ---

const SplashScreen: React.FC = () => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 3000); // 3 seconds intro
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
            <div className="relative animate-[ping_3s_ease-out_infinite] opacity-10">
                 <div className="w-96 h-96 bg-indigo-600 rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10 text-center animate-[fade-out_3s_ease-in-out_forwards]">
                 <div className="transform transition-all duration-[3000ms] scale-150 animate-[pulse_3s_ease-in-out]">
                    <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 tracking-tighter drop-shadow-2xl">
                        StreamGenius
                    </h1>
                 </div>
                 <p className="text-white/60 mt-4 tracking-[0.5em] uppercase text-sm animate-bounce">Premium Experience</p>
            </div>
        </div>
    );
};

const LockScreen: React.FC<{ config: AppConfig }> = ({ config }) => {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const deviceId = getDeviceId();
    const lang = config.language;
    const theme = THEMES[config.theme];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const result = validateCode(code, deviceId);
        if (result.valid && result.months) {
            activateSubscription(result.months);
        } else {
            setError(t('codeInvalid', lang));
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${theme.bg} ${theme.bg.includes('url') ? 'bg-cover bg-center' : ''}`}>
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-3xl shadow-2xl text-center">
                 <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/30 transform rotate-3">
                     <Lock className="text-white" size={36} />
                 </div>
                 <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">{config.appName}</h1>
                 <p className="text-indigo-200 mb-8 font-medium">{t('welcomeDefault', lang)}</p>
                 
                 <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5 backdrop-blur-md">
                     <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{t('deviceId', lang)}</p>
                     <p className="text-2xl font-mono text-white font-bold tracking-widest drop-shadow-md">{deviceId}</p>
                 </div>

                 <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <input 
                            type="text" 
                            placeholder={t('enterCode', lang)}
                            value={code}
                            onChange={e => setCode(e.target.value.toUpperCase())}
                            className="relative w-full bg-slate-900 text-white border-0 rounded-lg px-4 py-4 text-center font-mono text-xl tracking-widest focus:ring-0 placeholder-gray-600"
                        />
                     </div>
                     {error && <p className="text-red-400 text-sm font-medium animate-pulse">{error}</p>}
                     <button type="submit" className="w-full bg-white text-indigo-900 font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                         {t('activate', lang)}
                     </button>
                 </form>

                 <div className="mt-8 pt-6 border-t border-white/10">
                    <Link to="/admin" className="text-indigo-300/60 hover:text-white text-xs flex items-center justify-center gap-1 transition-colors">
                        <Settings size={12} /> {t('admin', lang)}
                    </Link>
                 </div>
             </div>
        </div>
    );
};

// --- Omid Hotel Style Dashboard ---

const DockButton: React.FC<{ to: string, icon: React.ReactNode, label: string, active?: boolean }> = ({ to, icon, label, active }) => (
    <Link to={to} className={`
        group flex flex-col items-center justify-center w-28 h-24 md:w-32 md:h-28 
        rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-300
        ${active ? 'bg-indigo-600/90 border-indigo-400 shadow-[0_0_30px_rgba(79,70,229,0.5)] scale-110 -translate-y-2' : 'bg-black/40 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1'}
    `}>
        <div className={`mb-2 ${active ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
            {icon}
        </div>
        <span className={`text-xs font-medium tracking-wide uppercase ${active ? 'text-white font-bold' : 'text-slate-400 group-hover:text-white'}`}>
            {label}
        </span>
    </Link>
);

const HomePage: React.FC<{ config: AppConfig, channels: Channel[] }> = ({ config, channels }) => {
  const lang = config.language;
  const [time, setTime] = useState(new Date());
  
  // Logic for Background Live Video
  const lastId = getLastWatched();
  const backgroundChannel = channels.find(c => c.id === lastId) || channels[0];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="h-screen w-screen overflow-hidden bg-black relative flex flex-col">
        {/* Live Background Layer */}
        <div className="absolute inset-0 z-0">
             {backgroundChannel ? (
                 <VideoPlayer url={backgroundChannel.url} autoPlay={true} muted={true} className="w-full h-full object-cover opacity-80" />
             ) : (
                 <div className="w-full h-full bg-slate-900" />
             )}
        </div>
        
        {/* Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/80 z-10" />

        {/* Top Bar */}
        <div className="relative z-20 flex justify-between items-start p-10 md:p-14">
            {/* Branding */}
            <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                    <Tv size={32} className="text-black" strokeWidth={2.5} />
                 </div>
                 <div>
                     <h1 className="text-3xl font-bold text-white tracking-tight drop-shadow-lg">{config.appName}</h1>
                     <div className="flex items-center gap-2 mt-1">
                        <Wifi size={14} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Connected</span>
                     </div>
                 </div>
            </div>

            {/* Big Clock */}
            <div className="text-right">
                <div className="text-lg font-medium text-slate-300 drop-shadow-md mb-1">
                    {time.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
                <div className="text-7xl md:text-8xl font-black text-white leading-none tracking-tighter drop-shadow-2xl">
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
            </div>
        </div>

        {/* Bottom Dock Navigation */}
        <div className="mt-auto relative z-20 pb-12 md:pb-16 px-6">
            <div className="flex flex-wrap items-end justify-center gap-4 md:gap-6">
                <DockButton to="/live" icon={<Tv size={36} strokeWidth={1.5} />} label={t('liveTv', lang)} active={true} />
                <DockButton to="/vod" icon={<Film size={32} strokeWidth={1.5} />} label={t('vod', lang)} />
                <DockButton to="/vod?tab=series" icon={<Layers size={32} strokeWidth={1.5} />} label={t('series', lang)} />
                <DockButton to="/multiscreen" icon={<Grid3X3 size={32} strokeWidth={1.5} />} label={t('multiScreen', lang)} />
                <DockButton to="/admin" icon={<Settings size={32} strokeWidth={1.5} />} label={t('settings', lang)} />
                <DockButton to="#" icon={<Info size={32} strokeWidth={1.5} />} label={t('about', lang)} />
            </div>
        </div>
    </div>
  );
};

// --- Multi-Screen View ---

const MultiScreenPage: React.FC<{ channels: Channel[] }> = ({ channels }) => {
    const [screens, setScreens] = useState<(Channel | null)[]>([null, null, null, null]);
    const [selectingIndex, setSelectingIndex] = useState<number | null>(null);

    const handleSelectChannel = (channel: Channel) => {
        if (selectingIndex !== null) {
            const newScreens = [...screens];
            newScreens[selectingIndex] = channel;
            setScreens(newScreens);
            setSelectingIndex(null);
        }
    };

    return (
        <div className="h-screen bg-black flex flex-col">
            <div className="h-12 bg-slate-900 flex items-center justify-between px-4 border-b border-slate-800">
                <Link to="/" className="text-white hover:text-indigo-400 flex items-center gap-2"><ArrowLeft size={18}/> Back</Link>
                <span className="text-white font-bold">Multi-View (4-Split)</span>
                <div className="w-10"></div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1 p-1">
                {screens.map((channel, idx) => (
                    <div key={idx} className="relative bg-slate-900 border border-slate-800 rounded overflow-hidden group">
                        {channel ? (
                            <VideoPlayer url={channel.url} autoPlay={true} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                                <MonitorPlay size={48} className="opacity-20" />
                            </div>
                        )}
                        
                        {/* Overlay Controls */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                                onClick={() => setSelectingIndex(idx)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:scale-105 transition-transform"
                            >
                                {channel ? 'Change Channel' : 'Select Channel'}
                            </button>
                        </div>
                        {channel && (
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white pointer-events-none">
                                {channel.name}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Channel Selector Modal */}
            {selectingIndex !== null && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-2xl border border-slate-700 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="text-white font-bold">Select Channel for Screen {selectingIndex + 1}</h3>
                            <button onClick={() => setSelectingIndex(null)}><X className="text-white" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2">
                             {channels.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => handleSelectChannel(c)}
                                    className="w-full text-left p-3 hover:bg-indigo-600/20 hover:border-l-4 hover:border-indigo-500 border-l-4 border-transparent text-slate-300 hover:text-white transition-all flex items-center gap-3"
                                >
                                    {c.logo ? <img src={c.logo} className="w-6 h-6 rounded bg-black"/> : <Tv size={16}/>}
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Live TV Page (Enhanced) ---

const LiveTvPage: React.FC<{ channels: Channel[], config: AppConfig }> = ({ channels, config }) => {
    // Start with last watched or first channel
    const lastId = getLastWatched();
    const initialChannel = channels.find(c => c.id === lastId) || channels[0] || null;

    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(initialChannel);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('All');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [epgData, setEpgData] = useState<{current: string, next: string, progress: number} | null>(null);

    const lang = config.language;
    const theme = THEMES[config.theme];

    // Simulate EPG update on channel change and save last watched
    useEffect(() => {
        if(selectedChannel) {
            saveLastWatched(selectedChannel.id); // Save for dashboard background
            setEpgData(getMockEPG(selectedChannel.name));
            const interval = setInterval(() => {
                 setEpgData(getMockEPG(selectedChannel.name));
            }, 60000);
            return () => clearInterval(interval);
        }
    }, [selectedChannel]);

    const groups = ['All', ...Array.from(new Set(channels.map(c => c.group)))];
    const filtered = channels.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = selectedGroup === 'All' || c.group === selectedGroup;
        return matchesSearch && matchesGroup;
    });

    return (
        <div className="h-screen flex bg-black overflow-hidden relative">
            
            {/* Sidebar (Guide) */}
            <div className={`
                ${isSidebarOpen ? 'w-full md:w-96 translate-x-0' : '-translate-x-full md:w-0 md:-ml-0'} 
                absolute md:relative z-20 h-full bg-[#0b0f19] border-r border-white/5 flex flex-col transition-all duration-300 ease-in-out
            `}>
                <div className="p-4 bg-gradient-to-b from-[#111827] to-[#0b0f19] border-b border-white/5 space-y-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Link to="/" className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"><ArrowLeft size={20}/></Link>
                        <h2 className="text-lg font-bold text-white tracking-wide">Live TV</h2>
                     </div>
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={t('search', lang)} 
                            className="w-full bg-black/40 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-white/10 text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <div className="absolute left-3 top-3.5 text-slate-500"><Grid3X3 size={16}/></div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
                        {groups.map(g => (
                            <button 
                                key={g}
                                onClick={() => setSelectedGroup(g)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${selectedGroup === g ? `bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20` : 'bg-transparent text-slate-400 border-white/10 hover:border-white/30'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {filtered.map(c => (
                        <div 
                            key={c.id} 
                            onClick={() => { setSelectedChannel(c); if(window.innerWidth < 768) setSidebarOpen(false); }}
                            className={`group p-4 flex items-center gap-4 cursor-pointer border-b border-white/5 hover:bg-white/5 transition-all ${selectedChannel?.id === c.id ? 'bg-indigo-900/20' : ''}`}
                        >
                             <div className={`w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-indigo-500/50 transition-colors`}>
                                {c.logo ? <img src={c.logo} alt={c.name} className="w-8 h-8 object-contain"/> : <Tv size={20} className="text-slate-600"/>}
                             </div>
                             <div className="flex-1 min-w-0">
                                 <h4 className={`font-bold text-sm truncate ${selectedChannel?.id === c.id ? 'text-indigo-400' : 'text-slate-200'}`}>{c.name}</h4>
                                 <p className="text-[10px] text-slate-500 font-mono mt-1">10:00 AM - 11:30 AM • News</p>
                             </div>
                             {selectedChannel?.id === c.id && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Player Area */}
            <div className="flex-1 relative bg-black h-full flex flex-col">
                {selectedChannel ? (
                    <>
                        <VideoPlayer url={selectedChannel.url} autoPlay={true} className="w-full h-full" />
                        
                        {/* EPG Overlay (Bottom Strip) */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-20 pb-8 px-8 z-10 transition-transform duration-300 transform translate-y-full hover:translate-y-0 peer-hover:translate-y-0">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">Live</span>
                                        <h2 className="text-3xl font-bold text-white drop-shadow-md">{selectedChannel.name}</h2>
                                    </div>
                                    <div className="flex items-center gap-8 text-slate-300">
                                        <div>
                                            <p className="text-xs uppercase text-slate-500 font-bold mb-1">Now Playing</p>
                                            <p className="text-white font-medium text-lg">{epgData?.current || "Unknown Program"}</p>
                                        </div>
                                        <div className="w-px h-8 bg-white/20"></div>
                                        <div className="opacity-60">
                                            <p className="text-xs uppercase text-slate-500 font-bold mb-1">Up Next</p>
                                            <p className="text-white font-medium text-lg">{epgData?.next || "Upcoming Show"}</p>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="w-full max-w-xl h-1 bg-white/20 rounded-full mt-4 overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${epgData?.progress || 30}%` }}></div>
                                    </div>
                                </div>
                                <div className="text-right">
                                     <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors text-white">
                                        <Menu size={24}/>
                                     </button>
                                </div>
                            </div>
                        </div>
                        
                        {/* Invisible Hover Trigger for EPG */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 z-0 peer" />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 space-y-4">
                        <MonitorPlay size={64} className="opacity-20" />
                        <p className="text-lg">Select a channel to start streaming</p>
                    </div>
                )}
                
                {/* Mobile Toggle Button (Visible only when sidebar is closed) */}
                {!isSidebarOpen && (
                     <button 
                        onClick={() => setSidebarOpen(true)} 
                        className="absolute top-4 left-4 z-30 p-3 bg-black/60 backdrop-blur rounded-full text-white border border-white/10"
                    >
                        <Menu size={24} />
                    </button>
                )}
            </div>
        </div>
    );
};

// --- VOD Page (Netflix Style) ---

const VodPage: React.FC<{ movies: Movie[], config: AppConfig }> = ({ movies, config }) => {
    const query = new URLSearchParams(useLocation().search);
    const playId = query.get('play');
    const playingMovie = movies.find(m => m.id === playId);
    
    // Featured movie is the last one added (mock logic)
    const featured = movies[movies.length - 1];

    if (playingMovie) {
        return (
            <div className="fixed inset-0 z-50 bg-black">
                 <VideoPlayer url={playingMovie.url} autoPlay={true} className="w-full h-full" />
                 <Link to="/vod" className="absolute top-4 left-4 bg-black/50 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-50">
                    <ArrowLeft size={24} />
                 </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1115] text-white pb-20">
            {/* Hero Section */}
            {featured && (
                <div className="relative h-[70vh] w-full">
                    <div className="absolute inset-0">
                        <img src={featured.backdrop} className="w-full h-full object-cover" alt="Hero"/>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1115] via-[#0f1115]/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1115] via-[#0f1115]/60 to-transparent" />
                    </div>
                    
                    <div className="absolute bottom-0 left-0 p-8 md:p-16 max-w-3xl">
                        <div className="flex items-center gap-2 mb-4">
                             <span className="px-2 py-1 bg-red-600 rounded text-[10px] font-bold uppercase tracking-wider">Top 10</span>
                             <span className="text-sm font-bold text-emerald-400">98% Match</span>
                             <span className="text-sm text-slate-300">{featured.year}</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">{featured.title}</h1>
                        <p className="text-lg text-slate-300 mb-8 line-clamp-3">{featured.description}</p>
                        <div className="flex gap-4">
                            <Link to={`/vod?play=${featured.id}`} className="px-8 py-3 bg-white text-black font-bold rounded-lg hover:bg-indigo-50 transition-colors flex items-center gap-2">
                                <Play fill="currentColor" size={20}/> Play
                            </Link>
                            <button className="px-8 py-3 bg-white/20 backdrop-blur-md text-white font-bold rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2">
                                <Info size={20}/> More Info
                            </button>
                        </div>
                    </div>
                    
                    <div className="absolute top-0 w-full p-6 flex justify-between items-center z-10">
                        <Link to="/" className="text-white/70 hover:text-white transition-colors flex items-center gap-2 font-bold">
                            <ArrowLeft size={20}/> Dashboard
                        </Link>
                        <div className="flex items-center gap-4">
                            <img src="https://ui-avatars.com/api/?name=User&background=random" className="w-8 h-8 rounded-lg" alt="Profile"/>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Rows */}
            <div className="px-6 md:px-12 -mt-20 relative z-10 space-y-12">
                
                {/* Continue Watching Mock */}
                <section>
                    <h3 className="text-xl font-bold mb-4 text-white/90">Continue Watching</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {movies.slice(0,3).map(m => (
                             <div key={m.id} className="relative w-64 aspect-video shrink-0 rounded-lg overflow-hidden border border-white/10 group cursor-pointer hover:ring-2 ring-indigo-500 transition-all">
                                <img src={m.backdrop} className="w-full h-full object-cover opacity-80 group-hover:opacity-100"/>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="p-3 bg-white/20 backdrop-blur rounded-full"><Play fill="white" size={20}/></div>
                                </div>
                                <div className="absolute bottom-0 w-full h-1 bg-gray-700">
                                    <div className="h-full bg-red-600 w-1/2"></div>
                                </div>
                             </div>
                        ))}
                    </div>
                </section>

                {/* Trending Movies */}
                <section>
                    <h3 className="text-xl font-bold mb-4 text-white/90">Trending Now</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {movies.map(m => (
                            <Link key={m.id} to={`/vod?play=${m.id}`} className="group relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:z-10 bg-slate-800">
                                <img src={m.poster} className="w-full h-full object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                     <h4 className="font-bold text-sm text-center mb-1">{m.title}</h4>
                                     <p className="text-[10px] text-center text-green-400">{m.rating} Rating</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

// --- Main App Entry ---

export default function App() {
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  const [channels, setChannels] = useState<Channel[]>(getChannels());
  const [movies, setMovies] = useState<Movie[]>(getMovies());
  const [subscription, setSubscription] = useState(getSubscriptionStatus());

  useEffect(() => {
    initFirebase();
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
        setConfig(getAppConfig());
        setChannels(getChannels());
        setMovies(getMovies());
        setSubscription(getSubscriptionStatus());
    };
    window.addEventListener('config-updated', handleUpdate);
    return () => window.removeEventListener('config-updated', handleUpdate);
  }, []);

  const dir = isRTL(config.language) ? 'rtl' : 'ltr';
  const activeTheme = THEMES[config.theme];

  return (
    <Router>
        <div className={`min-h-screen font-sans selection:bg-indigo-500/30 ${activeTheme.bg} ${activeTheme.bg.includes('url') ? 'bg-cover bg-center' : ''}`} dir={dir}>
             <SplashScreen />
             
             <div className="relative z-0">
                <Routes>
                    <Route path="/admin" element={<AdminPanel />} />
                    
                    {/* Protected Routes */}
                    <Route path="*" element={
                        (config.requireSubscription && !subscription.active) ? (
                            <LockScreen config={config} />
                        ) : (
                            <Routes>
                                <Route path="/" element={<HomePage config={config} channels={channels} />} />
                                <Route path="/live" element={<LiveTvPage channels={channels} config={config} />} />
                                <Route path="/vod" element={<VodPage movies={movies} config={config} />} />
                                <Route path="/multiscreen" element={<MultiScreenPage channels={channels} />} />
                            </Routes>
                        )
                    } />
                </Routes>
             </div>
        </div>
    </Router>
  );
}