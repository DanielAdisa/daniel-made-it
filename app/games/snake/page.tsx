"use client";
import React, { useState, useRef, useEffect } from 'react';

// Make these values dynamic based on screen size
const maxCanvasWidth = 400;
const maxCanvasHeight = 400;
const scale = 20; // Grid cell size in pixels

// Define speed options with labels and millisecond values
const speedOptions = [
  { label: "Slow", value: 200 },
  { label: "Medium", value: 150 },
  { label: "Fast", value: 100 },
  { label: "Very Fast", value: 70 }
];

interface SnakeSegment {
  x: number;
  y: number;
}

interface Food {
  x: number;
  y: number;
}

// New interface for super food
interface SuperFood extends Food {
  active: boolean;
  timeRemaining: number;
}

const SnakeGame = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: maxCanvasWidth, height: maxCanvasHeight });
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
  const [isPaused, setIsPaused] = useState(false); // New state for pause functionality
  const [wallCollision, setWallCollision] = useState(false); // New state for wall collision mode
  const [isMuted, setIsMuted] = useState(false); // New state for audio mute control
  
  // New states for super food
  const [foodCounter, setFoodCounter] = useState(0);
  const [superFood, setSuperFood] = useState<SuperFood>({ 
    x: 0, 
    y: 0, 
    active: false, 
    timeRemaining: 0 
  });
  const superFoodSoundRef = useRef<HTMLAudioElement | null>(null);

  // Audio references
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const foodSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window !== 'undefined') {
      // Create audio elements
      backgroundMusicRef.current = new Audio('/audio/snake-background.mp3');
      foodSoundRef.current = new Audio('/audio/snake-eat.mp3');
      gameOverSoundRef.current = new Audio('/audio/snake-gameover.mp3');
      // Add super food sound
      superFoodSoundRef.current = new Audio('/audio/snake-eat2.mp3'); // Reuse existing sound or replace with new one
      
      // Configure background music to loop
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.loop = true;
        backgroundMusicRef.current.volume = 0.5; // Set to 50% volume
      }
      
      // Configure super food sound with higher pitch
      if (superFoodSoundRef.current) {
        superFoodSoundRef.current.playbackRate = 1.5; // Faster pitch for super food
        superFoodSoundRef.current.volume = 0.7; // Slightly louder
      }
      
      // Load mute preference from localStorage if available
      const savedMuteState = localStorage.getItem('snakeMuteState');
      if (savedMuteState) {
        setIsMuted(savedMuteState === 'true');
      }
    }
    
    // Cleanup function
    return () => {
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

  // Handle mute state changes
  useEffect(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.muted = isMuted;
    }
    if (foodSoundRef.current) {
      foodSoundRef.current.muted = isMuted;
    }
    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.muted = isMuted;
    }
    if (superFoodSoundRef.current) {
      superFoodSoundRef.current.muted = isMuted;
    }
    
    // Save mute preference to localStorage
    localStorage.setItem('snakeMuteState', isMuted.toString());
  }, [isMuted]);

  // Play/pause background music based on game state
  useEffect(() => {
    if (backgroundMusicRef.current) {
      if (gameStarted && !gameOver && !isPaused) {
        backgroundMusicRef.current.play().catch(err => {
          console.log('Auto-play prevented:', err);
        });
      } else {
        backgroundMusicRef.current.pause();
      }
    }
  }, [gameStarted, gameOver, isPaused]);

  // Function to play the food sound
  const playFoodSound = () => {
    if (foodSoundRef.current && !isMuted) {
      // Reset the audio to start
      foodSoundRef.current.currentTime = 0;
      foodSoundRef.current.play().catch(err => {
        console.log('Could not play food sound:', err);
      });
    }
  };

  // Function to play the super food sound
  const playSuperFoodSound = () => {
    if (superFoodSoundRef.current && !isMuted) {
      // Reset the audio to start
      superFoodSoundRef.current.currentTime = 0;
      superFoodSoundRef.current.play().catch(err => {
        console.log('Could not play super food sound:', err);
      });
    }
  };

  // Function to play the game over sound
  const playGameOverSound = () => {
    if (gameOverSoundRef.current && !isMuted) {
      gameOverSoundRef.current.play().catch(err => {
        console.log('Could not play game over sound:', err);
      });
    }
  };

  // Toggle mute function
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Super food timer effect
  useEffect(() => {
    if (gameOver || !gameStarted || isPaused) return;
    
    const interval = setInterval(() => {
      if (superFood.active) {
        // Update super food timer
        const newTimeRemaining = superFood.timeRemaining - 100;
        if (newTimeRemaining <= 0) {
          // Super food expires
          setSuperFood(prev => ({...prev, active: false, timeRemaining: 0}));
        } else {
          // Update remaining time
          setSuperFood(prev => ({...prev, timeRemaining: newTimeRemaining}));
        }
      }
    }, 100); // Check every 100ms
    
    return () => clearInterval(interval);
  }, [gameStarted, gameOver, isPaused, superFood]);

  // Resize canvas to fit container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        // Get the container width and maintain aspect ratio
        const containerWidth = containerRef.current.clientWidth;
        const newWidth = Math.min(containerWidth, maxCanvasWidth);
        const newHeight = newWidth; // Keep it square by making height equal to width
        
        setCanvasSize({ width: newWidth, height: newHeight });
      }
    };

    // Initial sizing
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      // Add pause functionality on 'p' or 'Escape' key press
      if (e.key === 'p' || e.key === 'Escape') {
        if (gameStarted && !gameOver) {
          setIsPaused(prev => !prev);
          return;
        }
      }
      
      // Only respond to arrow keys
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      
      if (!gameStarted && !gameOver) setGameStarted(true);
      if (isPaused) setIsPaused(false); // Resume game if paused
      
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
  }, [direction, gameStarted, gameOver, isPaused]);

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
      
      // Resume game if paused when swiped
      if (isPaused) setIsPaused(false);
      
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
  }, [direction, gameStarted, gameOver, isPaused]);

  // Main game loop
  useEffect(() => {
    if (gameOver || !gameStarted || isPaused) return;
    const interval = setInterval(() => moveSnake(), speed);
    return () => clearInterval(interval);
  }, [snake, direction, gameOver, speed, gameStarted, isPaused]);

  // Generate super food position
  const generateSuperFood = (snakeBody: SnakeSegment[]): Food => {
    let newSuperFood: Food;
    
    // Calculate grid size based on current canvas dimensions
    const gridWidth = Math.floor(canvasSize.width / scale);
    const gridHeight = Math.floor(canvasSize.height / scale);
    
    while (true) {
      newSuperFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
      };
      
      // Check collision with snake
      const collisionWithSnake = snakeBody.some(
        (segment) => segment.x === newSuperFood.x && segment.y === newSuperFood.y
      );
      
      // Check collision with regular food
      const collisionWithFood = food.x === newSuperFood.x && food.y === newSuperFood.y;
      
      if (!collisionWithSnake && !collisionWithFood) break;
    }
    return newSuperFood;
  };

  // Move snake and handle logic - updated with super food handling
  const moveSnake = () => {
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };

    // Calculate grid size based on current canvas dimensions
    const gridWidth = Math.floor(canvasSize.width / scale);
    const gridHeight = Math.floor(canvasSize.height / scale);
    
    // Handle wall collision based on mode
    if (!wallCollision) {
      // Portal walls mode
      if (newHead.x < 0) {
        newHead.x = gridWidth - 1; // Appear on right side
      } else if (newHead.x >= gridWidth) {
        newHead.x = 0; // Appear on left side
      }
      
      if (newHead.y < 0) {
        newHead.y = gridHeight - 1; // Appear on bottom
      } else if (newHead.y >= gridHeight) {
        newHead.y = 0; // Appear on top
      }
    } else {
      // Wall collision mode
      if (newHead.x < 0 || 
          newHead.x >= gridWidth || 
          newHead.y < 0 || 
          newHead.y >= gridHeight) {
        handleGameOver();
        return;
      }
    }

    // Check self-collision
    for (let segment of snake) {
      if (newHead.x === segment.x && newHead.y === segment.y) {
        handleGameOver();
        return;
      }
    }

    let newSnake = [newHead, ...snake];
    
    // Check if snake ate regular food
    if (newHead.x === food.x && newHead.y === food.y) {
      // Increase food counter
      const newFoodCount = foodCounter + 1;
      setFoodCounter(newFoodCount);
      
      // Generate new regular food
      setFood(generateFood(newSnake));
      
      // Update score
      const newScore = score + 10;
      setScore(newScore);
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 500);
      
      // Play food sound
      playFoodSound();
      
      // Check if we should spawn super food (every 5 regular foods)
      if (newFoodCount % 5 === 0) {
        const superFoodPos = generateSuperFood(newSnake);
        setSuperFood({
          x: superFoodPos.x,
          y: superFoodPos.y,
          active: true,
          timeRemaining: 5000 // 5 seconds in milliseconds
        });
      }
      
      if (newSnake.length % 5 === 0) {
        // Only auto-increase speed if it's not already very fast
        setSpeed((prevSpeed) => Math.max(prevSpeed - 5, 50));
      }
    } 
    // Check if snake ate super food
    else if (superFood.active && newHead.x === superFood.x && newHead.y === superFood.y) {
      // Add 5 segments to the snake instead of just 1
      for (let i = 0; i < 4; i++) { // Add 4 extra segments (we already keep 1 from not popping)
        newSnake.push({ ...newSnake[newSnake.length - 1] });
      }
      
      // Update score (bonus points for super food)
      const newScore = score + 50;
      setScore(newScore);
      setScoreFlash(true);
      setTimeout(() => setScoreFlash(false), 500);
      
      // Play super food sound
      playSuperFoodSound();
      
      // Deactivate super food
      setSuperFood({...superFood, active: false, timeRemaining: 0});
    }
    else {
      // If no food eaten, remove the tail segment
      newSnake.pop();
    }
    
    setSnake(newSnake);
    drawGame(newSnake, food);
  };

  // Handle game over state
  const handleGameOver = () => {
    setGameOver(true);
    // Play game over sound
    playGameOverSound();
    
    // Update high score if current score is higher
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('snakeHighScore', score.toString());
    }
  };

  // Generate food position
  const generateFood = (snakeBody: SnakeSegment[]): Food => {
    let newFood: Food;
    
    // Calculate grid size based on current canvas dimensions
    const gridWidth = Math.floor(canvasSize.width / scale);
    const gridHeight = Math.floor(canvasSize.height / scale);
    
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
      };
      const collision = snakeBody.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!collision) break;
    }
    return newFood;
  };

  // Draw game elements - updated to include super food
  const drawGame = (snakeToDraw: SnakeSegment[], foodToDraw: Food) => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid
    ctx.strokeStyle = wallCollision ? '#FF4040' : '#222';
    ctx.lineWidth = wallCollision ? 0.5 : 0.5;
    for (let x = 0; x <= canvasSize.width; x += scale) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasSize.height; y += scale) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
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

    // Draw regular food with pulsating effect
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
    
    // Draw super food if active
    if (superFood.active) {
      // Larger, rainbow-colored pulsating effect for super food
      const superPulseValue = 1.2 + 0.3 * Math.sin(Date.now() / 100);
      const superFoodRadius = (scale / 1.5) * superPulseValue;
      
      // Create rainbow gradient for super food
      const superGradient = ctx.createRadialGradient(
        superFood.x * scale + scale / 2,
        superFood.y * scale + scale / 2,
        0,
        superFood.x * scale + scale / 2,
        superFood.y * scale + scale / 2,
        superFoodRadius
      );
      
      // Rainbow effect that changes over time
      const hue = (Date.now() / 20) % 360;
      superGradient.addColorStop(0, `hsl(${hue}, 100%, 70%)`);
      superGradient.addColorStop(0.5, `hsl(${hue + 60}, 100%, 50%)`);
      superGradient.addColorStop(1, `hsl(${hue + 120}, 100%, 30%)`);
      
      ctx.fillStyle = superGradient;
      ctx.beginPath();
      const superX = superFood.x * scale + scale / 2;
      const superY = superFood.y * scale + scale / 2;
      ctx.arc(superX, superY, superFoodRadius, 0, 2 * Math.PI);
      ctx.fill();
      
      // Add sparkles around the super food
      for (let i = 0; i < 5; i++) {
        const angle = (Date.now() / 300 + i * (Math.PI * 2 / 5)) % (Math.PI * 2);
        const sparkleX = superX + Math.cos(angle) * (superFoodRadius * 1.5);
        const sparkleY = superY + Math.sin(angle) * (superFoodRadius * 1.5);
        const sparkleSize = scale / 5 * (0.7 + 0.3 * Math.sin(Date.now() / 100 + i));
        
        ctx.fillStyle = `hsl(${(hue + i * 30) % 360}, 100%, 70%)`;
        ctx.beginPath();
        ctx.arc(sparkleX, sparkleY, sparkleSize, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Draw timer indicator for super food
      const timerPercentage = superFood.timeRemaining / 5000;
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(
        superFood.x * scale,
        superFood.y * scale - scale / 2,
        scale * timerPercentage,
        scale / 10
      );
    }
  };

  // Initial draw
  useEffect(() => {
    if (canvasRef.current) drawGame(snake, food);
  }, [canvasRef, canvasSize]);

  // Change speed setting
  const changeSpeed = (index: number): void => {
    setSelectedSpeedIndex(index);
    setSpeed(speedOptions[index].value);
  };
  
  // Toggle pause state
  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused(prev => !prev);
    }
  };
  
  // Toggle wall collision mode
  const toggleWallCollision = () => {
    if (!gameStarted || gameOver) {
      setWallCollision(prev => !prev);
    }
  };

  // Reset game with updated settings
  const resetGame = () => {
    setSnake([{ x: 5, y: 5 }]);
    setFood(generateFood([{ x: 5, y: 5 }]));
    setDirection({ x: 0, y: 0 });
    setGameOver(false);
    setGameStarted(false);
    setIsPaused(false);
    setScore(0);
    setFoodCounter(0);
    setSuperFood({ x: 0, y: 0, active: false, timeRemaining: 0 });
    // Don't reset speed, wall collision mode, and audio settings - keep user's preferred settings
    if (canvasRef.current) drawGame([{ x: 5, y: 5 }], { x: 10, y: 10 });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 px-4 py-6">
      <div className="w-full max-w-md mx-auto p-3 sm:p-6 bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl shadow-2xl text-white border border-gray-700">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-center">
          Snake Game
        </h2>
        
        <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-800 rounded-lg mb-3 sm:mb-4 font-mono text-base sm:text-lg border-l-4 border-cyan-500">
          <div className={`transition-transform duration-300 ${scoreFlash ? 'scale-125 text-cyan-400' : 'text-white'}`}>
            Score: {score}
          </div>
          <div className="text-yellow-500">
            High Score: {highScore}
          </div>
        </div>
        
        {/* Super food notification */}
        {superFood.active && (
          <div className="mb-3 px-2 py-1 bg-purple-600 bg-opacity-70 rounded-md text-center animate-pulse">
            <span className="font-bold">SUPER FOOD AVAILABLE!</span>
            <div className="w-full bg-gray-700 h-2 mt-1 rounded-full overflow-hidden">
              <div 
                className="bg-purple-300 h-full transition-all duration-100 ease-linear"
                style={{ width: `${(superFood.timeRemaining / 5000) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Game controls */}
        <div className="flex flex-col sm:flex-row justify-between mb-3 sm:mb-4 sm:space-x-2 space-y-2 sm:space-y-0">
          {/* Speed settings */}
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">Game Speed:</p>
            <div className="flex flex-wrap gap-1">
              {speedOptions.map((option, index) => (
                <button
                  key={option.label}
                  onClick={() => changeSpeed(index)}
                  disabled={gameStarted && !gameOver}
                  className={`px-1.5 sm:px-2 py-1 text-xs rounded-md transition-colors ${
                    selectedSpeedIndex === index
                      ? 'bg-cyan-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  } ${(gameStarted && !gameOver && !isPaused) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Wall collision toggle */}
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-300 mb-1 sm:mb-2">Wall Collision:</p>
            <button
              onClick={toggleWallCollision}
              disabled={gameStarted && !gameOver && !isPaused}
              className={`px-2 sm:px-3 py-1 text-xs rounded-md transition-colors w-full ${
                wallCollision
                  ? 'bg-red-600 text-white'
                  : 'bg-green-600 text-white'
              } ${(gameStarted && !gameOver && !isPaused) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {wallCollision ? 'ON (Deadly)' : 'OFF (Portal)'}
            </button>
          </div>
        </div>
        
        {/* Sound control */}
        <div className="mb-3 sm:mb-4">
          <button
            onClick={toggleMute}
            className={`w-full py-1.5 sm:py-2 rounded-md transition-colors ${
              isMuted
                ? 'bg-gray-700 text-white'
                : 'bg-indigo-600 text-white'
            }`}
          >
            {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
          </button>
        </div>
        
        {gameStarted && !gameOver && (
          <div className="mb-3 sm:mb-4">
            <button
              onClick={togglePause}
              className={`w-full py-1.5 sm:py-2 rounded-md transition-colors ${
                isPaused
                  ? 'bg-green-600 text-white'
                  : 'bg-amber-600 text-white'
              }`}
            >
              {isPaused ? 'Resume Game' : 'Pause Game'}
            </button>
          </div>
        )}
        
        {!gameStarted && !gameOver && (
          <div className="my-2 sm:my-3 p-2 sm:p-3 bg-gray-800 bg-opacity-50 rounded-md text-gray-300 italic text-center text-sm">
            Press arrow keys or swipe to start
          </div>
        )}
        
        {isPaused && (
          <div className="my-2 sm:my-3 p-2 sm:p-3 bg-gray-800 bg-opacity-50 rounded-md text-gray-300 text-center">
            <span className="font-bold text-amber-400">GAME PAUSED</span><br/>
            <span className="text-xs sm:text-sm italic">Press any arrow key, swipe, or click Resume to continue</span>
          </div>
        )}
        
        <div ref={containerRef} className="relative mx-auto w-full aspect-square max-w-[400px]">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="border-2 border-gray-700 rounded-md bg-gray-900 shadow-[0_0_15px_rgba(0,255,255,0.15)] mx-auto touch-none"
          />
          
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-md animate-pulse">
              <div className="text-3xl sm:text-4xl font-bold text-white">PAUSED</div>
            </div>
          )}
          
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 rounded-md animate-fade-in">
              <h3 className={`text-lg sm:text-xl font-bold mb-4 ${score > highScore - 10 && score === highScore ? 'text-yellow-400' : score > highScore ? 'text-cyan-400' : 'text-red-400'}`}>
                Game Over! Final Score: {score}
                {score > highScore - 10 && score === highScore && <span className="text-yellow-400 ml-2">New High Score!</span>}
              </h3>
              <button
                onClick={resetGame}
                className="px-5 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-700 text-white font-bold rounded-lg shadow-md hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-400 space-y-0.5 sm:space-y-1">
          <p>Use arrow keys to navigate</p>
          <p>Mobile users can swipe to change direction</p>
          <p>Press P or ESC to pause the game</p>
          <p>Every 5 foods eaten, a rainbow super food appears for 5 seconds</p>
          <p className={`${wallCollision ? 'text-red-400' : 'text-cyan-400'}`}>
            Wall Mode: {wallCollision ? 'Collision (walls kill)' : 'Portal (pass through walls)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;