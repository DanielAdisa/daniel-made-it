import { motion } from "framer-motion";
import { MISSION } from "@/app/gks/constants";

const Mission = () => {
  return (
    <section id="mission">
      <div className="container mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-3xl lg:text-4xl"
        >
          Our <span className="text-rose-300">Mission</span>
        </motion.h2>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative flex items-end justify-center"
        >
          <video 
            className="w-full shadow-2xl rounded-3xl" 
            autoPlay 
            muted 
            loop 
            playsInline 
            poster="/mission.jpeg"
          >
            <source src="/mission.mp4" type="video/mp4" />
          </video>
          <div className="absolute w-full h-full p-2 rounded-3xl bg-black/40"/>
          <motion.p 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="absolute items-start max-w-lg font-serif tracking-tighter text-white mb-36 lg:text-3xl"
          >
            <span className="text-rose-300">"</span>
            {MISSION}
            <span className="text-rose-300">"</span>
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}

export default Mission;
