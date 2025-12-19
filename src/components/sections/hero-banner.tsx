"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { Button } from "@/components/ui/button";
import { VideoModal } from "@/components/ui/video-modal";
import { fadeInUp, fadeInLeft, fadeInRight, floatAnimation } from "@/lib/animations";
import { ArrowRight } from "lucide-react";

const heroProducts = [
  {
    id: 1,
    name: "Crispy Chicken",
    subtitle: "Our Signature Dish",
    image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=500&h=500&fit=crop",
    price: 45,
    rating: 4.9,
    reviews: "2000+",
  },
  {
    id: 2,
    name: "Jollof Rice",
    subtitle: "Ghana's Famous Dish",
    image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=500&h=500&fit=crop",
    price: 30,
    rating: 4.8,
    reviews: "1500+",
  },
  {
    id: 3,
    name: "Grilled Tilapia",
    subtitle: "Fresh & Delicious",
    image: "https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?w=500&h=500&fit=crop",
    price: 65,
    rating: 4.7,
    reviews: "800+",
  },
  {
    id: 4,
    name: "Classic Burger",
    subtitle: "Juicy & Tasty",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=500&fit=crop",
    price: 40,
    rating: 4.8,
    reviews: "1200+",
  },
  {
    id: 5,
    name: "Sobolo",
    subtitle: "Traditional Refreshment",
    image: "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=500&h=500&fit=crop",
    price: 12,
    rating: 4.9,
    reviews: "900+",
  },
];

export function HeroBanner() {
  const heroRef = useRef<HTMLDivElement>(null);
  const foodRef = useRef<HTMLDivElement>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentProductIndex((prev) => (prev + 1) % heroProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const currentProduct = heroProducts[currentProductIndex];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating food animation
      gsap.to(".floating-food", {
        y: "random(-15, 15)",
        x: "random(-10, 10)",
        rotation: "random(-5, 5)",
        duration: "random(2, 4)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          each: 0.5,
          from: "random"
        }
      });

      // Parallax effect on scroll
      gsap.to(".hero-bg", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-700"
    >
      {/* Background Pattern */}
      <div className="hero-bg absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Food Elements with Real Images */}
      <div ref={foodRef} className="absolute inset-0 pointer-events-none">
        {/* Top Left - Chicken Drumstick */}
        <div className="floating-food absolute top-16 left-8 w-28 h-28">
          <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=150&h=150&fit=crop"
              alt="Fried Chicken"
              width={100}
              height={100}
              className="object-cover rounded-full"
            />
          </div>
        </div>
        
        {/* Top Right - Burger Icon */}
        <div className="floating-food absolute top-32 right-16 w-16 h-16">
          <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop"
              alt="Burger"
              width={50}
              height={50}
              className="object-cover rounded-full"
            />
          </div>
        </div>
        
        {/* Bottom Left - Drink */}
        <div className="floating-food absolute bottom-32 left-12 w-14 h-14">
          <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1544145945-f90425340c7e?w=80&h=80&fit=crop"
              alt="Juice"
              width={45}
              height={45}
              className="object-cover rounded-full"
            />
          </div>
        </div>
        
        {/* Bottom Right - Fries */}
        <div className="floating-food absolute bottom-24 right-12 w-16 h-16">
          <div className="w-full h-full bg-secondary rounded-full flex items-center justify-center shadow-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=80&h=80&fit=crop"
              alt="Fries"
              width={50}
              height={50}
              className="object-cover rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInLeft}
            className="text-white text-center lg:text-left"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-block bg-secondary text-dark px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              🔥 Ghana&apos;s #1 Fast Food Chain
            </motion.span>
            
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading mb-6 leading-tight"
            >
              Taste The
              <span className="text-secondary block">Authentic</span>
              Ghanaian Flavor
            </motion.h1>
            
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto lg:mx-0"
            >
              From crispy fried chicken to the famous Jollof rice, experience 
              the best of Ghanaian cuisine with a modern twist.
            </motion.p>
            
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button variant="secondary" size="xl" className="group">
                Order Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <VideoModal
                videoUrl="https://www.youtube.com/embed/kBO9T7gwk4g"
                buttonVariant="outline"
                buttonSize="xl"
                buttonClassName="border-white text-white hover:bg-white hover:text-primary"
              />
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeInUp}
              className="grid grid-cols-3 gap-8 mt-12 pt-8 border-t border-white/20"
            >
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary">33+</div>
                <div className="text-white/70 text-sm">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary">600+</div>
                <div className="text-white/70 text-sm">Staff Members</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-secondary">10+</div>
                <div className="text-white/70 text-sm">Locations</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Image - Circular Food Display */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInRight}
            className="relative"
          >
            <motion.div
              animate="animate"
              variants={floatAnimation}
              className="relative z-10"
            >
              <div className="relative w-full aspect-square max-w-2xl mx-auto">
                {/* Outer glow ring */}
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-transparent rounded-full animate-pulse" />
                
                {/* Main circular container with full image */}
                <div className="absolute inset-8 bg-white rounded-full shadow-2xl overflow-hidden">
                  {/* Animated product images */}
                  {heroProducts.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{
                        opacity: index === currentProductIndex ? 1 : 0,
                        scale: index === currentProductIndex ? 1 : 1.1,
                      }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    </motion.div>
                  ))}
                  
                  {/* Text overlay at bottom */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent pt-16 pb-6 px-4 text-center z-10">
                    <motion.div
                      key={currentProduct.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="text-white font-bold text-xl font-heading drop-shadow-lg">{currentProduct.name}</h3>
                      <p className="text-white/90 text-sm">{currentProduct.subtitle}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <span className="text-yellow-400 text-sm">★★★★★</span>
                        <span className="font-bold text-sm text-white">{currentProduct.rating}</span>
                      </div>
                      <p className="text-white/70 text-xs">{currentProduct.reviews} Reviews</p>
                    </motion.div>
                  </div>
                </div>

                {/* Floating price tag */}
                <motion.div
                  key={currentProduct.price}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="absolute right-0 top-1/4 bg-secondary text-dark px-4 py-2 rounded-xl shadow-lg z-20"
                >
                  <div className="text-xs font-medium">Starting from</div>
                  <div className="text-xl font-bold">GH₵ {currentProduct.price}</div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-3 bg-white rounded-full mt-2"
          />
        </div>
      </motion.div>
    </section>
  );
}
