import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { FaBars } from "react-icons/fa6";
import { LINKS } from "@/app/gks/constants";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    }

    const handleScroll = (event: React.MouseEvent, targetId: string) => {
        event.preventDefault();
        const targetElement = document.getElementById(targetId);
        if (targetElement)  {
            const offsetTop = targetElement.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: "smooth"
            })
        }
        setIsMobileMenuOpen(false)
    }

    return (
        <motion.nav 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed z-50 flex flex-col items-center justify-center w-full transition-all duration-300 ${
                scrolled ? "shadow-xl" : ""
            }`}
        >
            <div className={`flex items-center justify-between w-full px-5 py-4 md:px-8 transition-all duration-300
                ${scrolled 
                    ? "bg-gradient-to-r from-black/90 via-purple-950/90 to-black/90 backdrop-blur-lg" 
                    : "bg-gradient-to-r from-black/70 via-purple-950/70 to-black/70 backdrop-blur-md"
                } border-b border-rose-300/10`}>
                
                <motion.div 
                    className="flex items-center gap-3"
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                    <div className="relative overflow-hidden border-2 rounded-full border-rose-300/30">
                        <Image 
                            src="/logo.png" 
                            alt="Gwen's Kitchen" 
                            width={48} 
                            height={48} 
                            className="object-cover transition-transform hover:scale-105" 
                        />
                    </div>
                    <span className="font-serif text-xl font-medium tracking-wide text-transparent md:text-2xl bg-gradient-to-r from-rose-200 to-rose-300 bg-clip-text">
                        Gwen's Kitchen
                    </span>
                </motion.div>
                
                <div className="hidden space-x-8 lg:flex">
                    {LINKS.map((link, index) => (
                        <motion.a 
                            key={index} 
                            href={`#${link.targetId}`} 
                            className={`text-sm font-medium relative px-2 py-1 text-white/90 hover:text-rose-200 transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-rose-300 after:to-purple-400 after:transition-all hover:after:w-full`}
                            onClick={(e) => handleScroll(e, link.targetId)}
                            whileHover={{ y: -2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                        >
                            {link.text}
                        </motion.a>
                    ))}
                </div>
                
                <motion.button 
                    onClick={toggleMobileMenu} 
                    className="flex p-2 text-xl border rounded-md lg:hidden text-rose-200 bg-black/50 backdrop-blur-sm border-rose-300/30"
                    whileTap={{ scale: 0.95 }}
                >
                    {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                </motion.button>
            </div>
            
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="w-full border-b shadow-2xl bg-gradient-to-b from-black/95 to-purple-950/95 backdrop-blur-xl lg:hidden border-rose-300/10"
                    >
                        <div className="flex flex-col">
                            {LINKS.map((link, index) => (
                                <motion.a 
                                    key={index} 
                                    href={`#${link.targetId}`} 
                                    className="flex items-center justify-between px-6 py-4 text-base font-medium tracking-wider transition-all border-l-4 border-transparent text-white/90 hover:border-rose-300 hover:bg-purple-900/30 hover:pl-8"
                                    onClick={(e) => handleScroll(e, link.targetId)}
                                    whileHover={{ x: 4 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 17 }}
                                >
                                    <span>{link.text}</span>
                                    <span className="transition-opacity opacity-0 text-rose-300 group-hover:opacity-100">›</span>
                                </motion.a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}

export default Navbar;
