
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Tv, Film, Settings, Home, Layers, Video, Search, Lock, User, Info, Wifi, Play, Grid, Heart, Star, Calendar, X, ChevronLeft, ChevronRight, Clock, Power, Activity, Cloud, Monitor, Sun } from 'lucide-react';
import { 
    getAppConfig, getChannels, getMovies, t, isRTL, THEMES, 
    getDeviceId, getLastWatched, addToWatchHistory, getWatchHistory, saveLastWatched
} from './services/store';
import { initFirebase, registerDevice, subscribeToUserStatus } from './services/firebase';
import { AppConfig, Channel, Movie, Customer, HistoryItem } from './types';
import VideoPlayer from './components/VideoPlayer';
import { AdminPanel } from './components/AdminPanel';

// --- Splash Screen ---
const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
    useEffect(() => {
        const t = setTimeout(onFinish, 4000); 
        return () => clearTimeout(t);
    }, [onFinish]);

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center font-[Outfit]">
            <div className="animate-zoom-in flex flex-col items-center">
                 {/* Logo Graphic Simulation */}
                 <div className="relative mb-6">
                     <div className="flex items-center">
                         {/* Stylized K */}
                         <div className="relative">
                            <div className="absolute -top-6 -right-6 text-[#d4af37] animate-ping opacity-50"><Wifi size={40}/></div>
                            <span className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400" style={{lineHeight: 0.8}}>K</span>
                         </div>
                         {/* Play Icon */}
                         <div className="relative ml-2">
                            <div className="w-20 h-20 bg-[#d4af37] rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-[#d4af37]/20">
                                <Play fill="black" className="text-black w-10 h-10 ml-1" />
                            </div>
                         </div>
                     </div>
                 </div>
                 
                 {/* Text */}
                 <div className="text-center">
                     <h1 className="text-5xl font-black tracking-tighter text-white mb-1">
                         KURD <span className="text-[#d4af37]">4K</span>
                     </h1>
                     <p className="text-[#d4af37]/60 text-sm font-bold tracking-[0.5em] uppercase animate-pulse">Premium Experience</p>
                 </div>
            </div>
            
            {/* Progress Bar */}
            <style>{`
                @keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
                .progress-anim { animation: progress 3.5s cubic-bezier(0.2, 0, 0, 1) forwards; transform-origin: left; }
            `}</style>
             <div className="absolute bottom-10 w-64 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-[#d4af37] w-full progress-anim"></div>
            </div>
        </div>
    );
};

// --- Ultra GlassOS Components ---

const GlassOSStatusBar: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    
    return (
        <div className="absolute top-0 left-0 right-0 p-6 md:p-8 z-40 flex justify-between items-start pointer-events-none fade-in-down">
            {/* Left: Weather/Status Widget */}
            <div className="glass-panel px-5 py-3 rounded-full flex items-center gap-4 pointer-events-auto transform hover:scale-105 transition-transform duration-300">
                <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                     <Sun className="text-yellow-400" size={20} />
                     <span className="text-sm font-medium">24°C</span>
                </div>
                <div className="flex items-center gap-2">
                     <Wifi size={16} className="text-green-400" />
                     <span className="text-xs font-medium text-slate-300">Connected</span>
                </div>
            </div>
            
            {/* Right: Big Digital Clock */}
            <div className="flex flex-col items-end pointer-events-auto">
                <h2 className="text-5xl md:text-7xl font-light text-white font-[Outfit] tracking-tighter leading-none drop-shadow-2xl">
                    {time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}
                </h2>
                <div className="flex items-center gap-2 text-sm uppercase tracking-widest text-slate-300 font-medium mt-1">
                    <Calendar size={12} className="text-[#d4af37]" />
                    {time.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                </div>
            </div>
        </div>
    );
};

const GlassDock: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const menuItems = [
        { id: 'about', label: 'About Us', icon: Info, route: '/about' },
        { id: 'vod', label: 'Movies', icon: Film, route: '/vod?type=movie' },
        { id: 'live', label: 'Live', icon: Tv, route: '/live' }, // Index 2
        { id: 'series', label: 'Series', icon: Layers, route: '/vod?type=series' },
        { id: 'settings', label: 'Settings', icon: Settings, route: '/admin' },
    ];

    // Default focus to index 2 (Live)
    const [focusedIndex, setFocusedIndex] = useState(2);

    // Keyboard Navigation Logic
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight') {
                setFocusedIndex(prev => Math.min(prev + 1, menuItems.length - 1));
            } else if (e.key === 'ArrowLeft') {
                setFocusedIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'Enter') {
                // Navigate to the focused item's route
                navigate(menuItems[focusedIndex].route);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [focusedIndex, menuItems, navigate]);

    return (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="glass-dock px-6 py-4 rounded-[2rem] flex items-center gap-4 md:gap-8 hover:px-8 transition-all duration-500 ease-out">
                {menuItems.map((item, index) => {
                    const isRouteActive = location.pathname === item.route || (item.route !== '/' && location.pathname.startsWith(item.route));
                    const isFocused = index === focusedIndex;
                    const isActive = isRouteActive || isFocused;

                    return (
                        <div 
                            key={item.id} 
                            onClick={() => { setFocusedIndex(index); navigate(item.route); }}
                            onMouseEnter={() => setFocusedIndex(index)}
                            className={`group cursor-pointer flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? '-translate-y-4' : 'hover:-translate-y-2'}`}
                        >
                            <div className={`p-3 md:p-4 rounded-full transition-all duration-300 border-2 ${isActive ? 'bg-white text-black border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.5)] scale-110' : 'bg-white/5 text-white border-transparent hover:bg-white/20'}`}>
                                <item.icon size={24} className="md:w-6 md:h-6" strokeWidth={isActive ? 2.5 : 1.5} />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider transition-opacity duration-300 ${isActive ? 'opacity-100 text-white' : 'opacity-0 text-slate-400'}`}>
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- About Page ---

const AboutPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="relative h-[100dvh] w-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center p-8 font-[Outfit]">
             {/* Background */}
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-black z-0"></div>
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
             
             <div className="z-10 bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/10 max-w-2xl w-full text-center shadow-2xl animate-zoom-in relative overflow-hidden">
                 <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#d4af37]/30 blur-3xl rounded-full"></div>
                 <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/30 blur-3xl rounded-full"></div>
                 
                 <h1 className="text-5xl font-black mb-2 text-white">KURD <span className="text-[#d4af37]">4K</span></h1>
                 <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-8">Premium Streaming Platform</p>
                 
                 <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                     Experience the future of television. <br/>
                     Unlimited access to Live TV channels, the latest movies, and binge-worthy series in stunning 4K quality.
                 </p>
                 
                 <div className="flex flex-col gap-2 text-sm text-slate-500 font-mono mb-8 border-t border-b border-white/10 py-4">
                     <p>App Version: 2.1.0 (Ultra Glass)</p>
                     <p>Device ID: {getDeviceId()}</p>
                     <p>Support: info@kurd24.tv</p>
                 </div>
                 
                 <button onClick={() => navigate('/')} className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                     Back to Dashboard
                 </button>
             </div>
             
             <GlassDock />
        </div>
    );
};

// --- Dashboard (GlassOS) ---

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const channels = getChannels();
    const [bgVideo, setBgVideo] = useState<string>('');
    
    useEffect(() => {
        const lastId = getLastWatched();
        if (lastId) {
            const ch = channels.find(c => c.id === lastId);
            if (ch) setBgVideo(ch.url);
        } else if (channels.length > 0) {
            setBgVideo(channels[0].url);
        } else {
            // Default safe background video (HLS)
            setBgVideo('https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8');
        }
    }, [channels]);

    return (
        <div className="relative h-[100dvh] w-screen overflow-hidden bg-black text-white zoom-in">
            {/* Live Background Layer */}
            <div className="absolute inset-0 z-0">
                {bgVideo && (
                    <VideoPlayer 
                        url={bgVideo} 
                        muted={true} 
                        autoPlay={true} 
                        className="w-full h-full object-cover scale-105" 
                    />
                )}
                {/* Cinematic Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
            </div>

            <GlassOSStatusBar />

            {/* Logo KURD 4K (Bottom Right) */}
            <div className="absolute bottom-8 right-8 z-30 pointer-events-none hidden md:block">
                 <h1 className="text-5xl font-black tracking-tighter text-white/50 font-[Outfit] select-none">
                     KURD <span className="text-[#d4af37]">4K</span>
                 </h1>
            </div>

            <GlassDock />
        </div>
    );
};

// --- Live TV (Immersive Overlay) ---

const LiveTvPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const channels = getChannels();
    const queryParams = new URLSearchParams(location.search);
    const initialChannelId = queryParams.get('channel');
    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('All');
    
    // UI Visibility State - Default FALSE (Hidden)
    const [isUiVisible, setIsUiVisible] = useState(false);
    const inactivityTimeoutRef = useRef<any>(null);

    // Initial load
    useEffect(() => {
        if (channels.length === 0) return;
        if (initialChannelId) {
            const found = channels.find(c => c.id === initialChannelId);
            if (found) setSelectedChannel(found);
            return;
        }
        const lastId = getLastWatched();
        const last = channels.find(c => c.id === lastId);
        if (last) setSelectedChannel(last);
        else setSelectedChannel(channels[0]);
        
        // Temporarily show UI to confirm channel load, then hide
        setIsUiVisible(true);
        resetInactivityTimer();
    }, [initialChannelId, channels]);

    // Save history
    useEffect(() => {
        if (selectedChannel) {
            saveLastWatched(selectedChannel.id);
            addToWatchHistory({ id: selectedChannel.id, type: 'channel', title: selectedChannel.name, image: selectedChannel.logo, url: selectedChannel.url });
        }
    }, [selectedChannel]);

    // Filtering
    const groups = ['All', ...Array.from(new Set(channels.map(c => c.group || 'General')))];
    const filteredChannels = channels.filter(c => {
        const term = searchTerm.toLowerCase();
        const matchSearch = c.name.toLowerCase().includes(term) || (c.group && c.group.toLowerCase().includes(term));
        const matchGroup = selectedGroup === 'All' || c.group === selectedGroup;
        return matchSearch && matchGroup;
    });

    // Auto Hide Logic (3 seconds)
    const resetInactivityTimer = () => {
        if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = setTimeout(() => {
            setIsUiVisible(false);
        }, 3000);
    };

    // Interaction Handler
    const handleInteraction = () => {
        setIsUiVisible(true);
        resetInactivityTimer();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Show UI on Enter or Space
            if (e.key === 'Enter' || e.key === ' ') {
                handleInteraction();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('click', handleInteraction);
        window.addEventListener('touchstart', handleInteraction);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
            if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        };
    }, []);

    return (
        <div className="relative h-[100dvh] bg-black overflow-hidden group">
            
            {/* Full Screen Player */}
            {/* When UI is visible on desktop, shift player slightly right. Mobile stays full width. */}
            <div className={`absolute inset-0 z-0 transition-all duration-500 ease-in-out ${isUiVisible ? 'md:pl-96' : 'pl-0'}`}>
                {selectedChannel ? (
                    <VideoPlayer 
                        key={selectedChannel.id} 
                        url={selectedChannel.url} 
                        autoPlay={true} 
                        className="w-full h-full object-contain bg-black"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-500">Select a channel</div>
                )}
            </div>

            {/* Top Info Bar (Overlay) - Shows Channel Info for 3s */}
            <div className={`absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/90 to-transparent z-20 transition-all duration-500 ${isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
                 <div className={`flex justify-between items-start transition-all duration-500 ${isUiVisible ? 'md:ml-96' : 'ml-0'}`}>
                     <div>
                         {/* Home Button in Overlay */}
                         <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white mb-4 transition-colors border border-white/10">
                             <Home size={18} /> <span className="font-bold text-sm">HOME</span>
                         </button>

                         <div className="flex items-center gap-4">
                            {selectedChannel?.logo && <img src={selectedChannel.logo} className="h-16 w-auto object-contain bg-black/20 rounded p-1" />}
                            <div>
                                <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg">{selectedChannel?.name || 'Loading...'}</h1>
                                <div className="flex items-center gap-2 text-[#d4af37] font-bold text-sm mt-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> LIVE
                                    <span className="text-slate-400 px-2 border-l border-slate-600">{selectedChannel?.group}</span>
                                </div>
                            </div>
                         </div>
                     </div>
                     <div className="text-right hidden md:block">
                         <h2 className="text-4xl font-light text-white font-[Outfit]">
                             {new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}
                         </h2>
                     </div>
                 </div>
            </div>

            {/* Left Sidebar Channel List (Glass Overlay) - Hidden by default */}
            <div className={`absolute left-0 top-0 bottom-0 w-80 md:w-96 bg-black/40 backdrop-filter backdrop-blur-xl border-r border-white/5 z-30 transition-all duration-500 ${isUiVisible ? 'translate-x-0' : '-translate-x-full'}`}>
                 <div className="flex flex-col h-full p-4">
                     {/* Search */}
                     <div className="relative mb-4">
                         <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                         <input 
                             type="text" 
                             placeholder="Find channel..." 
                             value={searchTerm}
                             onChange={e => { setSearchTerm(e.target.value); resetInactivityTimer(); }}
                             className="w-full bg-white/10 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:bg-white/20"
                         />
                     </div>
                     
                     {/* Groups */}
                     <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                         {groups.map(g => (
                             <button 
                                 key={g} 
                                 onClick={() => { setSelectedGroup(g); resetInactivityTimer(); }}
                                 className={`px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap border ${selectedGroup === g ? 'bg-white text-black border-white' : 'bg-transparent text-slate-300 border-white/20 hover:border-white'}`}
                             >
                                 {g}
                             </button>
                         ))}
                     </div>

                     {/* List */}
                     <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1" onScroll={resetInactivityTimer}>
                         {filteredChannels.map(ch => (
                             <button 
                                 key={ch.id}
                                 onClick={() => { setSelectedChannel(ch); resetInactivityTimer(); }}
                                 className={`w-full flex items-center gap-3 p-3 rounded-xl border border-transparent transition-all ${selectedChannel?.id === ch.id ? 'bg-[#d4af37] text-black shadow-lg' : 'hover:bg-white/10 text-slate-200'}`}
                             >
                                 <div className="w-8 h-8 rounded bg-black/20 flex items-center justify-center p-1">
                                     {ch.logo ? <img src={ch.logo} className="w-full h-full object-contain" /> : <Tv size={14}/>}
                                 </div>
                                 <div className="flex-1 text-left truncate">
                                     <div className="font-bold text-sm truncate">{ch.name}</div>
                                     <div className={`text-[10px] ${selectedChannel?.id === ch.id ? 'text-black/70' : 'text-slate-500'}`}>{ch.group}</div>
                                 </div>
                             </button>
                         ))}
                     </div>
                 </div>
            </div>
        </div>
    );
};

// --- VOD (Cinema Mode) ---

const VodPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const contentType = new URLSearchParams(location.search).get('type') === 'series' ? 'series' : 'movie';
    const movies = getMovies().filter(m => m.type === contentType);
    const featured = movies[0];
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    return (
        <div className="relative min-h-screen bg-[#050505] text-white font-[Outfit]">
            <GlassDock /> {/* Always visible dock */}

            {/* Sidebar Navigation */}
            <div className="fixed left-0 top-0 bottom-0 w-20 z-50 flex flex-col items-center py-8 glass-panel border-r border-white/5 bg-black/50">
                 <div className="w-10 h-10 bg-[#d4af37] rounded-lg flex items-center justify-center font-bold text-black mb-10">K</div>
                 <div className="flex flex-col gap-6">
                     <Link to="/" className="p-3 text-slate-500 hover:text-white transition-colors"><Home size={24} /></Link>
                     <Link to="/vod?type=movie" className={`p-3 rounded-xl transition-all ${contentType === 'movie' ? 'bg-white/10 text-[#d4af37]' : 'text-slate-500 hover:text-white'}`}><Film size={24} /></Link>
                     <Link to="/vod?type=series" className={`p-3 rounded-xl transition-all ${contentType === 'series' ? 'bg-white/10 text-[#d4af37]' : 'text-slate-500 hover:text-white'}`}><Layers size={24} /></Link>
                 </div>
            </div>

            <div className="pl-20">
                {/* Hero Section */}
                {featured && (
                    <div className="relative w-full h-[80vh]">
                        <div className="absolute inset-0">
                            <img src={featured.backdrop || featured.poster} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 p-16 max-w-3xl slide-in-right">
                             <div className="flex gap-2 mb-4">
                                 {featured.genre.map(g => <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider">{g}</span>)}
                             </div>
                             <h1 className="text-7xl font-black mb-4 leading-none">{featured.title}</h1>
                             <div className="flex items-center gap-4 text-lg text-slate-300 mb-6">
                                 <span className="text-[#d4af37] font-bold flex items-center gap-1"><Star fill="currentColor" size={18}/> {featured.rating}</span>
                                 <span>{featured.year}</span>
                                 <span className="px-2 border border-slate-500 rounded text-xs">HD</span>
                             </div>
                             <p className="text-xl text-slate-300 line-clamp-3 mb-8">{featured.description}</p>
                             <div className="flex gap-4">
                                 <button onClick={() => setSelectedMovie(featured)} className="px-8 py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2 text-lg">
                                     <Play fill="black" size={20} /> Play Now
                                 </button>
                                 <button className="px-8 py-4 bg-white/10 backdrop-blur text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/10">
                                     More Info
                                 </button>
                             </div>
                        </div>
                    </div>
                )}

                {/* Grid Section */}
                <div className="px-16 pb-32 -mt-20 relative z-10">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2"><Grid size={20} className="text-[#d4af37]" /> Popular Now</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {movies.map(m => (
                            <button 
                                key={m.id}
                                onClick={() => setSelectedMovie(m)}
                                className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-slate-900 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/5 hover:border-[#d4af37]/50"
                            >
                                <img src={m.poster} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                    <h3 className="font-bold text-lg leading-tight">{m.title}</h3>
                                    <div className="flex justify-between items-center mt-2 text-xs text-slate-400">
                                        <span>{m.year}</span>
                                        <span className="text-[#d4af37] flex items-center gap-1"><Star size={10} fill="currentColor"/> {m.rating}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            {selectedMovie && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-8 animate-fade-in-down">
                    <div className="bg-[#121212] w-full max-w-5xl h-[80vh] rounded-3xl overflow-hidden flex relative border border-white/10 shadow-2xl">
                        <button onClick={() => setSelectedMovie(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-red-500 rounded-full transition-colors z-20"><X size={24} /></button>
                        <div className="w-1/3 relative">
                            <img src={selectedMovie.poster} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#121212]"></div>
                        </div>
                        <div className="flex-1 p-12 flex flex-col justify-center">
                            <h2 className="text-5xl font-black mb-4">{selectedMovie.title}</h2>
                            <div className="flex gap-4 text-sm font-bold text-slate-400 mb-6">
                                <span className="text-[#d4af37]">{selectedMovie.rating} IMDb</span>
                                <span>{selectedMovie.year}</span>
                                <span>{selectedMovie.genre.join(' • ')}</span>
                            </div>
                            <p className="text-xl text-slate-300 leading-relaxed mb-10">{selectedMovie.description}</p>
                            <button onClick={() => window.open(selectedMovie.url, '_blank')} className="w-fit px-10 py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:bg-white transition-colors flex items-center gap-3 text-lg">
                                <Play fill="black" size={24} /> Watch Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App ---

const App: React.FC = () => {
    const [showSplash, setShowSplash] = useState(true);

    if (showSplash) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/live" element={<LiveTvPage />} />
                <Route path="/vod" element={<VodPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
