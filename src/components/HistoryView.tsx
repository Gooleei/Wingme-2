import React from 'react';
import { WalletTransaction } from '../types';
import { sound } from '../utils/audio';
import { ArrowLeft, Wallet, ArrowDownRight, ArrowUpRight, Plus, Minus, ExternalLink, ShieldCheck } from 'lucide-react';

interface HistoryViewProps {
  transactions: WalletTransaction[];
  onBack: () => void;
  userBalance: number;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  transactions,
  onBack,
  userBalance
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900/80 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <span>📜 Ledger & Transactions</span>
            </h1>
            <p className="text-xs text-slate-400">Complete audit log of gameplay earnings, penalties, and crypto payouts</p>
          </div>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-right">
          <span className="text-[10px] text-slate-400 block font-bold">Balance</span>
          <span className="text-base font-black text-emerald-400">${userBalance.toFixed(2)}</span>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">No transaction records found yet.</div>
        ) : (
          transactions.map((tx) => {
            const isPositive = tx.type === 'win' || tx.type === 'bonus';
            const isWithdraw = tx.type === 'withdraw';

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-base border ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isWithdraw
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {isPositive ? <Plus className="w-5 h-5" /> : isWithdraw ? <ArrowUpRight className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">{tx.description}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{tx.date}</span>
                      {tx.token && (
                        <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {tx.token}
                        </span>
                      )}
                      {tx.txHash && (
                        <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-0.5">
                          TX: {tx.txHash.substring(0, 10)}...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm sm:text-base font-black ${
                      isPositive
                        ? 'text-emerald-400'
                        : isWithdraw
                        ? 'text-cyan-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                  </div>
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
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
