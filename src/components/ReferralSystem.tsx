import React, { useState, useEffect } from 'react';
import { UserProfile, PlayerStats, ReferralTier, ReferralMember, ReferralNetworkState } from '../types';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { getUserReferralNetwork, saveUserReferralNetwork } from '../utils/referralManager';
import { 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Gift, 
  TrendingUp, 
  Search, 
  Zap, 
  ShieldCheck
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
  // Construct dynamic referral link
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://bellmont.io';
  const referralLink = `${currentOrigin}/?ref=${encodeURIComponent(user.username)}`;

  // Referral Network State - strictly genuine from clean database / store
  const [network, setNetwork] = useState<ReferralNetworkState>(() => {
    return getUserReferralNetwork(user);
  });

  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Reload network if user changes
  useEffect(() => {
    setNetwork(getUserReferralNetwork(user));
  }, [user]);

  useEffect(() => {
    saveUserReferralNetwork(user.id, network);
  }, [network, user.id]);

  // WhatsApp Share Handler
  const handleShareWhatsApp = () => {
    sound.playClick();
    const message = `🚀 Join me on Bellmont Rewards Arcade! Play games, mine diamonds, and earn real cash & crypto rewards. Sign up with my link to start earning: ${referralLink}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Link Handler
  const handleCopyLink = async () => {
    sound.playClick();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = referralLink;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Web Share API fallback
  const handleNativeShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Bellmont Rewards Arcade',
          text: 'Play endless runner, egg matrix, and mine gems to earn crypto rewards!',
          url: referralLink
        });
      } catch {
        // user cancelled share
      }
    } else {
      handleCopyLink();
    }
  };

  // Claim Tier Milestone Reward
  const handleClaimTierReward = (tier: ReferralTier) => {
    if (network.totalReferrals < tier.referralsRequired) return;
    if (network.claimedTiers.includes(tier.referralsRequired)) return;

    sound.playWin();
    confetti({
      particleCount: 100,
      spread: 80,
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
                  Referral Network & WhatsApp Booster
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-medium">
                Share your personal link via WhatsApp. Anyone who downloads and joins with your link earns an instant extra welcome bonus, while you unlock massive multiplier milestone payouts!
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
              <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Direct Network</span>
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
                {network.totalReferrals >= 100
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

          {/* WhatsApp & Link Share Actions */}
          <div className="bg-slate-950/90 border border-emerald-500/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Your Personal Referral Link (Extra Bonus for Friends)
                </label>
                <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-800 text-xs font-mono text-emerald-300 truncate">
                  <span className="truncate">{referralLink}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* WHATSAPP SHARE BUTTON */}
                <button
                  id="btn-share-whatsapp"
                  onClick={handleShareWhatsApp}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer touch-manipulation hover:scale-105 active:scale-95"
                >
                  <span className="text-base">💬</span>
                  <span>Share on WhatsApp</span>
                </button>

                {/* COPY LINK BUTTON */}
                <button
                  id="btn-copy-ref-link"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {/* NATIVE SHARE BUTTON */}
                <button
                  onClick={handleNativeShare}
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                  title="More Share Options"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Genuine Referral Guarantee */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct verified referrals: Every genuine recruit automatically credits your balance and advances your multiplier milestones.</span>
            </div>
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
            Total Potential Rewards: $1,276.80+
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
              Live roster of players who joined using your referral link
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
                Share your WhatsApp link with friends and fellow runners. When they sign up, they will appear right here in your live network and credit your earnings!
              </p>
            </div>
            <button
              id="btn-empty-share-whatsapp"
              onClick={handleShareWhatsApp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Link on WhatsApp</span>
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
