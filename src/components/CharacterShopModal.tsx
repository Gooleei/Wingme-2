import React, { useState } from 'react';
import { Character, CharacterSkin, PlayerStats } from '../types';
import { CHARACTERS, SKINS } from '../data/gameData';
import { sound } from '../utils/audio';
import { 
  X, 
  Check, 
  Lock, 
  Sparkles, 
  Zap, 
  Shield, 
  Magnet, 
  Flame, 
  HeartHandshake, 
  Rocket, 
  Coins, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CharacterShopModalProps {
  stats: PlayerStats;
  setStats?: React.Dispatch<React.SetStateAction<PlayerStats>>;
  onSelectCharacter?: (charId: string) => void;
  onUnlockCharacter?: (character: Character) => void;
  onSelectSkin?: (skinId: string) => void;
  onUnlockSkin?: (skin: CharacterSkin) => void;
  onUpgrade?: (upgradeKey: keyof PlayerStats['upgrades'], cost: number) => void;
  onClose: () => void;
}

export const CharacterShopModal: React.FC<CharacterShopModalProps> = ({
  stats,
  setStats,
  onSelectCharacter,
  onUnlockCharacter,
  onSelectSkin,
  onUnlockSkin,
  onUpgrade,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'upgrades' | 'skins'>('characters');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [insufficientFundsInfo, setInsufficientFundsInfo] = useState<{ name: string; needed: number; cost: number } | null>(null);

  const selectedChar = CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  const selectedSkin = SKINS.find(s => s.id === stats.selectedSkinId);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // 1. SELECT / EQUIP CHARACTER
  const handleSelectCharacter = (charId: string) => {
    sound.playClick();
    const char = CHARACTERS.find(c => c.id === charId);
    if (onSelectCharacter) {
      onSelectCharacter(charId);
    } else if (setStats) {
      setStats(prev => ({
        ...prev,
        selectedCharacterId: charId
      }));
    }
    showToast(`⚡ Equipped Suit: ${char ? char.name : charId}`);
  };

  // 2. BUY & AUTO-ACTIVATE CHARACTER / SUIT
  const handleBuyCharacter = (char: Character) => {
    if (stats.balance < char.price) {
      sound.playHit();
      setInsufficientFundsInfo({
        name: char.name,
        needed: +(char.price - stats.balance).toFixed(2),
        cost: char.price
      });
      return;
    }

    if (onUnlockCharacter) {
      onUnlockCharacter(char);
    } else if (setStats) {
      setStats(prev => ({
        ...prev,
        balance: Math.max(0, +(prev.balance - char.price).toFixed(2)),
        unlockedCharacters: prev.unlockedCharacters.includes(char.id) 
          ? prev.unlockedCharacters 
          : [...prev.unlockedCharacters, char.id],
        selectedCharacterId: char.id // AUTO-ACTIVATION
      }));
    }
    sound.playWin();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    showToast(`🎉 ${char.name} Purchased ($${char.price.toFixed(2)}) & Automatically Activated!`);
  };

  // 3. SELECT / EQUIP SKIN
  const handleSelectSkin = (skinId: string) => {
    sound.playClick();
    const skin = SKINS.find(s => s.id === skinId);
    if (onSelectSkin) {
      onSelectSkin(skinId);
    } else if (setStats) {
      setStats(prev => ({
        ...prev,
        selectedSkinId: skinId
      }));
    }
    showToast(`🎨 Equipped Coating: ${skin ? skin.name : skinId}`);
  };

  // 4. BUY & AUTO-ACTIVATE SKIN
  const handleBuySkin = (skin: CharacterSkin) => {
    if (stats.balance < skin.price) {
      sound.playHit();
      setInsufficientFundsInfo({
        name: skin.name,
        needed: +(skin.price - stats.balance).toFixed(2),
        cost: skin.price
      });
      return;
    }

    if (onUnlockSkin) {
      onUnlockSkin(skin);
    } else if (setStats) {
      setStats(prev => ({
        ...prev,
        balance: Math.max(0, +(prev.balance - skin.price).toFixed(2)),
        unlockedSkins: prev.unlockedSkins.includes(skin.id)
          ? prev.unlockedSkins
          : [...prev.unlockedSkins, skin.id],
        selectedSkinId: skin.id // AUTO-ACTIVATION
      }));
    }
    sound.playWin();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    showToast(`🎉 ${skin.name} Armor Coating Purchased ($${skin.price.toFixed(2)}) & Automatically Activated!`);
  };

  // 5. BUY & AUTO-ACTIVATE TACTICAL UPGRADE / KIT
  const handleUpgradeItem = (
    upgradeKey: keyof PlayerStats['upgrades'], 
    cost: number,
    kitName: string
  ) => {
    if (stats.balance < cost) {
      sound.playHit();
      setInsufficientFundsInfo({
        name: kitName,
        needed: +(cost - stats.balance).toFixed(2),
        cost: cost
      });
      return;
    }

    if (onUpgrade) {
      onUpgrade(upgradeKey, cost);
    } else if (setStats) {
      setStats(prev => {
        const currentVal = prev.upgrades[upgradeKey];
        const nextVal = typeof currentVal === 'boolean' ? true : Number(currentVal || 0) + 1;
        return {
          ...prev,
          balance: Math.max(0, +(prev.balance - cost).toFixed(2)),
          upgrades: {
            ...prev.upgrades,
            [upgradeKey]: nextVal
          }
        };
      });
    }
    sound.playWin();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    showToast(`⚡ ${kitName} Purchased & Automatically Activated! Balance Debited: -$${cost.toFixed(2)}`);
  };

  const currentUpgrades = stats.upgrades || {
    magnetLevel: 0,
    shieldDuration: 0,
    doubleJumpUnlocked: false,
    speedBoostLevel: 0,
    reviveKitCount: 0,
    cashMultiplierLevel: 0,
    headStartLevel: 0
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="glass-card max-w-2xl w-full rounded-3xl border border-amber-500/40 p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* TOP HEADER & BALANCE BAR */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-100 flex items-center gap-2">
                <span>Speed Runner Armory & Kits</span>
              </h3>
              <p className="text-xs text-slate-400">Instant Purchase, Direct Debit & Auto-Activation</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-2xl bg-slate-900 border border-amber-500/50 text-amber-300 font-black text-xs sm:text-sm font-arcade flex items-center gap-1.5 shadow-md">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>${stats.balance.toFixed(2)}</span>
            </div>

            <button
              onClick={() => { sound.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FLOATING SUCCESS NOTIFICATION TOAST */}
        {toastMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/60 rounded-2xl p-3 flex items-center justify-between gap-2 text-emerald-300 text-xs font-bold animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <span className="text-[10px] uppercase font-arcade px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black">
              ACTIVE
            </span>
          </div>
        )}

        {/* INSUFFICIENT FUNDS MODAL / ALERT BANNER */}
        {insufficientFundsInfo && (
          <div className="bg-rose-500/20 border border-rose-500/60 rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in shake">
            <div className="flex items-center gap-2.5 text-rose-300">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <strong className="block font-bold text-white">Insufficient Balance for {insufficientFundsInfo.name}</strong>
                <span className="text-slate-300">
                  Cost: ${insufficientFundsInfo.cost.toFixed(2)} | Current: ${stats.balance.toFixed(2)} (Need ${insufficientFundsInfo.needed.toFixed(2)} more)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setInsufficientFundsInfo(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px]"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE LOADOUT SUMMARY */}
        <div className="bg-slate-900/80 rounded-2xl p-3 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
              {selectedChar.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white">{selectedChar.name}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  ACTIVE SUIT
                </span>
                {selectedSkin && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                    {selectedSkin.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-amber-400 font-medium">{selectedChar.abilityName}: {selectedChar.abilityDescription}</p>
            </div>
          </div>

          {/* Tactical Kit Quick Badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {currentUpgrades.doubleJumpUnlocked && (
              <span className="px-2 py-0.5 rounded-lg bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-[10px] font-bold">
                🦘 2x Jump Active
              </span>
            )}
            {(currentUpgrades.shieldDuration || 0) > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                🛡️ Shield Lvl {currentUpgrades.shieldDuration}
              </span>
            )}
            {(currentUpgrades.magnetLevel || 0) > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                🧲 Magnet Lvl {currentUpgrades.magnetLevel}
              </span>
            )}
            {(currentUpgrades.speedBoostLevel || 0) > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                ⚡ Speed Lvl {currentUpgrades.speedBoostLevel}
              </span>
            )}
            {(currentUpgrades.reviveKitCount || 0) > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                ❤️ Revive Lvl {currentUpgrades.reviveKitCount}
              </span>
            )}
            {(currentUpgrades.cashMultiplierLevel || 0) > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                💰 Cash x{1 + (currentUpgrades.cashMultiplierLevel || 0) * 0.1}
              </span>
            )}
          </div>
        </div>

        {/* TAB SELECTION */}
        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold font-arcade shrink-0">
          <button
            onClick={() => { sound.playClick(); setActiveTab('characters'); }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'characters' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🏃 Runner Suits ({stats.unlockedCharacters.length}/{CHARACTERS.length})</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('upgrades'); }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upgrades' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚡ Tactical Boosters & Kits</span>
          </button>

          <button
            onClick={() => { sound.playClick(); setActiveTab('skins'); }}
            className={`flex-1 py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'skins' 
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>🎨 Armor Coatings ({stats.unlockedSkins.length}/{SKINS.length})</span>
          </button>
        </div>

        {/* TAB 1: RUNNER SUITS / CHARACTERS */}
        {activeTab === 'characters' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
            {CHARACTERS.map(char => {
              const isUnlocked = stats.unlockedCharacters.includes(char.id);
              const isSelected = stats.selectedCharacterId === char.id;

              return (
                <div
                  key={char.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500 shadow-lg shadow-amber-500/10'
                      : isUnlocked
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-md shrink-0"
                      style={{
                        backgroundColor: `${char.color}22`,
                        borderColor: char.color
                      }}
                    >
                      {char.avatar}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm text-slate-100">{char.name}</h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                          {char.title}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black flex items-center gap-1 font-arcade">
                            <Check className="w-3 h-3 stroke-[3]" /> ACTIVE SUIT
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-snug">{char.description}</p>

                      {/* Stat Metrics Grid */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px] text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80">
                          🦘 Jump: <strong className="text-cyan-300">{char.jumpPower}</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80">
                          ⚡ Speed: <strong className="text-amber-300">{(char.speedBonus * 100).toFixed(0)}%</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80">
                          🧲 Magnet: <strong className="text-purple-300">{char.magnetRadiusMultiplier}x</strong>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80">
                          💰 Cash: <strong className="text-emerald-400">{char.cashBonusMultiplier}x</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="w-full sm:w-auto flex items-center justify-end">
                    {isSelected ? (
                      <div className="w-full sm:w-auto py-2 px-4 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-xs text-center font-arcade">
                        EQUIPPED
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleSelectCharacter(char.id)}
                        className="w-full sm:w-auto py-2 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-black transition active:scale-95 cursor-pointer font-arcade border border-slate-700"
                      >
                        ACTIVATE SUIT
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyCharacter(char)}
                        className="w-full sm:w-auto py-2.5 px-5 rounded-xl gold-btn text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition cursor-pointer font-arcade"
                      >
                        <span>BUY & ACTIVATE</span>
                        <span>${char.price.toFixed(2)}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: TACTICAL KITS & GADGET BOOSTERS */}
        {activeTab === 'upgrades' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
            
            {/* KIT 1: Universal Double Jump Thruster Kit */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center text-2xl font-bold border border-yellow-500/30 shrink-0">
                  🦘
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-xs text-slate-100">Universal Double Jump Thrusters</h5>
                    {currentUpgrades.doubleJumpUnlocked && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">Enables secondary mid-air leap on all suits to leap over high lasers and obstacles.</p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {currentUpgrades.doubleJumpUnlocked ? (
                  <span className="py-1.5 px-4 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs font-arcade">
                    ACTIVATED (PERMANENT)
                  </span>
                ) : (
                  <button
                    onClick={() => handleUpgradeItem('doubleJumpUnlocked', 12.0, 'Universal Double Jump Thrusters')}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade cursor-pointer shadow-lg active:scale-95 transition"
                  >
                    BUY & ACTIVATE $12.00
                  </button>
                )}
              </div>
            </div>

            {/* KIT 2: Aegis Energy Shield Matrix */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl font-bold border border-cyan-500/30 shrink-0">
                  🛡️
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-xs text-slate-100">Aegis Energy Shield Matrix</h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">
                      Level {currentUpgrades.shieldDuration || 0} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Starts each run with an energy shield and adds +{((currentUpgrades.shieldDuration || 0) * 0.4).toFixed(1)}s invincibility buffer.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {(currentUpgrades.shieldDuration || 0) >= 5 ? (
                  <span className="py-1.5 px-4 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-black text-xs font-arcade">
                    MAX LEVEL (5/5)
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const cost = 4.0 * ((currentUpgrades.shieldDuration || 0) + 1);
                      handleUpgradeItem('shieldDuration', cost, `Aegis Shield Matrix Level ${(currentUpgrades.shieldDuration || 0) + 1}`);
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade cursor-pointer shadow-lg active:scale-95 transition"
                  >
                    UPGRADE ${(4.0 * ((currentUpgrades.shieldDuration || 0) + 1)).toFixed(2)}
                  </button>
                )}
              </div>
            </div>

            {/* KIT 3: Hyper Coin Magnet Core */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl font-bold border border-purple-500/30 shrink-0">
                  🧲
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-xs text-slate-100">Hyper Coin Magnet Core</h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40">
                      Level {currentUpgrades.magnetLevel || 0} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Passive magnet pull zone (+{((currentUpgrades.magnetLevel || 0) * 35)}% reach) & extends magnet duration.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {(currentUpgrades.magnetLevel || 0) >= 5 ? (
                  <span className="py-1.5 px-4 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 font-black text-xs font-arcade">
                    MAX LEVEL (5/5)
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const cost = 5.0 * ((currentUpgrades.magnetLevel || 0) + 1);
                      handleUpgradeItem('magnetLevel', cost, `Hyper Magnet Core Level ${(currentUpgrades.magnetLevel || 0) + 1}`);
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade cursor-pointer shadow-lg active:scale-95 transition"
                  >
                    UPGRADE ${(5.0 * ((currentUpgrades.magnetLevel || 0) + 1)).toFixed(2)}
                  </button>
                )}
              </div>
            </div>

            {/* KIT 4: Speed Overdrive Turbo Charger */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/30 shrink-0">
                  ⚡
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-xs text-slate-100">Speed Overdrive Turbo Charger</h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                      Level {currentUpgrades.speedBoostLevel || 0} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Increases top speed momentum (+{((currentUpgrades.speedBoostLevel || 0) * 6)}%) & gives +{((currentUpgrades.speedBoostLevel || 0) * 5)}% cash yield.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {(currentUpgrades.speedBoostLevel || 0) >= 5 ? (
                  <span className="py-1.5 px-4 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-xs font-arcade">
                    MAX LEVEL (5/5)
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const cost = 6.0 * ((currentUpgrades.speedBoostLevel || 0) + 1);
                      handleUpgradeItem('speedBoostLevel', cost, `Speed Overdrive Level ${(currentUpgrades.speedBoostLevel || 0) + 1}`);
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade cursor-pointer shadow-lg active:scale-95 transition"
                  >
                    UPGRADE ${(6.0 * ((currentUpgrades.speedBoostLevel || 0) + 1)).toFixed(2)}
                  </button>
                )}
              </div>
            </div>

            {/* KIT 5: Second Wind Emergency Revive Kit */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl font-bold border border-rose-500/30 shrink-0">
                  ❤️
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-xs text-slate-100">Second Wind Emergency Revive Kit</h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                      Level {currentUpgrades.reviveKitCount || 0} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Triggers an EMP shockwave on lethal hit, reviving runner immediately on track without losing run!
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {(currentUpgrades.reviveKitCount || 0) >= 5 ? (
                  <span className="py-1.5 px-4 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 font-black text-xs font-arcade">
                    MAX LEVEL (5/5)
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const cost = 8.0 * ((currentUpgrades.reviveKitCount || 0) + 1);
                      handleUpgradeItem('reviveKitCount', cost, `Second Wind Revive Level ${(currentUpgrades.reviveKitCount || 0) + 1}`);
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade cursor-pointer shadow-lg active:scale-95 transition"
                  >
                    UPGRADE ${(8.0 * ((currentUpgrades.reviveKitCount || 0) + 1)).toFixed(2)}
                  </button>
                )}
              </div>
            </div>

            {/* KIT 6: Quantum Cash Multiplier Chip */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl font-bold border border-amber-500/30 shrink-0">
                  💎
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-xs text-slate-100">Quantum Cash Multiplier Chip</h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                      Level {currentUpgrades.cashMultiplierLevel || 0} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Spawns high-yield platinum coins across tracks (+{((currentUpgrades.cashMultiplierLevel || 0) * 10)}% cash value).
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {(currentUpgrades.cashMultiplierLevel || 0) >= 5 ? (
                  <span className="py-1.5 px-4 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs font-arcade">
                    MAX LEVEL (5/5)
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const cost = 10.0 * ((currentUpgrades.cashMultiplierLevel || 0) + 1);
                      handleUpgradeItem('cashMultiplierLevel', cost, `Quantum Cash Multiplier Level ${(currentUpgrades.cashMultiplierLevel || 0) + 1}`);
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade cursor-pointer shadow-lg active:scale-95 transition"
                  >
                    UPGRADE ${(10.0 * ((currentUpgrades.cashMultiplierLevel || 0) + 1)).toFixed(2)}
                  </button>
                )}
              </div>
            </div>

            {/* KIT 7: Sonic Head-Start Rocket Booster */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl font-bold border border-blue-500/30 shrink-0">
                  🚀
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="font-extrabold text-xs text-slate-100">Sonic Head-Start Rocket Booster</h5>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-500/40">
                      Level {currentUpgrades.headStartLevel || 0} / 5
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Launches runner {((currentUpgrades.headStartLevel || 0) * 60)}m ahead at run start in hyper-speed rocket mode.
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto flex justify-end">
                {(currentUpgrades.headStartLevel || 0) >= 5 ? (
                  <span className="py-1.5 px-4 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-500/40 font-black text-xs font-arcade">
                    MAX LEVEL (5/5)
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      const cost = 7.0 * ((currentUpgrades.headStartLevel || 0) + 1);
                      handleUpgradeItem('headStartLevel', cost, `Head-Start Booster Level ${(currentUpgrades.headStartLevel || 0) + 1}`);
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade cursor-pointer shadow-lg active:scale-95 transition"
                  >
                    UPGRADE ${(7.0 * ((currentUpgrades.headStartLevel || 0) + 1)).toFixed(2)}
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ARMOR SKINS & COATINGS */}
        {activeTab === 'skins' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[380px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SKINS.map(skin => {
                const isUnlocked = stats.unlockedSkins.includes(skin.id);
                const isSelected = stats.selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 shadow-md'
                        : isUnlocked
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-900/50 border-slate-800/80'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div
                          className="w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs"
                          style={{
                            backgroundColor: skin.bodyColor,
                            borderColor: skin.glowColor,
                            boxShadow: `0 0 10px ${skin.glowColor}40`
                          }}
                        >
                          🎨
                        </div>

                        {isSelected ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black font-arcade">
                            ACTIVE
                          </span>
                        ) : isUnlocked ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            UNLOCKED
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-bold font-arcade border border-slate-700">
                            ${skin.price.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-xs text-slate-100">{skin.name}</h4>
                        <p className="text-[10px] text-slate-400">Pattern: {skin.pattern.toUpperCase()}</p>
                      </div>
                    </div>

                    <div>
                      {isSelected ? (
                        <div className="w-full py-1.5 rounded-xl bg-amber-400/20 text-amber-300 text-center font-bold text-xs font-arcade">
                          EQUIPPED
                        </div>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => handleSelectSkin(skin.id)}
                          className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition font-arcade cursor-pointer border border-slate-700"
                        >
                          ACTIVATE COATING
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuySkin(skin)}
                          className="w-full py-2 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade cursor-pointer shadow-md active:scale-95 transition"
                        >
                          BUY & ACTIVATE ${skin.price.toFixed(2)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
