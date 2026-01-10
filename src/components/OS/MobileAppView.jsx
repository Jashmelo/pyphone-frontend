import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { ChevronLeft } from 'lucide-react';
import NotesApp from '../Apps/NotesApp';
import GamesArcade from '../Apps/GamesArcade';
import MessagesApp from '../Apps/MessagesApp';
import UtilitiesApp from '../Apps/UtilitiesApp';
import SettingsApp from '../Apps/SettingsApp';
import FriendsApp from '../Apps/FriendsApp';
import AdminApp from '../Apps/AdminApp';
import DevStudio from '../Apps/DevStudio';
import NexusAI from '../Apps/NexusAI';
import ChessGame from '../Apps/ChessGame';

const MobileAppView = ({ app }) => {
    const { closeApp } = useOS();
    const [showHeader, setShowHeader] = useState(true);

    const titles = {
        'notes': 'Notes',
        'messages': 'Messages',
        'friends': 'Friends',
        'games': 'Games Arcade',
        'utils': 'Utilities',
        'browser': 'Browser',
        'settings': 'Settings',
        'admin': 'System Monitor',
        'studio': 'Dev Studio',
        'nexus': 'Nexus AI',
        'chess': 'Chess Game'
    };

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
            case 'nexus': return <NexusAI />;
            case 'chess': return <ChessGame />;
            default:
                return (
                    <div className="p-8 text-white text-center">
                        <h3 className="text-xl opacity-50">App not found: {app.appId}</h3>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-[#1c1c1e] text-white flex flex-col z-50">
            {/* Header with Back Button */}
            <div className="h-12 bg-[#2c2c2e] flex items-center px-4 border-b border-white/10 shrink-0">
                <button
                    onClick={() => closeApp(app.id)}
                    className="p-2 -m-2 hover:bg-white/10 rounded-lg transition-all active:scale-95"
                    title="Back to menu"
                >
                    <ChevronLeft size={24} className="text-blue-500" />
                </button>
                <span className="text-sm font-bold text-gray-300 ml-2 flex-1">{titles[app.appId] || 'App'}</span>
            </div>

            {/* App Content - Full Screen */}
            <div className="flex-1 overflow-auto bg-[#1c1c1e]">
                {renderContent()}
            </div>
        </div>
    );
};

export default MobileAppView;