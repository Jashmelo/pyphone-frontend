import React, { useState, useEffect } from 'react';
import { Code2, Play, Save, Globe, Lock, CheckCircle2, AlertCircle, Terminal, Languages } from 'lucide-react';
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

    const languages = [
        { id: 'javascript', name: 'JavaScript', ext: 'js', default: '// Write your JS app\nconst content = `<div style="padding:20px"><h1>Hello JS</h1></div>`;\nsetContent(content);' },
        { id: 'python', name: 'Python', ext: 'py', default: '# Simulation Mode\nprint("Hello from PyPhone OS")\n# Web UI rendering via set_content()\nset_content("<h1>Python App</h1>")' },
        { id: 'cpp', name: 'C++', ext: 'cpp', default: '// Simulation Mode\n#include <iostream>\nint main() {\n    std::cout << "PyPhone OS C++ Stack" << std::endl;\n    return 0;\n}' },
        { id: 'html', name: 'HTML/CSS', ext: 'html', default: '<!-- Pure Markup -->\n<div style="background: navy; color: white; padding: 40px; border-radius: 20px;">\n  <h1>Native HTML App</h1>\n</div>' }
    ];

    useEffect(() => {
        const lang = languages.find(l => l.id === language);
        if (lang) setCode(lang.default);
    }, [language]);

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
                // Simulation for non-JS
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

    return (
        <div className="h-full flex flex-col bg-[#0f172a] text-slate-200 overflow-hidden">
            {/* Toolbar */}
            <div className="h-14 border-b border-slate-700 bg-slate-900/50 flex items-center justify-between px-6">
                <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold mr-4">
                        <Code2 size={20} />
                        <span className="hidden md:inline">DEV STUDIO</span>
                    </div>
                    <input
                        value={appName}
                        onChange={e => setAppName(e.target.value)}
                        placeholder="App Name..."
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
                </div>

                <div className="flex items-center gap-3">
                    {status === 'success' && <CheckCircle2 size={18} className="text-emerald-500 animate-in fade-in" />}
                    {status === 'error' && <AlertCircle size={18} className="text-rose-500 animate-in shake" />}

                    <button
                        onClick={runCode}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 font-bold px-4 py-1.5 rounded-lg text-sm transition-colors border border-slate-700"
                    >
                        <Play size={16} /> Run
                    </button>
                    <button
                        onClick={publishApp}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-all active:scale-95"
                    >
                        <Save size={16} /> {status === 'saving' ? '...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Code Editor */}
                <div className="w-1/2 border-r border-slate-700 flex flex-col">
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

                {/* Preview Window */}
                <div className="w-1/2 bg-slate-900/40 flex flex-col">
                    <div className="bg-slate-900 px-4 py-1 text-[10px] text-slate-500 font-mono border-b border-slate-800 flex justify-between">
                        <span>Output Preview</span>
                        <Terminal size={12} />
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-950 rounded-lg m-4 shadow-2xl overflow-auto border border-slate-800">
                        {preview ? (
                            <div dangerouslySetInnerHTML={{ __html: preview }} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-950">
                                <Code2 size={64} className="mb-6 opacity-10" />
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Compiler Ready</p>
                                <p className="text-[10px] mt-2 text-slate-600 max-w-[240px]">Select a language and write your code to see results here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-8 bg-slate-900 border-t border-slate-700 px-4 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                <div className="flex gap-4">
                    <span>OS_ENV: PRODUCTION</span>
                    <span className="text-indigo-500/50">MEM: 124MB</span>
                </div>
                <span>CONNECTED: @{user?.username}</span>
            </div>
        </div>
    );
};

export default DevStudio;
