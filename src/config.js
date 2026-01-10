const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const endpoints = {
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    notes: (username) => `${API_BASE_URL}/api/notes/${username}`,
    messages: (username) => `${API_BASE_URL}/api/messages/${username}`,
    deleteMessage: (username, messageId) => `${API_BASE_URL}/api/messages/${username}/${messageId}`,
    deleteChat: (username, otherUser) => `${API_BASE_URL}/api/chats/${username}/${otherUser}`,
    search: (query) => `${API_BASE_URL}/api/search/${query}`,
    friends: (username) => `${API_BASE_URL}/api/friends/${username}`,
    friendshipDate: (username, friend) => `${API_BASE_URL}/api/friends/${username}/${friend}`,
    friendRequest: `${API_BASE_URL}/api/friends/request`,
    acceptFriend: `${API_BASE_URL}/api/friends/accept`,
    removeFriend: `${API_BASE_URL}/api/friends/remove`,
    blockUser: `${API_BASE_URL}/api/friends/block`,
    unblockUser: `${API_BASE_URL}/api/friends/unblock`,
    blockedUsers: (username) => `${API_BASE_URL}/api/friends/${username}/blocked`,
    upload: (username) => `${API_BASE_URL}/api/upload/${username}`,
    userSettings: (username) => `${API_BASE_URL}/api/users/${username}/settings`,
    feedback: `${API_BASE_URL}/api/feedback`,
    suspend: (username) => `${API_BASE_URL}/api/users/${username}/suspend`,
    getSuspension: (username) => `${API_BASE_URL}/api/users/${username}/suspension`,
    adminStats: `${API_BASE_URL}/api/admin/stats`,
    adminFeedback: `${API_BASE_URL}/api/admin/feedback`,
    adminUsers: `${API_BASE_URL}/api/admin/users`,
    adminApps: `${API_BASE_URL}/api/admin/apps`,
    adminAppVisibility: `${API_BASE_URL}/api/admin/apps/visibility`,
    publicApps: `${API_BASE_URL}/api/apps/public`,
    userApps: (username) => `${API_BASE_URL}/api/apps/${username}`,
    aiNexus: `${API_BASE_URL}/api/ai/nexus`,
    aiStudio: `${API_BASE_URL}/api/ai/studio`,
    aiStatus: `${API_BASE_URL}/api/ai/status`
};

export { API_BASE_URL, endpoints };