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
  Clock
} from "lucide-react";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";

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
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-dark text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12"
        >
          {/* Brand Column */}
          <motion.div variants={staggerItem}>
            <div className="flex items-center gap-2 mb-6">
              <img 
                src="/images/logo-white.png" 
                alt="Papaye Logo" 
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-gray-400 mb-6">
              Ghana&apos;s Total Food Care Company. Pioneer of fast food restaurants 
              in Accra since 1991. Quality food, fast service, great taste.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={staggerItem}>
            <h3 className="font-heading font-bold text-lg mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Menu Links */}
          <motion.div variants={staggerItem}>
            <h3 className="font-heading font-bold text-lg mb-6">Our Menu</h3>
            <ul className="space-y-3">
              {menuLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div variants={staggerItem}>
            <h3 className="font-heading font-bold text-lg mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Head Office: Plot 53A, Spintex Road<br />Opp. Stanbic Bank, Accra
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="tel:+233302810990" className="text-gray-400 hover:text-secondary transition-colors">
                  +233 302 810 990
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <a href="mailto:info@papayegroup.com" className="text-gray-400 hover:text-secondary transition-colors">
                  info@papayegroup.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-gray-400">
                  7:00 AM - 11:00 PM
                </span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} Papaye Group. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-secondary transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
