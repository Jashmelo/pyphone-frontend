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
    const [suspension, setSuspension] = useState(null); // { reason, expireTime, suspended_at }
    const [userWallpapers, setUserWallpapers] = useState({}); // Store wallpaper for each user
    const [adminWallpaper, setAdminWallpaper] = useState('neural'); // Store admin's wallpaper before impersonating
    const [fullscreenAppId, setFullscreenAppId] = useState(null); // Track which app is fullscreen

    // Load user from local storage and check suspension on mount
    useEffect(() => {
        const saved = localStorage.getItem('pyphone_user');
        const rememberMe = localStorage.getItem('pyphone_remember_me') === 'true';
        const savedSuspension = localStorage.getItem('pyphone_suspension');
        const savedWallpapers = localStorage.getItem('pyphone_wallpapers');
        
        // Load wallpaper settings for all users
        if (savedWallpapers) {
            setUserWallpapers(JSON.parse(savedWallpapers));
        }
        
        if (saved && rememberMe) {
            const userData = JSON.parse(saved);
            
            // If we have a saved suspension from localStorage, restore it
            if (savedSuspension) {
                const suspensionData = JSON.parse(savedSuspension);
                const now = Date.now();
                
                if (suspensionData.expireTime > now) {
                    // Suspension still active
                    setSuspension(suspensionData);
                    setUser(userData);
                    setIsLocked(false);
                    console.log('[useEffect] Restored suspension from localStorage');
                    return;
                } else {
                    // Suspension expired
                    localStorage.removeItem('pyphone_suspension');
                }
            }
            
            // Check if account is suspended on backend
            checkSuspension(userData.username).then(suspensionData => {
                if (suspensionData) {
                    // User is suspended - show suspension screen
                    setSuspension(suspensionData);
                    localStorage.setItem('pyphone_suspension', JSON.stringify(suspensionData));
                    setUser(userData);
                    setIsLocked(false);
                } else {
                    // User is not suspended - log them in
                    localStorage.removeItem('pyphone_suspension');
                    setUser(userData);
                    setIsLocked(false);
                }
            });
        } else if (saved) {
            // Clear saved user if remember me is not enabled
            localStorage.removeItem('pyphone_user');
            localStorage.removeItem('pyphone_suspension');
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

    // Check suspension status from backend
    const checkSuspension = async (username) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${username}/suspension`);
            if (res.ok) {
                const data = await res.json();
                console.log('[checkSuspension] Response:', data);
                
                if (data.is_suspended && data.expire_time) {
                    const now = Date.now();
                    const expireTime = new Date(data.expire_time).getTime();
                    const remaining = expireTime - now;
                    
                    console.log(`[checkSuspension] User ${username} suspended`);
                    console.log(`[checkSuspension] Expire time (ISO): ${data.expire_time}`);
                    console.log(`[checkSuspension] Expire time (ms): ${expireTime}`);
                    console.log(`[checkSuspension] Time remaining: ${remaining}ms (${(remaining/1000).toFixed(0)}s)`);
                    
                    if (remaining > 0) {
                        // Suspension is still active
                        const suspensionData = {
                            reason: data.reason || 'No reason provided',
                            expireTime: expireTime,
                            suspended_at: data.suspended_at
                        };
                        return suspensionData;
                    }
                }
            }
        } catch (err) {
            console.error('[checkSuspension] Error:', err);
        }
        return null;
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
        try {
            const response = await fetch(endpoints.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            // Check for 403 (suspended) response
            if (response.status === 403) {
                console.log('[login] User suspended - 403 response');
                const detail = data?.detail;
                
                if (typeof detail === 'object' && detail?.error === 'Account suspended') {
                    const userData = {
                        username: username,
                        settings: { clock_24h: true, wallpaper: 'neural' }
                    };
                    
                    const expireTime = new Date(detail.expire_time).getTime();
                    const remaining = expireTime - Date.now();
                    
                    console.log('[login] Setting suspension state');
                    console.log(`[login] Expire time (ISO): ${detail.expire_time}`);
                    console.log(`[login] Expire time (ms): ${expireTime}`);
                    console.log(`[login] Time remaining: ${remaining}ms (${(remaining/1000).toFixed(0)}s)`);
                    
                    const suspensionData = {
                        reason: detail.reason || 'No reason provided',
                        expireTime: expireTime,
                        suspended_at: detail.suspended_at || new Date().toISOString()
                    };
                    
                    setSuspension(suspensionData);
                    localStorage.setItem('pyphone_suspension', JSON.stringify(suspensionData));
                    setUser(userData);
                    setIsLocked(false);
                    
                    localStorage.setItem('pyphone_user', JSON.stringify(userData));
                    localStorage.removeItem('pyphone_remember_me');
                    
                    return 'suspended';
                }
            }
            
            // Check for successful login (200)
            if (response.ok) {
                const userData = {
                    username: data.username,
                    settings: { clock_24h: true, wallpaper: 'neural' }
                };
                
                // Check for suspension after successful password verification
                const suspensionData = await checkSuspension(username);
                if (suspensionData) {
                    setSuspension(suspensionData);
                    localStorage.setItem('pyphone_suspension', JSON.stringify(suspensionData));
                    setUser(userData);
                    setIsLocked(false);
                } else {
                    localStorage.removeItem('pyphone_suspension');
                    setUser(userData);
                    setIsLocked(false);
                }
                
                localStorage.setItem('pyphone_user', JSON.stringify(userData));
                if (rememberMe) {
                    localStorage.setItem('pyphone_remember_me', 'true');
                } else {
                    localStorage.removeItem('pyphone_remember_me');
                }
                
                return true;
            } else {
                console.error('Login failed:', data?.detail);
                return false;
            }
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        }
    };

    const impersonate = (username) => {
        if (user?.username === 'admin') {
            // Save admin's current wallpaper before switching
            setAdminWallpaper(user.settings.wallpaper || 'neural');
            sessionStorage.setItem('true_admin', 'admin');
            setTrueAdmin('admin');
        }

        // Get wallpaper for this user, default to 'neural'
        const userWallpaper = userWallpapers[username] || 'neural';

        const userData = {
            username,
            settings: {
                clock_24h: true,
                wallpaper: userWallpaper
            }
        };
        setUser(userData);
        setIsLocked(false);
        setApps([]);
        setMinimizedApps([]);
        setSuspension(null);
        setFullscreenAppId(null);
        localStorage.removeItem('pyphone_suspension');
        localStorage.setItem('pyphone_user', JSON.stringify(userData));
    };

    const stopImpersonation = () => {
        const originalAdmin = {
            username: 'admin',
            settings: {
                clock_24h: true,
                wallpaper: adminWallpaper // Use the saved admin wallpaper
            }
        };
        setUser(originalAdmin);
        setTrueAdmin(null);
        setSuspension(null);
        setFullscreenAppId(null);
        localStorage.removeItem('pyphone_suspension');
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

        // Save wallpaper preference for this user
        if (newSettings.wallpaper) {
            const updatedWallpapers = { ...userWallpapers, [user.username]: newSettings.wallpaper };
            setUserWallpapers(updatedWallpapers);
            localStorage.setItem('pyphone_wallpapers', JSON.stringify(updatedWallpapers));
            
            // Also save to adminWallpaper if this is the admin account
            if (user.username === 'admin') {
                setAdminWallpaper(newSettings.wallpaper);
            }
        }

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
        setFullscreenAppId(null);
        sessionStorage.removeItem('true_admin');
        setIsLocked(true);
        setApps([]);
        setMinimizedApps([]);
        localStorage.removeItem('pyphone_user');
        localStorage.removeItem('pyphone_remember_me');
        localStorage.removeItem('pyphone_suspension');
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
        // Clear fullscreen when closing
        if (fullscreenAppId === id) {
            setFullscreenAppId(null);
        }
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

    const toggleFullscreen = (appId) => {
        setFullscreenAppId(fullscreenAppId === appId ? null : appId);
    };

    return (
        <OSContext.Provider value={{
            user, trueAdmin, isLocked, apps, activeApp, formattedTime: formatTime(), deviceType, suspension, fullscreenAppId,
            login, register, logout, impersonate, stopImpersonation, updateSettings, deleteAccount,
            openApp, closeApp, focusApp, updateAppWindow, minimizedApps, minimizeApp, restoreApp, toggleFullscreen
        }}>
            {children}
        </OSContext.Provider>
    );
};

export const useOS = () => useContext(OSContext);