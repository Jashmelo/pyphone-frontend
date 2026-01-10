import React, { useState, useEffect } from 'react';
import { useOS } from '../../context/OSContext';
import { Lock, User, CheckCircle2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const LockScreen = () => {
    const { login, register, suspension, logout, user } = useOS();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);

    // Update remaining suspension time every second
    useEffect(() => {
        if (!suspension || !user) return;
        
        const updateTime = () => {
            const now = Date.now();
            const remaining = Math.max(0, suspension.expireTime - now);
            setRemainingTime(remaining);
        };
        
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [suspension, user]);

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

    // If user is suspended, show suspension warning screen
    if (user && suspension && remainingTime > 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white z-50 relative bg-gradient-to-br from-slate-900 via-red-900/30 to-slate-900">
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
                        onClick={() => {
                            logout();
                            setMode('login');
                            setUsername('');
                            setPassword('');
                        }}
                        className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white py-3 rounded-lg font-semibold transition-all duration-200 uppercase text-sm tracking-wider"
                    >
                        Log Out
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    // Normal login/register screen
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                const success = await login(username, password, rememberMe);
                if (!success) {
                    setError('Invalid username or password');
                }
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                const success = await register(username, password, confirmPassword);
                if (success) {
                    setMode('login');
                    setError('Account created! Please login.');
                    setPassword('');
                    setConfirmPassword('');
                } else {
                    setError('Registration failed - user may already exist');
                }
            }
        } catch (err) {
            setError('Connection error - please check your network');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white z-50 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 w-80 shadow-2xl"
            >
                <div className="flex justify-center mb-6">
                    <div className="bg-white/10 p-4 rounded-full">
                        <Lock size={32} />
                    </div>
                </div>

                <h2 className="text-2xl font-light text-center mb-6">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                    />

                    {mode === 'register' && (
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    )}

                    {mode === 'login' && (
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-gray-300">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={e => setRememberMe(e.target.checked)}
                                className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                            />
                            Remember me
                        </label>
                    )}

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-red-400 text-sm text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${
                            isLoading ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
                        }`}
                    >
                        {isLoading ? 'Processing...' : (mode === 'login' ? 'Unlock' : 'Register')}
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <button
                        onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                        className="text-white/50 text-sm hover:text-white transition-colors"
                    >
                        {mode === 'login' ? 'New user? Create account' : 'Have an account? Login'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LockScreen;