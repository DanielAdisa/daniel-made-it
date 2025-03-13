"use client";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function SpaceShooterGame() {
  // Game state
  const [playerPosition, setPlayerPosition] = useState(50); // Player position as percentage from left
  const playerPositionRef = useRef(50); // Ref to track latest player position for accurate shooting
  const [bullets, setBullets] = useState<{id: number, x: number, y: number}[]>([]); // Bullets array
  const [enemies, setEnemies] = useState<{id: number, x: number, y: number, type: number}[]>([]); // Enemies array
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [powerUpActive, setPowerUpActive] = useState(false);
  const [autoFire, setAutoFire] = useState(false);
  
  const nextBulletId = useRef(0);
  const nextEnemyId = useRef(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  // Keep playerPositionRef in sync with playerPosition state
  useEffect(() => {
    playerPositionRef.current = playerPosition;
  }, [playerPosition]);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setEnemies([]);
    setBullets([]);
    setPowerUpActive(false);
    setPlayerPosition(50);
    playerPositionRef.current = 50;
    setAutoFire(false);
  };

  // Update player position function - use this for all player movement
  const updatePlayerPosition = (newPosition: number) => {
    const clampedPosition = Math.max(0, Math.min(100, newPosition));
    setPlayerPosition(clampedPosition);
    playerPositionRef.current = clampedPosition;
  };

  // Shoot function
  const shoot = () => {
    const currentPlayerPosition = playerPositionRef.current; // Use ref for most up-to-date position
    const newBullets: { id: number, x: number, y: number }[] = [];
  
    if (powerUpActive) {
      newBullets.push({
        id: nextBulletId.current++,
        x: currentPlayerPosition - 2,
        y: 85,
      });
      newBullets.push({
        id: nextBulletId.current++,
        x: currentPlayerPosition + 2,
        y: 85,
      });
    } else {
      newBullets.push({
        id: nextBulletId.current++,
        x: currentPlayerPosition,
        y: 85,
      });
    }
  
    setBullets((prev) => [...prev, ...newBullets]);
  };
  
  // Auto firing functionality
  useEffect(() => {
    if (!gameStarted || gameOver || !autoFire) return;
    
    const fireInterval = setInterval(() => {
      shoot();
    }, 400); // Fire every 400ms when auto-fire is enabled
    
    return () => clearInterval(fireInterval);
  }, [gameStarted, gameOver, autoFire]);

  // Handle touch events for swipe functionality
  useEffect(() => {
    if (!gameStarted || gameOver || !gameAreaRef.current) return;
    
    const gameArea = gameAreaRef.current;
    
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX.current) return;
      
      const touchX = e.touches[0].clientX;
      const touchY = e.touches[0].clientY;
      
      // Calculate X distance moved as a percentage of game area width
      const gameAreaRect = gameArea.getBoundingClientRect();
      const deltaX = touchX - touchStartX.current;
      const deltaXPercent = (deltaX / gameAreaRect.width) * 100;
      
      // Update player position based on horizontal swipe
      updatePlayerPosition(playerPositionRef.current + deltaXPercent);
      
      // Reset touch start to current position for continuous movement
      touchStartX.current = touchX;
      touchStartY.current = touchY;
    };
    
    const handleTouchEnd = () => {
      touchStartX.current = 0;
      touchStartY.current = 0;
    };
    
    gameArea.addEventListener('touchstart', handleTouchStart);
    gameArea.addEventListener('touchmove', handleTouchMove);
    gameArea.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      gameArea.removeEventListener('touchstart', handleTouchStart);
      gameArea.removeEventListener('touchmove', handleTouchMove);
      gameArea.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gameStarted, gameOver]);
  
  // Handle keyboard events for moving player and shooting
  useEffect(() => {
    if (!gameStarted || gameOver) return;
  
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          updatePlayerPosition(playerPositionRef.current - 3);
          break;
        case 'ArrowRight':
          updatePlayerPosition(playerPositionRef.current + 3);
          break;
        case ' ': // Spacebar - shoot
          event.preventDefault();
          shoot();
          break;
        case 'a': // 'a' key - toggle auto-fire
          event.preventDefault();
          setAutoFire(prev => !prev);
          break;
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver]);

  // Generate enemy formations based on level
  const generateEnemyFormation = () => {
    const newEnemies = [];
    const formationType = level % 5; // 5 different formations that cycle
    
    switch (formationType) {
      case 0: // V formation
        for (let i = 0; i < 5; i++) {
          newEnemies.push({
            id: nextEnemyId.current++,
            x: 30 + i * 10,
            y: 5 + Math.abs(2 - i) * 5,
            type: i % 3
          });
        }
        break;
      case 1: // Line formation
        for (let i = 0; i < 6; i++) {
          newEnemies.push({
            id: nextEnemyId.current++,
            x: 25 + i * 10,
            y: 5,
            type: (i + level) % 3
          });
        }
        break;
      case 2: // Box formation
        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            newEnemies.push({
              id: nextEnemyId.current++,
              x: 35 + col * 15,
              y: 5 + row * 10,
              type: (col + row + level) % 3
            });
          }
        }
        break;
      case 3: // Diamond formation
        const positions = [
          {x: 50, y: 0}, 
          {x: 40, y: 10}, {x: 60, y: 10},
          {x: 50, y: 20}
        ];
        positions.forEach((pos, i) => {
          newEnemies.push({
            id: nextEnemyId.current++,
            x: pos.x,
            y: pos.y,
            type: (i + level) % 3
          });
        });
        break;
      case 4: // Random cluster
        for (let i = 0; i < 7; i++) {
          newEnemies.push({
            id: nextEnemyId.current++,
            x: 30 + Math.random() * 40,
            y: Math.random() * 15,
            type: Math.floor(Math.random() * 3)
          });
        }
        break;
    }
    
    // Add boss enemy every 5 levels
    if (level % 5 === 0) {
      newEnemies.push({
        id: nextEnemyId.current++,
        x: 50,
        y: 10,
        type: 2 // Use type 2 for boss appearance
      });
    }
    
    return newEnemies;
  };

  // Create new enemies at intervals
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    // Add formation at the beginning of each level
    if (enemies.length === 0) {
      setEnemies(generateEnemyFormation());
    }

    const enemyInterval = setInterval(() => {
      // Random chance to spawn single enemies
      if (Math.random() > 0.7 && enemies.length < 10 + level) { // Limit total enemies
        const newEnemy = {
          id: nextEnemyId.current++,
          x: Math.random() * 100, // Random position
          y: 0, // Start at the top
          type: Math.floor(Math.random() * 3) // Random enemy type (0-2)
        };
        setEnemies((prev) => [...prev, newEnemy]);
      }
      
      // Random chance for power-up
      if (Math.random() > 0.95 && !powerUpActive) {
        setPowerUpActive(true);
        
        // Power-up lasts for 10 seconds
        setTimeout(() => {
          setPowerUpActive(false);
        }, 10000);
      }
    }, 1500 / Math.sqrt(level)); // Spawn rate increases with level

    return () => clearInterval(enemyInterval);
  }, [gameStarted, gameOver, level, enemies.length, powerUpActive]);

  // Game loop - update positions and check collisions
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Move bullets up
      setBullets((prev) => 
        prev
          .map((bullet) => ({...bullet, y: bullet.y - 2}))
          .filter((bullet) => bullet.y > 0)
      );

      // Move enemies down - REDUCED SPEED HERE
      setEnemies((prev) => {
        const newEnemies = prev
          .map((enemy) => ({...enemy, y: enemy.y + 0.2 * (1 + level * 0.05)}))
          .filter((enemy) => enemy.y < 100);
          
        // Check for game over (enemy reached bottom)
        if (newEnemies.some((enemy) => enemy.y > 90)) {
          setGameOver(true);
        }
        
        return newEnemies;
      });

      // Check collisions
      setBullets((prevBullets) => {
        let updatedBullets = [...prevBullets];
        
        setEnemies((prevEnemies) => {
          let updatedEnemies = [...prevEnemies];
          let scoreIncrease = 0;
          
          // Check each bullet against each enemy
          updatedBullets = updatedBullets.filter(bullet => {
            let bulletHit = false;
            
            updatedEnemies = updatedEnemies.filter(enemy => {
              // Simple collision detection
              const collision = 
                Math.abs(bullet.x - enemy.x) < 8 && 
                Math.abs(bullet.y - enemy.y) < 8;
                
              if (collision) {
                scoreIncrease += 10 * (enemy.type + 1);
                bulletHit = true;
                return false; // Remove enemy
              }
              return true;
            });
            
            return !bulletHit; // Keep bullet if it didn't hit
          });
          
          if (scoreIncrease > 0) {
            setScore(prev => {
              const newScore = prev + scoreIncrease;
              // Level up every 300 points
              if (Math.floor(newScore / 300) > Math.floor(prev / 300)) {
                setLevel(lvl => lvl + 1);
              }
              return newScore;
            });
          }
          
          // If all enemies are destroyed, add new formation in the next cycle
          return updatedEnemies;
        });
        
        return updatedBullets;
      });
    }, 16); // ~60fps

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, level]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 bg-[url('/images/stars-bg.png')] p-4">
      <div className="mb-4 flex justify-between items-center w-full max-w-lg px-4 bg-black bg-opacity-60 rounded-lg py-2 backdrop-blur-sm">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Space Impact</h1>
        <div className="flex gap-6">
          <div className="text-white px-3 py-1 bg-purple-900 bg-opacity-70 rounded-md">Level: {level}</div>
          <div className="text-white px-3 py-1 bg-blue-900 bg-opacity-70 rounded-md">Score: {score}</div>
        </div>
      </div>

      <div 
        ref={gameAreaRef}
        className="relative w-full max-w-lg h-[600px] bg-slate-900 border-2 border-purple-600 overflow-hidden rounded-lg shadow-[0_0_15px_rgba(147,51,234,0.5)] bg-[url('/images/space-bg.jpg')] bg-cover touch-none"
      >
        {/* Dynamic stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 100 }).map((_, i) => (
            <div 
              key={i}
              className="absolute w-[2px] h-[2px] bg-white rounded-full animate-pulse"
              style={{ 
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: Math.random() * 0.8 + 0.2,
              }}
            ></div>
          ))}
        </div>
        
        {/* HUD overlay at the top */}
        <div className="absolute top-0 left-0 right-0 h-8 flex justify-between items-center px-4 bg-black bg-opacity-40 z-10">
          <div className="flex items-center gap-2">
            {powerUpActive && (
              <div className="text-yellow-300 text-sm font-bold animate-pulse">
                POWER UP ACTIVE!
              </div>
            )}
            {autoFire && (
              <div className="text-green-300 text-sm font-bold ml-4">
                AUTO-FIRE: ON
              </div>
            )}
          </div>
          <div className="text-xs text-white opacity-70">
            Swipe to move • Tap to shoot
          </div>
        </div>
        
        {!gameStarted || gameOver ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10 backdrop-blur-sm">
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
              {gameOver ? 'Game Over' : 'Space Impact'}
            </h2>
            <p className="text-white mb-2 text-center max-w-xs">
              {gameOver ? `Final Score: ${score}` : 'Use arrow keys to move and spacebar to shoot'}
            </p>
            <p className="text-white mb-6 text-center max-w-xs text-sm opacity-80">
              {gameOver ? '' : 'On mobile: Swipe to move, tap to shoot, press "A" to toggle auto-fire'}
            </p>
            <button
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition shadow-lg transform hover:scale-105 active:scale-95"
              onClick={startGame}
            >
              {gameOver ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        ) : null}

        {/* Player ship with engine glow - using Framer Motion for smooth animations */}
        <motion.div 
          className="absolute bottom-2 w-10 h-10" 
          style={{ left: `calc(${playerPosition}% - 20px)` }}
          animate={{ left: `calc(${playerPosition}% - 20px)` }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-b-[30px] border-l-transparent border-r-transparent border-b-blue-500 mx-auto relative">
            {/* Engine glow */}
            <motion.div 
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-5 h-6 bg-blue-400 rounded-full blur-sm opacity-70"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.8, 1.1, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            ></motion.div>
          </div>
          <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-4 h-1 bg-yellow-300"></div>
          <div className="absolute top-[70%] left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full"></div>
          
          {/* Power-up indicator */}
          {powerUpActive && (
            <motion.div 
              className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-yellow-400 opacity-70"
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0.3, 0.7] }}
              transition={{ duration: 1, repeat: Infinity }}
            ></motion.div>
          )}
        </motion.div>

        {/* Bullets with glow effect - using Framer Motion */}
        {bullets.map((bullet) => (
          <motion.div
            key={bullet.id}
            className="absolute w-2 h-6 bg-yellow-400 rounded-full"
            initial={{ bottom: `${(100 - bullet.y)}%`, left: `calc(${bullet.x}% - 1px)` }}
            animate={{ bottom: `${(100 - bullet.y)}%`, left: `calc(${bullet.x}% - 1px)` }}
            transition={{ type: "tween", duration: 0.1 }}
          >
            <motion.div 
              className="absolute inset-0 bg-white blur-sm rounded-full"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            ></motion.div>
          </motion.div>
        ))}

        {/* Enemies - using Framer Motion */}
        {enemies.map((enemy) => (
          <motion.div
            key={enemy.id}
            className="absolute w-12 h-12"
            initial={{ top: `${enemy.y}%`, left: `calc(${enemy.x}% - 18px)` }}
            animate={{ top: `${enemy.y}%`, left: `calc(${enemy.x}% - 18px)` }}
            transition={{ type: "tween", duration: 0.1 }}
            onClick={shoot} // Allow tapping on enemies to shoot
          >
            {enemy.type === 0 && (
              <div className="w-10 h-5 bg-gradient-to-b from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto shadow-[0_0_5px_rgba(239,68,68,0.7)]">
                <div className="w-6 h-3 bg-red-700 rounded-full"></div>
                <div className="absolute -bottom-1 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-red-500 mx-auto"></div>
              </div>
            )}
            {enemy.type === 1 && (
              <div className="w-12 h-6 bg-gradient-to-b from-green-400 to-green-600 rounded-md flex items-center justify-center shadow-[0_0_5px_rgba(34,197,94,0.7)]">
                <div className="w-8 h-3 bg-green-700 rounded-sm"></div>
                <div className="absolute -bottom-2 left-1 w-2 h-4 bg-green-500 rounded-b-md"></div>
                <div className="absolute -bottom-2 right-1 w-2 h-4 bg-green-500 rounded-b-md"></div>
              </div>
            )}
            {enemy.type === 2 && (
              <div className="w-12 h-8 bg-gradient-to-b from-purple-500 to-purple-700 rounded-t-full flex items-center justify-center shadow-[0_0_5px_rgba(168,85,247,0.7)]">
                <div className="w-6 h-3 bg-yellow-400"></div>
                <div className="absolute -bottom-1 left-2 w-8 h-2 bg-purple-600"></div>
                <div className="absolute -bottom-3 left-3 w-6 h-2 bg-purple-600"></div>
                {/* Glow effect for boss enemies */}
                {level % 5 === 0 && enemy.y < 15 && (
                  <div className="absolute inset-0 border-2 border-yellow-300 rounded-t-full animate-ping opacity-50"></div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {gameStarted && !gameOver && (
        <div className="mt-4 flex justify-between w-full max-w-lg px-4">
          <button 
            className="px-8 py-4 bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-full hover:from-blue-800 hover:to-blue-600 transition active:from-blue-900 active:to-blue-700 text-xl shadow-lg"
            onTouchStart={() => updatePlayerPosition(playerPositionRef.current - 5)}
            onClick={() => updatePlayerPosition(playerPositionRef.current - 5)}
          >
            ←
          </button>
          <button 
            className={`px-6 py-3 text-white rounded-full transition text-lg shadow-lg ${
              autoFire 
                ? "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 active:from-green-800 active:to-green-700" 
                : "bg-gradient-to-r from-yellow-600 to-red-500 hover:from-yellow-700 hover:to-red-600 active:from-yellow-800 active:to-red-700"
            }`}
            onTouchStart={() => setAutoFire(prev => !prev)}
            onClick={() => setAutoFire(prev => !prev)}
          >
            {autoFire ? "Auto: ON" : "Auto: OFF"}
          </button>
          <button 
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full hover:from-blue-600 hover:to-blue-800 transition active:from-blue-700 active:to-blue-900 text-xl shadow-lg"
            onTouchStart={() => updatePlayerPosition(playerPositionRef.current + 5)}
            onClick={() => updatePlayerPosition(playerPositionRef.current + 5)}
          >
            →
          </button>
        </div>
      )}
    </main>
  );
}
