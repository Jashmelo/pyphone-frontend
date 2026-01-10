import React, { createContext, useContext, useState, useEffect } from 'react';
import { endpoints, API_BASE_URL } from '../config';

const OSContext = createContext();

// App-specific sizing for different devices
const APP_SIZES = {
    mobile: { notes: { w: 320, h: 400 }, messages: { w: 320, h: 500 }, friends: { w: 320, h: 450 }, games: { w: 320, h: 500 }, utils: { w: 320, h: 400 }, settings: { w: 320, h: 450 }, admin: { w: 320, h: 500 }, studio: { w: 320, h: 600 }, nexus: { w: 320, h: 500 }, chess: { w: 320, h: 650 } },
    tablet: { notes: { w: 600, h: 500 }, messages: { w: 600, h: 600 }, friends: { w: 600, h: 550 }, games: { w: 700, h: 600 }, utils: { w: 600, h: 500 }, settings: { w: 600, h: 550 }, admin: { w: 750, h: 600 }, studio: { w: 900, h: 700 }, nexus: { w: 700, h: 600 }, chess: { w: 650, h: 750 } },
    desktop: { notes: { w: 800, h: 600 }, messages: { w: 800, h: 700 }, friends: { w: 750, h: 650 }, games: { w: 900, h: 700 }, utils: { w: 800, h: 600 }, settings: { w: 850, h: 650 }, admin: { w: 1000, h: 700 }, studio: { w: 1200, h: 800 }, nexus: { w: 900, h: 750 }, chess: { w: 900, h: 850 } }
};

const getDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
};

export const OSProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [trueAdmin, setTrueAdmin] = useState(sessionStorage.getItem('true_admin'));
    const [isLocked, setIsLocked] = useState(true);
    const [apps, setApps] = useState([]);
    const [minimizedApps, setMinimizedApps] = useState([]);
    const [activeApp, setActiveApp] = useState(null);
    const [time, setTime] = useState(new Date());
    const [deviceType, setDeviceType] = useState(getDeviceType());
    const [suspension, setSuspension] = useState(null); // { reason, expireTime } for blocked accounts

    // Load user from local storage and check suspension on mount
    useEffect(() => {
        const saved = localStorage.getItem('pyphone_user');
        const rememberMe = localStorage.getItem('pyphone_remember_me') === 'true';
        
        if (saved && rememberMe) {
            const userData = JSON.parse(saved);
            // Check if account is suspended
            checkSuspension(userData.username).then(suspensionData => {
                if (suspensionData) {
                    // User is suspended - show suspension screen
                    setSuspension(suspensionData);
                    setUser(userData);
                    setIsLocked(false); // Show suspension screen (not login screen)
                } else {
                    // User is not suspended - log them in
                    setUser(userData);
                    setIsLocked(false);
                }
            });
        } else if (saved) {
            // Clear saved user if remember me is not enabled
            localStorage.removeItem('pyphone_user');
            setIsLocked(true);
        } else {
            setIsLocked(true);
        }

        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Detect device changes
    useEffect(() => {
        const handleResize = () => setDeviceType(getDeviceType());
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Check suspension status periodically for logged-in suspended users
    useEffect(() => {
        if (!user || !suspension) return;
        
        const interval = setInterval(() => {
            const now = Date.now();
            if (now >= suspension.expireTime) {
                // Suspension has expired - auto-logout
                setSuspension(null);
                logout();
            }
        }, 1000);
        
        return () => clearInterval(interval);
    }, [user, suspension]);

    const checkSuspension = async (username) => {
        """Check suspension status from backend - CRITICAL FIX"""
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${username}/suspension`);
            if (res.ok) {
                const data = await res.json();
                // Check if user is suspended AND suspension hasn't expired
                if (data.is_suspended && data.expire_time) {
                    const now = Date.now();
                    const expireTime = new Date(data.expire_time).getTime();
                    if (now < expireTime) {
                        // Suspension is still active
                        return {
                            reason: data.reason || 'No reason provided',
                            expireTime: expireTime,
                            suspended_at: data.suspended_at
                        };
                    }
                }
            }
        } catch (err) {
            console.error('Suspension check error:', err);
        }
        return null; // No suspension
    };

    const formatTime = () => {
        const is24 = user?.settings?.clock_24h ?? true;
        return time.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !is24
        });
    };

    const login = async (username, password, rememberMe = false) => {
        """Login function - handles suspension response from backend"""
        try {
            const response = await fetch(endpoints.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (response.ok) {
                const userData = {
                    username: data.username,
                    settings: { clock_24h: true, wallpaper: 'neural' }
                };
                
                // Check for suspension after successful password verification
                const suspensionData = await checkSuspension(username);
                if (suspensionData) {
                    // User is suspended - keep them logged in but show suspension screen
                    setSuspension(suspensionData);
                    setUser(userData);
                    setIsLocked(false); // Show suspension screen instead of unlocking
                } else {
                    // User is not suspended - normal login
                    setUser(userData);
                    setIsLocked(false);
                }
                
                // Save remember me preference
                localStorage.setItem('pyphone_user', JSON.stringify(userData));
                if (rememberMe) {
                    localStorage.setItem('pyphone_remember_me', 'true');
                } else {
                    localStorage.removeItem('pyphone_remember_me');
                }
                
                return true;
            } else {
                // Handle backend rejection (may include suspension info)
                const errorMsg = data?.detail?.error || data?.detail || 'Login failed';
                console.error('Login failed:', errorMsg);
                return false;
            }
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        }
    };

    const impersonate = (username) => {
        if (user?.username === 'admin') {
            sessionStorage.setItem('true_admin', 'admin');
            setTrueAdmin('admin');
        }

        const userData = {
            username,
            settings: user?.settings || { clock_24h: true, wallpaper: 'neural' }
        };
        setUser(userData);
        setIsLocked(false);
        setApps([]);
        setMinimizedApps([]);
        localStorage.setItem('pyphone_user', JSON.stringify(userData));
    };

    const stopImpersonation = () => {
        const originalAdmin = {
            username: 'admin',
            settings: { clock_24h: true, wallpaper: 'neural' }
        };
        setUser(originalAdmin);
        setTrueAdmin(null);
        sessionStorage.removeItem('true_admin');
        setApps([]);
        setMinimizedApps([]);
        localStorage.setItem('pyphone_user', JSON.stringify(originalAdmin));
    };

    const deleteAccount = async () => {
        if (!user?.username) return;
        try {
            await fetch(`${endpoints.adminUsers}/${user.username}`, { method: 'DELETE' });
            logout();
        } catch (err) { console.error("Deletion failed", err); }
    };

    const updateSettings = async (newSettings) => {
        const updatedSettings = { ...user.settings, ...newSettings };
        const updatedUser = { ...user, settings: updatedSettings };
        setUser(updatedUser);
        localStorage.setItem('pyphone_user', JSON.stringify(updatedUser));

        try {
            await fetch(`${API_BASE_URL}/api/users/${user.username}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
        } catch (err) {
            console.error("Settings sync failed", err);
        }
    };

    const register = async (username, password, confirmPassword) => {
        try {
            const response = await fetch(endpoints.register, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    password,
                    confirm_password: confirmPassword || password
                }),
            });

            if (response.ok) {
                return true;
            }
            return false;
        } catch (error) {
            console.error("Register Error:", error);
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        setTrueAdmin(null);
        setSuspension(null);
        sessionStorage.removeItem('true_admin');
        setIsLocked(true);
        setApps([]);
        setMinimizedApps([]);
        localStorage.removeItem('pyphone_user');
        localStorage.removeItem('pyphone_remember_me');
    };

    const openApp = (appId) => {
        const id = Date.now();
        const appSizes = APP_SIZES[deviceType] || APP_SIZES.desktop;
        const size = appSizes[appId] || { w: 800, h: 600 };
        
        setApps(prev => {
            const newApp = {
                id,
                appId,
                zIndex: prev.length + 1,
                minimized: false,
                x: 100 + (prev.length * 20),
                y: 100 + (prev.length * 20),
                width: size.w,
                height: size.h
            };
            return [...prev, newApp];
        });
        setActiveApp(id);
    };

    const updateAppWindow = (id, updates) => {
        setApps(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    };

    const closeApp = (id) => {
        setApps(apps.filter(a => a.id !== id));
        setMinimizedApps(minimizedApps.filter(appId => appId !== id));
        if (activeApp === id) setActiveApp(null);
    };

    const minimizeApp = (id) => {
        if (!minimizedApps.includes(id)) {
            setMinimizedApps([...minimizedApps, id]);
        }
    };

    const restoreApp = (id) => {
        setMinimizedApps(minimizedApps.filter(appId => appId !== id));
        setActiveApp(id);
    };

    const focusApp = (id) => {
        setActiveApp(id);
    };

    return (
        <OSContext.Provider value={{
            user, trueAdmin, isLocked, apps, activeApp, formattedTime: formatTime(), deviceType, suspension,
            login, register, logout, impersonate, stopImpersonation, updateSettings, deleteAccount,
            openApp, closeApp, focusApp, updateAppWindow, minimizedApps, minimizeApp, restoreApp
        }}>
            {children}
        </OSContext.Provider>
    );
};

export const useOS = () => useContext(OSContext);