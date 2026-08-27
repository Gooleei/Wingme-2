import React, { useState } from 'react';
import { UserProfile } from '../types';
import { sound } from '../utils/audio';
import { X, Lock, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authenticateUser, registerAccount } from '../utils/accountManager';

interface AuthModalProps {
  onLogin: (user: UserProfile) => void;
  onClose: () => void;
}

const AVATARS = ['👑', '⚡', '🤖', '🦊', '🚀', '🔥', '🛡️', '🎯', '🐱', '🎮'];

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim();
    const cleanPin = pin.trim();

    if (tab === 'LOGIN') {
      const authResult = authenticateUser(cleanUser, cleanPin);
      if (!authResult.success || !authResult.user) {
        sound.playWrong();
        setError(authResult.error || 'Authentication failed.');
        return;
      }
      sound.playWin();
      onLogin(authResult.user);
      onClose();
      return;
    }

    // Register
    const newProfile: UserProfile = {
      id: `user-${cleanUser.toLowerCase()}-${Date.now().toString().slice(-4)}`,
      username: cleanUser,
      email: email.trim() || `${cleanUser.toLowerCase()}@bellmont.io`,
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
      setError(regResult.error || 'Registration failed.');
      return;
    }

    sound.playWin();
    onLogin(regResult.user);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-black text-white flex items-center justify-center gap-2">
            <span>Bellmont</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Account
            </span>
          </h2>
          <p className="text-xs text-slate-400">Save your cash balance, ₮ points, streaks, and hero unlocks</p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              setTab('LOGIN');
              setError('');
              sound.playClick();
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              tab === 'LOGIN'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('REGISTER');
              setError('');
              sound.playClick();
            }}
            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              tab === 'REGISTER'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'REGISTER' && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Choose Avatar
              </label>
              <div className="flex flex-wrap gap-2 justify-center">
                {AVATARS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border cursor-pointer transition-all ${
                      selectedAvatar === av
                        ? 'bg-emerald-500/30 border-emerald-400 scale-110 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-800 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Username or Registered Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. RunnerOne"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {tab === 'REGISTER' && (
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="runner@crypto.io"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Security PIN (4 Digits)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-semibold tracking-widest focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            {tab === 'LOGIN' ? 'Sign In & Restore Session' : 'Create & Save Account'}
          </button>
        </form>
      </div>
    </div>
  );
};
