
import { motion, useTransform, useScroll } from "framer-motion";
import { HERO_CONTENT } from "../constants";
import desire from "@/public/assets/projects/1.png";


// Typed animation variants
const containerVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      staggerChildren: 0.3,
      ease: "easeOut"
    }
  }
};

const childVariants = {
  hidden: { opacity: 0, x: -100 },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const imageVariants = {
  hidden: { x: 100, opacity: 0, scale: 0.95 },
  visible: { 
    x: 0, 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 1, 
      delay: 1, 
      ease: "easeOut" 
    }
  },
  hover: {
    scale: 1.03,
    transition: { duration: 0.3 }
  }
};

// Social link configuration
const SOCIAL_LINKS = [
  {
    name: "GitHub",
    href: "#",
    iconPath: "M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
  },
  {
    name: "LinkedIn",
    href: "#",
    iconPath: "M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"
  }
];

const Hero = () => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 50], { clamp: false });

  return (

    <div className="relative overflow-hidden pb- lg:mb-" id="hero">
      <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-stone-900/30 to-transparent" />
      
      <div className="relative z-10 flex flex-wrap lg:flex-row-reverse">
        {/* Image Section */}

    <div className="pb-4 lg:mb-6">
        <div className="flex flex-wrap lg:flex-row-reverse">
            

        <div className="w-full lg:w-1/2">
          <div className="flex justify-center lg:p-8">
            <motion.div
              className="relative group"
              style={{ y }}
            >
              <div className="absolute inset-0 transition-all duration-300 rounded-3xl bg-gradient-to-tr from-stone-500/20 to-stone-300/10 blur-2xl group-hover:opacity-75" />
              
              <motion.img 
                src={desire.src} 
                alt="Daniel Adisa - Full Stack Developer"
                className="relative border border-stone-800 rounded-3xl backdrop-blur-sm transform-gpu"
                width={650}
                height={650}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                loading="eager"
              />
            </motion.div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="w-full lg:w-1/2">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="flex flex-col items-center p-4 mt-10 lg:items-start lg:pl-12"
          >
            {/* Name & Title */}
            <motion.h1
              variants={childVariants}
              className="relative pb-2 text-4xl font-bold tracking-tighter lg:text-7xl xl:text-8xl"
            >
              <span className="text-transparent whitespace-nowrap bg-gradient-to-r from-stone-100 to-stone-400 bg-clip-text">
                Daniel Adisa
              </span>
              <span className="absolute left-0 w-1/4 h-1 -bottom-1 bg-gradient-to-r from-stone-300 to-transparent" />
            </motion.h1>
            
            <motion.div
              variants={childVariants}
              className="relative flex items-center gap-3 mt-4"
            >
              <span className="text-2xl tracking-tight text-transparent lg:text-3xl bg-gradient-to-r from-stone-300 to-stone-600 bg-clip-text">
                Full Stack Developer
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping motion-reduce:animate-none" />
            </motion.div>

            {/* Bio */}
            <motion.p
              variants={childVariants}
              className="max-w-lg py-6 my-2 text-lg leading-relaxed tracking-tight lg:text-xl text-stone-300"
            >
              {HERO_CONTENT}
            </motion.p>

            {/* Action Buttons */}
            <motion.div 
              variants={childVariants}
              className="flex flex-wrap gap-4 mt-4"
            >
              <motion.a 
                href="/resume.pdf"
                download
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all rounded-full bg-stone-800 hover:bg-stone-700 text-stone-100 group"
                whileHover={{ scale: 1.05 }}
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
                className="px-6 py-3 text-sm font-medium transition-all border rounded-full border-stone-600 hover:border-stone-400 text-stone-100"
                whileHover={{ scale: 1.05 }}
              >
                Let's Talk →
              </motion.a>
            </motion.div>

            {/* Social Links */}
            {/* <motion.div 
              variants={childVariants}
              className="flex gap-4 mt-8"
            >
              {SOCIAL_LINKS.map((link) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 transition-all rounded-full bg-stone-800 hover:bg-stone-700 text-stone-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24"
                    className="fill-current"
                  >
                    <path d={link.iconPath} />
                  </svg>
                  <span className="sr-only">{link.name}</span>
                </motion.a>
              ))}
            </motion.div> */}
          </motion.div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}

export default Hero;