import React, { useState } from 'react';
import { Send, User } from 'lucide-react';

const MessagesApp = () => {
    return (
        <div className="flex h-full bg-[#1c1c1e] text-white">
            {/* List */}
            <div className="w-80 border-r border-white/10 bg-[#2c2c2e]">
                <div className="p-4 border-b border-white/10 font-bold">Messages</div>
                <div className="p-4 bg-white/5 cursor-pointer">
                    <div className="font-bold flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">A</div> Admin</div>
                    <p className="text-sm text-gray-400 truncate mt-1">Welcome to PyPhone Web OS!</p>
                </div>
            </div>
            {/* Chat */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="flex justify-start mb-4">
                        <div className="bg-[#3a3a3c] p-3 rounded-2xl rounded-tl-none max-w-md">
                            <p>Welcome to PyPhone Web OS! This is a simulation.</p>
                        </div>
                    </div>
                    <div className="flex justify-end mb-4">
                        <div className="bg-[#0a84ff] p-3 rounded-2xl rounded-tr-none max-w-md">
                            <p>Wow, this is animated!</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-white/10 flex gap-2">
                    <input className="flex-1 bg-[#2c2c2e] rounded-full px-4 py-2 focus:outline-none" placeholder="iMessage" />
                    <button className="bg-[#0a84ff] p-2 rounded-full text-white"><Send size={18} /></button>
                </div>
            </div>
        </div>
    );
};

export default MessagesApp;
