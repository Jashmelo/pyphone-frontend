import React, { useState, useEffect, useRef } from 'react';
import { Cloud, Calculator, Binary, Code, Search, RefreshCw, Copy, CheckCheck } from 'lucide-react';
import { endpoints } from '../../config';

const CalculatorApp = () => {
    const [display, setDisplay] = useState('');

    const calc = () => {
        try {
            if (display.includes(',')) {
                const [b, h] = display.split(',').map(Number);
                if (!isNaN(b) && !isNaN(h)) {
                    let res = b;
                    for (let i = 0; i < h - 1; i++) res = Math.pow(b, res);
                    setDisplay(String(res));
                    return;
                }
            }
            // eslint-disable-next-line no-new-func
            const result = new Function(`return ${display}`)();
            setDisplay(String(result));
        } catch {
            setDisplay('Error');
        }
    };

    return (
        <div className="h-full flex flex-col bg-black text-white p-4">
            <div className="flex-1 flex items-end justify-end text-6xl font-light mb-4 truncate">{display || '0'}</div>
            <div className="grid grid-cols-4 gap-2">
                {['C', '(', ')', '/'].map(c => <Btn key={c} v={c} onClick={() => c === 'C' ? setDisplay('') : setDisplay(p => p + c)} color="bg-gray-400 text-black" />)}
                {[7, 8, 9, '*'].map(c => <Btn key={c} v={c} onClick={() => setDisplay(p => p + c)} color={typeof c === 'number' ? 'bg-[#333]' : 'bg-orange-500'} />)}
                {[4, 5, 6, '-'].map(c => <Btn key={c} v={c} onClick={() => setDisplay(p => p + c)} color={typeof c === 'number' ? 'bg-[#333]' : 'bg-orange-500'} />)}
                {[1, 2, 3, '+'].map(c => <Btn key={c} v={c} onClick={() => setDisplay(p => p + c)} color={typeof c === 'number' ? 'bg-[#333]' : 'bg-orange-500'} />)}
                {[0, '.', ',', '='].map(c => <Btn key={c} v={c} onClick={() => c === '=' ? calc() : setDisplay(p => p + String(c))} color={c === '=' ? 'bg-orange-500' : 'bg-[#333]'} />)}
            </div>
            <p className="text-xs text-center text-gray-500 mt-2">Use ',' for Tetration (base,height)</p>
        </div>
    );
};

const Btn = ({ v, onClick, color }) => <button onClick={onClick} className={`${color} h-16 rounded-full text-2xl font-medium active:opacity-70 transition-opacity`}>{v}</button>;

const ConverterApp = () => {
    const [val, setVal] = useState('');
    const [mode, setMode] = useState('bin2dec');

    const convert = () => {
        try {
            const v = val.trim();
            if (!v) return '';
            switch (mode) {
                case 'bin2dec': return parseInt(v, 2);
                case 'dec2bin': return parseInt(v).toString(2);
                case 'hex2dec': return parseInt(v, 16);
                case 'dec2hex': return parseInt(v).toString(16).toUpperCase();
                default: return '';
            }
        } catch { return 'Error'; }
    };

    return (
        <div className="p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Converter</h2>
            <div className="bg-[#2c2c2e] p-4 rounded-xl mb-4">
                <input value={val} onChange={e => setVal(e.target.value)} className="bg-transparent text-xl w-full border-b border-white/20 pb-2 focus:outline-none" placeholder="Input..." />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-8">
                {[['bin2dec', 'Bin -> Dec'], ['dec2bin', 'Dec -> Bin'], ['hex2dec', 'Hex -> Dec'], ['dec2hex', 'Dec -> Hex']].map(([k, l]) => (
                    <button key={k} onClick={() => setMode(k)} className={`p-3 rounded-lg ${mode === k ? 'bg-indigo-600' : 'bg-white/10'}`}>{l}</button>
                ))}
            </div>
            <div className="bg-white/10 p-6 rounded-xl">
                <p className="text-xs text-gray-400 mb-1">Result</p>
                <p className="text-4xl font-mono">{convert()}</p>
            </div>
        </div>
    );
};

const WeatherApp = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState('London');
    const [search, setSearch] = useState('');

    const fetchWeather = async (lat, lon, name) => {
        setLoading(true);
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const json = await res.json();
            setData(json.current_weather);
            setLocation(name);
            setLoading(false);
        } catch (err) {
            console.error("Weather error", err);
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;
        try {
            const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=1&language=en&format=json`);
            const json = await res.json();
            if (json.results && json.results.length > 0) {
                const city = json.results[0];
                fetchWeather(city.latitude, city.longitude, city.name);
            } else {
                alert("Location not found");
            }
        } catch (err) {
            console.error("Geocoding error", err);
        }
    };

    useEffect(() => {
        fetchWeather(51.5074, -0.1278, 'London');
    }, []);

    const getCondition = (code) => {
        if (code === 0) return 'Clear';
        if (code <= 3) return 'Partly Cloudy';
        if (code <= 48) return 'Foggy';
        if (code <= 67) return 'Rainy';
        if (code <= 77) return 'Snowy';
        return 'Stormy';
    };

    return (
        <div className="h-full flex flex-col text-white bg-gradient-to-b from-sky-500 to-indigo-600">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="p-4 flex gap-2 bg-black/10 backdrop-blur-sm">
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search city..."
                    className="flex-1 bg-white/20 border border-white/30 rounded-full px-4 py-1.5 focus:outline-none placeholder-white/50 text-sm"
                />
                <button type="submit" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <Search size={18} />
                </button>
            </form>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">Loading Weather...</div>
            ) : data ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                    <h2 className="text-3xl font-bold mb-2">{location}</h2>
                    <p className="text-8xl font-thin mb-4">{Math.round(data.temperature)}°</p>
                    <p className="text-xl opacity-80">{getCondition(data.weathercode)}</p>
                    <div className="mt-8 flex gap-8 opacity-60">
                        <div className="text-center">
                            <p className="text-xs">WIND</p>
                            <p className="font-bold">{data.windspeed} km/h</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xs">DIRECTION</p>
                            <p className="font-bold">{data.winddirection}°</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-red-200">Weather Unavailable</div>
            )}
        </div>
    );
};

const StreamGenApp = () => {
    const [stream, setStream] = useState('');
    const [query, setQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [length, setLength] = useState(2000);
    const streamRef = useRef(null);

    const generateStream = async () => {
        setLoading(true);
        setSearchResult(null);
        try {
            const res = await fetch(endpoints.streamGenerate, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ length })
            });
            const data = await res.json();
            setStream(data.stream);
        } catch {
            // Fallback: generate locally if backend is unreachable
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
            let result = '';
            for (let i = 0; i < length; i++) {
                result += chars[Math.floor(Math.random() * chars.length)];
            }
            setStream(result);
        } finally {
            setLoading(false);
        }
    };

    const doSearch = () => {
        if (!query.trim() || !stream) return;
        const count = stream.split(query).length - 1;
        const indices = [];
        let idx = stream.indexOf(query, 0);
        while (idx !== -1 && indices.length < 50) {
            indices.push(idx);
            idx = stream.indexOf(query, idx + 1);
        }
        setSearchResult({ query, count, indices });
        // Scroll to first match
        if (streamRef.current) streamRef.current.scrollTop = 0;
    };

    const copyStream = () => {
        if (!stream) return;
        navigator.clipboard.writeText(stream).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Highlight matches in stream display
    const renderStream = () => {
        if (!stream) return <span className="text-gray-600 italic">No stream generated yet. Press Generate.</span>;
        if (!searchResult || !searchResult.query) {
            return <span className="break-all font-mono text-[11px] leading-relaxed text-green-400">{stream}</span>;
        }
        // Split and highlight
        const parts = stream.split(searchResult.query);
        return (
            <span className="break-all font-mono text-[11px] leading-relaxed">
                {parts.map((part, i) => (
                    <React.Fragment key={i}>
                        <span className="text-green-400">{part}</span>
                        {i < parts.length - 1 && (
                            <span className="bg-yellow-400 text-black font-bold">{searchResult.query}</span>
                        )}
                    </React.Fragment>
                ))}
            </span>
        );
    };

    return (
        <div className="h-full flex flex-col bg-black text-white p-4 gap-3">
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-gray-400 whitespace-nowrap">Length:</label>
                    <select
                        value={length}
                        onChange={e => setLength(Number(e.target.value))}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-green-400 focus:outline-none"
                    >
                        {[500, 1000, 2000, 3000, 5000].map(l => (
                            <option key={l} value={l}>{l} chars</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={generateStream}
                    disabled={loading}
                    className="flex items-center gap-1 bg-green-700 hover:bg-green-600 disabled:opacity-50 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    {loading ? 'Generating...' : 'Generate'}
                </button>
                <button
                    onClick={copyStream}
                    disabled={!stream}
                    className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                >
                    {copied ? <CheckCheck size={13} className="text-green-400" /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>

            {/* Search bar */}
            <div className="flex gap-2">
                <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && doSearch()}
                    placeholder="Search sequence..."
                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-green-500"
                />
                <button
                    onClick={doSearch}
                    disabled={!stream || !query.trim()}
                    className="bg-yellow-600 hover:bg-yellow-500 disabled:opacity-30 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition-colors"
                >
                    <Search size={13} /> Search
                </button>
            </div>

            {/* Search result badge */}
            {searchResult && (
                <div className="bg-yellow-900/40 border border-yellow-500/40 rounded px-3 py-1.5 text-xs">
                    <span className="text-yellow-300 font-bold">{searchResult.count}</span>
                    <span className="text-gray-300"> occurrence{searchResult.count !== 1 ? 's' : ''} of </span>
                    <span className="text-yellow-300 font-mono font-bold">"{searchResult.query}"</span>
                    {searchResult.count > 0 && (
                        <span className="text-gray-400"> at positions: {searchResult.indices.slice(0, 5).join(', ')}{searchResult.indices.length > 5 ? '...' : ''}</span>
                    )}
                </div>
            )}

            {/* Stream display */}
            <div
                ref={streamRef}
                className="flex-1 bg-gray-950 border border-gray-800 rounded-xl p-3 overflow-y-auto overflow-x-hidden"
            >
                {renderStream()}
            </div>

            <p className="text-[10px] text-gray-600 text-center">
                {stream ? `${stream.length} chars generated` : 'Click Generate to create a random character stream'}
            </p>
        </div>
    );
};

const UtilitiesApp = () => {
    const [view, setView] = useState('menu');

    if (view === 'calc') return <div className="h-full"><Back setView={setView} /><CalculatorApp /></div>;
    if (view === 'conv') return <div className="h-full"><Back setView={setView} /><ConverterApp /></div>;
    if (view === 'weather') return <div className="h-full"><Back setView={setView} /><WeatherApp /></div>;
    if (view === 'stream') return <div className="h-full relative"><Back setView={setView} /><StreamGenApp /></div>;

    return (
        <div className="p-8 grid grid-cols-2 gap-6 h-full content-start">
            <UtilCard icon={Calculator} label="Calculator" onClick={() => setView('calc')} color="bg-orange-500" />
            <UtilCard icon={Binary} label="Converter" onClick={() => setView('conv')} color="bg-blue-500" />
            <UtilCard icon={Cloud} label="Weather" onClick={() => setView('weather')} color="bg-sky-500" />
            <UtilCard icon={Code} label="Stream Gen" onClick={() => setView('stream')} color="bg-green-500" />
        </div>
    );
};

const Back = ({ setView }) => <button onClick={() => setView('menu')} className="absolute top-2 left-2 text-white bg-black/50 px-2 rounded z-10">&larr;</button>;

const UtilCard = ({ icon: Icon, label, onClick, color }) => (
    <button onClick={onClick} className={`${color} aspect-square rounded-2xl flex flex-col items-center justify-center text-white shadow-lg hover:scale-105 transition-transform`}>
        <Icon size={48} className="mb-2" />
        <span className="font-medium">{label}</span>
    </button>
);

export default UtilitiesApp;
