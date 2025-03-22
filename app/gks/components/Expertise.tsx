import { motion } from "framer-motion";
import { CUSINES } from "@/app/gks/constants";
import Image from "next/image";

const expertiseVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 }
};

const Expertise = () => {
  return (
    <section id="expertise">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="my-8 text-3xl tracking-tighter text-center lg:text-4xl"
        >
          Our <span className="text-rose-300">Culinary</span> Expertise
        </motion.h2>
        
        <motion.div 
          variants={expertiseVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="container px-4 mx-auto"
        >
            {CUSINES.map((cuisine, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  className="flex flex-col items-center py-6 mb-6 transition-colors border-b-4 border-dotted md:flex-row border-neutral-700/40 hover:bg-purple-950/20 rounded-xl"
                >
                    <div className="flex-shrink-0 pr-8 text-4xl font-bold text-rose-300">
                        {cuisine.number}
                    </div>
                    <div className="flex-shrink-0 w-full mb-6 md:w-1/3 md:mb-0">
                        <Image 
                          src={cuisine.image} 
                          alt={cuisine.title} 
                          width={400} 
                          height={300} 
                          className="h-auto transition-shadow duration-300 shadow-lg rounded-3xl hover:shadow-rose-300/20" 
                        />
                    </div>
                    <div className="pl-0 md:pl-8">
                        <h3 className="mb-4 text-2xl tracking-tighter uppercase text-rose-300">
                            {cuisine.title}
                        </h3>
                        <p className="text-lg tracking-tighter text-gray-300">{cuisine.description}</p>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    </section>
  )
}

export default Expertise;
