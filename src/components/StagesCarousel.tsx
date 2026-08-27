import React, { useRef } from 'react';
import { 
  Gamepad2, 
  Lock, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Swords, 
  Users, 
  ShieldAlert, 
  Zap, 
  Trophy, 
  Flame, 
  Eye, 
  Crown, 
  Target, 
  Compass, 
  Medal, 
  Ticket, 
  Coins, 
  Globe 
} from 'lucide-react';
import { sound } from '../utils/audio';

export interface StageItem {
  stageNumber: number;
  title: string;
  category: string;
  icon: string | React.ReactNode;
  isActive: boolean;
  statusText: string;
  description: string;
  accentColor: string;
  gradient: string;
  borderStyle: string;
}

export const CAMPAIGN_STAGES: StageItem[] = [
  {
    stageNumber: 1,
    title: 'Arcade Genesis',
    category: 'MINI-GAMES LIVE',
    icon: '🎮',
    isActive: true,
    statusText: 'CURRENT STAGE',
    description: 'Active Stage: Play 8 minigames (Mine, Runner, Egg Crack, TicTacToe, etc.) to accrue rewards.',
    accentColor: 'text-emerald-400',
    gradient: 'from-emerald-950/80 via-slate-900 to-slate-950',
    borderStyle: 'border-emerald-500/80 shadow-emerald-500/20 ring-1 ring-emerald-400/50'
  },
  {
    stageNumber: 2,
    title: 'Cyber PvP Arena',
    category: '1V1 DUELS',
    icon: '⚔️',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Real-time player vs player showdowns with wager pools and direct duels.',
    accentColor: 'text-cyan-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 3,
    title: 'Guild Syndicate',
    category: 'CLAN WARS',
    icon: '🛡️',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Form syndicates with friends, pool resources, and battle for weekly guild vault payouts.',
    accentColor: 'text-purple-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 4,
    title: 'Crypto Vault Heist',
    category: 'PUZZLE HEIST',
    icon: '🔐',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Multi-layer cryptographic code cracking against time to loot digital master safes.',
    accentColor: 'text-amber-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 5,
    title: 'Speedrun Colosseum',
    category: 'TIME ATTACK',
    icon: '⚡',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Ultra-fast parkour and precision obstacle courses with millisecond leaderboards.',
    accentColor: 'text-yellow-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 6,
    title: 'Jackpot Matrix',
    category: 'HIGH STAKES',
    icon: '🎰',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'High roller multiplier matrix with cascading bonus rounds and mystery drops.',
    accentColor: 'text-pink-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 7,
    title: 'Battle Royale Rush',
    category: 'SURVIVAL',
    icon: '👑',
    isActive: false,
    statusText: 'COMING SOON',
    description: '50-player live elimination arena where the last player standing claims the grand purse.',
    accentColor: 'text-red-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 8,
    title: 'Shadow Ninja Clash',
    category: 'REFLEX COMBAT',
    icon: '🥷',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Precision swipe reflex battles against stealth samurai and ninja masters.',
    accentColor: 'text-indigo-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 9,
    title: 'Celestial Boss Raids',
    category: 'CO-OP RAIDS',
    icon: '🐉',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Community-wide World Boss health pools with tiered contribution payouts.',
    accentColor: 'text-teal-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 10,
    title: 'Neon Cyber Quest',
    category: 'RPG CAMPAIGN',
    icon: '🗺️',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Story-driven missions, equipment crafting, and cybernetic character progression.',
    accentColor: 'text-fuchsia-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 11,
    title: 'Titan League Masters',
    category: 'RANKED CIRCUIT',
    icon: '🏆',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Quarterly ranked global tournament circuit with gold trophies and cash cups.',
    accentColor: 'text-amber-300',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 12,
    title: 'Quantum Lottery Draw',
    category: 'MEGA RAFFLE',
    icon: '🎟️',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Hourly automated provably fair lottery tickets funded by platform gameplay.',
    accentColor: 'text-blue-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 13,
    title: 'Dragon Hoard Forge',
    category: 'ITEM MARKET',
    icon: '💎',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'Rare skin fusion, gem upgrading, and player-to-player item trading house.',
    accentColor: 'text-emerald-300',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 14,
    title: 'Metaverse Odyssey',
    category: 'VIRTUAL WORLD',
    icon: '🌐',
    isActive: false,
    statusText: 'COMING SOON',
    description: '3D virtual arcade territory exploration and persistent arcade plot ownership.',
    accentColor: 'text-violet-400',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  },
  {
    stageNumber: 15,
    title: 'Grand Master Genesis',
    category: 'FINAL FINALE',
    icon: '👑',
    isActive: false,
    statusText: 'COMING SOON',
    description: 'The pinnacle championship stage: Crown of the Ultimate Arcade Champion.',
    accentColor: 'text-yellow-300',
    gradient: 'from-slate-900 to-slate-950',
    borderStyle: 'border-slate-800 hover:border-slate-700'
  }
];

interface StagesCarouselProps {
  onSelectActiveStage?: () => void;
  className?: string;
}

export const StagesCarousel: React.FC<StagesCarouselProps> = ({
  onSelectActiveStage,
  className = ''
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [selectedStage, setSelectedStage] = React.useState<StageItem | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    sound.playClick();
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.75;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleStageClick = (stage: StageItem) => {
    if (stage.isActive) {
      sound.playWin();
      if (onSelectActiveStage) {
        onSelectActiveStage();
      }
    } else {
      sound.playClick();
      setSelectedStage(stage);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header bar with reduced typography and navigation */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <h3 className="text-xs sm:text-[13px] font-black text-white flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Campaign Progression (15 Stages)</span>
          </h3>
          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-black">
            STAGE 1 ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-[9px] text-slate-400 hidden sm:inline-flex items-center font-medium mr-1">
            <span>Stage 1 of 15</span>
          </span>
          <button
            onClick={() => scroll('left')}
            title="Scroll Stages Left"
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center shadow-sm active:scale-95"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          <button
            onClick={() => scroll('right')}
            title="Scroll Stages Right"
            className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer min-h-[26px] min-w-[26px] flex items-center justify-center shadow-sm active:scale-95"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 15 Stage Box Cards Horizontal Side Slide Carousel */}
      <div
        ref={carouselRef}
        className="flex items-stretch gap-2 overflow-x-auto pb-1.5 pt-0.5 px-1 scroll-smooth snap-x snap-mandatory select-none"
        style={{ scrollbarWidth: 'thin' }}
      >
        {CAMPAIGN_STAGES.map((stage) => {
          return (
            <div
              key={stage.stageNumber}
              onClick={() => handleStageClick(stage)}
              className={`w-[125px] sm:w-[135px] shrink-0 snap-start rounded-xl p-2 sm:p-2.5 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-1.5 relative overflow-hidden bg-gradient-to-b ${stage.gradient} border ${stage.borderStyle} ${
                stage.isActive ? 'hover:scale-[1.03] shadow-md shadow-emerald-500/10' : 'opacity-75 hover:opacity-100 hover:scale-[1.02]'
              } active:scale-95`}
            >
              {/* Top Row: Stage # badge & status */}
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[8px] font-black px-1.5 py-0.2 rounded font-mono ${
                  stage.isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}>
                  STAGE {stage.stageNumber}
                </span>

                {stage.isActive ? (
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                ) : (
                  <Lock className="w-2.5 h-2.5 text-slate-500 shrink-0" />
                )}
              </div>

              {/* Center Box Icon */}
              <div className="flex flex-col items-center justify-center text-center py-1">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xl shadow-inner border ${
                  stage.isActive ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-slate-950/80 border-slate-800 text-slate-500'
                }`}>
                  {stage.icon}
                </div>
                <h4 className="text-[11px] font-black text-white mt-1.5 truncate max-w-full">
                  {stage.title}
                </h4>
                <p className="text-[8px] text-slate-400 font-mono truncate max-w-full">
                  {stage.category}
                </p>
              </div>

              {/* Bottom status chip */}
              <div className="pt-1 border-t border-slate-800/80">
                {stage.isActive ? (
                  <span className="w-full text-center block text-[8px] font-black text-emerald-400 bg-emerald-950/50 py-0.5 rounded border border-emerald-500/30 truncate">
                    🟢 Games Active
                  </span>
                ) : (
                  <span className="w-full text-center block text-[8px] font-bold text-slate-500 bg-slate-950/60 py-0.5 rounded border border-slate-800 truncate">
                    🔒 Coming Soon
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Modal / Tooltip info when clicking locked stages */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 max-w-sm w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-lg">
                  {selectedStage.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">
                    Stage {selectedStage.stageNumber}: {selectedStage.title}
                  </h3>
                  <span className="text-[9px] font-mono text-amber-400 font-bold">
                    🔒 COMING SOON
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="text-slate-400 hover:text-white p-1 text-xs font-bold rounded-lg bg-slate-800"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              {selectedStage.description}
            </p>

            <div className="text-[10px] text-emerald-400 bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/20">
              💡 <strong>Note:</strong> We are currently in <strong>Stage 1 (Arcade Games & Minigames)</strong>. Once Stage 1 concludes, Stage 2 will unlock automatically!
            </div>

            <button
              onClick={() => setSelectedStage(null)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
