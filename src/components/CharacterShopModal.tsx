import React, { useState } from 'react';
import { Character, CharacterSkin, PlayerStats } from '../types';
import { CHARACTERS, SKINS } from '../data/gameData';
import { sound } from '../utils/audio';
import { X, Check, Lock, Sparkles, Zap, Shield, Magnet, ArrowUpRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CharacterShopModalProps {
  stats: PlayerStats;
  onSelectCharacter: (charId: string) => void;
  onUnlockCharacter: (character: Character) => void;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skin: CharacterSkin) => void;
  onUpgrade: (upgradeKey: keyof PlayerStats['upgrades'], cost: number) => void;
  onClose: () => void;
}

export const CharacterShopModal: React.FC<CharacterShopModalProps> = ({
  stats,
  onSelectCharacter,
  onUnlockCharacter,
  onSelectSkin,
  onUnlockSkin,
  onUpgrade,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'skins' | 'upgrades'>('characters');

  const selectedChar = CHARACTERS.find(c => c.id === stats.selectedCharacterId) || CHARACTERS[0];
  const charSkins = SKINS.filter(s => s.characterId === stats.selectedCharacterId || s.characterId === 'volt');

  const handleBuyCharacter = (char: Character) => {
    if (stats.balance < char.price) {
      alert(`Insufficient balance! You need $${char.price.toFixed(2)} to unlock ${char.name}.`);
      sound.playHit();
      return;
    }
    onUnlockCharacter(char);
    sound.playWin();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  const handleBuySkin = (skin: CharacterSkin) => {
    if (stats.balance < skin.price) {
      alert(`Insufficient balance! You need $${skin.price.toFixed(2)} to unlock ${skin.name}.`);
      sound.playHit();
      return;
    }
    onUnlockSkin(skin);
    sound.playWin();
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-xl w-full rounded-3xl border border-amber-500/30 p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                Armory & Upgrades
              </h3>
              <p className="text-xs text-slate-400">Unlock runners, battle suits & gadgets</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-slate-900 border border-amber-500/40 text-amber-300 font-black text-xs font-arcade">
              Balance: ${stats.balance.toFixed(2)}
            </div>

            <button
              onClick={() => { sound.playClick(); onClose(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold font-arcade">
          <button
            onClick={() => { sound.playClick(); setActiveTab('characters'); }}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'characters' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🏃 Characters ({stats.unlockedCharacters.length}/{CHARACTERS.length})
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('skins'); }}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'skins' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
          >
            🎨 Skins & Suits
          </button>
          <button
            onClick={() => { sound.playClick(); setActiveTab('upgrades'); }}
            className={`flex-1 py-2 rounded-xl transition ${activeTab === 'upgrades' ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-400 hover:text-slate-200'}`}
          >
            ⚡ Gadget Boosters
          </button>
        </div>

        {/* TAB 1: CHARACTERS */}
        {activeTab === 'characters' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-80">
            {CHARACTERS.map(char => {
              const isUnlocked = stats.unlockedCharacters.includes(char.id);
              const isSelected = stats.selectedCharacterId === char.id;

              return (
                <div
                  key={char.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-inner'
                      : isUnlocked
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-900/50 border-slate-800/60 opacity-85'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-md relative"
                      style={{ backgroundColor: `${char.color}22`, borderColor: `${char.color}66` }}
                    >
                      {char.avatar}
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-slate-950/70 rounded-2xl flex items-center justify-center text-xs text-amber-400">
                          <Lock className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-100">{char.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">({char.title})</span>
                      </div>
                      <p className="text-xs text-amber-400 font-medium">{char.abilityName}: <span className="text-slate-300">{char.abilityDescription}</span></p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-0.5">
                        <span>Speed: +{((char.speedBonus - 1) * 100).toFixed(0)}%</span>
                        <span>•</span>
                        <span>Jump: {char.jumpPower}</span>
                        <span>•</span>
                        <span>Cash: {char.cashBonusMultiplier}x</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Equipped
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => { sound.playClick(); onSelectCharacter(char.id); }}
                        className="py-1.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-95"
                      >
                        Select
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBuyCharacter(char)}
                        className="py-2 px-3.5 rounded-xl gold-btn text-slate-950 text-xs font-black font-arcade shadow-md transition active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        Unlock ${char.price.toFixed(2)}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: SKINS */}
        {activeTab === 'skins' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-80">
            <p className="text-xs text-slate-400">Custom paint jobs and glowing neon suits:</p>
            <div className="grid grid-cols-2 gap-3">
              {SKINS.map(skin => {
                const isUnlocked = stats.unlockedSkins.includes(skin.id) || skin.unlockedByDefault;
                const isSelected = stats.selectedSkinId === skin.id;

                return (
                  <div
                    key={skin.id}
                    className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 transition ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/60'
                        : isUnlocked
                        ? 'bg-slate-900 border-slate-800'
                        : 'bg-slate-900/60 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center border shadow"
                        style={{ backgroundColor: skin.bodyColor, borderColor: skin.glowColor }}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: skin.glowColor }} />
                      </div>
                      <div>
                        <h5 className="font-bold text-xs text-slate-100">{skin.name}</h5>
                        <span className="text-[10px] text-slate-400 capitalize">{skin.pattern} suit</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      {isSelected ? (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Equipped
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => { sound.playClick(); onSelectSkin(skin.id); }}
                          className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
                        >
                          Equip Skin
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuySkin(skin)}
                          className="w-full py-1.5 rounded-lg gold-btn text-slate-950 text-xs font-black font-arcade transition"
                        >
                          Buy ${skin.price.toFixed(2)}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: UPGRADES */}
        {activeTab === 'upgrades' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-80">
            {/* Double Jump Gadget */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg">
                  🥾
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-100">Universal Double Jump</h5>
                  <p className="text-[11px] text-slate-400">Enables double jump for all characters.</p>
                </div>
              </div>

              {stats.upgrades.doubleJumpUnlocked ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  Unlocked
                </span>
              ) : (
                <button
                  onClick={() => {
                    if (stats.balance < 12.0) {
                      alert('Need $12.00 to unlock universal double jump!');
                      return;
                    }
                    onUpgrade('doubleJumpUnlocked', 12.0);
                  }}
                  className="py-1.5 px-3 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade"
                >
                  Buy $12.00
                </button>
              )}
            </div>

            {/* Coin Magnet Booster */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg">
                  🧲
                </div>
                <div>
                  <h5 className="font-bold text-xs text-slate-100">Magnet Duration Boost</h5>
                  <p className="text-[11px] text-slate-400">Current Level: {stats.upgrades.magnetLevel} (+{stats.upgrades.magnetLevel * 2}s)</p>
                </div>
              </div>

              <button
                onClick={() => {
                  const cost = 5.0 * (stats.upgrades.magnetLevel + 1);
                  if (stats.balance < cost) {
                    alert(`Need $${cost.toFixed(2)} for next magnet upgrade!`);
                    return;
                  }
                  onUpgrade('magnetLevel', cost);
                }}
                className="py-1.5 px-3 rounded-xl gold-btn text-slate-950 font-black text-xs font-arcade"
              >
                Upgrade ${(5.0 * (stats.upgrades.magnetLevel + 1)).toFixed(2)}
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
        >
          Done
        </button>
      </div>
    </div>
  );
};
