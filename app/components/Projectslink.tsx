import React from 'react';
import { PROJECTSDEV } from "../constants";
import { motion } from "framer-motion";
import { FiGithub, FiExternalLink, FiLink } from "react-icons/fi";
import { SiTypescript, SiTailwindcss, SiThreedotjs, SiFigma, SiAdobexd, SiReact, SiNextdotjs } from "react-icons/si";

// Tech icon mapping for visual enhancement
const TECH_ICONS: { [key: string]: React.ReactElement } = {
  "TypeScript": <SiTypescript className="text-blue-400" />,
  "Tailwind": <SiTailwindcss className="text-cyan-400" />,
  "Three.js": <SiThreedotjs className="text-emerald-400" />,
  "Figma": <SiFigma className="text-pink-400" />,
  "Adobe XD": <SiAdobexd className="text-purple-400" />,
  "React": <SiReact className="text-cyan-500" />,
  "Next.js": <SiNextdotjs className="text-white" />
};

import { StaticImageData } from 'next/image';

interface Project {
  image: string | StaticImageData;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
  demo?: string;
}

const ProjectCard = ({ project, index }: { project: Project; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative group"
    >
      <div className="h-full transition-all duration-300 border rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20 hover:border-gray-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(107,114,128,0.2)] group-hover:transform group-hover:scale-[1.02]">
        <div className="flex flex-col h-full">
          {/* Image container */}
          <div className="relative overflow-hidden rounded-t-2xl aspect-video">
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              src={typeof project.image === 'string' ? project.image : project.image.src}
              alt={project.title}
              className="object-cover w-full h-full"
              loading="lazy"
            />
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-100"></div>
          </div>

          {/* Content */}
          <div className="flex flex-col flex-grow p-5">
            <h3 className="mb-3 text-xl font-bold tracking-tight text-gray-100">
              {project.title}
            </h3>
            <p className="mb-4 text-sm text-gray-300 line-clamp-3">
              {project.description}
            </p>
            
            {/* Technologies */}
            <div className="flex flex-wrap gap-2 mb-5">
              {project.technologies.slice(0, 4).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="flex items-center px-2.5 py-1 text-xs rounded-full bg-white/10 text-gray-300 border border-white/10 gap-1.5"
                >
                  {TECH_ICONS[tech as keyof typeof TECH_ICONS] as React.ReactNode || null}
                  {tech}
                </span>
              ))}
              {project.technologies.length > 4 && (
                <span className="px-2.5 py-1 text-xs rounded-full bg-white/10 text-gray-300 border border-white/10">
                  +{project.technologies.length - 4}
                </span>
              )}
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap w-full gap-3 mt-auto">
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-medium text-center text-gray-200 transition-all border rounded-lg bg-white/10 border-white/10 hover:bg-white/20"
                >
                  <FiLink /> Link
                </a>
              )}
              
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-200 transition-all border rounded-lg bg-white/10 border-white/10 hover:bg-white/20"
                >
                  <FiGithub /> GitHub
                </a>
              )}
              
              {project.demo && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white transition-all border border-gray-600 rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600"
                >
                  <FiExternalLink /> Demo
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute w-16 h-16 transition-opacity rounded-full -bottom-2 -right-2 bg-gradient-to-br from-gray-500/20 to-gray-600/20 blur-xl opacity-70 group-hover:opacity-100"></div>
      </div>
    </motion.div>
  );
};

const Projectslink = () => {
  return (
    <section className="py-16 mb-10 bg-gradient-to-b rounded-xl from-stone-950 to-stone-900/90" id="dev-projects">
      <div className="container px-4 mx-auto">
        {/* Section header */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-5xl font-bold text-center text-transparent md:text-6xl bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text"
        >
          Dev Projects
          <div className="w-24 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600" />
        </motion.h2>

        {/* Project Grid */}
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-2">
          {PROJECTSDEV.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projectslink;