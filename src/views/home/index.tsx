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
  const [gameState, setGameState] = useState<'intro' | 'menu' | 'playing' | 'gameover'>('intro');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [player1, setPlayer1] = useState({ x: 1, y: 1, hp: 100, score: 0, shield: 0, powerup: 0, vulnerable: false });
  const [player2, setPlayer2] = useState({ x: 6, y: 6, hp: 100, score: 0, shield: 0, powerup: 0, vulnerable: false });
  const [selectedAction, setSelectedAction] = useState<'move' | 'attack' | 'shield' | 'power' | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [message, setMessage] = useState('');
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [shrinkLevel, setShrinkLevel] = useState(0);
  const [powerUps, setPowerUps] = useState<Array<{ x: number; y: number; type: 'health' | 'damage' }>>([]);
  const [combo, setCombo] = useState(0);
  const [shieldCooldown, setShieldCooldown] = useState(0);
  const [powerCooldown, setPowerCooldown] = useState(0);
  const [lastAction, setLastAction] = useState<string>('');

  const gridSize = 8;

  useEffect(() => {
    const introTimer = setTimeout(() => {
      if (gameState === 'intro') {
        setGameState('menu');
      }
    }, 3000);
    return () => clearTimeout(introTimer);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          const p1hp = player1.hp;
          const p2hp = player2.hp;
          if (p1hp > p2hp) {
            setWinner(1);
          } else if (p2hp > p1hp) {
            setWinner(2);
          } else {
            setWinner(player1.score >= player2.score ? 1 : 2);
          }
          setGameState('gameover');
          return 0;
        }

        if (prev === 45) setShrinkLevel(1);
        if (prev === 30) setShrinkLevel(2);
        if (prev === 15) setShrinkLevel(3);

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, player1.hp, player1.score, player2.hp, player2.score]);

  useEffect(() => {
    if (gameState === 'playing' && powerUps.length === 0 && turnCount % 3 === 0 && turnCount > 0) {
      spawnPowerUp();
    }
  }, [turnCount, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && currentPlayer === 2) {
      const botDelay = setTimeout(() => {
        executeBotTurn();
      }, 800);
      return () => clearTimeout(botDelay);
    }
  }, [currentPlayer, gameState]);

  useEffect(() => {
    if (shieldCooldown > 0) {
      const timer = setTimeout(() => setShieldCooldown(shieldCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [shieldCooldown]);

  useEffect(() => {
    if (powerCooldown > 0) {
      const timer = setTimeout(() => setPowerCooldown(powerCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [powerCooldown]);

  const spawnPowerUp = () => {
    let x, y;
    do {
      x = Math.floor(Math.random() * gridSize);
      y = Math.floor(Math.random() * gridSize);
    } while ((x === player1.x && y === player1.y) || (x === player2.x && y === player2.y) || isInDeadZone(x, y));

    const type = Math.random() > 0.5 ? 'health' : 'damage';
    setPowerUps([{ x, y, type }]);
  };

  const startGame = () => {
    setGameState('playing');
    setCurrentPlayer(1);
    setPlayer1({ x: 1, y: 1, hp: 100, score: 0, shield: 0, powerup: 0, vulnerable: false });
    setPlayer2({ x: 6, y: 6, hp: 100, score: 0, shield: 0, powerup: 0, vulnerable: false });
    setTurnCount(0);
    setTimeLeft(60);
    setShrinkLevel(0);
    setCombo(0);
    setPowerUps([]);
    setShieldCooldown(0);
    setPowerCooldown(0);
    setMessage('Your turn! Choose your action!');
    setWinner(null);
    setSelectedAction(null);
    setLastAction('');
  };

  const isInDeadZone = (x: number, y: number) => {
    if (shrinkLevel === 0) return false;
    if (shrinkLevel === 1 && (x === 0 || x === 7 || y === 0 || y === 7)) return true;
    if (shrinkLevel === 2 && (x <= 1 || x >= 6 || y <= 1 || y >= 6)) return true;
    if (shrinkLevel === 3 && (x <= 2 || x >= 5 || y <= 2 || y >= 5)) return true;
    return false;
  };

  const applyDeadZoneDamage = (player: any, setPlayer: any, isBot: boolean) => {
    const dangerDamage = shrinkLevel * 10;
    const newHp = Math.max(0, player.hp - dangerDamage);
    setPlayer({ ...player, hp: newHp, vulnerable: true });
    setMessage(`${isBot ? '🤖 Bot' : '🔵 You'} entered danger zone! -${dangerDamage} HP & VULNERABLE!`);

    if (newHp === 0) {
      setWinner(isBot ? 1 : 2);
      setGameState('gameover');
    }
  };

  const distance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  };

  const getValidMoves = (fromX: number, fromY: number, opponent: { x: number; y: number }) => {
    const moves = [];
    const directions = [
      { x: fromX - 1, y: fromY },
      { x: fromX + 1, y: fromY },
      { x: fromX, y: fromY - 1 },
      { x: fromX, y: fromY + 1 }
    ];

    for (const dir of directions) {
      if (dir.x >= 0 && dir.x < gridSize && dir.y >= 0 && dir.y < gridSize &&
        !(dir.x === opponent.x && dir.y === opponent.y)) {
        moves.push(dir);
      }
    }
    return moves;
  };

  const checkPowerUp = (x: number, y: number, player: any, setPlayer: any) => {
    const powerUp = powerUps.find(p => p.x === x && p.y === y);
    if (powerUp) {
      if (powerUp.type === 'health') {
        setPlayer({ ...player, hp: Math.min(100, player.hp + 20) });
        setMessage('💚 Health restored!');
      } else {
        setPlayer({ ...player, powerup: player.powerup + 1 });
        setMessage('⚡ Damage boost gained!');
      }
      setPowerUps([]);
    }
  };

  const executeBotTurn = () => {
    const bot = player2;
    const target = player1;
    const dist = distance(bot.x, bot.y, target.x, target.y);

    if (bot.shield === 0 && Math.random() > 0.7 && difficulty !== 'easy') {
      setPlayer2({ ...bot, shield: 1, vulnerable: false });
      setMessage('🤖 Bot activated shield!');
      setTimeout(() => endTurn(), 500);
      return;
    }

    if (difficulty === 'easy') {
      const action = Math.random() > 0.5 ? 'move' : 'attack';
      if (action === 'attack' && dist <= 2) {
        performBotAttack();
      } else {
        performBotMove();
      }
    } else if (difficulty === 'medium') {
      const powerUpNearby = powerUps.some(p => distance(bot.x, bot.y, p.x, p.y) <= 2);
      if (powerUpNearby && Math.random() > 0.5) {
        performBotMoveTowardsPowerUp();
      } else if (dist <= 2 && Math.random() > 0.3) {
        performBotAttack();
      } else if (dist > 3) {
        performBotMoveTowards(target);
      } else {
        performBotMove();
      }
    } else {
      const powerUpNearby = powerUps.some(p => distance(bot.x, bot.y, p.x, p.y) <= 2);
      if (powerUpNearby) {
        performBotMoveTowardsPowerUp();
      } else if (dist <= 2 && bot.powerup > 0) {
        performBotAttack(true);
      } else if (dist <= 2) {
        performBotAttack();
      } else {
        performBotMoveTowards(target);
      }
    }
  };

  const performBotAttack = (usePower = false) => {
    const dist = distance(player2.x, player2.y, player1.x, player1.y);
    let damage = dist === 1 ? 25 : 15;

    if (usePower && player2.powerup > 0) {
      damage += 15;
      setPlayer2(prev => ({ ...prev, powerup: prev.powerup - 1 }));
      setLastAction('power');
    } else {
      setLastAction('attack');
    }

    if (player1.vulnerable) {
      damage = Math.floor(damage * 1.5);
    }

    if (player1.shield > 0) {
      damage = Math.floor(damage / 2);
      setPlayer1(prev => ({ ...prev, shield: 0 }));
      setMessage(`🤖 Bot attacked! Shield absorbed damage! (${damage} dmg)`);
    } else {
      setMessage(`🤖 Bot attacked for ${damage} damage!${player1.vulnerable ? ' 💀 VULNERABLE!' : ''}`);
    }

    const newHp = Math.max(0, player1.hp - damage);
    setPlayer1(prev => ({ ...prev, hp: newHp, vulnerable: false }));
    setPlayer2(prev => ({ ...prev, score: prev.score + damage }));

    if (newHp === 0) {
      setWinner(2);
      setGameState('gameover');
      setMessage('🤖 Bot WINS!');
    } else {
      setTimeout(() => endTurn(), 500);
    }
  };

  const performBotMove = () => {
    const validMoves = getValidMoves(player2.x, player2.y, player1);
    if (validMoves.length > 0) {
      const safeMovesFromDeadZone = validMoves.filter(m => !isInDeadZone(m.x, m.y));
      const movesToUse = safeMovesFromDeadZone.length > 0 && difficulty !== 'easy' ? safeMovesFromDeadZone : validMoves;

      const randomMove = movesToUse[Math.floor(Math.random() * movesToUse.length)];
      setPlayer2(prev => ({ ...prev, x: randomMove.x, y: randomMove.y }));

      if (isInDeadZone(randomMove.x, randomMove.y)) {
        applyDeadZoneDamage(player2, setPlayer2, true);
      }

      checkPowerUp(randomMove.x, randomMove.y, player2, setPlayer2);
      if (!isInDeadZone(randomMove.x, randomMove.y)) {
        setMessage('🤖 Bot moved!');
      }
      setLastAction('move');
      setTimeout(() => endTurn(), 500);
    } else {
      endTurn();
    }
  };

  const performBotMoveTowards = (target: { x: number; y: number }) => {
    const validMoves = getValidMoves(player2.x, player2.y, target);
    if (validMoves.length === 0) {
      performBotMove();
      return;
    }

    const safeMovesFromDeadZone = validMoves.filter(m => !isInDeadZone(m.x, m.y));
    const movesToConsider = safeMovesFromDeadZone.length > 0 && difficulty !== 'easy' ? safeMovesFromDeadZone : validMoves;

    let bestMove = movesToConsider[0];
    let minDist = distance(bestMove.x, bestMove.y, target.x, target.y);

    for (const move of movesToConsider) {
      const d = distance(move.x, move.y, target.x, target.y);
      if (d < minDist) {
        minDist = d;
        bestMove = move;
      }
    }

    setPlayer2(prev => ({ ...prev, x: bestMove.x, y: bestMove.y }));

    if (isInDeadZone(bestMove.x, bestMove.y)) {
      applyDeadZoneDamage(player2, setPlayer2, true);
    }

    checkPowerUp(bestMove.x, bestMove.y, player2, setPlayer2);
    if (!isInDeadZone(bestMove.x, bestMove.y)) {
      setMessage('🤖 Bot is closing in!');
    }
    setLastAction('move');
    setTimeout(() => endTurn(), 500);
  };

  const performBotMoveTowardsPowerUp = () => {
    if (powerUps.length === 0) {
      performBotMove();
      return;
    }

    const validMoves = getValidMoves(player2.x, player2.y, player1);
    if (validMoves.length === 0) {
      performBotMove();
      return;
    }

    const powerUp = powerUps[0];
    let bestMove = validMoves[0];
    let minDist = distance(bestMove.x, bestMove.y, powerUp.x, powerUp.y);

    for (const move of validMoves) {
      const d = distance(move.x, move.y, powerUp.x, powerUp.y);
      if (d < minDist) {
        minDist = d;
        bestMove = move;
      }
    }

    setPlayer2(prev => ({ ...prev, x: bestMove.x, y: bestMove.y }));

    if (isInDeadZone(bestMove.x, bestMove.y)) {
      applyDeadZoneDamage(player2, setPlayer2, true);
    }

    checkPowerUp(bestMove.x, bestMove.y, player2, setPlayer2);
    if (!isInDeadZone(bestMove.x, bestMove.y)) {
      setMessage('🤖 Bot is hunting power-ups!');
    }
    setLastAction('move');
    setTimeout(() => endTurn(), 500);
  };

  const handleCellClick = (x: number, y: number) => {
    if (gameState !== 'playing' || !selectedAction || currentPlayer !== 1) return;

    const attacker = player1;
    const defender = player2;

    if (selectedAction === 'move') {
      const dist = distance(attacker.x, attacker.y, x, y);
      if (dist === 1 && x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
        if (x === defender.x && y === defender.y) {
          setMessage('❌ Cannot move to opponent position!');
          return;
        }
        setPlayer1(prev => ({ ...prev, x, y }));

        if (isInDeadZone(x, y)) {
          applyDeadZoneDamage(player1, setPlayer1, false);
        }

        checkPowerUp(x, y, attacker, setPlayer1);
        setLastAction('move');
        setTimeout(() => endTurn(), 300);
      } else {
        setMessage('❌ Move to adjacent cell only!');
      }
    } else if (selectedAction === 'attack' || selectedAction === 'power') {
      const dist = distance(attacker.x, attacker.y, x, y);
      if (x === defender.x && y === defender.y && dist <= 2) {
        let damage = dist === 1 ? 25 : 15;

        if (selectedAction === 'power' && attacker.powerup > 0) {
          damage += 15;
          setPlayer1(prev => ({ ...prev, powerup: prev.powerup - 1 }));
          setLastAction('power');
        } else if (selectedAction === 'power' && attacker.powerup === 0) {
          setMessage('❌ No power-ups available!');
          return;
        } else {
          setLastAction('attack');
        }

        if (defender.vulnerable) {
          damage = Math.floor(damage * 1.5);
        }

        if (defender.shield > 0) {
          damage = Math.floor(damage / 2);
          setPlayer2(prev => ({ ...prev, shield: 0 }));
          setMessage(`⚔️ Attack blocked by shield! (${damage} dmg)`);
        } else {
          setCombo(combo + 1);
          setMessage(`⚔️ Hit! ${damage} damage!${defender.vulnerable ? ' 💀 VULNERABLE!' : ''} ${combo > 1 ? `🔥 ${combo}x Combo!` : ''}`);
        }

        const newHp = Math.max(0, defender.hp - damage);
        setPlayer2(prev => ({ ...prev, hp: newHp, vulnerable: false }));
        setPlayer1(prev => ({ ...prev, score: prev.score + damage }));

        if (newHp === 0) {
          setWinner(1);
          setGameState('gameover');
          setMessage('🎉 You WIN!');
        } else {
          setTimeout(() => endTurn(), 300);
        }
      } else if (x === defender.x && y === defender.y) {
        setMessage('❌ Target too far! (Max 2 tiles)');
      } else {
        setMessage('❌ Attack the opponent!');
      }
    }
  };

  const handleShield = () => {
    if (shieldCooldown > 0) {
      setMessage(`⏳ Shield cooldown: ${shieldCooldown}s`);
      return;
    }
    setPlayer1(prev => ({ ...prev, shield: 1, vulnerable: false }));
    setShieldCooldown(5);
    setMessage('🛡️ Shield activated! Blocks 50% damage next turn!');
    setLastAction('shield');
    endTurn();
  };

  const endTurn = () => {
    setSelectedAction(null);
    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    setCurrentPlayer(nextPlayer);
    setTurnCount(turnCount + 1);

    if (lastAction !== 'attack' && lastAction !== 'power') {
      setCombo(0);
    }

    setMessage(nextPlayer === 1 ? 'Your turn! Choose your action!' : '🤖 Bot is thinking...');
  };

  const selectAction = (action: 'move' | 'attack' | 'power') => {
    if (currentPlayer !== 1) return;
    if (action === 'power' && player1.powerup === 0) {
      setMessage('❌ No power-ups! Collect ⚡ from the grid!');
      return;
    }
    setSelectedAction(action);
    const msg = action === 'move' ? '✅ Click adjacent cell to move' :
      action === 'power' ? '💥 Click opponent for MEGA ATTACK! (+15 damage)' :
        '⚔️ Click opponent to attack (range 1-2)';
    setMessage(msg);
  };

  if (gameState === 'intro') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-red-900 p-6 overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '90vh', margin: '0 auto' }}>
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>

          <div className="relative text-center mb-8">
            <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
              BATTLE
            </h1>
            <h2 className="text-6xl font-black bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent animate-pulse">
              ARENA
            </h2>
          </div>

          <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 shadow-2xl mb-8">
            <div className="grid grid-cols-8 gap-1 mb-4">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg bg-gradient-to-br from-gray-700 to-gray-600"
                  style={{
                    animation: `pulse ${Math.random() * 2 + 1}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  {i === 9 && <div className="text-2xl">🔵</div>}
                  {i === 54 && <div className="text-2xl">🤖</div>}
                  {i === 27 && <div className="text-xl">⚡</div>}
                  {i === 35 && <div className="text-xl">💚</div>}
                </div>
              ))}
            </div>

            <div className="flex justify-around">
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce">⚔️</div>
                <p className="text-xs text-gray-400 font-bold">ATTACK</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce" style={{ animationDelay: '0.2s' }}>🛡️</div>
                <p className="text-xs text-gray-400 font-bold">DEFEND</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce" style={{ animationDelay: '0.4s' }}>⚡</div>
                <p className="text-xs text-gray-400 font-bold">POWER</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-white text-xl font-black mb-2 animate-pulse">
              Loading Game...
            </div>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-6" style={{ aspectRatio: '9/16', maxHeight: '90vh', margin: '0 auto' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full transform hover:scale-105 transition-transform duration-300">
          <div className="text-center mb-6">
            <h1 className="text-6xl font-black mb-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent drop-shadow-lg">
              BATTLE
            </h1>
            <h2 className="text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ARENA
            </h2>
            <div className="flex justify-center gap-3 mt-4">
              <span className="text-4xl animate-bounce">⚔️</span>
              <span className="text-4xl animate-pulse">🔥</span>
              <span className="text-4xl animate-bounce">🤖</span>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-center text-sm font-black text-gray-700 mb-3">⚡ SELECT DIFFICULTY ⚡</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setDifficulty('easy')}
                className={`py-4 px-2 rounded-xl font-black text-xs transition-all ${difficulty === 'easy'
                  ? 'bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
              >
                😊<br />EASY
              </button>
              <button
                onClick={() => setDifficulty('medium')}
                className={`py-4 px-2 rounded-xl font-black text-xs transition-all ${difficulty === 'medium'
                  ? 'bg-gradient-to-br from-yellow-400 to-orange-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
              >
                😐<br />MEDIUM
              </button>
              <button
                onClick={() => setDifficulty('hard')}
                className={`py-4 px-2 rounded-xl font-black text-xs transition-all ${difficulty === 'hard'
                  ? 'bg-gradient-to-br from-red-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
              >
                😈<br />HARD
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-6 mb-6 shadow-inner">
            <p className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
              <span className="text-xl">📜</span> GAME FEATURES
            </p>
            <ul className="text-sm text-gray-700 space-y-2 font-semibold">
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-black">•</span>
                <span><span className="font-black text-purple-600">🛡️ SHIELD</span> - Block 50% damage!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-black">•</span>
                <span><span className="font-black text-orange-600">⚡ POWER-UPS</span> - +15 damage boost!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-black">•</span>
                <span><span className="font-black text-green-600">💚 HEALTH</span> - Restore +20 HP!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 font-black">•</span>
                <span><span className="font-black text-red-600">🔥 COMBO</span> - Chain attacks!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-black">•</span>
                <span className="font-black text-red-600">⏱️ 60s - Arena shrinks!</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 font-black">•</span>
                <span><span className="font-black text-red-600">💀 DANGER ZONE</span> - Takes damage & vulnerable!</span>
              </li>
            </ul>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-black text-2xl py-6 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transform transition-all duration-200 active:scale-95"
          >
            🎮 START BATTLE 🎮
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-400 via-red-500 to-pink-600 p-6" style={{ aspectRatio: '9/16', maxHeight: '90vh', margin: '0 auto' }}>
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-8xl mb-4 animate-bounce">
              {winner === 1 ? '🎉' : '🤖'}
            </div>
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {winner === 1 ? 'VICTORY!' : 'DEFEATED!'}
            </h1>
            <p className="text-6xl font-black text-gray-800 mb-2">
              {winner === 1 ? 'YOU WIN' : 'BOT WINS'}
            </p>
            <p className="text-2xl font-bold text-gray-600">
              {winner === 1 ? '🏆 CHAMPION 🏆' : '💀 TRY AGAIN 💀'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow">
              <span className="text-lg font-black text-gray-700 flex items-center gap-2">
                <span className="text-2xl">🔵</span> Your Score
              </span>
              <span className="text-3xl font-black text-blue-600">{player1.score}</span>
            </div>
            <div className="flex justify-between items-center bg-white rounded-xl p-4 shadow">
              <span className="text-lg font-black text-gray-700 flex items-center gap-2">
                <span className="text-2xl">🤖</span> Bot Score
              </span>
              <span className="text-3xl font-black text-red-600">{player2.score}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-3 border-2 border-yellow-400 text-center">
                <span className="text-xs font-bold text-gray-600">Total Turns</span>
                <p className="text-xl font-black text-gray-800">{turnCount}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 border-2 border-purple-400 text-center">
                <span className="text-xs font-bold text-gray-600">Difficulty</span>
                <p className="text-xl font-black text-gray-800">{difficulty.toUpperCase()}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setGameState('menu')}
            className="w-full bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 text-white font-black text-2xl py-5 rounded-2xl shadow-2xl hover:shadow-3xl hover:scale-105 transform transition-all duration-200 active:scale-95"
          >
            🔄 PLAY AGAIN 🔄
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 overflow-auto" style={{ aspectRatio: '9/16', maxHeight: '90vh', margin: '0 auto' }}>
      <div className="bg-white rounded-3xl shadow-2xl p-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-3 bg-gradient-to-r from-blue-50 to-red-50 rounded-2xl p-3 shadow-inner">
          <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full shadow-lg ${currentPlayer === 1 ? 'bg-gradient-to-br from-blue-400 to-blue-600 animate-pulse' : 'bg-gray-400'}`}></div>
            <div className="flex flex-col">
              <span className="text-xs font-black text-gray-700">YOU {player1.shield > 0 && '🛡️'}{player1.vulnerable && '💀'}</span>
              <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500" style={{ width: `${player1.hp}%` }}></div>
              </div>
              <span className="text-xs font-bold text-blue-600">{player1.hp}HP {player1.powerup > 0 && `⚡x${player1.powerup}`}</span>
            </div>
            <span className="text-base font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-full">{player1.score}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-black text-red-600 bg-red-100 px-2 py-1 rounded-full">{player2.score}</span>
            <div className="flex flex-col items-end">
              <span className="text-xs font-black text-gray-700">BOT {player2.shield > 0 && '🛡️'}{player2.vulnerable && '💀'}</span>
              <div className="w-20 h-2 bg-gray-300 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500" style={{ width: `${player2.hp}%` }}></div>
              </div>
              <span className="text-xs font-bold text-red-600">{player2.hp}HP {player2.powerup > 0 && `⚡x${player2.powerup}`}</span>
            </div>
            <div className={`w-5 h-5 rounded-full shadow-lg ${currentPlayer === 2 ? 'bg-gradient-to-br from-red-400 to-red-600 animate-pulse' : 'bg-gray-400'}`}></div>
          </div>
        </div>

        <div className="flex gap-2 mb-3">
          <div className={`flex-1 p-2 rounded-xl text-center font-black text-lg shadow-lg ${timeLeft > 30 ? 'bg-gradient-to-r from-green-400 to-blue-400 text-white' :
            timeLeft > 15 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
              'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse'
            }`}>
            ⏱️ {timeLeft}s
          </div>
          {combo > 1 && (
            <div className="flex-1 p-2 rounded-xl text-center font-black text-lg shadow-lg bg-gradient-to-r from-orange-400 to-red-500 text-white animate-bounce">
              🔥 {combo}x
            </div>
          )}
        </div>

        {shrinkLevel > 0 && (
          <div className="mb-3 p-2 rounded-xl text-center font-black text-sm bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse">
            ☠️ ZONE SHRINKING - LEVEL {shrinkLevel}! DANGER ZONES DEAL {shrinkLevel * 10} DMG! ☠️
          </div>
        )}

        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-3 mb-3 shadow-2xl">
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
            {Array.from({ length: gridSize }).map((_, y) =>
              Array.from({ length: gridSize }).map((_, x) => {
                const isP1 = player1.x === x && player1.y === y;
                const isP2 = player2.x === x && player2.y === y;
                const powerUp = powerUps.find(p => p.x === x && p.y === y);
                const attacker = player1;
                const canMove = selectedAction === 'move' && distance(attacker.x, attacker.y, x, y) === 1 && currentPlayer === 1;
                const canAttack = (selectedAction === 'attack' || selectedAction === 'power') && isP2 && distance(attacker.x, attacker.y, x, y) <= 2 && currentPlayer === 1;
                const inDeadZone = isInDeadZone(x, y);

                return (
                  <button
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    disabled={currentPlayer !== 1}
                    className={`aspect-square rounded-lg font-black text-2xl transition-all duration-200 ${isP1 ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50 scale-110' :
                      isP2 ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50 scale-110' :
                        canMove && !inDeadZone ? 'bg-gradient-to-br from-green-400 to-green-500 hover:from-green-300 hover:to-green-400 cursor-pointer shadow-md hover:scale-105' :
                          canMove && inDeadZone ? 'bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-400 hover:to-red-500 cursor-pointer shadow-md hover:scale-105 animate-pulse' :
                            canAttack ? 'bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-300 hover:to-red-400 cursor-pointer animate-pulse shadow-md hover:scale-105' :
                              inDeadZone ? 'bg-gradient-to-br from-red-900 to-black border border-red-500' :
                                'bg-gradient-to-br from-gray-700 to-gray-600'
                      }`}
                  >
                    {isP1 && '🔵'}
                    {isP2 && '🤖'}
                    {powerUp && !isP1 && !isP2 && (
                      <span className="animate-bounce">{powerUp.type === 'health' ? '💚' : '⚡'}</span>
                    )}
                    {inDeadZone && !isP1 && !isP2 && !powerUp && <span className="text-lg">☠️</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 rounded-2xl p-2 mb-3 shadow-lg border-2 border-purple-200">
          <p className="text-xs font-black text-center text-gray-800">{message}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          <button
            onClick={() => selectAction('move')}
            disabled={selectedAction === 'move' || currentPlayer !== 1}
            className={`py-3 rounded-xl font-black text-sm transition-all shadow-lg ${selectedAction === 'move'
              ? 'bg-gradient-to-br from-green-500 to-green-600 text-white scale-105'
              : currentPlayer === 1
                ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            🚶<br /><span className="text-xs">MOVE</span>
          </button>
          <button
            onClick={() => selectAction('attack')}
            disabled={selectedAction === 'attack' || currentPlayer !== 1}
            className={`py-3 rounded-xl font-black text-sm transition-all shadow-lg ${selectedAction === 'attack'
              ? 'bg-gradient-to-br from-red-500 to-red-600 text-white scale-105'
              : currentPlayer === 1
                ? 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            ⚔️<br /><span className="text-xs">ATTACK</span>
          </button>
          <button
            onClick={handleShield}
            disabled={currentPlayer !== 1 || shieldCooldown > 0}
            className={`py-3 rounded-xl font-black text-sm transition-all shadow-lg ${shieldCooldown > 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : currentPlayer === 1
                ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            🛡️<br /><span className="text-xs">{shieldCooldown > 0 ? `${shieldCooldown}s` : 'SHIELD'}</span>
          </button>
          <button
            onClick={() => selectAction('power')}
            disabled={selectedAction === 'power' || currentPlayer !== 1 || player1.powerup === 0}
            className={`py-3 rounded-xl font-black text-sm transition-all shadow-lg ${selectedAction === 'power'
              ? 'bg-gradient-to-br from-yellow-500 to-orange-600 text-white scale-105'
              : currentPlayer === 1 && player1.powerup > 0
                ? 'bg-gradient-to-br from-yellow-100 to-orange-200 text-orange-700 hover:scale-105 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            ⚡<br /><span className="text-xs">{player1.powerup > 0 ? `x${player1.powerup}` : 'POWER'}</span>
          </button>
        </div>

        <div className="text-center bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-2 shadow-inner">
          <span className="text-xs font-black text-gray-700">
            Turn {turnCount} • {currentPlayer === 1 ? '🔵 Your Turn' : '🤖 Bot\'s Turn'}
          </span>
        </div>
      </div>
    </div>
  );
};
