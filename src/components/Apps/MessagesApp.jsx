import React, { useState, useEffect } from 'react';
import { Send, User, Plus, X, MessageCircle, ChevronRight } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const MessagesApp = () => {
    const { user } = useOS();
    const [messages, setMessages] = useState([]);
    const [friends, setFriends] = useState([]);
    const [input, setInput] = useState('');
    const [targetUser, setTargetUser] = useState('admin'); // Default target
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (!user?.username) return;

        const fetchInitial = async () => {
            try {
                // Fetch friends
                const fRes = await fetch(endpoints.friends(user.username));
                const fData = await fRes.json();
                setFriends(fData.friends || []);

                // Fetch messages
                const mRes = await fetch(endpoints.messages(user.username));
                const mData = await mRes.json();
                setMessages(Array.isArray(mData) ? mData : []);
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };

        const pollMessages = async () => {
            try {
                const response = await fetch(endpoints.messages(user.username));
                const data = await response.json();
                setMessages(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Failed to fetch messages", err);
            }
        };

        fetchInitial();
        const interval = setInterval(pollMessages, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, [user]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(endpoints.search(searchQuery));
            const data = await res.json();
            setSearchResults(data.filter(u => u !== user.username));
        } catch (err) { console.error(err); }
    };

    const startNewChat = (username) => {
        setTargetUser(username);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Filter messages for current chat
    const activeMessages = messages.filter(m =>
        (m.from === targetUser && m.to === user?.username) ||
        (m.from === user?.username && m.to === targetUser)
    );

    const handleSend = async () => {
        if (!input.trim() || !user?.username) return;

        try {
            await fetch(endpoints.messages(user.username), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to_user: targetUser, content: input })
            });

            // Optimistic local update
            const newMsg = {
                from: user.username,
                to: targetUser,
                content: input,
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages([...messages, newMsg]);
            setInput('');
        } catch (err) {
            console.error("Failed to send message", err);
        }
    };

    return (
        <div className="flex h-full bg-[#1c1c1e] text-white">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 bg-[#2c2c2e] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <span className="font-bold">Messages</span>
                    <button
                        onClick={() => setIsSearching(!isSearching)}
                        className="bg-indigo-600 p-1.5 rounded-full hover:bg-indigo-500 transition-colors"
                    >
                        {isSearching ? <X size={16} /> : <Plus size={16} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isSearching ? (
                        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex gap-2">
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search users..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                                />
                                <button onClick={handleSearch} className="bg-indigo-600 px-3 py-1.5 rounded-lg text-sm">Find</button>
                            </div>
                            <div className="space-y-1">
                                {searchResults.map(u => (
                                    <div
                                        key={u}
                                        onClick={() => startNewChat(u)}
                                        className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center justify-between group"
                                    >
                                        <span className="text-sm">@{u}</span>
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Admin entry */}
                            <div
                                onClick={() => setTargetUser('admin')}
                                className={`p-4 cursor-pointer hover:bg-white/5 border-b border-white/5 transition-colors ${targetUser === 'admin' ? 'bg-indigo-600/20' : ''}`}
                            >
                                <div className="font-bold flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs">A</div>
                                    Admin
                                </div>
                            </div>

                            {/* Recent Conversations / Friends */}
                            {friends.map(f => (
                                <div
                                    key={f}
                                    onClick={() => setTargetUser(f)}
                                    className={`p-4 cursor-pointer hover:bg-white/5 border-b border-white/5 transition-colors ${targetUser === f ? 'bg-indigo-600/20' : ''}`}
                                >
                                    <div className="font-bold flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">{f[0].toUpperCase()}</div>
                                        {f}
                                    </div>
                                </div>
                            ))}

                            {/* Target User if not in friends but active */}
                            {!friends.includes(targetUser) && targetUser !== 'admin' && (
                                <div className="p-4 bg-indigo-600/10 border-b border-white/5">
                                    <div className="font-bold flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">{targetUser[0].toUpperCase()}</div>
                                        {targetUser} (Direct)
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs">
                        {targetUser[0].toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold leading-none">{targetUser}</p>
                        <p className="text-[10px] text-gray-500 uppercase mt-1">Encrypted Session</p>
                    </div>
                </div>

                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-black/20">
                    {activeMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.from === user?.username ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl max-w-sm ${msg.from === user?.username ? 'bg-[#0a84ff] rounded-tr-none' : 'bg-[#3a3a3c] rounded-tl-none border border-white/5'}`}>
                                <p className="text-[15px]">{msg.content}</p>
                                <span className="text-[9px] opacity-40 block mt-1 text-right">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    {activeMessages.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center text-gray-600 p-8 text-center">
                            <MessageCircle size={48} className="mb-4 opacity-20" />
                            <p className="italic">No message history with {targetUser}.</p>
                            <p className="text-xs mt-2">Send a message to start the conversation.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 flex gap-2 bg-[#1c1c1e]">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-[#2c2c2e] rounded-full px-4 py-2 focus:outline-none placeholder-gray-500"
                        placeholder={`Message ${targetUser}`}
                    />
                    <button onClick={handleSend} className="bg-[#0a84ff] p-2 rounded-full text-white hover:bg-[#0070e0] transition-transform active:scale-95">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessagesApp;
