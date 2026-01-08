import React, { useState, useEffect, useRef } from 'react';
import { Code2, Play, Save, Globe, Lock, CheckCircle2, AlertCircle, Terminal, Languages, Bot, Sparkles, Send, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const DevStudio = () => {
    const { user } = useOS();
    const [appName, setAppName] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState(''); // success, error, saving

    // AI State
    const [aiOpen, setAiOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiChat, setAiChat] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const aiScrollRef = useRef(null);

    const languages = [
        { id: 'javascript', name: 'JavaScript', ext: 'js', default: '// Write your JS app\nconst content = `<div style="padding:20px"><h1>Hello JS</h1></div>`;\nsetContent(content);' },
        { id: 'python', name: 'Python', ext: 'py', default: '# Simulation Mode\nprint("Hello from PyPhone OS")\n# Web UI rendering via set_content()\nset_content("<h1>Python App</h1>")' },
        { id: 'cpp', name: 'C++', ext: 'cpp', default: '// Simulation Mode\n#include <iostream>\nint main() {\n    std::cout << "PyPhone OS C++ Stack" << std::endl;\n    return 0;\n}' },
        { id: 'html', name: 'HTML/CSS', ext: 'html', default: '<!-- Pure Markup -->\n<div style="background: navy; color: white; padding: 40px; border-radius: 20px;">\n  <h1>Native HTML App</h1>\n</div>' }
    ];

    useEffect(() => {
        const lang = languages.find(l => l.id === language);
        if (lang) {
            // Only set if code is empty or just default of another lang
            if (!code || languages.some(l => l.default === code)) {
                setCode(lang.default);
            }
        }
    }, [language]);

    useEffect(() => {
        if (aiScrollRef.current) {
            aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
        }
    }, [aiChat]);

    const runCode = () => {
        try {
            if (language === 'javascript' || language === 'html') {
                const sandbox = (codeStr) => {
                    if (language === 'html') return codeStr;
                    let htmlOutput = '';
                    const setContent = (html) => { htmlOutput = html; };
                    // eslint-disable-next-line no-new-func
                    const fn = new Function('setContent', codeStr);
                    fn(setContent);
                    return htmlOutput;
                };
                setPreview(sandbox(code));
            } else {
                setPreview(`
                    <div style="background: #000; color: #0f0; font-family: monospace; padding: 20px; min-height: 200px;">
                        <div>$ ${language} run main.${languages.find(l => l.id === language).ext}</div>
                        <div style="margin-top: 10px;">[BUILD] Compiling kernel links...</div>
                        <div style="color: #fff;">Hello from the ${language} simulation environment!</div>
                        <div style="color: #555; margin-top: 20px;">// Note: Native execution for ${language} requires backend compilation. This is a terminal preview.</div>
                    </div>
                `);
            }
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
            setPreview(`<div style="color: red; padding: 20px;">Error: ${err.message}</div>`);
        }
    };

    const publishApp = async () => {
        if (!appName.trim()) {
            alert("Please give your app a name!");
            return;
        }

        setStatus('saving');
        try {
            const res = await fetch(endpoints.apps(user.username), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    app_name: appName,
                    code: `[LANG:${language}]\n${code}`,
                    is_public: isPublic
                })
            });

            if (res.ok) {
                setStatus('success');
                setTimeout(() => setStatus(''), 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const askAI = async () => {
        if (!aiInput.trim() || aiLoading) return;

        const userMsg = { role: 'user', content: aiInput };
        setAiChat(prev => [...prev, userMsg]);
        setAiInput('');
        setAiLoading(true);

        try {
            const res = await fetch(endpoints.aiStudio, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: aiInput,
                    context: `[LANG:${language}]\n${code}`
                })
            });
            const data = await res.json();
            setAiChat(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (err) {
            setAiChat(prev => [...prev, { role: 'ai', content: "Failed to connect to Studio AI. Please check server status." }]);
        } finally {
            setAiLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="h-14 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold mr-4">
                        <Code2 size={20} />
                        <span className="hidden md:inline uppercase tracking-tighter">DEV Studio</span>
                    </div>
                    <input
                        value={appName}
                        onChange={e => setAppName(e.target.value)}
                        placeholder="Project Name..."
                        className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 ring-indigo-500 w-44"
                    />

                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded px-2 py-1">
                        <Languages size={14} className="text-slate-500" />
                        <select
                            value={language}
                            onChange={e => setLanguage(e.target.value)}
                            className="bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-2"
                        >
                            {languages.map(l => <option key={l.id} value={l.id} className="bg-slate-900">{l.name}</option>)}
                        </select>
                    </div>

                    <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-black transition-all ${isPublic ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                    >
                        {isPublic ? <Globe size={12} /> : <Lock size={12} />}
                        {isPublic ? 'PUBLIC REQ' : 'PRIVATE'}
                    </button>

                    <div className="w-[1px] h-6 bg-slate-700 mx-2" />

                    <button
                        onClick={() => setAiOpen(!aiOpen)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${aiOpen ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <Bot size={16} /> Studio AI
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {status === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                    {status === 'error' && <AlertCircle size={18} className="text-rose-500" />}

                    <button
                        onClick={runCode}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 font-bold px-4 py-1.5 rounded-lg text-sm transition-colors border border-slate-700"
                    >
                        <Play size={16} /> Run
                    </button>
                    <button
                        onClick={publishApp}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-all active:scale-95 shadow-lg shadow-indigo-600/20"
                    >
                        <Save size={16} /> {status === 'saving' ? '...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Code Editor */}
                <div className={`flex-1 border-r border-slate-700 flex flex-col transition-all duration-300 ${aiOpen ? 'w-1/3' : 'w-1/2'}`}>
                    <div className="bg-slate-900 px-4 py-1 text-[10px] text-slate-500 font-mono flex justify-between border-b border-slate-800">
                        <span>source_main.{languages.find(l => l.id === language).ext}</span>
                        <span className="text-indigo-500 uppercase">{language}</span>
                    </div>
                    <textarea
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        spellCheck={false}
                        className="flex-1 bg-[#020617] p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed text-indigo-300/90 selection:bg-indigo-500/30"
                    />
                </div>

                {/* Preview Window (Visible when AI is closed or adjusted) */}
                <div className={`flex flex-col bg-slate-900/40 transition-all duration-300 ${aiOpen ? 'w-1/3 border-r border-slate-700' : 'w-1/2'}`}>
                    <div className="bg-slate-900 px-4 py-1 text-[10px] text-slate-500 font-mono border-b border-slate-800 flex justify-between">
                        <span>Live Preview</span>
                        <Terminal size={12} />
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-950 rounded-lg m-4 shadow-2xl overflow-auto border border-slate-800">
                        {preview ? (
                            <div dangerouslySetInnerHTML={{ __html: preview }} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-950">
                                <Code2 size={64} className="mb-6 opacity-10" />
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Compiler Ready</p>
                                <p className="text-[10px] mt-2 text-slate-600 max-w-[240px]">Write code and click 'Run' to compile and preview.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Assistant Panel */}
                {aiOpen && (
                    <div className="w-1/3 bg-slate-900/60 flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="bg-indigo-950/30 px-4 py-2 text-[10px] text-indigo-400 font-bold border-b border-indigo-500/20 flex justify-between items-center bg-gradient-to-r from-indigo-900/20 to-transparent">
                            <span className="flex items-center gap-2"><Bot size={14} /> STUDIO ASSISTANT</span>
                            <button onClick={() => setAiOpen(false)}><X size={14} /></button>
                        </div>

                        <div ref={aiScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                            {aiChat.length === 0 && (
                                <div className="text-center py-10 opacity-30">
                                    <Sparkles size={32} className="mx-auto mb-4" />
                                    <p className="text-xs">Ask me to write functions, fix bugs, or explain code concepts.</p>
                                </div>
                            )}
                            {aiChat.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] ${msg.role === 'ai' ? 'bg-indigo-900/40 text-indigo-100 rounded-tl-none border border-indigo-500/20 shadow-lg shadow-indigo-500/5' : 'bg-slate-800 text-white rounded-tr-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {aiLoading && <div className="text-indigo-500 animate-pulse text-[10px] font-bold">Bot is analyzing current context...</div>}
                        </div>

                        <div className="p-4 border-t border-slate-700 bg-slate-950/50">
                            <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 flex gap-2 ring-1 ring-indigo-500/20">
                                <input
                                    value={aiInput}
                                    onChange={e => setAiInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && askAI()}
                                    placeholder="Fix this loop..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white px-2"
                                />
                                <button
                                    onClick={askAI}
                                    disabled={!aiInput.trim() || aiLoading}
                                    className="bg-indigo-600 hover:bg-indigo-500 p-2 rounded-lg text-white disabled:opacity-30 transition-all active:scale-95"
                                >
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="h-8 bg-slate-900 border-t border-slate-700 px-4 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                <div className="flex gap-4">
                    <span>OS_ENV: PRODUCTION</span>
                    <span className="text-indigo-500/50">MEM: 124MB</span>
                    {aiOpen && <span className="text-emerald-500 animate-pulse">● AI_LINK: CONNECTED</span>}
                </div>
                <span>CONNECTED: @{user?.username}</span>
            </div>
        </div>
    );
};

export default DevStudio;
