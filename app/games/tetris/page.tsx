"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInterval } from '@/hooks/useInterval';
import { motion } from 'framer-motion';

// Tetris piece shapes
type TetrominoKey = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z' | '0';

// Define Tailwind color classes for each tetromino
const TETROMINOS: { [key in TetrominoKey]: { shape: (string | number)[][], color: string, bgClass: string } } = {
  0: { shape: [[0]], color: '0, 0, 0', bgClass: 'bg-transparent' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0]
    ],
    color: '0, 255, 255', // Cyan
    bgClass: 'bg-cyan-500',
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0]
    ],
    color: '0, 0, 255', // Blue
    bgClass: 'bg-blue-600',
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L']
    ],
    color: '255, 165, 0', // Orange
    bgClass: 'bg-orange-500',
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O']
    ],
    color: '255, 255, 0', // Yellow
    bgClass: 'bg-yellow-400',
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0]
    ],
    color: '0, 255, 0', // Green
    bgClass: 'bg-green-500',
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0]
    ],
    color: '128, 0, 128', // Purple
    bgClass: 'bg-purple-600',
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0]
    ],
    color: '255, 0, 0', // Red
    bgClass: 'bg-red-500',
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
  
  // Audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement>(null);
  const clearRowSoundRef = useRef<HTMLAudioElement>(null);
  const landingSoundRef = useRef<HTMLAudioElement>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement>(null);

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Function to play sounds
  const playSound = useCallback((audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => console.log("Audio play error:", error));
    }
  }, []);

  // Get drop time based on level and selected game speed
  const calculateDropTime = useCallback(() => {
    const baseSpeed = 750; // Reduced from 1000 to make game faster
    const speedMultipliers = {
      slow: 1.2,    // Faster than before (was 1.5)
      medium: 0.8,  // Faster than before (was 1.0)
      fast: 0.4     // Faster than before (was 0.6)
    };
    
    return (baseSpeed / (level)) * speedMultipliers[gameSpeed] + 150; // Reduced from 200
  }, [level, gameSpeed]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    if (!gameOver) {
      if (isPaused) {
        // Resume the game - Important: Use the saved drop time
        setDropTime(savedDropTime || calculateDropTime());
        setIsPaused(false);
        
        // Resume background music
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.play().catch(e => console.log(e));
        }
      } else {
        // Pause the game
        setSavedDropTime(dropTime);
        setDropTime(null);
        setIsPaused(true);
        
        // Pause background music
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
        }
      }
    }
  }, [gameOver, isPaused, dropTime, savedDropTime, calculateDropTime]);

  // Reset everything
  const startGame = () => {
    setStage(createStage());
    const newDropTime = calculateDropTime();
    setDropTime(newDropTime);
    setSavedDropTime(newDropTime); // Also save initial drop time
    
    // Initialize player at a specific position rather than resetting
    const randomTetro = randomTetromino();
    const tetroType = Object.keys(TETROMINOS).find(
      key => TETROMINOS[key as TetrominoKey].shape === randomTetro.shape
    ) as TetrominoKey;
    
    setCurrentTetrominoType(tetroType);
    setPlayer({
      pos: { x: 4, y: 0 },
      tetromino: randomTetro.shape,
      collided: false,
    });
    
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setRows(0);
    setRotationDegree(0);
    setIsRotating(false);
    setIsPaused(false);
    
    // Start background music
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.currentTime = 0;
      backgroundMusicRef.current.play().catch(e => console.log(e));
    }
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

  // Reset player position - Fix collision issues by ensuring proper positioning
  const resetPlayer = useCallback(() => {
    const randomTetro = randomTetromino();
    // Find the tetromino key by comparing shapes
    const tetroType = Object.keys(TETROMINOS).find(
      key => TETROMINOS[key as TetrominoKey].shape === randomTetro.shape
    ) as TetrominoKey;
    
    setCurrentTetrominoType(tetroType);
    
    // Set player with fixed starting position
    setPlayer({
      pos: { x: 4, y: 0 },
      tetromino: randomTetro.shape,
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
        
        // Play game over sound and stop music
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
        }
        playSound(gameOverSoundRef);
        
        // Trigger shake on game over
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 300);
      } else if (checkCollision(player, stage, { x: 0, y: 2 })) {
        // Play landing sound when landing on bottom or another piece
        playSound(landingSoundRef);
        
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
    
    // Restore rotation logic
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

      // Restore rotation logic
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

      // Play row clear sound
      playSound(clearRowSoundRef);

      // Restore rotation logic
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

  // Handle audio setup
  useEffect(() => {
    // Start background music when game starts (not on component mount)
    return () => {
      // Cleanup function - stop all audio when component unmounts
      if (backgroundMusicRef.current) backgroundMusicRef.current.pause();
      if (clearRowSoundRef.current) clearRowSoundRef.current.pause();
      if (landingSoundRef.current) landingSoundRef.current.pause();
      if (gameOverSoundRef.current) gameOverSoundRef.current.pause();
    };
  }, []);

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

  // We need to track the current tetromino type to apply correct color
  const [currentTetrominoType, setCurrentTetrominoType] = useState<TetrominoKey>('0');

  // Helper function to get the tetromino type from its value
  const getTetrominoType = (value: string | number): TetrominoKey => {
    if (value === 0) return '0';
    return value as TetrominoKey;
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-black py-4 px-3 overflow-hidden bg-[url('/retro-grid-bg.png')] bg-repeat">
      {/* Audio elements */}
      <audio ref={backgroundMusicRef} loop preload="auto">
        <source src="/audio/tetris-theme.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={clearRowSoundRef} preload="auto">
        <source src="/audio/clear-row.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={landingSoundRef} preload="auto">
        <source src="/audio/block-land.mp3" type="audio/mpeg" />
      </audio>
      <audio ref={gameOverSoundRef} preload="auto">
        <source src="/audio/game-over.mp3" type="audio/mpeg" />
      </audio>
      
      {/* Retro Header */}
      <h1 className="text-4xl md:text-5xl font-bold mb-2 text-center tracking-widest uppercase">
        <span className="text-red-500 animate-pulse inline-block">T</span>
        <span className="text-blue-500 inline-block">E</span>
        <span className="text-green-500 inline-block">T</span>
        <span className="text-yellow-500 inline-block">R</span>
        <span className="text-purple-500 inline-block">I</span>
        <span className="text-red-500 animate-pulse inline-block">S</span>
      </h1>
      
      {/* Quick controls tip banner */}
      <div className="w-full max-w-3xl mb-4 bg-red-600 text-white text-center py-1 px-2 text-sm border-t-2 border-b-2 border-yellow-400 shadow-lg">
        <p>⬅️➡️: Move | ⬆️: Rotate | ⬇️: Drop | Space: Pause | Swipe/Tap to control on mobile</p>
      </div>
      
      {/* Main Game Layout */}
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-6xl gap-4">
        {/* Game Panel & Controls - Now Positioned Before Game Area */}
        <div className="w-full md:w-1/3 bg-gray-900 p-4 rounded-lg order-1 border-4 border-cyan-500 shadow-[0_0_10px_#0ff]">
          {/* Game Status Panel */}
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div className="bg-black p-3 rounded border-2 border-green-500">
              <div className="text-sm font-bold text-green-300">SCORE</div>
              <div className="text-2xl font-mono text-green-400">{score}</div>
            </div>
            <div className="bg-black p-3 rounded border-2 border-yellow-500">
              <div className="text-sm font-bold text-yellow-300">LEVEL</div>
              <div className="text-2xl font-mono text-yellow-400">{level}</div>
            </div>
            <div className="bg-black p-3 rounded border-2 border-blue-500">
              <div className="text-sm font-bold text-blue-300">ROWS</div>
              <div className="text-2xl font-mono text-blue-400">{rows}</div>
            </div>
          </div>

          {/* Game Over Message */}
          {gameOver && (
            <div className="bg-red-900 text-white p-4 rounded mb-4 text-center border-2 border-red-600 animate-pulse">
              <h2 className="font-bold text-2xl mb-1 text-red-100">GAME OVER!</h2>
              <p className="text-lg font-mono">Final Score: {score}</p>
            </div>
          )}
          
          {/* Game Speed Selection */}
          <div className="mb-3">
            <label className="block text-white font-bold mb-2 text-shadow-md">GAME SPEED:</label>
            <div className="flex gap-2">
              <button 
                className={`flex-1 py-2 px-3 rounded font-bold text-white transition-all ${gameSpeed === 'slow' ? 'bg-green-600 border-2 border-white' : 'bg-green-900 hover:bg-green-700'}`}
                onClick={() => setGameSpeed('slow')}
              >
                SLOW
              </button>
              <button 
                className={`flex-1 py-2 px-3 rounded font-bold text-white transition-all ${gameSpeed === 'medium' ? 'bg-blue-600 border-2 border-white' : 'bg-blue-900 hover:bg-blue-700'}`}
                onClick={() => setGameSpeed('medium')}
              >
                MEDIUM
              </button>
              <button 
                className={`flex-1 py-2 px-3 rounded font-bold text-white transition-all ${gameSpeed === 'fast' ? 'bg-red-600 border-2 border-white' : 'bg-red-900 hover:bg-red-700'}`}
                onClick={() => setGameSpeed('fast')}
              >
                FAST
              </button>
            </div>
          </div>
          
          {/* Game Control Buttons */}
          <div className="flex gap-2 mb-3">
            <button 
              className="flex-1 bg-purple-700 hover:bg-purple-600 text-white py-3 px-4 rounded border-b-4 border-r-4 border-purple-900 hover:border-purple-800 font-bold transition-all active:translate-y-1"
              onClick={startGame}
            >
              {gameOver ? 'RESTART' : 'START'}
            </button>
            
            <button 
              className={`flex-1 text-white py-3 px-4 rounded border-b-4 border-r-4 font-bold transition-all active:translate-y-1
                ${isPaused 
                ? 'bg-green-700 hover:bg-green-600 border-green-900' 
                : 'bg-yellow-700 hover:bg-yellow-600 border-yellow-900'}`}
              onClick={togglePause}
              disabled={gameOver || dropTime === null}
            >
              {isPaused ? 'RESUME' : 'PAUSE'}
            </button>
          </div>
          
          {/* Controls Section - Now Always Visible */}
          <div className="bg-gray-800 p-3 rounded text-white text-sm border-2 border-gray-600">
            <h3 className="font-bold mb-2 text-center text-yellow-300 text-shadow-md border-b border-yellow-500 pb-1">HOW TO PLAY</h3>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Keyboard controls */}
              <div>
                <h4 className="font-bold text-center text-cyan-400 mb-1">KEYBOARD</h4>
                <div className="space-y-1 text-center">
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded inline-block min-w-[40px] border border-gray-500">←→</span>
                    <span>Move</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded inline-block min-w-[40px] border border-gray-500">↑</span>
                    <span>Rotate</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded inline-block min-w-[40px] border border-gray-500">↓</span>
                    <span>Drop</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded inline-block min-w-[40px] border border-gray-500">Space</span>
                    <span>Pause</span>
                  </div>
                </div>
              </div>
              
              {/* Mobile controls */}
              <div>
                <h4 className="font-bold text-center text-pink-400 mb-1">MOBILE</h4>
                <div className="space-y-1 text-center">
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs border border-gray-500">←Swipe→</span>
                    <span>Move</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs border border-gray-500">Swipe↑</span>
                    <span>Rotate</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs border border-gray-500">Swipe↓</span>
                    <span>Drop</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="bg-gray-700 px-2 py-1 rounded text-xs border border-gray-500">Tap</span>
                    <span>Rotate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Rotation warning */}
          {rotationDegree === 180 && (
            <div className="mt-3 bg-yellow-800 text-yellow-100 p-2 rounded text-center text-sm border border-yellow-600">
              <p>⚠️ Controls have reversed due to rotation!</p>
            </div>
          )}
        </div>

        {/* Game Area - With retro styling */}
        <motion.div 
          ref={gameAreaRef}
          className="relative order-2 md:order-2 w-[280px] sm:w-[320px] md:w-[300px] lg:w-[380px] h-[560px] sm:h-[640px] md:h-[600px] lg:h-[760px] border-8 border-gray-800 bg-black rounded shadow-[0_0_15px_rgba(255,255,255,0.2)] overflow-hidden"
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
          {/* Scanline effect overlay for CRT look */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:100%_2px] opacity-20 z-10"></div>
          
          <div className="grid grid-rows-20 h-full w-full">
            {stage.map((row, y) => (
              <div key={y} className="flex h-full">
                {row.map((cell, x) => {
                  const isFilled = cell[0] !== 0;
                  const tetrominoType = isFilled ? getTetrominoType(cell[0]) : '0';
                  const colorClass = isFilled ? TETROMINOS[tetrominoType].bgClass : '';
                  
                  return (
                    <div
                      key={x}
                      className={`
                        aspect-square h-full
                        ${isFilled 
                          ? `${colorClass} border border-white/20 shadow-[inset_0_0_4px_rgba(255,255,255,0.6)] relative`
                          : 'border border-gray-900 bg-gray-950/75'}
                      `}
                    >
                      {/* Enhanced 3D effect with Tailwind */}
                      {isFilled && (
                        <>
                          <div className="absolute inset-0 bg-white/50 rounded-sm w-full h-[40%] top-0 left-0"></div>
                          <div className="absolute inset-0 bg-black/40 rounded-sm w-full h-[30%] bottom-0 right-0"></div>
                          <div className="absolute right-0 top-0 h-full w-[15%] bg-black/30"></div>
                          <div className="absolute bottom-0 left-0 w-full h-[15%] bg-black/30"></div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Pause Overlay - Retro styled */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="text-white text-center bg-blue-900/90 p-6 rounded border-4 border-yellow-500 shadow-[0_0_20px_rgba(255,255,0,0.5)]">
                <h2 className="text-3xl font-bold mb-3 text-yellow-300 animate-pulse">PAUSED</h2>
                <p className="mb-5 text-cyan-300">Press Space or tap Resume to continue</p>
                <button
                  className="bg-green-600 hover:bg-green-500 text-white py-2 px-6 rounded font-bold border-b-4 border-r-4 border-green-900 active:translate-y-1 transition-transform"
                  onClick={togglePause}
                >
                  RESUME
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Tetromino preview with retro styling */}
      <div className="mt-4 bg-gray-900 p-3 rounded shadow-lg border-2 border-pink-500">
        <h3 className="text-white text-center font-bold mb-2 text-shadow-md">TETROMINO GUIDE</h3>
        <div className="flex gap-3 justify-center">
          {Object.keys(TETROMINOS).filter(key => key !== '0').map((key) => (
            <div key={key} className="w-8 h-8 relative">
              <div className={`w-full h-full ${TETROMINOS[key as TetrominoKey].bgClass} rounded shadow-inner border border-white/30 relative`}>
                <div className="absolute inset-0 bg-white/40 rounded-sm w-full h-1/3 top-0 left-0"></div>
                <div className="absolute inset-0 bg-black/30 rounded-sm w-full h-1/4 bottom-0 right-0"></div>
              </div>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-white text-sm">{key}</span>
            </div>
          ))}
        </div>
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
