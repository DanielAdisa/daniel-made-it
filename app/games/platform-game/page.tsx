'use client';

import { useState, useEffect, useRef } from 'react';
import { FaVolumeUp, FaVolumeMute, FaArrowLeft, FaArrowRight, FaRandom, FaStar, FaCircle, FaSquare, FaSmile, FaTachometerAlt, FaPalette, FaArrowsAltH, FaArrowsAltV } from 'react-icons/fa';
import { motion } from 'framer-motion';

type Difficulty = 'easy' | 'medium' | 'hard';
type PlayerSide = 'left' | 'right';
type BallDesign = 'square' | 'circle' | 'emoji';
type GameSpeed = 'slow' | 'normal' | 'fast';
type PaddleTheme = 'classic' | 'neon' | 'cosmic' | 'fire' | 'ice';
type GameOrientation = 'horizontal' | 'vertical';

interface GameState {
  playerScore: number;
  aiScore: number;
  isPlaying: boolean;
  lastScorer: 'player' | 'ai' | null;
  waitingForServe: boolean;
}

const PingPongGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerSide, setPlayerSide] = useState<PlayerSide>('left');
  const [ballDesign, setBallDesign] = useState<BallDesign>('square');
  const [ballColor, setBallColor] = useState<string>('#f97316'); // Orange default
  const [paddleTheme, setPaddleTheme] = useState<PaddleTheme>('neon');
  const [gameSpeed, setGameSpeed] = useState<GameSpeed>('normal');
  const [gameOrientation, setGameOrientation] = useState<GameOrientation>('horizontal');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>({
    playerScore: 0,
    aiScore: 0,
    isPlaying: false,
    lastScorer: null,
    waitingForServe: false,
  });
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showSideSelection, setShowSideSelection] = useState<boolean>(false);
  const [touchY, setTouchY] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  // Available ball colors
  const ballColors = [
    { name: 'Orange', value: '#f97316' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Yellow', value: '#eab308' },
  ];

  // Paddle theme settings
  const paddleThemes = {
    classic: {
      player: '#f8fafc',
      ai: '#f8fafc',
      glow: 'rgba(255, 255, 255, 0.6)'
    },
    neon: {
      player: '#3b82f6',
      ai: '#ef4444',
      glow: 'rgba(191, 219, 254, 0.8)'
    },
    cosmic: {
      player: '#8b5cf6',
      ai: '#06b6d4',
      glow: 'rgba(167, 139, 250, 0.8)'
    },
    fire: {
      player: '#f97316',
      ai: '#fbbf24',
      glow: 'rgba(251, 146, 60, 0.8)'
    },
    ice: {
      player: '#06b6d4',
      ai: '#93c5fd',
      glow: 'rgba(125, 211, 252, 0.8)'
    }
  };

  // Game speed multipliers
  const speedMultipliers = {
    slow: 0.7,
    normal: 1.0,
    fast: 1.4,
  };

  // Audio refs
  const paddleHitSoundRef = useRef<HTMLAudioElement | null>(null);
  const wallHitSoundRef = useRef<HTMLAudioElement | null>(null);
  const scoreSoundRef = useRef<HTMLAudioElement | null>(null);
  const gameStartSoundRef = useRef<HTMLAudioElement | null>(null);
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);

  
  // Function to create particle effects when ball hits something
const createParticles = (x: number, y: number, count: number, color: string) => {
  const game = gameRef.current;
  
  for (let i = 0; i < count; i++) {
    // Add some randomness to particle positioning
    const randomX = x + (Math.random() * 20 - 10);
    const randomY = y + (Math.random() * 20 - 10);
    
    // Randomize particle properties
    const size = Math.random() * 3 + 1;
    const life = Math.random() * 20 + 10;
    
    // Add particle to the game's particle effects array
    game.particleEffects.push({
      x: randomX,
      y: randomY,
      size: size,
      color: color,
      life: life
    });
  }
};


  // Game variables - updated to handle both orientations
  const paddleHeight = gameOrientation === 'horizontal' ? 140 : 15;
  const paddleWidth = gameOrientation === 'horizontal' ? 15 : 140;
  const ballSize = 15;
  const difficultySettings = {
    easy: 0.02,
    medium: 0.04,
    hard: 0.07,
  };

  // Game colors
  const colors = {
    background: '#0f172a',
    centerLine: '#475569',
    paddle: paddleThemes[paddleTheme].player, 
    aiPaddle: paddleThemes[paddleTheme].ai,
    ball: ballColor,
    playerSide: 'rgba(59, 130, 246, 0.1)', // Light blue tint
    aiSide: 'rgba(239, 68, 68, 0.1)', // Light red tint
    trail: `rgba(${parseInt(ballColor.slice(1, 3), 16)}, ${parseInt(ballColor.slice(3, 5), 16)}, ${parseInt(ballColor.slice(5, 7), 16)}, 0.3)`,
    stars: ['#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#f44336'], // Colors for star particles
  };

  // Game loop with reference values
  const gameRef = useRef({
    player: { y: 0, x: 0, speed: 0 },
    ai: { y: 0, x: 0, speed: 0 },
    ball: { x: 0, y: 0, speedX: 0, speedY: 0 },
    canvasWidth: 0,
    canvasHeight: 0,
    ballTrail: [] as {x: number, y: number}[],
    particleEffects: [] as {x: number, y: number, size: number, color: string, life: number}[],
    stars: [] as {x: number, y: number, size: number, color: string, speed: number}[],
    emoji: '🏓', // Default emoji for ball
  });

  // Initialize audio elements
  useEffect(() => {
    paddleHitSoundRef.current = new Audio('/sounds/paddle-hit.mp3');
    wallHitSoundRef.current = new Audio('/sounds/wall-hit.mp3');
    scoreSoundRef.current = new Audio('/sounds/score1.mp3');
    gameStartSoundRef.current = new Audio('/sounds/game-start.mp3');
    backgroundMusicRef.current = new Audio('/sounds/bg-music2.mp3');
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = 0.3;
    }
    
    // Set default volume levels
    if (paddleHitSoundRef.current) paddleHitSoundRef.current.volume = 0.4;
    if (wallHitSoundRef.current) wallHitSoundRef.current.volume = 0.3;
    if (scoreSoundRef.current) scoreSoundRef.current.volume = 0.5;
    if (gameStartSoundRef.current) gameStartSoundRef.current.volume = 0.5;
    
    return () => {
      // Clean up and stop all audio
      if (backgroundMusicRef.current) backgroundMusicRef.current.pause();
      if (paddleHitSoundRef.current) paddleHitSoundRef.current.pause();
      if (wallHitSoundRef.current) wallHitSoundRef.current.pause();
      if (scoreSoundRef.current) scoreSoundRef.current.pause();
      if (gameStartSoundRef.current) gameStartSoundRef.current.pause();
    };
  }, []);

  // Initialize background stars
  useEffect(() => {
    const game = gameRef.current;
    if (!canvasRef.current) return;
    
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    // Create starry background
    for (let i = 0; i < 50; i++) {
      game.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        color: colors.stars[Math.floor(Math.random() * colors.stars.length)],
        speed: Math.random() * 0.5 + 0.1
      });
    }
  }, []);

  // Handle mute toggle
  useEffect(() => {
    const setMuted = (muted: boolean) => {
      if (paddleHitSoundRef.current) paddleHitSoundRef.current.muted = muted;
      if (wallHitSoundRef.current) wallHitSoundRef.current.muted = muted;
      if (scoreSoundRef.current) scoreSoundRef.current.muted = muted;
      if (gameStartSoundRef.current) gameStartSoundRef.current.muted = muted;
      if (backgroundMusicRef.current) backgroundMusicRef.current.muted = muted;
    };
    
    setMuted(isMuted);
  }, [isMuted]);

  // Function to play a sound
  const playSound = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log("Audio play error:", err));
    }
  };

  // Start game - updated to handle game orientation
  const startGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const game = gameRef.current;
    game.canvasWidth = canvas.width;
    game.canvasHeight = canvas.height;
    
    // Reset positions based on game orientation
    if (gameOrientation === 'horizontal') {
      // Horizontal gameplay (paddles on sides)
      game.player.y = game.canvasHeight / 2 - paddleHeight / 2;
      game.ai.y = game.canvasHeight / 2 - paddleHeight / 2;
      
      // Set x positions based on player side
      if (playerSide === 'left') {
        game.player.x = 0;
        game.ai.x = game.canvasWidth - paddleWidth;
      } else {
        game.player.x = game.canvasWidth - paddleWidth;
        game.ai.x = 0;
      }
    } else {
      // Vertical gameplay (paddles on top/bottom)
      game.player.x = game.canvasWidth / 2 - paddleWidth / 2;
      game.ai.x = game.canvasWidth / 2 - paddleWidth / 2;
      
      // Player is always at bottom in vertical mode
      game.player.y = game.canvasHeight - paddleHeight;
      game.ai.y = 0;
    }
    
    // Center ball
    game.ball.x = game.canvasWidth / 2;
    game.ball.y = game.canvasHeight / 2;
    
    // Apply speed based on game speed setting
    const baseSpeed = 5 * speedMultipliers[gameSpeed];
    
    if (gameOrientation === 'horizontal') {
      game.ball.speedX = Math.random() > 0.5 ? baseSpeed : -baseSpeed;
      game.ball.speedY = (Math.random() * 4 - 2) * speedMultipliers[gameSpeed];
    } else {
      game.ball.speedY = Math.random() > 0.5 ? baseSpeed : -baseSpeed;
      game.ball.speedX = (Math.random() * 4 - 2) * speedMultipliers[gameSpeed];
    }
    
    // Clear ball trail
    game.ballTrail = [];
    game.particleEffects = [];

    playSound(gameStartSoundRef);
    
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.play().catch(err => console.log("Music play error:", err));
    }

    setGameState(prev => ({ 
      ...prev, 
      isPlaying: true,
      waitingForServe: false,
      lastScorer: null
    }));
    
    // Close settings panel when game starts
    setShowSettings(false);
  };

  // Prepare to serve ball - updated for game orientation
  const prepareServe = (scorer: 'player' | 'ai') => {
    const game = gameRef.current;
    
    if (gameOrientation === 'horizontal') {
      // Horizontal gameplay - serve from sides
      if (scorer === 'ai') {
        // Position ball next to player paddle for them to serve
        if (playerSide === 'left') {
          game.ball.x = paddleWidth * 2;
        } else {
          game.ball.x = game.canvasWidth - paddleWidth * 2 - ballSize;
        }
        game.ball.y = game.player.y + paddleHeight / 2;
      } else {
        // Position ball next to AI paddle for them to serve
        if (playerSide === 'left') {
          game.ball.x = game.canvasWidth - paddleWidth * 2 - ballSize;
        } else {
          game.ball.x = paddleWidth * 2;
        }
        game.ball.y = game.ai.y + paddleHeight / 2;
      }
    } else {
      // Vertical gameplay - serve from top/bottom
      if (scorer === 'ai') {
        // Position ball next to player paddle (bottom) for them to serve
        game.ball.x = game.player.x + paddleWidth / 2;
        game.ball.y = game.canvasHeight - paddleHeight * 2 - ballSize;
      } else {
        // Position ball next to AI paddle (top) for them to serve
        game.ball.x = game.ai.x + paddleWidth / 2;
        game.ball.y = paddleHeight * 2;
      }
    }
    
    game.ball.speedX = 0;
    game.ball.speedY = 0;
    
    setGameState(prev => ({
      ...prev,
      waitingForServe: true,
      lastScorer: scorer
    }));
    
    // If AI needs to serve, do it automatically after a delay
    if (scorer === 'player') {
      setTimeout(() => {
        setGameState(currentState => {
          if (currentState.waitingForServe && currentState.lastScorer === 'player' && currentState.isPlaying) {
            serveFromAI();
          }
          return currentState;
        });
      }, 1000);
    }
  };

  // Player serves the ball - updated for game orientation
  const serveFromPlayer = () => {
    if (!gameState.waitingForServe || gameState.lastScorer !== 'ai') return;
    
    const game = gameRef.current;
    const baseSpeed = 5 * speedMultipliers[gameSpeed];
    
    if (gameOrientation === 'horizontal') {
      // Horizontal gameplay
      game.ball.speedX = playerSide === 'left' ? baseSpeed : -baseSpeed;
      game.ball.speedY = (Math.random() * 4 - 2) * speedMultipliers[gameSpeed]; 
    } else {
      // Vertical gameplay - always serve upward from bottom
      game.ball.speedY = -baseSpeed;
      game.ball.speedX = (Math.random() * 4 - 2) * speedMultipliers[gameSpeed];
    }
    
    setGameState(prev => ({
      ...prev,
      waitingForServe: false
    }));
    
    playSound(paddleHitSoundRef);
  };
  
  // AI serves the ball - updated for game orientation
  const serveFromAI = () => {
    const game = gameRef.current;
    const baseSpeed = 5 * speedMultipliers[gameSpeed];
    
    if (gameOrientation === 'horizontal') {
      // Horizontal gameplay
      game.ball.speedX = playerSide === 'left' ? -baseSpeed : baseSpeed;
      game.ball.speedY = (Math.random() * 4 - 2) * speedMultipliers[gameSpeed];
    } else {
      // Vertical gameplay - always serve downward from top
      game.ball.speedY = baseSpeed;
      game.ball.speedX = (Math.random() * 4 - 2) * speedMultipliers[gameSpeed];
    }
    
    setGameState(prev => ({
      ...prev,
      waitingForServe: false
    }));
    
    playSound(paddleHitSoundRef);
  };

  // Handle mouse movement - updated for game orientation
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !gameState.isPlaying) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const mouseX = e.clientX - rect.left;
    
    // Update player paddle position based on orientation
    if (gameOrientation === 'horizontal') {
      updatePlayerPosition(mouseY, null);
    } else {
      updatePlayerPosition(null, mouseX);
    }
  };

  // Handle touch events for mobile users - updated for game orientation
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!gameState.isPlaying) return;
    e.preventDefault(); // Prevent default to avoid scrolling
    
    if (e.touches.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const touchY = e.touches[0].clientY - rect.top;
      const touchX = e.touches[0].clientX - rect.left;
      
      setTouchY(touchY);
      setTouchX(touchX);
      
      // Also handle serve on touch for mobile
      if (gameState.waitingForServe && gameState.lastScorer === 'ai') {
        serveFromPlayer();
      }
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!gameState.isPlaying) return;
    e.preventDefault(); // Prevent scrolling
    
    if (e.touches.length > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const currentTouchY = e.touches[0].clientY - rect.top;
      const currentTouchX = e.touches[0].clientX - rect.left;
      
      // Update player paddle position based on orientation
      if (gameOrientation === 'horizontal') {
        updatePlayerPosition(currentTouchY, null);
      } else {
        updatePlayerPosition(null, currentTouchX);
      }
      
      setTouchY(currentTouchY);
      setTouchX(currentTouchX);
    }
  };

  const handleTouchEnd = () => {
    setTouchY(null);
    setTouchX(null);
  };

  // Update player position with boundaries check - updated for game orientation
  const updatePlayerPosition = (yPos: number | null, xPos: number | null) => {
    const game = gameRef.current;
    
    if (gameOrientation === 'horizontal') {
      if (yPos !== null) {
        game.player.y = yPos - paddleHeight / 2;
        
        // Keep paddle within canvas boundaries
        if (game.player.y < 0) game.player.y = 0;
        if (game.player.y + paddleHeight > game.canvasHeight) {
          game.player.y = game.canvasHeight - paddleHeight;
        }
      }
    } else {
      if (xPos !== null) {
        game.player.x = xPos - paddleWidth / 2;
        
        // Keep paddle within canvas boundaries
        if (game.player.x < 0) game.player.x = 0;
        if (game.player.x + paddleWidth > game.canvasWidth) {
          game.player.x = game.canvasWidth - paddleWidth;
        }
      }
    }
  };

  // Handle canvas click for serving
  const handleCanvasClick = () => {
    if (gameState.waitingForServe && gameState.lastScorer === 'ai') {
      serveFromPlayer();
    }
  };

  // Handle player side selection
  const toggleSideSelection = () => {
    setShowSideSelection(!showSideSelection);
  };
  
  const selectPlayerSide = (side: PlayerSide) => {
    setPlayerSide(side);
    setShowSideSelection(false);
  };

  const randomizeSide = () => {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    setPlayerSide(side as PlayerSide);
    setShowSideSelection(false);
  };
  
  // Toggle settings panel
  const toggleSettings = () => {
    if (!gameState.isPlaying) {
      setShowSettings(!showSettings);
    }
  };

  // Select paddle theme
  const selectPaddleTheme = (theme: PaddleTheme) => {
    setPaddleTheme(theme);
  };

  // Select game orientation
  const selectGameOrientation = (orientation: GameOrientation) => {
    setGameOrientation(orientation);
  };

  // Game rendering - updated for both orientations
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const game = gameRef.current;
    game.canvasWidth = canvas.width = canvas.clientWidth;
    game.canvasHeight = canvas.height = canvas.clientHeight;

    // Initialize positions based on orientation
    if (gameOrientation === 'horizontal') {
      game.player.y = game.canvasHeight / 2 - paddleHeight / 2;
      game.ai.y = game.canvasHeight / 2 - paddleHeight / 2;
      
      if (playerSide === 'left') {
        game.player.x = 0;
        game.ai.x = game.canvasWidth - paddleWidth;
      } else {
        game.player.x = game.canvasWidth - paddleWidth;
        game.ai.x = 0;
      }
    } else {
      game.player.x = game.canvasWidth / 2 - paddleWidth / 2;
      game.ai.x = game.canvasWidth / 2 - paddleWidth / 2;
      game.player.y = game.canvasHeight - paddleHeight;
      game.ai.y = 0;
    }
    
    game.ball.x = game.canvasWidth / 2;
    game.ball.y = game.canvasHeight / 2;

    let animationId: number;

    const updateGame = () => {
      if (!gameState.isPlaying) return;
      const game = gameRef.current;

      // Only update ball if not waiting to serve
      if (!gameState.waitingForServe) {
        // Update ball position with game speed factor
        game.ball.x += game.ball.speedX;
        game.ball.y += game.ball.speedY;

        // Track ball trail for visual effect
        game.ballTrail.unshift({ x: game.ball.x, y: game.ball.y });
        if (game.ballTrail.length > 5) game.ballTrail.pop();

        // Ball collision with walls based on orientation
        if (gameOrientation === 'horizontal') {
          // In horizontal mode, ball bounces off top/bottom walls
          if (game.ball.y < 0 || game.ball.y + ballSize > game.canvasHeight) {
            game.ball.speedY *= -1;
            playSound(wallHitSoundRef);
            createParticles(game.ball.x, game.ball.y < 0 ? 0 : game.canvasHeight, 5, ballColor);
          }
        } else {
          // In vertical mode, ball bounces off left/right walls
          if (game.ball.x < 0 || game.ball.x + ballSize > game.canvasWidth) {
            game.ball.speedX *= -1;
            playSound(wallHitSoundRef);
            createParticles(game.ball.x < 0 ? 0 : game.canvasWidth, game.ball.y, 5, ballColor);
          }
        }

        // Update AI position based on orientation
        if (gameOrientation === 'horizontal') {
          // Horizontal gameplay
          let aiTargetY;
          const aiReactionSpeed = difficultySettings[difficulty];
          
          if ((playerSide === 'left' && game.ball.speedX > 0) || 
              (playerSide === 'right' && game.ball.speedX < 0)) {
            // AI needs to react to ball coming towards it
            aiTargetY = game.ball.y - paddleHeight / 2;
          } else {
            // Ball is moving away from AI, stay in center or follow loosely
            aiTargetY = (game.canvasHeight / 2) - (paddleHeight / 2);
          }
          
          game.ai.y += (aiTargetY - game.ai.y) * aiReactionSpeed;

          // Keep AI paddle within boundaries
          if (game.ai.y < 0) game.ai.y = 0;
          if (game.ai.y + paddleHeight > game.canvasHeight) {
            game.ai.y = game.canvasHeight - paddleHeight;
          }
        } else {
          // Vertical gameplay
          let aiTargetX;
          const aiReactionSpeed = difficultySettings[difficulty];
          
          // AI at top needs to react to ball coming towards it
          if (game.ball.speedY < 0) {
            aiTargetX = game.ball.x - paddleWidth / 2;
          } else {
            // Ball is moving away, center paddle
            aiTargetX = (game.canvasWidth / 2) - (paddleWidth / 2);
          }
          
          game.ai.x += (aiTargetX - game.ai.x) * aiReactionSpeed;

          // Keep AI paddle within boundaries
          if (game.ai.x < 0) game.ai.x = 0;
          if (game.ai.x + paddleWidth > game.canvasWidth) {
            game.ai.x = game.canvasWidth - paddleWidth;
          }
        }

        // Ball collision with paddles based on orientation
        if (gameOrientation === 'horizontal') {
          // Horizontal gameplay (left/right paddles)
          if (playerSide === 'left') {
            // Player on left, AI on right
            
            // Player paddle collision (left side)
            if (
              game.ball.x <= paddleWidth &&
              game.ball.y + ballSize >= game.player.y &&
              game.ball.y <= game.player.y + paddleHeight
            ) {
              game.ball.speedX *= -1.1; // Increase speed slightly
              // Adjust angle based on where the ball hits the paddle
              const hitPosition = (game.ball.y - game.player.y) / paddleHeight;
              game.ball.speedY = 10 * (hitPosition - 0.5) * speedMultipliers[gameSpeed];
              playSound(paddleHitSoundRef);
              createParticles(game.ball.x + ballSize, game.ball.y, 8, ballColor);
            }

            // AI paddle collision (right side)
            if (
              game.ball.x + ballSize >= game.canvasWidth - paddleWidth &&
              game.ball.y + ballSize >= game.ai.y &&
              game.ball.y <= game.ai.y + paddleHeight
            ) {
              game.ball.speedX *= -1.1; // Increase speed slightly
              // Adjust angle based on where the ball hits the paddle
              const hitPosition = (game.ball.y - game.ai.y) / paddleHeight;
              game.ball.speedY = 10 * (hitPosition - 0.5) * speedMultipliers[gameSpeed];
              playSound(paddleHitSoundRef);
              createParticles(game.ball.x, game.ball.y, 8, colors.paddle);
            }
          } else {
            // Player on right, AI on left
            
            // Player paddle collision (right side)
            if (
              game.ball.x + ballSize >= game.canvasWidth - paddleWidth &&
              game.ball.y + ballSize >= game.player.y &&
              game.ball.y <= game.player.y + paddleHeight
            ) {
              game.ball.speedX *= -1.1; // Increase speed slightly
              // Adjust angle based on where the ball hits the paddle
              const hitPosition = (game.ball.y - game.player.y) / paddleHeight;
              game.ball.speedY = 10 * (hitPosition - 0.5) * speedMultipliers[gameSpeed];
              playSound(paddleHitSoundRef);
              createParticles(game.ball.x, game.ball.y, 8, ballColor);
            }

            // AI paddle collision (left side)
            if (
              game.ball.x <= paddleWidth &&
              game.ball.y + ballSize >= game.ai.y &&
              game.ball.y <= game.ai.y + paddleHeight
            ) {
              game.ball.speedX *= -1.1; // Increase speed slightly
              // Adjust angle based on where the ball hits the paddle
              const hitPosition = (game.ball.y - game.ai.y) / paddleHeight;
              game.ball.speedY = 10 * (hitPosition - 0.5) * speedMultipliers[gameSpeed];
              playSound(paddleHitSoundRef);
              createParticles(game.ball.x + ballSize, game.ball.y, 8, colors.paddle);
            }
          }
        } else {
          // Vertical gameplay (top/bottom paddles)
          
          // Player paddle collision (bottom)
          if (
            game.ball.y + ballSize >= game.canvasHeight - paddleHeight &&
            game.ball.x + ballSize >= game.player.x &&
            game.ball.x <= game.player.x + paddleWidth
          ) {
            game.ball.speedY *= -1.1; // Increase speed slightly
            // Adjust angle based on where ball hits paddle
            const hitPosition = (game.ball.x - game.player.x) / paddleWidth;
            game.ball.speedX = 10 * (hitPosition - 0.5) * speedMultipliers[gameSpeed];
            playSound(paddleHitSoundRef);
            createParticles(game.ball.x, game.ball.y, 8, ballColor);
          }
          
          // AI paddle collision (top)
          if (
            game.ball.y <= paddleHeight &&
            game.ball.x + ballSize >= game.ai.x &&
            game.ball.x <= game.ai.x + paddleWidth
          ) {
            game.ball.speedY *= -1.1; // Increase speed slightly
            // Adjust angle based on where ball hits paddle
            const hitPosition = (game.ball.x - game.ai.x) / paddleWidth;
            game.ball.speedX = 10 * (hitPosition - 0.5) * speedMultipliers[gameSpeed];
            playSound(paddleHitSoundRef);
            createParticles(game.ball.x, game.ball.y + ballSize, 8, colors.paddle);
          }
        }

        // Scoring - adjusted for game orientation
        if (gameOrientation === 'horizontal') {
          // Horizontal gameplay - score when ball passes left/right edges
          if (game.ball.x < 0) {
            // Left side scores (player or AI depending on side)
            if (playerSide === 'left') {
              // AI scores
              setGameState(prev => ({
                ...prev,
                aiScore: prev.aiScore + 1
              }));
              createParticles(0, game.ball.y, 15, '#ef4444'); // Red particles
            } else {
              // Player scores
              setGameState(prev => ({
                ...prev,
                playerScore: prev.playerScore + 1
              }));
              createParticles(0, game.ball.y, 15, '#3b82f6'); // Blue particles
            }
            playSound(scoreSoundRef);
            prepareServe(playerSide === 'left' ? 'ai' : 'player');
          } else if (game.ball.x + ballSize > game.canvasWidth) {
            // Right side scores
            if (playerSide === 'left') {
              // Player scores
              setGameState(prev => ({
                ...prev,
                playerScore: prev.playerScore + 1
              }));
              createParticles(game.canvasWidth, game.ball.y, 15, '#3b82f6'); // Blue particles
            } else {
              // AI scores
              setGameState(prev => ({
                ...prev,
                aiScore: prev.aiScore + 1
              }));
              createParticles(game.canvasWidth, game.ball.y, 15, '#ef4444'); // Red particles
            }
            playSound(scoreSoundRef);
            prepareServe(playerSide === 'left' ? 'player' : 'ai');
          }
        } else {
          // Vertical gameplay - score when ball passes top/bottom edges
          if (game.ball.y < 0) {
            // Ball passes top - player scores
            setGameState(prev => ({
              ...prev,
              playerScore: prev.playerScore + 1
            }));
            createParticles(game.ball.x, 0, 15, '#3b82f6'); // Blue particles
            playSound(scoreSoundRef);
            prepareServe('player');
          } else if (game.ball.y + ballSize > game.canvasHeight) {
            // Ball passes bottom - AI scores
            setGameState(prev => ({
              ...prev,
              aiScore: prev.aiScore + 1
            }));
            createParticles(game.ball.x, game.canvasHeight, 15, '#ef4444'); // Red particles
            playSound(scoreSoundRef);
            prepareServe('ai');
          }
        }
        
        // Safety check: If ball somehow gets far outside the canvas, reset it
        const bufferZone = 50; // Additional space beyond canvas boundaries
        if (
          game.ball.x < -bufferZone || 
          game.ball.x > game.canvasWidth + bufferZone ||
          game.ball.y < -bufferZone || 
          game.ball.y > game.canvasHeight + bufferZone
        ) {
          console.log("Ball escaped canvas bounds - resetting position");
          game.ball.x = game.canvasWidth / 2;
          game.ball.y = game.canvasHeight / 2;
          const baseSpeed = 5 * speedMultipliers[gameSpeed];
          game.ball.speedX = Math.random() > 0.5 ? baseSpeed : -baseSpeed;
          game.ball.speedY = (Math.random() * 4 - 2) * speedMultipliers[gameSpeed];
        }
      }

      // Update particle effects
      game.particleEffects.forEach((particle, i) => {
        particle.life--;
        if (particle.life <= 0) {
          game.particleEffects.splice(i, 1);
        }
      });

      // Update star positions for background effect
      game.stars.forEach(star => {
        star.y += star.speed;
        if (star.y > game.canvasHeight) {
          star.y = 0;
          star.x = Math.random() * game.canvasWidth;
        }
      });

      // Render game
      renderGame();
    };

    const renderGame = () => {
      if (!context) return;
      const game = gameRef.current;

      // Clear canvas
      context.fillStyle = colors.background;
      context.fillRect(0, 0, game.canvasWidth, game.canvasHeight);

      // Draw stars in background
      game.stars.forEach(star => {
        context.fillStyle = star.color;
        context.beginPath();
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      });

      // Draw team sides with slight color tint based on orientation
      if (gameOrientation === 'horizontal') {
        // Horizontal gameplay - tint left/right
        if (playerSide === 'left') {
          context.fillStyle = colors.playerSide;
          context.fillRect(0, 0, game.canvasWidth / 2, game.canvasHeight);
          
          context.fillStyle = colors.aiSide;
          context.fillRect(game.canvasWidth / 2, 0, game.canvasWidth / 2, game.canvasHeight);
        } else {
          context.fillStyle = colors.aiSide;
          context.fillRect(0, 0, game.canvasWidth / 2, game.canvasHeight);
          
          context.fillStyle = colors.playerSide;
          context.fillRect(game.canvasWidth / 2, 0, game.canvasWidth / 2, game.canvasHeight);
        }
      } else {
        // Vertical gameplay - tint top/bottom
        context.fillStyle = colors.aiSide;
        context.fillRect(0, 0, game.canvasWidth, game.canvasHeight / 2);
        
        context.fillStyle = colors.playerSide;
        context.fillRect(0, game.canvasHeight / 2, game.canvasWidth, game.canvasHeight / 2);
      }

      // Draw center line with futuristic pulsing effect based on orientation
      const centerLineOpacity = 0.6 + Math.sin(Date.now() / 800) * 0.4;
      context.setLineDash([5, 15]);
      context.beginPath();
      
      if (gameOrientation === 'horizontal') {
        // Vertical center line for horizontal gameplay
        context.moveTo(game.canvasWidth / 2, 0);
        context.lineTo(game.canvasWidth / 2, game.canvasHeight);
      } else {
        // Horizontal center line for vertical gameplay
        context.moveTo(0, game.canvasHeight / 2);
        context.lineTo(game.canvasWidth, game.canvasHeight / 2);
      }
      
      context.strokeStyle = `rgba(71, 85, 105, ${centerLineOpacity})`;
      context.lineWidth = 2;
      context.stroke();
      context.setLineDash([]);

      // Draw ball trail with selected ball color
      game.ballTrail.forEach((pos, i) => {
        const alpha = 0.3 - (i * 0.05);
        const r = parseInt(ballColor.slice(1, 3), 16);
        const g = parseInt(ballColor.slice(3, 5), 16);
        const b = parseInt(ballColor.slice(5, 7), 16);
        context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        
        // Only draw trail for square and circle designs
        if (ballDesign !== 'emoji') {
          const size = ballSize - (i * 2);
          if (size > 0) {
            if (ballDesign === 'circle') {
              context.beginPath();
              context.arc(pos.x + ballSize/2, pos.y + ballSize/2, size/2, 0, Math.PI * 2);
              context.fill();
            } else {
              context.fillRect(pos.x, pos.y, size, size);
            }
          }
        }
      });
      
      // Draw particles
      game.particleEffects.forEach(particle => {
        const alpha = particle.life / 30;
        context.fillStyle = `${particle.color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      // Draw paddles based on orientation
      const playerPaddleColor = paddleThemes[paddleTheme].player;
      const aiPaddleColor = paddleThemes[paddleTheme].ai;
      const glowColor = paddleThemes[paddleTheme].glow;
      
      if (gameOrientation === 'horizontal') {
        // Horizontal gameplay - paddles on sides
        if (playerSide === 'left') {
          // Player on left, AI on right
          
          // Apply paddle glow effect
          context.shadowColor = playerPaddleColor;
          context.shadowBlur = 10;
          
          // Player paddle with highlight effect
          context.fillStyle = playerPaddleColor;
          context.fillRect(game.player.x, game.player.y, paddleWidth, paddleHeight);
          
          // Add pulsing effect to player paddle
          const pulseAmount = Math.sin(Date.now() / 500) * 0.2 + 0.8;
          const playerGradient = context.createLinearGradient(game.player.x, game.player.y, game.player.x + paddleWidth, game.player.y + paddleHeight);
          playerGradient.addColorStop(0, glowColor);
          playerGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 * pulseAmount})`);
          playerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          context.fillStyle = playerGradient;
          context.fillRect(game.player.x, game.player.y, paddleWidth / 2, paddleHeight);
          
          // Reset shadow for AI paddle
          context.shadowBlur = 0;
          
          // Apply AI paddle glow
          context.shadowColor = aiPaddleColor;
          context.shadowBlur = 10;
          
          // AI paddle with highlight effect
          context.fillStyle = aiPaddleColor;
          context.fillRect(game.ai.x, game.ai.y, paddleWidth, paddleHeight);
          
          // Add pulsing effect to AI paddle
          const aiGradient = context.createLinearGradient(game.ai.x, game.ai.y, game.ai.x + paddleWidth, game.ai.y + paddleHeight);
          aiGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          aiGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 * pulseAmount})`);
          aiGradient.addColorStop(1, glowColor);
          context.fillStyle = aiGradient;
          context.fillRect(game.ai.x + paddleWidth / 2, game.ai.y, paddleWidth / 2, paddleHeight);
        } else {
          // Player on right, AI on left
          
          // Apply AI paddle glow
          context.shadowColor = aiPaddleColor;
          context.shadowBlur = 10;
          
          // AI paddle with highlight effect
          context.fillStyle = aiPaddleColor;
          context.fillRect(game.ai.x, game.ai.y, paddleWidth, paddleHeight);
          
          // Add pulsing effect to AI paddle
          const pulseAmount = Math.sin(Date.now() / 500) * 0.2 + 0.8;
          const aiGradient = context.createLinearGradient(game.ai.x, game.ai.y, game.ai.x + paddleWidth, game.ai.y + paddleHeight);
          aiGradient.addColorStop(0, glowColor);
          aiGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 * pulseAmount})`);
          aiGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          context.fillStyle = aiGradient;
          context.fillRect(game.ai.x, game.ai.y, paddleWidth / 2, paddleHeight);
          
          // Reset shadow for player paddle
          context.shadowBlur = 0;
          
          // Apply player paddle glow
          context.shadowColor = playerPaddleColor;
          context.shadowBlur = 10;
          
          // Player paddle with highlight effect
          context.fillStyle = playerPaddleColor;
          context.fillRect(game.player.x, game.player.y, paddleWidth, paddleHeight);
          
          // Add pulsing effect to player paddle
          const playerGradient = context.createLinearGradient(game.player.x, game.player.y, game.player.x + paddleWidth, game.player.y + paddleHeight);
          playerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          playerGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 * pulseAmount})`);
          playerGradient.addColorStop(1, glowColor);
          context.fillStyle = playerGradient;
          context.fillRect(game.player.x + paddleWidth / 2, game.player.y, paddleWidth / 2, paddleHeight);
        }
      } else {
        // Vertical gameplay - paddles on top/bottom
        
        // AI paddle (top)
        context.shadowColor = aiPaddleColor;
        context.shadowBlur = 10;
        context.fillStyle = aiPaddleColor;
        context.fillRect(game.ai.x, game.ai.y, paddleWidth, paddleHeight);
        
        // Add pulsing effect to AI paddle
        const pulseAmount = Math.sin(Date.now() / 500) * 0.2 + 0.8;
        const aiGradient = context.createLinearGradient(game.ai.x, game.ai.y, game.ai.x + paddleWidth, game.ai.y + paddleHeight);
        aiGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        aiGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 * pulseAmount})`);
        aiGradient.addColorStop(1, glowColor);
        context.fillStyle = aiGradient;
        context.fillRect(game.ai.x, game.ai.y, paddleWidth, paddleHeight / 2);
        context.shadowBlur = 0;
        
        // Player paddle (bottom)
        context.shadowColor = playerPaddleColor;
        context.shadowBlur = 10;
        context.fillStyle = playerPaddleColor;
        context.fillRect(game.player.x, game.player.y, paddleWidth, paddleHeight);
        
        // Add pulsing effect to player paddle
        const playerGradient = context.createLinearGradient(game.player.x, game.player.y, game.player.x + paddleWidth, game.player.y + paddleHeight);
        playerGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        playerGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.1 * pulseAmount})`);
        playerGradient.addColorStop(1, glowColor);
        context.fillStyle = playerGradient;
        context.fillRect(game.player.x, game.player.y + paddleHeight / 2, paddleWidth, paddleHeight / 2);
        context.shadowBlur = 0;
      }

      // Draw ball based on selected design
      if (ballDesign === 'square') {
        // Square ball with glow
        context.shadowColor = ballColor;
        context.shadowBlur = 15;
        context.fillStyle = ballColor;
        context.fillRect(game.ball.x, game.ball.y, ballSize, ballSize);
        
        // Add ball glow
        context.fillStyle = ballColor + 'B3'; // 70% opacity
        context.fillRect(game.ball.x, game.ball.y, ballSize, ballSize);
        context.shadowBlur = 0;
      } 
      else if (ballDesign === 'circle') {
        // Circle ball with glow
        context.shadowColor = ballColor;
        context.shadowBlur = 15;
        context.beginPath();
        context.arc(
          game.ball.x + ballSize / 2,
          game.ball.y + ballSize / 2,
          ballSize / 2, 0, Math.PI * 2
        );
        context.fillStyle = ballColor;
        context.fill();
        
        // Add ball glow
        context.beginPath();
        context.arc(
          game.ball.x + ballSize / 2,
          game.ball.y + ballSize / 2,
          ballSize / 2, 0, Math.PI * 2
        );
        context.fillStyle = ballColor + 'B3'; // 70% opacity
        context.fill();
        context.shadowBlur = 0;
      }
      else if (ballDesign === 'emoji') {
        // Draw emoji as ball with glowing effect
        context.shadowColor = ballColor;
        context.shadowBlur = 10;
        context.font = `${ballSize}px Arial`;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(
          game.emoji, 
          game.ball.x + ballSize/2, 
          game.ball.y + ballSize/2
        );
        context.shadowBlur = 0;
      }

      // Draw serve instruction if waiting for player serve - updated for orientation
      if (gameState.waitingForServe && gameState.lastScorer === 'ai') {
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.font = 'bold 18px Arial';
        context.textAlign = 'center';
        
        if (gameOrientation === 'horizontal') {
          if (playerSide === 'left') {
            context.fillText('Click or Tap to Serve!', game.ball.x + 70, game.ball.y - 15);
          } else {
            context.fillText('Click or Tap to Serve!', game.ball.x - 70, game.ball.y - 15);
          }
        } else {
          // Vertical orientation - serve text above ball
          context.fillText('Click or Tap to Serve!', game.ball.x, game.ball.y - 20);
        }
        
        // Add pulsing visual cue
        const pulseSize = 5 + Math.sin(Date.now() / 200) * 3;
        context.beginPath();
        context.arc(
          game.ball.x + ballSize/2,
          game.ball.y + ballSize/2,
          ballSize + pulseSize,
          0, Math.PI * 2
        );
        context.strokeStyle = `rgba(255, 255, 255, ${0.4 + Math.sin(Date.now() / 300) * 0.2})`;
        context.lineWidth = 2;
        context.stroke();
      }
    };

    const gameLoop = () => {
      updateGame();
      animationId = requestAnimationFrame(gameLoop);
    };

    // Initial render
    renderGame();

    if (gameState.isPlaying) {
      animationId = requestAnimationFrame(gameLoop);
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [difficulty, gameState.isPlaying, gameState.waitingForServe, gameState.lastScorer, isMuted, playerSide, ballColor, ballDesign, gameSpeed, paddleTheme, gameOrientation]);

  const restartGame = () => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current.currentTime = 0;
    }
    
    setGameState({
      playerScore: 0,
      aiScore: 0,
      isPlaying: false,
      lastScorer: null,
      waitingForServe: false,
    });
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // Handle selecting ball design
  const selectBallDesign = (design: BallDesign) => {
    setBallDesign(design);
    
    // Set emoji if emoji design is selected
    if (design === 'emoji') {
      const emojis = ['🏓', '⚽', '🔴', '🎯', '💫', '🍊'];
      gameRef.current.emoji = emojis[Math.floor(Math.random() * emojis.length)];
    }
  };
  
  // Handle selecting ball color
  const selectBallColor = (color: string) => {
    setBallColor(color);
  };
  
  // Handle selecting game speed
  const selectGameSpeed = (speed: GameSpeed) => {
    setGameSpeed(speed);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-2 md:p-4 bg-gradient-to-br from-indigo-900 to-slate-900">
      <motion.h1 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-4 text-3xl font-bold text-transparent md:mb-6 md:text-5xl bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500"
      >
        Super Ping Pong 2025
      </motion.h1>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-4xl p-3 mb-4 border-none rounded-lg shadow-xl md:p-6 md:mb-8 bg-gradient-to-b from-slate-800/70 to-slate-900/90 backdrop-blur-sm"
      >
        {/* Game header with scores and controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-3 text-center border rounded-lg shadow-lg bg-gradient-to-br from-blue-900/80 to-indigo-900/80 backdrop-blur-sm border-blue-500/30"
          >
            <span className="text-xl font-semibold text-blue-300">You</span>
            <p className="text-3xl font-bold text-blue-500 md:text-4xl">{gameState.playerScore}</p>
          </motion.div>
          
          <div className="flex flex-col items-center">
            {!gameState.isPlaying ? (
              <div className="flex flex-col items-center gap-3 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleSettings}
                  className="px-4 py-2 mb-2 font-semibold text-white transition-colors bg-indigo-600 border rounded-lg shadow-lg sm:mb-0 hover:bg-indigo-700 border-indigo-400/30 backdrop-blur-sm"
                >
                  {showSettings ? 'Hide Settings' : 'Game Settings'}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startGame}
                  className="px-6 py-3 text-lg font-semibold text-white transition-colors border rounded-lg shadow-lg bg-gradient-to-r from-green-500 to-emerald-700 hover:from-green-600 hover:to-emerald-800 border-green-400/30 backdrop-blur-sm"
                >
                  Start Game
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                className="px-6 py-2 font-semibold text-white transition-colors border rounded-lg shadow-lg bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 border-red-400/30 backdrop-blur-sm"
              >
                Restart Game
              </motion.button>
            )}
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="p-3 text-center border rounded-lg shadow-lg bg-gradient-to-br from-red-900/80 to-rose-900/80 backdrop-blur-sm border-red-500/30"
          >
            <span className="text-xl font-semibold text-red-300">AI</span>
            <p className="text-3xl font-bold text-red-500 md:text-4xl">{gameState.aiScore}</p>
          </motion.div>
        </div>
        
        {/* Game settings panel */}
        {showSettings && !gameState.isPlaying && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="p-4 mb-4 border rounded-lg shadow-inner bg-slate-800/80 backdrop-blur-sm border-indigo-500/30"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Difficulty Settings */}
              <div className="p-3 rounded-lg bg-slate-700/50">
                <h3 className="mb-2 font-semibold text-white">Difficulty</h3>
                <div className="flex flex-wrap gap-2">
                  {['easy', 'medium', 'hard'].map((level) => (
                    <motion.button
                      key={level}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setDifficulty(level as Difficulty)}
                      className={`px-3 py-1 rounded-lg transition-colors text-sm ${
                        difficulty === level
                          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
                          : 'bg-slate-600 text-slate-200 hover:bg-slate-500'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Game Orientation - NEW SECTION */}
              <div className="p-3 rounded-lg bg-slate-700/50">
                <h3 className="mb-2 font-semibold text-white">Game Orientation</h3>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectGameOrientation('horizontal')}
                    className={`px-3 py-1 rounded flex items-center justify-center ${
                      gameOrientation === 'horizontal' 
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                        : 'bg-slate-600 text-slate-200'
                    }`}
                  >
                    <FaArrowsAltH className="mr-1" /> Horizontal
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectGameOrientation('vertical')}
                    className={`px-3 py-1 rounded flex items-center justify-center ${
                      gameOrientation === 'vertical' 
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white' 
                        : 'bg-slate-600 text-slate-200'
                    }`}
                  >
                    <FaArrowsAltV className="mr-1" /> Vertical
                  </motion.button>
                </div>
              </div>
              
              {/* Side Selection - Only show in horizontal mode */}
              {gameOrientation === 'horizontal' && (
                <div className="p-3 rounded-lg bg-slate-700/50">
                  <h3 className="mb-2 font-semibold text-white">Choose Side</h3>
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectPlayerSide('left')}
                      className={`px-3 py-1 rounded flex items-center justify-center ${
                        playerSide === 'left' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-200'
                      }`}
                    >
                      <FaArrowLeft className="mr-1" /> Left
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectPlayerSide('right')}
                      className={`px-3 py-1 rounded flex items-center justify-center ${
                        playerSide === 'right' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-200'
                      }`}
                    >
                      Right <FaArrowRight className="ml-1" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={randomizeSide}
                      className="flex items-center justify-center px-3 py-1 text-white bg-purple-600 rounded"
                    >
                      <FaRandom className="mr-1" /> Random
                    </motion.button>
                  </div>
                </div>
              )}
              
              {/* Game Speed */}
              <div className="p-3 rounded-lg bg-slate-700/50">
                <h3 className="mb-2 font-semibold text-white">Game Speed</h3>
                <div className="flex flex-wrap gap-2">
                  {['slow', 'normal', 'fast'].map((speed) => (
                    <motion.button
                      key={speed}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectGameSpeed(speed as GameSpeed)}
                      className={`px-3 py-1 rounded-lg transition-colors text-sm flex items-center ${
                        gameSpeed === speed
                          ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                          : 'bg-slate-600 text-slate-200 hover:bg-slate-500'
                      }`}
                    >
                      <FaTachometerAlt className="mr-1" />
                      {speed.charAt(0).toUpperCase() + speed.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Ball Design */}
              <div className="p-3 rounded-lg bg-slate-700/50">
                <h3 className="mb-2 font-semibold text-white">Ball Design</h3>
                <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectBallDesign('square')}
                    className={`px-3 py-1 rounded flex items-center justify-center ${
                      ballDesign === 'square' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-200'
                    }`}
                  >
                    <FaSquare className="mr-1" /> Square
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectBallDesign('circle')}
                    className={`px-3 py-1 rounded flex items-center justify-center ${
                      ballDesign === 'circle' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-200'
                    }`}
                  >
                    <FaCircle className="mr-1" /> Circle
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectBallDesign('emoji')}
                    className={`px-3 py-1 rounded flex items-center justify-center ${
                      ballDesign === 'emoji' ? 'bg-blue-600 text-white' : 'bg-slate-600 text-slate-200'
                    }`}
                  >
                    <FaSmile className="mr-1" /> Emoji
                  </motion.button>
                </div>
              </div>
              
              {/* Paddle Theme Selection - New! */}
              <div className="p-3 rounded-lg bg-slate-700/50">
                <h3 className="mb-2 font-semibold text-white">Paddle Theme</h3>
                <div className="flex flex-wrap gap-2">
                  {['classic', 'neon', 'cosmic', 'fire', 'ice'].map((theme) => (
                    <motion.button
                      key={theme}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectPaddleTheme(theme as PaddleTheme)}
                      className={`px-3 py-1 rounded flex items-center justify-center ${
                        paddleTheme === theme 
                          ? 'bg-violet-600 text-white' 
                          : 'bg-slate-600 text-slate-200'
                      }`}
                    >
                      <FaPalette className="mr-1" /> 
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Ball Color */}
              <div className="p-3 rounded-lg bg-slate-700/50">
                <h3 className="mb-2 font-semibold text-white">Ball Color</h3>
                <div className="flex flex-wrap gap-2">
                  {ballColors.map(color => (
                    <motion.button
                      key={color.value}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => selectBallColor(color.value)}
                      className={`w-8 h-8 rounded-full ${
                        ballColor === color.value 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-700' 
                          : 'border border-slate-500'
                      }`}
                      style={{ backgroundColor: color.value }}
                      aria-label={`Select ${color.name} color`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Game canvas */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="relative w-full overflow-hidden rounded-lg border-none shadow-[0_0_30px_rgba(99,102,241,0.4)]"
        >
          <button 
            onClick={toggleMute} 
            className="absolute z-10 p-2 text-white transition-colors rounded-md md:p-3 bg-slate-700/80 backdrop-blur-sm top-2 right-2 md:top-3 md:right-3 hover:bg-slate-600"
          >
            {isMuted ? <FaVolumeMute size={18} /> : <FaVolumeUp size={18} />}
          </button>
          
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onClick={handleCanvasClick}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="w-full h-[65vh] md:h-[550px] bg-slate-900 rounded-lg"
            style={{ touchAction: 'none' }}
          />
          
          {!gameState.isPlaying && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/70 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-4 md:p-8 text-center border shadow-xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl border-indigo-500/30 max-w-[90%] md:max-w-[70%] backdrop-blur-md"
              >
                <motion.div 
                  animate={{ rotate: [0, 5, 0, -5, 0], y: [0, -5, 0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                >
                  <h2 className="mb-4 text-2xl font-bold text-transparent md:mb-6 md:text-3xl bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-purple-500">
                    Welcome to Super Ping Pong 2025!
                  </h2>
                </motion.div>
                <div className="flex flex-wrap justify-center gap-2 mb-4 md:gap-4 md:mb-6">
                  {[...Array(5)].map((_, i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, -10, 0],
                        color: ['#ffeb3b', '#4caf50', '#2196f3', '#9c27b0', '#f44336']
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3 + i * 0.5,
                        repeatType: "reverse"
                      }}
                      className="text-2xl md:text-3xl"
                    >
                      <FaStar />
                    </motion.div>
                  ))}
                </div>
                <p className="mb-3 text-base md:mb-4 md:text-xl text-slate-200">
                  {gameOrientation === 'horizontal' 
                    ? "Move your mouse up/down or swipe to control your paddle!"
                    : "Move your mouse left/right or swipe to control your paddle!"}
                </p>
                <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
                  <p className="text-base italic text-orange-400 md:text-lg">
                    <span className="block text-xs text-orange-300">DIFFICULTY</span> 
                    <span className="font-bold uppercase">{difficulty}</span>
                  </p>
                  <p className="text-base text-cyan-300 md:text-lg">
                    <span className="block text-xs text-cyan-200">ORIENTATION</span>
                    <span className="font-bold uppercase">{gameOrientation}</span>
                  </p>
                  {gameOrientation === 'horizontal' && (
                    <p className="text-base text-blue-300 md:text-lg">
                      <span className="block text-xs text-blue-200">SIDE</span>
                      <span className="font-bold uppercase">{playerSide}</span>
                    </p>
                  )}
                  <p className="text-base text-green-300 md:text-lg">
                    <span className="block text-xs text-green-200">SPEED</span>
                    <span className="font-bold uppercase">{gameSpeed}</span>
                  </p>
                  <p className="text-base text-purple-300 md:text-lg">
                    <span className="block text-xs text-purple-200">BALL</span>
                    <span className="font-bold capitalize">{ballDesign}</span>
                  </p>
                  <p className="text-base text-pink-300 md:text-lg">
                    <span className="block text-xs text-pink-200">PADDLE THEME</span>
                    <span className="font-bold capitalize">{paddleTheme}</span>
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="max-w-2xl p-3 text-center border rounded-lg shadow-lg md:p-4 bg-slate-800/30 backdrop-blur-sm border-indigo-500/20"
      >
        <p className="text-base md:text-lg text-slate-300">
          {gameOrientation === 'horizontal'
            ? "Use your mouse or swipe up/down to move the paddle."
            : "Use your mouse or swipe left/right to move the paddle."}
          {" First to score 10 points wins!"}
        </p>
        <p className="mt-1 text-sm md:text-base text-slate-400">
          {gameState.waitingForServe && gameState.lastScorer === 'ai' && 
            "Click or tap to serve the ball!"
          }
        </p>
      </motion.div>
    </div>
  );
};

export default PingPongGame;



