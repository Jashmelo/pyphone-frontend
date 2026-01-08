import React, { useState, useEffect } from 'react';

const WORDS = ['PYTHON', 'GEMINI', 'REACT', 'PYPHONE', 'VITE', 'TAILWIND', 'CSS', 'JAVASCRIPT', 'FASTAPI', 'ANTIGRAVITY'];

const HangmanGame = () => {
    const [word, setWord] = useState('');
    const [guessed, setGuessed] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [status, setStatus] = useState('playing'); // playing, won, lost

    const maxMistakes = 6;

    useEffect(() => {
        resetGame();
    }, []);

    const resetGame = () => {
        const newWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setWord(newWord);
        setGuessed([]);
        setMistakes(0);
        setStatus('playing');
    };

    const handleGuess = (letter) => {
        if (status !== 'playing' || guessed.includes(letter)) return;

        const newGuessed = [...guessed, letter];
        setGuessed(newGuessed);

        if (!word.includes(letter)) {
            const newMistakes = mistakes + 1;
            setMistakes(newMistakes);
            if (newMistakes >= maxMistakes) setStatus('lost');
        } else {
            const isWon = word.split('').every(l => newGuessed.includes(l));
            if (isWon) setStatus('won');
        }
    };

    const renderWord = () => {
        return word.split('').map((l, i) => (
            <span key={i} className="mx-1 text-3xl font-bold border-b-2 border-white min-w-[20px] inline-block text-center">
                {guessed.includes(l) ? l : '_'}
            </span>
        ));
    };

    const renderKeyboard = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        return (
            <div className="grid grid-cols-7 gap-2 mt-8">
                {letters.map(l => (
                    <button
                        key={l}
                        disabled={guessed.includes(l) || status !== 'playing'}
                        onClick={() => handleGuess(l)}
                        className={`p-2 rounded font-bold transition-colors ${guessed.includes(l)
                                ? (word.includes(l) ? 'bg-green-600 opacity-50' : 'bg-red-600 opacity-50')
                                : 'bg-white/10 hover:bg-white/20 active:scale-95'
                            }`}
                    >
                        {l}
                    </button>
                ))}
            </div>
        );
    };

    const renderGallows = () => {
        // Simple visual representation of mistakes
        return (
            <div className="flex justify-center mb-8">
                <div className="relative w-32 h-40 border-l-4 border-b-4 border-gray-500">
                    <div className="absolute top-0 right-0 w-16 h-4 border-t-4 border-gray-500" />
                    <div className="absolute top-0 right-0 w-4 h-8 border-l-2 border-gray-400" />
                    {/* Head */}
                    {mistakes > 0 && <div className="absolute top-8 -right-3 w-6 h-6 rounded-full border-2 border-white" />}
                    {/* Body */}
                    {mistakes > 1 && <div className="absolute top-14 right-0 w-0.5 h-10 bg-white" />}
                    {/* L Arm */}
                    {mistakes > 2 && <div className="absolute top-16 -right-4 w-4 h-0.5 bg-white -rotate-45" />}
                    {/* R Arm */}
                    {mistakes > 3 && <div className="absolute top-16 right-0 w-4 h-0.5 bg-white rotate-45" />}
                    {/* L Leg */}
                    {mistakes > 4 && <div className="absolute top-[94px] -right-4 w-4 h-0.5 bg-white -rotate-45" />}
                    {/* R Leg */}
                    {mistakes > 5 && <div className="absolute top-[94px] right-0 w-4 h-0.5 bg-white rotate-45" />}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-[#1c1c1e] text-white p-8 flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-4">Hangman</h2>

            {renderGallows()}

            <div className="mb-8 tracking-widest">
                {renderWord()}
            </div>

            {status === 'playing' ? (
                renderKeyboard()
            ) : (
                <div className="text-center">
                    <p className={`text-4xl font-black mb-4 ${status === 'won' ? 'text-green-500' : 'text-red-500'}`}>
                        {status === 'won' ? 'YOU WON!' : 'GAME OVER'}
                    </p>
                    <p className="text-gray-400 mb-6">The word was: <span className="text-white font-bold">{word}</span></p>
                    <button
                        onClick={resetGame}
                        className="bg-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-indigo-500 transition-colors"
                    >
                        Play Again
                    </button>
                </div>
            )}
        </div>
    );
};

export default HangmanGame;
