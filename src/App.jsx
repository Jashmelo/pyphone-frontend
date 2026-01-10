import React, { useState, useEffect } from 'react';
import { useOS } from './context/OSContext';
import NeuralBackground from './components/UI/NeuralBackground';
import LockScreen from './components/OS/LockScreen';
import Dock from './components/OS/Dock';
import AppWindow from './components/OS/AppWindow';
import MobileAppView from './components/OS/MobileAppView';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const MobileHome = () => {
    const { apps, user } = useOS();
    const [showDock, setShowDock] = useState(true);
    const [time, setTime] = useState(new Date());

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Hide dock when app is open
    useEffect(() => {
        setShowDock(apps.length === 0);
    }, [apps]);

    const formatTime = (date) => {
        const is24 = user?.settings?.clock_24h ?? true;
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: !is24
        });
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden flex flex-col">
            {/* Mobile Status Bar - Smaller for portrait */}
            <div className="h-6 bg-black/40 backdrop-blur-sm flex justify-between items-center px-3 text-white text-[10px] z-40 shrink-0">
                <span className="font-bold">PyPhone</span>
                <span>{formatTime(time)}</span>
            </div>

            {/* App Content Area */}
            <div className="flex-1 relative z-0 w-full overflow-hidden">
                <AnimatePresence>
                    {apps.length > 0 && apps[apps.length - 1] ? (
                        <MobileAppView key={apps[apps.length - 1].id} app={apps[apps.length - 1]} />
                    ) : null}
                </AnimatePresence>
            </div>

            {/* Dock - Hidden when app is open */}
            {showDock && <Dock />}
        </div>
    );
};

const Desktop = () => {
    const { apps, formattedTime } = useOS();

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {/* Status Bar (Simplistic) */}
            <div className="absolute top-0 w-full h-8 bg-black/20 backdrop-blur-sm flex justify-between items-center px-4 text-white text-xs z-40">
                <span>PyPhone Web OS</span>
                <span>{formattedTime}</span>
            </div>

            <div className="relative z-0 h-full w-full">
                <AnimatePresence>
                    {apps.map(app => (
                        <AppWindow key={app.id} app={app} />
                    ))}
                </AnimatePresence>
            </div>

            <Dock />
        </div>
    );
};

const SuspensionWarning = ({ suspension, user, logout }) => {
    const [remainingTime, setRemainingTime] = useState(0);

    // Update remaining suspension time every second
    useEffect(() => {
        if (!suspension || !user) return;
        
        const updateTime = () => {
            const now = Date.now();
            const remaining = Math.max(0, suspension.expireTime - now);
            setRemainingTime(remaining);
            
            // Auto-logout when suspension expires
            if (remaining <= 0) {
                logout();
            }
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [suspension, user, logout]);

    // Format milliseconds to readable time format
    const formatRemainingTime = (ms) => {
        if (ms <= 0) return 'Expired';
        
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
        
        return parts.join(' ');
    };

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900 z-[9999] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="bg-slate-950/80 backdrop-blur-xl p-8 rounded-2xl border border-red-500/50 w-96 shadow-2xl text-center"
            >
                {/* Warning Icon */}
                <div className="flex justify-center mb-6">
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="bg-red-600/30 border border-red-500/60 p-4 rounded-full"
                    >
                        <AlertTriangle size={48} className="text-red-400" strokeWidth={1.5} />
                    </motion.div>
                </div>

                {/* Title */}
                <h2 className="text-3xl font-bold text-red-400 mb-1">Account Temporarily Blocked</h2>
                <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-semibold">⚠️ Kernel Access Restricted</p>

                {/* Suspension Details Box */}
                <div className="bg-red-900/20 border border-red-500/40 rounded-lg p-5 mb-6 text-left space-y-4">
                    {/* Username */}
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Username</p>
                        <p className="text-sm text-white font-mono mt-1">@{user.username}</p>
                    </div>

                    {/* Reason */}
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Suspension Reason</p>
                        <p className="text-sm text-red-300 mt-1 italic">"{suspension.reason}"</p>
                    </div>

                    {/* Time Remaining */}
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Time Remaining</p>
                        <motion.div
                            key={remainingTime}
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 1 }}
                            className="text-xl text-yellow-300 font-mono font-bold mt-1"
                        >
                            {formatRemainingTime(remainingTime)}
                        </motion.div>
                    </div>

                    {/* Suspended At */}
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest">Suspended At</p>
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                            {suspension.suspended_at ? new Date(suspension.suspended_at).toLocaleString() : 'Unknown'}
                        </p>
                    </div>
                </div>

                {/* Info Message */}
                <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 mb-6">
                    <p className="text-xs text-gray-300 leading-relaxed">
                        Your account has been temporarily suspended. You will regain access once the suspension period expires. Please try again later.
                    </p>
                </div>

                {/* Log Out Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={logout}
                    className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 uppercase text-sm tracking-wider"
                >
                    Log Out
                </motion.button>
            </motion.div>
        </div>
    );
};

const OSLayout = () => {
    const { isLocked, user, suspension, logout, deviceType } = useOS();
    const wallpaper = user?.settings?.wallpaper || 'neural';
    const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';

    // Check if user is suspended
    const isSuspended = user && suspension && !isLocked;

    return (
        <>
            <NeuralBackground theme={wallpaper} />
            {isLocked ? (
                <LockScreen />
            ) : isMobileOrTablet ? (
                <>
                    <MobileHome />
                    {isSuspended && <SuspensionWarning suspension={suspension} user={user} logout={logout} />}
                </>
            ) : (
                <>
                    <Desktop />
                    {isSuspended && <SuspensionWarning suspension={suspension} user={user} logout={logout} />}
                </>
            )}
        </>
    );
};

function App() {
    return <OSLayout />;
}

export default App;