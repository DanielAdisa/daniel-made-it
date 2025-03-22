import { motion } from "framer-motion";
import { ABOUT } from "@/app/gks/constants";
import Image from "next/image";

const About = () => {
  return (
    <section className="container mx-auto mb-8" id="about">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-3xl tracking-tighter text-center lg:text-4xl"
        >
            About Us
        </motion.h2>
        <div className="flex flex-wrap">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full p-4 lg:w-1/2"
          >
              <Image 
                src="/about.jpeg" 
                alt="About Gwen's Kitchen" 
                width={600} 
                height={400} 
                className="transition-transform duration-500 shadow-2xl rounded-3xl lg:-rotate-3 hover:scale-105" 
              />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full p-4 lg:w-1/2"
          >
              <h2 className="text-4xl tracking-tighter lg:text-6xl">
                  {ABOUT.header}
              </h2>
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: "9rem" }}
                transition={{ duration: 0.8 }}
                className="h-2 mt-1 mb-8 bg-rose-300 lg:-rotate-3"
              />
              <p className="m-8 text-2xl leading-relaxed tracking-tight lg:max-w-xl">
                  {ABOUT.content}
              </p>
          </motion.div>
        </div>
    </section>
  )
}

export default About;
