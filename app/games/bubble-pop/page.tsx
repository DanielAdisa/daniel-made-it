"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { FaBomb } from "react-icons/fa";
import { GiSpiralLollipop, GiCandyCanes, GiDonut, GiStrawberry } from "react-icons/gi";

const GRID_ROWS = 8;
const GRID_COLS = 8;
const COLORS = [
  "#FF6B95", // Pink candy
  "#66E0A3", // Mint green
  "#6A98FF", // Blue candy
  "#FFC837", // Yellow candy
  "#FF914D", // Orange candy
];
const MIN_MATCH = 3;
const POINTS_PER_BRICK = 10;
const LEVEL_CLEAR_BONUS = 100;
const LEVEL_SCORE_INCREMENT = 1000; // 1000 points difference between levels
const STARTING_MOVES = 80; // Start with 80 moves
const MOVES_DECREASE_RATE = 5; // Decrease by 5 moves each level
const BOMB_MIN_MATCH = 7; // Minimum blocks to clear for bomb power-up
const BOMB_RADIUS = 3; // Explosion radius - covers a 6x6 area (3 in each direction)

interface BrickType {
  id: string;
  color: string;
  matched: boolean;
  isBomb?: boolean;
  positionKey?: string; // Used for tracking position during animations
  fallDistance?: number; // Distance the brick will fall (for animation)
  candyType?: number; // Type of candy icon to display (0-3)
}

const BrickPop = () => {
  // Audio state
  const [isMuted, setIsMuted] = useState(false);
  const popSoundRef = useRef<HTMLAudioElement | null>(null);
  const shuffleSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);
  const levelUpSoundRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const explosionSoundRef = useRef<HTMLAudioElement | null>(null);
  
  const [grid, setGrid] = useState<BrickType[][]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [movesLeft, setMovesLeft] = useState(STARTING_MOVES);
  const [gameStatus, setGameStatus] = useState<"playing" | "levelComplete" | "gameOver" | "shuffling">("playing");
  const [matchesNeeded, setMatchesNeeded] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const validMovesRef = useRef<number>(0);

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements
    popSoundRef.current = new Audio("/sounds/pop.mp3");
    shuffleSoundRef.current = new Audio("/sounds/shuffle.mp3");
    gameOverSoundRef.current = new Audio("/sounds/game-over.mp3");
    levelUpSoundRef.current = new Audio("/sounds/level-up.mp3");
    bgMusicRef.current = new Audio("/sounds/bg-music.mp3");
    explosionSoundRef.current = new Audio("/sounds/explosion.mp3");
    
    if (bgMusicRef.current) {
      bgMusicRef.current.loop = true;
      bgMusicRef.current.volume = 0.4;
      
      const playMusic = () => {
        bgMusicRef.current?.play().catch(e => console.log("Auto-play prevented:", e));
      };
      
      // Try to play music on interaction
      document.addEventListener('click', playMusic, { once: true });
      
      return () => {
        document.removeEventListener('click', playMusic);
        bgMusicRef.current?.pause();
      };
    }
  }, []);

  // Handle mute/unmute
  useEffect(() => {
    if (popSoundRef.current) popSoundRef.current.muted = isMuted;
    if (shuffleSoundRef.current) shuffleSoundRef.current.muted = isMuted;
    if (gameOverSoundRef.current) gameOverSoundRef.current.muted = isMuted;
    if (levelUpSoundRef.current) levelUpSoundRef.current.muted = isMuted;
    if (bgMusicRef.current) bgMusicRef.current.muted = isMuted;
    if (explosionSoundRef.current) explosionSoundRef.current.muted = isMuted;
  }, [isMuted]);

  // Play sound helper functions
  const playPopSound = () => {
    if (popSoundRef.current && !isMuted) {
      popSoundRef.current.currentTime = 0;
      popSoundRef.current.play().catch(e => console.log("Error playing pop sound:", e));
    }
  };

  const playShuffleSound = () => {
    if (shuffleSoundRef.current && !isMuted) {
      shuffleSoundRef.current.currentTime = 0;
      shuffleSoundRef.current.play().catch(e => console.log("Error playing shuffle sound:", e));
    }
  };

  const playGameOverSound = () => {
    if (gameOverSoundRef.current && !isMuted) {
      gameOverSoundRef.current.currentTime = 0;
      gameOverSoundRef.current.play().catch(e => console.log("Error playing game over sound:", e));
    }
  };

  const playLevelUpSound = () => {
    if (levelUpSoundRef.current && !isMuted) {
      levelUpSoundRef.current.currentTime = 0;
      levelUpSoundRef.current.play().catch(e => console.log("Error playing level up sound:", e));
    }
  };

  const playExplosionSound = () => {
    if (explosionSoundRef.current && !isMuted) {
      explosionSoundRef.current.currentTime = 0;
      explosionSoundRef.current.play().catch(e => console.log("Error playing explosion sound:", e));
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Helper to generate a new brick
  const generateNewBrick = useCallback((rowIndex: number, colIndex: number) => {
    const levelColors = COLORS.slice(0, Math.max(3, Math.min(COLORS.length, 3 + Math.floor((level - 1) / 2))));
    return {
      id: `brick-${Date.now()}-${Math.random()}`,
      color: levelColors[Math.floor(Math.random() * levelColors.length)],
      matched: false,
      positionKey: `pos-${rowIndex}-${colIndex}`,
      fallDistance: rowIndex + 1, // Add fall distance property
      candyType: Math.floor(Math.random() * 4) // Random candy type (0-3)
    };
  }, [level]);
  
  // Create a new grid
  const initializeGrid = useCallback(() => {
    const newGrid: BrickType[][] = Array.from({ length: GRID_ROWS }, (_, rowIndex) =>
      Array.from({ length: GRID_COLS }, (_, colIndex) => ({
        ...generateNewBrick(rowIndex, colIndex),
        positionKey: `pos-${rowIndex}-${colIndex}`
      }))
    );
    return newGrid;
  }, [generateNewBrick]);

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
    playShuffleSound();
    
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
    
    const brick = grid[row][col];
    
    // If this is a bomb, detonate it
    if (brick.isBomb) {
      detonateBomb(row, col);
      return;
    }
    
    const color = brick.color;
    const connectedBricks = findConnectedBricks(grid, row, col, color);
    
    // If we have at least MIN_MATCH connected bricks, pop them
    if (connectedBricks.length >= MIN_MATCH) {
      playPopSound();
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
        // Check if a bomb should be created
        if (connectedBricks.length >= BOMB_MIN_MATCH) {
          removeMatchesWithBomb(connectedBricks);
        } else {
          removeMatches(connectedBricks);
        }
        
        // Decrement moves left
        setMovesLeft(prev => {
          const newMoves = prev - 1;
          if (newMoves <= 0 && gameStatus === "playing") {
            setGameStatus("gameOver");
            playGameOverSound();
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

  // Detonate a bomb, affecting a 6x6 area around it
  const detonateBomb = (row: number, col: number) => {
    playExplosionSound();
    
    // Determine explosion area
    const affectedBricks: {row: number, col: number}[] = [];
    
    for (let r = Math.max(0, row - BOMB_RADIUS); r <= Math.min(GRID_ROWS - 1, row + BOMB_RADIUS); r++) {
      for (let c = Math.max(0, col - BOMB_RADIUS); c <= Math.min(GRID_COLS - 1, col + BOMB_RADIUS); c++) {
        affectedBricks.push({row: r, col: c});
      }
    }
    
    // Mark affected bricks as matched with explosion animation
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(brick => ({...brick})));
      affectedBricks.forEach(({row, col}) => {
        newGrid[row][col].matched = true;
      });
      return newGrid;
    });
    
    // Calculate points - bombs give extra points
    const points = affectedBricks.length * POINTS_PER_BRICK * 1.5;
    
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
      removeMatches(affectedBricks);
      
      // Bomb doesn't use a move
      // Check if we need to shuffle after removing matches
      setTimeout(() => {
        checkAndShuffleIfNeeded();
      }, 500);
    }, 500);
    
    // Visual effect for explosion
    triggerExplosion(row, col);
  };
  
  // Visual effect for explosion
  const triggerExplosion = (row: number, col: number) => {
    // Get the brick's position in the viewport
    const brickElements = document.querySelectorAll('.brick');
    const index = row * GRID_COLS + col;
    const brickElement = brickElements[index];
    
    if (brickElement) {
      const rect = brickElement.getBoundingClientRect();
      const x = (rect.left + rect.right) / 2;
      const y = (rect.top + rect.bottom) / 2;
      
      // Custom confetti for explosion effect
      confetti({
        particleCount: 100,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight
        },
        colors: ['#ff0000', '#ffa500', '#ffff00', '#ff4500'],
        gravity: 0.5,
        scalar: 1.2,
      });
    }
  };

  // Remove matched bricks and let bricks above slide down
  const removeMatches = (matchedBricks: {row: number, col: number}[]) => {
    setGrid((prevGrid) => {
      // Create a deep copy of the current grid
      const newGrid = JSON.parse(JSON.stringify(prevGrid));
      
      // Group by columns for processing
      const matchesByCol = new Map<number, number[]>();
      
      // Initialize the map with empty arrays for each column
      for (let col = 0; col < GRID_COLS; col++) {
        matchesByCol.set(col, []);
      }
      
      // Group matched bricks by column
      matchedBricks.forEach(({row, col}) => {
        const rowsInCol = matchesByCol.get(col) || [];
        rowsInCol.push(row);
        matchesByCol.set(col, rowsInCol);
      });
      
      // Process each column with matches
      for (let col = 0; col < GRID_COLS; col++) {
        const matchedRows = matchesByCol.get(col) || [];
        
        if (matchedRows.length > 0) {
          // Sort rows in descending order (bottom to top)
          matchedRows.sort((a, b) => b - a);
          
          // Process column from bottom to top
          let bricksToShift = [...matchedRows];
          let lastCheckedRow = GRID_ROWS - 1;
          
          for (let rowIndex = GRID_ROWS - 1; rowIndex >= 0; rowIndex--) {
            // Skip if this is a matched brick
            if (bricksToShift.includes(rowIndex)) {
              continue;
            }
            
            // Find the next position for this brick
            if (lastCheckedRow > rowIndex) {
              // Calculate fall distance for the animation
              const fallDistance = lastCheckedRow - rowIndex;
              
              // Move this brick down to fill the gap
              newGrid[lastCheckedRow][col] = {
                ...prevGrid[rowIndex][col],
                positionKey: `pos-${lastCheckedRow}-${col}`, // Update position key for animation
                fallDistance: fallDistance // Store fall distance for animation
              };
              
              // Clear the original position
              newGrid[rowIndex][col] = null as any;
              lastCheckedRow--;
            }
          }
          
          // Fill the top with new bricks
          for (let rowIndex = lastCheckedRow; rowIndex >= 0; rowIndex--) {
            // Calculate how far this brick needs to fall
            const fallDistance = rowIndex + 1 + (GRID_ROWS - lastCheckedRow - 1);
            
            newGrid[rowIndex][col] = {
              ...generateNewBrick(rowIndex, col),
              positionKey: `pos-${rowIndex}-${col}`,
              fallDistance: fallDistance // New bricks fall from above the grid
            };
          }
        }
      }
      
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

  // Remove matched bricks, add a bomb, and let bricks above slide down
  const removeMatchesWithBomb = (matchedBricks: {row: number, col: number}[]) => {
    // Choose a position for the bomb
    const bombIndex = Math.floor(Math.random() * matchedBricks.length);
    const bombPosition = matchedBricks[bombIndex];
    
    setGrid((prevGrid) => {
      // Create a deep copy of the current grid
      const newGrid = JSON.parse(JSON.stringify(prevGrid));
      
      // Group by columns for processing
      const matchesByCol = new Map<number, number[]>();
      
      // Initialize the map with empty arrays for each column
      for (let col = 0; col < GRID_COLS; col++) {
        matchesByCol.set(col, []);
      }
      
      // Group matched bricks by column
      matchedBricks.forEach(({row, col}) => {
        const rowsInCol = matchesByCol.get(col) || [];
        rowsInCol.push(row);
        matchesByCol.set(col, rowsInCol);
      });
      
      // Keep track of where we'll place the bomb
      let bombPlaced = false;
      let targetCol = bombPosition.col;
      
      // Process each column with matches
      for (let col = 0; col < GRID_COLS; col++) {
        const matchedRows = matchesByCol.get(col) || [];
        
        if (matchedRows.length > 0) {
          // Sort rows in descending order (bottom to top)
          matchedRows.sort((a, b) => b - a);
          
          // Process column from bottom to top
          let bricksToShift = [...matchedRows];
          let lastCheckedRow = GRID_ROWS - 1;
          
          for (let rowIndex = GRID_ROWS - 1; rowIndex >= 0; rowIndex--) {
            // Skip if this is a matched brick
            if (bricksToShift.includes(rowIndex)) {
              continue;
            }
            
            // Find the next position for this brick
            if (lastCheckedRow > rowIndex) {
              // Calculate fall distance for the animation
              const fallDistance = lastCheckedRow - rowIndex;
              
              // Move this brick down to fill the gap
              newGrid[lastCheckedRow][col] = {
                ...prevGrid[rowIndex][col],
                positionKey: `pos-${lastCheckedRow}-${col}`,
                fallDistance: fallDistance
              };
              
              // Clear the original position
              newGrid[rowIndex][col] = null as any;
              lastCheckedRow--;
            }
          }
          
          // If this is the column where we want to place a bomb and we haven't placed it yet
          if (col === targetCol && !bombPlaced) {
            // Calculate how far bricks need to fall
            const bombFallDistance = Math.max(4, GRID_ROWS); // Make bomb fall from top
            
            // Place the bomb at the top of the column (first matched position)
            bombPlaced = true;
            
            // Fill the top with new bricks, except where we'll place the bomb
            for (let rowIndex = lastCheckedRow; rowIndex >= 0; rowIndex--) {
              if (rowIndex === 0) {
                // Place bomb at the top with fall animation
                newGrid[rowIndex][col] = {
                  id: `bomb-${Date.now()}-${Math.random()}`,
                  color: '#333', // Dark base color for bomb
                  matched: false,
                  isBomb: true,
                  positionKey: `pos-${rowIndex}-${col}`,
                  fallDistance: bombFallDistance
                };
              } else {
                const fallDistance = rowIndex + 1 + (GRID_ROWS - lastCheckedRow - 1);
                newGrid[rowIndex][col] = {
                  ...generateNewBrick(rowIndex, col),
                  positionKey: `pos-${rowIndex}-${col}`,
                  fallDistance: fallDistance
                };
              }
            }
          } else {
            // Fill the top with new bricks
            for (let rowIndex = lastCheckedRow; rowIndex >= 0; rowIndex--) {
              const fallDistance = rowIndex + 1 + (GRID_ROWS - lastCheckedRow - 1);
              newGrid[rowIndex][col] = {
                ...generateNewBrick(rowIndex, col),
                positionKey: `pos-${rowIndex}-${col}`,
                fallDistance: fallDistance
              };
            }
          }
        }
      }
      
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
    playLevelUpSound();
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

  // Helper to calculate delay for natural falling animation
  const calculateFallDelay = (rowIndex: number, colIndex: number, fallDistance: number = 0) => {
    // Base delay for natural column-based falling
    const baseDelay = 0.02 * colIndex; // Small delay per column for visual interest
    
    // Add distance-based delay to simulate gravity (greater distance = longer time to fall)
    // This creates the illusion of gravity affecting the bricks
    return baseDelay + (fallDistance ? Math.sqrt(fallDistance) * 0.03 : 0);
  };
  
  // Candy decorative elements
  const candyDecorations = [
    { Icon: GiSpiralLollipop, top: "5%", left: "5%", size: "3rem", rotate: "15deg", color: "#FF6B95", delay: 0 },
    { Icon: GiCandyCanes, top: "10%", right: "8%", size: "2.5rem", rotate: "-10deg", color: "#FF914D", delay: 0.2 },
    { Icon: GiDonut, bottom: "15%", left: "7%", size: "2.8rem", rotate: "5deg", color: "#FFC837", delay: 0.4 },
    { Icon: GiStrawberry, bottom: "8%", right: "5%", size: "2.2rem", rotate: "-5deg", color: "#66E0A3", delay: 0.6 }
  ];

  // Get candy icon based on type
  const getCandyIcon = (type: number) => {
    switch(type) {
      case 0: return <GiSpiralLollipop className="w-3/4 h-3/4" />;
      case 1: return <GiCandyCanes className="w-3/4 h-3/4" />;
      case 2: return <GiDonut className="w-3/4 h-3/4" />;
      case 3: return <GiStrawberry className="w-3/4 h-3/4" />;
      default: return <GiSpiralLollipop className="w-3/4 h-3/4" />;
    }
  };

  // Add sparkle effect when matching
  const addSparkleEffect = (row: number, col: number, color: string) => {
    const brickElements = document.querySelectorAll('.brick');
    const index = row * GRID_COLS + col;
    const brickElement = brickElements[index];
    
    if (brickElement) {
      const rect = brickElement.getBoundingClientRect();
      const x = (rect.left + rect.right) / 2;
      const y = (rect.top + rect.bottom) / 2;
      
      // Create mini confetti at the brick position
      confetti({
        particleCount: 8,
        startVelocity: 15,
        spread: 360,
        origin: {
          x: x / window.innerWidth,
          y: y / window.innerHeight
        },
        colors: [color, '#FFFFFF'],
        shapes: ['circle'],
        scalar: 0.6,
        gravity: 0.3,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-pink-600 via-violet-600 to-indigo-700 p-4 overflow-hidden">
      {/* Decorative candy elements */}
      {candyDecorations.map((item, index) => (
        <motion.div
          key={`candy-decor-${index}`}
          className="absolute z-10 pointer-events-none opacity-60"
          style={{ 
            top: item.top || 'auto', 
            left: item.left || 'auto',
            right: item.right || 'auto',
            bottom: item.bottom || 'auto',
            color: item.color,
            fontSize: item.size,
            transform: `rotate(${item.rotate})`
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: 0.6, 
            scale: 1,
            rotate: [item.rotate, `calc(${item.rotate} + 5deg)`, `calc(${item.rotate} - 5deg)`, item.rotate],
            y: [0, -5, 5, 0]
          }}
          transition={{ 
            delay: item.delay,
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <item.Icon />
          <div className="absolute inset-0 blur-sm -z-10" style={{ backgroundColor: item.color, opacity: 0.2 }}></div>
        </motion.div>
      ))}

      {/* Audio elements loading message - hidden */}
      <div className="sr-only">
        Loading game sounds...
      </div>
      
      {/* Sugar particles floating animation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-white/30"
            style={{
              width: `${Math.random() * 8 + 3}px`,
              height: `${Math.random() * 8 + 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -300],
              x: [0, Math.random() * 100 - 50],
              opacity: [0, 0.7, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              delay: Math.random() * 20
            }}
          />
        ))}
      </div>
      
      <div className="text-center mb-6">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 mb-2 drop-shadow-lg">Candy Pop</h1>
        <motion.p 
          className="text-lg text-pink-100 font-light tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Match 3 or more candies to pop them!
        </motion.p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-6 px-4 gap-3 max-w-4xl mx-auto">
        <motion.div 
          className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex-1 text-center shadow-lg border border-pink-300/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(255,100,150,0.3)" }}
        >
          <span className="text-2xl text-white font-bold">Score: {score}</span>
        </motion.div>
        <motion.div 
          className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex-1 text-center shadow-lg border border-pink-300/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(255,100,150,0.3)" }}
        >
          <span className="text-2xl text-white font-bold">Level: {level}</span>
        </motion.div>
        <motion.div 
          className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex-1 text-center shadow-lg border border-pink-300/30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 20px rgba(255,100,150,0.3)" }}
        >
          <span className="text-2xl text-white font-bold">Moves: {movesLeft}</span>
        </motion.div>
      </div>

      <div className="mb-6 px-4 max-w-4xl mx-auto">
        <div className="w-full bg-violet-900/50 h-8 rounded-full overflow-hidden shadow-inner border border-pink-300/20">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 relative"
            initial={{ width: "0%" }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          >
            {/* Sparkles in progress bar */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-1 h-8 bg-white/60"
                  style={{ left: `${i * 20}%` }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    width: ["1px", "3px", "1px"],
                    left: [`${i * 20}%`, `${i * 20 + 80}%`]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
        <div className="flex justify-between text-sm text-pink-100/90 mt-1 px-1">
          <span>0</span>
          <span className="font-semibold">Target: {getLevelTarget()}</span>
        </div>
      </div>

      {/* Sound toggle button */}
      <motion.button
        onClick={toggleMute}
        className="absolute top-4 right-4 bg-pink-500/30 p-3 rounded-full backdrop-blur-sm shadow-lg border border-pink-300/30 hover:bg-pink-400/40 transition-all z-10"
        whileHover={{ scale: 1.1, rotate: 10 }}
        whileTap={{ scale: 0.9, rotate: -10 }}
      >
        {isMuted ? 
          <FaVolumeMute className="text-white text-xl" /> : 
          <FaVolumeUp className="text-white text-xl" />
        }
      </motion.button>

      {/* Shuffle notification */}
      <AnimatePresence>
        {isShuffling && (
          <motion.div 
            className="absolute z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-pink-600/90 to-purple-600/90 px-8 py-4 rounded-2xl text-white font-bold text-2xl shadow-lg border-2 border-pink-400/50"
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
            transition={{ duration: 0.4 }}
          >
            <motion.span
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="inline-block"
            >
              Shuffling...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex justify-center mb-8">
        <motion.div 
          className="bg-violet-800/40 p-4 md:p-6 rounded-2xl backdrop-blur-sm border border-pink-300/30 w-full max-w-[90vmin] mx-auto shadow-xl"
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
                      brick && <motion.div
                        key={brick.id}
                        layoutId={brick.positionKey}
                        initial={{ 
                          opacity: 1, 
                          y: brick.fallDistance ? -100 - (brick.fallDistance * 10) : 0,
                          scale: 1,
                          rotate: brick.fallDistance ? Math.random() * 20 - 10 : 0
                        }}
                        animate={{ 
                          opacity: brick.matched ? 0.5 : 1, 
                          y: 0,
                          // Fix: Changed from [1, 1.2, 0.5] to just 0.8 for matched bricks
                          // Spring animations only support two keyframes (start and end)
                          scale: brick.matched ? 0.8 : 1,
                          // Fix: Changed from [0, 15, -15, 0] to just 15 for matched bricks
                          // Spring animations only support two keyframes (start and end)
                          rotate: brick.matched ? 15 : 0
                        }}
                        exit={{ 
                          opacity: 0, 
                          scale: 0.8,
                          y: 20,
                          transition: { 
                            duration: 0.3
                          }
                        }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 350,
                          damping: 17,
                          mass: 1.3,
                          velocity: 12,
                          bounce: 0.25,
                          delay: brick.matched ? 0 : calculateFallDelay(
                            rowIndex, 
                            colIndex, 
                            brick.fallDistance || 0
                          )
                        }}
                        onClick={() => { 
                          handleBrickTap(rowIndex, colIndex);
                          if (!brick.matched && !brick.isBomb) {
                            addSparkleEffect(rowIndex, colIndex, brick.color);
                          }
                        }}
                        className={`w-full h-full aspect-square cursor-pointer relative rounded-full shadow-md brick 
                          ${brick.matched ? "opacity-50" : "hover:scale-105 active:scale-95"} 
                          ${brick.isBomb ? "overflow-hidden" : ""}`}
                        style={{ 
                          backgroundColor: brick.color,
                          boxShadow: brick.matched ? 'none' : 'inset 0 -4px 0 rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.15)'
                        }}
                      >
                        <div className="absolute inset-0 rounded-full bg-white/30 opacity-0 hover:opacity-20 transition-opacity"></div>
                        
                        {/* Candy icon inside the brick */}
                        {!brick.isBomb && (
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center text-white/80 pointer-events-none drop-shadow-md"
                            style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.3))" }}
                            animate={brick.matched ? { 
                              rotate: [0, 45, -45, 0],
                              // Fix: Changed from [1, 1.2, 0.8] to just use 1.2
                              scale: 1.2
                            } : { 
                              rotate: [0, 2, -2, 0],
                              y: [0, -1, 1, 0]
                            }}
                            transition={brick.matched ? {
                              duration: 0.4
                            } : {
                              duration: 2,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >
                            {getCandyIcon(brick.candyType || 0)}
                          </motion.div>
                        )}
                        
                        {/* Pulse animation for candy */}
                        {!brick.matched && !brick.isBomb && (
                          <motion.div 
                            className="absolute inset-0 rounded-full bg-white/20 pointer-events-none"
                            animate={{ 
                              scale: [1, 1.1, 1],
                              opacity: [0, 0.3, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              repeatDelay: Math.random() * 3
                            }}
                          />
                        )}
                        
                        {brick.isBomb && (
                          <motion.div 
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ 
                              scale: 1, 
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{ 
                              scale: { duration: 0.3 },
                              rotate: { 
                                repeat: Infinity, 
                                duration: 1.5,
                                ease: "easeInOut" 
                              }
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-red-600 rounded-full opacity-80"></div>
                            <FaBomb className="text-black text-3xl z-10 drop-shadow-md" />
                            <motion.div 
                              className="absolute inset-0 bg-white/30 rounded-full"
                              animate={{ 
                                opacity: [0.1, 0.3, 0.1],
                                scale: [0.8, 1, 0.8]
                              }}
                              transition={{ 
                                duration: 1, 
                                repeat: Infinity,
                                ease: "easeInOut" 
                              }}
                            />
                            
                            {/* Animated fuse on the bomb */}
                            <motion.div
                              className="absolute w-1 h-4 bg-orange-400 rounded-full -top-3 left-1/2 -translate-x-1/2 origin-bottom"
                              animate={{
                                scaleY: [1, 0.7, 1],
                                rotate: [-10, 10, -10]
                              }}
                              transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                            />
                            
                            {/* Bomb sparks */}
                            <motion.div
                              className="absolute w-2 h-2 bg-yellow-300 rounded-full -top-4 left-1/2 -translate-x-1/2"
                              animate={{
                                opacity: [0, 1, 0],
                                y: [-4, -8],
                                scale: [0.8, 0, 0.8]
                              }}
                              transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                ease: "easeOut"
                              }}
                            />
                          </motion.div>
                        )}
                      </motion.div>
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
                            opacity: [1, 0.8, 1],
                            rotate: [0, 360],
                            scale: [1, 0.8, 1.1, 1],
                            y: [0, -20, 0],
                            transition: {
                              duration: 0.7,
                              ease: "easeInOut",
                              times: [0, 0.5, 0.8, 1],
                              delay: (rowIndex * 0.03) + (colIndex * 0.02)
                            }
                          },
                          exit: { opacity: 0 }
                        }}
                        className="w-full h-full aspect-square cursor-pointer relative rounded-full shadow-lg"
                        style={{ 
                          backgroundColor: brick.color,
                          boxShadow: 'inset 0 -4px 0 rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.15)'
                        }}
                      >
                        {/* Candy icon inside the shuffling brick */}
                        <div className="absolute inset-0 flex items-center justify-center text-white/80">
                          {getCandyIcon(brick.candyType || 0)}
                        </div>
                      </motion.div>
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
            className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-20"
          >
            <motion.div 
              className="text-center bg-gradient-to-br from-pink-600 to-purple-700 p-10 rounded-2xl max-w-[90%] shadow-2xl border border-pink-500/50"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.h2 
                className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 mb-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Level {level} Complete!
              </motion.h2>
              <motion.p 
                className="text-2xl text-pink-200 mb-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                Bonus: {LEVEL_CLEAR_BONUS} points
              </motion.p>
              <motion.p 
                className="text-xl text-pink-200 mt-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Get ready for level {level + 1}...
              </motion.p>
              <motion.div 
                className="mt-6 mx-auto w-16 h-16 border-t-4 border-b-4 border-pink-300 rounded-full"
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
            className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-20"
          >
            <motion.div 
              className="text-center bg-gradient-to-br from-pink-800 to-purple-900 p-10 rounded-2xl max-w-[90%] shadow-2xl border border-pink-500/30"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <motion.h2 
                className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 to-pink-300 mb-3"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Game Over!
              </motion.h2>
              <motion.p 
                className="text-2xl text-pink-200"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                You ran out of moves
              </motion.p>
              <motion.p 
                className="text-2xl text-pink-200 mt-3 font-semibold"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                Final Score: {score}
              </motion.p>
              <motion.button
                onClick={resetGame}
                className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                Play Again
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-8 flex justify-center gap-5">
        <motion.button
          onClick={resetGame}
          className="bg-gradient-to-r from-pink-500 to-pink-700 hover:from-pink-600 hover:to-pink-800 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:scale-105 active:scale-95 transition-all"
          whileHover={{ scale: 1.05, boxShadow: "0 8px 20px rgba(255,100,150,0.3)" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Restart Game
        </motion.button>
        
        <motion.button
          onClick={() => !isShuffling && gameStatus === "playing" && shuffleGrid()}
          className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isShuffling || gameStatus !== "playing" ? 1 : 1.05, boxShadow: "0 8px 20px rgba(146,100,255,0.3)" }}
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
        className="mt-8 bg-violet-700/30 p-6 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto shadow-lg border border-pink-300/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="text-xl font-bold text-pink-100 mb-3">How to Play:</h3>
        <ul className="text-pink-100 list-disc pl-6 space-y-1.5">
          <li>Tap on groups of 3 or more candies of the same color</li>
          <li>Connected candies will pop and new ones will fall from the top</li>
          <li>Score points for each candy popped ({POINTS_PER_BRICK} per candy)</li>
          <li>Clearing 7 or more candies at once creates a special bomb power-up</li>
          <li>Tap a bomb to clear a large area around it without using a move</li>
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
