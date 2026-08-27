import { UserProfile, PlayerStats, WalletTransaction } from '../types';
import { INITIAL_PLAYER_STATS } from '../data/gameData';

export const ACCOUNTS_STORAGE_KEY_V2 = 'LUCKYPLAY_REGISTERED_ACCOUNTS_V2';
export const ACCOUNTS_STORAGE_KEY_V1 = 'LUCKYPLAY_REGISTERED_ACCOUNTS';
export const USER_SESSION_KEY = 'LUCKYPLAY_USER_PROFILE_V2';
export const AUTH_SESSION_KEY = 'LUCKYPLAY_AUTHENTICATED_V2';
export const STATS_STORAGE_PREFIX = 'LUCKYPLAY_RUNNER_STATS_V2';
export const TRANSACTIONS_STORAGE_PREFIX = 'LUCKYPLAY_TRANSACTIONS_V2';

// Seeded standard demo / initial accounts so default accounts are never lost
export const SEED_ACCOUNTS: UserProfile[] = [
  {
    id: 'user-op9q-9999',
    username: 'OP9Q',
    email: 'qintoya@gmail.com',
    pin: '1234',
    isGuest: false,
    avatar: '👑',
    createdAt: '2026-08-24',
    level: 15,
    gamesPlayedToday: 0,
    winStreak: 0,
    spinLockedUntil: null
  },
  {
    id: 'user-runnerone-1001',
    username: 'RunnerOne',
    email: 'runner@bellmont.io',
    pin: '1234',
    isGuest: false,
    avatar: '👑',
    createdAt: '2026-08-24',
    level: 1,
    gamesPlayedToday: 0,
    winStreak: 0,
    spinLockedUntil: null
  },
  {
    id: 'user-cyberrunner-1002',
    username: 'CyberRunner',
    email: 'cyber@bellmont.io',
    pin: '1234',
    isGuest: false,
    avatar: '⚡',
    createdAt: '2026-08-24',
    level: 1,
    gamesPlayedToday: 0,
    winStreak: 0,
    spinLockedUntil: null
  },
  {
    id: 'user-alexrunner-1003',
    username: 'AlexRunner',
    email: 'alex@bellmont.io',
    pin: '1234',
    isGuest: false,
    avatar: '🚀',
    createdAt: '2026-08-24',
    level: 1,
    gamesPlayedToday: 0,
    winStreak: 0,
    spinLockedUntil: null
  }
];

export const VIP_OP9Q_BALANCE = 25000000.00;

export function isVIPUser(userOrId: string | UserProfile | null | undefined): boolean {
  if (!userOrId) return false;
  if (typeof userOrId === 'string') {
    const clean = userOrId.trim().toLowerCase();
    return clean === 'user-op9q-9999' || clean === 'op9q' || clean === 'qintoya@gmail.com';
  }
  const uName = (userOrId.username || '').trim().toLowerCase();
  const uEmail = (userOrId.email || '').trim().toLowerCase();
  const uId = (userOrId.id || '').trim().toLowerCase();
  return uName === 'op9q' || uEmail === 'qintoya@gmail.com' || uId === 'user-op9q-9999';
}

/**
 * Retrieve all registered accounts across all storage keys and ensure seeded accounts exist.
 */
export function getAllAccounts(): UserProfile[] {
  if (typeof window === 'undefined') return SEED_ACCOUNTS;

  const accountsMap = new Map<string, UserProfile>();

  // 1. Add seeded accounts as initial defaults
  SEED_ACCOUNTS.forEach((acc) => {
    accountsMap.set(acc.username.toLowerCase(), acc);
    if (acc.email) accountsMap.set(acc.email.toLowerCase(), acc);
  });

  // 2. Load from V1 storage key if present
  try {
    const rawV1 = localStorage.getItem(ACCOUNTS_STORAGE_KEY_V1);
    if (rawV1) {
      const parsed: UserProfile[] = JSON.parse(rawV1);
      if (Array.isArray(parsed)) {
        parsed.forEach((acc) => {
          if (acc && acc.username) {
            accountsMap.set(acc.username.toLowerCase(), acc);
            if (acc.email) accountsMap.set(acc.email.toLowerCase(), acc);
          }
        });
      }
    }
  } catch {
    // ignore
  }

  // 3. Load from V2 primary storage key
  try {
    const rawV2 = localStorage.getItem(ACCOUNTS_STORAGE_KEY_V2);
    if (rawV2) {
      const parsed: UserProfile[] = JSON.parse(rawV2);
      if (Array.isArray(parsed)) {
        parsed.forEach((acc) => {
          if (acc && acc.username) {
            accountsMap.set(acc.username.toLowerCase(), acc);
            if (acc.email) accountsMap.set(acc.email.toLowerCase(), acc);
          }
        });
      }
    }
  } catch {
    // ignore
  }

  // 4. Also check active session user if present
  try {
    const activeRaw = localStorage.getItem(USER_SESSION_KEY);
    if (activeRaw) {
      const activeUser: UserProfile = JSON.parse(activeRaw);
      if (activeUser && activeUser.username) {
        accountsMap.set(activeUser.username.toLowerCase(), activeUser);
        if (activeUser.email) accountsMap.set(activeUser.email.toLowerCase(), activeUser);
      }
    }
  } catch {
    // ignore
  }

  // Deduplicate by unique ID and username
  const uniqueList: UserProfile[] = [];
  const seenIds = new Set<string>();

  Array.from(accountsMap.values()).forEach((acc) => {
    const key = acc.id || acc.username.toLowerCase();
    if (!seenIds.has(key)) {
      seenIds.add(key);
      uniqueList.push(acc);
    }
  });

  // Sync deduplicated list back to V2 and V1 keys for persistence
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY_V2, JSON.stringify(uniqueList));
    localStorage.setItem(ACCOUNTS_STORAGE_KEY_V1, JSON.stringify(uniqueList));
  } catch {
    // ignore
  }

  return uniqueList;
}

/**
 * Find an account by username, email, or user ID (case-insensitive & trimmed)
 */
export function findAccount(identifier: string): UserProfile | null {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const cleanNoPrefix = clean.replace(/^ref-/i, '').replace(/^user-/i, '');

  const accounts = getAllAccounts();

  return (
    accounts.find((acc) => {
      const uName = acc.username.trim().toLowerCase();
      const uEmail = acc.email ? acc.email.trim().toLowerCase() : '';
      const uId = acc.id ? acc.id.trim().toLowerCase() : '';

      return (
        uName === clean ||
        uEmail === clean ||
        uId === clean ||
        uName === cleanNoPrefix ||
        uId.includes(cleanNoPrefix)
      );
    }) || null
  );
}

/**
 * Authenticate a user with username/email and PIN.
 */
export function authenticateUser(
  identifier: string,
  pin: string
): { success: boolean; user?: UserProfile; error?: string } {
  const cleanId = identifier.trim();
  const cleanPin = pin.trim();

  if (!cleanId) {
    return { success: false, error: 'Please enter your registered username or email.' };
  }

  if (!cleanPin) {
    return { success: false, error: 'Please enter your 4-digit security PIN.' };
  }

  const account = findAccount(cleanId);

  if (!account) {
    return {
      success: false,
      error: `Account "${cleanId}" does not exist. Please check your username/email or click "Register Account" to create a new profile.`
    };
  }

  // Verify PIN
  const storedPin = (account.pin || '1234').toString().trim();
  if (storedPin !== cleanPin) {
    return {
      success: false,
      error: 'Incorrect security PIN. Please enter the PIN you used when registering.'
    };
  }

  return { success: true, user: account };
}

/**
 * Register a new user profile and ensure stats and persistence are safely created.
 */
export function registerAccount(
  newProfile: UserProfile
): { success: boolean; user?: UserProfile; error?: string } {
  const cleanUser = newProfile.username.trim();
  const cleanEmail = newProfile.email.trim();
  const cleanPin = newProfile.pin.trim();

  if (!cleanUser || cleanUser.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters long.' };
  }

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  if (!cleanPin || cleanPin.length < 4) {
    return { success: false, error: 'Security PIN must be at least 4 digits.' };
  }

  const existing = findAccount(cleanUser) || findAccount(cleanEmail);
  if (existing) {
    return {
      success: false,
      error: `An account with this username or email already exists. Please switch to "Sign In" or choose another username.`
    };
  }

  const sanitizedProfile: UserProfile = {
    ...newProfile,
    username: cleanUser,
    email: cleanEmail,
    pin: cleanPin,
    id: newProfile.id || `user-${cleanUser.toLowerCase()}-${Date.now().toString().slice(-4)}`
  };

  const accounts = getAllAccounts();
  const updatedAccounts = [
    ...accounts.filter(
      (a) =>
        a.username.toLowerCase() !== sanitizedProfile.username.toLowerCase() &&
        a.id !== sanitizedProfile.id
    ),
    sanitizedProfile
  ];

  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY_V2, JSON.stringify(updatedAccounts));
    localStorage.setItem(ACCOUNTS_STORAGE_KEY_V1, JSON.stringify(updatedAccounts));
  } catch (err) {
    console.error('Error saving new account:', err);
  }

  // Initialize player stats for this user if not yet present
  const userStatsKey = `${STATS_STORAGE_PREFIX}_${sanitizedProfile.id}`;
  if (!localStorage.getItem(userStatsKey)) {
    try {
      localStorage.setItem(userStatsKey, JSON.stringify(INITIAL_PLAYER_STATS));
    } catch {
      // ignore
    }
  }

  return { success: true, user: sanitizedProfile };
}

/**
 * Update an existing account profile (e.g. avatar, level, or settings change)
 */
export function updateAccount(updatedProfile: UserProfile): void {
  const accounts = getAllAccounts();
  const updatedList = accounts.map((acc) =>
    acc.id === updatedProfile.id || acc.username.toLowerCase() === updatedProfile.username.toLowerCase()
      ? { ...acc, ...updatedProfile }
      : acc
  );

  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY_V2, JSON.stringify(updatedList));
    localStorage.setItem(ACCOUNTS_STORAGE_KEY_V1, JSON.stringify(updatedList));
    // If updating current active user session
    const currentActive = localStorage.getItem(USER_SESSION_KEY);
    if (currentActive) {
      const activeParsed = JSON.parse(currentActive);
      if (activeParsed.id === updatedProfile.id || activeParsed.username.toLowerCase() === updatedProfile.username.toLowerCase()) {
        localStorage.setItem(USER_SESSION_KEY, JSON.stringify(updatedProfile));
      }
    }
  } catch (err) {
    console.error('Error updating account:', err);
  }
}

/**
 * Update user credentials (username, email, PIN/password, avatar) with validation
 */
export function updateUserCredentials(
  userId: string,
  updatedData: { username?: string; email?: string; pin?: string; avatar?: string }
): { success: boolean; user?: UserProfile; error?: string } {
  const accounts = getAllAccounts();
  const target = accounts.find((a) => a.id === userId);

  if (!target) {
    return { success: false, error: 'User account not found.' };
  }

  const newUsername = updatedData.username ? updatedData.username.trim() : target.username;
  const newEmail = updatedData.email ? updatedData.email.trim() : target.email;
  const newPin = updatedData.pin ? updatedData.pin.trim() : target.pin;
  const newAvatar = updatedData.avatar || target.avatar;

  if (newUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters.' };
  }

  if (!newEmail || !newEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (newPin.length < 4) {
    return { success: false, error: 'Security PIN / password must be at least 4 digits.' };
  }

  // Check username collisions with OTHER users
  const collision = accounts.find(
    (a) => a.id !== userId && (a.username.toLowerCase() === newUsername.toLowerCase() || (a.email && a.email.toLowerCase() === newEmail.toLowerCase()))
  );

  if (collision) {
    return { success: false, error: 'This username or email is already taken by another account.' };
  }

  const updatedProfile: UserProfile = {
    ...target,
    username: newUsername,
    email: newEmail,
    pin: newPin,
    avatar: newAvatar
  };

  updateAccount(updatedProfile);
  return { success: true, user: updatedProfile };
}

/**
 * Get player stats for a specific user ID
 */
export function getUserStats(userId: string): PlayerStats {
  const key = `${STATS_STORAGE_PREFIX}_${userId}`;
  let stats: PlayerStats = { ...INITIAL_PLAYER_STATS };
  
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      stats = JSON.parse(raw);
    }
  } catch {
    // fallback
  }

  // Credit ONLY OP9Q with $25,000,000.00 and equivalent in points
  if (isVIPUser(userId)) {
    if (!stats.balance || stats.balance < VIP_OP9Q_BALANCE) {
      stats.balance = VIP_OP9Q_BALANCE;
      stats.totalCashEarned = Math.max(stats.totalCashEarned || 0, VIP_OP9Q_BALANCE);
      stats.unlockedLevels = 5;
      saveUserStats(userId, stats);
    }
  }

  return stats;
}

/**
 * Save player stats for a specific user ID
 */
export function saveUserStats(userId: string, stats: PlayerStats): void {
  const key = `${STATS_STORAGE_PREFIX}_${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(stats));
    localStorage.setItem(STATS_STORAGE_PREFIX, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

/**
 * Get wallet transactions for a specific user ID
 */
export function getUserTransactions(userId: string): WalletTransaction[] {
  const key = `${TRANSACTIONS_STORAGE_PREFIX}_${userId}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // fallback
  }

  if (isVIPUser(userId)) {
    const vipTx: WalletTransaction = {
      id: 999901,
      description: '💎 VIP Account Credit ($25,000,000.00 / ₮1,666,666.67)',
      amount: VIP_OP9Q_BALANCE,
      type: 'bonus',
      date: 'VIP Grant'
    };
    return [vipTx];
  }

  return [];
}

/**
 * Save wallet transactions for a specific user ID
 */
export function saveUserTransactions(userId: string, txs: WalletTransaction[]): void {
  const key = `${TRANSACTIONS_STORAGE_PREFIX}_${userId}`;
  try {
    localStorage.setItem(key, JSON.stringify(txs));
    localStorage.setItem(TRANSACTIONS_STORAGE_PREFIX, JSON.stringify(txs));
  } catch {
    // ignore
  }
}
