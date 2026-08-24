import React from 'react';
import { AppView, UserProfile } from '../types';
import { 
  Flame, 
  Wallet, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  Trophy, 
  History, 
  User, 
  LogOut,
  Gift,
  Gamepad2
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HeaderNavbarProps {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  balance: number;
  streak: number;
  user: UserProfile;
  soundOn: boolean;
  setSoundOn: (enabled: boolean) => void;
  onOpenWithdraw: () => void;
  onSignOut: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  currentView,
  setCurrentView,
  balance,
  streak,
  user,
  soundOn,
  setSoundOn,
  onOpenWithdraw,
  onSignOut
}) => {
  const isGameView = currentView.startsWith('GAME_');
  const isSecondaryView = currentView !== 'DASHBOARD' && currentView !== 'LANDING' && currentView !== 'AUTH';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left Side: Brand Logo or Back Button */}
        <div className="flex items-center gap-3">
          {isSecondaryView ? (
            <button
              id="nav-back-button"
              onClick={() => {
                sound.playClick();
                setCurrentView('DASHBOARD');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-sm font-medium transition-colors cursor-pointer border border-slate-700 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Hub</span>
            </button>
          ) : (
            <div 
              onClick={() => setCurrentView('DASHBOARD')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 text-lg">
                  LP
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold tracking-tight text-lg bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                    LuckyPlay
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide">
                    Rewards
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Play Games & Cashout Real Crypto</p>
              </div>
            </div>
          )}
        </div>

        {/* Center / Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => {
              sound.playClick();
              setCurrentView('DASHBOARD');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'DASHBOARD'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            Games Hub
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setCurrentView('GAME_RUNNER');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'GAME_RUNNER'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="text-amber-400">🏃</span>
            Endless Runner
            <span className="text-[9px] px-1 rounded bg-amber-500/30 text-amber-300 font-bold">$33 WIN</span>
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setCurrentView('LEADERBOARD');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'LEADERBOARD'
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Leaderboard
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setCurrentView('REWARDS');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              currentView === 'REWARDS'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            Daily $1.00
          </button>
        </nav>

        {/* Right Side: Streak, Balance Chip, Audio, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Daily Streak Indicator */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-inner">
            <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse text-amber-500" />
            <span>{streak}d</span>
          </div>

          {/* Balance Pill -> Click opens Withdraw */}
          <button
            id="header-balance-chip"
            onClick={() => {
              sound.playClick();
              onOpenWithdraw();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-sm shadow-md shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-400 text-xs group-hover:rotate-12 transition-transform">
              $
            </div>
            <span>${balance.toFixed(2)}</span>
            <Wallet className="w-3.5 h-3.5 text-emerald-400 ml-0.5 opacity-80 group-hover:opacity-100" />
          </button>

          {/* Sound Toggle */}
          <button
            id="header-sound-toggle"
            onClick={() => {
              const next = !soundOn;
              sound.enabled = next;
              setSoundOn(next);
              if (next) sound.playClick();
            }}
            title={soundOn ? 'Mute Sound' : 'Enable Sound'}
            className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Profile / History / Sign Out */}
          <div className="relative flex items-center gap-1">
            <button
              id="header-history-btn"
              onClick={() => {
                sound.playClick();
                setCurrentView('HISTORY');
              }}
              title="Transaction History"
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white hidden sm:flex items-center justify-center transition-colors border border-slate-700 cursor-pointer"
            >
              <History className="w-4 h-4" />
            </button>

            <button
              id="header-profile-btn"
              onClick={() => {
                sound.playClick();
                setCurrentView('PROFILE');
              }}
              title="User Profile"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer"
            >
              <span className="text-base">{user.avatar}</span>
              <span className="hidden lg:inline max-w-[80px] truncate">{user.username}</span>
            </button>

            <button
              id="header-signout-btn"
              onClick={() => {
                sound.playClick();
                onSignOut();
              }}
              title="Sign Out"
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 flex items-center justify-center transition-colors border border-slate-700 hover:border-rose-700 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
