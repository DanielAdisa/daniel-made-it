import React from "react";
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { BiLogoPostgresql, BiLogoTailwindCss } from "react-icons/bi";
import { DiRedis } from "react-icons/di";
import { FaNodeJs } from "react-icons/fa";
import { RiReactjsFill } from "react-icons/ri";
import { TbBrandNextjs } from "react-icons/tb";
import { 
  SiMongodb, 
  SiPhp, 
  SiAdobephotoshop, 
  SiBlender, 
  SiCinema4D, 
  SiVuedotjs,
  SiSvelte,
  SiAngular,
  SiJavascript,
  SiFigma,
  SiAdobexd,
  SiAdobeaftereffects,
  SiSketch,
  SiPrisma, 
  SiTypescript, 
  SiRedux, 
  SiGraphql, 
  SiChakraui,
  SiExpress,
  SiNestjs,
  SiFirebase,
  SiDocker,
  SiAdobeillustrator,
  SiInvision,
  SiFramer,
  SiAwslambda,
  SiGooglecloud,
  SiJenkins,
  SiKubernetes
} from "react-icons/si";


// Tech stack data with skill levels and categories
const TECH_STACK = [
  // Frontend
  { Icon: RiReactjsFill, name: "React", color: "text-cyan-400", level: 95, category: "frontend" },
  { Icon: TbBrandNextjs, name: "Next.js", color: "text-white", level: 90, category: "frontend" },
  { Icon: BiLogoTailwindCss, name: "Tailwind CSS", color: "text-sky-400", level: 98, category: "frontend" },
  { Icon: SiVuedotjs, name: "Vue.js", color: "text-green-400", level: 87, category: "frontend" },
  { Icon: SiSvelte, name: "Svelte", color: "text-orange-400", level: 85, category: "frontend" },
  { Icon: SiAngular, name: "Angular", color: "text-red-600", level: 80, category: "frontend" },
  { Icon: SiJavascript, name: "JavaScript", color: "text-yellow-500", level: 93, category: "frontend" },
  { Icon: SiTypescript, name: "TypeScript", color: "text-blue-600", level: 90, category: "frontend" },
  { Icon: SiRedux, name: "Redux", color: "text-purple-500", level: 85, category: "frontend" },
  { Icon: SiGraphql, name: "GraphQL", color: "text-pink-500", level: 80, category: "frontend" },
  { Icon: SiChakraui, name: "Chakra UI", color: "text-teal-400", level: 88, category: "frontend" },

  // Backend
  { Icon: SiMongodb, name: "MongoDB", color: "text-emerald-500", level: 85, category: "backend" },
  { Icon: SiPrisma, name: "Prisma", color: "text-white", level: 85, category: "backend" },
  { Icon: FaNodeJs, name: "Node.js", color: "text-green-500", level: 88, category: "backend" },
  { Icon: SiPhp, name: "PHP", color: "text-purple-600", level: 80, category: "backend" },
  { Icon: BiLogoPostgresql, name: "PostgreSQL", color: "text-blue-500", level: 82, category: "backend" },
  { Icon: DiRedis, name: "Redis", color: "text-red-500", level: 75, category: "backend" },
  { Icon: SiExpress, name: "Express.js", color: "text-gray-400", level: 85, category: "backend" },
  { Icon: SiNestjs, name: "NestJS", color: "text-red-500", level: 80, category: "backend" },
  { Icon: SiFirebase, name: "Firebase", color: "text-orange-500", level: 75, category: "backend" },
  { Icon: SiDocker, name: "Docker", color: "text-blue-400", level: 78, category: "backend" },

  // Design
  { Icon: SiAdobephotoshop, name: "Photoshop", color: "text-[#00ffff]", level: 85, category: "design" },
  { Icon: SiBlender, name: "Blender", color: "text-[#e87d0d]", level: 75, category: "design" },
  { Icon: SiCinema4D, name: "Cinema 4D", color: "text-sky-600", level: 70, category: "design" },
  { Icon: SiFigma, name: "Figma", color: "text-pink-500", level: 90, category: "design" },
  { Icon: SiAdobexd, name: "Adobe XD", color: "text-blue-500", level: 88, category: "design" },
  { Icon: SiAdobeaftereffects, name: "After Effects", color: "text-purple-500", level: 80, category: "design" },
  { Icon: SiSketch, name: "Sketch", color: "text-yellow-500", level: 75, category: "design" },
  { Icon: SiAdobeillustrator, name: "Illustrator", color: "text-orange-600", level: 85, category: "design" },
  { Icon: SiInvision, name: "InVision", color: "text-pink-400", level: 70, category: "design" },
  { Icon: SiFramer, name: "Framer", color: "text-blue-600", level: 75, category: "design" },
  
  // DevOps
  { Icon: SiAwslambda, name: "AWS", color: "text-amber-500", level: 75, category: "devops" },
  { Icon: SiGooglecloud, name: "Google Cloud", color: "text-blue-400", level: 70, category: "devops" },
  { Icon: SiJenkins, name: "Jenkins", color: "text-red-400", level: 65, category: "devops" },
  { Icon: SiKubernetes, name: "Kubernetes", color: "text-blue-500", level: 68, category: "devops" },
];

// Tech card component with hover effects
interface Tech {
  Icon: React.ComponentType;
  name: string;
  color: string;
  level: number;
  category: string;
}

const TechCard = ({ tech, index }: { tech: Tech; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const cardRef = useRef(null);

  // Detect when card is in view for additional animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.2 }
    );
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);
  
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: {
          type: "spring",
          bounce: 0.4,
          duration: 0.8,
          delay: index * 0.05 // Faster stagger for better UX
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative flex flex-col items-center p-4 transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Neumorph background shape with 3D effect */}
      <motion.div 
        className="absolute inset-0 border rounded-2xl bg-gradient-to-br from-black/40 to-black/5 backdrop-blur-sm border-white/5"
        animate={{ 
          scale: isHovered ? 1 : 0.95,
          opacity: isHovered ? 1 : 0
        }}
        transition={{ duration: 0.4 }}
      />
      
      {/* Magnetic effect container */}
      <motion.div 
        className="relative z-10 flex flex-col items-center px-4 py-6"
        animate={{ 
          y: isHovered ? -8 : 0,
          rotateX: isHovered ? 10 : 0,
          rotateY: isHovered ? -10 : 0
        }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 15
        }}
      >
        <div className="relative mb-6">
          {/* Interactive particle field */}
          {isHovered && (
            <motion.div 
              className="absolute inset-0 w-32 h-32 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {[...Array(8)].map((_, particleIndex) => (
                <motion.div
                  key={particleIndex}
                  className={`absolute w-1 h-1 rounded-full ${tech.color.replace('text-', 'bg-')}`}
                  initial={{ 
                    x: 0, 
                    y: 0, 
                    opacity: 0.7,
                    scale: 0.5
                  }}
                  animate={{ 
                    x: Math.random() * 80 - 40,
                    y: Math.random() * 80 - 40,
                    opacity: [0.7, 1, 0],
                    scale: [0.5, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5 + Math.random() * 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    delay: Math.random() * 0.5
                  }}
                />
              ))}
            </motion.div>
          )}
          
          {/* Multiple glowing background layers */}
          <motion.div 
            className={`absolute inset-0 rounded-full blur-xl ${tech.color.replace('text-', 'bg-')}/30`}
            animate={{
              scale: isHovered ? [1, 1.2, 1.1] : 0.9,
              opacity: isHovered ? [0.3, 0.6, 0.4] : 0.1
            }}
            transition={{ 
              duration: isHovered ? 2 : 0.3,
              repeat: isHovered ? Infinity : undefined,
              repeatType: "reverse"
            }}
          />
          
          {/* Secondary glow with inverse animation */}
          <motion.div 
            className={`absolute inset-0 rounded-full blur-lg ${tech.color.replace('text-', 'bg-')}/20`}
            animate={{
              scale: isHovered ? [1.1, 0.9, 1.1] : 0.8,
              opacity: isHovered ? [0.2, 0.4, 0.2] : 0.05
            }}
            transition={{ 
              duration: isHovered ? 2.5 : 0.3,
              repeat: isHovered ? Infinity : undefined,
              repeatType: "reverse",
              delay: 0.2
            }}
          />
          
          {/* Orbital rings */}
          <motion.div 
            className="absolute inset-0 border-2 border-dashed rounded-full border-white/5"
            style={{ width: '100%', height: '100%' }}
            animate={{ 
              rotate: 360,
              scale: isHovered ? 1.4 : 1.1
            }}
            transition={{ 
              rotate: { 
                duration: 15, 
                ease: "linear", 
                repeat: Infinity 
              },
              scale: {
                duration: 0.4,
                type: "spring"
              }
            }}
          />
          
          <motion.div 
            className="absolute inset-0 border rounded-full border-white/10"
            style={{ width: '110%', height: '110%' }}
            animate={{ 
              rotate: -360,
              scale: isHovered ? 1.2 : 1
            }}
            transition={{ 
              rotate: { 
                duration: 10, 
                ease: "linear", 
                repeat: Infinity 
              },
              scale: {
                duration: 0.3
              }
            }}
          />
          
          {/* Icon container with glass effect */}
          <motion.div
            className="relative z-10 flex items-center justify-center w-20 h-20 border rounded-full shadow-lg bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border-white/20"
            animate={{ 
              y: isHovered ? -5 : 0,
              scale: isHovered ? 1.1 : 1,
              rotateY: isHovered ? [0, 10, -10, 0] : 0
            }}
            transition={{ 
              y: { type: "spring", stiffness: 300, damping: 15 },
              scale: { type: "spring", stiffness: 300, damping: 15 },
              rotateY: { duration: isHovered ? 2 : 0.3, repeat: isHovered ? Infinity : null, repeatType: "reverse" }
            }}
          >
            {/* Grain texture overlay */}
            <div className="absolute inset-0 rounded-full opacity-20 bg-noise" />
            
            {/* Dynamic icon with pulse effect */}
            <motion.div
              animate={isHovered ? {
                scale: [1, 1.05, 1],
                transition: { duration: 1.5, repeat: Infinity }
              } : {}}
            >
              {React.createElement(tech.Icon as React.ComponentType<{ className: string }>, { className: `text-5xl ${tech.color} filter drop-shadow-lg` })}
            </motion.div>
          </motion.div>
        </div>

        {/* Tech name with enhanced typography */}
        <motion.div
          className="relative z-10 mt-1 text-center"
          animate={{
            opacity: isHovered ? 1 : 0.7
          }}
        >
          <motion.h3 
            className="text-sm font-medium tracking-wider"
            animate={{
              y: isHovered ? 0 : 3
            }}
          >
            {tech.name}
          </motion.h3>
          
          {/* Experience years badge */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: isHovered ? 1 : 0,
              height: isHovered ? 'auto' : 0
            }}
            transition={{ duration: 0.2 }}
            className="mt-1 text-xs text-white/60"
          >
            {Math.floor(tech.level / 10)} years exp.
          </motion.div>
          
          {/* Enhanced skill progress indicator */}
          {isHovered && (
            <motion.div 
              className="relative flex items-center justify-center w-32 h-[15px] mt-3 overflow-hidden border rounded-full bg-white/10 backdrop-blur-sm border-white/5"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "100%" }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress fill */}
              <motion.div 
                className={`absolute top-0 left-0 h-full ${tech.color.replace('text-', 'bg-')}`}
                style={{ width: `${tech.level}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {/* Animated gradient overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{
                    x: ['-100%', '200%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear",
                    delay: 0.2
                  }}
                />
              </motion.div>
              {/* Skill level indicator */}
              <motion.span
                className="absolute text-[10px] flex items-center justify-center font-medium text-white/80"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {tech.level}%
              </motion.span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
      
      {/* Experience level classification */}
      {isHovered && tech.level >= 90 && (
        <motion.div
          className="absolute top-0 right-0 px-2 py-1 text-xs text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-br-xl rounded-tl-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Expert
        </motion.div>
      )}
    </motion.div>
  );
};


const Technologies = () => {
  const ref = useRef(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Filter technologies by category
  const filteredTech = activeFilter === "all" 
    ? TECH_STACK 
    : TECH_STACK.filter(tech => tech.category === activeFilter);

  return (
    <section ref={ref} className="relative py-24 overflow-hidden">
      {/* Background elements */}
      <motion.div 
        className="absolute inset-0 -z-10 opacity-20 bg-position"
        style={{ backgroundPosition: `0 ${yBg.get()}px` }}
      >
        <div className="absolute inset-0 radial-gradient"></div>
        <div className="absolute inset-0 linear-gradient"></div>
      </motion.div>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
        className="container mx-auto mb-16 text-center"
      >
        <h2 className="mb-3 text-4xl font-bold tracking-tighter text-transparent bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text md:text-5xl">
          Technology Stack
        </h2>
        <p className="max-w-2xl mx-auto text-stone-400">
          Modern tools and technologies I use to bring ideas to life
        </p>
        
        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mt-8">
          {["all", "frontend", "backend", "design" ,"devops"].map(category => (
            <motion.button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-1 text-sm rounded-full backdrop-blur-md transition-all ${
                activeFilter === category 
                  ? "bg-stone-800 text-white border-white/20" 
                  : "bg-stone-900/50 text-stone-400 border-stone-800"
              } border`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Tech grid with animation */}
      <div className="container mx-auto">
        <motion.div 
          className="grid grid-cols-3 gap-4 md:grid-cols-3 lg:grid-cols-5"
          layout
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          {filteredTech.map((tech, index) => (
            <TechCard key={tech.name} tech={tech} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Technologies;