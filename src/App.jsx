import React, { useState, useEffect } from 'react';
import { useOS } from './context/OSContext';
import NeuralBackground from './components/UI/NeuralBackground';
import LockScreen from './components/OS/LockScreen';
import Dock from './components/OS/Dock';
import AppWindow from './components/OS/AppWindow';
import MobileAppView from './components/OS/MobileAppView';
import { AnimatePresence } from 'framer-motion';

const MobileHome = () => {
    const { apps } = useOS();
    const [showDock, setShowDock] = useState(true);

    // Hide dock when app is open
    useEffect(() => {
        setShowDock(apps.length === 0);
    }, [apps]);

    return (
        <div className="relative h-screen w-screen overflow-hidden flex flex-col">
            {/* Mobile Status Bar - Smaller for portrait */}
            <div className="h-6 bg-black/40 backdrop-blur-sm flex justify-between items-center px-3 text-white text-[10px] z-40 shrink-0">
                <span className="font-bold">PyPhone</span>
                <span>--:-- </span>
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

const OSLayout = () => {
    const { isLocked, user, deviceType } = useOS();
    const wallpaper = user?.settings?.wallpaper || 'neural';
    const isMobileOrTablet = deviceType === 'mobile' || deviceType === 'tablet';

    return (
        <>
            <NeuralBackground theme={wallpaper} />
            {isLocked ? (
                <LockScreen />
            ) : isMobileOrTablet ? (
                <MobileHome />
            ) : (
                <Desktop />
            )}
        </>
    );
};

function App() {
    return <OSLayout />;
}

export default App;