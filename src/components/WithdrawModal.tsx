import React, { useState } from 'react';
import { PlayerStats } from '../types';
import { sound } from '../utils/audio';
import { 
  Wallet, 
  X, 
  Check, 
  ShieldCheck, 
  Copy, 
  AlertCircle, 
  Info,
  DollarSign,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
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
  const MIN_WITHDRAW = 600;
  const MAX_WITHDRAW = 1000;
  const FEE_RATE = 0.005; // 0.50% charge rate

  const [token, setToken] = useState('USDT');
  const [address, setAddress] = useState('');
  
  // Default amount to either user's balance capped at 1000 or min 600
  const initialAmount = stats.balance >= MIN_WITHDRAW 
    ? Math.min(stats.balance, MAX_WITHDRAW).toFixed(2)
    : '600.00';
  
  const [amount, setAmount] = useState<string>(initialAmount);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [receipt, setReceipt] = useState<{ 
    token: string; 
    amount: number; 
    fee: number; 
    netAmount: number; 
    address: string 
  } | null>(null);

  const numAmount = parseFloat(amount) || 0;
  const calculatedFee = +(numAmount * FEE_RATE).toFixed(2);
  const calculatedNetAmount = +(numAmount - calculatedFee).toFixed(2);
  const hasMinimumEarnings = stats.balance >= MIN_WITHDRAW;

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
    const maxPossible = Math.min(stats.balance, MAX_WITHDRAW);
    setAmount(maxPossible > 0 ? maxPossible.toFixed(2) : '600.00');
    setErrorMsg(null);
  };

  const handleQuickAmount = (val: number) => {
    setAmount(val.toFixed(2));
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!address || address.trim().length < 6) {
      setErrorMsg('Please enter a valid crypto destination wallet address.');
      return;
    }

    if (stats.balance < MIN_WITHDRAW) {
      setErrorMsg(`Minimum required earnings to withdraw is $${MIN_WITHDRAW}.00 USD. Your balance is currently $${stats.balance.toFixed(2)} USD.`);
      return;
    }

    if (isNaN(numAmount) || numAmount < MIN_WITHDRAW) {
      setErrorMsg(`Minimum withdrawal per request is $${MIN_WITHDRAW}.00 USD.`);
      return;
    }

    if (numAmount > MAX_WITHDRAW) {
      setErrorMsg(`Maximum withdrawal per request is $${MAX_WITHDRAW}.00 USD.`);
      return;
    }

    if (numAmount > stats.balance) {
      setErrorMsg(`Insufficient available balance ($${stats.balance.toFixed(2)} available).`);
      return;
    }

    const fee = +(numAmount * FEE_RATE).toFixed(2);
    const netAmount = +(numAmount - fee).toFixed(2);

    onWithdraw(numAmount, token, address.trim());
    setReceipt({ 
      token, 
      amount: numAmount, 
      fee, 
      netAmount, 
      address: address.trim() 
    });
    setIsSuccess(true);
    sound.playWin();
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div 
        id="withdraw-modal-card"
        className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl border border-amber-500/30 p-4 sm:p-6 space-y-3.5 sm:space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 my-auto text-white relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                Crypto Withdrawal Request
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400">Direct manual payout to your crypto wallet</p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition cursor-pointer shrink-0"
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
              <h4 className="text-lg font-black text-slate-100">Withdrawal Queued!</h4>
              <p className="text-xs text-slate-400">
                Your payout request has been queued. Manual admin fulfillment typically takes 1-24 hours.
              </p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-left space-y-2.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Selected Token:</span>
                <span className="text-amber-400 font-bold">{receipt.token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requested Amount:</span>
                <span className="text-white font-bold">${receipt.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span className="text-slate-400">Service Fee (0.50%):</span>
                <span>-${receipt.fee.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-sm">
                <span className="text-slate-300 font-bold">Net Payout:</span>
                <span className="text-emerald-400 font-black font-arcade">${receipt.netAmount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between truncate pt-1 border-t border-slate-800/60">
                <span className="text-slate-400">Destination:</span>
                <span className="text-slate-300 truncate max-w-[170px]">
                  {receipt.address.slice(0, 8)}...{receipt.address.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status:</span>
                <span className="text-amber-400 font-bold">Pending Admin Approval</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3.5 rounded-2xl gold-btn text-slate-950 font-black text-xs font-arcade shadow-md transition cursor-pointer"
            >
              Done & Return
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Balance & Threshold Status Card */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Available Balance</span>
                  <p className="text-2xl sm:text-3xl font-black text-amber-300 font-arcade">${stats.balance.toFixed(2)}</p>
                  <p className="text-xs text-cyan-300 font-bold font-mono">
                    <span className="text-cyan-400 font-black">₮</span>{(stats.balance / 15).toFixed(2)} Points <span className="text-[10px] text-slate-400">($15 = ₮1)</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Rule Thresholds</span>
                  <div className="text-xs text-slate-300 font-medium">Min: <strong className="text-emerald-400 font-black">${MIN_WITHDRAW}</strong> <span className="text-[10px] text-cyan-400 font-mono">(₮40)</span></div>
                  <div className="text-xs text-slate-300 font-medium">Max: <strong className="text-cyan-400 font-black">${MAX_WITHDRAW}</strong> <span className="text-[10px] text-cyan-400 font-mono">(₮66.67)</span></div>
                </div>
              </div>

              {/* Progress bar to $600 minimum if not yet reached */}
              {!hasMinimumEarnings ? (
                <div className="pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Progress to Min Withdrawal ($600)
                    </span>
                    <span className="text-slate-400 font-bold">
                      {Math.min(100, Math.round((stats.balance / MIN_WITHDRAW) * 100))}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (stats.balance / MIN_WITHDRAW) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Earn ${(MIN_WITHDRAW - stats.balance).toFixed(2)} more in games to qualify for cashout.
                  </p>
                </div>
              ) : (
                <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Minimum $600 threshold unlocked!
                  </span>
                  <span className="text-slate-400 font-medium">0.50% fee rate</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Token Selector */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Select Payout Cryptocurrency</label>
              <select
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-xs font-bold text-slate-100 focus:outline-none focus:border-amber-400 transition cursor-pointer"
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

            {/* Destination Wallet Address */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Destination Wallet Address</label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" /> Paste
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="Enter or paste your destination wallet address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition font-mono"
              />
            </div>

            {/* Amount & Fee Breakdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Withdraw Amount ($ USD)</label>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Min $600 · Max $1,000</span>
                  <button
                    type="button"
                    onClick={handleMax}
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-bold transition cursor-pointer"
                  >
                    Max
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-xs">$</span>
                <input
                  type="number"
                  min={MIN_WITHDRAW}
                  max={MAX_WITHDRAW}
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-7 pr-3 text-sm font-black font-arcade text-slate-100 focus:outline-none focus:border-amber-400 transition"
                />
              </div>

              {/* Quick selection chips */}
              <div className="grid grid-cols-4 gap-2 pt-0.5">
                {[600, 750, 900, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickAmount(preset)}
                    className={`py-1.5 rounded-lg border text-xs font-bold transition cursor-pointer ${
                      numAmount === preset
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Fee & Net Calculation Breakdown */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Request:</span>
                  <span className="text-slate-200 font-bold">${numAmount > 0 ? numAmount.toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    Processing Charge Rate:
                    <span className="text-[10px] text-amber-400 font-bold">(0.50%)</span>
                  </span>
                  <span className="text-rose-400">-${calculatedFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1.5 font-bold">
                  <span className="text-emerald-400">Net Amount to Receive:</span>
                  <span className="text-emerald-400 font-arcade text-sm">
                    ${calculatedNetAmount > 0 ? calculatedNetAmount.toFixed(2) : '0.00'} USD
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={stats.balance < MIN_WITHDRAW}
              className={`w-full py-3.5 rounded-2xl font-black text-xs font-arcade shadow-lg transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer mt-2 ${
                stats.balance >= MIN_WITHDRAW
                  ? 'gold-btn text-slate-950'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <span>{stats.balance >= MIN_WITHDRAW ? 'Submit Withdrawal ($600 - $1,000)' : `Need $${MIN_WITHDRAW} to Unlock Cashout`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
