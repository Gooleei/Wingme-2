import React, { useState } from 'react';
import { UserProfile, PlayerStats } from '../types';
import { sound } from '../utils/audio';
import { 
  ArrowLeft, 
  User, 
  LogOut, 
  CheckCircle2, 
  Users, 
  BarChart3,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit3,
  X,
  Lock,
  ShieldCheck,
  Calendar,
  RotateCcw
} from 'lucide-react';
import { ReferralSystem } from './ReferralSystem';
import { 
  updateUserCredentials
} from '../utils/accountManager';
import { formatCurrency, formatPoints } from '../utils/formatters';

interface ProfileViewProps {
  user: UserProfile;
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  onBack: () => void;
  onSignOut: () => void;
  onRewardClaimed?: (amount: number, description: string) => void;
  onUpdateUser?: (updatedUser: UserProfile) => void;
  onSwitchUser?: (newUser: UserProfile) => void;
}

const AVATARS = ['👑', '⚡', '🤖', '🦊', '🚀', '🔥', '🛡️', '🎯', '🐱', '🎮', '💎', '🐉'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stats,
  setStats,
  onBack,
  onSignOut,
  onRewardClaimed,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'REFERRALS' | 'CAREER'>('DETAILS');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Edit credentials state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editUsername, setEditUsername] = useState<string>(user.username);
  const [editEmail, setEditEmail] = useState<string>(user.email || '');
  const [editPin, setEditPin] = useState<string>(user.pin || '1234');
  const [editAvatar, setEditAvatar] = useState<string>(user.avatar || '👑');
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const handleCopy = (text: string, fieldName: string) => {
    sound.playClick();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleOpenEdit = () => {
    sound.playClick();
    setEditUsername(user.username);
    setEditEmail(user.email || '');
    setEditPin(user.pin || '1234');
    setEditAvatar(user.avatar || '👑');
    setEditError(null);
    setEditSuccess(null);
    setIsEditing(true);
  };

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    const result = updateUserCredentials(user.id, {
      username: editUsername,
      email: editEmail,
      pin: editPin,
      avatar: editAvatar
    });

    if (!result.success || !result.user) {
      sound.playWrong();
      setEditError(result.error || 'Failed to update credentials.');
      return;
    }

    sound.playWin();
    setEditSuccess('Credentials updated successfully!');
    if (onUpdateUser) {
      onUpdateUser(result.user);
    }

    setTimeout(() => {
      setIsEditing(false);
      setEditSuccess(null);
    }, 1200);
  };

  const handleResetSessionStats = () => {
    if (confirm('Reset your player session stats back to initial state?')) {
      sound.playClick();
      setStats((prev) => ({
        ...prev,
        balance: 0.00,
        totalRuns: 0,
        totalWins: 0,
        totalLosses: 0,
        totalDistanceRun: 0,
        totalCashEarned: 0.00,
        totalPenaltyPaid: 0.00,
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
              <span>👤 Player Account & Credentials</span>
            </h1>
            <p className="text-xs text-slate-400">View registered details, security credentials & rewards</p>
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

      {/* Main Identity Card with Username, Email & Password Details */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl relative overflow-hidden space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-950 border-2 border-emerald-500/50 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/10 shrink-0 relative group">
              <span>{user.avatar}</span>
              <button
                onClick={handleOpenEdit}
                title="Edit Avatar & Details"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md cursor-pointer transition-transform hover:scale-110"
              >
                <Edit3 className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  @{user.username}
                </h2>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified Player</span>
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Level {user.level || 1}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300 font-medium">{user.email || `${user.username.toLowerCase()}@bellmont.io`}</span>
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>Joined {user.createdAt || '2026-08-24'}</span>
                </span>
              </p>
            </div>
          </div>

          {/* Wallet Balance Widget */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center sm:text-right space-y-0.5 shrink-0 w-full sm:w-auto shadow-inner">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Wallet Balance & Points</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{formatCurrency(stats.balance)}</div>
            <div className="text-xs font-black text-cyan-300 font-mono flex items-center justify-center sm:justify-end gap-1">
              <span>{formatPoints(stats.balance / 15)} Points</span>
            </div>
            <span className="text-[9px] text-slate-500 block">Withdrawal Rate: $15.00 = ₮1.00</span>
          </div>
        </div>

        {/* REGISTERED CREDENTIALS SECTION (UNDER USERNAME) */}
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                Registered Account Credentials
              </h3>
            </div>
            <button
              onClick={handleOpenEdit}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-emerald-300 hover:text-white text-xs font-extrabold border border-emerald-500/30 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Details / Password</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* 1. Username Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Registered Username</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(user.username, 'username')}
                  className="text-[10px] text-cyan-300 hover:text-cyan-200 flex items-center gap-1 cursor-pointer"
                  title="Copy Username"
                >
                  {copiedField === 'username' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedField === 'username' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-sm font-black text-white font-mono">{user.username}</div>
              <div className="text-[10px] text-slate-500">Public player identity</div>
            </div>

            {/* 2. Registered Email Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Registered Email</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(user.email || `${user.username.toLowerCase()}@bellmont.io`, 'email')}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  title="Copy Email"
                >
                  {copiedField === 'email' ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedField === 'email' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-sm font-black text-white font-mono truncate">
                {user.email || `${user.username.toLowerCase()}@bellmont.io`}
              </div>
              <div className="text-[10px] text-emerald-500/90 font-semibold">Account Recovery & Alerts</div>
            </div>

            {/* 3. Password / Security PIN Card */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password / PIN</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-0.5 cursor-pointer"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopy(user.pin || '1234', 'pin')}
                    className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    title="Copy Password/PIN"
                  >
                    {copiedField === 'pin' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === 'pin' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
              <div className="text-sm font-black text-amber-300 font-mono tracking-widest">
                {showPassword ? user.pin || '1234' : '••••••••'}
              </div>
              <div className="text-[10px] text-slate-500">4-8 digit security passkey</div>
            </div>
          </div>

          {/* Account System UID */}
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="font-bold text-slate-500">System UID:</span>
              <span className="font-mono text-slate-300 text-[11px]">{user.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Encrypted Storage Synchronized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="grid grid-cols-3 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-md gap-1">
        <button
          id="profile-tab-details"
          onClick={() => {
            sound.playClick();
            setActiveTab('DETAILS');
          }}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'DETAILS'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Details</span>
        </button>

        <button
          id="profile-tab-referrals"
          onClick={() => {
            sound.playClick();
            setActiveTab('REFERRALS');
          }}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'REFERRALS'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Referral Hub</span>
        </button>

        <button
          id="profile-tab-career"
          onClick={() => {
            sound.playClick();
            setActiveTab('CAREER');
          }}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'CAREER'
              ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-slate-950 shadow-md shadow-purple-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Career Stats</span>
        </button>
      </div>

      {/* TAB CONTENT: MY DETAILS & CREDENTIALS OVERVIEW */}
      {activeTab === 'DETAILS' && (
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <span>🔐 Account Security & Profile Overview</span>
                </h3>
                <p className="text-xs text-slate-400">Detailed overview of your registered player identity</p>
              </div>
              <button
                onClick={handleOpenEdit}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 hover:from-emerald-400 hover:to-teal-300 cursor-pointer shadow-md transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Update Credentials</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Profile Information
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Username:</span>
                    <span className="font-black text-white font-mono">{user.username}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Email:</span>
                    <span className="font-bold text-slate-300 font-mono">{user.email || 'runner@bellmont.io'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Password / PIN:</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {showPassword ? user.pin || '1234' : '••••'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Account Type:</span>
                    <span className="font-bold text-emerald-400">Standard Registered Player</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Game & Reward Status
                </span>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Current Balance:</span>
                    <span className="font-black text-emerald-400 font-mono">${stats.balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Equivalent ₮ Points:</span>
                    <span className="font-black text-cyan-300 font-mono">₮{(stats.balance / 15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-900">
                    <span className="text-slate-400">Total Distance Run:</span>
                    <span className="font-bold text-slate-200">{stats.totalDistanceRun.toLocaleString()}m</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Unlocked Worlds:</span>
                    <span className="font-bold text-purple-300">{stats.unlockedLevels} of 5 Worlds</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: REFERRALS */}
      {activeTab === 'REFERRALS' && (
        <ReferralSystem
          user={user}
          stats={stats}
          setStats={setStats}
          onRewardClaimed={onRewardClaimed}
        />
      )}

      {/* TAB CONTENT: CAREER STATS */}
      {activeTab === 'CAREER' && (
        <div className="space-y-4">
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

      {/* EDIT CREDENTIALS MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 relative">
            <button
              onClick={() => {
                sound.playClick();
                setIsEditing(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black text-white flex items-center justify-center sm:justify-start gap-2">
                <Edit3 className="w-4 h-4 text-emerald-400" />
                <span>Update Account Credentials</span>
              </h3>
              <p className="text-xs text-slate-400">
                Change your username, registered email, avatar, or security PIN/password
              </p>
            </div>

            {editError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold">
                {editError}
              </div>
            )}

            {editSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{editSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredentials} className="space-y-4">
              {/* Avatar Selector */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Choose Avatar
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVATARS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setEditAvatar(av)}
                      className={`w-8 h-8 rounded-xl text-base flex items-center justify-center border cursor-pointer transition-all ${
                        editAvatar === av
                          ? 'bg-emerald-500/30 border-emerald-400 scale-105 shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400'
                          : 'bg-slate-950 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Username
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* Password/PIN Input */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Password / Security PIN (Min 4 Digits)
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    minLength={4}
                    maxLength={8}
                    value={editPin}
                    onChange={(e) => setEditPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold tracking-widest focus:outline-none focus:border-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
