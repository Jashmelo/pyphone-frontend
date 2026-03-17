import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Send, Bot, User, Terminal, Sparkles, Trash2, Globe, ExternalLink, Search, AlertTriangle } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const NexusAI = () => {
    const { user } = useOS();
    const [messages, setMessages] = useState([
        { role: 'ai', content: "System initialized. I am NEXUS, your Kernel-level AI assistant. I search the web on every query and only state facts I can verify from live sources. How can I help you today?", sources: [], searchQuery: null }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [expandedSources, setExpandedSources] = useState({});
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const toggleSources = (idx) => {
        setExpandedSources(prev => ({ ...prev, [idx]: !prev[idx] }));
    };

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input, sources: [], searchQuery: null };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setLoading(true);

        try {
            // Build history: exclude the initial greeting and the message just added
            const history = updatedMessages.slice(1, -1).map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await fetch(endpoints.aiNexus, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input, history })
            });
            const data = await res.json();

            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.response,
                sources: data.sources || [],
                searchQuery: data.search_query || null
            }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "ERROR: Failed to establish neural link with Nexus Core.",
                sources: [],
                searchQuery: null
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'ai',
            content: "Memory buffer purged. Nexus standby.",
            sources: [],
            searchQuery: null
        }]);
        setExpandedSources({});
    };

    return (
        <div className="h-full flex flex-col bg-[#050505] text-cyan-400 font-mono">
            {/* Header */}
            <div className="h-16 border-b border-cyan-900/50 bg-cyan-900/10 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="bg-cyan-500/20 p-2 rounded-lg border border-cyan-500/30">
                        <Cpu size={24} className="text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="font-black tracking-widest text-lg">NEXUS AI</h2>
                        <p className="text-[10px] text-cyan-600 uppercase flex items-center gap-1">
                            <Globe size={9} /> Live Web Search &bull; Source-Grounded
                        </p>
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
                className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 no-scrollbar"
            >
                {messages.map((m, idx) => (
                    <div key={idx} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] flex gap-3 ${m.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border mt-1 ${m.role === 'ai' ? 'bg-cyan-500/20 border-cyan-500/30' : 'bg-white/5 border-white/10'}`}>
                                {m.role === 'ai' ? <Bot size={18} /> : <User size={18} className="text-white" />}
                            </div>
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <div className={`p-4 rounded-2xl ${m.role === 'ai' ? 'bg-cyan-950/40 border border-cyan-500/20 text-cyan-100' : 'bg-white/5 border border-white/10 text-white'}`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                                    <div className="mt-2 flex items-center gap-2 opacity-30 text-[8px] uppercase tracking-tighter">
                                        <Sparkles size={10} /> {m.role === 'ai' ? 'Nexus Response' : `@${user?.username}`}
                                    </div>
                                </div>

                                {/* Search query badge + sources — AI messages only */}
                                {m.role === 'ai' && m.searchQuery && (
                                    <div className="flex flex-col gap-1">
                                        {/* Search indicator */}
                                        <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-cyan-700 bg-cyan-950/30 border border-cyan-900/40 rounded-lg w-fit">
                                            <Search size={9} />
                                            <span className="font-mono">searched: "{m.searchQuery}"</span>
                                        </div>

                                        {/* Sources toggle */}
                                        {m.sources && m.sources.length > 0 ? (
                                            <div>
                                                <button
                                                    onClick={() => toggleSources(idx)}
                                                    className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-cyan-500 bg-cyan-950/30 border border-cyan-800/40 rounded-lg hover:bg-cyan-900/30 transition-colors w-fit"
                                                >
                                                    <Globe size={9} />
                                                    {m.sources.length} source{m.sources.length !== 1 ? 's' : ''}
                                                    <span className="opacity-50">{expandedSources[idx] ? '▲' : '▼'}</span>
                                                </button>
                                                {expandedSources[idx] && (
                                                    <div className="mt-1 flex flex-col gap-1 pl-1">
                                                        {m.sources.map((s, si) => (
                                                            <a
                                                                key={si}
                                                                href={s.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-start gap-1.5 text-[9px] text-cyan-600 hover:text-cyan-400 transition-colors group"
                                                            >
                                                                <ExternalLink size={9} className="shrink-0 mt-0.5 group-hover:text-cyan-400" />
                                                                <span className="truncate max-w-[260px]">{s.title || s.url}</span>
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5 px-2 py-1 text-[9px] text-yellow-600/70 bg-yellow-950/20 border border-yellow-900/30 rounded-lg w-fit">
                                                <AlertTriangle size={9} />
                                                <span>no sources found — answer may use general knowledge</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border bg-cyan-500/20 border-cyan-500/30">
                                <Bot size={18} />
                            </div>
                            <div className="bg-cyan-950/40 border border-cyan-500/20 px-4 py-3 rounded-2xl flex flex-col gap-1.5">
                                <div className="flex gap-2 items-center">
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                                </div>
                                <span className="text-[9px] text-cyan-700 flex items-center gap-1">
                                    <Globe size={9} className="animate-pulse" /> Searching the web...
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="p-4 md:p-6 bg-black border-t border-cyan-900/30 shrink-0">
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
                    <div className="relative flex gap-3 bg-[#0a0a0a] rounded-2xl p-2 border border-cyan-900/50">
                        <input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            placeholder="Type a command or query..."
                            className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-cyan-400 placeholder-cyan-900 text-sm font-mono"
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-30 text-black px-4 md:px-6 py-2 rounded-xl font-black transition-all active:scale-95 flex items-center gap-2"
                        >
                            <Send size={18} />
                            <span className="hidden md:inline uppercase tracking-widest text-xs">Execute</span>
                        </button>
                    </div>
                </div>
                <div className="mt-3 flex justify-between items-center text-[8px] text-cyan-900 font-bold uppercase tracking-[0.2em]">
                    <div className="flex gap-3">
                        <span className="flex items-center gap-1"><Terminal size={10} /> Encrypted Stream</span>
                        <span className="flex items-center gap-1"><Globe size={10} /> Live Search Active</span>
                    </div>
                    <span>Source-Grounded AI</span>
                </div>
            </div>
        </div>
    );
};

export default NexusAI;
