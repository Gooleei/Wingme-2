import React from 'react';
import { sound } from '../utils/audio';
import { Play, Sparkles, Trophy, ShieldCheck, Zap, Coins, ArrowRight, Flame } from 'lucide-react';

interface LandingViewProps {
  onStartGuest: () => void;
  onOpenAuth: () => void;
  onOpenLeaderboard: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onStartGuest,
  onOpenAuth,
  onOpenLeaderboard
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Ambience / Cyber Grid Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-emerald-600/20 via-cyan-500/20 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto text-center space-y-8 relative z-10">
        {/* Top Highlight Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-bold text-slate-200 shadow-xl backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>New: 🏃 5-World Endless Runner Challenge with $33.00 Cash Wins</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Play Arcade Games.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Win Real Cashout Rewards.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium">
            Jump into high-octane endless running, neural Tic Tac Toe AI battles, 1-hour egg matrix marathons, and
            daily cash claims with instant crypto withdrawals.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-xl text-amber-400 border border-amber-500/30">
              🏃
            </div>
            <h3 className="font-extrabold text-white text-base">Endless Runner Challenge</h3>
            <p className="text-xs text-slate-400">
              5 progressive worlds, dodge spikes & laser gates, collect $30 + $3 bonus with -$0.80 obstacle penalty.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-xl text-emerald-400 border border-emerald-500/30">
              🎁
            </div>
            <h3 className="font-extrabold text-white text-base">Daily $1.00 & 7 Mini-Games</h3>
            <p className="text-xs text-slate-400">
              Claim daily countdown bonuses, spin lucky wheels, and scratch matrix eggs for $100 jackpots.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-xl text-cyan-400 border border-cyan-500/30">
              💎
            </div>
            <h3 className="font-extrabold text-white text-base">Instant Crypto Cashout</h3>
            <p className="text-xs text-slate-400">
              Fast withdrawal payouts in USDT, USDC, SOL, BTC, ETH, and TON directly to your web3 wallet.
            </p>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="landing-start-guest"
            onClick={() => {
              sound.playClick();
              onStartGuest();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-base transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Start Playing as Guest</span>
          </button>

          <button
            id="landing-open-auth"
            onClick={() => {
              sound.playClick();
              onOpenAuth();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-base transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>Sign In / Create Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
