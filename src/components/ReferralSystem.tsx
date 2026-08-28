import React, { useState, useEffect } from 'react';
import { UserProfile, PlayerStats, ReferralTier, ReferralNetworkState } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  getUserReferralNetwork, 
  saveUserReferralNetwork,
  getAppDownloadReferralLink,
  getWebReferralLink,
  getUserReferralCode,
  redeemInviteCodeInApp,
  validateReferralCode,
  OFFICIAL_APP_DOWNLOAD_URL
} from '../utils/referralManager';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Gift, 
  TrendingUp, 
  Search, 
  Zap, 
  ShieldCheck,
  Download,
  Smartphone,
  ExternalLink,
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ReferralSystemProps {
  user: UserProfile;
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  onRewardClaimed?: (amount: number, description: string) => void;
}

export const REFERRAL_TIERS: ReferralTier[] = [
  {
    referralsRequired: 1,
    multiplierText: '1X',
    multiplierValue: 1,
    rewardAmount: 0.80,
    title: 'First Recruit',
    badge: 'Starter'
  },
  {
    referralsRequired: 5,
    multiplierText: 'X5',
    multiplierValue: 5,
    rewardAmount: 4.00,
    title: 'Squad Builder',
    badge: 'Bronze'
  },
  {
    referralsRequired: 10,
    multiplierText: 'X10',
    multiplierValue: 10,
    rewardAmount: 8.00,
    title: 'Arcade Captain',
    badge: 'Silver'
  },
  {
    referralsRequired: 20,
    multiplierText: 'X30',
    multiplierValue: 30,
    rewardAmount: 24.00,
    title: 'Guild Master',
    badge: 'Gold'
  },
  {
    referralsRequired: 100,
    multiplierText: 'X150',
    multiplierValue: 150,
    rewardAmount: 120.00,
    title: 'Centurion Legend',
    badge: 'Platinum'
  },
  {
    referralsRequired: 250,
    multiplierText: 'X400',
    multiplierValue: 400,
    rewardAmount: 320.00,
    title: 'Diamond Overlord',
    badge: 'Diamond'
  },
  {
    referralsRequired: 500,
    multiplierText: 'X1,000',
    multiplierValue: 1000,
    rewardAmount: 800.00,
    title: 'Grand Syndicate Tycoon',
    badge: 'Celestial'
  }
];

export const ReferralSystem: React.FC<ReferralSystemProps> = ({
  user,
  stats,
  setStats,
  onRewardClaimed
}) => {
  // Construct dynamic personal download link and promo code
  const appDownloadLink = getAppDownloadReferralLink(user.username);
  const webReferralLink = getWebReferralLink(user.username);
  const personalReferralCode = getUserReferralCode(user.username);

  // Referral Network State
  const [network, setNetwork] = useState<ReferralNetworkState>(() => {
    return getUserReferralNetwork(user);
  });

  const [copiedType, setCopiedType] = useState<'APP_LINK' | 'CODE' | 'WEB_LINK' | 'PITCH' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // In-app referral code redemption state
  const [redeemInput, setRedeemInput] = useState('');
  const [redeemStatus, setRedeemStatus] = useState<{
    type: 'idle' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });
  const [alreadyRedeemedBy, setAlreadyRedeemedBy] = useState<string | null>(null);

  // Check if current user already redeemed an invite code
  useEffect(() => {
    const redeemed = localStorage.getItem('LUCKYPLAY_USER_REDEEMED_REF_' + user.id);
    if (redeemed) {
      setAlreadyRedeemedBy(redeemed);
    }
  }, [user.id]);

  // Reload network if user changes or on referral credit event
  useEffect(() => {
    const handleReferralUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        !customEvent.detail || 
        customEvent.detail.referrerId === user.id || 
        customEvent.detail.referrerUsername?.toLowerCase() === user.username.toLowerCase()
      ) {
        setNetwork(getUserReferralNetwork(user));
      }
    };
    window.addEventListener('luckyplay:referral_credited', handleReferralUpdate);
    setNetwork(getUserReferralNetwork(user));
    return () => {
      window.removeEventListener('luckyplay:referral_credited', handleReferralUpdate);
    };
  }, [user]);

  useEffect(() => {
    saveUserReferralNetwork(user.id, network);
  }, [network, user.id]);

  const copyToClipboard = async (text: string, type: 'APP_LINK' | 'CODE' | 'WEB_LINK' | 'PITCH') => {
    sound.playClick();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    }
  };

  // WhatsApp Share Handler with App Download Link
  const handleShareWhatsApp = () => {
    sound.playClick();
    const message = `🚀 Join me on Bellmont Rewards Arcade!\n\n📲 1. Download the App: ${appDownloadLink}\n🎁 2. Use my Referral Code: ${personalReferralCode} for an instant $0.80 starter bonus!\n🌐 Or play in browser: ${webReferralLink}\n\nPlay Endless Runner, Crack Eggs & Mine Gems for real cash & crypto rewards! 💰`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Telegram Share Handler
  const handleShareTelegram = () => {
    sound.playClick();
    const message = `🚀 Join Bellmont Rewards Arcade! Download the app: ${appDownloadLink} and use my code ${personalReferralCode} to get a $0.80 welcome bonus!`;
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(appDownloadLink)}&text=${encodeURIComponent(message)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  // Web Share API fallback
  const handleNativeShare = async () => {
    sound.playClick();
    const message = `Download Bellmont Rewards Arcade app: ${appDownloadLink} (Code: ${personalReferralCode}) to earn crypto & cash rewards!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Bellmont Rewards Arcade',
          text: message,
          url: appDownloadLink
        });
      } catch {
        // user cancelled
      }
    } else {
      copyToClipboard(appDownloadLink, 'APP_LINK');
    }
  };

  // In-app invite code redemption handler
  const handleRedeemCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemInput.trim()) return;

    sound.playClick();
    const result = redeemInviteCodeInApp(redeemInput.trim(), user);

    if (result.success) {
      sound.playWin();
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });

      // Credit player balance with welcome bonus
      setStats((prev) => ({
        ...prev,
        balance: +(prev.balance + result.bonusAmount).toFixed(2),
        totalCashEarned: +(prev.totalCashEarned + result.bonusAmount).toFixed(2)
      }));

      if (onRewardClaimed) {
        onRewardClaimed(result.bonusAmount, `🎁 Referral Welcome Bonus via ${result.referrerName}`);
      }

      setRedeemStatus({
        type: 'success',
        message: result.message
      });
      setAlreadyRedeemedBy(result.referrerName || 'Friend');
      setRedeemInput('');
    } else {
      sound.playWrong();
      setRedeemStatus({
        type: 'error',
        message: result.message
      });
    }
  };

  // Claim Tier Milestone Reward
  const handleClaimTierReward = (tier: ReferralTier) => {
    if (network.totalReferrals < tier.referralsRequired) return;
    if (network.claimedTiers.includes(tier.referralsRequired)) return;

    sound.playWin();
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 }
    });

    const reward = tier.rewardAmount;

    // Credit user balance
    setStats((prev) => ({
      ...prev,
      balance: +(prev.balance + reward).toFixed(2),
      totalCashEarned: +(prev.totalCashEarned + reward).toFixed(2)
    }));

    // Update claimed tiers
    setNetwork((prev) => ({
      ...prev,
      claimedTiers: [...prev.claimedTiers, tier.referralsRequired],
      totalEarnings: +(prev.totalEarnings + reward).toFixed(2)
    }));

    if (onRewardClaimed) {
      onRewardClaimed(reward, `🏆 Referral Milestone: ${tier.title} (${tier.multiplierText} Bonus +$${reward.toFixed(2)})`);
    }
  };

  // Filtered Network Members
  const filteredMembers = network.networkMembers.filter((m) => {
    const matchesSearch = m.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'ALL') return matchesSearch;
    if (filterStatus === 'ACTIVE') return matchesSearch && m.status === 'Active';
    if (filterStatus === 'VIP') return matchesSearch && m.status.includes('VIP');
    return matchesSearch;
  });

  // Calculate Next Tier Target
  const nextTier = REFERRAL_TIERS.find((t) => network.totalReferrals < t.referralsRequired) || REFERRAL_TIERS[REFERRAL_TIERS.length - 1];
  const progressPercent = Math.min(100, Math.round((network.totalReferrals / nextTier.referralsRequired) * 100));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Referral Program Overview Card */}
      <div className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl">🤝</span>
                <h2 className="text-lg sm:text-2xl font-black text-white">
                  App Download & Referral Network
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
                Share your personal App Download Link or Invite Code. When players download and register with your link, they receive an instant $0.80 welcome bonus, while you earn $0.80 per player plus unlock multiplier tier cash rewards up to $800!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Zap className="w-3.5 h-3.5" />
                <span>Base: $0.80 / Friend</span>
              </span>
            </div>
          </div>

          {/* Network Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Total Recruits
              </span>
              <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5 flex items-center justify-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{network.totalReferrals}</span>
              </div>
              <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Verified Recruits</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Total Earned
              </span>
              <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                ${network.totalEarnings.toFixed(2)}
              </div>
              <span className="text-[9px] text-cyan-400 font-semibold block mt-0.5">
                ₮{(network.totalEarnings / 15).toFixed(2)} Points
              </span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Active Multiplier
              </span>
              <div className="text-xl sm:text-2xl font-black text-amber-400 mt-0.5">
                {network.totalReferrals >= 500
                  ? 'X1,000'
                  : network.totalReferrals >= 250
                  ? 'X400'
                  : network.totalReferrals >= 100
                  ? 'X150'
                  : network.totalReferrals >= 20
                  ? 'X30'
                  : network.totalReferrals >= 10
                  ? 'X10'
                  : network.totalReferrals >= 5
                  ? 'X5'
                  : '1X'}
              </div>
              <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Tier Bonus Rate</span>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 text-center">
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Next Milestone
              </span>
              <div className="text-lg sm:text-xl font-black text-cyan-300 mt-0.5">
                {nextTier.multiplierText} (${nextTier.rewardAmount.toFixed(2)})
              </div>
              <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
                {Math.max(0, nextTier.referralsRequired - network.totalReferrals)} more needed
              </span>
            </div>
          </div>

          {/* Next Tier Progress Bar */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">
                Next Tier: <strong className="text-emerald-400">{nextTier.title} ({nextTier.multiplierText})</strong>
              </span>
              <span className="text-slate-400 font-mono">
                {network.totalReferrals} / {nextTier.referralsRequired} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* PERSONAL APP DOWNLOAD LINK & REFERRAL CODE SECTION */}
          <div className="bg-slate-950/95 border border-emerald-500/30 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                  Your Personal Download Link & Referral Code
                </h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Official bit.ly App Link
              </span>
            </div>

            {/* Official App Download Link Bar */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-300">
                  <Download className="w-3.5 h-3.5" />
                  <span>Personal App Download Link (Bit.ly)</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Auto-tracks your username</span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 flex items-center gap-2 bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 truncate">
                  <span className="text-slate-500 select-none">🔗</span>
                  <span className="truncate font-semibold select-all">{appDownloadLink}</span>
                </div>

                <button
                  id="btn-copy-download-link"
                  onClick={() => copyToClipboard(appDownloadLink, 'APP_LINK')}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer touch-manipulation hover:scale-105 active:scale-95"
                >
                  {copiedType === 'APP_LINK' ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                      <span>Copied Download Link!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Download Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Referral Code & Web Link Split Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Unique Promo Code Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Your Unique Invite Code
                  </span>
                  <div className="text-base sm:text-lg font-black text-amber-400 tracking-wider font-mono mt-0.5">
                    {personalReferralCode}
                  </div>
                </div>

                <button
                  id="btn-copy-promo-code"
                  onClick={() => copyToClipboard(personalReferralCode, 'CODE')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedType === 'CODE' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Web Arcade Link Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Web Arcade Direct Link
                  </span>
                  <div className="text-xs font-mono text-cyan-300 truncate mt-0.5">
                    {webReferralLink}
                  </div>
                </div>

                <button
                  id="btn-copy-web-link"
                  onClick={() => copyToClipboard(webReferralLink, 'WEB_LINK')}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copiedType === 'WEB_LINK' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Web</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
              {/* WhatsApp Share Button */}
              <button
                id="btn-share-whatsapp-primary"
                onClick={handleShareWhatsApp}
                className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer touch-manipulation hover:scale-105 active:scale-95"
              >
                <span className="text-base">💬</span>
                <span>Share on WhatsApp</span>
              </button>

              {/* Telegram Share Button */}
              <button
                id="btn-share-telegram"
                onClick={handleShareTelegram}
                className="px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation"
              >
                <span className="text-base">✈️</span>
                <span>Telegram</span>
              </button>

              {/* Native Mobile Share Button */}
              <button
                id="btn-native-share"
                onClick={handleNativeShare}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="System Share Sheet"
              >
                <Share2 className="w-4 h-4 text-slate-300" />
                <span>Share More</span>
              </button>
            </div>

            {/* Genuine Referral Guarantee */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Guaranteed Fair Play: Each genuine recruit joining via your download link automatically credits +$0.80 to your balance.
              </span>
            </div>
          </div>

          {/* IN-APP REDEEM FRIEND'S INVITE CODE CARD */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl sm:rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs sm:text-sm font-black text-white">
                  Downloaded the App from a Friend's Link?
                </h3>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Claim $0.80 Bonus
              </span>
            </div>

            {alreadyRedeemedBy ? (
              <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  You successfully redeemed an invite code and joined <strong>{alreadyRedeemedBy}</strong>'s network! Welcome bonus credited.
                </span>
              </div>
            ) : (
              <form onSubmit={handleRedeemCode} className="space-y-2">
                <p className="text-xs text-slate-300">
                  If you downloaded via <code className="text-emerald-400 font-mono text-[11px]">{OFFICIAL_APP_DOWNLOAD_URL}</code> or received an invite code, enter your friend's code or link below to claim your $0.80 instant welcome bonus.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={redeemInput}
                    onChange={(e) => setRedeemInput(e.target.value)}
                    placeholder="Enter friend's code (e.g. REF-ALEX or https://bit.ly/3UntvRh?ref=alex)"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 touch-manipulation hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Redeem $0.80 Bonus</span>
                  </button>
                </div>

                {redeemStatus.type !== 'idle' && (
                  <div
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${
                      redeemStatus.type === 'success'
                        ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                        : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                    }`}
                  >
                    {redeemStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{redeemStatus.message}</span>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Referral Milestone Multipliers Ladder */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span>Milestone Multipliers & Cash Rewards</span>
            </h3>
            <p className="text-xs text-slate-400">
              Unlock scaling tier cash bonuses as your referral network expands
            </p>
          </div>
          <span className="text-xs text-amber-400 font-bold">
            Total Potential Milestone Rewards: $1,276.80+
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
          {REFERRAL_TIERS.map((tier) => {
            const isUnlocked = network.totalReferrals >= tier.referralsRequired;
            const isClaimed = network.claimedTiers.includes(tier.referralsRequired);

            return (
              <div
                key={tier.referralsRequired}
                className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isClaimed
                    ? 'bg-slate-950/80 border-emerald-500/30 text-slate-300'
                    : isUnlocked
                    ? 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 border-amber-400/60 ring-1 ring-amber-400/40 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/50 border-slate-800/80 opacity-80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-extrabold flex items-center justify-center">
                        {tier.referralsRequired}
                      </span>
                      <span>Refer {tier.referralsRequired} {tier.referralsRequired === 1 ? 'Friend' : 'Friends'}</span>
                    </span>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        tier.multiplierValue >= 100
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                          : tier.multiplierValue >= 30
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      }`}
                    >
                      {tier.multiplierText} Multiplier
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between mt-2">
                    <div>
                      <div className="text-lg sm:text-xl font-black text-emerald-400">
                        +${tier.rewardAmount.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        {tier.title} • ₮{(tier.rewardAmount / 15).toFixed(2)} pts
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                  {isClaimed ? (
                    <div className="w-full py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-center text-xs font-black flex items-center justify-center gap-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Reward Claimed</span>
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleClaimTierReward(tier)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all hover:scale-105 active:scale-95"
                    >
                      <Gift className="w-3.5 h-3.5 fill-current" />
                      <span>Claim ${tier.rewardAmount.toFixed(2)} Cash</span>
                    </button>
                  ) : (
                    <div className="w-full py-1.5 rounded-lg bg-slate-900 text-slate-500 text-center text-xs font-bold border border-slate-800">
                      Need {tier.referralsRequired - network.totalReferrals} more referrals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Referral Network Members Roster */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>My Referral Network ({network.networkMembers.length} Members)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live roster of players who joined using your download link or invite code
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search network..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-emerald-400"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              <option value="ALL">All Members</option>
              <option value="ACTIVE">Active</option>
              <option value="VIP">VIP Tier</option>
            </select>
          </div>
        </div>

        {/* Network Member List */}
        {filteredMembers.length === 0 ? (
          <div className="py-10 text-center bg-slate-950/60 rounded-xl border border-slate-800 space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-200 font-bold">Your referral network count starts at 0</p>
              <p className="text-xs text-slate-400 font-medium max-w-md mx-auto mt-1">
                Share your personal App Download Link (<span className="text-emerald-400 font-mono text-[11px]">{appDownloadLink}</span>) with friends and fellow runners. When they sign up, they will appear right here in your live network and credit your earnings!
              </p>
            </div>
            <button
              id="btn-empty-share-whatsapp"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Download Link on WhatsApp</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl sm:rounded-2xl bg-slate-950/70 hover:bg-slate-950 border border-slate-800/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg shrink-0">
                    {member.avatar}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                        {member.username}
                      </span>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        {member.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Joined {member.joinedDate} • {member.activityCount} games played
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                    Commission
                  </span>
                  <div className="text-xs sm:text-sm font-black text-emerald-400">
                    +${member.earnedForYou.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
