import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Search, Users, Trash2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const FriendsApp = () => {
    const { user } = useOS();
    const [friends, setFriends] = useState([]);
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (user?.username) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const res = await fetch(endpoints.friends(user.username));
            const data = await res.json();
            setFriends(data.friends || []);
            setReceived(data.received || []);
            setSent(data.sent || []);
        } catch (err) {
            console.error("Failed to fetch friends", err);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(endpoints.search(searchQuery));
            const data = await res.json();
            setSearchResults(data.filter(u => u !== user.username));
        } catch (err) {
            console.error("Search failed", err);
        }
    };

    const sendRequest = async (to) => {
        try {
            await fetch(endpoints.friendRequest, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from: user.username, to })
            });
            fetchData();
        } catch (err) {
            console.error("Request failed", err);
        }
    };

    const acceptRequest = async (friend) => {
        try {
            await fetch(endpoints.acceptFriend, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: user.username, friend })
            });
            fetchData();
        } catch (err) {
            console.error("Accept failed", err);
        }
    };

    const removeFriend = async (friend) => {
        try {
            await fetch(endpoints.removeFriend, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user: user.username, friend })
            });
            fetchData();
        } catch (err) {
            console.error("Remove failed", err);
        }
    };

    return (
        <div className="h-full bg-[#1c1c1e] text-white p-6 flex flex-col gap-8 overflow-y-auto">
            {/* Search */}
            <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-400">
                    <Search size={20} /> Find Users
                </h3>
                <div className="flex gap-2 mb-4">
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleSearch()}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                        placeholder="Username..."
                    />
                    <button onClick={handleSearch} className="bg-indigo-600 px-4 py-2 rounded-lg font-bold">Search</button>
                </div>
                <div className="space-y-2">
                    {searchResults.length > 0 ? (
                        searchResults.map(u => (
                            <div key={u} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                <span>{u}</span>
                                {friends.includes(u) ? (
                                    <span className="text-gray-500 text-sm">Friends</span>
                                ) : sent.includes(u) ? (
                                    <span className="text-gray-500 text-sm">Pending...</span>
                                ) : (
                                    <button onClick={() => sendRequest(u)} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-500">
                                        <UserPlus size={16} />
                                    </button>
                                )}
                            </div>
                        ))
                    ) : searchQuery && (
                        <div className="text-center text-gray-500 italic text-sm py-4">No user found</div>
                    )}
                </div>
            </section>

            {/* Requests Received */}
            {received.length > 0 && (
                <section>
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-400">
                        <UserPlus size={20} /> Friend Requests
                    </h3>
                    <div className="space-y-2">
                        {received.map(u => (
                            <div key={u} className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                                <span>{u}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => acceptRequest(u)} className="p-2 bg-green-600 rounded-full hover:bg-green-500">
                                        <Check size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Friends List */}
            <section>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-400">
                    <Users size={20} /> Friends ({friends.length})
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {friends.map(f => (
                        <div key={f} className="flex items-center justify-between gap-3 bg-white/5 p-4 rounded-xl group">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                                    {f[0].toUpperCase()}
                                </div>
                                <span className="font-medium">{f}</span>
                            </div>
                            <button onClick={() => removeFriend(f)} className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {friends.length === 0 && (
                        <p className="col-span-2 text-gray-500 italic text-sm text-center py-4">No friends yet. Start searching!</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default FriendsApp;