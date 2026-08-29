import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats } from '../../types';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Timer, Sparkles, Keyboard, CheckCircle2, Zap } from 'lucide-react';
import { AdPlacement, SponsorCarousel } from '../AdPlacement';

interface SpellingChallengeProps {
  onWin: (amount: number, description: string) => void;
  onBack: () => void;
  userBalance: number;
  stats?: PlayerStats;
}

const WORDS = [
  'CYBER', 'BLOCK', 'CRYPTO', 'MATRIX', 'RUNNER', 'REWARD', 
  'PHANTOM', 'SPEED', 'NEXUS', 'VORTEX', 'COIN', 'VAULT', 
  'HERO', 'SHADOW', 'TITAN', 'STRIKE', 'GOLD', 'ENERGY'
];

export const SpellingChallengeGame: React.FC<SpellingChallengeProps> = ({
  onWin,
  onBack,
  userBalance,
  stats
}) => {
  const [targetWord, setTargetWord] = useState<string>('CRYPTO');
  const [inputWord, setInputWord] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(3000);
  const [gameResult, setGameResult] = useState<'WIN' | 'LOSE' | null>(null);
  const [streak, setStreak] = useState<number>(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rewardAmount = 0.35;

  const startRound = () => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setTargetWord(randomWord);
    setInputWord('');
    setTimeLeftMs(3000);
    setGameResult(null);
    setIsPlaying(true);
    sound.playClick();

    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  // Timer Countdown
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setTimeLeftMs((prev) => {
        if (prev <= 50) {
          clearInterval(interval);
          setIsPlaying(false);
          setGameResult('LOSE');
          sound.playGameOver();
          return 0;
        }
        return prev - 50;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying) return;
    const val = e.target.value.toUpperCase();
    sound.playKeyStroke();
    setInputWord(val);

    if (val === targetWord) {
      setIsPlaying(false);
      setGameResult('WIN');
      sound.playWin();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setStreak((s) => s + 1);
      onWin(rewardAmount, `🔤 Spelling Rush Win! ("${targetWord}" typed in ${((3000 - timeLeftMs) / 1000).toFixed(2)}s)`);
    }
  };

  const handleVirtualKey = (letter: string) => {
    if (!isPlaying) return;
    const next = (inputWord + letter).toUpperCase();
    sound.playKeyStroke();
    setInputWord(next);

    if (next === targetWord) {
      setIsPlaying(false);
      setGameResult('WIN');
      sound.playWin();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      setStreak((s) => s + 1);
      onWin(rewardAmount, `🔤 Spelling Rush Win! ("${targetWord}")`);
    }
  };

  const handleVirtualBackspace = () => {
    if (!isPlaying) return;
    sound.playClick();
    setInputWord((w) => w.slice(0, -1));
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 flex-wrap">
              <span>🔤 Spelling Rush (3s)</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                +${rewardAmount.toFixed(2)} Win
              </span>
            </h1>
            <p className="text-xs text-slate-400">Type the highlighted word in under 3s</p>
          </div>
        </div>

        <button
          onClick={startRound}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 cursor-pointer min-h-[36px]"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{isPlaying ? 'Restart' : 'Start Round'}</span>
        </button>
      </div>

      {/* Target Word Display & Timer */}
      <div className="bg-slate-950 border-2 border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
          <span>Streak: <strong className="text-amber-400">{streak} Wins</strong></span>
          <span className={`flex items-center gap-1 font-mono text-xs sm:text-sm ${timeLeftMs < 1000 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`}>
            <Timer className="w-3.5 h-3.5" />
            {(timeLeftMs / 1000).toFixed(2)}s
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-75 ${
              timeLeftMs < 1000 ? 'bg-rose-500' : 'bg-cyan-500'
            }`}
            style={{ width: `${(timeLeftMs / 3000) * 100}%` }}
          />
        </div>

        {/* Big Word Card */}
        <div className="py-4 sm:py-5 px-3 bg-slate-900/60 rounded-xl sm:rounded-2xl border border-slate-800/80">
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-slate-500">Target Word</span>
          <div className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-cyan-300 tracking-wider mt-1">
            {targetWord}
          </div>
        </div>

        {/* Active Input Box */}
        <div className="relative max-w-xs sm:max-w-sm mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={inputWord}
            onChange={handleChange}
            disabled={!isPlaying}
            placeholder={isPlaying ? 'TYPE HERE...' : 'Press Start'}
            className="w-full px-3 py-2.5 sm:py-3 rounded-xl bg-slate-900 border-2 border-cyan-500/50 text-white font-mono font-black text-xl sm:text-2xl text-center uppercase tracking-widest focus:outline-none focus:border-cyan-400 placeholder:text-slate-600 placeholder:text-xs placeholder:font-sans shadow-inner"
          />
        </div>

        {/* Virtual Mini Keyboard for Touch Devices */}
        <div className="pt-1">
          <div className="flex flex-wrap justify-center gap-1 max-w-md mx-auto">
            {letters.map((l) => (
              <button
                key={l}
                onClick={() => handleVirtualKey(l)}
                disabled={!isPlaying}
                className="w-7 h-8 sm:w-8 sm:h-9 rounded-md sm:rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-slate-950 text-white text-[11px] sm:text-xs font-bold transition-colors border border-slate-700 cursor-pointer disabled:opacity-40"
              >
                {l}
              </button>
            ))}
            <button
              onClick={handleVirtualBackspace}
              disabled={!isPlaying}
              className="px-2.5 h-8 sm:h-9 rounded-md sm:rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 text-[11px] sm:text-xs font-bold border border-rose-800/60 cursor-pointer disabled:opacity-40"
            >
              ⌫ Del
            </button>
          </div>
        </div>

        {/* Results Modal Overlay */}
        {gameResult && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 text-center space-y-3.5 max-w-xs w-full shadow-2xl">
              {gameResult === 'WIN' ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl border border-emerald-500/40">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Lightning Fast!</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Typed in <strong className="text-cyan-400">{((3000 - timeLeftMs) / 1000).toFixed(2)}s</strong>!
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Cash Reward</span>
                    <div className="text-xl font-black text-emerald-300">+${rewardAmount.toFixed(2)}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-2xl border border-rose-500/40">
                    ⏱️
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Time Expired!</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Keep training your keyboard agility.</p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={startRound}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer min-h-[36px]"
                >
                  Next Word
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onBack();
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 cursor-pointer min-h-[36px]"
                >
                  Back to Hub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Spelling Sponsor Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <AdPlacement
          zoneId={459144}
          variant="card"
          title="Speed Spelling Sponsor (Zone 459144)"
          subtitle="Explore sponsor partner to earn bonus typing perks and instant reward top-ups."
          rewardLabel="ACTIVE #459144"
        />
        <AdPlacement
          zoneId={459143}
          variant="card"
          title="Lexicon Partner (Zone 459143)"
          subtitle="Verified sponsor network. Unlocks auto-correct shield and double streak payouts."
          rewardLabel="PERK #459143"
        />
      </div>

      {/* Slide Carousel */}
      <SponsorCarousel title="Spelling Boost Sponsors" subtitle="Discover verified partners & increase vocabulary streak bonuses" />
    </div>
  );
};
