import { ReferralMember, ReferralNetworkState, UserProfile, PlayerStats } from '../types';

const REFERRAL_KEY_PREFIX = 'LUCKYPLAY_REFERRAL_NETWORK_';
const ACCOUNTS_KEYS = ['LUCKYPLAY_REGISTERED_ACCOUNTS_V2', 'LUCKYPLAY_REGISTERED_ACCOUNTS'];
const STORAGE_KEY = 'LUCKYPLAY_RUNNER_STATS';
const RESET_FLAG_KEY = 'LUCKYPLAY_REFERRAL_CLEAN_RESET_V3';

/**
 * Perform a clean system-wide purge of all legacy mock / simulated referral data.
 * All referral counters and networks are set to 0.
 */
export function purgeLegacyReferralMocks(): void {
  if (typeof window === 'undefined') return;

  try {
    const isReset = localStorage.getItem(RESET_FLAG_KEY);
    if (!isReset) {
      // Find all referral keys and wipe or reset to clean 0 state
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith(REFERRAL_KEY_PREFIX) || key.includes('REFERRAL'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem(RESET_FLAG_KEY, 'true');
    }
  } catch (err) {
    console.error('Error purging referral mocks:', err);
  }
}

/**
 * Force reset every referral record to 0 across the entire system.
 */
export function resetEntireReferralSystemToZero(): void {
  if (typeof window === 'undefined') return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith(REFERRAL_KEY_PREFIX) || key.includes('REFERRAL'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(RESET_FLAG_KEY, 'true');
  } catch (err) {
    console.error('Error in resetEntireReferralSystemToZero:', err);
  }
}

/**
 * Retrieve referral network state for a specific user.
 * Guaranteed 0 mockup / 0 artificial data.
 */
export function getUserReferralNetwork(user: UserProfile): ReferralNetworkState {
  purgeLegacyReferralMocks();

  const storageKey = `${REFERRAL_KEY_PREFIX}${user.id}`;
  const referralCode = `REF-${user.username.toUpperCase().replace(/\s+/g, '')}`;

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure no mock data leaked through
      if (parsed && typeof parsed.totalReferrals === 'number') {
        // Filter out any known legacy mock IDs if present
        const cleanMembers = (parsed.networkMembers || []).filter(
          (m: ReferralMember) => m.id && !m.id.startsWith('ref-alex') && !m.id.startsWith('ref-crypto') && !m.id.startsWith('ref-matrix')
        );

        return {
          referralCode,
          totalReferrals: cleanMembers.length,
          totalEarnings: cleanMembers.reduce((acc: number, m: ReferralMember) => acc + (m.earnedForYou || 0), 0),
          claimedTiers: parsed.claimedTiers || [],
          networkMembers: cleanMembers
        };
      }
    }
  } catch (err) {
    console.error('Error reading user referral network:', err);
  }

  // Pristine clean initial state (0 referrals)
  return {
    referralCode,
    totalReferrals: 0,
    totalEarnings: 0,
    claimedTiers: [],
    networkMembers: []
  };
}

/**
 * Save user referral network state.
 */
export function saveUserReferralNetwork(userId: string, network: ReferralNetworkState): void {
  try {
    localStorage.setItem(`${REFERRAL_KEY_PREFIX}${userId}`, JSON.stringify(network));
  } catch (err) {
    console.error('Error saving referral network:', err);
  }
}

/**
 * Process a genuine referral when a new user signs up with a referrer's code or link.
 * Credits the referrer's network and real balance (+0.80 base reward).
 */
export function processGenuineReferral(referrerIdentifier: string, newUser: UserProfile): boolean {
  if (!referrerIdentifier || !newUser) return false;

  try {
    let accounts: UserProfile[] = [];
    for (const key of ACCOUNTS_KEYS) {
      const rawAccounts = localStorage.getItem(key);
      if (rawAccounts) {
        try {
          const parsed = JSON.parse(rawAccounts);
          if (Array.isArray(parsed)) {
            accounts = [...accounts, ...parsed];
          }
        } catch {
          // ignore
        }
      }
    }

    if (accounts.length === 0) return false;

    const cleanRef = referrerIdentifier.trim().toLowerCase().replace(/^ref-/, '');

    // Find the referrer account in registered accounts
    const referrer = accounts.find(
      (a) => a.username.toLowerCase() === cleanRef || 
             a.id.toLowerCase() === cleanRef ||
             `ref-${a.username.toLowerCase()}` === referrerIdentifier.toLowerCase()
    );

    if (!referrer || referrer.id === newUser.id) {
      return false; // Cannot refer self or nonexistent user
    }

    // Get current network for referrer
    const currentNetwork = getUserReferralNetwork(referrer);

    // Check if already in network
    const alreadyReferred = currentNetwork.networkMembers.some((m) => m.id === newUser.id || m.username.toLowerCase() === newUser.username.toLowerCase());
    if (alreadyReferred) {
      return false;
    }

    const baseReward = 0.80;

    const newMember: ReferralMember = {
      id: newUser.id,
      username: newUser.username,
      avatar: newUser.avatar || '🎮',
      joinedDate: 'Just now (via WhatsApp link)',
      status: 'Active',
      earnedForYou: baseReward,
      activityCount: 0
    };

    const updatedNetwork: ReferralNetworkState = {
      ...currentNetwork,
      totalReferrals: currentNetwork.totalReferrals + 1,
      totalEarnings: +(currentNetwork.totalEarnings + baseReward).toFixed(2),
      networkMembers: [newMember, ...currentNetwork.networkMembers]
    };

    // Save updated network for referrer
    saveUserReferralNetwork(referrer.id, updatedNetwork);

    // Update referrer player stats if saved
    const referrerStatsKey = `${STORAGE_KEY}_${referrer.id}`;
    const rawStats = localStorage.getItem(referrerStatsKey);
    if (rawStats) {
      try {
        const stats: PlayerStats = JSON.parse(rawStats);
        stats.balance = +(stats.balance + baseReward).toFixed(2);
        stats.totalCashEarned = +(stats.totalCashEarned + baseReward).toFixed(2);
        localStorage.setItem(referrerStatsKey, JSON.stringify(stats));
      } catch {
        // ignore
      }
    }

    return true;
  } catch (err) {
    console.error('Error processing genuine referral:', err);
    return false;
  }
}
