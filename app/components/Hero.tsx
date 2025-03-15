import { motion, useTransform, useScroll, useMotionValue, useSpring, AnimatePresence, MotionValue, Variants } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial } from '@react-three/drei';
import { Mesh } from 'three';
import { HERO_CONTENT } from "../constants";
import desire from "@/public/assets/projects/1.png";
import Image from 'next/image';

const AnimatedSphere = ({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) => {
  const mesh = useRef<Mesh>(null);
  
  useFrame(() => {
    if (mesh.current) {
      mesh.current.rotation.x += 0.01;
      mesh.current.rotation.y += 0.01;
      mesh.current.position.x = (mouseX.get() - 0.5) * 2;
      mesh.current.position.y = (mouseY.get() - 0.5) * -2;
    }
  });

  return (
    <Sphere args={[1, 100, 100]} ref={mesh} scale={2}>
      <MeshDistortMaterial 
        color="#333333" 
        attach="material" 
        distort={0.6} 
        speed={1.5} 
        roughness={0.4}
      />
    </Sphere>
  );
};

// Floating skill badges
const SKILLS = [
  "React", "Next.js", "TypeScript", "Node.js", 
  "GraphQL", "MongoDB", "AWS", "Docker"
];

// Text animation variants
const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.3
    }
  }
};

const textChildVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      damping: 12
    }
  }
};

const gradientVariants: Variants = {
  initial: { backgroundPosition: "0% 50%" },
  animate: { 
    backgroundPosition: "100% 50%", 
    transition: { 
      repeat: Infinity, 
      repeatType: "reverse" as const, 
      duration: 15, 
      ease: "linear"
    } 
  }
};

const floatingBadgeVariants = {
  initial: ({ index }: { index: number }) => ({
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    opacity: 0.7,
    scale: 0.9
  }),
  animate: ({ index }: { index: number }) => ({
    x: 0,
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      delay: index * 0.1
    }
  }),
  hover: {
    scale: 1.2,
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
    transition: { duration: 0.3 }
  }
};

const imageRevealVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.8,
    filter: "blur(10px)" 
  },
  visible: { 
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { 
      duration: 1.2,
      ease: "easeOut"  // Changed from [0.6, 0.01, -0.05, 0.9] to "easeOut"
    }
  },
  hover: {
    scale: 1.03,
    filter: "brightness(1.1)",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
    transition: { duration: 0.4 }
  }
};

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 50], { clamp: false });
  
  // Mouse position for cursor and interactive elements
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const smoothMouseX = useSpring(mouseX, { stiffness: 100, damping: 25 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 100, damping: 25 });

  // Time-based color theme
  const [colorTheme, setColorTheme] = useState({
    primary: "from-stone-100 to-stone-400",
    secondary: "from-stone-300 to-stone-600",
    accent: "bg-emerald-400"
  });
  
  // Update mouse position for interactive elements
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  
  // Set color theme based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) {
      // Morning theme
      setColorTheme({
        primary: "from-amber-100 to-amber-400",
        secondary: "from-amber-300 to-amber-600",
        accent: "bg-amber-400"
      });
    } else if (hour >= 12 && hour < 18) {
      // Afternoon theme
      setColorTheme({
        primary: "from-sky-100 to-sky-400",
        secondary: "from-sky-300 to-sky-600",
        accent: "bg-sky-400"
      });
    } else {
      // Evening/night theme
      setColorTheme({
        primary: "from-indigo-100 to-indigo-400",
        secondary: "from-indigo-300 to-indigo-600",
        accent: "bg-indigo-400"
      });
    }
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden py-10" id="hero">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-40">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <AnimatedSphere mouseX={smoothMouseX} mouseY={smoothMouseY} />
        </Canvas>
      </div>
      
      {/* Custom Cursor Effect - Follows mouse with delay */}
      <motion.div
        className="fixed w-6 h-6 rounded-full pointer-events-none z-50 mix-blend-difference bg-white"
        style={{
          x: useTransform(smoothMouseX, [0, 1], [0, window.innerWidth - 24]),
          y: useTransform(smoothMouseY, [0, 1], [0, window.innerHeight - 24]),
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-wrap lg:flex-row-reverse">
          {/* Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative flex justify-center lg:p-8 perspective-1000">
              <motion.div
                className="relative group"
                style={{ 
                  y,
                  rotateX: useTransform(smoothMouseY, [0, 1], [5, -5]),
                  rotateY: useTransform(smoothMouseX, [0, 1], [-5, 5]) 
                }}
              >
                {/* Interactive glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-3xl blur-2xl"
                  style={{
                    background: `radial-gradient(circle at ${useTransform(smoothMouseX, [0, 1], [0, 100])}% ${useTransform(smoothMouseY, [0, 1], [0, 100])}%, rgba(255,255,255,0.15), transparent)`,
                  }}
                />
                
                <motion.div
                  className="relative border border-stone-800 rounded-3xl overflow-hidden backdrop-blur-sm"
                  variants={imageRevealVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                >
                  <Image 
                    src={desire} 
                    alt="Daniel Adisa - Full Stack Developer"
                    width={650}
                    height={650}
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJOgN9fOitggAAAABJRU5ErkJggg=="
                    className="transform-gpu"
                  />
                  
                  {/* Floating skill badges */}
                  <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {SKILLS.map((skill, index) => (
                      <motion.span 
                        key={skill}
                        custom={{ index }}
                        variants={floatingBadgeVariants}
                        initial="initial"
                        animate="animate"
                        whileHover="hover"
                        className="px-3 py-1 text-xs font-medium rounded-full bg-black/70 text-white backdrop-blur-sm"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
          
          {/* Content Section */}
          <div className="w-full lg:w-1/2">
            <motion.div
              className="flex flex-col items-center p-4 mt-10 lg:items-start lg:pl-12"
            >
              {/* Name & Title with advanced animations */}
              <motion.div
                variants={textContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.h1 className="relative pb-2 text-4xl font-bold tracking-tighter lg:text-7xl xl:text-8xl">
                  {Array.from("Daniel Adisa").map((letter, index) => (
                    <motion.span
                      key={index}
                      variants={textChildVariants}
                      className={`inline-block whitespace-pre ${letter === ' ' ? 'mr-2' : ''} ${letter !== ' ' ? `text-transparent bg-gradient-to-r ${colorTheme.primary} bg-clip-text` : ''}`}
                    >
                      {letter}
                    </motion.span>
                  ))}
                  <motion.span 
                    className="absolute left-0 w-1/4 h-1 -bottom-1"
                    initial={{ width: 0 }}
                    animate={{ width: "40%" }}
                    transition={{ delay: 2, duration: 1.5 }}
                    style={{
                      background: `linear-gradient(to right, rgb(214, 211, 209), transparent)`
                    }}
                  />
                </motion.h1>
                
                <motion.div
                  variants={textChildVariants}
                  className="relative flex items-center gap-3 mt-6"
                >
                  <motion.span 
                    className={`text-2xl tracking-tight text-transparent lg:text-3xl bg-gradient-to-r ${colorTheme.secondary} bg-clip-text`}
                    variants={gradientVariants}
                    initial="initial"
                    animate="animate"
                  >
                    Full Stack Developer
                  </motion.span>
                  <motion.span 
                    className={`w-2 h-2 rounded-full ${colorTheme.accent}`}
                    animate={{ 
                      scale: [1, 1.5, 1], 
                      opacity: [1, 0.7, 1] 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2 
                    }}
                  />
                </motion.div>

                {/* Bio with staggered animation */}
                <motion.p
                  variants={textChildVariants}
                  className="max-w-lg py-6 my-4 text-lg leading-relaxed tracking-tight lg:text-xl text-stone-300"
                >
                  {HERO_CONTENT}
                </motion.p>

                {/* Action Buttons */}
                <motion.div className="flex flex-col gap-4 mt-4">
                  <motion.a 
                     href="/resume.pdf"
                     download
                    className="flex w-fit items-center gap-2 px-6 py-3 text-sm font-medium transition-all rounded-full bg-stone-800 hover:bg-stone-700 text-stone-100 group"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-5 h-5 transition-transform group-hover:translate-y-0.5"
                      fill="currentColor" 
                      viewBox="0 0 16 16"
                    >
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                    </svg>
                    Download Resume
                  </motion.a>
                  
                  <motion.a 
                    href="https://wa.me/message/V4TC5GSQTN7RM1"
                    className="px-6 py-3 text-sm w-fit font-medium transition-all border rounded-full border-stone-600 hover:border-stone-400 text-stone-100 overflow-hidden group relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10">Let's Talk</span>
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-stone-600 to-stone-500 opacity-0 group-hover:opacity-100"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.span
                      className="ml-1 relative z-10"
                      animate={{ x: [0, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      →
                    </motion.span>
                  </motion.a>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;