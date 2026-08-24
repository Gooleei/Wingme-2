import React, { useState, useEffect } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Trophy, Sparkles, Bot, User, Flame, Award, ChevronRight, Brain, Zap, ShieldAlert } from 'lucide-react';

interface TicTacToeGameProps {
  onWin: (amount: number, description: string) => void;
  onBack: () => void;
  userBalance?: number;
}

type CellValue = 'X' | 'O' | null;

interface LevelInfo {
  level: number;
  name: string;
  reward: number;
  aiSmartness: number; // 1.0 = 100% perfect Minimax calculation
}

const TTT_LEVELS: LevelInfo[] = [
  { level: 1, name: 'Neural Sentinel', reward: 0.50, aiSmartness: 1.0 },
  { level: 2, name: 'Cyber Tactician', reward: 0.80, aiSmartness: 1.0 },
  { level: 3, name: 'Deep Matrix Core', reward: 1.20, aiSmartness: 1.0 },
  { level: 4, name: 'Quantum Predictor', reward: 2.00, aiSmartness: 1.0 },
  { level: 5, name: 'Apex Neural Engine', reward: 3.50, aiSmartness: 1.0 },
  { level: 6, name: 'Singularity Overlord', reward: 5.00, aiSmartness: 1.0 },
  { level: 7, name: 'Grandmaster Omega', reward: 8.00, aiSmartness: 1.0 },
  { level: 8, name: 'Hypermind Oracle', reward: 12.00, aiSmartness: 1.0 },
  { level: 9, name: 'Matrix Sovereign', reward: 18.00, aiSmartness: 1.0 },
  { level: 10, name: 'Infinite Algorithm', reward: 25.00, aiSmartness: 1.0 },
  { level: 11, name: 'Celestial Titan', reward: 30.00, aiSmartness: 1.0 },
  { level: 12, name: 'Zero-Error Nexus', reward: 35.00, aiSmartness: 1.0 },
  { level: 13, name: 'Omega Godmind', reward: 40.00, aiSmartness: 1.0 },
  { level: 14, name: 'Cosmic Dominator', reward: 45.00, aiSmartness: 1.0 },
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
  const [aiThinking, setAiThinking] = useState<boolean>(false);

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
    setAiThinking(false);
    sound.playClick();
  };

  // 100% Unbeatable Recursive Minimax with Alpha-Beta Pruning
  const minimax = (
    currentBoard: CellValue[],
    depth: number,
    isMaximizing: boolean,
    alpha = -Infinity,
    beta = Infinity
  ): number => {
    const outcome = checkWinningState(currentBoard);
    if (outcome) {
      if (outcome.winner === 'O') return 10 - depth; // AI wins
      if (outcome.winner === 'X') return depth - 10; // Player wins
      if (outcome.winner === 'TIE') return 0;       // Tie
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O';
          const score = minimax(currentBoard, depth + 1, false, alpha, beta);
          currentBoard[i] = null;
          maxScore = Math.max(maxScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break; // Beta cut-off
        }
      }
      return maxScore;
    } else {
      let minScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X';
          const score = minimax(currentBoard, depth + 1, true, alpha, beta);
          currentBoard[i] = null;
          minScore = Math.min(minScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break; // Alpha cut-off
        }
      }
      return minScore;
    }
  };

  // Calculate 100% Optimal Counter Move
  const get100PercentBestMove = (b: CellValue[]): number => {
    let bestScore = -Infinity;
    let candidates: number[] = [];

    // Evaluate every possible legal square
    for (let i = 0; i < 9; i++) {
      if (b[i] === null) {
        const boardCopy = [...b];
        boardCopy[i] = 'O';
        const score = minimax(boardCopy, 0, false);
        
        if (score > bestScore) {
          bestScore = score;
          candidates = [i];
        } else if (score === bestScore) {
          candidates.push(i);
        }
      }
    }

    // Pick between equally optimal counter-moves (e.g. center or strategic corners)
    if (candidates.includes(4)) return 4; // Center is best
    const corners = candidates.filter(idx => [0, 2, 6, 8].includes(idx));
    if (corners.length > 0) {
      return corners[Math.floor(Math.random() * corners.length)];
    }

    return candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
  };

  // AI Turn Execution
  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      setAiThinking(true);
      const timer = setTimeout(() => {
        const move = get100PercentBestMove(board);
        const newBoard = [...board];
        newBoard[move] = 'O';
        
        sound.playCardFlip();
        setBoard(newBoard);
        setAiThinking(false);

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
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner, board]);

  // Handle Player Move
  const handleCellClick = (index: number) => {
    if (!isPlayerTurn || winner || board[index] !== null || aiThinking) return;

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
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>❌⭕ Tic Tac Toe Arena</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-black flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-cyan-400" />
                100% Intelligence
              </span>
            </h1>
            <p className="text-xs text-slate-400">Master Minimax counter-tactics to claim escalating cash rewards</p>
          </div>
        </div>

        <button
          onClick={startRound}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer shadow-sm min-h-[40px]"
        >
          <RotateCcw className="w-4 h-4" />
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
              className={`flex-shrink-0 px-3 py-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-0.5 transition-all cursor-pointer min-h-[50px] ${
                isSelected
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/20 font-black'
                  : isUnlocked
                  ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
                  : 'bg-slate-950/60 text-slate-600 border-slate-900 cursor-not-allowed opacity-50'
              }`}
            >
              <span>Lvl {lvl.level}</span>
              <span className={`text-[10px] ${isSelected ? 'text-slate-950 font-black' : 'text-emerald-400 font-extrabold'}`}>
                ${lvl.reward.toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Arena Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Opponent Info */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Bot className="w-4 h-4" /> Grandmaster AI Opponent
            </div>
            <h3 className="text-xl font-black text-white mt-1.5">{activeLevelConfig.name}</h3>
            
            {/* 100% Intelligence Gauge */}
            <div className="mt-3 space-y-1.5 p-3 rounded-2xl bg-slate-950/80 border border-cyan-500/30">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                  <Brain className="w-3.5 h-3.5 text-cyan-400" />
                  AI Intelligence
                </span>
                <span className="text-cyan-400 font-black text-sm">100% (Unbeatable)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full w-full shadow-sm" />
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Predicts and counters all forks, corners, and diagonal traps.
              </p>
            </div>
          </div>

          <div className="space-y-2 p-3 rounded-2xl bg-slate-950/90 border border-slate-800/80">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Match Prize</span>
              <span className="text-emerald-400 font-black">+${activeLevelConfig.reward.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Win Streak</span>
              <span className="text-amber-400 font-black">{playerStreak} Wins</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Max Jackpot</span>
              <span className="text-purple-400 font-black">$50.00 (Lvl 15)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
            <span className="font-bold text-white">Status: </span>
            {winner === 'X' ? (
              <span className="text-emerald-400 font-black">🎉 VICTORY! Level Cleared</span>
            ) : winner === 'O' ? (
              <span className="text-rose-400 font-black">💀 Defeated by AI Counter</span>
            ) : winner === 'TIE' ? (
              <span className="text-amber-400 font-black">🤝 Stalemate Tie! Try to outplay</span>
            ) : isPlayerTurn ? (
              <span className="text-cyan-400 font-black animate-pulse">Your Move (X)</span>
            ) : (
              <span className="text-amber-400 font-black">AI Calculating Optimal Move... (O)</span>
            )}
          </div>
        </div>

        {/* 3x3 Board */}
        <div className="md:col-span-2 flex items-center justify-center p-6 bg-slate-900/90 rounded-3xl border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-3 gap-3.5 w-full max-w-sm aspect-square">
            {board.map((cell, idx) => {
              const isWinCell = winningLine?.includes(idx);
              return (
                <button
                  key={idx}
                  onClick={() => handleCellClick(idx)}
                  disabled={!isPlayerTurn || winner !== null || cell !== null || aiThinking}
                  className={`aspect-square rounded-2xl text-4xl sm:text-5xl font-black flex items-center justify-center transition-all transform active:scale-95 cursor-pointer shadow-lg select-none ${
                    isWinCell
                      ? cell === 'X'
                        ? 'bg-emerald-500 text-slate-950 scale-105 shadow-emerald-500/50 border-2 border-emerald-300'
                        : 'bg-rose-500 text-white scale-105 shadow-rose-500/50 border-2 border-rose-300'
                      : cell === 'X'
                      ? 'bg-slate-950 text-cyan-400 border-2 border-cyan-500/60 shadow-inner'
                      : cell === 'O'
                      ? 'bg-slate-950 text-rose-400 border-2 border-rose-500/60 shadow-inner'
                      : isPlayerTurn && !winner
                      ? 'bg-slate-950 hover:bg-slate-800/80 border border-slate-700/80 hover:border-cyan-500/60 text-slate-600'
                      : 'bg-slate-950/60 border border-slate-800/80 text-transparent cursor-not-allowed'
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
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-cyan-950/80 border border-emerald-500/40 flex flex-wrap items-center justify-between gap-3 shadow-xl">
          <div>
            <h4 className="font-extrabold text-white text-base">Level {currentLevel} Mastered!</h4>
            <p className="text-xs text-slate-300">
              You earned <strong className="text-emerald-400">+${activeLevelConfig.reward.toFixed(2)}</strong>. Ready for Level {currentLevel + 1} (${TTT_LEVELS[currentLevel].reward.toFixed(2)} prize)?
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentLevel((l) => l + 1);
              startRound();
            }}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-lg shadow-cyan-500/20 cursor-pointer min-h-[38px]"
          >
            <span>Next Level</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
