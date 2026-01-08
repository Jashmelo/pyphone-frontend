import ChessGame from './ChessGame';
import HangmanGame from './HangmanGame';

const GamesArcade = () => {
    const [game, setGame] = useState(null);

    if (game) {
        return (
            <div className="h-full flex flex-col">
                <button onClick={() => setGame(null)} className="p-4 text-left text-indigo-400 hover:text-indigo-300">
                    &larr; Back to Arcade
                </button>
                <div className="flex-1 overflow-hidden">
                    {game === 'chess' && <ChessGame />}
                    {game === 'hangman' && <HangmanGame />}
                    {game === 'rps' && <RPSGame />}
                    {game === 'math' && <MathGame />}
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 grid grid-cols-3 gap-6">
            <GameCard title="Chess Sandbox" onClick={() => setGame('chess')} color="bg-orange-600" />
            <GameCard title="Hangman" onClick={() => setGame('hangman')} color="bg-gray-600" />
            <GameCard title="Rock Paper Scissors" onClick={() => setGame('rps')} color="bg-blue-600" />
            <GameCard title="Quick Math" onClick={() => setGame('math')} color="bg-green-600" />
        </div>
    );
};

const GameCard = ({ title, onClick, color }) => (
    <button onClick={onClick} className={`${color} p-6 rounded-2xl shadow-lg hover:scale-105 transition-transform text-white font-bold text-xl text-left`}>
        {title}
    </button>
);

const RPSGame = () => {
    const [res, setRes] = useState("Choose!");
    const play = (c) => {
        const ops = ['🪨', '📄', '✂️'];
        const bot = ops[Math.floor(Math.random() * 3)];
        if (c === bot) setRes(`Draw! Both ${c}`);
        else if ((c === '🪨' && bot === '✂️') || (c === '📄' && bot === '🪨') || (c === '✂️' && bot === '📄')) setRes(`Win! ${c} beats ${bot}`);
        else setRes(`Lose! ${bot} beats ${c}`);
    };
    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <h2 className="text-4xl mb-8">{res}</h2>
            <div className="flex gap-8 text-6xl">
                <button onClick={() => play('🪨')} className="hover:scale-125 transition">🪨</button>
                <button onClick={() => play('📄')} className="hover:scale-125 transition">📄</button>
                <button onClick={() => play('✂️')} className="hover:scale-125 transition">✂️</button>
            </div>
        </div>
    );
};

const MathGame = () => {
    const [q, setQ] = useState({ a: 5, b: 3, op: '+' });
    const [ans, setAns] = useState('');
    const [msg, setMsg] = useState('Solve it!');

    const check = () => {
        const val = parseInt(ans);
        const cor = q.op === '+' ? q.a + q.b : q.a * q.b;
        if (val === cor) {
            setMsg('Correct!');
            setQ({ a: Math.floor(Math.random() * 20), b: Math.floor(Math.random() * 10), op: Math.random() > 0.5 ? '+' : '*' });
            setAns('');
        } else {
            setMsg('Wrong!');
        }
    };
    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <h2 className="text-8xl font-bold mb-8">{q.a} {q.op} {q.b}</h2>
            <input type="number" value={ans} onChange={(e) => setAns(e.target.value)} className="text-black text-3xl p-2 rounded text-center w-32 mb-4" />
            <button onClick={check} className="bg-indigo-600 px-8 py-2 rounded font-bold">Check</button>
            <p className="mt-4 text-xl">{msg}</p>
        </div>
    )
}

export default GamesArcade;
