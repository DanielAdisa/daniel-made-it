"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number; // Add speed property to maintain constant velocity
}

interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  hitPoints: number; // Add hit points to blocks
}

const PingPongGame = () => {
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const [gameSize, setGameSize] = useState({ width: 0, height: 0 });
  const [platform, setPlatform] = useState<Platform>({ x: 0, y: 0, width: 120, height: 20 }); // Wider platform
  const [ball, setBall] = useState<Ball>({ x: 0, y: 0, dx: 3, dy: -3, radius: 7, speed: 3 }); // Added speed property
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1); // Track current level
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // Initialize game setup
  useEffect(() => {
    const initializeGame = () => {
      if (gameAreaRef.current) {
        const { width, height } = gameAreaRef.current.getBoundingClientRect();
        setGameSize({ width, height });
        
        // Initial platform position
        setPlatform(prev => ({
          ...prev,
          x: width / 2 - prev.width / 2,
          y: height - 40
        }));
        
        // Initial ball position
        setBall(prev => ({
          ...prev,
          x: width / 2,
          y: height - 60
        }));
        
        // Create blocks
        createBlocks(width, level);
      }
    };
    
    const handleResize = () => {
      initializeGame();
    };
    
    initializeGame();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current!);
    };
  }, [level]);

  // Create initial blocks
  const createBlocks = (width: number, currentLevel: number) => {
    const blockSize = 50; // Square blocks
    const padding = 10;
    const blocksPerRow = Math.floor((width - padding) / (blockSize + padding));
    const startX = (width - (blocksPerRow * (blockSize + padding) - padding)) / 2; // Center the grid
    
    // Increase rows with level
    const baseRows = 5;
    const rows = Math.min(baseRows + Math.floor(currentLevel / 3), 8);
    
    const newBlocks: Block[] = [];
    
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF'];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < blocksPerRow; col++) {
        // Higher chance of 2-hit blocks in higher levels
        const hitPointsProbability = Math.min(0.3 + (currentLevel * 0.05), 0.7);
        const hitPoints = Math.random() < hitPointsProbability ? 2 : 1;
        const blockColor = hitPoints > 1 ? '#FFC107' : colors[Math.floor(Math.random() * colors.length)];
        
        newBlocks.push({
          id: `block-${row}-${col}`,
          x: startX + col * (blockSize + padding),
          y: row * (blockSize + padding) + 50,
          width: blockSize,
          height: blockSize,
          color: blockColor,
          hitPoints: hitPoints
        });
      }
    }
    
    setBlocks(newBlocks);
  };

  // Game animation loop
  const animate = (time: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    
    const deltaTime = time - (previousTimeRef.current ?? time);
    previousTimeRef.current = time;
    
    if (gameStarted && !gameOver) {
      updateGameState(deltaTime);
    }
    
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (gameStarted) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current!);
  }, [gameStarted, gameOver, platform, ball, blocks]);

  // Update game state
  const updateGameState = (deltaTime: number) => {
    setBall(prevBall => {
      let { x, y, dx, dy, radius, speed } = prevBall;
      let newDx = dx;
      let newDy = dy;
      let ballLost = false;
      
      // Wall collisions
      if (x + dx < radius || x + dx > gameSize.width - radius) {
        newDx = -dx;
        // Add slight variation for more interesting gameplay
        newDy += (Math.random() - 0.5) * 0.5;
      }
      
      if (y + dy < radius) {
        newDy = -dy;
      }
      
      // Platform collision
      if (
        y + dy > platform.y - radius &&
        y + dy < platform.y + platform.height &&
        x + dx > platform.x &&
        x + dx < platform.x + platform.width
      ) {
        // Change ball direction based on where it hits the platform
        const hitPosition = (x - platform.x) / platform.width;
        newDx = speed * (hitPosition - 0.5) * 2; 
        newDy = -speed;
        
        // Normalize vector
        const magnitude = Math.sqrt(newDx * newDx + newDy * newDy);
        newDx = (newDx / magnitude) * speed;
        newDy = (newDy / magnitude) * speed;
      }
      
      // Block collisions
      setBlocks(prevBlocks => {
        const updatedBlocks: Block[] = [];
        let collision = false;
        
        for (const block of prevBlocks) {
          // Check collision with this block
          if (
            !collision && // Only process one collision per frame
            x + radius > block.x &&
            x - radius < block.x + block.width &&
            y + radius > block.y &&
            y - radius < block.y + block.height
          ) {
            collision = true;
            const newHitPoints = block.hitPoints - 1;
            
            // Determine which side of the block was hit
            const overlapLeft = x + radius - block.x;
            const overlapRight = block.x + block.width - (x - radius);
            const overlapTop = y + radius - block.y;
            const overlapBottom = block.y + block.height - (y - radius);
            
            // Find the smallest overlap
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            
            // Apply bounce based on collision side
            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
              newDx = -newDx; // Bounce horizontally
            } else {
              newDy = -newDy; // Bounce vertically
            }
            
            // Always bounce back on brick collision - fix the downward motion
            newDy = Math.abs(newDy); // Force ball to go downward after hitting brick
            
            // Handle block damage/destruction
            if (newHitPoints <= 0) {
              setScore(prevScore => prevScore + 10);
            } else {
              updatedBlocks.push({
                ...block,
                hitPoints: newHitPoints,
                color: '#FF9800'
              });
            }
          } else {
            updatedBlocks.push(block);
          }
        }
        
        // Check level completion
        if (updatedBlocks.length === 0) {
          setGameStarted(false);
          setLevel(prevLevel => prevLevel + 1);
          
          setTimeout(() => {
            setBall({
              x: gameSize.width / 2,
              y: gameSize.height - 60,
              dx: 0,
              dy: -(3 + level * 0.5),
              radius: 7,
              speed: 3 + level * 0.5
            });
            
            createBlocks(gameSize.width, level + 1);
            setGameStarted(true);
          }, 1500);
        }
        
        return updatedBlocks;
      });
      
      // Ball falls below platform - fix lives system
      if (y + dy > gameSize.height) {
        ballLost = true;
        
        setLives(prevLives => {
          // Ensure lives don't go negative
          const newLives = Math.max(prevLives - 1, 0);
          
          if (newLives <= 0) {
            setGameOver(true);
            setGameStarted(false);
          } else {
            // Reset ball position for next try
            setTimeout(() => {
              setBall(prev => ({
                ...prev,
                x: gameSize.width / 2,
                y: gameSize.height - 60,
                dx: speed * (Math.random() > 0.5 ? 1 : -1),
                dy: -speed
              }));
            }, 1000);
          }
          return newLives;
        });
        
        // Move ball out of view
        return {
          ...prevBall,
          y: gameSize.height + 50,
          dy: 0,
          dx: 0
        };
      }
      
      return {
        ...prevBall,
        x: ballLost ? prevBall.x : x + newDx,
        y: ballLost ? prevBall.y : y + newDy,
        dx: newDx,
        dy: newDy
      };
    });
  };

  // Handle platform movement - mouse
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!gameStarted || gameOver) return;
    
    const gameRect = gameAreaRef.current!.getBoundingClientRect();
    const mouseX = e.clientX - gameRect.left;
    
    setPlatform(prev => ({
      ...prev,
      x: Math.max(0, Math.min(mouseX - prev.width / 2, gameSize.width - prev.width))
    }));
  };

  // Handle platform movement - touch
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!gameStarted || gameOver) return;
    e.preventDefault();
    
    const gameRect = gameAreaRef.current!.getBoundingClientRect();
    const touchX = e.touches[0].clientX - gameRect.left;
    
    setPlatform(prev => ({
      ...prev,
      x: Math.max(0, Math.min(touchX - prev.width / 2, gameSize.width - prev.width))
    }));
  };

  // Start or restart the game
  const startGame = () => {
    if (gameOver) {
      // Reset game state
      setScore(0);
      setLives(3);
      setLevel(1);
      
      // Reset platform width (keep constant width now)
      createBlocks(gameSize.width, 1);
      setBall({
        x: gameSize.width / 2,
        y: gameSize.height - 60,
        dx: 3,
        dy: -3,
        radius: 7,
        speed: 3 // Initial speed
      });
    }
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center w-full min-h-screen bg-gray-900 py-8 px-4">
      <h1 className="text-3xl font-bold text-white mb-4">Ping Pong Block Buster</h1>
      
      <div className="flex gap-4 mb-4">
        <div className="text-white text-xl">Level: {level}</div>
        <div className="text-white text-xl">Score: {score}</div>
        <div className="text-white text-xl">Lives: {lives}</div>
      </div>
      
      <div 
        ref={gameAreaRef}
        className="relative bg-gray-800 rounded-lg shadow-lg w-full max-w-3xl h-[70vh] overflow-hidden cursor-none"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        {/* Game elements */}
        
        {/* Platform */}
        <motion.div 
          className="absolute bg-gradient-to-r from-blue-500 to-blue-600 rounded-md"
          animate={{
            x: platform.x,
            y: platform.y
          }}
          style={{
            width: platform.width,
            height: platform.height
          }}
          transition={{ type: "tween", duration: 0 }}
        />
        
        {/* Ball */}
        <motion.div 
          className="absolute w-[14px] h-[14px] bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.6)]"
          animate={{
            x: ball.x - ball.radius,
            y: ball.y - ball.radius
          }}
          transition={{ type: "tween", duration: 0 }}
        />
        
        {/* Blocks */}
        <AnimatePresence>
          {blocks.map((block) => (
            <motion.div
              key={block.id}
              className={
                block.hitPoints === 2 
                  ? "absolute rounded-md bg-yellow-500" 
                  : "absolute rounded-md bg-orange-500 border-2 border-red-700 before:absolute before:inset-0 before:content-[''] before:border-t-4 before:border-r-4 before:border-red-800 before:rotate-45"
              }
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ 
                scale: 1.5,
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              style={{
                left: block.x,
                top: block.y,
                width: block.width,
                height: block.height
              }}
              whileHover={{ scale: 1.02 }}
            >
              {block.hitPoints === 2 && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="w-full h-0.5 bg-red-800 rotate-45"></div>
                  <div className="w-full h-0.5 bg-red-800 -rotate-45"></div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Lives indicators - FIXED to prevent Array with negative length */}
        <div className="absolute top-2 right-2 flex gap-1">
          {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="w-3 h-3 bg-red-500 rounded-full"
            />
          ))}
        </div>
        
        {/* Game overlay */}
        {(!gameStarted || gameOver) && (
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              {gameOver ? 'Game Over' : level === 1 ? 'Ping Pong Block Buster' : `Level ${level}`}
            </h2>
            {gameOver && <p className="text-white text-xl mb-4">Final Score: {score}</p>}
            {level > 1 && !gameOver && <p className="text-white text-xl mb-4">Level {level}! Ball speed increased!</p>}
            {!gameStarted && !gameOver && level === 1 && (
              <p className="text-white text-center max-w-md mb-4">
                Move your mouse or swipe to control the platform. 
                Some blocks need two hits to break - they'll crack first!
              </p>
            )}
            <button 
              onClick={startGame}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white font-bold transition-colors"
            >
              {gameOver ? 'Play Again' : level === 1 ? 'Start Game' : 'Start Level ' + level}
            </button>
          </motion.div>
        )}
      </div>
      
      <div className="mt-6 max-w-2xl text-white text-center">
        <h3 className="text-xl font-bold mb-2">How to Play:</h3>
        <ul className="list-disc pl-6 text-left">
          <li>Move your mouse or swipe to control the platform</li>
          <li>Don't let the ball fall below your platform</li>
          <li>Yellow blocks need two hits to break - they'll crack on first hit</li>
          <li>Clear all blocks to advance to the next level</li>
          <li>Each level makes the ball move faster</li>
          <li>How many levels can you complete?</li>
          <li>You have 3 lives</li>
        </ul>
      </div>
    </div>
  );
};

export default PingPongGame;
