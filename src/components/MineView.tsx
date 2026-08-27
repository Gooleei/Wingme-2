import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerStats, UserProfile, DOLLARS_PER_T_POINT, convertDollarsToTPoints } from '../types';
import { MINE_LEVELS } from '../data/gameData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { AdPlacement, SponsorCarousel } from './AdPlacement';
import { triggerSponsorAd } from '../utils/adManager';
import { 
  Sparkles, 
  Flame, 
  Trophy, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Wallet, 
  Crown, 
  Lock, 
  CheckCircle2, 
  Zap, 
  ChevronRight, 
  Award,
  TrendingUp,
  Coins,
  ShieldCheck,
  Star,
  Tv,
  ExternalLink
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
  onBack,
  soundOn,
  setSoundOn,
  onOpenWithdraw
}) => {
  // Extract or initialize Mine Progress
  const currentLevelIndex = Math.min(
    14,
    Math.max(0, (stats.mineProgress?.currentLevel ?? 1) - 1)
  );
  
  const currentLevelConfig = MINE_LEVELS[currentLevelIndex] || MINE_LEVELS[0];
  
  const [tapsInCurrentLevel, setTapsInCurrentLevel] = useState<number>(
    stats.mineProgress?.tapsInLevel ?? 0
  );
  const [totalLifetimeTaps, setTotalLifetimeTaps] = useState<number>(
    stats.mineProgress?.totalTaps ?? 0
  );
  const [totalMinedCash, setTotalMinedCash] = useState<number>(
    stats.mineProgress?.totalEarnedCash ?? 0
  );
  
  // Dynamic Tap Animation State
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
    nextLevelName: string;
    isGodFather: boolean;
  } | null>(null);

  const gemRef = useRef<HTMLDivElement>(null);
  const comboTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync internal state if props change externally
  useEffect(() => {
    if (stats.mineProgress) {
      setTapsInCurrentLevel(stats.mineProgress.tapsInLevel);
      setTotalLifetimeTaps(stats.mineProgress.totalTaps);
      setTotalMinedCash(stats.mineProgress.totalEarnedCash);
    }
  }, [stats.mineProgress?.currentLevel]);

  // Calculate Taps Per Second for speedometer
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const valid = recentTapTimestamps.filter(t => now - t <= 1000);
      setTapsPerSec(valid.length);
      setRecentTapTimestamps(valid);
    }, 400);

    return () => clearInterval(interval);
  }, [recentTapTimestamps]);

  // Progress Calculation
  const progressRatio = currentLevelConfig.requiredTaps > 0 
    ? Math.min(1, tapsInCurrentLevel / currentLevelConfig.requiredTaps) 
    : 0;
  const progressPercent = Math.min(100, Math.round(progressRatio * 100));
  const remainingTaps = Math.max(0, currentLevelConfig.requiredTaps - tapsInCurrentLevel);

  // Dynamic Scale Factor: Gem starts at 1.0x and expands smoothly up to 1.75x as progress reaches 100%
  const dynamicGrowthScale = 1 + progressRatio * 0.75;
  const renderedScale = isSquished ? dynamicGrowthScale * 0.92 : dynamicGrowthScale;

  // Handle Level Completion and Shout of Appraisal
  const triggerLevelCompletion = useCallback((finishedLevelNum: number) => {
    const finishedConfig = MINE_LEVELS[finishedLevelNum - 1] || currentLevelConfig;
    const isGodFatherLevel = finishedLevelNum >= 15;
    const nextLevelNum = Math.min(15, finishedLevelNum + 1);
    const nextConfig = MINE_LEVELS[nextLevelNum - 1];

    // Fire sound & massive confetti
    sound.playLevelUpAppraisal();
    confetti({
      particleCount: isGodFatherLevel ? 250 : 150,
      spread: 100,
      origin: { y: 0.55 },
      colors: ['#22d3ee', '#fbbf24', '#f43f5e', '#10b981', '#a855f7', '#ffffff']
    });

    // Set appraisal data modal
    setCompletedLevelData({
      completedLevel: finishedLevelNum,
      levelName: finishedConfig.name,
      appraisalShout: finishedConfig.appraisalShout,
      bonusReward: finishedConfig.bonusReward,
      nextLevelName: nextConfig.name,
      isGodFather: isGodFatherLevel
    });

    // Main Tap Handler: Add dynamic tapReward (starts $0.30 and scales +20% per level)
    const tapRewardAmount = currentLevelConfig.tapReward ?? 0.30;

    // Apply completion to player stats
    setStats(prev => {
      const updatedBalance = +(prev.balance + finishedConfig.bonusReward).toFixed(2);
      return {
        ...prev,
        balance: updatedBalance,
        totalCashEarned: +(prev.totalCashEarned + finishedConfig.bonusReward).toFixed(2),
        mineProgress: {
          currentLevel: isGodFatherLevel ? 15 : nextLevelNum,
          tapsInLevel: 0,
          totalTaps: (prev.mineProgress?.totalTaps ?? 0) + 1,
          totalEarnedCash: +((prev.mineProgress?.totalEarnedCash ?? 0) + tapRewardAmount + finishedConfig.bonusReward).toFixed(2),
          highestLevelUnlocked: Math.max(prev.mineProgress?.highestLevelUnlocked ?? 1, nextLevelNum)
        }
      };
    });

    setTapsInCurrentLevel(0);
  }, [currentLevelConfig, setStats]);

  // Main Tap Handler: Add tapReward ($0.30 scaled +20% each level)
  const handleDiamondTap = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    // Prevent zoom/scroll defaults on rapid multi-touch
    if ('touches' in e && e.cancelable) {
      // standard touch
    }

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

    // Register timestamp for Taps/Sec
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

    // Add slight random jitter
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

    const nextTapsInLevel = tapsInCurrentLevel + 1;
    const nextTotalTaps = totalLifetimeTaps + 1;
    const nextMinedCash = +(totalMinedCash + activeTapReward).toFixed(2);

    setTapsInCurrentLevel(nextTapsInLevel);
    setTotalLifetimeTaps(nextTotalTaps);
    setTotalMinedCash(nextMinedCash);

    // Check Level Progression
    if (nextTapsInLevel >= currentLevelConfig.requiredTaps) {
      triggerLevelCompletion(currentLevelConfig.level);
    } else {
      // Synchronize active tap reward to PlayerStats Balance
      setStats(prev => {
        const newBal = +(prev.balance + activeTapReward).toFixed(2);
        return {
          ...prev,
          balance: newBal,
          totalCashEarned: +(prev.totalCashEarned + activeTapReward).toFixed(2),
          mineProgress: {
            currentLevel: prev.mineProgress?.currentLevel ?? 1,
            tapsInLevel: nextTapsInLevel,
            totalTaps: nextTotalTaps,
            totalEarnedCash: nextMinedCash,
            highestLevelUnlocked: Math.max(prev.mineProgress?.highestLevelUnlocked ?? 1, prev.mineProgress?.currentLevel ?? 1)
          }
        };
      });
    }
  }, [tapsInCurrentLevel, totalLifetimeTaps, totalMinedCash, currentLevelConfig, setStats, triggerLevelCompletion]);

  // Close Appraisal Celebration Modal
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

      {/* MAIN MINE SECTION CONTENT */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 pt-3 sm:pt-4 space-y-3">
        {/* Compact Level Title Banner */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3 h-3 text-cyan-400" />
              LVL {currentLevelConfig.level} / 15
            </span>
            <span className="text-sm sm:text-base font-black text-white">
              {currentLevelConfig.name}
            </span>
            {currentLevelConfig.level === 15 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center gap-1 animate-pulse">
                <Crown className="w-3 h-3" /> GODFATHER
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
      </div>

      {/* CENTER GLITTERING 💎 TAP TO WIN STAGE (EXPANDS IN REAL-TIME AS PLAYER TAPS) */}
      <div className="max-w-xl mx-auto w-full px-4 py-3 sm:py-6 flex flex-col items-center justify-center relative my-auto">
        
        {/* Combo & Speedometer Floating Badges */}
        <div className="flex items-center gap-3 mb-2 sm:mb-4">
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
        <div className="relative flex items-center justify-center min-h-[220px] sm:min-h-[280px] w-full">
          
          {/* Outer Pulsing Aura (Enlarges with tapping progress) */}
          <div 
            className="absolute rounded-full blur-3xl opacity-70 animate-pulse transition-all duration-300 pointer-events-none"
            style={{
              width: `${(140 + currentLevelConfig.level * 10) * (1 + progressRatio * 0.5)}px`,
              height: `${(140 + currentLevelConfig.level * 10) * (1 + progressRatio * 0.5)}px`,
              backgroundColor: currentLevelConfig.accentColor
            }}
          />

          {/* Rotating Light Rings (Expands with tapping progress) */}
          <div 
            className="absolute rounded-full border border-dashed border-cyan-400/40 animate-spin-slow pointer-events-none transition-all duration-300"
            style={{
              width: `${(160 + currentLevelConfig.level * 10) * (1 + progressRatio * 0.45)}px`,
              height: `${(160 + currentLevelConfig.level * 10) * (1 + progressRatio * 0.45)}px`
            }}
          />

          {/* THE ROUND GLITTERING 💎 (DYNAMICALLY ENLARGES ON TAP) */}
          <div
            ref={gemRef}
            id="mine-glittering-gem"
            onClick={handleDiamondTap}
            onTouchStart={handleDiamondTap}
            title="Tap the Glittering Diamond to Earn +$0.30!"
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
                  {/* Gem Multi-Gradients */}
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
                {/* Top Crown Facets */}
                <polygon points="100,20 135,55 65,55" fill="url(#facetHighlight)" opacity="0.6" />
                <polygon points="65,55 135,55 100,100" fill="#ffffff" opacity="0.25" />
                
                {/* Side Triangular Facets */}
                <polygon points="100,20 165,70 135,55" fill="#ffffff" opacity="0.4" />
                <polygon points="100,20 35,70 65,55" fill="#ffffff" opacity="0.5" />
                
                {/* Center Star Core */}
                <polygon points="100,60 140,100 100,140 60,100" fill="#ffffff" opacity="0.3" />
                
                {/* Bottom Pavilion Facets */}
                <polygon points="140,100 100,180 100,140" fill="#0369a1" opacity="0.5" />
                <polygon points="60,100 100,180 100,140" fill="#075985" opacity="0.6" />
                <polygon points="35,70 60,100 100,180 20,100" fill="#0c4a6e" opacity="0.7" />
                <polygon points="165,70 140,100 100,180 180,100" fill="#0284c7" opacity="0.6" />

                {/* Central Brilliant Star Glint */}
                <circle cx="100" cy="100" r="14" fill="#ffffff" opacity="0.75" filter="url(#glowFilter)" />
                <polygon points="100,78 104,96 122,100 104,104 100,122 96,104 78,100 96,96" fill="#ffffff" opacity="0.9" />

                {/* Shimmering Specular Sparkle Accents */}
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

              {/* Central Diamond Emoji & Level Size Shimmer */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-3xl sm:text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter">
                  ✨
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tap Action Helper Instructions */}
        <div className="text-center mt-3 sm:mt-4 space-y-0.5">
          <p className="text-xs sm:text-sm font-black text-amber-300 tracking-wide uppercase flex items-center justify-center gap-1.5">
            <span>💎 Tap the Gem to Mine (+${(currentLevelConfig.tapReward ?? 0.30).toFixed(2)} / tap) 💎</span>
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400">
            Reward grows +20% on every level! Watch the diamond expand with every tap!
          </p>
        </div>
      </div>

      {/* SHIFTED DOWN: LEVEL STATUS & LIVE PROGRESS INDICATOR BAR */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6 my-2 space-y-3">
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-xl space-y-2 sm:space-y-2.5 relative overflow-hidden">
          
          {/* Progress Header */}
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-black">Level {currentLevelConfig.level} Progress</span>
            </span>
            <span className="text-cyan-300 font-mono font-black text-xs sm:text-sm">
              {tapsInCurrentLevel.toLocaleString()} / {currentLevelConfig.requiredTaps.toLocaleString()} Taps ({progressPercent}%)
            </span>
          </div>

          {/* Visual Track */}
          <div className="w-full h-3 sm:h-3.5 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-200 shadow-md shadow-cyan-500/50 relative overflow-hidden"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Animated Shimmer Bar */}
              <div className="absolute inset-0 bg-white/25 -skew-x-12 animate-shimmer" />
            </div>
          </div>

          {/* Subtext info */}
          <div className="flex justify-between items-center text-[10px] sm:text-[11px] text-slate-400">
            <span>Rank: <strong className="text-slate-200">{currentLevelConfig.statusTitle}</strong></span>
            <span>
              {remainingTaps === 0 ? (
                <strong className="text-emerald-400 font-bold">✓ LEVEL COMPLETED!</strong>
              ) : (
                <span><strong className="text-amber-400 font-mono">{remainingTaps.toLocaleString()}</strong> taps remaining to unlock Level {Math.min(15, currentLevelConfig.level + 1)}</span>
              )}
            </span>
          </div>

          {/* Subtle Ambient Glow */}
          <div 
            className="absolute -top-10 right-0 w-48 h-24 blur-3xl pointer-events-none rounded-full"
            style={{ backgroundColor: currentLevelConfig.glowColor }}
          />
        </div>
      </div>

      {/* SPONSOR MONETIZATION STATION (TAGS 458074 & 458075) */}
      <div className="max-w-4xl mx-auto w-full px-3 sm:px-6">
        <SponsorCarousel
          title="Mining Sponsor Monetization"
          subtitle="Explore sponsor channels to activate mining boosts and bonus drops"
        />
      </div>

      {/* 15 LEVEL MILESTONE MAP FOOTER (SCROLLABLE ROADMAP) */}
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
            const isCompleted = currentLevelConfig.level > lvl.level;
            const isCurrent = currentLevelConfig.level === lvl.level;
            const isLocked = currentLevelConfig.level < lvl.level;

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
              <span>Next Unfolded Level: </span>
              <strong className="text-cyan-400 font-bold">{completedLevelData.nextLevelName}</strong>
              <span className="block text-[11px] text-slate-400 mt-0.5">The glittering 💎 has grown larger in physical size!</span>
            </div>

            {/* Action Continue Button */}
            <button
              onClick={handleCloseAppraisalModal}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 hover:from-amber-300 hover:to-cyan-300 text-slate-950 font-black text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <span>CONTINUE MINING</span>
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
