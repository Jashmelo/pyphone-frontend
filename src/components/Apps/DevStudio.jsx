import React, { useState, useEffect, useRef } from 'react';
import { Code2, Play, Save, Globe, Lock, Bot, Sparkles, Send, X, LayoutGrid, Package, Plus, Trash2, ClipboardPaste, PlusSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints, API_BASE_URL } from '../../config';

const DevStudio = () => {
    const { user } = useOS();
    const [view, setView] = useState('projects');
    const [appName, setAppName] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [previewSrc, setPreviewSrc] = useState('');
    const [status, setStatus] = useState('');
    const [projects, setProjects] = useState([]);
    const [storeApps, setStoreApps] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiOpen, setAiOpen] = useState(false);
    const [aiInput, setAiInput] = useState('');
    const [aiChat, setAiChat] = useState([]);
    const [aiLoading, setAiLoading] = useState(false);
    const [autoRun, setAutoRun] = useState(true);
    // mobile: 'editor' | 'output'
    const [mobileTab, setMobileTab] = useState('editor');
    const aiScrollRef = useRef(null);
    const autoRunTimerRef = useRef(null);

    const languages = [
        {
            id: 'javascript', name: 'JS', ext: 'js',
            default: [
                '// Write your JavaScript app here',
                'console.log("Hello from PyPhone OS!")',
                '',
                '// Example: create a styled element',
                "const box = document.createElement('div')",
                "box.style.cssText = 'padding:24px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;border-radius:16px;text-align:center;font-family:sans-serif'",
                "box.innerHTML = '<h1 style=\'margin:0 0 8px\'>Interactive App</h1><p style=\'margin:0;opacity:.8\'>Edit the code and click Run</p>'",
                "document.body.style.margin = '0'",
                'document.body.appendChild(box)'
            ].join('\n')
        },
        { id: 'python', name: 'Python', ext: 'py', default: '# Simulation Mode\nprint("Hello from PyPhone OS")\nprint("Python code execution in browser is limited")\nprint("For full execution, use the backend API")' },
        { id: 'cpp', name: 'C++', ext: 'cpp', default: '// Simulation Mode\n#include <iostream>\nint main() {\n    std::cout << "PyPhone OS C++ Stack" << std::endl;\n    return 0;\n}' },
        { id: 'html', name: 'HTML', ext: 'html', default: '<!-- Pure HTML/CSS App -->\n<div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px;border-radius:20px;color:white;text-align:center;">\n  <h1>Native HTML App</h1>\n  <p>Click Run to render your design</p>\n  <button style="background:white;color:#667eea;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;font-weight:bold;margin-top:20px;">Click Me</button>\n</div>' }
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
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const fetchStore = async () => {
        setLoading(true);
        try {
            const res = await fetch(endpoints.publicApps);
            const data = await res.json();
            setStoreApps(Array.isArray(data) ? data : []);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const loadApp = (app) => {
        setAppName(app.name);
        setIsPublic(app.is_public);
        const langMatch = app.code.match(/^\[LANG:(.+?)\]/);
        if (langMatch) {
            setLanguage(langMatch[1]);
            setCode(app.code.replace(/^\[LANG:.+?\]\n?/, ''));
        } else {
            setCode(app.code);
        }
        setView('editor');
        setPreviewSrc('');
    };

    const createNew = () => {
        setAppName('Untitled App');
        setLanguage('javascript');
        setCode(languages[0].default);
        setIsPublic(false);
        setView('editor');
        setPreviewSrc('');
    };

    useEffect(() => {
        if (aiScrollRef.current)
            aiScrollRef.current.scrollTop = aiScrollRef.current.scrollHeight;
    }, [aiChat]);

    const toDataURI = (html) =>
        'data:text/html;charset=utf-8,' + encodeURIComponent(html);

    const buildJsDoc = (userCode) => [
        '<!DOCTYPE html>',
        '<html>',
        '<head>',
        '  <meta charset="utf-8">',
        '  <style>body{margin:0;padding:0;background:#fff;font-family:sans-serif}</style>',
        '</head>',
        '<body>',
        '<script>',
        '(function(){',
        '  var _logs=[];',
        '  var _ol=console.log.bind(console),_oe=console.error.bind(console),_ow=console.warn.bind(console);',
        '  console.log=function(){_ol.apply(console,arguments);_logs.push({t:"log",m:Array.from(arguments).map(function(x){return typeof x==="object"?JSON.stringify(x):String(x)}).join(" ")});};',
        '  console.error=function(){_oe.apply(console,arguments);_logs.push({t:"err",m:"ERROR: "+Array.from(arguments).map(function(x){return typeof x==="object"?JSON.stringify(x):String(x)}).join(" ")});};',
        '  console.warn=function(){_ow.apply(console,arguments);_logs.push({t:"warn",m:"WARN: "+Array.from(arguments).join(" ")});};',
        '  try{',
        userCode,
        '  }catch(e){',
        '    document.body.innerHTML="<div style=\'color:#ff6b6b;padding:20px;font-family:monospace;background:#1a1a1a;min-height:100vh;border-left:4px solid #ff6b6b\'><strong>Error:</strong><br/>"+e.message+"</div>";',
        '    return;',
        '  }',
        '  if(!document.body.children.length&&_logs.length){',
        '    var pre=document.createElement("pre");',
        '    pre.style.cssText="background:#1a1a1a;color:#0f0;font-family:Courier New,monospace;padding:20px;margin:0;min-height:100vh;white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.6";',
        '    pre.textContent=_logs.map(function(l){return l.m}).join("\n");',
        '    document.body.style.margin="0";',
        '    document.body.appendChild(pre);',
        '  }else if(!document.body.children.length){',
        '    document.body.innerHTML="<div style=\'color:#999;padding:20px;text-align:center;font-family:monospace\'>Code executed (no output)</div>";',
        '  }',
        '})()',
        '<\/script>',
        '</body>',
        '</html>'
    ].join('\n');

    const makeTerminalHTML = (content, isError = false) => {
        const escaped = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const color = isError ? '#ff6b6b' : '#0f0';
        const borderColor = isError ? '#ff6b6b' : '#0f0';
        return '<!DOCTYPE html><html><body style="background:#0a0a0a;color:' + color + ';font-family:Courier New,monospace;padding:20px;margin:0;min-height:100vh;border-left:4px solid ' + borderColor + '"><pre style="white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.6;margin:0">' + escaped + '</pre></body></html>';
    };

    const runCode = async () => {
        try {
            if (language === 'html') {
                const full = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:16px;box-sizing:border-box}</style></head><body>' + code + '</body></html>';
                setPreviewSrc(toDataURI(full));
                setStatus('success');
                setMobileTab('output');
            } else if (language === 'javascript') {
                setPreviewSrc(toDataURI(buildJsDoc(code)));
                setStatus('success');
                setMobileTab('output');
            } else if (language === 'python' || language === 'cpp') {
                // Show running indicator
                const runningHTML = makeTerminalHTML('$ ' + language + ' main.' + (language === 'cpp' ? 'cpp' : 'py') + '\n\nRunning...');
                setPreviewSrc(toDataURI(runningHTML));
                setMobileTab('output');
                setStatus('saving');

                const res = await fetch(endpoints.execute, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language, code })
                });
                const data = await res.json();
                const header = '$ ' + language + ' main.' + (language === 'cpp' ? 'cpp' : 'py') + '\n\n';
                setPreviewSrc(toDataURI(makeTerminalHTML(header + (data.output || '(no output)'), data.error)));
                setStatus(data.error ? 'error' : 'success');
            } else {
                const ext = languages.find(l => l.id === language)?.ext || 'file';
                const html = '<!DOCTYPE html><html><body style="background:#000;color:#0f0;font-family:monospace;padding:20px;margin:0"><p>$ ' + language + ' run main.' + ext + '</p><p>[BUILD] Compiling...</p><p style="color:#fff">Hello from the ' + language + ' simulation environment!</p></body></html>';
                setPreviewSrc(toDataURI(html));
                setStatus('success');
                setMobileTab('output');
            }
        } catch (err) {
            setStatus('error');
            const msg = (err.message || String(err));
            setPreviewSrc(toDataURI(makeTerminalHTML('Critical Error:\n' + msg, true)));
        }
    };

    useEffect(() => {
        // Auto-run only for client-side languages (html/js) to avoid spamming backend
        if (autoRun && view === 'editor' && code && (language === 'html' || language === 'javascript')) {
            if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current);
            autoRunTimerRef.current = setTimeout(runCode, 1000);
        }
        return () => { if (autoRunTimerRef.current) clearTimeout(autoRunTimerRef.current); };
    }, [code, language, view, autoRun]);

    const publishApp = async () => {
        if (!appName.trim()) { alert('Please name your app!'); return; }
        setStatus('saving');
        try {
            const res = await fetch(endpoints.apps(user.username), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ app_name: appName, code: '[LANG:' + language + ']\n' + code, is_public: isPublic })
            });
            if (res.ok) { setStatus('success'); setTimeout(() => setStatus(''), 2000); fetchProjects(); }
            else { setStatus('error'); }
        } catch (err) { setStatus('error'); }
    };

    const askAI = async () => {
        if (!aiInput.trim() || aiLoading) return;
        const userMsg = aiInput;
        const updatedChat = [...aiChat, { role: 'user', content: userMsg }];
        setAiChat(updatedChat);
        setAiInput('');
        setAiLoading(true);
        try {
            const systemHint = 'You are the Dev Studio AI Co-Pilot inside PyPhone OS. The user is writing ' + language + ' code. When asked to write or modify code, ALWAYS wrap your code in a fenced code block using triple backticks. This allows the user to apply it directly to the editor. Be concise.';

            // Build history: everything before the message we just added
            const history = updatedChat.slice(0, -1).map(m => ({
                role: m.role,
                content: m.content
            }));

            const res = await fetch(endpoints.aiStudio, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: systemHint + '\n\nUser request: ' + userMsg,
                    context: '[LANG:' + language + ']\n' + code,
                    history
                })
            });
            const data = await res.json();
            setAiChat(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (err) {
            setAiChat(prev => [...prev, { role: 'ai', content: 'AI link interrupted.' }]);
        } finally { setAiLoading(false); }
    };

    const deleteApp = async (name) => {
        if (!confirm('Delete "' + name + '"? This cannot be undone.')) return;
        try {
            const res = await fetch(API_BASE_URL + '/api/apps/' + user.username + '/' + encodeURIComponent(name), { method: 'DELETE' });
            if (res.ok) fetchProjects();
        } catch (err) { console.error('Delete failed:', err); }
    };

    const parseMessage = (content) => {
        const parts = [];
        const regex = /```(?:\w+)?\n?([\s\S]*?)```/g;
        let last = 0;
        let match;
        while ((match = regex.exec(content)) !== null) {
            if (match.index > last) parts.push({ type: 'text', value: content.slice(last, match.index) });
            parts.push({ type: 'code', value: match[1].trim() });
            last = match.index + match[0].length;
        }
        if (last < content.length) parts.push({ type: 'text', value: content.slice(last) });
        return parts;
    };

    const applyCode = (snippet) => { setCode(snippet); setMobileTab('editor'); };
    const appendCode = (snippet) => { setCode(prev => prev + '\n\n' + snippet); setMobileTab('editor'); };

    return (
        <div className="h-full flex bg-[#0f172a] text-slate-200 overflow-hidden">

            {/* Sidebar: icon-only on mobile, full on md+ */}
            <div className="w-12 md:w-56 border-r border-slate-800 bg-slate-900/80 flex flex-col shrink-0">
                <div className="p-3 border-b border-slate-800 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 rounded-lg shrink-0">
                        <Code2 size={18} className="text-white" />
                    </div>
                    <span className="font-black tracking-tighter hidden md:block text-sm">DEV STUDIO</span>
                </div>
                <div className="flex-1 p-2 space-y-1 overflow-y-auto no-scrollbar">
                    {[
                        { id: 'projects', Icon: LayoutGrid, label: 'My Projects' },
                        { id: 'store', Icon: Package, label: 'Public Store' },
                    ].map(({ id, Icon, label }) => (
                        <button key={id} onClick={() => setView(id)}
                            className={'w-full flex items-center gap-2 px-2 py-2.5 rounded-xl transition-all ' + (view === id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-500')}>
                            <Icon size={18} className="shrink-0" />
                            <span className="font-bold text-xs hidden md:block">{label}</span>
                        </button>
                    ))}
                    <button onClick={createNew}
                        className={'w-full flex items-center gap-2 px-2 py-2.5 rounded-xl transition-all ' + (view === 'editor' ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 text-slate-500')}>
                        <Plus size={18} className="shrink-0" />
                        <span className="font-bold text-xs hidden md:block">New Editor</span>
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                {view === 'editor' ? (
                    <>
                        {/* Toolbar: scrollable on mobile */}
                        <div className="h-12 border-b border-slate-800 bg-slate-900/50 flex items-center gap-2 px-3 shrink-0 overflow-x-auto no-scrollbar">
                            <input
                                value={appName}
                                onChange={e => setAppName(e.target.value)}
                                placeholder="App name..."
                                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 ring-indigo-500 w-28 shrink-0"
                            />
                            <select
                                value={language}
                                onChange={e => setLanguage(e.target.value)}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none shrink-0"
                            >
                                {languages.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                            <button
                                onClick={() => setIsPublic(!isPublic)}
                                className={'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 ' + (isPublic ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700')}
                            >
                                {isPublic ? <Globe size={11} /> : <Lock size={11} />}
                                <span className="hidden sm:inline">{isPublic ? 'PUB' : 'PRV'}</span>
                            </button>
                            <button
                                onClick={() => setAutoRun(!autoRun)}
                                className={'px-2 py-1 rounded-lg text-[10px] font-black transition-all shrink-0 ' + (autoRun ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700')}
                            >
                                {autoRun ? 'AUTO' : 'MAN'}
                            </button>
                            <button onClick={() => setAiOpen(!aiOpen)}
                                className={'p-1.5 rounded-lg transition-all shrink-0 ' + (aiOpen ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-800 text-slate-500')}>
                                <Bot size={16} />
                            </button>
                            <div className="flex-1" />
                            <button onClick={runCode}
                                className="bg-slate-800 hover:bg-slate-700 font-bold px-3 py-1 rounded-lg text-xs border border-slate-700 flex items-center gap-1 transition-all active:scale-95 shrink-0">
                                <Play size={13} /> Run
                            </button>
                            <button onClick={publishApp}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg text-xs transition-all flex items-center gap-1 active:scale-95 shrink-0">
                                <Save size={13} /> {status === 'saving' ? '...' : 'Save'}
                            </button>
                        </div>

                        {/* Mobile tab switcher */}
                        <div className="flex md:hidden border-b border-slate-800 shrink-0">
                            <button
                                onClick={() => setMobileTab('editor')}
                                className={'flex-1 py-2 text-[11px] font-black uppercase tracking-widest transition-all ' + (mobileTab === 'editor' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40' : 'text-slate-600')}
                            >Editor</button>
                            <button
                                onClick={() => setMobileTab('output')}
                                className={'flex-1 py-2 text-[11px] font-black uppercase tracking-widest transition-all ' + (mobileTab === 'output' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40' : 'text-slate-600')}
                            >Output</button>
                            {aiOpen && (
                                <button
                                    onClick={() => setMobileTab('ai')}
                                    className={'flex-1 py-2 text-[11px] font-black uppercase tracking-widest transition-all ' + (mobileTab === 'ai' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-slate-900/40' : 'text-slate-600')}
                                >AI</button>
                            )}
                        </div>

                        {/* Desktop: side-by-side. Mobile: tabbed */}
                        <div className="flex-1 flex overflow-hidden">

                            {/* Editor pane */}
                            <div className={
                                'flex flex-col border-r border-slate-800 transition-all ' +
                                (aiOpen ? 'md:w-1/3' : 'md:w-1/2') +
                                ' ' + (mobileTab === 'editor' ? 'flex-1' : 'hidden md:flex')
                            }>
                                <div className="bg-slate-900 px-3 py-1 text-[10px] text-slate-500 font-mono border-b border-slate-800 flex justify-between shrink-0">
                                    <span>EDITOR</span>
                                    <span>{language.toUpperCase()}</span>
                                </div>
                                <textarea
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    spellCheck={false}
                                    className="flex-1 bg-slate-950 p-4 font-mono text-xs md:text-sm resize-none focus:outline-none leading-relaxed text-indigo-300/80"
                                />
                            </div>

                            {/* Output pane */}
                            <div className={
                                'flex flex-col bg-slate-900/20 transition-all ' +
                                (aiOpen ? 'md:w-1/3 md:border-r md:border-slate-800' : 'md:w-1/2') +
                                ' ' + (mobileTab === 'output' ? 'flex-1' : 'hidden md:flex')
                            }>
                                <div className="bg-slate-900 px-3 py-1 text-[10px] text-slate-500 font-mono border-b border-slate-800 shrink-0">OUTPUT</div>
                                <div className="flex-1 m-3 rounded-xl shadow-2xl overflow-hidden border border-slate-800/50 bg-white">
                                    {previewSrc
                                        ? <iframe key={previewSrc} src={previewSrc} className="w-full h-full border-none" sandbox="allow-scripts" title="preview" />
                                        : <div className="h-full flex items-center justify-center text-slate-700 uppercase font-black text-xs opacity-20 tracking-[1em]">Ready</div>
                                    }
                                </div>
                            </div>

                            {/* AI Copilot pane */}
                            {aiOpen && (
                                <div className={
                                    'bg-slate-900/60 flex flex-col md:w-1/3 ' +
                                    (mobileTab === 'ai' ? 'flex-1' : 'hidden md:flex')
                                }>
                                    <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-indigo-950/20 shrink-0">
                                        <span className="text-xs font-black text-indigo-400 tracking-widest flex items-center gap-2"><Sparkles size={13} /> AI CO-PILOT</span>
                                        <button onClick={() => setAiOpen(false)}><X size={15} /></button>
                                    </div>
                                    <div ref={aiScrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 no-scrollbar">
                                        {aiChat.length === 0 && (
                                            <p className="text-[10px] text-slate-600 text-center pt-4">Ask the AI to write or fix code. Hit Replace to paste it into the editor.</p>
                                        )}
                                        {aiChat.map((msg, i) => (
                                            <div key={i} className={'flex flex-col ' + (msg.role === 'ai' ? 'items-start' : 'items-end')}>
                                                {msg.role === 'ai' ? (
                                                    <div className="w-full space-y-2">
                                                        {parseMessage(msg.content).map((part, j) =>
                                                            part.type === 'text' ? (
                                                                <p key={j} className="text-[11px] text-indigo-100 leading-relaxed whitespace-pre-wrap">{part.value}</p>
                                                            ) : (
                                                                <div key={j} className="w-full rounded-xl overflow-hidden border border-indigo-500/20">
                                                                    <div className="bg-slate-950 px-3 py-1.5 flex justify-between items-center border-b border-indigo-500/20">
                                                                        <span className="text-[9px] text-indigo-400 font-mono font-bold uppercase tracking-widest">Generated Code</span>
                                                                        <div className="flex gap-1">
                                                                            <button onClick={() => applyCode(part.value)}
                                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-black transition-all active:scale-95">
                                                                                <ClipboardPaste size={10} /> Replace
                                                                            </button>
                                                                            <button onClick={() => appendCode(part.value)}
                                                                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-[9px] font-black transition-all active:scale-95">
                                                                                <PlusSquare size={10} /> Append
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                    <pre className="bg-slate-950/80 text-indigo-300 text-[10px] font-mono p-3 overflow-x-auto whitespace-pre-wrap break-words max-h-48">{part.value}</pre>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="p-3 rounded-2xl text-[11px] max-w-[90%] bg-slate-800 text-white">{msg.content}</div>
                                                )}
                                            </div>
                                        ))}
                                        {aiLoading && <div className="text-indigo-500 text-[10px] font-bold animate-pulse">Computing assistance...</div>}
                                    </div>
                                    <div className="p-3 border-t border-slate-800 shrink-0">
                                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 flex gap-2">
                                            <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && askAI()} placeholder="Ask AI..." className="flex-1 bg-transparent border-none focus:ring-0 text-xs text-white px-2" />
                                            <button onClick={askAI} className="bg-indigo-600 p-2 rounded-lg text-white"><Send size={13} /></button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl md:text-3xl font-black tracking-tighter uppercase">{view === 'projects' ? 'My Projects' : 'Public Store'}</h2>
                            <button onClick={() => view === 'projects' ? fetchProjects() : fetchStore()} className="text-indigo-400 text-xs font-bold hover:underline">Refresh</button>
                        </div>
                        {loading ? (
                            <div className="h-64 flex items-center justify-center text-slate-600 animate-pulse font-mono text-xs">LINKING TO KERNEL DATABASE...</div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(view === 'projects' ? projects : storeApps).length === 0 ? (
                                    <div className="col-span-full h-48 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-600 gap-3">
                                        <Package size={36} className="opacity-10" />
                                        <p className="font-bold text-xs tracking-widest uppercase opacity-40">No applications found</p>
                                    </div>
                                ) : (
                                    (view === 'projects' ? projects : storeApps).map((app, i) => (
                                        <div key={i} className="group bg-slate-900 border border-slate-800 p-5 rounded-3xl hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all shadow-xl hover:shadow-indigo-500/10 relative">
                                            {view === 'projects' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); deleteApp(app.name); }}
                                                    className="absolute top-4 right-4 p-2 bg-red-900/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                            <div onClick={() => loadApp(app)} className="cursor-pointer">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="p-2.5 bg-slate-950 rounded-2xl border border-slate-800 group-hover:bg-indigo-600 transition-all">
                                                        <Code2 size={20} className="group-hover:text-white text-indigo-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black bg-slate-950 px-2 py-1 rounded-full text-slate-500 border border-slate-800 uppercase tracking-widest">
                                                        {app.code.match(/^\[LANG:(.+?)\]/)?.[1] || 'JS'}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-bold mb-1 truncate">{app.name}</h3>
                                                <p className="text-xs text-slate-500 mb-3">{app.owner ? '@' + app.owner : 'Private User'}</p>
                                                <div className="flex gap-2 items-center">
                                                    {app.is_public ? <Globe size={13} className="text-emerald-500" /> : <Lock size={13} className="text-slate-600" />}
                                                    <span className="text-[10px] text-slate-600 font-mono">{app.created_at || 'Recently Saved'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                <div className="h-7 bg-slate-950/80 border-t border-slate-800 px-3 flex items-center justify-between text-[9px] text-slate-500 uppercase tracking-widest font-mono shrink-0">
                    <span className="hidden sm:block">CLUSTER: @DEV-01</span>
                    <span className="text-indigo-500/50">v2.1.4</span>
                    <span>AUTH: {user?.username?.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
};

export default DevStudio;
