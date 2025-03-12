"use client";
import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

const GRID_ROWS = 8;
const GRID_COLS = 8;
const COLORS = ["#FF5252", "#4CAF50", "#2196F3", "#FFEB3B", "#FF9800"];
const MIN_MATCH = 3;
const POINTS_PER_BRICK = 10;
const LEVEL_CLEAR_BONUS = 100;
const LEVEL_TARGETS = [500, 1000, 2000, 3500, 5000];
const MOVES_PER_LEVEL = [20, 25, 30, 35, 40];

interface BrickType {
  id: string;
  color: string;
  matched: boolean;
}

const BrickPop = () => {
  const [grid, setGrid] = useState<BrickType[][]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(MOVES_PER_LEVEL[0]);
  const [gameStatus, setGameStatus] = useState<"playing" | "levelComplete" | "gameOver">("playing");
  const [matchesNeeded, setMatchesNeeded] = useState(0);

  // Create a new grid and ensure there are no initial matches
  const initializeGrid = useCallback(() => {
    const levelColors = COLORS.slice(0, Math.max(3, Math.min(COLORS.length, 3 + Math.floor((level - 1) / 2))));
    const newGrid: BrickType[][] = Array.from({ length: GRID_ROWS }, () =>
      Array.from({ length: GRID_COLS }, () => ({
        id: `brick-${Date.now()}-${Math.random()}`,
        color: levelColors[Math.floor(Math.random() * levelColors.length)],
        matched: false,
      }))
    );
    return newGrid;
  }, [level]);

  useEffect(() => {
    setGrid(initializeGrid());
    setMovesLeft(MOVES_PER_LEVEL[Math.min(level - 1, MOVES_PER_LEVEL.length - 1)]);
    setMatchesNeeded(5 + level * 3);
  }, [level, initializeGrid]);

  // Find all connected bricks of the same color
  const findConnectedBricks = (row: number, col: number, color: string) => {
    const visited = Array(GRID_ROWS).fill(0).map(() => Array(GRID_COLS).fill(false));
    const connected: {row: number, col: number}[] = [];
    
    const dfs = (r: number, c: number) => {
      if (r < 0 || r >= GRID_ROWS || c < 0 || c >= GRID_COLS || 
          visited[r][c] || grid[r][c].color !== color) {
        return;
      }
      
      visited[r][c] = true;
      connected.push({row: r, col: c});
      
      // Check adjacent cells (up, right, down, left)
      dfs(r-1, c);
      dfs(r, c+1);
      dfs(r+1, c);
      dfs(r, c-1);
    };
    
    dfs(row, col);
    return connected;
  };

  // Handle brick tap
  const handleBrickTap = (row: number, col: number) => {
    if (gameStatus !== "playing") return;
    
    const color = grid[row][col].color;
    const connectedBricks = findConnectedBricks(row, col, color);
    
    // If we have at least MIN_MATCH connected bricks, pop them
    if (connectedBricks.length >= MIN_MATCH) {
      const points = connectedBricks.length * POINTS_PER_BRICK;
      
      // Mark bricks as matched
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(row => row.map(brick => ({...brick})));
        connectedBricks.forEach(({row, col}) => {
          newGrid[row][col].matched = true;
        });
        return newGrid;
      });
      
      // Update score
      setScore(prev => prev + points);
      
      // After a short delay, remove matched bricks and let new ones fall
      setTimeout(() => {
        removeMatches(connectedBricks);
        
        // Decrement moves left
        setMovesLeft(prev => {
          const newMoves = prev - 1;
          if (newMoves <= 0) {
            if (score >= getLevelTarget()) {
              completeLevel();
            } else {
              setGameStatus("gameOver");
            }
          }
          return newMoves;
        });
        
      }, 300);
    }
  };

  // Remove matched bricks and let new ones fall in from the top
  const removeMatches = (matchedBricks: {row: number, col: number}[]) => {
    setGrid((prevGrid) => {
      const levelColors = COLORS.slice(0, Math.max(3, Math.min(COLORS.length, 3 + Math.floor((level - 1) / 2))));
      const newGrid = JSON.parse(JSON.stringify(prevGrid));
      
      // For each column affected by the matches
      const affectedCols = new Set(matchedBricks.map(brick => brick.col));
      
      affectedCols.forEach(col => {
        // Get all non-matched bricks in this column
        const nonMatchedBricks: BrickType[] = [];
        for (let row = GRID_ROWS - 1; row >= 0; row--) {
          if (!matchedBricks.some(brick => brick.row === row && brick.col === col)) {
            nonMatchedBricks.push(prevGrid[row][col]);
          }
        }
        
        // Create new bricks to fill the top
        const numNewBricks = GRID_ROWS - nonMatchedBricks.length;
        const newBricks = Array.from({ length: numNewBricks }, () => ({
          id: `brick-${Date.now()}-${Math.random()}`,
          color: levelColors[Math.floor(Math.random() * levelColors.length)],
          matched: false,
        }));
        
        // Combine new bricks with existing non-matched ones
        const updatedColumn = [...newBricks, ...nonMatchedBricks];
        
        // Update the column in the grid
        for (let row = 0; row < GRID_ROWS; row++) {
          newGrid[row][col] = updatedColumn[row];
        }
      });
      
      return newGrid;
    });
    
    // Update matches needed counter
    setMatchesNeeded(prev => {
      const remaining = Math.max(0, prev - matchedBricks.length);
      if (remaining === 0 && score >= getLevelTarget()) {
        completeLevel();
      }
      return remaining;
    });
  };

  const completeLevel = () => {
    setGameStatus("levelComplete");
    setScore(prev => prev + LEVEL_CLEAR_BONUS);
    triggerConfetti();
    setTimeout(() => {
      setLevel(prev => prev + 1);
      setGameStatus("playing");
      setGrid(initializeGrid());
      setMatchesNeeded(5 + (level + 1) * 3);
      setMovesLeft(MOVES_PER_LEVEL[Math.min(level, MOVES_PER_LEVEL.length - 1)]);
    }, 2000);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setMovesLeft(MOVES_PER_LEVEL[0]);
    setGameStatus("playing");
    setMatchesNeeded(5 + 3);
    setGrid(initializeGrid());
  };

  const getLevelTarget = () => LEVEL_TARGETS[Math.min(level - 1, LEVEL_TARGETS.length - 1)];
  const getProgressPercentage = () => Math.min(100, (score / getLevelTarget()) * 100);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4 overflow-hidden">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-white mb-2">Brick Pop Grid</h1>
        <p className="text-lg text-blue-200">Tap groups of 3 or more bricks to pop them!</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-4 px-4 gap-2">
        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
          <span className="text-xl text-white font-bold">Score: {score}</span>
        </div>
        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
          <span className="text-xl text-white font-bold">Level: {level}</span>
        </div>
        <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
          <span className="text-xl text-white font-bold">Moves Left: {movesLeft}</span>
        </div>
      </div>

      <div className="mb-4 px-4">
        <div className="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-white mt-1">
          <span>0</span>
          <span>Target: {getLevelTarget()}</span>
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <div className="bg-blue-800/30 p-2 rounded-xl backdrop-blur-sm border border-white/20">
          <div className="grid grid-cols-8 gap-1">
            {grid.map((row, rowIndex) =>
              row.map((brick, colIndex) => (
                <div
                  key={brick.id}
                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 cursor-pointer relative transition-all duration-200"
                  style={{ 
                    backgroundColor: brick.color,
                    transform: brick.matched ? 'scale(0.8)' : 'scale(1)',
                    opacity: brick.matched ? 0.5 : 1
                  }}
                  onClick={() => handleBrickTap(rowIndex, colIndex)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {gameStatus === "levelComplete" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center bg-purple-900/80 p-8 rounded-xl">
            <h2 className="text-4xl font-bold text-white mb-2">Level {level} Complete!</h2>
            <p className="text-xl text-blue-200">Bonus: {LEVEL_CLEAR_BONUS} points</p>
            <p className="text-xl text-blue-200 mt-2">Get ready for level {level + 1}...</p>
          </div>
        </div>
      )}

      {gameStatus === "gameOver" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="text-center bg-red-900/80 p-8 rounded-xl">
            <h2 className="text-4xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-xl text-blue-200">You ran out of moves</p>
            <p className="text-xl text-blue-200 mt-2">Final Score: {score}</p>
            <button
              onClick={resetGame}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={resetGame}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors shadow-lg"
        >
          Restart Game
        </button>
      </div>

      <div className="mt-6 bg-white/10 p-4 rounded-lg backdrop-blur-sm max-w-2xl mx-auto">
        <h3 className="text-lg font-bold text-white mb-2">How to Play:</h3>
        <ul className="text-blue-100 list-disc pl-5">
          <li>Tap on groups of 3 or more connected bricks of the same color</li>
          <li>Connected bricks will pop and new ones will fall from the top</li>
          <li>Score points for each brick popped ({POINTS_PER_BRICK} per brick)</li>
          <li>Reach the target score before running out of moves</li>
          <li>Level bonus: {LEVEL_CLEAR_BONUS} points</li>
        </ul>
      </div>
    </div>
  );
};

export default BrickPop;
