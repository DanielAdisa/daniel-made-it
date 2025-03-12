"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  href: string;
}

const GameCard: React.FC<GameCardProps> = ({ title, description, image, href }) => {
  return (
    <motion.div 
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.3 }}
    >
      <Link href={href} className="block h-full">
        <div className="relative h-48">
          <Image 
            src={image} 
            alt={title}
            fill
            style={{ objectFit: 'cover' }}
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{description}</p>
          <div className="mt-4">
            <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
              Play Now
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function GamesPage() {
  const games = [
    {
      id: 'snake',
      title: 'Snake Game',
      description: 'Classic snake game where you collect food and grow longer without hitting walls or yourself.',
      image: '/images/games/snake.jpg',
      href: '/games/snake', // Changed from component to route path
    },
    {
      id: 'tetris',
      title: 'Tetris Game',
      description: 'The classic game of Tetris. Arrange the falling blocks to complete lines and score points.',
      image: '/images/games/tic-tac-toe.jpg',
      href: '/games/tetris',
    },
    {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: 'Play the classic game of Tic Tac Toe against a friend or the computer.',
      image: '/images/games/tic-tac-toe.jpg',
      href: '/games/tic-tac-toe',
    },
    {
      id: 'puzzle',
      title: 'Puzzle Game',
      description: 'Arrange the pieces to complete the picture in this challenging puzzle game.',
      image: '/images/games/puzzle.jpg',
      href: '/games/puzzle',
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-10">Game Collection</h1>
      <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
        Explore our collection of classic and modern games. Click on any game to start playing!
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {games.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            description={game.description}
            image={game.image}
            href={game.href}
          />
        ))}
      </div>
    </div>
  );
}
