import { EXPERIENCES } from "../constants";
import { motion, AnimatePresence } from "framer-motion";
import { SiTypescript, SiTailwindcss, SiFigma, SiAdobexd, SiThreedotjs, SiJest, SiStorybook, SiWebgl } from "react-icons/si";
import { FiArrowUpRight, FiChevronDown, FiChevronUp, FiDownload, FiClock, FiGrid, FiAlignCenter } from "react-icons/fi";
import { ReactNode, useState, useRef, useEffect } from 'react';
import { RiAwardLine } from "react-icons/ri";

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

// Extract all unique technologies from experiences
const getAllTechnologies = () => {
  const techs = new Set<string>();
  EXPERIENCES.forEach(exp => exp.technologies.forEach(tech => techs.add(tech)));
  return Array.from(techs);
};

const Experience = () => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [filterTech, setFilterTech] = useState<string | null>(null);
  const [spotlight, setSpotlight] = useState<{x: number, y: number, active: boolean}>({ x: 0, y: 0, active: false });
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter experiences based on selected technology
  const filteredExperiences = filterTech 
    ? EXPERIENCES.filter(exp => exp.technologies.includes(filterTech))
    : EXPERIENCES;
  
  // Handle spotlight effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSpotlight({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true
      });
    }
  };

  const handleMouseLeave = () => {
    setSpotlight(prev => ({ ...prev, active: false }));
  };

  // Toggle details for an experience
  const toggleExpand = (index: number) => {
    setExpandedId(expandedId === index ? null : index);
  };

  // For the resume download simulation
  const downloadResume = () => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    
    // Set the href to the resume file path
    link.href = 'public/resume.pdf';
    
    // Add the download attribute with desired filename
    link.download = 'Daniel-Adisa-Resume.pdf';
    
    // Append to body, click, and then remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Optional alert
    alert("Resume download started!");
  };

  return (
    <section 
      className="py-16 mb-10 overflow-hidden bg-gradient-to-b rounded-xl from-stone-950 to-stone-900/90" 
      id="experience"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="container px-4 mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10 text-center"
        >
          <h2 className="mb-4 text-5xl font-bold text-transparent md:text-6xl bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text">
            Professional Journey
          </h2>
          <div className="w-24 h-1 mx-auto mb-6 rounded-full bg-gradient-to-r from-gray-500 to-gray-600" />
          <p className="max-w-2xl mx-auto text-gray-300">
            Crafting digital experiences that blend creativity with technical excellence
          </p>
        </motion.div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
          {/* View Toggle */}
          <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
            <button 
              onClick={() => setViewMode('cards')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'cards' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <FiGrid /> Cards
            </button>
            <button 
              onClick={() => setViewMode('timeline')} 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'timeline' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <FiAlignCenter /> Timeline
            </button>
          </div>

          {/* Resume Download */}
          <button 
            onClick={downloadResume}
            className="flex items-center gap-2 px-5 py-2.5 font-medium text-white transition-all duration-300 rounded-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
          >
            <FiDownload /> Download Resume
          </button>
        </div>
        
        {/* Tech Filter */}
        <div className="mb-8">
          <h4 className="mb-3 text-sm font-semibold text-gray-400 uppercase">Filter by technology</h4>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterTech(null)}
              className={`px-3 py-1.5 text-sm rounded-full transition-all ${!filterTech ? 'bg-gray-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}
            >
              All
            </button>
            {getAllTechnologies().map((tech, i) => (
              <button 
                key={i}
                onClick={() => setFilterTech(tech === filterTech ? null : tech)}
                className={`px-3 py-1.5 text-sm rounded-full flex items-center gap-2 transition-all ${tech === filterTech ? 'bg-gray-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/15'}`}
              >
                {techIcons[tech]}
                {tech}
              </button>
            ))}
          </div>
        </div>

        {/* Experience Cards or Timeline */}
        <div className={viewMode === 'cards' ? "grid grid-cols-1 md:gap-4 gap-7 md:grid-cols-1 relative" : "relative"}>
          {/* Spotlight effect overlay */}
          {spotlight.active && (
            <div 
              className="absolute pointer-events-none inset-0 z-10 opacity-15"
              style={{
                background: `radial-gradient(600px circle at ${spotlight.x}px ${spotlight.y}px, rgba(255,255,255,0.15), transparent 40%)`
              }}
            />
          )}
          
          {viewMode === 'cards' ? (
            filteredExperiences.map((experience, index) => (
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
                      <div className="flex items-center gap-2">
                        <FiClock className="text-gray-300" />
                        <p className="text-lg font-bold text-white">{experience.year}</p>
                      </div>
                    </div>
                    
                    {/* Company badge - now a clickable link */}
                    <button 
                      onClick={() => window.open(`https://www.google.com/search?q=${experience.company}`, '_blank')}
                      className="inline-flex items-center px-4 py-2 mb-5 text-sm font-medium text-gray-200 transition-all duration-300 border rounded-full cursor-pointer bg-gradient-to-r from-gray-500/30 to-gray-600/30 border-gray-500/30 hover:border-gray-400/50 hover:bg-gray-500/40"
                    >
                      @ {experience.company}
                      <FiArrowUpRight className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>

                    {/* Role */}
                    <h3 className="mb-4 text-2xl font-bold text-gray-100">
                      {experience.role}
                    </h3>
                    
                    {/* Description with expand/collapse */}
                    <div className="mb-6">
                      <p className="text-base leading-relaxed text-gray-300">
                        {expandedId === index ? experience.description : `${experience.description.substring(0, 120)}${experience.description.length > 120 ? '...' : ''}`}
                      </p>
                      {experience.description.length > 120 && (
                        <button 
                          onClick={() => toggleExpand(index)} 
                          className="flex items-center mt-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                          {expandedId === index ? (
                            <>Show less <FiChevronUp className="ml-1" /></>
                          ) : (
                            <>Show more <FiChevronDown className="ml-1" /></>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {/* Conditional expanded content */}
                    <AnimatePresence>
                      {expandedId === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6"
                        >
                          {/* Key Achievements */}
                          <div className="p-4 mb-4 rounded-lg bg-white/5 border border-white/10">
                            <h4 className="flex items-center mb-3 text-lg font-semibold text-gray-200">
                              <RiAwardLine className="mr-2 text-amber-400" /> Key Achievements
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                              <li className="flex items-start">
                                <span className="inline-block w-1.5 h-1.5 mt-1.5 mr-2 rounded-full bg-amber-400"></span>
                                Increased team productivity by 35% through implementation of optimized workflows
                              </li>
                              <li className="flex items-start">
                                <span className="inline-block w-1.5 h-1.5 mt-1.5 mr-2 rounded-full bg-amber-400"></span>
                                Reduced application load time by 40% through code optimization
                              </li>
                              <li className="flex items-start">
                                <span className="inline-block w-1.5 h-1.5 mt-1.5 mr-2 rounded-full bg-amber-400"></span>
                                Led development of features that increased user engagement by 25%
                              </li>
                            </ul>
                          </div>
                          
                          {/* Testimonial */}
                          <div className="p-4 rounded-lg bg-gradient-to-br from-gray-700/30 to-gray-800/30 border border-white/10">
                            <p className="text-sm italic text-gray-300">"An exceptional talent who consistently delivers high-quality work and innovative solutions to complex problems."</p>
                            <p className="mt-2 text-xs font-medium text-gray-400">— Team Lead at {experience.company}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
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
            ))
          ) : (
            // Timeline View
            <div className="relative pl-8 border-l-2 border-gray-700">
              {filteredExperiences.map((experience, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative mb-12 last:mb-0"
                >
                  {/* Timeline node */}
                  <div className="absolute w-5 h-5 bg-gray-700 rounded-full -left-11 border-4 border-stone-900"></div>
                  
                  {/* Year badge */}
                  <div className="absolute px-3 py-1 text-sm font-bold -left-28 top-0 text-gray-300">{experience.year}</div>
                  
                  {/* Content */}
                  <div className="p-5 border rounded-lg bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer" onClick={() => toggleExpand(index)}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold text-gray-100">{experience.role}</h3>
                      <span className="px-3 py-1 text-sm font-medium text-gray-300 bg-white/10 rounded-full">@ {experience.company}</span>
                    </div>
                    
                    <p className="mb-4 text-sm text-gray-300">
                      {expandedId === index ? experience.description : `${experience.description.substring(0, 100)}${experience.description.length > 100 ? '...' : ''}`}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      {experience.technologies.map((tech, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-white/5 rounded-md flex items-center gap-1 text-gray-300">
                          {techIcons[tech]}
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    {/* Expand indicator */}
                    <button className="flex items-center justify-center w-full mt-3 text-xs text-gray-400 hover:text-gray-200">
                      {expandedId === index ? (
                        <FiChevronUp className="w-4 h-4" />
                      ) : (
                        <FiChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {/* Expanded content */}
                    <AnimatePresence>
                      {expandedId === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="p-3 rounded-lg bg-white/5">
                            <h4 className="flex items-center mb-2 text-sm font-semibold text-gray-200">
                              <RiAwardLine className="mr-1 text-amber-400" /> Key Achievements
                            </h4>
                            <ul className="space-y-1 text-xs text-gray-300 list-disc list-inside">
                              <li>Increased performance metrics by 35%</li>
                              <li>Led a team of 5 developers for project delivery</li>
                              <li>Implemented CI/CD pipeline reducing deployment time by 60%</li>
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Experience;