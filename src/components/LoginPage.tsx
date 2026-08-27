import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { processGenuineReferral, purgeLegacyReferralMocks, extractReferralIdentifier } from '../utils/referralManager';
import { 
  authenticateUser, 
  registerAccount, 
  getAllAccounts, 
  findAccount,
  SEED_ACCOUNTS
} from '../utils/accountManager';
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
  UserPlus,
  Users
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: UserProfile, bonusAdded?: number) => void;
}

const AVATARS = ['👑', '⚡', '🤖', '🦊', '🚀', '🔥', '🛡️', '🎯', '🐱', '🎮', '💎', '🐉'];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [tab, setTab] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [promoCode, setPromoCode] = useState('');
  const [referrerDetected, setReferrerDetected] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [registeredAccountsCount, setRegisteredAccountsCount] = useState<number>(0);

  // Initialize and detect referral query params on load (e.g. ?ref=RunnerOne or ?referrer=RunnerOne)
  useEffect(() => {
    purgeLegacyReferralMocks();
    const accounts = getAllAccounts();
    setRegisteredAccountsCount(accounts.length);

    if (typeof window !== 'undefined' && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('referrer') || params.get('code');
      if (ref && ref.trim()) {
        const cleanRef = extractReferralIdentifier(ref.trim());
        setPromoCode(cleanRef);
        setReferrerDetected(cleanRef);
        setTab('REGISTER');
      }
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const authResult = authenticateUser(username, pin);

    if (!authResult.success || !authResult.user) {
      sound.playWrong();
      setError(authResult.error || 'Login failed. Please check your credentials.');
      return;
    }

    const verifiedUser = authResult.user;
    sound.playWin();
    setSuccessMsg(`Welcome back, ${verifiedUser.username}! Loading your wallet & stats...`);

    setTimeout(() => {
      onLogin(verifiedUser);
    }, 350);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!agreeTerms) {
      setError('You must agree to the Terms of Service & Fair Play rules.');
      sound.playWrong();
      return;
    }

    const cleanUser = username.trim();
    const cleanEmail = email.trim();
    const cleanPin = pin.trim();

    const newProfile: UserProfile = {
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

    const regResult = registerAccount(newProfile);
    if (!regResult.success || !regResult.user) {
      sound.playWrong();
      setError(regResult.error || 'Registration failed. Please try a different username.');
      return;
    }

    const registeredUser = regResult.user;
    let welcomeBonus = 0;

    // Process referral code / link if provided
    const refTarget = referrerDetected || promoCode;
    if (refTarget && refTarget.trim()) {
      const refResult = processGenuineReferral(refTarget.trim(), registeredUser);
      if (refResult.success) {
        welcomeBonus = 0.80; // $0.80 welcome bonus
      }
    }

    sound.playWin();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    setSuccessMsg(
      welcomeBonus > 0 
        ? `🎉 Account created! You received a $${welcomeBonus.toFixed(2)} welcome referral bonus!` 
        : '🎉 Account created successfully! Logging you in...'
    );

    setTimeout(() => {
      onLogin(registeredUser, welcomeBonus);
    }, 450);
  };

  const handleQuickFillDemo = (demoUser: typeof SEED_ACCOUNTS[0]) => {
    sound.playClick();
    setUsername(demoUser.username);
    setPin(demoUser.pin);
    setTab('LOGIN');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-3 sm:px-6 py-6 sm:py-8 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Ambience */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/15 via-cyan-500/15 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto relative z-10 space-y-4 sm:space-y-5">
        {/* Header Badge */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[11px] font-black text-emerald-300 shadow-md backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Player Authentication</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Bellmont{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Rewards Arcade
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto font-medium">
            Log in to your player account or register a new profile. Your wallet balance, unlock progress, and referral network are permanently saved.
          </p>
        </div>

        {/* Auth Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
          {/* Left Column: Arcade Perks & Quick Access */}
          <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 backdrop-blur-md flex flex-col justify-between space-y-4 shadow-xl">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎮</span>
                  <h3 className="text-sm sm:text-base font-black text-white">Player Account Perks</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Auto-Save Active
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold shrink-0">
                    🏃
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">5-World Endless Runner</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Earn real cash balances per run across Neon City, Desert, Cyber Matrix, Inferno & Space.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                    💎
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Direct Web3 Cashouts</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Instant withdrawal support in USDT, USDC, SOL, BTC, ETH, TON and DOGE.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-950/70 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0">
                    🤝
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">App Download Referrals</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Earn $0.80 per recruit and unlock tier multipliers up to $800 in milestone bonuses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Demo Login Preset Buttons */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="flex items-center gap-1 text-cyan-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>Quick Test Accounts</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">PIN: 1234</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SEED_ACCOUNTS.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleQuickFillDemo(demo)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>{demo.avatar}</span>
                    <span>{demo.username}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Register / Sign In Forms */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-xl space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                id="login-tab-signin"
                type="button"
                onClick={() => {
                  setTab('LOGIN');
                  setError(null);
                  setSuccessMsg(null);
                  sound.playClick();
                }}
                className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'LOGIN'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-sm shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                id="login-tab-signup"
                type="button"
                onClick={() => {
                  setTab('REGISTER');
                  setError(null);
                  setSuccessMsg(null);
                  sound.playClick();
                }}
                className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  tab === 'REGISTER'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Account</span>
              </button>
            </div>

            {/* Error or Success Alert */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  {error.includes('does not exist') && (
                    <div className="mt-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setTab('REGISTER');
                          setError(null);
                        }}
                        className="text-[11px] text-cyan-300 hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Click here to create this account now</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {tab === 'LOGIN' && (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Username or Registered Email
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-input-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. RunnerOne or runner@bellmont.io"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                      4-Digit Security PIN
                    </label>
                    <span className="text-[10px] text-slate-500 font-bold">Min 4 Digits</span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-input-pin"
                      type={showPin ? 'text' : 'password'}
                      required
                      maxLength={8}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold tracking-widest focus:outline-none focus:border-emerald-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-0.5 flex items-center justify-between">
                  <span>
                    Need a new profile?{' '}
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 hover:from-emerald-400 hover:to-cyan-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                >
                  <Lock className="w-4 h-4 fill-current" />
                  <span>Log In & Restore Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* REGISTER FORM */}
            {tab === 'REGISTER' && (
              <form onSubmit={handleSignUp} className="space-y-3">
                {referrerDetected && (
                  <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Invited by <strong className="text-white">@{referrerDetected}</strong> (+$0.80 Bonus)
                      </span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-black shrink-0">
                      Linked
                    </span>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Select Avatar
                  </label>
                  <div className="flex flex-wrap gap-1.5 justify-start">
                    {AVATARS.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(av);
                          sound.playClick();
                        }}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center border cursor-pointer transition-all ${
                          selectedAvatar === av
                            ? 'bg-cyan-500/30 border-cyan-400 scale-105 shadow-sm shadow-cyan-500/30 ring-1 ring-cyan-400/50'
                            : 'bg-slate-950 border-slate-800 hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Choose Username
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-input-username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. CyberRunner"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-input-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="player@domain.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                      4-Digit Security PIN
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-input-pin"
                        type={showPin ? 'text' : 'password'}
                        required
                        maxLength={8}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold tracking-widest focus:outline-none focus:border-cyan-400"
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
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1 flex items-center justify-between">
                      <span>Referral / Invite Code</span>
                      <span className="text-[10px] text-amber-400 font-bold">+$0.80 Welcome Bonus</span>
                    </label>
                    <div className="relative">
                      <Gift className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="signup-input-promo"
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="e.g. RunnerOne or REF-RUNNERONE"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono font-semibold focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-slate-400">
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
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-md shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
                >
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Register & Open Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            <div className="text-center pt-1 text-[10px] text-slate-500 flex items-center justify-center gap-4 flex-wrap">
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
