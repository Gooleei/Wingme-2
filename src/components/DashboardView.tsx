import React, { useState, useEffect } from 'react';
import { AppView, PlayerStats, UserProfile } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
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
  Zap, 
  Gamepad2, 
  Lock, 
  RotateCw,
  Coins,
  Shield,
  Award
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

  // Daily Claim Countdown
  const [timeUntilDailyClaim, setTimeUntilDailyClaim] = useState<number>(0);

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
      title: '🥚 Egg Scratch Matrix (1-Hour Challenge)',
      badge: 'MARATHON EVENT',
      badgeColor: 'bg-emerald-500 text-slate-950',
      description: 'Scratch 10 progressive levels with 100 eggs per level. Uncover hidden cash drops and win the $100 Grand Celestial Jackpot!',
      buttonText: 'Start Egg Scratch ($100 Jackpot)',
      bgGradient: 'from-emerald-600/30 via-slate-900 to-slate-950',
      borderColor: 'border-emerald-500/40',
      action: () => setCurrentView('GAME_SCRATCH')
    },
    {
      title: '❌⭕ Tic Tac Toe Neural AI',
      badge: '15 LEVELS',
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
      id: 'runner',
      title: 'Endless Runner Challenge',
      icon: '🏃',
      tag: 'HOT',
      tagColor: 'bg-amber-500 text-slate-950',
      reward: 'Up to $33.00',
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
      tag: '15 LEVELS',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30',
      reward: 'Up to $50.00',
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
      title: 'Egg Scratch Matrix',
      icon: '🥚',
      tag: '$100 JACKPOT',
      tagColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
      reward: '+$0.50 to $100.00',
      description: '1-Hour Marathon with 10 Levels x 100 Eggs. Uncover hidden cash and golden egg rewards.',
      action: () => setCurrentView('GAME_SCRATCH')
    },
    {
      id: 'spin',
      title: 'Lucky Wheel Spin',
      icon: '🎡',
      tag: 'DAILY PLAY',
      tagColor: 'bg-teal-500/20 text-teal-300 border border-teal-500/30',
      reward: 'Up to $25.00',
      description: 'Spin the dynamic prize wheel daily for guaranteed instant cash prizes.',
      action: () => setCurrentView('GAME_SPIN')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Player Overview Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/30 via-emerald-500/30 to-cyan-500/30 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10">
              {user.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-white">{user.username}</h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LVL {user.level}
                </span>
                {user.isGuest && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    Guest Account
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Streak: <strong className="text-amber-400">{stats.streak} Days Active</strong> • {user.gamesPlayedToday} Games Today
              </p>
            </div>
          </div>

          {/* Balance & Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-950/80 px-5 py-3 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">
                Total Cash Balance
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 flex items-center gap-1 mt-0.5">
                <span>${stats.balance.toFixed(2)}</span>
              </div>
            </div>

            <button
              id="dash-withdraw-btn"
              onClick={() => {
                sound.playClick();
                onOpenWithdraw();
              }}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/25 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Withdraw Crypto</span>
            </button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-40 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
      </div>

      {/* Daily $1.00 Claim Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-950 border border-purple-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-2xl border border-purple-500/40 shadow-inner">
            🎁
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-black text-white">Daily $1.00 Cash Bonus</h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-500/30 text-purple-300">
                24H STREAK
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Claim $1.00 every 24 hours to boost your balance and increase streak multipliers.
            </p>
          </div>
        </div>

        <div>
          {timeUntilDailyClaim > 0 ? (
            <button
              disabled
              className="px-6 py-3 rounded-2xl bg-slate-800 text-slate-400 text-xs font-bold flex items-center gap-2 border border-slate-700 cursor-not-allowed opacity-80"
            >
              <Timer className="w-4 h-4 text-purple-400 animate-pulse" />
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
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              <span>Claim Daily $1.00 Now</span>
            </button>
          )}
        </div>
      </div>

      {/* Featured Carousel */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Featured Tournaments & Events</span>
          </h3>
          <div className="flex items-center gap-1.5">
            {featuredSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  carouselIndex === idx ? 'w-6 bg-emerald-400' : 'w-2 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Slide Card */}
        <div
          className={`p-6 sm:p-8 rounded-3xl border ${featuredSlides[carouselIndex].borderColor} bg-gradient-to-r ${featuredSlides[carouselIndex].bgGradient} shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}
        >
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2">
              <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${featuredSlides[carouselIndex].badgeColor}`}>
                {featuredSlides[carouselIndex].badge}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {featuredSlides[carouselIndex].title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {featuredSlides[carouselIndex].description}
            </p>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              featuredSlides[carouselIndex].action();
            }}
            className="px-6 py-4 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-black text-sm flex items-center gap-2 transition-all shadow-xl hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{featuredSlides[carouselIndex].buttonText}</span>
          </button>
        </div>
      </div>

      {/* Grid of All Games */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
              <span>All Arcade Mini-Games</span>
            </h3>
            <p className="text-xs text-slate-400">Select any game to play and earn instant balance credit</p>
          </div>
          <span className="text-xs font-bold text-slate-400">7 Games Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allGames.map((game) => (
            <div
              key={game.id}
              onClick={() => {
                sound.playClick();
                game.action();
              }}
              className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 transition-all duration-200 hover:shadow-2xl hover:scale-[1.02] cursor-pointer flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 group-hover:bg-slate-700 flex items-center justify-center text-2xl border border-slate-700 transition-colors shadow-md">
                    {game.icon}
                  </div>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${game.tagColor}`}>
                    {game.tag}
                  </span>
                </div>

                <h4 className="text-lg font-black text-white mt-3 group-hover:text-emerald-300 transition-colors">
                  {game.title}
                </h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {game.description}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Reward Pool</span>
                  <strong className="text-emerald-400 font-extrabold text-xs">{game.reward}</strong>
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-emerald-500 group-hover:text-slate-950 text-slate-400 flex items-center justify-center transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
