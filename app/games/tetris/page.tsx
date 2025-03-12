"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInterval } from '@/hooks/useInterval';

// Tetris piece shapes
type TetrominoKey = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z' | '0';

const TETROMINOS: { [key in TetrominoKey]: { shape: (string | number)[][], color: string } } = {
  0: { shape: [[0]], color: '0, 0, 0' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0]
    ],
    color: '80, 227, 230',
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0]
    ],
    color: '36, 95, 223',
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L']
    ],
    color: '223, 173, 36',
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O']
    ],
    color: '223, 217, 36',
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0]
    ],
    color: '48, 211, 56',
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0]
    ],
    color: '132, 61, 198',
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0]
    ],
    color: '227, 78, 78',
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

  const gameAreaRef = useRef(null);

  // Reset everything
  const startGame = () => {
    setStage(createStage());
    setDropTime(1000);
    resetPlayer();
    setGameOver(false);
    setScore(0);
    setLevel(1);
    setRows(0);
    setRotationDegree(0);
    setIsRotating(false);
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
  const move = (e: KeyboardEvent) => {
    if (!gameOver && !isRotating) {
      // Prevent the default behavior to stop scrolling
      if([37, 38, 39, 40].includes(e.keyCode)) {
        e.preventDefault();
      }
      
      // Determine if controls should be inverted based on rotation
      const isInverted = (rotationDegree === 90 || rotationDegree === 270);

      if (e.keyCode === 37) { // Left arrow
        movePlayer(isInverted ? 1 : -1);
      } else if (e.keyCode === 39) { // Right arrow
        movePlayer(isInverted ? -1 : 1);
      } else if (e.keyCode === 40) { // Down arrow
        dropPlayer();
      } else if (e.keyCode === 38) { // Up arrow
        playerRotate(stage, 1);
      }
    }
  };

  // Handle key release
  const keyUp = (e: KeyboardEvent) => {
    if (!gameOver) {
      if (e.keyCode === 40) {
        setDropTime(1000 / level + 200);
      }
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!gameOver) {
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

      const isInverted = (rotationDegree === 90 || rotationDegree === 270);

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
      setRotationDegree(prev => (prev + 90) % 360);

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

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('keydown', move);
    window.addEventListener('keyup', keyUp);
    return () => {
      window.removeEventListener('keydown', move);
      window.removeEventListener('keyup', keyUp);
    };
  }, [move, keyUp, rotationDegree]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-900 py-4 px-2 overflow-x-hidden max-w-screen">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">Tetris with a Twist</h1>

      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl gap-4">
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
          
          <div className="flex gap-2">
            <button 
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded focus:outline-none transition"
              onClick={startGame}
            >
              {gameOver ? 'Restart Game' : 'Start Game'}
            </button>
            
            <button 
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded focus:outline-none transition"
              onClick={toggleControls}
            >
              {showControls ? 'Hide' : 'Help'}
            </button>
          </div>
          
          {rotationDegree !== 0 && (
            <div className="mt-3 bg-yellow-800 text-yellow-100 p-2 rounded text-center text-sm">
              <p>⚠️ Controls have {rotationDegree === 180 ? 'reversed' : 'changed'} due to rotation</p>
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

        {/* Game Area */}
        <div 
          ref={gameAreaRef}
          className="relative border-4 border-gray-700 bg-black/50 order-2 md:order-2"
          style={{
            width: 'min(100%, 300px)',
            height: 'min(70vh, 600px)',
            transform: `rotate(${rotationDegree}deg)`,
            transition: isRotating ? 'transform 1s ease' : 'none'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full h-full grid grid-rows-20" style={{ aspectRatio: '1/2' }}>
            {stage.map((row, y) => (
              <div key={y} className="flex">
                {row.map((cell, x) => (
                  <div
                    key={x}
                    className="aspect-square"
                    style={{
                      backgroundColor: cell[0] !== 0
                        ? `rgba(${TETROMINOS[cell[0] as TetrominoKey].color}, 1)`
                        : 'transparent',
                      borderStyle: 'solid',
                      borderWidth: cell[0] !== 0 ? '4px' : '1px',
                      borderColor: cell[0] !== 0 ? 'rgba(0,0,0,0.1)' : 'rgba(50,50,50,0.2)'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TetrisPage() {
  return (
    <div className="max-h-screen overflow-hidden">
      <TetrisGame />
    </div>
  );
}
