
import { FaInstagram, FaTwitter, FaFacebook, FaWhatsapp } from 'react-icons/fa';

import { ReactNode } from 'react';

// Define proper type for social media links
interface SocialMediaLink {
  href: string;
  icon: ReactNode;
}


// Navbar links
export const LINKS = [
  { text: "Home", targetId: "home" },
  { text: "About", targetId: "about" },
  { text: "Our Dishes", targetId: "dishes" },
  { text: "Specialties", targetId: "expertise" },
  { text: "Events", targetId: "mission" },
  { text: "Reviews", targetId: "review" },
  { text: "Contact", targetId: "contact" }
];

// About section content
export const ABOUT = {
  header: "Gwen's Kitchen: Authentic Nigerian Flavors",
  content: "Founded in 2015, Gwen's Kitchen celebrates the rich culinary heritage of Nigeria with a modern twist. Our passionate team, led by Chef Gwen Okonkwo, brings traditional Nigerian recipes to life using locally sourced ingredients and authentic spices. From classic soups and stews to innovative pastries, we pride ourselves on delivering the true taste of Nigeria in every dish we create."
};

// Dishes data
export const DISHES = [
  {
    title: "Jollof Rice & Chicken",
    description: "Our signature spicy tomato rice cooked with bell peppers, onions, and secret spice blend, served with succulent grilled chicken",
    image: "/images/dish1.jpg"
  },
  {
    title: "Egusi Soup & Pounded Yam",
    description: "Rich melon seed soup prepared with assorted meats, stockfish, and fresh vegetables, served with smooth pounded yam",
    image: "/images/dish2.jpg"
  },
  {
    title: "Suya Platter",
    description: "Thinly sliced beef skewers marinated in groundnut spice mix, grilled to perfection and served with sliced onions and tomatoes",
    image: "/images/dish3.jpg"
  },
  {
    title: "Moin Moin Deluxe",
    description: "Steamed bean pudding with boiled eggs, fish, and bell peppers, wrapped in traditional banana leaves",
    image: "/images/dish4.jpg"
  },
  {
    title: "Puff Puff & Meat Pies",
    description: "Golden fried sweet dough balls served alongside freshly baked Nigerian meat pies with seasoned minced beef",
    image: "/images/dish5.jpg"
  }
];

// Cuisines/Expertise data
export const CUSINES = [
  {
    number: "01",
    title: "Traditional Nigerian",
    description: "Our authentic Nigerian dishes remain true to their roots, featuring classics from all regions of Nigeria including Yoruba, Igbo, and Hausa cuisines.",
    image: "/images/cuisine1.jpg"
  },
  {
    number: "02",
    title: "Nigerian Baking",
    description: "Our bakery creates fresh Nigerian pastries and treats daily, from meat pies and chin chin to puff puff and scotch eggs.",
    image: "/images/cuisine2.jpg"
  },
  {
    number: "03",
    title: "Event Catering",
    description: "We bring Nigerian flavors to your special occasions with customized menus for weddings, birthdays, and corporate events.",
    image: "/images/cuisine3.jpg"
  },
  {
    number: "04",
    title: "Cooking Classes",
    description: "Learn the art of Nigerian cooking through our hands-on classes where we share traditional techniques and family recipes.",
    image: "/images/cuisine4.jpg"
  }
];

// Events & Hosting information (replacing Mission)
export const MISSION = "At Gwen's Kitchen, we offer a unique venue for your special events, combining authentic Nigerian cuisine with warm hospitality. From intimate gatherings to large celebrations, we create memorable experiences that honor our rich culinary traditions while making every guest feel at home.";

// Customer review
export const REVIEW = {
  content: "Gwen's Kitchen brings the authentic taste of Nigeria to every plate. The jollof rice is perfectly spiced, the pounded yam smooth as silk, and their meat pies are simply irresistible. The warm atmosphere makes you feel like you're dining in a Nigerian family home.",
  name: "Tunde Williams",
  profession: "Food Blogger, Nigerian Foodie"
};

// Contact information
export const CONTACT = [
  { key: "address", value: "15 Admiralty Way, Lekki Phase 1, Lagos, Nigeria" },
  { key: "hours", value: "Monday - Saturday: 11:00 AM - 10:00 PM | Sunday: 12:00 PM - 8:00 PM" },
  { key: "phone", value: "+234 801 234 5678" },
  { key: "email", value: "hello@gwenskitchen.ng" }
];

export const SOCIAL_MEDIA_LINKS: SocialMediaLink[] = [
  // { href: "https://instagram.com/gwenskitchen.ng", icon: <FaInstagram size={24} /> },
  // { href: "https://twitter.com/gwenskitchen", icon: <FaTwitter size={24} /> },
  // { href: "https://facebook.com/gwenskitchen.ng", icon: <FaFacebook size={24} /> },
  // { href: "https://wa.me/2348012345678", icon: <FaWhatsapp size={24} /> }
];