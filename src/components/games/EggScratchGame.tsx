import React, { useState, useEffect } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  RotateCcw, 
  Timer, 
  Sparkles, 
  Trophy, 
  Award, 
  ChevronRight,
  Zap,
  Egg,
  Coins
} from 'lucide-react';

interface EggScratchGameProps {
  onWin: (amount: number, description: string) => void;
  onBack: () => void;
  userBalance: number;
}

interface EggTile {
  id: number;
  isScratched: boolean;
  reward: number; // 0 for empty, >0 for cash
  isGolden: boolean;
}

const LEVEL_CONFIGS = [
  { level: 1, eggsNeeded: 15, baseRewardPool: 0.50, name: 'Bronze Nest' },
  { level: 2, eggsNeeded: 20, baseRewardPool: 0.80, name: 'Silver Meadow' },
  { level: 3, eggsNeeded: 25, baseRewardPool: 1.20, name: 'Emerald Forest' },
  { level: 4, eggsNeeded: 30, baseRewardPool: 1.80, name: 'Golden Peak' },
  { level: 5, eggsNeeded: 35, baseRewardPool: 2.50, name: 'Ruby Cavern' },
  { level: 6, eggsNeeded: 40, baseRewardPool: 3.50, name: 'Sapphire Reef' },
  { level: 7, eggsNeeded: 45, baseRewardPool: 5.00, name: 'Amethyst Vault' },
  { level: 8, eggsNeeded: 50, baseRewardPool: 8.00, name: 'Titan Matrix' },
  { level: 9, eggsNeeded: 60, baseRewardPool: 15.00, name: 'Quantum Citadel' },
  { level: 10, eggsNeeded: 75, baseRewardPool: 100.00, name: 'Celestial Apex ($100 JACKPOT)' }
];

export const EggScratchGame: React.FC<EggScratchGameProps> = ({
  onWin,
  onBack,
  userBalance
}) => {
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [eggs, setEggs] = useState<EggTile[]>([]);
  const [scratchedCount, setScratchedCount] = useState<number>(0);
  const [levelEarnedCash, setLevelEarnedCash] = useState<number>(0);
  const [totalChallengeEarned, setTotalChallengeEarned] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(3600); // 1-hour challenge
  const [isLevelCleared, setIsLevelCleared] = useState<boolean>(false);

  const activeLevel = LEVEL_CONFIGS[currentLevel - 1] || LEVEL_CONFIGS[0];

  // Initialize 100 Eggs (10x10 Matrix)
  const initLevel = (lvl: number) => {
    const config = LEVEL_CONFIGS[lvl - 1];
    const newEggs: EggTile[] = [];

    // Distribute cash drops across 100 eggs
    for (let i = 0; i < 100; i++) {
      const isGolden = Math.random() < 0.08;
      let reward = 0;
      if (isGolden) {
        reward = +(Math.random() * 0.5 + 0.25).toFixed(2);
      } else if (Math.random() < 0.25) {
        reward = +(Math.random() * 0.15 + 0.02).toFixed(2);
      }

      newEggs.push({
        id: i,
        isScratched: false,
        reward,
        isGolden
      });
    }

    setEggs(newEggs);
    setScratchedCount(0);
    setLevelEarnedCash(0);
    setIsLevelCleared(false);
  };

  useEffect(() => {
    initLevel(currentLevel);
  }, [currentLevel]);

  // 1-Hour Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleEggScratch = (index: number) => {
    if (eggs[index].isScratched || isLevelCleared) return;

    sound.playEggCrack();
    const updated = [...eggs];
    updated[index].isScratched = true;
    setEggs(updated);

    const egg = updated[index];
    const newScratchedCount = scratchedCount + 1;
    setScratchedCount(newScratchedCount);

    let addCash = egg.reward;
    if (addCash > 0) {
      sound.playCoin();
      setLevelEarnedCash((c) => +(c + addCash).toFixed(2));
      setTotalChallengeEarned((t) => +(t + addCash).toFixed(2));
      onWin(addCash, `🥚 Egg Scratch (${activeLevel.name}) Drop +$${addCash.toFixed(2)}`);
    }

    // Check if level quota reached
    if (newScratchedCount >= activeLevel.eggsNeeded) {
      // Clear level!
      setIsLevelCleared(true);
      const levelBonus = activeLevel.baseRewardPool;
      sound.playWin();
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      onWin(levelBonus, `🏆 Egg Scratch Level ${currentLevel} (${activeLevel.name}) Bonus!`);
      setTotalChallengeEarned((t) => +(t + levelBonus).toFixed(2));
    }
  };

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 backdrop-blur-sm">
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
              <span>🥚 Egg Scratch Matrix</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
                10 Lvl • $100 Jackpot
              </span>
            </h1>
            <p className="text-xs text-slate-400">Scratch matrix eggs to find hidden cash</p>
          </div>
        </div>

        {/* 1-Hour Timer Widget */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono font-bold text-xs sm:text-sm">
          <Timer className="w-3.5 h-3.5 animate-pulse" />
          <span>{formatTimer(secondsRemaining)} left</span>
        </div>
      </div>

      {/* Level Banner & Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Current Level</span>
          <div className="text-sm sm:text-base font-black text-amber-400 mt-0.5 truncate">
            Lvl {currentLevel}/10
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Eggs Scratched</span>
          <div className="text-sm sm:text-base font-black text-white mt-0.5">
            {scratchedCount} / {activeLevel.eggsNeeded}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Clear Bonus</span>
          <div className="text-sm sm:text-base font-black text-emerald-400 mt-0.5">
            +${activeLevel.baseRewardPool.toFixed(2)}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 text-center">
          <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Total Earned</span>
          <div className="text-sm sm:text-base font-black text-cyan-300 mt-0.5">
            ${totalChallengeEarned.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 10x10 Matrix Grid */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-2xl overflow-hidden">
        <div className="grid grid-cols-10 gap-1 sm:gap-1.5 max-w-xl mx-auto">
          {eggs.map((egg, idx) => (
            <button
              key={egg.id}
              onClick={() => handleEggScratch(idx)}
              disabled={egg.isScratched || isLevelCleared}
              className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center font-bold text-[10px] sm:text-xs transition-all duration-200 cursor-pointer select-none ${
                egg.isScratched
                  ? egg.reward > 0
                    ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 scale-95 shadow-inner'
                    : 'bg-slate-900/60 border border-slate-800/80 text-slate-600 scale-90'
                  : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700 hover:border-amber-400/50 text-amber-400 hover:scale-105 active:scale-95 shadow-sm'
              }`}
            >
              {egg.isScratched ? (
                egg.reward > 0 ? (
                  <span className="font-extrabold text-[8px] sm:text-[10px] text-emerald-400">
                    +${egg.reward.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-[8px] text-slate-600">✕</span>
                )
              ) : (
                <Egg className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400/80" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Level Completion Bar */}
      {isLevelCleared && (
        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-950/80 via-emerald-950/80 to-slate-900 border border-amber-500/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>🎉 Level {currentLevel} Cleared!</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-bold">
                +${activeLevel.baseRewardPool.toFixed(2)} Bonus Added
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              {currentLevel < 10
                ? `Proceed to Level ${currentLevel + 1} (${LEVEL_CONFIGS[currentLevel].name}) for bigger drops!`
                : '🏆 You completed all 10 Levels and claimed the $100 Grand Jackpot!'}
            </p>
          </div>

          {currentLevel < 10 ? (
            <button
              onClick={() => {
                setCurrentLevel((l) => l + 1);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/20 cursor-pointer min-h-[36px]"
            >
              <span>Next Level</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onBack();
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer min-h-[36px]"
            >
              Back to Hub
            </button>
          )}
        </div>
      )}
    </div>
  );
};
