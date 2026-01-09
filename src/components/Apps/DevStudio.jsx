import React, { useState, useEffect, useRef } from 'react';
import { Code2, Play, Save, Globe, Lock, CheckCircle2, AlertCircle, Terminal, Languages, Bot, Sparkles, Send, X, ChevronRight, ChevronLeft, LayoutGrid, Package, Plus } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints, API_BASE_URL } from '../../config';

const DevStudio = () => {
    const { user } = useOS();
    const [view, setView] = useState('projects'); // projects, store, editor
    const [appName, setAppName] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState(''); // success, error, saving

    const [projects, setProjects] = useState([]);
    const [storeApps, setStoreApps] = useState([]);
    const [loading, setLoading] = useState(false);

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
        if (view === 'projects') fetchProjects();
        if (view === 'store') fetchStore();
    }, [view]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch(endpoints.apps(user.username));
            const data = await res.json();
            setProjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchStore = async () => {
        setLoading(true);
        try {
            const res = await fetch(endpoints.publicApps);
            const data = await res.json();
            setStoreApps(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadApp = (app) => {
        setAppName(app.name);
        setIsPublic(app.is_public);

        // Parse language from code metadata if exists
        const langMatch = app.code.match(/^\[LANG:(.+?)\]/);
        if (langMatch) {
            setLanguage(langMatch[1]);
            setCode(app.code.replace(/^\[LANG:.+?\]\n?/, ''));
        } else {
            setCode(app.code);
        }
        setView('editor');
    };

    const createNew = () => {
        setAppName('Untitled App');
        setLanguage('javascript');
        setCode(languages[0].default);
        setIsPublic(false);
        setView('editor');
    };

    useEffect(() => {
        if (aiScrollRef.current) {
            aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
        }
    }, [aiChat]);

    // Auto-refresh preview logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (code && view === 'editor') runCode();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [code, language, view]);

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
            setStatus('error');
            setPreview(`<div style="color: red; padding: 20px;">Error: ${err.message}</div>`);
        }
    };

    const publishApp = async () => {
        if (!appName.trim()) { alert("Please name your app!"); return; }
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
                setTimeout(() => setStatus(''), 2000);
            } else { setStatus('error'); }
        } catch (err) { setStatus('error'); }
    };

    const askAI = async () => {
        if (!aiInput.trim() || aiLoading) return;
        setAiChat(prev => [...prev, { role: 'user', content: aiInput }]);
        setAiInput(''); setAiLoading(true);
        try {
            const res = await fetch(endpoints.aiStudio, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: aiInput, context: `[LANG:${language}]\n${code}` })
            });
            const data = await res.json();
            setAiChat(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (err) {
            setAiChat(prev => [...prev, { role: 'ai', content: "AI link interrupted." }]);
        } finally { setAiLoading(false); }
    };

    return (
        <div className="h-full flex bg-[#0f172a] text-slate-200 overflow-hidden">
            {/* Nav Sidebar */}
            <div className="w-16 md:w-64 border-r border-slate-800 bg-slate-900/80 flex flex-col shrink-0">
                <div className="p-4 border-b border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                        <Code2 size={24} className="text-white" />
                    </div>
                    <span className="font-black tracking-tighter hidden md:block text-lg">DEV STUDIO</span>
                </div>

                <div className="flex-1 p-3 space-y-2 overflow-y-auto no-scrollbar">
                    <button
                        onClick={() => setView('projects')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'projects' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-500'}`}
                    >
                        <LayoutGrid size={20} />
                        <span className="font-bold text-sm hidden md:block">My Projects</span>
                    </button>
                    <button
                        onClick={() => setView('store')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'store' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-500'}`}
                    >
                        <Package size={20} />
                        <span className="font-bold text-sm hidden md:block">Public Store</span>
                    </button>
                    <button
                        onClick={createNew}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${view === 'editor' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-500'}`}
                    >
                        <Plus size={20} />
                        <span className="font-bold text-sm hidden md:block">New Editor</span>
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {view === 'editor' ? (
                    <>
                        <div className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 shrink-0">
                            <div className="flex items-center gap-4 flex-1">
                                <input
                                    value={appName}
                                    onChange={e => setAppName(e.target.value)}
                                    placeholder="Project Name..."
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 ring-indigo-500 w-44"
                                />
                                <select
                                    value={language}
                                    onChange={e => setLanguage(e.target.value)}
                                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none"
                                >
                                    {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                                <button
                                    onClick={() => setIsPublic(!isPublic)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${isPublic ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                                >
                                    {isPublic ? <Globe size={12} /> : <Lock size={12} />}
                                    {isPublic ? 'PUBLIC' : 'PRIVATE'}
                                </button>
                                <button onClick={() => setAiOpen(!aiOpen)} className={`p-2 rounded-lg transition-all ${aiOpen ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`} title="Studio AI">
                                    <Bot size={20} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={runCode} className="bg-slate-800 hover:bg-slate-700 font-bold px-4 py-1.5 rounded-lg text-sm border border-slate-700 flex items-center gap-2">
                                    <Play size={16} /> Run
                                </button>
                                <button onClick={publishApp} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2">
                                    <Save size={16} /> {status === 'saving' ? '...' : 'Publish'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            <div className={`flex flex-col border-r border-slate-800 transition-all ${aiOpen ? 'w-1/3' : 'w-1/2'}`}>
                                <div className="bg-slate-900 px-4 py-1 text-[10px] text-slate-500 font-mono border-b border-slate-800 flex justify-between">
                                    <span>EDITOR</span>
                                    <span>{language.toUpperCase()}</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    spellCheck={false}
                                    className="flex-1 bg-slate-950 p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed text-indigo-300/80"
                                />
                            </div>

                            <div className={`flex flex-col bg-slate-900/20 transition-all ${aiOpen ? 'w-1/3 border-r border-slate-800' : 'w-1/2'}`}>
                                <div className="bg-slate-900 px-4 py-1 text-[10px] text-slate-500 font-mono border-b border-slate-800">PREVIEW</div>
                                <div className="flex-1 m-4 bg-white dark:bg-slate-950 rounded-xl shadow-2xl overflow-auto border border-slate-800/50">
                                    {preview ? <div dangerouslySetInnerHTML={{ __html: preview }} /> : <div className="h-full flex items-center justify-center text-slate-700 uppercase font-black text-xs opacity-20 tracking-[1em]">Compiler Standby</div>}
                                </div>
                            </div>

                            {aiOpen && (
                                <div className="w-1/3 bg-slate-900/60 flex flex-col">
                                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-indigo-950/20">
                                        <span className="text-xs font-black text-indigo-400 tracking-widest flex items-center gap-2"><Sparkles size={14} /> AI CO-PILOT</span>
                                        <button onClick={() => setAiOpen(false)}><X size={16} /></button>
                                    </div>
                                    <div ref={aiScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                                        {aiChat.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                                <div className={`p-3 rounded-2xl text-[11px] max-w-[90%] ${msg.role === 'ai' ? 'bg-indigo-900/30 text-indigo-100 border border-indigo-500/20' : 'bg-slate-800 text-white'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {aiLoading && <div className="text-indigo-500 text-[10px] font-bold animate-pulse">Computing assistance...</div>}
                                    </div>
                                    <div className="p-4 border-t border-slate-800">
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex gap-2">
                                            <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && askAI()} placeholder="Fix bugs..." className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white px-2" />
                                            <button onClick={askAI} className="bg-indigo-600 p-2 rounded-lg text-white"><Send size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 p-8 overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black tracking-tighter uppercase">{view === 'projects' ? 'My Projects' : 'Public App Store'}</h2>
                            <button onClick={() => view === 'projects' ? fetchProjects() : fetchStore()} className="text-indigo-400 text-sm font-bold flex items-center gap-2 hover:underline">
                                Refresh List
                            </button>
                        </div>

                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-slate-600 animate-pulse font-mono">LINKING TO KERNEL DATABASE...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(view === 'projects' ? projects : storeApps).length === 0 ? (
                                    <div className="col-span-full h-64 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600 gap-4">
                                        <Package size={48} className="opacity-10" />
                                        <p className="font-bold text-sm tracking-widest uppercase opacity-40">No applications found</p>
                                    </div>
                                ) : (
                                    (view === 'projects' ? projects : storeApps).map((app, i) => (
                                        <div
                                            key={i}
                                            onClick={() => loadApp(app)}
                                            className="group bg-slate-900 border border-slate-800 p-6 rounded-3xl cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all shadow-xl hover:shadow-indigo-500/10"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 group-hover:bg-indigo-600 transition-all group-hover:scale-110">
                                                    <Code2 size={24} className="group-hover:text-white text-indigo-400" />
                                                </div>
                                                <span className="text-[10px] font-black bg-slate-950 px-2 py-1 rounded-full text-slate-500 border border-slate-800 uppercase tracking-widest">
                                                    {app.code.match(/^\[LANG:(.+?)\]/)?.[1] || 'JS'}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold mb-1 truncate">{app.name}</h3>
                                            <p className="text-xs text-slate-500 mb-4">{app.owner ? `@${app.owner}` : 'Private User'}</p>
                                            <div className="flex gap-2">
                                                {app.is_public ? <Globe size={14} className="text-emerald-500" /> : <Lock size={14} className="text-slate-600" />}
                                                <span className="text-[10px] text-slate-600 font-mono">{app.created_at || 'Recently Saved'}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="h-8 bg-slate-950/80 border-t border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                    <div className="flex gap-4">
                        <span>CLUSTER: @DEV-01</span>
                        <span className="text-indigo-500/50">BUILD: v2.1.4</span>
                    </div>
                    <span>AUTH: {user?.username?.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
};

export default DevStudio;
