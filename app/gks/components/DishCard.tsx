import { motion } from "framer-motion";
import Image from "next/image";

interface DishProps {
  project: {
    title: string;
    description: string;
    image: string;
  }
}

const DishCard = ({ project }: DishProps) => {
  return (
    <motion.div 
      whileHover={{ 
        y: -10,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden bg-purple-950/20 rounded-3xl"
    >
        <div className="overflow-hidden">
          <Image 
            src={project.image} 
            alt={project.title} 
            width={300}
            height={200}
            className="object-cover w-full h-48 p-2 transition-transform duration-300 rounded-3xl hover:scale-110"
          />
        </div>
        <div className="p-4">
            <h3 className="mb-2 text-2xl font-bold tracking-tighter text-rose-300">
                {project.title}
            </h3>
            <p className="text-sm text-gray-300">{project.description}</p>
        </div>
    </motion.div>
  )
}

export default DishCard;
