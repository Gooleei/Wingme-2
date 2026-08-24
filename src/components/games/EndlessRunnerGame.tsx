import React, { useState } from 'react';
import { LevelConfig, Character, CharacterSkin, PlayerStats, LeaderboardEntry } from '../../types';
import { GAME_LEVELS, CHARACTERS, SKINS } from '../../data/gameData';
import { EndlessRunnerCanvas } from '../EndlessRunnerCanvas';
import { CharacterShopModal } from '../CharacterShopModal';
import { LeaderboardModal } from '../LeaderboardModal';
import { sound } from '../../utils/audio';
import { 
  ArrowLeft, 
  Play, 
  Trophy, 
  Sparkles, 
  Lock, 
  CheckCircle2, 
  Flame, 
  ChevronRight, 
  Shield, 
  Zap, 
  RotateCcw, 
  Coins, 
  Medal,
  Users,
  Award
} from 'lucide-react';

interface EndlessRunnerGameProps {
  stats: PlayerStats;
  setStats: React.Dispatch<React.SetStateAction<PlayerStats>>;
  leaderboards: LeaderboardEntry[];
  setLeaderboards: React.Dispatch<React.SetStateAction<LeaderboardEntry[]>>;
  onWin: (amount: number, description: string) => void;
  onLossPenalty: (penalty: number, description: string) => void;
  onBack: () => void;
}

export const EndlessRunnerGame: React.FC<EndlessRunnerGameProps> = ({
  stats,
  setStats,
  leaderboards,
  setLeaderboards,
  onWin,
  onLossPenalty,
  onBack
}) => {
  const [subView, setSubView] = useState<'WORLDS' | 'PLAYING'>('WORLDS');
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(GAME_LEVELS[0]);
  const [isEndlessMode, setIsEndlessMode] = useState<boolean>(false);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // Selected Character & Skin
  const selectedCharacter = CHARACTERS.find((c) => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  const selectedSkin = SKINS.find((s) => s.id === stats.selectedSkinId);

  const startLevel = (level: LevelConfig, endless: boolean = false) => {
    sound.playClick();
    setActiveLevel(level);
    setIsEndlessMode(endless);
    setSubView('PLAYING');
  };

  const handleGameWin = (result: {
    timeMs: number;
    distance: number;
    cashEarned: number;
    distanceBonus: number;
  }) => {
    const totalWin = +(result.cashEarned + result.distanceBonus).toFixed(2);
    
    // Update player stats
    setStats((prev) => {
      const nextUnlocked = Math.max(prev.unlockedLevels, Math.min(5, activeLevel.id + 1));
      const currentBest = prev.highScores[activeLevel.id]?.bestTimeMs || Infinity;
      const newBestTime = result.timeMs < currentBest ? result.timeMs : currentBest;

      return {
        ...prev,
        balance: +(prev.balance + totalWin).toFixed(2),
        totalRuns: prev.totalRuns + 1,
        totalWins: prev.totalWins + 1,
        totalDistanceRun: prev.totalDistanceRun + result.distance,
        totalCashEarned: +(prev.totalCashEarned + totalWin).toFixed(2),
        unlockedLevels: nextUnlocked,
        highScores: {
          ...prev.highScores,
          [activeLevel.id]: {
            bestTimeMs: newBestTime,
            bestDistance: Math.max(prev.highScores[activeLevel.id]?.bestDistance || 0, result.distance)
          }
        }
      };
    });

    // Add entry to leaderboards
    const newEntry: LeaderboardEntry = {
      id: `run-${Date.now()}`,
      playerName: 'You (Player)',
      characterId: selectedCharacter.id,
      levelId: activeLevel.id,
      timeMs: result.timeMs,
      distance: result.distance,
      cashCollected: totalWin,
      timestamp: Date.now(),
      isCurrentUser: true,
      avatar: selectedCharacter.avatar,
      badge: 'Speedrun Hero'
    };

    setLeaderboards((prev) => [newEntry, ...prev]);
    onWin(totalWin, `🏃 Endless Runner Level ${activeLevel.id} (${activeLevel.name}) Cleared!`);
  };

  const handleGameLoss = (result: {
    distance: number;
    penalty: number;
    cashEarned: number;
  }) => {
    const net = -(result.penalty);
    setStats((prev) => ({
      ...prev,
      balance: Math.max(0, +(prev.balance + net).toFixed(2)),
      totalRuns: prev.totalRuns + 1,
      totalLosses: prev.totalLosses + 1,
      totalDistanceRun: prev.totalDistanceRun + result.distance,
      totalPenaltyPaid: +(prev.totalPenaltyPaid + result.penalty).toFixed(2)
    }));

    onLossPenalty(result.penalty, `💥 Endless Runner Obstacle Hit Penalty (-$${result.penalty.toFixed(2)})`);
  };

  const handleNextLevel = () => {
    const nextLvlIndex = GAME_LEVELS.findIndex((l) => l.id === activeLevel.id) + 1;
    if (nextLvlIndex < GAME_LEVELS.length) {
      setActiveLevel(GAME_LEVELS[nextLvlIndex]);
      setIsEndlessMode(false);
      sound.playClick();
    } else {
      setSubView('WORLDS');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {subView === 'PLAYING' ? (
        <div className="space-y-4">
          <EndlessRunnerCanvas
            level={activeLevel}
            character={selectedCharacter}
            skin={selectedSkin}
            stats={stats}
            isEndlessMode={isEndlessMode}
            onGameWin={handleGameWin}
            onGameLoss={handleGameLoss}
            onExit={() => {
              sound.playClick();
              setSubView('WORLDS');
            }}
            onNextLevel={handleNextLevel}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Title & Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  onBack();
                }}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
                  <span>🏃 Endless Runner Arena</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-extrabold uppercase">
                    5 Hard Worlds
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dodge lasers & spikes, collect $30 cash + $3 distance bonus. Obstacle hit penalty: -$0.80.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setShowShop(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <span className="text-base">{selectedCharacter.avatar}</span>
                <span>Heroes & Suits</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setShowLeaderboard(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105"
              >
                <Trophy className="w-3.5 h-3.5 text-cyan-400" />
                <span>Speedrun Ranks</span>
              </button>

              <button
                onClick={() => startLevel(GAME_LEVELS[0], true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black transition-all shadow-lg shadow-purple-600/30 cursor-pointer hover:scale-105"
              >
                <Flame className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Endless Mode</span>
              </button>
            </div>
          </div>

          {/* Active Hero Profile Bar */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-3xl border border-slate-700">
                {selectedCharacter.avatar}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-sm">{selectedCharacter.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    {selectedCharacter.title}
                  </span>
                </div>
                <p className="text-xs text-amber-400 font-medium mt-0.5">
                  Ability: {selectedCharacter.abilityName} — {selectedCharacter.abilityDescription}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Total Runs</span>
                <strong className="text-white text-sm">{stats.totalRuns}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Total Wins</span>
                <strong className="text-emerald-400 text-sm">{stats.totalWins}</strong>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Runner Cash</span>
                <strong className="text-cyan-300 text-sm">${stats.totalCashEarned.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* 5 Distinct World Levels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAME_LEVELS.map((lvl) => {
              const isUnlocked = lvl.id <= stats.unlockedLevels;
              const bestScore = stats.highScores[lvl.id];

              return (
                <div
                  key={lvl.id}
                  className={`group relative rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                    isUnlocked
                      ? 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 shadow-xl hover:shadow-2xl hover:scale-[1.02]'
                      : 'bg-slate-950/70 border-slate-900 opacity-60'
                  }`}
                >
                  {/* World Preview Card Header */}
                  <div
                    className="h-32 p-5 relative flex flex-col justify-between overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${lvl.skyColors[0]}, ${lvl.skyColors[1]})`
                    }}
                  >
                    <div className="flex items-center justify-between z-10">
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-black/50 text-white backdrop-blur-sm border border-white/20">
                        World {lvl.id}
                      </span>
                      {isUnlocked ? (
                        <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 shadow-md">
                          {lvl.badge}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-black/60 text-slate-400 border border-slate-700">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                    </div>

                    <div className="z-10">
                      <h3 className="text-xl font-black text-white drop-shadow-md">{lvl.name}</h3>
                      <p className="text-xs text-slate-200 drop-shadow-sm">{lvl.subtitle}</p>
                    </div>

                    {/* Background Decorative Mesh Glow */}
                    <div
                      className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl opacity-40"
                      style={{ backgroundColor: lvl.accentColor }}
                    />
                  </div>

                  {/* World Details Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-slate-400 leading-relaxed">{lvl.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-medium">Target Distance</span>
                        <strong className="text-cyan-300 font-extrabold text-sm">{lvl.targetDistance}m</strong>
                      </div>
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Clear Win</span>
                        <strong className="text-emerald-400 font-extrabold text-sm">
                          +${(lvl.cashDropGoal + lvl.distanceBonus).toFixed(2)}
                        </strong>
                      </div>
                    </div>

                    {/* Best Highscore */}
                    {bestScore && (
                      <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        <span className="flex items-center gap-1 font-bold">
                          <Trophy className="w-3.5 h-3.5" /> Best Speedrun
                        </span>
                        <span className="font-mono font-bold">{(bestScore.bestTimeMs / 1000).toFixed(2)}s</span>
                      </div>
                    )}

                    {/* Play Button */}
                    <button
                      disabled={!isUnlocked}
                      onClick={() => startLevel(lvl)}
                      className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        isUnlocked
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-[1.02] active:scale-95'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Enter World {lvl.id}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Clear World {lvl.id - 1} First</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Infinite Endless Run Card */}
            <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-b from-purple-950/40 to-slate-900 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-purple-500 text-white">
                    Endurance
                  </span>
                  <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
                </div>
                <h3 className="text-2xl font-black text-white mt-2">Infinite Survival</h3>
                <p className="text-xs text-purple-200/80">
                  Unlimited running distance with escalating difficulty and infinite cash item generation.
                </p>
              </div>

              <div className="py-4 space-y-2">
                <div className="bg-slate-950/90 p-3 rounded-xl border border-purple-900/50 flex justify-between text-xs">
                  <span className="text-slate-400">Best Endless Record</span>
                  <strong className="text-purple-300 font-black">{stats.endlessBestDistance}m</strong>
                </div>
              </div>

              <button
                onClick={() => startLevel(GAME_LEVELS[0], true)}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-sm transition-all shadow-xl shadow-purple-500/30 cursor-pointer active:scale-95"
              >
                Launch Infinite Run
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showShop && (
        <CharacterShopModal
          stats={stats}
          setStats={setStats}
          onClose={() => setShowShop(false)}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          leaderboards={leaderboards}
          currentLevelId={activeLevel.id}
          onClose={() => setShowLeaderboard(false)}
        />
      )}
    </div>
  );
};
