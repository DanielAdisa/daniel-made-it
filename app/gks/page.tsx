"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import Navbar from "@/app/gks/components/Navbar";
import HeroSection from "@/app/gks/components/HeroSection";
import About from "@/app/gks/components/About";
import Dishes from "@/app/gks/components/Dishes";
import Expertise from "@/app/gks/components/Expertise";
import Mission from "@/app/gks/components/Mission";
import Review from "@/app/gks/components/Review";
import Contact from "@/app/gks/components/Contact";
import Footer from "@/app/gks/components/Footer";

// Animation variants for smoother transitions
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.22, 1, 0.36, 1] 
    }
  }
};

export default function GwensKitchen() {
  // Progressive loading state ref
  const mainRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: mainRef,
    offset: ["start start", "end end"]
  });
  
  // Smooth scroll indicator
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Prevent animation jank on first load
  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => {
      document.body.style.overflowX = "auto";
    };
  }, []);

  return (
    <main ref={mainRef} className="relative min-h-screen text-white bg-gradient-to-b from-purple-950 to-black">
      {/* Progress indicator */}
      <motion.div 
        className="fixed top-0 left-0 right-0 z-50 h-1 origin-left bg-purple-400"
        style={{ scaleX, willChange: "transform" }} 
      />
      
      <Navbar />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.22, 1, 0.36, 1] 
        }}
        style={{ willChange: "opacity, transform" }}
      >
        <HeroSection />
      </motion.div>

      {/* Sections with staggered reveal and optimized rendering */}
      {[
        { Component: About, bgClass: "py-16" },
        { Component: Dishes, bgClass: "py-16 bg-purple-950/30" },
        { Component: Expertise, bgClass: "py-16" },
        { Component: Mission, bgClass: "py-16 bg-purple-950/30" },
        { Component: Review, bgClass: "py-16" },
        { Component: Contact, bgClass: "py-16 bg-purple-950/30" }
      ].map(({ Component, bgClass }, index) => (
        <motion.div
          key={index}
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ 
            once: true, 
            margin: "-10% 0px -10% 0px" 
          }}
          className={bgClass}
          style={{ willChange: "opacity, transform" }}
        >
          <Component />
        </motion.div>
      ))}

      <Footer />
    </main>
  );
}
