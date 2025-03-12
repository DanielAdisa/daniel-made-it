"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";

type Player = "X" | "O" | null;
type GameMode = "ai" | "twoPlayer";
type WinningLine = number[] | null;

const TicTacToe = () => {
  const [gridSize, setGridSize] = useState<number>(3);
  const [board, setBoard] = useState<Player[]>(Array(gridSize * gridSize).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [gameMode, setGameMode] = useState<GameMode>("twoPlayer");
  const [winner, setWinner] = useState<Player | "draw">(null);
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [winningLine, setWinningLine] = useState<WinningLine>(null);

  // Reset the game
  const resetGame = () => {
    setBoard(Array(gridSize * gridSize).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
  };

  // Reinitialize board when grid size changes
  useEffect(() => {
    setBoard(Array(gridSize * gridSize).fill(null));
    setWinner(null);
    setWinningLine(null);
  }, [gridSize]);

  // Check for a winner
  const checkWinner = (board: Player[]): { winner: Player | "draw" | null; line: number[] | null } => {
    const checkLine = (indices: number[]): { winner: Player | null; line: number[] | null } => {
      const firstValue = board[indices[0]];
      if (!firstValue) return { winner: null, line: null };
      for (let i = 1; i < indices.length; i++) {
        if (board[indices[i]] !== firstValue) return { winner: null, line: null };
      }
      return { winner: firstValue, line: indices };
    };

    // Check rows
    for (let row = 0; row < gridSize; row++) {
      const rowIndices = Array.from({ length: gridSize }, (_, col) => row * gridSize + col);
      const result = checkLine(rowIndices);
      if (result.winner) return result;
    }

    // Check columns
    for (let col = 0; col < gridSize; col++) {
      const colIndices = Array.from({ length: gridSize }, (_, row) => row * gridSize + col);
      const result = checkLine(colIndices);
      if (result.winner) return result;
    }

    // Check diagonal (top-left to bottom-right)
    const diagonal1Indices = Array.from({ length: gridSize }, (_, i) => i * gridSize + i);
    const diag1Result = checkLine(diagonal1Indices);
    if (diag1Result.winner) return diag1Result;

    // Check diagonal (top-right to bottom-left)
    const diagonal2Indices = Array.from({ length: gridSize }, (_, i) => i * gridSize + (gridSize - 1 - i));
    const diag2Result = checkLine(diagonal2Indices);
    if (diag2Result.winner) return diag2Result;

    // Check for draw
    if (!board.includes(null)) return { winner: "draw", line: null };

    return { winner: null, line: null };
  };

  // Handle player move
  const handleCellClick = (index: number) => {
    if (board[index] || winner || isAIThinking) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const { winner: gameWinner, line } = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setWinningLine(line);
      setTimeout(() => {
        Swal.fire({
          title: gameWinner === "draw" ? "It's a draw!" : `Player ${gameWinner} wins!`,
          html: gameWinner !== "draw" ? `<div class="text-5xl my-4">${gameWinner}</div>` : undefined,
          text: gameWinner === "draw" ? "No one wins this time" : undefined,
          background: "#1F2937",
          color: "#F9FAFB",
          confirmButtonColor: "#3B82F6",
          confirmButtonText: "Play Again",
        }).then((result) => {
          if (result.isConfirmed) resetGame();
        });
      }, 500);
      return;
    }

    setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
    if (gameMode === "ai" && currentPlayer === "X") {
      setIsAIThinking(true);
      setTimeout(() => makeAIMove(newBoard), 500);
    }
  };

  // AI move with Minimax
  const makeAIMove = (currentBoard: Player[]) => {
    if (checkWinner(currentBoard).winner) {
      setIsAIThinking(false);
      return;
    }

    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < currentBoard.length; i++) {
      if (currentBoard[i] === null) {
        const newBoard = [...currentBoard];
        newBoard[i] = "O";
        const score = minimax(newBoard, 0, false, -Infinity, Infinity);
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    if (bestMove !== -1) {
      const newBoard = [...currentBoard];
      newBoard[bestMove] = "O";
      setBoard(newBoard);

      const { winner: gameWinner, line } = checkWinner(newBoard);
      if (gameWinner) {
        setWinner(gameWinner);
        setWinningLine(line);
        setTimeout(() => {
          Swal.fire({
            title: gameWinner === "draw" ? "It's a draw!" : `Player ${gameWinner} wins!`,
            html: gameWinner !== "draw" ? `<div class="text-5xl my-4">${gameWinner}</div>` : undefined,
            text: gameWinner === "draw" ? "No one wins this time" : undefined,
            background: "#1F2937",
            color: "#F9FAFB",
            confirmButtonColor: "#3B82F6",
            confirmButtonText: "Play Again",
          }).then((result) => {
            if (result.isConfirmed) resetGame();
          });
        }, 500);
      }
      setCurrentPlayer("X");
    }
    setIsAIThinking(false);
  };

  // Minimax with alpha-beta pruning
  const minimax = (board: Player[], depth: number, isMaximizing: boolean, alpha: number, beta: number): number => {
    const result = checkWinner(board);
    if (result.winner !== null) {
      if (result.winner === "O") return 10 - depth; // AI wins
      if (result.winner === "X") return depth - 10; // Player wins
      return 0; // Draw
    }

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = "O";
          const score = minimax(newBoard, depth + 1, false, alpha, beta);
          bestScore = Math.max(bestScore, score);
          alpha = Math.max(alpha, score);
          if (beta <= alpha) break;
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
          const newBoard = [...board];
          newBoard[i] = "X";
          const score = minimax(newBoard, depth + 1, true, alpha, beta);
          bestScore = Math.min(bestScore, score);
          beta = Math.min(beta, score);
          if (beta <= alpha) break;
        }
      }
      return bestScore;
    }
  };

  // Handle grid size change
  const handleGridSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(e.target.value);
    if (newSize >= 3 && newSize <= 10) {
      setGridSize(newSize);
      resetGame();
    }
  };

  // Handle game mode change
  const handleGameModeChange = (mode: GameMode) => {
    setGameMode(mode);
    resetGame();
  };

  // Calculate winning line style
  const calculateLineStyle = () => {
    if (!winningLine) return {};

    const firstCell = winningLine[0];
    const lastCell = winningLine[winningLine.length - 1];
    const firstRow = Math.floor(firstCell / gridSize);
    const firstCol = firstCell % gridSize;
    const lastRow = Math.floor(lastCell / gridSize);
    const lastCol = lastCell % gridSize;

    let width = "";
    let height = "4px";
    let top = "";
    let left = "";
    let angle = 0;
    let transformOrigin = "center center";

    if (firstRow === lastRow) {
      // Horizontal line
      width = "100%";
      top = `calc(${(firstRow + 0.5) * 100 / gridSize}%)`;
      left = "0";
      angle = 0;
    } else if (firstCol === lastCol) {
      // Vertical line
      width = "4px";
      height = "100%";
      top = "0";
      left = `calc(${(firstCol + 0.5) * 100 / gridSize}%)`;
      angle = 0;
    } else if (firstCell === 0 && lastCell === gridSize * gridSize - 1) {
      // Diagonal from top-left to bottom-right
      width = `${Math.sqrt(2) * 100}%`;
      top = "0";
      left = "0";
      angle = 45;
      transformOrigin = "0% 0%";
    } else {
      // Diagonal from top-right to bottom-left
      width = `${Math.sqrt(2) * 100}%`;
      top = "0";
      left = "100%";
      angle = -45;
      transformOrigin = "100% 0%";
    }

    return {
      position: "absolute",
      backgroundColor: "yellow",
      width,
      height,
      top,
      left,
      transform: `rotate(${angle}deg)`,
      transformOrigin,
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center py-8 px-4">
      <h1 className="text-4xl font-bold text-blue-400 mb-8">Tic Tac Toe</h1>

      <div className="w-full max-w-md mb-6 space-y-4">
        <div className="flex space-x-2 justify-center">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-md transition ${
              gameMode === "twoPlayer" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => handleGameModeChange("twoPlayer")}
          >
            Two Players
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-md transition ${
              gameMode === "ai" ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => handleGameModeChange("ai")}
          >
            Play Against AI
          </motion.button>
        </div>

        <div className="flex flex-col space-y-2">
          <label htmlFor="gridSize" className="text-center">
            Grid Size: {gridSize}x{gridSize}
          </label>
          <input
            type="range"
            id="gridSize"
            min="3"
            max="10"
            value={gridSize}
            onChange={handleGridSizeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {winner ? (
        <div className="mb-6 text-center">
          <p className="text-xl font-semibold mb-2">
            {winner === "draw" ? "It's a draw!" : `Player ${winner} wins!`}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
            onClick={resetGame}
          >
            Play Again
          </motion.button>
        </div>
      ) : (
        <div className="mb-6 text-center">
          <p className="text-xl font-semibold">
            {isAIThinking ? "AI is thinking..." : `Current Player: ${currentPlayer}`}
          </p>
        </div>
      )}

      <div
        className="relative bg-gray-800 p-2 rounded-lg shadow-lg"
        style={{ width: "min(100%, 500px)", aspectRatio: "1 / 1" }}
      >
        <div
          className="grid gap-2 w-full h-full relative"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
            gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {board.map((cell, index) => (
            <motion.div
              key={index}
              whileHover={!cell && !winner && !isAIThinking ? { scale: 1.05 } : {}}
              whileTap={!cell && !winner && !isAIThinking ? { scale: 0.95 } : {}}
              className={`bg-gray-700 rounded-md flex items-center justify-center cursor-pointer text-xl sm:text-3xl md:text-4xl font-bold ${
                cell === "X" ? "text-blue-400" : "text-red-400"
              }`}
              onClick={() => handleCellClick(index)}
            >
              {cell && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {cell}
                </motion.span>
              )}
            </motion.div>
          ))}

          {winningLine && (
            <motion.div
              className="absolute z-10"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={calculateLineStyle() as React.CSSProperties}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TicTacToe;