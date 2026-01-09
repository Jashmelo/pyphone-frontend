import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Plus, X, MessageCircle, ChevronRight, Hash, Paperclip, Image as ImageIcon, File as FileIcon, Download, Loader2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints, API_BASE_URL } from '../../config';

const MessagesApp = () => {
    const { user } = useOS();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [targetUser, setTargetUser] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [uploading, setUploading] = useState(false);

    const fileInputRef = useRef(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!user?.username) return;

        const fetchInitial = async () => {
            try {
                const mRes = await fetch(endpoints.messages(user.username));
                const mData = await mRes.json();
                setMessages(Array.isArray(mData) ? mData : []);
            } catch (err) { console.error("Failed to fetch initial data", err); }
        };

        const pollMessages = async () => {
            try {
                const response = await fetch(endpoints.messages(user.username));
                const data = await response.json();
                // Avoid infinite re-renders if data hasn't changed (simplified)
                if (Array.isArray(data) && data.length !== messages.length) {
                    setMessages(data);
                }
            } catch (err) { console.error("Failed to poll messages", err); }
        };

        fetchInitial();
        const interval = setInterval(pollMessages, 5000);
        return () => clearInterval(interval);
    }, [user, messages.length]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, targetUser]);

    const conversations = [...new Set(messages.flatMap(m => [m.from, m.to]))]
        .filter(u => u !== user?.username)
        .sort((a, b) => a.localeCompare(b));

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(endpoints.search(searchQuery));
            const data = await res.json();
            setSearchResults(data.filter(u => u !== user.username && (u !== 'admin' || conversations.includes('admin'))));
        } catch (err) { console.error(err); }
    };

    const handleSend = async (content = input, attachment = null) => {
        if ((!content.trim() && !attachment) || !user?.username || !targetUser) return;

        try {
            const body = {
                to_user: targetUser,
                content: content,
                attachment_url: attachment?.url || null,
                attachment_type: attachment?.type || null
            };

            await fetch(endpoints.messages(user.username), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const newMsg = {
                from: user.username,
                to: targetUser,
                content: content,
                attachment_url: attachment?.url || null,
                attachment_type: attachment?.type || null,
                timestamp: new Date().toLocaleTimeString()
            };
            setMessages(prev => [...prev, newMsg]);
            setInput('');
        } catch (err) { console.error("Failed to send message", err); }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || !user?.username) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(endpoints.upload(user.username), {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            // Send message automatically with the attachment
            handleSend(file.name, data);
        } catch (err) {
            console.error("Upload failed", err);
            alert("File upload failed. Ensure server size limits permit this file.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const activeMessages = messages.filter(m =>
        (m.from === targetUser && m.to === user?.username) ||
        (m.from === user?.username && m.to === targetUser)
    );

    const renderAttachment = (msg) => {
        if (!msg.attachment_url) return null;

        const fullUrl = `${API_BASE_URL}${msg.attachment_url}`;
        const isImage = msg.attachment_type?.startsWith('image/');

        if (isImage) {
            return (
                <div className="mt-2 rounded-lg overflow-hidden border border-white/10 bg-black/20">
                    <img src={fullUrl} alt="attachment" className="max-w-full max-h-64 object-contain" />
                    <a href={fullUrl} target="_blank" rel="noreferrer" className="block p-2 text-[10px] text-gray-500 hover:text-white flex items-center gap-1">
                        <Download size={10} /> Full Resolution
                    </a>
                </div>
            );
        }

        return (
            <div className="mt-2 p-3 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3 group">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <FileIcon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate">{msg.content}</p>
                    <p className="text-[10px] text-gray-500 uppercase">{msg.attachment_type?.split('/')[1] || 'FILE'}</p>
                </div>
                <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-indigo-400 transition-colors"
                >
                    <Download size={18} />
                </a>
            </div>
        );
    };

    return (
        <div className="flex h-full bg-[#1c1c1e] text-white">
            {/* Sidebar */}
            <div className="w-80 border-r border-white/10 bg-[#2c2c2e] flex flex-col">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#2c2c2e]/50">
                    <span className="font-bold flex items-center gap-2">
                        <MessageCircle size={18} className="text-indigo-400" /> Messages
                    </span>
                    <button
                        onClick={() => setIsSearching(!isSearching)}
                        className="bg-indigo-600 p-1.5 rounded-full hover:bg-indigo-500 transition-all active:scale-90"
                    >
                        {isSearching ? <X size={16} /> : <Plus size={16} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {isSearching ? (
                        <div className="p-4 space-y-4 animate-in fade-in duration-200">
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
                                {searchResults.length > 0 ? (
                                    searchResults.map(u => (
                                        <div key={u} onClick={() => { setTargetUser(u); setIsSearching(false); }} className="p-3 hover:bg-white/5 rounded-lg cursor-pointer flex items-center justify-between group">
                                            <span className="text-sm">@{u}</span>
                                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-50" />
                                        </div>
                                    ))
                                ) : searchQuery && (
                                    <div className="text-center text-gray-500 italic text-sm py-4">No user found</div>
                                )}
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
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${u === 'admin' ? 'bg-indigo-600 shadow-lg' : 'bg-gray-700'}`}>
                                            {u[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between">
                                                <span className="font-bold truncate text-[14px]">@{u}</span>
                                                {u === 'admin' && <span className="text-[8px] bg-indigo-500/30 text-indigo-300 px-1 rounded h-fit">STAFF</span>}
                                            </div>
                                            <p className="text-[12px] text-gray-500 truncate mt-0.5">
                                                {messages.filter(m => m.from === u || m.to === u).slice(-1)[0]?.content || 'Chat Started'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-[#09090b]">
                {targetUser ? (
                    <>
                        <div className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#1c1c1e]/60 backdrop-blur-xl z-20">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-black shadow-lg shadow-indigo-600/20">
                                    {targetUser[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-[15px]">@{targetUser}</p>
                                    <p className="text-[9px] text-indigo-400 uppercase tracking-widest mt-0.5">End-to-End Encrypted</p>
                                </div>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 no-scrollbar">
                            {activeMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.from === user?.username ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    <div className={`p-3 px-4 rounded-2xl max-w-[75%] shadow-md ${msg.from === user?.username ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-[#2c2c2e] text-gray-100 rounded-tl-none border border-white/10'}`}>
                                        <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                        {renderAttachment(msg)}
                                        <span className={`text-[8px] block mt-2 font-mono uppercase ${msg.from === user?.username ? 'text-indigo-200/50' : 'text-gray-500'}`}>{msg.timestamp}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-[#1c1c1e]/80 backdrop-blur-lg">
                            <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-indigo-400 transition-all active:scale-90"
                                    title="Attach File"
                                >
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Paperclip size={18} />}
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-indigo-400 transition-all active:scale-90"
                                    title="Send Image"
                                >
                                    <ImageIcon size={18} />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                            </div>
                            <div className="flex gap-3">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 bg-[#121214] border border-white/5 rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 ring-indigo-500/20 text-sm"
                                    placeholder={`Message @${targetUser}...`}
                                />
                                <button onClick={() => handleSend()} className="bg-indigo-600 w-12 h-12 rounded-2xl text-white hover:bg-indigo-500 transition-all shadow-lg flex items-center justify-center active:scale-95">
                                    <Send size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-10 opacity-20">
                        <MessageCircle size={100} className="mb-6 stroke-1" />
                        <h3 className="text-2xl font-black uppercase tracking-widest">Insecure_Comm_Off</h3>
                        <p className="text-xs mt-2">Select a frequency to begin transmission</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesApp;