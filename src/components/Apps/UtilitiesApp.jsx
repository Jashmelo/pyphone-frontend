import React, { useState } from 'react';
import { Cloud, Calculator, Binary, Code } from 'lucide-react';

const CalculatorApp = () => {
    const [display, setDisplay] = useState('');

    // Simple eval
    const calc = () => {
        try {
            // Support tetration x,y
            if (display.includes(',')) {
                const [b, h] = display.split(',').map(Number);
                if (!isNaN(b) && !isNaN(h)) {
                    let res = b;
                    for (let i = 0; i < h - 1; i++) res = Math.pow(b, res);
                    setDisplay(String(res));
                    return;
                }
            }
            // eslint-disable-next-line no-eval
            setDisplay(String(eval(display)));
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

// Main Utilities Container
const UtilitiesApp = () => {
    const [view, setView] = useState('menu');

    if (view === 'calc') return <div className="h-full"><Back setView={setView} /><CalculatorApp /></div>;
    if (view === 'conv') return <div className="h-full"><Back setView={setView} /><ConverterApp /></div>;
    if (view === 'weather') return <div className="h-full flex items-center justify-center text-white text-xl"><Back setView={setView} />Mock Weather: Sunny 25°C</div>;

    return (
        <div className="p-8 grid grid-cols-2 gap-6 h-full content-start">
            <UtilCard icon={Calculator} label="Calculator" onClick={() => setView('calc')} color="bg-orange-500" />
            <UtilCard icon={Binary} label="Converter" onClick={() => setView('conv')} color="bg-blue-500" />
            <UtilCard icon={Cloud} label="Weather" onClick={() => setView('weather')} color="bg-sky-500" />
            <UtilCard icon={Code} label="Stream Gen" onClick={() => alert('Matrix Stream unimplemented in this view')} color="bg-green-500" />
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
