import { motion } from "framer-motion";
import { DISHES } from "@/app/gks/constants";
import DishCard from "./DishCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Dishes = () => {
  return (
    <section className="container p-2 py-16 mx-auto" id="dishes">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-3xl tracking-tighter text-center lg:text-4xl"
        >
          Our <span className="text-rose-300">Signature</span> Dishes
        </motion.h2>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        >
            {DISHES.map((project, index) => (
              <motion.div key={index} variants={childVariants}>
                <DishCard project={project} />
              </motion.div>
            ))}
        </motion.div>
    </section>
  )
}

export default Dishes;
