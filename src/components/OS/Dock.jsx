import React from 'react';
import { useOS } from '../../context/OSContext';
import { motion } from 'framer-motion';
import {
    StickyNote, MessageSquare, Users,
    Gamepad2, Wrench, Settings, Search, Globe, ShieldAlert, Code2, Cpu
} from 'lucide-react';

const Dock = () => {
    const { openApp, user } = useOS();

    const apps = [
        { id: 'notes', icon: StickyNote, label: 'Notes', color: 'bg-yellow-500' },
        { id: 'messages', icon: MessageSquare, label: 'Messages', color: 'bg-green-500' },
        { id: 'friends', icon: Users, label: 'Friends', color: 'bg-blue-500' },
        { id: 'games', icon: Gamepad2, label: 'Games', color: 'bg-red-500' },
        { id: 'utils', icon: Wrench, label: 'Utilities', color: 'bg-gray-500' },
        { id: 'nexus', icon: Cpu, label: 'Nexus AI', color: 'bg-cyan-500' },
        { id: 'studio', icon: Code2, label: 'Studio', color: 'bg-slate-800' },
        { id: 'settings', icon: Settings, label: 'Settings', color: 'bg-indigo-500' },
    ];

    if (user?.username === 'admin') {
        apps.push({ id: 'admin', icon: ShieldAlert, label: 'System', color: 'bg-purple-600' });
    }

    return (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 shadow-2xl">
                {apps.map((app) => (
                    <motion.button
                        key={app.id}
                        whileHover={{ scale: 1.2, y: -10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => openApp(app.id)}
                        className="flex flex-col items-center gap-1 group relative"
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${app.color}`}>
                            <app.icon size={24} />
                        </div>
                        <span className="absolute -top-10 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {app.label}
                        </span>
                        {/* Tick for active? */}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default Dock;
