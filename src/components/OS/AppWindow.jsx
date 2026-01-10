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
import ChessGame from '../Apps/ChessGame';

// Optimized app dimensions for different screen sizes and device types
const APP_SIZES = {
    mobile: {
        notes: { w: 320, h: 480 },
        messages: { w: 320, h: 600 },
        friends: { w: 320, h: 550 },
        games: { w: 320, h: 600 },
        utils: { w: 320, h: 480 },
        settings: { w: 320, h: 600 },
        admin: { w: 320, h: 600 },
        studio: { w: 320, h: 700 },
        nexus: { w: 320, h: 600 },
        chess: { w: 320, h: 650 }
    },
    tablet: {
        notes: { w: 600, h: 600 },
        messages: { w: 700, h: 750 },
        friends: { w: 650, h: 700 },
        games: { w: 750, h: 750 },
        utils: { w: 600, h: 600 },
        settings: { w: 700, h: 700 },
        admin: { w: 800, h: 750 },
        studio: { w: 1000, h: 850 },
        nexus: { w: 800, h: 750 },
        chess: { w: 650, h: 750 }
    },
    desktop: {
        notes: { w: 900, h: 700 },
        messages: { w: 1000, h: 800 },
        friends: { w: 950, h: 800 },
        games: { w: 1100, h: 850 },
        utils: { w: 900, h: 700 },
        settings: { w: 1000, h: 800 },
        admin: { w: 1200, h: 850 },
        studio: { w: 1400, h: 900 },
        nexus: { w: 1100, h: 850 },
        chess: { w: 900, h: 850 }
    }
};

const AppWindow = ({ app }) => {
    const { closeApp, focusApp, activeApp, updateAppWindow } = useOS();
    const [deviceType, setDeviceType] = useState('desktop');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [preMaximizeState, setPreMaximizeState] = useState(null);
    const [appBarVisible, setAppBarVisible] = useState(true);
    const isActive = activeApp === app.id;
    const windowRef = useRef(null);

    // Detect device type on mount and on resize
    useEffect(() => {
        const detectDevice = () => {
            const width = window.innerWidth;
            if (width < 768) {
                setDeviceType('mobile');
            } else if (width < 1024) {
                setDeviceType('tablet');
            } else {
                setDeviceType('desktop');
            }
        };
        
        detectDevice();
        window.addEventListener('resize', detectDevice);
        return () => window.removeEventListener('resize', detectDevice);
    }, []);

    // Initialize window size based on device type and app
    useEffect(() => {
        const defaultSize = APP_SIZES[deviceType]?.[app.appId] || APP_SIZES.desktop[app.appId] || { w: 800, h: 600 };
        
        // Center the window
        const x = (window.innerWidth - defaultSize.w) / 2;
        const y = Math.max(60, (window.innerHeight - defaultSize.h) / 2);
        
        updateAppWindow(app.id, {
            width: defaultSize.w,
            height: defaultSize.h,
            x: x,
            y: y
        });
    }, [deviceType]);

    // Check if app bar is blocking the screen and auto-hide
    useEffect(() => {
        const checkAppBarCollision = () => {
            if (windowRef.current) {
                const rect = windowRef.current.getBoundingClientRect();
                const windowTop = rect.top;
                const windowLeft = rect.left;
                const windowRight = rect.right;
                const windowBottom = rect.bottom;
                
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                
                // Check if window is near edges or filling screen
                const isNearTop = windowTop < 60;
                const isNearLeft = windowLeft < 20;
                const isNearRight = windowRight > screenWidth - 20;
                const isFillingHeight = windowBottom > screenHeight - 50;
                
                // Hide app bar if blocking view
                setAppBarVisible(!isNearTop || !isFillingHeight);
            }
        };
        
        checkAppBarCollision();
        const timer = setInterval(checkAppBarCollision, 500);
        return () => clearInterval(timer);
    }, [app.x, app.y, app.width, app.height]);

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

    const handleMinimize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsMinimized(true);
    };

    const handleMaximize = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isMaximized) {
            // Restore to previous size
            if (preMaximizeState) {
                updateAppWindow(app.id, preMaximizeState);
            }
            setIsMaximized(false);
            setPreMaximizeState(null);
        } else {
            // Save current state and maximize
            setPreMaximizeState({
                x: app.x,
                y: app.y,
                width: app.width,
                height: app.height
            });
            const screenPadding = 20;
            updateAppWindow(app.id, {
                x: screenPadding,
                y: screenPadding,
                width: window.innerWidth - 2 * screenPadding,
                height: window.innerHeight - 2 * screenPadding - 40
            });
            setIsMaximized(true);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeApp(app.id);
    };

    const handleResize = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't allow resize when maximized
        if (isMaximized) return;

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
            if (newWidth < 400) { 
                newWidth = 400; 
                newX = app.x; 
            }
            if (newHeight < 300) { 
                newHeight = 300; 
                newY = app.y; 
            }

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
        // Minimized window restores to its own app position
        return (
            <motion.div 
                className="fixed bg-[#2c2c2e] border border-white/10 rounded-lg p-3 cursor-pointer hover:bg-[#3c3c3e] transition-all z-40 shadow-lg hover:shadow-xl"
                style={{
                    bottom: '100px',
                    right: '20px',
                    width: '140px'
                }}
                onClick={() => {
                    setIsMinimized(false);
                    focusApp(app.id);
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            >
                <p className="text-[10px] text-white font-bold whitespace-nowrap truncate">{titles[app.appId]}</p>
                <p className="text-[9px] text-gray-400 mt-1">Click to restore</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={windowRef}
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
            className={`absolute bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col pointer-events-auto transition-all
                ${isActive ? 'z-50 ring-2 ring-white/20' : 'z-10'}
                ${isMaximized ? 'rounded-none' : 'rounded-2xl'}
            `}
            onClick={() => focusApp(app.id)}
        >
            {/* Title Bar - Drag Handle */}
            <motion.div
                className="h-10 bg-gradient-to-b from-[#3c3c3e] to-[#2c2c2e] flex items-center justify-between px-4 select-none cursor-move shrink-0 border-b border-white/5 group"
                drag
                dragMomentum={false}
                dragElastic={0}
                dragListener={true}
                dragTransition={{ power: 0.2, timeConstant: 200 }}
                onPointerDown={(e) => {
                    focusApp(app.id);
                }}
                onDrag={(e, info) => {
                    if (!isMaximized) {
                        updateAppWindow(app.id, { 
                            x: Math.max(0, app.x + info.delta.x), 
                            y: Math.max(40, app.y + info.delta.y) 
                        });
                    }
                }}
            >
                <div className="flex gap-3 items-center">
                    <div className="flex gap-6">
                        {/* Red Close Button */}
                        <button 
                            onClick={handleClose}
                            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 active:scale-90 transition-all p-2 -m-2 cursor-pointer shadow-sm hover:shadow-md" 
                            title="Close window"
                        />
                        {/* Yellow Minimize Button */}
                        <button 
                            onClick={handleMinimize}
                            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 active:scale-90 transition-all p-2 -m-2 cursor-pointer shadow-sm hover:shadow-md" 
                            title="Minimize window"
                        />
                        {/* Green Maximize Button */}
                        <button 
                            onClick={handleMaximize}
                            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 active:scale-90 transition-all p-2 -m-2 cursor-pointer shadow-sm hover:shadow-md" 
                            title={isMaximized ? "Restore window" : "Maximize window"}
                        />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">
                        {titles[app.appId] || 'App'}
                    </span>
                </div>
            </motion.div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[#1c1c1e] text-white">
                {renderContent()}
            </div>

            {/* Resize Handles - Hidden when maximized */}
            {!isMaximized && (
                <>
                    {/* Right edge */}
                    <div 
                        className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize hover:bg-white/20 transition-colors z-40" 
                        onMouseDown={(e) => handleResize(e, 'e')} 
                    />
                    {/* Bottom edge */}
                    <div 
                        className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-white/20 transition-colors z-40" 
                        onMouseDown={(e) => handleResize(e, 's')} 
                    />
                    {/* Bottom-right corner */}
                    <div 
                        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize hover:bg-white/20 transition-colors z-50 flex items-center justify-center rounded-tl-lg" 
                        onMouseDown={(e) => handleResize(e, 'se')}
                    >
                        <div className="w-1.5 h-1.5 bg-white/30 rounded-full" />
                    </div>
                    {/* Top edge for resizing */}
                    <div 
                        className="absolute top-0 left-0 w-full h-1.5 cursor-ns-resize hover:bg-white/20 transition-colors z-40" 
                        onMouseDown={(e) => handleResize(e, 'n')} 
                    />
                    {/* Left edge for resizing */}
                    <div 
                        className="absolute top-0 left-0 w-1.5 h-full cursor-ew-resize hover:bg-white/20 transition-colors z-40" 
                        onMouseDown={(e) => handleResize(e, 'w')} 
                    />
                </>
            )}
        </motion.div>
    );
};

export default AppWindow;