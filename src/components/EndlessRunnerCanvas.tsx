import React, { useRef, useEffect, useState, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { LevelConfig, Character, CharacterSkin, PlayerStats } from '../types';
import { sound } from '../utils/audio';
import { Play, RotateCcw, ArrowRight, Shield, Zap, Magnet, Volume2, VolumeX, Pause, ChevronRight, Award, Trophy } from 'lucide-react';

interface EndlessRunnerCanvasProps {
  level: LevelConfig;
  character: Character;
  skin?: CharacterSkin;
  stats: PlayerStats;
  isEndlessMode?: boolean;
  onGameWin: (result: { timeMs: number; distance: number; cashEarned: number; distanceBonus: number }) => void;
  onGameLoss: (result: { distance: number; penalty: number; cashEarned: number }) => void;
  onExit: () => void;
  onNextLevel?: () => void;
}

interface Obstacle {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'high_laser' | 'drone' | 'fire_pit' | 'glitch_gate' | 'turret';
  passed: boolean;
  speedMultiplier?: number;
}

interface Collectible {
  x: number;
  y: number;
  radius: number;
  value: number;
  type: 'cash' | 'shield' | 'magnet' | 'multiplier';
  collected: boolean;
  pulseOffset: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export const EndlessRunnerCanvas: React.FC<EndlessRunnerCanvasProps> = ({
  level,
  character,
  skin,
  stats,
  isEndlessMode = false,
  onGameWin,
  onGameLoss,
  onExit,
  onNextLevel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'PAUSED' | 'WON' | 'LOST'>('READY');
  const [soundEnabled, setSoundEnabled] = useState(sound.enabled);
  const [distance, setDistance] = useState(0);
  const [cashCollected, setCashCollected] = useState(0);
  const [hasShield, setHasShield] = useState(character.id === 'valkyrie');
  const [magnetTimer, setMagnetTimer] = useState(0);
  const [speed, setSpeed] = useState(level.baseSpeed);
  const [elapsedTimeMs, setElapsedTimeMs] = useState(0);
  const [hitPenalty, setHitPenalty] = useState(0);

  // Internal mutable refs for 60fps loop
  const internalRef = useRef({
    gameState: 'READY' as 'READY' | 'PLAYING' | 'PAUSED' | 'WON' | 'LOST',
    distance: 0,
    cashCollected: 0,
    startTime: 0,
    lastFrameTime: 0,
    elapsedMs: 0,
    speed: level.baseSpeed,
    targetDistance: isEndlessMode ? Infinity : level.targetDistance,
    distanceBonusAwarded: false,

    // Player physics
    player: {
      x: 100,
      y: 0,
      width: 44,
      height: 60,
      baseHeight: 60,
      slideHeight: 32,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      isDoubleJumping: false,
      canDoubleJump: character.hasDoubleJump || stats.upgrades.doubleJumpUnlocked,
      isSliding: false,
      slideTimer: 0,
      invincibleTimer: 0,
      hasShield: character.id === 'valkyrie',
      magnetTimer: 0,
      animFrame: 0,
      animTick: 0
    },

    // World objects
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    parallaxOffset: [0, 0, 0], // 3 parallax layers

    nextObstacleDist: 250,
    nextCollectibleDist: 100,
    totalCashSpawned: 0,
    maxCashToSpawn: level.cashDropGoal,
    screenShake: 0,

    animationFrameId: 0
  });

  // Sound toggle handler
  const toggleSound = () => {
    sound.enabled = !sound.enabled;
    setSoundEnabled(sound.enabled);
  };

  // Trigger jump
  const handleJump = useCallback(() => {
    const internal = internalRef.current;
    if (internal.gameState !== 'PLAYING') return;

    const p = internal.player;
    if (p.isGrounded) {
      p.vy = -character.jumpPower;
      p.isGrounded = false;
      p.isJumping = true;
      p.isSliding = false;
      p.height = p.baseHeight;
      sound.playJump(false);

      // Add jump dust particles
      for (let i = 0; i < 8; i++) {
        internal.particles.push({
          x: p.x + p.width / 2,
          y: p.y + p.height,
          vx: (Math.random() - 0.5) * 4 - 2,
          vy: Math.random() * 2,
          size: Math.random() * 4 + 2,
          color: level.accentColor,
          alpha: 0.8,
          decay: 0.04
        });
      }
    } else if (p.canDoubleJump && !p.isDoubleJumping) {
      p.vy = -(character.jumpPower * 0.92);
      p.isDoubleJumping = true;
      sound.playJump(true);

      // Double jump ring burst
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        internal.particles.push({
          x: p.x + p.width / 2,
          y: p.y + p.height / 2,
          vx: Math.cos(angle) * 3.5,
          vy: Math.sin(angle) * 3.5,
          size: 3,
          color: '#FACC15',
          alpha: 1,
          decay: 0.05
        });
      }
    }
  }, [character, level.accentColor, stats.upgrades.doubleJumpUnlocked]);

  // Trigger slide
  const handleSlide = useCallback(() => {
    const internal = internalRef.current;
    if (internal.gameState !== 'PLAYING') return;

    const p = internal.player;
    if (p.isGrounded && !p.isSliding) {
      p.isSliding = true;
      p.slideTimer = 35; // ~0.6 sec
      p.height = p.slideHeight;
      p.y = 380 - p.slideHeight;
      sound.playSlide();

      // Slide sparks
      for (let i = 0; i < 6; i++) {
        internal.particles.push({
          x: p.x,
          y: 380,
          vx: -Math.random() * 5 - 2,
          vy: -Math.random() * 2,
          size: Math.random() * 3 + 2,
          color: '#F97316',
          alpha: 0.9,
          decay: 0.06
        });
      }
    }
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        if (internalRef.current.gameState === 'READY') {
          startGame();
        } else {
          handleJump();
        }
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleSlide();
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        togglePause();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleJump, handleSlide]);

  // Start game
  const startGame = () => {
    sound.playClick();
    const internal = internalRef.current;
    internal.gameState = 'PLAYING';
    internal.distance = 0;
    internal.cashCollected = 0;
    internal.startTime = performance.now();
    internal.lastFrameTime = performance.now();
    internal.elapsedMs = 0;
    internal.speed = level.baseSpeed;
    internal.distanceBonusAwarded = false;
    internal.obstacles = [];
    internal.collectibles = [];
    internal.particles = [];
    internal.floatingTexts = [];
    internal.nextObstacleDist = 200;
    internal.nextCollectibleDist = 80;
    internal.totalCashSpawned = 0;
    internal.screenShake = 0;

    const groundY = 380;
    internal.player = {
      x: 100,
      y: groundY - 60,
      width: 44,
      height: 60,
      baseHeight: 60,
      slideHeight: 32,
      vy: 0,
      isGrounded: true,
      isJumping: false,
      isDoubleJumping: false,
      canDoubleJump: character.hasDoubleJump || stats.upgrades.doubleJumpUnlocked,
      isSliding: false,
      slideTimer: 0,
      invincibleTimer: 0,
      hasShield: character.id === 'valkyrie',
      magnetTimer: 0,
      animFrame: 0,
      animTick: 0
    };

    setGameState('PLAYING');
    setDistance(0);
    setCashCollected(0);
    setHasShield(character.id === 'valkyrie');
    setMagnetTimer(0);
    setSpeed(level.baseSpeed);
    setElapsedTimeMs(0);
    setHitPenalty(0);
  };

  const togglePause = () => {
    const internal = internalRef.current;
    if (internal.gameState === 'PLAYING') {
      internal.gameState = 'PAUSED';
      setGameState('PAUSED');
    } else if (internal.gameState === 'PAUSED') {
      internal.gameState = 'PLAYING';
      internal.lastFrameTime = performance.now();
      setGameState('PLAYING');
    }
  };

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const internal = internalRef.current;
    const groundY = 380;

    let animId: number;

    const loop = (now: number) => {
      const dt = Math.min((now - (internal.lastFrameTime || now)) / 1000, 0.1);
      internal.lastFrameTime = now;

      if (internal.gameState === 'PLAYING') {
        internal.elapsedMs = now - internal.startTime;
        setElapsedTimeMs(internal.elapsedMs);

        // Advance distance & speed
        const speedRatio = internal.speed * (character.speedBonus || 1);
        internal.distance += speedRatio * dt * 10;
        const currentDist = Math.floor(internal.distance);
        setDistance(currentDist);

        // Gradually increase speed as distance increases
        internal.speed = Math.min(
          level.maxSpeed,
          level.baseSpeed + (internal.distance * level.speedIncrement)
        );
        setSpeed(internal.speed);

        // Parallax updates
        internal.parallaxOffset[0] += internal.speed * dt * 0.5; // Mountains / Sky
        internal.parallaxOffset[1] += internal.speed * dt * 1.5; // Distant City
        internal.parallaxOffset[2] += internal.speed * dt * 4.0; // Foreground Track

        // Player physics
        const p = internal.player;
        const gravity = 0.65;

        if (!p.isGrounded) {
          p.vy += gravity;
          p.y += p.vy;

          if (p.y >= groundY - p.height) {
            p.y = groundY - p.height;
            p.vy = 0;
            p.isGrounded = true;
            p.isJumping = false;
            p.isDoubleJumping = false;

            // Landing dust
            for (let i = 0; i < 4; i++) {
              internal.particles.push({
                x: p.x + p.width / 2,
                y: groundY,
                vx: (Math.random() - 0.5) * 3,
                vy: -Math.random() * 1.5,
                size: Math.random() * 3 + 1,
                color: level.accentColor,
                alpha: 0.6,
                decay: 0.05
              });
            }
          }
        }

        // Slide timer
        if (p.isSliding) {
          p.slideTimer -= 1;
          if (p.slideTimer <= 0) {
            p.isSliding = false;
            p.height = p.baseHeight;
            p.y = groundY - p.baseHeight;
          }
        }

        // Magnet timer
        if (p.magnetTimer > 0) {
          p.magnetTimer -= dt;
          setMagnetTimer(Math.ceil(p.magnetTimer));
        }

        // Invincible timer (after shield hit)
        if (p.invincibleTimer > 0) {
          p.invincibleTimer -= dt;
        }

        // Running animation frames
        p.animTick += 1;
        if (p.animTick > 5) {
          p.animFrame = (p.animFrame + 1) % 4;
          p.animTick = 0;

          // Running trail dust
          if (p.isGrounded && !p.isSliding) {
            internal.particles.push({
              x: p.x,
              y: groundY - 4,
              vx: -internal.speed * 0.4,
              vy: (Math.random() - 0.5) * 1,
              size: Math.random() * 3 + 2,
              color: 'rgba(255, 255, 255, 0.4)',
              alpha: 0.6,
              decay: 0.06
            });
          }
        }

        // Spawn Obstacles
        if (internal.distance >= internal.nextObstacleDist && (!isEndlessMode ? internal.distance < level.targetDistance - 50 : true)) {
          const obstacleTypes: Obstacle['type'][] = ['spike', 'high_laser', 'drone', 'glitch_gate'];
          if (level.theme === 'magma') obstacleTypes.push('fire_pit');
          if (level.theme === 'void') obstacleTypes.push('turret');

          const chosenType = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          let obsW = 36;
          let obsH = 44;
          let obsY = groundY - obsH;

          if (chosenType === 'high_laser') {
            // Must slide under!
            obsW = 48;
            obsH = 30;
            obsY = groundY - 70; // floating high
          } else if (chosenType === 'drone') {
            obsW = 40;
            obsH = 34;
            obsY = groundY - 60;
          } else if (chosenType === 'glitch_gate') {
            obsW = 30;
            obsH = 65;
            obsY = groundY - 65;
          } else if (chosenType === 'turret') {
            obsW = 42;
            obsH = 48;
            obsY = groundY - 48;
          }

          internal.obstacles.push({
            x: 850,
            y: obsY,
            width: obsW,
            height: obsH,
            type: chosenType,
            passed: false
          });

          // Spacing for expert challenge
          const spacing = Math.max(220, 360 - (internal.speed * 10));
          internal.nextObstacleDist = internal.distance + spacing;
        }

        // Spawn Collectibles ($ Coins and Powerups)
        if (internal.distance >= internal.nextCollectibleDist) {
          const remainingCash = internal.maxCashToSpawn - internal.totalCashSpawned;
          const hasCashLeft = remainingCash > 0 || isEndlessMode;

          if (hasCashLeft) {
            // Coin pattern (single, arc, or high float)
            const pattern = Math.random();
            const coinVal = Math.random() > 0.8 ? 2.0 : (Math.random() > 0.5 ? 1.0 : 0.5);

            if (pattern < 0.6) {
              // Ground level / jump coin
              internal.collectibles.push({
                x: 850,
                y: groundY - 35,
                radius: 12,
                value: coinVal,
                type: 'cash',
                collected: false,
                pulseOffset: Math.random() * Math.PI
              });
            } else if (pattern < 0.85) {
              // Arc of 3 coins
              for (let i = 0; i < 3; i++) {
                internal.collectibles.push({
                  x: 850 + (i * 35),
                  y: groundY - (i === 1 ? 95 : 65),
                  radius: 12,
                  value: 0.5,
                  type: 'cash',
                  collected: false,
                  pulseOffset: i * 0.5
                });
              }
            } else {
              // Rare power-up spawn (Shield or Magnet)
              const pType: Collectible['type'] = Math.random() > 0.5 ? 'shield' : 'magnet';
              internal.collectibles.push({
                x: 850,
                y: groundY - 60,
                radius: 16,
                value: 0,
                type: pType,
                collected: false,
                pulseOffset: 0
              });
            }

            internal.totalCashSpawned += coinVal;
          }

          internal.nextCollectibleDist = internal.distance + (Math.random() * 80 + 70);
        }

        // Move & Collide Obstacles
        const scrollSpeed = internal.speed * dt * 60;
        for (let i = internal.obstacles.length - 1; i >= 0; i--) {
          const obs = internal.obstacles[i];
          obs.x -= scrollSpeed;

          // Collision Check
          const playerLeft = p.x + 8;
          const playerRight = p.x + p.width - 8;
          const playerTop = p.y + 6;
          const playerBottom = p.y + p.height;

          const obsLeft = obs.x;
          const obsRight = obs.x + obs.width;
          const obsTop = obs.y;
          const obsBottom = obs.y + obs.height;

          const isColliding =
            playerRight > obsLeft &&
            playerLeft < obsRight &&
            playerBottom > obsTop &&
            playerTop < obsBottom;

          if (isColliding && p.invincibleTimer <= 0) {
            if (p.hasShield) {
              // Shield absorbs the blow!
              p.hasShield = false;
              p.invincibleTimer = 1.2; // 1.2s invulnerability
              setHasShield(false);
              sound.playShieldBreak();
              internal.screenShake = 12;

              internal.floatingTexts.push({
                id: Date.now(),
                x: p.x + 20,
                y: p.y - 10,
                text: '🛡️ SHIELD SAVED -$0.80!',
                color: '#38BDF8',
                alpha: 1,
                vy: -1.2
              });

              // Shield shatter particles
              for (let k = 0; k < 18; k++) {
                const angle = (k / 18) * Math.PI * 2;
                internal.particles.push({
                  x: p.x + p.width / 2,
                  y: p.y + p.height / 2,
                  vx: Math.cos(angle) * 5,
                  vy: Math.sin(angle) * 5,
                  size: 3.5,
                  color: '#38BDF8',
                  alpha: 1,
                  decay: 0.04
                });
              }
            } else {
              // CRASH - LOSS!
              internal.gameState = 'LOST';
              setGameState('LOST');
              sound.playHit();
              internal.screenShake = 20;

              const penalty = level.obstaclePenalty;
              setHitPenalty(penalty);

              // Crash explosion particles
              for (let k = 0; k < 25; k++) {
                internal.particles.push({
                  x: p.x + p.width / 2,
                  y: p.y + p.height / 2,
                  vx: (Math.random() - 0.5) * 10,
                  vy: (Math.random() - 0.5) * 10,
                  size: Math.random() * 5 + 2,
                  color: '#EF4444',
                  alpha: 1,
                  decay: 0.03
                });
              }

              onGameLoss({
                distance: Math.floor(internal.distance),
                penalty: penalty,
                cashEarned: internal.cashCollected
              });
              break;
            }
          }

          if (obs.x < -100) {
            internal.obstacles.splice(i, 1);
          }
        }

        // Move & Collect Items
        const magnetRange = p.magnetTimer > 0 ? (180 * character.magnetRadiusMultiplier) : 0;
        for (let i = internal.collectibles.length - 1; i >= 0; i--) {
          const item = internal.collectibles[i];
          item.x -= scrollSpeed;

          // Magnet Attraction
          if (magnetRange > 0 && !item.collected) {
            const dx = (p.x + p.width / 2) - item.x;
            const dy = (p.y + p.height / 2) - item.y;
            const dist = Math.hypot(dx, dy);

            if (dist < magnetRange) {
              item.x += (dx / dist) * 9;
              item.y += (dy / dist) * 9;
            }
          }

          // Pick-up check
          const pCenterX = p.x + p.width / 2;
          const pCenterY = p.y + p.height / 2;
          const itemDist = Math.hypot(pCenterX - item.x, pCenterY - item.y);

          if (itemDist < item.radius + 24 && !item.collected) {
            item.collected = true;

            if (item.type === 'cash') {
              const multi = character.cashBonusMultiplier || 1.0;
              const earned = item.value * multi;
              internal.cashCollected = Math.min(30.0, internal.cashCollected + earned);
              setCashCollected(internal.cashCollected);
              sound.playCoin();

              internal.floatingTexts.push({
                id: Date.now() + Math.random(),
                x: item.x,
                y: item.y,
                text: `+$${earned.toFixed(2)}`,
                color: '#FACC15',
                alpha: 1,
                vy: -1.5
              });

              // Gold coin shimmer
              for (let k = 0; k < 6; k++) {
                internal.particles.push({
                  x: item.x,
                  y: item.y,
                  vx: (Math.random() - 0.5) * 4,
                  vy: (Math.random() - 0.5) * 4,
                  size: 2.5,
                  color: '#FDE047',
                  alpha: 1,
                  decay: 0.05
                });
              }
            } else if (item.type === 'shield') {
              p.hasShield = true;
              setHasShield(true);
              sound.playPowerUp();

              internal.floatingTexts.push({
                id: Date.now(),
                x: item.x,
                y: item.y,
                text: '🛡️ SHIELD EQUIPPED!',
                color: '#38BDF8',
                alpha: 1,
                vy: -1.5
              });
            } else if (item.type === 'magnet') {
              p.magnetTimer = 8; // 8 seconds of coin magnet
              setMagnetTimer(8);
              sound.playPowerUp();

              internal.floatingTexts.push({
                id: Date.now(),
                x: item.x,
                y: item.y,
                text: '🧲 COIN MAGNET ACTIVE!',
                color: '#C084FC',
                alpha: 1,
                vy: -1.5
              });
            }

            internal.collectibles.splice(i, 1);
          } else if (item.x < -60) {
            internal.collectibles.splice(i, 1);
          }
        }

        // Check WIN condition (Reached target distance)
        if (!isEndlessMode && internal.distance >= level.targetDistance) {
          internal.gameState = 'WON';
          setGameState('WON');
          sound.playWin();

          confetti({
            particleCount: 120,
            spread: 90,
            origin: { y: 0.5 }
          });

          onGameWin({
            timeMs: internal.elapsedMs,
            distance: level.targetDistance,
            cashEarned: internal.cashCollected,
            distanceBonus: level.distanceBonus
          });
        }
      }

      // -------------------------------------------------------------
      // DRAWING ROUTINES (60 FPS Canvas Renderer)
      // -------------------------------------------------------------
      const W = canvas.width;
      const H = canvas.height;

      // Screen Shake translation
      ctx.save();
      if (internal.screenShake > 0) {
        const sx = (Math.random() - 0.5) * internal.screenShake;
        const sy = (Math.random() - 0.5) * internal.screenShake;
        ctx.translate(sx, sy);
        internal.screenShake *= 0.88;
        if (internal.screenShake < 0.5) internal.screenShake = 0;
      }

      // 1. Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
      skyGrad.addColorStop(0, level.skyColors[0]);
      skyGrad.addColorStop(1, level.skyColors[1]);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      // 2. Parallax Background Layer 1: Distant City Skyline / Mountains
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let i = -1; i < 15; i++) {
        const bx = (i * 90) - (internal.parallaxOffset[0] % 90);
        const bh = ((i * 37) % 110) + 120;
        ctx.fillRect(bx, groundY - bh, 70, bh);
      }

      // 3. Parallax Layer 2: Midground Cyber Towers / Pillars & Neon Grid Lines
      ctx.strokeStyle = `${level.accentColor}22`;
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        const gx = x - (internal.parallaxOffset[1] % 40);
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, groundY);
        ctx.stroke();
      }

      // 4. Ground Surface & Runway Track
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, H);
      groundGrad.addColorStop(0, level.groundColor);
      groundGrad.addColorStop(1, '#05070d');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, groundY, W, H - groundY);

      // Neon Track Edge
      ctx.strokeStyle = level.trackColor;
      ctx.lineWidth = 4;
      ctx.shadowColor = level.trackColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(W, groundY);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Moving Ground Speed Grid
      ctx.strokeStyle = `${level.accentColor}44`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 24; i++) {
        const lineX = (i * 45) - (internal.parallaxOffset[2] % 45);
        ctx.beginPath();
        ctx.moveTo(lineX, groundY);
        ctx.lineTo(lineX - 25, H);
        ctx.stroke();
      }

      // 5. Draw Collectibles
      internal.collectibles.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);

        if (item.type === 'cash') {
          // Floating Gold Coin
          ctx.shadowColor = '#FACC15';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#EAB308';
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();

          // Coin Rim
          ctx.strokeStyle = '#FEF08A';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Dollar Sign
          ctx.fillStyle = '#713F12';
          ctx.font = 'bold 12px Plus Jakarta Sans';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', 0, 1);
        } else if (item.type === 'shield') {
          // Shield Power-up Orb
          ctx.shadowColor = '#38BDF8';
          ctx.shadowBlur = 12;
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '14px Plus Jakarta Sans';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', 0, 0);
        } else if (item.type === 'magnet') {
          // Magnet Power-up Orb
          ctx.shadowColor = '#C084FC';
          ctx.shadowBlur = 12;
          ctx.fillStyle = 'rgba(192, 132, 252, 0.3)';
          ctx.beginPath();
          ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#C084FC';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '14px Plus Jakarta Sans';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🧲', 0, 0);
        }

        ctx.restore();
      });

      // 6. Draw Obstacles
      internal.obstacles.forEach(obs => {
        ctx.save();
        if (obs.type === 'spike') {
          // Sharp Ground Spikes
          ctx.fillStyle = '#EF4444';
          ctx.strokeStyle = '#FCA5A5';
          ctx.lineWidth = 2;
          ctx.shadowColor = '#EF4444';
          ctx.shadowBlur = 8;

          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (obs.type === 'high_laser') {
          // Pulsing High Laser (Slide underneath!)
          ctx.shadowColor = '#F43F5E';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#F43F5E';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Danger stripes
          ctx.fillStyle = '#FFE4E6';
          ctx.fillRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);

          ctx.font = 'bold 9px Chakra Petch';
          ctx.fillStyle = '#881337';
          ctx.textAlign = 'center';
          ctx.fillText('SLIDE', obs.x + obs.width / 2, obs.y + obs.height / 2 + 3);
        } else if (obs.type === 'drone') {
          // Hover Drone
          ctx.shadowColor = '#A855F7';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#1E1B4B';
          ctx.strokeStyle = '#A855F7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 8);
          ctx.fill();
          ctx.stroke();

          // Red Sensor Eye
          ctx.fillStyle = '#EF4444';
          ctx.beginPath();
          ctx.arc(obs.x + obs.width / 2, obs.y + obs.height / 2, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (obs.type === 'fire_pit') {
          // Magma Fire Geyser
          ctx.shadowColor = '#F97316';
          ctx.shadowBlur = 14;
          ctx.fillStyle = '#EA580C';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillStyle = '#FDE047';
          ctx.fillRect(obs.x + 4, obs.y + 4, obs.width - 8, obs.height - 8);
        } else {
          // Standard Glitch Gate
          ctx.shadowColor = '#06B6D4';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#083344';
          ctx.strokeStyle = '#06B6D4';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }
        ctx.restore();
      });

      // 7. Draw Player Character
      const p = internal.player;
      ctx.save();
      ctx.translate(p.x, p.y);

      // Flickering opacity when invincible after shield hit
      if (p.invincibleTimer > 0 && Math.floor(now / 50) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Energy Shield Bubble
      if (p.hasShield) {
        ctx.save();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 14;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.ellipse(p.width / 2, p.height / 2, p.width / 2 + 10, p.height / 2 + 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Coin Magnet Aura
      if (p.magnetTimer > 0) {
        ctx.save();
        ctx.strokeStyle = '#C084FC';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(p.width / 2, p.height / 2, 45, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      const bodyColor = skin?.bodyColor || character.color;
      const glowColor = skin?.glowColor || character.color;

      if (p.isSliding) {
        // Sliding horizontal pose
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10;
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.roundRect(0, 0, p.width + 12, p.height, 10);
        ctx.fill();

        // Visor
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(p.width - 4, 6, 12, 6);

        // Slide Sparks
        ctx.fillStyle = '#FACC15';
        ctx.fillRect(p.width + 4, p.height - 4, 8, 3);
      } else {
        // Running / Jumping humanoid sprite
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 12;

        // Body Capsule
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.roundRect(4, 12, p.width - 8, p.height - 24, 8);
        ctx.fill();

        // Head
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.arc(p.width / 2, 8, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Neon Visor
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(p.width / 2 + 1, 4, 7, 5);

        // Running Legs Animation
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';

        if (p.isGrounded) {
          const legSwing = Math.sin((p.animFrame / 4) * Math.PI * 2) * 12;
          // Left Leg
          ctx.beginPath();
          ctx.moveTo(12, p.height - 12);
          ctx.lineTo(12 + legSwing, p.height);
          ctx.stroke();

          // Right Leg
          ctx.beginPath();
          ctx.moveTo(p.width - 12, p.height - 12);
          ctx.lineTo(p.width - 12 - legSwing, p.height);
          ctx.stroke();
        } else {
          // Jump Pose (Tucked Legs)
          ctx.beginPath();
          ctx.moveTo(10, p.height - 12);
          ctx.lineTo(6, p.height - 4);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(p.width - 10, p.height - 12);
          ctx.lineTo(p.width - 6, p.height - 4);
          ctx.stroke();
        }
      }

      ctx.restore();

      // 8. Draw Particles
      for (let i = internal.particles.length - 1; i >= 0; i--) {
        const pt = internal.particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;

        if (pt.alpha <= 0) {
          internal.particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.alpha;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 9. Draw Floating Popup Texts
      for (let i = internal.floatingTexts.length - 1; i >= 0; i--) {
        const ft = internal.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= 0.02;

        if (ft.alpha <= 0) {
          internal.floatingTexts.splice(i, 1);
        } else {
          ctx.save();
          ctx.font = 'bold 13px Chakra Petch';
          ctx.fillStyle = ft.color;
          ctx.globalAlpha = ft.alpha;
          ctx.shadowColor = ft.color;
          ctx.shadowBlur = 8;
          ctx.fillText(ft.text, ft.x, ft.y);
          ctx.restore();
        }
      }

      // 10. Finish Distance Flag Marker
      if (!isEndlessMode) {
        const finishX = (level.targetDistance - internal.distance) * 8 + p.x;
        if (finishX > -50 && finishX < W + 100) {
          ctx.save();
          ctx.fillStyle = '#10B981';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.fillRect(finishX, groundY - 140, 8, 140);

          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.moveTo(finishX + 8, groundY - 140);
          ctx.lineTo(finishX + 55, groundY - 120);
          ctx.lineTo(finishX + 8, groundY - 100);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 12px Chakra Petch';
          ctx.fillStyle = '#FFFFFF';
          ctx.fillText('FINISH', finishX - 10, groundY - 148);
          ctx.restore();
        }
      }

      ctx.restore(); // restore screen shake

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [level, character, skin, stats, isEndlessMode, onGameWin, onGameLoss]);

  const targetDist = isEndlessMode ? 9999 : level.targetDistance;
  const progressPercent = Math.min(100, Math.floor((distance / targetDist) * 100));
  const formatTime = (ms: number) => {
    const totalSec = ms / 1000;
    const mins = Math.floor(totalSec / 60);
    const secs = (totalSec % 60).toFixed(2);
    return `${mins > 0 ? mins + ':' : ''}${secs.padStart(5, '0')}s`;
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden glass-card border-2 border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Top HUD Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2.5 border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700">
            <span className="text-xs font-bold text-slate-400">WORLD {level.id}:</span>
            <span className="text-xs font-black text-amber-400 font-arcade">{level.name}</span>
          </div>

          <div className="flex items-center gap-1 text-xs font-arcade font-bold text-slate-300">
            <span className="text-amber-400">⏱️</span>
            <span>{formatTime(elapsedTimeMs)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Shield Indicator */}
          {hasShield && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 animate-pulse">
              <Shield className="w-3 h-3 text-cyan-400" /> Shield
            </span>
          )}

          {/* Active Magnet Indicator */}
          {magnetTimer > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1">
              <Magnet className="w-3 h-3 text-purple-400" /> {magnetTimer}s
            </span>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Pause Button */}
          {gameState === 'PLAYING' && (
            <button
              onClick={togglePause}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Pause"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Progress & Stat Header */}
      <div className="bg-slate-950/80 px-4 py-2 flex items-center justify-between border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Distance</span>
            <p className="font-arcade font-black text-sm text-cyan-400">
              {distance}m <span className="text-[10px] text-slate-500">/ {isEndlessMode ? '∞' : `${level.targetDistance}m`}</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Cash Collected</span>
            <p className="font-arcade font-black text-sm text-emerald-400">
              +${cashCollected.toFixed(2)} <span className="text-[10px] text-slate-500">/ ${level.cashDropGoal}</span>
            </p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Speed</span>
            <p className="font-arcade font-black text-sm text-amber-400">
              {(speed * 10).toFixed(0)} <span className="text-[10px] text-slate-500">km/h</span>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Distance Bonus: +${level.distanceBonus}.00</span>
          <div className="w-28 bg-slate-900 rounded-full h-2 mt-0.5 overflow-hidden border border-slate-700">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="relative w-full h-[400px] bg-slate-950 flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full object-contain"
        />

        {/* READY OVERLAY */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-3xl shadow-xl animate-bounce">
              {character.avatar}
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest font-arcade">LEVEL {level.id} READY</span>
              <h2 className="text-2xl font-black text-slate-100">{level.name}</h2>
              <p className="text-xs text-slate-400 max-w-xs">{level.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 max-w-xs w-full text-left text-xs bg-slate-900 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px]">Win Reward:</span>
                <p className="text-emerald-400 font-bold font-arcade">+${level.cashDropGoal} + $3 Bonus</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">Obstacle Hit:</span>
                <p className="text-rose-400 font-bold font-arcade">-${level.obstaclePenalty.toFixed(2)} Loss</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={startGame}
                className="w-full py-3.5 px-6 rounded-2xl gold-btn text-slate-950 font-black text-sm shadow-xl hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer font-arcade"
              >
                <Play className="w-4 h-4 fill-slate-950" /> START RUN (SPACE / TAP)
              </button>

              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Back to Worlds
              </button>
            </div>

            <p className="text-[11px] text-slate-500">
              Desktop: <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">Space</kbd> Jump | <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">↓ / S</kbd> Slide | <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300">P</kbd> Pause
            </p>
          </div>
        )}

        {/* PAUSED OVERLAY */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 space-y-4">
            <h3 className="text-2xl font-black text-amber-400 font-arcade">GAME PAUSED</h3>
            <div className="flex gap-3">
              <button
                onClick={togglePause}
                className="py-3 px-6 rounded-xl gold-btn text-slate-950 font-bold text-xs shadow-md transition"
              >
                Resume Run
              </button>
              <button
                onClick={startGame}
                className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                Restart
              </button>
              <button
                onClick={onExit}
                className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        {/* VICTORY / WON OVERLAY */}
        {gameState === 'WON' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center text-3xl shadow-xl text-emerald-400">
              🏆
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-arcade">LEVEL {level.id} COMPLETED!</span>
              <h2 className="text-2xl font-black text-slate-100">VICTORY ACHIEVED</h2>
              <p className="text-xs text-slate-400 font-arcade">Speedrun Time: <strong className="text-amber-400 text-sm">{formatTime(elapsedTimeMs)}</strong></p>
            </div>

            <div className="w-full max-w-xs bg-slate-900/90 p-4 rounded-2xl border border-emerald-500/30 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Distance Reached:</span>
                <span className="text-slate-200 font-bold font-arcade">{level.targetDistance}m (100%)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Coins Collected:</span>
                <span className="text-emerald-400 font-bold font-arcade">+${cashCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Distance Milestone Bonus:</span>
                <span className="text-amber-400 font-bold font-arcade">+${level.distanceBonus.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-black">
                <span className="text-slate-100">Total Run Earnings:</span>
                <span className="text-emerald-400 font-arcade text-base">+${(cashCollected + level.distanceBonus).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              {onNextLevel && level.id < 5 && (
                <button
                  onClick={onNextLevel}
                  className="w-full py-3.5 px-6 rounded-2xl gold-btn text-slate-950 font-black text-sm shadow-xl hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer font-arcade"
                >
                  NEXT WORLD LEVEL <ChevronRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={startGame}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Run Again (Speedrun Record)
              </button>

              <button
                onClick={onExit}
                className="w-full py-2 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition"
              >
                Back to Worlds Hub
              </button>
            </div>
          </div>
        )}

        {/* LOSS / CRASH OVERLAY */}
        {gameState === 'LOST' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30 space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-3xl shadow-xl text-rose-400">
              💥
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-rose-400 uppercase tracking-widest font-arcade">OBSTACLE COLLISION</span>
              <h2 className="text-2xl font-black text-slate-100">RUN FAILED</h2>
              <p className="text-xs text-rose-400 font-bold font-arcade">Hit Obstacle Penalty: -${hitPenalty.toFixed(2)}</p>
            </div>

            <div className="w-full max-w-xs bg-slate-900/90 p-4 rounded-2xl border border-rose-500/30 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Distance Run:</span>
                <span className="text-slate-200 font-bold font-arcade">{distance}m</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Cash Grabbed:</span>
                <span className="text-emerald-400 font-bold font-arcade">+${cashCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Collision Penalty:</span>
                <span className="text-rose-400 font-bold font-arcade">-${hitPenalty.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs font-bold">
                <span className="text-slate-400">Net Balance Impact:</span>
                <span className={`font-arcade font-black ${cashCollected - hitPenalty >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {cashCollected - hitPenalty >= 0 ? '+' : ''}${(cashCollected - hitPenalty).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs">
              <button
                onClick={startGame}
                className="w-full py-3.5 px-6 rounded-2xl gold-btn text-slate-950 font-black text-sm shadow-xl hover:brightness-110 active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer font-arcade"
              >
                <RotateCcw className="w-4 h-4" /> RETRY LEVEL
              </button>

              <button
                onClick={onExit}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Back to Worlds
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-screen Touch Controls for Mobile & Quick Tapping */}
      <div className="bg-slate-900 px-4 py-3 border-t border-slate-800 flex items-center justify-around gap-3 z-20">
        <button
          onTouchStart={(e) => { e.preventDefault(); handleSlide(); }}
          onMouseDown={(e) => { e.preventDefault(); handleSlide(); }}
          className="flex-1 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-slate-950 text-slate-200 font-black text-sm font-arcade border border-slate-700 shadow-md transition flex items-center justify-center gap-2 active:scale-95 select-none"
        >
          <span>⬇️ SLIDE</span>
          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(Duck lasers)</span>
        </button>

        <button
          onTouchStart={(e) => { e.preventDefault(); if (gameState === 'READY') startGame(); else handleJump(); }}
          onMouseDown={(e) => { e.preventDefault(); if (gameState === 'READY') startGame(); else handleJump(); }}
          className="flex-1 py-3.5 rounded-2xl gold-btn text-slate-950 font-black text-sm font-arcade shadow-lg transition flex items-center justify-center gap-2 active:scale-95 select-none"
        >
          <span>⬆️ JUMP / 2x JUMP</span>
        </button>
      </div>
    </div>
  );
};
