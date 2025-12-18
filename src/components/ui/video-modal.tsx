"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play } from "lucide-react";
import { Button } from "./button";

interface VideoModalProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  buttonVariant?: "default" | "outline" | "secondary" | "white";
  buttonSize?: "default" | "sm" | "lg" | "xl";
  buttonClassName?: string;
}

export function VideoModal({
  videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ", // Default placeholder
  thumbnailUrl,
  buttonVariant = "outline",
  buttonSize = "xl",
  buttonClassName = "",
}: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        className={buttonClassName}
        onClick={() => setIsOpen(true)}
      >
        <Play className="mr-2 w-5 h-5" />
        Watch Video
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>

              {/* Video iframe */}
              <iframe
                src={`${videoUrl}?autoplay=1`}
                title="Video"
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
