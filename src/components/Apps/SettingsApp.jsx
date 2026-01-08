import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { LogOut, Trash2, Palette, ShieldAlert, X, Check, ChevronLeft, ChevronRight } from 'lucide-react';

const SettingsApp = () => {
    const { user, logout, updateSettings, deleteAccount } = useOS();
    const [view, setView] = useState('main'); // main, wallpaper, delete
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const clock24 = user?.settings?.clock_24h ?? true;
    const currentWallpaper = user?.settings?.wallpaper || 'neural';

    const toggleClock = () => {
        updateSettings({ clock_24h: !clock24 });
    };

    const setWallpaper = (type) => {
        updateSettings({ wallpaper: type });
    };

    const wallpapers = [
        { id: 'neural', name: 'Neural (Indigo)', color: 'bg-indigo-600', desc: 'Classic indigo dots and connections' },
        { id: 'midnight', name: 'Midnight (Dark)', color: 'bg-slate-900', desc: 'Minimalist deep indigo particles' },
        { id: 'sunset', name: 'Sunset (Orange)', color: 'bg-orange-600', desc: 'Warm glowing energy system' },
        { id: 'cyber', name: 'Cyberpunk (Cyan)', color: 'bg-cyan-500', desc: 'High-speed data stream neon' }
    ];

    if (view === 'wallpaper') {
        return (
            <div className="h-full bg-[#1c1c1e] text-white p-6 flex flex-col">
                <button onClick={() => setView('main')} className="flex items-center gap-2 text-indigo-400 font-bold mb-6 hover:text-indigo-300">
                    <ChevronLeft size={20} /> Back to Settings
                </button>
                <h2 className="text-3xl font-bold mb-8">Personalize</h2>
                <div className="grid grid-cols-1 gap-4 overflow-y-auto no-scrollbar pb-10">
                    {wallpapers.map(wp => (
                        <button
                            key={wp.id}
                            onClick={() => setWallpaper(wp.id)}
                            className={`p-4 rounded-3xl border-2 transition-all flex items-center gap-4 text-left ${currentWallpaper === wp.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className={`w-16 h-16 rounded-2xl ${wp.color} shadow-lg shrink-0`} />
                            <div className="flex-1">
                                <p className="font-bold text-lg">{wp.name}</p>
                                <p className="text-xs text-gray-500">{wp.desc}</p>
                            </div>
                            {currentWallpaper === wp.id && <Check className="text-indigo-500" size={24} />}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-[#1c1c1e] text-white p-6 flex flex-col relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>

            <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pb-10">
                {/* Personalization Section */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Palette size={14} /> System Preferences
                    </h3>
                    <div className="bg-[#2c2c2e] rounded-2xl overflow-hidden shadow-lg border border-white/5">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center transition-colors">
                            <span className="font-medium text-[15px]">24-Hour Clock</span>
                            <div
                                onClick={toggleClock}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${clock24 ? 'bg-indigo-500' : 'bg-gray-600'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${clock24 ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        <div onClick={() => setView('wallpaper')} className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors group">
                            <div className="flex flex-col">
                                <span className="font-medium text-[15px]">Wallpaper</span>
                                <span className="text-[10px] text-gray-500 uppercase">Active: {currentWallpaper}</span>
                            </div>
                            <ChevronRight size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>
                    </div>
                </section>

                {/* Account Actions */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldAlert size={14} /> Security
                    </h3>
                    <div className="bg-[#2c2c2e] rounded-2xl overflow-hidden shadow-lg border border-white/5">
                        <div onClick={logout} className="p-4 border-b border-white/5 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors group">
                            <span className="font-medium text-[15px]">Log Out</span>
                            <LogOut size={18} className="text-gray-600 group-hover:text-white transition-colors" />
                        </div>

                        <div
                            onClick={() => setShowDeleteModal(true)}
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-rose-500/10 text-rose-400 transition-colors"
                        >
                            <span className="font-bold text-[15px]">Permanently Delete Account</span>
                            <Trash2 size={18} />
                        </div>
                    </div>
                </section>

                <div className="text-center text-gray-500 text-[10px] mt-8 pb-4 opacity-50 font-mono">
                    OS v1.3.0 | @{user?.username}
                </div>
            </div>

            {/* Deletion confirmation Modal */}
            {showDeleteModal && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-[#2c2c2e] w-full max-w-xs rounded-3xl p-6 border border-white/10 shadow-2xl">
                        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} className="text-rose-500" />
                        </div>
                        <h4 className="text-xl font-bold text-center mb-2 text-white">Final Warning</h4>
                        <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
                            Deleting your account is irreversible. All messages, notes, and custom apps will be purged from the PyPhone cloud.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={deleteAccount}
                                className="w-full bg-rose-600 hover:bg-rose-500 py-3 rounded-2xl font-bold transition-all active:scale-95"
                            >
                                Wipe Data & Logout
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-2xl font-bold"
                            >
                                Nevermind
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsApp;
