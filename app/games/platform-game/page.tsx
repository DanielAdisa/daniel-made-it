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
  type: 'normal' | 'explosive' | 'unbreakable' | 'moving'; // Add block types for more variety
  moveDirection?: number; // For moving blocks
}

// Add new interface for power-ups
interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: 'widePlatform' | 'multiBall';
  width: number;
  height: number;
  dy: number;
  active: boolean;
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

  // Add new state variables for power-ups
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [activePowerUps, setActivePowerUps] = useState({
    widePlatform: false,
    multiBall: false,
  });
  const [balls, setBalls] = useState<Ball[]>([]);
  const powerUpTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    
    // Reset power-ups when initializing game
    setPowerUps([]);
    setActivePowerUps({ widePlatform: false, multiBall: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current!);
      // Clear power-up timeout
      if (powerUpTimeoutRef.current) clearTimeout(powerUpTimeoutRef.current);
    };
  }, [level]);

  // Create initial blocks with more variety
  const createBlocks = (width: number, currentLevel: number) => {
    const blockSize = 50;
    const padding = 10;
    const blocksPerRow = Math.floor((width - padding) / (blockSize + padding));
    const startX = (width - (blocksPerRow * (blockSize + padding) - padding)) / 2;
    
    // Increase rows with level
    const baseRows = 5;
    const rows = Math.min(baseRows + Math.floor(currentLevel / 3), 8);
    
    const newBlocks: Block[] = [];
    
    const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF'];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < blocksPerRow; col++) {
        // Determine block type based on level and randomness
        let blockType: 'normal' | 'explosive' | 'unbreakable' | 'moving' = 'normal';
        let hitPoints = 1;
        let blockColor = colors[Math.floor(Math.random() * colors.length)];
        let moveDirection = 0;
        
        // Higher chance of special blocks in higher levels
        const specialBlockChance = Math.min(0.1 + (currentLevel * 0.05), 0.5);
        
        if (Math.random() < specialBlockChance) {
          const blockRoll = Math.random();
          
          if (blockRoll < 0.4) {
            // Normal block but with more hit points
            hitPoints = Math.min(2 + Math.floor(Math.random() * (currentLevel / 2)), 3);
            blockColor = hitPoints === 2 ? '#FFC107' : '#FF9800';
          } else if (blockRoll < 0.6) {
            // Explosive block - destroys adjacent blocks when hit
            blockType = 'explosive';
            hitPoints = 1;
            blockColor = '#F44336'; // Red for explosive
          } else if (blockRoll < 0.8) {
            // Moving block
            blockType = 'moving';
            hitPoints = 2; // Moving blocks are a bit tougher
            blockColor = '#8BC34A'; // Green for moving blocks
            moveDirection = Math.random() > 0.5 ? 1 : -1;
          } else {
            // Unbreakable block (can't be destroyed)
            blockType = 'unbreakable';
            hitPoints = Infinity;
            blockColor = '#9E9E9E'; // Gray for unbreakable
          }
        }
        
        newBlocks.push({
          id: `block-${row}-${col}`,
          x: startX + col * (blockSize + padding),
          y: row * (blockSize + padding) + 50,
          width: blockSize,
          height: blockSize,
          color: blockColor,
          hitPoints: hitPoints,
          type: blockType,
          moveDirection
        });
      }
    }
    
    setBlocks(newBlocks);
  };

  // Create a new function to spawn power-ups
  const spawnPowerUp = (x: number, y: number) => {
    // 20% chance to spawn power-up when a block is destroyed
    if (Math.random() > 0.2) return;
    
    // Randomly select power-up type
    const powerUpType = Math.random() > 0.5 ? 'widePlatform' : 'multiBall';
    
    const newPowerUp: PowerUp = {
      id: `powerup-${Date.now()}`,
      x,
      y,
      type: powerUpType,
      width: 30,
      height: 30,
      dy: 2, // Power-up falls down
      active: true
    };
    
    setPowerUps(prev => [...prev, newPowerUp]);
  };

  // Add a function to activate power-ups
  const activatePowerUp = (type: 'widePlatform' | 'multiBall') => {
    if (type === 'widePlatform') {
      setActivePowerUps(prev => ({ ...prev, widePlatform: true }));
      
      // Increase platform width
      setPlatform(prev => ({
        ...prev,
        width: 200 // Wider platform
      }));
      
      // Set timeout to reset the platform width after 10 seconds
      if (powerUpTimeoutRef.current) clearTimeout(powerUpTimeoutRef.current);
      
      powerUpTimeoutRef.current = setTimeout(() => {
        setActivePowerUps(prev => ({ ...prev, widePlatform: false }));
        setPlatform(prev => ({
          ...prev,
          width: 120 // Reset to original width
        }));
      }, 10000);
    }
    
    if (type === 'multiBall') {
      setActivePowerUps(prev => ({ ...prev, multiBall: true }));
      
      // Create a second ball
      const newBall: Ball = {
        x: ball.x,
        y: ball.y,
        dx: -ball.dx, // Move in opposite horizontal direction
        dy: ball.dy,
        radius: ball.radius,
        speed: ball.speed
      };
      
      setBalls(prev => [...prev, newBall]);
      
      // Reset after 3 seconds (don't need full timeout here)
      setTimeout(() => {
        setActivePowerUps(prev => ({ ...prev, multiBall: false }));
      }, 3000);
    }
  };

  // Initialize balls state based on the main ball
  useEffect(() => {
    if (gameStarted && !activePowerUps.multiBall) {
      setBalls([ball]);
    }
  }, [gameStarted, ball, activePowerUps.multiBall]);

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

  // Unified function to handle ball collisions with blocks
  const handleBallBlockCollision = (
    ball: Ball, 
    blocks: Block[]
  ): { 
    newDx: number; 
    newDy: number; 
    updatedBlocks: Block[];
    destroyed: boolean;
    destroyedPosition?: { x: number; y: number };
  } => {
    const { x, y, dx, dy, radius, speed } = ball;
    let newDx = dx;
    let newDy = dy;
    let destroyed = false;
    let destroyedPosition;
    
    // Clone blocks to avoid mutation
    let updatedBlocks = [...blocks];
    let blockCollision = false;
    
    // Calculate next position
    const nextX = x + dx;
    const nextY = y + dy;

    // Track which block to remove
    let blockToRemoveIndex = -1;
    let explosiveBlockHit = false;
    let explosionCenter = { x: 0, y: 0 };
    
    // Check collisions with all blocks
    for (let i = 0; i < updatedBlocks.length; i++) {
      const block = updatedBlocks[i];
      
      // Precise collision detection using closest point method
      const closestX = Math.max(block.x, Math.min(nextX, block.x + block.width));
      const closestY = Math.max(block.y, Math.min(nextY, block.y + block.height));
      
      // Distance between ball center and closest point on block
      const distX = nextX - closestX;
      const distY = nextY - closestY;
      const distance = Math.sqrt(distX * distX + distY * distY);
      
      // Check if distance is less than ball radius (collision)
      if (distance < radius && !blockCollision) {
        blockCollision = true;
        
        // Special handling for unbreakable blocks - just bounce
        if (block.type === 'unbreakable') {
          // Only process bouncing physics here
        } else {
          // Normal blocks and special blocks
          const newHitPoints = block.hitPoints - 1;
          updatedBlocks[i] = {
            ...block,
            hitPoints: newHitPoints,
            color: newHitPoints <= 0 ? block.color : '#FF9800' // Damaged color
          };
          
          // Check if block is destroyed
          if (newHitPoints <= 0) {
            blockToRemoveIndex = i;
            destroyedPosition = { 
              x: block.x + block.width / 2, 
              y: block.y + block.height / 2 
            };
            
            // Handle explosive blocks
            if (block.type === 'explosive') {
              explosiveBlockHit = true;
              explosionCenter = destroyedPosition;
            }
            
            destroyed = true;
          }
        }
        
        // Calculate collision response (bouncing)
        // Determine which side was hit
        let normalX = 0;
        let normalY = 0;
        
        // If inside the block width, check top/bottom
        if (nextX > block.x && nextX < block.x + block.width) {
          // Coming from top or bottom
          normalY = nextY < block.y ? -1 : 1;
        } 
        // If inside the block height, check left/right
        else if (nextY > block.y && nextY < block.y + block.height) {
          // Coming from left or right
          normalX = nextX < block.x ? -1 : 1;
        }
        // Corner collision - get precise normal
        else {
          const cornerX = closestX;
          const cornerY = closestY;
          
          // Calculate normal based on collision point
          const dx = nextX - cornerX;
          const dy = nextY - cornerY;
          const len = Math.sqrt(dx * dx + dy * dy);
          normalX = dx / len;
          normalY = dy / len;
        }
        
        // Reflect velocity based on normal
        if (Math.abs(normalX) > Math.abs(normalY)) {
          // Mostly horizontal collision
          newDx = -newDx;
        } else {
          // Mostly vertical collision
          newDy = -newDy;
        }
        
        // Add variation for more interesting gameplay
        newDx += (Math.random() - 0.5) * 0.5;
        newDy += (Math.random() - 0.5) * 0.5;
        
        // Normalize to maintain constant speed
        const magnitude = Math.sqrt(newDx * newDx + newDy * newDy);
        newDx = (newDx / magnitude) * speed;
        newDy = (newDy / magnitude) * speed;
      }
    }
    
    // Process block destruction after collision detection
    if (blockToRemoveIndex >= 0) {
      // Remove the destroyed block
      updatedBlocks = updatedBlocks.filter((_, index) => index !== blockToRemoveIndex);
      
      // Handle explosive block chain reaction
      if (explosiveBlockHit) {
        // Find blocks in explosion radius
        const EXPLOSION_RADIUS = 80;
        
        updatedBlocks = updatedBlocks.filter(block => {
          // Calculate distance to explosion center
          const blockCenterX = block.x + block.width / 2;
          const blockCenterY = block.y + block.height / 2;
          const distance = Math.sqrt(
            Math.pow(blockCenterX - explosionCenter.x, 2) + 
            Math.pow(blockCenterY - explosionCenter.y, 2)
          );
          
          // If in explosion radius and not unbreakable, destroy block
          if (distance < EXPLOSION_RADIUS && block.type !== 'unbreakable') {
            // Award points for chain reaction
            setScore(prev => prev + 5);
            return false; // Remove from list
          }
          return true; // Keep the block
        });
      }
    }
    
    return { 
      newDx, 
      newDy, 
      updatedBlocks,
      destroyed,
      destroyedPosition
    };
  };

  // Improved function to handle wall collisions - only allowing ball to exit at bottom
const handleWallCollisions = (ball: Ball): { dx: number; dy: number; x: number; y: number } => {
  const { x, y, dx, dy, radius, speed } = ball;
  let newDx = dx;
  let newDy = dy;
  let newX = x;
  let newY = y;
  
  // First, check if the ball will go out of bounds after movement
  const nextX = x + dx;
  const nextY = y + dy;
  
  // Check left wall - clamp position and reverse direction
  if (nextX - radius <= 0) {
    newDx = Math.abs(dx); // Force right direction
    newX = radius; // Ensure ball stays in bounds
  } 
  // Check right wall - clamp position and reverse direction
  else if (nextX + radius >= gameSize.width) {
    newDx = -Math.abs(dx); // Force left direction
    newX = gameSize.width - radius; // Ensure ball stays in bounds
  }
  
  // Check top wall - clamp position and reverse direction
  if (nextY - radius <= 0) {
    newDy = Math.abs(dy); // Force down direction
    newY = radius; // Ensure ball stays in bounds
  }
  
  // Note: We don't check bottom wall because we want the ball to fall off
  
  // Add slight angle variation on wall bounces for interesting gameplay
  if (newDx !== dx || newDy !== dy) {
    // Add small random variation to prevent looping patterns
    newDx += (Math.random() - 0.5) * 0.3;
    
    // Normalize to maintain constant speed
    const magnitude = Math.sqrt(newDx * newDx + newDy * newDy);
    if (magnitude > 0) {
      newDx = (newDx / magnitude) * speed;
      newDy = (newDy / magnitude) * speed;
    }
  }
  
  return { 
    dx: newDx, 
    dy: newDy,
    x: newX,
    y: newY
  };
};


// Helper function to handle explosive blocks chain reaction
const handleExplosion = (blocks: Block[], explodingBlockIndex: number, center: { x: number, y: number }) => {
  // Get the exploding block
  const explodingBlock = blocks[explodingBlockIndex];
  
  // Remove the exploding block first
  const updatedBlocks = blocks.filter((_, i) => i !== explodingBlockIndex);
  
  // Define explosion radius
  const EXPLOSION_RADIUS = 80;
  
  // Find all blocks in explosion radius and destroy them
  const blocksAfterExplosion = updatedBlocks.filter(block => {
    // Skip unbreakable blocks
    if (block.type === 'unbreakable') {
      return true;
    }
    
    // Calculate block center
    const blockCenterX = block.x + block.width / 2;
    const blockCenterY = block.y + block.height / 2;
    
    // Calculate distance to explosion center
    const distance = Math.sqrt(
      Math.pow(blockCenterX - center.x, 2) + 
      Math.pow(blockCenterY - center.y, 2)
    );
    
    // If block is within explosion radius, destroy it
    if (distance < EXPLOSION_RADIUS) {
      // Award points for chain reaction
      setScore(prev => prev + 5);
      
      // Create chance for power-up from destroyed blocks
      if (Math.random() < 0.1) {
        spawnPowerUp(blockCenterX, blockCenterY);
      }
      
      return false; // Remove the block
    }
    
    return true; // Keep the block
  });
  
  return blocksAfterExplosion;
};

// Update game state
const updateGameState = (deltaTime: number) => {
  // Update power-ups
  setPowerUps(prevPowerUps => {
    return prevPowerUps
      .map(powerUp => {
        // Check for collision with platform
        if (
          powerUp.active &&
          powerUp.y + powerUp.height > platform.y &&
          powerUp.y < platform.y + platform.height &&
          powerUp.x + powerUp.width > platform.x &&
          powerUp.x < platform.x + platform.width
        ) {
          // Activate power-up
          activatePowerUp(powerUp.type);
          
          // Collect power-up (deactivate it)
          return { ...powerUp, active: false };
        }
        
        // Move power-up down
        return {
          ...powerUp,
          y: powerUp.y + powerUp.dy,
          // Remove if it goes off screen
          active: powerUp.y < gameSize.height
        };
      })
      .filter(powerUp => powerUp.active);
  });

  // Update block positions (for moving blocks)
  setBlocks(prevBlocks => {
    return prevBlocks.map(block => {
      if (block.type === 'moving' && block.moveDirection) {
        // Calculate new position
        let newX = block.x + block.moveDirection;
        
        // Bounce if hit wall
        if (newX <= 0 || newX + block.width >= gameSize.width) {
          return {
            ...block,
            moveDirection: -block.moveDirection,
            x: block.x + (-block.moveDirection) // Immediately move in new direction
          };
        }
        
        // Continue moving
        return {
          ...block,
          x: newX
        };
      }
      return block;
    });
  });

  // Update main ball or all balls if multi-ball is active
  if (activePowerUps.multiBall) {
    // Update all balls in multi-ball mode
    setBalls(prevBalls => {
      return prevBalls.map(currBall => {
        if (!currBall) return null;
        
        let { x, y, dx, dy, radius, speed } = currBall;
        
        // 1. Apply wall collisions first
        const wallCollision = handleWallCollisions(currBall);
        let newDx = wallCollision.dx;
        let newDy = wallCollision.dy;
        let newX = wallCollision.x;
        let newY = wallCollision.y;
        
        // 2. Check for platform collision
        if (
          newY + radius > platform.y && 
          newY - radius < platform.y + platform.height &&
          newX + radius > platform.x && 
          newX - radius < platform.x + platform.width
        ) {
          // Only bounce if coming from above
          if (dy > 0 && newY < platform.y + platform.height/2) {
            const hitPosition = (newX - platform.x) / platform.width;
            newDx = speed * (hitPosition - 0.5) * 2.5;
            newDy = -Math.abs(dy);
            
            // Normalize vector
            const magnitude = Math.sqrt(newDx * newDx + newDy * newDy);
            if (magnitude > 0) {
              newDx = (newDx / magnitude) * speed;
              newDy = (newDy / magnitude) * speed;
            }
          }
        }
        
        // 3. Ball falls below platform - only way to lose a ball
        if (newY + radius > gameSize.height) {
          // For multi-ball, just remove this ball
          return null;
        }
        
        // 4. Check collision with blocks
        const collisionResult = handleBallBlockCollision(
          {...currBall, x: newX, y: newY, dx: newDx, dy: newDy}, 
          blocks
        );
        
        // Apply collision result
        newDx = collisionResult.newDx;
        newDy = collisionResult.newDy;
        
        // Update blocks if this ball hit something
        if (collisionResult.updatedBlocks.length !== blocks.length) {
          setBlocks(collisionResult.updatedBlocks);
          
          // If a block was destroyed, potentially spawn a power-up
          if (collisionResult.destroyed && collisionResult.destroyedPosition) {
            spawnPowerUp(
              collisionResult.destroyedPosition.x,
              collisionResult.destroyedPosition.y
            );
          }
        }
        
        // 5. Update position with the new velocity
        newX = newX + newDx;
        newY = newY + newDy;
        
        return {
          ...currBall,
          x: newX,
          y: newY,
          dx: newDx,
          dy: newDy
        };
      }).filter(Boolean) as Ball[];
    });
    
    // Check if all balls are gone
    if (balls.length === 0) {
      setActivePowerUps(prev => ({ ...prev, multiBall: false }));
      setBalls([ball]); // Reset to main ball
    }
  }
  
  // Update main ball state using the same improved collision logic
  setBall(prevBall => {
    let { x, y, dx, dy, radius, speed } = prevBall;
    
    // 1. Apply wall collisions first
    const wallCollision = handleWallCollisions(prevBall);
    let newDx = wallCollision.dx;
    let newDy = wallCollision.dy;
    let newX = wallCollision.x;
    let newY = wallCollision.y;
    
    // 2. Platform collision
    if (
      newY + radius > platform.y && 
      newY - radius < platform.y + platform.height &&
      newX + radius > platform.x && 
      newX - radius < platform.x + platform.width
    ) {
      if (dy > 0 && newY < platform.y + platform.height/2) {
        const hitPosition = (newX - platform.x) / platform.width;
        // Adjust angle based on where the ball hits the platform
        newDx = speed * (hitPosition - 0.5) * 2.5;
        newDy = -Math.abs(dy);
        
        // Normalize to maintain constant speed
        const magnitude = Math.sqrt(newDx * newDx + newDy * newDy);
        if (magnitude > 0) {
          newDx = (newDx / magnitude) * speed;
          newDy = (newDy / magnitude) * speed;
        }
      }
    }
    
    // 3. Ball-block collision using enhanced precision detection
    const collisionResult = handleBallBlockCollision(
      {...prevBall, x: newX, y: newY, dx: newDx, dy: newDy}, 
      blocks
    );
    
    newDx = collisionResult.newDx;
    newDy = collisionResult.newDy;
    
    // Update blocks if this ball hit something
    if (collisionResult.updatedBlocks.length !== blocks.length) {
      setBlocks(collisionResult.updatedBlocks);
      
      // If a block was destroyed, potentially spawn a power-up
      if (collisionResult.destroyed && collisionResult.destroyedPosition) {
        spawnPowerUp(
          collisionResult.destroyedPosition.x,
          collisionResult.destroyedPosition.y
        );
        
        // Add score for destroyed block
        setScore(prev => prev + 10);
      }
      
      // Check if level is complete
      if (collisionResult.updatedBlocks.length === 0 || 
          collisionResult.updatedBlocks.every(block => block.type === 'unbreakable')) {
        // Level is complete when all breakable blocks are gone
        setGameStarted(false);
        setLevel(prevLevel => prevLevel + 1);
        
        setTimeout(() => {
          setBall({
            x: gameSize.width / 2,
            y: gameSize.height - 60,
            dx: 3 * (Math.random() > 0.5 ? 1 : -1),
            dy: -(3 + level * 0.5),
            radius: 7,
            speed: 3 + level * 0.5
          });
          
          createBlocks(gameSize.width, level + 1);
          setGameStarted(true);
        }, 1500);
      }
    }
    
    // 4. Ball falls below platform - Fix life system for proper gameplay
    // This is the only way a ball can "exit" the game area
    if (newY + radius > gameSize.height) {
      setLives(prevLives => {
        const newLives = Math.max(0, prevLives - 1);
        
        if (newLives <= 0) {
          // Only set game over when lives reach zero
          setGameOver(true);
          setGameStarted(false);
        } else {
          // Reset ball and platform for next life with a better delay
          setTimeout(() => {
            // Center the platform
            setPlatform(prev => ({
              ...prev,
              x: gameSize.width / 2 - prev.width / 2
            }));
            
            // Reset ball with slightly randomized direction
            setBall({
              x: gameSize.width / 2,
              y: gameSize.height - 60,
              dx: speed * (Math.random() > 0.5 ? 1 : -1) * 0.8,
              dy: -speed,
              radius,
              speed
            });
          }, 1000);
        }
        
        return newLives;
      });
      
      // Move ball off screen immediately to avoid further collisions
      return {
        ...prevBall,
        x: gameSize.width / 2,
        y: gameSize.height * 2,
        dx: 0,
        dy: 0
      };
    }
    
    // 5. Update position with new velocity
    newX = newX + newDx;
    newY = newY + newDy;
    
    return {
      ...prevBall,
      x: newX,
      y: newY,
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

  // Start or restart the game - Fixed lives reset
  const startGame = () => {
    if (gameOver) {
      // Reset game state
      setScore(0);
      setLives(3);
      setLevel(1);
      
      createBlocks(gameSize.width, 1);
    }
    
    // Clear any active power-ups
    setPowerUps([]);
    setActivePowerUps({ widePlatform: false, multiBall: false });
    if (powerUpTimeoutRef.current) clearTimeout(powerUpTimeoutRef.current);
    
    // Reset platform to original width
    setPlatform(prev => ({
      ...prev,
      width: 120,
      x: gameSize.width / 2 - 60,
    }));
    
    // Reset ball position on any game start
    setBall({
      x: gameSize.width / 2,
      y: gameSize.height - 60,
      dx: 3,
      dy: -3,
      radius: 7,
      speed: 3 // Initial speed
    });
    
    // Reset platform position
    setPlatform(prev => ({
      ...prev,
      x: gameSize.width / 2 - prev.width / 2,
    }));
    
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
          className={`absolute rounded-md ${
            activePowerUps.widePlatform 
              ? "bg-gradient-to-r from-purple-500 to-pink-600" 
              : "bg-gradient-to-r from-blue-500 to-blue-600"
          }`}
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
        
        {/* Main Ball */}
        <motion.div 
          className="absolute w-[14px] h-[14px] bg-white rounded-full shadow-[0_0_10px_2px_rgba(255,255,255,0.6)]"
          animate={{
            x: ball.x - ball.radius,
            y: ball.y - ball.radius
          }}
          transition={{ type: "tween", duration: 0 }}
        />
        
        {/* Secondary Balls (for multi-ball power-up) */}
        {activePowerUps.multiBall && balls.slice(1).map((secondaryBall, index) => (
          <motion.div 
            key={`ball-${index}`}
            className="absolute w-[14px] h-[14px] bg-yellow-300 rounded-full shadow-[0_0_10px_2px_rgba(255,215,0,0.6)]"
            animate={{
              x: secondaryBall.x - secondaryBall.radius,
              y: secondaryBall.y - secondaryBall.radius
            }}
            transition={{ type: "tween", duration: 0 }}
          />
        ))}
        
        {/* Falling Power-ups */}
        <AnimatePresence>
          {powerUps.map((powerUp) => (
            <motion.div
              key={powerUp.id}
              className={`absolute rounded-md flex items-center justify-center 
                ${powerUp.type === 'widePlatform' ? 'bg-purple-600' : 'bg-yellow-500'}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: powerUp.x,
                y: powerUp.y,
              }}
              exit={{ 
                scale: 1.5,
                opacity: 0,
                transition: { duration: 0.3 }
              }}
              style={{
                width: powerUp.width,
                height: powerUp.height
              }}
            >
              {/* Power-up icon */}
              <span className="text-white font-bold text-lg">
                {powerUp.type === 'widePlatform' ? '↔️' : '➕'}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Blocks with special visual effects */}
        <AnimatePresence>
          {blocks.map((block) => (
            <motion.div
              key={block.id}
              className={`absolute rounded-md ${
                block.type === 'unbreakable' ? 'bg-gray-600 border-2 border-gray-400' :
                block.type === 'explosive' ? 'bg-red-500' :
                block.type === 'moving' ? 'bg-green-500' :
                block.hitPoints === 2 ? 'bg-yellow-500' : 'bg-orange-500'
              }`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: block.type === 'moving' ? [block.x, block.x + 5, block.x - 5, block.x] : block.x
              }}
              exit={{ 
                scale: block.type === 'explosive' ? 2 : 1.5,
                opacity: 0,
                transition: { duration: block.type === 'explosive' ? 0.5 : 0.3 }
              }}
              style={{
                left: block.x,
                top: block.y,
                width: block.width,
                height: block.height
              }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Block content based on type */}
              {block.type === 'explosive' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1/2 h-1/2 text-white text-center font-bold">💣</div>
                </div>
              )}
              
              {block.type === 'unbreakable' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border-4 border-dashed border-gray-300 rounded-sm"></div>
                </div>
              )}
              
              {block.hitPoints === 2 && block.type !== 'unbreakable' && (
                <motion.div 
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-0.5 bg-red-800 rotate-45"></div>
                    <div className="w-full h-0.5 bg-red-800 -rotate-45"></div>
                  </div>
                </motion.div>
              )}
              
              {block.type === 'moving' && (
                <motion.div 
                  className="absolute inset-0"
                  animate={{ 
                    x: [0, 5, -5, 0],
                    transition: { repeat: Infinity, duration: 2 }
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1/2 h-1/2 text-white text-center font-bold">↔️</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Power-up indicator */}
        {(activePowerUps.widePlatform || activePowerUps.multiBall) && (
          <div className="absolute top-12 left-2 flex flex-col gap-1">
            {activePowerUps.widePlatform && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-purple-600 px-2 py-1 rounded text-white text-xs"
              >
                Wide Platform!
              </motion.div>
            )}
            {activePowerUps.multiBall && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="bg-yellow-600 px-2 py-1 rounded text-white text-xs"
              >
                Multi Ball!
              </motion.div>
            )}
          </div>
        )}
        
        {/* Lives indicators with better animation */}
        <div className="absolute top-2 right-2 flex gap-1">
          <AnimatePresence>
            {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
              <motion.div 
                key={`life-${i}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-3 h-3 bg-red-500 rounded-full"
              />
            ))}
          </AnimatePresence>
        </div>
        
        {/* Game state indicators */}
        {lives < 3 && lives > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-red-500 px-3 py-1 rounded-md text-white font-bold"
          >
            Life lost! {lives} remaining
          </motion.div>
        )}
        
        {/* Enhanced life lost indicator */}
        <AnimatePresence>
          {lives < 3 && lives > 0 && !gameOver && (
            <motion.div
              key={`life-lost-${lives}`}
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-red-500 px-6 py-3 rounded-md text-white font-bold z-10 shadow-lg"
            >
              <div className="text-xl mb-1">Life lost!</div>
              <div className="flex justify-center items-center gap-2">
                {Array.from({ length: lives }).map((_, i) => (
                  <motion.div 
                    key={`heart-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                    className="w-6 h-6 bg-red-300 rounded-full flex items-center justify-center"
                  >
                    ❤️
                  </motion.div>
                ))}
              </div>
              <div className="mt-2 text-sm">Get ready... continuing in 1 second</div>
            </motion.div>
          )}
        </AnimatePresence>
        
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
            
            {gameOver && (
              <>
                <p className="text-white text-xl mb-4">Final Score: {score}</p>
                <p className="text-red-500 text-lg mb-4">You lost all your lives!</p>
              </>
            )}
            
            {gameOver && <p className="text-white text-xl mb-4">Final Score: {score}</p>}
            {level > 1 && !gameOver && (
              <p className="text-white text-xl mb-4">You reached level {level}!</p>
            )}
            
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-200"
              onClick={startGame}
            >
              {gameOver ? 'Play Again' : level === 1 ? 'Start Game' : 'Start Level ' + level}
            </button>
            
            {!gameOver && (
              <div className="mt-6 text-white text-center max-w-md">
                <h3 className="text-xl font-semibold mb-2">How to Play:</h3>
                <p>Move your mouse or finger to control the platform.</p>
                <p>Break all blocks to advance to the next level.</p>
                <p>Look out for power-ups and special blocks:</p>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  <div className="flex items-center bg-yellow-500 px-2 py-1 rounded">
                    <span className="mr-1">🔨</span> 2 Hits
                  </div>
                  <div className="flex items-center bg-red-500 px-2 py-1 rounded">
                    <span className="mr-1">💣</span> Explosive
                  </div>
                  <div className="flex items-center bg-green-500 px-2 py-1 rounded">
                    <span className="mr-1">↔️</span> Moving
                  </div>
                  <div className="flex items-center bg-gray-600 px-2 py-1 rounded">
                    <span className="mr-1">🛡️</span> Unbreakable
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PingPongGame;