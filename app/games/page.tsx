"use client";
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';

const canvasWidth = 400;
const canvasHeight = 400;
const scale = 20; // Grid cell size in pixels

// Define speed options with labels and millisecond values
const speedOptions = [
  { label: "Slow", value: 200 },
  { label: "Medium", value: 150 },
  { label: "Fast", value: 100 },
  { label: "Very Fast", value: 70 }
];

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(speedOptions[1].value); // Default to medium speed
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(false);
  const [selectedSpeedIndex, setSelectedSpeedIndex] = useState(1); // Default to medium

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Keyboard input handling
  useEffect(() => {
    interface Direction {
      x: number;
      y: number;
    }

    interface SnakeSegment {
      x: number;
      y: number;
    }

    interface Food {
      x: number;
      y: number;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to arrow keys
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      
      if (!gameStarted && !gameOver) setGameStarted(true);
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameStarted, gameOver]);

  // Mobile swipe handling
  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;
    
    let touchStartX: number | null = null;
    let touchStartY: number | null = null;

    interface TouchEventWithPreventDefault extends TouchEvent {
      preventDefault: () => void;
    }

    const handleTouchStart = (e: TouchEventWithPreventDefault) => {
      e.preventDefault(); // Prevent scrolling when touching the canvas
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    interface TouchEventWithPreventDefault extends TouchEvent {
      preventDefault: () => void;
    }

    const handleTouchMove = (e: TouchEventWithPreventDefault) => {
      e.preventDefault(); // Prevent scrolling
    };

    interface TouchEventWithPreventDefault extends TouchEvent {
      preventDefault: () => void;
    }

    interface Direction {
      x: number;
      y: number;
    }

    const handleTouchEnd = (e: TouchEventWithPreventDefault) => {
      e.preventDefault(); // Prevent any default behavior
      
      // Start the game on touch if not already started
      if (!gameStarted && !gameOver) {
        setGameStarted(true);
        // Set an initial direction on first touch if no direction is set
        if (direction.x === 0 && direction.y === 0) {
          setDirection({ x: 1, y: 0 }); // Start moving right by default
        }
      }
      
      if (touchStartX === null || touchStartY === null) return;
      
      const touch = e.changedTouches[0];
      const touchEndX = touch.clientX;
      const touchEndY = touch.clientY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      // Only change direction if swipe is significant enough
      if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) return;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 0 && direction.x !== -1) setDirection({ x: 1, y: 0 });
        else if (diffX < 0 && direction.x !== 1) setDirection({ x: -1, y: 0 });
      } else {
        if (diffY > 0 && direction.y !== -1) setDirection({ x: 0, y: 1 });
        else if (diffY < 0 && direction.y !== 1) setDirection({ x: 0, y: -1 });
      }
      
      touchStartX = null;
      touchStartY = null;
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [direction, gameStarted, gameOver]);

  // Main game loop
  useEffect(() => {
    if (gameOver || !gameStarted) return;
    const interval = setInterval(() => moveSnake(), speed);
    return () => clearInterval(interval);
  }, [snake, direction, gameOver, speed, gameStarted]);

  // Move snake and handle logic - updated with wall passing
  const moveSnake = () => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Handle wall passing
    if (newHead.x < 0) {
      newHead.x = Math.floor(canvasWidth / scale) - 1; // Appear on right side
    } else if (newHead.x >= canvasWidth / scale) {
      newHead.x = 0; // Appear on left side
    }
    
    if (newHead.y < 0) {
      newHead.y = Math.floor(canvasHeight / scale) - 1; // Appear on bottom
    } else if (newHead.y >= canvasHeight / scale) {
      newHead.y = 0; // Appear on top
    }

    // Check self-collision
    for (let segment of snake) {
      if (newHead.x === segment.x && newHead.y === segment.y) {
        handleGameOver();
        return;
      }
    }

    let newSnake = [newHead, ...snake];
    if (newHead.x === food.x && newHead.y === food.y) {
      setFood(generateFood(newSnake));
      const newScore = score + 10;
      setScore(newScore);
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 500);
      
      if (newSnake.length % 5 === 0) {
        // Only auto-increase speed if it's not already very fast
        setSpeed((prevSpeed) => Math.max(prevSpeed - 5, 50));
      }
    } else {
      newSnake.pop();
    }
    setSnake(newSnake);
    drawGame(newSnake, food);
  };

  // Handle game over state
  const handleGameOver = () => {
    setGameOver(true);
    // Update high score if current score is higher
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  };

  // Generate food position
interface SnakeSegment {
    x: number;
    y: number;
}

interface Food {
    x: number;
    y: number;
}

const generateFood = (snakeBody: SnakeSegment[]): Food => {
    let newFood: Food;
    while (true) {
        newFood = {
            x: Math.floor(Math.random() * (canvasWidth / scale)),
            y: Math.floor(Math.random() * (canvasHeight / scale)),
        };
        const collision = snakeBody.some(
            (segment) => segment.x === newFood.x && segment.y === newFood.y
        );
        if (!collision) break;
    }
    return newFood;
};

  // Draw game elements
interface SnakeSegment {
    x: number;
    y: number;
}

interface Food {
    x: number;
    y: number;
}

interface Direction {
    x: number;
    y: number;
}

const drawGame = (snakeToDraw: SnakeSegment[], foodToDraw: Food) => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvasWidth; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
    }
    for (let y = 0; y <= canvasHeight; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
    }

    // Draw snake with gradient effect
    snakeToDraw.forEach((segment, index) => {
        if (index === 0) {
            // Snake head
            ctx.fillStyle = '#00FFFF';
        } else {
            // Snake body with gradient
            const gradientValue = Math.max(50, 200 - (index * 7));
            ctx.fillStyle = `rgb(0, ${gradientValue}, ${gradientValue / 2})`;
        }
        ctx.fillRect(segment.x * scale, segment.y * scale, scale - 1, scale - 1);
        
        // Add eyes to snake head
        if (index === 0) {
            ctx.fillStyle = '#000';
            const eyeSize = scale / 5;
            const eyeOffset = scale / 4;
            
            // Position eyes based on direction
            let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
            
            if (direction.x === 1) { // moving right
                leftEyeX = segment.x * scale + scale - eyeOffset;
                leftEyeY = segment.y * scale + eyeOffset;
                rightEyeX = segment.x * scale + scale - eyeOffset;
                rightEyeY = segment.y * scale + scale - eyeOffset - eyeSize;
            } else if (direction.x === -1) { // moving left
                leftEyeX = segment.x * scale + eyeOffset;
                leftEyeY = segment.y * scale + eyeOffset;
                rightEyeX = segment.x * scale + eyeOffset;
                rightEyeY = segment.y * scale + scale - eyeOffset - eyeSize;
            } else if (direction.y === -1) { // moving up
                leftEyeX = segment.x * scale + eyeOffset;
                leftEyeY = segment.y * scale + eyeOffset;
                rightEyeX = segment.x * scale + scale - eyeOffset - eyeSize;
                rightEyeY = segment.y * scale + eyeOffset;
            } else { // moving down or not moving
                leftEyeX = segment.x * scale + eyeOffset;
                leftEyeY = segment.y * scale + scale - eyeOffset - eyeSize;
                rightEyeX = segment.x * scale + scale - eyeOffset - eyeSize;
                rightEyeY = segment.y * scale + scale - eyeOffset - eyeSize;
            }
            
            ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
            ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);
        }
    });

    // Draw food with pulsating effect
    const pulseValue = 0.9 + 0.2 * Math.sin(Date.now() / 200);
    const foodRadius = (scale / 2 - 1) * pulseValue;
    
    // Create gradient for food
    const gradient = ctx.createRadialGradient(
        foodToDraw.x * scale + scale / 2,
        foodToDraw.y * scale + scale / 2,
        0,
        foodToDraw.x * scale + scale / 2,
        foodToDraw.y * scale + scale / 2,
        foodRadius
    );
    gradient.addColorStop(0, '#ff5555');
    gradient.addColorStop(1, '#aa0000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    const centerX = foodToDraw.x * scale + scale / 2;
    const centerY = foodToDraw.y * scale + scale / 2;
    ctx.arc(centerX, centerY, foodRadius, 0, 2 * Math.PI);
    ctx.fill();
};

  // Initial draw
  useEffect(() => {
    if (canvasRef.current) drawGame(snake, food);
  }, [canvasRef]);

  // Change speed setting
  const changeSpeed = (index) => {
    setSelectedSpeedIndex(index);
    setSpeed(speedOptions[index].value);
  };

  // Reset game with updated settings
  const resetGame = () => {
    setSnake([{ x: 5, y: 5 }]);
    setFood({ x: 10, y: 10 });
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    // Don't reset speed here - keep user's preferred speed
    if (canvasRef.current) drawGame([{ x: 5, y: 5 }], { x: 10, y: 10 });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <Navbar />
      <div className="w-full max-w-md mx-auto p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl text-white border border-gray-700">
        <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Snake Game
        </h2>
        
        <div className="flex justify-between items-center p-3 bg-gray-800 rounded-lg mb-4 font-mono text-lg border-l-4 border-cyan-500">
          <div className={`transition-transform duration-300 ${scoreFlash ? 'scale-125 text-cyan-400' : 'text-white'}`}>
            Score: {score}
          </div>
          <div className="text-yellow-500">
            High Score: {highScore}
          </div>
        </div>
        
        {/* Speed settings */}
        <div className="mb-4">
          <p className="text-sm text-gray-300 mb-2">Game Speed:</p>
          <div className="flex space-x-2">
            {speedOptions.map((option, index) => (
              <button
                key={option.label}
                onClick={() => changeSpeed(index)}
                disabled={gameStarted && !gameOver}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  selectedSpeedIndex === index
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                } ${(gameStarted && !gameOver) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {gameStarted && !gameOver && (
            <p className="text-xs text-gray-400 mt-1 italic">Speed can only be changed before game starts or after game over</p>
          )}
        </div>
        
        {!gameStarted && !gameOver && (
          <div className="my-3 p-3 bg-gray-800 bg-opacity-50 rounded-md text-gray-300 italic text-center">
            Press arrow keys or swipe to start
          </div>
        )}
        
        <div className="relative mx-auto w-full aspect-square max-w-[400px]">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="border-2 border-gray-700 rounded-md bg-gray-900 shadow-[0_0_15px_rgba(0,255,255,0.15)] mx-auto touch-none"
          />
          
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded-md animate-fade-in">
              <h3 className={`text-xl font-bold mb-4 ${score > highScore - 10 && score === highScore ? 'text-yellow-400' : score > highScore ? 'text-cyan-400' : 'text-red-400'}`}>
                Game Over! Final Score: {score}
                {score > highScore - 10 && score === highScore && <span className="text-yellow-400 ml-2">New High Score!</span>}
              </h3>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-700 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-sm text-gray-400 space-y-1">
          <p>Use arrow keys to navigate</p>
          <p>Mobile users can swipe to change direction</p>
          <p className="text-cyan-400">Portal Walls: Snake can pass through walls!</p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;