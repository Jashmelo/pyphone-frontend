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
    const [turn, setTurn] = useState('W');
    const [selected, setSelected] = useState(null);
    const [status, setStatus] = useState('Your Turn');
    const [gameOver, setGameOver] = useState(false);
    const [enPassantTarget, setEnPassantTarget] = useState(null);
    const [whiteCanCastle, setWhiteCanCastle] = useState({ king: true, queenside: true });
    const [blackCanCastle, setBlackCanCastle] = useState({ king: true, queenside: true });
    const [promotionPending, setPromotionPending] = useState(null);

    useEffect(() => {
        if (turn === 'B' && !gameOver) {
            setStatus('AI is thinking...');
            setTimeout(makeAIMove, 1000);
        }
    }, [turn, gameOver]);

    const isWhite = (piece) => piece && piece === piece.toUpperCase();
    const isBlack = (piece) => piece && piece === piece.toLowerCase();

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

    const isValidMove = (from, to, boardState, checkForCheck = true) => {
        const piece = boardState[from.r][from.c];
        const target = boardState[to.r][to.c];

        if (!piece) return false;
        if (target && ((turn === 'W' && isWhite(target)) || (turn === 'B' && isBlack(target)))) return false;

        const dr = to.r - from.r;
        const dc = to.c - from.c;
        const type = piece.toLowerCase();

        let isValid = false;

        switch (type) {
            case 'p': {
                const dir = isWhite(piece) ? -1 : 1;
                const startRow = isWhite(piece) ? 6 : 1;
                if (dc === 0 && dr === dir && !target) isValid = true;
                else if (dc === 0 && dr === 2 * dir && from.r === startRow && !target && !boardState[from.r + dir][from.c]) isValid = true;
                else if (Math.abs(dc) === 1 && dr === dir && target) isValid = true;
                else if (Math.abs(dc) === 1 && dr === dir && enPassantTarget && to.r === enPassantTarget.r && to.c === enPassantTarget.c) isValid = true;
                break;
            }
            case 'r':
                if ((dr === 0 || dc === 0) && (dr !== 0 || dc !== 0)) isValid = isPathClear(from, to, boardState);
                break;
            case 'n':
                isValid = (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
                break;
            case 'b':
                if (Math.abs(dr) === Math.abs(dc)) isValid = isPathClear(from, to, boardState);
                break;
            case 'q':
                if ((dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) && (dr !== 0 || dc !== 0)) isValid = isPathClear(from, to, boardState);
                break;
            case 'k': {
                if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0)) isValid = true;
                else if (dr === 0 && Math.abs(dc) === 2) {
                    const castleData = isWhite(piece) ? whiteCanCastle : blackCanCastle;
                    if (dc === 2 && castleData.king) {
                        const rookPos = isWhite(piece) ? 7 : 0;
                        if (boardState[from.r][7] === (isWhite(piece) ? 'R' : 'r') &&
                            isPathClear(from, { r: from.r, c: 7 }, boardState)) {
                            isValid = true;
                        }
                    } else if (dc === -2 && castleData.queenside) {
                        if (boardState[from.r][0] === (isWhite(piece) ? 'R' : 'r') &&
                            isPathClear(from, { r: from.r, c: 0 }, boardState)) {
                            isValid = true;
                        }
                    }
                }
                break;
            }
            default: return false;
        }

        if (!isValid) return false;

        if (checkForCheck) {
            const testBoard = boardState.map(r => [...r]);
            testBoard[to.r][to.c] = piece;
            testBoard[from.r][from.c] = null;
            if (isInCheck(testBoard, turn)) return false;
        }

        return true;
    };

    const isInCheck = (boardState, forTurn) => {
        let kingPos = null;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && piece.toLowerCase() === 'k') {
                    if ((forTurn === 'W' && isWhite(piece)) || (forTurn === 'B' && isBlack(piece))) {
                        kingPos = { r, c };
                    }
                }
            }
        }

        if (!kingPos) return false;

        const opponentTurn = forTurn === 'W' ? 'B' : 'W';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && ((opponentTurn === 'W' && isWhite(piece)) || (opponentTurn === 'B' && isBlack(piece)))) {
                    if (isValidMove({ r, c }, kingPos, boardState, false)) return true;
                }
            }
        }
        return false;
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
        const type = piece.toLowerCase();

        let newEnPassant = null;
        let newWhiteCastle = { ...whiteCanCastle };
        let newBlackCastle = { ...blackCanCastle };

        if (type === 'p') {
            const dir = isWhite(piece) ? -1 : 1;
            if (Math.abs(to.r - from.r) === 2) {
                newEnPassant = { r: from.r + dir, c: from.c };
            } else if (enPassantTarget && to.r === enPassantTarget.r && to.c === enPassantTarget.c) {
                newBoard[from.r][to.c] = null;
            }

            if ((isWhite(piece) && to.r === 0) || (isBlack(piece) && to.r === 7)) {
                setPromotionPending({ from, to, piece });
                return;
            }
        }

        if (type === 'k') {
            if (isWhite(piece)) newWhiteCastle = { king: false, queenside: false };
            else newBlackCastle = { king: false, queenside: false };

            if (Math.abs(to.c - from.c) === 2) {
                if (to.c > from.c) {
                    newBoard[from.r][5] = newBoard[from.r][7];
                    newBoard[from.r][7] = null;
                } else {
                    newBoard[from.r][3] = newBoard[from.r][0];
                    newBoard[from.r][0] = null;
                }
            }
        }

        if (type === 'r') {
            if (isWhite(piece)) {
                if (from.c === 7) newWhiteCastle.king = false;
                if (from.c === 0) newWhiteCastle.queenside = false;
            } else {
                if (from.c === 7) newBlackCastle.king = false;
                if (from.c === 0) newBlackCastle.queenside = false;
            }
        }

        newBoard[to.r][to.c] = piece;
        newBoard[from.r][from.c] = null;

        setWhiteCanCastle(newWhiteCastle);
        setBlackCanCastle(newBlackCastle);
        setEnPassantTarget(newEnPassant);
        setBoard(newBoard);
        setTurn(turn === 'W' ? 'B' : 'W');
        setStatus(turn === 'W' ? "AI's Turn" : 'Your Turn');
        setSelected(null);
    };

    const handlePromotion = (promotionPiece) => {
        if (!promotionPending) return;
        const { from, to, piece } = promotionPending;
        const newBoard = board.map(row => [...row]);
        const promotedPiece = isWhite(piece) ? promotionPiece.toUpperCase() : promotionPiece.toLowerCase();
        newBoard[to.r][to.c] = promotedPiece;
        newBoard[from.r][from.c] = null;
        setBoard(newBoard);
        setPromotionPending(null);
        setTurn(turn === 'W' ? 'B' : 'W');
        setStatus(turn === 'W' ? "AI's Turn" : 'Your Turn');
    };

    const makeAIMove = () => {
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
            setStatus(isInCheck(board, 'B') ? 'Black is Checkmated - You Win!' : 'Stalemate!');
            return;
        }

        let bestMove = possibleMoves[0];
        let bestScore = -Infinity;

        possibleMoves.forEach(move => {
            const target = board[move.to.r][move.to.c];
            let score = Math.random() * 10;
            if (target) {
                const values = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 100 };
                score += values[target.toLowerCase()] * 10;
            }
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });

        movePiece(bestMove.from, bestMove.to);
    };

    const resetGame = () => {
        setBoard(INITIAL_BOARD);
        setTurn('W');
        setSelected(null);
        setStatus('Your Turn');
        setGameOver(false);
        setEnPassantTarget(null);
        setWhiteCanCastle({ king: true, queenside: true });
        setBlackCanCastle({ king: true, queenside: true });
        setPromotionPending(null);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full bg-[#1c1c1e] text-white p-4">
            {promotionPending && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-xl">
                    <div className="bg-[#2c2c2e] p-6 rounded-xl border border-white/10 text-center">
                        <p className="mb-4 font-bold">Promote to:</p>
                        <div className="flex gap-4 text-5xl">
                            <button onClick={() => handlePromotion('q')} className="hover:scale-125 transition">♕</button>
                            <button onClick={() => handlePromotion('r')} className="hover:scale-125 transition">♖</button>
                            <button onClick={() => handlePromotion('b')} className="hover:scale-125 transition">♗</button>
                            <button onClick={() => handlePromotion('n')} className="hover:scale-125 transition">♘</button>
                        </div>
                    </div>
                </div>
            )}
            <div className="w-full max-w-md flex justify-between items-center mb-6 bg-[#2c2c2e] p-4 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-lg">♔</div>
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
                    <div className="bg-rose-600 p-2 rounded-lg">♚</div>
                </div>
            </div>

            <div className={`mb-4 px-6 py-2 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${gameOver ? 'bg-emerald-500 scale-110' : 'bg-white/5 border border-white/10'}`}>
                {status}
            </div>

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
                                >
                                    {PIECE_SYMBOLS[piece]}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            <div className="mt-10 flex gap-4">
                <button
                    onClick={resetGame}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95"
                >
                    <RefreshCcw size={18} /> Resign & Restart
                </button>
            </div>
        </div>
    );
};

export default ChessGame;