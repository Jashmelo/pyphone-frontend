import React, { useRef, useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
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

// Optimized app dimensions for different screen sizes and device type
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
    const { closeApp, focusApp, activeApp, updateAppWindow, minimizeApp, restoreApp, minimizedApps } = useOS();
    const [deviceType, setDeviceType] = useState('desktop');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [preFullscreenState, setPreFullscreenState] = useState(null);
    const [appBarVisible, setAppBarVisible] = useState(true);
    const isActive = activeApp === app.id;
    const windowRef = useRef(null);
    const dragStartPos = useRef(null);

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
        minimizeApp(app.id);
    };

    const handleFullscreen = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (isFullscreen) {
            // Restore to previous size
            if (preFullscreenState) {
                updateAppWindow(app.id, preFullscreenState);
            }
            setIsFullscreen(false);
            setPreFullscreenState(null);
        } else {
            // Save current state and go fullscreen
            setPreFullscreenState({
                x: app.x,
                y: app.y,
                width: app.width,
                height: app.height
            });
            updateAppWindow(app.id, {
                x: 0,
                y: 0,
                width: window.innerWidth,
                height: window.innerHeight
            });
            setIsFullscreen(true);
        }
    };

    const handleClose = (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeApp(app.id);
    };

    // Handle window dragging with instant feedback
    // ONLY constraint: title bar cannot go above 40px (app bar height)
    // Windows can go off-screen on sides and bottom
    const handleTitleBarMouseDown = (e) => {
        if (isFullscreen || e.button !== 0) return; // Only left mouse button
        e.preventDefault();
        focusApp(app.id);
        
        dragStartPos.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            windowX: app.x,
            windowY: app.y
        };

        const onMouseMove = (moveEvent) => {
            if (!dragStartPos.current) return;

            const deltaX = moveEvent.clientX - dragStartPos.current.mouseX;
            const deltaY = moveEvent.clientY - dragStartPos.current.mouseY;

            let newX = dragStartPos.current.windowX + deltaX;
            let newY = dragStartPos.current.windowY + deltaY;

            // ONLY constraint: Top bar cannot go above 40px (app bar height)
            newY = Math.max(40, newY);
            
            // Allow windows to go off-screen on sides and bottom
            // No left, right, or bottom constraints

            updateAppWindow(app.id, { x: newX, y: newY });
        };

        const onMouseUp = () => {
            dragStartPos.current = null;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const handleResize = (e, direction) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Don't allow resize when fullscreen
        if (isFullscreen) return;

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

            // Min constraints - only enforce minimum size
            if (newWidth < 400) { 
                newWidth = 400; 
                newX = app.x; 
            }
            if (newHeight < 300) { 
                newHeight = 300; 
                newY = app.y; 
            }

            // Top constraint: ensure top bar doesn't go above 40px
            if (newY < 40) {
                if (direction.includes('n')) {
                    // When resizing from top, clamp to 40px
                    const diff = 40 - newY;
                    newY = 40;
                    newHeight = newHeight - diff;
                    if (newHeight < 300) newHeight = 300; // Maintain min height
                }
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

    if (minimizedApps.includes(app.id)) {
        return null; // Minimized apps don't render as windows
    }

    return (
        <div
            ref={windowRef}
            style={{
                position: 'absolute',
                left: `${app.x}px`,
                top: `${app.y}px`,
                width: `${app.width}px`,
                height: `${app.height}px`,
                zIndex: isActive ? 50 : 10
            }}
            className={`bg-[#1c1c1e] rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col pointer-events-auto
                ${isActive ? 'ring-2 ring-white/20' : ''}
                ${isFullscreen ? 'rounded-none' : 'rounded-2xl'}
            `}
            onClick={() => focusApp(app.id)}
        >
            {/* Title Bar */}
            <div
                onMouseDown={handleTitleBarMouseDown}
                className="h-10 bg-gradient-to-b from-[#3c3c3e] to-[#2c2c2e] flex items-center justify-between px-4 select-none cursor-move shrink-0 border-b border-white/5 group"
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
                            title="Minimize to dock"
                        />
                        {/* Green Fullscreen Button */}
                        <button 
                            onClick={handleFullscreen}
                            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 active:scale-90 transition-all p-2 -m-2 cursor-pointer shadow-sm hover:shadow-md" 
                            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        />
                    </div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-4">
                        {titles[app.appId] || 'App'}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-[#1c1c1e] text-white">
                {renderContent()}
            </div>

            {/* Resize Handles - Hidden when fullscreen */}
            {!isFullscreen && (
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
        </div>
    );
};

export default AppWindow;