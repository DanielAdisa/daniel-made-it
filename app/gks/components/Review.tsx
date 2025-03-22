import { motion } from "framer-motion";
import { REVIEW } from "@/app/gks/constants";
import Image from "next/image";

const customerImages = [
  "/customer1.jpeg",
  "/customer2.jpeg",
  "/customer3.jpeg",
  "/customer4.jpeg"
];

const Review = () => {
  return (
    <section id="review" className="container mx-auto mt-12 mb-8">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-3xl text-center lg:text-4xl"
        >
          Guest <span className="text-rose-300">Reviews</span>
        </motion.h2>
        
        <div className="flex flex-col">
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="mb-10 text-3xl font-light leading-normal tracking-tighter lg:mx-40 lg:mt-20 lg:text-[3.5rem]"
            >
                <span className="text-6xl text-rose-300">"</span>
                {REVIEW.content}
                <span className="text-6xl text-rose-300">"</span>
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center justify-center gap-6"
            >
                <Image 
                  src="/xaviour.jpeg" 
                  alt={REVIEW.name} 
                  height={80} 
                  width={80} 
                  className="border-2 rounded-full shadow-lg border-rose-300" 
                />
                <div className="tracking-tighter">
                    <h6 className="text-xl font-medium">{REVIEW.name}</h6>
                    <p className="text-sm text-rose-300">
                        {REVIEW.profession}
                    </p>
                </div>
            </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-center justify-center gap-6 mt-20 md:flex-row"
        >
            {customerImages.map((customer, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -15 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Image 
                    src={customer} 
                    alt="Happy customer" 
                    width={200}
                    height={300}
                    className="h-[300px] w-[200px] rounded-br-3xl rounded-tl-3xl object-cover shadow-lg hover:shadow-rose-300/20 transition-shadow duration-300" 
                  />
                </motion.div>
            ))}
        </motion.div>
    </section>
  )
}

export default Review;
