"use client"

import { useState, useEffect, lazy, Suspense, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Navbar from "./components/Navbar"
import Pricing from "./components/Pricing" // Import the Pricing component
import { BiDollar } from "react-icons/bi"
// import SnakeGame from './Games';

// Lazy load components for better performance
const Hero = lazy(() => import("./components/Hero"))
const Technologies = lazy(() => import("./components/Technologies"))
const Projectslink = lazy(() => import("./components/Projectslink"))
const Projects = lazy(() => import("./components/Projects"))
const Experience = lazy(() => import("./components/Experience"))
const Contact = lazy(() => import("./components/Contact"))

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center w-full h-32">
    <div className="w-8 h-8 border-2 rounded-full border-t-transparent border-stone-300 animate-spin"></div>
  </div>
)

const App = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const pricingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => setIsLoaded(true), 800)
    
    // Track scroll position for parallax effects
    const handleScroll = () => setScrollPosition(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="overflow-x-hidden antialiased text-stone-200 selection:bg-stone-700/30 selection:text-stone-50"
      >
        {/* Enhanced background with animated gradient and noise texture */}
        <div className="fixed inset-0 -z-10">
          <div className="relative w-full h-full bg-black">
            {/* Enhanced grid pattern with subtle gradient */}
            <div className="absolute inset-0">
  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.08)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
  <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.15)_1px,transparent_1px)] bg-[size:140px_140px]"></div>
  <motion.div
    className="absolute inset-0 bg-[radial-gradient(circle_600px_at_center,rgba(14,165,233,0.10),transparent)]"
    animate={{
      opacity: [0.3, 0.2, 0.3],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
</div>
            
            {/* Animated subtle glow */}
            <motion.div 
              className="absolute left-0 right-0 top-[-10%] h-[1000px] w-[1000px] rounded-full opacity-60 bg-[radial-gradient(circle_400px_at_50%_300px,#fbfbfb36,#000)]"
              animate={{ 
                opacity: [0.4, 0.6, 0.4],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 8, 
                ease: "easeInOut", 
                repeat: Infinity 
              }}
              style={{
                transform: `translateY(${scrollPosition * 0.05}px)`
              }}
            ></motion.div>
            
            {/* Grain texture overlay */}
            <div className="absolute inset-0 opacity-20 mix-blend-soft-light bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]"></div>
            
            {/* Subtle accent color gradients in corners */}
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-5 bg-gradient-radial from-stone-300 to-transparent"></div>
            <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full opacity-5 bg-gradient-radial from-stone-400 to-transparent"></div>
          </div>
        </div>

        {/* Main content container with increased max width */}
        <div className="container max-w-6xl px-6 mx-auto md:px-8">
          
          <Suspense fallback={<LoadingSpinner />}>
            {isLoaded && (
              <>
                <Hero />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Technologies />
                  <Projectslink />
                  <Projects />
                  <Experience />
                  <div ref={pricingRef}>
                  <Pricing />
                  </div>
                  <Contact />
                  {/* <div id="games" className='relative z-0'>
                    <SnakeGame />
                  </div>
                   */}
                  {/* Footer */}
                  <footer className="py-8 mt-20 text-sm text-center border-t text-stone-500 border-stone-800">
                    <p>© {new Date().getFullYear()} Daniel Adisa. All rights reserved.</p>
                    <p className="mt-2">Built with React, Framer Motion, and TailwindCSS</p>
                  </footer>
                </motion.div>
              </>
            )}
          </Suspense>
        </div>

        {/* Scroll to top button */}
        {scrollPosition > 600 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed z-50 p-3 transition-colors rounded-full shadow-lg bottom-16 right-4 bg-stone-800/80 backdrop-blur-sm hover:bg-stone-700"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
            </svg>
          </motion.button>
        )}
        
        {/* Pricing button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={scrollToPricing}
          className="fixed z-50 p-3 transition-colors rounded-full shadow-lg bottom-4 right-4 bg-stone-800/80 backdrop-blur-sm hover:bg-stone-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BiDollar size={20} />
        </motion.button>
        
        
      </motion.div>
    </AnimatePresence>
  )
}

export default App