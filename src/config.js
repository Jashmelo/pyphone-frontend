export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://pyphone.onrender.com";

export const endpoints = {
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    notes: (username) => `${API_BASE_URL}/api/notes/${username}`,
    messages: (username) => `${API_BASE_URL}/api/messages/${username}`,
    search: (query) => `${API_BASE_URL}/api/search/${query}`,
    friends: (username) => `${API_BASE_URL}/api/friends/${username}`,
    friendRequest: `${API_BASE_URL}/api/friends/request`,
    acceptFriend: `${API_BASE_URL}/api/friends/accept`,
    apps: (username) => `${API_BASE_URL}/api/apps/${username}`,
};
