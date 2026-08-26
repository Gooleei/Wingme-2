import React from 'react';
import { PlayerStats, WalletTransaction } from '../types';
import { sound } from '../utils/audio';
import { ArrowLeft, Wallet, ArrowDownRight, ArrowUpRight, Plus, Minus, ExternalLink, ShieldCheck } from 'lucide-react';

interface HistoryViewProps {
  transactions: WalletTransaction[];
  onBack: () => void;
  userBalance: number;
  stats?: PlayerStats;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  onBack,
  userBalance,
  stats
}) => {
  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 backdrop-blur-sm">
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
              <span>📜 Ledger & Transactions</span>
            </h1>
            <p className="text-xs text-slate-400">Complete audit log of earnings and crypto payouts</p>
          </div>
        </div>

        <div className="bg-slate-950 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-800 text-right">
          <span className="text-[9px] text-slate-400 block font-bold">Balance</span>
          <span className="text-sm sm:text-base font-black text-emerald-400">${userBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 shadow-xl space-y-2.5">
        {transactions.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs sm:text-sm">No transaction records found yet.</div>
        ) : (
          transactions.map((tx) => {
            const isPositive = tx.type === 'win' || tx.type === 'bonus';
            const isWithdraw = tx.type === 'withdraw';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors gap-2"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center text-sm border shrink-0 ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isWithdraw
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isPositive ? <Plus className="w-4 h-4" /> : isWithdraw ? <ArrowUpRight className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">{tx.description}</h4>
                    <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-500 mt-0.5 flex-wrap">
                      <span>{tx.date}</span>
                      {tx.token && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">
                          {tx.token}
                        </span>
                      )}
                      {tx.txHash && (
                        <span className="text-[9px] text-cyan-400 font-mono">
                          TX: {tx.txHash.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div
                    className={`text-xs sm:text-sm font-black ${
                      isPositive
                        ? 'text-emerald-400'
                        : isWithdraw
                        ? 'text-cyan-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                  </div>
                  <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
                    {tx.type}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
