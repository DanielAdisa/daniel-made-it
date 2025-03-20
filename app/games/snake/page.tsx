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

  // Draw game elements - updated for modern look
  const drawGame = (snakeToDraw: SnakeSegment[], foodToDraw: Food) => {
    const canvas = canvasRef.current as HTMLCanvasElement | null;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Modern dark background with subtle gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasSize.height);
    bgGradient.addColorStop(0, '#1a1a2e');
    bgGradient.addColorStop(1, '#16213e');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw subtle grid dots instead of lines for modern look
    ctx.fillStyle = wallCollision ? 'rgba(255, 64, 64, 0.15)' : 'rgba(255, 255, 255, 0.05)';
    for (let x = scale/2; x < canvasSize.width; x += scale) {
      for (let y = scale/2; y < canvasSize.height; y += scale) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw snake with modern gradient effect
    snakeToDraw.forEach((segment, index) => {
      // Create rounded rectangle for snake segments
      const roundedRect = (x: number, y: number, width: number, height: number, radius: number) => {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
      };
      
      const segmentSize = scale - 2; // Slightly smaller for gap effect
      const segmentX = segment.x * scale + 1;
      const segmentY = segment.y * scale + 1;
      
      if (index === 0) {
        // Snake head with gradient glow effect
        ctx.shadowColor = '#4FC3F7';
        ctx.shadowBlur = 10;
        
        // Create gradient
        const headGradient = ctx.createRadialGradient(
          segmentX + segmentSize/2, 
          segmentY + segmentSize/2, 
          0, 
          segmentX + segmentSize/2, 
          segmentY + segmentSize/2, 
          segmentSize
        );
        headGradient.addColorStop(0, '#00FFFF');
        headGradient.addColorStop(1, '#01579B');
        ctx.fillStyle = headGradient;
        
        // Draw slightly larger head
        const headSize = segmentSize + 1;
        roundedRect(segmentX - 0.5, segmentY - 0.5, headSize, headSize, 5);
        ctx.fill();
        
        // Remove shadow for other elements
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        
        // Add eyes to snake head
        ctx.fillStyle = 'white';
        const eyeSize = scale / 5;
        const eyeOffset = scale / 4;
        
        // Position eyes based on direction
        let leftEyeX, leftEyeY, rightEyeX, rightEyeY;
        
        if (direction.x === 1) { // moving right
          leftEyeX = segment.x * scale + scale - eyeOffset - eyeSize/2;
          leftEyeY = segment.y * scale + eyeOffset;
          rightEyeX = segment.x * scale + scale - eyeOffset - eyeSize/2;
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
        
        // Draw eyes with soft white glow
        const drawEye = (x: number, y: number) => {
          ctx.shadowColor = 'rgba(255,255,255,0.5)';
          ctx.shadowBlur = 4;
          ctx.beginPath();
          ctx.arc(x + eyeSize/2, y + eyeSize/2, eyeSize/2, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw pupils
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#000';
          ctx.beginPath();
          ctx.arc(x + eyeSize/2, y + eyeSize/2, eyeSize/4, 0, Math.PI * 2);
          ctx.fill();
          
          // Add reflection dot to eyes
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(x + eyeSize/1.5, y + eyeSize/3, eyeSize/6, 0, Math.PI * 2);
          ctx.fill();
        };
        
        drawEye(leftEyeX, leftEyeY);
        drawEye(rightEyeX, rightEyeY);
      } else {
        // Snake body with smooth gradient
        const gradientIntensity = Math.max(40, 180 - (index * 5));
        
        // Create different hue for tail segments
        let hue = 180; // cyan base color
        if (index > snakeToDraw.length * 0.7) {
          // Make the tail segments with a different hue
          hue = 210; // more blue
        }
        
        const segmentGradient = ctx.createRadialGradient(
          segmentX + segmentSize/2, 
          segmentY + segmentSize/2, 
          0, 
          segmentX + segmentSize/2, 
          segmentY + segmentSize/2, 
          segmentSize
        );
        
        segmentGradient.addColorStop(0, `hsla(${hue}, 100%, ${70 - index}%, 0.9)`);
        segmentGradient.addColorStop(1, `hsla(${hue}, 100%, ${40 - index/2}%, 0.7)`);
        
        ctx.fillStyle = segmentGradient;
        
        // Draw rounded rect for body segments with decreasing size for tapered tail
        const sizeFactor = Math.max(0.5, 1 - index/(snakeToDraw.length * 2));
        const tailSegmentSize = segmentSize * sizeFactor;
        const offset = (segmentSize - tailSegmentSize) / 2;
        
        roundedRect(
          segmentX + offset, 
          segmentY + offset, 
          tailSegmentSize, 
          tailSegmentSize, 
          5 * sizeFactor
        );
        ctx.fill();
      }
    });

    // Draw regular food with modern visuals
    const foodRadius = (scale / 2 - 1);
    const centerX = foodToDraw.x * scale + scale / 2;
    const centerY = foodToDraw.y * scale + scale / 2;
    
    // Pulsating effect
    const pulseValue = 0.9 + 0.2 * Math.sin(Date.now() / 200);
    const currentRadius = foodRadius * pulseValue;
    
    // Draw glowing apple-like shape for food
    ctx.shadowColor = 'rgba(255,40,40,0.8)';
    ctx.shadowBlur = 10;
    
    // Food gradient
    const foodGradient = ctx.createRadialGradient(
      centerX - currentRadius/3,
      centerY - currentRadius/3,
      0,
      centerX,
      centerY,
      currentRadius * 1.2
    );
    foodGradient.addColorStop(0, '#ff5555');
    foodGradient.addColorStop(0.7, '#dd0000');
    foodGradient.addColorStop(1, '#990000');
    
    ctx.fillStyle = foodGradient;
    
    // Draw apple-like shape
    ctx.beginPath();
    ctx.arc(centerX, centerY, currentRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // Add stem to apple
    ctx.fillStyle = '#7d5a38';
    ctx.fillRect(
      centerX - currentRadius/10, 
      centerY - currentRadius - currentRadius/5, 
      currentRadius/5, 
      currentRadius/3
    );
    
    // Add leaf
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(
      centerX + currentRadius/5, 
      centerY - currentRadius - currentRadius/10, 
      currentRadius/3, 
      currentRadius/6, 
      Math.PI/4, 
      0, 
      2 * Math.PI
    );
    ctx.fill();
    
    // Add shine to apple
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(
      centerX - currentRadius/3,
      centerY - currentRadius/3,
      currentRadius/3,
      0,
      2 * Math.PI
    );
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Draw super food if active
    if (superFood.active) {
      // Larger, rainbow-colored pulsating effect for super food
      const superPulseValue = 1 + 0.2 * Math.sin(Date.now() / 100);
      const superFoodRadius = (scale / 1.5) * superPulseValue;
      
      const superX = superFood.x * scale + scale / 2;
      const superY = superFood.y * scale + scale / 2;
      
      // Star shape for super food
      const spikes = 5;
      const outerRadius = superFoodRadius;
      const innerRadius = superFoodRadius / 2;
      
      // Rainbow glow effect
      const hue = (Date.now() / 20) % 360;
      ctx.shadowColor = `hsla(${hue}, 100%, 50%, 0.8)`;
      ctx.shadowBlur = 15;
      
      // Create star gradient
      const starGradient = ctx.createRadialGradient(
        superX, superY, 0,
        superX, superY, outerRadius * 1.5
      );
      
      starGradient.addColorStop(0, `hsla(${hue}, 100%, 80%, 1)`);
      starGradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 60%, 1)`);
      starGradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 100%, 40%, 1)`);
      
      ctx.fillStyle = starGradient;
      
      // Draw star shape
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (Math.PI * i) / spikes - Math.PI / 2;
        const x = superX + radius * Math.cos(angle);
        const y = superY + radius * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.fill();
      
      // Add shimmer effect with small rotating particles
      for (let i = 0; i < 8; i++) {
        const angle = (Date.now() / 1000 + i * (Math.PI / 4)) % (Math.PI * 2);
        const distance = superFoodRadius * 1.2;
        const shimmerX = superX + Math.cos(angle) * distance;
        const shimmerY = superY + Math.sin(angle) * distance;
        const shimmerSize = scale / 8 * (0.7 + 0.3 * Math.sin(Date.now() / 100 + i));
        
        // Particles with different colors
        ctx.fillStyle = `hsla(${(hue + i * 45) % 360}, 100%, 70%, ${0.5 + 0.5 * Math.sin(Date.now() / 200 + i)})`;
        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, shimmerSize, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      // Reset shadows
      ctx.shadowBlur = 0;
      
      // Draw timer indicator for super food
      const timerPercentage = superFood.timeRemaining / 5000;
      
      // Modern progress bar
      const barWidth = scale * 2;
      const barHeight = scale / 6;
      const barX = superX - barWidth / 2;
      const barY = superY - outerRadius - barHeight * 2;
      
      // Background of progress bar
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth, barHeight, barHeight / 2);
      ctx.fill();
      
      // Fill of progress bar with gradient
      const progressGradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
      progressGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 1)`);
      progressGradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 100%, 70%, 1)`);
      
      ctx.fillStyle = progressGradient;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barWidth * timerPercentage, barHeight, barHeight / 2);
      ctx.fill();
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900 px-4 py-6">
      <div className="w-full max-w-md mx-auto p-5 sm:p-7 bg-gradient-to-b from-slate-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(0,0,0,0.3)] text-white border-t border-white/10">
        <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 text-center">
          Snake Game
        </h2>
        
        <div className="flex justify-between items-center p-3 sm:p-4 bg-gray-800/50 backdrop-blur rounded-xl mb-4 sm:mb-5 font-mono text-base sm:text-lg">
          <div className={`transition-all duration-300 ${scoreFlash ? 'scale-125 text-cyan-400' : 'text-white'}`}>
            <span className="text-gray-400 text-xs mr-2">SCORE</span>
            <span className="text-cyan-200">{score}</span>
          </div>
          <div className="text-yellow-400">
            <span className="text-gray-400 text-xs mr-2">HI-SCORE</span>
            <span>{highScore}</span>
          </div>
        </div>
        
        {/* Super food notification */}
        {superFood.active && (
          <div className="mb-4 p-2 bg-gradient-to-r from-purple-600/70 to-fuchsia-600/70 rounded-lg text-center animate-pulse shadow-lg">
            <span className="font-bold text-white">SUPER FOOD AVAILABLE!</span>
            <div className="w-full bg-black/30 h-2 mt-1 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className="bg-gradient-to-r from-purple-300 to-fuchsia-300 h-full transition-all duration-100 ease-linear"
                style={{ width: `${(superFood.timeRemaining / 5000) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Game controls */}
        <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-5 sm:space-x-3 space-y-3 sm:space-y-0">
          {/* Speed settings */}
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2 font-medium">Game Speed:</p>
            <div className="flex flex-wrap gap-1.5">
              {speedOptions.map((option, index) => (
                <button
                  key={option.label}
                  onClick={() => changeSpeed(index)}
                  disabled={gameStarted && !gameOver}
                  className={`px-2 sm:px-3 py-1.5 text-xs rounded-full transition-all ${
                    selectedSpeedIndex === index
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-700 text-white shadow-md shadow-cyan-800/30'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700/80'
                  } ${(gameStarted && !gameOver && !isPaused) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Wall collision toggle */}
          <div className="flex-1">
            <p className="text-xs sm:text-sm text-gray-400 mb-1.5 sm:mb-2 font-medium">Wall Collision:</p>
            <button
              onClick={toggleWallCollision}
              disabled={gameStarted && !gameOver && !isPaused}
              className={`px-3 sm:px-4 py-1.5 text-xs rounded-full transition-all w-full ${
                wallCollision
                  ? 'bg-gradient-to-r from-red-500 to-red-700 text-white shadow-md shadow-red-800/30'
                  : 'bg-gradient-to-r from-green-500 to-green-700 text-white shadow-md shadow-green-800/30'
              } ${(gameStarted && !gameOver && !isPaused) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {wallCollision ? 'ON (Deadly)' : 'OFF (Portal)'}
            </button>
          </div>
        </div>
        
        {/* Sound control */}
        <div className="mb-4 sm:mb-5">
          <button
            onClick={toggleMute}
            className={`w-full py-2 sm:py-2.5 rounded-full transition-all ${
              isMuted
                ? 'bg-gray-700/80 text-white border border-white/10'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-800/30'
            }`}
          >
            {isMuted ? '🔇 Sound Off' : '🔊 Sound On'}
          </button>
        </div>
        
        {gameStarted && !gameOver && (
          <div className="mb-4 sm:mb-5">
            <button
              onClick={togglePause}
              className={`w-full py-2 sm:py-2.5 rounded-full transition-all ${
                isPaused
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md shadow-green-800/30'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-amber-800/30'
              }`}
            >
              {isPaused ? 'Resume Game' : 'Pause Game'}
            </button>
          </div>
        )}
        
        {!gameStarted && !gameOver && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gradient-to-r from-blue-900/20 to-slate-900/20 rounded-xl text-gray-300 italic text-center text-sm backdrop-blur-sm border border-white/5">
            Press arrow keys or swipe to start
          </div>
        )}
        
        {isPaused && (
          <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-gradient-to-r from-yellow-900/20 to-slate-900/20 rounded-xl text-center backdrop-blur-sm border border-white/5">
            <span className="font-bold text-amber-400 text-lg block mb-1">GAME PAUSED</span>
            <span className="text-xs sm:text-sm italic text-gray-300">Press any arrow key, swipe, or click Resume to continue</span>
          </div>
        )}
        
        <div ref={containerRef} className="relative mx-auto w-full aspect-square max-w-[400px] mb-4">
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            className="rounded-xl bg-gray-900 shadow-[0_0_25px_rgba(0,0,0,0.5)] mx-auto touch-none"
          />
          
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-xl backdrop-blur-sm animate-pulse">
              <div className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">PAUSED</div>
            </div>
          )}
          
          {gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 rounded-xl backdrop-blur-sm">
              <h3 className={`text-lg sm:text-xl font-bold mb-5 ${score > highScore - 10 && score === highScore ? 'text-yellow-400' : score > highScore ? 'text-cyan-400' : 'text-white'}`}>
                Game Over! Final Score: {score}
                {score > highScore - 10 && score === highScore && (
                  <span className="text-yellow-400 ml-2 inline-block animate-bounce">🏆</span>
                )}
              </h3>
              <button
                onClick={resetGame}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-emerald-500 to-teal-700 text-white font-bold rounded-full shadow-lg shadow-emerald-800/50 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-50"
              >
                Play Again
              </button>
            </div>
          )}
        </div>
        
        <div className="text-xs sm:text-sm text-gray-400 space-y-1 sm:space-y-1.5 bg-gray-800/30 backdrop-blur-sm p-3 rounded-xl">
          <p className="flex items-center">
            <span className="bg-gray-700/70 rounded-full p-1 mr-2 text-gray-300">🎮</span> 
            Use arrow keys to navigate
          </p>
          <p className="flex items-center">
            <span className="bg-gray-700/70 rounded-full p-1 mr-2 text-gray-300">👆</span> 
            Mobile users can swipe to change direction
          </p>
          <p className="flex items-center">
            <span className="bg-gray-700/70 rounded-full p-1 mr-2 text-gray-300">⏸️</span>
            Press P or ESC to pause the game
          </p>
          <p className="flex items-center">
            <span className="bg-gray-700/70 rounded-full p-1 mr-2 text-gray-300">🌟</span> 
            Every 5 foods eaten, a rainbow super food appears for 5 seconds
          </p>
          <p className={`flex items-center ${wallCollision ? 'text-red-400' : 'text-cyan-400'}`}>
            <span className={`${wallCollision ? 'bg-red-800/40' : 'bg-cyan-800/40'} rounded-full p-1 mr-2`}>
              {wallCollision ? '💥' : '🔄'}
            </span>
            Wall Mode: {wallCollision ? 'Collision (walls kill)' : 'Portal (pass through walls)'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;