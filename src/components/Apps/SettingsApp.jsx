import React, { useState } from 'react';

const SettingsApp = () => {
    const [clock24, setClock24] = useState(true);

    return (
        <div className="h-full bg-[#1c1c1e] text-white p-6">
            <h2 className="text-3xl font-bold mb-8">Settings</h2>

            <div className="space-y-6">
                <div className="bg-[#2c2c2e] rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex justify-between items-center">
                        <span>24-Hour Clock</span>
                        <div
                            onClick={() => setClock24(!clock24)}
                            className={`w-12 h-7 rounded-full p-1 cursor-pointer transition-colors ${clock24 ? 'bg-green-500' : 'bg-gray-600'}`}
                        >
                            <div className={`w-5 h-5 bg-white rounded-full transition-transform ${clock24 ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </div>
                    <div className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/5">
                        <span>Wallpaper</span>
                        <span className="text-gray-400">Neural ></span>
                    </div>
                </div>

                <div className="text-center text-gray-500 text-sm mt-8">
                    PyPhone Web OS v1.0.0
                </div>
            </div>
        </div>
    );
};

export default SettingsApp;
