"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, User, LogOut, Settings, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartButton } from "@/components/cart/cart-button";
import { cn } from "@/lib/utils";
import { useLogo } from "@/hooks/use-logo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/branches", label: "Branches" },
  { href: "/contact", label: "Contact" },
];

// Pages that don't have a dark hero section - navbar should always be in "scrolled" (light) mode
const lightNavbarPages = ["/account", "/checkout", "/auth"];

export function HeaderNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Force light navbar on certain pages
  const forceLightNavbar = lightNavbarPages.some(page => pathname?.startsWith(page));
  const showLightNavbar = isScrolled || forceLightNavbar;
  
  const { logoPath, isLoading } = useLogo(showLightNavbar ? 'light' : 'dark');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        showLightNavbar
          ? "bg-white shadow-lg py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="h-16 w-auto"
            >
              {!isLoading && logoPath ? (
                <img
                  src={logoPath}
                  alt="Papaye Logo"
                  className="h-full w-auto object-contain"
                />
              ) : (
                <span className={cn(
                  "font-heading font-bold text-2xl",
                  showLightNavbar ? "text-primary" : "text-white"
                )}>
                  Papaye
                </span>
              )}
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className={cn(
                    "font-medium transition-colors hover:text-primary relative group",
                    showLightNavbar ? "text-dark" : "text-white"
                  )}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* CTA & User Section */}
          <div className="hidden lg:flex items-center gap-4">
            <a
              href="tel:+233302810990"
              className={cn(
                "flex items-center gap-2 font-medium transition-colors",
                showLightNavbar ? "text-dark" : "text-white"
              )}
            >
              <Phone className="w-4 h-4" />
              <span>+233 302 810 990</span>
            </a>

            {/* Cart Button */}
            <div className={cn(showLightNavbar ? "text-dark" : "text-white")}>
              <CartButton />
            </div>

            {/* User Menu */}
            {status === "loading" ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            ) : session ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    "flex items-center gap-2 font-medium transition-colors",
                    showLightNavbar ? "text-dark" : "text-white"
                  )}
                >
                  <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border py-2 z-50"
                    >
                      <div className="px-4 py-2 border-b">
                        <p className="font-medium text-gray-900">{session.user?.name}</p>
                        <p className="text-sm text-gray-500">{session.user?.email}</p>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        My Account
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <ShoppingBag className="w-4 h-4" />
                        My Orders
                      </Link>
                      {(session.user as any)?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      {((session.user as any)?.role === "BRANCH_MANAGER" || (session.user as any)?.role === "STAFF") && (
                        <Link
                          href="/admin/branch-dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Branch Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => signOut()}
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 w-full"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button variant={showLightNavbar ? "default" : "white"} size="lg">
                  Sign In
                </Button>
              </Link>
            )}

            <Link href="/menu">
              <Button variant={showLightNavbar ? "default" : "secondary"} size="lg">
                Order Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className={cn("w-6 h-6", showLightNavbar ? "text-dark" : "text-white")} />
            ) : (
              <Menu className={cn("w-6 h-6", showLightNavbar ? "text-dark" : "text-white")} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t"
          >
            <nav className="container mx-auto px-4 py-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="block py-3 text-dark font-medium hover:text-primary transition-colors border-b border-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-4 space-y-3">
                <a
                  href="tel:+233302810990"
                  className="flex items-center gap-2 text-dark font-medium"
                >
                  <Phone className="w-4 h-4" />
                  <span>+233 302 810 990</span>
                </a>
                <Button className="w-full" size="lg">
                  Order Now
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
