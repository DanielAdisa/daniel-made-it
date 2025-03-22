import { FaInstagram, FaTwitter, FaFacebook, FaPinterest } from 'react-icons/fa';

// Navbar links
export const LINKS = [
  { text: "Home", targetId: "home" },
  { text: "About", targetId: "about" },
  { text: "Our Dishes", targetId: "dishes" },
  { text: "Expertise", targetId: "expertise" },
  { text: "Mission", targetId: "mission" },
  { text: "Reviews", targetId: "review" },
  { text: "Contact", targetId: "contact" }
];

// About section content
export const ABOUT = {
  header: "Gwen's Kitchen: A Culinary Journey",
  content: "Founded in 2015, Gwen's Kitchen is a celebration of authentic flavors and culinary artistry. Our passionate team, led by Chef Gwen Ross, blends traditional techniques with innovative approaches to create unforgettable dining experiences. We source only the finest local ingredients, ensuring each dish tells a story of quality and care."
};

// Dishes data
export const DISHES = [
  {
    title: "Truffle Pasta",
    description: "Homemade pasta with black truffle cream sauce and aged parmesan",
    image: "/images/dish1.jpg"
  },
  {
    title: "Seafood Delight",
    description: "Fresh catch of the day with saffron sauce and seasonal vegetables",
    image: "/images/dish2.jpg"
  },
  {
    title: "Garden Harvest",
    description: "Locally-sourced organic vegetables with herb-infused olive oil",
    image: "/images/dish3.jpg"
  },
  {
    title: "Signature Steak",
    description: "Dry-aged premium beef with red wine reduction and truffle butter",
    image: "/images/dish4.jpg"
  },
  {
    title: "Decadent Dessert",
    description: "Chocolate soufflé with vanilla bean ice cream and berry compote",
    image: "/images/dish5.jpg"
  }
];

// Cuisines/Expertise data
export const CUSINES = [
  {
    number: "01",
    title: "Contemporary Italian",
    description: "Our Italian dishes blend traditional recipes with modern techniques, creating familiar yet surprising flavor combinations.",
    image: "/images/cuisine1.jpg"
  },
  {
    number: "02",
    title: "Asian Fusion",
    description: "We combine the best of Eastern culinary traditions with Western influences for a unique dining experience.",
    image: "/images/cuisine2.jpg"
  },
  {
    number: "03",
    title: "Farm-to-Table",
    description: "We maintain strong relationships with local farmers to bring you the freshest seasonal ingredients every day.",
    image: "/images/cuisine3.jpg"
  },
  {
    number: "04",
    title: "Molecular Gastronomy",
    description: "Experience our innovative cooking techniques that transform familiar ingredients into extraordinary culinary adventures.",
    image: "/images/cuisine4.jpg"
  }
];

// Mission statement
export const MISSION = "To create memorable dining experiences through inspired cuisine, impeccable service, and a warm atmosphere that feels like home.";

// Customer review
export const REVIEW = {
  content: "Gwen's Kitchen transforms dining into an unforgettable journey of flavors. Each dish tells a story of passion and creativity that leaves you craving for more.",
  name: "Xavier Thompson",
  profession: "Food Critic, Culinary Magazine"
};

// Contact information
export const CONTACT = [
  { key: "address", value: "123 Gourmet Avenue, Food District, Los Angeles, CA 90001" },
  { key: "hours", value: "Monday - Saturday: 11:00 AM - 10:00 PM | Sunday: 10:00 AM - 8:00 PM" },
  { key: "phone", value: "+1 (555) 123-4567" },
  { key: "email", value: "reservations@gwenskitchen.com" }
];

// Social media links
export const SOCIAL_MEDIA_LINKS = [
  { href: "https://instagram.com/gwenskitchen", icon: <FaInstagram size={24} /> },
  { href: "https://twitter.com/gwenskitchen", icon: <FaTwitter size={24} /> },
  { href: "https://facebook.com/gwenskitchen", icon: <FaFacebook size={24} /> },
  { href: "https://pinterest.com/gwenskitchen", icon: <FaPinterest size={24} /> }
];
