import React, { useState, useEffect, useRef } from 'react';
import { AppView, PlayerStats, UserProfile, DOLLARS_PER_T_POINT, convertDollarsToTPoints } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { AdPlacement, SponsorCarousel } from './AdPlacement';
import { StagesCarousel } from './StagesCarousel';
import { triggerSponsorAd } from '../utils/adManager';
import { formatCurrency, formatPoints, formatCompactFigure } from '../utils/formatters';
import { isVIPUser, isGameCompletedForUser } from '../utils/accountManager';
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
  ExternalLink,
  Gem
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
  const [completedModalInfo, setCompletedModalInfo] = useState<{
    title: string;
    icon: string;
    status: string;
    reward: string;
    description: string;
  } | null>(null);

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
      title: '📢 Stage 1 Conclusion: 8th September, 2026',
      badge: 'OFFICIAL NOTICE',
      badgeColor: 'bg-rose-500 text-white font-black',
      description: 'Notice to all players: Stage 1 of the Bellmont project concludes on 8th September, 2026. Maximize your gameplay earnings, mining rewards, and referral network bonuses now!',
      buttonText: 'View Stage 1 Countdown & Info',
      bgGradient: 'from-rose-600/35 via-slate-900 to-slate-950',
      borderColor: 'border-rose-500/50',
      action: () => {
        const stageElem = document.getElementById('stages-progression-section');
        if (stageElem) {
          stageElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    },
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

  // Auto-slide Featured Tournaments & Events section every second (1000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % featuredSlides.length);
    }, 1000);
    return () => clearInterval(timer);
  }, [featuredSlides.length]);

  const isVip = isVIPUser(user);

  // Dynamic game completion check:
  // For the VIP user (@Op9q / qintoya@gmail.com): All games are completed and closed
  // For all other users: Each player has their own individual account progress and games remain open until they finish
  const isMineCompleted = isGameCompletedForUser(user, stats, 'mine');
  const isRunnerCompleted = isGameCompletedForUser(user, stats, 'runner');
  const isMemoryCompleted = isGameCompletedForUser(user, stats, 'memory');
  const isTicTacToeCompleted = isGameCompletedForUser(user, stats, 'tictactoe');
  const isNumbersCompleted = isGameCompletedForUser(user, stats, 'numbers');
  const isSpellingCompleted = isGameCompletedForUser(user, stats, 'spelling');
  const isScratchCompleted = isGameCompletedForUser(user, stats, 'scratch');
  const isSpinCompleted = isGameCompletedForUser(user, stats, 'spin');

  const allGames = [
    {
      id: 'mine',
      title: 'Diamond Mine (Tap to Win)',
      icon: '💎',
      tag: isMineCompleted ? '✓ COMPLETED' : '$0.3 PER TAP',
      tagColor: isMineCompleted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-cyan-500 text-slate-950 font-black',
      reward: '+$0.30 Cash per Tap • 15 Levels',
      completedStatus: isMineCompleted ? '✓ Level 15 GodFather Completed' : null,
      isCompleted: isMineCompleted,
      description: 'Tap the glittering diamond to mine $0.30 USD (₮0.02) per tap. Progress across 15 levels up to GodFather!',
      action: () => setCurrentView('MINE')
    },
    {
      id: 'runner',
      title: 'Endless Runner Challenge',
      icon: '🏃',
      tag: isRunnerCompleted ? '✓ COMPLETED' : 'HOT',
      tagColor: isRunnerCompleted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-amber-500 text-slate-950',
      reward: 'Up to $33.00 (₮2.20)',
      completedStatus: isRunnerCompleted ? '✓ All 5 Worlds Completed' : null,
      isCompleted: isRunnerCompleted,
      description: '5 Themed Worlds, $30 collect + $3 bonus, -$0.80 penalty, Hero skins & speedrun leaderboard.',
      action: () => setCurrentView('GAME_RUNNER')
    },
    {
      id: 'memory',
      title: 'Memory Match Challenge',
      icon: '🧠',
      tag: isMemoryCompleted ? '✓ COMPLETED' : 'CLASSIC',
      tagColor: isMemoryCompleted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
      reward: '+$0.50 to $1.50',
      completedStatus: isMemoryCompleted ? '✓ Expert 6x4 Cleared' : null,
      isCompleted: isMemoryCompleted,
      description: 'Standard (4x4) & Expert (6x4) card memory tests with cyber, crypto, and arcade themes.',
      action: () => setCurrentView('GAME_MEMORY')
    },
    {
      id: 'tictactoe',
      title: 'Tic Tac Toe AI Arena',
      icon: '❌⭕',
      tag: isTicTacToeCompleted ? '✓ COMPLETED' : '100% SMART',
      tagColor: isTicTacToeCompleted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      reward: 'Up to $50.00 (₮3.33)',
      completedStatus: isTicTacToeCompleted ? '✓ 15 AI Masters Defeated' : null,
      isCompleted: isTicTacToeCompleted,
      description: 'Progressive AI challenge. Beat 15 smart bot masters to claim escalating cash multipliers.',
      action: () => setCurrentView('GAME_TICTACTOE')
    },
    {
      id: 'numbers',
      title: 'Catch Numbers (3s Reflex)',
      icon: '🔢',
      tag: isNumbersCompleted ? '✓ COMPLETED' : 'FAST RUSH',
      tagColor: isNumbersCompleted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
      reward: '+$0.40 Instant',
      completedStatus: isNumbersCompleted ? '✓ 100% Reflex Cleared' : null,
      isCompleted: isNumbersCompleted,
      description: 'Rapid reflex test. Tap falling target numbers before the 3-second clock expires.',
      action: () => setCurrentView('GAME_NUMBERS')
    },
    {
      id: 'spelling',
      title: 'Spelling Challenge (3s Rush)',
      icon: '🔤',
      tag: isSpellingCompleted ? '✓ COMPLETED' : 'TYPING',
      tagColor: isSpellingCompleted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
      reward: '+$0.35 Instant',
      completedStatus: isSpellingCompleted ? '✓ Master Typist Cleared' : null,
      isCompleted: isSpellingCompleted,
      description: 'Rapid keyboard agility. Spell target cyber & crypto words under 3 seconds.',
      action: () => setCurrentView('GAME_SPELLING')
    },
    {
      id: 'scratch',
      title: 'Crack Egg Matrix',
      icon: '🥚',
      tag: isScratchCompleted ? '✓ COMPLETED' : '$100 JACKPOT',
      tagColor: isScratchCompleted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      reward: '+$0.50 to $100.00 (₮6.67)',
      completedStatus: isScratchCompleted ? '✓ $100 Jackpot Completed' : null,
      isCompleted: isScratchCompleted,
      description: '1-Hour Marathon: Double-tap 10 Levels x 100 Eggs. Crack open shells to find cash and golden egg rewards.',
      action: () => setCurrentView('GAME_SCRATCH')
    },
    {
      id: 'spin',
      title: 'Lucky Wheel Spin',
      icon: '🎡',
      tag: isSpinCompleted ? '✓ COMPLETED' : 'DAILY PLAY',
      tagColor: isSpinCompleted ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      reward: 'Up to $25.00 (₮1.67)',
      completedStatus: isSpinCompleted ? '✓ Daily Jackpot Claimed' : null,
      isCompleted: isSpinCompleted,
      description: 'Spin the dynamic prize wheel daily for guaranteed instant cash prizes.',
      action: () => setCurrentView('GAME_SPIN')
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      {/* CAROUSEL SIDE SCROLL: BALANCE, POINTS & DIAMONDS TRACKERS (COMPACT SIZE) */}
      <div className="space-y-2">
        {/* Carousel Header with Navigation Controls */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <h3 className="text-xs sm:text-[13px] font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Balance & Point Trackers</span>
            </h3>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 border border-slate-700 hidden xs:inline-flex items-center gap-1">
              <span>⇄ 3 Slides</span>
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => scrollBarsCarousel('left')}
              title="Scroll Left"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center shadow-sm active:scale-95"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <button
              onClick={() => scrollBarsCarousel('right')}
              title="Scroll Right"
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center shadow-sm active:scale-95"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Carousel Track: 3 Slides (Cash, ₮ Points, Diamonds Gained) */}
        <div 
          ref={barsCarouselRef}
          className="flex items-stretch gap-2.5 sm:gap-3 overflow-x-auto pb-1.5 snap-x snap-mandatory scroll-smooth scrollbar-thin"
        >
          {/* SLIDE 1: CASH BALANCE & PAYOUT PROGRESS BAR */}
          <div 
            id="cash-balance-bar-card"
            className="flex-1 min-w-[270px] sm:min-w-[320px] md:min-w-[340px] shrink-0 snap-start bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-lg space-y-2.5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                    <Wallet className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1 flex-wrap leading-tight">
                      <span>Cash Balance</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                        USD Wallet
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight">Threshold: $600.00 Min Payout</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold block leading-none">Available</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                    {formatCurrency(stats.balance)}
                  </span>
                </div>
              </div>

              {/* Progress to $600 Payout Bar */}
              <div className="space-y-1 p-2 rounded-lg sm:rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    <span>Payout Threshold</span>
                  </span>
                  <span className="text-emerald-300 font-black font-mono">
                    {withdrawProgress}% ({formatCurrency(stats.balance)} / $600)
                  </span>
                </div>

                {/* Visual Bar Track */}
                <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                    style={{ width: `${withdrawProgress}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>Min: $600.00</span>
                  <span>
                    {stats.balance >= MIN_WITHDRAW_USD ? (
                      <strong className="text-emerald-400">✓ Ready to Withdraw</strong>
                    ) : (
                      `$${(MIN_WITHDRAW_USD - stats.balance).toFixed(2)} to unlock`
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions & Policy */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
              <div className="text-[9px] text-slate-400">
                <span>Fee: <strong className="text-amber-400">0.50%</strong></span>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenWithdraw();
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] transition-all shadow-sm cursor-pointer flex items-center gap-1 shrink-0 active:scale-95"
              >
                <span>Request Payout</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* SLIDE 2: ACCUMULATED ₮ POINTS & CONVERSION BAR */}
          <div 
            id="accumulated-points-bar-card"
            className="flex-1 min-w-[270px] sm:min-w-[320px] md:min-w-[340px] shrink-0 snap-start bg-gradient-to-br from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-lg space-y-2.5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-black text-sm shrink-0 shadow-inner">
                    ₮
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1 flex-wrap leading-tight">
                      <span>₮ Points Bar</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        $15.00 = ₮1.00
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight">Calculated live from gameplay earnings</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold block leading-none">Points</span>
                  <span className="text-base sm:text-lg font-black text-cyan-400 font-mono">
                    {formatPoints(accumulatedTPoints)}
                  </span>
                </div>
              </div>

              {/* Progress to Next ₮1.00 Bar */}
              <div className="space-y-1 p-2 rounded-lg sm:rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span>Progress to Next ₮1.00</span>
                  </span>
                  <span className="text-cyan-300 font-black font-mono">
                    {progressToNextTPoint}% (${dollarsIntoCurrentT.toFixed(2)} / $15.00)
                  </span>
                </div>

                {/* Visual Bar Track */}
                <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
                    style={{ width: `${progressToNextTPoint}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>Current: {formatPoints(Math.floor(accumulatedTPoints))}</span>
                  <span>+${dollarsNeededForNextT} for next ₮1.00</span>
                </div>
              </div>
            </div>

            {/* Milestones Track */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1 text-center">
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
                    className={`flex-1 px-0.5 py-0.5 rounded border text-[8px] sm:text-[9px] ${
                      reached 
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-bold' 
                        : 'bg-slate-950/60 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="font-bold truncate">{m.label}</div>
                    <div className="text-[7px] text-slate-400">{m.usd}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SLIDE 3: DIAMONDS GAINED BAR (REMAINS AT 0 UNTIL RULES ARE IMPLEMENTED) */}
          <div 
            id="diamonds-gained-bar-card"
            className="flex-1 min-w-[270px] sm:min-w-[320px] md:min-w-[340px] shrink-0 snap-start bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-950 border border-violet-500/30 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 shadow-lg space-y-2.5 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0 shadow-inner">
                    <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1 flex-wrap leading-tight">
                      <span>Diamonds Gained</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-bold">
                        Rules Pending
                      </span>
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight">Diamonds gained across games & mining</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[8px] sm:text-[9px] text-slate-400 uppercase font-bold block leading-none">Diamonds</span>
                  <span className="text-base sm:text-lg font-black text-violet-400 font-mono">
                    0 💎
                  </span>
                </div>
              </div>

              {/* Progress to Next Tier Bar (Default 0%) */}
              <div className="space-y-1 p-2 rounded-lg sm:rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="flex justify-between items-center text-[10px] sm:text-[11px]">
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Gem className="w-3 h-3 text-violet-400" />
                    <span>Diamond Milestone Tier</span>
                  </span>
                  <span className="text-violet-300 font-black font-mono">
                    0% (0 / 100 💎)
                  </span>
                </div>

                {/* Visual Bar Track */}
                <div className="w-full h-2 bg-slate-900 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-violet-500 via-purple-400 to-cyan-400 rounded-full transition-all duration-500 shadow-sm shadow-violet-500/50"
                    style={{ width: `0%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[9px] text-slate-400">
                  <span>Balance: 0 💎</span>
                  <span className="text-violet-300 font-medium">Rules unlock pending</span>
                </div>
              </div>
            </div>

            {/* Milestones Track */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between gap-1 text-center">
              {[
                { label: '10 💎', tier: 'Tier I' },
                { label: '50 💎', tier: 'Tier II' },
                { label: '100 💎', tier: 'Tier III' },
                { label: '500 💎', tier: 'Master' }
              ].map((m, idx) => {
                return (
                  <div 
                    key={idx}
                    className="flex-1 px-0.5 py-0.5 rounded border text-[8px] sm:text-[9px] bg-slate-950/60 border-slate-800 text-slate-500"
                  >
                    <div className="font-bold truncate">{m.label}</div>
                    <div className="text-[7px] text-slate-400">{m.tier}</div>
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
      <div id="stages-progression-section">
        <StagesCarousel
          onSelectActiveStage={() => {
            if (gamesCarouselRef.current) {
              gamesCarouselRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        />
      </div>

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
            {isVip || allGames.every((g) => g.isCompleted) ? (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hidden xs:inline-flex items-center gap-1 font-black shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>✓ All {allGames.length} Games Completed</span>
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden xs:inline-flex items-center gap-1 font-bold">
                <span>{allGames.length} Games Available</span>
              </span>
            )}
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
                if (game.isCompleted) {
                  setCompletedModalInfo({
                    title: game.title,
                    icon: game.icon,
                    status: game.completedStatus || '✓ Completed',
                    reward: game.reward,
                    description: game.description
                  });
                } else {
                  game.action();
                }
              }}
              className={`group w-[185px] sm:w-[205px] shrink-0 snap-start bg-slate-900/90 hover:bg-slate-900 border ${
                game.isCompleted
                  ? 'border-emerald-500/30 hover:border-emerald-400/60'
                  : 'border-slate-800 hover:border-slate-700'
              } rounded-xl sm:rounded-2xl p-3 transition-all duration-200 hover:shadow-xl hover:scale-[1.02] cursor-pointer flex flex-col justify-between space-y-2.5 relative overflow-hidden active:scale-98 shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between gap-1.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-lg border border-slate-700 transition-colors shadow-sm shrink-0">
                    {game.icon}
                  </div>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded truncate max-w-[110px] flex items-center gap-1 ${game.tagColor}`}>
                    <span>{game.tag}</span>
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-white mt-2 group-hover:text-emerald-300 transition-colors truncate">
                  {game.title}
                </h4>

                {/* Prominent Green Completed Tick Badge only if completed */}
                {game.isCompleted && game.completedStatus && (
                  <div className="flex items-center gap-1 mt-1 text-[9px] text-emerald-300 font-black bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full w-fit">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{game.completedStatus}</span>
                  </div>
                )}

                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
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

                <div className={`w-6 h-6 rounded-md ${game.isCompleted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-400'} flex items-center justify-center transition-all shrink-0 shadow-sm`}>
                  {game.isCompleted ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <ChevronRight className="w-3 h-3" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Verified Sponsor Network Hub (All 4 Zones + AdMob for 100% Player Monetization) */}
      <div className="space-y-3 pt-2" id="dashboard-sponsor-network-hub">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Monetized Sponsor Channels (All Players)</span>
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
            100% Monetization Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          <AdPlacement
            zoneId={459382}
            variant="card"
            title="Hyper Zone #459382"
            subtitle="High-velocity sponsor network. Instant impression payout boosts."
            rewardLabel="ZONE 459382"
          />
          <AdPlacement
            zoneId={459383}
            variant="card"
            title="Ultra Zone #459383"
            subtitle="Verified partner network. Unlocks accelerated mining rewards."
            rewardLabel="ZONE 459383"
          />
          <AdPlacement
            zoneId={459144}
            variant="card"
            title="Prime Zone #459144"
            subtitle="Premier ad stream. Triggers immediate coin multipliers."
            rewardLabel="ZONE 459144"
          />
          <AdPlacement
            zoneId={459143}
            variant="card"
            title="Elite Zone #459143"
            subtitle="VIP gaming partner channel. Boosts streak chest unlock speed."
            rewardLabel="ZONE 459143"
          />
        </div>
      </div>

      {/* COMPLETED GAME CLOSED MODAL (FOR INDIVIDUAL COMPLETED PLAYERS) */}
      {completedModalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner shrink-0">
                  {completedModalInfo.icon}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full inline-flex items-center gap-1 mb-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Conquered & Completed</span>
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {completedModalInfo.title}
                  </h3>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Player Account:</span>
                <span className="text-white font-black">@{user.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Game Status:</span>
                <span className="text-emerald-300 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{completedModalInfo.status}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Account Balance:</span>
                <span className="text-emerald-400 font-black font-mono">{formatCurrency(stats.balance)}</span>
              </div>
              <p className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80 leading-relaxed">
                You have already finished all challenges for this game on this account. All winnings have been credited to your wallet balance. This game is now closed for @{user.username}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCompletedModalInfo(null);
                }}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-800 text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCompletedModalInfo(null);
                  setCurrentView('PROFILE');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <span>View Wallet & Balance</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
