import React from 'react';
import { UserProfile, PlayerStats } from '../types';
import { sound } from '../utils/audio';
import { ArrowLeft, User, Flame, Trophy, Wallet, Shield, Zap, RotateCcw, LogOut, CheckCircle2 } from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile;
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  onBack: () => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  setStats,
  onBack,
  onSignOut
}) => {
  const handleResetSessionStats = () => {
    if (confirm('Reset your player session stats back to initial state?')) {
      sound.playClick();
      setStats((prev) => ({
        ...prev,
        balance: 10.00,
        totalRuns: 0,
        totalWins: 0,
        totalLosses: 0,
        totalDistanceRun: 0,
        totalCashEarned: 0,
        totalPenaltyPaid: 0,
        unlockedLevels: 1
      }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <span>👤 Player Profile</span>
            </h1>
            <p className="text-xs text-slate-400">Account status & game telemetry</p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 active:bg-rose-950 text-rose-200 border border-rose-600/50 text-xs font-black transition-all cursor-pointer min-h-[44px] touch-manipulation shadow-md"
        >
          <LogOut className="w-4 h-4 stroke-[2.2]" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Identity Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
          <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/10">
            {user.avatar}
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-black text-white">{user.username}</h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                VIP Tier 1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Registered ID: <span className="font-mono text-slate-300">{user.id}</span> • Joined {user.createdAt}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center sm:text-right">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Wallet Balance</span>
            <div className="text-2xl font-black text-emerald-400 mt-0.5">${stats.balance.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Career Metrics Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-bold">Total Runs</span>
          <div className="text-xl font-black text-white mt-1">{stats.totalRuns}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-bold">Total Distance Run</span>
          <div className="text-xl font-black text-cyan-300 mt-1">{stats.totalDistanceRun.toLocaleString()}m</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-bold">Gross Earnings</span>
          <div className="text-xl font-black text-emerald-400 mt-1">${stats.totalCashEarned.toFixed(2)}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-[11px] text-slate-400 font-bold">Obstacle Penalties</span>
          <div className="text-xl font-black text-rose-400 mt-1">-${stats.totalPenaltyPaid.toFixed(2)}</div>
        </div>
      </div>

      {/* Account Settings & Controls */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-black text-white">Player Data Management</h3>
        <p className="text-xs text-slate-400">
          Manage local player statistics, high-scores cache, and run progression.
        </p>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            onClick={handleResetSessionStats}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Local Game Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
};
