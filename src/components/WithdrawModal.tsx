import React, { useState } from 'react';
import { PlayerStats, WalletTransaction } from '../types';
import { sound } from '../utils/audio';
import { Wallet, X, Check, ArrowRight, ShieldCheck, Copy, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WithdrawModalProps {
  stats: PlayerStats;
  onWithdraw: (amount: number, token: string, address: string) => void;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  stats,
  onWithdraw,
  onClose
}) => {
  const [token, setToken] = useState('USDT');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState<string>(stats.balance > 0 ? stats.balance.toFixed(2) : '0.00');
  const [isSuccess, setIsSuccess] = useState(false);
  const [receipt, setReceipt] = useState<{ token: string; amount: number; address: string } | null>(null);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) setAddress(text.trim());
      } else {
        const manual = prompt('Paste your crypto wallet address:');
        if (manual) setAddress(manual.trim());
      }
    } catch {
      const manual = prompt('Paste your crypto wallet address:');
      if (manual) setAddress(manual.trim());
    }
  };

  const handleMax = () => {
    setAmount(stats.balance.toFixed(2));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (!address || address.length < 6) {
      alert('Please enter a valid crypto destination wallet address.');
      return;
    }

    if (isNaN(numAmount) || numAmount < 0.5) {
      alert('Minimum withdrawal request is $0.50 USD.');
      return;
    }

    if (numAmount > stats.balance) {
      alert('Insufficient available balance for this request.');
      return;
    }

    onWithdraw(numAmount, token, address);
    setReceipt({ token, amount: numAmount, address });
    setIsSuccess(true);
    sound.playWin();
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full rounded-3xl border border-amber-500/30 p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                Crypto Withdrawal Request
              </h3>
              <p className="text-xs text-slate-400">Direct manual payout to your crypto wallet</p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess && receipt ? (
          <div className="space-y-4 text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-emerald-400 text-3xl">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-100">Withdrawal Submitted!</h4>
              <p className="text-xs text-slate-400">
                Your payout request has been queued. Manual admin fulfillment typically takes 1-24 hours.
              </p>
            </div>

            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Token:</span>
                <span className="text-amber-400 font-bold">{receipt.token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount Requested:</span>
                <span className="text-emerald-400 font-bold">${receipt.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between truncate">
                <span className="text-slate-500">To Wallet Address:</span>
                <span className="text-slate-300 truncate max-w-[150px]">
                  {receipt.address.slice(0, 8)}...{receipt.address.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-amber-400 font-bold">Pending Admin Approval</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl gold-btn text-slate-950 font-black text-xs font-arcade shadow-md transition"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Balance Card */}
            <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Available Cash Balance</span>
                <p className="text-2xl font-black text-amber-300 font-arcade">${stats.balance.toFixed(2)}</p>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                Ready to Cashout
              </div>
            </div>

            {/* Token Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Select Payout Cryptocurrency</label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400 transition"
              >
                <option value="USDT">USDT (Tether - TRC20 / ERC20)</option>
                <option value="USDC">USDC (USD Coin - Solana / Polygon)</option>
                <option value="SOL">SOL (Solana)</option>
                <option value="BTC">BTC (Bitcoin)</option>
                <option value="ETH">ETH (Ethereum)</option>
                <option value="BNB">BNB (Binance Smart Chain)</option>
                <option value="TON">TON (Toncoin)</option>
              </select>
            </div>

            {/* Wallet Address */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Your Wallet Address</label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Paste
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="Enter or paste destination address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono"
              />
            </div>

            {/* Amount */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Withdraw Amount ($ USD)</label>
                <button
                  type="button"
                  onClick={handleMax}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition"
                >
                  Use Max
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">$</span>
                <input
                  type="number"
                  min="0.50"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-7 pr-3 text-sm font-black font-arcade text-slate-100 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
              <p className="text-[10px] text-slate-500">Minimum withdrawal: $0.50 USD</p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl gold-btn text-slate-950 font-black text-xs font-arcade shadow-lg transition active:scale-95 cursor-pointer mt-2"
            >
              Submit Crypto Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
