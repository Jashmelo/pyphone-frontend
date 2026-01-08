import React, { useState, useEffect } from 'react';
import { Code2, Play, Save, Globe, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useOS } from '../../context/OSContext';
import { endpoints } from '../../config';

const DevStudio = () => {
    const { user } = useOS();
    const [appName, setAppName] = useState('');
    const [code, setCode] = useState('// Write your app code here\n// Use setContent(<html>) to render\n\nconst content = `\n  <div style="padding: 20px; text-align: center;">\n    <h1>Hello World</h1>\n    <p>This is my custom app!</p>\n  </div>\n`;\n\nsetContent(content);');
    const [isPublic, setIsPublic] = useState(false);
    const [preview, setPreview] = useState(null);
    const [status, setStatus] = useState(''); // success, error, saving

    const runCode = () => {
        try {
            // Very simple sandboxing: provide a setContent function to the code
            const sandbox = (codeStr) => {
                let htmlOutput = '';
                const setContent = (html) => { htmlOutput = html; };

                // execute code
                // eslint-disable-next-line no-new-func
                const fn = new Function('setContent', codeStr);
                fn(setContent);
                return htmlOutput;
            };

            setPreview(sandbox(code));
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
                    code: code,
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
                        <span>DEV STUDIO</span>
                    </div>
                    <input
                        value={appName}
                        onChange={e => setAppName(e.target.value)}
                        placeholder="App Name..."
                        className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm focus:outline-none focus:ring-1 ring-indigo-500 w-48"
                    />
                    <button
                        onClick={() => setIsPublic(!isPublic)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-colors ${isPublic ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}
                    >
                        {isPublic ? <Globe size={14} /> : <Lock size={14} />}
                        {isPublic ? 'PUBLIC REQUEST' : 'PRIVATE'}
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {status === 'success' && <CheckCircle2 size={18} className="text-emerald-500 animate-in fade-in" />}
                    {status === 'error' && <AlertCircle size={18} className="text-rose-500 animate-in shake" />}

                    <button
                        onClick={runCode}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 font-bold px-4 py-1.5 rounded-lg text-sm transition-colors"
                    >
                        <Play size={16} /> Run
                    </button>
                    <button
                        onClick={publishApp}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm transition-all active:scale-95"
                    >
                        <Save size={16} /> {status === 'saving' ? 'Saving...' : 'Publish'}
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Code Editor */}
                <div className="w-1/2 border-r border-slate-700 flex flex-col">
                    <div className="bg-slate-900 px-4 py-1 text-[10px] text-slate-500 font-mono flex justify-between">
                        <span>main.js</span>
                        <span>JavaScript</span>
                    </div>
                    <textarea
                        value={code}
                        onChange={e => setCode(e.target.value)}
                        spellCheck={false}
                        className="flex-1 bg-[#020617] p-6 font-mono text-sm resize-none focus:outline-none leading-relaxed text-indigo-300/90"
                    />
                </div>

                {/* Preview Window */}
                <div className="w-1/2 bg-slate-900/40 flex flex-col">
                    <div className="bg-slate-900 px-4 py-1 text-[10px] text-slate-500 font-mono">
                        <span>Preview</span>
                    </div>
                    <div className="flex-1 bg-white rounded-lg m-4 shadow-inner overflow-auto">
                        {preview ? (
                            <div dangerouslySetInnerHTML={{ __html: preview }} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
                                <Play size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium">Click "Run" to preview your app</p>
                                <p className="text-[10px] mt-2 max-w-[200px]">Apps render inside this canvas using standard HTML and CSS.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="h-8 bg-slate-900/80 border-t border-slate-700 px-4 flex items-center justify-between text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                <span>Core Engine v2.0.4</span>
                <span>Ready for override</span>
            </div>
        </div>
    );
};

export default DevStudio;
