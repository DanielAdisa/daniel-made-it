import { motion } from "framer-motion";
import { SOCIAL_MEDIA_LINKS } from "@/app/gks/constants";
import Image from "next/image";

const socialVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const iconVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const Footer = () => {
  return (
    <footer className="mt-20 mb-8">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center mb-12">
          <Image 
            src="/logo.png" 
            alt="Gwen's Kitchen" 
            width={80} 
            height={80} 
            className="mb-4 rounded-full"
          />
          <h3 className="font-serif text-xl tracking-wide text-rose-300">Gwen's Kitchen</h3>
        </div>
      
        <motion.div 
          variants={socialVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex items-center justify-center gap-8"
        >
            {SOCIAL_MEDIA_LINKS.map((link, index) => (
                <motion.a 
                  href={link.href} 
                  key={index} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  variants={iconVariants}
                  whileHover={{ scale: 1.2, color: "#fda4af" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-white hover:text-rose-300"
                >
                    {link.icon}
                </motion.a>
            ))}
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-8 tracking-tighter text-center text-neutral-500"
        >
            &copy; {new Date().getFullYear()} Gwen's Kitchen. All rights reserved.{" "}
        </motion.p>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-4 tracking-tighter text-center text-neutral-500"
        >
            Built By Adisa Made It &reg;
        </motion.p>
      </div>
    </footer>
  )
}

export default Footer;
