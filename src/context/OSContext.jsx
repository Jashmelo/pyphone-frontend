import React, { createContext, useContext, useState, useEffect } from 'react';
import { endpoints } from '../config';

const OSContext = createContext();

export const OSProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { username, settings }
    const [isLocked, setIsLocked] = useState(true);
    const [apps, setApps] = useState([]); // Running app instances { id, appId, zIndex, minimized }
    const [activeApp, setActiveApp] = useState(null);

    // Load user from local storage
    useEffect(() => {
        const saved = localStorage.getItem('pyphone_user');
        if (saved) {
            setUser(JSON.parse(saved));
            setIsLocked(true);
        } else {
            setIsLocked(false); // Setup mode? Or just lockscreen with Register option
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch(endpoints.login, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();

            if (response.ok) {
                setUser({ username: data.username });
                setIsLocked(false);
                localStorage.setItem('pyphone_user', JSON.stringify({ username: data.username }));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login Error:", error);
            return false;
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
                    confirm_password: confirmPassword || password // Handle default UI which might not have confirm
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
        // Bring to front logic could be added here
    };

    return (
        <OSContext.Provider value={{
            user, isLocked, apps, activeApp,
            login, register, logout,
            openApp, closeApp, focusApp
        }}>
            {children}
        </OSContext.Provider>
    );
};

export const useOS = () => useContext(OSContext);
