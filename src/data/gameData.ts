import { LevelConfig, Character, CharacterSkin, LeaderboardEntry, PlayerStats, MineLevelConfig } from '../types';

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

export const MINE_LEVELS: MineLevelConfig[] = [
  {
    level: 1,
    name: 'Novice Prospector',
    requiredTaps: 2000,
    tapReward: 0.30,
    bonusReward: 25.00,
    gemSizeClass: 'w-32 h-32 sm:w-36 sm:h-36',
    gemVisualTheme: 'from-cyan-400 via-teal-300 to-emerald-400',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    accentColor: '#22d3ee',
    appraisalShout: '🌟 UNBELIEVABLE HUSTLE! Level 1 Novice Prospector conquered! The diamond begins to expand in radiance!',
    statusTitle: 'Rookie Excavator'
  },
  {
    level: 2,
    name: 'Ruby Quarryman',
    requiredTaps: 5000,
    tapReward: 0.36,
    bonusReward: 50.00,
    gemSizeClass: 'w-36 h-36 sm:w-40 sm:h-40',
    gemVisualTheme: 'from-rose-500 via-red-400 to-amber-400',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    accentColor: '#f43f5e',
    appraisalShout: '🔥 BLAZING TENACITY! Level 2 Ruby Quarryman cleared! Your mining speed is ferocious!',
    statusTitle: 'Ruby Master'
  },
  {
    level: 3,
    name: 'Emerald Miner',
    requiredTaps: 8000,
    tapReward: 0.43,
    bonusReward: 75.00,
    gemSizeClass: 'w-40 h-40 sm:w-44 sm:h-44',
    gemVisualTheme: 'from-emerald-400 via-teal-300 to-cyan-400',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    accentColor: '#10b981',
    appraisalShout: '💎 DIAMOND HANDS! Level 3 Emerald Miner mastered! The gemstone pulses with high-voltage power!',
    statusTitle: 'Emerald Artisan'
  },
  {
    level: 4,
    name: 'Sapphire Excavator',
    requiredTaps: 12000,
    tapReward: 0.52,
    bonusReward: 100.00,
    gemSizeClass: 'w-44 h-44 sm:w-48 sm:h-48',
    gemVisualTheme: 'from-blue-500 via-indigo-400 to-cyan-300',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    accentColor: '#3b82f6',
    appraisalShout: '⚡ ELECTRIC PRECISION! Level 4 Sapphire Excavator crushed! High-yield crystal veins unlocked!',
    statusTitle: 'Sapphire King'
  },
  {
    level: 5,
    name: 'Diamond Driller',
    requiredTaps: 20000,
    tapReward: 0.62,
    bonusReward: 150.00,
    gemSizeClass: 'w-48 h-48 sm:w-52 sm:h-52',
    gemVisualTheme: 'from-cyan-300 via-sky-200 to-blue-400',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    accentColor: '#38bdf8',
    appraisalShout: '🏆 MASTERWORK DRILLING! Level 5 Diamond Driller achieved! The syndicate stands in awe of your grind!',
    statusTitle: 'Diamond Vanguard'
  },
  {
    level: 6,
    name: 'Crystal Baron',
    requiredTaps: 30000,
    tapReward: 0.75,
    bonusReward: 200.00,
    gemSizeClass: 'w-52 h-52 sm:w-56 sm:h-56',
    gemVisualTheme: 'from-purple-500 via-fuchsia-400 to-pink-400',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    accentColor: '#a855f7',
    appraisalShout: '👑 BARON OF WEALTH! Level 6 Crystal Baron unlocked! Massive wealth flows straight into your vaults!',
    statusTitle: 'Crystal Royalty'
  },
  {
    level: 7,
    name: 'Mythic Gem Collector',
    requiredTaps: 45000,
    tapReward: 0.90,
    bonusReward: 250.00,
    gemSizeClass: 'w-56 h-56 sm:w-60 sm:h-60',
    gemVisualTheme: 'from-amber-400 via-rose-400 to-purple-400',
    glowColor: 'rgba(251, 191, 36, 0.55)',
    accentColor: '#fbbf24',
    appraisalShout: '✨ MYTHIC GLORY! Level 7 Mythic Gem Collector completed! Your diamond shines with legendary luster!',
    statusTitle: 'Mythic Sovereign'
  },
  {
    level: 8,
    name: 'Obsidian Master',
    requiredTaps: 65000,
    tapReward: 1.07,
    bonusReward: 300.00,
    gemSizeClass: 'w-60 h-60 sm:w-64 sm:h-64',
    gemVisualTheme: 'from-violet-600 via-indigo-500 to-slate-900',
    glowColor: 'rgba(124, 58, 237, 0.6)',
    accentColor: '#7c3aed',
    appraisalShout: '🌑 OBSIDIAN TITAN! Level 8 Obsidian Master conquered! Unbreakable resolve and relentless momentum!',
    statusTitle: 'Obsidian Overlord'
  },
  {
    level: 9,
    name: 'Titanium Tycoon',
    requiredTaps: 90000,
    tapReward: 1.29,
    bonusReward: 350.00,
    gemSizeClass: 'w-64 h-64 sm:w-68 sm:h-68',
    gemVisualTheme: 'from-slate-200 via-teal-300 to-amber-300',
    glowColor: 'rgba(148, 163, 184, 0.6)',
    accentColor: '#94a3b8',
    appraisalShout: '🚀 INDUSTRIAL PHENOMENON! Level 9 Titanium Tycoon unlocked! You dominate the Bellmont mines!',
    statusTitle: 'Titanium Tycoon'
  },
  {
    level: 10,
    name: 'Void Shard Sovereign',
    requiredTaps: 125000,
    tapReward: 1.55,
    bonusReward: 400.00,
    gemSizeClass: 'w-68 h-68 sm:w-72 sm:h-72',
    gemVisualTheme: 'from-cyan-400 via-indigo-500 to-purple-600',
    glowColor: 'rgba(6, 182, 212, 0.65)',
    accentColor: '#06b6d4',
    appraisalShout: '🌌 REALM CONQUEROR! Level 10 Void Shard Sovereign mastered! Reality itself bends around your fortune!',
    statusTitle: 'Void Sovereign'
  },
  {
    level: 11,
    name: 'Celestial Overlord',
    requiredTaps: 170000,
    tapReward: 1.86,
    bonusReward: 450.00,
    gemSizeClass: 'w-72 h-72 sm:w-76 sm:h-76',
    gemVisualTheme: 'from-yellow-300 via-amber-400 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.65)',
    accentColor: '#f59e0b',
    appraisalShout: '☀️ CELESTIAL SPLENDOR! Level 11 Celestial Overlord achieved! Radiating pure cosmic energy!',
    statusTitle: 'Celestial Ruler'
  },
  {
    level: 12,
    name: 'Astral Kingpin',
    requiredTaps: 225000,
    tapReward: 2.23,
    bonusReward: 500.00,
    gemSizeClass: 'w-76 h-76 sm:w-80 sm:h-80',
    gemVisualTheme: 'from-fuchsia-500 via-violet-500 to-cyan-400',
    glowColor: 'rgba(217, 70, 239, 0.7)',
    accentColor: '#d946ef',
    appraisalShout: '💫 ASTRAL SUPREMACY! Level 12 Astral Kingpin unlocked! Unrivaled empire building!',
    statusTitle: 'Astral Kingpin'
  },
  {
    level: 13,
    name: 'Cosmic Oligarch',
    requiredTaps: 300000,
    tapReward: 2.67,
    bonusReward: 600.00,
    gemSizeClass: 'w-80 h-80 sm:w-84 sm:h-84',
    gemVisualTheme: 'from-emerald-300 via-cyan-400 to-indigo-500',
    glowColor: 'rgba(52, 211, 153, 0.7)',
    accentColor: '#34d399',
    appraisalShout: '🪐 COSMIC DYNASTY! Level 13 Cosmic Oligarch conquered! The Godfather throne is within reach!',
    statusTitle: 'Cosmic Oligarch'
  },
  {
    level: 14,
    name: 'Syndicate Emperor',
    requiredTaps: 400000,
    tapReward: 3.21,
    bonusReward: 750.00,
    gemSizeClass: 'w-84 h-84 sm:w-88 sm:h-88',
    gemVisualTheme: 'from-amber-300 via-yellow-400 to-rose-600',
    glowColor: 'rgba(251, 191, 36, 0.75)',
    accentColor: '#fbbf24',
    appraisalShout: '🏛️ IMPERIAL MAJESTY! Level 14 Syndicate Emperor ascended! ONE STEP AWAY FROM ULTIMATE GODFATHER STATUS!',
    statusTitle: 'Syndicate Emperor'
  },
  {
    level: 15,
    name: 'The GodFather',
    requiredTaps: 550000,
    tapReward: 3.85,
    bonusReward: 1000.00,
    gemSizeClass: 'w-88 h-88 sm:w-96 sm:h-96',
    gemVisualTheme: 'from-amber-300 via-yellow-200 to-white',
    glowColor: 'rgba(255, 215, 0, 0.85)',
    accentColor: '#ffd700',
    appraisalShout: '👑 ALL HAIL THE GODFATHER! Level 15 Masterwork Crown Unlocked! You reign supreme at the highest summit of Bellmont!',
    statusTitle: 'The GodFather Supreme'
  }
];

export const INITIAL_PLAYER_STATS: PlayerStats = {
  balance: 0.00, // Fresh clean balance for newly registered users
  totalRuns: 0,
  totalWins: 0,
  totalLosses: 0,
  totalDistanceRun: 0,
  totalCashEarned: 0.00,
  totalPenaltyPaid: 0.00,
  unlockedCharacters: ['volt'],
  selectedCharacterId: 'volt',
  unlockedSkins: ['skin_default'],
  selectedSkinId: 'skin_default',
  unlockedLevels: 1,
  highScores: {},
  endlessBestDistance: 0,
  streak: 0,
  lastPlayDate: new Date().toISOString().split('T')[0],
  lastDailyClaimTime: null,
  upgrades: {
    magnetLevel: 0,
    shieldDuration: 0,
    doubleJumpUnlocked: false,
    speedBoostLevel: 0
  },
  mineProgress: {
    currentLevel: 1,
    tapsInLevel: 0,
    totalTaps: 0,
    totalEarnedCash: 0,
    highestLevelUnlocked: 1
  }
};
