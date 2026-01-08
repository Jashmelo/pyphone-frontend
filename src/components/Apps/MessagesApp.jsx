import React, { useState, useEffect } from 'react';
import { Send, User, Plus, X, MessageCircle, ChevronRight, Hash } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const MessagesApp = () => {
    const { user } = useOS();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [targetUser, setTargetUser] = useState(null); // No default target
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (!user?.username) return;

        const fetchInitial = async () => {
            try {
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
        const interval = setInterval(pollMessages, 5000);
        return () => clearInterval(interval);
    }, [user]);

    // Derived list of unique active conversations
    const conversations = [...new Set(messages.flatMap(m => [m.from, m.to]))]
        .filter(u => u !== user?.username)
        .sort((a, b) => a.localeCompare(b));

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(endpoints.search(searchQuery));
            const data = await res.json();
            // Filter out current user AND the hidden admin (unless already in conversations)
            setSearchResults(data.filter(u =>
                u !== user.username &&
                (u !== 'admin' || conversations.includes('admin'))
            ));
        } catch (err) { console.error(err); }
    };

    const startNewChat = (username) => {
        setTargetUser(username);
        setIsSearching(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const activeMessages = messages.filter(m =>
        (m.from === targetUser && m.to === user?.username) ||
        (m.from === user?.username && m.to === targetUser)
    );

    const handleSend = async () => {
        if (!input.trim() || !user?.username || !targetUser) return;

        try {
            await fetch(endpoints.messages(user.username), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ to_user: targetUser, content: input })
            });

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
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#2c2c2e]/50">
                    <span className="font-bold flex items-center gap-2">
                        <MessageCircle size={18} className="text-indigo-400" /> Chats
                    </span>
                    <button
                        onClick={() => setIsSearching(!isSearching)}
                        className="bg-indigo-600 p-1.5 rounded-full hover:bg-indigo-500 transition-all active:scale-90"
                    >
                        {isSearching ? <X size={16} /> : <Plus size={16} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {isSearching ? (
                        <div className="p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex gap-2">
                                <input
                                    value={searchQuery}
                                    autoFocus
                                    onChange={e => setSearchQuery(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="Search username..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 ring-indigo-500"
                                />
                                <button onClick={handleSearch} className="bg-indigo-600 px-3 py-1.5 rounded-lg text-sm font-bold">Find</button>
                            </div>
                            <div className="space-y-1">
                                {searchResults.map(u => (
                                    <div
                                        key={u}
                                        onClick={() => startNewChat(u)}
                                        className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center justify-between group border border-transparent hover:border-white/5"
                                    >
                                        <span className="text-sm">@{u}</span>
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-50" />
                                    </div>
                                ))}
                                {searchResults.length === 0 && searchQuery && <p className="text-center text-xs text-gray-500 py-4">No public users found.</p>}
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {conversations.map(u => (
                                <div
                                    key={u}
                                    onClick={() => setTargetUser(u)}
                                    className={`p-4 cursor-pointer hover:bg-white/5 transition-all relative ${targetUser === u ? 'bg-indigo-600/20 border-l-4 border-indigo-500' : ''}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${u === 'admin' ? 'bg-indigo-600 shadow-lg shadow-indigo-600/30' : 'bg-gray-700'}`}>
                                            {u[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold truncate">@{u}</span>
                                                {u === 'admin' && <span className="text-[8px] bg-indigo-500 px-1 rounded uppercase">System</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate italic">
                                                {messages.filter(m => m.from === u || m.to === u).slice(-1)[0]?.content || 'Started a conversation'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {conversations.length === 0 && (
                                <div className="text-center py-20 px-8 opacity-20 flex flex-col items-center">
                                    <Hash size={40} className="mb-4" />
                                    <p className="text-sm">No recent chats.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#09090b]">
                {targetUser ? (
                    <>
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1c1c1e]/40 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold ring-2 ring-indigo-400/20">
                                    {targetUser[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold leading-none">@{targetUser}</p>
                                    <p className="text-[9px] text-green-500 uppercase tracking-widest mt-1 animate-pulse">● System Online</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3 bg-gradient-to-b from-black/20 to-transparent">
                            {activeMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.from === user?.username ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`p-3 px-4 rounded-2xl max-w-[70%] shadow-lg ${msg.from === user?.username ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[#2c2c2e] text-gray-100 rounded-tl-none border border-white/10'}`}>
                                        <p className="text-[14px] leading-relaxed select-text">{msg.content}</p>
                                        <span className="text-[8px] opacity-40 block mt-1 text-right font-mono uppercase">{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                            {activeMessages.length === 0 && (
                                <div className="flex h-full flex-col items-center justify-center text-gray-600 p-8 text-center opacity-40">
                                    <MessageCircle size={48} className="mb-4" />
                                    <p className="italic">History Encrypted.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 flex gap-3 bg-[#1c1c1e]/50">
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                className="flex-1 bg-[#121214] border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors"
                                placeholder={`Send message to @${targetUser}...`}
                            />
                            <button onClick={handleSend} className="bg-indigo-600 w-12 h-12 rounded-xl text-white hover:bg-indigo-500 transition-all active:scale-90 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                                <Send size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-30 select-none">
                        <MessageCircle size={120} className="mb-6 stroke-1" />
                        <h2 className="text-xl font-bold uppercase tracking-[0.2em]">Private Encrypted Messenger</h2>
                        <p className="text-xs mt-2">Select a thread to begin transmitting</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesApp;

