import { useState, useRef } from "react";
import { CONTACT, PRICING } from "../constants";
import { motion, useInView } from "framer-motion";
import { FaLocationPin, FaGithub, FaLinkedin, FaTwitter, FaDribbble, FaBehance } from "react-icons/fa6";
import { BiPhoneOutgoing } from "react-icons/bi";
import { TfiEmail } from "react-icons/tfi";
import { IoSend } from "react-icons/io5";
import { FiChevronDown } from "react-icons/fi";

const Contact = () => {
  // Form state management
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    service: "", // Added service field
  });
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    submitting: false,
    error: null
  });
  
  // Animation triggers
  const headerRef = useRef(null);
  const formRef = useRef(null);
  const contactInfoRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true });
  const isFormInView = useInView(formRef, { once: true, margin: "-100px 0px" });
  const isContactInfoInView = useInView(contactInfoRef, { once: true, margin: "-100px 0px" });

  // Generate service options from PRICING constant
interface ServiceOption {
    value: string;
    label: string;
}

const serviceOptions: ServiceOption[] = [];
  PRICING.forEach(service => {
    service.tiers.forEach(tier => {
      serviceOptions.push({
        value: `${service.title} - ${tier.name}`,
        label: `${service.title}: ${tier.name} (${tier.price})`
      });
    });
  });

  // Handle form input changes
interface FormData {
    name: string;
    email: string;
    message: string;
    service: string;
}

interface FormStatus {
    submitted: boolean;
    submitting: boolean;
    error: string | null;
}

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setFormStatus({ ...formStatus, submitting: true });

    // Simulate form submission
    setTimeout(() => {
        setFormStatus({ submitted: true, submitting: false, error: null });
    }, 2000);

    // Prepare email body with selected service
    const serviceInfo = formData.service ? `\n\nI'm interested in: ${formData.service}` : '';
    window.location.href = `mailto:adisadaniel4@gmail.com?subject=Contact Form Submission&body=Hi, My name is ${formData.name}. ${formData.message}${serviceInfo} (${formData.email})`;
};

  return (
    <section id="contact" className="py-16 md:py-24 bg-gradient-to-b rounded-xl from-stone-950 to-stone-900/90">
      <div className="container max-w-6xl px-6 mx-auto">
        {/* Section header with modern styling */}
        <div ref={headerRef} className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center"
          >
            <h2 className="mb-6 text-4xl font-bold text-transparent md:text-5xl lg:text-6xl bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-400 bg-clip-text">
              Let's Connect
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-lg text-stone-400">
              Ready to start a project or just want to say hello? Reach out and let's create something amazing together.
            </p>
            <div className="w-24 h-1 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-blue-600"></div>
          </motion.div>
        </div>

        <div className="grid gap-12 md:grid-cols-5 md:gap-8">
          {/* Contact Form */}
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, x: -50 }}
            animate={isFormInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-2 md:col-span-3 md:order-1"
          >
            <div className="p-6 border shadow-2xl bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl md:p-8">
              <h3 className="mb-6 text-2xl font-semibold text-stone-100">Send Me a Message</h3>
              
              {formStatus.submitted ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 text-center"
                >
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h4 className="mb-2 text-xl text-stone-100">Message Sent!</h4>
                  <p className="text-stone-400">Thank you for reaching out. I'll get back to you soon.</p>
                  <button 
                    onClick={() => setFormStatus({ submitted: false, submitting: false, error: null })}
                    className="mt-6 text-purple-400 transition-colors hover:text-purple-300"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    <div>
                      <label htmlFor="name" className="block mb-2 text-sm font-medium text-stone-300">Your Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-stone-100 placeholder-stone-500"
                        placeholder="John Doe"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-stone-300">Email Address</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border rounded-lg bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-stone-100 placeholder-stone-500"
                        placeholder="john@example.com"
                      />
                    </div>
                    
                    {/* Service Selection Dropdown */}
                    <div>
                      <label htmlFor="service" className="block mb-2 text-sm font-medium text-stone-300">
                        I'm interested in (Optional)
                      </label>
                      <div className="relative">
                        <select
                          id="service"
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border rounded-lg appearance-none bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-stone-100"
                        >
                          <option value="">Select a service (Optional)</option>
                          {serviceOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-stone-400">
                          <FiChevronDown />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block mb-2 text-sm font-medium text-stone-300">Message</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 border rounded-lg resize-none bg-white/5 border-white/10 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 text-stone-100 placeholder-stone-500"
                        placeholder="Tell me about your project..."
                      ></textarea>
                    </div>
                    
                    <div>
                      <button
                        type="submit"
                        disabled={formStatus.submitting}
                        className="flex items-center justify-center w-full gap-2 px-6 py-4 font-medium text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-70"
                      >
                        {formStatus.submitting ? (
                          <>
                            <svg className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message <IoSend />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
          
          {/* Contact Info & Social Links */}
          <motion.div
            ref={contactInfoRef}
            initial={{ opacity: 0, x: 50 }}
            animate={isContactInfoInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 space-y-8 md:col-span-2 md:order-2"
          >
            {/* Contact cards with modern styling */}
            <div className="p-6 border shadow-xl bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
              <h3 className="mb-6 text-2xl font-semibold text-stone-100">Contact Information</h3>
              
              <div className="space-y-6">
                <a href={`mailto:${CONTACT.email}`} className="flex items-start gap-4 group">
                  <div className="flex items-center justify-center w-10 h-10 mt-1 text-purple-400 transition-colors rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20">
                    <TfiEmail className="text-xl" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium uppercase text-stone-400">Email</h4>
                    <p className="transition-colors text-stone-200 group-hover:text-purple-300">{CONTACT.email || 'adisadaniel4@gmail.com'}</p>
                  </div>
                </a>
                
                <a href={`tel:${CONTACT.phoneNo}`} className="flex items-start gap-4 group">
                  <div className="flex items-center justify-center w-10 h-10 mt-1 text-blue-400 transition-colors rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20">
                    <BiPhoneOutgoing className="text-xl" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium uppercase text-stone-400">Phone</h4>
                    <p className="transition-colors text-stone-200 group-hover:text-blue-300">{CONTACT.phoneNo || '+234 916 642 3642'}</p>
                  </div>
                </a>
                
                <div className="flex items-start gap-4 group">
                  <div className="flex items-center justify-center w-10 h-10 mt-1 text-indigo-400 transition-colors rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20">
                    <FaLocationPin className="text-xl" />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-medium uppercase text-stone-400">Location</h4>
                    <p className="transition-colors text-stone-200 group-hover:text-indigo-300">
                      {CONTACT.address || 'Lagos, Nigeria'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social media links */}
            <div className="p-6 border shadow-xl bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl">
              <h3 className="mb-5 text-2xl font-semibold text-stone-100">Connect With Me</h3>
              
              <div className="flex flex-wrap gap-4">
                {CONTACT.github && (
                  <a 
                    href={CONTACT.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-purple-400"
                    aria-label="GitHub"
                  >
                    <FaGithub className="text-xl" />
                  </a>
                )}
                
                {CONTACT.linkedin && (
                  <a 
                    href={CONTACT.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-blue-400"
                    aria-label="LinkedIn"
                  >
                    <FaLinkedin className="text-xl" />
                  </a>
                )}
                
                {CONTACT.twitter && (
                  <a 
                    href={CONTACT.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-blue-500"
                    aria-label="Twitter"
                  >
                    <FaTwitter className="text-xl" />
                  </a>
                )}
                
                {CONTACT.dribbble && (
                  <a 
                    href={CONTACT.dribbble} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-pink-500"
                    aria-label="Dribbble"
                  >
                    <FaDribbble className="text-xl" />
                  </a>
                )}
                
                {CONTACT.behance && (
                  <a 
                    href={CONTACT.behance} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-12 h-12 transition-all duration-300 rounded-lg bg-white/5 hover:bg-white/10 text-stone-400 hover:text-blue-600"
                    aria-label="Behance"
                  >
                    <FaBehance className="text-xl" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom CTA */}
        <div className="mt-16 md:mt-20 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-stone-400"
          >
            Looking forward to collaborating with you on your next project!
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Contact;