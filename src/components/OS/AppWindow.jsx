import React, { useRef, useState, useEffect } from 'react';
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

// Default app dimensions for different screen sizes
const APP_SIZES = {
    mobile: { notes: { w: 320, h: 400 }, messages: { w: 320, h: 500 }, friends: { w: 320, h: 450 }, games: { w: 320, h: 500 }, utils: { w: 320, h: 400 }, settings: { w: 320, h: 450 }, admin: { w: 320, h: 500 }, studio: { w: 320, h: 600 }, nexus: { w: 320, h: 500 } },
    tablet: { notes: { w: 600, h: 500 }, messages: { w: 600, h: 600 }, friends: { w: 600, h: 550 }, games: { w: 700, h: 600 }, utils: { w: 600, h: 500 }, settings: { w: 600, h: 550 }, admin: { w: 750, h: 600 }, studio: { w: 900, h: 700 }, nexus: { w: 700, h: 600 } },
    desktop: { notes: { w: 800, h: 600 }, messages: { w: 800, h: 700 }, friends: { w: 750, h: 650 }, games: { w: 900, h: 700 }, utils: { w: 800, h: 600 }, settings: { w: 850, h: 650 }, admin: { w: 1000, h: 700 }, studio: { w: 1200, h: 800 }, nexus: { w: 900, h: 750 } }
};

const AppWindow = ({ app }) => {
    const { closeApp, focusApp, activeApp, updateAppWindow } = useOS();
    const [deviceType, setDeviceType] = useState('desktop');
    const [isMinimized, setIsMinimized] = useState(false);
    const isActive = activeApp === app.id;
    const windowRef = useRef(null);

    // Detect device type on mount and on resize
    useEffect(() => {
        const detectDevice = () => {
            const width = window.innerWidth;
            if (width < 768) setDeviceType('mobile');
            else if (width < 1024) setDeviceType('tablet');
            else setDeviceType('desktop');
        };
        detectDevice();
        window.addEventListener('resize', detectDevice);
        return () => window.removeEventListener('resize', detectDevice);
    }, []);

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

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
    };

    const handleMaximize = () => {
        const screenPadding = 20;
        updateAppWindow(app.id, {
            x: screenPadding,
            y: screenPadding,
            width: window.innerWidth - 2 * screenPadding,
            height: window.innerHeight - 2 * screenPadding - 40
        });
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

    if (isMinimized) {
        return (
            <div className="fixed bottom-4 right-4 bg-[#2c2c2e] border border-white/10 rounded-lg p-2 cursor-pointer hover:bg-[#3c3c3e] transition-all z-50" onClick={handleMinimize}>
                <p className="text-[10px] text-white font-bold whitespace-nowrap">{titles[app.appId]}</p>
            </div>
        );
    }

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
                }}
            >
                <div className="flex gap-2 items-center">
                    <div className="flex gap-5 mr-8">
                        <button onClick={() => closeApp(app.id)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors p-2 -m-2 cursor-pointer" />
                        <button onClick={handleMinimize} className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors p-2 -m-2 cursor-pointer" title="Minimize" />
                        <button onClick={handleMaximize} className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors p-2 -m-2 cursor-pointer" title="Maximize" />
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