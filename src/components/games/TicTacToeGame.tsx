import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, Bot, User, Flame, Award, ChevronRight } from 'lucide-react';

interface TicTacToeGameProps {
  onWin: (amount: number, description: string) => void;
  onBack: () => void;
  userBalance: number;
}

type CellValue = 'X' | 'O' | null;

interface LevelInfo {
  level: number;
  name: string;
  reward: number;
  aiSmartness: number; // 0 (random) to 1 (unbeatable minimax)
}

const TTT_LEVELS: LevelInfo[] = [
  { level: 1, name: 'Novice Bot', reward: 0.20, aiSmartness: 0.2 },
  { level: 2, name: 'Trainee Bot', reward: 0.35, aiSmartness: 0.35 },
  { level: 3, name: 'Apprentice AI', reward: 0.50, aiSmartness: 0.5 },
  { level: 4, name: 'Tactician AI', reward: 0.75, aiSmartness: 0.65 },
  { level: 5, name: 'Cyber Sentinel', reward: 1.00, aiSmartness: 0.75 },
  { level: 6, name: 'Neural Hacker', reward: 1.50, aiSmartness: 0.82 },
  { level: 7, name: 'Matrix Drone', reward: 2.00, aiSmartness: 0.88 },
  { level: 8, name: 'Quantum Core', reward: 3.00, aiSmartness: 0.92 },
  { level: 9, name: 'Apex Engine', reward: 5.00, aiSmartness: 0.95 },
  { level: 10, name: 'Omega Overlord', reward: 8.00, aiSmartness: 0.98 },
  { level: 11, name: 'Celestial Titan', reward: 12.00, aiSmartness: 0.99 },
  { level: 12, name: 'Vortex Grandmaster', reward: 18.00, aiSmartness: 1.0 },
  { level: 13, name: 'Singularity God', reward: 25.00, aiSmartness: 1.0 },
  { level: 14, name: 'Cyber Emperor', reward: 35.00, aiSmartness: 1.0 },
  { level: 15, name: 'The Unbeatable AI', reward: 50.00, aiSmartness: 1.0 }
];

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({
  onWin,
  onBack,
  userBalance
}) => {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [maxUnlockedLevel, setMaxUnlockedLevel] = useState<number>(() => {
    const saved = localStorage.getItem('TTT_MAX_LEVEL');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [board, setBoard] = useState<CellValue[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [winner, setWinner] = useState<'X' | 'O' | 'TIE' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [playerStreak, setPlayerStreak] = useState<number>(0);

  const activeLevelConfig = TTT_LEVELS[currentLevel - 1] || TTT_LEVELS[0];

  const checkWinningState = (b: CellValue[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
      [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    for (const [a, bIdx, c] of lines) {
      if (b[a] && b[a] === b[bIdx] && b[a] === b[c]) {
        return { winner: b[a], line: [a, bIdx, c] };
      }
    }

    if (b.every((cell) => cell !== null)) {
      return { winner: 'TIE' as const, line: null };
    }

    return null;
  };

  const startRound = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setWinningLine(null);
    sound.playClick();
  };

  // Minimax Best Move Calculation
  const getBestMove = (b: CellValue[]): number => {
    // Check if we can win immediately
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        const copy = [...b];
        copy[i] = 'O';
        const res = checkWinningState(copy);
        if (res && res.winner === 'O') return i;
      }
    }

    // Check if we need to block player X
    for (let i = 0; i < 9; i++) {
      if (!b[i]) {
        const copy = [...b];
        copy[i] = 'X';
        const res = checkWinningState(copy);
        if (res && res.winner === 'X') return i;
      }
    }

    // Center preference
    if (!b[4]) return 4;

    // Corners preference
    const corners = [0, 2, 6, 8].filter((idx) => !b[idx]);
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    // Any available
    const available = b.map((val, idx) => (val === null ? idx : null)).filter((val): val is number => val !== null);
    return available[Math.floor(Math.random() * available.length)];
  };

  // AI Turn
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(() => {
        const availableMoves = board
          .map((v, i) => (v === null ? i : null))
          .filter((v): v is number => v !== null);

        if (availableMoves.length === 0) return;

        let move: number;
        // Random vs Smart based on smartness ratio
        if (Math.random() < activeLevelConfig.aiSmartness) {
          move = getBestMove(board);
        } else {
          move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }

        const newBoard = [...board];
        newBoard[move] = 'O';
        sound.playCardFlip();
        setBoard(newBoard);

        const outcome = checkWinningState(newBoard);
        if (outcome) {
          setWinner(outcome.winner);
          setWinningLine(outcome.line);
          if (outcome.winner === 'O') {
            sound.playGameOver();
            setPlayerStreak(0);
          }
        } else {
          setIsPlayerTurn(true);
        }
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board, activeLevelConfig.aiSmartness]);

  // Handle Player Move
  const handleCellClick = (index: number) => {
    if (!isPlayerTurn || winner || board[index] !== null) return;

    sound.playCardMatch();
    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);

    const outcome = checkWinningState(newBoard);
    if (outcome) {
      setWinner(outcome.winner);
      setWinningLine(outcome.line);

      if (outcome.winner === 'X') {
        sound.playWin();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setPlayerStreak((s) => s + 1);

        // Unlock next level
        if (currentLevel < 15) {
          const nextLvl = currentLevel + 1;
          if (nextLvl > maxUnlockedLevel) {
            setMaxUnlockedLevel(nextLvl);
            localStorage.setItem('TTT_MAX_LEVEL', nextLvl.toString());
          }
        }

        onWin(activeLevelConfig.reward, `❌⭕ Tic Tac Toe Level ${currentLevel} (${activeLevelConfig.name}) Win!`);
      } else if (outcome.winner === 'TIE') {
        sound.playWrong();
      }
    } else {
      setIsPlayerTurn(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span>❌⭕ Tic Tac Toe Arena</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
                Level {currentLevel}/15
              </span>
            </h1>
            <p className="text-xs text-slate-400">Beat escalating neural AI bots to claim up to $50.00 rewards</p>
          </div>
        </div>

        <button
          onClick={startRound}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>New Game</span>
        </button>
      </div>

      {/* Level Select Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {TTT_LEVELS.map((lvl) => {
          const isUnlocked = lvl.level <= maxUnlockedLevel;
          const isSelected = lvl.level === currentLevel;

          return (
            <button
              key={lvl.level}
              disabled={!isUnlocked}
              onClick={() => {
                if (isUnlocked) {
                  setCurrentLevel(lvl.level);
                  startRound();
                }
              }}
              className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20'
                  : isUnlocked
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                  : 'bg-slate-950/60 text-slate-600 border-slate-900 cursor-not-allowed opacity-50'
              }`}
            >
              <span>Lvl {lvl.level}</span>
              <span className={`text-[10px] ${isSelected ? 'text-slate-900' : 'text-emerald-400'}`}>
                ${lvl.reward.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Arena Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Opponent Info */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Bot className="w-4 h-4" /> Current Opponent
            </div>
            <h3 className="text-xl font-black text-white mt-1">{activeLevelConfig.name}</h3>
            <p className="text-xs text-slate-400 mt-1">
              AI Smartness: <strong className="text-cyan-300">{Math.round(activeLevelConfig.aiSmartness * 100)}%</strong>
            </p>
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Match Prize</span>
              <span className="text-emerald-400 font-extrabold">+${activeLevelConfig.reward.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Win Streak</span>
              <span className="text-amber-400 font-extrabold">{playerStreak} Wins</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Max Payout</span>
              <span className="text-purple-400 font-extrabold">$50.00 (Lvl 15)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300">
            <span className="font-bold text-white">Status: </span>
            {winner === 'X' ? (
              <span className="text-emerald-400 font-black">🎉 VICTORY! Level Cleared</span>
            ) : winner === 'O' ? (
              <span className="text-rose-400 font-black">💀 Defeated by AI</span>
            ) : winner === 'TIE' ? (
              <span className="text-amber-400 font-black">🤝 Tie Game! Try Again</span>
            ) : isPlayerTurn ? (
              <span className="text-cyan-400 font-black animate-pulse">Your Turn (X)</span>
            ) : (
              <span className="text-amber-400 font-black">AI Calculating Move... (O)</span>
            )}
          </div>
        </div>

        {/* 3x3 Board */}
        <div className="md:col-span-2 flex items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-3 gap-3 w-full max-w-sm aspect-square">
            {board.map((cell, idx) => {
              const isWinCell = winningLine?.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={!isPlayerTurn || winner !== null || cell !== null}
                  className={`aspect-square rounded-2xl text-4xl sm:text-5xl font-black flex items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-lg select-none ${
                    isWinCell
                      ? cell === 'X'
                        ? 'bg-emerald-500 text-slate-950 scale-105 shadow-emerald-500/50 border-2 border-emerald-300'
                        : 'bg-rose-500 text-white scale-105 shadow-rose-500/50 border-2 border-rose-300'
                      : cell === 'X'
                      ? 'bg-slate-800 text-cyan-400 border-2 border-cyan-500/50 shadow-inner'
                      : cell === 'O'
                      ? 'bg-slate-800 text-rose-400 border-2 border-rose-500/50 shadow-inner'
                      : isPlayerTurn && !winner
                      ? 'bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-cyan-500/50 text-slate-600'
                      : 'bg-slate-900/50 border border-slate-800/80 text-transparent cursor-not-allowed'
                  }`}
                >
                  {cell}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Victory Prompt */}
      {winner === 'X' && currentLevel < 15 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-white text-base">Level {currentLevel} Conquered!</h4>
            <p className="text-xs text-slate-300">
              You earned <strong className="text-emerald-400">+${activeLevelConfig.reward.toFixed(2)}</strong>. Ready
              for Level {currentLevel + 1} (${TTT_LEVELS[currentLevel].reward.toFixed(2)} prize)?
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentLevel((l) => l + 1);
              startRound();
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <span>Next Level</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
