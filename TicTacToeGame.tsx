import { useState } from 'react';
import { X as CloseIcon, RotateCcw, Trash2 } from 'lucide-react';

type Cell = 'X' | 'O' | null;

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const CONFETTI_COLORS = ['#243A5E', '#DC2626', '#EAB308', '#7C3AED', '#16A34A', '#2563EB'];

function Confetti() {
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.2 + Math.random() * 0.8,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    rotate: Math.random() * 360,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-3 confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(420px) rotate(360deg); opacity: 0; }
        }
        .confetti-piece { animation-name: confettiFall; animation-timing-function: ease-in; animation-fill-mode: forwards; }
      `}</style>
    </div>
  );
}

function checkWinner(board: Cell[]): { winner: 'X' | 'O' | null; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

export default function TicTacToeGame({ onClose }: { onClose: () => void }) {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [current, setCurrent] = useState<'X' | 'O'>('X');
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });

  const { winner, line } = checkWinner(board);
  const isDraw = !winner && board.every((c) => c !== null);
  const gameOver = !!winner || isDraw;

  const handleCellClick = (index: number) => {
    if (board[index] || gameOver) return;
    const next = [...board];
    next[index] = current;
    setBoard(next);

    const result = checkWinner(next);
    if (result.winner) {
      setScores((s) => ({ ...s, [result.winner as 'X' | 'O']: s[result.winner as 'X' | 'O'] + 1 }));
    } else if (next.every((c) => c !== null)) {
      setScores((s) => ({ ...s, draws: s.draws + 1 }));
    } else {
      setCurrent(current === 'X' ? 'O' : 'X');
    }
  };

  const newGame = () => {
    setBoard(Array(9).fill(null));
    setCurrent('X');
  };

  const resetScores = () => {
    setScores({ X: 0, O: 0, draws: 0 });
    newGame();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-navy-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          aria-label="Close"
        >
          <CloseIcon size={20} />
        </button>

        <h2 className="text-xl font-bold text-slate-800 text-center mb-5">Tic Tac Toe</h2>

        <div className="grid grid-cols-3 gap-3 mb-4 text-center">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wide">X WINS</p>
            <p className="text-lg font-bold text-navy-700">{scores.X}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wide">DRAWS</p>
            <p className="text-lg font-bold text-slate-500">{scores.draws}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wide">O WINS</p>
            <p className="text-lg font-bold text-red-600">{scores.O}</p>
          </div>
        </div>

        {!gameOver && (
          <div className="flex justify-center mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                current === 'X' ? 'bg-navy-50 text-navy-700' : 'bg-red-50 text-red-600'
              }`}
            >
              Turn: {current}
            </span>
          </div>
        )}

        <div className="relative">
          <div className="grid grid-cols-3 gap-2.5">
            {board.map((cell, i) => {
              const isWinCell = line?.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  disabled={!!cell || gameOver}
                  className={`aspect-square rounded-xl flex items-center justify-center text-3xl font-bold transition-all ${
                    isWinCell
                      ? 'bg-navy-100 ring-2 ring-navy-500'
                      : 'bg-slate-100 hover:bg-slate-200'
                  } ${cell === 'X' ? 'text-navy-700' : 'text-red-600'}`}
                >
                  {cell}
                </button>
              );
            })}
          </div>

          {gameOver && (
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <Confetti />
              <div className="relative bg-white rounded-2xl shadow-xl border border-slate-200 px-5 py-5 text-center w-full">
                <p className="font-bold text-slate-800 mb-4">
                  {winner ? `Player ${winner} Wins!` : "It's a Draw!"}
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={newGame}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-700 text-white text-sm font-semibold hover:bg-navy-800"
                  >
                    <RotateCcw size={14} />
                    Play Again
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={newGame}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200"
          >
            <RotateCcw size={14} />
            New Game
          </button>
          <button
            onClick={resetScores}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
          >
            <Trash2 size={14} />
            Reset Scores
          </button>
        </div>
      </div>
    </div>
  );
}
