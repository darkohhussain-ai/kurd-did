import React, { useState, useEffect } from 'react';
import { AppConfig, Channel, Movie, Customer } from '../types';
import { 
    getAppConfig, saveAppConfig, getChannels, saveChannels, getMovies, saveMovies, 
    t, parseM3U
} from '../services/store';
import { subscribeToUsersCollection, updateUserSubscription, uploadChannelsBatch, initFirebase } from '../services/firebase';
import { Trash2, Plus, Wand2, Save, Upload, Users, Lock, LogOut, Layout, Activity, MapPin, Smartphone, Clock, Database, CheckCircle, XCircle, Cloud, WifiOff } from 'lucide-react';

// Helper to safely format dates that might be strings or Firestore objects
const formatDate = (dateValue: any) => {
    if (!dateValue) return 'Never';
    if (typeof dateValue === 'string') return new Date(dateValue).toLocaleDateString();
    if (dateValue?.toDate) return dateValue.toDate().toLocaleDateString(); // Firestore Timestamp
    if (dateValue?.seconds) return new Date(dateValue.seconds * 1000).toLocaleDateString(); // Serialized Timestamp
    return 'Invalid Date';
};

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  
  const [activeTab, setActiveTab] = useState<'users' | 'content' | 'settings'>('users');
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  const [channels, setChannels] = useState<Channel[]>(getChannels());
  const [users, setUsers] = useState<Customer[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawM3u, setRawM3u] = useState('');

  useEffect(() => {
    const db = initFirebase();
    setIsOffline(!db);
    
    const unsubscribe = subscribeToUsersCollection((data) => {
        setUsers(data);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      if(passwordInput === (config.adminPassword || 'admin')) setIsAuthenticated(true);
      else alert("Incorrect Password");
  };

  const handleSubscription = async (deviceId: string, days: number) => {
      if(confirm(`Activate ${days} days for ${deviceId}?`)) {
          await updateUserSubscription(deviceId, days);
      }
  };

  const handleM3uImport = async () => {
      if(!rawM3u) return;
      setIsProcessing(true);
      try {
          const parsed = parseM3U(rawM3u);
          if(parsed.length > 0) {
              const combined = [...channels, ...parsed];
              setChannels(combined);
              saveChannels(combined);
              
              const success = await uploadChannelsBatch(parsed);
              if(success) alert(`Imported ${parsed.length} channels to Cloud & Local!`);
              else alert(`Imported ${parsed.length} channels to Local Storage (Offline Mode).`);
              
              setRawM3u('');
          } else {
              alert("No valid channels found.");
          }
      } catch(e) {
          alert("Error parsing M3U");
      }
      setIsProcessing(false);
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
              <form onSubmit={handleLogin} className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl">
                  <div className="flex justify-center mb-6"><div className="p-4 bg-indigo-600 rounded-full"><Lock className="text-white" size={32} /></div></div>
                  <h2 className="text-2xl font-bold text-white text-center mb-6">Admin Control</h2>
                  <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white mb-4" placeholder="Password"/>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors">Access Panel</button>
                  <div className="mt-4 text-center"><button type="button" onClick={() => window.location.hash = '/'} className="text-slate-500 hover:text-white text-sm">← Back to App</button></div>
              </form>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans">
        <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold text-white flex items-center gap-2"><Layout className="text-indigo-500"/> {config.appName} Admin</h1>
                    {isOffline ? 
                        <span className="flex items-center gap-1 text-[10px] bg-red-900/50 text-red-300 px-2 py-0.5 rounded border border-red-500/30"><WifiOff size={10}/> Local Mode</span> : 
                        <span className="flex items-center gap-1 text-[10px] bg-green-900/50 text-green-300 px-2 py-0.5 rounded border border-green-500/30"><Cloud size={10}/> Cloud Connected</span>
                    }
                </div>
                <div className="flex items-center gap-4">
                     <button onClick={() => window.location.hash = '/'} className="text-sm font-medium text-slate-400 hover:text-white">Open App</button>
                     <button onClick={() => setIsAuthenticated(false)} className="p-2 bg-slate-800 rounded-lg hover:bg-red-900/50 hover:text-red-400"><LogOut size={18}/></button>
                </div>
            </div>
        </header>

        <div className="max-w-7xl mx-auto p-6">
            <div className="flex gap-4 mb-8">
                <button onClick={() => setActiveTab('users')} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-900 text-slate-400'}`}>User Management</button>
                <button onClick={() => setActiveTab('content')} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'content' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-900 text-slate-400'}`}>Content</button>
                <button onClick={() => setActiveTab('settings')} className={`px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-slate-900 text-slate-400'}`}>Settings</button>
            </div>

            {activeTab === 'users' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2"><Users className="text-green-500"/> Active Connections</h3>
                        <span className="bg-slate-800 px-3 py-1 rounded-full text-xs font-mono text-slate-400">{users.length} Devices</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-950 text-slate-500 text-xs uppercase font-bold">
                                <tr>
                                    <th className="p-4">Device ID</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Expires</th>
                                    <th className="p-4">Last Active</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-800/50">
                                        <td className="p-4 font-mono text-indigo-300">{u.deviceId}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'Active' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-400">{formatDate(u.subscriptionEnd)}</td>
                                        <td className="p-4 text-sm text-slate-500">{formatDate(u.lastActive)}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleSubscription(u.deviceId, 2)} className="px-3 py-1 bg-slate-800 hover:bg-white text-slate-300 hover:text-black rounded text-xs font-bold transition-colors">Test</button>
                                                <button onClick={() => handleSubscription(u.deviceId, 90)} className="px-3 py-1 bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-white rounded text-xs font-bold transition-colors">3M</button>
                                                <button onClick={() => handleSubscription(u.deviceId, 365)} className="px-3 py-1 bg-indigo-900 hover:bg-indigo-600 text-indigo-200 hover:text-white rounded text-xs font-bold transition-colors">1Y</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr><td colSpan={5} className="p-8 text-center text-slate-500">No devices connected yet.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'content' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Upload className="text-blue-500"/> M3U Import</h3>
                        <p className="text-slate-400 text-sm mb-4">Paste an M3U playlist content or URL to bulk import channels to Firestore.</p>
                        <textarea 
                            value={rawM3u} 
                            onChange={e => setRawM3u(e.target.value)} 
                            className="w-full h-48 bg-black border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 mb-4 focus:border-indigo-500 focus:outline-none"
                            placeholder="#EXTINF:-1 tvg-id=..."
                        />
                        <button 
                            onClick={handleM3uImport} 
                            disabled={isProcessing}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-bold transition-colors disabled:opacity-50"
                        >
                            {isProcessing ? 'Processing...' : 'Parse & Upload to Database'}
                        </button>
                    </div>
                    
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Database className="text-orange-500"/> Current Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <div className="text-2xl font-bold text-white">{channels.length}</div>
                                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Total Channels</div>
                            </div>
                            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <div className="text-2xl font-bold text-white">{getMovies().length}</div>
                                <div className="text-xs uppercase text-slate-500 font-bold tracking-wider">Movies</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {activeTab === 'settings' && (
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                     <h3 className="text-lg font-bold text-white mb-4">App Configuration</h3>
                     <div className="space-y-4 max-w-md">
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">App Name</label>
                            <input value={config.appName} onChange={e => setConfig({...config, appName: e.target.value})} className="w-full bg-black border border-slate-800 rounded-lg p-2 text-white" />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold">Firebase Config (JSON)</label>
                            <textarea value={config.firebaseConfig} onChange={e => setConfig({...config, firebaseConfig: e.target.value})} className="w-full h-32 bg-black border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300" />
                        </div>
                        <button onClick={() => { saveAppConfig(config); alert('Saved'); }} className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold">Save Settings</button>
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};