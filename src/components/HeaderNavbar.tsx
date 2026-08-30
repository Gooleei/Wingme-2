import React from 'react';
import { AppView, UserProfile } from '../types';
import { 
  Flame, 
  Wallet, 
  Volume2, 
  VolumeX, 
  ArrowLeft, 
  User, 
  Gift, 
  Gamepad2, 
  Tv 
} from 'lucide-react';
import { sound } from '../utils/audio';
import { formatCurrency, formatPoints } from '../utils/formatters';
import { UniversalBottomAdBanner } from './AdPlacement';

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
      {/* TOP HEADER BAR: CAROUSEL SIDE SCROLL */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none no-scrollbar snap-x touch-pan-x scroll-smooth">
          
          {/* Left Item: App Name "Bellmont" or Back Button */}
          <div className="flex items-center gap-2 shrink-0 snap-start">
            {isSecondaryView ? (
              <button
                id="nav-back-button"
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCurrentView('DASHBOARD');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-emerald-400 hover:text-emerald-300 font-bold text-xs sm:text-sm transition-all cursor-pointer border border-emerald-500/30 shadow-md shadow-emerald-950/40 min-h-[38px] touch-manipulation shrink-0"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back</span>
              </button>
            ) : (
              <div 
                onClick={() => setCurrentView('DASHBOARD')}
                className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                  <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400 text-xs sm:text-sm">
                    BM
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-black tracking-tight text-sm sm:text-base text-white whitespace-nowrap">
                    Bellmont
                  </span>
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    PRO
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right Carousel Slide Items: Balance, ₮ Points, Sound, Streak */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 snap-end">
            
            {/* Wallet Balance Pill */}
            <button
              id="header-balance-chip"
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenWithdraw();
              }}
              title={`Click to Withdraw Balance: $${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ($15 = ₮1)`}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-400 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer touch-manipulation min-h-[38px] shrink-0 active:scale-95"
            >
              <Wallet className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-mono font-black">{formatCurrency(balance)}</span>
            </button>

            {/* ₮ Points Pill */}
            <button
              id="header-tpoints-chip"
              type="button"
              onClick={() => {
                sound.playClick();
                onOpenWithdraw();
              }}
              title={`Accumulated ₮ Points: ₮${(balance / 15).toLocaleString('en-US', { minimumFractionDigits: 2 })} ($15 = ₮1)`}
              className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-500/40 text-cyan-300 font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer touch-manipulation min-h-[38px] shrink-0 active:scale-95"
            >
              <span className="font-mono font-black">{formatPoints(balance / 15)}</span>
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
              className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700 cursor-pointer touch-manipulation shrink-0"
            >
              {soundOn ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Streak Counter */}
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shrink-0">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{streak}d</span>
            </div>

          </div>

        </div>
      </header>

      {/* UNIVERSAL STICKY FOOTER NAVIGATION BAR (VISIBLE ON BOTH WEB AND MOBILE) */}
      <footer 
        id="universal-footer-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl safe-area-bottom px-2 pb-1"
      >
        <UniversalBottomAdBanner className="border-b border-slate-800/50 mb-1" />
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

          {/* 5. Mine (Tap to Win) button */}
          <button
            id="footer-nav-mine"
            type="button"
            onClick={() => {
              sound.playClick();
              setCurrentView('MINE');
            }}
            className={`flex-1 min-w-0 py-1.5 sm:py-2 px-1 sm:px-2 rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center min-h-[46px] sm:min-h-[50px] touch-manipulation border ${
              currentView === 'MINE'
                ? 'text-cyan-300 font-black bg-cyan-500/20 border-cyan-400/50 shadow-md shadow-cyan-950/50'
                : 'text-slate-400 hover:text-cyan-300 border-transparent hover:bg-slate-800/40'
            }`}
          >
            <span className="text-lg sm:text-xl mb-0.5 leading-none">💎</span>
            <span className="text-[10px] sm:text-xs font-bold truncate">Mine</span>
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
