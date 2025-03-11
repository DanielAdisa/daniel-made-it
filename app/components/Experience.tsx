import { EXPERIENCES } from "../constants";
import { motion } from "framer-motion";
import { SiTypescript, SiTailwindcss, SiFigma, SiAdobexd, SiThreedotjs, SiJest, SiStorybook, SiWebgl } from "react-icons/si";
import { FiArrowUpRight } from "react-icons/fi";
import { ReactNode } from 'react';

const techIcons: Record<string, ReactNode> = {
  TypeScript: <SiTypescript className="text-blue-400" />,
  Tailwind: <SiTailwindcss className="text-cyan-400" />,
  Figma: <SiFigma className="text-pink-400" />,
  'Adobe XD': <SiAdobexd className="text-purple-400" />,
  'Three.js': <SiThreedotjs className="text-emerald-400" />,
  Jest: <SiJest className="text-red-400" />,
  Storybook: <SiStorybook className="text-pink-400" />,
  WebGL: <SiWebgl className="text-orange-400" />
};

const Experience = () => {
  return (
    <section className="py-16 mb-10 bg-gradient-to-b rounded-xl from-stone-950 to-stone-900/90 " id="experience">
      <div className="container px-4 mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-5xl font-bold text-center text-transparent md:text-6xl bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text"
        >
          Professional Journey
          <div className="w-24 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600" />
        </motion.h2>

        <div className="grid grid-cols-1 md:gap-4 gap-7 md:grid-cols-2">
          {EXPERIENCES.map((experience, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.15 }}
              viewport={{ once: true, margin: "-50px" }}
              className="relative group"
            >
              {/* Experience card with glassmorphism */}
              <div className="h-full p-7 transition-all duration-300 border rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20 hover:border-gray-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(107,114,128,0.2)] group-hover:transform group-hover:scale-[1.02]">
                <div className="relative">
                  {/* Year badge */}
                  <div className="absolute px-4 py-2 border rounded-lg shadow-lg -top-12 right-2 bg-gradient-to-r from-gray-600/80 to-gray-700/80 backdrop-blur-sm border-white/10">
                    <p className="text-lg font-bold text-white">{experience.year}</p>
                  </div>
                  
                  {/* Company badge */}
                  <div className="inline-flex items-center px-4 py-2 mb-5 text-sm font-medium text-gray-200 transition-all duration-300 border rounded-full cursor-pointer bg-gradient-to-r from-gray-500/30 to-gray-600/30 border-gray-500/30 hover:border-gray-400/50">
                    @ {experience.company}
                    <FiArrowUpRight className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>

                  {/* Role */}
                  <h3 className="mb-4 text-2xl font-bold text-gray-100">
                    {experience.role}
                  </h3>
                  
                  {/* Description */}
                  <p className="mb-6 text-base leading-relaxed text-gray-300">
                    {experience.description}
                  </p>
                  
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-2.5">
                    {experience.technologies.map((tech, techIndex) => (
                      <motion.div
                        key={techIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + (techIndex * 0.1) }}
                        className="px-3 py-1.5 text-sm rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-gray-200 flex items-center gap-2 hover:bg-white/20 hover:border-white/30 transition-all duration-300 cursor-default"
                      >
                        {techIcons[tech]}
                        {tech}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute w-24 h-24 transition-opacity rounded-full -bottom-2 -right-2 bg-gradient-to-br from-gray-500/20 to-gray-600/20 blur-2xl opacity-70 group-hover:opacity-100"></div>
                <div className="absolute w-20 h-20 rounded-full -top-2 -left-2 bg-gradient-to-br from-gray-500/20 to-gray-600/20 blur-xl opacity-70"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;