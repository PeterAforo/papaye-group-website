"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube,
  MapPin,
  Phone,
  Mail,
  Clock,
  Heart,
  ArrowUp,
  Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { useContactInfo } from "@/hooks/use-contact-info";

const quickLinks = [
  { href: "/menu", label: "Our Menu" },
  { href: "/about", label: "About Us" },
  { href: "/branches", label: "Locations" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const menuLinks = [
  { href: "/menu?category=chicken", label: "Chicken" },
  { href: "/menu?category=grill", label: "Grill" },
  { href: "/menu?category=rice", label: "Rice Dishes" },
  { href: "/menu?category=burgers", label: "Burgers" },
  { href: "/menu?category=juices", label: "Drinks" },
];

const socialLinks = [
  { href: "https://facebook.com", icon: Facebook, label: "Facebook", color: "hover:bg-blue-600" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram", color: "hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-500 hover:to-orange-400" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter", color: "hover:bg-sky-500" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube", color: "hover:bg-red-600" },
];

// Floating food emojis for fun effect
const floatingEmojis = ["🍗", "🍔", "🍟", "🥤", "🍖", "🌶️"];

export function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { contactInfo } = useContactInfo();
  
  // Format phone for tel: link
  const phoneLink = contactInfo.phone.replace(/\s/g, '');

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating emojis decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {floatingEmojis.map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl opacity-10"
            initial={{ y: "100%", x: `${15 + i * 15}%` }}
            animate={{ 
              y: [null, "-100%"],
              rotate: [0, 360],
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      {/* Decorative top wave */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />

      {/* Newsletter Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative border-b border-white/10"
      >
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-2xl p-8 backdrop-blur-sm border border-white/5">
            <div className="text-center lg:text-left">
              <motion.div 
                className="flex items-center justify-center lg:justify-start gap-2 mb-2"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-5 h-5 text-secondary" />
                <span className="text-secondary font-semibold text-sm uppercase tracking-wider">Stay Updated</span>
              </motion.div>
              <h3 className="text-2xl font-bold mb-2">Get Exclusive Offers & Updates</h3>
              <p className="text-gray-400">Subscribe to our newsletter for special deals and new menu items!</p>
            </div>
            <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-5 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all w-full sm:w-72"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 bg-gradient-to-r from-primary to-red-600 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>

      {/* Main Footer */}
      <div className="relative container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <motion.div 
              className="flex items-center gap-2 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <img 
                src="/images/logo-white.png" 
                alt="Papaye Logo" 
                className="h-14 w-auto object-contain drop-shadow-lg"
              />
            </motion.div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Ghana&apos;s Total Food Care Company. Pioneer of fast food restaurants 
              in Accra since 1991. Quality food, fast service, great taste.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center transition-all duration-300 ${social.color} hover:shadow-lg`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-primary to-secondary rounded-full" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li 
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                  >
                    <span className="w-0 h-0.5 bg-secondary group-hover:w-4 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Menu Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-secondary to-yellow-400 rounded-full" />
              Our Menu
            </h3>
            <ul className="space-y-3">
              {menuLinks.map((link, index) => (
                <motion.li 
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-gray-400 hover:text-white transition-all duration-300"
                  >
                    <span className="w-0 h-0.5 bg-primary group-hover:w-4 transition-all duration-300" />
                    <span className="group-hover:translate-x-1 transition-transform duration-300">{link.label}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="font-heading font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" />
              Contact Us
            </h3>
            <ul className="space-y-4">
              <motion.li 
                className="flex items-start gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {contactInfo.address}
                </span>
              </motion.li>
              <motion.li 
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                  <Phone className="w-5 h-5 text-green-400" />
                </div>
                <a href={`tel:${phoneLink}`} className="text-gray-400 hover:text-white transition-colors">
                  {contactInfo.phone}
                </a>
              </motion.li>
              <motion.li 
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/30 transition-colors">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <a href={`mailto:${contactInfo.email}`} className="text-gray-400 hover:text-white transition-colors">
                  {contactInfo.email}
                </a>
              </motion.li>
              <motion.li 
                className="flex items-center gap-3 group"
                whileHover={{ x: 5 }}
              >
                <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/30 transition-colors">
                  <Clock className="w-5 h-5 text-secondary" />
                </div>
                <span className="text-gray-400 group-hover:text-gray-300 transition-colors">
                  {contactInfo.hours}
                </span>
              </motion.li>
            </ul>
          </motion.div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <motion.p 
              className="text-gray-500 text-sm text-center md:text-left flex flex-wrap items-center justify-center md:justify-start gap-1"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              © {new Date().getFullYear()} Papaye Group. All rights reserved.
              <span className="mx-2 text-gray-600">|</span>
              <span className="flex items-center gap-1">
                Design by{" "}
                <a 
                  href="https://www.mcaforo.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-secondary hover:text-white transition-colors font-medium inline-flex items-center gap-1 group"
                >
                  McAforo
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Heart className="w-3 h-3 text-primary fill-primary" />
                  </motion.span>
                </a>
              </span>
            </motion.p>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <span className="text-gray-700">•</span>
              <Link href="/terms" className="text-gray-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: showScrollTop ? 1 : 0, 
          scale: showScrollTop ? 1 : 0,
          y: showScrollTop ? 0 : 20
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-primary to-red-600 text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-50 hover:shadow-xl hover:shadow-primary/40 transition-shadow"
        aria-label="Scroll to top"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </footer>
  );
}
