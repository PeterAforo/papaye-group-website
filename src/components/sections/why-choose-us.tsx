"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "framer-motion";
import { SectionHeader } from "@/components/ui/section-header";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { 
  ChefHat, 
  Clock, 
  Leaf, 
  Award, 
  Truck, 
  Heart 
} from "lucide-react";
import cookingAnimation from "../../../public/lottie/cooking.json";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const features = [
  {
    icon: ChefHat,
    title: "Expert Chefs",
    description: "Our skilled chefs bring decades of culinary experience to every dish.",
    color: "bg-primary",
  },
  {
    icon: Leaf,
    title: "Fresh Ingredients",
    description: "We source only the freshest local ingredients for authentic taste.",
    color: "bg-green-500",
  },
  {
    icon: Clock,
    title: "Fast Service",
    description: "Quick preparation without compromising on quality or taste.",
    color: "bg-secondary",
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Consistent quality that has made us Ghana's favorite since 1990.",
    color: "bg-purple-500",
  },
  {
    icon: Truck,
    title: "Quick Delivery",
    description: "Hot and fresh food delivered right to your doorstep.",
    color: "bg-blue-500",
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Every meal is prepared with care and passion for great food.",
    color: "bg-pink-500",
  },
];

export function WhyChooseUs() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 bg-white relative overflow-hidden">
      {/* Cooking Animation - decorative */}
      <div className="absolute -right-20 top-20 w-64 h-64 opacity-10 hidden lg:block">
        <Lottie animationData={cookingAnimation} loop={true} />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <SectionHeader
          title="Why Choose Papaye?"
          subtitle="Experience the difference that has made us Ghana's most loved fast food chain"
        />

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="group"
            >
              <div className="relative p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 h-full border border-transparent hover:border-gray-100">
                {/* Icon */}
                <div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-heading font-bold text-xl mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>

                {/* Decorative number */}
                <div className="absolute top-4 right-4 text-6xl font-bold text-gray-100 group-hover:text-primary/10 transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
