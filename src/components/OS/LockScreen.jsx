import React, { useState } from 'react';
import { useOS } from '../../context/OSContext';
import { Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const LockScreen = () => {
    const { login, register } = useOS();
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                const success = await login(username, password);
                if (!success) {
                    setError('Invalid credentials');
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
                    setError('Registration failed (User exists?)');
                }
            }
        } catch (err) {
            setError('An error occurred. check connection.');
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

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-2 rounded-lg font-medium transition-colors ${isLoading ? 'bg-indigo-600/50 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'}`}
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
