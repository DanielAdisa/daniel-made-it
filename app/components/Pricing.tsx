import { PRICING } from "../constants";
import { motion, useScroll, useTransform } from "framer-motion";
import { FiCheck, FiChevronDown } from "react-icons/fi";
import { useRef, useState, useEffect } from "react";
import axios from "axios"; // Import axios for API requests

const Pricing = () => {
  const sectionRef = useRef(null);
  const [selectedService, setSelectedService] = useState("all");
  const [currency, setCurrency] = useState("NGN"); // Default currency is Naira

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Fetch user's location and set currency
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const response = await axios.get("https://ipapi.co/json/");
        const country = (response.data as { country: string }).country;
        if (country === "US") {
          setCurrency("USD");
        } else if (country === "GB") {
          setCurrency("GBP");
        } else if (country === "EU") {
          setCurrency("EUR");
        } else if (country === "NG") {
          setCurrency("NGN");
        } else if (country === "GH") {
          setCurrency("GHS");
        } else {
          setCurrency("USD"); // Default to USD if not in specific countries
        }
      } catch (error) {
        console.error("Error fetching location:", error);
        setCurrency("USD"); // Fallback to USD on error
      }
    };
    fetchLocation();
  }, []);

  // Filter services based on selection
  const filteredPricing = selectedService === "all" 
    ? PRICING 
    : PRICING.filter(service => service.title.toLowerCase() === selectedService.toLowerCase());

  // Function to convert prices based on currency
interface PriceObject {
    [key: string]: number | string;
}

const convertPrice = (priceObj: number | PriceObject): string => {
    // If price is directly a number (for backward compatibility)
    if (typeof priceObj === 'number') {
        const rates: { [key: string]: number } = {
            USD: 1,
            GBP: 0.75,
            EUR: 0.85,
            NGN: 410,
            GHS: 6,
        };
        const amount = priceObj * rates[currency];
        return formatCurrency(amount);
    }
    
    // If price is an object with currency keys
    if (priceObj && typeof priceObj === 'object' && priceObj[currency]) {
        return formatCurrency(parseFloat(priceObj[currency] as string));
    }
    
    // Fallback to USD if the selected currency is not available
    if (priceObj && typeof priceObj === 'object' && priceObj.USD) {
        const rates: { [key: string]: number } = {
            USD: 1,
            GBP: 0.75,
            EUR: 0.85,
            NGN: 410,
            GHS: 6,
        };
        const amount = parseFloat(priceObj.USD as string) * rates[currency];
        return formatCurrency(amount);
    }
    
    // Final fallback
    return "Price unavailable";
};
  
  // Helper to format currency values
const formatCurrency = (amount: number): string => {
    // Format number with thousand separators and only show decimals if needed
    const formattedAmount = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
    
    switch (currency) {
        case "USD":
            return `$${formattedAmount}`;
        case "GBP":
            return `£${formattedAmount}`;
        case "EUR":
            return `€${formattedAmount}`;
        case "NGN":
            return `₦${formattedAmount}`;
        case "GHS":
            return `₵${formattedAmount}`;
        default:
            return `$${formattedAmount}`;
    }
};

  // Currency selector component
  const CurrencySelector = () => (
    <div className="flex justify-end mb-6">
      <div className="inline-flex rounded-md shadow-sm">
        {["USD", "GBP", "EUR", "NGN", "GHS"].map((curr) => (
          <button
            key={curr}
            onClick={() => setCurrency(curr)}
            className={`px-3 py-1.5 text-xs font-medium ${
              currency === curr
                ? "bg-white/20 text-white"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            } ${
              curr === "USD" ? "rounded-l-md" : ""
            } ${
              curr === "GHS" ? "rounded-r-md" : ""
            } border-r border-white/10 last:border-r-0`}
          >
            {curr}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-20 mb-10 overflow-hidden bg-gradient-to-b rounded-xl from-stone-950 to-stone-900/90"
      id="pricing"
    >
      {/* Parallax background with animated blobs */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{ y: backgroundY }}
      >
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl -top-40 -left-40 animate-pulse" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-3xl -bottom-40 -right-40 animate-pulse" />
      </motion.div>

      <div className="container relative px-4 mx-auto">
        {/* Section header with scroll-based fade */}
        <motion.h2 
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 text-5xl font-bold text-center text-transparent md:text-6xl bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text"
        >
          Pricing
          
          <div className="w-24 h-1 mx-auto mt-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600" />
          <p className="mt-4 text-sm font-normal text-gray-300">
            Transparent pricing tailored to your needs
          </p>
        </motion.h2>
        {/* <motion.div
          style={{ opacity: textOpacity }}
          className="max-w-3xl mx-auto mb-10 text-center"
        >
          <h2 className="mb-4 text-4xl font-bold text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
            
          </h2>
          <p className="text-gray-300">
            Transparent pricing tailored to your needs
          </p>
        </motion.div> */}
        
        {/* Currency Selector */}
        <CurrencySelector />
        
        {/* Services grid with staggered animations */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-1">
          {filteredPricing.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >
              {/* Glassmorphism card */}
              <div className="relative overflow-hidden transition-all duration-500 border rounded-2xl backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border-white/20 hover:border-white/40 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] hover:-translate-y-2">
                {/* Service header */}
                <div className="px-6 py-5 border-b md:py-6 border-white/10 bg-gradient-to-r from-white/10 to-transparent">
                  <h3 className="text-2xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-gray-300 bg-clip-text">
                    {service.title}
                  </h3>
                </div>

                {/* Tiers */}
                <div className="p-4">
                  {service.tiers.map((tier, tierIndex) => (
                    <div key={tierIndex} className="relative mb-8 last:mb-0 group/tier">
                      <div className="flex flex-col gap-4 p-4 transition-colors rounded-lg md:flex-row md:items-start md:justify-between group-hover/tier:bg-white/5">
                        {/* Tier content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-xl font-semibold tracking-tight text-white">
                              {tier.name}
                            </h4>
                            {tier.discount && (
                              <motion.span
                                className="px-3 py-1 text-xs font-bold text-white rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                                whileHover={{ scale: 1.1 }}
                              >
                                {tier.discount}% OFF
                              </motion.span>
                            )}
                          </div>
                          <p className="mb-3 text-sm text-gray-300">{tier.description}</p>
                          {tier.features && (
                            <ul className="space-y-2">
                              {tier.features.map((feature, featureIndex) => (
                                <li key={featureIndex} className="flex items-start gap-2 text-sm text-gray-200">
                                  <span className="flex items-center justify-center w-5 h-5 mt-0.5 rounded-full bg-gradient-to-r from-green-400/30 to-green-500/30">
                                    <FiCheck className="text-sm text-green-400" />
                                  </span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Price block */}
                        <motion.div
                          className="relative flex flex-col items-start p-4 transition-transform rounded-lg md:items-end group-hover/tier:scale-105 bg-gradient-to-br from-white/10 to-transparent md:min-w-[160px]"
                          whileHover={{ scale: 1.05 }}
                        >
                          {tier.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">
                              {convertPrice(tier.originalPrice)}
                            </span>
                          )}
                          <span className="text-3xl font-bold tracking-tight text-transparent bg-gradient-to-r from-white to-gray-200 bg-clip-text">
                            {convertPrice(tier.price)}
                          </span>
                          {tier.period && (
                            <span className="text-xs text-gray-400">{tier.period}</span>
                          )}
                        </motion.div>
                      </div>
                      {tierIndex < service.tiers.length - 1 && (
                        <div className="w-full h-px my-6 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="p-8 mt-16 text-center border rounded-xl bg-gradient-to-br from-white/10 to-white/5 border-white/20 backdrop-blur-sm"
        >
          <h3 className="mb-4 text-3xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-white to-gray-200 bg-clip-text">
            Need a custom solution?
          </h3>
          <p className="max-w-2xl mx-auto mb-6 text-lg text-gray-200">
            Contact me for personalized quotes tailored to your specific project requirements.
          </p>
          <motion.a
            href="#contact"
            className="inline-flex items-center px-8 py-4 text-lg font-medium text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-purple-500/30 hover:shadow-purple-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get in touch
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;