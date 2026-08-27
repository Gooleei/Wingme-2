import { 
  ReferralMember, 
  ReferralNetworkState, 
  UserProfile, 
  PlayerStats, 
  WalletTransaction 
} from '../types';
import { 
  getAllAccounts, 
  findAccount, 
  getUserStats, 
  saveUserStats, 
  getUserTransactions, 
  saveUserTransactions,
  STATS_STORAGE_PREFIX,
  TRANSACTIONS_STORAGE_PREFIX
} from './accountManager';

export const OFFICIAL_APP_DOWNLOAD_URL = 'https://bit.ly/3UntvRh';

const REFERRAL_KEY_PREFIX = 'LUCKYPLAY_REFERRAL_NETWORK_';
const RESET_FLAG_KEY = 'LUCKYPLAY_REFERRAL_CLEAN_RESET_V5';

/**
 * Generate a user's unique personal App Download Referral Link
 * using the official bit.ly URL https://bit.ly/3UntvRh
 */
export function getAppDownloadReferralLink(username: string): string {
  if (!username) return OFFICIAL_APP_DOWNLOAD_URL;
  const clean = username.trim();
  return `${OFFICIAL_APP_DOWNLOAD_URL}?ref=${encodeURIComponent(clean)}`;
}

/**
 * Generate a user's web arcade referral link
 */
export function getWebReferralLink(username: string): string {
  const clean = username ? username.trim() : 'runner';
  const origin = typeof window !== 'undefined' && window.location.origin 
    ? window.location.origin 
    : 'https://bellmont.io';
  return `${origin}/?ref=${encodeURIComponent(clean)}`;
}

/**
 * Generate a user's unique referral promo code (e.g. REF-ALEX)
 */
export function getUserReferralCode(username: string): string {
  if (!username) return 'REF-RUNNER';
  const sanitized = username.toUpperCase().replace(/[^A-Z0-9_]/g, '');
  return `REF-${sanitized}`;
}

/**
 * Clean and extract the referrer identifier from raw input (URLs, codes, query strings)
 * Handles:
 * - https://bit.ly/3UntvRh?ref=alex
 * - https://bellmont.io/?ref=alex
 * - ?ref=alex or &ref=alex or ?code=alex or ?referrer=alex
 * - REF-ALEX
 * - alex
 */
export function extractReferralIdentifier(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();

  try {
    // If it's a full URL or contains query parameters
    if (cleaned.includes('ref=') || cleaned.includes('referrer=') || cleaned.includes('code=')) {
      const urlPattern = /[?&](?:ref|referrer|code)=([^&#\s]+)/i;
      const match = cleaned.match(urlPattern);
      if (match && match[1]) {
        return decodeURIComponent(match[1]).trim();
      }
    }
  } catch {
    // fallback
  }

  // Remove leading REF- or ref- if present
  cleaned = cleaned.replace(/^REF-/i, '').trim();

  // If input was a raw URL without match, take last path or param
  if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
    const parts = cleaned.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart && !lastPart.includes('3UntvRh')) {
      cleaned = lastPart.split('?')[0];
    }
  }

  return cleaned.trim();
}

/**
 * Perform a clean system-wide purge of any corrupted legacy referral mock objects,
 * while preserving valid registered networks.
 */
export function purgeLegacyReferralMocks(): void {
  if (typeof window === 'undefined') return;

  try {
    const isReset = localStorage.getItem(RESET_FLAG_KEY);
    if (!isReset) {
      // Clean only mock keys, leaving valid user networks intact
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('MOCK_REFERRAL') || key.includes('SIMULATED_REF'))) {
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
 * Retrieve referral network state for a specific user.
 */
export function getUserReferralNetwork(user: UserProfile): ReferralNetworkState {
  purgeLegacyReferralMocks();

  const storageKey = `${REFERRAL_KEY_PREFIX}${user.id}`;
  const referralCode = getUserReferralCode(user.username);

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.totalReferrals === 'number') {
        const cleanMembers = (parsed.networkMembers || []).filter(
          (m: ReferralMember) => m.id && !m.id.startsWith('ref-mock') && !m.id.startsWith('ref-fake')
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
 * Process a genuine referral when a new user registers with an older user's download link or code.
 * Credits the older user (referrer):
 *  1. +$0.80 cash reward directly added to their player stats balance ($15 = ₮1 point).
 *  2. +$0.80 added to their totalCashEarned.
 *  3. Recruit added to their live Referral Network roster.
 *  4. +1 to total referrals count.
 *  5. Milestone multipliers progress updated.
 *  6. Wallet transaction recorded with timestamp.
 */
export function processGenuineReferral(
  rawReferrerInput: string, 
  newUser: UserProfile
): { success: boolean; message: string; referrerName?: string; referrerId?: string } {
  if (!rawReferrerInput || !newUser) {
    return { success: false, message: 'No referral code provided.' };
  }

  const cleanRef = extractReferralIdentifier(rawReferrerInput);
  if (!cleanRef) {
    return { success: false, message: 'Invalid referral code format.' };
  }

  try {
    // Look up the referrer account in the unified account registry
    const referrer = findAccount(cleanRef);

    if (!referrer) {
      return { 
        success: false, 
        message: `Referral code or user "${cleanRef}" not found. Please check the code.` 
      };
    }

    // Prevent self-referral
    if (
      referrer.id === newUser.id || 
      referrer.username.toLowerCase() === newUser.username.toLowerCase() ||
      (referrer.email && newUser.email && referrer.email.toLowerCase() === newUser.email.toLowerCase())
    ) {
      return { success: false, message: 'You cannot use your own referral code.' };
    }

    // Get referrer's current network
    const currentNetwork = getUserReferralNetwork(referrer);

    // Check if already in network
    const alreadyReferred = currentNetwork.networkMembers.some(
      (m) => m.id === newUser.id || m.username.toLowerCase() === newUser.username.toLowerCase()
    );

    if (alreadyReferred) {
      return { 
        success: false, 
        message: `You are already part of @${referrer.username}'s referral network.` 
      };
    }

    const baseReward = 0.80; // $0.80 USD per referral (= ~₮0.053 Points)

    const newMember: ReferralMember = {
      id: newUser.id,
      username: newUser.username,
      avatar: newUser.avatar || '🎮',
      joinedDate: 'Just now (via Referral Link)',
      status: 'Active',
      earnedForYou: baseReward,
      activityCount: 1
    };

    const updatedNetwork: ReferralNetworkState = {
      ...currentNetwork,
      totalReferrals: currentNetwork.totalReferrals + 1,
      totalEarnings: +(currentNetwork.totalEarnings + baseReward).toFixed(2),
      networkMembers: [newMember, ...currentNetwork.networkMembers]
    };

    // 1. Save updated network for referrer
    saveUserReferralNetwork(referrer.id, updatedNetwork);

    // 2. Safely credit referrer's player stats balance & total cash earned
    const referrerStats: PlayerStats = getUserStats(referrer.id);
    referrerStats.balance = +(referrerStats.balance + baseReward).toFixed(2);
    referrerStats.totalCashEarned = +(referrerStats.totalCashEarned + baseReward).toFixed(2);
    saveUserStats(referrer.id, referrerStats);

    // 3. Record referrer's transaction history with timestamp
    const referrerTxs: WalletTransaction[] = getUserTransactions(referrer.id);
    const newTx: WalletTransaction = {
      id: Date.now(),
      description: `🤝 Referral Recruit: ${newUser.username} joined via your link (+$0.80 / ₮0.05)`,
      amount: baseReward,
      type: 'bonus',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    saveUserTransactions(referrer.id, [newTx, ...referrerTxs]);

    // 4. Mark linkage on the new user's profile
    try {
      localStorage.setItem('LUCKYPLAY_USER_REDEEMED_REF_' + newUser.id, referrer.username);
    } catch {
      // ignore
    }

    // 5. Notify any listening window components of the stats update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('luckyplay:referral_credited', {
          detail: { referrerId: referrer.id, newUserId: newUser.id }
        })
      );
    }

    return {
      success: true,
      message: `Successfully connected with @${referrer.username}!`,
      referrerName: referrer.username,
      referrerId: referrer.id
    };
  } catch (err) {
    console.error('Error processing genuine referral:', err);
    return { success: false, message: 'An error occurred while linking referral code.' };
  }
}

/**
 * Allow a logged-in user to redeem a friend's referral link or code inside the app.
 * Credits both the current user (welcome bonus +$0.80) and the older user (+$0.80).
 */
export function redeemInviteCodeInApp(
  rawInput: string,
  currentUser: UserProfile
): { success: boolean; message: string; referrerName?: string; bonusAmount: number } {
  if (!rawInput || !rawInput.trim()) {
    return { success: false, message: 'Please enter a referral code or download link.', bonusAmount: 0 };
  }

  // Check if current user already redeemed a referral code
  const userAccountKey = 'LUCKYPLAY_USER_REDEEMED_REF_' + currentUser.id;
  if (localStorage.getItem(userAccountKey)) {
    const existingRef = localStorage.getItem(userAccountKey);
    return { 
      success: false, 
      message: `You have already redeemed an invite code (linked with @${existingRef}) on this account.`, 
      bonusAmount: 0 
    };
  }

  const result = processGenuineReferral(rawInput, currentUser);
  if (!result.success) {
    return { success: false, message: result.message, bonusAmount: 0 };
  }

  const welcomeBonus = 0.80;

  return {
    success: true,
    message: `🎉 Successfully connected to @${result.referrerName}'s network! You received an instant $${welcomeBonus.toFixed(2)} welcome bonus and credited @${result.referrerName}.`,
    referrerName: result.referrerName,
    bonusAmount: welcomeBonus
  };
}
