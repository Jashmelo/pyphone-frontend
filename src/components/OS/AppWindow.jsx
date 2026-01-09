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
import NexusAI from '../Apps/NexusAI';

const AppWindow = ({ app }) => {
    const { closeApp, focusApp, activeApp, updateAppWindow } = useOS();
    const isActive = activeApp === app.id;
    const windowRef = useRef(null);

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
        'studio': 'Dev Studio',
        'nexus': 'Nexus AI'
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
            default:
                return (
                    <div className="p-8 text-white text-center">
                        <h3 className="text-xl opacity-50">App not found: {app.appId}</h3>
                    </div>
                );
        }
    };

    const handleResize = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = app.width;
        const startHeight = app.height;
        const startLeft = app.x;
        const startTop = app.y;

        const onMouseMove = (moveEvent) => {
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newX = startLeft;
            let newY = startTop;

            if (direction.includes('e')) newWidth = startWidth + (moveEvent.clientX - startX);
            if (direction.includes('w')) {
                const diff = startX - moveEvent.clientX;
                newWidth = startWidth + diff;
                newX = startLeft - diff;
            }
            if (direction.includes('s')) newHeight = startHeight + (moveEvent.clientY - startY);
            if (direction.includes('n')) {
                const diff = startY - moveEvent.clientY;
                newHeight = startHeight + diff;
                newY = startTop - diff;
            }

            // Min constraints
            if (newWidth < 400) { newWidth = 400; newX = app.x; }
            if (newHeight < 300) { newHeight = 300; newY = app.y; }

            updateAppWindow(app.id, { width: newWidth, height: newHeight, x: newX, y: newY });
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    return (
        <motion.div
            ref={windowRef}
            drag
            dragMomentum={false}
            dragListener={false}
            initial={false}
            animate={{
                x: app.x,
                y: app.y,
                width: app.width,
                height: app.height,
                opacity: 1,
                scale: 1
            }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.5 }}
            className={`absolute bg-[#1c1c1e] rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col pointer-events-auto
                ${isActive ? 'z-50 ring-1 ring-white/20' : 'z-10'}
            `}
            onClick={() => focusApp(app.id)}
            onDragEnd={(e, info) => {
                updateAppWindow(app.id, { x: app.x + info.offset.x, y: app.y + info.offset.y });
            }}
        >
            {/* Title Bar - Drag Listener */}
            <div
                className="h-10 bg-[#2c2c2e] flex items-center justify-between px-4 select-none cursor-move shrink-0"
                onPointerDown={(e) => {
                    focusApp(app.id);
                    // Standard drag behavior is handled by motion.div if we set dragListener back to true for the header
                    // But we want custom control
                }}
                onMouseDown={(e) => {
                    // Manual drag logic if needed, but motion's drag is better
                }}
            >
                {/* We use motion's drag controls for better feel */}
                <div className="flex gap-2 items-center">
                    <div className="flex gap-1.5 mr-4">
                        <button onClick={() => closeApp(app.id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" />
                        <button className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors" />
                        <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors" />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{titles[app.appId] || 'App'}</span>
                </div>
            </div>

            {/* Drag Handle Overlay (invisible handle for motion drag) */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-10 cursor-move"
                onPointerDown={(e) => {
                    focusApp(app.id);
                }}
                drag
                dragMomentum={false}
                onDrag={(e, info) => {
                    updateAppWindow(app.id, { x: app.x + info.delta.x, y: app.y + info.delta.y });
                }}
            />

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[#1c1c1e] text-white">
                {renderContent()}
            </div>

            {/* Resize Handles */}
            <div className="absolute top-0 right-0 w-1 h-full cursor-ew-resize hover:bg-white/10" onMouseDown={(e) => handleResize(e, 'e')} />
            <div className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize hover:bg-white/10" onMouseDown={(e) => handleResize(e, 's')} />
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-white/20 z-50 flex items-center justify-center">
                <div className="w-1 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize" onMouseDown={(e) => handleResize(e, 'se')} />
        </motion.div>
    );
};

export default AppWindow;
