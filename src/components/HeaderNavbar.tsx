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
  Gamepad2, 
  Tv, 
  Sparkles,
  Zap
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
  const isSecondaryView = currentView !== 'DASHBOARD' && currentView !== 'LANDING' && currentView !== 'AUTH';

  return (
    <>
      {/* TOP HEADER BAR */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Left Side: Prominent Back Button or Brand Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isSecondaryView ? (
              <button
                id="nav-back-button"
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentView('DASHBOARD');
                }}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-emerald-400 hover:text-emerald-300 font-bold text-xs sm:text-sm transition-all cursor-pointer border border-emerald-500/30 shadow-md shadow-emerald-950/40 min-h-[38px] touch-manipulation"
              >
                <ArrowLeft className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.5]" />
                <span className="inline">Back</span>
              </button>
            ) : (
              <div 
                onClick={() => setCurrentView('DASHBOARD')}
                className="flex items-center gap-2 cursor-pointer group select-none"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 text-sm sm:text-lg">
                    LP
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-black tracking-tight text-sm sm:text-lg text-white">
                      LuckyPlay
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      PRO
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Top Shortcuts */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              id="top-nav-games"
              type="button"
              onClick={() => {
                sound.playClick();
                setCurrentView('DASHBOARD');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'DASHBOARD'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              Games
            </button>
            <button
              id="top-nav-watch"
              type="button"
              onClick={() => {
                sound.playClick();
                setCurrentView('WATCH');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'WATCH'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Tv className="w-3.5 h-3.5 text-cyan-400" />
              Watch
            </button>
            <button
              id="top-nav-runner"
              type="button"
              onClick={() => {
                sound.playClick();
                setCurrentView('GAME_RUNNER');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                currentView === 'GAME_RUNNER'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>🏃</span>
              Runner
              <span className="text-[9px] px-1 rounded bg-amber-500/30 text-amber-300 font-bold">$33</span>
            </button>
          </nav>

          {/* Right Side: Streak, Balance, Sound, Profile & Sign Out Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Streak Counter */}
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] sm:text-xs font-bold shrink-0">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400 text-amber-500" />
              <span>{streak}d</span>
            </div>

            {/* Wallet Balance Chip */}
            <button
              id="header-balance-chip"
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenWithdraw();
              }}
              title="Click to Withdraw Balance"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer touch-manipulation min-h-[38px]"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>${balance.toFixed(2)}</span>
            </button>

            {/* Sound Toggle Button */}
            <button
              id="header-sound-toggle"
              type="button"
              onClick={() => {
                const next = !soundOn;
                sound.enabled = next;
                setSoundOn(next);
                if (next) sound.playClick();
              }}
              title={soundOn ? 'Mute Sound' : 'Enable Sound'}
              className="w-9 h-9 sm:w-9.5 sm:h-9.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer touch-manipulation shrink-0"
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              id="header-profile-btn"
              type="button"
              onClick={() => {
                sound.playClick();
                setCurrentView('PROFILE');
              }}
              title={`Profile: ${user.username}`}
              className="flex items-center gap-1 px-2 py-1 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold cursor-pointer touch-manipulation min-h-[38px] shrink-0"
            >
              <span className="text-base sm:text-lg leading-none">{user.avatar || '👤'}</span>
              <span className="hidden sm:inline max-w-[65px] truncate text-[11px]">{user.username}</span>
            </button>

            {/* Sign Out Button */}
            <button
              id="header-signout-btn"
              type="button"
              onClick={() => {
                sound.playClick();
                onSignOut();
              }}
              title="Sign Out of Account"
              className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/80 active:bg-rose-950 text-rose-300 hover:text-rose-100 border border-rose-500/40 text-xs font-bold transition-all cursor-pointer touch-manipulation min-h-[38px] shadow-sm shrink-0"
            >
              <LogOut className="w-4 h-4 stroke-[2.2]" />
              <span className="hidden xs:inline text-[11px]">Logout</span>
            </button>
          </div>

        </div>
      </header>

      {/* UNIVERSAL STICKY FOOTER NAVIGATION BAR (VISIBLE ON BOTH WEB AND MOBILE) */}
      <footer 
        id="universal-footer-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl safe-area-bottom py-1 sm:py-1.5 px-2"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1 sm:gap-2">
          
          {/* 1. Games button */}
          <button
            id="footer-nav-games"
            type="button"
            onClick={() => {
              sound.playClick();
              setCurrentView('DASHBOARD');
            }}
            className={`flex-1 min-w-0 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[46px] sm:min-h-[50px] touch-manipulation border ${
              currentView === 'DASHBOARD'
                ? 'text-emerald-400 font-black bg-emerald-500/15 border-emerald-500/30 shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Gamepad2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 mb-0.5" />
            <span className="text-[10px] sm:text-xs font-bold truncate">Games</span>
          </button>

          {/* 2. Watch button (In between Games and Runner) */}
          <button
            id="footer-nav-watch"
            type="button"
            onClick={() => {
              sound.playClick();
              setCurrentView('WATCH');
            }}
            className={`flex-1 min-w-0 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[46px] sm:min-h-[50px] touch-manipulation border ${
              currentView === 'WATCH'
                ? 'text-cyan-400 font-black bg-cyan-500/15 border-cyan-500/30 shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-cyan-300 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Tv className="w-4.5 h-4.5 sm:w-5 sm:h-5 mb-0.5 text-cyan-400" />
            <span className="text-[10px] sm:text-xs font-bold truncate text-cyan-300">Watch</span>
          </button>

          {/* 3. Runner button */}
          <button
            id="footer-nav-runner"
            type="button"
            onClick={() => {
              sound.playClick();
              setCurrentView('GAME_RUNNER');
            }}
            className={`flex-1 min-w-0 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[46px] sm:min-h-[50px] touch-manipulation border ${
              currentView === 'GAME_RUNNER'
                ? 'text-amber-400 font-black bg-amber-500/15 border-amber-500/30 shadow-md shadow-amber-950/50'
                : 'text-slate-400 hover:text-amber-300 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <span className="text-base sm:text-lg leading-none mb-0.5">🏃</span>
            <span className="text-[10px] sm:text-xs font-bold truncate">Runner</span>
          </button>

          {/* 4. Daily Rewards button */}
          <button
            id="footer-nav-rewards"
            type="button"
            onClick={() => {
              sound.playClick();
              setCurrentView('REWARDS');
            }}
            className={`flex-1 min-w-0 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[46px] sm:min-h-[50px] touch-manipulation border ${
              currentView === 'REWARDS'
                ? 'text-purple-400 font-black bg-purple-500/15 border-purple-500/30 shadow-md shadow-purple-950/50'
                : 'text-slate-400 hover:text-purple-300 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Gift className="w-4.5 h-4.5 sm:w-5 sm:h-5 mb-0.5" />
            <span className="text-[10px] sm:text-xs font-bold truncate">Daily $1</span>
          </button>

          {/* 5. Leaderboard button */}
          <button
            id="footer-nav-ranks"
            type="button"
            onClick={() => {
              sound.playClick();
              setCurrentView('LEADERBOARD');
            }}
            className={`flex-1 min-w-0 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[46px] sm:min-h-[50px] touch-manipulation border ${
              currentView === 'LEADERBOARD'
                ? 'text-cyan-400 font-black bg-cyan-500/15 border-cyan-500/30 shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-cyan-300 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <Trophy className="w-4.5 h-4.5 sm:w-5 sm:h-5 mb-0.5" />
            <span className="text-[10px] sm:text-xs font-bold truncate">Ranks</span>
          </button>

          {/* 6. Profile button */}
          <button
            id="footer-nav-profile"
            type="button"
            onClick={() => {
              sound.playClick();
              setCurrentView('PROFILE');
            }}
            className={`flex-1 min-w-0 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[46px] sm:min-h-[50px] touch-manipulation border ${
              currentView === 'PROFILE'
                ? 'text-emerald-400 font-black bg-emerald-500/15 border-emerald-500/30 shadow-md shadow-emerald-950/50'
                : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <User className="w-4.5 h-4.5 sm:w-5 sm:h-5 mb-0.5" />
            <span className="text-[10px] sm:text-xs font-bold truncate">Profile</span>
          </button>

        </div>
      </footer>
    </>
  );
};
