import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerStats, UserProfile } from '../types';
import { MINE_LEVELS } from '../data/gameData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { SponsorCarousel } from './AdPlacement';
import { isVIPUser } from '../utils/accountManager';
import { 
  Sparkles, 
  Flame, 
  Trophy, 
  Award,
  TrendingUp,
  Zap, 
  ChevronRight, 
  CheckCircle2, 
  Lock, 
  Crown,
  BatteryCharging,
  BatteryMedium,
  Timer
} from 'lucide-react';

interface FloatingTapEffect {
  id: number;
  x: number;
  y: number;
  text: string;
  subtext: string;
}

interface MineViewProps {
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  user: UserProfile;
  onBack: () => void;
  soundOn: boolean;
  setSoundOn: (enabled: boolean) => void;
  onOpenWithdraw: () => void;
}

export const MineView: React.FC<MineViewProps> = ({
  stats,
  setStats,
  user,
  onBack: _onBack,
  soundOn: _soundOn,
  setSoundOn: _setSoundOn,
  onOpenWithdraw: _onOpenWithdraw
}) => {
  const isVip = isVIPUser(user);

  // Determine current active level (1 to 15) securely
  const currentLevelNum = Math.min(
    15,
    Math.max(1, stats.mineProgress?.currentLevel ?? 1)
  );
  const currentLevelIndex = currentLevelNum - 1;
  const currentLevelConfig = MINE_LEVELS[currentLevelIndex] || MINE_LEVELS[0];

  // Local Taps Progress towards Level Goal
  const [tapsInCurrentLevel, setTapsInCurrentLevel] = useState<number>(
    stats.mineProgress?.tapsInLevel ?? 0
  );
  const [totalLifetimeTaps, setTotalLifetimeTaps] = useState<number>(
    stats.mineProgress?.totalTaps ?? 0
  );
  const [totalMinedCash, setTotalMinedCash] = useState<number>(
    stats.mineProgress?.totalEarnedCash ?? 0
  );

  // Auto-refilling Tap Cap (Capacity) State
  // Default to full capacity of current level if not initialized
  const maxTapCap = currentLevelConfig.requiredTaps;
  const [availableTapCap, setAvailableTapCap] = useState<number>(() => {
    const saved = stats.mineProgress?.availableTapCap;
    if (typeof saved === 'number' && saved >= 0 && saved <= maxTapCap) {
      return saved;
    }
    return maxTapCap;
  });

  const [isRefilling, setIsRefilling] = useState<boolean>(false);
  const [isHoldingGem, setIsHoldingGem] = useState<boolean>(false);

  // Animation & Visual States
  const [isSquished, setIsSquished] = useState<boolean>(false);
  const [floatingParticles, setFloatingParticles] = useState<FloatingTapEffect[]>([]);
  const [tapCombo, setTapCombo] = useState<number>(0);
  const [tapsPerSec, setTapsPerSec] = useState<number>(0);
  const [recentTapTimestamps, setRecentTapTimestamps] = useState<number[]>([]);

  // Shout of Appraisal Celebration Modal
  const [completedLevelData, setCompletedLevelData] = useState<{
    completedLevel: number;
    levelName: string;
    appraisalShout: string;
    bonusReward: number;
    nextLevelNum: number;
    nextLevelName: string;
    isGodFather: boolean;
  } | null>(null);

  // Critical Refs to avoid stale closures & race conditions
  const levelRef = useRef<number>(currentLevelNum);
  const tapsInLevelRef = useRef<number>(tapsInCurrentLevel);
  const totalTapsRef = useRef<number>(totalLifetimeTaps);
  const totalCashRef = useRef<number>(totalMinedCash);
  const availableCapRef = useRef<number>(availableTapCap);
  const maxCapRef = useRef<number>(maxTapCap);
  const lastTapTimeRef = useRef<number>(Date.now());
  const isTransitioningRef = useRef<boolean>(false);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs synchronized with state and level changes
  useEffect(() => {
    levelRef.current = currentLevelNum;
    maxCapRef.current = currentLevelConfig.requiredTaps;
  }, [currentLevelNum, currentLevelConfig.requiredTaps]);

  useEffect(() => {
    tapsInLevelRef.current = tapsInCurrentLevel;
  }, [tapsInCurrentLevel]);

  useEffect(() => {
    totalTapsRef.current = totalLifetimeTaps;
  }, [totalLifetimeTaps]);

  useEffect(() => {
    totalCashRef.current = totalMinedCash;
  }, [totalMinedCash]);

  useEffect(() => {
    availableCapRef.current = availableTapCap;
  }, [availableTapCap]);

  // Synchronize when external stats update currentLevel or initial values
  useEffect(() => {
    if (stats.mineProgress) {
      const extLvl = Math.min(15, Math.max(1, stats.mineProgress.currentLevel));
      levelRef.current = extLvl;
      setTapsInCurrentLevel(stats.mineProgress.tapsInLevel);
      setTotalLifetimeTaps(stats.mineProgress.totalTaps);
      setTotalMinedCash(stats.mineProgress.totalEarnedCash);
      
      const config = MINE_LEVELS[extLvl - 1] || MINE_LEVELS[0];
      maxCapRef.current = config.requiredTaps;

      if (typeof stats.mineProgress.availableTapCap === 'number') {
        const clamped = Math.min(config.requiredTaps, Math.max(0, stats.mineProgress.availableTapCap));
        setAvailableTapCap(clamped);
        availableCapRef.current = clamped;
      }
    }
  }, [stats.mineProgress?.currentLevel]);

  // AUTO-REFILL ENGINE: Each tap is -1 and each second held / idle is +1 until cap reaches max (e.g. 5000/5000)
  useEffect(() => {
    const refillInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastTap = now - lastTapTimeRef.current;
      const maxCap = maxCapRef.current;
      const currentCap = availableCapRef.current;

      // If player hasn't tapped for >= 1000ms or is holding the gem
      if (timeSinceLastTap >= 1000 || isHoldingGem) {
        if (currentCap < maxCap) {
          // Exactly +1 per second
          const nextCap = Math.min(maxCap, currentCap + 1);
          availableCapRef.current = nextCap;
          setAvailableTapCap(nextCap);
          setIsRefilling(true);

          // Periodically save available cap to stats (throttled)
          if (nextCap === maxCap || nextCap % 10 === 0) {
            setStats(prev => ({
              ...prev,
              mineProgress: {
                currentLevel: prev.mineProgress?.currentLevel ?? levelRef.current,
                tapsInLevel: tapsInLevelRef.current,
                totalTaps: totalTapsRef.current,
                totalEarnedCash: totalCashRef.current,
                highestLevelUnlocked: Math.max(prev.mineProgress?.highestLevelUnlocked ?? 1, levelRef.current),
                availableTapCap: nextCap,
                lastTapTimestamp: now
              }
            }));
          }
        } else {
          setIsRefilling(false);
        }
      } else {
        setIsRefilling(false);
      }
    }, 1000);

    return () => clearInterval(refillInterval);
  }, [isHoldingGem, setStats]);

  // Speedometer Calculation (Taps Per Second)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const valid = recentTapTimestamps.filter(t => now - t <= 1000);
      setTapsPerSec(valid.length);
      setRecentTapTimestamps(valid);
    }, 400);

    return () => clearInterval(interval);
  }, [recentTapTimestamps]);

  // LEVEL PROGRESSION RATIOS & PERCENTAGES
  const progressRatio = currentLevelConfig.requiredTaps > 0 
    ? Math.min(1, tapsInCurrentLevel / currentLevelConfig.requiredTaps) 
    : 0;
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));
  const remainingTaps = Math.max(0, currentLevelConfig.requiredTaps - tapsInCurrentLevel);

  // TAP CAP RATIO (Available Energy / Max Level Cap)
  const capRatio = maxTapCap > 0 ? Math.min(1, availableTapCap / maxTapCap) : 1;
  const capPercent = Math.min(100, Math.round(capRatio * 100));

  // Dynamic Scale Factor: Gem starts at 1.0x and expands up to 1.75x as level progress reaches 100%
  const dynamicGrowthScale = 1 + progressRatio * 0.75;
  const renderedScale = isSquished ? dynamicGrowthScale * 0.92 : dynamicGrowthScale;

  // ATOMIC LEVEL COMPLETION HANDLER: Moves player automatically to next level and awards bonus
  const triggerLevelCompletion = useCallback((finishedLevelNum: number) => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    const finishedConfig = MINE_LEVELS[finishedLevelNum - 1] || currentLevelConfig;
    const isGodFatherLevel = finishedLevelNum >= 15;
    const nextLevelNum = Math.min(15, finishedLevelNum + (isGodFatherLevel ? 0 : 1));
    const nextConfig = MINE_LEVELS[nextLevelNum - 1] || finishedConfig;
    const bonusAwarded = finishedConfig.bonusReward;

    // Victory Audio & Celebratory Confetti
    sound.playLevelUpAppraisal();
    confetti({
      particleCount: isGodFatherLevel ? 300 : 180,
      spread: 110,
      origin: { y: 0.55 },
      colors: ['#22d3ee', '#fbbf24', '#f43f5e', '#10b981', '#a855f7', '#ffffff']
    });

    // Display Appraisal Celebration Modal
    setCompletedLevelData({
      completedLevel: finishedLevelNum,
      levelName: finishedConfig.name,
      appraisalShout: finishedConfig.appraisalShout,
      bonusReward: bonusAwarded,
      nextLevelNum,
      nextLevelName: nextConfig.name,
      isGodFather: isGodFatherLevel
    });

    // Refill tap cap completely for the newly unlocked level
    const newMaxCap = nextConfig.requiredTaps;
    availableCapRef.current = newMaxCap;
    setAvailableTapCap(newMaxCap);

    // Reset current level tap progress to 0
    tapsInLevelRef.current = 0;
    setTapsInCurrentLevel(0);
    levelRef.current = nextLevelNum;

    // Apply level completion to PlayerStats & persistence
    const tapRewardAmount = finishedConfig.tapReward ?? 0.30;
    setStats(prev => {
      const updatedBalance = +(prev.balance + bonusAwarded).toFixed(2);
      const updatedCashEarned = +(prev.totalCashEarned + bonusAwarded).toFixed(2);
      const updatedTotalMined = +((prev.mineProgress?.totalEarnedCash ?? 0) + tapRewardAmount + bonusAwarded).toFixed(2);
      const newHighest = Math.max(prev.mineProgress?.highestLevelUnlocked ?? 1, nextLevelNum);

      return {
        ...prev,
        balance: updatedBalance,
        totalCashEarned: updatedCashEarned,
        mineProgress: {
          currentLevel: nextLevelNum,
          tapsInLevel: 0,
          totalTaps: (prev.mineProgress?.totalTaps ?? totalTapsRef.current) + 1,
          totalEarnedCash: updatedTotalMined,
          highestLevelUnlocked: newHighest,
          availableTapCap: newMaxCap,
          lastTapTimestamp: Date.now()
        }
      };
    });

    // Release lock after transition
    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 400);
  }, [currentLevelConfig, setStats]);

  // MAIN TAP HANDLER: Decreases tap cap, rewards cash & ₮ points, progresses level
  const handleDiamondTap = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // If cap is completely depleted, notify player to hold/rest
    if (availableCapRef.current <= 0) {
      sound.playWrong();
      return;
    }

    lastTapTimeRef.current = Date.now();
    sound.playDiamondTap();

    // Visual Squish Effect
    setIsSquished(true);
    setTimeout(() => setIsSquished(false), 90);

    // Combo Counter Management
    setTapCombo(prev => prev + 1);
    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => {
      setTapCombo(0);
    }, 1200);

    // Register timestamp for Taps/Sec speedometer
    setRecentTapTimestamps(prev => [...prev, Date.now()]);

    const activeTapReward = currentLevelConfig.tapReward ?? 0.30;
    const activeTPoints = (activeTapReward / 15).toFixed(3);

    // Spawn Floating Tap Particle
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    const jitterX = (Math.random() - 0.5) * 40;
    const jitterY = (Math.random() - 0.5) * 20;

    const newParticleId = Date.now() + Math.random();
    setFloatingParticles(prev => [
      ...prev.slice(-15),
      {
        id: newParticleId,
        x: clientX + jitterX,
        y: clientY + jitterY,
        text: `+$${activeTapReward.toFixed(2)}`,
        subtext: `+₮${activeTPoints}`
      }
    ]);

    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => p.id !== newParticleId));
    }, 800);

    // Decrement Tap Cap
    const nextAvailableCap = Math.max(0, availableCapRef.current - 1);
    availableCapRef.current = nextAvailableCap;
    setAvailableTapCap(nextAvailableCap);

    // Increment Taps Mined towards Level Goal
    const nextTapsInLevel = tapsInLevelRef.current + 1;
    const nextTotalTaps = totalTapsRef.current + 1;
    const is100TapMilestone = nextTotalTaps % 100 === 0;
    const milestoneBonus = is100TapMilestone ? 75.00 : 0; // 5₮ = $75.00
    const nextMinedCash = +(totalCashRef.current + activeTapReward + milestoneBonus).toFixed(2);

    if (is100TapMilestone) {
      sound.playWin();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.5 }
      });
      const milestoneParticleId = Date.now() + 0.999;
      setFloatingParticles(prev => [
        ...prev,
        {
          id: milestoneParticleId,
          x: clientX,
          y: clientY - 40,
          text: `🎉 +5₮ ($75.00) BONUS!`,
          subtext: `100 Taps Milestone Reached!`
        }
      ]);
      setTimeout(() => {
        setFloatingParticles(prev => prev.filter(p => p.id !== milestoneParticleId));
      }, 1500);
    }

    tapsInLevelRef.current = nextTapsInLevel;
    totalTapsRef.current = nextTotalTaps;
    totalCashRef.current = nextMinedCash;

    setTapsInCurrentLevel(nextTapsInLevel);
    setTotalLifetimeTaps(nextTotalTaps);
    setTotalMinedCash(nextMinedCash);

    // Check if Level is Completed
    if (nextTapsInLevel >= currentLevelConfig.requiredTaps) {
      triggerLevelCompletion(currentLevelConfig.level);
    } else {
      // Synchronize active tap reward and milestone bonus to PlayerStats Balance
      setStats(prev => {
        const addedReward = activeTapReward + milestoneBonus;
        const newBal = +(prev.balance + addedReward).toFixed(2);
        return {
          ...prev,
          balance: newBal,
          totalCashEarned: +(prev.totalCashEarned + addedReward).toFixed(2),
          mineProgress: {
            currentLevel: levelRef.current,
            tapsInLevel: nextTapsInLevel,
            totalTaps: nextTotalTaps,
            totalEarnedCash: nextMinedCash,
            highestLevelUnlocked: Math.max(prev.mineProgress?.highestLevelUnlocked ?? 1, levelRef.current),
            availableTapCap: nextAvailableCap,
            lastTapTimestamp: Date.now()
          }
        };
      });
    }
  }, [currentLevelConfig, triggerLevelCompletion, setStats]);

  // HOLD-TO-REFILL HANDLERS
  const startHolding = () => {
    setIsHoldingGem(true);
    sound.playEnergyRecharge();
  };

  const stopHolding = () => {
    setIsHoldingGem(false);
    if (holdIntervalRef.current) clearInterval(holdIntervalRef.current);
  };

  // Close Celebration Modal
  const handleCloseAppraisalModal = () => {
    sound.playClick();
    setCompletedLevelData(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] pb-24 text-slate-100 flex flex-col justify-between select-none overflow-x-hidden">
      
      {/* FLOATING TAP PARTICLES LAYER */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floatingParticles.map(p => (
          <div
            key={p.id}
            style={{ left: `${p.x}px`, top: `${p.y}px` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-float-fade flex flex-col items-center pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          >
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight flex items-center gap-0.5">
              <span>{p.text}</span>
              <span className="text-sm">💎</span>
            </span>
            <span className="text-[11px] font-bold text-cyan-300 font-mono -mt-1">
              {p.subtext}
            </span>
          </div>
        ))}
      </div>

      {/* TOP HEADER: LEVEL INFO & COMPLETION BONUS */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 pt-3 sm:pt-4 space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-cyan-400" />
              LVL {currentLevelConfig.level} / 15
            </span>
            <span className="text-sm sm:text-base font-black text-white">
              {currentLevelConfig.name}
            </span>
            {currentLevelConfig.level === 15 && (isVip || tapsInCurrentLevel >= currentLevelConfig.requiredTaps) && (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] sm:text-xs flex items-center gap-1 shadow-md animate-pulse">
                <Crown className="w-3.5 h-3.5" />
                <span>✓ 15/15 GODFATHER COMPLETED</span>
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-medium mr-1">Completion Bonus:</span>
            <span className="text-xs sm:text-sm font-black text-amber-400 font-mono">
              +${currentLevelConfig.bonusReward.toFixed(2)}
            </span>
          </div>
        </div>

        {/* TAP CAP (AUTO-REFILL ENERGY GAUGE) */}
        <div className="bg-slate-950/85 border border-cyan-500/40 rounded-2xl p-3 sm:p-3.5 shadow-lg relative overflow-hidden space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold flex-wrap gap-1">
            <span className="text-slate-200 flex items-center gap-1.5 font-black">
              {isRefilling || isHoldingGem ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400 animate-pulse" />
              ) : (
                <BatteryMedium className="w-4 h-4 text-cyan-400" />
              )}
              <span>Tap Cap Energy</span>
              {isRefilling && (
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono animate-pulse">
                  ⚡ Auto-Refilling (+1/sec)
                </span>
              )}
              {availableTapCap === maxTapCap && (
                <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  ✨ Full ({maxTapCap.toLocaleString()})
                </span>
              )}
            </span>

            <span className="font-mono font-black text-xs sm:text-sm text-cyan-300">
              {availableTapCap.toLocaleString()} / {maxTapCap.toLocaleString()} Taps ({capPercent}%)
            </span>
          </div>

          {/* Energy Cap Progress Bar */}
          <div className="w-full h-3 sm:h-3.5 bg-slate-900 rounded-full border border-cyan-900/60 overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-150 relative overflow-hidden ${
                availableTapCap === 0 
                  ? 'bg-rose-600' 
                  : isRefilling || isHoldingGem
                  ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500'
              }`}
              style={{ width: `${capPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 -skew-x-12 animate-shimmer" />
            </div>
          </div>

          {/* Helper Subtext */}
          <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400">
            <span>
              {availableTapCap === 0 ? (
                <strong className="text-rose-400 font-bold">⚠️ Cap Exhausted (0/{maxTapCap.toLocaleString()})! Hold or rest to auto-refill (+1/sec).</strong>
              ) : (
                <span>Each tap is <strong>-1</strong> • Each second held or idle is <strong className="text-emerald-300 font-mono">+1</strong> (up to {maxTapCap.toLocaleString()})</span>
              )}
            </span>
            <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
              <Timer className="w-3 h-3" /> +1/sec refill
            </span>
          </div>
        </div>
      </div>

      {/* CENTER GLITTERING 💎 TAP TO WIN STAGE */}
      <div className="max-w-xl mx-auto w-full px-4 py-3 sm:py-5 flex flex-col items-center justify-center relative my-auto">
        
        {/* Combo & Speedometer Floating Badges */}
        <div className="flex items-center gap-2.5 mb-2 sm:mb-3 flex-wrap justify-center">
          {tapCombo > 1 && (
            <div className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs sm:text-sm animate-bounce flex items-center gap-1 shadow-lg">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{tapCombo}x COMBO!</span>
            </div>
          )}

          {tapsPerSec > 0 && (
            <div className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center gap-1 font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tapsPerSec} taps/sec</span>
            </div>
          )}

          {/* Expansion Size Growth Badge */}
          {progressPercent > 0 && (
            <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[11px] flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
              <span>Size: +{Math.round(progressRatio * 75)}%</span>
            </div>
          )}
        </div>

        {/* Pedestal Glow & Rotating Particle Ring */}
        <div className="relative flex items-center justify-center min-h-[220px] sm:min-h-[270px] w-full">
          
          {/* Outer Pulsing Aura (Enlarges with tapping progress) */}
          <div 
            className="absolute rounded-full blur-3xl opacity-70 animate-pulse transition-all duration-300 pointer-events-none"
            style={{
              width: `${(140 + currentLevelConfig.level * 10) * (1 + progressRatio * 0.5)}px`,
              height: `${(140 + currentLevelConfig.level * 10) * (1 + progressRatio * 0.5)}px`,
              backgroundColor: currentLevelConfig.accentColor
            }}
          />

          {/* Rotating Light Rings */}
          <div 
            className="absolute rounded-full border border-dashed border-cyan-400/40 animate-spin-slow pointer-events-none transition-all duration-300"
            style={{
              width: `${(160 + currentLevelConfig.level * 10) * (1 + progressRatio * 0.45)}px`,
              height: `${(160 + currentLevelConfig.level * 10) * (1 + progressRatio * 0.45)}px`
            }}
          />

          {/* THE ROUND GLITTERING 💎 (DYNAMICALLY ENLARGES ON TAP) */}
          <div
            id="mine-glittering-gem"
            onClick={handleDiamondTap}
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onTouchStart={handleDiamondTap}
            onTouchEnd={stopHolding}
            title="Tap the Glittering Diamond to Earn Cash! Hold to auto-refill tap cap."
            style={{
              transform: `scale(${renderedScale})`,
              transformOrigin: 'center center'
            }}
            className="cursor-pointer touch-manipulation select-none relative z-10 transition-transform duration-100 flex items-center justify-center hover:brightness-110 active:brightness-125"
          >
            {/* SVG Glittering Diamond with Realistic Reflections and Sparkling Facets */}
            <div className={`relative flex items-center justify-center ${currentLevelConfig.gemSizeClass} transition-all duration-300`}>
              
              {/* Diamond Vector SVG with Level Theme Glow */}
              <svg 
                viewBox="0 0 200 200" 
                className="w-full h-full drop-shadow-[0_10px_35px_rgba(34,211,238,0.5)] transition-all duration-300 overflow-visible"
              >
                <defs>
                  <linearGradient id={`gemGrad-${currentLevelConfig.level}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="30%" stopColor={currentLevelConfig.accentColor} stopOpacity="0.9" />
                    <stop offset="70%" stopColor="#0891b2" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="1" />
                  </linearGradient>

                  <linearGradient id="facetHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
                  </linearGradient>

                  <linearGradient id="goldCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="50%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>

                  <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Round Diamond Outer Rim Base */}
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill={`url(#gemGrad-${currentLevelConfig.level})`}
                  stroke="#ffffff"
                  strokeWidth="3"
                  className="transition-colors duration-500"
                />

                {/* Sparkling Facets (Brilliant Cut Geometry) */}
                <polygon points="100,20 135,55 65,55" fill="url(#facetHighlight)" opacity="0.6" />
                <polygon points="65,55 135,55 100,100" fill="#ffffff" opacity="0.25" />
                
                <polygon points="100,20 165,70 135,55" fill="#ffffff" opacity="0.4" />
                <polygon points="100,20 35,70 65,55" fill="#ffffff" opacity="0.5" />
                
                <polygon points="100,60 140,100 100,140 60,100" fill="#ffffff" opacity="0.3" />
                
                <polygon points="140,100 100,180 100,140" fill="#0369a1" opacity="0.5" />
                <polygon points="60,100 100,180 100,140" fill="#075985" opacity="0.6" />
                <polygon points="35,70 60,100 100,180 20,100" fill="#0c4a6e" opacity="0.7" />
                <polygon points="165,70 140,100 100,180 180,100" fill="#0284c7" opacity="0.6" />

                <circle cx="100" cy="100" r="14" fill="#ffffff" opacity="0.75" filter="url(#glowFilter)" />
                <polygon points="100,78 104,96 122,100 104,104 100,122 96,104 78,100 96,96" fill="#ffffff" opacity="0.9" />

                <circle cx="65" cy="45" r="4" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2s' }} />
                <circle cx="145" cy="65" r="3" fill="#ffffff" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                <circle cx="125" cy="140" r="3" fill="#ffffff" className="animate-ping" style={{ animationDuration: '1.8s' }} />

                {/* Godfather Crown Overlay on Level 15 */}
                {currentLevelConfig.level === 15 && (
                  <g transform="translate(60, 5) scale(0.8)">
                    <path
                      d="M 10 40 L 25 15 L 50 35 L 75 15 L 90 40 Z"
                      fill="url(#goldCrownGrad)"
                      stroke="#ffffff"
                      strokeWidth="2"
                      filter="url(#glowFilter)"
                    />
                    <circle cx="25" cy="15" r="4" fill="#ef4444" />
                    <circle cx="50" cy="35" r="4" fill="#22d3ee" />
                    <circle cx="75" cy="15" r="4" fill="#ef4444" />
                  </g>
                )}
              </svg>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter">
                  ✨
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tap Action Helper Instructions */}
        <div className="text-center mt-2.5 sm:mt-3 space-y-0.5">
          <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase flex items-center justify-center gap-1.5 flex-wrap">
            <span>💎 +${(currentLevelConfig.tapReward ?? 0.30).toFixed(2)} / Tap</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] sm:text-xs font-black">
              +5₮ ($75.00) every 100 Taps
            </span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Hold or pause tapping to automatically refill your tap cap to {maxTapCap.toLocaleString()}!
          </p>
        </div>
      </div>

      {/* LEVEL STATUS & LIVE PROGRESS INDICATOR BAR */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 my-2 space-y-2.5">
        
        {/* 100-TAP 5₮ MILESTONE CARD */}
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70 border border-emerald-500/40 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl space-y-1.5 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-bold flex-wrap gap-1">
            <span className="text-slate-200 flex items-center gap-1.5 font-black">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>100-Tap Milestone: +5₮ ($75.00) Reward</span>
            </span>
            <span className="text-emerald-300 font-mono font-black text-xs sm:text-sm">
              {totalLifetimeTaps % 100} / 100 Taps ({totalLifetimeTaps % 100}%)
            </span>
          </div>

          <div className="w-full h-2.5 sm:h-3 bg-slate-950 rounded-full border border-emerald-900/60 overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-300 rounded-full transition-all duration-150"
              style={{ width: `${totalLifetimeTaps % 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400">
            <span>Milestone Rate: <strong className="text-emerald-300">5₮ ($75.00) every 100 taps</strong></span>
            <span className="text-cyan-300 font-mono font-bold">
              {100 - (totalLifetimeTaps % 100)} taps to next 5₮ reward
            </span>
          </div>
        </div>

        {/* LEVEL COMPLETION GOAL CARD */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl space-y-2 relative overflow-hidden">
          
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-black">Level {currentLevelConfig.level} Goal Progress</span>
            </span>
            <span className="text-cyan-300 font-mono font-black text-xs sm:text-sm">
              {tapsInCurrentLevel.toLocaleString()} / {currentLevelConfig.requiredTaps.toLocaleString()} Mined ({progressPercent}%)
            </span>
          </div>

          <div className="w-full h-3 sm:h-3.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-200 shadow-md shadow-cyan-500/50 relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/25 -skew-x-12 animate-shimmer" />
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400">
            <span>Rank: <strong className="text-slate-200">{currentLevelConfig.statusTitle}</strong></span>
            <span>
              {remainingTaps === 0 ? (
                <strong className="text-emerald-400 font-bold">✓ LEVEL COMPLETED! ADVANCING...</strong>
              ) : (
                <span><strong className="text-amber-400 font-mono">{remainingTaps.toLocaleString()}</strong> taps remaining to unlock Level {Math.min(15, currentLevelConfig.level + 1)}</span>
              )}
            </span>
          </div>

          <div 
            className="absolute -top-10 right-0 w-48 h-24 blur-3xl pointer-events-none rounded-full"
            style={{ backgroundColor: currentLevelConfig.glowColor }}
          />
        </div>
      </div>

      {/* SPONSOR MONETIZATION STATION */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6">
        <SponsorCarousel
          title="Mining Sponsor Monetization"
          subtitle="Explore sponsor channels to activate mining boosts and bonus drops"
        />
      </div>

      {/* 15 LEVEL MILESTONE MAP FOOTER */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-1">
          <span className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>15-Level GodFather Ascension Roadmap</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">
            Total Mined: ${totalMinedCash.toFixed(2)} USD ({totalLifetimeTaps.toLocaleString()} Taps)
          </span>
        </div>

        {/* Horizontal Level Cards */}
        <div className="flex items-stretch gap-2 sm:gap-2.5 overflow-x-auto pb-2 scrollbar-thin snap-x">
          {MINE_LEVELS.map((lvl) => {
            const isCompleted = isVip || currentLevelConfig.level > lvl.level || (lvl.level === 15 && tapsInCurrentLevel >= lvl.requiredTaps);
            const isCurrent = !isVip && currentLevelConfig.level === lvl.level;
            const isLocked = !isVip && currentLevelConfig.level < lvl.level;

            return (
              <div
                key={lvl.level}
                className={`min-w-[150px] sm:min-w-[170px] p-2.5 sm:p-3 rounded-2xl border transition-all flex flex-col justify-between shrink-0 snap-start relative overflow-hidden ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-lg shadow-cyan-950/60 ring-1 ring-cyan-400/50'
                    : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-slate-300'
                    : 'bg-slate-950/70 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950'
                        : isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      LVL {lvl.level}
                    </span>

                    {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isCurrent && <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />}
                    {isLocked && <Lock className="w-3 h-3 text-slate-600" />}
                  </div>

                  <h5 className={`text-xs font-black truncate ${isCurrent ? 'text-white' : isCompleted ? 'text-slate-200' : 'text-slate-500'}`}>
                    {lvl.name}
                  </h5>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                    <span>{lvl.requiredTaps.toLocaleString()} Taps</span>
                    <span className="text-emerald-400 font-bold">+${(lvl.tapReward ?? 0.30).toFixed(2)}/tap</span>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                  <span className="text-amber-400 font-bold">Bonus: +${lvl.bonusReward}</span>
                  <span className="text-slate-400 text-[9px] truncate max-w-[70px]">{lvl.statusTitle}</span>
                </div>

                {isCurrent && (
                  <div className="absolute top-0 right-0 w-12 h-12 bg-cyan-500/20 blur-lg rounded-full pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SHOUT OF APPRAISAL CELEBRATION MODAL */}
      {completedLevelData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl space-y-4 text-center relative overflow-hidden animate-scale-up">
            
            {/* Top Crown / Diamond Badge */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-200 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center text-3xl">
              {completedLevelData.isGodFather ? '👑' : '💎'}
            </div>

            {/* Shout of Appraisal Heading */}
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-xs uppercase tracking-widest">
                {completedLevelData.isGodFather ? '👑 ULTIMATE ASCENSION' : '🎉 LEVEL COMPLETED!'}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white font-arcade mt-1">
                SHOUT OF APPRAISAL!
              </h3>
              <p className="text-xs text-slate-400">
                You conquered Level {completedLevelData.completedLevel}: <strong className="text-cyan-300">{completedLevelData.levelName}</strong>
              </p>
            </div>

            {/* Appraisal Quote Banner */}
            <div className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-inner text-amber-200 text-sm sm:text-base font-bold italic leading-relaxed">
              "{completedLevelData.appraisalShout}"
            </div>

            {/* Level Bonus Awarded */}
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Level-Up Bonus Awarded</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  +${completedLevelData.bonusReward.toFixed(2)} USD
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Equivalent Points</span>
                <span className="text-sm font-black text-cyan-300 font-mono">
                  +₮{(completedLevelData.bonusReward / 15).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Next Unfolded Level Preview */}
            <div className="text-xs text-slate-300">
              <span>Next Level: </span>
              <strong className="text-cyan-400 font-bold">{completedLevelData.nextLevelName}</strong>
              <span className="block text-[11px] text-slate-400 mt-0.5">The glittering 💎 has expanded in size and power!</span>
            </div>

            {/* Action Continue Button */}
            <button
              onClick={handleCloseAppraisalModal}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>CONTINUE TO LEVEL {completedLevelData.nextLevelNum}</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
          </div>
        </div>
      )}

    </div>
  );
};
