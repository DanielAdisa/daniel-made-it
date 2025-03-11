import { useState, useEffect } from "react";
import { FaGithub, FaInstagram, FaLinkedin, FaWhatsapp } from "react-icons/fa";
import { HiMenuAlt4 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import Asset from "@/public/assets/Asset.webp";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Social media links configuration
  const socialLinks = [
    {
      name: "LinkedIn",
      icon: <FaLinkedin className="text-blue-400 group-hover:text-blue-500" />,
      url: "https://www.linkedin.com/in/daniel-oluwatobi-adisa-7b076a199/",
    },
    {
      name: "GitHub",
      icon: <FaGithub className="text-stone-400 group-hover:text-white" />,
      url: "https://github.com/DanielAdisa/",
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="text-pink-400 group-hover:text-pink-500" />,
      url: "https://www.instagram.com/daniel.made.it?igsh=MXY2Nmt3bWRvaHJxdQ==",
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="text-green-400 group-hover:text-green-500" />,
      url: "https://wa.me/message/V4TC5GSQTN7RM1",
    },
  ];

  // Navigation links
  const navLinks = [
    { name: "About", href: "#hero" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
    { name: "Games", href: "/games" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
        className={`fixed top-0 left-0 right-0 z-50 px-6 py-4 transition-all duration-300 ${
          isScrolled ? "bg-stone-950/90 backdrop-blur-lg shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="container flex items-center justify-between mx-auto max-w-7xl">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="relative"
          >
            <a href="/" aria-label="Home" className="flex items-center">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/30 to-blue-500/30 blur-xl"
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 8,
                  }}
                />
                <Image 
                  src={Asset} 
                  alt={"Daniel Adisa"} 
                  width={48} 
                  height={48} 
                  className="relative z-10"
                />
              </div>
              <div className="ml-3">
                <span className="text-lg font-semibold text-white">Daniel Adisa</span>
                <span className="block text-xs text-stone-400">Senior Developer</span>
              </div>
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="items-center hidden space-x-1 md:flex">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="relative px-4 py-2 text-sm font-medium transition-colors text-stone-300 hover:text-white"
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {link.name}
                <motion.span
                  className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              </motion.a>
            ))}
            <motion.a
              href="#contact"
              className="px-5 py-2 ml-4 text-sm font-medium text-white transition-all rounded-full shadow-md bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 hover:shadow-purple-500/20"
              whileHover={{ scale: 1.05 }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinks.length * 0.1 }}
            >
              Get in Touch
            </motion.a>
          </div>

          {/* Social Icons - Desktop */}
          <div className="items-center hidden space-x-3 md:flex">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex items-center justify-center transition-colors rounded-full w-9 h-9 bg-white/5 hover:bg-white/10 group"
                whileHover={{ scale: 1.1, rotate: 5 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            aria-label="Toggle Menu"
            className="flex p-2 text-white rounded-full md:hidden bg-white/5 hover:bg-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMobileMenuOpen ? (
              <IoClose className="w-6 h-6" />
            ) : (
              <HiMenuAlt4 className="w-6 h-6" />
            )}
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-[76px] z-40 bg-stone-950/95 backdrop-blur-xl border-t border-white/10 shadow-2xl"
          >
            <div className="container px-6 py-8 mx-auto">
              <div className="flex flex-col space-y-6">
                {/* Navigation Links */}
                <div className="flex flex-col space-y-4">
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-4 py-3 text-lg font-medium text-white transition-all border-l-2 rounded-r-lg border-purple-500/30 hover:border-purple-500 hover:bg-white/5"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      exit={{ x: -50, opacity: 0 }}
                    >
                      {link.name}
                    </motion.a>
                  ))}
                </div>
                
                {/* Social Links */}
                <div className="flex justify-center pt-4 space-x-5 border-t border-white/10">
                  {socialLinks.map((social, index) => (
                    <motion.a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                      className="flex items-center justify-center transition-colors rounded-full w-11 h-11 bg-white/5 hover:bg-white/10 group"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.3 }}
                      exit={{ scale: 0, opacity: 0 }}
                    >
                      {social.icon}
                    </motion.a>
                  ))}
                </div>
                
                {/* CTA Button */}
                <motion.a
                  href="#contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-4 mt-2 font-medium text-center text-white rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-blue-600"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  exit={{ y: 20, opacity: 0 }}
                >
                  Let's Work Together
                </motion.a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-20" />
    </>
  );
};

export default Navbar;