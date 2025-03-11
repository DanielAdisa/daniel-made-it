import { PROJECTS } from "../constants";
import { motion } from "framer-motion";
import { FiExternalLink } from "react-icons/fi";
import Image, { StaticImageData } from "next/image";

interface Project {
  title: string;
  description: string;
  image: string | StaticImageData;
  link?: string;
  technologies?: string[];
  featured?: boolean;
}

interface ProjectCardProps {
  project: Project;
  index: number;
}

const ProjectCard = ({ project, index }: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-50px" }}
      className="relative group"
    >
      <div className="h-full transition-all duration-300 border rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg border-white/20 hover:border-gray-500/40 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgba(107,114,128,0.2)] group-hover:transform group-hover:scale-[1.02]">
        {/* Image container */}
        <div className="relative overflow-hidden rounded-t-2xl aspect-video">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <Image
              src={project.image}
              alt={project.title}
              className="object-cover w-full h-full"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority={index < 2}
            />
          </motion.div>
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/60 via-transparent to-transparent group-hover:opacity-100"></div>
          
          {/* Link button on hover */}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute flex items-center gap-2 px-4 py-2 font-medium text-white transition-all duration-300 rounded-full opacity-0 bottom-4 right-4 bg-white/20 backdrop-blur-sm group-hover:opacity-100 hover:bg-white/30"
            >
              View <FiExternalLink />
            </a>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="mb-3 text-xl font-bold tracking-tight text-gray-100">
            {project.title}
          </h3>
          <p className="mb-4 text-sm text-gray-300 line-clamp-3">
            {project.description}
          </p>
          
          {/* Technologies */}
          {project.technologies && (
            <div className="flex flex-wrap gap-2 mt-auto">
              {project.technologies.slice(0, 3).map((tech, techIndex) => (
                <span
                  key={techIndex}
                  className="px-2.5 py-1 text-xs rounded-full bg-white/10 text-gray-300 border border-white/10"
                >
                  {tech}
                </span>
              ))}
              {project.technologies.length > 3 && (
                <span className="px-2.5 py-1 text-xs rounded-full bg-white/10 text-gray-300 border border-white/10">
                  +{project.technologies.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Decorative elements */}
        <div className="absolute w-16 h-16 transition-opacity rounded-full -bottom-2 -right-2 bg-gradient-to-br from-gray-500/20 to-gray-600/20 blur-xl opacity-70 group-hover:opacity-100"></div>
      </div>
    </motion.div>
  );
};

const Projects = () => {
  return (
    <section className="py-16 mb-10 bg-gradient-to-b rounded-xl from-stone-950 to-stone-900/90" id="projects">
      <div className="container px-4 mx-auto">
        {/* Section header */}
        <motion.h2
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-5xl font-bold text-center text-transparent md:text-6xl bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text"
        >
          Featured Projects
          <div className="w-24 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600" />
        </motion.h2>

        {/* Project Grid */}
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-2">
          {PROJECTS.map((project, index) => (
            <ProjectCard key={index} project={project} index={index} />
          ))}
        </div>

      </div>
    </section>
  );
};

export default Projects;