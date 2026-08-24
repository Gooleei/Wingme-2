import { LevelConfig, Character, CharacterSkin, LeaderboardEntry, PlayerStats } from '../types';

export const GAME_LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Cyber City',
    subtitle: 'District Zero',
    theme: 'cyber',
    targetDistance: 600,
    baseSpeed: 7.0,
    maxSpeed: 10.5,
    speedIncrement: 0.003,
    cashDropGoal: 30, // $30 total collectible in coins
    distanceBonus: 3, // $3 distance bonus
    obstaclePenalty: 0.8, // -$0.80 loss on obstacle hit
    accentColor: '#38BDF8', // Sky Cyan
    secondaryColor: '#818CF8', // Indigo
    skyColors: ['#030712', '#0f172a'],
    groundColor: '#1e293b',
    trackColor: '#0ea5e9',
    description: 'Neon alleys, high-voltage laser wires, cyber drone patrols, and speed barriers.',
    parTimeTargetSec: 42.5,
    badge: '⚡ Rookie Runner'
  },
  {
    id: 2,
    name: 'Magma Core',
    subtitle: 'Volcanic Rift',
    theme: 'magma',
    targetDistance: 900,
    baseSpeed: 8.2,
    maxSpeed: 12.0,
    speedIncrement: 0.0035,
    cashDropGoal: 30,
    distanceBonus: 3,
    obstaclePenalty: 0.8,
    accentColor: '#FB923C', // Orange
    secondaryColor: '#EF4444', // Red
    skyColors: ['#180808', '#2a0a0a'],
    groundColor: '#2b1414',
    trackColor: '#f97316',
    description: 'Molten lava geysers, rolling fire boulders, and scorched terrain.',
    parTimeTargetSec: 55.0,
    badge: '🔥 Lava Master'
  },
  {
    id: 3,
    name: 'Neon Hypergrid',
    subtitle: 'Synthetic Matrix',
    theme: 'neon',
    targetDistance: 1200,
    baseSpeed: 9.2,
    maxSpeed: 13.5,
    speedIncrement: 0.004,
    cashDropGoal: 30,
    distanceBonus: 3,
    obstaclePenalty: 0.8,
    accentColor: '#A855F7', // Purple
    secondaryColor: '#EC4899', // Pink
    skyColors: ['#0d041c', '#1e0836'],
    groundColor: '#1f1338',
    trackColor: '#d946ef',
    description: 'Glitch walls, pulsing plasma gates, and multi-tier floating platforms.',
    parTimeTargetSec: 68.0,
    badge: '👾 Matrix Phantom'
  },
  {
    id: 4,
    name: 'Celestial Void',
    subtitle: 'Cosmic Expanse',
    theme: 'void',
    targetDistance: 1500,
    baseSpeed: 10.0,
    maxSpeed: 15.0,
    speedIncrement: 0.0045,
    cashDropGoal: 30,
    distanceBonus: 3,
    obstaclePenalty: 0.8,
    accentColor: '#2DD4BF', // Teal
    secondaryColor: '#3B82F6', // Blue
    skyColors: ['#020617', '#082f49'],
    groundColor: '#0b1d33',
    trackColor: '#14b8a6',
    description: 'Floating meteoroids, low gravity jump gaps, and orbital defense turrets.',
    parTimeTargetSec: 80.0,
    badge: '🌌 Astral Legend'
  },
  {
    id: 5,
    name: 'Quantum Nexus',
    subtitle: 'Apex Singularity',
    theme: 'quantum',
    targetDistance: 2000,
    baseSpeed: 11.0,
    maxSpeed: 16.5,
    speedIncrement: 0.005,
    cashDropGoal: 30,
    distanceBonus: 3,
    obstaclePenalty: 0.8,
    accentColor: '#FACC15', // Gold
    secondaryColor: '#10B981', // Emerald
    skyColors: ['#0f0b00', '#1c1503'],
    groundColor: '#261c02',
    trackColor: '#eab308',
    description: 'Expert Hard! Hyper-speed distortion, shifting vortexes, and extreme agility challenges.',
    parTimeTargetSec: 99.0,
    badge: '👑 Apex Champion'
  }
];

export const CHARACTERS: Character[] = [
  {
    id: 'volt',
    name: 'Volt Runner',
    title: 'Speed Pioneer',
    avatar: '🏃',
    color: '#38BDF8',
    trailColor: 'rgba(56, 189, 248, 0.4)',
    price: 0,
    jumpPower: 12.5,
    speedBonus: 1.0,
    hasDoubleJump: false,
    magnetRadiusMultiplier: 1.0,
    cashBonusMultiplier: 1.0,
    description: 'Standard agility sprinter with crisp responsive leap physics.',
    abilityName: 'Acrobat Slide',
    abilityDescription: 'Quick low profile slide ducking under high lasers.'
  },
  {
    id: 'ninja',
    name: 'Shadow Ninja',
    title: 'Acrobatic Shinobi',
    avatar: '🥷',
    color: '#A855F7',
    trailColor: 'rgba(168, 85, 247, 0.4)',
    price: 15.0,
    jumpPower: 13.2,
    speedBonus: 1.05,
    hasDoubleJump: true,
    magnetRadiusMultiplier: 1.1,
    cashBonusMultiplier: 1.0,
    description: 'Master of mid-air jumps. Can leap twice to clear massive hazards!',
    abilityName: 'Double Leap',
    abilityDescription: 'Press Jump while airborne to perform a secondary mid-air flip.'
  },
  {
    id: 'valkyrie',
    name: 'Cyber Valkyrie',
    title: 'Shield Aegis',
    avatar: '🛡️',
    color: '#2DD4BF',
    trailColor: 'rgba(45, 212, 191, 0.4)',
    price: 25.0,
    jumpPower: 12.8,
    speedBonus: 1.0,
    hasDoubleJump: false,
    magnetRadiusMultiplier: 1.6,
    cashBonusMultiplier: 1.1,
    description: 'Starts each run with an Energy Shield that absorbs 1 obstacle hit (saving -$0.80)!',
    abilityName: 'Aegis Barrier',
    abilityDescription: 'Starts with 1 free shield and has 60% wider coin magnet suction.'
  },
  {
    id: 'mecha',
    name: 'Mecha Titan',
    title: 'Heavy Vanguard',
    avatar: '🤖',
    color: '#F97316',
    trailColor: 'rgba(249, 115, 22, 0.4)',
    price: 40.0,
    jumpPower: 13.5,
    speedBonus: 1.1,
    hasDoubleJump: true,
    magnetRadiusMultiplier: 1.3,
    cashBonusMultiplier: 1.15,
    description: 'Armored juggernaut with heavy ground-pound ability and enhanced shock resistance.',
    abilityName: 'Impact Dash',
    abilityDescription: 'Extended slide duration and heavy armor protection.'
  },
  {
    id: 'phantom',
    name: 'Quantum Phantom',
    title: 'Time Warper',
    avatar: '⚡',
    color: '#FACC15',
    trailColor: 'rgba(250, 204, 21, 0.5)',
    price: 65.0,
    jumpPower: 13.8,
    speedBonus: 1.18,
    hasDoubleJump: true,
    magnetRadiusMultiplier: 2.0,
    cashBonusMultiplier: 1.25,
    description: 'The ultimate runner! Max jump power, permanent super magnet, and +25% Cash earnings.',
    abilityName: 'Quantum Surge',
    abilityDescription: 'Double jump + Super Magnet + 1.25x Cash collection multiplier!'
  }
];

export const SKINS: CharacterSkin[] = [
  { id: 'skin_default', characterId: 'volt', name: 'Original Cyber', price: 0, glowColor: '#38BDF8', bodyColor: '#0284c7', pattern: 'circuit', unlockedByDefault: true },
  { id: 'skin_volt_gold', characterId: 'volt', name: 'Golden Champion', price: 8.0, glowColor: '#FACC15', bodyColor: '#CA8A04', pattern: 'gold' },
  { id: 'skin_volt_dark', characterId: 'volt', name: 'Stealth Matte', price: 6.0, glowColor: '#64748B', bodyColor: '#1E293B', pattern: 'stealth' },
  { id: 'skin_ninja_crimson', characterId: 'ninja', name: 'Crimson Eclipse', price: 10.0, glowColor: '#EF4444', bodyColor: '#991B1B', pattern: 'crimson' },
  { id: 'skin_valk_holo', characterId: 'valkyrie', name: 'Prismatic Holo', price: 12.0, glowColor: '#E879F9', bodyColor: '#86198F', pattern: 'holo' },
  { id: 'skin_phantom_nexus', characterId: 'phantom', name: 'Apex Singularity', price: 20.0, glowColor: '#FDE047', bodyColor: '#4ADE80', pattern: 'nexus' }
];

export const SEED_LEADERBOARDS: LeaderboardEntry[] = [
  // Level 1 Cyber City
  { id: 'l1_1', playerName: 'VortexSpeed', characterId: 'phantom', levelId: 1, timeMs: 38420, distance: 600, cashCollected: 30, timestamp: Date.now() - 1200000, avatar: '⚡', badge: '🥇 World Record' },
  { id: 'l1_2', playerName: 'HyperDash_99', characterId: 'ninja', levelId: 1, timeMs: 39150, distance: 600, cashCollected: 30, timestamp: Date.now() - 3400000, avatar: '🥷', badge: '🥈 Master' },
  { id: 'l1_3', playerName: 'NeonGlider', characterId: 'volt', levelId: 1, timeMs: 40220, distance: 600, cashCollected: 29.5, timestamp: Date.now() - 8900000, avatar: '🏃', badge: '🥉 Elite' },
  { id: 'l1_4', playerName: 'CyberKnight', characterId: 'valkyrie', levelId: 1, timeMs: 41800, distance: 600, cashCollected: 30, timestamp: Date.now() - 15000000, avatar: '🛡️' },
  { id: 'l1_5', playerName: 'PixelRunner', characterId: 'volt', levelId: 1, timeMs: 43250, distance: 600, cashCollected: 28.0, timestamp: Date.now() - 25000000, avatar: '🏃' },

  // Level 2 Magma Core
  { id: 'l2_1', playerName: 'MagmaStriker', characterId: 'phantom', levelId: 2, timeMs: 51200, distance: 900, cashCollected: 30, timestamp: Date.now() - 2200000, avatar: '⚡', badge: '🥇 World Record' },
  { id: 'l2_2', playerName: 'InfernoApex', characterId: 'ninja', levelId: 2, timeMs: 52400, distance: 900, cashCollected: 30, timestamp: Date.now() - 5400000, avatar: '🥷', badge: '🥈 Master' },
  { id: 'l2_3', playerName: 'AshWalker', characterId: 'mecha', levelId: 2, timeMs: 53900, distance: 900, cashCollected: 30, timestamp: Date.now() - 9800000, avatar: '🤖', badge: '🥉 Elite' },

  // Level 3 Neon Hypergrid
  { id: 'l3_1', playerName: 'GlitchSurfer', characterId: 'phantom', levelId: 3, timeMs: 64100, distance: 1200, cashCollected: 30, timestamp: Date.now() - 1500000, avatar: '⚡', badge: '🥇 World Record' },
  { id: 'l3_2', playerName: 'MatrixZero', characterId: 'valkyrie', levelId: 3, timeMs: 65800, distance: 1200, cashCollected: 30, timestamp: Date.now() - 4100000, avatar: '🛡️', badge: '🥈 Master' },

  // Level 4 Celestial Void
  { id: 'l4_1', playerName: 'StarSurge', characterId: 'phantom', levelId: 4, timeMs: 76500, distance: 1500, cashCollected: 30, timestamp: Date.now() - 900000, avatar: '⚡', badge: '🥇 World Record' },
  { id: 'l4_2', playerName: 'CosmicShadow', characterId: 'ninja', levelId: 4, timeMs: 78200, distance: 1500, cashCollected: 30, timestamp: Date.now() - 2800000, avatar: '🥷', badge: '🥈 Master' },

  // Level 5 Quantum Nexus
  { id: 'l5_1', playerName: 'SingularityGod', characterId: 'phantom', levelId: 5, timeMs: 94800, distance: 2000, cashCollected: 30, timestamp: Date.now() - 600000, avatar: '⚡', badge: '👑 APEX RECORD' },
  { id: 'l5_2', playerName: 'ChronosSpeed', characterId: 'ninja', levelId: 5, timeMs: 97100, distance: 2000, cashCollected: 30, timestamp: Date.now() - 1800000, avatar: '🥷', badge: '🥈 Master' }
];

export const INITIAL_PLAYER_STATS: PlayerStats = {
  balance: 10.00, // Initial bonus
  totalRuns: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDistanceRun: 0,
  totalCashEarned: 0,
  totalPenaltyPaid: 0,
  unlockedCharacters: ['volt'],
  selectedCharacterId: 'volt',
  unlockedSkins: ['skin_default'],
  selectedSkinId: 'skin_default',
  unlockedLevels: 1,
  highScores: {},
  endlessBestDistance: 0,
  streak: 1,
  lastPlayDate: new Date().toISOString().split('T')[0],
  lastDailyClaimTime: null,
  upgrades: {
    magnetLevel: 0,
    shieldDuration: 0,
    doubleJumpUnlocked: false,
    speedBoostLevel: 0
  }
};
