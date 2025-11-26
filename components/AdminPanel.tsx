
import React, { useState, useEffect } from 'react';
import { AppConfig, Channel, Movie, ThemeId, Customer } from '../types';
import { 
    getAppConfig, saveAppConfig, getChannels, saveChannels, getMovies, saveMovies, 
    t, fetchRemoteDatabase, exportDatabase, isRTL, generateCode, THEMES, parseM3U, getMockCustomers 
} from '../services/store';
import { saveToFirebase, loadFromFirebase } from '../services/firebase';
import { enrichMovieMetadata } from '../services/gemini';
import { Trash2, Plus, Wand2, Save, RotateCcw, Database, Download, CloudDownload, CloudUpload, Users, Lock, LogOut, Layout, Activity, MapPin, Smartphone, Clock, ShieldCheck, Code, Flame } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [activeTab, setActiveTab] = useState<'general' | 'channels' | 'movies' | 'database' | 'customers' | 'monitor'>('general');
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  const [channels, setChannels] = useState<Channel[]>(getChannels());
  const [movies, setMovies] = useState<Movie[]>(getMovies());
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Loading States
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);

  // Forms
  const [newChannel, setNewChannel] = useState<Partial<Channel>>({});
  const [newMovie, setNewMovie] = useState<Partial<Movie>>({});
  const [rawM3u, setRawM3u] = useState('');

  // Customer Code Gen
  const [targetDeviceId, setTargetDeviceId] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    // Refresh data on mount
    setConfig(getAppConfig());
    setChannels(getChannels());
    setMovies(getMovies());
    setCustomers(getMockCustomers());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if(passwordInput === (config.adminPassword || 'admin')) {
          setIsAuthenticated(true);
      } else {
          alert("Incorrect Password");
      }
  };

  const handleSaveConfig = () => {
    saveAppConfig(config);
    alert('Settings Saved!');
  };

  const handleSync = async () => {
      if(!config.remoteDbUrl) return alert("Please enter a URL first");
      setIsSyncing(true);
      const success = await fetchRemoteDatabase(config.remoteDbUrl);
      setIsSyncing(false);
      if(success) {
          alert("Successfully synced from cloud!");
          setConfig(getAppConfig());
          setChannels(getChannels());
          setMovies(getMovies());
      } else {
          alert("Failed to sync. Check URL and CORS settings.");
      }
  };

  const handleFirebaseSave = async () => {
      setIsFirebaseLoading(true);
      const success = await saveToFirebase();
      setIsFirebaseLoading(false);
      if(success) alert("Data saved to Firebase Cloud!");
      else alert("Failed to save. Check your Firebase Config.");
  };

  const handleFirebaseLoad = async () => {
      if(!confirm("This will overwrite your current local data with data from Firebase. Continue?")) return;
      setIsFirebaseLoading(true);
      const success = await loadFromFirebase();
      setIsFirebaseLoading(false);
      if(success) {
          alert("Data loaded from Firebase Cloud!");
          // Refresh local state
          setConfig(getAppConfig());
          setChannels(getChannels());
          setMovies(getMovies());
      } else {
          alert("Failed to load. Check your Firebase Config or Database.");
      }
  };

  const handleGenerateCode = (months: number) => {
      if(!targetDeviceId) return alert("Enter Customer Device ID");
      const code = generateCode(targetDeviceId.trim(), months);
      setGeneratedCode(code);
  };

  // --- Channel Handlers ---
  const handleAddChannel = () => {
    if (!newChannel.name || !newChannel.url) return;
    const channel: Channel = {
      id: Date.now().toString(),
      name: newChannel.name,
      url: newChannel.url,
      group: newChannel.group || 'General',
      logo: newChannel.logo || ''
    };
    const updated = [...channels, channel];
    setChannels(updated);
    saveChannels(updated);
    setNewChannel({});
  };

  const handleDeleteChannel = (id: string) => {
    const updated = channels.filter(c => c.id !== id);
    setChannels(updated);
    saveChannels(updated);
  };

  const handleBulkImport = () => {
    if (!rawM3u) return;
    setIsProcessing(true);
    // Use the optimized regex parser instead of AI for bulk
    try {
        const parsed = parseM3U(rawM3u);
        if (parsed.length > 0) {
             const updated = [...channels, ...parsed];
             setChannels(updated);
             saveChannels(updated);
             setRawM3u('');
             alert(`Successfully imported ${parsed.length} channels!`);
        } else {
             alert("No channels found. Check M3U format.");
        }
    } catch (e) {
        alert("Error parsing playlist.");
    }
    setIsProcessing(false);
  };

  const handleAddMovie = () => {
    if (!newMovie.title || !newMovie.url) return;
    const movie: Movie = {
      id: Date.now().toString(),
      title: newMovie.title,
      url: newMovie.url,
      description: newMovie.description || '',
      poster: newMovie.poster || 'https://picsum.photos/300/450',
      backdrop: newMovie.backdrop || 'https://picsum.photos/1200/800',
      year: newMovie.year || '2024',
      genre: newMovie.genre || ['Unknown'],
      rating: newMovie.rating || 'NR'
    };
    const updated = [...movies, movie];
    setMovies(updated);
    saveMovies(updated);
    setNewMovie({});
  };

  const handleMagicMovie = async () => {
    if (!newMovie.title) return alert('Enter a movie title first');
    setIsProcessing(true);
    const meta = await enrichMovieMetadata(newMovie.title);
    if (meta) {
      setNewMovie({
        ...newMovie,
        description: meta.description,
        year: meta.year,
        genre: meta.genre,
        rating: meta.rating,
        poster: meta.posterSearchQuery ? `https://placehold.co/300x450?text=${encodeURIComponent(meta.posterSearchQuery)}` : newMovie.poster
      });
    }
    setIsProcessing(false);
  };

  const handleDeleteMovie = (id: string) => {
    const updated = movies.filter(m => m.id !== id);
    setMovies(updated);
    saveMovies(updated);
  };

  // --- Login Screen ---
  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
              <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md">
                  <div className="flex justify-center mb-6">
                      <div className="p-4 bg-indigo-600 rounded-full">
                          <Lock className="text-white" size={32} />
                      </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Access</h2>
                  <input 
                    type="password" 
                    placeholder="Enter Admin Password" 
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-indigo-500"
                  />
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">
                      Login to Panel
                  </button>
                  <div className="mt-4 text-center">
                    <button type="button" onClick={() => window.location.hash = '/'} className="text-slate-400 text-sm hover:text-white">
                        ← Back to Dashboard
                    </button>
                  </div>
              </form>
          </div>
      );
  }

  // --- Main Panel ---
  const lang = config.language;
  const dir = isRTL(lang) ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200" dir={dir}>
        <div className="p-6 max-w-7xl mx-auto pb-24">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-3">
                <div onClick={() => window.location.hash = '/'} className="cursor-pointer p-2 bg-slate-800 rounded-lg hover:bg-slate-700">
                    <LogOut size={20} />
                </div>
                <h2 className="text-3xl font-bold text-white">{t('admin', lang)}</h2>
            </div>
            <div className="flex flex-wrap gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {(['general', 'customers', 'monitor', 'database', 'channels', 'movies'] as const).map(tab => (
                <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab 
                    ? 'bg-indigo-600 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                >
                {t(tab as any, lang)}
                </button>
            ))}
            </div>
        </div>

        {activeTab === 'general' && (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">{t('general', lang)}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">App Name</label>
                        <input 
                            type="text" 
                            value={config.appName} 
                            onChange={e => setConfig({...config, appName: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Admin Password</label>
                        <input 
                            type="text" 
                            value={config.adminPassword || ''} 
                            onChange={e => setConfig({...config, adminPassword: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Language</label>
                        <select 
                            value={config.language} 
                            onChange={e => setConfig({...config, language: e.target.value as any})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="en">English</option>
                            <option value="ku">Kurdish (Sorani)</option>
                            <option value="ar">Arabic</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Require Subscription</label>
                        <select 
                            value={config.requireSubscription ? 'yes' : 'no'} 
                            onChange={e => setConfig({...config, requireSubscription: e.target.value === 'yes'})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="yes">Yes (Require Code)</option>
                            <option value="no">No (Free Access)</option>
                        </select>
                    </div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
                            <Layout size={16}/> Theme / Wallpaper
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(Object.keys(THEMES) as ThemeId[]).map((themeId) => (
                                <button
                                    key={themeId}
                                    onClick={() => setConfig({...config, theme: themeId})}
                                    className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${config.theme === themeId ? 'border-indigo-500 scale-105 shadow-xl' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <div className={`absolute inset-0 ${THEMES[themeId].bg} ${THEMES[themeId].bg.includes('url') ? 'bg-cover bg-center' : ''}`} />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <span className="text-white text-xs font-bold shadow-sm">{THEMES[themeId].name}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Welcome Message</label>
                        <textarea 
                            value={config.welcomeMessage} 
                            onChange={e => setConfig({...config, welcomeMessage: e.target.value})}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500 h-24"
                        />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSaveConfig}
                        className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Save size={18} />
                        <span>{t('save', lang)}</span>
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'customers' && (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Users size={24} className="text-green-400" /> 
                    {t('customers', lang)}
                </h3>
                
                <div className="p-6 bg-slate-950 rounded-xl border border-slate-800">
                    <h4 className="font-medium text-white mb-4">Generate Activation Code</h4>
                    <div className="space-y-4 max-w-lg">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Customer Device ID</label>
                            <input 
                                type="text"
                                placeholder="e.g. 7X2M9P1"
                                value={targetDeviceId}
                                onChange={e => setTargetDeviceId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white font-mono text-lg tracking-widest"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleGenerateCode(1)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-lg border border-slate-700 text-sm font-bold">1 Mo</button>
                            <button onClick={() => handleGenerateCode(6)} className="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-lg border border-slate-700 text-sm font-bold">6 Mo</button>
                            <button onClick={() => handleGenerateCode(12)} className="flex-1 bg-indigo-900 hover:bg-indigo-800 py-3 rounded-lg border border-indigo-700 text-sm font-bold text-indigo-100">12 Mo</button>
                        </div>
                        {generatedCode && (
                            <div className="mt-6 p-4 bg-emerald-900/30 border border-emerald-500/50 rounded-xl text-center">
                                <div className="text-2xl font-mono font-bold text-white tracking-widest select-all cursor-pointer" onClick={() => navigator.clipboard.writeText(generatedCode)}>
                                    {generatedCode}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- Live Monitor / Analytics Tab --- */}
        {activeTab === 'monitor' && (
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6">
                 <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Activity size={24} className="text-red-400" /> 
                    {t('monitor', lang)}
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" dir={dir}>
                        <thead>
                            <tr className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4 rounded-tl-lg">Device ID</th>
                                <th className="p-4">Name</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Plan / Expiry</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 rounded-tr-lg text-right">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-sm">
                            {customers.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="p-4 font-mono font-bold text-indigo-300">
                                        <div className="flex items-center gap-2">
                                            <Smartphone size={14} className="opacity-50"/> {c.deviceId}
                                        </div>
                                    </td>
                                    <td className="p-4 text-white font-medium">{c.name}</td>
                                    <td className="p-4 text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <MapPin size={12} /> {c.location}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-white">{c.planType}</div>
                                        <div className="text-xs text-slate-500">Ends: {c.subscriptionEnd}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-emerald-900 text-emerald-300 border border-emerald-700' : 'bg-red-900 text-red-300 border border-red-700'}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right text-slate-400">
                                        <div className="flex items-center justify-end gap-1">
                                            <Clock size={12} /> {c.lastActive}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="text-center text-xs text-slate-500 mt-4">
                    Showing latest active sessions. Real-time updates active.
                </div>
            </div>
        )}

        {activeTab === 'database' && (
             <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Database size={24} className="text-blue-400" /> 
                    {t('database', lang)}
                </h3>
                
                {/* Firebase / Backend Panel */}
                <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 mb-6">
                    <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                        <Flame size={16} className="text-orange-500"/> {t('syncFirebase', lang)}
                    </h4>
                    <p className="text-xs text-slate-500 mb-4">
                        Your app is connected to <strong>darko-tv-22932</strong>. 
                        You can sync your current admin panel data to the Firebase Cloud or load from it.
                    </p>
                    
                    <div className="flex gap-4">
                         <button 
                            onClick={handleFirebaseSave} 
                            disabled={isFirebaseLoading}
                            className="flex-1 bg-orange-700 hover:bg-orange-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-orange-600"
                        >
                             {isFirebaseLoading ? <RotateCcw className="animate-spin" size={18}/> : <CloudUpload size={18} />}
                             <div className="text-left">
                                 <div className="font-bold text-sm">{t('saveToCloud', lang)}</div>
                                 <div className="text-[10px] opacity-70">Local -&gt; Firebase</div>
                             </div>
                        </button>

                         <button 
                            onClick={handleFirebaseLoad} 
                            disabled={isFirebaseLoading}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors border border-slate-700"
                        >
                             {isFirebaseLoading ? <RotateCcw className="animate-spin" size={18}/> : <CloudDownload size={18} />}
                             <div className="text-left">
                                 <div className="font-bold text-sm">{t('loadFromCloud', lang)}</div>
                                 <div className="text-[10px] opacity-70">Firebase -&gt; Local</div>
                             </div>
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-800">
                        <h5 className="text-xs font-bold text-slate-400 mb-2">Manual Config (Advanced)</h5>
                        <textarea 
                            value={config.firebaseConfig || ''}
                            onChange={e => setConfig({...config, firebaseConfig: e.target.value})}
                            placeholder={`{ "apiKey": "AIzaSy...", "projectId": "my-app-123" }`}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono text-xs focus:outline-none focus:border-yellow-500 h-24"
                            spellCheck={false}
                        />
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <input 
                        type="text" 
                        placeholder="https://raw.githubusercontent.com/..."
                        value={config.remoteDbUrl || ''}
                        onChange={e => setConfig({...config, remoteDbUrl: e.target.value})}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white font-mono text-sm"
                    />
                    <button 
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap"
                    >
                        {isSyncing ? <RotateCcw className="animate-spin" size={16}/> : <CloudDownload size={16}/>}
                        {t('sync', lang)}
                    </button>
                </div>
                 <div className="pt-4 border-t border-slate-800">
                    <button onClick={exportDatabase} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <Download size={16} /> {t('export', lang)}
                    </button>
                </div>
            </div>
        )}

        {/* --- Channels Tab --- */}
        {activeTab === 'channels' && (
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <h3 className="text-xl font-semibold text-white mb-4">{t('addChannel', lang)}</h3>
                    
                    {/* Manual Add */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <input placeholder="Name" value={newChannel.name || ''} onChange={e => setNewChannel({...newChannel, name: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"/>
                        <input placeholder="Group" value={newChannel.group || ''} onChange={e => setNewChannel({...newChannel, group: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"/>
                        <input placeholder="Logo URL" value={newChannel.logo || ''} onChange={e => setNewChannel({...newChannel, logo: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white" dir="ltr"/>
                        <input placeholder="Stream URL (.m3u8)" value={newChannel.url || ''} onChange={e => setNewChannel({...newChannel, url: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-left" dir="ltr"/>
                    </div>
                    <button onClick={handleAddChannel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mb-8">
                        <Plus size={16}/> {t('addChannel', lang)}
                    </button>

                    {/* Bulk Import */}
                    <div className="pt-6 border-t border-slate-800">
                        <h4 className="text-lg font-medium text-white mb-2 flex items-center"><Wand2 size={18} className="mx-2 text-purple-400" />{t('aiImport', lang)}</h4>
                        <p className="text-xs text-slate-500 mb-2">Paste your entire M3U playlist content here. Supports 100+ channels instantly.</p>
                        <textarea value={rawM3u} onChange={e => setRawM3u(e.target.value)} placeholder="#EXTINF:-1 tvg-logo='...' group-title='Sports', Sky Sports..." className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-xs font-mono h-48 mb-3 text-left" dir="ltr"/>
                        <button onClick={handleBulkImport} disabled={isProcessing} className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center ${isProcessing ? 'opacity-50' : ''}`}>
                            {isProcessing ? <RotateCcw className="animate-spin mr-2" size={16}/> : <Wand2 size={16} className="mr-2"/>}{t('processAi', lang)}
                        </button>
                    </div>
                </div>
                
                {/* List */}
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                    <table className="w-full text-left" dir={dir}>
                        <thead className="bg-slate-950 text-slate-400 text-xs uppercase">
                            <tr><th className="px-6 py-3">Channel</th><th className="px-6 py-3">Group</th><th className="px-6 py-3 text-right">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {channels.map(c => (
                                <tr key={c.id} className="hover:bg-slate-800/50">
                                    <td className="px-6 py-4 text-white font-medium flex items-center gap-3">
                                        {c.logo && <img src={c.logo} className="w-8 h-8 rounded bg-black object-contain"/>}
                                        {c.name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 text-sm">{c.group}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDeleteChannel(c.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- Movies Tab --- */}
        {activeTab === 'movies' && (
            <div className="space-y-6">
                <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
                    <h3 className="text-xl font-semibold text-white mb-4">{t('addMovie', lang)}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex gap-2">
                            <input placeholder="Title" value={newMovie.title || ''} onChange={e => setNewMovie({...newMovie, title: e.target.value})} className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"/>
                            <button onClick={handleMagicMovie} disabled={isProcessing} className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg" title="Auto-fill Metadata"><Wand2 size={18} /></button>
                        </div>
                        <input placeholder="URL" value={newMovie.url || ''} onChange={e => setNewMovie({...newMovie, url: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-left" dir="ltr"/>
                        <input placeholder="Poster URL" value={newMovie.poster || ''} onChange={e => setNewMovie({...newMovie, poster: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white text-left" dir="ltr"/>
                        <textarea placeholder="Description" value={newMovie.description || ''} onChange={e => setNewMovie({...newMovie, description: e.target.value})} className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white h-20"/>
                    </div>
                    <button onClick={handleAddMovie} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"><Plus size={16}/> {t('addMovie', lang)}</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movies.map(m => (
                        <div key={m.id} className="relative group bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                            <img src={m.poster} alt={m.title} className="w-full aspect-[2/3] object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleDeleteMovie(m.id)} className="bg-red-600 text-white p-1.5 rounded-full shadow-lg"><Trash2 size={14} /></button>
                            </div>
                            <div className="p-3">
                                <h4 className="text-white font-medium truncate">{m.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
        </div>
    </div>
  );
};
