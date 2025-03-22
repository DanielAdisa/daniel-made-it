import { motion } from "framer-motion";
import { CONTACT } from "@/app/gks/constants";

const contactVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const Contact = () => {
  return (
    <section id="contact" className="container py-16 mx-auto">
        <motion.h2 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-3xl text-center lg:text-4xl"
        >
          <span className="text-rose-300">Contact</span> Us
        </motion.h2>
        
        <motion.div 
          className="text-neutral-400"
          variants={contactVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
            {CONTACT.map((detail) => (
                <motion.div 
                  key={detail.key}
                  variants={itemVariants}
                  whileHover={{ color: "#fda4af", x: 10 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="pb-12 my-20 text-2xl tracking-tighter text-center border-b-2 border-dotted border-neutral-700 lg:text-3xl">
                      {detail.value}
                  </p>
                </motion.div>
            ))}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-md p-8 mx-auto mt-12 rounded-3xl bg-purple-950/30"
        >
          <h3 className="mb-6 text-2xl font-medium text-center text-rose-300">Make a Reservation</h3>
          <form className="space-y-4">
            <div>
              <input 
                type="text" 
                placeholder="Your Name" 
                className="w-full p-3 bg-transparent border rounded-lg border-neutral-700 focus:border-rose-300 focus:outline-none"
              />
            </div>
            <div>
              <input 
                type="email" 
                placeholder="Your Email" 
                className="w-full p-3 bg-transparent border rounded-lg border-neutral-700 focus:border-rose-300 focus:outline-none"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Phone Number" 
                className="w-full p-3 bg-transparent border rounded-lg border-neutral-700 focus:border-rose-300 focus:outline-none"
              />
            </div>
            <div>
              <select className="w-full p-3 bg-transparent border rounded-lg border-neutral-700 focus:border-rose-300 focus:outline-none">
                <option value="" className="bg-purple-950">Party Size</option>
                <option value="1" className="bg-purple-950">1 Person</option>
                <option value="2" className="bg-purple-950">2 People</option>
                <option value="3+" className="bg-purple-950">3+ People</option>
              </select>
            </div>
            <div>
              <input 
                type="date" 
                className="w-full p-3 bg-transparent border rounded-lg border-neutral-700 focus:border-rose-300 focus:outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full p-3 font-medium transition-colors rounded-lg bg-rose-300 hover:bg-rose-400 text-purple-950"
            >
              Reserve a Table
            </button>
          </form>
        </motion.div>
    </section>
  )
}

export default Contact;
