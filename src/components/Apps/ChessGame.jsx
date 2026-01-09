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
    const [gameResult, setGameResult] = useState('');
    const [enPassantTarget, setEnPassantTarget] = useState(null);
    const [whiteCanCastle, setWhiteCanCastle] = useState({ kingside: true, queenside: true });
    const [blackCanCastle, setBlackCanCastle] = useState({ kingside: true, queenside: true });
    const [promotionPending, setPromotionPending] = useState(null);
    const [moveHistory, setMoveHistory] = useState([]);
    const [legalMoves, setLegalMoves] = useState([]);

    useEffect(() => {
        if (turn === 'B' && !gameOver) {
            setStatus('AI is thinking...');
            const timer = setTimeout(makeAIMove, 1000);
            return () => clearTimeout(timer);
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

    const isValidMove = (from, to, boardState, checkForCheck = true, castleData = null, epTarget = null) => {
        if (from.r < 0 || from.r > 7 || from.c < 0 || from.c > 7) return false;
        if (to.r < 0 || to.r > 7 || to.c < 0 || to.c > 7) return false;

        const piece = boardState[from.r][from.c];
        const target = boardState[to.r][to.c];

        if (!piece) return false;
        if (target && ((turn === 'W' && isWhite(target)) || (turn === 'B' && isBlack(target)))) return false;
        if (from.r === to.r && from.c === to.c) return false;

        const dr = to.r - from.r;
        const dc = to.c - from.c;
        const type = piece.toLowerCase();

        let isValid = false;

        switch (type) {
            case 'p': {
                const dir = isWhite(piece) ? -1 : 1;
                const startRow = isWhite(piece) ? 6 : 1;
                // Forward move by 1
                if (dc === 0 && dr === dir && !target) {
                    isValid = true;
                }
                // Forward move by 2 from starting position
                else if (dc === 0 && dr === 2 * dir && from.r === startRow && !target && !boardState[from.r + dir][from.c]) {
                    isValid = true;
                }
                // Capture diagonally
                else if (Math.abs(dc) === 1 && dr === dir && target && isBlack(target) !== isWhite(piece)) {
                    isValid = true;
                }
                // En passant
                else if (Math.abs(dc) === 1 && dr === dir && !target && epTarget && to.r === epTarget.r && to.c === epTarget.c) {
                    isValid = true;
                }
                break;
            }
            case 'r':
                if ((dr === 0 || dc === 0) && (dr !== 0 || dc !== 0)) {
                    isValid = isPathClear(from, to, boardState);
                }
                break;
            case 'n':
                isValid = (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
                break;
            case 'b':
                if (Math.abs(dr) === Math.abs(dc) && dr !== 0) {
                    isValid = isPathClear(from, to, boardState);
                }
                break;
            case 'q':
                if ((dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) && (dr !== 0 || dc !== 0)) {
                    isValid = isPathClear(from, to, boardState);
                }
                break;
            case 'k': {
                if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1 && (dr !== 0 || dc !== 0)) {
                    isValid = true;
                }
                // Castling
                else if (dr === 0 && Math.abs(dc) === 2) {
                    const useData = castleData || (isWhite(piece) ? whiteCanCastle : blackCanCastle);
                    if (dc === 2 && useData.kingside) {
                        const rookCol = 7;
                        const rook = boardState[from.r][rookCol];
                        if (rook && ((isWhite(piece) && isWhite(rook)) || (isBlack(piece) && isBlack(rook)))) {
                            // Check if path is clear
                            if (isPathClear(from, { r: from.r, c: rookCol }, boardState)) {
                                isValid = true;
                            }
                        }
                    } else if (dc === -2 && useData.queenside) {
                        const rookCol = 0;
                        const rook = boardState[from.r][rookCol];
                        if (rook && ((isWhite(piece) && isWhite(rook)) || (isBlack(piece) && isBlack(rook)))) {
                            if (isPathClear(from, { r: from.r, c: rookCol }, boardState)) {
                                isValid = true;
                            }
                        }
                    }
                }
                break;
            }
            default:
                return false;
        }

        if (!isValid) return false;

        // Check if move leaves king in check
        if (checkForCheck) {
            const testBoard = boardState.map(r => [...r]);
            testBoard[to.r][to.c] = piece;
            testBoard[from.r][from.c] = null;
            
            // Handle en passant capture in test
            if (type === 'p' && epTarget && to.r === epTarget.r && to.c === epTarget.c) {
                testBoard[from.r][to.c] = null;
            }
            
            // Handle castling rook move in test
            if (type === 'k' && Math.abs(dc) === 2) {
                if (dc === 2) {
                    testBoard[from.r][5] = testBoard[from.r][7];
                    testBoard[from.r][7] = null;
                } else {
                    testBoard[from.r][3] = testBoard[from.r][0];
                    testBoard[from.r][0] = null;
                }
            }
            
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

    const hasLegalMoves = (boardState, checkTurn) => {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = boardState[r][c];
                if (piece && ((checkTurn === 'W' && isWhite(piece)) || (checkTurn === 'B' && isBlack(piece)))) {
                    for (let tr = 0; tr < 8; tr++) {
                        for (let tc = 0; tc < 8; tc++) {
                            if (isValidMove({ r, c }, { r: tr, c: tc }, boardState)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    const checkGameStatus = (newBoard, newTurn) => {
        if (!hasLegalMoves(newBoard, newTurn)) {
            if (isInCheck(newBoard, newTurn)) {
                const winner = newTurn === 'W' ? 'Black (AI) Wins!' : 'You Win!';
                setGameResult(`Checkmate - ${winner}`);
                setGameOver(true);
                setStatus(`Checkmate - ${winner}`);
                return true;
            } else {
                setGameResult('Stalemate - Draw');
                setGameOver(true);
                setStatus('Stalemate - Draw');
                return true;
            }
        } else if (isInCheck(newBoard, newTurn)) {
            setStatus(newTurn === 'W' ? 'You are in Check!' : 'AI is in Check!');
        } else {
            setStatus(newTurn === 'W' ? 'Your Turn' : "AI's Turn");
        }
        return false;
    };

    const handleSquareClick = (r, c) => {
        if (gameOver || turn === 'B') return;

        const piece = board[r][c];

        if (selected) {
            if (selected.r === r && selected.c === c) {
                setSelected(null);
                setLegalMoves([]);
                return;
            }

            if (isValidMove(selected, { r, c }, board)) {
                movePiece(selected, { r, c });
            } else {
                setSelected({ r, c });
                setLegalMoves([]);
                if (piece && isWhite(piece)) {
                    const moves = [];
                    for (let tr = 0; tr < 8; tr++) {
                        for (let tc = 0; tc < 8; tc++) {
                            if (isValidMove({ r, c }, { r: tr, c: tc }, board)) {
                                moves.push({ r: tr, c: tc });
                            }
                        }
                    }
                    setLegalMoves(moves);
                }
            }
        } else {
            if (piece && isWhite(piece)) {
                setSelected({ r, c });
                const moves = [];
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (isValidMove({ r, c }, { r: tr, c: tc }, board)) {
                            moves.push({ r: tr, c: tc });
                        }
                    }
                }
                setLegalMoves(moves);
            } else {
                setSelected(null);
                setLegalMoves([]);
            }
        }
    };

    const movePiece = (from, to) => {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[from.r][from.c];
        const type = piece.toLowerCase();

        let newEnPassant = null;
        let newWhiteCastle = { ...whiteCanCastle };
        let newBlackCastle = { ...blackCanCastle };

        // Handle pawn
        if (type === 'p') {
            const dir = isWhite(piece) ? -1 : 1;
            // Two square move - set en passant target
            if (Math.abs(to.r - from.r) === 2) {
                newEnPassant = { r: from.r + dir, c: from.c };
            }
            // En passant capture
            if (enPassantTarget && to.r === enPassantTarget.r && to.c === enPassantTarget.c) {
                newBoard[from.r][to.c] = null;
            }
            // Promotion
            if ((isWhite(piece) && to.r === 0) || (isBlack(piece) && to.r === 7)) {
                setPromotionPending({ from, to, piece });
                return;
            }
        }

        // Handle king
        if (type === 'k') {
            if (isWhite(piece)) {
                newWhiteCastle = { kingside: false, queenside: false };
            } else {
                newBlackCastle = { kingside: false, queenside: false };
            }
            // Castling move
            if (Math.abs(to.c - from.c) === 2) {
                if (to.c > from.c) {
                    // Kingside castling
                    newBoard[from.r][5] = newBoard[from.r][7];
                    newBoard[from.r][7] = null;
                } else {
                    // Queenside castling
                    newBoard[from.r][3] = newBoard[from.r][0];
                    newBoard[from.r][0] = null;
                }
            }
        }

        // Handle rook
        if (type === 'r') {
            if (isWhite(piece)) {
                if (from.c === 7) newWhiteCastle.kingside = false;
                if (from.c === 0) newWhiteCastle.queenside = false;
            } else {
                if (from.c === 7) newBlackCastle.kingside = false;
                if (from.c === 0) newBlackCastle.queenside = false;
            }
        }

        newBoard[to.r][to.c] = piece;
        newBoard[from.r][from.c] = null;

        setBoard(newBoard);
        setWhiteCanCastle(newWhiteCastle);
        setBlackCastle(newBlackCastle);
        setEnPassantTarget(newEnPassant);
        setSelected(null);
        setLegalMoves([]);
        setMoveHistory([...moveHistory, { from, to, piece }]);

        const newTurn = turn === 'W' ? 'B' : 'W';
        setTurn(newTurn);

        checkGameStatus(newBoard, newTurn);
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
        setMoveHistory([...moveHistory, { from, to, piece, promotion: promotedPiece }]);

        const newTurn = turn === 'W' ? 'B' : 'W';
        setTurn(newTurn);

        checkGameStatus(newBoard, newTurn);
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
            checkGameStatus(board, 'B');
            return;
        }

        let bestMove = possibleMoves[0];
        let bestScore = -Infinity;

        const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };

        possibleMoves.forEach(move => {
            const target = board[move.to.r][move.to.c];
            let score = Math.random() * 5; // Small randomness
            
            // Prefer captures
            if (target) {
                score += pieceValues[target.toLowerCase()] * 10;
            }
            
            // Slight preference for center control
            const dist = Math.abs(move.to.c - 3.5) + Math.abs(move.to.r - 3.5);
            score += (8 - dist) * 0.5;
            
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
        setGameResult('');
        setEnPassantTarget(null);
        setWhiteCanCastle({ kingside: true, queenside: true });
        setBlackCanCastle({ kingside: true, queenside: true });
        setPromotionPending(null);
        setMoveHistory([]);
        setLegalMoves([]);
    };

    const isMoveLegal = (r, c) => legalMoves.some(m => m.r === r && m.c === c);

    return (
        <div className="flex flex-col items-center justify-center h-full bg-[#1c1c1e] text-white p-4 overflow-y-auto">
            {promotionPending && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 rounded-xl">
                    <div className="bg-[#2c2c2e] p-8 rounded-2xl border-2 border-indigo-500 text-center shadow-2xl">
                        <p className="mb-6 font-bold text-lg">Promote Pawn To:</p>
                        <div className="flex gap-6 text-6xl justify-center">
                            <button onClick={() => handlePromotion('q')} className="hover:scale-125 transition-transform active:scale-110" title="Queen">♕</button>
                            <button onClick={() => handlePromotion('r')} className="hover:scale-125 transition-transform active:scale-110" title="Rook">♖</button>
                            <button onClick={() => handlePromotion('b')} className="hover:scale-125 transition-transform active:scale-110" title="Bishop">♗</button>
                            <button onClick={() => handlePromotion('n')} className="hover:scale-125 transition-transform active:scale-110" title="Knight">♘</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-lg flex justify-between items-center mb-6 bg-[#2c2c2e] p-4 rounded-2xl border border-white/10 shadow-xl">
                <div className="flex items-center gap-2 text-sm">
                    <div className="bg-indigo-600 p-2 rounded-lg text-lg">♔</div>
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">Player</p>
                        <p className="font-bold">You (White)</p>
                    </div>
                </div>
                <div className="text-center font-black text-lg italic text-indigo-400">VS</div>
                <div className="flex items-center gap-2 text-sm text-right">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-bold">AI</p>
                        <p className="font-bold text-rose-400">DeepBot (Black)</p>
                    </div>
                    <div className="bg-rose-600 p-2 rounded-lg text-lg">♚</div>
                </div>
            </div>

            <div className={`mb-4 px-6 py-2 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${gameOver ? 'bg-emerald-500 scale-110' : 'bg-indigo-600/30 border border-indigo-400'}`}>
                <Trophy size={18} />
                {gameResult || status}
            </div>

            <div className="relative p-4 bg-[#2c2c2e] rounded-2xl shadow-2xl border-4 border-[#3a3a3c] overflow-hidden">
                <div className="grid grid-cols-8 gap-0 bg-black">
                    {board.map((row, r) => (
                        row.map((piece, c) => {
                            const isSelected = selected?.r === r && selected?.c === c;
                            const isBlackSq = (r + c) % 2 === 1;
                            const isLegalMove = isMoveLegal(r, c);

                            return (
                                <div
                                    key={`${r}-${c}`}
                                    onClick={() => handleSquareClick(r, c)}
                                    className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-3xl md:text-4xl cursor-pointer select-none transition-all font-bold
                                        ${isBlackSq ? 'bg-[#5a5a5e]' : 'bg-[#ffffff]/10'}
                                        ${isSelected ? 'ring-4 ring-inset ring-indigo-400 bg-indigo-500/40 z-10' : ''}
                                        ${isLegalMove ? 'ring-2 ring-inset ring-emerald-400' : ''}
                                        ${piece && isWhite(piece) ? 'text-white' : 'text-rose-300'}
                                        hover:brightness-125
                                    `}
                                >
                                    {isLegalMove && !piece && <div className="w-2 h-2 rounded-full bg-emerald-400 opacity-70" />}
                                    {PIECE_SYMBOLS[piece]}
                                </div>
                            );
                        })
                    ))}
                </div>
            </div>

            <div className="mt-8 flex gap-4 flex-wrap justify-center">
                <button
                    onClick={resetGame}
                    className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95"
                >
                    <RefreshCcw size={18} /> New Game
                </button>
            </div>
        </div>
    );
};

export default ChessGame;