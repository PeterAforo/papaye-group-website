"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/animations";
import { Phone, ArrowRight } from "lucide-react";
import deliveryAnimation from "../../../public/lottie/delivery-bike.json";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="py-20 bg-gradient-to-r from-secondary via-secondary-500 to-secondary-400 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.3' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Delivery Animation */}
      <div className="absolute bottom-0 left-0 w-48 h-32 opacity-30">
        <Lottie animationData={deliveryAnimation} loop={true} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float">🍗</div>
      <div className="absolute bottom-10 right-10 text-6xl opacity-20 animate-float" style={{ animationDelay: "1s" }}>🍔</div>
      <div className="absolute top-1/2 right-1/4 text-4xl opacity-20 animate-float" style={{ animationDelay: "0.5s" }}>🍟</div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-dark mb-6">
            Hungry? Order Now & Get
            <span className="text-primary block">Free Delivery!</span>
          </h2>
          
          <p className="text-lg md:text-xl text-dark/80 mb-8">
            Use code <span className="font-bold bg-dark text-secondary px-2 py-1 rounded">PAPAYE2024</span> for 
            free delivery on your first order. Limited time offer!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" className="group">
              Order Online
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="xl" className="border-dark text-dark hover:bg-dark hover:text-secondary">
              <Phone className="mr-2 w-5 h-5" />
              Call to Order
            </Button>
          </div>

          <p className="mt-6 text-dark/60 text-sm">
            *Free delivery available within 5km radius. Minimum order GH₵ 50.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
