import React, { useState } from 'react';
import { UserProfile, PlayerStats } from '../types';
import { sound } from '../utils/audio';
import { ArrowLeft, User, Flame, Trophy, Wallet, Shield, Zap, RotateCcw, LogOut, CheckCircle2, Users, BarChart3 } from 'lucide-react';
import { ReferralSystem } from './ReferralSystem';

interface ProfileViewProps {
  user: UserProfile;
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  onBack: () => void;
  onSignOut: () => void;
  onRewardClaimed?: (amount: number, description: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  setStats,
  onBack,
  onSignOut,
  onRewardClaimed
}) => {
  const [activeTab, setActiveTab] = useState<'REFERRALS' | 'CAREER'>('REFERRALS');

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
    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-slate-900/90 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 backdrop-blur-sm shadow-lg">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center touch-manipulation"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>👤 Player Profile & Network</span>
            </h1>
            <p className="text-xs text-slate-400">Account status, WhatsApp referrals & telemetry</p>
          </div>
        </div>

        <button
          onClick={onSignOut}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/70 hover:bg-rose-900 active:bg-rose-950 text-rose-200 border border-rose-600/50 text-xs font-black transition-all cursor-pointer min-h-[40px] touch-manipulation shadow-md"
        >
          <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Identity Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 relative z-10">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-slate-800 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10 shrink-0">
            {user.avatar}
          </div>

          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{user.username}</h2>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                VIP Tier 1
              </span>
            </div>
            <p className="text-xs text-slate-400">
              ID: <span className="font-mono text-slate-300">{user.id}</span> • Joined {user.createdAt}
            </p>
          </div>

          <div className="bg-slate-950 p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-slate-800 text-center sm:text-right space-y-0.5 shrink-0">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Wallet & Points</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400">${stats.balance.toFixed(2)}</div>
            <div className="text-xs font-black text-cyan-300 font-mono flex items-center justify-center sm:justify-end gap-1">
              <span className="text-cyan-400">₮</span>{(stats.balance / 15).toFixed(2)} Points
            </div>
            <span className="text-[9px] text-slate-400 block">Rate: $15.00 = ₮1.00</span>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="grid grid-cols-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md">
        <button
          id="profile-tab-referrals"
          onClick={() => {
            sound.playClick();
            setActiveTab('REFERRALS');
          }}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'REFERRALS'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>🤝 Referral Network & WhatsApp</span>
        </button>

        <button
          id="profile-tab-career"
          onClick={() => {
            sound.playClick();
            setActiveTab('CAREER');
          }}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'CAREER'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>📊 Career Stats & Data</span>
        </button>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'REFERRALS' ? (
        <ReferralSystem
          user={user}
          stats={stats}
          setStats={setStats}
          onRewardClaimed={onRewardClaimed}
        />
      ) : (
        <div className="space-y-4">
          {/* Career Metrics Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Total Runs</span>
              <div className="text-lg sm:text-xl font-black text-white mt-0.5">{stats.totalRuns}</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Distance Run</span>
              <div className="text-lg sm:text-xl font-black text-cyan-300 mt-0.5">{stats.totalDistanceRun.toLocaleString()}m</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Gross Earnings</span>
              <div className="text-lg sm:text-xl font-black text-emerald-400 mt-0.5">${stats.totalCashEarned.toFixed(2)}</div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">Penalties</span>
              <div className="text-lg sm:text-xl font-black text-rose-400 mt-0.5">-${stats.totalPenaltyPaid.toFixed(2)}</div>
            </div>
          </div>

          {/* Account Settings & Controls */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3">
            <h3 className="text-sm sm:text-base font-black text-white">Player Data Management</h3>
            <p className="text-xs text-slate-400">
              Manage local player statistics, high-scores cache, and run progression.
            </p>

            <div className="flex flex-wrap gap-2.5 pt-1">
              <button
                onClick={handleResetSessionStats}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Local Game Stats</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
