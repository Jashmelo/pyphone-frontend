import React, { useState, useEffect } from 'react';
import { Send, User } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const MessagesApp = () => {
    const { user } = useOS();
    const [messages, setMessages] = useState([]);
    const [friends, setFriends] = useState([]);
    const [input, setInput] = useState('');
    const [targetUser, setTargetUser] = useState('admin'); // Default target

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
            {/* List */}
            <div className="w-80 border-r border-white/10 bg-[#2c2c2e] overflow-y-auto">
                <div className="p-4 border-b border-white/10 font-bold">Messages</div>

                {/* Admin entry */}
                <div
                    onClick={() => setTargetUser('admin')}
                    className={`p-4 cursor-pointer hover:bg-white/5 border-b border-white/5 ${targetUser === 'admin' ? 'bg-indigo-600/20' : ''}`}
                >
                    <div className="font-bold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs">A</div>
                        Admin
                    </div>
                </div>

                {/* Friends entries */}
                {friends.map(f => (
                    <div
                        key={f}
                        onClick={() => setTargetUser(f)}
                        className={`p-4 cursor-pointer hover:bg-white/5 border-b border-white/5 ${targetUser === f ? 'bg-indigo-600/20' : ''}`}
                    >
                        <div className="font-bold flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">{f[0].toUpperCase()}</div>
                            {f}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4 bg-black/20">
                    {activeMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.from === user?.username ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl max-w-md ${msg.from === user?.username ? 'bg-[#0a84ff] rounded-tr-none' : 'bg-[#3a3a3c] rounded-tl-none'}`}>
                                <p>{msg.content}</p>
                                <span className="text-[10px] opacity-40 block mt-1">{msg.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    {activeMessages.length === 0 && (
                        <div className="flex h-full items-center justify-center text-gray-500 text-sm italic">
                            No messages with {targetUser} yet.
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-white/10 flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-[#2c2c2e] rounded-full px-4 py-2 focus:outline-none"
                        placeholder={`Message ${targetUser}`}
                    />
                    <button onClick={handleSend} className="bg-[#0a84ff] p-2 rounded-full text-white hover:bg-[#0070e0] transition-colors">
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessagesApp;
