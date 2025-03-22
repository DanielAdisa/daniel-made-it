import { motion } from "framer-motion";
import Image from "next/image";

const HeroSection = () => {
  return (
    <section id="home" className="relative flex items-center justify-center h-screen">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden -z-20">
            <video 
                src="/hero.mp4" 
                className="object-cover w-full h-full" 
                muted 
                autoPlay 
                loop 
                playsInline 
                poster="/logo.svg">
            </video>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-10% to-purple-950"></div>
        
        {/* Content */}
        <div className="relative z-20 flex flex-col justify-end h-screen pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <Image src="/logo.svg" alt="Gwen's Kitchen" width={400} height={150} className="w-full p-4" />
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="p-4 text-lg font-light tracking-wider text-white md:text-xl lg:text-2xl"
            >
              <span className="text-rose-300">Exquisite</span> Culinary Experience
            </motion.p>
          </motion.div>
        </div>
    </section>
  )
}

export default HeroSection;
