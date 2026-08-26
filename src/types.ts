export type AppView = 
  | 'LANDING'
  | 'AUTH'
  | 'DASHBOARD'
  | 'WATCH'
  | 'MINE'
  | 'GAME_RUNNER'
  | 'GAME_MEMORY'
  | 'GAME_TICTACTOE'
  | 'GAME_NUMBERS'
  | 'GAME_SPELLING'
  | 'GAME_SCRATCH'
  | 'GAME_SPIN'
  | 'LEADERBOARD'
  | 'REWARDS'
  | 'PROFILE'
  | 'HISTORY';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  pin: string;
  isGuest: boolean;
  avatar: string;
  createdAt: string;
  level: number;
  gamesPlayedToday: number;
  winStreak: number;
  spinLockedUntil: number | null; // 7-day jackpot timer or null if unlocked
}

export interface PlayerStats {
  balance: number;
  totalRuns: number;
  totalWins: number;
  totalLosses: number;
  totalDistanceRun: number;
  totalCashEarned: number;
  totalPenaltyPaid: number;
  unlockedCharacters: string[];
  selectedCharacterId: string;
  unlockedSkins: string[];
  selectedSkinId: string;
  unlockedLevels: number; // 1 to 5 (or 6 for infinite)
  highScores: Record<number, { bestTimeMs: number; bestDistance: number }>; // levelId -> stats
  endlessBestDistance: number;
  streak: number;
  lastPlayDate: string;
  lastDailyClaimTime: number | null;
  upgrades: {
    magnetLevel: number;
    shieldDuration: number;
    doubleJumpUnlocked: boolean;
    speedBoostLevel: number;
  };
  mineProgress?: {
    currentLevel: number; // 1 to 15
    tapsInLevel: number;
    totalTaps: number;
    totalEarnedCash: number;
    highestLevelUnlocked: number;
  };
}

export interface MineLevelConfig {
  level: number;
  name: string;
  requiredTaps: number;
  tapReward: number; // Cash earned per single tap (scales +20% per level)
  bonusReward: number;
  gemSizeClass: string;
  gemVisualTheme: string;
  glowColor: string;
  accentColor: string;
  appraisalShout: string;
  statusTitle: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  theme: 'cyber' | 'magma' | 'neon' | 'void' | 'quantum';
  targetDistance: number; // in meters (e.g., 600, 900, 1200, 1500, 2000)
  baseSpeed: number;
  maxSpeed: number;
  speedIncrement: number;
  cashDropGoal: number; // Total collectible cash on track = $30
  distanceBonus: number; // $3 bonus
  obstaclePenalty: number; // -$0.80 on hit
  accentColor: string;
  secondaryColor: string;
  skyColors: [string, string];
  groundColor: string;
  trackColor: string;
  description: string;
  parTimeTargetSec: number;
  badge: string;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  avatar: string;
  color: string;
  trailColor: string;
  price: number; // 0 for default
  jumpPower: number;
  speedBonus: number;
  hasDoubleJump: boolean;
  magnetRadiusMultiplier: number;
  cashBonusMultiplier: number;
  description: string;
  abilityName: string;
  abilityDescription: string;
}

export interface CharacterSkin {
  id: string;
  characterId: string;
  name: string;
  price: number;
  glowColor: string;
  bodyColor: string;
  pattern: string;
  unlockedByDefault?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  rank?: number;
  playerName: string;
  characterId: string;
  levelId: number;
  timeMs: number; // Time in milliseconds for speedrun
  distance: number;
  cashCollected: number;
  timestamp: number;
  isCurrentUser?: boolean;
  avatar: string;
  badge?: string;
}

export interface WalletTransaction {
  id: number;
  description: string;
  amount: number;
  type: 'win' | 'loss' | 'bonus' | 'withdraw' | 'purchase';
  date: string;
  token?: string;
  address?: string;
  status?: 'completed' | 'pending' | 'processing';
  txHash?: string;
}

export interface CryptoToken {
  symbol: string;
  name: string;
  network: string;
  iconColor: string;
  minWithdraw: number;
  fee: number;
  placeholder: string;
}

// ₮ Point Conversion System ($15.00 USD = ₮1.00 Point)
export const DOLLARS_PER_T_POINT = 15;
export const convertDollarsToTPoints = (dollars: number): number => +(dollars / DOLLARS_PER_T_POINT).toFixed(2);
export const convertTPointsToDollars = (tPoints: number): number => +(tPoints * DOLLARS_PER_T_POINT).toFixed(2);

export interface ReferralTier {
  referralsRequired: number;
  multiplierText: string;
  multiplierValue: number;
  rewardAmount: number;
  title: string;
  badge: string;
}

export interface ReferralMember {
  id: string;
  username: string;
  avatar: string;
  joinedDate: string;
  status: 'Active' | 'VIP Bronze' | 'VIP Silver' | 'VIP Gold' | 'Mining Pro' | 'Runner Master';
  earnedForYou: number;
  activityCount: number;
}

export interface ReferralNetworkState {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  claimedTiers: number[];
  networkMembers: ReferralMember[];
}

