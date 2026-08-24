import React, { useState, useEffect, useCallback } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  RotateCcw, 
  Trophy, 
  Sparkles, 
  Timer, 
  CheckCircle2, 
  Flame,
  Award
} from 'lucide-react';

interface MemoryMatchGameProps {
  onWin: (amount: number, description: string) => void;
  onBack: () => void;
  userBalance: number;
}

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const EMOJI_SETS = {
  crypto: ['💎', '🚀', '🪙', '⚡', '🔥', '👑', '🛡️', '🌟', '👾', '🌈', '🪐', '🎯'],
  arcade: ['🕹️', '👾', '🎮', '🎲', '🧩', '🏆', '⭐', '💣', '🔮', '🎪', '🎨', '🚀'],
  animals: ['🦁', '🦊', '🐼', '🐯', '🦄', '🦅', '🐬', '🐙', '🐺', '🦉', '🦋', '🐲']
};

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  onWin,
  onBack,
  userBalance
}) => {
  const [difficulty, setDifficulty] = useState<'standard' | 'expert'>('standard');
  const [theme, setTheme] = useState<keyof typeof EMOJI_SETS>('crypto');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [earnedCash, setEarnedCash] = useState<number>(0);

  const pairCount = difficulty === 'standard' ? 8 : 12; // 16 cards vs 24 cards
  const rewardAmount = difficulty === 'standard' ? 0.50 : 1.50;

  // Initialize Game Board
  const startNewGame = useCallback(() => {
    const iconList = EMOJI_SETS[theme].slice(0, pairCount);
    const deck = [...iconList, ...iconList]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false
      }));

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedPairs(0);
    setSeconds(0);
    setIsActive(true);
    setHasWon(false);
    setEarnedCash(0);
    sound.playClick();
  }, [theme, pairCount]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && !hasWon) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, hasWon]);

  // Handle Card Click
  const handleCardClick = (index: number) => {
    if (!isActive || hasWon) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndices.length === 2) return;

    sound.playCardFlip();
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [idx1, idx2] = newFlipped;

      if (newCards[idx1].icon === newCards[idx2].icon) {
        // Match!
        setTimeout(() => {
          sound.playCardMatch();
          newCards[idx1].isMatched = true;
          newCards[idx2].isMatched = true;
          setCards(newCards);
          setFlippedIndices([]);
          setMatchedPairs((p) => {
            const next = p + 1;
            if (next === pairCount) {
              handleWin();
            }
            return next;
          });
        }, 300);
      } else {
        // No match -> flip back
        setTimeout(() => {
          newCards[idx1].isFlipped = false;
          newCards[idx2].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
        }, 800);
      }
    }
  };

  const handleWin = () => {
    setHasWon(true);
    setIsActive(false);
    setEarnedCash(rewardAmount);
    sound.playWin();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onWin(rewardAmount, `🧠 Memory Match (${difficulty.toUpperCase()}) Win in ${moves + 1} moves!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Game Header */}
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
              <span>🧠 Memory Match Challenge</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                +${rewardAmount.toFixed(2)} Win
              </span>
            </h1>
            <p className="text-xs text-slate-400">Match all card pairs to claim instant cash credit</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Difficulty Toggle */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
            <button
              onClick={() => {
                setDifficulty('standard');
                sound.playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                difficulty === 'standard'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Standard (4x4)
            </button>
            <button
              onClick={() => {
                setDifficulty('expert');
                sound.playClick();
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                difficulty === 'expert'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Expert (6x4)
            </button>
          </div>

          <button
            onClick={startNewGame}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Time Elapsed</span>
          <div className="text-lg font-black text-white flex items-center justify-center gap-1 mt-0.5">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>{seconds}s</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Turns Made</span>
          <div className="text-lg font-black text-amber-400 mt-0.5">{moves}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Pairs Matched</span>
          <div className="text-lg font-black text-emerald-400 mt-0.5">
            {matchedPairs} / {pairCount}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center">
          <span className="text-[11px] text-slate-400 font-medium">Reward Pool</span>
          <div className="text-lg font-black text-emerald-400 mt-0.5">+${rewardAmount.toFixed(2)}</div>
        </div>
      </div>

      {/* Cards Board Grid */}
      <div
        className={`grid gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 shadow-2xl ${
          difficulty === 'standard'
            ? 'grid-cols-4 max-w-xl mx-auto'
            : 'grid-cols-4 sm:grid-cols-6 max-w-3xl mx-auto'
        }`}
      >
        {cards.map((card, idx) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(idx)}
            disabled={card.isMatched || card.isFlipped}
            className={`aspect-square rounded-xl text-3xl sm:text-4xl flex items-center justify-center font-bold transition-all duration-300 transform active:scale-95 cursor-pointer shadow-md select-none ${
              card.isMatched
                ? 'bg-emerald-950/60 border-2 border-emerald-500/50 text-emerald-300 opacity-90 scale-95'
                : card.isFlipped
                ? 'bg-slate-800 border-2 border-cyan-400 text-white rotate-y-180'
                : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 hover:border-slate-500 text-transparent'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <span className="animate-in fade-in zoom-in-75 duration-200">{card.icon}</span>
            ) : (
              <span className="text-slate-600 font-extrabold text-sm opacity-40">LP</span>
            )}
          </button>
        ))}
      </div>

      {/* Victory Modal */}
      {hasWon && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl shadow-emerald-500/20 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-3xl border border-emerald-500/40">
              🏆
            </div>

            <div>
              <h2 className="text-2xl font-black text-white">Board Cleared!</h2>
              <p className="text-sm text-slate-300 mt-1">
                Completed in <strong className="text-white">{moves} moves</strong> and{' '}
                <strong className="text-white">{seconds} seconds</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-500">Reward Credited</span>
              <div className="text-3xl font-black text-emerald-300 mt-0.5">+${earnedCash.toFixed(2)}</div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={startNewGame}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                Play Again
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onBack();
                }}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-slate-700 cursor-pointer"
              >
                Back to Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
