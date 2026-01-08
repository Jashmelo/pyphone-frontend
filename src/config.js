const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
export const API_BASE_URL = isLocal ? "http://localhost:8000" : (import.meta.env.VITE_API_URL || "https://pyphone.onrender.com");

export const endpoints = {
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    notes: (username) => `${API_BASE_URL}/api/notes/${username}`,
    messages: (username) => `${API_BASE_URL}/api/messages/${username}`,
    search: (query) => `${API_BASE_URL}/api/search/${query}`,
    friends: (username) => `${API_BASE_URL}/api/friends/${username}`,
    friendRequest: `${API_BASE_URL}/api/friends/request`,
    acceptFriend: `${API_BASE_URL}/api/friends/accept`,
    adminStats: `${API_BASE_URL}/api/admin/stats`,
    adminFeedback: `${API_BASE_URL}/api/admin/feedback`,
    adminUsers: `${API_BASE_URL}/api/admin/users`,
    adminApps: `${API_BASE_URL}/api/admin/apps`,
    adminAppVisibility: `${API_BASE_URL}/api/admin/apps/visibility`,
    apps: (username) => `${API_BASE_URL}/api/apps/${username}`,
    upload: (username) => `${API_BASE_URL}/api/upload/${username}`,
    aiNexus: `${API_BASE_URL}/api/ai/nexus`,
    aiStudio: `${API_BASE_URL}/api/ai/studio`,
};
