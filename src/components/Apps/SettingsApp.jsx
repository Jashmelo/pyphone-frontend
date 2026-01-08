import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const SettingsApp = () => {
    const { user, logout, updateSettings } = useOS();
    const clock24 = user?.settings?.clock_24h ?? true;

    const toggleClock = () => {
        updateSettings({ clock_24h: !clock24 });
    };

    return (
        <div className="h-full bg-[#1c1c1e] text-white p-6 flex flex-col">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>

            <div className="flex-1 space-y-6">
                <div className="bg-[#2c2c2e] rounded-xl overflow-hidden shadow-lg border border-white/5">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <span className="font-medium">24-Hour Clock</span>
                        <div
                            onClick={toggleClock}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${clock24 ? 'bg-indigo-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${clock24 ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5 transition-colors">
                        <span className="font-medium">Wallpaper</span>
                        <span className="text-gray-400 text-sm">Neural &gt;</span>
                    </div>
                </div>

                <div className="bg-[#2c2c2e] rounded-xl overflow-hidden shadow-lg border border-white/5">
                    <div onClick={logout} className="p-4 flex justify-between items-center cursor-pointer hover:bg-rose-500/10 text-rose-400 transition-colors group">
                        <span className="font-bold">Log Out</span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">&larr;</span>
                    </div>
                </div>
            </div>

            <div className="text-center text-gray-500 text-xs mt-8 pb-4 opacity-50">
                PyPhone Web OS v1.2.0<br />
                Connected to: <span className="text-gray-400 font-mono italic">@{user?.username || 'Guest'}</span>
            </div>
        </div>
    );
};

export default SettingsApp;
