// Next, React
import { FC, useState, useRef, useEffect } from 'react';
import pkg from '../../../package.json';
import React from 'react';

// ❌ DO NOT EDIT ANYTHING ABOVE THIS LINE

export const HomeView: FC = () => {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      {/* HEADER – fake Scrolly feed tabs */}
      <header className="flex items-center justify-center border-b border-white/10 py-3">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-2 py-1 text-[11px]">
          <button className="rounded-full bg-slate-900 px-3 py-1 font-semibold text-white">
            Feed
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Casino
          </button>
          <button className="rounded-full px-3 py-1 text-slate-400">
            Kids
          </button>
        </div>
      </header>

      {/* MAIN – central game area (phone frame) */}
      <main className="flex flex-1 items-center justify-center px-4 py-3">
        <div className="relative aspect-[9/16] w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_0_40px_rgba(56,189,248,0.35)]">
          {/* Fake “feed card” top bar inside the phone */}
          <div className="flex items-center justify-between px-3 py-2 text-[10px] text-slate-400">
            <span className="rounded-full bg-white/5 px-2 py-1 text-[9px] uppercase tracking-wide">
              Scrolly Game
            </span>
            <span className="text-[9px] opacity-70">#NoCodeJam</span>
          </div>

          {/* The game lives INSIDE this phone frame */}
          <div className="flex h-[calc(100%-26px)] flex-col items-center justify-start px-3 pb-3 pt-1">
            <GameSandbox />
          </div>
        </div>
      </main>

      {/* FOOTER – tiny version text */}
      <footer className="flex h-5 items-center justify-center border-t border-white/10 px-2 text-[9px] text-slate-500">
        <span>Scrolly · v{pkg.version}</span>
      </footer>
    </div>
  );
};

// ✅ THIS IS THE ONLY PART YOU EDIT FOR THE JAM
// Replace this entire GameSandbox component with the one AI generates.
// Keep the name `GameSandbox` and the `FC` type.
const GameSandbox: FC = () => {
  const [gameState, setGameState] = useState<'loading' | 'tutorial' | 'menu' | 'playing' | 'gameover'>('loading');
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [speed, setSpeed] = useState(1.5);
  const [blocks, setBlocks] = useState<Array<{ id: number; x: number; width: number; color: string }>>([]);
  const [currentBlock, setCurrentBlock] = useState<{ x: number; width: number; direction: number } | null>(null);
  const [perfectStacks, setPerfectStacks] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; subtext: string; color: string } | null>(null);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; rotation: number }>>([]);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; opacity: number }>>([]);
  const [difficulty, setDifficulty] = useState(0.8);
  const [isDropping, setIsDropping] = useState(false);
  const [showMultiplierPulse, setShowMultiplierPulse] = useState(false);
  const [comboMessage, setComboMessage] = useState<string>('');
  const [blockHistory, setBlockHistory] = useState<Array<'perfect' | 'good' | 'ok'>>([]);
  const [showPerfectStreak, setShowPerfectStreak] = useState(false);
  const [cameraOffset, setCameraOffset] = useState(0);
  const [showTapHint, setShowTapHint] = useState(true);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number>(0);

  const solanaMessages = {
    perfect: [
      'Transaction Confirmed! ⚡',
      'Block Finalized! 🔒',
      'Perfect Execution! 💎',
      'Network Sync! ⚡',
      'Consensus Reached! ✨',
      'Validator Approved! 🎯',
      'Zero Slippage! 🎯',
      'Instant Finality! ⚡'
    ],
    good: [
      'Good Placement! 📊',
      'Transaction Pending... ⏳',
      'Block Processing! 🔄',
      'Almost Perfect! 💫',
      'Nice Stack! 🌟',
      'Solid Connection! 🔗'
    ],
    ok: [
      'Block Added! 📦',
      'Partial Confirmation 📡',
      'Keep Stacking! 💪',
      'Transaction Received 📨',
      'Network Active 🌐'
    ],
    combo: [
      'HOT STREAK! 🔥',
      'MOON MODE! 🚀',
      'UNSTOPPABLE! ⚡',
      'LEGENDARY RUN! 💎',
      'ON FIRE! 🔥',
      'INSANE COMBO! 💥',
      'GODLIKE! ⭐',
      'DOMINATING! 👑'
    ],
    speedUp: [
      '⚡ SPEED BOOST!',
      '🚀 FASTER!',
      '💨 ACCELERATING!',
      '⏩ DIFFICULTY UP!'
    ]
  };

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  useEffect(() => {
    if (blocks.length > 8) {
      const offset = (blocks.length - 8) * 40;
      setCameraOffset(offset);
    } else {
      setCameraOffset(0);
    }
  }, [blocks.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loadingProgress < 100) {
        setLoadingProgress((prev) => Math.min(prev + 15, 100));
      } else {
        if (hasSeenTutorial) {
          setGameState('menu');
        } else {
          setGameState('tutorial');
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [loadingProgress, hasSeenTutorial]);

  useEffect(() => {
    if (multiplier > 1 && !showMultiplierPulse) {
      setShowMultiplierPulse(true);
      const timer = setTimeout(() => setShowMultiplierPulse(false), 400);
      return () => clearTimeout(timer);
    }
  }, [multiplier]);

  // AGGRESSIVE DIFFICULTY SCALING - Every 5 blocks!
  useEffect(() => {
    if (blocks.length > 1 && blocks.length % 5 === 0) {
      const newSpeed = 1.5 + (blocks.length * 0.15);
      const newDifficulty = 0.8 + (blocks.length * 0.08);

      setSpeed(Math.min(newSpeed, 4.5));
      setDifficulty(Math.min(newDifficulty, 2.5));

      const boostMsg = solanaMessages.speedUp[Math.floor(Math.random() * solanaMessages.speedUp.length)];
      setFeedback({ text: boostMsg, subtext: `Level ${Math.floor(blocks.length / 5)}`, color: '#FF6B6B' });
      setSpeedBoost(true);
      vibrate([40, 20, 40]);
      playComboSound();

      setTimeout(() => {
        setFeedback(null);
        setSpeedBoost(false);
      }, 1500);
    }
  }, [blocks.length]);

  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.12) => {
    if (typeof window === 'undefined') return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      // Silent fail
    }
  };

  const playBassHit = () => {
    playSound(90, 0.15, 'sawtooth', 0.18);
    setTimeout(() => playSound(75, 0.1, 'sawtooth', 0.12), 35);
  };

  const playPerfectSound = () => {
    playSound(900, 0.07, 'sine', 0.22);
    setTimeout(() => playSound(1200, 0.07, 'sine', 0.22), 60);
    setTimeout(() => playSound(1500, 0.1, 'sine', 0.25), 120);
    setTimeout(() => playSound(1800, 0.08, 'sine', 0.18), 180);
    vibrate(50);
  };

  const playMissSound = () => {
    playSound(200, 0.2, 'sawtooth', 0.25);
    setTimeout(() => playSound(140, 0.18, 'sawtooth', 0.2), 80);
    vibrate([100, 50, 100]);
  };

  const playComboSound = () => {
    playSound(1700, 0.06, 'square', 0.18);
    setTimeout(() => playSound(2100, 0.08, 'square', 0.2), 50);
    setTimeout(() => playSound(2500, 0.05, 'square', 0.15), 100);
    vibrate([30, 20, 30]);
  };

  const playUISound = () => {
    playSound(700, 0.07, 'sine', 0.13);
    setTimeout(() => playSound(900, 0.06, 'sine', 0.1), 50);
    vibrate(20);
  };

  const playSuccessChord = () => {
    playSound(523, 0.3, 'sine', 0.15);
    playSound(659, 0.3, 'sine', 0.15);
    playSound(784, 0.3, 'sine', 0.15);
    vibrate([50, 30, 50, 30, 50]);
  };

  useEffect(() => {
    if (gameState === 'playing' && currentBlock && !isDropping) {
      let lastTime = performance.now();

      const animate = (currentTime: number) => {
        const deltaTime = (currentTime - lastTime) / 16.67;
        lastTime = currentTime;

        setCurrentBlock((prev) => {
          if (!prev) return null;

          const moveAmount = prev.direction * speed * difficulty * Math.min(deltaTime, 2);
          let newX = prev.x + moveAmount;
          let newDirection = prev.direction;

          const containerWidth = 300;

          if (newX <= 0) {
            newX = 0;
            newDirection = 1;
          } else if (newX + prev.width >= containerWidth) {
            newX = containerWidth - prev.width;
            newDirection = -1;
          }

          return { ...prev, x: newX, direction: newDirection };
        });

        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [gameState, isDropping, speed, difficulty]);

  useEffect(() => {
    if (gameState === 'playing' && currentBlock && !isDropping) {
      const interval = setInterval(() => {
        setParticles((prev) => {
          const now = Date.now();
          const newParticle = {
            id: now + Math.random(),
            x: currentBlock.x + currentBlock.width / 2,
            y: blocks.length * 40 + 20,
            opacity: 0.8
          };
          const filtered = prev.filter((p) => now - p.id < 500);
          return [...filtered, newParticle];
        });
      }, 100);

      return () => clearInterval(interval);
    } else {
      setParticles([]);
    }
  }, [gameState, currentBlock, isDropping, blocks.length]);

  useEffect(() => {
    if (combo >= 5) {
      setMultiplier(3);
      setShowPerfectStreak(true);
    } else if (combo >= 3) {
      setMultiplier(2);
      setShowPerfectStreak(true);
    } else {
      setMultiplier(1);
      setShowPerfectStreak(false);
    }

    if (combo > 0 && combo % 5 === 0) {
      const comboMsg = solanaMessages.combo[Math.floor(Math.random() * solanaMessages.combo.length)];
      setComboMessage(comboMsg);
      playComboSound();
      setTimeout(() => setComboMessage(''), 2500);
    }
  }, [combo]);

  const spawnConfetti = (x: number, y: number, count: number = 15) => {
    const newConfetti = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i + Math.random() * 10000,
      x: x + Math.random() * 100 - 50,
      y: y + Math.random() * 80 - 40,
      rotation: Math.random() * 360,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#9945FF', '#14F195', '#FF1CF7'][Math.floor(Math.random() * 8)]
    }));
    setConfetti((prev) => [...prev, ...newConfetti]);
    setTimeout(() => {
      setConfetti((prev) => prev.filter((c) => !newConfetti.find((nc) => nc.id === c.id)));
    }, 1000);
  };

  const startGame = () => {
    const baseBlock = { id: 0, x: 90, width: 120, color: '#9945FF' };
    setGameState('playing');
    setScore(0);
    setCombo(0);
    setMultiplier(1);
    setSpeed(1.5);
    setBlocks([baseBlock]);
    setCurrentBlock({ x: 50, width: 120, direction: 1 });
    setPerfectStacks(0);
    setTotalBlocks(0);
    setFeedback(null);
    setConfetti([]);
    setParticles([]);
    setDifficulty(0.8);
    setIsDropping(false);
    setBlockHistory([]);
    setComboMessage('');
    setShowPerfectStreak(false);
    setCameraOffset(0);
    setShowTapHint(true);
    setSpeedBoost(false);
    playBassHit();
  };

  const skipTutorial = () => {
    setHasSeenTutorial(true);
    setGameState('menu');
    playUISound();
  };

  const nextTutorialStep = () => {
    if (tutorialStep < 3) {
      setTutorialStep(tutorialStep + 1);
      playUISound();
    } else {
      setHasSeenTutorial(true);
      setGameState('menu');
      playSuccessChord();
    }
  };

  const shareScore = () => {
    const text = `Just scored ${score} SOL on Solana Stacker! 📦🚀\n\nStack blocks, earn SOL, build combos!\n\n#ScrollyGameJam #Solana @Scrollyfeed @SuperteamUK`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ text })
        .then(() => {
          setShareSuccess(true);
          setTimeout(() => setShareSuccess(false), 3000);
        })
        .catch(() => { });
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      });
    }
    playUISound();
  };

  const dropBlock = () => {
    if (!currentBlock || gameState !== 'playing' || isDropping || blocks.length === 0) return;

    setIsDropping(true);
    setShowTapHint(false);

    const lastBlock = blocks[blocks.length - 1];
    const currentX = currentBlock.x;
    const currentWidth = currentBlock.width;
    const lastX = lastBlock.x;
    const lastWidth = lastBlock.width;

    const overlapLeft = Math.max(currentX, lastX);
    const overlapRight = Math.min(currentX + currentWidth, lastX + lastWidth);
    const overlapWidth = overlapRight - overlapLeft;

    if (overlapWidth <= 0) {
      playMissSound();
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 350);
      setFeedback({ text: '💀 Transaction Failed!', subtext: 'Network Timeout', color: '#EF4444' });
      setTimeout(() => {
        setGameState('gameover');
        if (score > highScore) {
          setHighScore(score);
        }
      }, 1200);
      return;
    }

    const perfectTolerance = 10;
    const goodTolerance = 22;
    const leftDiff = Math.abs(currentX - lastX);
    const rightDiff = Math.abs((currentX + currentWidth) - (lastX + lastWidth));
    const isPerfect = leftDiff < perfectTolerance && rightDiff < perfectTolerance;
    const isGood = leftDiff < goodTolerance || rightDiff < goodTolerance;

    let points = 1 * multiplier;
    let newWidth = overlapWidth;
    let newX = overlapLeft;
    let feedbackText = '';
    let feedbackSubtext = '';
    let feedbackColor = '#10B981';
    let blockType: 'perfect' | 'good' | 'ok' = 'ok';

    if (isPerfect) {
      points = 3 * multiplier;
      newWidth = currentWidth;
      newX = currentX;
      feedbackText = solanaMessages.perfect[Math.floor(Math.random() * solanaMessages.perfect.length)];
      feedbackSubtext = `+${points} SOL`;
      feedbackColor = '#14F195';
      playPerfectSound();
      setPerfectStacks((prev) => prev + 1);
      setCombo((prev) => prev + 1);
      spawnConfetti(currentX + currentWidth / 2, 180, 20);
      blockType = 'perfect';
    } else if (isGood) {
      points = 2 * multiplier;
      feedbackText = solanaMessages.good[Math.floor(Math.random() * solanaMessages.good.length)];
      feedbackSubtext = `+${points} SOL`;
      feedbackColor = '#9945FF';
      playBassHit();
      setCombo((prev) => prev + 1);
      spawnConfetti(currentX + currentWidth / 2, 180, 10);
      blockType = 'good';
    } else {
      feedbackText = solanaMessages.ok[Math.floor(Math.random() * solanaMessages.ok.length)];
      feedbackSubtext = `+${points} SOL`;
      feedbackColor = '#60A5FA';
      playBassHit();
      setCombo(0);
      blockType = 'ok';
    }

    const solanaColors = ['#9945FF', '#14F195', '#DC1FFF', '#00D4AA', '#8A2BE2', '#FF6EC7', '#00CED1', '#FFD700'];
    const newBlockColor = solanaColors[blocks.length % solanaColors.length];

    const newBlock = {
      id: blocks.length,
      x: newX,
      width: newWidth,
      color: newBlockColor
    };

    setBlocks((prev) => [...prev, newBlock]);
    setScore((prev) => prev + points);
    setTotalBlocks((prev) => prev + 1);
    setBlockHistory((prev) => [...prev, blockType]);
    setFeedback({ text: feedbackText, subtext: feedbackSubtext, color: feedbackColor });

    setTimeout(() => setFeedback(null), 1000);

    if (newWidth < 15) {
      playMissSound();
      setShakeScreen(true);
      setTimeout(() => setShakeScreen(false), 350);
      setTimeout(() => {
        setGameState('gameover');
        if (score > highScore) {
          setHighScore(score);
        }
      }, 1200);
      return;
    }

    setTimeout(() => {
      const startFromLeft = Math.random() > 0.5;
      setCurrentBlock({
        x: startFromLeft ? 0 : Math.max(0, 300 - newWidth),
        width: newWidth,
        direction: startFromLeft ? 1 : -1
      });
      setIsDropping(false);
    }, 80);
  };

  const displayBlocks = blocks;

  if (gameState === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-6">
        <div className="text-center space-y-8 w-full max-w-md">
          {/* Solana Logo SVG */}
          <div className="mb-6 flex justify-center animate-bounce">
            <svg width="140" height="140" viewBox="0 0 397.7 311.7" className="drop-shadow-2xl">
              <defs>
                <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#9945FF', stopOpacity: 1 }} />
                  <stop offset="50%" style={{ stopColor: '#14F195', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#00D4AA', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
              <g>
                <path fill="url(#solanaGradient)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z" />
                <path fill="url(#solanaGradient)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z" />
                <path fill="url(#solanaGradient)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z" />
              </g>
            </svg>
          </div>

          <h1 className="text-7xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
            SOLANA
          </h1>
          <h2 className="text-6xl font-black tracking-tight bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            STACKER
          </h2>
          <div className="w-full max-w-xs mx-auto h-4 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-purple-500/30">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-green-500 transition-all duration-150 ease-out relative overflow-hidden"
              style={{ width: `${loadingProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
            </div>
          </div>
          <p className="text-base text-gray-400 animate-pulse font-medium">Connecting to Solana... {loadingProgress}%</p>
          <div className="flex gap-2 justify-center mt-6">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'tutorial') {
    const tutorialSteps = [
      {
        icon: 'solana', // Changed from emoji
        title: 'Welcome to Solana Stacker!',
        description: 'Stack Solana transaction blocks to build the tallest tower. Each perfect stack confirms your transactions and earns you SOL rewards!',
        highlight: 'Tap anywhere to continue',
        color: 'from-purple-500 to-blue-500'
      },
      {
        emoji: '🎯',
        title: 'Master Your Timing',
        description: 'Watch the glowing yellow block slide. Tap "DROP BLOCK" when it perfectly aligns with the block below. Perfect timing = No slippage!',
        highlight: 'Perfect alignment = Full width + 3x SOL',
        color: 'from-green-500 to-emerald-500'
      },
      {
        emoji: '🔥',
        title: 'Stack Combos for Multipliers',
        description: 'Chain 3 good stacks for 2x multiplier, 5+ for 3x! Difficulty increases every 5 blocks. Stay focused!',
        highlight: 'Higher combos = Massive rewards',
        color: 'from-orange-500 to-red-500'
      },
      {
        emoji: '⚡',
        title: "Let's Stack Some Blocks!",
        description: 'The higher you stack, the FASTER it gets! Every 5 blocks = speed boost. Miss completely or shrink too small = Game Over!',
        highlight: 'Speed increases as you climb!',
        color: 'from-pink-500 to-purple-500'
      }
    ];

    const currentStep = tutorialSteps[tutorialStep];

    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white p-6 safe-area-inset">
        <div className="flex-1 flex items-center justify-center overflow-y-auto">
          <div className="w-full max-w-md text-center space-y-6 bg-black/50 backdrop-blur-2xl rounded-3xl p-8 border-2 border-purple-500/40 shadow-2xl my-4">

            {/* Solana Logo for first step, emoji for others */}
            {currentStep.icon === 'solana' ? (
              <div className="mb-4 flex justify-center animate-bounce">
                <svg width="100" height="100" viewBox="0 0 397.7 311.7" className="drop-shadow-2xl">
                  <defs>
                    <linearGradient id="solanaTutorialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#9945FF', stopOpacity: 1 }} />
                      <stop offset="50%" style={{ stopColor: '#14F195', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#00D4AA', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <g>
                    <path fill="url(#solanaTutorialGradient)" d="M64.6,237.9c2.4-2.4,5.7-3.8,9.2-3.8h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,237.9z" />
                    <path fill="url(#solanaTutorialGradient)" d="M64.6,3.8C67.1,1.4,70.4,0,73.8,0h317.4c5.8,0,8.7,7,4.6,11.1l-62.7,62.7c-2.4,2.4-5.7,3.8-9.2,3.8H6.5c-5.8,0-8.7-7-4.6-11.1L64.6,3.8z" />
                    <path fill="url(#solanaTutorialGradient)" d="M333.1,120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8,0-8.7,7-4.6,11.1l62.7,62.7c2.4,2.4,5.7,3.8,9.2,3.8h317.4c5.8,0,8.7-7,4.6-11.1L333.1,120.1z" />
                  </g>
                </svg>
              </div>
            ) : (
              <div className="text-8xl mb-4 animate-bounce">{currentStep.emoji}</div>
            )}

            <h2 className={`text-3xl font-black bg-gradient-to-r ${currentStep.color} bg-clip-text text-transparent leading-tight`}>
              {currentStep.title}
            </h2>
            <p className="text-base text-gray-200 leading-relaxed font-medium px-2">
              {currentStep.description}
            </p>
            <div className={`bg-gradient-to-r ${currentStep.color} bg-opacity-20 rounded-2xl p-4 border-2 border-purple-400/50 shadow-lg`}>
              <p className="text-sm font-bold text-white">{currentStep.highlight}</p>
            </div>

            <div className="flex gap-2 justify-center mt-6">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2.5 rounded-full transition-all duration-300 ${index === tutorialStep ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : 'w-2.5 bg-gray-600'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 pb-safe">
          <div className="flex gap-3 w-full max-w-md mx-auto">
            <button
              onClick={skipTutorial}
              className="flex-1 bg-gray-700/60 hover:bg-gray-600/60 text-gray-200 font-bold py-4 px-6 rounded-2xl text-base transition-all active:scale-95 border border-gray-600"
            >
              Skip
            </button>
            <button
              onClick={nextTutorialStep}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-black py-4 px-6 rounded-2xl text-lg shadow-2xl transition-all active:scale-95 border-2 border-white/20"
            >
              {tutorialStep === 3 ? "Let's Go! 🚀" : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (gameState === 'menu') {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white p-6 overflow-y-auto safe-area-inset">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-6 w-full max-w-md my-4">
            <div className="text-8xl mb-4 animate-float">📦</div>
            <h1 className="text-7xl font-black tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-green-400 bg-clip-text text-transparent leading-tight mb-3">
              SOLANA<br />STACKER
            </h1>
            <p className="text-xl text-purple-200 leading-relaxed font-bold">
              Stack blocks perfectly.<br />
              Earn SOL. Build combos. 🔥
            </p>
            <div className="bg-black/50 backdrop-blur-md rounded-3xl p-6 space-y-3 text-left text-sm border-2 border-purple-500/30 shadow-xl">
              <p className="flex items-center gap-3">
                <span className="text-2xl">📦</span>
                <span className="font-medium">Tap to drop Solana blocks</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <span className="font-medium">Perfect = 3x SOL + Full width</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <span className="font-medium">Build streaks: x2 @ 3, x3 @ 5</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">🚀</span>
                <span className="font-medium">Speed boost every 5 blocks!</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="text-2xl">💀</span>
                <span className="font-medium">Miss = Network error</span>
              </p>
            </div>
            {highScore > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 backdrop-blur-md rounded-3xl p-5 border-2 border-yellow-400/60 shadow-2xl">
                <p className="text-sm text-yellow-200 mb-2 font-bold">⚡ PERSONAL BEST</p>
                <p className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">{highScore}</p>
                <p className="text-xs text-yellow-200 mt-1 font-semibold">SOL Earned</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 pb-safe">
          <div className="w-full max-w-md mx-auto space-y-3">
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-green-600 hover:from-purple-700 hover:via-pink-700 hover:to-green-700 text-white font-black py-6 px-12 rounded-3xl text-3xl shadow-2xl active:scale-95 transition-all border-4 border-white/30 relative overflow-hidden"
            >
              <span className="relative z-10">⚡ START GAME</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </button>
            {hasSeenTutorial && (
              <button
                onClick={() => { setTutorialStep(0); setGameState('tutorial'); playUISound(); }}
                className="text-sm text-purple-300 hover:text-purple-200 underline transition-colors font-semibold w-full"
              >
                📖 View Tutorial
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    const accuracy = totalBlocks > 0 ? Math.round((perfectStacks / totalBlocks) * 100) : 0;
    const isNewHighScore = score > highScore;
    const maxLevel = Math.floor(totalBlocks / 5);

    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-red-950 via-gray-950 to-black text-white p-6 overflow-auto safe-area-inset">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center space-y-5 max-w-md w-full">
            <div className="text-9xl animate-bounce mb-4">💥</div>
            <h1 className="text-7xl font-black text-red-400 leading-none mb-2">NETWORK<br />ERROR!</h1>
            <p className="text-xl text-gray-300 font-semibold">Tower collapsed at block #{totalBlocks}</p>

            <div className="space-y-4 mt-6">
              <div className="bg-black/60 backdrop-blur-md rounded-3xl p-8 border-2 border-red-500/40 shadow-2xl">
                <p className="text-base text-gray-300 mb-3 font-bold">TOTAL SOL EARNED</p>
                <p className="text-7xl font-black bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-2">{score}</p>
                {isNewHighScore && (
                  <div className="mt-4 bg-gradient-to-r from-yellow-500/40 to-orange-500/40 rounded-2xl p-4 border-2 border-yellow-400 animate-pulse">
                    <p className="text-2xl font-black text-yellow-300">🎉 NEW RECORD! 🎉</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30 shadow-lg">
                  <p className="text-xs text-gray-300 mb-2 font-bold">PERFECT</p>
                  <p className="text-4xl font-black text-green-400">{perfectStacks}</p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30 shadow-lg">
                  <p className="text-xs text-gray-300 mb-2 font-bold">MAX LVL</p>
                  <p className="text-4xl font-black text-orange-400">{maxLevel}</p>
                </div>
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30 shadow-lg">
                  <p className="text-xs text-gray-300 mb-2 font-bold">RATE</p>
                  <p className="text-4xl font-black text-blue-400">{accuracy}%</p>
                </div>
              </div>

              {blockHistory.length > 0 && (
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30 shadow-lg">
                  <p className="text-sm text-gray-300 mb-3 font-bold">PERFORMANCE (Last 10 Blocks)</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {blockHistory.slice(-10).map((type, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-lg shadow-lg transition-transform hover:scale-110 ${type === 'perfect' ? 'bg-gradient-to-br from-green-400 to-green-600' :
                          type === 'good' ? 'bg-gradient-to-br from-blue-400 to-blue-600' :
                            'bg-gradient-to-br from-gray-400 to-gray-600'
                          }`}
                        title={type.toUpperCase()}
                      />
                    ))}
                  </div>
                </div>
              )}

              {shareSuccess && (
                <div className="bg-green-600/20 border-2 border-green-500 rounded-2xl p-4 animate-pulse">
                  <p className="text-green-300 font-bold">✅ Score copied! Share on X 🎉</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 pb-safe pt-4 space-y-3">
          <button
            onClick={startGame}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white font-black py-7 px-12 rounded-3xl text-4xl shadow-2xl active:scale-95 transition-all border-4 border-white/30 relative overflow-hidden block"
          >
            <span className="relative z-10">⚡ PLAY AGAIN</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
          </button>
          <button
            onClick={shareScore}
            className="w-full max-w-md mx-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-5 px-8 rounded-2xl text-xl shadow-xl active:scale-95 transition-all border-2 border-white/30 block"
          >
            📤 Share Score on X
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white relative overflow-hidden ${shakeScreen ? 'animate-shake' : ''}`}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-15px) rotate(-1deg); }
          30% { transform: translateX(15px) rotate(1deg); }
          45% { transform: translateX(-12px) rotate(-0.5deg); }
          60% { transform: translateX(12px) rotate(0.5deg); }
          75% { transform: translateX(-8px); }
          90% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97);
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.05); }
        }
        .animate-float {
          animation: float 2.5s ease-in-out infinite;
        }
        @keyframes fadeUp {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.8);
          }
        }
        .particle {
          animation: fadeUp 0.5s ease-out forwards;
        }
        @keyframes confettiFall {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(150px) rotate(720deg) scale(0.5);
            opacity: 0;
          }
        }
        .confetti-particle {
          animation: confettiFall 1s ease-out forwards;
        }
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 25px rgba(153, 69, 255, 0.5), 0 0 50px rgba(153, 69, 255, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 40px rgba(153, 69, 255, 0.8), 0 0 80px rgba(153, 69, 255, 0.5);
            transform: scale(1.05);
          }
        }
        .pulse-glow {
          animation: pulseGlow 0.6s ease-in-out;
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .slide-in {
          animation: slideInRight 0.3s ease-out;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 1.5rem);
        }
        .safe-area-inset {
          padding-top: env(safe-area-inset-top, 0);
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        .star {
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>

      {/* Background Stars */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-4 gap-2 p-3 bg-black/50 backdrop-blur-xl flex-shrink-0 border-b-2 border-purple-500/30 shadow-xl z-20">
        <div className="text-center">
          <p className="text-xs text-gray-300 font-bold">SOL</p>
          <p className="text-2xl font-black text-yellow-400">{score}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-300 font-bold">COMBO</p>
          <p className={`text-2xl font-black transition-all duration-200 ${combo >= 5 ? 'text-red-400 animate-pulse scale-125' : combo >= 3 ? 'text-orange-400 scale-110' : 'text-purple-400'}`}>
            {combo}x
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-300 font-bold">HEIGHT</p>
          <p className="text-2xl font-black text-blue-400">{totalBlocks}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-300 font-bold">BEST</p>
          <p className="text-2xl font-black text-green-400">{highScore}</p>
        </div>
      </div>

      {/* Multiplier Badge */}
      {showPerfectStreak && multiplier > 1 && (
        <div className="text-center py-1.5 flex-shrink-0 bg-gradient-to-b from-black/30 to-transparent z-20">
          <span className={`inline-block bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-black font-black px-8 py-2 rounded-full text-base shadow-2xl ${showMultiplierPulse ? 'pulse-glow' : ''} border-2 border-white/40`}>
            🔥 {multiplier}x MULTIPLIER!
          </span>
        </div>
      )}

      {/* Tap Hint */}
      {showTapHint && totalBlocks === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50 animate-pulse">
          <p className="text-2xl font-black text-white bg-black/70 px-8 py-4 rounded-2xl border-3 border-purple-400 shadow-2xl">
            👆 Tap to Drop Block!
          </p>
        </div>
      )}

      {/* Combo Message */}
      {comboMessage && (
        <div className="absolute top-28 left-1/2 transform -translate-x-1/2 z-50 text-center animate-bounce pointer-events-none">
          <p className="text-4xl font-black text-yellow-300 drop-shadow-2xl" style={{ textShadow: '0 0 30px rgba(255, 215, 0, 0.9), 0 0 60px rgba(255, 140, 0, 0.6)' }}>
            {comboMessage}
          </p>
        </div>
      )}

      {/* Feedback Messages */}
      {feedback && (
        <div className="absolute top-36 left-1/2 transform -translate-x-1/2 z-50 text-center slide-in pointer-events-none">
          <p className="text-3xl font-black drop-shadow-2xl mb-2" style={{ color: feedback.color, textShadow: `0 0 25px ${feedback.color}, 0 0 50px ${feedback.color}` }}>
            {feedback.text}
          </p>
          <p className="text-xl font-bold text-white drop-shadow-xl bg-black/40 px-6 py-2 rounded-full backdrop-blur-sm border-2 border-white/30 inline-block">
            {feedback.subtext}
          </p>
        </div>
      )}

      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute confetti-particle z-40 pointer-events-none"
          style={{
            left: `${c.x}px`,
            top: `${c.y}px`,
            width: '12px',
            height: '12px',
            backgroundColor: c.color,
            borderRadius: '3px',
            transform: `rotate(${c.rotation}deg)`,
            boxShadow: `0 0 10px ${c.color}`
          }}
        />
      ))}

      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute particle z-30 pointer-events-none"
          style={{
            left: `${p.x}px`,
            bottom: `${p.y + cameraOffset}px`,
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: `rgba(245, 158, 11, ${p.opacity})`,
            boxShadow: '0 0 15px rgba(245, 158, 11, 0.9)',
            opacity: p.opacity
          }}
        />
      ))}

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative px-4 overflow-hidden min-h-0">
        <div className="relative mx-auto" style={{ width: '300px', height: '380px' }}>
          {/* Height Meter */}
          <div className="absolute -left-12 top-0 h-full flex flex-col justify-between text-sm text-gray-400 font-black pointer-events-none">
            <span className="text-2xl">🚀</span>
            <span className="text-purple-300 text-lg">{blocks.length * 15}m</span>
            <span className="text-2xl">🌍</span>
          </div>

          {/* Container with camera transform */}
          <div
            className="absolute bottom-0 left-0 w-full transition-transform duration-300 ease-out"
            style={{ transform: `translateY(${cameraOffset}px)` }}
          >
            {displayBlocks.map((block, index) => (
              <div
                key={block.id}
                className="absolute shadow-2xl transition-all duration-75"
                style={{
                  left: `${block.x}px`,
                  bottom: `${index * 40}px`,
                  width: `${block.width}px`,
                  height: '38px',
                  backgroundColor: block.color,
                  border: '3px solid rgba(255, 255, 255, 0.5)',
                  borderRadius: '8px',
                  boxShadow: `0 6px 30px ${block.color}60, inset 0 3px 15px rgba(255,255,255,0.3)`,
                  transform: 'translateZ(0)'
                }}
              >
                <div className="h-full w-full bg-gradient-to-b from-white/40 via-white/20 to-transparent rounded-md" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-md" />
              </div>
            ))}

            {currentBlock && (
              <div
                className="absolute shadow-2xl"
                style={{
                  left: `${currentBlock.x}px`,
                  bottom: `${displayBlocks.length * 40}px`,
                  width: `${currentBlock.width}px`,
                  height: '38px',
                  backgroundColor: '#F59E0B',
                  border: '4px solid #FDE047',
                  borderRadius: '8px',
                  boxShadow: '0 0 50px rgba(245, 158, 11, 1), 0 0 100px rgba(245, 158, 11, 0.6), 0 0 150px rgba(245, 158, 11, 0.3)',
                  zIndex: 10,
                  transform: 'translateZ(0)'
                }}
              >
                <div className="h-full w-full bg-gradient-to-b from-white/60 via-white/30 to-transparent rounded relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/40 to-transparent" />
                </div>
              </div>
            )}

            {/* Ground */}
            <div className="absolute -bottom-4 left-0 w-full">
              <div className="h-4 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 rounded-full shadow-2xl relative overflow-hidden border-2 border-green-400/50">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
              </div>
              <div className="h-2 bg-gradient-to-r from-green-700 to-emerald-700 rounded-full mt-1 opacity-60 blur-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Drop Button */}
      <div className="p-4 pb-safe flex-shrink-0 z-20">
        <button
          onClick={dropBlock}
          disabled={isDropping}
          className={`w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 hover:from-green-700 hover:via-emerald-700 hover:to-green-700 text-white font-black py-6 rounded-3xl text-3xl shadow-2xl active:scale-95 transition-all duration-150 border-4 border-white/40 relative overflow-hidden ${isDropping ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <span className="relative z-10 drop-shadow-lg">📦 DROP BLOCK</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </button>
        <p className="text-center text-xs text-gray-400 mt-2 font-bold">Tap to confirm Solana transaction</p>
      </div>
    </div>
  );
};

export default GameSandbox;



