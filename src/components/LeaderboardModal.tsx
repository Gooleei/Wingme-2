import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';
import { GAME_LEVELS } from '../data/gameData';
import { Trophy, Medal, Flame, Timer, Zap, X, Globe, UserCheck } from 'lucide-react';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  entries,
  currentUserId,
  onClose
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);

  const filteredEntries = entries
    .filter(e => e.levelId === selectedLevelId)
    .sort((a, b) => a.timeMs - b.timeMs);

  const formatTime = (ms: number) => {
    const totalSec = ms / 1000;
    const mins = Math.floor(totalSec / 60);
    const secs = (totalSec % 60).toFixed(2);
    return `${mins > 0 ? mins + ':' : ''}${secs.padStart(5, '0')}s`;
  };

  const currentLevelConfig = GAME_LEVELS.find(l => l.id === selectedLevelId) || GAME_LEVELS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card max-w-lg w-full rounded-3xl border border-amber-500/30 p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                Global Speedrun Leaderboard <Globe className="w-4 h-4 text-cyan-400" />
              </h3>
              <p className="text-xs text-slate-400">Fastest world completion records</p>
            </div>
          </div>

          <button
            onClick={() => { sound.playClick(); onClose(); }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {GAME_LEVELS.map(lvl => (
            <button
              key={lvl.id}
              onClick={() => { sound.playClick(); setSelectedLevelId(lvl.id); }}
              className={`flex-none px-3 py-1.5 rounded-xl text-xs font-bold font-arcade transition whitespace-nowrap ${
                selectedLevelId === lvl.id
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Lvl {lvl.id}: {lvl.name}
            </button>
          ))}
        </div>

        {/* Level Target Overview */}
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Track Distance:</span>
            <p className="font-black text-slate-200 font-arcade">{currentLevelConfig.targetDistance}m Sprint</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Par Target:</span>
            <p className="font-black text-amber-400 font-arcade">{currentLevelConfig.parTimeTargetSec}s Target</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase font-bold">Reward Pool:</span>
            <p className="font-black text-emerald-400 font-arcade">+$30 + $3</p>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-72">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-500">
              No speedrun times recorded for this world yet. Be the first to clear it!
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <div
                  key={entry.id}
                  className={`p-3 rounded-2xl flex items-center justify-between border transition ${
                    entry.isCurrentUser
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-inner'
                      : isFirst
                      ? 'bg-gradient-to-r from-amber-500/10 to-slate-900 border-amber-500/30'
                      : 'bg-slate-900/80 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Medal / Badge */}
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs font-arcade">
                      {isFirst ? (
                        <span className="text-amber-400 text-lg">🥇</span>
                      ) : isSecond ? (
                        <span className="text-slate-300 text-lg">🥈</span>
                      ) : isThird ? (
                        <span className="text-amber-600 text-lg">🥉</span>
                      ) : (
                        <span className="text-slate-500">#{rank}</span>
                      )}
                    </div>

                    {/* Avatar & Player Name */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{entry.avatar}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold text-xs ${entry.isCurrentUser ? 'text-amber-300' : 'text-slate-200'}`}>
                            {entry.playerName}
                          </span>
                          {entry.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                              {entry.badge}
                            </span>
                          )}
                          {entry.isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          {entry.distance}m • +${entry.cashCollected.toFixed(2)} Collected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Completion Time */}
                  <div className="text-right">
                    <span className="text-sm font-black font-arcade text-emerald-400">
                      {formatTime(entry.timeMs)}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <button
          onClick={() => { sound.playClick(); onClose(); }}
          className="w-full py-3 rounded-xl gold-btn text-slate-950 font-bold text-xs shadow-md transition"
        >
          Close Leaderboards
        </button>
      </div>
    </div>
  );
};
