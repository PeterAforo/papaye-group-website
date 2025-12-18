"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FoodImageProps {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
}

// Fallback placeholder component
function ImagePlaceholder({ category, className }: { category: string; className?: string }) {
  const categoryEmojis: Record<string, string> = {
    chicken: "🍗",
    grill: "🔥",
    rice: "🍚",
    burgers: "🍔",
    sides: "🍟",
    juices: "🥤",
    default: "🍽️",
  };

  const emoji = categoryEmojis[category] || categoryEmojis.default;

  return (
    <div className={cn(
      "flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10",
      className
    )}>
      <span className="text-6xl">{emoji}</span>
    </div>
  );
}

export function FoodImage({ 
  src, 
  alt, 
  className, 
  fill = false,
  width,
  height,
  priority = false 
}: FoodImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Extract category from alt text for fallback
  const category = alt.toLowerCase().includes("chicken") ? "chicken" :
                   alt.toLowerCase().includes("grill") || alt.toLowerCase().includes("tilapia") ? "grill" :
                   alt.toLowerCase().includes("rice") || alt.toLowerCase().includes("jollof") || alt.toLowerCase().includes("waakye") ? "rice" :
                   alt.toLowerCase().includes("burger") ? "burgers" :
                   alt.toLowerCase().includes("fries") || alt.toLowerCase().includes("coleslaw") || alt.toLowerCase().includes("plantain") ? "sides" :
                   alt.toLowerCase().includes("juice") || alt.toLowerCase().includes("smoothie") || alt.toLowerCase().includes("sobolo") ? "juices" :
                   "default";

  if (error) {
    return <ImagePlaceholder category={category} className={className} />;
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {fill ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={cn("object-cover", loading ? "opacity-0" : "opacity-100 transition-opacity duration-300")}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={width || 400}
          height={height || 300}
          className={cn("object-cover", loading ? "opacity-0" : "opacity-100 transition-opacity duration-300")}
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
          priority={priority}
        />
      )}
    </div>
  );
}
