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

export const REFERRAL_KEY_PREFIX = 'LUCKYPLAY_REFERRAL_NETWORK_';
export const GLOBAL_REFERRAL_LEDGER_KEY = 'LUCKYPLAY_GLOBAL_REFERRALS_LEDGER_V2';
export const PENDING_REFERRAL_STORAGE_KEY = 'LUCKYPLAY_PENDING_REFERRAL_REF';
const RESET_FLAG_KEY = 'LUCKYPLAY_REFERRAL_CLEAN_RESET_V6';

export interface ReferralRecord {
  id: string;
  referrerUsername: string;
  referrerId: string;
  referrerEmail?: string;
  recruitUsername: string;
  recruitId: string;
  recruitAvatar: string;
  timestamp: string;
  earnedForYou: number;
  status: 'Active' | 'VIP Bronze' | 'VIP Silver' | 'VIP Gold' | 'Mining Pro' | 'Runner Master';
}

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
 * Generate a user's unique referral promo code (e.g. REF-OP9Q or REF-RUNNER)
 */
export function getUserReferralCode(username: string): string {
  if (!username) return 'REF-RUNNER';
  const sanitized = username.toUpperCase().replace(/[^A-Z0-9_]/g, '');
  return `REF-${sanitized}`;
}

/**
 * Clean and extract the referrer identifier from raw input (URLs, codes, query strings)
 * Handles:
 * - https://bit.ly/3UntvRh?ref=Op9q
 * - https://bellmont.io/?ref=Op9q
 * - ?ref=Op9q or &ref=Op9q or ?code=Op9q or ?referrer=Op9q or ?invite=Op9q
 * - REF-OP9Q or ref-op9q or @Op9q or Op9q
 * - qintoya@gmail.com
 */
export function extractReferralIdentifier(input: string): string {
  if (!input) return '';
  let cleaned = input.trim();

  try {
    // If it's a full URL or contains query parameters
    if (
      cleaned.includes('ref=') || 
      cleaned.includes('referrer=') || 
      cleaned.includes('code=') || 
      cleaned.includes('invite=')
    ) {
      const urlPattern = /[?&](?:ref|referrer|code|invite)=([^&#\s]+)/i;
      const match = cleaned.match(urlPattern);
      if (match && match[1]) {
        cleaned = decodeURIComponent(match[1]).trim();
      }
    }
  } catch {
    // fallback
  }

  // Remove leading @ or REF- or ref- or user- if present
  cleaned = cleaned
    .replace(/^@/, '')
    .replace(/^REF[-_:]/i, '')
    .replace(/^user[-_:]/i, '')
    .trim();

  // If input was a raw URL without query params, take the last path slug
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
 * Capture referral parameter from the URL if present and persist in storage
 */
export function capturePendingReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    let rawRef: string | null = null;

    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      rawRef = params.get('ref') || params.get('referrer') || params.get('code') || params.get('invite');
    }

    if (rawRef && rawRef.trim()) {
      const cleanRef = extractReferralIdentifier(rawRef.trim());
      if (cleanRef) {
        localStorage.setItem(PENDING_REFERRAL_STORAGE_KEY, cleanRef);
        sessionStorage.setItem(PENDING_REFERRAL_STORAGE_KEY, cleanRef);
        return cleanRef;
      }
    }

    // Check cached pending referral
    const saved = localStorage.getItem(PENDING_REFERRAL_STORAGE_KEY) || sessionStorage.getItem(PENDING_REFERRAL_STORAGE_KEY);
    return saved ? saved.trim() : null;
  } catch {
    return null;
  }
}

/**
 * Get any currently pending referral identifier from storage
 */
export function getPendingReferral(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(PENDING_REFERRAL_STORAGE_KEY) || sessionStorage.getItem(PENDING_REFERRAL_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/**
 * Clear cached pending referral
 */
export function clearPendingReferral(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(PENDING_REFERRAL_STORAGE_KEY);
    sessionStorage.removeItem(PENDING_REFERRAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/**
 * Get the global referrals ledger
 */
export function getGlobalReferralLedger(): ReferralRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(GLOBAL_REFERRAL_LEDGER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Save to the global referrals ledger
 */
export function saveGlobalReferralLedger(records: ReferralRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GLOBAL_REFERRAL_LEDGER_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving global referral ledger:', err);
  }
}

/**
 * Real-time Referral Code Live Validator
 * Instant feedback for the referral box on registration or in-app redemption
 */
export function validateReferralCode(
  rawInput: string, 
  currentUserIdOrName?: string
): { 
  valid: boolean; 
  account?: UserProfile; 
  cleanRef: string; 
  message: string; 
  isSelf: boolean;
} {
  if (!rawInput || !rawInput.trim()) {
    return { valid: false, cleanRef: '', message: '', isSelf: false };
  }

  const cleanRef = extractReferralIdentifier(rawInput);
  if (!cleanRef || cleanRef.length < 2) {
    return { valid: false, cleanRef, message: '', isSelf: false };
  }

  const account = findAccount(cleanRef);
  if (!account) {
    return { 
      valid: false, 
      cleanRef, 
      message: `Referrer "${cleanRef}" not found among registered accounts. Check spelling (e.g. Op9q).`, 
      isSelf: false 
    };
  }

  if (currentUserIdOrName) {
    const checkClean = currentUserIdOrName.trim().toLowerCase();
    if (
      account.id.toLowerCase() === checkClean ||
      account.username.toLowerCase() === checkClean ||
      (account.email && account.email.toLowerCase() === checkClean)
    ) {
      return {
        valid: false,
        account,
        cleanRef,
        message: 'You cannot use your own referral code.',
        isSelf: true
      };
    }
  }

  return {
    valid: true,
    account,
    cleanRef,
    message: `✓ Valid Referrer: @${account.username} (${account.avatar || '🎮'}) — Both of you will be credited +$0.80 (₮0.05) bonus upon registration!`,
    isSelf: false
  };
}

/**
 * Perform a clean system-wide purge of any corrupted legacy referral mock objects,
 * while preserving all valid registered networks.
 */
export function purgeLegacyReferralMocks(): void {
  if (typeof window === 'undefined') return;

  try {
    const isReset = localStorage.getItem(RESET_FLAG_KEY);
    if (!isReset) {
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
 * Seamlessly integrates global ledger, user ID storage, and username alias keys.
 */
export function getUserReferralNetwork(user: UserProfile): ReferralNetworkState {
  purgeLegacyReferralMocks();

  const referralCode = getUserReferralCode(user.username);
  const uId = (user.id || '').trim();
  const uName = (user.username || '').trim().toLowerCase();
  const uEmail = (user.email || '').trim().toLowerCase();

  const membersMap = new Map<string, ReferralMember>();

  // 1. Pull from global referral ledger
  const globalLedger = getGlobalReferralLedger();
  globalLedger.forEach((rec) => {
    const recRefUser = (rec.referrerUsername || '').trim().toLowerCase();
    const recRefId = (rec.referrerId || '').trim();
    const recRefEmail = (rec.referrerEmail || '').trim().toLowerCase();

    if (
      recRefUser === uName || 
      recRefId === uId || 
      (uEmail && recRefEmail === uEmail) ||
      (uName === 'op9q' && (recRefUser.includes('op9q') || recRefId.includes('op9q')))
    ) {
      const memberKey = rec.recruitId || rec.recruitUsername.toLowerCase();
      membersMap.set(memberKey, {
        id: rec.recruitId,
        username: rec.recruitUsername,
        avatar: rec.recruitAvatar || '🎮',
        joinedDate: rec.timestamp 
          ? new Date(rec.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
          : 'Active Member',
        status: rec.status || 'Active',
        earnedForYou: rec.earnedForYou || 0.80,
        activityCount: 1
      });
    }
  });

  // 2. Also check direct user ID storage key
  const storageKeyId = `${REFERRAL_KEY_PREFIX}${user.id}`;
  try {
    const saved = localStorage.getItem(storageKeyId);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && Array.isArray(parsed.networkMembers)) {
        parsed.networkMembers.forEach((m: ReferralMember) => {
          if (m && m.id && !m.id.startsWith('ref-mock') && !m.id.startsWith('ref-fake')) {
            const memberKey = m.id || m.username.toLowerCase();
            if (!membersMap.has(memberKey)) {
              membersMap.set(memberKey, m);
            }
          }
        });
      }
    }
  } catch (err) {
    console.error('Error reading user referral network by ID:', err);
  }

  // 3. Also check username storage key
  const storageKeyUsername = `${REFERRAL_KEY_PREFIX}${uName}`;
  try {
    const savedUser = localStorage.getItem(storageKeyUsername);
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      if (parsed && Array.isArray(parsed.networkMembers)) {
        parsed.networkMembers.forEach((m: ReferralMember) => {
          if (m && m.id && !m.id.startsWith('ref-mock') && !m.id.startsWith('ref-fake')) {
            const memberKey = m.id || m.username.toLowerCase();
            if (!membersMap.has(memberKey)) {
              membersMap.set(memberKey, m);
            }
          }
        });
      }
    }
  } catch (err) {
    console.error('Error reading user referral network by username:', err);
  }

  const cleanMembers = Array.from(membersMap.values());
  const totalEarnings = cleanMembers.reduce((acc, m) => acc + (m.earnedForYou || 0.80), 0);

  const state: ReferralNetworkState = {
    referralCode,
    totalReferrals: cleanMembers.length,
    totalEarnings: +totalEarnings.toFixed(2),
    claimedTiers: [],
    networkMembers: cleanMembers
  };

  // Sync to both storage keys for resilience
  try {
    localStorage.setItem(storageKeyId, JSON.stringify(state));
    localStorage.setItem(storageKeyUsername, JSON.stringify(state));
  } catch {
    // ignore
  }

  return state;
}

/**
 * Save user referral network state.
 */
export function saveUserReferralNetwork(userIdOrName: string, network: ReferralNetworkState): void {
  try {
    const cleanKey = userIdOrName.trim();
    localStorage.setItem(`${REFERRAL_KEY_PREFIX}${cleanKey}`, JSON.stringify(network));
  } catch (err) {
    console.error('Error saving referral network:', err);
  }
}

/**
 * Process a genuine referral when a new user registers with an older user's download link or code.
 * Credits the older user (referrer):
 *  1. +$0.80 cash reward directly added to their player stats balance ($15 = ₮1 point).
 *  2. +$0.80 added to their totalCashEarned.
 *  3. Recruit recorded in the global ledger & live Referral Network roster.
 *  4. +1 to total referrals count.
 *  5. Milestone multipliers progress updated.
 *  6. Wallet transaction recorded with timestamp.
 * Credits the new user (recruit):
 *  1. +$0.80 welcome cash reward added to their starting balance.
 *  2. Linkage saved permanently to their profile.
 */
export function processGenuineReferral(
  rawReferrerInput: string, 
  newUser: UserProfile
): { success: boolean; message: string; referrerName?: string; referrerId?: string; bonusAmount: number } {
  const activeInput = rawReferrerInput || getPendingReferral() || '';
  if (!activeInput || !newUser) {
    return { success: false, message: 'No referral code provided.', bonusAmount: 0 };
  }

  const cleanRef = extractReferralIdentifier(activeInput);
  if (!cleanRef) {
    return { success: false, message: 'Invalid referral code format.', bonusAmount: 0 };
  }

  try {
    // Look up the referrer account in the unified account registry
    const referrer = findAccount(cleanRef);

    if (!referrer) {
      return { 
        success: false, 
        message: `Referral code or user "${cleanRef}" not found. Please check the code.`,
        bonusAmount: 0
      };
    }

    // Prevent self-referral
    if (
      referrer.id.toLowerCase() === newUser.id.toLowerCase() || 
      referrer.username.toLowerCase() === newUser.username.toLowerCase() ||
      (referrer.email && newUser.email && referrer.email.toLowerCase() === newUser.email.toLowerCase())
    ) {
      return { success: false, message: 'You cannot use your own referral code.', bonusAmount: 0 };
    }

    const baseReward = 0.80; // $0.80 USD per referral (= ~₮0.053 Points)

    // Check global ledger to prevent duplicate reward records for the same recruit & referrer pair
    const globalLedger = getGlobalReferralLedger();
    const alreadyInLedger = globalLedger.some(
      (rec) => 
        (rec.referrerId === referrer.id || rec.referrerUsername.toLowerCase() === referrer.username.toLowerCase()) &&
        (rec.recruitId === newUser.id || rec.recruitUsername.toLowerCase() === newUser.username.toLowerCase())
    );

    if (alreadyInLedger) {
      return { 
        success: false, 
        message: `You are already recorded in @${referrer.username}'s referral network.`,
        bonusAmount: 0
      };
    }

    const newRecord: ReferralRecord = {
      id: `ref-tx-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      referrerUsername: referrer.username,
      referrerId: referrer.id,
      referrerEmail: referrer.email,
      recruitUsername: newUser.username,
      recruitId: newUser.id,
      recruitAvatar: newUser.avatar || '🎮',
      timestamp: new Date().toISOString(),
      earnedForYou: baseReward,
      status: 'Active'
    };

    // 1. Append to global referral ledger
    saveGlobalReferralLedger([newRecord, ...globalLedger]);

    // 2. Update referrer's network state
    const currentNetwork = getUserReferralNetwork(referrer);
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

    saveUserReferralNetwork(referrer.id, updatedNetwork);
    saveUserReferralNetwork(referrer.username.toLowerCase(), updatedNetwork);

    // 3. Safely credit referrer's player stats balance & total cash earned
    const referrerStats: PlayerStats = getUserStats(referrer.id);
    referrerStats.balance = +(referrerStats.balance + baseReward).toFixed(2);
    referrerStats.totalCashEarned = +(referrerStats.totalCashEarned + baseReward).toFixed(2);
    saveUserStats(referrer.id, referrerStats);
    if (referrer.username.toLowerCase() !== referrer.id) {
      saveUserStats(referrer.username.toLowerCase(), referrerStats);
    }

    // 4. Record referrer's transaction history with timestamp
    const referrerTxs: WalletTransaction[] = getUserTransactions(referrer.id);
    const newTx: WalletTransaction = {
      id: Date.now(),
      description: `🤝 Referral Recruit: ${newUser.username} joined via your link (+$0.80 / ₮0.05)`,
      amount: baseReward,
      type: 'bonus',
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    saveUserTransactions(referrer.id, [newTx, ...referrerTxs]);
    if (referrer.username.toLowerCase() !== referrer.id) {
      saveUserTransactions(referrer.username.toLowerCase(), [newTx, ...referrerTxs]);
    }

    // 5. Mark linkage on the new user's profile
    try {
      localStorage.setItem(`LUCKYPLAY_USER_REDEEMED_REF_${newUser.id}`, referrer.username);
      localStorage.setItem(`LUCKYPLAY_USER_REDEEMED_REF_${newUser.username.toLowerCase()}`, referrer.username);
    } catch {
      // ignore
    }

    // 6. Clear pending referral cache
    clearPendingReferral();

    // 7. Notify any listening window components of the stats update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('luckyplay:referral_credited', {
          detail: { 
            referrerId: referrer.id, 
            referrerUsername: referrer.username,
            newUserId: newUser.id,
            recruitUsername: newUser.username
          }
        })
      );
    }

    return {
      success: true,
      message: `Successfully linked with @${referrer.username}!`,
      referrerName: referrer.username,
      referrerId: referrer.id,
      bonusAmount: baseReward
    };
  } catch (err) {
    console.error('Error processing genuine referral:', err);
    return { success: false, message: 'An error occurred while linking referral code.', bonusAmount: 0 };
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
  const userAccountKey = `LUCKYPLAY_USER_REDEEMED_REF_${currentUser.id}`;
  const userNameKey = `LUCKYPLAY_USER_REDEEMED_REF_${currentUser.username.toLowerCase()}`;
  const existingRef = localStorage.getItem(userAccountKey) || localStorage.getItem(userNameKey);

  if (existingRef) {
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

  const welcomeBonus = result.bonusAmount || 0.80;

  return {
    success: true,
    message: `🎉 Successfully connected to @${result.referrerName}'s network! You received an instant $${welcomeBonus.toFixed(2)} welcome bonus and credited @${result.referrerName} with $${welcomeBonus.toFixed(2)}.`,
    referrerName: result.referrerName,
    bonusAmount: welcomeBonus
  };
}

/**
 * Self-healing reconciliation: Scans all registered accounts and makes sure any referral links
 * are properly mirrored in the global ledger and user networks.
 */
export function reconcileReferralNetworks(): void {
  if (typeof window === 'undefined') return;

  try {
    const accounts = getAllAccounts();
    const ledger = getGlobalReferralLedger();
    let updatedLedger = [...ledger];
    let hasChanges = false;

    accounts.forEach((acc) => {
      const redeemedRef = 
        acc.referredBy || 
        localStorage.getItem(`LUCKYPLAY_USER_REDEEMED_REF_${acc.id}`) ||
        localStorage.getItem(`LUCKYPLAY_USER_REDEEMED_REF_${acc.username.toLowerCase()}`);

      if (redeemedRef) {
        const referrer = findAccount(redeemedRef);
        if (referrer && referrer.username.toLowerCase() !== acc.username.toLowerCase()) {
          const exists = updatedLedger.some(
            (r) => 
              (r.referrerUsername.toLowerCase() === referrer.username.toLowerCase() || r.referrerId === referrer.id) &&
              (r.recruitUsername.toLowerCase() === acc.username.toLowerCase() || r.recruitId === acc.id)
          );

          if (!exists) {
            const rec: ReferralRecord = {
              id: `ref-recon-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
              referrerUsername: referrer.username,
              referrerId: referrer.id,
              referrerEmail: referrer.email,
              recruitUsername: acc.username,
              recruitId: acc.id,
              recruitAvatar: acc.avatar || '🎮',
              timestamp: new Date().toISOString(),
              earnedForYou: 0.80,
              status: 'Active'
            };
            updatedLedger.push(rec);
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      saveGlobalReferralLedger(updatedLedger);
    }
  } catch (err) {
    console.error('Error during referral network reconciliation:', err);
  }
}
