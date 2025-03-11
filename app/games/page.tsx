"use client";
import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';

const canvasWidth = 400;
const canvasHeight = 400;
const scale = 20; // Grid cell size in pixels

const SnakeGame = () => {
  const canvasRef = useRef(null);
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(200); // Update interval in ms
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(false);

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

  // Move snake and handle logic
  const moveSnake = () => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    if (
      newHead.x < 0 ||
      newHead.x >= canvasWidth / scale ||
      newHead.y < 0 ||
      newHead.y >= canvasHeight / scale
    ) {
      handleGameOver();
      return;
    }

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
        setSpeed((prevSpeed) => Math.max(prevSpeed - 10, 50));
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

  // Reset game
  const resetGame = () => {
    setSnake([{ x: 5, y: 5 }]);
    setFood({ x: 10, y: 10 });
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
    setSpeed(200);
    if (canvasRef.current) drawGame([{ x: 5, y: 5 }], { x: 10, y: 10 });
  };

  return (
    
    <div className=" snake-game-container" style={{ 
      textAlign: 'center', 
      maxWidth: '500px', 
      margin: '0 auto',
      padding: '15px',
      backgroundColor: '#1e1e1e',
      borderRadius: '10px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
      color: '#fff',
      marginTop: '50px',
      gap: '15px',
      paddingTop: '20px'
    }}>
        <Navbar />
      <h2 style={{ 
        fontSize: '28px',
        marginBottom: '20px',
        background: 'linear-gradient(45deg, #00BFFF, #7B68EE)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 1px 3px rgba(0,0,0,0.3)'
      }}>Snake Game</h2>
      
      <div className="score-board" style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 15px',
        backgroundColor: '#2a2a2a',
        borderRadius: '5px',
        marginBottom: '15px',
        fontFamily: 'monospace',
        fontSize: '18px'
      }}>
        <div className={`current-score ${scoreFlash ? 'score-flash' : ''}`} style={{
          transition: 'transform 0.2s',
          transform: scoreFlash ? 'scale(1.3)' : 'scale(1)',
          color: scoreFlash ? '#00FFFF' : '#ffffff'
        }}>
          Score: {score}
        </div>
        <div className="high-score" style={{ color: '#FFA500' }}>High Score: {highScore}</div>
      </div>
      
      {!gameStarted && !gameOver && (
        <div style={{ 
          margin: '10px 0', 
          padding: '8px', 
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderRadius: '5px',
          color: '#aaa' 
        }}>
          Press arrow keys or swipe to start
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{
          border: '3px solid #333',
          borderRadius: '5px',
          background: '#121212',
          display: 'block',
          margin: '0 auto',
          touchAction: 'none',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.2)'
        }}
      />
      
      {gameOver && (
        <div className="game-over" style={{ 
          marginTop: '15px',
          padding: '10px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '8px',
          animation: 'fadeIn 0.5s'
        }}>
          <h3 style={{ color: score > highScore ? '#00FFFF' : '#ff5555' }}>
            Game Over! Final Score: {score}
            {score > highScore - 10 && score === highScore && <span style={{ color: '#FFA500' }}> - New High Score!</span>}
          </h3>
          <button
            onClick={resetGame}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(45deg, #4CAF50, #2E8B57)',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease',
              margin: '10px 0',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Play Again
          </button>
        </div>
      )}
      
      <div className="game-controls" style={{ 
        marginTop: '15px', 
        fontSize: '14px',
        color: '#888'
      }}>
        <p>Use arrow keys to navigate</p>
        <p>Mobile users can swipe to change direction</p>
      </div>
    </div>
  );
};

export default SnakeGame;