"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

const GRID_ROWS = 8;
const GRID_COLS = 8;
const COLORS = ["#FF5252", "#4CAF50", "#2196F3", "#FFEB3B", "#FF9800"];
const MIN_MATCH = 3;
const POINTS_PER_BRICK = 10;
const LEVEL_CLEAR_BONUS = 100;
const LEVEL_SCORE_INCREMENT = 500; // 500 points difference between levels
const STARTING_MOVES = 80; // Start with 80 moves
const MOVES_DECREASE_RATE = 5; // Decrease by 5 moves each level

interface BrickType {
  id: string;
  color: string;
  matched: boolean;
}

const BrickPop = () => {
  const [grid, setGrid] = useState<BrickType[][]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(STARTING_MOVES);
  const [gameStatus, setGameStatus] = useState<"playing" | "levelComplete" | "gameOver" | "shuffling">("playing");
  const [matchesNeeded, setMatchesNeeded] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const validMovesRef = useRef<number>(0);

  // Create a new grid
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

  // Find all connected bricks of the same color
  const findConnectedBricks = useCallback((grid: BrickType[][], row: number, col: number, color: string) => {
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
  }, []);

  // Count valid moves in the current grid
  const countValidMoves = useCallback((currentGrid: BrickType[][]) => {
    let validMoves = 0;
    const visited = new Set<string>();
    
    for (let row = 0; row < GRID_ROWS; row++) {
      for (let col = 0; col < GRID_COLS; col++) {
        const color = currentGrid[row][col].color;
        const key = `${row}-${col}-${color}`;
        
        if (!visited.has(key)) {
          const connected = findConnectedBricks(currentGrid, row, col, color);
          if (connected.length >= MIN_MATCH) {
            validMoves++;
          }
          
          // Mark all connected bricks as visited to avoid recounting
          connected.forEach(({row: r, col: c}) => {
            visited.add(`${r}-${c}-${color}`);
          });
        }
      }
    }
    
    return validMoves;
  }, [findConnectedBricks]);

  // Ensure grid has enough valid moves
  const ensureMinimumValidMoves = useCallback((minMoves: number = 5) => {
    let attempts = 0;
    let currentGrid = initializeGrid();
    let validMoves = countValidMoves(currentGrid);
    
    // Try to generate a grid with enough valid moves
    while (validMoves < minMoves && attempts < 10) {
      currentGrid = initializeGrid();
      validMoves = countValidMoves(currentGrid);
      attempts++;
    }
    
    validMovesRef.current = validMoves;
    return currentGrid;
  }, [initializeGrid, countValidMoves]);

  // Shuffle the grid when moves are less than needed
  const shuffleGrid = useCallback(() => {
    if (gameStatus !== "playing" || isShuffling) return;
    
    setIsShuffling(true);
    setGameStatus("shuffling");
    
    // Prepare for shuffle animation
    setTimeout(() => {
      // Generate a new grid with sufficient valid moves
      const newGrid = ensureMinimumValidMoves(Math.min(movesLeft + 3, 10));
      setGrid(newGrid);
      
      setTimeout(() => {
        setIsShuffling(false);
        setGameStatus("playing");
      }, 500);
    }, 700);
  }, [gameStatus, isShuffling, movesLeft, ensureMinimumValidMoves]);

  // Check if we need to shuffle based on valid moves
  const checkAndShuffleIfNeeded = useCallback(() => {
    if (gameStatus !== "playing") return;
    
    const validMoves = countValidMoves(grid);
    validMovesRef.current = validMoves;
    
    if (validMoves < movesLeft && validMoves <= 2) {
      shuffleGrid();
    }
  }, [gameStatus, grid, movesLeft, countValidMoves, shuffleGrid]);

  // Initialize grid and check valid moves
  useEffect(() => {
    const newGrid = ensureMinimumValidMoves();
    setGrid(newGrid);
    setMovesLeft(getStartingMovesForLevel(level));
    setMatchesNeeded(5 + level * 3);
  }, [level, ensureMinimumValidMoves]);

  // Periodically check for valid moves
  useEffect(() => {
    if (gameStatus === "playing" && !isShuffling) {
      const timer = setTimeout(() => {
        checkAndShuffleIfNeeded();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStatus, isShuffling, grid, checkAndShuffleIfNeeded]);

  // Handle brick tap
  const handleBrickTap = (row: number, col: number) => {
    if (gameStatus !== "playing" || isShuffling) return;
    
    const color = grid[row][col].color;
    const connectedBricks = findConnectedBricks(grid, row, col, color);
    
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
      setScore(prev => {
        const newScore = prev + points;
        // Check if level target reached
        if (newScore >= getLevelTarget() && gameStatus === "playing") {
          setTimeout(() => completeLevel(), 500);
        }
        return newScore;
      });
      
      // After a short delay, remove matched bricks and let new ones fall
      setTimeout(() => {
        removeMatches(connectedBricks);
        
        // Decrement moves left
        setMovesLeft(prev => {
          const newMoves = prev - 1;
          if (newMoves <= 0 && gameStatus === "playing") {
            setGameStatus("gameOver");
          }
          return newMoves;
        });
        
        // Check if we need to shuffle after removing matches
        setTimeout(() => {
          checkAndShuffleIfNeeded();
        }, 500);
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
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setGameStatus("playing");
      setGrid(ensureMinimumValidMoves());
      setMatchesNeeded(5 + nextLevel * 3);
      setMovesLeft(getStartingMovesForLevel(nextLevel));
      // Reset progress bar visually by temporarily setting score to 0
      setScore(prev => {
        const newScore = prev;
        setTimeout(() => setScore(newScore), 50);
        return 0;
      });
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
    setMovesLeft(getStartingMovesForLevel(1));
    setGameStatus("playing");
    setMatchesNeeded(5 + 3);
    setIsShuffling(false);
    setGrid(ensureMinimumValidMoves());
  };

  const getLevelTarget = () => level * LEVEL_SCORE_INCREMENT;
  const getStartingMovesForLevel = (currentLevel: number) => {
    return Math.max(15, STARTING_MOVES - ((currentLevel - 1) * MOVES_DECREASE_RATE));
  };
  const getProgressPercentage = () => Math.min(100, (score / getLevelTarget()) * 100);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-blue-900 to-purple-900 p-4 overflow-hidden">
      <div className="text-center mb-4">
        <h1 className="text-4xl font-bold text-white mb-2">Brick Pop Grid</h1>
        <p className="text-lg text-blue-200">Tap groups of 3 or more bricks to pop them!</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-4 px-4 gap-2 max-w-4xl mx-auto">
        <motion.div 
          className="bg-white/20 p-3 rounded-lg backdrop-blur-sm flex-1 text-center shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xl text-white font-bold">Score: {score}</span>
        </motion.div>
        <motion.div 
          className="bg-white/20 p-3 rounded-lg backdrop-blur-sm flex-1 text-center shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-xl text-white font-bold">Level: {level}</span>
        </motion.div>
        <motion.div 
          className="bg-white/20 p-3 rounded-lg backdrop-blur-sm flex-1 text-center shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="text-xl text-white font-bold">Moves Left: {movesLeft}</span>
        </motion.div>
      </div>

      <div className="mb-4 px-4 max-w-4xl mx-auto">
        <div className="w-full bg-gray-700 h-5 rounded-full overflow-hidden shadow-inner">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            initial={{ width: "0%" }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between text-sm text-white mt-1">
          <span>0</span>
          <span>Target: {getLevelTarget()}</span>
        </div>
      </div>

      {/* Shuffle notification */}
      <AnimatePresence>
        {isShuffling && (
          <motion.div 
            className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600/90 px-6 py-3 rounded-xl text-white font-bold text-xl shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            Shuffling...
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex justify-center mb-6">
        <motion.div 
          className="bg-blue-800/30 p-3 md:p-4 rounded-xl backdrop-blur-sm border border-white/20 w-full max-w-[90vmin] mx-auto shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-8 gap-1 md:gap-2 aspect-square">
            <AnimatePresence mode="wait">
              {!isShuffling ? (
                <motion.div 
                  key="grid"
                  className="grid-cols-8 gap-1 md:gap-2 contents"
                  initial={false}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((brick, colIndex) => (
                      <motion.div
                        key={brick.id}
                        layout
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ 
                          opacity: brick.matched ? 0.5 : 1, 
                          y: 0,
                          scale: brick.matched ? 0.8 : 1
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 20,
                          delay: (rowIndex * 0.03) + (colIndex * 0.02)
                        }}
                        className={`w-full h-full aspect-square cursor-pointer relative rounded-[15%] shadow-md ${
                          brick.matched ? "opacity-50 scale-90" : "hover:scale-105 active:scale-95"
                        }`}
                        style={{ backgroundColor: brick.color }}
                        onClick={() => handleBrickTap(rowIndex, colIndex)}
                      />
                    ))
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="shuffling"
                  className="grid-cols-8 gap-1 md:gap-2 contents"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={{
                    initial: {},
                    animate: {},
                    exit: {},
                  }}
                >
                  {grid.map((row, rowIndex) =>
                    row.map((brick, colIndex) => (
                      <motion.div
                        key={`shuffle-${rowIndex}-${colIndex}`}
                        variants={{
                          initial: { opacity: 1 },
                          animate: { 
                            opacity: 1,
                            rotate: [0, 360],
                            scale: [1, 0.8, 1],
                            transition: {
                              duration: 0.7,
                              ease: "easeInOut",
                              times: [0, 0.5, 1],
                              delay: (rowIndex * 0.03) + (colIndex * 0.02)
                            }
                          },
                          exit: { opacity: 0 }
                        }}
                        className="w-full h-full aspect-square cursor-pointer relative rounded-[15%] shadow-md"
                        style={{ backgroundColor: brick.color }}
                      />
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {gameStatus === "levelComplete" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20"
          >
            <motion.div 
              className="text-center bg-purple-900/80 p-8 rounded-xl max-w-[90%] shadow-2xl border border-purple-500/30"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-4xl font-bold text-white mb-2">Level {level} Complete!</h2>
              <p className="text-xl text-blue-200">Bonus: {LEVEL_CLEAR_BONUS} points</p>
              <p className="text-xl text-blue-200 mt-2">Get ready for level {level + 1}...</p>
              <motion.div 
                className="mt-4 mx-auto w-16 h-16 border-t-4 border-b-4 border-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1,
                  ease: "linear" 
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {gameStatus === "gameOver" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20"
          >
            <motion.div 
              className="text-center bg-red-900/80 p-8 rounded-xl max-w-[90%] shadow-2xl border border-red-500/30"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <h2 className="text-4xl font-bold text-white mb-2">Game Over!</h2>
              <p className="text-xl text-blue-200">You ran out of moves</p>
              <p className="text-xl text-blue-200 mt-2">Final Score: {score}</p>
              <motion.button
                onClick={resetGame}
                className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex justify-center gap-4">
        <motion.button
          onClick={resetGame}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Restart Game
        </motion.button>
        
        <motion.button
          onClick={() => !isShuffling && gameStatus === "playing" && shuffleGrid()}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isShuffling || gameStatus !== "playing" ? 1 : 1.05 }}
          whileTap={{ scale: isShuffling || gameStatus !== "playing" ? 1 : 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          disabled={isShuffling || gameStatus !== "playing"}
        >
          Shuffle
        </motion.button>
      </div>

      <motion.div 
        className="mt-6 bg-white/10 p-4 rounded-lg backdrop-blur-sm max-w-2xl mx-auto shadow-lg border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-white mb-2">How to Play:</h3>
        <ul className="text-blue-100 list-disc pl-5">
          <li>Tap on groups of 3 or more connected bricks of the same color</li>
          <li>Connected bricks will pop and new ones will fall from the top</li>
          <li>Score points for each brick popped ({POINTS_PER_BRICK} per brick)</li>
          <li>Reach the target score of {LEVEL_SCORE_INCREMENT} points per level</li>
          <li>Starting with {STARTING_MOVES} moves, each level reduces available moves by {MOVES_DECREASE_RATE}</li>
          <li>If no valid moves are available, the grid will automatically shuffle</li>
          <li>Level bonus: {LEVEL_CLEAR_BONUS} points</li>
        </ul>
      </motion.div>
    </div>
  );
};

export default BrickPop;
