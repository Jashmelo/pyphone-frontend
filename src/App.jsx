import React from 'react';
import { useOS } from './context/OSContext';
import NeuralBackground from './components/UI/NeuralBackground';
import LockScreen from './components/OS/LockScreen';
import Dock from './components/OS/Dock';
import AppWindow from './components/OS/AppWindow';
import { AnimatePresence } from 'framer-motion';

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

const AppContent = () => {
    const { isLocked } = useOS();

    return (
        <>
            <NeuralBackground />
            {isLocked ? <LockScreen /> : <Desktop />}
        </>
    );
};

function App() {
    return (
        <AppContent />
    );
}

export default App;
