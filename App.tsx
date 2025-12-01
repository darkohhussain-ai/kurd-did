
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Tv, Film, Settings, Home, Layers, Video, Search, Lock, User, Info, Wifi, Play, Grid, Heart, Star, Calendar, X, ChevronLeft, ChevronRight, Clock, Power, Activity } from 'lucide-react';
import { 
    getAppConfig, getChannels, getMovies, t, isRTL, THEMES, 
    getDeviceId, getLastWatched, addToWatchHistory, getWatchHistory, saveLastWatched
} from './services/store';
import { initFirebase, registerDevice, subscribeToUserStatus } from './services/firebase';
import { AppConfig, Channel, Movie, Customer, HistoryItem } from './types';
import VideoPlayer from './components/VideoPlayer';
import { AdminPanel } from './components/AdminPanel';

// --- Components ---

const OmidTopBar: React.FC = () => {
    const [time, setTime] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
    
    return (
        <div className="absolute top-0 left-0 right-0 p-4 md:p-8 z-40 flex justify-between items-start pointer-events-none">
            {/* Left: Logo */}
            <div className="flex items-center gap-2 md:gap-4 pointer-events-auto bg-black/40 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/10">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-[#d4af37] rounded-full flex items-center justify-center shadow-lg shadow-[#d4af37]/50">
                    <Tv className="text-black" size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-lg md:text-2xl font-black text-white tracking-tight">Kurd24</span>
                    <span className="text-[8px] md:text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">Luxury TV</span>
                </div>
            </div>
            
            {/* Right: Big Clock */}
            <div className="flex flex-col items-end pointer-events-auto text-right">
                <div className="flex items-baseline gap-2">
                    <span className="text-xs md:text-sm font-bold text-[#d4af37] uppercase tracking-widest hidden md:inline">
                        {time.toLocaleDateString('en-US', { weekday: 'long' })}
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg font-mono leading-none">
                        {time.toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: false})}
                    </h2>
                </div>
                <p className="text-xs md:text-lg text-slate-200 font-medium">
                    {time.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
            </div>
        </div>
    );
};

// --- Dashboard (Omid Style) ---

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const config = getAppConfig();
    const theme = THEMES[config.theme] || THEMES['goat'];
    const channels = getChannels();
    const history = getWatchHistory();

    // Background Video Logic
    const [bgVideo, setBgVideo] = useState<string>('');
    
    useEffect(() => {
        const lastId = getLastWatched();
        if (lastId) {
            const ch = channels.find(c => c.id === lastId);
            if (ch) setBgVideo(ch.url);
        } else if (channels.length > 0) {
            setBgVideo(channels[0].url);
        } else {
            setBgVideo('http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4');
        }
    }, [channels]);

    const menuItems = [
        { id: 'live', label: 'IPTV', icon: Tv, route: '/live', color: 'from-blue-900/80 to-slate-900/80' },
        { id: 'vod', label: 'Movies', icon: Film, route: '/vod?type=movie', color: 'from-purple-900/80 to-slate-900/80' },
        { id: 'series', label: 'Series', icon: Layers, route: '/vod?type=series', color: 'from-red-900/80 to-slate-900/80' },
        { id: 'admin', label: 'Settings', icon: Settings, route: '/admin', color: 'from-slate-800/80 to-black/80' },
    ];

    return (
        <div className={`relative h-[100dvh] w-screen overflow-hidden ${theme.bg} text-white`}>
            {/* Live Background */}
            <div className="absolute inset-0 z-0">
                {bgVideo && (
                    <VideoPlayer 
                        url={bgVideo} 
                        muted={true} 
                        autoPlay={true} 
                        className="w-full h-full object-cover opacity-50" 
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
            </div>

            <OmidTopBar />

            {/* Main Content Area */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end pb-6 px-4 md:pb-10 md:px-12">
                
                {/* Recently Watched Row */}
                {history.length > 0 && (
                    <div className="mb-4 md:mb-8 animate-slide-up">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={16} className="text-[#d4af37]"/>
                            <h3 className="text-xs md:text-sm font-bold text-slate-300 uppercase tracking-wider">Continue Watching</h3>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {history.slice(0, 6).map((item) => (
                                <button 
                                    key={item.id}
                                    onClick={() => navigate(item.type === 'channel' ? `/live?channel=${item.id}` : `/vod?play=${item.id}`)}
                                    className="flex-shrink-0 w-32 h-20 md:w-48 md:h-28 rounded-xl bg-slate-800/80 border border-[#d4af37]/30 hover:border-[#d4af37] hover:scale-105 transition-all overflow-hidden relative group"
                                >
                                    <img src={item.image || 'https://via.placeholder.com/200x100?text=No+Image'} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" alt={item.title} />
                                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                                        <p className="text-[10px] md:text-xs font-bold text-white truncate">{item.title}</p>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-[#d4af37] rounded-full p-2"><Play size={12} fill="black" /></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bottom Dock Menu - Luxury Style */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
                    {menuItems.map((item) => (
                        <Link 
                            key={item.id} 
                            to={item.route}
                            className={`group relative h-28 md:h-40 rounded-2xl md:rounded-3xl overflow-hidden border border-[#d4af37]/20 backdrop-blur-xl bg-gradient-to-br ${item.color} shadow-2xl hover:shadow-[#d4af37]/20 hover:scale-105 active:scale-95 transition-all duration-300 flex flex-col items-center justify-center gap-2 md:gap-4`}
                        >
                            <div className="p-3 md:p-4 bg-white/5 rounded-full group-hover:bg-[#d4af37] transition-colors duration-300">
                                <item.icon size={32} className="md:w-12 md:h-12 text-[#d4af37] group-hover:text-black drop-shadow-md transition-colors duration-300" />
                            </div>
                            <span className="text-sm md:text-xl font-bold tracking-wide text-white group-hover:text-[#d4af37] transition-colors drop-shadow-md">{item.label}</span>
                            
                            {/* Shine Effect */}
                            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-[#d4af37]/20 to-transparent skew-x-12 group-hover:left-[100%] transition-all duration-1000 ease-in-out"></div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Live TV Page ---

const LiveTvPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const channels = getChannels();
    
    // Parse ?channel=ID from URL
    const queryParams = new URLSearchParams(location.search);
    const initialChannelId = queryParams.get('channel');

    const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGroup, setSelectedGroup] = useState<string>('All');

    // Load initial channel or default
    useEffect(() => {
        if (channels.length === 0) return;
        
        if (initialChannelId) {
            const found = channels.find(c => c.id === initialChannelId);
            if (found) {
                setSelectedChannel(found);
                return;
            }
        }
        
        // If no specific channel, try last watched
        const lastId = getLastWatched();
        const last = channels.find(c => c.id === lastId);
        if (last) setSelectedChannel(last);
        else setSelectedChannel(channels[0]);
    }, [initialChannelId, channels]);

    // Save history when channel changes
    useEffect(() => {
        if (selectedChannel) {
            saveLastWatched(selectedChannel.id);
            addToWatchHistory({
                id: selectedChannel.id,
                type: 'channel',
                title: selectedChannel.name,
                image: selectedChannel.logo,
                url: selectedChannel.url,
            });
        }
    }, [selectedChannel]);

    // Filtering
    const groups = ['All', ...Array.from(new Set(channels.map(c => c.group || 'Uncategorized')))];
    const filteredChannels = channels.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchGroup = selectedGroup === 'All' || c.group === selectedGroup;
        return matchSearch && matchGroup;
    });

    return (
        <div className="h-[100dvh] flex flex-col md:flex-row bg-black overflow-hidden">
            {/* Sidebar (Channel List) - Bottom on Mobile, Left on Desktop */}
            <div className="w-full md:w-96 h-1/2 md:h-full order-2 md:order-1 bg-neutral-900 border-t md:border-r border-[#d4af37]/20 flex flex-col z-20 shadow-2xl">
                <div className="p-4 bg-neutral-900 border-b border-[#d4af37]/20">
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-neutral-800 rounded-lg"><ChevronLeft className="text-[#d4af37]"/></button>
                        <h1 className="text-xl font-bold text-white">Live TV</h1>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-neutral-500" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-neutral-800 text-white rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
                        />
                    </div>
                    <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-2">
                        {groups.map(g => (
                            <button 
                                key={g} 
                                onClick={() => setSelectedGroup(g)}
                                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${selectedGroup === g ? 'bg-[#d4af37] text-black' : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'}`}
                            >
                                {g}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {filteredChannels.map(channel => (
                        <button
                            key={channel.id}
                            onClick={() => setSelectedChannel(channel)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedChannel?.id === channel.id ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/30' : 'text-neutral-400 hover:bg-neutral-800'}`}
                        >
                            <div className="w-10 h-10 rounded-lg bg-black/40 flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5">
                                {channel.logo ? <img src={channel.logo} alt="" className="w-full h-full object-contain" /> : <Tv size={18} />}
                            </div>
                            <div className="flex-1 text-left overflow-hidden">
                                <p className="font-bold truncate text-sm">{channel.name}</p>
                                <p className="text-[10px] opacity-70 truncate">{channel.group}</p>
                            </div>
                            {selectedChannel?.id === channel.id && <Activity size={16} className="text-black animate-pulse" />}
                        </button>
                    ))}
                    {filteredChannels.length === 0 && <div className="p-8 text-center text-neutral-500">No channels found</div>}
                </div>
            </div>

            {/* Main Player Area - Top on Mobile, Right on Desktop */}
            <div className="w-full md:flex-1 h-1/2 md:h-full order-1 md:order-2 relative bg-black flex flex-col">
                {selectedChannel ? (
                    <>
                        <div className="flex-1 relative group bg-black">
                            <VideoPlayer 
                                key={selectedChannel.id} // Force remount on change
                                url={selectedChannel.url} 
                                autoPlay={true} 
                                className="w-full h-full"
                            />
                            
                            {/* Overlay Info */}
                            <div className="absolute top-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                <h2 className="text-xl md:text-3xl font-bold text-white drop-shadow-md">{selectedChannel.name}</h2>
                                <p className="text-[#d4af37] font-medium text-sm">{selectedChannel.group}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
                        <Tv size={64} className="mb-4 opacity-20" />
                        <p>Select a channel to start watching</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- VOD Page (Movies & Series) ---

const VodPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const contentType = (queryParams.get('type') || 'movie') as 'movie' | 'series';
    const playId = queryParams.get('play');

    const movies = getMovies();
    const filteredContent = movies.filter(m => m.type === contentType);
    
    // Feature the first item
    const featured = filteredContent[0] || movies[0];

    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    // Deep link logic
    useEffect(() => {
        if (playId) {
            const found = movies.find(m => m.id === playId);
            if (found) setSelectedMovie(found);
        }
    }, [playId, movies]);

    const handlePlay = (movie: Movie) => {
        // Save history
        addToWatchHistory({
            id: movie.id,
            type: 'movie',
            title: movie.title,
            image: movie.poster,
            url: movie.url,
        });
        window.open(movie.url, '_blank');
    };

    return (
        <div className="h-[100dvh] bg-[#0f1014] text-white flex overflow-hidden">
            {/* Sidebar - Icons only on Mobile, Expandable on Desktop */}
            <div className="w-16 md:w-20 lg:w-64 bg-black/80 border-r border-[#d4af37]/20 flex flex-col p-2 md:p-4 gap-2 z-20 backdrop-blur-md">
                <div className="flex items-center gap-3 px-2 mb-4 md:mb-8 mt-2 justify-center lg:justify-start">
                    <div className="w-8 h-8 bg-[#d4af37] rounded-lg flex items-center justify-center font-bold text-black">K</div>
                    <span className="text-xl font-bold hidden lg:block text-[#d4af37]">Kurd24</span>
                </div>
                
                <Link to="/" className="flex items-center justify-center lg:justify-start gap-4 p-3 text-neutral-400 hover:text-[#d4af37] hover:bg-white/5 rounded-xl transition-all">
                    <Home size={24} className="lg:w-5 lg:h-5" /> <span className="hidden lg:block font-medium">Home</span>
                </Link>
                <Link to="/vod?type=movie" className={`flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all ${contentType === 'movie' ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
                    <Film size={24} className="lg:w-5 lg:h-5" /> <span className="hidden lg:block font-medium">Movies</span>
                </Link>
                <Link to="/vod?type=series" className={`flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all ${contentType === 'series' ? 'bg-[#d4af37] text-black shadow-lg shadow-[#d4af37]/20' : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}>
                    <Layers size={24} className="lg:w-5 lg:h-5" /> <span className="hidden lg:block font-medium">Series</span>
                </Link>
                <div className="mt-auto">
                    <Link to="/admin" className="flex items-center justify-center lg:justify-start gap-4 p-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <Settings size={24} className="lg:w-5 lg:h-5" /> <span className="hidden lg:block font-medium">Settings</span>
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {featured && (
                    <div className="relative h-[50vh] md:h-[70vh] w-full">
                        <div className="absolute inset-0">
                             <img src={featured.backdrop || featured.poster} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/50 to-transparent"></div>
                             <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014] via-[#0f1014]/50 to-transparent"></div>
                        </div>
                        <div className="absolute bottom-0 left-0 p-4 md:p-12 max-w-2xl animate-fade-in-down">
                            <span className="px-2 py-0.5 md:px-3 md:py-1 bg-[#d4af37] text-black rounded-md text-[10px] md:text-xs font-bold uppercase tracking-wider mb-2 md:mb-4 inline-block shadow-lg shadow-[#d4af37]/50">Featured</span>
                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black mb-2 md:mb-4 leading-tight">{featured.title}</h1>
                            <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-6 text-xs md:text-sm font-medium text-slate-300">
                                <span className="text-[#d4af37] flex items-center gap-1"><Star size={14} fill="currentColor"/> {featured.rating}</span>
                                <span>{featured.year}</span>
                                <div className="flex gap-2">
                                    {featured.genre.map(g => <span key={g} className="px-2 py-0.5 border border-white/20 rounded text-[10px] md:text-xs">{g}</span>)}
                                </div>
                            </div>
                            <p className="text-sm md:text-lg text-slate-300 mb-4 md:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xs md:max-w-none">{featured.description}</p>
                            <div className="flex gap-2 md:gap-4">
                                <button onClick={() => setSelectedMovie(featured)} className="px-4 py-2 md:px-8 md:py-4 bg-[#d4af37] text-black font-bold rounded-xl hover:scale-105 transition-transform flex items-center gap-2 text-sm md:text-base shadow-lg shadow-[#d4af37]/40">
                                    <Play size={16} fill="black" /> Play Now
                                </button>
                                <button className="px-4 py-2 md:px-8 md:py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 text-sm md:text-base">
                                    <Info size={16} /> More Info
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-4 md:p-12 -mt-10 md:-mt-20 relative z-10">
                    <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 flex items-center gap-2 text-[#d4af37]">
                        <Grid className="text-[#d4af37]"/> Trending {contentType === 'movie' ? 'Movies' : 'Series'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                        {filteredContent.map(movie => (
                            <button 
                                key={movie.id}
                                onClick={() => setSelectedMovie(movie)}
                                className="group relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 transition-all hover:scale-105 hover:z-20 hover:shadow-2xl hover:shadow-[#d4af37]/20"
                            >
                                <img src={movie.poster} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy" />
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-[#d4af37] flex items-center gap-1">
                                    <Star size={10} fill="currentColor"/> {movie.rating}
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 md:p-4">
                                    <h3 className="font-bold text-sm md:text-lg leading-tight mb-1">{movie.title}</h3>
                                    <p className="text-[10px] md:text-xs text-slate-400">{movie.year}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Movie Details Modal */}
            {selectedMovie && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in-down">
                    <div className="bg-[#1a1b26] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-[#d4af37]/30 relative flex flex-col md:flex-row max-h-[90vh] md:max-h-none overflow-y-auto">
                        <button onClick={() => { setSelectedMovie(null); navigate('/vod'); }} className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-red-600 transition-colors"><X size={20} className="text-white"/></button>
                        
                        <div className="w-full md:w-2/5 h-64 md:h-auto relative flex-shrink-0">
                             <img src={selectedMovie.poster} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-gradient-to-t from-[#1a1b26] md:bg-gradient-to-r md:from-transparent md:to-[#1a1b26]"></div>
                        </div>
                        
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                            <h2 className="text-2xl md:text-4xl font-black text-white mb-2">{selectedMovie.title}</h2>
                            <div className="flex items-center gap-4 text-xs md:text-sm text-slate-400 mb-4 md:mb-6">
                                <span className="border border-slate-600 px-2 py-0.5 rounded text-slate-300">{selectedMovie.year}</span>
                                <span className="text-[#d4af37] font-bold">{selectedMovie.rating} IMDb</span>
                                <span>{selectedMovie.genre.join(', ')}</span>
                            </div>
                            <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-6 md:mb-8">{selectedMovie.description}</p>
                            
                            <div className="flex gap-4">
                                <button onClick={() => handlePlay(selectedMovie)} className="flex-1 py-3 md:py-4 bg-[#d4af37] hover:bg-yellow-500 text-black font-bold rounded-xl shadow-lg shadow-[#d4af37]/50 transition-all flex items-center justify-center gap-2">
                                    <Play fill="black" size={20} /> <span className="hidden md:inline">Play Now</span><span className="md:hidden">Play</span>
                                </button>
                                <button className="p-3 md:p-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors">
                                    <Heart size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App & Routes ---

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/live" element={<LiveTvPage />} />
                <Route path="/vod" element={<VodPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;
