import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  processGenuineReferral, 
  purgeLegacyReferralMocks, 
  extractReferralIdentifier, 
  validateReferralCode,
  capturePendingReferralFromUrl,
  getPendingReferral
} from '../utils/referralManager';
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
  Users,
  Check
} from 'lucide-react';
import { AdPlacement } from './AdPlacement';

interface LoginPageProps {
  onLogin: (user: UserProfile, bonusAdded?: number) => void;
  onBackToLanding?: () => void;
  initialTab?: 'REGISTER' | 'LOGIN';
}

const AVATARS = ['👑', '⚡', '🤖', '🦊', '🚀', '🔥', '🛡️', '🎯', '🐱', '🎮', '💎', '🐉'];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBackToLanding, initialTab = 'REGISTER' }) => {
  const [tab, setTab] = useState<'REGISTER' | 'LOGIN'>(initialTab);
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

  // Initialize and detect referral parameters on load
  useEffect(() => {
    purgeLegacyReferralMocks();
    const accounts = getAllAccounts();
    setRegisteredAccountsCount(accounts.length);

    const detectedRef = capturePendingReferralFromUrl();
    if (detectedRef && detectedRef.trim()) {
      setPromoCode(detectedRef.trim());
      setReferrerDetected(detectedRef.trim());
      setTab('REGISTER');
    }
  }, []);

  // Live sensitive real-time validation of the referral code as user types
  const referralValidation = useMemo(() => {
    const activeInput = promoCode.trim() || referrerDetected || '';
    if (!activeInput) return null;
    return validateReferralCode(activeInput, username);
  }, [promoCode, referrerDetected, username]);

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

    if (!cleanUser) {
      setError('Please choose a valid username.');
      sound.playWrong();
      return;
    }

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
    let refereeName = '';

    // Process referral code / link if provided
    const activeRefInput = promoCode.trim() || referrerDetected || getPendingReferral() || '';
    if (activeRefInput) {
      const refResult = processGenuineReferral(activeRefInput, registeredUser);
      if (refResult.success) {
        welcomeBonus = refResult.bonusAmount || 0.80; // $0.80 welcome bonus (= ~₮0.053)
        refereeName = refResult.referrerName || '';
      }
    }

    sound.playWin();
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });

    if (welcomeBonus > 0 && refereeName) {
      setSuccessMsg(
        `🎉 Account created! Connected with referee @${refereeName}. Both of you received +$${welcomeBonus.toFixed(2)} (₮0.05) bonus!`
      );
    } else {
      setSuccessMsg('🎉 Account created successfully! Loading your dashboard...');
    }

    setTimeout(() => {
      onLogin(registeredUser, welcomeBonus);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-3 sm:px-6 py-6 sm:py-10 relative overflow-hidden selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Ambience */}
      <div className="absolute top-1/6 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-600/15 via-cyan-500/15 to-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-lg w-full mx-auto relative z-10 space-y-4">
        {/* Back to Landing Button */}
        {onBackToLanding && (
          <div className="flex justify-start">
            <button
              id="back-to-landing-btn"
              onClick={() => {
                sound.playClick();
                onBackToLanding();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <span>←</span>
              <span>Back to Landing Page</span>
            </button>
          </div>
        )}

        {/* Header Badge */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-emerald-500/30 text-[11px] font-black text-emerald-300 shadow-md backdrop-blur-md">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure Player Authentication</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Bellmont{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Rewards Arcade
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto font-medium">
            Log in to your account or register a new profile. Your wallet balance, referral network, and unlock progress are permanently saved.
          </p>
        </div>

        {/* Centered Auth Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-5 sm:p-7 backdrop-blur-md shadow-2xl space-y-4">
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
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              id="login-tab-register"
              type="button"
              onClick={() => {
                setTab('REGISTER');
                setError(null);
                setSuccessMsg(null);
                sound.playClick();
              }}
              className={`py-2 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'REGISTER'
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
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
                    placeholder="e.g. Op9q or RunnerOne"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Security PIN (4-8 Digits)
                </label>
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
                    Security PIN (4-8 Digits)
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

                {/* SENSITIVE & RESPONSIVE REFERRAL BOX */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3 h-3 text-amber-400" />
                      <span>Referral / Invite Code</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-bold">+$0.80 Bonus</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-input-promo"
                      type="text"
                      value={promoCode}
                      onChange={(e) => {
                        setPromoCode(e.target.value);
                        setReferrerDetected(e.target.value.trim());
                      }}
                      placeholder="e.g. Op9q, REF-OP9Q, or link"
                      className={`w-full pl-3 pr-8 py-2 rounded-xl bg-slate-950 border text-white text-xs font-mono font-semibold focus:outline-none transition-all placeholder:text-slate-600 ${
                        referralValidation?.valid
                          ? 'border-emerald-500/70 bg-emerald-950/20 text-emerald-300'
                          : referralValidation && !referralValidation.valid && promoCode.trim().length > 1
                          ? 'border-amber-500/50 bg-amber-950/20 text-amber-200'
                          : 'border-slate-800 focus:border-cyan-400'
                      }`}
                    />
                    {referralValidation?.valid && (
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-emerald-400">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* LIVE REFERRAL FEEDBACK CARD */}
              {referralValidation && referralValidation.valid && referralValidation.account && (
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-slate-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{referralValidation.account.avatar || '🎮'}</span>
                    <div>
                      <div className="text-white text-[11px] font-black flex items-center gap-1">
                        <span>Referee Verified: @{referralValidation.account.username}</span>
                        <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-black">
                          ACTIVE
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-400/90 font-medium">
                        Both you & @{referralValidation.account.username} get +$0.80 (₮0.05) credited upon signup!
                      </div>
                    </div>
                  </div>
                  <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                </div>
              )}

              {referralValidation && !referralValidation.valid && promoCode.trim().length > 1 && (
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{referralValidation.message || `Referrer "${promoCode.trim()}" not found. Verify spelling (e.g. Op9q).`}</span>
                </div>
              )}

              {!promoCode.trim() && (
                <div className="text-[10px] text-slate-500 flex items-center gap-1 px-1">
                  <Sparkles className="w-3 h-3 text-amber-400/70" />
                  <span>Tip: If invited by a player (e.g. <strong>Op9q</strong>), enter their username or invite link above to receive your welcome bonus.</span>
                </div>
              )}

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

          {/* Sponsor Channel for New & Returning Users */}
          <div className="pt-2">
            <AdPlacement
              zoneId={459144}
              variant="compact"
              title="Official Sponsor Channel (Zone 459144)"
              subtitle="Verified sponsor partner. Tap to explore & support platform games."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
