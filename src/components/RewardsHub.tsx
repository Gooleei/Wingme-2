import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, WalletTransaction } from '../types';
import { sound } from '../utils/audio';
import { Gift, Flame, Trophy, Wallet, History, Sparkles, Clock, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { AdPlacement, SponsorCarousel } from './AdPlacement';
import confetti from 'canvas-confetti';

interface RewardsHubProps {
  stats: PlayerStats;
  transactions: WalletTransaction[];
  onClaimDaily: () => void;
  onOpenWithdraw: () => void;
  onOpenShop: () => void;
  onOpenLeaderboard: () => void;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export const RewardsHub: React.FC<RewardsHubProps> = ({
  stats,
  transactions,
  onClaimDaily,
  onOpenWithdraw,
  onOpenShop,
  onOpenLeaderboard
}) => {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('00:00:00');
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Inject Onclicka ad script (data-admpid="457731")
    const adScript = document.createElement('script');
    adScript.src = 'https://js.onclckmn.com/static/onclicka.js';
    adScript.async = true;
    adScript.setAttribute('data-admpid', '457731');

    if (adContainerRef.current) {
      adContainerRef.current.appendChild(adScript);
    }

    return () => {
      if (adScript.parentNode) {
        adScript.parentNode.removeChild(adScript);
      }
    };
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const lastClaim = stats.lastDailyClaimTime || 0;
      const elapsed = now - lastClaim;
      const remaining = TWENTY_FOUR_HOURS_MS - elapsed;

      if (remaining <= 0 || !stats.lastDailyClaimTime) {
        setCanClaim(true);
        setTimeLeftStr('READY');
      } else {
        setCanClaim(false);
        const totalSecs = Math.floor(remaining / 1000);
        const hrs = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        setTimeLeftStr(
          `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
        );
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [stats.lastDailyClaimTime]);

  const handleClaim = () => {
    if (canClaim) {
      onClaimDaily();
      sound.playWin();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="space-y-3.5 max-w-2xl mx-auto w-full px-2 sm:px-0">
      {/* Wallet Balance Hero Card */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🏃</span>
            <div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Runner Wallet</span>
              <h3 className="text-base sm:text-lg font-black text-slate-100 font-arcade">Total Rewards</h3>
            </div>
          </div>

          <div className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{stats.streak}d Streak</span>
          </div>
        </div>

        {/* CAROUSEL SIDE SCROLL: CASH BALANCE BAR & ACCUMULATED POINTS BAR IN SAME LINE */}
        <div className="space-y-1.5 mb-2.5">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold px-0.5">
            <span className="flex items-center gap-1 uppercase tracking-wider text-slate-300">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Balance & Point Trackers</span>
            </span>
            <span>⇄ Side Scroll Carousel</span>
          </div>

          <div className="flex items-stretch gap-2.5 overflow-x-auto pb-1.5 snap-x snap-mandatory scroll-smooth scrollbar-thin">
            {/* 1. Cash Balance Bar Card */}
            <div className="flex-1 min-w-[240px] sm:min-w-[260px] shrink-0 snap-start bg-slate-900/90 p-3 rounded-xl sm:rounded-2xl border border-emerald-500/30 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Cash Balance</span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">${stats.balance.toFixed(2)}</p>
                </div>
                <button
                  onClick={() => { sound.playClick(); onOpenWithdraw(); }}
                  className="py-1.5 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] shadow-sm transition active:scale-95 flex items-center gap-1 cursor-pointer whitespace-nowrap"
                >
                  <Wallet className="w-3 h-3" /> Cash Out
                </button>
              </div>

              {/* Progress to $600 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Progress to $600 Min</span>
                  <span className="text-emerald-300 font-bold font-mono">
                    {Math.min(100, Math.round((stats.balance / 600) * 100))}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round((stats.balance / 600) * 100))}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Accumulated ₮ Points Bar Card */}
            <div className="flex-1 min-w-[240px] sm:min-w-[260px] shrink-0 snap-start bg-slate-900/90 p-3 rounded-xl sm:rounded-2xl border border-cyan-500/30 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-cyan-400 uppercase font-bold tracking-wider block flex items-center gap-1">
                    <span>Accumulated ₮ Points</span>
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-cyan-300 font-mono">
                    <span className="text-cyan-400">₮</span>{(stats.balance / 15).toFixed(2)}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  $15 = ₮1
                </span>
              </div>

              {/* Progress to ₮40.00 */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400">Progress to ₮40.00 Min</span>
                  <span className="text-cyan-300 font-bold font-mono">
                    ₮{(stats.balance / 15).toFixed(2)} / ₮40.00
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full border border-slate-800 overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.round(((stats.balance / 15) / 40) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 text-center text-xs">
          <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[9px] sm:text-[10px] text-slate-400">Total Runs</span>
            <p className="font-black text-slate-200 font-arcade text-xs sm:text-sm">{stats.totalRuns}</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[9px] sm:text-[10px] text-slate-400">World Wins</span>
            <p className="font-black text-emerald-400 font-arcade text-xs sm:text-sm">{stats.totalWins}</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[9px] sm:text-[10px] text-slate-400">Distance</span>
            <p className="font-black text-cyan-400 font-arcade text-xs sm:text-sm">{stats.totalDistanceRun}m</p>
          </div>
          <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[9px] sm:text-[10px] text-slate-400">Hits</span>
            <p className="font-black text-rose-400 font-arcade text-xs sm:text-sm">{stats.totalLosses}</p>
          </div>
        </div>
      </div>

      {/* 24-Hour Daily Bonus Card */}
      <div className="glass-card p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
            🎁
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-100">Daily Login Bonus</h4>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                +$1.00 FREE
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400">
              {canClaim ? (
                <span className="text-emerald-400 font-bold">✨ Ready to Claim!</span>
              ) : (
                <>Next: <strong className="text-amber-400 font-mono font-bold">{timeLeftStr}</strong></>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={!canClaim}
          className={`py-2 px-3.5 rounded-xl text-xs font-black font-arcade transition active:scale-95 whitespace-nowrap ${
            canClaim
              ? 'gold-btn text-slate-950 shadow-md cursor-pointer animate-bounce'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {canClaim ? 'CLAIM $1.00' : 'LOCKED'}
        </button>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        <div
          onClick={() => { sound.playClick(); onOpenShop(); }}
          className="glass-card p-3 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-base shrink-0">
              🥷
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-100 group-hover:text-amber-400 transition">Characters</h5>
              <p className="text-[9px] text-slate-400">Skins & Gadgets</p>
            </div>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition shrink-0" />
        </div>

        <div
          onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
          className="glass-card p-3 rounded-xl sm:rounded-2xl border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-base shrink-0">
              🏆
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-100 group-hover:text-amber-400 transition">Speedruns</h5>
              <p className="text-[9px] text-slate-400">Global Records</p>
            </div>
          </div>
          <Trophy className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition shrink-0" />
        </div>
      </div>

      {/* Sponsored Partner Side Slide Carousel (458074 & 458075) */}
      <SponsorCarousel
        title="Sponsored Partner Rewards"
        subtitle="Support the network & unlock bonus coin multipliers"
      />

      {/* Transaction History Log */}
      <div className="glass-card p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-amber-400" /> Recent Rewards & Logs
          </h4>
          <span className="text-[10px] text-slate-500">Last 20 activities</span>
        </div>

        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <div className="text-center py-5 text-xs text-slate-500">No activity yet. Run a world to earn rewards!</div>
          ) : (
            transactions.map(item => (
              <div
                key={item.id}
                className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] ${
                      item.amount >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {item.amount >= 0 ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-[11px] leading-tight">{item.description}</p>
                    <p className="text-[9px] text-slate-500">{item.date}</p>
                  </div>
                </div>

                <span
                  className={`font-black font-arcade text-xs ${
                    item.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.amount >= 0 ? '+' : ''}${item.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Rewards Hub Sponsor Zones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AdPlacement
          zoneId={459144}
          variant="card"
          title="Daily Claim Boost Sponsor 459144"
          subtitle="Explore verified sponsor offer to double your daily streak chest and claim extra points."
          rewardLabel="DAILY 2X #459144"
        />
        <AdPlacement
          zoneId={459143}
          variant="card"
          title="Elite Vault Sponsor 459143"
          subtitle="Direct crypto reward partner. Unlocks instant milestone chests and bonus multipliers."
          rewardLabel="ACTIVE #459143"
        />
      </div>

      {/* Foot-Level Sponsor & Ad Zone */}
      <div 
        ref={adContainerRef}
        id="daily-rewards-foot-ad-container"
        className="w-full min-h-[50px] flex items-center justify-center overflow-hidden rounded-xl sm:rounded-2xl bg-slate-950/40 border border-slate-800/60 p-2"
      >
        {/* Dynamic Ad container for data-admpid="457731" */}
      </div>
    </div>
  );
};
