import React, { useState, useRef, useEffect } from 'react';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { ArrowLeft, RotateCcw, Sparkles, Lock, Timer, Trophy, Flame } from 'lucide-react';

interface LuckyWheelProps {
  onWin: (amount: number, description: string) => void;
  onBack: () => void;
  userBalance: number;
}

interface Segment {
  label: string;
  amount: number;
  color: string;
  isJackpot?: boolean;
}

const SEGMENTS: Segment[] = [
  { label: '$0.25', amount: 0.25, color: '#10b981' },
  { label: '$1.00', amount: 1.00, color: '#06b6d4' },
  { label: '$0.10', amount: 0.10, color: '#6366f1' },
  { label: '$5.00', amount: 5.00, color: '#f59e0b' },
  { label: '$0.50', amount: 0.50, color: '#3b82f6' },
  { label: '$2.00', amount: 2.00, color: '#ec4899' },
  { label: '$0.15', amount: 0.15, color: '#8b5cf6' },
  { label: '🏆 $25.00 JACKPOT', amount: 25.00, color: '#eab308', isJackpot: true }
];

export const LuckyWheelGame: React.FC<LuckyWheelProps> = ({
  onWin,
  onBack,
  userBalance
}) => {
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [lastWonSegment, setLastWonSegment] = useState<Segment | null>(null);
  const [freeSpinsLeft, setFreeSpinsLeft] = useState<number>(3);
  const [jackpotLockedDays, setJackpotLockedDays] = useState<number>(7);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the Lucky Wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numSegments = SEGMENTS.length;
    const arcSize = (2 * Math.PI) / numSegments;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 12;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Outer Rim Glow
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#06b6d4';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.restore();

    // Draw Wheel Segments
    SEGMENTS.forEach((seg, i) => {
      const angle = i * arcSize;
      ctx.beginPath();
      ctx.fillStyle = seg.color;
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arcSize);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw Segment Text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arcSize / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
      ctx.fillText(seg.label, radius - 20, 5);
      ctx.restore();
    });

    // Draw Center Peg
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
  }, []);

  const spinWheel = () => {
    if (isSpinning || freeSpinsLeft <= 0) return;

    sound.playClick();
    setIsSpinning(true);
    setLastWonSegment(null);
    setFreeSpinsLeft((s) => s - 1);

    // Generate random rotations: 5 to 8 full spins + random offset
    const fullSpins = 5 + Math.floor(Math.random() * 4);
    const targetSegmentIndex = Math.floor(Math.random() * SEGMENTS.length);
    const arcDegrees = 360 / SEGMENTS.length;
    // Align with top pointer (270 degrees)
    const targetAngle = 360 * fullSpins + (360 - targetSegmentIndex * arcDegrees - arcDegrees / 2);

    const startRot = rotation;
    const finalRot = startRot + targetAngle;
    const duration = 4000;
    const startTime = performance.now();

    // Audio ticks during spin
    let lastTickAngle = 0;

    const animateSpin = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startRot + (finalRot - startRot) * ease;
      setRotation(currentAngle);

      if (Math.abs(currentAngle - lastTickAngle) > 20) {
        sound.playWheelTick();
        lastTickAngle = currentAngle;
      }

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        // Complete
        setIsSpinning(false);
        const won = SEGMENTS[targetSegmentIndex];
        setLastWonSegment(won);
        sound.playWin();
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        onWin(won.amount, `🎡 Lucky Wheel Cash Prize +$${won.amount.toFixed(2)}`);
      }
    };

    requestAnimationFrame(animateSpin);
  };

  return (
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800 backdrop-blur-sm">
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
              <span>🎡 Lucky Wheel Spin</span>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                Win up to $25.00
              </span>
            </h1>
            <p className="text-xs text-slate-400">Spin the daily prize wheel for instant cash</p>
          </div>
        </div>

        {/* 7-Day Jackpot Lock Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-amber-400 text-[11px] sm:text-xs font-bold">
          <Lock className="w-3.5 h-3.5" />
          <span>Jackpot: {jackpotLockedDays}d Lock</span>
        </div>
      </div>

      {/* Main Wheel Stage */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
        {/* Left Side: Stats & Spins */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 space-y-3.5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">Daily Free Plays</span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">{freeSpinsLeft} Spins Left</div>
            <p className="text-xs text-slate-400 mt-1.5">
              Free spins replenish daily or unlock via Runner milestones.
            </p>
          </div>

          <div className="p-3 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Top Prize</span>
              <span className="text-amber-400 font-black">$25.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Avg Payout</span>
              <span className="text-emerald-400 font-bold">$1.50</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Probability</span>
              <span className="text-cyan-400 font-bold">100% Win</span>
            </div>
          </div>

          <button
            onClick={spinWheel}
            disabled={isSpinning || freeSpinsLeft <= 0}
            className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-95 min-h-[44px]"
          >
            {isSpinning ? 'SPINNING...' : freeSpinsLeft > 0 ? 'SPIN WHEEL NOW' : 'NO SPINS LEFT'}
          </button>
        </div>

        {/* Center: Interactive Rotating Wheel Canvas */}
        <div className="md:col-span-2 flex flex-col items-center justify-center p-4 sm:p-5 bg-slate-950/60 rounded-2xl sm:rounded-3xl border border-slate-800 relative">
          {/* Top Pointer Indicator */}
          <div className="absolute top-2.5 z-20 flex flex-col items-center">
            <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-400 drop-shadow-[0_4px_8px_rgba(245,158,11,0.6)]" />
          </div>

          {/* Rotating Canvas Wrapper */}
          <div className="relative p-1 max-w-full overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              style={{
                transform: `rotate(${rotation}deg)`,
                maxWidth: '100%',
                height: 'auto'
              }}
              className="rounded-full shadow-2xl transition-transform ease-out"
            />
          </div>

          {/* Result Alert */}
          {lastWonSegment && (
            <div className="mt-3 p-3 rounded-xl sm:rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center animate-in zoom-in-95 duration-200">
              <span className="text-[10px] uppercase font-bold text-emerald-400">Prize Awarded</span>
              <div className="text-lg sm:text-xl font-black text-emerald-300 mt-0.5">
                +{lastWonSegment.label} Credited to Balance!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
