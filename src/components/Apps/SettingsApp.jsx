import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';
import { LogOut, Trash2, Palette, ShieldAlert, X, Check } from 'lucide-react';

const SettingsApp = () => {
    const { user, logout, updateSettings, deleteAccount } = useOS();
    const clock24 = user?.settings?.clock_24h ?? true;
    const currentWallpaper = user?.settings?.wallpaper || 'neural';
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const toggleClock = () => {
        updateSettings({ clock_24h: !clock24 });
    };

    const setWallpaper = (type) => {
        updateSettings({ wallpaper: type });
    };

    const wallpapers = [
        { id: 'neural', name: 'Neural', color: 'bg-indigo-600' },
        { id: 'midnight', name: 'Midnight', color: 'bg-slate-900' },
        { id: 'sunset', name: 'Sunset', color: 'bg-orange-600' },
        { id: 'cyber', name: 'Cyberpunk', color: 'bg-cyan-500' }
    ];

    return (
        <div className="h-full bg-[#1c1c1e] text-white p-6 flex flex-col relative overflow-hidden">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>

            <div className="flex-1 space-y-8 overflow-y-auto no-scrollbar pb-10">
                {/* Personalization */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Palette size={14} /> Appearance
                    </h3>
                    <div className="bg-[#2c2c2e] rounded-2xl p-2 shadow-lg border border-white/5 space-y-1">
                        <div className="p-4 flex justify-between items-center">
                            <span className="font-medium text-[15px]">24-Hour Clock</span>
                            <div
                                onClick={toggleClock}
                                className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${clock24 ? 'bg-indigo-500' : 'bg-gray-600'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${clock24 ? 'translate-x-5' : 'translate-x-0'}`} />
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5">
                            <span className="font-medium text-[15px] block mb-4">Wallpaper</span>
                            <div className="grid grid-cols-2 gap-3">
                                {wallpapers.map(wp => (
                                    <button
                                        key={wp.id}
                                        onClick={() => setWallpaper(wp.id)}
                                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${currentWallpaper === wp.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-transparent bg-white/5 hover:bg-white/10'}`}
                                    >
                                        <div className={`w-full h-12 rounded-lg ${wp.color} shadow-inner`} />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">{wp.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Account Actions */}
                <section>
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldAlert size={14} /> Security & Account
                    </h3>
                    <div className="bg-[#2c2c2e] rounded-2xl overflow-hidden shadow-lg border border-white/5">
                        <div onClick={logout} className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3">
                                <LogOut size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                                <span className="font-medium text-[15px]">Log Out</span>
                            </div>
                            <span className="text-gray-600">&rarr;</span>
                        </div>

                        <div
                            onClick={() => setShowDeleteModal(true)}
                            className="p-4 border-t border-white/5 flex justify-between items-center cursor-pointer hover:bg-rose-500/10 text-rose-400 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-[15px]">Delete Account</span>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="text-center text-gray-500 text-[10px] mt-8 pb-4 opacity-50 font-mono">
                    OS Version: Build 2026.1.8-FINAL<br />
                    Kernel: 2.4.0-antigravity
                </div>
            </div>

            {/* Deletion confirmation Modal */}
            {showDeleteModal && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-[#2c2c2e] w-full max-w-xs rounded-3xl p-6 border border-white/10 shadow-2xl scale-in-center">
                        <div className="w-16 h-16 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Trash2 size={32} className="text-rose-500" />
                        </div>
                        <h4 className="text-xl font-bold text-center mb-2">Are you sure?</h4>
                        <p className="text-sm text-gray-400 text-center mb-8 leading-relaxed">
                            This action is permanent and will wipe all your data from the PyPhone OS servers.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={deleteAccount}
                                className="w-full bg-rose-600 hover:bg-rose-500 py-3 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Check size={18} /> Yes, Delete Everything
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-2xl font-bold transition-all text-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsApp;
