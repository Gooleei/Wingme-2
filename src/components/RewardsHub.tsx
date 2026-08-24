import React, { useState, useEffect } from 'react';
import { PlayerStats, WalletTransaction } from '../types';
import { sound } from '../utils/audio';
import { Gift, Flame, Trophy, Wallet, History, Sparkles, Clock, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
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
    <div className="space-y-4 max-w-2xl mx-auto w-full">
      {/* Wallet Balance Hero Card */}
      <div className="glass-card p-4 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏃</span>
            <div>
              <span className="text-xs text-slate-400 font-semibold">Runner Wallet</span>
              <h3 className="text-lg font-black text-slate-100 font-arcade">Total Rewards</h3>
            </div>
          </div>

          <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{stats.streak} Day Streak</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center justify-between mb-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Available Cash</span>
            <p className="text-3xl font-black text-amber-300 font-arcade">${stats.balance.toFixed(2)}</p>
          </div>

          <button
            onClick={() => { sound.playClick(); onOpenWithdraw(); }}
            className="py-2.5 px-4 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-4 h-4" /> Request Payout
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400">Total Runs</span>
            <p className="font-black text-slate-200 font-arcade">{stats.totalRuns}</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400">World Wins</span>
            <p className="font-black text-emerald-400 font-arcade">{stats.totalWins}</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400">Total Distance</span>
            <p className="font-black text-cyan-400 font-arcade">{stats.totalDistanceRun}m</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <span className="text-[10px] text-slate-400">Obstacle Hits</span>
            <p className="font-black text-rose-400 font-arcade">{stats.totalLosses}</p>
          </div>
        </div>
      </div>

      {/* 24-Hour Daily Bonus Card */}
      <div className="glass-card p-4 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-slate-900 to-slate-900 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-2xl">
            🎁
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm text-slate-100">Daily Login Bonus</h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                +$1.00 FREE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {canClaim ? (
                <span className="text-emerald-400 font-bold">✨ Bonus is Ready to Claim!</span>
              ) : (
                <>Next in: <strong className="text-amber-400 font-mono font-bold">{timeLeftStr}</strong></>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={!canClaim}
          className={`py-2.5 px-4 rounded-xl text-xs font-black font-arcade transition active:scale-95 ${
            canClaim
              ? 'gold-btn text-slate-950 shadow-md cursor-pointer animate-bounce'
              : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
          }`}
        >
          {canClaim ? 'CLAIM $1.00' : 'LOCKED'}
        </button>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => { sound.playClick(); onOpenShop(); }}
          className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-lg">
              🥷
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-100 group-hover:text-amber-400 transition">Unlock Characters</h5>
              <p className="text-[10px] text-slate-400">Skins & Gadgets</p>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
        </div>

        <div
          onClick={() => { sound.playClick(); onOpenLeaderboard(); }}
          className="glass-card p-3.5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg">
              🏆
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-100 group-hover:text-amber-400 transition">Speedrun Board</h5>
              <p className="text-[10px] text-slate-400">Global Records</p>
            </div>
          </div>
          <Trophy className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
        </div>
      </div>

      {/* Transaction History Log */}
      <div className="glass-card p-4 rounded-3xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-amber-400" /> Recent Rewards & Logs
          </h4>
          <span className="text-[11px] text-slate-500">Last 20 activities</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">No activity yet. Run a world to earn rewards!</div>
          ) : (
            transactions.map(item => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] ${
                      item.amount >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {item.amount >= 0 ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 text-[11px]">{item.description}</p>
                    <p className="text-[10px] text-slate-500">{item.date}</p>
                  </div>
                </div>

                <span
                  className={`font-black font-arcade ${
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
    </div>
  );
};
