import React, { useState, useEffect, useRef } from 'react';
import { AppView, PlayerStats, UserProfile, DOLLARS_PER_T_POINT, convertDollarsToTPoints } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { AdPlacement, SponsorCarousel } from './AdPlacement';
import { StagesCarousel } from './StagesCarousel';
import { triggerSponsorAd } from '../utils/adManager';
import { 
  Play, 
  Sparkles, 
  Flame, 
  Wallet, 
  Trophy, 
  Gift, 
  Timer, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Zap, 
  Gamepad2, 
  Lock, 
  RotateCw,
  Coins,
  Shield,
  Award,
  TrendingUp,
  Info,
  Layers,
  ArrowRight,
  Tv,
  ExternalLink
} from 'lucide-react';

interface DashboardViewProps {
  user: UserProfile;
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  setCurrentView: (view: AppView) => void;
  onOpenWithdraw: () => void;
  onClaimDaily: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  stats,
  setStats,
  setCurrentView,
  onOpenWithdraw,
  onClaimDaily
}) => {
  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState<number>(0);

  // Bars Carousel Ref for horizontal side-scrolling
  const barsCarouselRef = useRef<HTMLDivElement>(null);

  // Games Carousel Ref for horizontal side-scrolling
  const gamesCarouselRef = useRef<HTMLDivElement>(null);

  // Daily Claim Countdown
  const [timeUntilDailyClaim, setTimeUntilDailyClaim] = useState<number>(0);

  // Calculated ₮ Points: $15.00 = ₮1.00
  const accumulatedTPoints = convertDollarsToTPoints(stats.balance);
  const dollarsIntoCurrentT = stats.balance % DOLLARS_PER_T_POINT;
  const progressToNextTPoint = Math.min(100, Math.round((dollarsIntoCurrentT / DOLLARS_PER_T_POINT) * 100));
  const dollarsNeededForNextT = (DOLLARS_PER_T_POINT - dollarsIntoCurrentT).toFixed(2);
  
  // Progress toward minimum withdrawal (₮40.00 / $600.00)
  const MIN_WITHDRAW_USD = 600;
  const withdrawProgress = Math.min(100, Math.round((stats.balance / MIN_WITHDRAW_USD) * 100));

  const scrollBarsCarousel = (direction: 'left' | 'right') => {
    sound.playClick();
    if (barsCarouselRef.current) {
      const scrollAmount = barsCarouselRef.current.clientWidth * 0.8;
      barsCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollGamesCarousel = (direction: 'left' | 'right') => {
    sound.playClick();
    if (gamesCarouselRef.current) {
      const scrollAmount = gamesCarouselRef.current.clientWidth * 0.75;
      gamesCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      if (!stats.lastDailyClaimTime) {
        setTimeUntilDailyClaim(0);
        return;
      }
      const now = Date.now();
      const nextClaim = stats.lastDailyClaimTime + 24 * 60 * 60 * 1000;
      const diff = Math.max(0, Math.floor((nextClaim - now) / 1000));
      setTimeUntilDailyClaim(diff);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [stats.lastDailyClaimTime]);

  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const featuredSlides = [
    {
      title: '🤝 App Download & Referral Network',
      badge: 'EARN UP TO X1,000 MULTIPLIER',
      badgeColor: 'bg-emerald-400 text-slate-950',
      description: 'Share your personal app download link (bit.ly/3UntvRh)! Earn $0.80 per recruit, unlock up to X1,000 tier multipliers, and get up to $800+ cash rewards.',
      buttonText: 'Get My App Download Link ($800+ Rewards)',
      bgGradient: 'from-emerald-600/35 via-slate-900 to-slate-950',
      borderColor: 'border-emerald-400/50',
      action: () => setCurrentView('PROFILE')
    },
    {
      title: '🏃 Endless Runner Challenge',
      badge: 'HOT • NEW RELEASE',
      badgeColor: 'bg-amber-500 text-slate-950',
      description: 'Navigate 5 hard worlds, dodge spikes & laser gates. Collect $30 cash + $3 distance milestone. Beware of -$0.80 obstacle hit penalties!',
      buttonText: 'Enter Runner Arena ($33 Max Win)',
      bgGradient: 'from-amber-600/30 via-slate-900 to-slate-950',
      borderColor: 'border-amber-500/40',
      action: () => setCurrentView('GAME_RUNNER')
    },
    {
      title: '🥚 Crack Egg Matrix (1-Hour Challenge)',
      badge: 'DOUBLE-TAP CRACK',
      badgeColor: 'bg-emerald-500 text-slate-950',
      description: 'Double-tap matrix eggs across 10 progressive levels (100 eggs/lvl) to crack them open and claim the $100 Grand Celestial Jackpot!',
      buttonText: 'Start Crack Egg ($100 Jackpot)',
      bgGradient: 'from-emerald-600/30 via-slate-900 to-slate-950',
      borderColor: 'border-emerald-500/40',
      action: () => setCurrentView('GAME_SCRATCH')
    },
    {
      title: '❌⭕ Tic Tac Toe Neural AI',
      badge: '100% INTELLIGENCE',
      badgeColor: 'bg-cyan-500 text-slate-950',
      description: 'Face off against 15 escalating minimax neural AI opponents. Doubling rewards from $0.20 up to $50.00 cash per victory!',
      buttonText: 'Play Tic Tac Toe ($50 Payout)',
      bgGradient: 'from-cyan-600/30 via-slate-900 to-slate-950',
      borderColor: 'border-cyan-500/40',
      action: () => setCurrentView('GAME_TICTACTOE')
    }
  ];

  const allGames = [
    {
      id: 'mine',
      title: 'Diamond Mine (Tap to Win)',
      icon: '💎',
      tag: '$0.3 PER TAP',
      tagColor: 'bg-cyan-500 text-slate-950 font-black',
      reward: '+$0.30 Cash per Tap • 15 Levels',
      description: 'Tap the glittering diamond to mine $0.30 USD (₮0.02) per tap. Progress across 15 levels up to GodFather!',
      action: () => setCurrentView('MINE')
    },
    {
      id: 'runner',
      title: 'Endless Runner Challenge',
      icon: '🏃',
      tag: 'HOT',
      tagColor: 'bg-amber-500 text-slate-950',
      reward: 'Up to $33.00 (₮2.20)',
      description: '5 Themed Worlds, $30 collect + $3 bonus, -$0.80 penalty, Hero skins & speedrun leaderboard.',
      action: () => setCurrentView('GAME_RUNNER')
    },
    {
      id: 'memory',
      title: 'Memory Match Challenge',
      icon: '🧠',
      tag: 'CLASSIC',
      tagColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      reward: '+$0.50 to $1.50',
      description: 'Standard (4x4) & Expert (6x4) card memory tests with cyber, crypto, and arcade themes.',
      action: () => setCurrentView('GAME_MEMORY')
    },
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe AI Arena',
      icon: '❌⭕',
      tag: '100% SMART',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      reward: 'Up to $50.00 (₮3.33)',
      description: 'Progressive AI challenge. Beat 15 smart bot masters to claim escalating cash multipliers.',
      action: () => setCurrentView('GAME_TICTACTOE')
    },
    {
      id: 'numbers',
      title: 'Catch Numbers (3s Reflex)',
      icon: '🔢',
      tag: 'FAST RUSH',
      tagColor: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      reward: '+$0.40 Instant',
      description: 'Rapid reflex test. Tap falling target numbers before the 3-second clock expires.',
      action: () => setCurrentView('GAME_NUMBERS')
    },
    {
      id: 'spelling',
      title: 'Spelling Challenge (3s Rush)',
      icon: '🔤',
      tag: 'TYPING',
      tagColor: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      reward: '+$0.35 Instant',
      description: 'Rapid keyboard agility. Spell target cyber & crypto words under 3 seconds.',
      action: () => setCurrentView('GAME_SPELLING')
    },
    {
      id: 'scratch',
      title: 'Crack Egg Matrix',
      icon: '🥚',
      tag: '$100 JACKPOT',
      tagColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      reward: '+$0.50 to $100.00 (₮6.67)',
      description: '1-Hour Marathon: Double-tap 10 Levels x 100 Eggs. Crack open shells to find cash and golden egg rewards.',
      action: () => setCurrentView('GAME_SCRATCH')
    },
    {
      id: 'spin',
      title: 'Lucky Wheel Spin',
      icon: '🎡',
      tag: 'DAILY PLAY',
      tagColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      reward: 'Up to $25.00 (₮1.67)',
      description: 'Spin the dynamic prize wheel daily for guaranteed instant cash prizes.',
      action: () => setCurrentView('GAME_SPIN')
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* CAROUSEL SIDE SCROLL: CASH BALANCE & ACCUMULATED ₮ POINTS BARS IN SAME LINE */}
      <div className="space-y-2.5">
        {/* Carousel Header with Navigation Controls */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Balance & Point Trackers</span>
            </h3>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hidden xs:inline-flex items-center gap-1">
              <span>⇄</span> Carousel Side Scroll
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scrollBarsCarousel('left')}
              title="Scroll Left"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollBarsCarousel('right')}
              title="Scroll Right"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center shadow-sm active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Carousel Track: Both Bars in the Same Line Separated by Space */}
        <div 
          ref={barsCarouselRef}
          className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth scrollbar-thin"
        >
          {/* BAR 1: CASH BALANCE & PAYOUT PROGRESS BAR */}
          <div 
            id="cash-balance-bar-card"
            className="flex-1 min-w-[300px] sm:min-w-[420px] md:min-w-[460px] shrink-0 snap-start bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-3.5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 flex-wrap">
                      <span>Cash Balance Bar</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        USD Wallet
                      </span>
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400">Withdrawal qualification threshold ($600 Min)</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold block">Available</span>
                  <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
                    ${stats.balance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress to $600 Payout Bar */}
              <div className="space-y-1.5 p-3 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Payout Threshold Progress</span>
                  </span>
                  <span className="text-emerald-300 font-black font-mono">
                    {withdrawProgress}% (${stats.balance.toFixed(2)} / $600.00)
                  </span>
                </div>

                {/* Visual Bar Track */}
                <div className="w-full h-2.5 sm:h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                    style={{ width: `${withdrawProgress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Min Floor: $600.00</span>
                  <span>
                    {stats.balance >= MIN_WITHDRAW_USD ? (
                      <strong className="text-emerald-400">✓ Ready to Cash Out</strong>
                    ) : (
                      `$${(MIN_WITHDRAW_USD - stats.balance).toFixed(2)} more to unlock`
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Policy */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <div className="text-[10px] text-slate-400">
                <span>Fee: <strong className="text-amber-400">0.50%</strong> · Max: <strong className="text-slate-300">$1,000/tx</strong></span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenWithdraw();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Request Payout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* BAR 2: ACCUMULATED ₮ POINTS & CONVERSION BAR */}
          <div 
            id="accumulated-points-bar-card"
            className="flex-1 min-w-[300px] sm:min-w-[420px] md:min-w-[460px] shrink-0 snap-start bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3 sm:space-y-3.5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black text-lg shrink-0 shadow-inner">
                    ₮
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5 flex-wrap">
                      <span>Accumulated ₮ Points Bar</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        $15.00 = ₮1.00
                      </span>
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-400">Real-time reward points calculated from games</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold block">Points Balance</span>
                  <span className="text-lg sm:text-xl font-black text-cyan-400 font-mono">
                    ₮{accumulatedTPoints.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress to Next ₮1.00 Bar */}
              <div className="space-y-1.5 p-3 rounded-xl sm:rounded-2xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Progress to Next ₮1.00 Point</span>
                  </span>
                  <span className="text-cyan-300 font-black font-mono">
                    {progressToNextTPoint}% (${dollarsIntoCurrentT.toFixed(2)} / $15.00)
                  </span>
                </div>

                {/* Visual Bar Track */}
                <div className="w-full h-2.5 sm:h-3 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
                    style={{ width: `${progressToNextTPoint}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Current: ₮{Math.floor(accumulatedTPoints)}</span>
                  <span>+${dollarsNeededForNextT} for ₮{(Math.floor(accumulatedTPoints) + 1).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Milestones Track in the card */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-center">
              {[
                { label: '₮1.00', usd: '$15', target: 1 },
                { label: '₮10.00', usd: '$150', target: 10 },
                { label: '₮25.00', usd: '$375', target: 25 },
                { label: '₮40.00', usd: '$600', target: 40 }
              ].map((m, idx) => {
                const reached = accumulatedTPoints >= m.target;
                return (
                  <div 
                    key={idx}
                    className={`flex-1 px-1 py-1 rounded-lg border text-[9px] ${
                      reached 
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="font-bold truncate">{m.label}</div>
                    <div className="text-[8px] text-slate-400">{m.usd}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Daily $1.00 Claim Card */}
      <div className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-lg">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-xl border border-purple-500/40 shadow-inner shrink-0">
            🎁
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">Daily $1.00 Cash Bonus (₮0.07)</h3>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">
                24H STREAK
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Claim $1.00 every 24 hours to automatically boost your cash balance and ₮ points.
            </p>
          </div>
        </div>

        <div>
          {timeUntilDailyClaim > 0 ? (
            <button
              disabled
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-not-allowed opacity-80 whitespace-nowrap"
            >
              <Timer className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
              <span>Next Claim: {formatCountdown(timeUntilDailyClaim)}</span>
            </button>
          ) : (
            <button
              id="dash-daily-claim-btn"
              onClick={() => {
                sound.playWin();
                confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
                onClaimDaily();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Gift className="w-4 h-4" />
              <span>Claim Daily $1.00 Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Carousel (Compact & Refined Size) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Featured Tournaments & Events</span>
          </h3>
          <div className="flex items-center gap-1">
            {featuredSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  carouselIndex === idx ? 'w-4 bg-emerald-400' : 'w-1.5 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Compact Slide Card */}
        <div
          className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${featuredSlides[carouselIndex].borderColor} bg-gradient-to-r ${featuredSlides[carouselIndex].bgGradient} shadow-md transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3`}
        >
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5">
              <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.2 rounded ${featuredSlides[carouselIndex].badgeColor}`}>
                {featuredSlides[carouselIndex].badge}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-black text-white leading-tight">
              {featuredSlides[carouselIndex].title}
            </h4>
            <p className="text-[10px] sm:text-[11px] text-slate-300 leading-snug line-clamp-2">
              {featuredSlides[carouselIndex].description}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              featuredSlides[carouselIndex].action();
            }}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 font-black text-[10px] sm:text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{featuredSlides[carouselIndex].buttonText}</span>
          </button>
        </div>
      </div>

      {/* 15 STAGES PROGRESSION SIDE SLIDE CAROUSEL (Stage 1 Active, Stages 2-15 Coming Soon) */}
      <StagesCarousel
        onSelectActiveStage={() => {
          if (gamesCarouselRef.current) {
            gamesCarouselRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }}
      />

      {/* Featured Sponsor Monetization Side Slide Carousel (Tags 458074 & 458075) */}
      <SponsorCarousel
        title="Featured Sponsor Networks"
        subtitle="Explore verified sponsor partners & boost cash rewards"
      />

      {/* Side Slide Carousel of All Arcade Games */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>All Arcade Mini-Games</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden xs:inline-flex items-center gap-1 font-bold">
              <span>{allGames.length} Games</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 hidden sm:inline-flex items-center gap-1 font-medium mr-1">
              <span>⇄ Slide to explore</span>
            </span>
            <button
              onClick={() => scrollGamesCarousel('left')}
              title="Scroll Games Left"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => scrollGamesCarousel('right')}
              title="Scroll Games Right"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center shadow-sm active:scale-95"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Side Slide Horizontal Carousel */}
        <div
          ref={gamesCarouselRef}
          className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-2.5 pt-1 px-1 scroll-smooth snap-x snap-mandatory select-none"
          style={{ scrollbarWidth: 'thin' }}
        >
          {allGames.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                sound.playClick();
                game.action();
              }}
              className="group w-[175px] sm:w-[195px] shrink-0 snap-start bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl sm:rounded-2xl p-3 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer flex flex-col justify-between space-y-2.5 relative overflow-hidden active:scale-98"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-700 transition-colors shadow-sm shrink-0">
                    {game.icon}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded truncate max-w-[100px] ${game.tagColor}`}>
                    {game.tag}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-white mt-2 group-hover:text-emerald-300 transition-colors truncate">
                  {game.title}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-tight">
                  {game.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 gap-1.5">
                <div className="min-w-0 flex-1">
                  <span className="text-[8px] text-slate-500 uppercase font-bold block leading-none">Reward Pool</span>
                  <strong className="text-emerald-400 font-black text-[10px] sm:text-[11px] truncate block mt-0.5">
                    {game.reward}
                  </strong>
                </div>

                <div className="w-6 h-6 rounded-md bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all shrink-0 shadow-sm">
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
