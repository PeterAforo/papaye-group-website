"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
  light?: boolean;
}

export function SectionHeader({
  title,
  subtitle,
  centered = true,
  className,
  light = false,
}: SectionHeaderProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className={cn(
        "mb-12",
        centered && "text-center",
        className
      )}
    >
      <h2
        className={cn(
          "text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-4",
          light ? "text-white" : "text-dark"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-lg md:text-xl max-w-2xl",
            centered && "mx-auto",
            light ? "text-white/80" : "text-gray-600"
          )}
        >
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "w-24 h-1 mt-6 rounded-full",
          centered && "mx-auto",
          light ? "bg-secondary" : "bg-primary"
        )}
      />
    </motion.div>
  );
}
