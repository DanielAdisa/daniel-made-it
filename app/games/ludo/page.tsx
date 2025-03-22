"use client";

import { useState, useEffect, useRef } from "react";

const FlappyBird = () => {
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [birdPosition, setBirdPosition] = useState(250);
  const [birdRotation, setBirdRotation] = useState(0);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [hasTouch, setHasTouch] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  interface Pipe {
    x: number;
    opening: number;
    passed: boolean;
    color: string;
    id: number;
    gapHeight?: number;
  }
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [wingFlap, setWingFlap] = useState(0);
  const pipeIdRef = useRef(0);

  const gameAreaRef = useRef(null);
  const gameLoopRef = useRef<number | null>(null);
  const pipeGeneratorRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wingFlapIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameTimeRef = useRef<number>(0);

  // Keep bird state in a ref for immediate access in the game loop
  const birdRef = useRef({
    position: 250,
    velocity: 0,
    rotation: 0
  });

  // Game constants - fine-tuned for better gameplay
  const GRAVITY = 0.3;          // Reduced from 0.22 for gentler falling
  const JUMP_FORCE = -5.5;       // Reduced from -7.2 for less dramatic jumps
  const PIPE_SPEED = 2.2;        // Keeping the same horizontal speed
  const PIPE_INTERVAL = 1600;    // milliseconds between pipe spawns
  const GAME_HEIGHT = 500;
  const GAME_WIDTH = 360;
  const BIRD_SIZE = 40;
  const PIPE_WIDTH = 60;
  const GAP_HEIGHT = 160;        // Slightly increased from 150 for better playability
  const BIRD_X_POSITION = GAME_WIDTH / 3; // Fixed horizontal position
  const GAP_HEIGHT_MIN = 150;    // Increased from 140 to match new gap height
  const GAP_HEIGHT_MAX = 180;    // Increased from 170 for consistency
  const AUTO_RESTART_DELAY = 1500; // ms before auto restart

  // Colors
  const colors = {
    sky: "#88D1F1",
    grass: "#73BF2E",
    bird: ["#F7EC3A", "#FF9B40", "#FF5252", "#9C27B0"],
    pipes: ["#8BC34A", "#4CAF50", "#009688"],
  };

  // Initialize or reset game
  const initGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    
    // Reset bird state in both state and ref
    setBirdPosition(250);
    setBirdRotation(0);
    setBirdVelocity(0);
    birdRef.current = {
      position: 250,
      velocity: 0,
      rotation: 0
    };
    
    setPipes([]);
    pipeIdRef.current = 0;
    
    // Reset frame time to current time to avoid large first delta
    frameTimeRef.current = performance.now();
    
    // Remove the auto-hop - bird should start stationary
    
    startGameLoop();
    startPipeGenerator();
    startWingFlapAnimation();
  };

  // Game mechanics: bird jumping with better touch handling
  const jump = (e?: React.MouseEvent | React.TouchEvent | null) => {
    // Prevent default behavior for touch events to avoid scrolling
    if (e && e.type === 'touchstart') {
      e.preventDefault();
    }

    if (!gameStarted) {
      initGame();
      return;
    }
    
    if (!gameOver) {
      // Play jump sound effect (if we had one)
      // jumpSoundRef.current?.play();
      
      // Update both state and ref for immediate effect with slightly improved jump feel
      setBirdVelocity(JUMP_FORCE);
      birdRef.current.velocity = JUMP_FORCE;
      
      setBirdRotation(-30); // More pronounced upward rotation
      birdRef.current.rotation = -30;
    } else {
      // Reset the game state but don't automatically start
      setGameStarted(false);
      setGameOver(false);
      // Store the last score for display on the start screen
      setLastScore(score);
      
      // Reset bird position for the start screen
      setBirdPosition(250);
      setBirdRotation(0);
      setBirdVelocity(0);
      birdRef.current = {
        position: 250,
        velocity: 0,
        rotation: 0
      };
    }
  };

  // Wing flapping animation
  const startWingFlapAnimation = () => {
    if (wingFlapIntervalRef.current) clearInterval(wingFlapIntervalRef.current);
    wingFlapIntervalRef.current = setInterval(() => {
      setWingFlap((prev) => (prev === 2 ? 0 : prev + 1));
    }, 150);
  };

  // Generate pipes with varying heights
  const startPipeGenerator = () => {
    if (pipeGeneratorRef.current) clearInterval(pipeGeneratorRef.current);
    
    const createPipe = (difficultyFactor = 1) => {
      // Vary the gap height based on difficulty (gets slightly smaller as score increases)
      const currentGapHeight = Math.max(
        GAP_HEIGHT_MIN, 
        GAP_HEIGHT_MAX - (Math.min(score, 20) * 1.5)
      );
      
      // Calculate opening position (more varied as game progresses)
      const minOpeningPosition = 60 + (Math.min(score, 10) * 2);
      const maxOpeningPosition = GAME_HEIGHT - currentGapHeight - 60 - (Math.min(score, 10) * 2);
      const opening = Math.floor(Math.random() * (maxOpeningPosition - minOpeningPosition)) + minOpeningPosition;
      
      // Randomly select pipe color
      const pipeColor = colors.pipes[Math.floor(Math.random() * colors.pipes.length)];
      
      return {
        x: GAME_WIDTH,
        opening,
        passed: false,
        color: pipeColor,
        id: pipeIdRef.current++,
        gapHeight: currentGapHeight
      };
    };
    
    // Create initial pipe
    setPipes([createPipe()]);
    
    pipeGeneratorRef.current = setInterval(() => {
      if (gameOver) return;
      
      // Make pipes slightly more challenging based on score
      const difficultyFactor = 1 + Math.min(score / 30, 0.5);
      
      setPipes((currentPipes) => [
        ...currentPipes,
        createPipe(difficultyFactor)
      ]);
    }, PIPE_INTERVAL);
  };

  // Main game loop with fixed timestep for consistent physics
  const startGameLoop = () => {
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    
    const updateGameState = (timestamp: number) => {
      if (gameOver) return; // Exit early if game is over
      
      // Initialize frameTimeRef if it's the first frame
      if (frameTimeRef.current === 0) {
        frameTimeRef.current = timestamp;
        gameLoopRef.current = requestAnimationFrame(updateGameState);
        return;
      }
      
      // Calculate delta time for smooth animation
      const deltaTime = timestamp - frameTimeRef.current;
      frameTimeRef.current = timestamp;
      
      // Adjust for inconsistent frame rates (max 30ms delta to prevent jumps after tab switch)
      const frameFactor = Math.min(deltaTime / 16.67, 1.8);
      
      // First, update ref values for immediate access
      birdRef.current.velocity = Math.min(birdRef.current.velocity + GRAVITY * frameFactor, 10);
      birdRef.current.position += birdRef.current.velocity * frameFactor;
      
      // Collision detection with ground and ceiling
      if (birdRef.current.position <= BIRD_SIZE / 2 || 
          birdRef.current.position >= GAME_HEIGHT - 30 - BIRD_SIZE / 2) {
        endGame();
        gameLoopRef.current = requestAnimationFrame(updateGameState);
        return;
      }
      
      // Update rotation in ref
      if (birdRef.current.velocity < 0) {
        birdRef.current.rotation = -25;
      } else {
        const targetRotation = Math.min(90, birdRef.current.velocity * 6);
        birdRef.current.rotation += (targetRotation - birdRef.current.rotation) * 0.15 * frameFactor;
      }
      
      // Update React state for rendering - using functional updates to prevent race conditions
      setBirdPosition(birdRef.current.position);
      setBirdVelocity(birdRef.current.velocity);
      setBirdRotation(birdRef.current.rotation);
      
      // Update pipes and check collisions
      setPipes((currentPipes) => {
        // Clean up pipes that are off-screen
        const updatedPipes = currentPipes
          .filter((pipe) => pipe.x > -PIPE_WIDTH)
          .map((pipe) => {
            // Move pipes at consistent speed (slightly faster as score increases)
            const pipeSpeedModifier = 1 + Math.min(score / 50, 0.3);
            const updatedX = pipe.x - PIPE_SPEED * frameFactor * pipeSpeedModifier;
            
            // Score when passing pipe
            let passed = pipe.passed;
            if (!passed && updatedX + PIPE_WIDTH < BIRD_X_POSITION - BIRD_SIZE / 2) {
              passed = true;
              setScore((prevScore) => prevScore + 1);
            }
            
            // Check collision using more accurate hitcircle rather than rectangle
            const birdCenterX = BIRD_X_POSITION;
            const birdCenterY = birdRef.current.position;
            const birdRadius = BIRD_SIZE / 2.5; // Slightly smaller hitbox for better gameplay
            
            const pipeLeft = updatedX;
            const pipeRight = updatedX + PIPE_WIDTH;
            const topPipeBottom = pipe.opening;
            const bottomPipeTop = pipe.opening + (pipe.gapHeight || GAP_HEIGHT);
            
            // Better collision detection using a circular hitbox for the bird
            const closestX = Math.max(pipeLeft, Math.min(birdCenterX, pipeRight));
            const closestTopY = Math.min(topPipeBottom, birdCenterY);
            const closestBottomY = Math.max(bottomPipeTop, birdCenterY);
            
            // Calculate distances for top and bottom pipes
            const distanceTop = Math.sqrt(
              Math.pow(birdCenterX - closestX, 2) + Math.pow(birdCenterY - closestTopY, 2)
            );
            const distanceBottom = Math.sqrt(
              Math.pow(birdCenterX - closestX, 2) + Math.pow(birdCenterY - closestBottomY, 2)
            );
            
            // Check if either collision distance is less than bird radius
            if (!gameOver && (distanceTop < birdRadius || distanceBottom < birdRadius)) {
              endGame();
            }
            
            return {
              ...pipe,
              x: updatedX,
              passed,
            };
          });
          
        return updatedPipes;
      });
      
      gameLoopRef.current = requestAnimationFrame(updateGameState);
    };
    
    gameLoopRef.current = requestAnimationFrame(updateGameState);
  };

  // End game without auto-restart
  const endGame = () => {
    setGameOver(true);
    
    // Add a death animation effect
    birdRef.current.velocity = -3; // Small bounce upward on death
    
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('flappyBirdHighScore', score.toString());
    }
    
    // Store the current score to display on the start screen
    setLastScore(score);
    
    // Clear game loops
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    if (pipeGeneratorRef.current) clearInterval(pipeGeneratorRef.current);
    
    // Don't stop wing animation - let it continue during game over animation
  };

  // Detect device capabilities
  useEffect(() => {
    // Check if device has touch capability
    setHasTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Load high score from localStorage if available
    const savedHighScore = localStorage.getItem('flappyBirdHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
    
    // Handle keyboard controls with better prevention of repeated jumps
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === ' ' || e.code === 'ArrowUp') && !e.repeat) {
        e.preventDefault();
        jump(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      // Cleanup
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      if (pipeGeneratorRef.current) clearInterval(pipeGeneratorRef.current);
      if (wingFlapIntervalRef.current) clearInterval(wingFlapIntervalRef.current);
    };
  }, []);

  // Handle touch events properly
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default to avoid scrolling
    jump(e);
  };

  // Bird SVG with more dynamic coloring
  const Bird = () => {
    // Make bird color consistent throughout the game session
    const birdColorRef = useRef(colors.bird[Math.floor(Math.random() * colors.bird.length)]);
    
    return (
      <g
        transform={`translate(${BIRD_X_POSITION - BIRD_SIZE / 2}, ${birdPosition - BIRD_SIZE / 2}) 
                   rotate(${birdRotation}, ${BIRD_SIZE / 2}, ${BIRD_SIZE / 2})`}
      >
        <ellipse
          cx={BIRD_SIZE / 2}
          cy={BIRD_SIZE / 2}
          rx={BIRD_SIZE / 2}
          ry={BIRD_SIZE / 2.5}
          fill={birdColorRef.current}
          stroke="#000"
          strokeWidth="1.5"
        />
        <ellipse
          cx={BIRD_SIZE - 8}
          cy={BIRD_SIZE / 2 - 5}
          rx={5}
          ry={5}
          fill="white"
        />
        <circle
          cx={BIRD_SIZE - 6}
          cy={BIRD_SIZE / 2 - 5}
          r={2.5}
          fill="black"
        />
        <path
          d="M5,20 Q10,15 18,20"
          stroke="#FF5722"
          strokeWidth="2"
          fill="none"
        />
        {/* Wings in different flap positions */}
        {wingFlap === 0 && (
          <ellipse
            cx={BIRD_SIZE / 2 - 5}
            cy={BIRD_SIZE / 2 + 5}
            rx={10}
            ry={6}
            fill={birdColorRef.current}
            stroke="#000"
            strokeWidth="1"
          />
        )}
        {wingFlap === 1 && (
          <ellipse
            cx={BIRD_SIZE / 2 - 5}
            cy={BIRD_SIZE / 2 + 2}
            rx={12}
            ry={8}
            fill={birdColorRef.current}
            stroke="#000"
            strokeWidth="1"
          />
        )}
        {wingFlap === 2 && (
          <ellipse
            cx={BIRD_SIZE / 2 - 5}
            cy={BIRD_SIZE / 2}
            rx={14}
            ry={10}
            fill={birdColorRef.current}
            stroke="#000"
            strokeWidth="1"
          />
        )}
      </g>
    );
  };

  // Debug display - uncomment during development to see physics values
  const debugDisplay = false; // Set to true to see debug values

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-blue-100">
      <h1 className="mb-4 text-4xl font-bold text-blue-500">Flappy Adventure!</h1>
      
      <div 
        ref={gameAreaRef}
        className="relative overflow-hidden border-4 border-yellow-400 rounded-lg shadow-lg cursor-pointer"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={jump}
        onTouchStart={handleTouchStart}
        onTouchMove={(e) => e.preventDefault()} // Prevent scrolling on touch move
      >
        <svg width={GAME_WIDTH} height={GAME_HEIGHT}>
          {/* Sky background */}
          <rect x="0" y="0" width={GAME_WIDTH} height={GAME_HEIGHT} fill={colors.sky} />
          
          {/* Sun */}
          <circle cx="50" cy="50" r="30" fill="#FFEB3B" />
          
          {/* Clouds */}
          <g fill="white">
            <ellipse cx="100" cy="80" rx="30" ry="20" />
            <ellipse cx="130" cy="80" rx="25" ry="15" />
            <ellipse cx="70" cy="80" rx="25" ry="15" />
            
            <ellipse cx="280" cy="50" rx="25" ry="15" />
            <ellipse cx="310" cy="50" rx="20" ry="12" />
            <ellipse cx="250" cy="50" rx="20" ry="12" />
          </g>
          
          {/* Pipes with dynamic gap heights */}
          {pipes.map((pipe) => (
            <g key={pipe.id}>
              {/* Top pipe */}
              <rect
                x={pipe.x}
                y={0}
                width={PIPE_WIDTH}
                height={pipe.opening}
                fill={pipe.color}
                stroke="#2E7D32"
                strokeWidth="2"
              />
              <rect
                x={pipe.x - 5}
                y={pipe.opening - 15}
                width={PIPE_WIDTH + 10}
                height={15}
                fill="#2E7D32"
                rx={3}
              />
              
              {/* Bottom pipe with dynamic gap height */}
              <rect
                x={pipe.x}
                y={pipe.opening + (pipe.gapHeight || GAP_HEIGHT)}
                width={PIPE_WIDTH}
                height={GAME_HEIGHT - pipe.opening - (pipe.gapHeight || GAP_HEIGHT)}
                fill={pipe.color}
                stroke="#2E7D32"
                strokeWidth="2"
              />
              <rect
                x={pipe.x - 5}
                y={pipe.opening + (pipe.gapHeight || GAP_HEIGHT)}
                width={PIPE_WIDTH + 10}
                height={15}
                fill="#2E7D32"
                rx={3}
              />
            </g>
          ))}
          
          {/* Ground */}
          <rect x="0" y={GAME_HEIGHT - 30} width={GAME_WIDTH} height="30" fill={colors.grass} />
          
          {/* Bird */}
          <Bird />
          
          {/* Start message (shown on initial start and after game over) */}
          {(!gameStarted || gameOver) && (
            <g>
              <rect x="60" y="180" width="240" height="140" rx="10" fill="rgba(255,255,255,0.8)" />
              
              {/* Game over text only shown when gameOver is true */}
              {gameOver && (
                <text x="180" y="210" textAnchor="middle" fontSize="24" fontWeight="bold" fill="#E53935">
                  Game Over!
                </text>
              )}
              
              {/* Show score and best score after game over */}
              {gameOver && (
                <>
                  <text x="180" y="240" textAnchor="middle" fontSize="18" fill="#333">
                    Score: {score}
                  </text>
                  <text x="180" y="265" textAnchor="middle" fontSize="16" fill="#333">
                    Best: {Math.max(score, highScore)}
                  </text>
                </>
              )}
              
              {/* Tap to start/restart text */}
              <text 
                x="180" 
                y={gameOver ? "295" : "240"} 
                textAnchor="middle" 
                fontSize="20" 
                fontWeight="bold" 
                fill="#333"
              >
                {gameOver ? (hasTouch ? "Tap to Restart" : "Click to Restart") : "Tap to Start!"}
              </text>
              
              {/* Instructions shown only on first start */}
              {!gameOver && (
                <text x="180" y="270" textAnchor="middle" fontSize="14" fill="#555">
                  {hasTouch ? "Tap to jump" : "Press Space or click to jump"}
                </text>
              )}
            </g>
          )}
          
          {/* Remove separate game over message - now combined with start screen */}
          
          {/* Debug visualization - uncomment to debug */}
          {debugDisplay && (
            <g>
              <rect x="10" y="10" width="120" height="80" fill="rgba(0,0,0,0.5)" />
              <text x="20" y="30" fill="white" fontSize="12">
                Pos: {Math.round(birdPosition)}
              </text>
              <text x="20" y="50" fill="white" fontSize="12">
                Vel: {birdVelocity.toFixed(2)}
              </text>
              <text x="20" y="70" fill="white" fontSize="12">
                Rot: {Math.round(birdRotation)}°
              </text>
            </g>
          )}
        </svg>
      </div>
      
      {/* Score display with better visibility - show during active game */}
      <div className={`mt-4 text-2xl font-bold ${score > highScore ? 'text-green-600' : 'text-purple-600'}`}>
        {gameStarted && !gameOver && `Score: ${score}`}
      </div>
      
      {/* Instructions based on device capability */}
      <div className="max-w-md mt-8 text-center text-gray-700">
        <h2 className="mb-2 text-xl font-bold">How to Play:</h2>
        {hasTouch ? (
          <p>Tap the screen to make the bird fly!</p>
        ) : (
          <p>Press Space or click to make the bird fly!</p>
        )}
        <p>Avoid the pipes and see how far you can go!</p>
      </div>
      
      {/* Controls for mobile and keyboard - simplified */}
      <div className="mt-4">
        {(!gameStarted || gameOver) && (
          <button
            className="px-6 py-2 text-xl font-bold text-white bg-yellow-400 rounded-full hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-300"
            onClick={jump}
          >
            {gameOver ? "Play Again" : "Start Game"}
          </button>
        )}
      </div>
    </div>
  );
};

export default function FlappyBirdPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 to-purple-100">
      <FlappyBird />
    </div>
  );
}
