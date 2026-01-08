import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCcw, User, Bot, AlertCircle } from 'lucide-react';

const INITIAL_BOARD = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    Array(8).fill(null),
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const PIECE_SYMBOLS = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

const ChessGame = () => {
    const [board, setBoard] = useState(INITIAL_BOARD);
    const [turn, setTurn] = useState('W'); // 'W' = White, 'B' = Black
    const [selected, setSelected] = useState(null); // { r, c }
    const [status, setStatus] = useState('Your Turn');
    const [gameOver, setGameOver] = useState(false);

    // AI Turn trigger
    useEffect(() => {
        if (turn === 'B' && !gameOver) {
            setStatus('AI is thinking...');
            setTimeout(makeAIMove, 1000);
        }
    }, [turn, gameOver]);

    const isWhite = (piece) => piece && piece === piece.toUpperCase();
    const isBlack = (piece) => piece && piece === piece.toLowerCase();

    // Basic move validation (Simplified for performance/code size)
    const isValidMove = (from, to, boardState) => {
        const piece = boardState[from.r][from.c];
        const target = boardState[to.r][to.c];

        // Basic Rules: 
        // 1. Cannot land on own piece
        if (target) {
            if (turn === 'W' && isWhite(target)) return false;
            if (turn === 'B' && isBlack(target)) return false;
        }

        // 2. Piece-specific movement
        const dr = to.r - from.r;
        const dc = to.c - from.c;
        const type = piece.toLowerCase();

        switch (type) {
            case 'p': // Pawn
                const dir = isWhite(piece) ? -1 : 1;
                const startRow = isWhite(piece) ? 6 : 1;
                // Move forward 1
                if (dc === 0 && dr === dir && !target) return true;
                // Move forward 2
                if (dc === 0 && dr === 2 * dir && from.r === startRow && !target && !boardState[from.r + dir][from.c]) return true;
                // Capture
                if (Math.abs(dc) === 1 && dr === dir && target) return true;
                return false;
            case 'r': // Rook
                if (dr !== 0 && dc !== 0) return false;
                // Path check (Vertical/Horizontal)
                return isPathClear(from, to, boardState);
            case 'n': // Knight
                return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
            case 'b': // Bishop
                if (Math.abs(dr) !== Math.abs(dc)) return false;
                return isPathClear(from, to, boardState);
            case 'q': // Queen
                if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return false;
                return isPathClear(from, to, boardState);
            case 'k': // King
                return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
            default: return false;
        }
    };

    const isPathClear = (from, to, boardState) => {
        const dr = Math.sign(to.r - from.r);
        const dc = Math.sign(to.c - from.c);
        let r = from.r + dr;
        let c = from.c + dc;
        while (r !== to.r || c !== to.c) {
            if (boardState[r][c]) return false;
            r += dr;
            c += dc;
        }
        return true;
    };

    const handleSquareClick = (r, c) => {
        if (gameOver || turn === 'B') return;

        if (selected) {
            if (isValidMove(selected, { r, c }, board)) {
                movePiece(selected, { r, c });
            } else {
                setSelected(null);
            }
        } else {
            const piece = board[r][c];
            if (piece && isWhite(piece)) {
                setSelected({ r, c });
            }
        }
    };

    const movePiece = (from, to) => {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[from.r][from.c];
        const captured = newBoard[to.r][to.c];

        newBoard[to.r][to.c] = piece;
        newBoard[from.r][from.c] = null;

        // Check for King capture (End game)
        if (captured && captured.toLowerCase() === 'k') {
            setGameOver(true);
            setStatus(turn === 'W' ? 'White Wins!' : 'Black Wins!');
        } else {
            setTurn(turn === 'W' ? 'B' : 'W');
            setStatus(turn === 'W' ? "AI's Turn" : 'Your Turn');
        }

        setBoard(newBoard);
        setSelected(null);
    };

    // AI Logic: Very basic "Score-based" move selection
    const makeAIMove = () => {
        let bestMove = null;
        let bestScore = -Infinity;

        // Scan board for possible moves
        const possibleMoves = [];
        for (let r1 = 0; r1 < 8; r1++) {
            for (let c1 = 0; c1 < 8; c1++) {
                const piece = board[r1][c1];
                if (piece && isBlack(piece)) {
                    for (let r2 = 0; r2 < 8; r2++) {
                        for (let c2 = 0; c2 < 8; c2++) {
                            if (isValidMove({ r: r1, c: c1 }, { r: r2, c: c2 }, board)) {
                                possibleMoves.push({ from: { r: r1, c: c1 }, to: { r: r2, c: c2 } });
                            }
                        }
                    }
                }
            }
        }

        if (possibleMoves.length === 0) {
            setGameOver(true);
            setStatus('Stalemate / Checkmate!');
            return;
        }

        // Evaluate moves
        possibleMoves.forEach(move => {
            const target = board[move.to.r][move.to.c];
            let score = 0;
            if (target) {
                const values = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100 };
                score += values[target.toLowerCase()];
            }
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });

        // Random pick if no "captures" found to make it less predictable
        const move = bestScore <= 0 ? possibleMoves[Math.floor(Math.random() * possibleMoves.length)] : bestMove;
        movePiece(move.from, move.to);
    };

    const resetGame = () => {
        setBoard(INITIAL_BOARD);
        setTurn('W');
        setSelected(null);
        setStatus('Your Turn');
        setGameOver(false);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-[#1c1c1e] text-white p-4">
            {/* Header Info */}
            <div className="w-full max-w-md flex justify-between items-center mb-6 bg-[#2c2c2e] p-4 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg"><User size={20} /></div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Player</p>
                        <p className="text-sm font-bold">You (White)</p>
                    </div>
                </div>
                <div className="text-center font-black text-xl italic text-indigo-500 mx-4">VS</div>
                <div className="flex items-center gap-3 text-right">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-tighter">Opponent</p>
                        <p className="text-sm font-bold text-rose-400">DeepBot (Black)</p>
                    </div>
                    <div className="bg-rose-600 p-2 rounded-lg"><Bot size={20} /></div>
                </div>
            </div>

            {/* Status Bar */}
            <div className={`mb-4 px-6 py-2 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${gameOver ? 'bg-emerald-500 scale-110' : 'bg-white/5 border border-white/10'}`}>
                {gameOver && <Trophy size={18} />}
                {status}
            </div>

            {/* Board Container */}
            <div className="relative group p-4 bg-[#2c2c2e] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-[#3a3a3c]">
                <div className="grid grid-cols-8 border border-black shadow-inner">
                    {board.map((row, r) => (
                        row.map((piece, c) => {
                            const isSelected = selected?.r === r && selected?.c === c;
                            const isBlackSq = (r + c) % 2 === 1;

                            return (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => handleSquareClick(r, c)}
                                    className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-4xl cursor-pointer select-none transition-all
                                        ${isBlackSq ? 'bg-[#3c3c3e]' : 'bg-[#48484a]'}
                                        ${isSelected ? 'ring-4 ring-inset ring-indigo-500 bg-indigo-500/30 z-10 scale-105' : 'hover:brightness-125'}
                                        ${piece && isWhite(piece) ? 'text-white' : 'text-rose-400'}
                                    `}
                                    style={{
                                        filter: piece ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'none',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                >
                                    {PIECE_SYMBOLS[piece]}
                                </div>
                            );
                        })
                    ))}
                </div>

                {/* Board Notation Mockup */}
                <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-[10px] text-gray-600 font-bold">
                    {['8', '7', '6', '5', '4', '3', '2', '1'].map(n => <span key={n}>{n}</span>)}
                </div>
                <div className="absolute -bottom-6 left-0 right-0 flex justify-around text-[10px] text-gray-600 font-bold px-4">
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map(l => <span key={l}>{l}</span>)}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-10 flex gap-4">
                <button
                    onClick={resetGame}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95"
                >
                    <RefreshCcw size={18} /> Resign & Restart
                </button>
                <div className="flex items-center gap-2 text-gray-500 text-[10px] font-mono border-l border-white/10 pl-4">
                    <AlertCircle size={14} />
                    <span>ENGINE: NEURAL_CHESS_V1</span>
                </div>
            </div>
        </div>
    );
};

export default ChessGame;
