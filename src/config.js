export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://pyphone.onrender.com";

export const endpoints = {
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    notes: (username) => `${API_BASE_URL}/api/notes/${username}`,
    messages: (username) => `${API_BASE_URL}/api/messages/${username}`,
    apps: (username) => `${API_BASE_URL}/api/apps/${username}`,
};
