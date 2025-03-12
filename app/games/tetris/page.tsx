"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInterval } from '@/hooks/useInterval';
import { motion } from 'framer-motion';

// Tetris piece shapes
type TetrominoKey = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z' | '0';

// Change brick color to deep red
const BRICK_COLOR = 'rgb(178, 34, 34)'; // Deep red brick color (FireBrick)

const TETROMINOS: { [key in TetrominoKey]: { shape: (string | number)[][], color: string } } = {
  0: { shape: [[0]], color: '0, 0, 0' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0]
    ],
    color: BRICK_COLOR,
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0]
    ],
    color: BRICK_COLOR,
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L']
    ],
    color: BRICK_COLOR,
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O']
    ],
    color: BRICK_COLOR,
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0]
    ],
    color: BRICK_COLOR,
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0]
    ],
    color: BRICK_COLOR,
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0]
    ],
    color: BRICK_COLOR,
  },
};

const tetrominos: TetrominoKey[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
const randomTetromino = () => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)];
  return TETROMINOS[randTetromino as TetrominoKey];
};

// Create the game board
const createStage = (height = 20, width = 10) =>
  Array.from(Array(height), () => Array(width).fill([0, 'clear']));

// Check if collision would occur
interface Player {
  pos: { x: number; y: number };
  tetromino: (string | number)[][];
  collided: boolean;
}

interface StageCell {
  0: number | string;
  1: string;
}

interface Move {
  x: number;
  y: number;
}

const checkCollision = (player: Player, stage: StageCell[][], { x: moveX, y: moveY }: Move): boolean => {
  for (let y = 0; y < player.tetromino.length; y++) {
    for (let x = 0; x < player.tetromino[0].length; x++) {
      // Check if we're on a tetromino cell
      if (player.tetromino[y][x] !== 0) {
        if (
          // Check if move is within game area height (y)
          !stage[y + player.pos.y + moveY] ||
          // Check if move is within game area width (x)
          !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
          // Check if the cell we're moving to isn't clear
          stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
        ) {
          return true;
        }
      }
    }
  }
  return false;
};

const TetrisGame = () => {
  const [stage, setStage] = useState(createStage());
  const [player, setPlayer] = useState({
    pos: { x: 0, y: 0 },
    tetromino: TETROMINOS[0].shape,
    collided: false,
  });
  const [dropTime, setDropTime] = useState<number | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [rows, setRows] = useState(0);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [isRotating, setIsRotating] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number, y: number } | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [gameSpeed, setGameSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');
  const [isShaking, setIsShaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [savedDropTime, setSavedDropTime] = useState<number | null>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Get drop time based on level and selected game speed
  const calculateDropTime = useCallback(() => {
    const baseSpeed = 1000; // Base speed in ms
    const speedMultipliers = {
      slow: 1.5,
      medium: 1.0,
      fast: 0.6
    };
    
    return (baseSpeed / (level)) * speedMultipliers[gameSpeed] + 200;
  }, [level, gameSpeed]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    if (!gameOver) {
      if (isPaused) {
        // Resume the game - Important: Use the saved drop time
        setDropTime(savedDropTime || calculateDropTime());
        setIsPaused(false);
      } else {
        // Pause the game
        setSavedDropTime(dropTime);
        setDropTime(null);
        setIsPaused(true);
      }
    }
  }, [gameOver, isPaused, dropTime, savedDropTime, calculateDropTime]);

  // Reset everything
  const startGame = () => {
    setStage(createStage());
    const newDropTime = calculateDropTime();
    setDropTime(newDropTime);
    setSavedDropTime(newDropTime); // Also save initial drop time
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setRows(0);
    setRotationDegree(0);
    setIsRotating(false);
    setIsPaused(false);
  };

  // Update the stage
  interface Stage extends Array<Array<StageCell>> { }

  const updateStage = useCallback((prevStage: Stage): Stage => {
    // First clear the stage from previous render
    const newStage: Stage = prevStage.map(row =>
      row.map(cell => (cell[1] === 'clear' ? [0, 'clear'] : cell) as StageCell)
    );

    // Draw the tetromino
    player.tetromino.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value !== 0) {
          newStage[y + player.pos.y][x + player.pos.x] = [
            value,
            `${player.collided ? 'merged' : 'clear'}`,
          ];
        }
      });
    });

    // Check if we collided
    if (player.collided) {
      resetPlayer();
      return sweepRows(newStage);
    }

    return newStage;
  }, [player]);

  // Reset player position
  const resetPlayer = useCallback(() => {
    setPlayer({
      pos: { x: 4, y: 0 },
      tetromino: randomTetromino().shape,
      collided: false,
    });
  }, []);

  // Rotate a tetromino
  interface Matrix extends Array<Array<string | number>> { }

  const rotate = (matrix: Matrix, dir: number): Matrix => {
    // Make the rows become columns (transpose)
    const rotatedTetro: Matrix = matrix.map((_, index) =>
      matrix.map(col => col[index])
    );
    // Reverse each row to get a rotated matrix
    if (dir > 0) return rotatedTetro.map(row => row.reverse());
    return rotatedTetro.reverse();
  };

  // Rotate player tetromino
  interface PlayerRotate {
    (stage: Stage, dir: number): void;
  }

  const playerRotate: PlayerRotate = (stage, dir) => {
    const clonedPlayer = JSON.parse(JSON.stringify(player));
    clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);

    // Check collision on rotation
    const pos = clonedPlayer.pos.x;
    let offset = 1;
    while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
      clonedPlayer.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedPlayer.tetromino[0].length) {
        // If still colliding, rotate back
        rotate(clonedPlayer.tetromino, -dir);
        clonedPlayer.pos.x = pos;
        return;
      }
    }

    setPlayer(clonedPlayer);
  };

  // Handle player movement
  interface MovePlayer {
    (dir: number): void;
  }

  const movePlayer: MovePlayer = (dir) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x + dir, y: prev.pos.y },
      }));
    }
  };

  // Handle dropping
  const drop = () => {
    // Increase level when player has cleared 10 rows
    if (rows > (level * 10)) {
      setLevel(prev => prev + 1);
      // Also increase speed
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(player, stage, { x: 0, y: 1 })) {
      setPlayer(prev => ({
        ...prev,
        pos: { x: prev.pos.x, y: prev.pos.y + 1 },
        collided: false,
      }));
    } else {
      // Game Over
      if (player.pos.y < 1) {
        console.log("GAME OVER!");
        setGameOver(true);
        setDropTime(null);
        
        // Trigger shake on game over
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      } else if (checkCollision(player, stage, { x: 0, y: 2 })) {
        // Only shake when landing on bottom or another piece at the bottom
        // (not on every side collision)
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      }
      
      setPlayer(prev => ({
        ...prev,
        collided: true,
      }));
    }
  };

  // Handle hard drop
  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  // Handle key presses with inverted controls based on rotation
  const move = useCallback((e: KeyboardEvent) => {
    if (gameOver || isRotating || isPaused) return; // Don't allow moves while paused
    
    // Prevent the default behavior to stop scrolling
    if([32, 37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault();
    }
    
    // Determine if controls should be inverted based on rotation
    const isInverted = (rotationDegree === 180);

    if (e.keyCode === 37) { // Left arrow
      movePlayer(isInverted ? 1 : -1);
    } else if (e.keyCode === 39) { // Right arrow
      movePlayer(isInverted ? -1 : 1);
    } else if (e.keyCode === 40) { // Down arrow
      dropPlayer();
    } else if (e.keyCode === 38) { // Up arrow
      playerRotate(stage, 1);
    } else if (e.keyCode === 32) { // Space bar - toggle pause
      togglePause();
    }
  }, [gameOver, isRotating, isPaused, rotationDegree, stage, togglePause]);

  // Handle key release
  const keyUp = useCallback((e: KeyboardEvent) => {
    if (!gameOver && !isPaused) {
      if (e.keyCode === 40) {
        setDropTime(calculateDropTime());
      }
    }
  }, [gameOver, isPaused, calculateDropTime]);

  // Prevent default touchmove behavior to disable page refresh on swipe down
  useEffect(() => {
    const handleTouchMoveGlobal = (e: TouchEvent) => {
      if (gameAreaRef.current && gameAreaRef.current.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
    
    return () => {
      document.removeEventListener('touchmove', handleTouchMoveGlobal);
    };
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gameOver && !isPaused) {
      const touchPoint = e.touches[0];
      setTouchStart({
        x: touchPoint.clientX,
        y: touchPoint.clientY
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!gameOver && touchStart) {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const diffX = touchEndX - touchStart.x;
      const diffY = touchEndY - touchStart.y;

      const isInverted = (rotationDegree === 180);

      // Require minimum movement to count as swipe
      const minSwipeDistance = 30;

      // Horizontal swipe is stronger
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > minSwipeDistance) {
        if (diffX > 0) { // Right swipe
          movePlayer(isInverted ? -1 : 1);
        } else { // Left swipe
          movePlayer(isInverted ? 1 : -1);
        }
      }
      // Vertical swipe is stronger
      else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > minSwipeDistance) {
        if (diffY > 0) { // Down swipe
          dropPlayer();
          // Reset drop time after swipe down to ensure the piece keeps falling
          setDropTime(calculateDropTime());
        } else { // Up swipe
          playerRotate(stage, 1);
        }
      } else {
        // Tap detection for rotation
        if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
          playerRotate(stage, 1);
        }
      }

      setTouchStart(null);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Sweep completed rows
  interface SweepRows {
    (newStage: Stage): Stage;
  }

  const sweepRows: SweepRows = (newStage) => {
    let rowsCleared = 0;
    const stage: Stage = newStage.reduce((acc: Stage, row: StageCell[]) => {
      // If no empty cells, it's full and should be cleared
      if (row.findIndex(cell => cell[0] === 0) === -1) {
        rowsCleared += 1;
        // Add empty row at the top
        acc.unshift(new Array(newStage[0].length).fill([0, 'clear']));
        return acc;
      }
      acc.push(row);
      return acc;
    }, [] as Stage);

    if (rowsCleared > 0) {
      // Calculate score
      setRows(prev => prev + rowsCleared);
      setScore(prev => prev + (rowsCleared * 100) * level);

      // Rotate the game area when rows are cleared
      setIsRotating(true);
      setRotationDegree(prev => (prev + 180) % 360);

      // Reset rotation flag after animation
      setTimeout(() => {
        setIsRotating(false);
      }, 1000);
    }

    return stage;
  };

  // Use custom interval hook
  useInterval(() => {
    drop();
  }, dropTime);

  // Update stage when player or stage changes
  useEffect(() => {
    if (!gameOver) {
      setStage(prev => updateStage(prev));
    }
  }, [updateStage, gameOver]);

  // Set up event listeners with proper dependencies
  useEffect(() => {
    window.addEventListener('keydown', move);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', move);
      window.removeEventListener('keyup', keyUp);
    };
  }, [move, keyUp]);

  // Reset drop time when game speed changes
  useEffect(() => {
    if (dropTime !== null) {
      setDropTime(calculateDropTime());
    }
  }, [gameSpeed, calculateDropTime]);

  // Framer motion variants for shake animation
  const shakeVariants = {
    shaking: {
      x: [0, -5, 5, -3, 3, 0],
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      }
    },
    idle: {
      x: 0,
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 py-4 px-2 overflow-hidden">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Tetris with a Twist</h1>

      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-4">
        {/* Game Controls Panel */}
        <div className="w-full md:w-1/3 bg-gray-800 p-4 rounded-lg mb-4 md:mb-0 order-1 md:order-1">
          <div className="grid grid-cols-3 gap-2 text-center text-white mb-4">
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-sm">Score</div>
              <div className="text-xl font-bold">{score}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-sm">Level</div>
              <div className="text-xl font-bold">{level}</div>
            </div>
            <div className="bg-gray-700 p-2 rounded">
              <div className="text-sm">Rows</div>
              <div className="text-xl font-bold">{rows}</div>
            </div>
          </div>
          
          {gameOver && (
            <div className="bg-red-900 text-white p-3 rounded-lg mb-4 text-center">
              <h2 className="font-bold text-xl">Game Over!</h2>
              <p>Final Score: {score}</p>
            </div>
          )}
          
          {/* Game Speed Selection */}
          <div className="mb-4">
            <label className="block text-white text-sm mb-2">Game Speed:</label>
            <div className="flex gap-2">
              <button 
                className={`flex-1 py-1 px-2 rounded text-white text-sm ${gameSpeed === 'slow' ? 'bg-green-600' : 'bg-gray-600'}`}
                onClick={() => setGameSpeed('slow')}
              >
                Slow
              </button>
              <button 
                className={`flex-1 py-1 px-2 rounded text-white text-sm ${gameSpeed === 'medium' ? 'bg-blue-600' : 'bg-gray-600'}`}
                onClick={() => setGameSpeed('medium')}
              >
                Medium
              </button>
              <button 
                className={`flex-1 py-1 px-2 rounded text-white text-sm ${gameSpeed === 'fast' ? 'bg-red-600' : 'bg-gray-600'}`}
                onClick={() => setGameSpeed('fast')}
              >
                Fast
              </button>
            </div>
          </div>
          
          <div className="flex gap-2 mb-2">
            <button 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded focus:outline-none transition"
              onClick={startGame}
            >
              {gameOver ? 'Restart Game' : 'Start Game'}
            </button>
            
            <button 
              className={`flex-1 ${isPaused ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'} text-white py-2 px-4 rounded focus:outline-none transition`}
              onClick={togglePause}
              disabled={gameOver || dropTime === null}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
          </div>
          
          <button 
            className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded focus:outline-none transition mb-2"
            onClick={toggleControls}
          >
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </button>
          
          {rotationDegree === 180 && (
            <div className="mt-3 bg-yellow-800 text-yellow-100 p-2 rounded text-center text-sm">
              <p>⚠️ Controls have reversed due to rotation</p>
            </div>
          )}
          
          {showControls && (
            <div className="mt-4 bg-gray-700 p-3 rounded-lg text-white text-sm">
              <h3 className="font-bold mb-2">Controls:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="bg-gray-600 px-2 py-1 rounded">←→</span>
                  <span>Move</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-gray-600 px-2 py-1 rounded">↑</span>
                  <span>Rotate</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-gray-600 px-2 py-1 rounded">↓</span>
                  <span>Drop</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-gray-600 px-2 py-1 rounded">Space</span>
                  <span>Pause</span>
                </div>
                
                <h4 className="font-bold mt-2">Mobile:</h4>
                <div className="flex justify-between">
                  <span className="bg-gray-600 px-2 py-1 rounded text-xs">Swipe Left/Right</span>
                  <span>Move</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-gray-600 px-2 py-1 rounded text-xs">Swipe Up</span>
                  <span>Rotate</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-gray-600 px-2 py-1 rounded text-xs">Swipe Down</span>
                  <span>Drop</span>
                </div>
                <div className="flex justify-between">
                  <span className="bg-gray-600 px-2 py-1 rounded text-xs">Tap</span>
                  <span>Rotate</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Area - Fixed sizing for better visibility */}
        <motion.div 
          ref={gameAreaRef}
          className="relative border-4 border-gray-700 bg-black/50 order-2 md:order-2 transition-transform w-[280px] sm:w-[320px] md:w-[300px] lg:w-[380px] h-[560px] sm:h-[640px] md:h-[600px] lg:h-[760px]"
          variants={shakeVariants}
          animate={isShaking ? "shaking" : {
            rotate: rotationDegree,
            x: 0,
            transition: {
              duration: isRotating ? 1 : 0,
              ease: "easeInOut"
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="grid grid-rows-20 h-full w-full">
            {stage.map((row, y) => (
              <div key={y} className="flex h-full">
                {row.map((cell, x) => {
                  const isFilled = cell[0] !== 0;
                  
                  return (
                    <div
                      key={x}
                      className={`
                        aspect-square h-full
                        ${isFilled 
                          ? `bg-[firebrick] border border-opacity-20 border-rose-800` 
                          : 'border border-opacity-20 border-gray-500'}
                      `}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
              <div className="text-white text-center">
                <h2 className="text-2xl font-bold mb-2">PAUSED</h2>
                <p className="mb-4">Press Space or tap Resume to continue</p>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded focus:outline-none transition"
                  onClick={togglePause}
                >
                  Resume Game
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default function TetrisPage() {
  return (
    <div className="h-fit max-h-fit overflow-hidden">
      <TetrisGame />
    </div>
  );
}
