import React, { useState, useEffect } from 'react';
import { UserPlus, Check, X, Search, Users, Trash2, ChevronLeft, ChevronRight, MessageCircle, Ban, Info } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const FriendsApp = () => {
    const { user, deviceType } = useOS();
    const [friends, setFriends] = useState([]);
    const [received, setReceived] = useState([]);
    const [sent, setSent] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [confirmRemove, setConfirmRemove] = useState(null);
    const [view, setView] = useState('menu');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [friendInfo, setFriendInfo] = useState(null);
    const [friendshipDate, setFriendshipDate] = useState({});
    const isMobile = deviceType === 'mobile' || deviceType === 'tablet';

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
            // Initialize friendship dates (mock data - would come from backend)
            const dates = {};
            (data.friends || []).forEach(f => {
                dates[f] = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString();
            });
            setFriendshipDate(dates);
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
            setConfirmRemove(null);
            setView('friends');
            fetchData();
        } catch (err) {
            console.error("Remove failed", err);
        }
    };

    const blockFriend = async (friend) => {
        try {
            // Backend endpoint for blocking
            console.log('Blocking', friend);
            // await fetch(...blockEndpoint...);
            alert(`${friend} has been blocked`);
            removeFriend(friend);
        } catch (err) {
            console.error("Block failed", err);
        }
    };

    const showFriendInfo = (friend) => {
        setSelectedFriend(friend);
        setFriendInfo(friend);
        setView('friendInfo');
    };

    const calculateFriendshipDuration = (friend) => {
        // Mock calculation - backend would provide actual date
        const days = Math.floor(Math.random() * 365);
        if (days < 30) return `${days} days`;
        const months = Math.floor(days / 30);
        if (months < 12) return `${months} months`;
        const years = Math.floor(months / 12);
        return `${years} year${years > 1 ? 's' : ''}`;
    };

    // Mobile Friend Info View
    if (isMobile && view === 'friendInfo' && friendInfo) {
        return (
            <div className="h-full bg-[#1c1c1e] text-white flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-[#2c2c2e]/50">
                    <button onClick={() => setView('friends')} className="p-1.5 -m-1.5 hover:bg-white/10 rounded-lg">
                        <ChevronLeft size={18} className="text-indigo-400" />
                    </button>
                    <span className="font-bold text-sm">Friend Info</span>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center text-2xl font-bold">
                            {friendInfo[0].toUpperCase()}
                        </div>
                        <div className="text-center">
                            <h2 className="text-lg font-bold">{friendInfo}</h2>
                            <p className="text-xs text-gray-400 mt-1">@{friendInfo}</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Friends Since</p>
                            <p className="text-sm font-semibold mt-1">{friendshipDate[friendInfo] || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">Duration</p>
                            <p className="text-sm font-semibold mt-1">{calculateFriendshipDuration(friendInfo)}</p>
                        </div>
                    </div>

                    <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <MessageCircle size={16} /> Open Chat
                    </button>

                    <button onClick={() => setConfirmRemove(friendInfo)} className="w-full bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Trash2 size={16} /> Remove Friend
                    </button>

                    <button onClick={() => blockFriend(friendInfo)} className="w-full bg-gray-600/20 hover:bg-gray-600/30 text-gray-400 font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <Ban size={16} /> Block
                    </button>
                </div>
            </div>
        );
    }

    // Mobile Menu View
    if (isMobile && view === 'menu') {
        return (
            <div className="h-full bg-[#1c1c1e] text-white flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-[#2c2c2e]/50">
                    <Users size={18} className="text-indigo-400" />
                    <span className="font-bold text-sm">Friends</span>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {/* Search Button */}
                    <button
                        onClick={() => { setView('search'); setIsSearching(true); }}
                        className="w-full p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 active:bg-indigo-600/20"
                    >
                        <span className="text-sm flex items-center gap-2">
                            <Search size={16} className="text-indigo-400" /> Find Users
                        </span>
                        <ChevronRight size={16} className="text-gray-600" />
                    </button>

                    {/* Friend Requests Section */}
                    {received.length > 0 && (
                        <button
                            onClick={() => setView('requests')}
                            className="w-full p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 active:bg-amber-500/10"
                        >
                            <span className="text-sm flex items-center gap-2">
                                <UserPlus size={16} className="text-yellow-400" /> Friend Requests
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">{received.length}</span>
                                <ChevronRight size={16} className="text-gray-600" />
                            </div>
                        </button>
                    )}

                    {/* Friends List Button */}
                    <button
                        onClick={() => setView('friends')}
                        className="w-full p-4 border-b border-white/5 flex items-center justify-between hover:bg-white/5 active:bg-green-600/10"
                    >
                        <span className="text-sm flex items-center gap-2">
                            <Users size={16} className="text-green-400" /> My Friends
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">{friends.length}</span>
                            <ChevronRight size={16} className="text-gray-600" />
                        </div>
                    </button>
                </div>
            </div>
        );
    }

    // Mobile Search View
    if (isMobile && view === 'search') {
        return (
            <div className="h-full bg-[#1c1c1e] text-white flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-[#2c2c2e]/50">
                    <button onClick={() => setView('menu')} className="p-1.5 -m-1.5 hover:bg-white/10 rounded-lg">
                        <ChevronLeft size={18} className="text-indigo-400" />
                    </button>
                    <span className="font-bold text-sm">Find Users</span>
                </div>
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="flex gap-2">
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSearch()}
                            autoFocus
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
                            placeholder="Username..."
                        />
                        <button onClick={handleSearch} className="bg-indigo-600 px-3 py-2 rounded-lg text-xs font-bold">Search</button>
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto">
                        {searchResults.length > 0 ? (
                            searchResults.map(u => (
                                <div key={u} className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                    <span className="text-sm">{u}</span>
                                    {friends.includes(u) ? (
                                        <span className="text-gray-500 text-xs">Friends</span>
                                    ) : sent.includes(u) ? (
                                        <span className="text-gray-500 text-xs">Pending...</span>
                                    ) : (
                                        <button onClick={() => sendRequest(u)} className="p-1.5 bg-indigo-600 rounded-full hover:bg-indigo-500">
                                            <UserPlus size={14} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : searchQuery ? (
                            <div className="text-center text-gray-500 italic text-xs py-8">No user found</div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    }

    // Mobile Requests View
    if (isMobile && view === 'requests') {
        return (
            <div className="h-full bg-[#1c1c1e] text-white flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-[#2c2c2e]/50">
                    <button onClick={() => setView('menu')} className="p-1.5 -m-1.5 hover:bg-white/10 rounded-lg">
                        <ChevronLeft size={18} className="text-indigo-400" />
                    </button>
                    <span className="font-bold text-sm">Friend Requests ({received.length})</span>
                </div>
                <div className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
                    {received.map(u => (
                        <div key={u} className="flex justify-between items-center bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                            <span className="text-sm">{u}</span>
                            <button onClick={() => acceptRequest(u)} className="p-1.5 bg-green-600 rounded-full hover:bg-green-500">
                                <Check size={14} />
                            </button>
                        </div>
                    ))}
                    {received.length === 0 && <p className="text-center text-gray-500 text-xs py-8">No pending requests</p>}
                </div>
            </div>
        );
    }

    // Mobile Friends View
    if (isMobile && view === 'friends') {
        return (
            <div className="h-full bg-[#1c1c1e] text-white flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center gap-2 bg-[#2c2c2e]/50">
                    <button onClick={() => setView('menu')} className="p-1.5 -m-1.5 hover:bg-white/10 rounded-lg">
                        <ChevronLeft size={18} className="text-indigo-400" />
                    </button>
                    <span className="font-bold text-sm">My Friends ({friends.length})</span>
                </div>
                <div className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
                    {friends.map(f => (
                        <div key={f} onClick={() => showFriendInfo(f)} className="flex items-center justify-between gap-2 bg-white/5 p-3 rounded-lg active:bg-indigo-600/20 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {f[0].toUpperCase()}
                                </div>
                                <span className="text-sm font-medium">{f}</span>
                            </div>
                            <ChevronRight size={14} className="text-gray-600" />
                        </div>
                    ))}
                    {friends.length === 0 && <p className="text-center text-gray-500 text-xs py-8">No friends yet</p>}
                </div>
            </div>
        );
    }

    // Confirmation Dialog
    const ConfirmDialog = () => confirmRemove && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-[#2c2c2e] border border-white/10 rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
                <h3 className="text-lg font-bold mb-2 text-white">Remove Friend?</h3>
                <p className="text-gray-400 mb-6">Are you sure you want to remove <span className="font-semibold text-white">{confirmRemove}</span> from your friends?</p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => setConfirmRemove(null)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => removeFriend(confirmRemove)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );

    // Desktop View
    return (
        <div className="h-full bg-[#1c1c1e] text-white p-6 flex flex-col gap-8 overflow-y-auto">
            <ConfirmDialog />

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
                        <div key={f} onClick={() => showFriendInfo(f)} className="flex items-center justify-between gap-3 bg-white/5 p-4 rounded-xl group hover:bg-white/8 cursor-pointer transition-colors">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                                    {f[0].toUpperCase()}
                                </div>
                                <span className="font-medium">{f}</span>
                            </div>
                            <Info size={14} className="text-gray-500 group-hover:text-indigo-400 transition-colors" />
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