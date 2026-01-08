import React, { createContext, useContext, useState, useEffect } from 'react';
import { endpoints } from '../config';

const OSContext = createContext();

export const OSProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { username, settings }
    const [isLocked, setIsLocked] = useState(true);
    const [apps, setApps] = useState([]); // Running app instances { id, appId, zIndex, minimized }
    const [activeApp, setActiveApp] = useState(null);
    const [time, setTime] = useState(new Date());

    // Load user from local storage
    useEffect(() => {
        const saved = localStorage.getItem('pyphone_user');
        if (saved) {
            setUser(JSON.parse(saved));
        }
        setIsLocked(true);

        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = () => {
        const is24 = user?.settings?.clock_24h ?? true;
        return time.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: !is24
        });
    };

    const login = async (username, password) => {
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
                    settings: { clock_24h: true }
                };
                setUser(userData);
                setIsLocked(false);
                localStorage.setItem('pyphone_user', JSON.stringify(userData));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login Error:", error);
            return false;
        }
    };

    const impersonate = (username) => {
        const userData = {
            username,
            settings: { clock_24h: true }
        };
        setUser(userData);
        setIsLocked(false);
        setApps([]); // Clear admin apps
        localStorage.setItem('pyphone_user', JSON.stringify(userData));
    };

    const updateSettings = (newSettings) => {
        const updated = { ...user, settings: { ...user.settings, ...newSettings } };
        setUser(updated);
        localStorage.setItem('pyphone_user', JSON.stringify(updated));
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
        setIsLocked(true);
        setApps([]);
        localStorage.removeItem('pyphone_user');
    };

    const openApp = (appId) => {
        const id = Date.now();
        const newApp = { id, appId, zIndex: apps.length + 1, minimized: false };
        setApps([...apps, newApp]);
        setActiveApp(id);
    };

    const closeApp = (id) => {
        setApps(apps.filter(a => a.id !== id));
        if (activeApp === id) setActiveApp(null);
    };

    const focusApp = (id) => {
        setActiveApp(id);
    };

    return (
        <OSContext.Provider value={{
            user, isLocked, apps, activeApp, formattedTime: formatTime(),
            login, register, logout, impersonate, updateSettings,
            openApp, closeApp, focusApp
        }}>
            {children}
        </OSContext.Provider>
    );
};

export const useOS = () => useContext(OSContext);
