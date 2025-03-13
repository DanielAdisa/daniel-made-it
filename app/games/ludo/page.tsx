'use client';

import React, { useState, useEffect } from 'react';

// Player types and constants
type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
type Position = { x: number; y: number; inHome: boolean; inFinish: boolean; steps: number };
type Player = {
  color: PlayerColor;
  pieces: Position[];
  canMove: boolean;
};

// Define the grid size
const GRID_SIZE = 15;

// Fix Array.fill to create independent objects for each piece
const INITIAL_PLAYERS: Player[] = [
  {
    color: 'red',
    pieces: Array(4).fill(0).map(() => ({ x: 1, y: 1, inHome: true, inFinish: false, steps: 0 })),
    canMove: true
  },
  {
    color: 'green',
    pieces: Array(4).fill(0).map(() => ({ x: 13, y: 1, inHome: true, inFinish: false, steps: 0 })),
    canMove: false
  },
  {
    color: 'yellow',
    pieces: Array(4).fill(0).map(() => ({ x: 13, y: 13, inHome: true, inFinish: false, steps: 0 })),
    canMove: false
  },
  {
    color: 'blue',
    pieces: Array(4).fill(0).map(() => ({ x: 1, y: 13, inHome: true, inFinish: false, steps: 0 })),
    canMove: false
  }
];

// Correct starting positions
const START_POSITIONS = {
  red: { x: 2, y: 7 },
  green: { x: 7, y: 2 },
  yellow: { x: 13, y: 8 },
  blue: { x: 8, y: 13 }
};

// Path coordinates for each player - making sure they're accurate
const PATHS = {
  red: [
    { x: 2, y: 7 }, // Step 1 (starting position)
    { x: 2, y: 6 }, { x: 2, y: 5 }, { x: 2, y: 4 }, { x: 2, y: 3 }, { x: 2, y: 2 },
    { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 6, y: 3 },
    { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 7, y: 6 }, { x: 8, y: 6 },
    { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 9, y: 2 },
    { x: 10, y: 2 }, { x: 11, y: 2 }, { x: 12, y: 2 }, { x: 13, y: 2 }, { x: 13, y: 3 },
    { x: 13, y: 4 }, { x: 13, y: 5 }, { x: 13, y: 6 }, { x: 13, y: 7 }, { x: 13, y: 8 },
    { x: 13, y: 9 }, { x: 13, y: 10 }, { x: 13, y: 11 }, { x: 13, y: 12 }, { x: 13, y: 13 },
    { x: 12, y: 13 }, { x: 11, y: 13 }, { x: 10, y: 13 }, { x: 9, y: 13 }, { x: 8, y: 13 },
    { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 }, { x: 7, y: 9 },
    { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 },
    { x: 5, y: 13 }, { x: 4, y: 13 }, { x: 3, y: 13 }, { x: 2, y: 13 }, { x: 2, y: 12 },
    { x: 2, y: 11 }, { x: 2, y: 10 }, { x: 2, y: 9 }, { x: 2, y: 8 }, // Finish area starts here
    { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }  // Final 5 steps
  ],
  green: [
    // Green path: Starting from green home to center
    { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 },
    { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 8, y: 1 }, 
    { x: 7, y: 1 }, { x: 6, y: 1 },
    { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, { x: 5, y: 6 },
    { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, { x: 1, y: 7 }, 
    { x: 1, y: 8 }, { x: 2, y: 8 },
    { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 9 }, { x: 6, y: 10 }, 
    { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, { x: 6, y: 14 }, { x: 7, y: 14 }, 
    { x: 8, y: 14 }, { x: 8, y: 13 },
    { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 }, { x: 9, y: 8 },
    { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 },
    { x: 14, y: 7 }, { x: 14, y: 6 },
    // Final stretch for green
    { x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 },
  ],
  yellow: [
    // Yellow path: Starting from yellow home to center
    { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 },
    { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, 
    { x: 14, y: 8 }, { x: 14, y: 7 },
    { x: 14, y: 6 }, { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 },
    { x: 9, y: 6 }, { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, 
    { x: 8, y: 1 }, { x: 7, y: 1 },
    { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, 
    { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, 
    { x: 1, y: 7 }, { x: 1, y: 8 },
    { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 9 },
    { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, { x: 6, y: 14 },
    { x: 7, y: 14 }, { x: 8, y: 14 },
    // Final stretch for yellow
    { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 },
  ],
  blue: [
    // Blue path: Starting from blue home to center
    { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 },
    { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, 
    { x: 6, y: 14 }, { x: 7, y: 14 },
    { x: 8, y: 14 }, { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 },
    { x: 8, y: 9 }, { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, 
    { x: 13, y: 8 }, { x: 14, y: 8 },
    { x: 14, y: 7 }, { x: 14, y: 6 }, { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, 
    { x: 10, y: 6 }, { x: 9, y: 6 }, { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, 
    { x: 8, y: 2 }, { x: 8, y: 1 },
    { x: 7, y: 1 }, { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 },
    { x: 6, y: 5 }, { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 },
    { x: 1, y: 6 }, { x: 1, y: 7 },
    // Final stretch for blue
    { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 },
  ]
};

// Safe spots where pieces can't be captured
const SAFE_SPOTS = [
  '2,7', '7,2', '13,8', '8,13', // Starting positions
  '7,7' // Center
];

export default function LudoGame() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValues, setDiceValues] = useState<number[]>([0, 0]); 
  const [isRolling, setIsRolling] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [boardSize, setBoardSize] = useState({ width: 480, height: 480 });

  useEffect(() => {
    // Update board size based on viewport
    const updateBoardSize = () => {
      const width = window.innerWidth < 640 ? 300 : window.innerWidth < 1024 ? 450 : 600; 
      setBoardSize({ width, height: width }); // Keep it square
    };

    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, []);

  // Roll both dice
  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    const rollInterval = setInterval(() => {
      setDiceValues([
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ]);
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      const finalValues = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      setDiceValues(finalValues);
      setIsRolling(false);
      
      // Player can choose which dice to use when moving
      const currentPlayer = players[currentPlayerIndex];
      const canMoveWithDice1 = checkIfPlayerCanMove(currentPlayer, finalValues[0]);
      const canMoveWithDice2 = checkIfPlayerCanMove(currentPlayer, finalValues[1]);
      
      // If both dice are 6, player gets another turn after using these dice
      const rollsDoublesSix = finalValues[0] === 6 && finalValues[1] === 6;
      
      if (!canMoveWithDice1 && !canMoveWithDice2) {
        // Move to next player after a delay
        setTimeout(() => {
          nextPlayer();
          setDiceValues([0, 0]); // Reset dice values for next player
        }, 1500);
      }
    }, 1000);
  };

  // Check if player can move any piece with given dice value
  const checkIfPlayerCanMove = (player: Player, value: number) => {
    return player.pieces.some((piece, index) => {
      if (piece.inHome) {
        return value === 6; // Can only move out of home with a 6
      }
      return !piece.inFinish; // Can move if not finished
    });
  };

  // Move to next player
  const nextPlayer = () => {
    setSelectedPieceIndex(null);
    setCurrentPlayerIndex((prevIndex) => (prevIndex + 1) % players.length);
  };

  // Start game with selected number of players
  const startGame = (numPlayers: number) => {
    // Create a deep copy of INITIAL_PLAYERS to ensure each player has independent pieces
    const freshPlayers = INITIAL_PLAYERS.map(player => ({
      ...player,
      pieces: Array(4).fill(0).map(() => ({ 
        x: player.color === 'red' ? 1 : player.color === 'green' ? 13 : player.color === 'yellow' ? 13 : 1,
        y: player.color === 'red' ? 1 : player.color === 'green' ? 1 : player.color === 'yellow' ? 13 : 13,
        inHome: true, 
        inFinish: false, 
        steps: 0 
      }))
    }));
    
    setPlayers(freshPlayers.slice(0, numPlayers));
    setGameStarted(true);
    setCurrentPlayerIndex(0);
    setWinner(null);
    setDiceValues([0, 0]); // Reset dice values for new game
    setIsRolling(false);
    setSelectedPieceIndex(null);
  };

  // Move a piece using selected dice
  const movePiece = (pieceIndex: number, diceIndex: number) => {
    // No move if dice hasn't been rolled or is 0
    if (diceValues[diceIndex] === 0) return;

    const currentPlayer = players[currentPlayerIndex];
    const piece = currentPlayer.pieces[pieceIndex];
    const diceValue = diceValues[diceIndex];

    // Handle moving out of home
    if (piece.inHome && diceValue === 6) {
      const updatedPlayers = [...players];
      const startPosition = START_POSITIONS[currentPlayer.color];
      updatedPlayers[currentPlayerIndex].pieces[pieceIndex] = {
        ...startPosition,
        inHome: false,
        inFinish: false,
        steps: 1 // Start at step 1 to correctly place on path
      };
      setPlayers(updatedPlayers);
      
      // If it's a 6, the player gets another turn, but this dice is used
      const newDiceValues = [...diceValues];
      newDiceValues[diceIndex] = 0;
      setDiceValues(newDiceValues);
      
      // If both dice are used, move to next player
      if (newDiceValues[0] === 0 && newDiceValues[1] === 0) {
        setTimeout(() => nextPlayer(), 500);
      }
      return;
    }

    // Cannot move piece from home unless dice is 6
    if (piece.inHome) return;

    // Cannot move if piece is already finished
    if (piece.inFinish) return;

    // Move the piece along the path
    const updatedPlayers = [...players];
    const newPosition = calculateNewPosition(piece, currentPlayer.color, diceValue);
    
    // Check for captures
    checkForCaptures(newPosition, currentPlayerIndex);
    
    updatedPlayers[currentPlayerIndex].pieces[pieceIndex] = newPosition;
    setPlayers(updatedPlayers);

    // Mark this dice as used
    const newDiceValues = [...diceValues];
    newDiceValues[diceIndex] = 0;
    setDiceValues(newDiceValues);

    // Check win condition
    if (checkWinCondition(updatedPlayers[currentPlayerIndex])) {
      setWinner(currentPlayer.color);
    } 
    // Fix: Player gets another turn if they rolled a 6 or doubles
    else if (newDiceValues[0] === 0 && newDiceValues[1] === 0) {
      // Both dice used - check if either was a 6 for an extra turn
      if (diceValue === 6) {
        // Player gets another turn for rolling a 6
        setTimeout(() => {
          setDiceValues([0, 0]);
          rollDice();
        }, 500);
      } else if (diceValues[0] === diceValues[1] && diceValues[0] !== 0) {
        // Player rolled doubles (non-zero), gets another turn
        setTimeout(() => {
          setDiceValues([0, 0]);
          rollDice();
        }, 500);
      } else {
        // Normal move, next player's turn
        setTimeout(() => nextPlayer(), 500);
      }
    }
  };

  // Calculate new position based on current position and dice value
  const calculateNewPosition = (piece: Position, color: PlayerColor, steps: number): Position => {
    const newSteps = piece.steps + steps;
    const path = PATHS[color];
    
    // If would go beyond finish, bounce back
    if (newSteps > path.length) {
      const overshoot = newSteps - path.length;
      const bounceBackSteps = path.length - overshoot;
      const newPosition = path[bounceBackSteps - 1]; // -1 for array index
      
      return {
        ...newPosition,
        inHome: false,
        inFinish: bounceBackSteps >= path.length - 5, // Last 5 spaces are the finish area
        steps: bounceBackSteps
      };
    }
    
    // Normal movement
    const newPosition = path[newSteps - 1]; // -1 because steps start from 1
    const inFinish = newSteps >= path.length - 5 && newSteps <= path.length; // Last 5 spaces are finishing area
    
    return {
      ...newPosition,
      inHome: false,
      inFinish,
      steps: newSteps
    };
  };

  // Get the starting position for a player based on color
  const getStartPosition = (color: PlayerColor) => {
    return {
      ...START_POSITIONS[color],
      steps: 1 // Each piece starts at step 1 on the path
    };
  };

  // Check for captures
  const checkForCaptures = (newPosition: Position, currentPlayerIdx: number) => {
    // Check if position is a safe spot
    const posKey = `${newPosition.x},${newPosition.y}`;
    if (SAFE_SPOTS.includes(posKey)) {
      return; // No captures on safe spots
    }
    
    const updatedPlayers = [...players];
    
    players.forEach((player, playerIdx) => {
      // Skip current player
      if (playerIdx === currentPlayerIdx) return;
      
      player.pieces.forEach((piece, pieceIdx) => {
        // Skip pieces in home or finish
        if (piece.inHome || piece.inFinish) return;
        
        // Check for capture
        if (piece.x === newPosition.x && piece.y === newPosition.y) {
          // Send piece back to home
          updatedPlayers[playerIdx].pieces[pieceIdx] = {
            ...INITIAL_PLAYERS[playerIdx].pieces[0],
            inHome: true,
            inFinish: false,
            steps: 0
          };
        }
      });
    });
    
    setPlayers(updatedPlayers);
  };

  // Check if a player has won
  const checkWinCondition = (player: Player) => {
    return player.pieces.every(piece => piece.inFinish);
  };

  // Helper function to get cell class based on coordinates
  const getCellClass = (x: number, y: number) => {
    // Account for 1-based indexing in the array
    const adjX = x - 1;
    const adjY = y - 1;
    
    // Red home area (top-left corner)
    if (adjX < 6 && adjY < 6) {
      // Border outline
      if (adjX === 5 || adjY === 5) {
        return 'bg-red-300 border-red-400';
      }
      // Inner 4x4 playing area (with proper offset)
      if (adjX >= 1 && adjX <= 4 && adjY >= 1 && adjY <= 4) {
        return 'bg-red-50';
      }
      return 'bg-red-500'; // Main red color
    }
    
    // Green home area (top-right corner)
    if (adjX >= 9 && adjY < 6) {
      // Border outline
      if (adjX === 9 || adjY === 5) {
        return 'bg-green-300 border-green-400';
      }
      // Inner 4x4 playing area (with proper offset)
      if (adjX >= 10 && adjX <= 13 && adjY >= 1 && adjY <= 4) {
        return 'bg-green-50';
      }
      return 'bg-green-500'; // Main green color
    }
    
    // Yellow home area (bottom-right corner)
    if (adjX >= 9 && adjX < 15 && adjY >= 9 && adjY < 15) {
      // Border outline
      if (adjX === 9 || adjY === 9) {
        return 'bg-yellow-300 border-yellow-400';
      }
      // Inner 4x4 playing area (with proper offset)
      if (adjX >= 10 && adjX <= 13 && adjY >= 10 && adjY <= 13) {
        return 'bg-yellow-50';
      }
      return 'bg-yellow-500'; // Main yellow color
    }
    
    // Blue home area (bottom-left corner)
    if (adjX < 6 && adjY >= 9 && adjY < 15) {
      // Border outline
      if (adjX === 5 || adjY === 9) {
        return 'bg-blue-300 border-blue-400';
      }
      // Inner 4x4 playing area (with proper offset)
      if (adjX >= 1 && adjX <= 4 && adjY >= 10 && adjY <= 13) {
        return 'bg-blue-50';
      }
      return 'bg-blue-500'; // Main blue color
    }
  
    // Safe cells (star spots) with clearer marking
    if ((adjX === 1 && adjY === 6) || // Red start
        (adjX === 8 && adjY === 1) || // Green start
        (adjX === 13 && adjY === 8) || // Yellow start
        (adjX === 6 && adjY === 13)) { // Blue start
      return 'bg-gray-100 border border-gray-400'; 
    }
    
    // Additional safe spots with star markings
    if ((adjX === 6 && adjY === 1) || // Top safe spot
        (adjX === 13 && adjY === 6) || // Right safe spot
        (adjX === 8 && adjY === 13) || // Bottom safe spot
        (adjX === 1 && adjY === 8)) { // Left safe spot
      return 'bg-gray-200 border border-gray-400';
    }
    
    // Main path - vertical
    if (adjX === 7) {
      if (adjY < 6) return 'bg-green-200'; // Green path
      if (adjY > 8) return 'bg-blue-200'; // Blue path
      return 'bg-gray-200'; // Neutral path
    }
    
    // Main path - horizontal
    if (adjY === 7) {
      if (adjX < 6) return 'bg-red-200'; // Red path
      if (adjX > 8) return 'bg-yellow-200'; // Yellow path
      return 'bg-gray-200'; // Neutral path
    }
    
    // Colored home paths - more precise and nicer looking
    if (adjY === 6 && adjX >= 1 && adjX <= 5) return 'bg-red-200';  // Red home path
    if (adjX === 8 && adjY >= 1 && adjY <= 5) return 'bg-green-200'; // Green home path
    if (adjY === 8 && adjX >= 9 && adjX <= 13) return 'bg-yellow-200'; // Yellow home path
    if (adjX === 6 && adjY >= 9 && adjY <= 13) return 'bg-blue-200'; // Blue home path
    
    // Center finish area - proper symmetric look
    if (adjX === 7 && adjY === 7) {
      return 'bg-white border-2 border-gray-300';
    }
    
    // Default - neutral background for uncovered areas
    return 'bg-gray-100';
  };

  // Create the 15x15 grid for the board
  const renderBoard = () => {
    const cellSize = boardSize.width / GRID_SIZE;
    
    return (
      <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-300">
        {/* Board grid */}
        <div 
          className="grid grid-cols-15 grid-rows-15"
          style={{ 
            width: `${boardSize.width}px`, 
            height: `${boardSize.height}px`
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE + 1;
            const y = Math.floor(index / GRID_SIZE) + 1;
            return (
              <div 
                key={`cell-${x}-${y}`}
                className={`border border-gray-200 ${getCellClass(x, y)}`}
                style={{ 
                  width: `${cellSize}px`, 
                  height: `${cellSize}px` 
                }}
              />
            );
          })}
        </div>
        
        {/* Render pieces on the board */}
        {renderPieces()}
      </div>
    );
  };
  
  // Render all player pieces on the board
  const renderPieces = () => {
    const cellSize = boardSize.width / GRID_SIZE;
    
    return (
      <>
        {players.map((player, playerIdx) => (
          <React.Fragment key={`pieces-player-${playerIdx}`}>
            {player.pieces.map((piece, pieceIdx) => {
              if (!piece.inHome) {
                return renderBoardPiece(playerIdx, pieceIdx, piece);
              }
              return null;
            })}
          </React.Fragment>
        ))}
        {renderHomePieces()}
      </>
    );
  };
  
  // Render a piece on the board
  const renderBoardPiece = (playerIdx: number, pieceIdx: number, piece: Position) => {
    const player = players[playerIdx];
    const isCurrentPlayer = playerIdx === currentPlayerIndex;
    const isSelectable = isCurrentPlayer && (diceValues[0] > 0 || diceValues[1] > 0) && !isRolling;
    const isSelected = isCurrentPlayer && selectedPieceIndex === pieceIdx;
    
    // Calculate position based on cell size
    const cellSize = boardSize.width / GRID_SIZE;
    const left = (piece.x - 0.5) * cellSize;
    const top = (piece.y - 0.5) * cellSize;
    
    let bgColor, ringColor;
    switch (player.color) {
      case 'red': 
        bgColor = 'bg-red-500'; 
        ringColor = 'ring-red-200';
        break;
      case 'green': 
        bgColor = 'bg-green-500';
        ringColor = 'ring-green-200';
        break;
      case 'yellow': 
        bgColor = 'bg-yellow-500';
        ringColor = 'ring-yellow-200';
        break;
      case 'blue': 
        bgColor = 'bg-blue-500';
        ringColor = 'ring-blue-200';
        break;
    }
    
    return (
      <div 
        key={`board-piece-${playerIdx}-${pieceIdx}`}
        onClick={() => {
          if (isSelectable) {
            setSelectedPieceIndex(pieceIdx);
            if (diceValues[0] > 0 && diceValues[1] === 0) {
              movePiece(pieceIdx, 0);
            } else if (diceValues[0] === 0 && diceValues[1] > 0) {
              movePiece(pieceIdx, 1);
            }
          }
        }}
        className={`absolute rounded-full border-2 border-white shadow-lg transition-transform
                  ${bgColor}
                  ${isSelectable ? 'cursor-pointer hover:scale-110' : ''}
                  ${isSelected ? `ring-4 ${ringColor} shadow-xl scale-105` : ''}`}
        style={{
          width: cellSize * 0.65,
          height: cellSize * 0.65,
          left: left,
          top: top,
          transform: 'translate(-50%, -50%)',
          zIndex: isSelected ? 30 : 20
        }}
      />
    );
  };
  
  // Render pieces in home bases
  const renderHomePieces = () => {
    const cellSize = boardSize.width / GRID_SIZE;
    
    return players.map((player, playerIdx) => {
      // Define home area positions for each player with more precise positioning
      const homePositions = {
        red: [
          { x: 2, y: 2 }, { x: 4, y: 2 }, 
          { x: 2, y: 4 }, { x: 4, y: 4 }
        ],
        green: [
          { x: 11, y: 2 }, { x: 13, y: 2 }, 
          { x: 11, y: 4 }, { x: 13, y: 4 }
        ],
        yellow: [
          { x: 11, y: 11 }, { x: 13, y: 11 }, 
          { x: 11, y: 13 }, { x: 13, y: 13 }
        ],
        blue: [
          { x: 2, y: 11 }, { x: 4, y: 11 }, 
          { x: 2, y: 13 }, { x: 4, y: 13 }
        ]
      };
      
      const isCurrentPlayer = playerIdx === currentPlayerIndex;
      
      let bgColor, borderColor;
      switch (player.color) {
        case 'red': 
          bgColor = 'bg-red-500'; 
          borderColor = 'border-red-700';
          break;
        case 'green': 
          bgColor = 'bg-green-500'; 
          borderColor = 'border-green-700';
          break;
        case 'yellow': 
          bgColor = 'bg-yellow-500'; 
          borderColor = 'border-yellow-700';
          break;
        case 'blue': 
          bgColor = 'bg-blue-500'; 
          borderColor = 'border-blue-700';
          break;
      }
      
      return player.pieces.map((piece, pieceIdx) => {
        if (!piece.inHome) return null;
        
        const canMoveOut = isCurrentPlayer && (diceValues[0] === 6 || diceValues[1] === 6);
        const homePosition = homePositions[player.color][pieceIdx];
        
        return (
          <div
            key={`home-piece-${playerIdx}-${pieceIdx}`}
            onClick={() => {
              if (canMoveOut) {
                if (diceValues[0] === 6) {
                  movePiece(pieceIdx, 0);
                } else if (diceValues[1] === 6) {
                  movePiece(pieceIdx, 1);
                }
              }
            }}
            className={`absolute rounded-full border-2 border-white shadow-lg transition-all
                      ${bgColor}
                      ${canMoveOut ? 'cursor-pointer animate-pulse ring-4 ring-white' : ''}`}
            style={{
              width: cellSize * 0.65,
              height: cellSize * 0.65,
              left: (homePosition.x - 0.5) * cellSize,
              top: (homePosition.y - 0.5) * cellSize,
              transform: 'translate(-50%, -50%)',
              zIndex: 20
            }}
          />
        );
      });
    });
  };

  // Render a single die with animation
  const renderDie = (value: number, index: number) => {
    // Die face configurations (dots positions)
    const dotPositions = {
      1: [{ top: '50%', left: '50%' }],
      2: [{ top: '25%', left: '25%' }, { top: '75%', left: '75%' }],
      3: [{ top: '25%', left: '25%' }, { top: '50%', left: '50%' }, { top: '75%', left: '75%' }],
      4: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
      5: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '50%', left: '50%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }],
      6: [{ top: '25%', left: '25%' }, { top: '25%', left: '75%' }, { top: '50%', left: '25%' }, { top: '50%', left: '75%' }, { top: '75%', left: '25%' }, { top: '75%', left: '75%' }]
    };

    const dots = value > 0 ? dotPositions[value as keyof typeof dotPositions] : [];
    
    const currentPlayerColor = players[currentPlayerIndex].color;
    let borderColor;
    
    switch (currentPlayerColor) {
      case 'red': borderColor = 'border-red-500'; break;
      case 'green': borderColor = 'border-green-500'; break;
      case 'yellow': borderColor = 'border-yellow-500'; break;
      case 'blue': borderColor = 'border-blue-500'; break;
    }
    
    return (
      <div className="relative flex items-center justify-center">
        <div 
          onClick={() => {
            // Allow player to select this dice for a selected piece
            if (selectedPieceIndex !== null && value > 0) {
              movePiece(selectedPieceIndex, index);
            }
          }}
          className={`w-16 h-16 bg-white rounded-lg shadow-md border-2 ${borderColor} ${isRolling ? 'animate-bounce' : ''} 
                     ${selectedPieceIndex !== null && value > 0 ? 'cursor-pointer hover:bg-gray-100' : ''}`}
        >
          {dots.map((pos, idx) => (
            <div 
              key={`die-${index}-dot-${idx}`}
              style={{ top: pos.top, left: pos.left }} 
              className={`absolute w-3 h-3 rounded-full bg-black transform -translate-x-1/2 -translate-y-1/2`}
            ></div>
          ))}
        </div>
        {value === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-2xl">
            ?
          </div>
        )}
      </div>
    );
  };

  // Main component render with improved design
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 p-4">
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800 font-serif">Ludo Game</h1>
      
      {!gameStarted ? (
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-6 text-center">Select number of players:</h2>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <button 
              onClick={() => startGame(2)} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow transition-all">
              2 Players
            </button>
            <button 
              onClick={() => startGame(3)} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow transition-all">
              3 Players
            </button>
            <button 
              onClick={() => startGame(4)} 
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 shadow transition-all">
              4 Players
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {renderBoard()}
          
          <div className="bg-white p-6 rounded-xl shadow-lg w-[300px] border border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
              {winner ? (
                <span className={`uppercase ${
                  winner === 'red' ? 'text-red-500' : 
                  winner === 'green' ? 'text-green-500' : 
                  winner === 'yellow' ? 'text-yellow-500' : 
                  'text-blue-500'}`}>
                  {winner} Wins!
                </span>
              ) : (
                <span className={`${
                  players[currentPlayerIndex].color === 'red' ? 'text-red-500' : 
                  players[currentPlayerIndex].color === 'green' ? 'text-green-500' : 
                  players[currentPlayerIndex].color === 'yellow' ? 'text-yellow-500' : 
                  'text-blue-500'}`}>
                  {players[currentPlayerIndex].color.toUpperCase()}'s Turn
                </span>
              )}
            </h2>
            
            <div className="flex flex-col items-center mb-6">
              {/* Display both dice side by side */}
              <div className="flex space-x-4 mb-4">
                {renderDie(diceValues[0], 0)}
                {renderDie(diceValues[1], 1)}
              </div>

              <div className="text-sm text-gray-600 mb-4 text-center">
                {selectedPieceIndex !== null ? 
                  "Click a die to move your selected piece" : 
                  "Select a piece to move or roll the dice"}
              </div>
              
              <button 
                onClick={rollDice} 
                disabled={isRolling || (diceValues[0] !== 0 || diceValues[1] !== 0) || !!winner}
                className={`w-full px-6 py-3 rounded-lg text-white font-semibold shadow transition-all
                          ${isRolling || (diceValues[0] !== 0 || diceValues[1] !== 0) || winner 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`}>
                Roll Dice
              </button>
            </div>
            
            {selectedPieceIndex !== null && (
              <button
                onClick={() => setSelectedPieceIndex(null)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 mb-4"
              >
                Cancel Selection
              </button>
            )}
            
            {winner && (
              <button 
                onClick={() => startGame(players.length)} 
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow transition-all font-semibold">
                Play Again
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
