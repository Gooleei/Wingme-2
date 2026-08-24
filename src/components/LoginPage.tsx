import React, { useState } from 'react';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Lock, 
  User, 
  Mail, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  KeyRound, 
  Gift, 
  CheckCircle2, 
  AlertCircle,
  UserPlus
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserProfile, bonusAdded?: number) => void;
}

const ACCOUNTS_STORAGE_KEY = 'LUCKYPLAY_REGISTERED_ACCOUNTS_V2';
const AVATARS = ['👑', '⚡', '🤖', '🦊', '🚀', '🔥', '🛡️', '🎯', '🐱', '🎮', '💎', '🐉'];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [tab, setTab] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [promoCode, setPromoCode] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing accounts from local storage
  const getSavedAccounts = (): UserProfile[] => {
    try {
      const data = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return [];
  };

  const saveAccount = (newProfile: UserProfile) => {
    const existing = getSavedAccounts();
    const updated = [...existing.filter(a => a.username.toLowerCase() !== newProfile.username.toLowerCase()), newProfile];
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanUser) {
      setError('Please enter your username or registered email.');
      sound.playWrong();
      return;
    }

    if (!cleanPin || cleanPin.length < 4) {
      setError('PIN must be at least 4 digits.');
      sound.playWrong();
      return;
    }

    const savedAccounts = getSavedAccounts();
    const found = savedAccounts.find(
      (acc) => acc.username.toLowerCase() === cleanUser || (acc.email && acc.email.toLowerCase() === cleanUser)
    );

    if (!found) {
      setError('Account not found. Please click "Register Account" to create a new profile.');
      sound.playWrong();
      return;
    }

    if (found.pin && found.pin !== cleanPin) {
      setError('Incorrect security PIN. Please enter your correct PIN.');
      sound.playWrong();
      return;
    }

    sound.playWin();
    setSuccessMsg(`Welcome back, ${found.username}! Logging you in...`);
    setTimeout(() => {
      onLogin(found);
    }, 400);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = username.trim();
    const cleanEmail = email.trim();
    const cleanPin = pin.trim();

    if (!cleanUser || cleanUser.length < 3) {
      setError('Username must be at least 3 characters long.');
      sound.playWrong();
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please provide a valid email address.');
      sound.playWrong();
      return;
    }

    if (!cleanPin || cleanPin.length < 4) {
      setError('Security PIN must be at least 4 digits.');
      sound.playWrong();
      return;
    }

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Fair Play rules.');
      sound.playWrong();
      return;
    }

    // Check if username or email already registered
    const saved = getSavedAccounts();
    const existing = saved.find(
      (a) => a.username.toLowerCase() === cleanUser.toLowerCase() || (a.email && a.email.toLowerCase() === cleanEmail.toLowerCase())
    );

    if (existing) {
      setError('An account with this username or email already exists. Please switch to Sign In.');
      sound.playWrong();
      return;
    }

    // Check optional promo code
    let bonus = 0;
    const promo = promoCode.trim().toUpperCase();
    if (promo === 'LUCKY2026' || promo === 'RUNNER' || promo === 'BONUS5') {
      bonus = 5.00;
    }

    const newUser: UserProfile = {
      id: `user-${cleanUser.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      username: cleanUser,
      email: cleanEmail,
      pin: cleanPin,
      isGuest: false,
      avatar: selectedAvatar,
      createdAt: new Date().toISOString().split('T')[0],
      level: 1,
      gamesPlayedToday: 0,
      winStreak: 0,
      spinLockedUntil: null
    };

    saveAccount(newUser);
    sound.playWin();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    setSuccessMsg(bonus > 0 ? `🎉 Account created! Claimed +$${bonus.toFixed(2)} Promo Bonus!` : '🎉 Account created successfully! Logging you in...');

    setTimeout(() => {
      onLogin(newUser, bonus);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Ambience */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-emerald-600/15 via-cyan-500/15 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10 space-y-6">
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-xs font-black text-emerald-300 shadow-xl backdrop-blur-md">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Registration or Sign-In Required</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            LuckyPlay{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Rewards Arcade
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto font-medium">
            Create your player profile or log in with your credentials to access games, earn balance, and request crypto withdrawals.
          </p>
        </div>

        {/* Auth Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Arcade Perks */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎮</span>
                <h3 className="text-base font-black text-white">Player Account Perks</h3>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">
                    🏃
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">5-World Endless Runner</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Earn real cash balances per run across Neon City, Desert, Cyber Matrix, Inferno & Space.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0">
                    💎
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Direct Web3 Cashouts</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Instant withdrawal support in USDT, USDC, SOL, BTC, ETH, TON and DOGE.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm font-bold shrink-0">
                    🎁
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Daily Rewards & Egg Scratch</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Claim $1.00 daily login streaks and scratch 100 lucky prize eggs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Account Vault Protection</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Your wallet balance, character unlocks, and run telemetry are safely synced with your unique player ID and security PIN.
              </p>
            </div>
          </div>

          {/* Right Column: Register / Sign In Forms */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-5">
            {/* Tabs */}
            <div className="grid grid-cols-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
              <button
                id="login-tab-signup"
                type="button"
                onClick={() => {
                  setTab('REGISTER');
                  setError(null);
                  sound.playClick();
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  tab === 'REGISTER'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Account</span>
              </button>

              <button
                id="login-tab-signin"
                type="button"
                onClick={() => {
                  setTab('LOGIN');
                  setError(null);
                  sound.playClick();
                }}
                className={`py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  tab === 'LOGIN'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>

            {/* Error or Success Alert */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* REGISTER FORM */}
            {tab === 'REGISTER' && (
              <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Select Avatar
                  </label>
                  <div className="flex flex-wrap gap-2 justify-start">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(av);
                          sound.playClick();
                        }}
                        className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border cursor-pointer transition-all ${
                          selectedAvatar === av
                            ? 'bg-cyan-500/30 border-cyan-400 scale-110 shadow-md shadow-cyan-500/30 ring-2 ring-cyan-400/50'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Choose Username
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-input-username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. CyberRunner"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-input-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="player@domain.com"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      4-Digit Security PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-input-pin"
                        type={showPin ? 'text' : 'password'}
                        required
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold tracking-widest focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Promo Code (Optional)
                    </label>
                    <div className="relative">
                      <Gift className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Code 'LUCKY2026' (+$5)"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-amber-300 text-xs font-semibold uppercase focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-400">
                    <input
                      type="checkbox"
                      required
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>
                      I agree to the <span className="text-slate-300 underline">Terms of Service</span> & Fair Play rules.
                    </span>
                  </label>
                </div>

                <button
                  id="signup-btn-submit"
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-sm transition-all shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Register & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* SIGN IN FORM */}
            {tab === 'LOGIN' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-input-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter registered username or email"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                      Security PIN
                    </label>
                    <span className="text-[10px] text-slate-500 font-bold">Min 4 Digits</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-input-pin"
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={8}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold tracking-widest focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-1">
                  <span>
                    Don't have an account yet?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setTab('REGISTER');
                        setError(null);
                      }}
                      className="text-emerald-400 font-bold hover:underline cursor-pointer"
                    >
                      Register here
                    </button>
                  </span>
                </div>

                <button
                  id="login-btn-submit"
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-sm transition-all shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <Lock className="w-4 h-4 fill-current" />
                  <span>Log In & Enter Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="text-center pt-2 text-[11px] text-slate-500 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Instant Crypto Withdrawals
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Encrypted Account Storage
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
