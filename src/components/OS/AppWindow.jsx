import React from 'react';
import { useOS } from '../../context/OSContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Square } from 'lucide-react';
import NotesApp from '../Apps/NotesApp';
import GamesArcade from '../Apps/GamesArcade';
import MessagesApp from '../Apps/MessagesApp';
import UtilitiesApp from '../Apps/UtilitiesApp';
import SettingsApp from '../Apps/SettingsApp';
import FriendsApp from '../Apps/FriendsApp';
import AdminApp from '../Apps/AdminApp';
import DevStudio from '../Apps/DevStudio';

const AppWindow = ({ app }) => {
    const { closeApp, focusApp, activeApp } = useOS();
    const isActive = activeApp === app.id;

    // Placeholder content rendering based on appId
    const renderContent = () => {
        switch (app.appId) {
            case 'notes': return <NotesApp />;
            case 'games': return <GamesArcade />;
            case 'messages': return <MessagesApp />;
            case 'utils': return <UtilitiesApp />;
            case 'settings': return <SettingsApp />;
            case 'friends': return <FriendsApp />;
            case 'admin': return <AdminApp />;
            case 'studio': return <DevStudio />;
            default:
                return (
                    <div className="p-8 text-white text-center">
                        <h3 className="text-xl opacity-50">App not found: {app.appId}</h3>
                    </div>
                );
        }
    };

    // App Title Mapping
    const titles = {
        'notes': 'Notes',
        'messages': 'Messages',
        'friends': 'Friends',
        'games': 'Games Arcade',
        'utils': 'Utilities',
        'browser': 'Browser',
        'settings': 'Settings',
        'admin': 'System Monitor',
        'studio': 'Dev Studio'
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className={`absolute top-20 left-20 w-[800px] h-[600px] bg-[#1c1c1e] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col
        ${isActive ? 'z-50 ring-1 ring-white/20' : 'z-10'}
      `}
            onClick={() => focusApp(app.id)}
        >
            {/* Title Bar */}
            <div className="h-10 bg-[#2c2c2e] flex items-center justify-between px-4 select-none" onPointerDown={(e) => e.stopPropagation()}>
                <div className="flex gap-2">
                    <button onClick={() => closeApp(app.id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400" />
                    <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400" />
                    <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-400">{titles[app.appId] || 'App'}</span>
                <div className="w-14" /> {/* Spacer */}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[#1c1c1e] text-white">
                {renderContent()}
            </div>
        </motion.div>
    );
};

export default AppWindow;
