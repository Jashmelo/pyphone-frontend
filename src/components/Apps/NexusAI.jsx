import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Send, Bot, User, Terminal, Sparkles, Trash2 } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const NexusAI = () => {
    const { user } = useOS();
    const [messages, setMessages] = useState([
        { role: 'ai', content: "System initialized. I am NEXUS, your Kernel-level transition assistant. How can I help you navigate the PyPhone environment today?" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch(endpoints.aiNexus, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', content: "ERROR: Failed to establish neural link with Nexus Core." }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{ role: 'ai', content: "Memory buffer purged. Nexus standby." }]);
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] text-cyan-400 font-mono">
            {/* Header */}
            <div className="h-16 border-b border-cyan-900/50 bg-cyan-900/10 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30">
                        <Cpu size={24} className="text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-black tracking-widest text-lg">NEXUS AI</h2>
                        <p className="text-[10px] text-cyan-600 uppercase">Neural Intelligence Kernel v4.2</p>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    className="p-2 hover:bg-cyan-500/10 rounded-full transition-colors text-cyan-700 hover:text-cyan-400"
                    title="Clear Memory"
                >
                    <Trash2 size={20} />
                </button>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/5 to-transparent shadow-inner no-scrollbar"
            >
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[80%] flex gap-3 ${m.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${m.role === 'ai' ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-white/5 border-white/10'}`}>
                                {m.role === 'ai' ? <Bot size={18} /> : <User size={18} className="text-white" />}
                            </div>
                            <div className={`p-4 rounded-2xl ${m.role === 'ai' ? 'bg-cyan-950/40 border border-cyan-500/20 text-cyan-100' : 'bg-white/5 border border-white/10 text-white'}`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                <div className="mt-2 flex items-center gap-2 opacity-30 text-[8px] uppercase tracking-tighter">
                                    <Sparkles size={10} /> {m.role === 'ai' ? 'Nexus Response' : `@${user?.username}`}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-cyan-950/40 border border-cyan-500/20 p-4 rounded-2xl flex gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-6 bg-black border-t border-cyan-900/30">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                    <div className="relative flex gap-3 bg-[#0a0a0a] rounded-2xl p-2 border border-cyan-900/50">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="Type a command or query..."
                            className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-cyan-400 placeholder-cyan-900 text-sm font-mono"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-black px-6 py-2 rounded-xl font-black transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Send size={18} />
                            <span className="hidden md:inline uppercase tracking-widest text-xs">Execute</span>
                        </button>
                    </div>
                </div>
                <div className="mt-4 flex justify-between items-center text-[8px] text-cyan-900 font-bold uppercase tracking-[0.2em]">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><Terminal size={10} /> Encrypted Stream</span>
                        <span>Neural_Links: ACTIVE</span>
                    </div>
                    <span>PyPhone AI Sandbox</span>
                </div>
            </div>
        </div>
    );
};

export default NexusAI;
