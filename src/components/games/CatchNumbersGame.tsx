import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats } from '../../types';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Timer, Zap, Trophy, Flame } from 'lucide-react';

interface CatchNumbersGameProps {
  onWin: (amount: number, description: string) => void;
  onBack: () => void;
  userBalance: number;
  stats?: PlayerStats;
}

interface FallingNumber {
  id: number;
  val: number;
  x: number; // percentage
  y: number; // percentage
  speed: number;
}

export const CatchNumbersGame: React.FC<CatchNumbersGameProps> = ({
  onWin,
  onBack,
  userBalance,
  stats
}) => {
  const [targetNumber, setTargetNumber] = useState<number>(7);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(3000); // 3 seconds
  const [score, setScore] = useState<number>(0);
  const [targetCatchesNeeded, setTargetCatchesNeeded] = useState<number>(3);
  const [catches, setCatches] = useState<number>(0);
  const [numbers, setNumbers] = useState<FallingNumber[]>([]);
  const [gameResult, setGameResult] = useState<'WIN' | 'LOSE' | null>(null);

  const rewardAmount = 0.40;
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const startRound = () => {
    const target = Math.floor(Math.random() * 9) + 1;
    setTargetNumber(target);
    setTimeLeftMs(3000);
    setScore(0);
    setCatches(0);
    setGameResult(null);
    setIsPlaying(true);
    sound.playClick();

    // Spawn initial pool of numbers
    const initial: FallingNumber[] = [];
    for (let i = 0; i < 8; i++) {
      initial.push({
        id: Math.random(),
        val: Math.random() < 0.4 ? target : Math.floor(Math.random() * 9) + 1,
        x: 10 + Math.random() * 80,
        y: Math.random() * 60,
        speed: 25 + Math.random() * 35
      });
    }
    setNumbers(initial);
    lastTimeRef.current = performance.now();
  };

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    let localCatches = catches;

    const loop = (time: number) => {
      const delta = (time - (lastTimeRef.current || time)) / 1000;
      lastTimeRef.current = time;

      setTimeLeftMs((prev) => {
        const next = prev - delta * 1000;
        if (next <= 0) {
          // Time expired
          setIsPlaying(false);
          setGameResult('LOSE');
          sound.playGameOver();
          return 0;
        }
        return next;
      });

      setNumbers((prevList) => {
        return prevList.map((num) => {
          let nextY = num.y + num.speed * delta;
          let nextVal = num.val;
          let nextX = num.x;

          if (nextY > 95) {
            nextY = -10;
            nextX = 10 + Math.random() * 80;
            nextVal = Math.random() < 0.45 ? targetNumber : Math.floor(Math.random() * 9) + 1;
          }

          return {
            ...num,
            y: nextY,
            x: nextX,
            val: nextVal
          };
        });
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isPlaying, targetNumber]);

  const handleNumberTap = (num: FallingNumber) => {
    if (!isPlaying) return;

    if (num.val === targetNumber) {
      sound.playCoin();
      const nextCatches = catches + 1;
      setCatches(nextCatches);
      setScore((s) => s + 100);

      // Remove clicked number and replace
      setNumbers((prev) =>
        prev.map((n) =>
          n.id === num.id
            ? {
                ...n,
                y: -10,
                x: 10 + Math.random() * 80,
                val: Math.random() < 0.4 ? targetNumber : Math.floor(Math.random() * 9) + 1
              }
            : n
        )
      );

      if (nextCatches >= targetCatchesNeeded) {
        // Victory!
        setIsPlaying(false);
        setGameResult('WIN');
        sound.playWin();
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
        onWin(rewardAmount, `🔢 Catch Numbers Reflex Win! (${targetCatchesNeeded}x target #${targetNumber})`);
      }
    } else {
      sound.playObstacleHit();
      // Penalty time reduction
      setTimeLeftMs((t) => Math.max(0, t - 500));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 backdrop-blur-sm shadow-xl">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onBack();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700 min-h-[40px] min-w-[40px] flex items-center justify-center shrink-0"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5 flex-wrap">
              <span>🔢 Catch Numbers (3s Reflex)</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                +${rewardAmount.toFixed(2)} Win
              </span>
            </h1>
            <p className="text-xs text-slate-400">Tap target numbers within 3s</p>
          </div>
        </div>

        <button
          onClick={startRound}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 cursor-pointer min-h-[36px]"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>{isPlaying ? 'Restart' : 'Start Rush'}</span>
        </button>
      </div>

      {/* Target & Timer Dashboard */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 text-center relative overflow-hidden">
          <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-bold tracking-wider">Target</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 animate-bounce">
            #{targetNumber}
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 text-center">
          <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-bold tracking-wider">Time Left</span>
          <div
            className={`text-xl sm:text-2xl font-black mt-0.5 flex items-center justify-center gap-1 ${
              timeLeftMs < 1000 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>{(timeLeftMs / 1000).toFixed(2)}s</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                timeLeftMs < 1000 ? 'bg-rose-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${(timeLeftMs / 3000) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 text-center">
          <span className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-bold tracking-wider">Catches</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-0.5">
            {catches} / {targetCatchesNeeded}
          </div>
        </div>
      </div>

      {/* Fall Zone Arena */}
      <div className="relative w-full h-80 sm:h-96 bg-slate-950/80 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center select-none">
        {!isPlaying && !gameResult && (
          <div className="text-center space-y-3 z-10 px-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center text-2xl border border-cyan-500/40">
              ⚡
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Ready for 3-Second Rush?</h3>
              <p className="text-xs text-slate-400 mt-0.5 max-w-xs mx-auto">
                Catch <strong className="text-amber-400">{targetCatchesNeeded}x</strong> target numbers before the clock expires!
              </p>
            </div>
            <button
              onClick={startRound}
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/30 cursor-pointer min-h-[38px]"
            >
              Start Game Now
            </button>
          </div>
        )}

        {/* Falling Numbers */}
        {isPlaying &&
          numbers.map((num) => (
            <button
              key={num.id}
              onClick={() => handleNumberTap(num)}
              style={{
                left: `${num.x}%`,
                top: `${num.y}%`
              }}
              className={`absolute w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center transition-transform active:scale-75 cursor-pointer shadow-lg select-none border-2 ${
                num.val === targetNumber
                  ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-amber-500/40 scale-110 hover:scale-125 ring-4 ring-amber-400/30'
                  : 'bg-slate-800/90 text-slate-400 border-slate-700 hover:border-slate-500'
              }`}
            >
              {num.val}
            </button>
          ))}

        {/* Win / Loss Modal */}
        {gameResult && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm z-20 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-5 text-center space-y-3.5 max-w-xs w-full shadow-2xl">
              {gameResult === 'WIN' ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl border border-emerald-500/40">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Reflex Master!</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Caught all targets with <strong className="text-cyan-400">{(timeLeftMs / 1000).toFixed(2)}s</strong> to spare!
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                    <span className="text-[10px] uppercase font-bold tracking-wider">Reward Earned</span>
                    <div className="text-xl font-black text-emerald-300">+${rewardAmount.toFixed(2)}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center text-2xl border border-rose-500/40">
                    ⌛
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Time's Up!</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      You caught {catches}/{targetCatchesNeeded} targets. Try again for instant cash!
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={startRound}
                  className="flex-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-cyan-500/20 cursor-pointer min-h-[36px]"
                >
                  Play Again
                </button>
                <button
                  onClick={() => {
                    sound.playClick();
                    onBack();
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700 cursor-pointer min-h-[36px]"
                >
                  Back to Hub
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
